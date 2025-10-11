<?php

namespace App\Observers;

use App\Models\Subgraph;
use App\Services\Graph\GraphCacheService;
use Illuminate\Support\Facades\Log;

/**
 * Subgraph Observer
 * 
 * Handles cache invalidation when subgraphs are modified.
 */
class SubgraphObserver
{
    protected GraphCacheService $cacheService;
    
    public function __construct(GraphCacheService $cacheService)
    {
        $this->cacheService = $cacheService;
    }
    
    /**
     * Handle the Subgraph "updated" event.
     */
    public function updated(Subgraph $subgraph): void
    {
        // Invalidate subgraph cache when modified
        $this->cacheService->invalidateSubgraph($subgraph->id);
        
        Log::info('Subgraph updated, cache invalidated', ['subgraph_id' => $subgraph->id]);
    }
    
    /**
     * Handle the Subgraph "deleted" event.
     */
    public function deleted(Subgraph $subgraph): void
    {
        // Invalidate subgraph cache when deleted
        $this->cacheService->invalidateSubgraph($subgraph->id);
        
        Log::info('Subgraph deleted, cache invalidated', ['subgraph_id' => $subgraph->id]);
    }
}

