# Comprehensive Auth System Design

## 🎯 **Overview**

This document outlines the design for a comprehensive authentication and authorization system that builds upon the existing OAuth infrastructure to support admin migration, tenant management, and user advancement capabilities.

## 🏗️ **Current System Analysis**

### **✅ Existing Infrastructure**
- **OAuth Authentication**: Google OAuth working with Laravel Socialite
- **User Model**: Basic user with `is_admin` boolean and `reputation` float
- **Tenant System**: Full tenant model with branding, configuration, and relationships
- **Sanctum Tokens**: JWT-based API authentication
- **Frontend Auth**: OAuth token handling in Portal

### **❌ Missing Components**
- Role-based permissions system
- User-tenant relationships
- Permission inheritance
- Admin capabilities in Portal
- User advancement system

## 🔐 **Enhanced Auth Architecture**

### **1. User Model Extensions**

```php
// Enhanced User model
class User extends Authenticatable
{
    // Existing fields
    protected $fillable = [
        'name', 'email', 'password', 'reputation', 'is_admin',
        // New fields
        'standing', 'trust_level', 'last_active_at', 'preferences'
    ];

    protected $casts = [
        'standing' => 'float',
        'trust_level' => 'integer',
        'last_active_at' => 'datetime',
        'preferences' => 'array',
    ];

    // New relationships
    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'user_roles')
            ->withPivot(['tenant_id', 'granted_by', 'granted_at', 'expires_at'])
            ->withTimestamps();
    }

    public function tenantMemberships(): HasMany
    {
        return $this->hasMany(TenantMembership::class);
    }

    public function permissions(): HasMany
    {
        return $this->hasMany(UserPermission::class);
    }

    public function standingHistory(): HasMany
    {
        return $this->hasMany(StandingHistory::class);
    }
}
```

### **2. Role System**

```php
// Role model
class Role extends Model
{
    protected $fillable = [
        'name', 'slug', 'description', 'type', 'tenant_id',
        'permissions', 'is_system', 'is_earnable', 'standing_requirement'
    ];

    protected $casts = [
        'permissions' => 'array',
        'is_system' => 'boolean',
        'is_earnable' => 'boolean',
        'standing_requirement' => 'float',
    ];

    // Role types
    const TYPE_SYSTEM = 'system';
    const TYPE_TENANT = 'tenant';
    const TYPE_USER = 'user';

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_roles')
            ->withPivot(['tenant_id', 'granted_by', 'granted_at', 'expires_at']);
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }
}
```

### **3. Tenant Membership System**

```php
// TenantMembership model
class TenantMembership extends Model
{
    protected $fillable = [
        'user_id', 'tenant_id', 'role', 'status', 'joined_at',
        'invited_by', 'permissions', 'standing_in_tenant'
    ];

    protected $casts = [
        'joined_at' => 'datetime',
        'permissions' => 'array',
        'standing_in_tenant' => 'float',
    ];

    // Membership statuses
    const STATUS_ACTIVE = 'active';
    const STATUS_PENDING = 'pending';
    const STATUS_SUSPENDED = 'suspended';
    const STATUS_LEFT = 'left';

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function inviter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'invited_by');
    }
}
```

### **4. Permission System**

```php
// Permission model
class Permission extends Model
{
    protected $fillable = [
        'name', 'slug', 'description', 'category', 'scope',
        'is_system', 'is_tenant_scoped', 'standing_requirement'
    ];

    protected $casts = [
        'is_system' => 'boolean',
        'is_tenant_scoped' => 'boolean',
        'standing_requirement' => 'float',
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
}
```

## 👥 **Role Hierarchy Design**

### **System-Level Roles**

#### **1. System Administrator**
```php
$systemAdmin = [
    'name' => 'System Administrator',
    'slug' => 'system.admin',
    'type' => Role::TYPE_SYSTEM,
    'permissions' => [
        'system.manage',
        'system.settings',
        'system.tenants',
        'system.users',
        'system.roles',
        'system.analytics',
    ],
    'is_system' => true,
    'is_earnable' => false,
];
```

#### **2. System Moderator**
```php
$systemModerator = [
    'name' => 'System Moderator',
    'slug' => 'system.moderator',
    'type' => Role::TYPE_SYSTEM,
    'permissions' => [
        'system.users.moderate',
        'system.content.moderate',
        'system.analytics.view',
    ],
    'is_system' => true,
    'is_earnable' => true,
    'standing_requirement' => 85.0,
];
```

### **Tenant-Level Roles**

