<?php

namespace App\Services;

use App\Models\Scene;
use App\Models\Snapshot;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class SnapshotBuilderService
{
    /**
     * Build a snapshot for a scene
     */
    public function buildSnapshot(Scene $scene, array $options = []): Snapshot
    {
        // Generate snapshot data
        $snapshotData = $this->buildSnapshotData($scene, $options);
        
        // Create content hash
        $contentHash = $this->generateContentHash($snapshotData);
        
        // Check if snapshot already exists with this content
        $existingSnapshot = Snapshot::where('scene_id', $scene->id)
            ->where('content_hash', $contentHash)
            ->where('status', 'published')
            ->first();
            
        if ($existingSnapshot) {
            return $existingSnapshot;
        }
        
        // Compress and store snapshot
        $storagePath = $this->storeSnapshot($snapshotData, $contentHash, $options);
        
        // Create snapshot record
        $snapshot = Snapshot::create([
            'name' => $options['name'] ?? "Snapshot of {$scene->name}",
            'slug' => $options['slug'] ?? Str::slug("snapshot-{$scene->slug}-" . now()->format('Y-m-d-H-i-s')),
            'description' => $options['description'] ?? "Auto-generated snapshot of {$scene->name}",
            'scene_id' => $scene->id,
            'version' => $options['version'] ?? '1.0.0',
            'status' => 'draft',
            'manifest' => $this->buildManifest($scene, $contentHash, $options),
            'content_hash' => $contentHash,
            'storage_path' => $storagePath,
            'compression_type' => $options['compression'] ?? 'brotli',
            'file_size' => Storage::disk('snapshots')->size($storagePath),
            'metadata' => $options['metadata'] ?? [],
            'created_by' => $options['created_by'] ?? null,
        ]);
        
        return $snapshot;
    }
    
    /**
     * Build the snapshot data structure
     */
    protected function buildSnapshotData(Scene $scene, array $options = []): array
    {
        $data = [
            'schema' => [
                'name' => 'protogen.scene',
                'version' => $options['version'] ?? '1.0.0',
            ],
            'scene' => [
                'ids' => [
                    'stage' => $scene->stage?->slug ?? 'unknown',
                    'scene' => $scene->slug,
                ],
                'timestamps' => [
                    'created' => $scene->created_at->toISOString(),
                    'updated' => $scene->updated_at->toISOString(),
                ],
                'source' => [
                    'generator' => 'protogen-snapshot-builder',
                    'commit' => $options['commit'] ?? 'unknown',
                    'coreRev' => $options['core_rev'] ?? 'unknown',
                ],
                'theme' => $this->resolveTheme($scene, $options),
                'nodes' => $this->serializeNodes($scene),
                'edges' => $this->serializeEdges($scene),
                'contexts' => $this->serializeContexts($scene),
                'indices' => $this->buildIndices($scene),
            ],
            'integrity' => [
                'hash' => '', // Will be filled after content generation
                'algo' => 'sha256',
            ],
            'cache' => [
                'ttl' => $options['ttl'] ?? 86400,
                'immutable' => true,
            ],
        ];
        
        return $data;
    }
    
    /**
     * Resolve theme from scene and options
     */
    protected function resolveTheme(Scene $scene, array $options = []): array
    {
        $theme = $scene->style ?? [];
        
        // Apply default theme if none exists
        if (empty($theme)) {
            $theme = [
                'theme' => 'default',
                'layout' => 'auto',
                'node_spacing' => 100,
                'edge_curvature' => 0.3,
                'colors' => [
                    'primary' => '#4F46E5',
                    'secondary' => '#6B7280',
                    'background' => '#FFFFFF',
                    'text' => '#1F2937',
                ],
            ];
        }
        
        return $theme;
    }
    
    /**
     * Serialize scene nodes
     */
    protected function serializeNodes(Scene $scene): array
    {
        $nodes = [];
        
        foreach ($scene->nodes()->visible()->orderBy('z_index')->get() as $node) {
            $nodeData = [
                'id' => $node->guid,
                'type' => $node->node_type,
                'position' => $node->getPosition(),
                'dimensions' => $node->getDimensions(),
                'style' => $node->style ?? [],
                'meta' => $node->meta ?? [],
                'is_visible' => $node->is_visible,
                'is_locked' => $node->is_locked,
            ];
            
            // Add core node reference if exists
            if ($node->core_node_guid) {
                $nodeData['core_ref'] = $node->core_node_guid;
            }
            
            $nodes[] = $nodeData;
        }
        
        return $nodes;
    }
    
    /**
     * Serialize scene edges
     */
    protected function serializeEdges(Scene $scene): array
    {
        $edges = [];
        
        foreach ($scene->edges()->visible()->get() as $edge) {
            $edgeData = [
                'id' => $edge->guid,
                'type' => $edge->edge_type,
                'source' => $edge->sourceNode->guid,
                'target' => $edge->targetNode->guid,
                'path' => $edge->getPath(),
                'style' => $edge->style ?? [],
                'meta' => $edge->meta ?? [],
                'is_visible' => $edge->is_visible,
                'is_locked' => $edge->is_locked,
            ];
            
            // Add core edge reference if exists
            if ($edge->core_edge_guid) {
                $edgeData['core_ref'] = $edge->core_edge_guid;
            }
            
            $edges[] = $edgeData;
        }
        
        return $edges;
    }
    
    /**
     * Serialize scene contexts (stage-level metadata)
     */
    protected function serializeContexts(Scene $scene): array
    {
        $contexts = [];
        
        if ($scene->stage) {
            $contexts[] = [
                'type' => 'stage',
                'id' => $scene->stage->slug,
                'name' => $scene->stage->name,
                'config' => $scene->stage->config ?? [],
                'meta' => $scene->stage->metadata ?? [],
            ];
        }
        
        return $contexts;
    }
    
    /**
     * Build search indices for the snapshot
     */
    protected function buildIndices(Scene $scene): array
    {
        $indices = [
            'search' => [],
            'tags' => [],
            'types' => [],
        ];
        
        // Build search index from node labels and descriptions
        foreach ($scene->nodes as $node) {
            if ($node->label) {
                $indices['search'][] = [
                    'text' => $node->label,
                    'type' => 'node_label',
                    'id' => $node->guid,
                ];
            }
            
            if ($node->description) {
                $indices['search'][] = [
                    'text' => $node->description,
                    'type' => 'node_description',
                    'id' => $node->guid,
                ];
            }
        }
        
        // Build tag index
        $tags = collect($scene->nodes)
            ->pluck('meta.tags')
            ->filter()
            ->flatten()
            ->unique()
            ->values()
            ->toArray();
            
        $indices['tags'] = $tags;
        
        // Build type index
        $types = collect($scene->nodes)
            ->pluck('node_type')
            ->unique()
            ->values()
            ->toArray();
            
        $indices['types'] = $types;
        
        return $indices;
    }
    
    /**
     * Build manifest for the snapshot
     */
    protected function buildManifest(Scene $scene, string $contentHash, array $options = []): array
    {
        return [
            'schema' => [
                'name' => 'protogen.scene.manifest',
                'version' => '1.0.0',
            ],
            'locator' => [
                'stage' => $scene->stage?->slug ?? 'unknown',
                'scene' => $scene->slug,
                'etag' => $contentHash,
                'url' => '', // Will be filled after storage
            ],
            'generatedAt' => now()->toISOString(),
            'expiresAt' => $options['expires_at'] ?? null,
        ];
    }
    
    /**
     * Generate content hash for snapshot data
     */
    protected function generateContentHash(array $data): string
    {
        // Remove dynamic fields that shouldn't affect hash
        $hashableData = $data;
        unset($hashableData['integrity']['hash']);
        unset($hashableData['scene']['timestamps']['updated']);
        
        // Convert to JSON and hash
        $jsonString = json_encode($hashableData, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        return hash('sha256', $jsonString);
    }
    
    /**
     * Store snapshot to storage
     */
    protected function storeSnapshot(array $data, string $contentHash, array $options = []): string
    {
        $compression = $options['compression'] ?? 'brotli';
        $jsonString = json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        
        // Generate filename
        $filename = "{$contentHash}.json";
        
        if ($compression === 'brotli' && function_exists('brotli_compress')) {
            $filename .= '.br';
            $content = brotli_compress($jsonString, 11); // Maximum compression
        } elseif ($compression === 'gzip' && function_exists('gzencode')) {
            $filename .= '.gz';
            $content = gzencode($jsonString, 9); // Maximum compression
        } else {
            // Fallback to no compression if extensions not available
            $compression = 'none';
            $content = $jsonString;
        }
        
        // Store to snapshots disk
        Storage::disk('snapshots')->put($filename, $content);
        
        return $filename;
    }
    
    /**
     * Publish a snapshot
     */
    public function publishSnapshot(Snapshot $snapshot): bool
    {
        try {
            $snapshot->publish();
            
            // Update manifest with public URL
            $manifest = $snapshot->manifest;
            $manifest['locator']['url'] = $snapshot->getPublicUrl();
            $snapshot->update(['manifest' => $manifest]);
            
            return true;
        } catch (\Exception $e) {
            \Log::error('Failed to publish snapshot', [
                'snapshot_id' => $snapshot->id,
                'error' => $e->getMessage(),
            ]);
            
            return false;
        }
    }
    
    /**
     * Archive a snapshot
     */
    public function archiveSnapshot(Snapshot $snapshot): bool
    {
        try {
            $snapshot->archive();
            return true;
        } catch (\Exception $e) {
            \Log::error('Failed to archive snapshot', [
                'snapshot_id' => $snapshot->id,
                'error' => $e->getMessage(),
            ]);
            
            return false;
        }
    }
}
