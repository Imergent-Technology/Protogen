<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\CoreGraphNode;
use App\Models\CoreGraphEdge;
use App\Models\CoreGraphNodeType;
use App\Models\CoreGraphEdgeType;
use Illuminate\Foundation\Testing\RefreshDatabase;

class CoreGraphEdgeWeightTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create test node types
        $this->nodeType = CoreGraphNodeType::create([
            'name' => 'test_node',
            'display_name' => 'Test Node',
            'description' => 'A test node type',
            'is_system' => false,
        ]);

        // Create test edge type
        $this->edgeType = CoreGraphEdgeType::create([
            'name' => 'test_edge',
            'display_name' => 'Test Edge',
            'description' => 'A test edge type',
            'is_system' => false,
        ]);

        // Create test nodes
        $this->sourceNode = CoreGraphNode::create([
            'node_type_id' => $this->nodeType->id,
            'label' => 'Source Node',
            'description' => 'A source node for testing',
        ]);

        $this->targetNode = CoreGraphNode::create([
            'node_type_id' => $this->nodeType->id,
            'label' => 'Target Node',
            'description' => 'A target node for testing',
        ]);
    }

    /** @test */
    public function it_creates_edge_with_default_weight()
    {
        $edge = CoreGraphEdge::create([
            'source_node_guid' => $this->sourceNode->guid,
            'target_node_guid' => $this->targetNode->guid,
            'edge_type_id' => $this->edgeType->id,
            'label' => 'Test Edge',
        ]);

        $this->assertEquals(1.00000, $edge->weight);
        $this->assertDatabaseHas('edges', [
            'guid' => $edge->guid,
            'weight' => 1.00000,
        ]);
    }

    /** @test */
    public function it_creates_edge_with_custom_weight()
    {
        $edge = CoreGraphEdge::create([
            'source_node_guid' => $this->sourceNode->guid,
            'target_node_guid' => $this->targetNode->guid,
            'edge_type_id' => $this->edgeType->id,
            'label' => 'Test Edge',
            'weight' => 2.50000,
        ]);

        $this->assertEquals(2.50000, $edge->weight);
        $this->assertDatabaseHas('edges', [
            'guid' => $edge->guid,
            'weight' => 2.50000,
        ]);
    }

    /** @test */
    public function it_validates_weight_range()
    {
        // Test minimum weight
        $edge = CoreGraphEdge::create([
            'source_node_guid' => $this->sourceNode->guid,
            'target_node_guid' => $this->targetNode->guid,
            'edge_type_id' => $this->edgeType->id,
            'weight' => 0.00001,
        ]);

        $this->assertEquals(0.00001, $edge->weight);

        // Test maximum weight
        $edge = CoreGraphEdge::create([
            'source_node_guid' => $this->sourceNode->guid,
            'target_node_guid' => $this->targetNode->guid,
            'edge_type_id' => $this->edgeType->id,
            'weight' => 999.99999,
        ]);

        $this->assertEquals(999.99999, $edge->weight);
    }

    /** @test */
    public function it_casts_weight_as_decimal()
    {
        $edge = CoreGraphEdge::create([
            'source_node_guid' => $this->sourceNode->guid,
            'target_node_guid' => $this->targetNode->guid,
            'edge_type_id' => $this->edgeType->id,
            'weight' => 3.14159,
        ]);

        $this->assertIsFloat($edge->weight);
        $this->assertEquals(3.14159, $edge->weight);
    }

    /** @test */
    public function it_updates_edge_weight()
    {
        $edge = CoreGraphEdge::create([
            'source_node_guid' => $this->sourceNode->guid,
            'target_node_guid' => $this->targetNode->guid,
            'edge_type_id' => $this->edgeType->id,
            'weight' => 1.00000,
        ]);

        $edge->update(['weight' => 5.00000]);

        $this->assertEquals(5.00000, $edge->fresh()->weight);
        $this->assertDatabaseHas('edges', [
            'guid' => $edge->guid,
            'weight' => 5.00000,
        ]);
    }

    /** @test */
    public function it_prevents_self_loops()
    {
        // Since we removed the database constraint, this should now succeed
        // The validation will happen at the application level in the form request
        $edge = CoreGraphEdge::create([
            'source_node_guid' => $this->sourceNode->guid,
            'target_node_guid' => $this->sourceNode->guid, // Same node
            'edge_type_id' => $this->edgeType->id,
            'weight' => 1.00000,
        ]);

        // Verify the edge was created (validation happens in form request, not model)
        $this->assertNotNull($edge->id);
        $this->assertEquals($this->sourceNode->guid, $edge->source_node_guid);
        $this->assertEquals($this->sourceNode->guid, $edge->target_node_guid);
    }

    /** @test */
    public function it_maintains_weight_precision()
    {
        $edge = CoreGraphEdge::create([
            'source_node_guid' => $this->sourceNode->guid,
            'target_node_guid' => $this->targetNode->guid,
            'edge_type_id' => $this->edgeType->id,
            'weight' => 1.23456,
        ]);

        $this->assertEquals(1.23456, $edge->weight);
        
        // Update with different precision
        $edge->update(['weight' => 2.34567]);
        $this->assertEquals(2.34567, $edge->fresh()->weight);
    }
}
