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
            ['email' => 'test@protogen.local'],
            [
                'name' => 'Test User',
                'email' => 'test@protogen.local',
            ]
        );

       // Create admin user for demo
        User::firstOrCreate(
            ['email' => 'admin@protogen.local'],
            [
                'name' => 'Admin User',
                'email' => 'admin@protogen.local',
                'password' => bcrypt('KeepCodeFlowin#333'),
                'is_admin' => true,
            ]
        );

        $this->call([
            CoreGraphSystemSeeder::class,
            DefaultTenantSeeder::class,
            RegistryCatalogSeeder::class,
            SystemSceneSeeder::class,
            SubgraphSeeder::class,
        ]);
    }
}
