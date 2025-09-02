<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RegistryCatalog;
use App\Services\RegistryValidationService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;

class RegistryApiController extends Controller
{
    protected RegistryValidationService $validationService;

    public function __construct(RegistryValidationService $validationService)
    {
        $this->validationService = $validationService;
    }

    /**
     * Get all registry entries.
     */
    public function index(Request $request): JsonResponse
    {
        $query = RegistryCatalog::query();

        // Filter by scope
        if ($request->has('scope')) {
            $query->where('scope', $request->scope);
        }

        // Filter by presentational keys only
        if ($request->boolean('presentational_only')) {
            $query->where('is_presentational', true);
        }

        // Filter by active status
        if ($request->has('active')) {
            $query->where('is_active', $request->boolean('active'));
        }

        // Search by key or description
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('key', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $entries = $query->orderBy('scope')->orderBy('key')->paginate(50);

        return response()->json([
            'success' => true,
            'data' => $entries->items(),
            'pagination' => [
                'current_page' => $entries->currentPage(),
                'last_page' => $entries->lastPage(),
                'per_page' => $entries->perPage(),
                'total' => $entries->total(),
            ],
        ]);
    }

    /**
     * Get registry entries for a specific scope.
     */
    public function getScope(string $scope): JsonResponse
    {
        $entries = RegistryCatalog::active()->ofScope($scope)->orderBy('key')->get();

        return response()->json([
            'success' => true,
            'data' => $entries,
            'scope' => $scope,
        ]);
    }

    /**
     * Get a specific registry entry.
     */
    public function show(string $scope, string $key): JsonResponse
    {
        $entry = RegistryCatalog::getEntry($scope, $key);

        if (!$entry) {
            return response()->json([
                'success' => false,
                'message' => 'Registry entry not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $entry,
        ]);
    }

    /**
     * Create a new registry entry.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'scope' => 'required|string|max:50',
            'key' => 'required|string|max:100',
            'type' => 'required|string|in:string,number,boolean,array,object',
            'description' => 'required|string|max:1000',
            'default_value' => 'nullable|json',
            'is_presentational' => 'boolean',
            'validation_rules' => 'nullable|json',
            'is_active' => 'boolean',
        ]);

        // Check if entry already exists
        $existing = RegistryCatalog::getEntry($validated['scope'], $validated['key']);
        if ($existing) {
            return response()->json([
                'success' => false,
                'message' => 'Registry entry already exists',
            ], 409);
        }

        // Parse JSON fields
        if (isset($validated['default_value'])) {
            $validated['default_value'] = json_decode($validated['default_value'], true);
        }
        if (isset($validated['validation_rules'])) {
            $validated['validation_rules'] = json_decode($validated['validation_rules'], true);
        }

        $entry = RegistryCatalog::create($validated);

        return response()->json([
            'success' => true,
            'data' => $entry,
            'message' => 'Registry entry created successfully',
        ], 201);
    }

    /**
     * Update a registry entry.
     */
    public function update(Request $request, string $scope, string $key): JsonResponse
    {
        $entry = RegistryCatalog::getEntry($scope, $key);

        if (!$entry) {
            return response()->json([
                'success' => false,
                'message' => 'Registry entry not found',
            ], 404);
        }

        $validated = $request->validate([
            'type' => 'sometimes|string|in:string,number,boolean,array,object',
            'description' => 'sometimes|string|max:1000',
            'default_value' => 'nullable|json',
            'is_presentational' => 'sometimes|boolean',
            'validation_rules' => 'nullable|json',
            'is_active' => 'sometimes|boolean',
        ]);

        // Parse JSON fields
        if (isset($validated['default_value'])) {
            $validated['default_value'] = json_decode($validated['default_value'], true);
        }
        if (isset($validated['validation_rules'])) {
            $validated['validation_rules'] = json_decode($validated['validation_rules'], true);
        }

        $entry->update($validated);

        return response()->json([
            'success' => true,
            'data' => $entry,
            'message' => 'Registry entry updated successfully',
        ]);
    }

    /**
     * Delete a registry entry.
     */
    public function destroy(string $scope, string $key): JsonResponse
    {
        $entry = RegistryCatalog::getEntry($scope, $key);

        if (!$entry) {
            return response()->json([
                'success' => false,
                'message' => 'Registry entry not found',
            ], 404);
        }

        // Soft delete by setting is_active to false
        $entry->update(['is_active' => false]);

        return response()->json([
            'success' => true,
            'message' => 'Registry entry deactivated successfully',
        ]);
    }

    /**
     * Validate metadata against registry rules.
     */
    public function validateMetadata(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'scope' => 'required|string',
            'metadata' => 'required|array',
            'strict' => 'boolean',
        ]);

        try {
            $result = $this->validationService->validateAndMerge(
                $validated['scope'],
                $validated['metadata'],
                $validated['strict'] ?? false
            );

            return response()->json([
                'success' => true,
                'data' => $result,
                'message' => 'Metadata validation successful',
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Metadata validation failed',
                'errors' => $e->errors(),
            ], 422);
        }
    }

    /**
     * Get metadata schema for a scope.
     */
    public function getSchema(string $scope): JsonResponse
    {
        $schema = $this->validationService->getScopeMetadata($scope);

        return response()->json([
            'success' => true,
            'data' => $schema,
            'scope' => $scope,
        ]);
    }

    /**
     * Get presentational keys for a scope.
     */
    public function getPresentationalKeys(string $scope): JsonResponse
    {
        $keys = $this->validationService->getPresentationalKeys($scope);

        return response()->json([
            'success' => true,
            'data' => $keys,
            'scope' => $scope,
        ]);
    }

    /**
     * Get default values for a scope.
     */
    public function getDefaults(string $scope): JsonResponse
    {
        $defaults = $this->validationService->getDefaultValues($scope);

        return response()->json([
            'success' => true,
            'data' => $defaults,
            'scope' => $scope,
        ]);
    }
}
