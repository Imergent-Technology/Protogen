# ADR-001: Graph System Dual Execution Strategy

**Status**: Accepted  
**Date**: 2025-10-11  
**Deciders**: Lead Architect, Development Team  
**Context**: Phase 1 - Graph System Foundation

## Context and Problem Statement

The Protogen platform requires sophisticated graph traversal capabilities to support recommendations, navigation, and analytics. We need to choose an execution strategy that:

1. Performs well for typical queries (2-3 hop traversals with filtering)
2. Supports complex algorithms (shortest path, recommendations, etc.)
3. Works within hosting constraints (shared cPanel, PostgreSQL only)
4. Scales to moderate graph sizes (10k-100k nodes)
5. Provides good developer experience with fluent query API

### Options Considered

#### Option 1: SQL-Only with Recursive CTEs
**Pros**:
- Excellent performance for shallow, filtered queries
- Leverages PostgreSQL's optimized query planner
- No memory overhead
- Simple architecture

**Cons**:
- Limited algorithm support (only traversal)
- Deep recursion expensive
- Complex queries hard to express in SQL
- Limited caching opportunities

#### Option 2: In-Memory Only
**Pros**:
- Full algorithm flexibility (BFS, DFS, Dijkstra, PageRank, etc.)
- Easier to implement complex logic
- Good caching opportunities

**Cons**:
- Memory overhead for loading subgraphs
- Slower for simple queries
- Requires loading data from DB first
- Scalability concerns for large graphs

#### Option 3: External Graph Database
**Pros**:
- Purpose-built for graph operations
- Best performance for all query types
- Rich query languages (Cypher, Gremlin)

**Cons**:
- **Requires additional infrastructure** (not available on shared hosting)
- Operational complexity
- Data synchronization overhead
- Outside hosting constraints

#### Option 4: Dual Execution with Automatic Planning ✅ **SELECTED**
**Pros**:
- Best of both worlds: SQL for simple, memory for complex
- Automatic strategy selection
- Optimal performance across query types
- Future-proof (can add graph DB later)

**Cons**:
- Two execution paths to maintain
- More complex architecture
- Testing overhead

## Decision

We will implement a **dual execution strategy** with:

1. **SQL Executor**: Uses PostgreSQL recursive CTEs for shallow-to-mid depth traversals with filtering
2. **Memory Executor**: Uses in-memory BFS/DFS algorithms for deep traversals and complex algorithms
3. **Query Builder**: Automatically selects execution strategy based on query characteristics
4. **Manual Override**: Allows explicit strategy selection when needed

### Decision Drivers

1. **Performance**: SQL excels at typical queries (2-3 hops with filtering), memory excels at complex algorithms
2. **Flexibility**: Supports both simple traversal and sophisticated algorithms
3. **Hosting Constraints**: Works within PostgreSQL-only environment
4. **Developer Experience**: Fluent API hides complexity, provides consistent interface
5. **Future-Proofing**: Can migrate to graph DB later without changing API

### Heuristics for Automatic Planning

The QueryBuilder uses these heuristics to select strategy:

```php
if (max_depth <= 4 && estimated_nodes < 1000) {
    return 'sql';  // Shallow, filtered queries
}

if (has_complex_filters && estimated_nodes < 2000) {
    return 'sql';  // Strong filtering reduces result set
}

return 'memory';  // Deep traversals, complex algorithms
```

**Manual Override Available**:
```php
->useStrategy('sql')    // Force SQL execution
->useStrategy('memory') // Force in-memory execution
```

## Consequences

### Positive

- **Optimal Performance**: Each query type uses best execution strategy
- **Algorithm Support**: Can implement any graph algorithm in-memory
- **Hosting Compatible**: No additional infrastructure required
- **Scalable**: Can add graph DB read model later without API changes
- **Developer Friendly**: Fluent API provides consistent interface

### Negative

- **Complexity**: Two execution paths require testing and maintenance
- **Code Duplication**: Some logic exists in both executors
- **Planning Overhead**: QueryBuilder adds slight latency (negligible in practice)

### Mitigation Strategies

1. **Comprehensive Testing**: Unit tests for both executors, integration tests for full flow
2. **Shared Abstractions**: Common interfaces and utilities to reduce duplication
3. **Performance Monitoring**: Log strategy selection and execution times
4. **Documentation**: Clear guidelines on when each strategy is optimal

## Implementation Details

### Architecture

