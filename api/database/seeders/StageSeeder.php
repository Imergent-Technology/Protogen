<?php

namespace Database\Seeders;

use App\Models\Stage;
use Illuminate\Database\Seeder;

class StageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $stages = [
            [
                'name' => 'Welcome to Progress',
                'slug' => 'welcome',
                'description' => 'A warm welcome to get you started on your progress journey',
                'type' => 'basic',
                'config' => [
                    'title' => 'Welcome to Progress! 🚀',
                    'content' => 'This is your journey through progress tracking. Each stage represents a step forward in your goals. Ready to get started?',
                    'icon' => '🎯',
                ],
                'is_active' => true,
                'sort_order' => 1,
            ],
            [
                'name' => 'Getting Started',
                'slug' => 'getting-started',
                'description' => 'Learn the basics of using the progress tracking system',
                'type' => 'basic',
                'config' => [
                    'title' => 'Getting Started 📚',
                    'content' => 'Progress tracking is all about breaking down your goals into manageable stages. Each stage can contain different types of content - from simple text to interactive graphs and documents.',
                    'icon' => '📖',
                ],
                'is_active' => true,
                'sort_order' => 2,
            ],
            [
                'name' => 'Your First Goal',
                'slug' => 'first-goal',
                'description' => 'Set up your first goal and start tracking progress',
                'type' => 'basic',
                'config' => [
                    'title' => 'Your First Goal 🎯',
                    'content' => 'Think about what you want to achieve. It could be learning a new skill, completing a project, or building a new habit. Break it down into smaller, achievable stages.',
                    'icon' => '⭐',
                ],
                'is_active' => true,
                'sort_order' => 3,
            ],
        ];

        foreach ($stages as $stageData) {
            Stage::create($stageData);
        }
    }
} 