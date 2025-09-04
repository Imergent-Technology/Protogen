<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Deck;
use App\Models\Scene;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\Rule;

class DeckApiController extends Controller
{
    /**
     * Get all decks with optional filtering
     */
    public function index(Request $request): JsonResponse
    {
        $query = Deck::with(['creator', 'scenes']);

        // Apply filters
        if ($request->has('type')) {
            $query->ofType($request->type);
        }

        if ($request->has('active')) {
            $query->active();
        }

        if ($request->has('public')) {
            $query->public();
        }

        if ($request->has('creator_id')) {
            $query->forCreator($request->creator_id);
        }

        $decks = $query->orderBy('created_at', 'desc')->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $decks,
            'message' => 'Decks retrieved successfully'
        ]);
    }

    /**
     * Get a specific deck by GUID
     */
    public function show(string $guid): JsonResponse
    {
        $deck = Deck::with(['creator', 'scenes', 'contexts'])
            ->where('guid', $guid)
            ->first();

        if (!$deck) {
            return response()->json([
                'success' => false,
                'message' => 'Deck not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $deck,
            'message' => 'Deck retrieved successfully'
        ]);
    }

    /**
     * Create a new deck
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:decks,slug',
            'description' => 'nullable|string',
            'type' => ['required', Rule::in(['graph', 'card', 'document', 'dashboard'])],
            'scene_ids' => 'nullable|array',
            'scene_ids.*' => 'string|exists:scenes,guid',
            'navigation' => 'nullable|array',
            'performance' => 'nullable|array',
            'meta' => 'nullable|array',
            'is_active' => 'boolean',
            'is_public' => 'boolean',
        ]);

        // Set creator
        $validated['created_by'] = auth()->id();

        // Convert scene GUIDs to IDs if provided
        if (isset($validated['scene_ids'])) {
            $sceneIds = Scene::whereIn('guid', $validated['scene_ids'])->pluck('id')->toArray();
            $validated['scene_ids'] = $sceneIds;
        }

        $deck = Deck::create($validated);

        // Attach scenes to pivot table
        if (isset($validated['scene_ids'])) {
            $sceneData = [];
            foreach ($validated['scene_ids'] as $index => $sceneId) {
                $sceneData[$sceneId] = ['order' => $index + 1];
            }
            $deck->scenes()->attach($sceneData);
        }

        return response()->json([
            'success' => true,
            'data' => $deck->load(['creator', 'scenes']),
            'message' => 'Deck created successfully'
        ], 201);
    }

    /**
     * Update an existing deck
     */
    public function update(Request $request, string $guid): JsonResponse
    {
        $deck = Deck::where('guid', $guid)->first();

        if (!$deck) {
            return response()->json([
                'success' => false,
                'message' => 'Deck not found'
            ], 404);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'slug' => ['sometimes', 'string', 'max:255', Rule::unique('decks', 'slug')->ignore($deck->id)],
            'description' => 'nullable|string',
            'type' => ['sometimes', Rule::in(['graph', 'card', 'document', 'dashboard'])],
            'scene_ids' => 'nullable|array',
            'scene_ids.*' => 'string|exists:scenes,guid',
            'navigation' => 'nullable|array',
            'performance' => 'nullable|array',
            'meta' => 'nullable|array',
            'is_active' => 'boolean',
            'is_public' => 'boolean',
        ]);

        // Convert scene GUIDs to IDs if provided
        if (isset($validated['scene_ids'])) {
            $sceneIds = Scene::whereIn('guid', $validated['scene_ids'])->pluck('id')->toArray();
            $validated['scene_ids'] = $sceneIds;
        }

        $deck->update($validated);

        // Update scene relationships if scene_ids changed
        if (isset($validated['scene_ids'])) {
            $deck->scenes()->detach();
            $sceneData = [];
            foreach ($validated['scene_ids'] as $index => $sceneId) {
                $sceneData[$sceneId] = ['order' => $index + 1];
            }
            $deck->scenes()->attach($sceneData);
        }

        return response()->json([
            'success' => true,
            'data' => $deck->load(['creator', 'scenes']),
            'message' => 'Deck updated successfully'
        ]);
    }

    /**
     * Delete a deck
     */
    public function destroy(string $guid): JsonResponse
    {
        $deck = Deck::where('guid', $guid)->first();

        if (!$deck) {
            return response()->json([
                'success' => false,
                'message' => 'Deck not found'
            ], 404);
        }

        // Detach scenes before deleting
        $deck->scenes()->detach();
        $deck->delete();

        return response()->json([
            'success' => true,
            'message' => 'Deck deleted successfully'
        ]);
    }

    /**
     * Add a scene to a deck
     */
    public function addScene(Request $request, string $guid): JsonResponse
    {
        $deck = Deck::where('guid', $guid)->first();

        if (!$deck) {
            return response()->json([
                'success' => false,
                'message' => 'Deck not found'
            ], 404);
        }

        $validated = $request->validate([
            'scene_guid' => 'required|string|exists:scenes,guid',
            'order' => 'nullable|integer|min:1',
            'metadata' => 'nullable|array',
        ]);

        $scene = Scene::where('guid', $validated['scene_guid'])->first();
        
        if (!$scene) {
            return response()->json([
                'success' => false,
                'message' => 'Scene not found'
            ], 404);
        }

        $deck->addScene($scene->id, $validated['order'] ?? null, $validated['metadata'] ?? []);

        return response()->json([
            'success' => true,
            'data' => $deck->load(['creator', 'scenes']),
            'message' => 'Scene added to deck successfully'
        ]);
    }

    /**
     * Remove a scene from a deck
     */
    public function removeScene(Request $request, string $guid): JsonResponse
    {
        $deck = Deck::where('guid', $guid)->first();

        if (!$deck) {
            return response()->json([
                'success' => false,
                'message' => 'Deck not found'
            ], 404);
        }

        $validated = $request->validate([
            'scene_guid' => 'required|string|exists:scenes,guid',
        ]);

        $scene = Scene::where('guid', $validated['scene_guid'])->first();
        
        if (!$scene) {
            return response()->json([
                'success' => false,
                'message' => 'Scene not found'
            ], 404);
        }

        $deck->removeScene($scene->id);

        return response()->json([
            'success' => true,
            'data' => $deck->load(['creator', 'scenes']),
            'message' => 'Scene removed from deck successfully'
        ]);
    }

    /**
     * Reorder scenes in a deck
     */
    public function reorderScenes(Request $request, string $guid): JsonResponse
    {
        $deck = Deck::where('guid', $guid)->first();

        if (!$deck) {
            return response()->json([
                'success' => false,
                'message' => 'Deck not found'
            ], 404);
        }

        $validated = $request->validate([
            'scene_guids' => 'required|array',
            'scene_guids.*' => 'string|exists:scenes,guid',
        ]);

        $sceneIds = Scene::whereIn('guid', $validated['scene_guids'])->pluck('id')->toArray();
        
        if (count($sceneIds) !== count($validated['scene_guids'])) {
            return response()->json([
                'success' => false,
                'message' => 'Some scenes not found'
            ], 404);
        }

        $deck->reorderScenes($sceneIds);

        // Update pivot table order
        $deck->scenes()->detach();
        $sceneData = [];
        foreach ($sceneIds as $index => $sceneId) {
            $sceneData[$sceneId] = ['order' => $index + 1];
        }
        $deck->scenes()->attach($sceneData);

        return response()->json([
            'success' => true,
            'data' => $deck->load(['creator', 'scenes']),
            'message' => 'Deck scenes reordered successfully'
        ]);
    }

    /**
     * Get deck statistics
     */
    public function stats(): JsonResponse
    {
        $stats = [
            'total' => Deck::count(),
            'active' => Deck::active()->count(),
            'public' => Deck::public()->count(),
            'by_type' => [
                'graph' => Deck::ofType('graph')->count(),
                'card' => Deck::ofType('card')->count(),
                'document' => Deck::ofType('document')->count(),
                'dashboard' => Deck::ofType('dashboard')->count(),
            ],
            'recent' => Deck::with(['creator'])
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get()
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
            'message' => 'Deck statistics retrieved successfully'
        ]);
    }
}
