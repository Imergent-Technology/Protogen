<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class SceneNode extends Model
{
    use HasFactory;

    protected $fillable = [
        'guid',
        'scene_id',
        'core_node_guid',
        'node_type',
        'position',
        'dimensions',
        'meta',
        'style',
        'z_index',
        'is_visible',
        'is_locked',
        'transform',
    ];

    protected $casts = [
        'position' => 'array',
        'dimensions' => 'array',
        'meta' => 'array',
        'style' => 'array',
        'z_index' => 'integer',
        'is_visible' => 'boolean',
        'is_locked' => 'boolean',
        'transform' => 'array',
    ];

    protected $attributes = [
        'node_type' => 'presentational',
        'z_index' => 0,
        'is_visible' => true,
        'is_locked' => false,
    ];

    // Relationships
    public function scene(): BelongsTo
    {
        return $this->belongsTo(Scene::class);
    }

    public function coreNode(): BelongsTo
    {
        return $this->belongsTo(CoreGraphNode::class, 'core_node_guid', 'guid');
    }

    public function outgoingEdges(): HasMany
    {
        return $this->hasMany(SceneEdge::class, 'source_node_id');
    }

    public function incomingEdges(): HasMany
    {
        return $this->hasMany(SceneEdge::class, 'target_node_id');
    }

    // Scopes
    public function scopeVisible($query)
    {
        return $query->where('is_visible', true);
    }

    public function scopeOfType($query, $type)
    {
        return $query->where('node_type', $type);
    }

    public function scopeForScene($query, $sceneId)
    {
        return $query->where('scene_id', $sceneId);
    }

    public function scopeCoreNodes($query)
    {
        return $query->whereNotNull('core_node_guid');
    }

    public function scopePhantomNodes($query)
    {
        return $query->whereNull('core_node_guid');
    }

    // Boot method to generate GUID
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($node) {
            if (empty($node->guid)) {
                $node->guid = Str::uuid();
            }
        });
    }

    // Helper methods
    public function isCore(): bool
    {
        return $this->node_type === 'core';
    }

    public function isPresentational(): bool
    {
        return $this->node_type === 'presentational';
    }

    public function isPhantom(): bool
    {
        return $this->node_type === 'phantom';
    }

    public function getPosition(): array
    {
        return $this->position ?? ['x' => 0, 'y' => 0];
    }

    public function setPosition(float $x, float $y): void
    {
        $this->update(['position' => ['x' => $x, 'y' => $y]]);
    }

    public function getDimensions(): array
    {
        return $this->dimensions ?? ['width' => 100, 'height' => 100];
    }

    public function setDimensions(float $width, float $height): void
    {
        $this->update(['dimensions' => ['width' => $width, 'height' => $height]]);
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
}
