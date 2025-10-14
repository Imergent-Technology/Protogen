<?php

namespace App\Services\Graph;

use App\Models\CoreGraphNode;
use App\Models\CoreGraphEdge;

/**
 * Query Builder
 * 
 * Analyzes FluentGraphQuery and builds execution plan.
 * Chooses between SQL (recursive CTE) and in-memory execution
 * based on query complexity and estimated result size.
 */
class QueryBuilder
{
    /**
     * Build execution plan from fluent query
     * 
     * @param FluentGraphQuery $query
     * @return array Execution plan
     */
    public function build(FluentGraphQuery $query): array
    {
        // If strategy explicitly specified, use it
        if ($query->getExecutionStrategy() !== null) {
            return $this->buildPlan($query, $query->getExecutionStrategy(), 'explicit');
        }
        
        // Auto-select strategy based on heuristics
        $strategy = $this->selectStrategy($query);
        return $this->buildPlan($query, $strategy, 'auto');
    }
    
    /**
     * Select execution strategy using heuristics
     * 
     * Heuristic: Use SQL for:
     * - Shallow queries (depth <= 4)
     * - Estimated result size < 1000 nodes
     * - Strong filtering present
     * 
     * Use in-memory for:
     * - Deep queries (depth > 4)
     * - Large result sets
     * - Complex algorithms (shortest path, etc.)
     * 
     * @param FluentGraphQuery $query
     * @return string 'sql' or 'memory'
     */
    protected function selectStrategy(FluentGraphQuery $query): string
    {
        $estimatedNodes = $this->estimateResultSize($query);
        $maxDepth = $query->getMaxDepth() ?? PHP_INT_MAX;
        $hasComplexFilters = $this->hasComplexFilters($query);
        
        // Use SQL if conditions are favorable
        if ($maxDepth <= 4 && $estimatedNodes < 1000) {
            return 'sql';
        }
        
        // Use SQL if strong filtering is present (reduces result set)
        if ($hasComplexFilters && $estimatedNodes < 2000) {
            return 'sql';
        }
        
        // Otherwise use in-memory for better algorithm support
        return 'memory';
    }
    
    /**
     * Build execution plan
     * 
     * @param FluentGraphQuery $query
     * @param string $strategy
     * @param string $selectionReason
     * @return array
     */
    protected function buildPlan(FluentGraphQuery $query, string $strategy, string $selectionReason): array
    {
        return [
            'strategy' => $strategy,
            'selection_reason' => $selectionReason,
            'start_nodes' => $query->getStartNodes(),
            'steps' => $query->getSteps(),
            'filters' => $query->getFilters(),
            'depth' => [
                'min' => $query->getMinDepth() ?? 1,
                'max' => $query->getMaxDepth(),
            ],
            'limit' => $query->getLimit(),
            'unique' => $query->isUnique(),
            'estimated_nodes' => $this->estimateResultSize($query),
            'reasoning' => $this->explainSelection($query, $strategy),
        ];
    }
    
    /**
     * Estimate result size for query planning
     * 
     * @param FluentGraphQuery $query
     * @return int Estimated number of nodes
     */
    protected function estimateResultSize(FluentGraphQuery $query): int
    {
        $startNodeCount = count($query->getStartNodes());
        $stepCount = count($query->getSteps());
        $maxDepth = $query->getMaxDepth() ?? 3;
        $filterCount = count($query->getFilters());
        
        // Simple heuristic: exponential fan-out with filter reduction
        $avgFanOut = 5; // Assume average 5 connections per node
        $filterReduction = max(0.1, 1 / (1 + $filterCount * 0.5));
        
        $estimated = $startNodeCount * pow($avgFanOut, min($maxDepth, $stepCount));
        $estimated *= $filterReduction;
        
        // Apply limit if present
        if ($query->getLimit() !== null) {
            $estimated = min($estimated, $query->getLimit());
        }
        
        return (int) ceil($estimated);
    }
    
    /**
     * Check if query has complex filters
     * 
     * @param FluentGraphQuery $query
     * @return bool
     */
    protected function hasComplexFilters(FluentGraphQuery $query): bool
    {
        $filters = $query->getFilters();
        
        // Consider filters complex if there are multiple filters
        // or if they filter on specific types/properties
        return count($filters) >= 2 || 
               $this->hasTypeFilter($filters) ||
               $this->hasPropertyFilter($filters);
    }
    
    /**
     * Check if filters include type filtering
     */
    protected function hasTypeFilter(array $filters): bool
    {
        foreach ($filters as $filter) {
            if ($filter['type'] === 'node_type') {
                return true;
            }
        }
        return false;
    }
    
    /**
     * Check if filters include property filtering
     */
    protected function hasPropertyFilter(array $filters): bool
    {
        foreach ($filters as $filter) {
            if ($filter['type'] === 'property') {
                return true;
            }
        }
        return false;
    }
    
    /**
     * Explain strategy selection
     * 
     * @param FluentGraphQuery $query
     * @param string $strategy
     * @return string
     */
    protected function explainSelection(FluentGraphQuery $query, string $strategy): string
    {
        $estimated = $this->estimateResultSize($query);
        $maxDepth = $query->getMaxDepth() ?? 'unlimited';
        $filterCount = count($query->getFilters());
        
        if ($strategy === 'sql') {
            return "Using SQL recursive CTE: estimated {$estimated} nodes, " .
                   "max depth {$maxDepth}, {$filterCount} filters. " .
                   "SQL optimal for shallow, filtered queries.";
        } else {
            return "Using in-memory execution: estimated {$estimated} nodes, " .
                   "max depth {$maxDepth}, {$filterCount} filters. " .
                   "In-memory optimal for complex algorithms and deep traversals.";
        }
    }
}


