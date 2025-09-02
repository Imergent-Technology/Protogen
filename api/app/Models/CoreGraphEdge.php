<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class CoreGraphEdge extends Model
{
    use HasFactory;

    protected $fillable = [
        'guid',
        'source_node_guid',
        'target_node_guid',
        'edge_type_id',
        'weight',
        'label',
        'description',
        'properties',
        'is_active',
    ];

    protected $casts = [
        'weight' => 'float',
        'properties' => 'array',
        'is_active' => 'boolean',
    ];

    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($model) {
            if (empty($model->guid)) {
                $model->guid = (string) Str::uuid();
            }
            
            if (empty($model->weight)) {
                $model->weight = 1.00000;
            }
        });
    }

    /**
     * Get the source node.
     */
    public function sourceNode(): BelongsTo
    {
        return $this->belongsTo(CoreGraphNode::class, 'source_node_guid', 'guid');
    }

    /**
     * Get the target node.
     */
    public function targetNode(): BelongsTo
    {
        return $this->belongsTo(CoreGraphNode::class, 'target_node_guid', 'guid');
    }

    /**
     * Get the edge type.
     */
    public function edgeType(): BelongsTo
    {
        return $this->belongsTo(CoreGraphEdgeType::class, 'edge_type_id');
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
    public function scopeOfType($query, $typeId)
    {
        return $query->where('edge_type_id', $typeId);
    }

    /**
     * Scope to get edges connected to a specific node.
     */
    public function scopeConnectedToNode($query, $nodeGuid)
    {
        return $query->where(function ($q) use ($nodeGuid) {
            $q->where('source_node_guid', $nodeGuid)
              ->orWhere('target_node_guid', $nodeGuid);
        });
    }
}
