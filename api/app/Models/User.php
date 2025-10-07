<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasApiTokens;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'reputation',      // Community-adjusted quality metric (0-1000)
        'engagement',      // System-maintained activity metric (0-1000)
        'affinity',        // Admin-adjusted community integration metric (0-1000)
        'standing',        // Calculated composite standing (0-1000)
        'trust_level',     // Admin-only trust tracking (0-1000)
        'is_admin',
        'last_active_at',
        'preferences',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'reputation' => 'integer',      // 0-1000
            'engagement' => 'integer',      // 0-1000
            'affinity' => 'integer',        // 0-1000
            'standing' => 'integer',        // 0-1000 (calculated)
            'trust_level' => 'integer',     // 0-1000 (admin-only)
            'is_admin' => 'boolean',
            'last_active_at' => 'datetime',
            'preferences' => 'array',
        ];
    }

    /**
     * Get the OAuth providers for this user.
     */
    public function oauthProviders(): HasMany
    {
        return $this->hasMany(OAuthProvider::class);
    }

    /**
     * Get the feedback created by this user.
     */
    public function feedback(): HasMany
    {
        return $this->hasMany(Feedback::class);
    }

    /**
     * Get the comments created by this user.
     */
    public function feedbackComments(): HasMany
    {
        return $this->hasMany(FeedbackComment::class);
    }

    /**
     * Check if the user is an admin.
     */
    public function isAdmin(): bool
    {
        return $this->is_admin;
    }

    /**
     * Get OAuth provider by name.
     */
    public function getOAuthProvider(string $provider): ?OAuthProvider
    {
        return $this->oauthProviders()->where('provider', $provider)->first();
    }

    /**
     * Check if user has OAuth provider.
     */
    public function hasOAuthProvider(string $provider): bool
    {
        return $this->oauthProviders()->where('provider', $provider)->exists();
    }

    /**
     * Get the roles for this user.
     */
    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'user_roles')
            ->withPivot(['tenant_id', 'granted_by', 'granted_at', 'expires_at'])
            ->withTimestamps();
    }

    /**
     * Get the tenant memberships for this user.
     */
    public function tenantMemberships(): HasMany
    {
        return $this->hasMany(TenantMembership::class);
    }

    /**
     * Check if user has a specific role.
     */
    public function hasRole(string $roleSlug, ?Tenant $tenant = null): bool
    {
        $query = $this->roles()->where('slug', $roleSlug);
        
        if ($tenant) {
            $query->wherePivot('tenant_id', $tenant->id);
        }
        
        return $query->exists();
    }

    /**
     * Check if user has a specific permission.
     */
    public function hasPermission(string $permission, ?Tenant $tenant = null): bool
    {
        // System admin has all permissions
        if ($this->isAdmin()) {
            return true;
        }

        // Check roles for permission
        foreach ($this->roles as $role) {
            if (in_array($permission, $role->permissions ?? [])) {
                // Check if role applies to this tenant
                if (!$tenant || $role->pivot->tenant_id === $tenant->id) {
                    return true;
                }
            }
        }

        // Check tenant membership permissions
        if ($tenant) {
            $membership = $this->tenantMemberships()
                ->where('tenant_id', $tenant->id)
                ->where('status', TenantMembership::STATUS_ACTIVE)
                ->first();
                
            if ($membership && in_array($permission, $membership->permissions ?? [])) {
                return true;
            }
        }

        return false;
    }

    /**
     * Get user's active tenant memberships.
     */
    public function activeTenantMemberships()
    {
        return $this->tenantMemberships()->where('status', TenantMembership::STATUS_ACTIVE);
    }

    /**
     * Update user's last active timestamp.
     */
    public function updateLastActive(): void
    {
        $this->update(['last_active_at' => now()]);
    }

    /**
     * Calculate and update user's standing from R/E/A metrics.
     * Standing = (Reputation + Engagement + Affinity) / 3
     */
    public function calculateStanding(): int
    {
        $standing = (int) round(($this->reputation + $this->engagement + $this->affinity) / 3);
        $this->update(['standing' => min(1000, max(0, $standing))]);
        return $this->standing;
    }

    /**
     * Get the user's standing level name.
     * Uses tenant-specific names if provided, otherwise uses global defaults.
     */
    public function getStandingLevelName(?Tenant $tenant = null): string
    {
        if ($tenant) {
            return $tenant->getStandingLevelName($this->standing);
        }

        // Global default standing levels
        $standing = $this->standing;

        if ($standing >= 900) return 'Guardian';
        if ($standing >= 750) return 'Curator';
        if ($standing >= 600) return 'Steward';
        if ($standing >= 400) return 'Collaborator';
        if ($standing >= 200) return 'Contributor';
        
        return 'Member';
    }

    /**
     * Get the user's standing metrics (visible to user and admins only).
     */
    public function getStandingMetrics(): array
    {
        return [
            'reputation' => $this->reputation,
            'engagement' => $this->engagement,
            'affinity' => $this->affinity,
            'standing' => $this->standing,
            'level_name' => $this->getStandingLevelName(),
        ];
    }

    /**
     * Get trust level (admin-only field).
     */
    public function getTrustLevel(): int
    {
        return $this->trust_level;
    }

    /**
     * Update reputation (community-driven).
     */
    public function updateReputation(int $amount, string $reason = null): void
    {
        $newReputation = min(1000, max(0, $this->reputation + $amount));
        $this->update(['reputation' => $newReputation]);
        $this->calculateStanding();

        // TODO: Log reputation change with reason
    }

    /**
     * Update engagement (system-maintained).
     */
    public function updateEngagement(int $amount, string $reason = null): void
    {
        $newEngagement = min(1000, max(0, $this->engagement + $amount));
        $this->update(['engagement' => $newEngagement]);
        $this->calculateStanding();

        // TODO: Log engagement change with reason
    }

    /**
     * Update affinity (admin-adjusted).
     */
    public function updateAffinity(int $amount, User $admin, string $reason = null): void
    {
        $newAffinity = min(1000, max(0, $this->affinity + $amount));
        $this->update(['affinity' => $newAffinity]);
        $this->calculateStanding();

        // TODO: Log affinity change with admin and reason
    }

    /**
     * Set trust level (admin-only).
     */
    public function setTrustLevel(int $level, User $admin, string $reason = null): void
    {
        $newTrustLevel = min(1000, max(0, $level));
        $this->update(['trust_level' => $newTrustLevel]);

        // TODO: Log trust level change with admin and reason
    }
}
