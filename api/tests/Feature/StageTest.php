<?php

namespace Tests\Feature;

use App\Models\Stage;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StageTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_view_stages_index(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->get('/stages');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('stages/index')
            ->has('stages')
            ->has('availableTypes')
        );
    }

    public function test_user_can_view_fallback_stage(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->get('/stages/fallback');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('stages/show')
            ->has('stage')
            ->where('isFallback', true)
        );
    }

    public function test_user_can_view_specific_stage(): void
    {
        $user = User::factory()->create();
        $stage = Stage::factory()->create([
            'name' => 'Test Stage',
            'slug' => 'test-stage',
            'type' => 'basic',
            'config' => [
                'title' => 'Test Title',
                'content' => 'Test content',
                'icon' => '🎯',
            ],
            'is_active' => true,
        ]);

        $response = $this->actingAs($user)
            ->get("/stages/{$stage->slug}");

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('stages/show')
            ->has('stage')
            ->where('stage.name', 'Test Stage')
            ->where('isFallback', false)
        );
    }

    public function test_inactive_stage_returns_404(): void
    {
        $user = User::factory()->create();
        $stage = Stage::factory()->create([
            'is_active' => false,
        ]);

        $response = $this->actingAs($user)
            ->get("/stages/{$stage->slug}");

        $response->assertStatus(404);
    }
} 