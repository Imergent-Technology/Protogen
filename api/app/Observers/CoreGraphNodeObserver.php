<?php

namespace App\Observers;

use App\Models\CoreGraphNode;
use App\Services\Graph\GraphCacheService;
use Illuminate\Support\Facades\Log;

/**
 * Core Graph Node Observer
 * 
 * Handles cache invalidation when nodes are created, updated, or deleted.
 */
class CoreGraphNodeObserver
{
    protected GraphCacheService $cacheService;
    
    public function __construct(GraphCacheService $cacheService)
    {
        $this->cacheService = $cacheService;
    }
    
    /**
     * Handle the CoreGraphNode "created" event.
     */
    public function created(CoreGraphNode $node): void
    {
        // New node doesn't need cache invalidation (no existing caches)
        Log::debug('Node created', ['node_id' => $node->id]);
    }
    
    /**
     * Handle the CoreGraphNode "updated" event.
     */
    public function updated(CoreGraphNode $node): void
    {
        // Invalidate all caches related to this node
        $this->cacheService->invalidateNode($node->id);
        
        Log::info('Node updated, cache invalidated', ['node_id' => $node->id]);
    }
    
    /**
     * Handle the CoreGraphNode "deleted" event.
     */
    public function deleted(CoreGraphNode $node): void
    {
        // Invalidate all caches related to this node
        $this->cacheService->invalidateNode($node->id);
        
        Log::info('Node deleted, cache invalidated', ['node_id' => $node->id]);
    }
    
    /**
     * Handle the CoreGraphNode "restored" event.
     */
    public function restored(CoreGraphNode $node): void
    {
        // Invalidate caches when node is restored
        $this->cacheService->invalidateNode($node->id);
        
        Log::info('Node restored, cache invalidated', ['node_id' => $node->id]);
    }
}


