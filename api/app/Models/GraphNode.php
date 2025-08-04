<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class GraphNode extends Model
{
    use HasFactory;

    protected $fillable = [
        'stage_id',
        'node_id',
        'label',
        'description',
        'type',
        'properties',
        'position',
        'style',
        'is_active',
    ];

    protected $casts = [
        'properties' => 'array',
        'position' => 'array',
        'style' => 'array',
        'is_active' => 'boolean',
    ];

    /**
     * Get the stage that owns this node.
     */
    public function stage(): BelongsTo
    {
        return $this->belongsTo(Stage::class);
    }

    /**
     * Get the edges where this node is the source.
     */
    public function outgoingEdges(): HasMany
    {
        return $this->hasMany(GraphEdge::class, 'source_node_id', 'node_id');
    }

    /**
     * Get the edges where this node is the target.
     */
    public function incomingEdges(): HasMany
    {
        return $this->hasMany(GraphEdge::class, 'target_node_id', 'node_id');
    }

    /**
     * Get all connected nodes through outgoing edges.
     */
    public function connectedNodes()
    {
        return $this->belongsToMany(GraphNode::class, 'graph_edges', 'source_node_id', 'target_node_id', 'node_id', 'node_id')
            ->withPivot(['edge_id', 'label', 'description', 'type', 'properties', 'style'])
            ->withTimestamps();
    }

    /**
     * Scope to get only active nodes.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to get nodes by type.
     */
    public function scopeOfType($query, $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Scope to get nodes for a specific stage.
     */
    public function scopeForStage($query, $stageId)
    {
        return $query->where('stage_id', $stageId);
    }
} 