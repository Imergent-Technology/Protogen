<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Subgraph extends Model
{
    use HasFactory;

    protected $fillable = [
        'guid',
        'name',
        'description',
        'tenant_id',
        'created_by',
        'is_public'
    ];

    protected $casts = [
        'is_public' => 'boolean'
    ];

    /**
     * Get the tenant that owns the subgraph.
     */
    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    /**
     * Get the user who created the subgraph.
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the nodes in the subgraph.
     */
    public function nodes(): BelongsToMany
    {
        return $this->belongsToMany(CoreGraphNode::class, 'subgraph_nodes', 'subgraph_id', 'node_id');
    }

    /**
     * Get the scenes that use this subgraph.
     */
    public function scenes(): HasMany
    {
        return $this->hasMany(Scene::class);
    }

    /**
     * Get all edges between nodes in this subgraph.
     */
    public function getEdges()
    {
        $nodeIds = $this->nodes->pluck('id');
        
        return CoreGraphEdge::whereIn('source_node_id', $nodeIds)
                           ->whereIn('target_node_id', $nodeIds)
                           ->get();
    }

    /**
     * Add a node to the subgraph.
     */
    public function addNode(CoreGraphNode $node): void
    {
        $this->nodes()->syncWithoutDetaching([$node->id]);
    }

    /**
     * Remove a node from the subgraph.
     */
    public function removeNode(CoreGraphNode $node): void
    {
        $this->nodes()->detach($node->id);
    }

    /**
     * Check if a node is in this subgraph.
     */
    public function hasNode(CoreGraphNode $node): bool
    {
        return $this->nodes()->where('node_id', $node->id)->exists();
    }

    /**
     * Boot method to generate GUID.
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($subgraph) {
            if (empty($subgraph->guid)) {
                $subgraph->guid = Str::uuid();
            }
        });
    }
}