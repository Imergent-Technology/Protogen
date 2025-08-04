<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GraphEdge extends Model
{
    use HasFactory;

    protected $fillable = [
        'stage_id',
        'edge_id',
        'source_node_id',
        'target_node_id',
        'label',
        'description',
        'type',
        'properties',
        'style',
        'is_active',
    ];

    protected $casts = [
        'properties' => 'array',
        'style' => 'array',
        'is_active' => 'boolean',
    ];

    /**
     * Get the stage that owns this edge.
     */
    public function stage(): BelongsTo
    {
        return $this->belongsTo(Stage::class);
    }

    /**
     * Get the source node.
     */
    public function sourceNode(): BelongsTo
    {
        return $this->belongsTo(GraphNode::class, 'source_node_id', 'node_id');
    }

    /**
     * Get the target node.
     */
    public function targetNode(): BelongsTo
    {
        return $this->belongsTo(GraphNode::class, 'target_node_id', 'node_id');
    }

    /**
     * Scope to get only active edges.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to get edges by type.
     */
    public function scopeOfType($query, $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Scope to get edges for a specific stage.
     */
    public function scopeForStage($query, $stageId)
    {
        return $query->where('stage_id', $stageId);
    }

    /**
     * Scope to get edges connected to a specific node.
     */
    public function scopeConnectedToNode($query, $nodeId)
    {
        return $query->where(function ($q) use ($nodeId) {
            $q->where('source_node_id', $nodeId)
              ->orWhere('target_node_id', $nodeId);
        });
    }
} 