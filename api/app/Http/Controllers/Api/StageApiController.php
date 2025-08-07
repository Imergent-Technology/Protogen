<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Stage;
use App\Models\StageLink;
use App\Services\StageManager;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class StageApiController extends Controller
{
    /**
     * Get all stages with optional filtering.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Stage::query();

        // Filter by type
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        // Filter by active status
        if ($request->has('active')) {
            $query->where('is_active', $request->boolean('active'));
        }

        // Search by name or description
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $stages = $query->orderBy('sort_order')
                       ->orderBy('created_at', 'desc')
                       ->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $stages->items(),
            'pagination' => [
                'current_page' => $stages->currentPage(),
                'last_page' => $stages->lastPage(),
                'per_page' => $stages->perPage(),
                'total' => $stages->total(),
            ],
        ]);
    }

    /**
     * Get a specific stage with its relationships.
     */
    public function show(Stage $stage): JsonResponse
    {
        $stage->load([
            'graphNodes',
            'graphEdges',
            'incomingLinks.sourceStage',
            'outgoingLinks.targetStage',
            'relatedStages'
        ]);

        return response()->json([
            'success' => true,
            'data' => $stage,
        ]);
    }

    /**
     * Create a new stage.
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:stages,slug',
            'description' => 'nullable|string',
            'type' => ['required', 'string', Rule::in(array_keys(StageManager::getAvailableTypes()))],
            'config' => 'nullable|array',
            'metadata' => 'nullable|array',
            'is_active' => 'boolean',
            'sort_order' => 'nullable|integer',
            'relationships' => 'nullable|array',
            'relationships.load_after' => 'nullable|array',
            'relationships.load_after.*' => 'exists:stages,id',
            'relationships.child_of' => 'nullable|array',
            'relationships.child_of.*' => 'exists:stages,id',
            'relationships.related_to' => 'nullable|array',
            'relationships.related_to.*' => 'exists:stages,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        // Generate slug if not provided
        if (empty($request->slug)) {
            $request->merge(['slug' => Str::slug($request->name)]);
        }

        // Validate stage configuration
        $configErrors = StageManager::validateConfig($request->type, $request->config ?? []);
        if (!empty($configErrors)) {
            return response()->json([
                'success' => false,
                'errors' => ['config' => $configErrors],
            ], 422);
        }

        // Create the stage
        $stage = Stage::create($request->only([
            'name', 'slug', 'description', 'type', 'config', 'metadata', 'is_active', 'sort_order'
        ]));

        // Create relationships if provided
        if ($request->has('relationships')) {
            $this->createStageRelationships($stage, $request->relationships);
        }

        $stage->load(['incomingLinks.sourceStage', 'outgoingLinks.targetStage']);

        return response()->json([
            'success' => true,
            'data' => $stage,
            'message' => 'Stage created successfully',
        ], 201);
    }

    /**
     * Update an existing stage.
     */
    public function update(Request $request, Stage $stage): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'slug' => [
                'sometimes', 'string', 'max:255',
                Rule::unique('stages', 'slug')->ignore($stage->id)
            ],
            'description' => 'nullable|string',
            'type' => ['sometimes', 'required', 'string', Rule::in(array_keys(StageManager::getAvailableTypes()))],
            'config' => 'nullable|array',
            'metadata' => 'nullable|array',
            'is_active' => 'boolean',
            'sort_order' => 'nullable|integer',
            'relationships' => 'nullable|array',
            'relationships.load_after' => 'nullable|array',
            'relationships.load_after.*' => 'exists:stages,id',
            'relationships.child_of' => 'nullable|array',
            'relationships.child_of.*' => 'exists:stages,id',
            'relationships.related_to' => 'nullable|array',
            'relationships.related_to.*' => 'exists:stages,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        // Validate stage configuration if type or config changed
        if ($request->has('type') || $request->has('config')) {
            $type = $request->type ?? $stage->type;
            $config = $request->config ?? $stage->config ?? [];
            $configErrors = StageManager::validateConfig($type, $config);
            
            if (!empty($configErrors)) {
                return response()->json([
                    'success' => false,
                    'errors' => ['config' => $configErrors],
                ], 422);
            }
        }

        // Update the stage
        $stage->update($request->only([
            'name', 'slug', 'description', 'type', 'config', 'metadata', 'is_active', 'sort_order'
        ]));

        // Update relationships if provided
        if ($request->has('relationships')) {
            $this->updateStageRelationships($stage, $request->relationships);
        }

        $stage->load(['incomingLinks.sourceStage', 'outgoingLinks.targetStage']);

        return response()->json([
            'success' => true,
            'data' => $stage,
            'message' => 'Stage updated successfully',
        ]);
    }

    /**
     * Delete a stage.
     */
    public function destroy(Stage $stage): JsonResponse
    {
        // Delete related stage links
        StageLink::where('source_stage_id', $stage->id)
                ->orWhere('target_stage_id', $stage->id)
                ->delete();

        $stage->delete();

        return response()->json([
            'success' => true,
            'message' => 'Stage deleted successfully',
        ]);
    }

    /**
     * Get stage relationships.
     */
    public function relationships(Stage $stage): JsonResponse
    {
        $relationships = [
            'load_after' => $stage->outgoingLinks()->where('type', 'load_after')->with('targetStage')->get(),
            'child_of' => $stage->outgoingLinks()->where('type', 'child_of')->with('targetStage')->get(),
            'related_to' => $stage->outgoingLinks()->where('type', 'related_to')->with('targetStage')->get(),
            'incoming' => $stage->incomingLinks()->with('sourceStage')->get(),
        ];

        return response()->json([
            'success' => true,
            'data' => $relationships,
        ]);
    }

    /**
     * Get available stage types.
     */
    public function types(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => StageManager::getAvailableTypes(),
        ]);
    }

    /**
     * Create stage relationships.
     */
    private function createStageRelationships(Stage $stage, array $relationships): void
    {
        $this->createRelationshipsByType($stage, $relationships, 'load_after');
        $this->createRelationshipsByType($stage, $relationships, 'child_of');
        $this->createRelationshipsByType($stage, $relationships, 'related_to');
    }

    /**
     * Update stage relationships.
     */
    private function updateStageRelationships(Stage $stage, array $relationships): void
    {
        // Delete existing relationships
        StageLink::where('source_stage_id', $stage->id)->delete();

        // Create new relationships
        $this->createStageRelationships($stage, $relationships);
    }

    /**
     * Create relationships of a specific type.
     */
    private function createRelationshipsByType(Stage $stage, array $relationships, string $type): void
    {
        if (isset($relationships[$type]) && is_array($relationships[$type])) {
            foreach ($relationships[$type] as $targetStageId) {
                StageLink::create([
                    'source_stage_id' => $stage->id,
                    'target_stage_id' => $targetStageId,
                    'type' => $type,
                    'label' => ucfirst(str_replace('_', ' ', $type)),
                    'is_active' => true,
                ]);
            }
        }
    }
} 