```
┌──────────────────────┐
│ FluentGraphQuery API │  ← Developer-facing fluent interface
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│   QueryBuilder       │  ← Analyzes query, selects strategy
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ GraphTraversalService│  ← Coordinates execution, caching
└──────────┬───────────┘
           │
       ┌───┴───┐
       ▼       ▼
┌────────────┐ ┌──────────────┐
│SqlExecutor │ │MemoryExecutor│
│(Recursive  │ │(BFS/DFS/     │
│ CTEs)      │ │ Dijkstra)    │
└────────────┘ └──────────────┘
```

### SQL Executor - Recursive CTE Example

```sql
WITH RECURSIVE graph_traversal AS (
    -- Base case
    SELECT id, guid, label, 0 as depth, ARRAY[id] as path
    FROM nodes
    WHERE id IN (1, 2, 3)
    
    UNION ALL
    
    -- Recursive case
    SELECT target.id, target.guid, target.label, 
           t.depth + 1, t.path || target.id
    FROM graph_traversal t
    INNER JOIN edges e ON t.id = e.source_node_id
    INNER JOIN nodes target ON e.target_node_id = target.id
    WHERE t.depth < 3
      AND NOT target.id = ANY(t.path)  -- Prevent cycles
)
SELECT DISTINCT * FROM graph_traversal WHERE depth >= 1;
```

### Memory Executor - BFS Example

```php
function traverse($startNodes, $maxDepth) {
    $queue = array_map(fn($id) => ['id' => $id, 'depth' => 0, 'path' => [$id]], $startNodes);
    $visited = [];
    $results = [];
    
    while (!empty($queue)) {
        $current = array_shift($queue);
        
        if (isset($visited[$current['id']])) continue;
        $visited[$current['id']] = true;
        
        if ($current['depth'] >= $minDepth) {
            $results[] = $current['id'];
        }
        
        if ($current['depth'] < $maxDepth) {
            $neighbors = $this->getNeighbors($current['id']);
            foreach ($neighbors as $neighborId) {
                if (!in_array($neighborId, $current['path'])) {
                    $queue[] = [
                        'id' => $neighborId,
                        'depth' => $current['depth'] + 1,
                        'path' => [...$current['path'], $neighborId]
                    ];
                }
            }
        }
    }
    
    return $results;
}
```

## Performance Characteristics

### SQL Executor
- **Latency**: P50 < 50ms, P95 < 100ms (typical 2-3 hop queries)
- **Memory**: Low (streaming from DB)
- **Optimal**: 1-4 hops, < 1000 nodes, strong filtering

### Memory Executor
- **Latency**: P50 50-200ms, P95 100-500ms (depends on subgraph size)
- **Memory**: Higher (loads subgraph into memory)
- **Optimal**: 4+ hops, complex algorithms, > 1000 nodes

## Alternatives Considered and Rejected

### Single Execution Strategy
**Rejected**: Would sacrifice either performance (SQL-only) or flexibility (memory-only)

### Always-Memory Strategy
**Rejected**: Slower for typical queries, higher memory usage, unnecessary for simple traversals

### Always-SQL Strategy
**Rejected**: Cannot support complex algorithms, deep recursion expensive

### Graph Database (Neo4j, etc.)
**Rejected**: Hosting constraints (shared cPanel), operational complexity, cost

## Future Evolution

This decision allows for future evolution:

1. **Phase 1.3**: Add caching layer to improve both executors
2. **Phase 1.4**: Add recommendation algorithms to memory executor
3. **Phase 2+**: Could add graph DB read model without changing API
4. **Optimization**: Refine heuristics based on production metrics

## References

- [PostgreSQL Recursive CTEs Documentation](https://www.postgresql.org/docs/current/queries-with.html)
- [Graph Algorithms in PHP](https://github.com/graphp/algorithms)
- [Gremlin Query Language](https://tinkerpop.apache.org/docs/current/reference/#_tinkerpop_documentation)
- [Neo4j Architecture](https://neo4j.com/docs/operations-manual/current/architecture/)

## Related Decisions

- **ADR-002**: UUID v7 for Time-Ordered Identifiers (impacts index performance)
- **ADR-003**: Standing-Based Progressive Permissions (impacts query authorization)
- **Future ADR**: Graph Database Read Model (potential future enhancement)

## Notes

- Implemented in: `api/app/Services/Graph/`
- Tests in: `api/tests/Unit/Services/Graph/`
- Documentation: `docs/GRAPH_SYSTEM.md`
- Performance benchmarks: TBD (Phase 1.5)


