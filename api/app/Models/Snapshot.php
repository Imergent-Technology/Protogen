<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class Snapshot extends Model
{
    use HasFactory;

    protected $fillable = [
        'guid',
        'name',
        'slug',
        'description',
        'scene_id',
        'version',
        'status',
        'manifest',
        'content_hash',
        'storage_path',
        'compression_type',
        'file_size',
        'metadata',
        'published_at',
        'expires_at',
        'created_by',
    ];

    protected $casts = [
        'manifest' => 'array',
        'metadata' => 'array',
        'published_at' => 'datetime',
        'expires_at' => 'datetime',
        'file_size' => 'integer',
    ];

    protected $attributes = [
        'version' => '1.0.0',
        'status' => 'draft',
        'compression_type' => 'brotli',
    ];

    // Relationships
    public function scene(): BelongsTo
    {
        return $this->belongsTo(Scene::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // Scopes
    public function scopePublished($query)
    {
        return $query->where('status', 'published');
    }

    public function scopeDraft($query)
    {
        return $query->where('status', 'draft');
    }

    public function scopeArchived($query)
    {
        return $query->where('status', 'archived');
    }

    public function scopeForScene($query, $sceneId)
    {
        return $query->where('scene_id', $sceneId);
    }

    public function scopeLatest($query)
    {
        return $query->orderBy('published_at', 'desc');
    }

    // Boot method to generate GUID
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($snapshot) {
            if (empty($snapshot->guid)) {
                $snapshot->guid = Str::uuid();
            }
        });
    }

    // Helper methods
    public function isPublished(): bool
    {
        return $this->status === 'published';
    }

    public function isDraft(): bool
    {
        return $this->status === 'draft';
    }

    public function isArchived(): bool
    {
        return $this->status === 'archived';
    }

    public function publish(): void
    {
        $this->update([
            'status' => 'published',
            'published_at' => now(),
        ]);
    }

    public function archive(): void
    {
        $this->update([
            'status' => 'archived',
            'published_at' => null,
        ]);
    }

    public function isExpired(): bool
    {
        return $this->expires_at && $this->expires_at->isPast();
    }

    public function getPublicUrl(): ?string
    {
        if (!$this->isPublished() || !$this->storage_path) {
            return null;
        }

        return config('app.url') . '/storage/snapshots/' . $this->storage_path;
    }

    public function getManifestUrl(): ?string
    {
        if (!$this->isPublished()) {
            return null;
        }

        return config('app.url') . '/api/snapshots/' . $this->guid . '/manifest';
    }

    public function getContentHash(): string
    {
        return $this->content_hash ?? '';
    }

    public function hasValidContent(): bool
    {
        return !empty($this->content_hash) && !empty($this->storage_path);
    }

    public function getCompressionType(): string
    {
        return $this->compression_type ?? 'brotli';
    }

    public function getFileSize(): ?int
    {
        return $this->file_size;
    }

    public function getFileSizeFormatted(): string
    {
        if (!$this->file_size) {
            return 'Unknown';
        }

        $units = ['B', 'KB', 'MB', 'GB'];
        $size = $this->file_size;
        $unit = 0;

        while ($size >= 1024 && $unit < count($units) - 1) {
            $size /= 1024;
            $unit++;
        }

        return round($size, 2) . ' ' . $units[$unit];
    }
}
