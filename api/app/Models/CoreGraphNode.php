<?php

namespace App\Models;

use App\Traits\HasUuid7;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CoreGraphNode extends Model
{
    use HasFactory, HasUuid7;

    protected $table = 'nodes';

    protected $fillable = [
        'guid',
        'node_type_id',
        'label',
        'description',
        'properties',
        'position',
        'is_active',
    ];

    protected $casts = [
        'properties' => 'array',
        'position' => 'array',
        'is_active' => 'boolean',
    ];

    /**
     * Get the node type for this node.
     */
    public function nodeType(): BelongsTo
    {
        return $this->belongsTo(CoreGraphNodeType::class, 'node_type_id');
    }

    /**
     * Get the edges where this node is the source.
     */
    public function outgoingEdges(): HasMany
    {
        return $this->hasMany(CoreGraphEdge::class, 'source_node_guid', 'guid');
    }

    /**
     * Get the edges where this node is the target.
     */
    public function incomingEdges(): HasMany
    {
        return $this->hasMany(CoreGraphEdge::class, 'target_node_guid', 'guid');
    }

    /**
     * Get all connected nodes through outgoing edges.
     */
    public function connectedNodes()
    {
        return $this->belongsToMany(
            CoreGraphNode::class, 
            'edges', 
            'source_node_guid', 
            'target_node_guid', 
            'guid', 
            'guid'
        )
        ->withPivot(['guid', 'label', 'description', 'edge_type_id', 'properties'])
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
    public function scopeOfType($query, $typeId)
    {
        return $query->where('node_type_id', $typeId);
    }

    /**
     * Scope to get nodes by type name.
     */
    public function scopeOfTypeName($query, $typeName)
    {
        return $query->whereHas('nodeType', function ($q) use ($typeName) {
            $q->where('name', $typeName);
        });
    }
}
