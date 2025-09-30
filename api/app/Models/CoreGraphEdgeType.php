<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CoreGraphEdgeType extends Model
{
    use HasFactory;

    protected $table = 'edge_types';

    protected $fillable = [
        'name',
        'display_name',
        'description',
        'color',
        'style',
        'is_system',
        'is_active',
    ];

    protected $casts = [
        'style' => 'array',
        'is_system' => 'boolean',
        'is_active' => 'boolean',
    ];

    /**
     * Get all edges of this type.
     */
    public function edges(): HasMany
    {
        return $this->hasMany(CoreGraphEdge::class, 'edge_type_id');
    }

    /**
     * Scope to get only system types.
     */
    public function scopeSystem($query)
    {
        return $query->where('is_system', true);
    }

    /**
     * Scope to get only custom types.
     */
    public function scopeCustom($query)
    {
        return $query->where('is_system', false);
    }

    /**
     * Scope to get only active types.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to get types by name.
     */
    public function scopeByName($query, $name)
    {
        return $query->where('name', $name);
    }
}
