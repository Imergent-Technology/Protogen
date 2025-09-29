<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Scene;
use App\Models\SceneNode;
use App\Models\SceneEdge;
use App\Models\SceneContent;
use App\Models\Subgraph;
use App\Models\SceneItem;
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
        $scene = Scene::with(['creator', 'nodes', 'edges', 'content', 'subgraph', 'items'])
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

    /**
     * Create a new graph scene with subgraph
     */
    public function createGraphScene(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'slug' => 'required|string|max:255|unique:scenes,slug',
                'description' => 'nullable|string',
                'tenant_id' => 'required|exists:tenants,id',
                'node_ids' => 'nullable|array',
                'node_ids.*' => 'exists:core_graph_nodes,id'
            ]);

            // Create subgraph first
            $subgraph = Subgraph::create([
                'name' => $validated['name'] . ' Subgraph',
                'description' => $validated['description'],
                'tenant_id' => $validated['tenant_id'],
                'created_by' => auth()->id()
            ]);

            // Add nodes to subgraph if provided
            if (isset($validated['node_ids']) && is_array($validated['node_ids'])) {
                $subgraph->nodes()->attach($validated['node_ids']);
            }

            // Create scene with subgraph reference
            $scene = Scene::create([
                'name' => $validated['name'],
                'slug' => $validated['slug'],
                'description' => $validated['description'],
                'scene_type' => 'graph',
                'subgraph_id' => $subgraph->id,
                'tenant_id' => $validated['tenant_id'],
                'created_by' => auth()->id()
            ]);

            return response()->json([
                'success' => true,
                'data' => $scene->load(['subgraph', 'creator']),
                'message' => 'Graph scene created successfully'
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
                'message' => 'Failed to create graph scene: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get nodes for a scene (supports both old and new architecture)
     */
    public function getNodes(string $guid): JsonResponse
    {
        try {
            $scene = Scene::where('guid', $guid)->first();

            if (!$scene) {
                return response()->json([
                    'success' => false,
                    'message' => 'Scene not found'
                ], 404);
            }

            $nodes = $scene->getSceneNodes();

            return response()->json([
                'success' => true,
                'data' => $nodes,
                'message' => 'Scene nodes retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve scene nodes: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get edges for a scene (supports both old and new architecture)
     */
    public function getEdges(string $guid): JsonResponse
    {
        try {
            $scene = Scene::where('guid', $guid)->first();

            if (!$scene) {
                return response()->json([
                    'success' => false,
                    'message' => 'Scene not found'
                ], 404);
            }

            $edges = $scene->getSceneEdges();

            return response()->json([
                'success' => true,
                'data' => $edges,
                'message' => 'Scene edges retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve scene edges: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get scene items for a scene
     */
    public function getSceneItems(string $guid): JsonResponse
    {
        try {
            $scene = Scene::where('guid', $guid)->first();

            if (!$scene) {
                return response()->json([
                    'success' => false,
                    'message' => 'Scene not found'
                ], 404);
            }

            $items = $scene->items()->with(['node', 'edge'])->orderBy('z_index')->get();

            return response()->json([
                'success' => true,
                'data' => $items,
                'message' => 'Scene items retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve scene items: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Add a node to a scene (for card/document scenes)
     */
    public function addNodeToScene(Request $request, string $guid): JsonResponse
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
                'node_id' => 'required|exists:core_graph_nodes,id',
                'position' => 'nullable|array',
                'position.x' => 'nullable|numeric',
                'position.y' => 'nullable|numeric',
                'position.z' => 'nullable|numeric',
                'dimensions' => 'nullable|array',
                'dimensions.width' => 'nullable|numeric|min:0',
                'dimensions.height' => 'nullable|numeric|min:0',
                'style' => 'nullable|array',
                'meta' => 'nullable|array',
                'z_index' => 'integer'
            ]);

            $sceneItem = SceneItem::create([
                'scene_id' => $scene->id,
                'item_type' => 'node',
                'item_id' => $validated['node_id'],
                'position' => $validated['position'] ?? ['x' => 0, 'y' => 0, 'z' => 0],
                'dimensions' => $validated['dimensions'] ?? ['width' => 100, 'height' => 100],
                'style' => $validated['style'] ?? [],
                'meta' => $validated['meta'] ?? [],
                'z_index' => $validated['z_index'] ?? 0
            ]);

            return response()->json([
                'success' => true,
                'data' => $sceneItem->load('node'),
                'message' => 'Node added to scene successfully'
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
                'message' => 'Failed to add node to scene: ' . $e->getMessage()
            ], 500);
        }
    }
}
