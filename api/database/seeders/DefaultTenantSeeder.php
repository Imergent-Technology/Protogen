<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Tenant;
use App\Models\TenantConfiguration;
use App\Models\User;

class DefaultTenantSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('Creating Default Tenant...');

        // Get or create admin user for tenant creation
        $adminUser = User::where('is_admin', true)->first();
        if (!$adminUser) {
            $this->command->warn('No admin user found. Creating default tenant without creator.');
            $adminUser = null;
        }

        // Create the default tenant
        $defaultTenant = Tenant::firstOrCreate(
            ['slug' => 'progress'],
            [
                'guid' => \Illuminate\Support\Str::uuid(),
                'name' => 'Progress',
                'description' => 'Default tenant for existing content and new deployments',
                'domain' => config('app.url'),
                'config' => [
                    'is_default' => true,
                    'migration_source' => 'scene_system',
                ],
                'branding' => [
                    'logo_url' => null,
                    'primary_color' => '#3b82f6',
                    'secondary_color' => '#64748b',
                    'theme' => 'light',
                ],
                'is_active' => true,
                'is_public' => true,
                'created_by' => $adminUser?->id,
            ]
        );

        $this->command->info("Default tenant created: {$defaultTenant->name} ({$defaultTenant->slug})");

        // Create default tenant configurations
        $this->createDefaultConfigurations($defaultTenant);

        $this->command->info('Default tenant configurations created successfully.');
    }

    /**
     * Create default configurations for the tenant
     */
    private function createDefaultConfigurations(Tenant $tenant): void
    {
        $configurations = TenantConfiguration::getDefaultConfigurations();

        foreach ($configurations as $scope => $configs) {
            foreach ($configs as $key => $value) {
                TenantConfiguration::firstOrCreate(
                    [
                        'tenant_id' => $tenant->id,
                        'key' => $key,
                        'scope' => $scope,
                    ],
                    [
                        'value' => $value,
                        'description' => "Default {$scope} configuration for {$key}",
                    ]
                );
            }
        }

        $this->command->info("Created {$scope} configurations for default tenant.");
    }
}
