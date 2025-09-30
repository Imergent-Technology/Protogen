<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Scene;
use App\Models\Subgraph;
use App\Models\SceneItem;
use App\Models\CoreGraphNode;
use App\Models\CoreGraphEdge;
use Illuminate\Support\Str;

class SystemSceneSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('Creating System Scene with new architecture...');

        // Create or find the system scene
        $systemScene = Scene::firstOrCreate(
            ['slug' => 'system-graph'],
            [
                'name' => 'System Graph',
                'slug' => 'system-graph',
                'description' => 'Complete mirror of the Core Graph for system administration',
                'scene_type' => 'graph',
                'config' => [
                    'layout' => 'force_directed',
                    'auto_layout' => true,
                    'show_labels' => true,
                    'show_weights' => true,
                    'node_size' => 'medium',
                    'edge_curvature' => 0.3
                ],
                'is_active' => true,
                'is_public' => true,
                'published_at' => now(),
            ]
        );

        $this->command->info("System Scene created: {$systemScene->name} (ID: {$systemScene->id})");

        // Create a subgraph for the system scene with all core graph nodes
        $this->createSystemSubgraph($systemScene);

        $this->command->info('System Scene setup completed!');
    }

    /**
     * Create a subgraph for the system scene with all core graph nodes
     */
    private function createSystemSubgraph(Scene $scene): void
    {
        // Get the first tenant for the system subgraph
        $tenant = \App\Models\Tenant::first();
        if (!$tenant) {
            $this->command->error('No tenant found. Please run TenantSeeder first.');
            return;
        }

        // Create or find the system subgraph
        $subgraph = Subgraph::firstOrCreate(
            ['name' => 'System Graph Subgraph'],
            [
                'name' => 'System Graph Subgraph',
                'description' => 'Complete mirror of the Core Graph for system administration',
                'tenant_id' => $tenant->id,
                'created_by' => null, // System created
                'is_public' => true,
            ]
        );

        // Link the scene to the subgraph
        $scene->update(['subgraph_id' => $subgraph->id]);

        // Add all core graph nodes to the subgraph
        $coreNodes = CoreGraphNode::all();
        $nodeIds = $coreNodes->pluck('id')->toArray();
        $subgraph->nodes()->sync($nodeIds);

        $this->command->info("Added {$coreNodes->count()} nodes to system subgraph");

        // Create scene items for visual positioning (optional - for custom layouts)
        $this->createSceneItemsForLayout($scene, $coreNodes);
    }

    /**
     * Create scene items for custom layout positioning
     */
    private function createSceneItemsForLayout(Scene $scene, $coreNodes): void
    {
        foreach ($coreNodes as $index => $coreNode) {
            // Check if scene item already exists for this node
            $existingItem = SceneItem::where('scene_id', $scene->id)
                ->where('item_type', 'node')
                ->where('item_id', $coreNode->id)
                ->first();

            if (!$existingItem) {
                // Calculate default position
                $position = $this->calculateDefaultPosition($index);
                
                SceneItem::create([
                    'scene_id' => $scene->id,
                    'item_type' => 'node',
                    'item_id' => $coreNode->id,
                    'item_guid' => $coreNode->guid,
                    'position' => $position,
                    'dimensions' => [
                        'width' => 120,
                        'height' => 80
                    ],
                    'style' => [
                        'fill_color' => '#4F46E5',
                        'stroke_color' => '#3730A3',
                        'text_color' => '#FFFFFF',
                        'font_size' => 12,
                        'border_width' => 2
                    ],
                    'meta' => [
                        'core_node_id' => $coreNode->id,
                        'core_node_type' => $coreNode->node_type,
                        'mirrored_at' => now()->toISOString()
                    ],
                    'z_index' => 1,
                    'is_visible' => true,
                ]);

                $this->command->info("Created Scene Item for Core Node: {$coreNode->label}");
            }
        }
    }

    /**
     * Calculate default position for nodes in a grid layout
     */
    private function calculateDefaultPosition(int $index): array
    {
        $gridSize = 8; // 8x8 grid
        $nodeSpacing = 150;
        
        $x = ($index % $gridSize) * $nodeSpacing;
        $y = intval($index / $gridSize) * $nodeSpacing;
        
        return [
            'x' => $x,
            'y' => $y,
            'z' => 0
        ];
    }
}