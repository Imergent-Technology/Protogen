<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SceneItem;
use App\Models\Scene;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class SceneItemController extends Controller
{
    /**
     * Display a listing of scene items for a scene.
     */
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'scene_id' => 'required|exists:scenes,id',
        ]);

        $sceneItems = SceneItem::where('scene_id', $request->scene_id)
                              ->with(['node', 'edge'])
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
        $request->validate([
            'scene_id' => 'required|exists:scenes,id',
            'item_type' => 'required|string|in:node,edge,text,image,video,other',
            'item_id' => 'nullable|integer',
            'item_guid' => 'nullable|uuid',
            'position' => 'nullable|array',
            'position.x' => 'nullable|numeric',
            'position.y' => 'nullable|numeric',
            'position.z' => 'nullable|numeric',
            'dimensions' => 'nullable|array',
            'dimensions.width' => 'nullable|numeric|min:0',
            'dimensions.height' => 'nullable|numeric|min:0',
            'style' => 'nullable|array',
            'meta' => 'nullable|array',
            'is_visible' => 'boolean',
            'z_index' => 'integer'
        ]);

        $sceneItem = SceneItem::create([
            'scene_id' => $request->scene_id,
            'item_type' => $request->item_type,
            'item_id' => $request->item_id,
            'item_guid' => $request->item_guid,
            'position' => $request->position,
            'dimensions' => $request->dimensions,
            'style' => $request->style,
            'meta' => $request->meta,
            'is_visible' => $request->is_visible ?? true,
            'z_index' => $request->z_index ?? 0
        ]);

        $sceneItem->load(['node', 'edge']);

        return response()->json([
            'success' => true,
            'data' => $sceneItem,
            'message' => 'Scene item created successfully'
        ], 201);
    }

    /**
     * Display the specified scene item.
     */
    public function show(SceneItem $sceneItem): JsonResponse
    {
        $sceneItem->load(['scene', 'node', 'edge']);

        return response()->json([
            'success' => true,
            'data' => $sceneItem,
            'message' => 'Scene item retrieved successfully'
        ]);
    }

    /**
     * Update the specified scene item.
     */
    public function update(Request $request, SceneItem $sceneItem): JsonResponse
    {
        $request->validate([
            'position' => 'nullable|array',
            'position.x' => 'nullable|numeric',
            'position.y' => 'nullable|numeric',
            'position.z' => 'nullable|numeric',
            'dimensions' => 'nullable|array',
            'dimensions.width' => 'nullable|numeric|min:0',
            'dimensions.height' => 'nullable|numeric|min:0',
            'style' => 'nullable|array',
            'meta' => 'nullable|array',
            'is_visible' => 'boolean',
            'z_index' => 'integer'
        ]);

        $sceneItem->update($request->only([
            'position', 'dimensions', 'style', 'meta', 'is_visible', 'z_index'
        ]));

        $sceneItem->load(['node', 'edge']);

        return response()->json([
            'success' => true,
            'data' => $sceneItem,
            'message' => 'Scene item updated successfully'
        ]);
    }

    /**
     * Remove the specified scene item.
     */
    public function destroy(SceneItem $sceneItem): JsonResponse
    {
        $sceneItem->delete();

        return response()->json([
            'success' => true,
            'message' => 'Scene item deleted successfully'
        ]);
    }

    /**
     * Update the position of a scene item.
     */
    public function updatePosition(Request $request, SceneItem $sceneItem): JsonResponse
    {
        $request->validate([
            'x' => 'required|numeric',
            'y' => 'required|numeric',
            'z' => 'nullable|numeric'
        ]);

        $sceneItem->setPosition(
            $request->x,
            $request->y,
            $request->z ?? 0
        );

        return response()->json([
            'success' => true,
            'data' => $sceneItem,
            'message' => 'Scene item position updated successfully'
        ]);
    }

    /**
     * Update the dimensions of a scene item.
     */
    public function updateDimensions(Request $request, SceneItem $sceneItem): JsonResponse
    {
        $request->validate([
            'width' => 'required|numeric|min:0',
            'height' => 'required|numeric|min:0'
        ]);

        $sceneItem->setDimensions($request->width, $request->height);

        return response()->json([
            'success' => true,
            'data' => $sceneItem,
            'message' => 'Scene item dimensions updated successfully'
        ]);
    }

    /**
     * Get scene items by type.
     */
    public function getByType(Request $request): JsonResponse
    {
        $request->validate([
            'scene_id' => 'required|exists:scenes,id',
            'item_type' => 'required|string|in:node,edge,text,image,video,other'
        ]);

        $sceneItems = SceneItem::where('scene_id', $request->scene_id)
                              ->where('item_type', $request->item_type)
                              ->with(['node', 'edge'])
                              ->orderBy('z_index')
                              ->get();

        return response()->json([
            'success' => true,
            'data' => $sceneItems,
            'message' => 'Scene items retrieved successfully'
        ]);
    }
}