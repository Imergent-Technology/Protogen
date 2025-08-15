<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Stage extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'type',
        'config',
        'metadata',
        'is_active',
        'is_system',
        'sort_order',
    ];

    protected $casts = [
        'config' => 'array',
        'metadata' => 'array',
        'is_active' => 'boolean',
        'is_system' => 'boolean',
    ];

    /**
     * Get the graph nodes for this stage.
     */
    public function graphNodes(): HasMany
    {
        return $this->hasMany(GraphNode::class);
    }

    /**
     * Get the graph edges for this stage.
     */
    public function graphEdges(): HasMany
    {
        return $this->hasMany(GraphEdge::class);
    }

    /**
     * Get the feedback for this stage.
     */
    public function feedback(): HasMany
    {
        return $this->hasMany(Feedback::class);
    }

    /**
     * Get the stages that link to this stage.
     */
    public function incomingLinks(): HasMany
    {
        return $this->hasMany(StageLink::class, 'target_stage_id');
    }

    /**
     * Get the stages that this stage links to.
     */
    public function outgoingLinks(): HasMany
    {
        return $this->hasMany(StageLink::class, 'source_stage_id');
    }

    /**
     * Get related stages through links.
     */
    public function relatedStages(): BelongsToMany
    {
        return $this->belongsToMany(Stage::class, 'stage_links', 'source_stage_id', 'target_stage_id')
            ->withPivot(['label', 'description', 'type', 'context', 'metadata'])
            ->withTimestamps();
    }

    /**
     * Scope to get only active stages.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to get stages by type.
     */
    public function scopeOfType($query, $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Scope to get only system stages.
     */
    public function scopeSystem($query)
    {
        return $query->where('is_system', true);
    }

    /**
     * Scope to get only non-system stages.
     */
    public function scopeNonSystem($query)
    {
        return $query->where('is_system', false);
    }
} 