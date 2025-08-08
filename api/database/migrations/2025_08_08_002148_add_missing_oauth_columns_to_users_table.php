<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Make password nullable since OAuth users won't have one
            $table->string('password')->nullable()->change();
            
            // Add reputation field (0-1 float, default 0.5)
            $table->float('reputation')->default(0.5);
            
            // Add is_admin flag
            $table->boolean('is_admin')->default(false);
        });

        // Create OAuth providers table if it doesn't exist
        if (!Schema::hasTable('oauth_providers')) {
            Schema::create('oauth_providers', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained()->onDelete('cascade');
                $table->string('provider'); // 'google', 'facebook', 'instagram', 'bluesky'
                $table->string('provider_id');
                $table->json('provider_data')->nullable();
                $table->timestamps();

                // Ensure each provider ID is unique per provider
                $table->unique(['provider', 'provider_id']);
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('password')->nullable(false)->change();
            $table->dropColumn('reputation');
            $table->dropColumn('is_admin');
        });

        Schema::dropIfExists('oauth_providers');
    }
};
