<?php

namespace Tests\Feature\Api;

use App\Models\Subgraph;
use App\Models\Tenant;
use App\Models\CoreGraphNode;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class SubgraphApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create a test user and authenticate
        $user = User::create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => bcrypt('password'),
            'is_admin' => true
        ]);
        
        // Ensure the user is properly saved with admin status
        $user->refresh();
        
        Sanctum::actingAs($user);
    }

    public function test_can_list_subgraphs()
    {
        $tenant = Tenant::first();
        
        if (!$tenant) {
            $tenant = Tenant::create([
                'name' => 'Test Tenant',
                'slug' => 'test-tenant',
                'description' => 'A test tenant'
            ]);
        }

        $response = $this->getJson('/api/subgraphs?tenant_id=' . $tenant->id);

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'success',
                    'data',
                    'message'
                ]);
    }

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

        $subgraphData = [
            'name' => 'Test Subgraph',
            'description' => 'A test subgraph',
            'tenant_id' => $tenant->id,
            'is_public' => true
        ];

        $response = $this->postJson('/api/subgraphs', $subgraphData);

        $response->assertStatus(201)
                ->assertJsonStructure([
                    'success',
                    'data' => [
                        'id',
                        'name',
                        'description',
                        'tenant_id',
                        'is_public',
                        'guid'
                    ],
                    'message'
                ]);

        $this->assertDatabaseHas('subgraphs', [
            'name' => 'Test Subgraph',
            'tenant_id' => $tenant->id
        ]);
    }

    public function test_can_show_subgraph()
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

        $response = $this->getJson('/api/subgraphs/' . $subgraph->id);

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'success',
                    'data' => [
                        'id',
                        'name',
                        'description',
                        'tenant_id',
                        'is_public',
                        'guid'
                    ],
                    'message'
                ]);
    }

    public function test_can_update_subgraph()
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
            'is_public' => false
        ]);

        $updateData = [
            'name' => 'Updated Subgraph',
            'description' => 'Updated description',
            'is_public' => true
        ];

        $response = $this->putJson('/api/subgraphs/' . $subgraph->id, $updateData);

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'success',
                    'data',
                    'message'
                ]);

        $this->assertDatabaseHas('subgraphs', [
            'id' => $subgraph->id,
            'name' => 'Updated Subgraph',
            'is_public' => true
        ]);
    }

    public function test_can_delete_subgraph()
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

        $response = $this->deleteJson('/api/subgraphs/' . $subgraph->id);

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'success',
                    'message'
                ]);

        $this->assertDatabaseMissing('subgraphs', [
            'id' => $subgraph->id
        ]);
    }

    public function test_can_add_node_to_subgraph()
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

        $response = $this->postJson('/api/subgraphs/' . $subgraph->id . '/nodes', [
            'node_id' => $node->id
        ]);

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'success',
                    'message'
                ]);

        $this->assertTrue($subgraph->hasNode($node));
    }

    public function test_can_remove_node_from_subgraph()
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

        $response = $this->deleteJson('/api/subgraphs/' . $subgraph->id . '/nodes', [
            'node_id' => $node->id
        ]);

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'success',
                    'message'
                ]);

        $this->assertFalse($subgraph->hasNode($node));
    }

    public function test_can_get_subgraph_edges()
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

        $response = $this->getJson('/api/subgraphs/' . $subgraph->id . '/edges');

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'success',
                    'data',
                    'message'
                ]);
    }

    public function test_can_get_subgraph_nodes()
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

        $response = $this->getJson('/api/subgraphs/' . $subgraph->id . '/nodes');

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'success',
                    'data',
                    'message'
                ]);
    }
}