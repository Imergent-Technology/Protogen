<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SceneItem;
use App\Models\Scene;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;

class SceneItemController extends Controller
{
    /**
     * Display a listing of scene items for a scene.
     */
    public function index(Request $request, string $sceneId): JsonResponse
    {
        $scene = Scene::findOrFail($sceneId);
        
        // Check permissions - temporarily disabled for testing
        // $this->authorize('view', $scene);
        
        $sceneItems = $scene->items()
            ->with(['slide'])
            ->orderBy('z_index')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $sceneItems,
            'message' => 'Scene items retrieved successfully'
        ]);
    }

    /**
     * Store a newly created scene item.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'scene_id' => 'required|exists:scenes,id',
                'slide_id' => 'nullable|exists:slides,id',
                'item_type' => 'required|string|max:255',
                'item_id' => 'nullable|integer',
                'item_guid' => 'nullable|string|max:255',
                'position' => 'required|array',
                'position.x' => 'required|numeric',
                'position.y' => 'required|numeric',
                'position.z' => 'nullable|numeric',
                'dimensions' => 'required|array',
                'dimensions.width' => 'required|numeric|min:1',
                'dimensions.height' => 'required|numeric|min:1',
                'style' => 'nullable|array',
                'meta' => 'nullable|array',
                'is_visible' => 'boolean',
                'z_index' => 'integer|min:0',
            ]);

            $sceneItem = SceneItem::create($validated);

            return response()->json([
                'success' => true,
                'data' => $sceneItem->load(['scene', 'slide']),
                'message' => 'Scene item created successfully'
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
                'message' => 'Failed to create scene item: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified scene item.
     */
    public function show(string $id): JsonResponse
    {
        $sceneItem = SceneItem::with(['scene', 'slide'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $sceneItem,
            'message' => 'Scene item retrieved successfully'
        ]);
    }

    /**
     * Update the specified scene item.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        try {
            $sceneItem = SceneItem::findOrFail($id);

            $validated = $request->validate([
                'slide_id' => 'nullable|exists:slides,id',
                'item_type' => 'sometimes|string|max:255',
                'item_id' => 'nullable|integer',
                'item_guid' => 'nullable|string|max:255',
                'position' => 'sometimes|array',
                'position.x' => 'required_with:position|numeric',
                'position.y' => 'required_with:position|numeric',
                'position.z' => 'nullable|numeric',
                'dimensions' => 'sometimes|array',
                'dimensions.width' => 'required_with:dimensions|numeric|min:1',
                'dimensions.height' => 'required_with:dimensions|numeric|min:1',
                'style' => 'nullable|array',
                'meta' => 'nullable|array',
                'is_visible' => 'boolean',
                'z_index' => 'integer|min:0',
            ]);

            $sceneItem->update($validated);

            return response()->json([
                'success' => true,
                'data' => $sceneItem->load(['scene', 'slide']),
                'message' => 'Scene item updated successfully'
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
                'message' => 'Failed to update scene item: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified scene item.
     */
    public function destroy(string $id): JsonResponse
    {
        try {
            $sceneItem = SceneItem::findOrFail($id);
            $sceneItem->delete();

            return response()->json([
                'success' => true,
                'message' => 'Scene item deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete scene item: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update multiple scene items at once (for drag and drop, etc.).
     */
    public function bulkUpdate(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'items' => 'required|array',
                'items.*.id' => 'required|exists:scene_items,id',
                'items.*.position' => 'sometimes|array',
                'items.*.dimensions' => 'sometimes|array',
                'items.*.style' => 'nullable|array',
                'items.*.is_visible' => 'boolean',
                'items.*.z_index' => 'integer|min:0',
            ]);

            $updatedItems = [];
            foreach ($validated['items'] as $itemData) {
                $sceneItem = SceneItem::findOrFail($itemData['id']);
                $sceneItem->update(array_filter($itemData, function($key) {
                    return $key !== 'id';
                }, ARRAY_FILTER_USE_KEY));
                $updatedItems[] = $sceneItem->load(['scene', 'slide']);
            }

            return response()->json([
                'success' => true,
                'data' => $updatedItems,
                'message' => 'Scene items updated successfully'
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
                'message' => 'Failed to update scene items: ' . $e->getMessage()
            ], 500);
        }
    }
}