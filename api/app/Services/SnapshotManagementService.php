<?php

namespace App\Services;

use App\Models\Snapshot;
use App\Models\Scene;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class SnapshotManagementService
{
    /**
     * Apply retention policies to clean up old snapshots
     */
    public function applyRetentionPolicies(array $policies = []): array
    {
        $defaultPolicies = [
            'keep_drafts_days' => 7,
            'keep_published_versions' => 5,
            'archive_after_days' => 30,
            'delete_archived_after_days' => 90,
        ];
        
        $policies = array_merge($defaultPolicies, $policies);
        $results = [
            'drafts_cleaned' => 0,
            'versions_cleaned' => 0,
            'archived_cleaned' => 0,
            'deleted_cleaned' => 0,
        ];
        
        try {
            // Clean up old drafts
            $results['drafts_cleaned'] = $this->cleanupOldDrafts($policies['keep_drafts_days']);
            
            // Clean up excess published versions per scene
            $results['versions_cleaned'] = $this->cleanupExcessVersions($policies['keep_published_versions']);
            
            // Archive old published snapshots
            $results['archived_cleaned'] = $this->archiveOldSnapshots($policies['archive_after_days']);
            
            // Delete very old archived snapshots
            $results['deleted_cleaned'] = $this->deleteOldArchived($policies['delete_archived_after_days']);
            
        } catch (\Exception $e) {
            Log::error('Error applying retention policies', [
                'error' => $e->getMessage(),
                'policies' => $policies,
            ]);
        }
        
        return $results;
    }
    
    /**
     * Clean up old draft snapshots
     */
    protected function cleanupOldDrafts(int $keepDays): int
    {
        $cutoffDate = Carbon::now()->subDays($keepDays);
        
        $drafts = Snapshot::draft()
            ->where('created_at', '<', $cutoffDate)
            ->get();
            
        $deleted = 0;
        foreach ($drafts as $snapshot) {
            if ($this->deleteSnapshotFile($snapshot)) {
                $snapshot->delete();
                $deleted++;
            }
        }
        
        return $deleted;
    }
    
    /**
     * Clean up excess published versions per scene
     */
    protected function cleanupExcessVersions(int $keepVersions): int
    {
        $scenes = Scene::with(['snapshots' => function ($query) {
            $query->published()->orderBy('published_at', 'desc');
        }])->get();
        
        $deleted = 0;
        foreach ($scenes as $scene) {
            $snapshots = $scene->snapshots;
            if ($snapshots->count() > $keepVersions) {
                $toDelete = $snapshots->slice($keepVersions);
                foreach ($toDelete as $snapshot) {
                    if ($this->deleteSnapshotFile($snapshot)) {
                        $snapshot->delete();
                        $deleted++;
                    }
                }
            }
        }
        
        return $deleted;
    }
    
    /**
     * Archive old published snapshots
     */
    protected function archiveOldSnapshots(int $archiveAfterDays): int
    {
        $cutoffDate = Carbon::now()->subDays($archiveAfterDays);
        
        $snapshots = Snapshot::published()
            ->where('published_at', '<', $cutoffDate)
            ->get();
            
        $archived = 0;
        foreach ($snapshots as $snapshot) {
            $snapshot->archive();
            $archived++;
        }
        
        return $archived;
    }
    
    /**
     * Delete very old archived snapshots
     */
    protected function deleteOldArchived(int $deleteAfterDays): int
    {
        $cutoffDate = Carbon::now()->subDays($deleteAfterDays);
        
        $snapshots = Snapshot::archived()
            ->where('updated_at', '<', $cutoffDate)
            ->get();
            
        $deleted = 0;
        foreach ($snapshots as $snapshot) {
            if ($this->deleteSnapshotFile($snapshot)) {
                $snapshot->delete();
                $deleted++;
            }
        }
        
        return $deleted;
    }
    
    /**
     * Rollback a scene to a specific snapshot
     */
    public function rollbackToSnapshot(Scene $scene, Snapshot $snapshot): bool
    {
        if (!$snapshot->isPublished() || $snapshot->scene_id !== $scene->id) {
            return false;
        }
        
        try {
            // Load snapshot data
            $snapshotData = $this->loadSnapshotData($snapshot);
            if (!$snapshotData) {
                return false;
            }
            
            // Create a backup of current scene state
            $backupSnapshot = app(SnapshotBuilderService::class)->buildSnapshot($scene, [
                'name' => "Backup before rollback to {$snapshot->name}",
                'description' => "Auto-generated backup before rolling back to snapshot {$snapshot->guid}",
            ]);
            
            // Restore scene from snapshot data
            $this->restoreSceneFromSnapshot($scene, $snapshotData);
            
            Log::info('Scene rolled back to snapshot', [
                'scene_id' => $scene->id,
                'snapshot_id' => $snapshot->id,
                'backup_snapshot_id' => $backupSnapshot->id,
            ]);
            
            return true;
            
        } catch (\Exception $e) {
            Log::error('Failed to rollback scene to snapshot', [
                'scene_id' => $scene->id,
                'snapshot_id' => $snapshot->id,
                'error' => $e->getMessage(),
            ]);
            
            return false;
        }
    }
    
    /**
     * Load snapshot data from storage
     */
    protected function loadSnapshotData(Snapshot $snapshot): ?array
    {
        try {
            $content = Storage::disk('snapshots')->get($snapshot->storage_path);
            if (!$content) {
                return null;
            }
            
            // Handle compression
            if ($snapshot->compression_type === 'brotli' && function_exists('brotli_uncompress')) {
                $content = brotli_uncompress($content);
            } elseif ($snapshot->compression_type === 'gzip' && function_exists('gzdecode')) {
                $content = gzdecode($content);
            }
            
            return json_decode($content, true);
            
        } catch (\Exception $e) {
            Log::error('Failed to load snapshot data', [
                'snapshot_id' => $snapshot->id,
                'storage_path' => $snapshot->storage_path,
                'error' => $e->getMessage(),
            ]);
            
            return null;
        }
    }
    
    /**
     * Restore scene from snapshot data
     */
    protected function restoreSceneFromSnapshot(Scene $scene, array $snapshotData): void
    {
        $sceneData = $snapshotData['scene'] ?? [];
        
        // Update scene metadata
        if (isset($sceneData['theme'])) {
            $scene->style = $sceneData['theme'];
        }
        
        // Clear existing nodes and edges
        $scene->nodes()->delete();
        $scene->edges()->delete();
        
        // Restore nodes
        if (isset($sceneData['nodes'])) {
            foreach ($sceneData['nodes'] as $nodeData) {
                $scene->nodes()->create([
                    'guid' => $nodeData['id'],
                    'node_type' => $nodeData['type'],
                    'position_x' => $nodeData['position']['x'] ?? 0,
                    'position_y' => $nodeData['position']['y'] ?? 0,
                    'width' => $nodeData['dimensions']['width'] ?? 100,
                    'height' => $nodeData['dimensions']['height'] ?? 100,
                    'style' => $nodeData['style'] ?? [],
                    'meta' => $nodeData['meta'] ?? [],
                    'is_visible' => $nodeData['is_visible'] ?? true,
                    'is_locked' => $nodeData['is_locked'] ?? false,
                    'core_node_guid' => $nodeData['core_ref'] ?? null,
                ]);
            }
        }
        
        // Restore edges
        if (isset($sceneData['edges'])) {
            foreach ($sceneData['edges'] as $edgeData) {
                $sourceNode = $scene->nodes()->where('guid', $edgeData['source'])->first();
                $targetNode = $scene->nodes()->where('guid', $edgeData['target'])->first();
                
                if ($sourceNode && $targetNode) {
                    $scene->edges()->create([
                        'guid' => $edgeData['id'],
                        'edge_type' => $edgeData['type'],
                        'source_node_id' => $sourceNode->id,
                        'target_node_id' => $targetNode->id,
                        'path' => $edgeData['path'] ?? null,
                        'style' => $edgeData['style'] ?? [],
                        'meta' => $edgeData['meta'] ?? [],
                        'is_visible' => $edgeData['is_visible'] ?? true,
                        'is_locked' => $edgeData['is_locked'] ?? false,
                        'core_edge_guid' => $edgeData['core_ref'] ?? null,
                    ]);
                }
            }
        }
        
        $scene->touch(); // Update scene timestamp
    }
    
    /**
     * Delete snapshot file from storage
     */
    protected function deleteSnapshotFile(Snapshot $snapshot): bool
    {
        try {
            if ($snapshot->storage_path && Storage::disk('snapshots')->exists($snapshot->storage_path)) {
                Storage::disk('snapshots')->delete($snapshot->storage_path);
                return true;
            }
            return true; // File doesn't exist, consider it deleted
        } catch (\Exception $e) {
            Log::error('Failed to delete snapshot file', [
                'snapshot_id' => $snapshot->id,
                'storage_path' => $snapshot->storage_path,
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }
    
    /**
     * Get snapshot statistics
     */
    public function getSnapshotStats(): array
    {
        return [
            'total' => Snapshot::count(),
            'published' => Snapshot::published()->count(),
            'drafts' => Snapshot::draft()->count(),
            'archived' => Snapshot::archived()->count(),
            'total_size' => Snapshot::sum('file_size'),
            'average_size' => Snapshot::avg('file_size'),
            'oldest_published' => Snapshot::published()->oldest('published_at')->first()?->published_at,
            'newest_published' => Snapshot::published()->latest('published_at')->first()?->published_at,
        ];
    }
    
    /**
     * Validate snapshot integrity
     */
    public function validateSnapshotIntegrity(Snapshot $snapshot): array
    {
        $issues = [];
        
        // Check if file exists
        if (!$snapshot->storage_path || !Storage::disk('snapshots')->exists($snapshot->storage_path)) {
            $issues[] = 'Storage file missing';
        }
        
        // Check if content hash matches
        if ($snapshot->storage_path) {
            try {
                $content = Storage::disk('snapshots')->get($snapshot->storage_path);
                if ($content) {
                    // Handle compression
                    if ($snapshot->compression_type === 'brotli' && function_exists('brotli_uncompress')) {
                        $content = brotli_uncompress($content);
                    } elseif ($snapshot->compression_type === 'gzip' && function_exists('gzdecode')) {
                        $content = gzdecode($content);
                    }
                    
                    $data = json_decode($content, true);
                    if ($data && isset($data['integrity']['hash'])) {
                        $expectedHash = $data['integrity']['hash'];
                        if ($expectedHash !== $snapshot->content_hash) {
                            $issues[] = 'Content hash mismatch';
                        }
                    }
                }
            } catch (\Exception $e) {
                $issues[] = 'Failed to read storage file: ' . $e->getMessage();
            }
        }
        
        // Check if scene still exists
        if (!$snapshot->scene) {
            $issues[] = 'Referenced scene no longer exists';
        }
        
        return [
            'snapshot_id' => $snapshot->id,
            'is_valid' => empty($issues),
            'issues' => $issues,
        ];
    }
}