#### **1. Tenant Administrator**
```php
$tenantAdmin = [
    'name' => 'Tenant Administrator',
    'slug' => 'tenant.admin',
    'type' => Role::TYPE_TENANT,
    'permissions' => [
        'tenant.manage',
        'tenant.settings',
        'tenant.users',
        'tenant.content',
        'tenant.analytics',
        'tenant.branding',
        'tenant.integrations',
    ],
    'is_system' => false,
    'is_earnable' => false,
];
```

#### **2. Tenant Content Manager**
```php
$tenantContentManager = [
    'name' => 'Content Manager',
    'slug' => 'tenant.content_manager',
    'type' => Role::TYPE_TENANT,
    'permissions' => [
        'tenant.content.manage',
        'tenant.content.approve',
        'tenant.users.content',
        'tenant.analytics.content',
    ],
    'is_system' => false,
    'is_earnable' => true,
    'standing_requirement' => 70.0,
];
```

### **User-Level Roles**

#### **1. Content Author**
```php
$contentAuthor = [
    'name' => 'Content Author',
    'slug' => 'user.content_author',
    'type' => Role::TYPE_USER,
    'permissions' => [
        'content.create',
        'content.edit.own',
        'content.publish.own',
        'scene.author',
    ],
    'is_system' => false,
    'is_earnable' => true,
    'standing_requirement' => 60.0,
];
```

#### **2. Community Moderator**
```php
$communityModerator = [
    'name' => 'Community Moderator',
    'slug' => 'user.moderator',
    'type' => Role::TYPE_USER,
    'permissions' => [
        'user.moderate',
        'content.moderate',
        'feedback.moderate',
    ],
    'is_system' => false,
    'is_earnable' => true,
    'standing_requirement' => 80.0,
];
```

## 🎓 **User Advancement System**

### **Standing Calculation**

```php
class StandingCalculator
{
    public function calculateUserStanding(User $user): float
    {
        $scores = [
            'engagement' => $this->calculateEngagementStanding($user),
            'content' => $this->calculateContentStanding($user),
            'community' => $this->calculateCommunityStanding($user),
            'consistency' => $this->calculateConsistencyStanding($user),
        ];

        // Weighted average
        $weights = [
            'engagement' => 0.3,
            'content' => 0.4,
            'community' => 0.2,
            'consistency' => 0.1,
        ];

        return array_sum(array_map(function($score, $weight) {
            return $score * $weight;
        }, $scores, $weights));
    }

    private function calculateEngagementStanding(User $user): float
    {
        // Based on comments, likes, shares, time spent
        $engagementScore = $user->feedbackComments()->count() * 0.1;
        $engagementScore += $user->feedback()->where('type', 'like')->count() * 0.05;
        
        return min(100, $engagementScore);
    }

    private function calculateContentStanding(User $user): float
    {
        // Based on scene creation, quality, user engagement
        $scenesCreated = $user->scenes()->count();
        $totalEngagement = $user->scenes()->withSum('feedback', 'engagement_score')->sum('feedback_sum_engagement_score');
        
        return min(100, ($scenesCreated * 10) + ($totalEngagement * 0.1));
    }

    private function calculateCommunityStanding(User $user): float
    {
        // Based on helpfulness, moderation, bug reports
        $helpfulComments = $user->feedbackComments()->where('is_helpful', true)->count();
        $moderationActions = $user->moderationActions()->count();
        
        return min(100, ($helpfulComments * 2) + ($moderationActions * 5));
    }

    private function calculateConsistencyStanding(User $user): float
    {
        // Based on regular activity, login frequency
        $daysActive = $user->standingHistory()->distinct('created_at')->count();
        $accountAge = $user->created_at->diffInDays(now());
        
        return min(100, ($daysActive / $accountAge) * 100);
    }
}
```

### **Earned Permission System**

```php
class PermissionEarnedService
{
    public function checkAndGrantEarnedRoles(User $user): array
    {
        $grantedRoles = [];
        $currentStanding = $user->standing;

        $earnableRoles = Role::where('is_earnable', true)
            ->where('standing_requirement', '<=', $currentStanding)
            ->get();

        foreach ($earnableRoles as $role) {
            if (!$user->hasRole($role->slug)) {
                $this->grantRole($user, $role);
                $grantedRoles[] = $role;
            }
        }

        return $grantedRoles;
    }

    private function grantRole(User $user, Role $role): void
    {
        $user->roles()->attach($role->id, [
            'granted_by' => null, // System granted
            'granted_at' => now(),
            'expires_at' => null, // Permanent until standing drops
        ]);

        // Log the role grant
        StandingHistory::create([
            'user_id' => $user->id,
            'action' => 'role_granted',
            'details' => ['role' => $role->slug],
            'standing_before' => $user->standing,
            'standing_after' => $user->standing,
        ]);
    }
}
```

