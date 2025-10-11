<?php

namespace App\Services\Graph;

use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

/**
 * Graph Traversal Service
 * 
 * Main coordination service for graph traversal operations.
 * Delegates to SQL or in-memory executors based on execution plan.
 * Handles caching, performance monitoring, and error handling.
 */
class GraphTraversalService
{
    protected SqlExecutor $sqlExecutor;
    protected MemoryExecutor $memoryExecutor;
    protected GraphCacheService $cacheService;
    protected bool $cachingEnabled = true;
    
    public function __construct(
        SqlExecutor $sqlExecutor, 
        MemoryExecutor $memoryExecutor,
        GraphCacheService $cacheService
    ) {
        $this->sqlExecutor = $sqlExecutor;
        $this->memoryExecutor = $memoryExecutor;
        $this->cacheService = $cacheService;
    }
    
    /**
     * Execute graph traversal query
     * 
     * @param array $plan Execution plan from QueryBuilder
     * @return Collection
     */
    public function execute(array $plan): Collection
    {
        $startTime = microtime(true);
        $cacheKey = $this->getCacheKey($plan);
        
        // Try cache first if enabled
        if ($this->cachingEnabled && $cacheKey) {
            $cached = Cache::get($cacheKey);
            if ($cached !== null) {
                $this->logPerformance($plan, microtime(true) - $startTime, true);
                return collect($cached);
            }
        }
        
        // Execute based on strategy
        try {
            $results = $this->executeWithStrategy($plan);
            
            // Cache results if enabled
            if ($this->cachingEnabled && $cacheKey) {
                Cache::put($cacheKey, $results->toArray(), $this->getCacheTtl($plan));
            }
            
            $this->logPerformance($plan, microtime(true) - $startTime, false);
            
            return $results;
            
        } catch (\Exception $e) {
            Log::error('Graph traversal failed', [
                'plan' => $plan,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            
            throw new \RuntimeException("Graph traversal failed: " . $e->getMessage(), 0, $e);
        }
    }
    
    /**
     * Execute with selected strategy
     * 
     * @param array $plan
     * @return Collection
     */
    protected function executeWithStrategy(array $plan): Collection
    {
        if ($plan['strategy'] === 'sql') {
            return $this->sqlExecutor->execute($plan);
        } else {
            return $this->memoryExecutor->execute($plan);
        }
    }
    
    /**
     * Generate cache key for query plan
     * 
     * @param array $plan
     * @return string|null
     */
    protected function getCacheKey(array $plan): ?string
    {
        // Only cache simple queries to avoid cache bloat
        if ($plan['estimated_nodes'] > 1000) {
            return null;
        }
        
        // Create deterministic cache key from plan
        $keyData = [
            'start_nodes' => $plan['start_nodes'],
            'steps' => $plan['steps'],
            'filters' => $plan['filters'],
            'depth' => $plan['depth'],
            'limit' => $plan['limit'],
            'unique' => $plan['unique'],
        ];
        
        return 'graph:query:' . md5(json_encode($keyData));
    }
    
    /**
     * Get cache TTL based on query characteristics
     * 
     * @param array $plan
     * @return int Seconds
     */
    protected function getCacheTtl(array $plan): int
    {
        // Shorter TTL for larger result sets
        if ($plan['estimated_nodes'] > 500) {
            return 300; // 5 minutes
        }
        
        // Longer TTL for small, stable queries
        return 1800; // 30 minutes
    }
    
    /**
     * Log performance metrics
     * 
     * @param array $plan
     * @param float $duration Seconds
     * @param bool $cacheHit
     */
    protected function logPerformance(array $plan, float $duration, bool $cacheHit): void
    {
        $durationMs = round($duration * 1000, 2);
        
        Log::debug('Graph query performance', [
            'strategy' => $plan['strategy'],
            'estimated_nodes' => $plan['estimated_nodes'],
            'steps' => count($plan['steps']),
            'filters' => count($plan['filters']),
            'duration_ms' => $durationMs,
            'cache_hit' => $cacheHit,
        ]);
        
        // Warn if query is slow
        if ($durationMs > 1000 && !$cacheHit) {
            Log::warning('Slow graph query detected', [
                'duration_ms' => $durationMs,
                'plan' => $plan,
            ]);
        }
    }
    
    /**
     * Enable or disable caching
     * 
     * @param bool $enabled
     */
    public function setCachingEnabled(bool $enabled): void
    {
        $this->cachingEnabled = $enabled;
    }
    
    /**
     * Clear all graph query caches
     */
    public function clearCache(): void
    {
        $this->cacheService->clearAll();
    }
    
    /**
     * Get cache service
     * 
     * @return GraphCacheService
     */
    public function getCacheService(): GraphCacheService
    {
        return $this->cacheService;
    }
}

