<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SceneContent extends Model
{
    use HasFactory;

    protected $table = 'scene_content';

    protected $fillable = [
        'scene_id',
        'content_type',
        'content_key',
        'content_data',
        'content_format',
        'metadata',
        'sort_order',
        'is_active',
    ];

    protected $casts = [
        'metadata' => 'array',
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    /**
     * Get the scene that owns the content.
     */
    public function scene(): BelongsTo
    {
        return $this->belongsTo(Scene::class);
    }

    /**
     * Scope to get content by type.
     */
    public function scopeByType($query, string $type)
    {
        return $query->where('content_type', $type);
    }

    /**
     * Scope to get content by key.
     */
    public function scopeByKey($query, string $key)
    {
        return $query->where('content_key', $key);
    }

    /**
     * Scope to get active content.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to order by sort order.
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order')->orderBy('created_at');
    }
}