<?php

namespace App\Services\Graph;

use App\Models\CoreGraphNode;
use App\Models\CoreGraphEdge;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

/**
 * SQL Executor
 * 
 * Executes graph traversal queries using PostgreSQL recursive CTEs.
 * Optimized for shallow-to-mid depth queries (1-4 hops) with filtering.
 */
class SqlExecutor
{
    /**
     * Execute query using recursive CTE
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
        
        // Build and execute recursive CTE
        $sql = $this->buildRecursiveCTE($plan, $startNodeIds);
        $results = DB::select($sql);
        
        // Apply post-processing
        $collection = collect($results);
        
        if ($plan['unique']) {
            $collection = $collection->unique('id');
        }
        
        if ($plan['limit']) {
            $collection = $collection->take($plan['limit']);
        }
        
        // Load full node data
        $nodeIds = $collection->pluck('id')->toArray();
        return CoreGraphNode::whereIn('id', $nodeIds)
            ->with(['nodeType'])
            ->get();
    }
    
    /**
     * Resolve start node IDs from mixed input (IDs or GUIDs)
     * 
     * @param array $startNodes
     * @return array Node IDs
     */
    protected function resolveStartNodeIds(array $startNodes): array
    {
        if (empty($startNodes)) {
            return [];
        }
        
        // Check if first item looks like a GUID
        $first = $startNodes[0];
        if (is_string($first) && strlen($first) === 36) {
            // Assume GUIDs, resolve to IDs
            return CoreGraphNode::whereIn('guid', $startNodes)
                ->pluck('id')
                ->toArray();
        }
        
        // Assume already IDs
        return $startNodes;
    }
    
    /**
     * Build recursive CTE SQL
     * 
     * @param array $plan
     * @param array $startNodeIds
     * @return string
     */
    protected function buildRecursiveCTE(array $plan, array $startNodeIds): string
    {
        $minDepth = $plan['depth']['min'];
        $maxDepth = $plan['depth']['max'] ?? 10; // Safety limit
        
        // Start with base case
        $startIds = implode(',', $startNodeIds);
        
        // Build WHERE clauses for filters
        $filterClauses = $this->buildFilterClauses($plan['filters']);
        $filterWhere = $filterClauses ? 'AND ' . implode(' AND ', $filterClauses) : '';
        
        // Build edge traversal logic
        $traversalJoin = $this->buildTraversalJoin($plan['steps']);
        
        $sql = "
            WITH RECURSIVE graph_traversal AS (
                -- Base case: starting nodes at depth 0
                SELECT 
                    n.id,
                    n.guid,
                    n.label,
                    n.node_type_id,
                    0 as depth,
                    ARRAY[n.id] as path
                FROM nodes n
                WHERE n.id IN ({$startIds})
                    AND n.is_active = true
                    {$filterWhere}
                
                UNION ALL
                
                -- Recursive case: traverse edges
                SELECT 
                    target.id,
                    target.guid,
                    target.label,
                    target.node_type_id,
                    t.depth + 1 as depth,
                    t.path || target.id as path
                FROM graph_traversal t
                {$traversalJoin}
                WHERE t.depth < {$maxDepth}
                    AND target.is_active = true
                    AND NOT target.id = ANY(t.path) -- Prevent cycles
                    {$filterWhere}
            )
            SELECT DISTINCT id, guid, label, node_type_id, depth
            FROM graph_traversal
            WHERE depth >= {$minDepth}
            ORDER BY depth, id
        ";
        
        return $sql;
    }
    
    /**
     * Build traversal JOIN based on steps
     * 
     * @param array $steps
     * @return string
     */
    protected function buildTraversalJoin(array $steps): string
    {
        if (empty($steps)) {
            // Default: traverse any outgoing edges
            return "
                INNER JOIN edges e ON t.id = e.source_node_id AND e.is_active = true
                INNER JOIN nodes target ON e.target_node_id = target.id
            ";
        }
        
        // Build JOIN for specified step types
        $step = $steps[0]; // For now, handle first step (can be extended for multi-step)
        $edgeTypeFilter = '';
        
        if (!empty($step['edge_types'])) {
            $edgeTypes = array_map(function($type) {
                return "'" . addslashes($type) . "'";
            }, $step['edge_types']);
            $edgeTypeFilter = "AND et.name IN (" . implode(',', $edgeTypes) . ")";
        }
        
        switch ($step['type']) {
            case 'out':
                return "
                    INNER JOIN edges e ON t.id = e.source_node_id AND e.is_active = true
                    LEFT JOIN edge_types et ON e.edge_type_id = et.id
                    INNER JOIN nodes target ON e.target_node_id = target.id
                    WHERE 1=1 {$edgeTypeFilter}
                ";
                
            case 'in':
                return "
                    INNER JOIN edges e ON t.id = e.target_node_id AND e.is_active = true
                    LEFT JOIN edge_types et ON e.edge_type_id = et.id
                    INNER JOIN nodes target ON e.source_node_id = target.id
                    WHERE 1=1 {$edgeTypeFilter}
                ";
                
            case 'both':
                return "
                    INNER JOIN edges e ON (t.id = e.source_node_id OR t.id = e.target_node_id) AND e.is_active = true
                    LEFT JOIN edge_types et ON e.edge_type_id = et.id
                    INNER JOIN nodes target ON (
                        CASE 
                            WHEN t.id = e.source_node_id THEN e.target_node_id
                            ELSE e.source_node_id
                        END = target.id
                    )
                    WHERE 1=1 {$edgeTypeFilter}
                ";
                
            default:
                return "
                    INNER JOIN edges e ON t.id = e.source_node_id AND e.is_active = true
                    INNER JOIN nodes target ON e.target_node_id = target.id
                ";
        }
    }
    
    /**
     * Build WHERE clauses for filters
     * 
     * @param array $filters
     * @return array
     */
    protected function buildFilterClauses(array $filters): array
    {
        $clauses = [];
        
        foreach ($filters as $filter) {
            switch ($filter['type']) {
                case 'node_type':
                    $types = array_map(function($type) {
                        return "'" . addslashes($type) . "'";
                    }, $filter['values']);
                    $clauses[] = "n.node_type_id IN (
                        SELECT id FROM node_types WHERE name IN (" . implode(',', $types) . ")
                    )";
                    break;
                    
                case 'property':
                    $property = addslashes($filter['property']);
                    $value = is_string($filter['value']) ? "'" . addslashes($filter['value']) . "'" : $filter['value'];
                    $operator = $filter['operator'];
                    $clauses[] = "n.properties->>'{$property}' {$operator} {$value}";
                    break;
                    
                case 'label':
                    $pattern = addslashes($filter['pattern']);
                    $clauses[] = "n.label ILIKE '%{$pattern}%'";
                    break;
            }
        }
        
        return $clauses;
    }
}

