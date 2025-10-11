# Testing Checklist - Protogen Strategic Implementation

**Use this checklist when you're ready to test the new Graph System and UUID v7 features.**

---

## ✅ Pre-Testing Setup

### 1. Restart Development Environment

```bash
# Stop all containers
docker-compose down

# Rebuild and start (picks up new code)
docker-compose up -d --build

# Check all containers are running
docker-compose ps
```

**Expected Output**: All containers (api, postgres, pgadmin, redis) should show "Up"

**Note**: This project uses Docker-first development. All services run in containers. Frontend development servers are started automatically via npm scripts for hot-reload during development, but all core services run in Docker.

---

## ✅ Connection Test

### Test Each Application

- [ ] **Portal**: http://protogen.local:3000 (should load)
- [ ] **Admin**: http://protogen.local:3001 (should load)
- [ ] **API Health**: http://protogen.local:8080 (should return Laravel page)
- [ ] **Database Admin**: http://protogen.local:5050 (pgAdmin login)

**If ERR_CONNECTION_REFUSED**:
1. Check `docker-compose ps` - are containers running?
2. Check `/etc/hosts` - is `protogen.local` mapped to `127.0.0.1`?
3. Check ports - are 3000-3002, 8080, 5050 available?

---

## ✅ Graph System Tests

### 1. Backend Service Test

```bash
# Access Laravel Tinker
docker exec -it api php artisan tinker

# Test FluentGraphQuery
>>> use App\Services\Graph\FluentGraphQuery;
>>> $nodes = CoreGraphNode::take(3)->get();
>>> $query = FluentGraphQuery::start($nodes->pluck('id')->toArray());
>>> $results = $query->out()->depth(1, 2)->limit(10)->execute();
>>> $results->count();  // Should return number of results
>>> exit
```

**Expected**: Query executes successfully, returns results

### 2. API Endpoint Test

```bash
# Get authentication token first (if needed)
# Then test graph traversal

curl -X POST http://protogen.local:8080/api/graph/traverse \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "start_nodes": [1],
    "steps": [{"type": "out"}],
    "depth": {"min": 1, "max": 2},
    "limit": 10
  }'
```

**Expected**: JSON response with `{"success": true, "data": [...]}`

### 3. Cache Test

```bash
# Test cache service
docker exec -it api php artisan tinker

>>> use App\Services\Graph\GraphCacheService;
>>> $cache = app(GraphCacheService::class);
>>> $stats = $cache->getStats();
>>> print_r($stats);
>>> exit
```

**Expected**: Cache service initialized, stats returned

### 4. Ego Network Test

```bash
# Get ego network for a node
curl "http://protogen.local:8080/api/graph/ego-net?node_id=1&depth=1" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected**: JSON with center node, neighbors, edges

---

## ✅ UUID v7 Tests

### 1. Generator Test

```bash
docker exec -it api php artisan tinker

>>> use App\Support\Uuid7;
>>> $uuid = Uuid7::generate();
>>> echo $uuid;
>>> Uuid7::isValid($uuid);  // Should return true
>>> $timestamp = Uuid7::getTimestamp($uuid);
>>> echo "Timestamp: " . $timestamp . "\n";
>>> $dt = Uuid7::getDateTime($uuid);
>>> echo $dt->format('Y-m-d H:i:s');
>>> exit
```

**Expected**: 
- UUID generated (format: xxxxxxxx-xxxx-7xxx-xxxx-xxxxxxxxxxxx)
- Validation returns true
- Timestamp extraction works

### 2. Model Integration Test

```bash
docker exec -it api php artisan tinker

>>> $node = App\Models\CoreGraphNode::create([
...   'node_type_id' => 1,
...   'label' => 'Test UUID v7 Node',
...   'description' => 'Testing UUID v7 generation'
... ]);
>>> echo "GUID: " . $node->guid . "\n";
>>> echo "Is UUID v7: " . ($node->hasUuidV7() ? 'yes' : 'no') . "\n";
>>> $timestamp = $node->getUuidTimestamp();
>>> echo "Created (from UUID): " . date('Y-m-d H:i:s', $timestamp / 1000) . "\n";
>>> exit
```

**Expected**:
- Node created with UUID v7 guid
- hasUuidV7() returns true
- Timestamp matches creation time

### 3. Subgraph Test

```bash
docker exec -it api php artisan tinker

>>> $subgraph = App\Models\Subgraph::create([
...   'name' => 'Test Subgraph UUID v7',
...   'description' => 'Testing UUID v7',
...   'tenant_id' => 1,
...   'created_by' => 1
... ]);
>>> echo "GUID: " . $subgraph->guid . "\n";
>>> echo "Is UUID v7: " . ($subgraph->hasUuidV7() ? 'yes' : 'no') . "\n";
>>> exit
```

**Expected**: Subgraph created with UUID v7 guid

---

## ✅ Frontend Integration Tests

### 1. Check Exports

```bash
# Check that new exports are available
cd shared
npm run build

