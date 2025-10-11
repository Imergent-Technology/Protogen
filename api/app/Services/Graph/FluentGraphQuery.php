<?php

namespace App\Services\Graph;

use Illuminate\Support\Collection;

/**
 * Fluent Graph Query Builder
 * 
 * Provides a Gremlin-style fluent interface for graph traversal operations.
 * Supports both SQL (recursive CTE) and in-memory execution strategies.
 * 
 * @example
 * $results = GraphQuery::start($nodeIds)
 *     ->out('relationship_type')
 *     ->hasType('node_type')
 *     ->depth(1, 3)
 *     ->unique()
 *     ->limit(100)
 *     ->execute();
 */
class FluentGraphQuery
{
    protected array $startNodes = [];
    protected array $steps = [];
    protected ?int $minDepth = null;
    protected ?int $maxDepth = null;
    protected ?int $limitValue = null;
    protected bool $uniqueNodes = false;
    protected ?string $executionStrategy = null; // 'sql', 'memory', or null for auto
    protected array $filters = [];
    
    /**
     * Start a new graph query from one or more nodes
     */
    public static function start($nodeIds): self
    {
        $query = new self();
        $query->startNodes = is_array($nodeIds) ? $nodeIds : [$nodeIds];
        return $query;
    }
    
    /**
     * Traverse outgoing edges
     * 
     * @param string|array|null $edgeTypes Optional edge type filter
     * @return $this
     */
    public function out($edgeTypes = null): self
    {
        $this->steps[] = [
            'type' => 'out',
            'edge_types' => $this->normalizeTypes($edgeTypes),
        ];
        return $this;
    }
    
    /**
     * Traverse incoming edges
     * 
     * @param string|array|null $edgeTypes Optional edge type filter
     * @return $this
     */
    public function in($edgeTypes = null): self
    {
        $this->steps[] = [
            'type' => 'in',
            'edge_types' => $this->normalizeTypes($edgeTypes),
        ];
        return $this;
    }
    
    /**
     * Traverse both incoming and outgoing edges
     * 
     * @param string|array|null $edgeTypes Optional edge type filter
     * @return $this
     */
    public function both($edgeTypes = null): self
    {
        $this->steps[] = [
            'type' => 'both',
            'edge_types' => $this->normalizeTypes($edgeTypes),
        ];
        return $this;
    }
    
    /**
     * Filter nodes by type
     * 
     * @param string|array $nodeTypes
     * @return $this
     */
    public function hasType($nodeTypes): self
    {
        $this->filters[] = [
            'type' => 'node_type',
            'values' => $this->normalizeTypes($nodeTypes),
        ];
        return $this;
    }
    
    /**
     * Filter nodes by property value
     * 
     * @param string $property
     * @param mixed $value
     * @param string $operator
     * @return $this
     */
    public function has(string $property, $value, string $operator = '='): self
    {
        $this->filters[] = [
            'type' => 'property',
            'property' => $property,
            'value' => $value,
            'operator' => $operator,
        ];
        return $this;
    }
    
    /**
     * Filter nodes by label pattern
     * 
     * @param string $pattern
     * @return $this
     */
    public function hasLabel(string $pattern): self
    {
        $this->filters[] = [
            'type' => 'label',
            'pattern' => $pattern,
        ];
        return $this;
    }
    
    /**
     * Set traversal depth range
     * 
     * @param int $min Minimum depth (inclusive)
     * @param int|null $max Maximum depth (inclusive), null for no limit
     * @return $this
     */
    public function depth(int $min, ?int $max = null): self
    {
        $this->minDepth = $min;
        $this->maxDepth = $max;
        return $this;
    }
    
    /**
     * Ensure unique nodes in results (no duplicates)
     * 
     * @return $this
     */
    public function unique(): self
    {
        $this->uniqueNodes = true;
        return $this;
    }
    
    /**
     * Limit number of results
     * 
     * @param int $limit
     * @return $this
     */
    public function limit(int $limit): self
    {
        $this->limitValue = $limit;
        return $this;
    }
    
    /**
     * Force specific execution strategy
     * 
     * @param string $strategy 'sql' or 'memory'
     * @return $this
     */
    public function useStrategy(string $strategy): self
    {
        $this->executionStrategy = $strategy;
        return $this;
    }
    
    /**
     * Execute the query and return results
     * 
     * @return Collection
     */
    public function execute(): Collection
    {
        $builder = app(QueryBuilder::class);
        $plan = $builder->build($this);
        
        $traversal = app(GraphTraversalService::class);
        return $traversal->execute($plan);
    }
    
    /**
     * Execute query and return node IDs only
     * 
     * @return array
     */
    public function executeIds(): array
    {
        return $this->execute()->pluck('id')->toArray();
    }
    
    /**
     * Execute query and return node GUIDs only
     * 
     * @return array
     */
    public function executeGuids(): array
    {
        return $this->execute()->pluck('guid')->toArray();
    }
    
    /**
     * Get query plan without executing
     * 
     * @return array
     */
    public function explain(): array
    {
        $builder = app(QueryBuilder::class);
        $plan = $builder->build($this);
        
        return [
            'strategy' => $plan['strategy'],
            'estimated_nodes' => $plan['estimated_nodes'] ?? null,
            'steps' => count($this->steps),
            'filters' => count($this->filters),
            'depth' => [
                'min' => $this->minDepth,
                'max' => $this->maxDepth,
            ],
            'reasoning' => $plan['reasoning'] ?? null,
        ];
    }
    
    // Getters for QueryBuilder
    
    public function getStartNodes(): array
    {
        return $this->startNodes;
    }
    
    public function getSteps(): array
    {
        return $this->steps;
    }
    
    public function getFilters(): array
    {
        return $this->filters;
    }
    
    public function getMinDepth(): ?int
    {
        return $this->minDepth;
    }
    
    public function getMaxDepth(): ?int
    {
        return $this->maxDepth;
    }
    
    public function getLimit(): ?int
    {
        return $this->limitValue;
    }
    
    public function isUnique(): bool
    {
        return $this->uniqueNodes;
    }
    
    public function getExecutionStrategy(): ?string
    {
        return $this->executionStrategy;
    }
    
    /**
     * Normalize type values to array
     */
    protected function normalizeTypes($types): ?array
    {
        if ($types === null) {
            return null;
        }
        return is_array($types) ? $types : [$types];
    }
}

