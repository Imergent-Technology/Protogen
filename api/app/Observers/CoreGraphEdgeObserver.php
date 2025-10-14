<?php

namespace App\Observers;

use App\Models\CoreGraphEdge;
use App\Services\Graph\GraphCacheService;
use Illuminate\Support\Facades\Log;

/**
 * Core Graph Edge Observer
 * 
 * Handles cache invalidation when edges are created, updated, or deleted.
 */
class CoreGraphEdgeObserver
{
    protected GraphCacheService $cacheService;
    
    public function __construct(GraphCacheService $cacheService)
    {
        $this->cacheService = $cacheService;
    }
    
    /**
     * Handle the CoreGraphEdge "created" event.
     */
    public function created(CoreGraphEdge $edge): void
    {
        // Invalidate caches for both connected nodes
        $this->cacheService->invalidateEdge($edge->source_node_id, $edge->target_node_id);
        
        Log::info('Edge created, caches invalidated', [
            'edge_id' => $edge->id,
            'source' => $edge->source_node_id,
            'target' => $edge->target_node_id,
        ]);
    }
    
    /**
     * Handle the CoreGraphEdge "updated" event.
     */
    public function updated(CoreGraphEdge $edge): void
    {
        // Invalidate caches for both connected nodes
        $this->cacheService->invalidateEdge($edge->source_node_id, $edge->target_node_id);
        
        Log::info('Edge updated, caches invalidated', [
            'edge_id' => $edge->id,
            'source' => $edge->source_node_id,
            'target' => $edge->target_node_id,
        ]);
    }
    
    /**
     * Handle the CoreGraphEdge "deleted" event.
     */
    public function deleted(CoreGraphEdge $edge): void
    {
        // Invalidate caches for both connected nodes
        $this->cacheService->invalidateEdge($edge->source_node_id, $edge->target_node_id);
        
        Log::info('Edge deleted, caches invalidated', [
            'edge_id' => $edge->id,
            'source' => $edge->source_node_id,
            'target' => $edge->target_node_id,
        ]);
    }
    
    /**
     * Handle the CoreGraphEdge "restored" event.
     */
    public function restored(CoreGraphEdge $edge): void
    {
        // Invalidate caches when edge is restored
        $this->cacheService->invalidateEdge($edge->source_node_id, $edge->target_node_id);
        
        Log::info('Edge restored, caches invalidated', [
            'edge_id' => $edge->id,
            'source' => $edge->source_node_id,
            'target' => $edge->target_node_id,
        ]);
    }
}


