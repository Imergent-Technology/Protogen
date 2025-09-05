<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Scene;
use App\Models\SceneNode;
use App\Models\SceneEdge;
use App\Models\CoreGraphNode;
use App\Models\CoreGraphEdge;
// Stage model removed - Stage system has been completely removed
use Illuminate\Support\Str;

class SystemSceneSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('Creating System Scene...');

        // Stage system removed - no longer needed

        // Create the System Scene
        $systemScene = Scene::firstOrCreate(
            ['scene_type' => 'system'],
            [
                'guid' => Str::uuid(),
                'name' => 'System Scene',
                'slug' => 'system-scene',
                'description' => 'Automatic mirror of the Core Graph - always in sync',
                'scene_type' => 'system',
                'config' => [
                    'auto_sync' => true,
                    'read_only' => true,
                    'description' => 'This scene automatically mirrors the Core Graph structure'
                ],
                'meta' => [
                    'version' => '1.0',
                    'created_by' => 'system',
                    'purpose' => 'core_graph_mirror'
                ],
                'style' => [
                    'theme' => 'system',
                    'layout' => 'auto',
                    'node_spacing' => 100,
                    'edge_curvature' => 0.3
                ],
                'is_active' => true,
                'is_public' => true,
                'published_at' => now(),
            ]
        );

        $this->command->info("System Scene created: {$systemScene->name} (ID: {$systemScene->id})");

        // Mirror Core Graph Nodes to Scene Nodes
        $this->mirrorCoreNodes($systemScene);

        // Mirror Core Graph Edges to Scene Edges
        $this->mirrorCoreEdges($systemScene);

        $this->command->info('System Scene mirroring completed!');
    }

    /**
     * Mirror Core Graph nodes to Scene nodes
     */
    private function mirrorCoreNodes(Scene $scene): void
    {
        $coreNodes = CoreGraphNode::all();
        
        foreach ($coreNodes as $coreNode) {
            // Check if scene node already exists for this core node
            $existingSceneNode = SceneNode::where('scene_id', $scene->id)
                ->where('core_node_guid', $coreNode->guid)
                ->first();

            if (!$existingSceneNode) {
                // Create scene node with default positioning
                $position = $this->calculateDefaultPosition($coreNode->id);
                
                SceneNode::create([
                    'guid' => Str::uuid(),
                    'scene_id' => $scene->id,
                    'core_node_guid' => $coreNode->guid,
                    'node_type' => 'core', // This is a core node mirror
                    'position' => $position,
                    'dimensions' => [
                        'width' => 120,
                        'height' => 80
                    ],
                    'meta' => [
                        'core_node_id' => $coreNode->id,
                        'core_node_type' => $coreNode->node_type,
                        'mirrored_at' => now()->toISOString()
                    ],
                    'style' => [
                        'fill_color' => '#4F46E5',
                        'stroke_color' => '#3730A3',
                        'text_color' => '#FFFFFF',
                        'font_size' => 12,
                        'border_width' => 2
                    ],
                    'z_index' => 1,
                    'is_visible' => true,
                    'is_locked' => true, // System scene nodes are locked
                ]);

                $this->command->info("Created Scene Node for Core Node: {$coreNode->name}");
            }
        }
    }

    /**
     * Mirror Core Graph edges to Scene edges
     */
    private function mirrorCoreEdges(Scene $scene): void
    {
        $coreEdges = CoreGraphEdge::all();
        
        foreach ($coreEdges as $coreEdge) {
            // Check if scene edge already exists for this core edge
            $existingSceneEdge = SceneEdge::where('scene_id', $scene->id)
                ->where('core_edge_guid', $coreEdge->guid)
                ->first();

            if (!$existingSceneEdge) {
                // Get the corresponding scene nodes
                $sourceSceneNode = SceneNode::where('scene_id', $scene->id)
                    ->where('core_node_guid', $coreEdge->source_node_guid)
                    ->first();

                $targetSceneNode = SceneNode::where('scene_id', $scene->id)
                    ->where('core_node_guid', $coreEdge->target_node_guid)
                    ->first();

                if ($sourceSceneNode && $targetSceneNode) {
                    SceneEdge::create([
                        'guid' => Str::uuid(),
                        'scene_id' => $scene->id,
                        'core_edge_guid' => $coreEdge->guid,
                        'source_node_id' => $sourceSceneNode->id,
                        'target_node_id' => $targetSceneNode->id,
                        'edge_type' => 'core', // This is a core edge mirror
                        'path' => [], // Default straight line path
                        'meta' => [
                            'core_edge_id' => $coreEdge->id,
                            'core_edge_type' => $coreEdge->edge_type,
                            'weight' => $coreEdge->weight,
                            'mirrored_at' => now()->toISOString()
                        ],
                        'style' => [
                            'stroke_color' => '#6B7280',
                            'stroke_width' => 2,
                            'arrow_size' => 8,
                            'dash_array' => []
                        ],
                        'is_visible' => true,
                        'is_locked' => true, // System scene edges are locked
                    ]);

                    $this->command->info("Created Scene Edge for Core Edge: {$coreEdge->id}");
                }
            }
        }
    }

    /**
     * Calculate default position for a node based on its ID
     * This creates a simple grid layout
     */
    private function calculateDefaultPosition(int $nodeId): array
    {
        $gridSize = 200;
        $nodesPerRow = 5;
        
        $row = intval(($nodeId - 1) / $nodesPerRow);
        $col = ($nodeId - 1) % $nodesPerRow;
        
        return [
            'x' => $col * $gridSize + 100,
            'y' => $row * $gridSize + 100
        ];
    }
}
