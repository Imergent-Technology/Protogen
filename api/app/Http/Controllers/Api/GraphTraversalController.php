<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\Graph\FluentGraphQuery;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

/**
 * Graph Traversal API Controller
 * 
 * HTTP endpoints for graph traversal, recommendations, shortest path, and ego networks.
 */
class GraphTraversalController extends Controller
{
    /**
     * Execute a graph traversal query
     * 
     * POST /api/graph/traverse
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function traverse(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'start_nodes' => 'required|array|min:1',
            'start_nodes.*' => 'required', // Can be int or string (GUID)
            'steps' => 'nullable|array',
            'steps.*.type' => 'required|in:out,in,both',
            'steps.*.edge_types' => 'nullable|array',
            'filters' => 'nullable|array',
            'depth' => 'nullable|array',
            'depth.min' => 'nullable|integer|min:0',
            'depth.max' => 'nullable|integer|min:1',
            'limit' => 'nullable|integer|min:1|max:1000',
            'unique' => 'nullable|boolean',
            'strategy' => 'nullable|in:sql,memory',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $startTime = microtime(true);
            
            // Build query
            $query = FluentGraphQuery::start($request->input('start_nodes'));
            
            // Add steps
            if ($request->has('steps')) {
                foreach ($request->input('steps') as $step) {
                    $edgeTypes = $step['edge_types'] ?? null;
                    match($step['type']) {
                        'out' => $query->out($edgeTypes),
                        'in' => $query->in($edgeTypes),
                        'both' => $query->both($edgeTypes),
                        default => null,
                    };
                }
            }
            
            // Add filters
            if ($request->has('filters')) {
                foreach ($request->input('filters') as $filter) {
                    match($filter['type'] ?? null) {
                        'node_type' => $query->hasType($filter['values']),
                        'property' => $query->has($filter['property'], $filter['value'], $filter['operator'] ?? '='),
                        'label' => $query->hasLabel($filter['pattern']),
                        default => null,
                    };
                }
            }
            
            // Add depth
            if ($request->has('depth')) {
                $min = $request->input('depth.min', 1);
                $max = $request->input('depth.max');
                $query->depth($min, $max);
            }
            
            // Add limit
            if ($request->has('limit')) {
                $query->limit($request->input('limit'));
            }
            
            // Add unique
            if ($request->input('unique', false)) {
                $query->unique();
            }
            
            // Force strategy if specified
            if ($request->has('strategy')) {
                $query->useStrategy($request->input('strategy'));
            }
            
            // Execute
            $results = $query->execute();
            $executionTime = (microtime(true) - $startTime) * 1000;
            
            return response()->json([
                'success' => true,
                'data' => $results,
                'meta' => [
                    'execution_time_ms' => round($executionTime, 2),
                    'node_count' => $results->count(),
                ],
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Traversal failed: ' . $e->getMessage(),
            ], 500);
        }
    }
    
    /**
     * Get node recommendations
     * 
     * POST /api/graph/recommend
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function recommend(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'node_id' => 'required', // Can be int or string (GUID)
            'limit' => 'nullable|integer|min:1|max:100',
            'algorithm' => 'nullable|in:rwr,shortest_path,similarity',
            'context' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        // TODO: Implement recommendation algorithm (Phase 1.4)
        return response()->json([
            'success' => false,
            'message' => 'Recommendation engine not yet implemented. Coming in Phase 1.4',
        ], 501);
    }
    
    /**
     * Find shortest path between two nodes
     * 
     * POST /api/graph/shortest-path
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function shortestPath(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'source_node' => 'required',
            'target_node' => 'required',
            'max_depth' => 'nullable|integer|min:1|max:10',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        // TODO: Implement shortest path algorithm (Phase 1.2 - MemoryExecutor enhancement)
        return response()->json([
            'success' => false,
            'message' => 'Shortest path not yet implemented. Coming in Phase 1.2',
        ], 501);
    }
    
    /**
     * Get ego network for a node
     * 
     * GET /api/graph/ego-net
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function egoNet(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'node_id' => 'required',
            'depth' => 'nullable|integer|min:1|max:3',
            'edge_types' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $nodeId = $request->input('node_id');
            $depth = $request->input('depth', 1);
            $edgeTypes = $request->input('edge_types');
            
            // Use fluent API to get ego network
            $query = FluentGraphQuery::start([$nodeId])
                ->both($edgeTypes)
                ->depth(0, $depth)
                ->unique();
            
            $nodes = $query->execute();
            
            // Get edges between these nodes
            $nodeIds = $nodes->pluck('id')->toArray();
            $edges = \App\Models\CoreGraphEdge::whereIn('source_node_id', $nodeIds)
                ->whereIn('target_node_id', $nodeIds)
                ->where('is_active', true)
                ->with(['edgeType'])
                ->get();
            
            return response()->json([
                'success' => true,
                'data' => [
                    'center' => $nodes->first(),
                    'nodes' => $nodes,
                    'edges' => $edges,
                    'depth' => $depth,
                ],
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Ego network query failed: ' . $e->getMessage(),
            ], 500);
        }
    }
    
    /**
     * Explain query execution plan
     * 
     * POST /api/graph/explain
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function explain(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'start_nodes' => 'required|array|min:1',
            'steps' => 'nullable|array',
            'filters' => 'nullable|array',
            'depth' => 'nullable|array',
            'limit' => 'nullable|integer',
            'unique' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            // Build query (same as traverse)
            $query = FluentGraphQuery::start($request->input('start_nodes'));
            
            if ($request->has('steps')) {
                foreach ($request->input('steps') as $step) {
                    $edgeTypes = $step['edge_types'] ?? null;
                    match($step['type']) {
                        'out' => $query->out($edgeTypes),
                        'in' => $query->in($edgeTypes),
                        'both' => $query->both($edgeTypes),
                        default => null,
                    };
                }
            }
            
            if ($request->has('filters')) {
                foreach ($request->input('filters') as $filter) {
                    match($filter['type'] ?? null) {
                        'node_type' => $query->hasType($filter['values']),
                        'property' => $query->has($filter['property'], $filter['value'], $filter['operator'] ?? '='),
                        'label' => $query->hasLabel($filter['pattern']),
                        default => null,
                    };
                }
            }
            
            if ($request->has('depth')) {
                $query->depth($request->input('depth.min', 1), $request->input('depth.max'));
            }
            
            if ($request->has('limit')) {
                $query->limit($request->input('limit'));
            }
            
            if ($request->input('unique', false)) {
                $query->unique();
            }
            
            // Get plan
            $plan = $query->explain();
            
            return response()->json([
                'success' => true,
                'data' => $plan,
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Query explanation failed: ' . $e->getMessage(),
            ], 500);
        }
    }
}


