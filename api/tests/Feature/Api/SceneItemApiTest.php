<?php

namespace Tests\Feature\Api;

use App\Models\SceneItem;
use App\Models\Scene;
use App\Models\CoreGraphNode;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class SceneItemApiTest extends TestCase
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

    public function test_can_list_scene_items()
    {
        $scene = Scene::first();
        
        if (!$scene) {
            $scene = Scene::create([
                'name' => 'Test Scene',
                'slug' => 'test-scene',
                'scene_type' => 'card'
            ]);
        }

        $response = $this->getJson('/api/scene-items?scene_id=' . $scene->id);

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'success',
                    'data',
                    'message'
                ]);
    }

    public function test_can_create_scene_item()
    {
        $scene = Scene::first();
        
        if (!$scene) {
            $scene = Scene::create([
                'name' => 'Test Scene',
                'slug' => 'test-scene',
                'scene_type' => 'card'
            ]);
        }

        $node = CoreGraphNode::first();
        
        if (!$node) {
            $this->markTestSkipped('No core graph nodes available for testing');
        }

        $sceneItemData = [
            'scene_id' => $scene->id,
            'item_type' => 'node',
            'item_id' => $node->id,
            'position' => ['x' => 100, 'y' => 200, 'z' => 0],
            'dimensions' => ['width' => 150, 'height' => 100],
            'style' => ['color' => 'blue'],
            'meta' => ['label' => 'Test Node'],
            'is_visible' => true,
            'z_index' => 1
        ];

        $response = $this->postJson('/api/scene-items', $sceneItemData);

        $response->assertStatus(201)
                ->assertJsonStructure([
                    'success',
                    'data' => [
                        'id',
                        'scene_id',
                        'item_type',
                        'item_id',
                        'position',
                        'dimensions',
                        'style',
                        'meta',
                        'is_visible',
                        'z_index'
                    ],
                    'message'
                ]);

        $this->assertDatabaseHas('scene_items', [
            'scene_id' => $scene->id,
            'item_type' => 'node',
            'item_id' => $node->id
        ]);
    }

    public function test_can_show_scene_item()
    {
        $scene = Scene::first();
        
        if (!$scene) {
            $scene = Scene::create([
                'name' => 'Test Scene',
                'slug' => 'test-scene',
                'scene_type' => 'card'
            ]);
        }

        $node = CoreGraphNode::first();
        
        if (!$node) {
            $this->markTestSkipped('No core graph nodes available for testing');
        }

        $sceneItem = SceneItem::create([
            'scene_id' => $scene->id,
            'item_type' => 'node',
            'item_id' => $node->id,
            'position' => ['x' => 100, 'y' => 200, 'z' => 0],
            'dimensions' => ['width' => 150, 'height' => 100],
            'is_visible' => true,
            'z_index' => 1
        ]);

        $response = $this->getJson('/api/scene-items/' . $sceneItem->id);

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'success',
                    'data' => [
                        'id',
                        'scene_id',
                        'item_type',
                        'item_id',
                        'position',
                        'dimensions',
                        'is_visible',
                        'z_index'
                    ],
                    'message'
                ]);
    }

    public function test_can_update_scene_item()
    {
        $scene = Scene::first();
        
        if (!$scene) {
            $scene = Scene::create([
                'name' => 'Test Scene',
                'slug' => 'test-scene',
                'scene_type' => 'card'
            ]);
        }

        $node = CoreGraphNode::first();
        
        if (!$node) {
            $this->markTestSkipped('No core graph nodes available for testing');
        }

        $sceneItem = SceneItem::create([
            'scene_id' => $scene->id,
            'item_type' => 'node',
            'item_id' => $node->id,
            'position' => ['x' => 100, 'y' => 200, 'z' => 0],
            'dimensions' => ['width' => 150, 'height' => 100],
            'is_visible' => true,
            'z_index' => 1
        ]);

        $updateData = [
            'position' => ['x' => 200, 'y' => 300, 'z' => 1],
            'dimensions' => ['width' => 200, 'height' => 150],
            'style' => ['color' => 'red'],
            'is_visible' => false,
            'z_index' => 2
        ];

        $response = $this->putJson('/api/scene-items/' . $sceneItem->id, $updateData);

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'success',
                    'data',
                    'message'
                ]);

        $this->assertDatabaseHas('scene_items', [
            'id' => $sceneItem->id,
            'is_visible' => false,
            'z_index' => 2
        ]);
    }

    public function test_can_delete_scene_item()
    {
        $scene = Scene::first();
        
        if (!$scene) {
            $scene = Scene::create([
                'name' => 'Test Scene',
                'slug' => 'test-scene',
                'scene_type' => 'card'
            ]);
        }

        $node = CoreGraphNode::first();
        
        if (!$node) {
            $this->markTestSkipped('No core graph nodes available for testing');
        }

        $sceneItem = SceneItem::create([
            'scene_id' => $scene->id,
            'item_type' => 'node',
            'item_id' => $node->id,
            'position' => ['x' => 100, 'y' => 200, 'z' => 0],
            'dimensions' => ['width' => 150, 'height' => 100],
            'is_visible' => true,
            'z_index' => 1
        ]);

        $response = $this->deleteJson('/api/scene-items/' . $sceneItem->id);

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'success',
                    'message'
                ]);

        $this->assertDatabaseMissing('scene_items', [
            'id' => $sceneItem->id
        ]);
    }

    public function test_can_update_scene_item_position()
    {
        $scene = Scene::first();
        
        if (!$scene) {
            $scene = Scene::create([
                'name' => 'Test Scene',
                'slug' => 'test-scene',
                'scene_type' => 'card'
            ]);
        }

        $node = CoreGraphNode::first();
        
        if (!$node) {
            $this->markTestSkipped('No core graph nodes available for testing');
        }

        $sceneItem = SceneItem::create([
            'scene_id' => $scene->id,
            'item_type' => 'node',
            'item_id' => $node->id,
            'position' => ['x' => 100, 'y' => 200, 'z' => 0],
            'dimensions' => ['width' => 150, 'height' => 100],
            'is_visible' => true,
            'z_index' => 1
        ]);

        $positionData = [
            'x' => 300,
            'y' => 400,
            'z' => 2
        ];

        $response = $this->putJson('/api/scene-items/' . $sceneItem->id . '/position', $positionData);

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'success',
                    'data',
                    'message'
                ]);

        $this->assertDatabaseHas('scene_items', [
            'id' => $sceneItem->id,
            'position' => json_encode(['x' => 300, 'y' => 400, 'z' => 2])
        ]);
    }

    public function test_can_update_scene_item_dimensions()
    {
        $scene = Scene::first();
        
        if (!$scene) {
            $scene = Scene::create([
                'name' => 'Test Scene',
                'slug' => 'test-scene',
                'scene_type' => 'card'
            ]);
        }

        $node = CoreGraphNode::first();
        
        if (!$node) {
            $this->markTestSkipped('No core graph nodes available for testing');
        }

        $sceneItem = SceneItem::create([
            'scene_id' => $scene->id,
            'item_type' => 'node',
            'item_id' => $node->id,
            'position' => ['x' => 100, 'y' => 200, 'z' => 0],
            'dimensions' => ['width' => 150, 'height' => 100],
            'is_visible' => true,
            'z_index' => 1
        ]);

        $dimensionsData = [
            'width' => 300,
            'height' => 200
        ];

        $response = $this->putJson('/api/scene-items/' . $sceneItem->id . '/dimensions', $dimensionsData);

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'success',
                    'data',
                    'message'
                ]);

        $this->assertDatabaseHas('scene_items', [
            'id' => $sceneItem->id,
            'dimensions' => json_encode(['width' => 300, 'height' => 200])
        ]);
    }

    public function test_can_get_scene_items_by_type()
    {
        $scene = Scene::first();
        
        if (!$scene) {
            $scene = Scene::create([
                'name' => 'Test Scene',
                'slug' => 'test-scene',
                'scene_type' => 'card'
            ]);
        }

        $response = $this->getJson('/api/scene-items/by-type?scene_id=' . $scene->id . '&item_type=node');

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'success',
                    'data',
                    'message'
                ]);
    }
}