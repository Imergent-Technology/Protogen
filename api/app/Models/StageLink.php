<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StageLink extends Model
{
    use HasFactory;

    protected $fillable = [
        'source_stage_id',
        'target_stage_id',
        'label',
        'description',
        'type',
        'context',
        'metadata',
        'is_active',
    ];

    protected $casts = [
        'context' => 'array',
        'metadata' => 'array',
        'is_active' => 'boolean',
    ];

    /**
     * Get the source stage.
     */
    public function sourceStage(): BelongsTo
    {
        return $this->belongsTo(Stage::class, 'source_stage_id');
    }

    /**
     * Get the target stage.
     */
    public function targetStage(): BelongsTo
    {
        return $this->belongsTo(Stage::class, 'target_stage_id');
    }

    /**
     * Scope to get only active links.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to get links by type.
     */
    public function scopeOfType($query, $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Scope to get links from a specific stage.
     */
    public function scopeFromStage($query, $stageId)
    {
        return $query->where('source_stage_id', $stageId);
    }

    /**
     * Scope to get links to a specific stage.
     */
    public function scopeToStage($query, $stageId)
    {
        return $query->where('target_stage_id', $stageId);
    }

    /**
     * Scope to get contextual links.
     */
    public function scopeContextual($query)
    {
        return $query->where('type', 'contextual');
    }

    /**
     * Scope to get hierarchical links.
     */
    public function scopeHierarchical($query)
    {
        return $query->where('type', 'hierarchical');
    }
} 