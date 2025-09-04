<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Snapshot;
use App\Models\Scene;
use App\Services\SnapshotBuilderService;
use App\Services\SnapshotManagementService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class SnapshotApiController extends Controller
{
    protected SnapshotBuilderService $snapshotBuilder;
    protected SnapshotManagementService $snapshotManagement;

    public function __construct(
        SnapshotBuilderService $snapshotBuilder,
        SnapshotManagementService $snapshotManagement
    ) {
        $this->snapshotBuilder = $snapshotBuilder;
        $this->snapshotManagement = $snapshotManagement;
    }

    /**
     * Get all snapshots
     */
    public function index(Request $request): JsonResponse
    {
        $query = Snapshot::with(['scene', 'creator']);

        // Filter by scene
        if ($request->has('scene_id')) {
            $query->where('scene_id', $request->scene_id);
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by compression type
        if ($request->has('compression')) {
            $query->where('compression_type', $request->compression);
        }

        // Search by name or description
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $snapshots = $query->orderBy('created_at', 'desc')->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $snapshots->items(),
            'pagination' => [
                'current_page' => $snapshots->currentPage(),
                'last_page' => $snapshots->lastPage(),
                'per_page' => $snapshots->perPage(),
                'total' => $snapshots->total(),
            ],
        ]);
    }

    /**
     * Get a specific snapshot
     */
    public function show(string $guid): JsonResponse
    {
        $snapshot = Snapshot::with(['scene', 'creator'])->where('guid', $guid)->first();

        if (!$snapshot) {
            return response()->json([
                'success' => false,
                'message' => 'Snapshot not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $snapshot,
        ]);
    }

    /**
     * Create a new snapshot for a scene
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'scene_id' => 'required|exists:scenes,id',
            'name' => 'nullable|string|max:255',
            'description' => 'nullable|string|max:1000',
            'version' => 'nullable|string|max:20',
            'compression' => 'nullable|in:brotli,gzip,none',
            'ttl' => 'nullable|integer|min:60|max:31536000', // 1 minute to 1 year
            'metadata' => 'nullable|array',
        ]);

        $scene = Scene::findOrFail($validated['scene_id']);

        try {
            $snapshot = $this->snapshotBuilder->buildSnapshot($scene, [
                'name' => $validated['name'] ?? null,
                'description' => $validated['description'] ?? null,
                'version' => $validated['version'] ?? null,
                'compression' => $validated['compression'] ?? null,
                'ttl' => $validated['ttl'] ?? null,
                'metadata' => $validated['metadata'] ?? [],
                'created_by' => auth()->id(),
            ]);

            return response()->json([
                'success' => true,
                'data' => $snapshot->load(['scene', 'creator']),
                'message' => 'Snapshot created successfully',
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create snapshot: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Publish a snapshot
     */
    public function publish(string $guid): JsonResponse
    {
        $snapshot = Snapshot::where('guid', $guid)->first();

        if (!$snapshot) {
            return response()->json([
                'success' => false,
                'message' => 'Snapshot not found',
            ], 404);
        }

        if ($snapshot->isPublished()) {
            return response()->json([
                'success' => false,
                'message' => 'Snapshot is already published',
            ], 400);
        }

        if (!$snapshot->hasValidContent()) {
            return response()->json([
                'success' => false,
                'message' => 'Snapshot has no valid content to publish',
            ], 400);
        }

        try {
            $success = $this->snapshotBuilder->publishSnapshot($snapshot);

            if ($success) {
                return response()->json([
                    'success' => true,
                    'data' => $snapshot->fresh()->load(['scene', 'creator']),
                    'message' => 'Snapshot published successfully',
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to publish snapshot',
                ], 500);
            }
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to publish snapshot: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Archive a snapshot
     */
    public function archive(string $guid): JsonResponse
    {
        $snapshot = Snapshot::where('guid', $guid)->first();

        if (!$snapshot) {
            return response()->json([
                'success' => false,
                'message' => 'Snapshot not found',
            ], 404);
        }

        if ($snapshot->isArchived()) {
            return response()->json([
                'success' => false,
                'message' => 'Snapshot is already archived',
            ], 400);
        }

        try {
            $success = $this->snapshotBuilder->archiveSnapshot($snapshot);

            if ($success) {
                return response()->json([
                    'success' => true,
                    'data' => $snapshot->fresh()->load(['scene', 'creator']),
                    'message' => 'Snapshot archived successfully',
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to archive snapshot',
                ], 500);
            }
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to archive snapshot: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get snapshot manifest
     */
    public function manifest(string $guid): JsonResponse
    {
        $snapshot = Snapshot::where('guid', $guid)->first();

        if (!$snapshot) {
            return response()->json([
                'success' => false,
                'message' => 'Snapshot not found',
            ], 404);
        }

        if (!$snapshot->isPublished()) {
            return response()->json([
                'success' => false,
                'message' => 'Snapshot is not published',
            ], 400);
        }

        $manifest = $snapshot->manifest;
        $manifest['locator']['url'] = $snapshot->getPublicUrl();

        return response()->json([
            'success' => true,
            'data' => $manifest,
        ]);
    }

    /**
     * Download snapshot content
     */
    public function download(string $guid): JsonResponse
    {
        $snapshot = Snapshot::where('guid', $guid)->first();

        if (!$snapshot) {
            return response()->json([
                'success' => false,
                'message' => 'Snapshot not found',
            ], 404);
        }

        if (!$snapshot->hasValidContent()) {
            return response()->json([
                'success' => false,
                'message' => 'Snapshot has no valid content',
            ], 400);
        }

        try {
            $content = Storage::disk('snapshots')->get($snapshot->storage_path);
            
            if ($content === false) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to read snapshot content',
                ], 500);
            }

            // Set appropriate headers for download
            $headers = [
                'Content-Type' => 'application/json',
                'Content-Disposition' => 'attachment; filename="' . $snapshot->slug . '.json"',
                'Content-Length' => strlen($content),
            ];

            // Add compression headers if applicable
            if ($snapshot->compression_type === 'brotli') {
                $headers['Content-Encoding'] = 'br';
            } elseif ($snapshot->compression_type === 'gzip') {
                $headers['Content-Encoding'] = 'gzip';
            }

            return response($content, 200, $headers);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to download snapshot: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get snapshot statistics
     */
    public function stats(): JsonResponse
    {
        $stats = [
            'total' => Snapshot::count(),
            'published' => Snapshot::published()->count(),
            'draft' => Snapshot::draft()->count(),
            'archived' => Snapshot::archived()->count(),
            'compression_types' => [
                'brotli' => Snapshot::where('compression_type', 'brotli')->count(),
                'gzip' => Snapshot::where('compression_type', 'gzip')->count(),
                'none' => Snapshot::where('compression_type', 'none')->count(),
            ],
            'total_size' => Snapshot::sum('file_size'),
            'average_size' => Snapshot::avg('file_size'),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }

    /**
     * Delete a snapshot
     */
    public function destroy(string $guid): JsonResponse
    {
        $snapshot = Snapshot::where('guid', $guid)->first();

        if (!$snapshot) {
            return response()->json([
                'success' => false,
                'message' => 'Snapshot not found',
            ], 404);
        }

        try {
            // Delete storage file if exists
            if ($snapshot->storage_path && Storage::disk('snapshots')->exists($snapshot->storage_path)) {
                Storage::disk('snapshots')->delete($snapshot->storage_path);
            }

            // Delete database record
            $snapshot->delete();

            return response()->json([
                'success' => true,
                'message' => 'Snapshot deleted successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete snapshot: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Apply retention policies
     */
    public function cleanup(Request $request): JsonResponse
    {
        $policies = [
            'keep_drafts_days' => $request->input('keep_drafts_days', 7),
            'keep_published_versions' => $request->input('keep_published_versions', 5),
            'archive_after_days' => $request->input('archive_after_days', 30),
            'delete_archived_after_days' => $request->input('delete_archived_after_days', 90),
        ];

        try {
            $results = $this->snapshotManagement->applyRetentionPolicies($policies);

            return response()->json([
                'success' => true,
                'message' => 'Retention policies applied successfully',
                'data' => $results,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to apply retention policies: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Rollback scene to snapshot
     */
    public function rollback(Request $request): JsonResponse
    {
        $request->validate([
            'scene_id' => 'required|exists:scenes,id',
            'snapshot_id' => 'required|exists:snapshots,id',
        ]);

        $scene = Scene::find($request->scene_id);
        $snapshot = Snapshot::find($request->snapshot_id);

        if ($snapshot->scene_id !== $scene->id) {
            return response()->json([
                'success' => false,
                'message' => 'Snapshot does not belong to the specified scene',
            ], 400);
        }

        if (!$snapshot->isPublished()) {
            return response()->json([
                'success' => false,
                'message' => 'Only published snapshots can be used for rollback',
            ], 400);
        }

        try {
            $success = $this->snapshotManagement->rollbackToSnapshot($scene, $snapshot);

            if ($success) {
                return response()->json([
                    'success' => true,
                    'message' => 'Scene rolled back successfully',
                    'data' => [
                        'scene_id' => $scene->id,
                        'snapshot_id' => $snapshot->id,
                    ],
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to rollback scene',
                ], 500);
            }
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to rollback scene: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Validate snapshot integrity
     */
    public function validate(string $guid): JsonResponse
    {
        $snapshot = Snapshot::where('guid', $guid)->first();

        if (!$snapshot) {
            return response()->json([
                'success' => false,
                'message' => 'Snapshot not found',
            ], 404);
        }

        try {
            $result = $this->snapshotManagement->validateSnapshotIntegrity($snapshot);

            return response()->json([
                'success' => true,
                'data' => $result,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to validate snapshot: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get detailed snapshot statistics
     */
    public function detailedStats(): JsonResponse
    {
        try {
            $stats = $this->snapshotManagement->getSnapshotStats();

            return response()->json([
                'success' => true,
                'data' => $stats,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get statistics: ' . $e->getMessage(),
            ], 500);
        }
    }
}
