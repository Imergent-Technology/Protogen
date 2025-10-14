# Protogen Graph System

## Overview

The Protogen Graph System provides sophisticated graph traversal, querying, and recommendation capabilities for the central graph architecture. It implements a dual execution strategy (SQL recursive CTEs + in-memory algorithms) with automatic query planning, caching, and explainability.

## Architecture

### Core Components

```
┌─────────────────────────┐
│  FluentGraphQuery API   │  ← Gremlin-style fluent interface
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│     QueryBuilder        │  ← Builds execution plan
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│  GraphTraversalService  │  ← Coordinates execution
└───────────┬─────────────┘
            │
      ┌─────┴─────┐
      ▼           ▼
┌────────────┐ ┌──────────────┐
│ SqlExecutor│ │MemoryExecutor│
└────────────┘ └──────────────┘
```

### Execution Strategies

#### SQL Executor (Recursive CTEs)
- **Optimized for**: Shallow-to-mid depth queries (1-4 hops), strong filtering
- **Implementation**: PostgreSQL recursive Common Table Expressions (CTEs)
- **Performance**: Excellent for typical 2-3 hop queries with filtering
- **Limitations**: Deep recursion can be expensive, complex algorithms not supported

#### Memory Executor (In-Memory Algorithms)
- **Optimized for**: Deep traversals, complex algorithms, large subgraphs
- **Implementation**: BFS/DFS in PHP with adjacency list
- **Performance**: Better for deep traversals and when algorithms beyond simple traversal are needed
- **Limitations**: Memory overhead for large subgraphs

#### Automatic Planning
The `QueryBuilder` automatically selects execution strategy based on:
- **Estimated result size**: < 1000 nodes favors SQL
- **Query depth**: <= 4 hops favors SQL
- **Filtering strength**: Strong filters favor SQL
- **Manual override**: `useStrategy('sql' | 'memory')` available

## Fluent Query API

### Basic Usage

```php
use App\Services\Graph\FluentGraphQuery;

// Simple traversal
$nodes = GraphQuery::start([1, 2, 3])
    ->out('related_to')
    ->hasType('concept')
    ->depth(1, 2)
    ->unique()
    ->limit(50)
    ->execute();

// Get node IDs only
$ids = GraphQuery::start([1])
    ->out()
    ->depth(1, 3)
    ->executeIds();
```

### API Methods

#### Start Query
```php
GraphQuery::start($nodeIds) // array of node IDs or GUIDs
```

#### Traversal Direction
```php
->out($edgeTypes?)     // Follow outgoing edges
->in($edgeTypes?)      // Follow incoming edges
->both($edgeTypes?)    // Follow both directions
```

#### Filtering
```php
->hasType($nodeTypes)               // Filter by node type
->has($property, $value, $operator) // Filter by property value
->hasLabel($pattern)                // Filter by label pattern
```

#### Constraints
```php
->depth($min, $max?)  // Set depth range
->unique()            // Ensure unique nodes
->limit($count)       // Limit results
```

#### Execution
```php
->execute()       // Returns Collection of nodes
->executeIds()    // Returns array of node IDs
->executeGuids()  // Returns array of node GUIDs
->explain()       // Returns execution plan
```

### Advanced Examples

#### Multi-Hop Traversal with Filtering
```php
$results = GraphQuery::start([1])
    ->out('related_to')
    ->hasType(['concept', 'topic'])
    ->has('priority', 'high')
    ->depth(1, 3)
    ->unique()
    ->limit(100)
    ->execute();
```

#### Bidirectional Search
```php
$results = GraphQuery::start([5, 10])
    ->both(['related_to', 'depends_on'])
    ->hasLabel('machine learning')
    ->depth(2, 4)
    ->unique()
    ->execute();
```

#### Force Execution Strategy
```php
// Force in-memory execution for deep traversal
$results = GraphQuery::start([1])
    ->out()
    ->depth(1, 6)
    ->useStrategy('memory')
    ->execute();
```

