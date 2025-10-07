<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Str;

class Tenant extends Model
{
    use HasFactory;

    protected $fillable = [
        'guid',
        'name',
        'slug',
        'description',
        'domain',
        'config',
        'branding',
        'standing_levels',
        'is_active',
        'is_public',
        'created_by',
    ];

    protected $casts = [
        'config' => 'array',
        'branding' => 'array',
        'standing_levels' => 'array',
        'is_active' => 'boolean',
        'is_public' => 'boolean',
    ];

    protected $attributes = [
        'is_active' => true,
        'is_public' => false,
    ];

    // Relationships
    public function creator(): HasOne
    {
        return $this->hasOne(User::class, 'id', 'created_by');
    }

    public function configurations(): HasMany
    {
        return $this->hasMany(TenantConfiguration::class);
    }

    public function scenes(): HasMany
    {
        return $this->hasMany(Scene::class);
    }

    public function decks(): HasMany
    {
        return $this->hasMany(Deck::class);
    }

    public function contexts(): HasMany
    {
        return $this->hasMany(Context::class);
    }

    public function feedback(): HasMany
    {
        return $this->hasMany(Feedback::class);
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

    public function scopeByDomain($query, $domain)
    {
        return $query->where('domain', $domain);
    }

    // Boot method to generate GUID
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($tenant) {
            if (empty($tenant->guid)) {
                $tenant->guid = Str::uuid();
            }
        });
    }

    // Helper methods
    public function getConfig(string $key, $default = null)
    {
        $configs = $this->configurations()->where('key', $key)->get();
        
        if ($configs->isEmpty()) {
            return $default;
        }

        // Return the most specific configuration
        $globalConfig = $configs->where('scope', 'global')->first();
        $contentConfig = $configs->where('scope', 'content')->first();
        $presentationConfig = $configs->where('scope', 'presentation')->first();
        $feedbackConfig = $configs->where('scope', 'feedback')->first();

        // Priority: feedback > presentation > content > global
        if ($feedbackConfig) return $feedbackConfig->value;
        if ($presentationConfig) return $presentationConfig->value;
        if ($contentConfig) return $contentConfig->value;
        if ($globalConfig) return $globalConfig->value;

        return $default;
    }

    public function setConfig(string $key, $value, string $scope = 'global'): void
    {
        $this->configurations()->updateOrCreate(
            ['key' => $key, 'scope' => $scope],
            ['value' => $value]
        );
    }

    public function getBranding(string $key, $default = null)
    {
        return $this->branding[$key] ?? $default;
    }

    public function setBranding(string $key, $value): void
    {
        $branding = $this->branding ?? [];
        $branding[$key] = $value;
        $this->update(['branding' => $branding]);
    }

    public function getLogoUrl(): ?string
    {
        return $this->getBranding('logo_url');
    }

    public function getPrimaryColor(): string
    {
        return $this->getBranding('primary_color', '#3b82f6');
    }

    public function getSecondaryColor(): string
    {
        return $this->getBranding('secondary_color', '#64748b');
    }

    public function getTheme(): string
    {
        return $this->getBranding('theme', 'light');
    }

    public function isDefaultTenant(): bool
    {
        return $this->slug === 'default';
    }

    public function getContentCount(): array
    {
        return [
            'scenes' => $this->scenes()->count(),
            'decks' => $this->decks()->count(),
            'contexts' => $this->contexts()->count(),
            'feedback' => $this->feedback()->count(),
        ];
    }

    public function getDomainUrl(): string
    {
        if ($this->domain) {
            return 'https://' . $this->domain;
        }
        
        // Fallback to slug-based URL
        return config('app.url') . '/tenant/' . $this->slug;
    }

    public function canAccess(User $user): bool
    {
        // Default tenant is accessible to all users
        if ($this->isDefaultTenant()) {
            return true;
        }

        // Check if user has explicit access to this tenant
        // This would be implemented based on your access control system
        return true; // Placeholder - implement actual access control
    }

    public function getPublicUrl(): string
    {
        if ($this->is_public) {
            return $this->getDomainUrl();
        }
        
        return config('app.url') . '/tenant/' . $this->slug;
    }

    /**
     * Get standing level name for a given standing value.
     * Returns tenant-specific name if configured, otherwise returns global default.
     */
    public function getStandingLevelName(int $standing): string
    {
        // If tenant has custom standing levels, use them
        if ($this->standing_levels && is_array($this->standing_levels)) {
            foreach ($this->standing_levels as $level) {
                if (isset($level['min']) && isset($level['name']) && $standing >= $level['min']) {
                    return $level['name'];
                }
            }
        }

        // Fall back to global defaults
        if ($standing >= 900) return 'Guardian';
        if ($standing >= 750) return 'Curator';
        if ($standing >= 600) return 'Steward';
        if ($standing >= 400) return 'Collaborator';
        if ($standing >= 200) return 'Contributor';
        
        return 'Member';
    }

    /**
     * Set custom standing levels for this tenant.
     * Expected format: [['min' => 900, 'name' => 'Custom Level'], ...]
     */
    public function setStandingLevels(array $levels): void
    {
        // Sort levels by min value descending
        usort($levels, function($a, $b) {
            return ($b['min'] ?? 0) - ($a['min'] ?? 0);
        });

        $this->update(['standing_levels' => $levels]);
    }
}
