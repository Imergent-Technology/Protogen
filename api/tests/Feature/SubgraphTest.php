<?php

namespace Tests\Feature;

use App\Models\Subgraph;
use App\Models\CoreGraphNode;
use App\Models\Tenant;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SubgraphTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_create_subgraph()
    {
        $tenant = Tenant::first();
        
        if (!$tenant) {
            $tenant = Tenant::create([
                'name' => 'Test Tenant',
                'slug' => 'test-tenant',
                'description' => 'A test tenant'
            ]);
        }
        
        $subgraph = Subgraph::create([
            'name' => 'Test Subgraph',
            'description' => 'A test subgraph',
            'tenant_id' => $tenant->id,
            'is_public' => true
        ]);

        $this->assertDatabaseHas('subgraphs', [
            'name' => 'Test Subgraph',
            'tenant_id' => $tenant->id,
            'is_public' => true
        ]);

        $this->assertNotNull($subgraph->guid);
    }

    public function test_can_add_nodes_to_subgraph()
    {
        $tenant = Tenant::first();
        
        if (!$tenant) {
            $tenant = Tenant::create([
                'name' => 'Test Tenant',
                'slug' => 'test-tenant',
                'description' => 'A test tenant'
            ]);
        }
        
        $subgraph = Subgraph::create([
            'name' => 'Test Subgraph',
            'tenant_id' => $tenant->id
        ]);
        
        $node1 = CoreGraphNode::first();
        $node2 = CoreGraphNode::skip(1)->first();
        
        if (!$node1 || !$node2) {
            $this->markTestSkipped('No core graph nodes available for testing');
        }

        $subgraph->addNode($node1);
        $subgraph->addNode($node2);

        $this->assertTrue($subgraph->hasNode($node1));
        $this->assertTrue($subgraph->hasNode($node2));
        $this->assertEquals(2, $subgraph->nodes()->count());
    }

    public function test_can_remove_nodes_from_subgraph()
    {
        $tenant = Tenant::first();
        
        if (!$tenant) {
            $tenant = Tenant::create([
                'name' => 'Test Tenant',
                'slug' => 'test-tenant',
                'description' => 'A test tenant'
            ]);
        }
        
        $subgraph = Subgraph::create([
            'name' => 'Test Subgraph',
            'tenant_id' => $tenant->id
        ]);
        
        $node = CoreGraphNode::first();
        
        if (!$node) {
            $this->markTestSkipped('No core graph nodes available for testing');
        }
        
        $subgraph->addNode($node);

        $this->assertTrue($subgraph->hasNode($node));

        $subgraph->removeNode($node);

        $this->assertFalse($subgraph->hasNode($node));
        $this->assertEquals(0, $subgraph->nodes()->count());
    }

    public function test_can_get_edges_between_nodes_in_subgraph()
    {
        $tenant = Tenant::first();
        
        if (!$tenant) {
            $tenant = Tenant::create([
                'name' => 'Test Tenant',
                'slug' => 'test-tenant',
                'description' => 'A test tenant'
            ]);
        }
        
        $subgraph = Subgraph::create([
            'name' => 'Test Subgraph',
            'tenant_id' => $tenant->id
        ]);
        
        $node1 = CoreGraphNode::first();
        $node2 = CoreGraphNode::skip(1)->first();
        
        if (!$node1 || !$node2) {
            $this->markTestSkipped('No core graph nodes available for testing');
        }
        
        $subgraph->addNode($node1);
        $subgraph->addNode($node2);

        // Create an edge between the nodes
        $edge = \App\Models\CoreGraphEdge::create([
            'source_node_guid' => $node1->guid,
            'target_node_guid' => $node2->guid,
            'edge_type_id' => 1, // Assuming edge type 1 exists
            'weight' => 1.0
        ]);

        $edges = $subgraph->getEdges();
        
        $this->assertCount(1, $edges);
        $this->assertEquals($edge->id, $edges->first()->id);
    }
}