#### Explain Query Plan
```php
$plan = GraphQuery::start([1])
    ->out('related_to')
    ->depth(1, 3)
    ->explain();

// Returns:
// [
//     'strategy' => 'sql',
//     'estimated_nodes' => 150,
//     'steps' => 1,
//     'filters' => 0,
//     'depth' => ['min' => 1, 'max' => 3],
//     'reasoning' => '...'
// ]
```

## HTTP API Endpoints

### Traverse Graph
```http
POST /api/graph/traverse
Authorization: Bearer {token}
Content-Type: application/json

{
  "start_nodes": [1, 2, 3],  // or GUIDs
  "steps": [
    {
      "type": "out",
      "edge_types": ["related_to"]
    }
  ],
  "filters": [
    {
      "type": "node_type",
      "values": ["concept"]
    }
  ],
  "depth": {
    "min": 1,
    "max": 3
  },
  "limit": 100,
  "unique": true,
  "strategy": "sql"  // optional: 'sql' or 'memory'
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 5,
      "guid": "...",
      "label": "Machine Learning",
      "node_type_id": 1,
      ...
    }
  ],
  "meta": {
    "execution_time_ms": 45.2,
    "node_count": 87
  }
}
```

### Get Ego Network
```http
GET /api/graph/ego-net?node_id=5&depth=2&edge_types[]=related_to
```

**Response:**
```json
{
  "success": true,
  "data": {
    "center": { ...center node... },
    "nodes": [ ...neighboring nodes... ],
    "edges": [ ...edges between nodes... ],
    "depth": 2
  }
}
```

### Explain Query
```http
POST /api/graph/explain
Content-Type: application/json

{
  "start_nodes": [1],
  "steps": [...],
  "filters": [...],
  "depth": { "min": 1, "max": 3 }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "strategy": "sql",
    "estimated_nodes": 150,
    "steps": 1,
    "filters": 2,
    "depth": { "min": 1, "max": 3 },
    "reasoning": "Using SQL recursive CTE: estimated 150 nodes, max depth 3, 2 filters. SQL optimal for shallow, filtered queries."
  }
}
```

### Get Recommendations (Coming in Phase 1.4)
```http
POST /api/graph/recommend
Content-Type: application/json

{
  "node_id": 5,
  "limit": 10,
  "algorithm": "rwr",  // 'rwr', 'shortest_path', 'similarity'
  "context": {
    // contextual parameters
  }
}
```

### Find Shortest Path (Coming in Phase 1.2)
```http
POST /api/graph/shortest-path
Content-Type: application/json

{
  "source_node": 1,
  "target_node": 10,
  "max_depth": 5
}
```

## Frontend Usage

### Using GraphQueryService

```typescript
import { graphQueryService } from '@/services/GraphQueryService';

// Direct API call
const nodes = await graphQueryService.traverse({
  start_nodes: [1, 2, 3],
  steps: [{ type: 'out', edge_types: ['related_to'] }],
  depth: { min: 1, max: 3 },
  limit: 100,
  unique: true,
});

// Fluent API
const results = await graphQueryService
  .query()
  .start([1, 2, 3])
  .out('related_to')
  .hasType('concept')
  .depth(1, 3)
  .unique()
  .limit(100)
  .execute();
```

### Using React Hooks

```typescript
import {
  useGraphQuery,
  useGraphTraversal,
  useEgoNet,
  useRecommendations,
} from '@/hooks/useGraphQuery';

// Simple query hook
const { data, loading, error } = useGraphQuery({
  start_nodes: [1],
  steps: [{ type: 'out' }],
  depth: { min: 1, max: 2 },
});

// Fluent traversal hook
const { query, execute, data, loading } = useGraphTraversal();
const results = await execute(
  query()
    .start([1])
    .out('related_to')
    .depth(1, 3)
);

// Ego network hook
const { data: egoNet } = useEgoNet(nodeId, { depth: 2 });

// Recommendations hook (Phase 1.4)
const { data: recommendations } = useRecommendations(nodeId, { limit: 10 });
```

