<?php

namespace Database\Factories;

use App\Models\Stage;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Stage>
 */
class StageFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = $this->faker->sentence(3);
        
        return [
            'name' => $name,
            'slug' => Str::slug($name),
            'description' => $this->faker->paragraph(),
            'type' => $this->faker->randomElement(['basic', 'graph', 'document', 'table', 'custom']),
            'config' => [
                'title' => $this->faker->sentence(),
                'content' => $this->faker->paragraphs(2, true),
                'icon' => $this->faker->randomElement(['🎯', '📊', '📄', '📋', '✨', '🚀', '⭐']),
            ],
            'metadata' => [],
            'is_active' => true,
            'sort_order' => $this->faker->numberBetween(1, 100),
        ];
    }

    /**
     * Indicate that the stage is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }

    /**
     * Create a basic stage.
     */
    public function basic(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'basic',
            'config' => [
                'title' => $this->faker->sentence(),
                'content' => $this->faker->paragraphs(2, true),
                'icon' => $this->faker->randomElement(['🎯', '✨', '🚀', '⭐']),
            ],
        ]);
    }

    /**
     * Create a graph stage.
     */
    public function graph(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'graph',
            'config' => [
                'title' => $this->faker->sentence(),
                'content' => 'Interactive graph visualization',
                'icon' => '📊',
                'nodes' => [],
                'edges' => [],
            ],
        ]);
    }
} 