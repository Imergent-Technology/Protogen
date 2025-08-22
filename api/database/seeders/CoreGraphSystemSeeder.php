<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\CoreGraphNodeType;
use App\Models\CoreGraphEdgeType;

class CoreGraphSystemSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create system node types
        $nodeTypes = [
            [
                'name' => 'stage',
                'display_name' => 'Stage',
                'description' => 'A stage in the system',
                'icon' => 'layers',
                'icon_color' => '#3b82f6',
                'is_system' => true,
            ],
            [
                'name' => 'user',
                'display_name' => 'User',
                'description' => 'A user in the system',
                'icon' => 'user',
                'icon_color' => '#10b981',
                'is_system' => true,
            ],
            [
                'name' => 'document',
                'display_name' => 'Document',
                'description' => 'A document or content piece',
                'icon' => 'file-text',
                'icon_color' => '#f59e0b',
                'is_system' => true,
            ],
            [
                'name' => 'concept',
                'display_name' => 'Concept',
                'description' => 'A general concept or idea',
                'icon' => 'lightbulb',
                'icon_color' => '#8b5cf6',
                'is_system' => true,
            ],
            [
                'name' => 'resource',
                'display_name' => 'Resource',
                'description' => 'A resource or reference',
                'icon' => 'bookmark',
                'icon_color' => '#ef4444',
                'is_system' => true,
            ],
        ];

        foreach ($nodeTypes as $nodeType) {
            CoreGraphNodeType::updateOrCreate(
                ['name' => $nodeType['name']],
                $nodeType
            );
        }

        // Create system edge types
        $edgeTypes = [
            [
                'name' => 'references',
                'display_name' => 'References',
                'description' => 'One node references another',
                'color' => '#3b82f6',
                'is_system' => true,
            ],
            [
                'name' => 'depends_on',
                'display_name' => 'Depends On',
                'description' => 'One node depends on another',
                'color' => '#ef4444',
                'is_system' => true,
            ],
            [
                'name' => 'contains',
                'display_name' => 'Contains',
                'description' => 'One node contains another',
                'color' => '#10b981',
                'is_system' => true,
            ],
            [
                'name' => 'related_to',
                'display_name' => 'Related To',
                'description' => 'Nodes are related to each other',
                'color' => '#8b5cf6',
                'is_system' => true,
            ],
            [
                'name' => 'leads_to',
                'display_name' => 'Leads To',
                'description' => 'One node leads to another',
                'color' => '#f59e0b',
                'is_system' => true,
            ],
        ];

        foreach ($edgeTypes as $edgeType) {
            CoreGraphEdgeType::updateOrCreate(
                ['name' => $edgeType['name']],
                $edgeType
            );
        }
    }
}