## Performance Characteristics

### SQL Executor
- **P50 latency**: < 50ms for typical 2-3 hop queries
- **P95 latency**: < 100ms for typical 2-3 hop queries
- **Optimal range**: 1-4 hops, < 1000 result nodes
- **Memory usage**: Low (streaming results from DB)

### Memory Executor
- **P50 latency**: 50-200ms depending on subgraph size
- **P95 latency**: 100-500ms depending on subgraph size
- **Optimal range**: 4+ hops, complex algorithms
- **Memory usage**: Higher (loads subgraph into memory)

### Caching (Phase 1.3)
- **Cache hit rate target**: > 60% for ego-net queries
- **Cache TTL**: 5-30 minutes based on result size
- **Invalidation**: On node/edge write operations

## Future Enhancements

### Phase 1.3: Caching Layer
- Redis/Memcached integration
- Ego-net caching (1-2 hop neighborhoods)
- Subgraph structure caching
- Smart invalidation on writes

### Phase 1.4: Recommendation Engine
- Random Walk with Restart (RWR) algorithm
- Shortest-path scoring
- Context-aware recommendations
- Explainability (top-3 paths)

### Phase 1.5: Advanced Features
- Bulk operations
- Additional algorithms (PageRank, community detection)
- Graph analytics endpoints
- Performance dashboards

## Architecture Decisions

See also: [ADR-001: Graph System Dual Execution Strategy](active-development/ADR-001-graph-dual-execution.md)

### Why Dual Execution?
- **SQL**: Leverages PostgreSQL's powerful CTE support for typical queries
- **In-Memory**: Provides flexibility for complex algorithms
- **Automatic**: QueryBuilder selects optimal strategy

### Why Not Graph Database?
- **Hosting constraints**: Shared cPanel hosting, no additional infrastructure
- **PostgreSQL sufficiency**: Recursive CTEs handle most use cases well
- **Future flexibility**: Can add graph DB read model later if needed

### Trade-offs
- **Complexity**: Two execution paths to maintain
- **Benefit**: Better performance across different query types
- **Mitigation**: Comprehensive tests for both executors

## Testing

### Unit Tests
```bash
docker exec -it api php artisan test --filter GraphTest
```

### Integration Tests
```bash
# Test SQL executor
docker exec -it api php artisan test --filter SqlExecutorTest

# Test memory executor
docker exec -it api php artisan test --filter MemoryExecutorTest

# Test full traversal
docker exec -it api php artisan test --filter GraphTraversalTest
```

### Performance Tests
```bash
# Benchmark different query types
docker exec -it api php artisan graph:benchmark
```

## Monitoring & Debugging

### Enable Query Logging
```php
// In GraphTraversalService
$this->setCachingEnabled(false); // Disable caching for debugging
```

### Check Logs
```bash
docker exec -it api tail -f storage/logs/laravel.log | grep "Graph query"
```

### Performance Metrics
All queries log:
- Strategy used (SQL vs memory)
- Execution time
- Result count
- Cache hit/miss

## Troubleshooting

### Slow Queries
1. Check execution plan with `->explain()`
2. Consider adding filters to reduce result set
3. Use `->limit()` to cap results
4. Check if in-memory execution would be faster

### Memory Issues
1. Reduce max depth for memory executor
2. Add more filters to reduce subgraph size
3. Use SQL executor for shallow queries
4. Increase PHP memory limit if needed

### Cache Issues
1. Check Redis/Memcached connection
2. Verify cache keys are being generated
3. Monitor cache hit rate in logs
4. Clear cache if stale: `graphTraversal->clearCache()`

## Contributing

When adding new features to the Graph System:
1. Add tests for both SQL and memory executors
2. Update this documentation
3. Add performance benchmarks
4. Update ADR if architecture changes


