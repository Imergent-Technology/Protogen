<?php

namespace Database\Seeders;

use App\Models\Subgraph;
use App\Models\Tenant;
use App\Models\CoreGraphNode;
use Illuminate\Database\Seeder;

class SubgraphSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get the default tenant
        $tenant = Tenant::first();
        
        if (!$tenant) {
            $this->command->warn('No tenant found. Please run TenantSeeder first.');
            return;
        }

        // Create concept subgraph
        $conceptSubgraph = Subgraph::create([
            'name' => 'Concept Graph',
            'description' => 'Core concepts and relationships for knowledge organization',
            'tenant_id' => $tenant->id,
            'is_public' => true
        ]);

        // Create skills subgraph
        $skillsSubgraph = Subgraph::create([
            'name' => 'Skills & Interests',
            'description' => 'User skills, interests, and proficiencies',
            'tenant_id' => $tenant->id,
            'is_public' => true
        ]);

        // Create a sample subgraph for demonstration
        $sampleSubgraph = Subgraph::create([
            'name' => 'Sample Knowledge Graph',
            'description' => 'A sample subgraph demonstrating the central graph system',
            'tenant_id' => $tenant->id,
            'is_public' => false
        ]);

        // Add some core graph nodes to the concept subgraph if they exist
        $conceptNodes = CoreGraphNode::where('label', 'like', '%concept%')
                                   ->orWhere('label', 'like', '%knowledge%')
                                   ->orWhere('label', 'like', '%idea%')
                                   ->limit(5)
                                   ->get();

        foreach ($conceptNodes as $node) {
            $conceptSubgraph->addNode($node);
        }

        // Add some nodes to the skills subgraph
        $skillNodes = CoreGraphNode::where('label', 'like', '%skill%')
                                 ->orWhere('label', 'like', '%interest%')
                                 ->orWhere('label', 'like', '%proficiency%')
                                 ->limit(3)
                                 ->get();

        foreach ($skillNodes as $node) {
            $skillsSubgraph->addNode($node);
        }

        $this->command->info('Created subgraphs: Concept Graph, Skills & Interests, Sample Knowledge Graph');
    }
}