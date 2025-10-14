<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * M1 Week 5: Preview Model
 * 
 * Represents a generated preview/thumbnail.
 * Based on Spec 07: Preview Service Specification
 * 
 * @property int $id
 * @property string $target_type
 * @property string $target_id
 * @property int|null $scene_id
 * @property string $size
 * @property string $hash
 * @property int $width
 * @property int $height
 * @property string|null $data_url
 * @property string|null $file_path
 * @property int|null $file_size
 * @property \Carbon\Carbon $generated_at
 * @property \Carbon\Carbon|null $accessed_at
 * @property int $access_count
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 */
class Preview extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'target_type',
        'target_id',
        'scene_id',
        'size',
        'hash',
        'width',
        'height',
        'data_url',
        'file_path',
        'file_size',
        'generated_at',
        'accessed_at',
        'access_count',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'generated_at' => 'datetime',
        'accessed_at' => 'datetime',
        'access_count' => 'integer',
        'width' => 'integer',
        'height' => 'integer',
        'file_size' => 'integer',
    ];

    /**
     * Get the scene that owns the preview.
     */
    public function scene(): BelongsTo
    {
        return $this->belongsTo(Scene::class);
    }

    /**
     * Update access tracking.
     */
    public function recordAccess(): void
    {
        $this->increment('access_count');
        $this->update(['accessed_at' => now()]);
    }

    /**
     * Check if preview is stale based on current content hash.
     */
    public function isStale(string $currentHash): bool
    {
        return $this->hash !== $currentHash;
    }

    /**
     * Scope to find previews for a specific target.
     */
    public function scopeForTarget($query, string $targetType, string $targetId, string $size = 'sm')
    {
        return $query->where('target_type', $targetType)
                     ->where('target_id', $targetId)
                     ->where('size', $size);
    }

    /**
     * Scope to find all previews for a scene.
     */
    public function scopeForScene($query, int $sceneId)
    {
        return $query->where('scene_id', $sceneId);
    }

    /**
     * Scope to find old previews for cleanup.
     */
    public function scopeOlderThan($query, int $days = 30)
    {
        return $query->where('generated_at', '<', now()->subDays($days));
    }

    /**
     * Scope to find least recently accessed (for LRU eviction).
     */
    public function scopeLeastRecentlyAccessed($query, int $limit = 100)
    {
        return $query->orderBy('accessed_at', 'asc')
                     ->limit($limit);
    }
}