## 🔒 **Permission Checking System**

### **Permission Middleware**

```php
class CheckPermission
{
    public function handle(Request $request, Closure $next, string $permission, string $scope = 'global')
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        $context = $this->buildPermissionContext($request, $user);
        
        if (!$this->hasPermission($user, $permission, $context)) {
            return response()->json(['error' => 'Insufficient permissions'], 403);
        }

        return $next($request);
    }

    private function buildPermissionContext(Request $request, User $user): array
    {
        $context = [
            'user' => $user,
            'tenant' => $this->resolveTenant($request),
            'resource' => $this->resolveResource($request),
        ];

        return $context;
    }

    private function hasPermission(User $user, string $permission, array $context): bool
    {
        // Check system admin
        if ($user->isAdmin()) {
            return true;
        }

        // Check user roles
        foreach ($user->roles as $role) {
            if (in_array($permission, $role->permissions)) {
                // Check role scope
                if ($this->checkRoleScope($role, $context)) {
                    return true;
                }
            }
        }

        // Check direct user permissions
        $userPermission = $user->permissions()
            ->where('permission', $permission)
            ->where('is_active', true)
            ->first();

        if ($userPermission && $this->checkPermissionScope($userPermission, $context)) {
            return true;
        }

        return false;
    }
}
```

## 🏢 **Tenant Admin Capabilities**

### **Tenant Management Interface**

```typescript
// Frontend tenant admin interface
interface TenantAdminCapabilities {
  settings: {
    branding: boolean;
    domain: boolean;
    integrations: boolean;
    features: boolean;
  };
  users: {
    invite: boolean;
    manage: boolean;
    roles: boolean;
    analytics: boolean;
  };
  content: {
    approve: boolean;
    moderate: boolean;
    analytics: boolean;
    workflows: boolean;
  };
  analytics: {
    usage: boolean;
    performance: boolean;
    custom: boolean;
    export: boolean;
  };
}
```

### **Tenant Admin API Endpoints**

```php
// Tenant admin routes
Route::middleware(['auth:sanctum', 'permission:tenant.manage'])->group(function () {
    // Tenant settings
    Route::put('/tenants/{tenant}/settings', [TenantAdminController::class, 'updateSettings']);
    Route::put('/tenants/{tenant}/branding', [TenantAdminController::class, 'updateBranding']);
    Route::put('/tenants/{tenant}/integrations', [TenantAdminController::class, 'updateIntegrations']);
    
    // User management
    Route::post('/tenants/{tenant}/users/invite', [TenantAdminController::class, 'inviteUser']);
    Route::put('/tenants/{tenant}/users/{user}/role', [TenantAdminController::class, 'updateUserRole']);
    Route::get('/tenants/{tenant}/users', [TenantAdminController::class, 'listUsers']);
    
    // Content management
    Route::get('/tenants/{tenant}/content/pending', [TenantAdminController::class, 'pendingContent']);
    Route::post('/tenants/{tenant}/content/{content}/approve', [TenantAdminController::class, 'approveContent']);
    Route::get('/tenants/{tenant}/analytics', [TenantAdminController::class, 'analytics']);
});
```

## 🚀 **Implementation Roadmap**

### **Phase 1: Database & Models (Week 1-2)**
- Create role, permission, and membership models
- Database migrations for new tables
- Update User model with new relationships
- Seed default roles and permissions

### **Phase 2: Permission System (Week 2-3)**
- Implement permission checking middleware
- Create permission service classes
- Update API routes with permission middleware
- Frontend permission checking utilities

### **Phase 3: Portal Admin Interface (Week 3-4)**
- Create admin dashboard components
- Implement role-based navigation
- Build tenant management interfaces
- User management tools

### **Phase 4: User Advancement (Week 4-5)**
- Standing calculation system
- Earned role automation
- User advancement UI
- Standing history tracking

### **Phase 5: Admin Migration (Week 5-6)**
- Migrate admin functionality to Portal
- Update authentication flows
- Test and validate all permissions
- Admin project deprecation

## 🎯 **Success Metrics**

### **Technical Metrics**
- Permission check performance (< 50ms)
- Role assignment accuracy (100%)
- Standing calculation consistency
- API response times maintained

### **User Experience Metrics**
- Admin task completion rates
- User advancement engagement
- Permission clarity and transparency
- Reduced support tickets

### **Business Metrics**
- Tenant satisfaction scores
- User retention improvements
- Content quality metrics
- System maintainability

---

**Next Steps:**
1. Create database migrations for new models
2. Implement basic role and permission system
3. Build Portal admin interface foundation
4. Begin gradual admin functionality migration
