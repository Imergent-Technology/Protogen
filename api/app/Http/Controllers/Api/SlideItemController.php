<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SlideItem;
use App\Models\Slide;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class SlideItemController extends Controller
{
    /**
     * Get all slide items for a slide.
     */
    public function index(Request $request, string $slideId): JsonResponse
    {
        $slide = Slide::findOrFail($slideId);
        
        // Check permissions
        $this->authorize('view', $slide->scene);
        
        $slideItems = $slide->slideItems()
            ->with(['node'])
            ->get();
        
        return response()->json([
            'success' => true,
            'data' => $slideItems->map(function ($item) {
                return $item->getNodeState();
            }),
        ]);
    }

    /**
     * Create a new slide item.
     */
    public function store(Request $request, string $slideId): JsonResponse
    {
        $slide = Slide::findOrFail($slideId);
        
        // Check permissions
        $this->authorize('update', $slide->scene);
        
        $request->validate([
            'node_id' => 'required|string|exists:scene_items,id',
            'position' => 'nullable|array',
            'position.x' => 'required_with:position|numeric',
            'position.y' => 'required_with:position|numeric',
            'scale' => 'nullable|array',
            'scale.x' => 'required_with:scale|numeric',
            'scale.y' => 'required_with:scale|numeric',
            'rotation' => 'nullable|numeric',
            'opacity' => 'nullable|numeric|min:0|max:1',
            'visible' => 'nullable|boolean',
            'style' => 'nullable|array',
            'transition_config' => 'nullable|array',
        ]);
        
        // Check if slide item already exists for this node
        $existingItem = $slide->slideItems()
            ->where('node_id', $request->node_id)
            ->first();
        
        if ($existingItem) {
            return response()->json([
                'success' => false,
                'message' => 'Slide item already exists for this node',
            ], 409);
        }
        
        $slideItem = $slide->slideItems()->create([
            'node_id' => $request->node_id,
            'position' => $request->position ?? ['x' => 0, 'y' => 0],
            'scale' => $request->scale ?? ['x' => 1, 'y' => 1],
            'rotation' => $request->rotation ?? 0,
            'opacity' => $request->opacity ?? 1.0,
            'visible' => $request->visible ?? true,
            'style' => $request->style,
            'transition_config' => $request->transition_config,
        ]);
        
        return response()->json([
            'success' => true,
            'data' => $slideItem->getNodeState(),
            'message' => 'Slide item created successfully',
        ], 201);
    }

    /**
     * Get a specific slide item.
     */
    public function show(string $itemId): JsonResponse
    {
        $slideItem = SlideItem::with(['slide.scene', 'node'])
            ->findOrFail($itemId);
        
        // Check permissions
        $this->authorize('view', $slideItem->slide->scene);
        
        return response()->json([
            'success' => true,
            'data' => $slideItem->getNodeState(),
        ]);
    }

    /**
     * Update a slide item.
     */
    public function update(Request $request, string $itemId): JsonResponse
    {
        $slideItem = SlideItem::findOrFail($itemId);
        
        // Check permissions
        $this->authorize('update', $slideItem->slide->scene);
        
        $request->validate([
            'position' => 'nullable|array',
            'position.x' => 'required_with:position|numeric',
            'position.y' => 'required_with:position|numeric',
            'scale' => 'nullable|array',
            'scale.x' => 'required_with:scale|numeric',
            'scale.y' => 'required_with:scale|numeric',
            'rotation' => 'nullable|numeric',
            'opacity' => 'nullable|numeric|min:0|max:1',
            'visible' => 'nullable|boolean',
            'style' => 'nullable|array',
            'transition_config' => 'nullable|array',
        ]);
        
        $slideItem->update($request->only([
            'position',
            'scale',
            'rotation',
            'opacity',
            'visible',
            'style',
            'transition_config',
        ]));
        
        return response()->json([
            'success' => true,
            'data' => $slideItem->getNodeState(),
            'message' => 'Slide item updated successfully',
        ]);
    }

    /**
     * Delete a slide item.
     */
    public function destroy(string $itemId): JsonResponse
    {
        $slideItem = SlideItem::findOrFail($itemId);
        
        // Check permissions
        $this->authorize('update', $slideItem->slide->scene);
        
        $slideItem->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Slide item deleted successfully',
        ]);
    }

    /**
     * Apply slide item state to the scene item.
     */
    public function applyToScene(Request $request, string $itemId): JsonResponse
    {
        $slideItem = SlideItem::with(['node'])->findOrFail($itemId);
        
        // Check permissions
        $this->authorize('update', $slideItem->slide->scene);
        
        $sceneItem = $slideItem->node;
        $slideItem->applyToSceneItem($sceneItem);
        
        return response()->json([
            'success' => true,
            'data' => [
                'slideItem' => $slideItem->getNodeState(),
                'sceneItem' => $sceneItem->toArray(),
            ],
            'message' => 'Slide item state applied to scene item successfully',
        ]);
    }

    /**
     * Create slide item from scene item state.
     */
    public function createFromScene(Request $request, string $slideId, string $nodeId): JsonResponse
    {
        $slide = Slide::findOrFail($slideId);
        $sceneItem = $slide->scene->sceneItems()->findOrFail($nodeId);
        
        // Check permissions
        $this->authorize('update', $slide->scene);
        
        // Check if slide item already exists
        $existingItem = $slide->slideItems()
            ->where('node_id', $nodeId)
            ->first();
        
        if ($existingItem) {
            return response()->json([
                'success' => false,
                'message' => 'Slide item already exists for this node',
            ], 409);
        }
        
        $slideItem = SlideItem::createFromSceneItem($slide, $sceneItem);
        
        return response()->json([
            'success' => true,
            'data' => $slideItem->getNodeState(),
            'message' => 'Slide item created from scene item successfully',
        ], 201);
    }

    /**
     * Bulk update slide items.
     */
    public function bulkUpdate(Request $request, string $slideId): JsonResponse
    {
        $slide = Slide::findOrFail($slideId);
        
        // Check permissions
        $this->authorize('update', $slide->scene);
        
        $request->validate([
            'items' => 'required|array',
            'items.*.id' => 'required|string|exists:slide_items,id',
            'items.*.position' => 'nullable|array',
            'items.*.scale' => 'nullable|array',
            'items.*.rotation' => 'nullable|numeric',
            'items.*.opacity' => 'nullable|numeric|min:0|max:1',
            'items.*.visible' => 'nullable|boolean',
            'items.*.style' => 'nullable|array',
        ]);
        
        DB::beginTransaction();
        
        try {
            foreach ($request->items as $itemData) {
                $slideItem = SlideItem::findOrFail($itemData['id']);
                
                // Verify the slide item belongs to the slide
                if ($slideItem->slide_id !== $slide->id) {
                    throw new \Exception('Slide item does not belong to the specified slide');
                }
                
                $slideItem->update(array_filter($itemData, function ($key) {
                    return $key !== 'id';
                }, ARRAY_FILTER_USE_KEY));
            }
            
            DB::commit();
            
            return response()->json([
                'success' => true,
                'message' => 'Slide items updated successfully',
            ]);
            
        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to update slide items',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
