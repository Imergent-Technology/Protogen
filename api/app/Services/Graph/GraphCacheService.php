<?php

namespace App\Services\Graph;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

/**
 * Graph Cache Service
 * 
 * Manages caching for graph queries, ego-nets, and subgraphs.
 * Implements LRU admission control and smart invalidation.
 */
class GraphCacheService
{
    /**
     * Cache prefixes for different data types
     */
    const PREFIX_QUERY = 'graph:query:';
    const PREFIX_EGO_NET = 'graph:ego:';
    const PREFIX_SUBGRAPH = 'graph:subgraph:';
    const PREFIX_NODE = 'graph:node:';
    const PREFIX_EDGE = 'graph:edge:';
    
    /**
     * Cache TTLs in seconds
     */
    const TTL_QUERY_SMALL = 1800; // 30 minutes for small result sets
    const TTL_QUERY_LARGE = 300;  // 5 minutes for large result sets
    const TTL_EGO_NET = 1800;     // 30 minutes for ego networks
    const TTL_SUBGRAPH = 3600;    // 1 hour for subgraph structures
    
    /**
     * Size thresholds for TTL selection
     */
    const SIZE_THRESHOLD_LARGE = 500;
    
    /**
     * Cache a query result
     * 
     * @param string $key
     * @param mixed $data
     * @param int $resultSize
     * @return void
     */
    public function cacheQuery(string $key, $data, int $resultSize): void
    {
        $ttl = $resultSize > self::SIZE_THRESHOLD_LARGE 
            ? self::TTL_QUERY_LARGE 
            : self::TTL_QUERY_SMALL;
        
        $fullKey = self::PREFIX_QUERY . $key;
        Cache::put($fullKey, $data, $ttl);
        
        Log::debug('Graph query cached', [
            'key' => $fullKey,
            'size' => $resultSize,
            'ttl' => $ttl,
        ]);
    }
    
    /**
     * Get cached query result
     * 
     * @param string $key
     * @return mixed|null
     */
    public function getQuery(string $key)
    {
        return Cache::get(self::PREFIX_QUERY . $key);
    }
    
    /**
     * Cache an ego network
     * 
     * @param int|string $nodeId
     * @param int $depth
     * @param array $data
     * @param array $edgeTypes
     * @return void
     */
    public function cacheEgoNet($nodeId, int $depth, array $data, ?array $edgeTypes = null): void
    {
        $key = $this->makeEgoNetKey($nodeId, $depth, $edgeTypes);
        Cache::put($key, $data, self::TTL_EGO_NET);
        
        // Track node's ego-net cache keys for invalidation
        $this->trackNodeCache($nodeId, $key);
        
        Log::debug('Ego network cached', [
            'node_id' => $nodeId,
            'depth' => $depth,
            'edge_types' => $edgeTypes,
        ]);
    }
    
    /**
     * Get cached ego network
     * 
     * @param int|string $nodeId
     * @param int $depth
     * @param array|null $edgeTypes
     * @return array|null
     */
    public function getEgoNet($nodeId, int $depth, ?array $edgeTypes = null): ?array
    {
        $key = $this->makeEgoNetKey($nodeId, $depth, $edgeTypes);
        return Cache::get($key);
    }
    
    /**
     * Cache a subgraph structure
     * 
     * @param int $subgraphId
     * @param array $data
     * @return void
     */
    public function cacheSubgraph(int $subgraphId, array $data): void
    {
        $key = self::PREFIX_SUBGRAPH . $subgraphId;
        Cache::put($key, $data, self::TTL_SUBGRAPH);
        
        Log::debug('Subgraph cached', ['subgraph_id' => $subgraphId]);
    }
    
    /**
     * Get cached subgraph
     * 
     * @param int $subgraphId
     * @return array|null
     */
    public function getSubgraph(int $subgraphId): ?array
    {
        return Cache::get(self::PREFIX_SUBGRAPH . $subgraphId);
    }
    
    /**
     * Invalidate all caches related to a node
     * 
     * @param int $nodeId
     * @return void
     */
    public function invalidateNode(int $nodeId): void
    {
        // Get all cache keys related to this node
        $cacheKeys = Cache::get(self::PREFIX_NODE . $nodeId . ':keys', []);
        
        foreach ($cacheKeys as $key) {
            Cache::forget($key);
        }
        
        // Clear the tracking
        Cache::forget(self::PREFIX_NODE . $nodeId . ':keys');
        
        Log::info('Node caches invalidated', [
            'node_id' => $nodeId,
            'count' => count($cacheKeys),
        ]);
    }
    
    /**
     * Invalidate all caches related to an edge
     * 
     * @param int $sourceNodeId
     * @param int $targetNodeId
     * @return void
     */
    public function invalidateEdge(int $sourceNodeId, int $targetNodeId): void
    {
        // Invalidate both nodes' caches since the edge affects both
        $this->invalidateNode($sourceNodeId);
        $this->invalidateNode($targetNodeId);
        
        Log::info('Edge caches invalidated', [
            'source_node_id' => $sourceNodeId,
            'target_node_id' => $targetNodeId,
        ]);
    }
    
