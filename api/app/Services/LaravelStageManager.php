<?php

namespace App\Services;

use App\Models\Stage;
use App\Models\StageLink;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class LaravelStageManager
{
    /**
     * Get all stages with optional filtering.
     */
    public static function getAllStages(array $filters = []): Collection
    {
        $query = Stage::query();

        if (isset($filters['type'])) {
            $query->where('type', $filters['type']);
        }

        if (isset($filters['active'])) {
            $query->where('is_active', $filters['active']);
        }

        if (isset($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        return $query->orderBy('sort_order')
                    ->orderBy('created_at', 'desc')
                    ->get();
    }

    /**
     * Get a stage by ID or slug.
     */
    public static function getStage($identifier): ?Stage
    {
        if (is_numeric($identifier)) {
            return Stage::find($identifier);
        }

        return Stage::where('slug', $identifier)->first();
    }

    /**
     * Create a new stage.
     */
    public static function createStage(array $data): Stage
    {
        // Generate slug if not provided
        if (empty($data['slug'])) {
            $data['slug'] = Str::slug($data['name']);
        }

        // Validate stage configuration
        $configErrors = StageManager::validateConfig($data['type'], $data['config'] ?? []);
        if (!empty($configErrors)) {
            throw new \InvalidArgumentException('Invalid stage configuration: ' . implode(', ', $configErrors));
        }

        // Create the stage
        $stage = Stage::create($data);

        // Create relationships if provided
        if (isset($data['relationships'])) {
            self::createStageRelationships($stage, $data['relationships']);
        }

        // Clear cache
        self::clearCache();

        return $stage->load(['incomingLinks.sourceStage', 'outgoingLinks.targetStage']);
    }

    /**
     * Update an existing stage.
     */
    public static function updateStage(Stage $stage, array $data): Stage
    {
        // Validate stage configuration if type or config changed
        if (isset($data['type']) || isset($data['config'])) {
            $type = $data['type'] ?? $stage->type;
            $config = $data['config'] ?? $stage->config ?? [];
            $configErrors = StageManager::validateConfig($type, $config);
            
            if (!empty($configErrors)) {
                throw new \InvalidArgumentException('Invalid stage configuration: ' . implode(', ', $configErrors));
            }
        }

        // Update the stage
        $stage->update($data);

        // Update relationships if provided
        if (isset($data['relationships'])) {
            self::updateStageRelationships($stage, $data['relationships']);
        }

        // Clear cache
        self::clearCache();

        return $stage->load(['incomingLinks.sourceStage', 'outgoingLinks.targetStage']);
    }

    /**
     * Delete a stage.
     */
    public static function deleteStage(Stage $stage): bool
    {
        // Delete related stage links
        StageLink::where('source_stage_id', $stage->id)
                ->orWhere('target_stage_id', $stage->id)
                ->delete();

        $deleted = $stage->delete();

        // Clear cache
        self::clearCache();

        return $deleted;
    }

    /**
     * Get stage relationships.
     */
    public static function getStageRelationships(Stage $stage): array
    {
        return [
            'load_after' => $stage->outgoingLinks()->where('type', 'load_after')->with('targetStage')->get(),
            'child_of' => $stage->outgoingLinks()->where('type', 'child_of')->with('targetStage')->get(),
            'related_to' => $stage->outgoingLinks()->where('type', 'related_to')->with('targetStage')->get(),
            'incoming' => $stage->incomingLinks()->with('sourceStage')->get(),
        ];
    }

    /**
     * Get stages that should be preloaded for a given stage.
     */
    public static function getPreloadStages(Stage $stage): Collection
    {
        $preloadStageIds = $stage->outgoingLinks()
            ->where('type', 'load_after')
            ->pluck('target_stage_id');

        return Stage::whereIn('id', $preloadStageIds)
                   ->where('is_active', true)
                   ->get();
    }

    /**
     * Get child stages for a given stage.
     */
    public static function getChildStages(Stage $stage): Collection
    {
        $childStageIds = $stage->outgoingLinks()
            ->where('type', 'child_of')
            ->pluck('target_stage_id');

        return Stage::whereIn('id', $childStageIds)
                   ->where('is_active', true)
                   ->orderBy('sort_order')
                   ->get();
    }

    /**
     * Get related stages for a given stage.
     */
    public static function getRelatedStages(Stage $stage): Collection
    {
        $relatedStageIds = $stage->outgoingLinks()
            ->where('type', 'related_to')
            ->pluck('target_stage_id');

        return Stage::whereIn('id', $relatedStageIds)
                   ->where('is_active', true)
                   ->get();
    }

    /**
     * Search stages by title or content.
     */
    public static function searchStages(string $query): Collection
    {
        return Stage::where('is_active', true)
                   ->where(function ($q) use ($query) {
                       $q->where('name', 'like', "%{$query}%")
                         ->orWhere('description', 'like', "%{$query}%")
                         ->orWhereJsonContains('config->title', $query);
                   })
                   ->orderBy('sort_order')
                   ->get();
    }

    /**
     * Get stage navigation breadcrumbs.
     */
    public static function getBreadcrumbs(Stage $stage): array
    {
        $breadcrumbs = [];
        $currentStage = $stage;

        // Build breadcrumbs from incoming links
        while ($currentStage) {
            $incomingLink = $currentStage->incomingLinks()
                ->where('type', 'child_of')
                ->with('sourceStage')
                ->first();

            if ($incomingLink && $incomingLink->sourceStage) {
                array_unshift($breadcrumbs, [
                    'id' => $incomingLink->sourceStage->id,
                    'name' => $incomingLink->sourceStage->name,
                    'slug' => $incomingLink->sourceStage->slug,
                    'type' => $incomingLink->sourceStage->type,
                ]);
                $currentStage = $incomingLink->sourceStage;
            } else {
                break;
            }
        }

        // Add current stage
        $breadcrumbs[] = [
            'id' => $stage->id,
            'name' => $stage->name,
            'slug' => $stage->slug,
            'type' => $stage->type,
        ];

        return $breadcrumbs;
    }

    /**
     * Create stage relationships.
     */
    private static function createStageRelationships(Stage $stage, array $relationships): void
    {
        self::createRelationshipsByType($stage, $relationships, 'load_after');
        self::createRelationshipsByType($stage, $relationships, 'child_of');
        self::createRelationshipsByType($stage, $relationships, 'related_to');
    }

    /**
     * Update stage relationships.
     */
    private static function updateStageRelationships(Stage $stage, array $relationships): void
    {
        // Delete existing relationships
        StageLink::where('source_stage_id', $stage->id)->delete();

        // Create new relationships
        self::createStageRelationships($stage, $relationships);
    }

    /**
     * Create relationships of a specific type.
     */
    private static function createRelationshipsByType(Stage $stage, array $relationships, string $type): void
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

    /**
     * Clear stage cache.
     */
    private static function clearCache(): void
    {
        Cache::forget('stages.all');
        Cache::forget('stages.active');
        Cache::forget('stages.types');
    }
} 