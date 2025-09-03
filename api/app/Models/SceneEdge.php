<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class SceneEdge extends Model
{
    use HasFactory;

    protected $fillable = [
        'guid',
        'scene_id',
        'core_edge_guid',
        'source_node_id',
        'target_node_id',
        'edge_type',
        'path',
        'meta',
        'style',
        'is_visible',
        'is_locked',
        'transform',
    ];

    protected $casts = [
        'path' => 'array',
        'meta' => 'array',
        'style' => 'array',
        'is_visible' => 'boolean',
        'is_locked' => 'boolean',
        'transform' => 'array',
    ];

    protected $attributes = [
        'edge_type' => 'presentational',
        'is_visible' => true,
        'is_locked' => false,
    ];

    // Relationships
    public function scene(): BelongsTo
    {
        return $this->belongsTo(Scene::class);
    }

    public function coreEdge(): BelongsTo
    {
        return $this->belongsTo(CoreGraphEdge::class, 'core_edge_guid', 'guid');
    }

    public function sourceNode(): BelongsTo
    {
        return $this->belongsTo(SceneNode::class, 'source_node_id');
    }

    public function targetNode(): BelongsTo
    {
        return $this->belongsTo(SceneNode::class, 'target_node_id');
    }

    // Scopes
    public function scopeVisible($query)
    {
        return $query->where('is_visible', true);
    }

    public function scopeOfType($query, $type)
    {
        return $query->where('edge_type', $type);
    }

    public function scopeForScene($query, $sceneId)
    {
        return $query->where('scene_id', $sceneId);
    }

    public function scopeCoreEdges($query)
    {
        return $query->whereNotNull('core_edge_guid');
    }

    public function scopePhantomEdges($query)
    {
        return $query->whereNull('core_edge_guid');
    }

    // Boot method to generate GUID
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($edge) {
            if (empty($edge->guid)) {
                $edge->guid = Str::uuid();
            }
        });
    }

    // Helper methods
    public function isCore(): bool
    {
        return $this->edge_type === 'core';
    }

    public function isPresentational(): bool
    {
        return $this->edge_type === 'presentational';
    }

    public function isPhantom(): bool
    {
        return $this->edge_type === 'phantom';
    }

    public function getPath(): array
    {
        return $this->path ?? [];
    }

    public function setPath(array $path): void
    {
        $this->update(['path' => $path]);
    }

    public function isLocked(): bool
    {
        return $this->is_locked;
    }

    public function lock(): void
    {
        $this->update(['is_locked' => true]);
    }

    public function unlock(): void
    {
        $this->update(['is_locked' => false]);
    }

    public function getSourcePosition(): array
    {
        return $this->sourceNode->getPosition();
    }

    public function getTargetPosition(): array
    {
        return $this->targetNode->getPosition();
    }
}
