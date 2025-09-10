<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Scene;
use App\Models\SceneNode;
use App\Models\SceneEdge;
use App\Models\SceneContent;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class SceneApiController extends Controller
{
    /**
     * Get all scenes
     */
    public function index(): JsonResponse
    {
        $scenes = Scene::with(['creator', 'nodes', 'edges', 'content'])
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
     * Create a new scene
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'slug' => 'required|string|max:255|unique:scenes,slug',
                'description' => 'nullable|string',
                'scene_type' => 'required|string|in:graph,card,document,dashboard',
                'config' => 'nullable|array',
                'meta' => 'nullable|array',
                'style' => 'nullable|array',
                'is_active' => 'boolean',
                'is_public' => 'boolean',
            ]);

            $scene = Scene::create([
                ...$validated,
                'created_by' => auth()->id(),
            ]);

            return response()->json([
                'success' => true,
                'data' => $scene->load(['creator', 'content']),
                'message' => 'Scene created successfully'
            ], 201);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create scene: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get a specific scene with all its nodes and edges
     */
    public function show(string $guid): JsonResponse
    {
        $scene = Scene::with(['creator', 'nodes', 'edges', 'content'])
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
     * Update a scene
     */
    public function update(Request $request, string $guid): JsonResponse
    {
        try {
            $scene = Scene::where('guid', $guid)->first();

            if (!$scene) {
                return response()->json([
                    'success' => false,
                    'message' => 'Scene not found'
                ], 404);
            }

            $validated = $request->validate([
                'name' => 'sometimes|string|max:255',
                'slug' => 'sometimes|string|max:255|unique:scenes,slug,' . $scene->id,
                'description' => 'nullable|string',
                'scene_type' => 'sometimes|string|in:graph,card,document,dashboard',
                'config' => 'nullable|array',
                'meta' => 'nullable|array',
                'style' => 'nullable|array',
                'is_active' => 'boolean',
                'is_public' => 'boolean',
            ]);

            $scene->update($validated);

            return response()->json([
                'success' => true,
                'data' => $scene->load(['creator', 'content']),
                'message' => 'Scene updated successfully'
            ]);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update scene: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete a scene
     */
    public function destroy(string $guid): JsonResponse
    {
        try {
            $scene = Scene::where('guid', $guid)->first();

            if (!$scene) {
                return response()->json([
                    'success' => false,
                    'message' => 'Scene not found'
                ], 404);
            }

            $scene->delete();

            return response()->json([
                'success' => true,
                'message' => 'Scene deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete scene: ' . $e->getMessage()
            ], 500);
        }
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

    // forStage method removed - Stage system has been completely removed

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

    /**
     * Save scene content (for document scenes)
     */
    public function saveContent(Request $request, string $guid): JsonResponse
    {
        try {
            $scene = Scene::where('guid', $guid)->first();

            if (!$scene) {
                return response()->json([
                    'success' => false,
                    'message' => 'Scene not found'
                ], 404);
            }

            $validated = $request->validate([
                'content_data' => 'required|string',
                'content_type' => 'sometimes|string',
                'content_key' => 'sometimes|string',
                'content_format' => 'sometimes|string',
                'metadata' => 'nullable|array',
            ]);

            $content = $scene->setContent(
                $validated['content_data'],
                $validated['content_type'] ?? 'document',
                $validated['content_key'] ?? 'main',
                $validated['content_format'] ?? 'html',
                $validated['metadata'] ?? []
            );

            return response()->json([
                'success' => true,
                'data' => $content,
                'message' => 'Scene content saved successfully'
            ]);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to save scene content: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get scene content
     */
    public function getContent(string $guid, string $type = 'document', string $key = 'main'): JsonResponse
    {
        try {
            $scene = Scene::where('guid', $guid)->first();

            if (!$scene) {
                return response()->json([
                    'success' => false,
                    'message' => 'Scene not found'
                ], 404);
            }

            $content = $scene->getContent($type, $key);

            if (!$content) {
                return response()->json([
                    'success' => false,
                    'message' => 'Content not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $content,
                'message' => 'Scene content retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve scene content: ' . $e->getMessage()
            ], 500);
        }
    }
}
