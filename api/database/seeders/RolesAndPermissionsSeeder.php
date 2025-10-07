<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Permission;
use App\Models\Role;

class RolesAndPermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->seedPermissions();
        $this->seedSystemRoles();
        $this->seedTenantRoles();
        $this->seedUserRoles();
    }

    /**
     * Seed all permissions.
     */
    private function seedPermissions(): void
    {
        $permissions = [
            // System permissions
            ['name' => 'Manage System', 'slug' => 'system.manage', 'category' => 'system', 'scope' => 'global', 'is_system' => true],
            ['name' => 'Manage System Settings', 'slug' => 'system.settings', 'category' => 'system', 'scope' => 'global', 'is_system' => true],
            ['name' => 'Manage Tenants', 'slug' => 'system.tenants', 'category' => 'system', 'scope' => 'global', 'is_system' => true],
            ['name' => 'Manage All Users', 'slug' => 'system.users', 'category' => 'system', 'scope' => 'global', 'is_system' => true],
            ['name' => 'Manage Roles', 'slug' => 'system.roles', 'category' => 'system', 'scope' => 'global', 'is_system' => true],
            ['name' => 'View System Analytics', 'slug' => 'system.analytics', 'category' => 'system', 'scope' => 'global', 'is_system' => true],

            // Tenant permissions
            ['name' => 'Manage Tenant', 'slug' => 'tenant.manage', 'category' => 'tenant', 'scope' => 'tenant', 'is_tenant_scoped' => true],
            ['name' => 'Manage Tenant Settings', 'slug' => 'tenant.settings', 'category' => 'tenant', 'scope' => 'tenant', 'is_tenant_scoped' => true],
            ['name' => 'Manage Tenant Users', 'slug' => 'tenant.users', 'category' => 'tenant', 'scope' => 'tenant', 'is_tenant_scoped' => true],
            ['name' => 'Manage Tenant Content', 'slug' => 'tenant.content', 'category' => 'tenant', 'scope' => 'tenant', 'is_tenant_scoped' => true],
            ['name' => 'View Tenant Analytics', 'slug' => 'tenant.analytics', 'category' => 'tenant', 'scope' => 'tenant', 'is_tenant_scoped' => true],
            ['name' => 'Manage Tenant Branding', 'slug' => 'tenant.branding', 'category' => 'tenant', 'scope' => 'tenant', 'is_tenant_scoped' => true],

            // Content permissions
            ['name' => 'Create Content', 'slug' => 'content.create', 'category' => 'content', 'scope' => 'tenant', 'is_tenant_scoped' => true, 'standing_requirement' => 200],
            ['name' => 'Edit Own Content', 'slug' => 'content.edit.own', 'category' => 'content', 'scope' => 'resource', 'is_tenant_scoped' => true, 'standing_requirement' => 200],
            ['name' => 'Edit All Content', 'slug' => 'content.edit.all', 'category' => 'content', 'scope' => 'tenant', 'is_tenant_scoped' => true],
            ['name' => 'Publish Content', 'slug' => 'content.publish', 'category' => 'content', 'scope' => 'tenant', 'is_tenant_scoped' => true, 'standing_requirement' => 400],
            ['name' => 'Delete Content', 'slug' => 'content.delete', 'category' => 'content', 'scope' => 'tenant', 'is_tenant_scoped' => true],
            ['name' => 'Approve Content', 'slug' => 'content.approve', 'category' => 'content', 'scope' => 'tenant', 'is_tenant_scoped' => true],

            // Scene permissions
            ['name' => 'Author Scenes', 'slug' => 'scene.author', 'category' => 'content', 'scope' => 'tenant', 'is_tenant_scoped' => true, 'standing_requirement' => 200],
            ['name' => 'Edit Scenes', 'slug' => 'scene.edit', 'category' => 'content', 'scope' => 'resource', 'is_tenant_scoped' => true, 'standing_requirement' => 200],
            ['name' => 'Publish Scenes', 'slug' => 'scene.publish', 'category' => 'content', 'scope' => 'tenant', 'is_tenant_scoped' => true, 'standing_requirement' => 400],
            ['name' => 'Manage Scenes', 'slug' => 'scene.manage', 'category' => 'content', 'scope' => 'tenant', 'is_tenant_scoped' => true],

            // User permissions
            ['name' => 'Moderate Users', 'slug' => 'user.moderate', 'category' => 'user', 'scope' => 'tenant', 'is_tenant_scoped' => true, 'standing_requirement' => 600],
            ['name' => 'Moderate Content', 'slug' => 'content.moderate', 'category' => 'user', 'scope' => 'tenant', 'is_tenant_scoped' => true, 'standing_requirement' => 600],
            ['name' => 'Beta Access', 'slug' => 'user.beta', 'category' => 'user', 'scope' => 'global', 'standing_requirement' => 750],
            ['name' => 'Export Data', 'slug' => 'user.export', 'category' => 'user', 'scope' => 'user'],
        ];

        foreach ($permissions as $permission) {
            Permission::updateOrCreate(
                ['slug' => $permission['slug']],
                $permission
            );
        }

        $this->command->info('Permissions seeded successfully.');
    }

    /**
     * Seed system-level roles.
     */
    private function seedSystemRoles(): void
    {
        $systemRoles = [
            [
                'name' => 'System Administrator',
                'slug' => 'system.admin',
                'description' => 'Full system access and control',
                'type' => 'system',
                'permissions' => [
                    'system.manage', 'system.settings', 'system.tenants', 
                    'system.users', 'system.roles', 'system.analytics'
                ],
                'is_system' => true,
                'is_earnable' => false,
            ],
            [
                'name' => 'System Moderator',
                'slug' => 'system.moderator',
                'description' => 'System-wide moderation capabilities',
                'type' => 'system',
                'permissions' => [
                    'user.moderate', 'content.moderate', 'system.analytics'
                ],
                'is_system' => true,
                'is_earnable' => true,
                'standing_requirement' => 750,
            ],
        ];

        foreach ($systemRoles as $role) {
            Role::updateOrCreate(
                ['slug' => $role['slug']],
                $role
            );
        }

        $this->command->info('System roles seeded successfully.');
    }

    /**
     * Seed tenant-level roles.
     */
    private function seedTenantRoles(): void
    {
        $tenantRoles = [
            [
                'name' => 'Tenant Administrator',
                'slug' => 'tenant.admin',
                'description' => 'Full tenant administration',
                'type' => 'tenant',
                'permissions' => [
                    'tenant.manage', 'tenant.settings', 'tenant.users', 
                    'tenant.content', 'tenant.analytics', 'tenant.branding',
                    'content.create', 'content.edit.all', 'content.publish', 
                    'content.delete', 'content.approve'
                ],
                'is_system' => false,
                'is_earnable' => false,
            ],
            [
                'name' => 'Content Manager',
                'slug' => 'tenant.content_manager',
                'description' => 'Manage tenant content and approvals',
                'type' => 'tenant',
                'permissions' => [
                    'tenant.content', 'content.create', 'content.edit.all',
                    'content.publish', 'content.approve', 'scene.manage'
                ],
                'is_system' => false,
                'is_earnable' => true,
                'standing_requirement' => 600,
            ],
        ];

        foreach ($tenantRoles as $role) {
            Role::updateOrCreate(
                ['slug' => $role['slug']],
                $role
            );
        }

        $this->command->info('Tenant roles seeded successfully.');
    }

    /**
     * Seed user-level roles.
     */
    private function seedUserRoles(): void
    {
        $userRoles = [
            [
                'name' => 'Content Author',
                'slug' => 'user.content_author',
                'description' => 'Create and edit own content',
                'type' => 'user',
                'permissions' => [
                    'content.create', 'content.edit.own', 'scene.author', 'scene.edit'
                ],
                'is_system' => false,
                'is_earnable' => true,
                'standing_requirement' => 200,
            ],
            [
                'name' => 'Scene Publisher',
                'slug' => 'user.scene_publisher',
                'description' => 'Publish own scenes',
                'type' => 'user',
                'permissions' => [
                    'content.create', 'content.edit.own', 'content.publish',
                    'scene.author', 'scene.edit', 'scene.publish'
                ],
                'is_system' => false,
                'is_earnable' => true,
                'standing_requirement' => 400,
            ],
            [
                'name' => 'Community Moderator',
                'slug' => 'user.moderator',
                'description' => 'Moderate community content and users',
                'type' => 'user',
                'permissions' => [
                    'user.moderate', 'content.moderate'
                ],
                'is_system' => false,
                'is_earnable' => true,
                'standing_requirement' => 600,
            ],
            [
                'name' => 'Beta Tester',
                'slug' => 'user.beta_tester',
                'description' => 'Access to beta features',
                'type' => 'user',
                'permissions' => [
                    'user.beta'
                ],
                'is_system' => false,
                'is_earnable' => true,
                'standing_requirement' => 750,
            ],
        ];

        foreach ($userRoles as $role) {
            Role::updateOrCreate(
                ['slug' => $role['slug']],
                $role
            );
        }

        $this->command->info('User roles seeded successfully.');
    }
}
