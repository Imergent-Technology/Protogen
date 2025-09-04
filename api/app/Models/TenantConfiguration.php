<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TenantConfiguration extends Model
{
    use HasFactory;

    protected $fillable = [
        'tenant_id',
        'key',
        'value',
        'scope',
        'description',
    ];

    protected $casts = [
        'value' => 'array',
    ];

    // Relationships
    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    // Scopes
    public function scopeGlobal($query)
    {
        return $query->where('scope', 'global');
    }

    public function scopeContent($query)
    {
        return $query->where('scope', 'content');
    }

    public function scopePresentation($query)
    {
        return $query->where('scope', 'presentation');
    }

    public function scopeFeedback($query)
    {
        return $query->where('scope', 'feedback');
    }

    public function scopeByKey($query, string $key)
    {
        return $query->where('key', $key);
    }

    public function scopeByTenant($query, int $tenantId)
    {
        return $query->where('tenant_id', $tenantId);
    }

    // Helper methods
    public function isGlobal(): bool
    {
        return $this->scope === 'global';
    }

    public function isContent(): bool
    {
        return $this->scope === 'content';
    }

    public function isPresentation(): bool
    {
        return $this->scope === 'presentation';
    }

    public function isFeedback(): bool
    {
        return $this->scope === 'feedback';
    }

    public function getValue($default = null)
    {
        return $this->value ?? $default;
    }

    public function setValue($value): void
    {
        $this->update(['value' => $value]);
    }

    public function getScopePriority(): int
    {
        // Higher priority scopes override lower priority ones
        return match($this->scope) {
            'feedback' => 4,
            'presentation' => 3,
            'content' => 2,
            'global' => 1,
            default => 0,
        };
    }

    public static function getScopes(): array
    {
        return [
            'global' => 'Global - Applies to entire tenant',
            'content' => 'Content - Applies to content management',
            'presentation' => 'Presentation - Applies to presentation settings',
            'feedback' => 'Feedback - Applies to feedback collection',
        ];
    }

    public static function getDefaultConfigurations(): array
    {
        return [
            'global' => [
                'max_scenes_per_tenant' => 1000,
                'max_decks_per_tenant' => 100,
                'max_contexts_per_tenant' => 5000,
                'allow_custom_domains' => true,
                'enable_analytics' => true,
            ],
            'content' => [
                'default_scene_type' => 'graph',
                'allow_phantom_elements' => true,
                'max_nodes_per_scene' => 1000,
                'max_edges_per_scene' => 2000,
                'enable_versioning' => true,
            ],
            'presentation' => [
                'default_theme' => 'light',
                'allow_custom_themes' => true,
                'enable_animations' => true,
                'default_transition_duration' => 300,
                'enable_progress_bars' => true,
            ],
            'feedback' => [
                'enable_comments' => true,
                'enable_ratings' => true,
                'enable_bookmarks' => true,
                'moderation_required' => false,
                'feedback_aggregation' => true,
            ],
        ];
    }
}
