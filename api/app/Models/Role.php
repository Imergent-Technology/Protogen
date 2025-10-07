<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Role extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'type',
        'tenant_id',
        'permissions',
        'is_system',
        'is_earnable',
        'standing_requirement',
    ];

    protected $casts = [
        'permissions' => 'array',
        'is_system' => 'boolean',
        'is_earnable' => 'boolean',
        'standing_requirement' => 'decimal:2',
    ];

    // Role types
    const TYPE_SYSTEM = 'system';
    const TYPE_TENANT = 'tenant';
    const TYPE_USER = 'user';

    /**
     * Get the users that have this role.
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_roles')
            ->withPivot(['tenant_id', 'granted_by', 'granted_at', 'expires_at'])
            ->withTimestamps();
    }

    /**
     * Get the tenant that owns this role.
     */
    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    /**
     * Check if this role is a system role.
     */
    public function isSystemRole(): bool
    {
        return $this->is_system;
    }

    /**
     * Check if this role can be earned by users.
     */
    public function isEarnable(): bool
    {
        return $this->is_earnable;
    }

    /**
     * Check if user meets standing requirement for this role.
     */
    public function userMeetsStandingRequirement(User $user): bool
    {
        if (!$this->standing_requirement) {
            return true;
        }

        return $user->standing >= $this->standing_requirement;
    }

    /**
     * Get users with this role in a specific tenant.
     */
    public function usersInTenant(Tenant $tenant)
    {
        return $this->users()->wherePivot('tenant_id', $tenant->id);
    }
}
