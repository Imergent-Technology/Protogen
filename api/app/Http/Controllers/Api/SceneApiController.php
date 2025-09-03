<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Scene;
use App\Models\SceneNode;
use App\Models\SceneEdge;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class SceneApiController extends Controller
{
    /**
     * Get all scenes
     */
    public function index(): JsonResponse
    {
        $scenes = Scene::with(['stage', 'creator', 'nodes', 'edges'])
            ->active()
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $scenes,
            'message' => 'Scenes retrieved successfully'
        ]);
    }

    /**
     * Get a specific scene with all its nodes and edges
     */
    public function show(string $guid): JsonResponse
    {
        $scene = Scene::with(['stage', 'creator', 'nodes', 'edges'])
            ->where('guid', $guid)
            ->first();

        if (!$scene) {
            return response()->json([
                'success' => false,
                'message' => 'Scene not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $scene,
            'message' => 'Scene retrieved successfully'
        ]);
    }

    /**
     * Get the system scene (Core Graph mirror)
     */
    public function system(): JsonResponse
    {
        $systemScene = Scene::with(['stage', 'creator', 'nodes', 'edges'])
            ->ofType('system')
            ->first();

        if (!$systemScene) {
            return response()->json([
                'success' => false,
                'message' => 'System scene not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $systemScene,
            'message' => 'System scene retrieved successfully'
        ]);
    }

    /**
     * Get scenes for a specific stage
     */
    public function forStage(int $stageId): JsonResponse
    {
        $scenes = Scene::with(['stage', 'creator', 'nodes', 'edges'])
            ->forStage($stageId)
            ->active()
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $scenes,
            'message' => 'Stage scenes retrieved successfully'
        ]);
    }

    /**
     * Get scene statistics
     */
    public function stats(): JsonResponse
    {
        $stats = [
            'total_scenes' => Scene::count(),
            'system_scenes' => Scene::ofType('system')->count(),
            'custom_scenes' => Scene::ofType('custom')->count(),
            'template_scenes' => Scene::ofType('template')->count(),
            'active_scenes' => Scene::active()->count(),
            'public_scenes' => Scene::public()->count(),
            'total_nodes' => SceneNode::count(),
            'total_edges' => SceneEdge::count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
            'message' => 'Scene statistics retrieved successfully'
        ]);
    }
}
