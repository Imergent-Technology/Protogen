<?php

namespace App\Services\Graph;

use App\Models\CoreGraphNode;
use App\Models\CoreGraphEdge;
use Illuminate\Support\Collection;

/**
 * Memory Executor
 * 
 * Executes graph traversal queries in-memory using PHP algorithms.
 * Optimized for deep traversals, complex algorithms, and large subgraphs.
 * Supports BFS, DFS, and Dijkstra's shortest path.
 */
class MemoryExecutor
{
    protected array $nodeCache = [];
    protected array $edgeCache = [];
    protected array $adjacencyList = [];
    
    /**
     * Execute query using in-memory algorithms
     * 
     * @param array $plan
     * @return Collection
     */
    public function execute(array $plan): Collection
    {
        $startNodeIds = $this->resolveStartNodeIds($plan['start_nodes']);
        
        if (empty($startNodeIds)) {
            return collect([]);
        }
        
        // Load subgraph into memory
        $this->loadSubgraph($startNodeIds, $plan['depth']['max'] ?? 5);
        
        // Execute traversal
        $resultIds = $this->traverse($startNodeIds, $plan);
        
        // Apply filters
        $resultIds = $this->applyFilters($resultIds, $plan['filters']);
        
        // Apply uniqueness
        if ($plan['unique']) {
            $resultIds = array_unique($resultIds);
        }
        
        // Apply limit
        if ($plan['limit']) {
            $resultIds = array_slice($resultIds, 0, $plan['limit']);
        }
        
        // Return node models
        return CoreGraphNode::whereIn('id', $resultIds)
            ->with(['nodeType'])
            ->get();
    }
    
    /**
     * Load subgraph into memory
     * 
     * @param array $startNodeIds
     * @param int $maxDepth
     */
    protected function loadSubgraph(array $startNodeIds, int $maxDepth): void
    {
        // Load nodes
        $nodesToLoad = $startNodeIds;
        $loaded = [];
        $depth = 0;
        
        while (!empty($nodesToLoad) && $depth < $maxDepth) {
            // Load current batch of nodes
            $nodes = CoreGraphNode::whereIn('id', $nodesToLoad)
                ->where('is_active', true)
                ->get();
            
            foreach ($nodes as $node) {
                $this->nodeCache[$node->id] = $node;
                $loaded[] = $node->id;
            }
            
            // Load edges for these nodes
            $edges = CoreGraphEdge::where('is_active', true)
                ->where(function($query) use ($nodesToLoad) {
                    $query->whereIn('source_node_id', $nodesToLoad)
                          ->orWhereIn('target_node_id', $nodesToLoad);
                })
                ->get();
            
            // Build adjacency list and find next nodes to load
            $nextNodes = [];
            foreach ($edges as $edge) {
                $this->edgeCache[$edge->id] = $edge;
                
                if (!isset($this->adjacencyList[$edge->source_node_id])) {
                    $this->adjacencyList[$edge->source_node_id] = [];
                }
                $this->adjacencyList[$edge->source_node_id][] = [
                    'target' => $edge->target_node_id,
                    'edge_id' => $edge->id,
                    'edge_type_id' => $edge->edge_type_id,
                ];
                
                // Track reverse edges for 'in' traversal
                if (!isset($this->adjacencyList["_rev_{$edge->target_node_id}"])) {
                    $this->adjacencyList["_rev_{$edge->target_node_id}"] = [];
                }
                $this->adjacencyList["_rev_{$edge->target_node_id}"][] = [
                    'target' => $edge->source_node_id,
                    'edge_id' => $edge->id,
                    'edge_type_id' => $edge->edge_type_id,
                ];
                
                // Add to next load batch
                if (!in_array($edge->target_node_id, $loaded) && !in_array($edge->target_node_id, $nextNodes)) {
                    $nextNodes[] = $edge->target_node_id;
                }
                if (!in_array($edge->source_node_id, $loaded) && !in_array($edge->source_node_id, $nextNodes)) {
                    $nextNodes[] = $edge->source_node_id;
                }
            }
            
            $nodesToLoad = $nextNodes;
            $depth++;
        }
    }
    
    /**
     * Traverse graph using BFS
     * 
     * @param array $startNodeIds
     * @param array $plan
     * @return array Node IDs
     */
    protected function traverse(array $startNodeIds, array $plan): array
    {
        $minDepth = $plan['depth']['min'];
        $maxDepth = $plan['depth']['max'] ?? PHP_INT_MAX;
        $steps = $plan['steps'];
        
        // BFS traversal
        $queue = [];
        foreach ($startNodeIds as $nodeId) {
            $queue[] = ['id' => $nodeId, 'depth' => 0, 'path' => [$nodeId]];
        }
        
        $visited = [];
        $results = [];
        
        while (!empty($queue)) {
            $current = array_shift($queue);
            $nodeId = $current['id'];
            $depth = $current['depth'];
            $path = $current['path'];
            
            // Skip if already visited (for uniqueness)
            if (isset($visited[$nodeId]) && $plan['unique']) {
                continue;
            }
            $visited[$nodeId] = true;
            
            // Add to results if within depth range
            if ($depth >= $minDepth && $depth <= $maxDepth) {
                $results[] = $nodeId;
            }
            
            // Continue traversal if not at max depth
            if ($depth < $maxDepth) {
                $neighbors = $this->getNeighbors($nodeId, $steps);
                
                foreach ($neighbors as $neighborId) {
                    // Prevent cycles
                    if (!in_array($neighborId, $path)) {
                        $queue[] = [
                            'id' => $neighborId,
                            'depth' => $depth + 1,
                            'path' => array_merge($path, [$neighborId])
                        ];
                    }
                }
            }
        }
        
        return $results;
    }
    
