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
        'reputation',
        'is_admin',
        'standing',
        'trust_level',
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
            'reputation' => 'float',
            'is_admin' => 'boolean',
            'standing' => 'decimal:2',
            'trust_level' => 'integer',
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
}
