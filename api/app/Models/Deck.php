<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Deck extends Model
{
    use HasFactory;

    protected $fillable = [
        'guid',
        'name',
        'slug',
        'description',
        'type',
        'scene_ids',
        'navigation',
        'performance',
        'meta',
        'is_active',
        'is_public',
        'created_by',
        'tenant_id',
    ];

    protected $casts = [
        'scene_ids' => 'array',
        'navigation' => 'array',
        'performance' => 'array',
        'meta' => 'array',
        'is_active' => 'boolean',
        'is_public' => 'boolean',
    ];

    protected $attributes = [
        'type' => 'graph',
        'is_active' => true,
        'is_public' => false,
    ];

    // Relationships
    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function scenes(): BelongsToMany
    {
        return $this->belongsToMany(Scene::class, 'deck_scene', 'deck_id', 'scene_id')
            ->withPivot(['order', 'metadata'])
            ->withTimestamps();
    }

    public function contexts(): HasMany
    {
        return $this->hasMany(Context::class, 'target_deck_id');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopePublic($query)
    {
        return $query->where('is_public', true);
    }

    public function scopeOfType($query, $type)
    {
        return $query->where('type', $type);
    }

    public function scopeForCreator($query, $userId)
    {
        return $query->where('created_by', $userId);
    }

    public function scopeForTenant($query, $tenantId)
    {
        return $query->where('tenant_id', $tenantId);
    }

    // Boot method to generate GUID
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($deck) {
            if (empty($deck->guid)) {
                $deck->guid = Str::uuid();
            }
        });
    }

    // Helper methods
    public function isGraphDeck(): bool
    {
        return $this->type === 'graph';
    }

    public function isCardDeck(): bool
    {
        return $this->type === 'card';
    }

    public function isDocumentDeck(): bool
    {
        return $this->type === 'document';
    }

    public function isDashboardDeck(): bool
    {
        return $this->type === 'dashboard';
    }

    public function getSceneIds(): array
    {
        return $this->scene_ids ?? [];
    }

    public function setSceneIds(array $sceneIds): void
    {
        $this->update(['scene_ids' => $sceneIds]);
    }

    public function addScene(string $sceneId, int $order = null, array $metadata = []): void
    {
        $sceneIds = $this->getSceneIds();
        if (!in_array($sceneId, $sceneIds)) {
            $sceneIds[] = $sceneId;
            $this->setSceneIds($sceneIds);
            
            // Update pivot table if using many-to-many relationship
            if ($this->scenes()->exists()) {
                $this->scenes()->attach($sceneId, [
                    'order' => $order ?? count($sceneIds),
                    'metadata' => $metadata
                ]);
            }
        }
    }

    public function removeScene(string $sceneId): void
    {
        $sceneIds = $this->getSceneIds();
        $sceneIds = array_filter($sceneIds, fn($id) => $id !== $sceneId);
        $this->setSceneIds($sceneIds);
        
        // Update pivot table if using many-to-many relationship
        if ($this->scenes()->exists()) {
            $this->scenes()->detach($sceneId);
        }
    }

    public function getNavigation(): array
    {
        return $this->navigation ?? [
            'type' => 'sequential',
            'transitions' => [
                'type' => 'slide',
                'duration' => 300
            ],
            'controls' => [
                'showProgress' => true,
                'allowRandomAccess' => false,
                'keyboardNavigation' => true
            ]
        ];
    }

    public function setNavigation(array $navigation): void
    {
        $this->update(['navigation' => $navigation]);
    }

    public function getPerformance(): array
    {
        return $this->performance ?? [
            'keepWarm' => true,
            'preloadStrategy' => 'proximity'
        ];
    }

    public function setPerformance(array $performance): void
    {
        $this->update(['performance' => $performance]);
    }

    public function getSceneCount(): int
    {
        return count($this->getSceneIds());
    }

    public function hasScene(string $sceneId): bool
    {
        return in_array($sceneId, $this->getSceneIds());
    }

    public function getSceneOrder(string $sceneId): ?int
    {
        $sceneIds = $this->getSceneIds();
        $index = array_search($sceneId, $sceneIds);
        return $index !== false ? $index + 1 : null;
    }

    public function reorderScenes(array $sceneIds): void
    {
        $this->setSceneIds($sceneIds);
    }
}