# Should build without errors
```

**Expected**: No build errors, types compiled

### 2. Import Test (in browser console)

Open portal/admin and check browser console:

```javascript
// Should have graph query service available
import { graphQueryService } from '@/services/GraphQueryService';
console.log(graphQueryService);
```

**Expected**: Service available, no import errors

---

## ✅ Performance Tests

### 1. Query Performance

```bash
docker exec -it api php artisan tinker

>>> use App\Services\Graph\FluentGraphQuery;
>>> $start = microtime(true);
>>> $results = FluentGraphQuery::start([1])->out()->depth(1, 2)->limit(100)->execute();
>>> $time = (microtime(true) - $start) * 1000;
>>> echo "Query took: " . round($time, 2) . " ms\n";
>>> echo "Results: " . $results->count() . " nodes\n";
>>> exit
```

**Expected**: Query completes in < 100ms for typical 2-3 hop queries

### 2. Cache Performance

```bash
# Run same query twice to test caching
docker exec -it api php artisan tinker

>>> use App\Services\Graph\FluentGraphQuery;
>>> $start = microtime(true);
>>> $results = FluentGraphQuery::start([1])->out()->depth(1, 2)->limit(50)->execute();
>>> echo "First query: " . round((microtime(true) - $start) * 1000, 2) . " ms\n";
>>> $start = microtime(true);
>>> $results = FluentGraphQuery::start([1])->out()->depth(1, 2)->limit(50)->execute();
>>> echo "Second query (cached): " . round((microtime(true) - $start) * 1000, 2) . " ms\n";
>>> exit
```

**Expected**: Second query significantly faster (< 10ms if cached)

---

## ✅ Documentation Review

- [ ] Read `docs/GRAPH_SYSTEM.md` for API reference
- [ ] Review `docs/active-development/UUID_V7_MIGRATION_GUIDE.md`
- [ ] Check `STRATEGIC_IMPLEMENTATION_COMPLETE.md` for overview
- [ ] See `docs/active-development/ADR-001-graph-dual-execution.md` for architecture

---

## 🐛 Troubleshooting

### Docker Issues

**Problem**: Containers not starting
```bash
docker-compose logs api
docker-compose logs postgres
```

**Problem**: Port conflicts
```bash
lsof -i :8080  # Check what's using port 8080
lsof -i :3000  # Check what's using port 3000
```

### Database Issues

**Problem**: Can't connect to database
```bash
docker exec -it api php artisan migrate:status
docker exec -it postgres psql -U protogen -d protogen -c "SELECT version();"
```

### Cache Issues

**Problem**: Cache not working
```bash
# Check Redis connection
docker exec -it redis redis-cli ping
# Should return: PONG

# Clear cache
docker exec -it api php artisan cache:clear
```

### Frontend Issues

**Problem**: Frontend not loading
```bash
# Check build output
npm run build:all 2>&1 | tee build.log

# Check for port conflicts
lsof -i :3000
lsof -i :3001
lsof -i :3002
```

---

## ✅ Success Criteria

### All Tests Pass
- [ ] Docker containers running
- [ ] Frontend applications load
- [ ] Graph queries execute successfully
- [ ] UUID v7 generation works
- [ ] Cache system operational
- [ ] API endpoints respond correctly
- [ ] No console errors

### Performance Targets
- [ ] Graph queries < 100ms (P95)
- [ ] Cache hits < 10ms
- [ ] Frontend loads < 2 seconds
- [ ] No memory leaks

### Code Quality
- [ ] No linting errors
- [ ] TypeScript types work
- [ ] PHPDoc comments present
- [ ] Logs show expected output

---

## 📞 If You Encounter Issues

1. **Check the logs**:
   ```bash
   docker-compose logs -f api
   ```

2. **Review documentation**:
   - `docs/GRAPH_SYSTEM.md` - API reference
   - `docs/TROUBLESHOOTING.md` - Common issues
   - `STRATEGIC_IMPLEMENTATION_COMPLETE.md` - Overview

3. **Verify environment**:
   ```bash
   docker-compose ps
   docker exec -it api php -v
   docker exec -it api composer --version
   ```

4. **Check database**:
   ```bash
   docker exec -it api php artisan migrate:status
   ```

---

## 🎉 When All Tests Pass

You'll have:
- ✅ Working graph traversal system
- ✅ UUID v7 generating for new records
- ✅ Caching infrastructure operational
- ✅ REST API endpoints functional
- ✅ Frontend integration ready

**Ready for**: Phase 3 (Permissions), Phase 4 (Portal Unification), Phase 5 (Flow System)

---

**Need Help?** All systems are thoroughly documented. Check the `docs/` directory for comprehensive guides.

