<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Context;
use App\Models\Scene;
use App\Models\Deck;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\Rule;

class ContextApiController extends Controller
{
    /**
     * Get all contexts with optional filtering
     */
    public function index(Request $request): JsonResponse
    {
        $query = Context::with(['targetScene', 'targetDeck', 'creator']);

        // Apply filters
        if ($request->has('type')) {
            $query->ofType($request->type);
        }

        if ($request->has('scene_id')) {
            $query->forScene($request->scene_id);
        }

        if ($request->has('deck_id')) {
            $query->forDeck($request->deck_id);
        }

        if ($request->has('active')) {
            $query->active();
        }

        if ($request->has('public')) {
            $query->public();
        }

        $contexts = $query->orderBy('created_at', 'desc')->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $contexts,
            'message' => 'Contexts retrieved successfully'
        ]);
    }

    /**
     * Get a specific context by GUID
     */
    public function show(string $guid): JsonResponse
    {
        $context = Context::with(['targetScene', 'targetDeck', 'creator'])
            ->where('guid', $guid)
            ->first();

        if (!$context) {
            return response()->json([
                'success' => false,
                'message' => 'Context not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $context,
            'message' => 'Context retrieved successfully'
        ]);
    }

    /**
     * Create a new context
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:contexts,slug',
            'description' => 'nullable|string',
            'context_type' => ['required', Rule::in(['scene', 'deck', 'document', 'coordinate'])],
            'target_scene_id' => 'nullable|exists:scenes,id',
            'target_deck_id' => 'nullable|exists:decks,id',
            'coordinates' => 'nullable|array',
            'anchor_data' => 'nullable|array',
            'meta' => 'nullable|array',
            'is_active' => 'boolean',
            'is_public' => 'boolean',
        ]);

        // Validate context type constraints
        if ($validated['context_type'] === 'scene' && !isset($validated['target_scene_id'])) {
            return response()->json([
                'success' => false,
                'message' => 'Scene context must have a target scene ID'
            ], 422);
        }

        if ($validated['context_type'] === 'deck' && !isset($validated['target_deck_id'])) {
            return response()->json([
                'success' => false,
                'message' => 'Deck context must have a target deck ID'
            ], 422);
        }

        // Set creator
        $validated['created_by'] = auth()->id();

        $context = Context::create($validated);

        // Validate coordinates
        if (!$context->validateCoordinates()) {
            $context->delete();
            return response()->json([
                'success' => false,
                'message' => 'Invalid coordinates for context type'
            ], 422);
        }

        return response()->json([
            'success' => true,
            'data' => $context->load(['targetScene', 'targetDeck', 'creator']),
            'message' => 'Context created successfully'
        ], 201);
    }

    /**
     * Update an existing context
     */
    public function update(Request $request, string $guid): JsonResponse
    {
        $context = Context::where('guid', $guid)->first();

        if (!$context) {
            return response()->json([
                'success' => false,
                'message' => 'Context not found'
            ], 404);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'slug' => ['sometimes', 'string', 'max:255', Rule::unique('contexts', 'slug')->ignore($context->id)],
            'description' => 'nullable|string',
            'context_type' => ['sometimes', Rule::in(['scene', 'deck', 'document', 'coordinate'])],
            'target_scene_id' => 'nullable|exists:scenes,id',
            'target_deck_id' => 'nullable|exists:decks,id',
            'coordinates' => 'nullable|array',
            'anchor_data' => 'nullable|array',
            'meta' => 'nullable|array',
            'is_active' => 'boolean',
            'is_public' => 'boolean',
        ]);

        // Validate context type constraints
        if (isset($validated['context_type'])) {
            if ($validated['context_type'] === 'scene' && !isset($validated['target_scene_id'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Scene context must have a target scene ID'
                ], 422);
            }

            if ($validated['context_type'] === 'deck' && !isset($validated['target_deck_id'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Deck context must have a target deck ID'
                ], 422);
            }
        }

        $context->update($validated);

        // Validate coordinates after update
        if (!$context->validateCoordinates()) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid coordinates for context type'
            ], 422);
        }

        return response()->json([
            'success' => true,
            'data' => $context->load(['targetScene', 'targetDeck', 'creator']),
            'message' => 'Context updated successfully'
        ]);
    }

    /**
     * Delete a context
     */
    public function destroy(string $guid): JsonResponse
    {
        $context = Context::where('guid', $guid)->first();

        if (!$context) {
            return response()->json([
                'success' => false,
                'message' => 'Context not found'
            ], 404);
        }

        $context->delete();

        return response()->json([
            'success' => true,
            'message' => 'Context deleted successfully'
        ]);
    }

    /**
     * Resolve a context to its target coordinates
     */
    public function resolve(string $guid): JsonResponse
    {
        $context = Context::where('guid', $guid)->first();

        if (!$context) {
            return response()->json([
                'success' => false,
                'message' => 'Context not found'
            ], 404);
        }

        $resolved = $context->resolveTarget();

        if (!$resolved) {
            return response()->json([
                'success' => false,
                'message' => 'Context could not be resolved'
            ], 422);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'context' => $context,
                'resolved' => $resolved
            ],
            'message' => 'Context resolved successfully'
        ]);
    }

    /**
     * Get contexts for a specific scene
     */
    public function forScene(string $sceneSlug): JsonResponse
    {
        $scene = Scene::where('slug', $sceneSlug)->first();

        if (!$scene) {
            return response()->json([
                'success' => false,
                'message' => 'Scene not found'
            ], 404);
        }

        $contexts = Context::with(['creator'])
            ->forScene($scene->id)
            ->active()
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $contexts,
            'message' => 'Scene contexts retrieved successfully'
        ]);
    }

    /**
     * Get contexts for a specific deck
     */
    public function forDeck(string $deckSlug): JsonResponse
    {
        $deck = Deck::where('slug', $deckSlug)->first();

        if (!$deck) {
            return response()->json([
                'success' => false,
                'message' => 'Deck not found'
            ], 404);
        }

        $contexts = Context::with(['creator'])
            ->forDeck($deck->id)
            ->active()
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $contexts,
            'message' => 'Deck contexts retrieved successfully'
        ]);
    }

    /**
     * Get context statistics
     */
    public function stats(): JsonResponse
    {
        $stats = [
            'total' => Context::count(),
            'active' => Context::active()->count(),
            'public' => Context::public()->count(),
            'by_type' => [
                'scene' => Context::ofType('scene')->count(),
                'deck' => Context::ofType('deck')->count(),
                'document' => Context::ofType('document')->count(),
                'coordinate' => Context::ofType('coordinate')->count(),
            ],
            'recent' => Context::with(['creator'])
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get()
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
            'message' => 'Context statistics retrieved successfully'
        ]);
    }
}