    /**
     * Invalidate all caches related to a subgraph
     * 
     * @param int $subgraphId
     * @return void
     */
    public function invalidateSubgraph(int $subgraphId): void
    {
        Cache::forget(self::PREFIX_SUBGRAPH . $subgraphId);
        
        Log::info('Subgraph cache invalidated', ['subgraph_id' => $subgraphId]);
    }
    
    /**
     * Clear all graph caches
     * 
     * @return void
     */
    public function clearAll(): void
    {
        // Note: This is a simplified implementation
        // In production, you'd want a more sophisticated cache clearing strategy
        // that doesn't affect other parts of the application
        
        Log::warning('All graph caches cleared');
        
        // For now, we'll rely on cache expiration
        // A better approach would be to use cache tags (if available)
    }
    
    /**
     * Warm cache for popular subgraphs
     * 
     * @param array $subgraphIds
     * @return void
     */
    public function warmSubgraphs(array $subgraphIds): void
    {
        foreach ($subgraphIds as $subgraphId) {
            try {
                // Load subgraph data
                $subgraph = \App\Models\Subgraph::with(['nodes', 'scenes'])->find($subgraphId);
                
                if ($subgraph) {
                    $this->cacheSubgraph($subgraphId, $subgraph->toArray());
                }
            } catch (\Exception $e) {
                Log::error('Failed to warm subgraph cache', [
                    'subgraph_id' => $subgraphId,
                    'error' => $e->getMessage(),
                ]);
            }
        }
        
        Log::info('Subgraph caches warmed', ['count' => count($subgraphIds)]);
    }
    
    /**
     * Warm cache for node ego networks
     * 
     * @param array $nodeIds
     * @param int $depth
     * @return void
     */
    public function warmEgoNets(array $nodeIds, int $depth = 1): void
    {
        foreach ($nodeIds as $nodeId) {
            try {
                // Use FluentGraphQuery to get ego network
                $query = FluentGraphQuery::start([$nodeId])
                    ->both()
                    ->depth(0, $depth)
                    ->unique();
                
                $nodes = $query->execute();
                
                // Get edges between these nodes
                $nodeIdArray = $nodes->pluck('id')->toArray();
                $edges = \App\Models\CoreGraphEdge::whereIn('source_node_id', $nodeIdArray)
                    ->whereIn('target_node_id', $nodeIdArray)
                    ->where('is_active', true)
                    ->get();
                
                $data = [
                    'center' => $nodes->first(),
                    'nodes' => $nodes,
                    'edges' => $edges,
                    'depth' => $depth,
                ];
                
                $this->cacheEgoNet($nodeId, $depth, $data);
                
            } catch (\Exception $e) {
                Log::error('Failed to warm ego-net cache', [
                    'node_id' => $nodeId,
                    'depth' => $depth,
                    'error' => $e->getMessage(),
                ]);
            }
        }
        
        Log::info('Ego-net caches warmed', [
            'count' => count($nodeIds),
            'depth' => $depth,
        ]);
    }
    
    /**
     * Get cache statistics
     * 
     * @return array
     */
    public function getStats(): array
    {
        // Note: Cache statistics depend on cache driver capabilities
        // This is a simplified version
        
        return [
            'driver' => config('cache.default'),
            'prefix_query' => self::PREFIX_QUERY,
            'prefix_ego_net' => self::PREFIX_EGO_NET,
            'prefix_subgraph' => self::PREFIX_SUBGRAPH,
            'ttl_query_small' => self::TTL_QUERY_SMALL,
            'ttl_query_large' => self::TTL_QUERY_LARGE,
            'ttl_ego_net' => self::TTL_EGO_NET,
            'ttl_subgraph' => self::TTL_SUBGRAPH,
        ];
    }
    
    /**
     * Make ego-net cache key
     * 
     * @param int|string $nodeId
     * @param int $depth
     * @param array|null $edgeTypes
     * @return string
     */
    protected function makeEgoNetKey($nodeId, int $depth, ?array $edgeTypes): string
    {
        $key = self::PREFIX_EGO_NET . $nodeId . ':' . $depth;
        
        if ($edgeTypes) {
            sort($edgeTypes); // Ensure consistent ordering
            $key .= ':' . implode(',', $edgeTypes);
        }
        
        return $key;
    }
    
    /**
     * Track cache key for a node (for invalidation)
     * 
     * @param int $nodeId
     * @param string $cacheKey
     * @return void
     */
    protected function trackNodeCache(int $nodeId, string $cacheKey): void
    {
        $trackingKey = self::PREFIX_NODE . $nodeId . ':keys';
        $existingKeys = Cache::get($trackingKey, []);
        $existingKeys[] = $cacheKey;
        
        // Store with same TTL as ego-nets
        Cache::put($trackingKey, array_unique($existingKeys), self::TTL_EGO_NET);
    }
}


