<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Scene extends Model
{
    use HasFactory;

    protected $fillable = [
        'guid',
        'name',
        'slug',
        'description',
        'scene_type',
        'config',
        'meta',
        'style',
        'is_active',
        'is_public',
        'created_by',
        'tenant_id',
        'published_at',
    ];

    protected $casts = [
        'config' => 'array',
        'meta' => 'array',
        'style' => 'array',
        'is_active' => 'boolean',
        'is_public' => 'boolean',
        'published_at' => 'datetime',
    ];

    protected $attributes = [
        'scene_type' => 'custom',
        'is_active' => true,
        'is_public' => false,
    ];

    // Relationships
    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }


    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function nodes(): HasMany
    {
        return $this->hasMany(SceneNode::class);
    }

    public function edges(): HasMany
    {
        return $this->hasMany(SceneEdge::class);
    }

    public function content(): HasMany
    {
        return $this->hasMany(SceneContent::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopePublic($query)
    {
        return $query->where('is_public', true);
    }

    public function scopeOfType($query, $type)
    {
        return $query->where('scene_type', $type);
    }


    public function scopeForTenant($query, $tenantId)
    {
        return $query->where('tenant_id', $tenantId);
    }

    // Boot method to generate GUID
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($scene) {
            if (empty($scene->guid)) {
                $scene->guid = Str::uuid();
            }
        });
    }

    // Helper methods
    public function isSystem(): bool
    {
        return $this->scene_type === 'system';
    }

    public function isCustom(): bool
    {
        return $this->scene_type === 'custom';
    }

    public function isTemplate(): bool
    {
        return $this->scene_type === 'template';
    }

    public function publish(): void
    {
        $this->update(['published_at' => now()]);
    }

    public function unpublish(): void
    {
        $this->update(['published_at' => null]);
    }

    public function isPublished(): bool
    {
        return !is_null($this->published_at);
    }

    // Content management methods
    public function getContent(string $type = 'document', string $key = 'main'): ?SceneContent
    {
        return $this->content()
            ->byType($type)
            ->byKey($key)
            ->active()
            ->first();
    }

    public function setContent(string $contentData, string $type = 'document', string $key = 'main', string $format = 'html', array $metadata = []): SceneContent
    {
        return $this->content()->updateOrCreate(
            [
                'content_type' => $type,
                'content_key' => $key,
            ],
            [
                'content_data' => $contentData,
                'content_format' => $format,
                'metadata' => $metadata,
                'is_active' => true,
            ]
        );
    }

    public function getDocumentContent(): ?string
    {
        $content = $this->getContent('document', 'main');
        return $content ? $content->content_data : null;
    }

    public function setDocumentContent(string $htmlContent): SceneContent
    {
        return $this->setContent($htmlContent, 'document', 'main', 'html');
    }
}
