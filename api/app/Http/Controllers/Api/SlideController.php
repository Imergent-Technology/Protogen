<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Slide;
use App\Models\Scene;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class SlideController extends Controller
{
    /**
     * Get all slides for a scene.
     */
    public function index(Request $request, string $sceneId): JsonResponse
    {
        $scene = Scene::findOrFail($sceneId);
        
        // Check permissions - temporarily disabled for testing
        // $this->authorize('view', $scene);
        
        $slides = $scene->slides()
            ->with(['slideItems'])
            ->ordered()
            ->get();
        
        return response()->json([
            'success' => true,
            'data' => $slides->map(function ($slide) {
                return $slide->getSlideState();
            }),
        ]);
    }

    /**
     * Create a new slide.
     */
    public function store(Request $request, string $sceneId): JsonResponse
    {
        $scene = Scene::with('items')->findOrFail($sceneId);
        
        // Check permissions
        // $this->authorize('update', $scene);
        
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'slide_index' => 'nullable|integer|min:0',
            'transition_config' => 'nullable|array',
        ]);
        
        DB::beginTransaction();
        
        try {
            // Get the next slide index if not provided
            $slideIndex = $request->slide_index ?? $scene->slides()->max('slide_index') + 1;
            
            // Create the slide
            $slide = $scene->slides()->create([
                'name' => $request->name,
                'description' => $request->description,
                'slide_index' => $slideIndex,
                'is_active' => $scene->slides()->count() === 0, // First slide is active
                'transition_config' => $request->transition_config,
            ]);
            
            // Create slide items for all scene items if this is the first slide
            if ($scene->slides()->count() === 1) {
                foreach ($scene->items as $sceneItem) {
                    \App\Models\SlideItem::createFromSceneItem($slide, $sceneItem);
                }
            }
            
            DB::commit();
            
            return response()->json([
                'success' => true,
                'data' => $slide->getSlideState(),
                'message' => 'Slide created successfully',
            ], 201);
            
        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to create slide',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get a specific slide.
     */
    public function show(string $slideId): JsonResponse
    {
        $slide = Slide::with(['slideItems.node', 'scene'])
            ->findOrFail($slideId);
        
        // Check permissions
        // $this->authorize('view', $slide->scene);
        
        return response()->json([
            'success' => true,
            'data' => $slide->getSlideState(),
        ]);
    }

    /**
     * Update a slide.
     */
    public function update(Request $request, string $slideId): JsonResponse
    {
        $slide = Slide::findOrFail($slideId);
        
        // Check permissions
        $this->authorize('update', $slide->scene);
        
        $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'slide_index' => 'sometimes|integer|min:0',
            'is_active' => 'sometimes|boolean',
            'transition_config' => 'nullable|array',
        ]);
        
        $slide->update($request->only([
            'name',
            'description', 
            'slide_index',
            'is_active',
            'transition_config',
        ]));
        
        return response()->json([
            'success' => true,
            'data' => $slide->getSlideState(),
            'message' => 'Slide updated successfully',
        ]);
    }

    /**
     * Delete a slide.
     */
    public function destroy(string $slideId): JsonResponse
    {
        $slide = Slide::findOrFail($slideId);
        
        // Check permissions
        $this->authorize('update', $slide->scene);
        
        DB::beginTransaction();
        
        try {
            // Don't allow deleting the last slide
            if ($slide->scene->slides()->count() <= 1) {
                throw new \Exception('Cannot delete the last slide in a scene');
            }
            
            $slide->delete();
            
            // If this was the active slide, activate the first remaining slide
            if ($slide->is_active) {
                $slide->scene->slides()
                    ->ordered()
                    ->first()
                    ->update(['is_active' => true]);
            }
            
            DB::commit();
            
            return response()->json([
                'success' => true,
                'message' => 'Slide deleted successfully',
            ]);
            
        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete slide',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Reorder slides.
     */
    public function reorder(Request $request, string $sceneId): JsonResponse
    {
        $scene = Scene::findOrFail($sceneId);
        
        // Check permissions
        // $this->authorize('update', $scene);
        
        $request->validate([
            'slide_order' => 'required|array',
            'slide_order.*' => 'required|string|exists:slides,id',
        ]);
        
        DB::beginTransaction();
        
        try {
            foreach ($request->slide_order as $index => $slideId) {
                Slide::where('id', $slideId)
                    ->where('scene_id', $sceneId)
                    ->update(['slide_index' => $index]);
            }
            
            DB::commit();
            
            return response()->json([
                'success' => true,
                'message' => 'Slides reordered successfully',
            ]);
            
        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to reorder slides',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Activate a slide.
     */
    public function activate(string $slideId): JsonResponse
    {
        $slide = Slide::findOrFail($slideId);
        
        // Check permissions
        $this->authorize('update', $slide->scene);
        
        DB::beginTransaction();
        
        try {
            // Deactivate all other slides in the scene
            $slide->scene->slides()->update(['is_active' => false]);
            
            // Activate the selected slide
            $slide->update(['is_active' => true]);
            
            DB::commit();
            
            return response()->json([
                'success' => true,
                'data' => $slide->getSlideState(),
                'message' => 'Slide activated successfully',
            ]);
            
        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to activate slide',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Clone a slide.
     */
    public function clone(Request $request, string $slideId): JsonResponse
    {
        $slide = Slide::with(['slideItems'])->findOrFail($slideId);
        
        // Check permissions
        $this->authorize('update', $slide->scene);
        
        $request->validate([
            'name' => 'sometimes|string|max:255',
        ]);
        
        DB::beginTransaction();
        
        try {
            $newSlide = $slide->replicate([
                'name' => $request->name ?? $slide->name . ' (Copy)',
                'slide_index' => $slide->scene->slides()->max('slide_index') + 1,
                'is_active' => false,
            ]);
            $newSlide->save();
            
            // Clone all slide items
            foreach ($slide->slideItems as $slideItem) {
                $slideItem->cloneForSlide($newSlide);
            }
            
            DB::commit();
            
            return response()->json([
                'success' => true,
                'data' => $newSlide->getSlideState(),
                'message' => 'Slide cloned successfully',
            ], 201);
            
        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to clone slide',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
