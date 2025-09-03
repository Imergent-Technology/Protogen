<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        // Create test user if it doesn't exist
        User::firstOrCreate(
            ['email' => 'test@progress.local'],
            [
                'name' => 'Test User',
                'email' => 'test@progress.local',
            ]
        );

        $this->call([
            CoreGraphSystemSeeder::class,
            StageSeeder::class,
            RegistryCatalogSeeder::class,
            SystemSceneSeeder::class,
        ]);
    }
}