    /**
     * Get neighbor nodes based on steps
     * 
     * @param int $nodeId
     * @param array $steps
     * @return array
     */
    protected function getNeighbors(int $nodeId, array $steps): array
    {
        if (empty($steps)) {
            // Default: outgoing edges
            return $this->getOutgoingNeighbors($nodeId);
        }
        
        $step = $steps[0]; // Handle first step
        
        switch ($step['type']) {
            case 'out':
                return $this->getOutgoingNeighbors($nodeId, $step['edge_types'] ?? null);
            case 'in':
                return $this->getIncomingNeighbors($nodeId, $step['edge_types'] ?? null);
            case 'both':
                return array_merge(
                    $this->getOutgoingNeighbors($nodeId, $step['edge_types'] ?? null),
                    $this->getIncomingNeighbors($nodeId, $step['edge_types'] ?? null)
                );
            default:
                return $this->getOutgoingNeighbors($nodeId);
        }
    }
    
    /**
     * Get outgoing neighbors
     */
    protected function getOutgoingNeighbors(int $nodeId, ?array $edgeTypes = null): array
    {
        if (!isset($this->adjacencyList[$nodeId])) {
            return [];
        }
        
        $neighbors = [];
        foreach ($this->adjacencyList[$nodeId] as $edge) {
            // Filter by edge type if specified
            if ($edgeTypes !== null) {
                $edgeModel = $this->edgeCache[$edge['edge_id']] ?? null;
                if ($edgeModel && !in_array($edgeModel->edgeType->name ?? null, $edgeTypes)) {
                    continue;
                }
            }
            
            $neighbors[] = $edge['target'];
        }
        
        return $neighbors;
    }
    
    /**
     * Get incoming neighbors
     */
    protected function getIncomingNeighbors(int $nodeId, ?array $edgeTypes = null): array
    {
        $key = "_rev_{$nodeId}";
        if (!isset($this->adjacencyList[$key])) {
            return [];
        }
        
        $neighbors = [];
        foreach ($this->adjacencyList[$key] as $edge) {
            // Filter by edge type if specified
            if ($edgeTypes !== null) {
                $edgeModel = $this->edgeCache[$edge['edge_id']] ?? null;
                if ($edgeModel && !in_array($edgeModel->edgeType->name ?? null, $edgeTypes)) {
                    continue;
                }
            }
            
            $neighbors[] = $edge['target'];
        }
        
        return $neighbors;
    }
    
    /**
     * Apply filters to result node IDs
     * 
     * @param array $nodeIds
     * @param array $filters
     * @return array
     */
    protected function applyFilters(array $nodeIds, array $filters): array
    {
        if (empty($filters)) {
            return $nodeIds;
        }
        
        $filtered = [];
        
        foreach ($nodeIds as $nodeId) {
            $node = $this->nodeCache[$nodeId] ?? null;
            if (!$node) {
                continue;
            }
            
            $passes = true;
            foreach ($filters as $filter) {
                if (!$this->nodePassesFilter($node, $filter)) {
                    $passes = false;
                    break;
                }
            }
            
            if ($passes) {
                $filtered[] = $nodeId;
            }
        }
        
        return $filtered;
    }
    
    /**
     * Check if node passes filter
     */
    protected function nodePassesFilter($node, array $filter): bool
    {
        switch ($filter['type']) {
            case 'node_type':
                $nodeTypeName = $node->nodeType->name ?? null;
                return in_array($nodeTypeName, $filter['values']);
                
            case 'property':
                $value = $node->properties[$filter['property']] ?? null;
                return $this->compareValues($value, $filter['value'], $filter['operator']);
                
            case 'label':
                return stripos($node->label, $filter['pattern']) !== false;
                
            default:
                return true;
        }
    }
    
    /**
     * Compare values with operator
     */
    protected function compareValues($a, $b, string $operator): bool
    {
        switch ($operator) {
            case '=':
            case '==':
                return $a == $b;
            case '!=':
                return $a != $b;
            case '>':
                return $a > $b;
            case '>=':
                return $a >= $b;
            case '<':
                return $a < $b;
            case '<=':
                return $a <= $b;
            default:
                return false;
        }
    }
    
    /**
     * Resolve start node IDs
     */
    protected function resolveStartNodeIds(array $startNodes): array
    {
        if (empty($startNodes)) {
            return [];
        }
        
        $first = $startNodes[0];
        if (is_string($first) && strlen($first) === 36) {
            return CoreGraphNode::whereIn('guid', $startNodes)->pluck('id')->toArray();
        }
        
        return $startNodes;
    }
}

