<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Permission extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'category',
        'scope',
        'is_system',
        'is_tenant_scoped',
        'standing_requirement',
    ];

    protected $casts = [
        'is_system' => 'boolean',
        'is_tenant_scoped' => 'boolean',
        'standing_requirement' => 'decimal:2',
    ];

    // Permission categories
    const CATEGORY_SYSTEM = 'system';
    const CATEGORY_TENANT = 'tenant';
    const CATEGORY_CONTENT = 'content';
    const CATEGORY_USER = 'user';

    // Permission scopes
    const SCOPE_GLOBAL = 'global';
    const SCOPE_TENANT = 'tenant';
    const SCOPE_RESOURCE = 'resource';
    const SCOPE_USER = 'user';

    /**
     * Check if this permission is a system permission.
     */
    public function isSystemPermission(): bool
    {
        return $this->is_system;
    }

    /**
     * Check if this permission is tenant-scoped.
     */
    public function isTenantScoped(): bool
    {
        return $this->is_tenant_scoped;
    }

    /**
     * Check if user meets standing requirement for this permission.
     */
    public function userMeetsStandingRequirement(User $user): bool
    {
        if (!$this->standing_requirement) {
            return true;
        }

        return $user->standing >= $this->standing_requirement;
    }

    /**
     * Get permissions by category.
     */
    public function scopeByCategory($query, string $category)
    {
        return $query->where('category', $category);
    }

    /**
     * Get permissions by scope.
     */
    public function scopeByScope($query, string $scope)
    {
        return $query->where('scope', $scope);
    }

    /**
     * Get system permissions.
     */
    public function scopeSystem($query)
    {
        return $query->where('is_system', true);
    }

    /**
     * Get tenant-scoped permissions.
     */
    public function scopeTenantScoped($query)
    {
        return $query->where('is_tenant_scoped', true);
    }
}
