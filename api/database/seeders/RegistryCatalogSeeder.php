<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\RegistryCatalog;

class RegistryCatalogSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('Seeding registry catalog...');

        $entries = [
            // Core Node metadata
            [
                'scope' => 'core.node',
                'key' => 'tags',
                'type' => 'array',
                'description' => 'Array of tags for categorizing and filtering nodes',
                'default_value' => [],
                'is_presentational' => true,
                'validation_rules' => [
                    'min_length' => 0,
                    'max_length' => 50,
                ],
            ],
            [
                'scope' => 'core.node',
                'key' => 'priority',
                'type' => 'number',
                'description' => 'Numeric priority for sorting and importance',
                'default_value' => 1,
                'is_presentational' => true,
                'validation_rules' => [
                    'min' => 1,
                    'max' => 10,
                ],
            ],
            [
                'scope' => 'core.node',
                'key' => 'status',
                'type' => 'string',
                'description' => 'Current status of the node',
                'default_value' => 'active',
                'is_presentational' => true,
                'validation_rules' => [
                    'enum' => ['active', 'inactive', 'draft', 'archived'],
                ],
            ],
            [
                'scope' => 'core.node',
                'key' => 'metadata',
                'type' => 'object',
                'description' => 'Additional structured metadata for the node',
                'default_value' => null,
                'is_presentational' => false,
                'validation_rules' => null,
            ],

            // Core Edge metadata
            [
                'scope' => 'core.edge',
                'key' => 'strength',
                'type' => 'number',
                'description' => 'Relationship strength indicator (0.0 to 1.0)',
                'default_value' => 1.0,
                'is_presentational' => true,
                'validation_rules' => [
                    'min' => 0.0,
                    'max' => 1.0,
                ],
            ],
            [
                'scope' => 'core.edge',
                'key' => 'confidence',
                'type' => 'number',
                'description' => 'Confidence level in the relationship (0.0 to 1.0)',
                'default_value' => 1.0,
                'is_presentational' => true,
                'validation_rules' => [
                    'min' => 0.0,
                    'max' => 1.0,
                ],
            ],
            [
                'scope' => 'core.edge',
                'key' => 'evidence',
                'type' => 'array',
                'description' => 'Array of evidence supporting this relationship',
                'default_value' => [],
                'is_presentational' => false,
                'validation_rules' => [
                    'min_length' => 0,
                    'max_length' => 100,
                ],
            ],
            [
                'scope' => 'core.edge',
                'key' => 'metadata',
                'type' => 'object',
                'description' => 'Additional structured metadata for the edge',
                'default_value' => null,
                'is_presentational' => false,
                'validation_rules' => null,
            ],

            // Scene Node metadata
            [
                'scope' => 'scene.node',
                'key' => 'position',
                'type' => 'object',
                'description' => 'Position coordinates for the node in the scene',
                'default_value' => ['x' => 0, 'y' => 0, 'z' => 0, 'scale' => 1],
                'is_presentational' => true,
                'validation_rules' => [
                    'required_fields' => ['x', 'y', 'z', 'scale'],
                ],
            ],
            [
                'scope' => 'scene.node',
                'key' => 'style',
                'type' => 'object',
                'description' => 'Visual styling overrides for the node',
                'default_value' => null,
                'is_presentational' => true,
                'validation_rules' => null,
            ],
            [
                'scope' => 'scene.node',
                'key' => 'visibility',
                'type' => 'boolean',
                'description' => 'Whether the node is visible in the scene',
                'default_value' => true,
                'is_presentational' => true,
                'validation_rules' => null,
            ],
            [
                'scope' => 'scene.node',
                'key' => 'metadata',
                'type' => 'object',
                'description' => 'Scene-specific metadata for the node',
                'default_value' => null,
                'is_presentational' => false,
                'validation_rules' => null,
            ],

            // Scene Edge metadata
            [
                'scope' => 'scene.edge',
                'key' => 'style',
                'type' => 'object',
                'description' => 'Visual styling overrides for the edge',
                'default_value' => null,
                'is_presentational' => true,
                'validation_rules' => null,
            ],
            [
                'scope' => 'scene.edge',
                'key' => 'visibility',
                'type' => 'boolean',
                'description' => 'Whether the edge is visible in the scene',
                'default_value' => true,
                'is_presentational' => true,
                'validation_rules' => null,
            ],
            [
                'scope' => 'scene.edge',
                'key' => 'curve',
                'type' => 'string',
                'description' => 'Curve type for edge rendering',
                'default_value' => 'straight',
                'is_presentational' => true,
                'validation_rules' => [
                    'enum' => ['straight', 'curved', 'stepped', 'bezier'],
                ],
            ],
            [
                'scope' => 'scene.edge',
                'key' => 'metadata',
                'type' => 'object',
                'description' => 'Scene-specific metadata for the edge',
                'default_value' => null,
                'is_presentational' => false,
                'validation_rules' => null,
            ],
        ];

        foreach ($entries as $entry) {
            RegistryCatalog::updateOrCreate(
                ['scope' => $entry['scope'], 'key' => $entry['key']],
                $entry
            );
        }

        $this->command->info('Registry catalog seeded successfully.');
        
        // Show summary
        $scopes = RegistryCatalog::select('scope')
            ->distinct()
            ->pluck('scope');
            
        foreach ($scopes as $scope) {
            $count = RegistryCatalog::where('scope', $scope)->count();
            $this->command->info("  {$scope}: {$count} entries");
        }
    }
}
