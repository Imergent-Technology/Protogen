<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CoreGraphNodeType extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'display_name',
        'description',
        'icon',
        'icon_color',
        'is_system',
        'is_active',
    ];

    protected $casts = [
        'is_system' => 'boolean',
        'is_active' => 'boolean',
    ];

    /**
     * Get all nodes of this type.
     */
    public function nodes(): HasMany
    {
        return $this->hasMany(CoreGraphNode::class, 'node_type_id');
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
