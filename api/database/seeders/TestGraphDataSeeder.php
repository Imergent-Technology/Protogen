<?php

namespace Database\Seeders;

use App\Models\CoreGraphNode;
use App\Models\CoreGraphNodeType;
use App\Models\CoreGraphEdge;
use App\Models\CoreGraphEdgeType;
use App\Models\Subgraph;
use App\Models\Scene;
use Illuminate\Database\Seeder;

class TestGraphDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get the first node type
        $nodeType = CoreGraphNodeType::first();
        
        if (!$nodeType) {
            $this->command->warn('No node types found. Please run CoreGraphSystemSeeder first.');
            return;
        }

        // Create test nodes
        $node1 = CoreGraphNode::create([
            'guid' => '550e8400-e29b-41d4-a716-446655440001',
            'node_type_id' => $nodeType->id,
            'label' => 'Machine Learning',
            'description' => 'A branch of artificial intelligence focused on algorithms that can learn from data',
            'is_active' => true
        ]);

        $node2 = CoreGraphNode::create([
            'guid' => '550e8400-e29b-41d4-a716-446655440002',
            'node_type_id' => $nodeType->id,
            'label' => 'Neural Networks',
            'description' => 'Computing systems inspired by biological neural networks',
            'is_active' => true
        ]);

        $node3 = CoreGraphNode::create([
            'guid' => '550e8400-e29b-41d4-a716-446655440003',
            'node_type_id' => $nodeType->id,
            'label' => 'Deep Learning',
            'description' => 'A subset of machine learning using neural networks with multiple layers',
            'is_active' => true
        ]);

        // Get the first subgraph and add nodes to it
        $subgraph = Subgraph::first();
        if ($subgraph) {
            $subgraph->nodes()->attach([$node1->id, $node2->id, $node3->id]);
            $this->command->info("Added 3 test nodes to subgraph: {$subgraph->name}");
        }

        // Skip edges for now due to observer issues
        $this->command->info('Skipping edge creation due to observer issues');

        $this->command->info('Test graph data created successfully!');
    }
}
