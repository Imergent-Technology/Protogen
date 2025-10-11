<?php

namespace App\Providers;

use App\Services\Graph\FluentGraphQuery;
use App\Services\Graph\QueryBuilder;
use App\Services\Graph\GraphTraversalService;
use App\Services\Graph\GraphCacheService;
use App\Services\Graph\SqlExecutor;
use App\Services\Graph\MemoryExecutor;
use App\Models\CoreGraphNode;
use App\Models\CoreGraphEdge;
use App\Models\Subgraph;
use App\Observers\CoreGraphNodeObserver;
use App\Observers\CoreGraphEdgeObserver;
use App\Observers\SubgraphObserver;
use Illuminate\Support\ServiceProvider;

class GraphServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        // Register cache service
        $this->app->singleton(GraphCacheService::class, function ($app) {
            return new GraphCacheService();
        });
        
        // Register executors as singletons
        $this->app->singleton(SqlExecutor::class, function ($app) {
            return new SqlExecutor();
        });
        
        $this->app->singleton(MemoryExecutor::class, function ($app) {
            return new MemoryExecutor();
        });
        
        // Register query builder
        $this->app->singleton(QueryBuilder::class, function ($app) {
            return new QueryBuilder();
        });
        
        // Register main traversal service with cache service
        $this->app->singleton(GraphTraversalService::class, function ($app) {
            return new GraphTraversalService(
                $app->make(SqlExecutor::class),
                $app->make(MemoryExecutor::class),
                $app->make(GraphCacheService::class)
            );
        });
        
        // Aliases for convenience
        $this->app->alias(GraphTraversalService::class, 'graph.traversal');
        $this->app->alias(GraphCacheService::class, 'graph.cache');
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        // Register Eloquent observers for cache invalidation
        CoreGraphNode::observe(CoreGraphNodeObserver::class);
        CoreGraphEdge::observe(CoreGraphEdgeObserver::class);
        Subgraph::observe(SubgraphObserver::class);
    }
}

