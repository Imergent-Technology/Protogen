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
        Schema::create('decks', function (Blueprint $table) {
            $table->id();
            $table->uuid('guid')->unique()->index();
            $table->string('name');
            $table->string('slug')->unique()->index();
            $table->text('description')->nullable();
            $table->string('type')->default('graph'); // 'graph', 'card', 'document', 'dashboard'
            $table->json('scene_ids')->nullable(); // Array of scene IDs
            $table->json('navigation')->nullable(); // Navigation configuration
            $table->json('performance')->nullable(); // Performance settings
            $table->json('meta')->nullable(); // Metadata (validated against registry)
            $table->boolean('is_active')->default(true);
            $table->boolean('is_public')->default(false);
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
            
            // Indexes for performance
            $table->index(['type', 'is_active']);
            $table->index(['created_by', 'is_active']);
            $table->index(['slug', 'is_active']);
        });

        // Create pivot table for deck-scene relationships
        Schema::create('deck_scene', function (Blueprint $table) {
            $table->id();
            $table->foreignId('deck_id')->constrained()->onDelete('cascade');
            $table->foreignId('scene_id')->constrained()->onDelete('cascade');
            $table->integer('order')->default(0);
            $table->json('metadata')->nullable();
            $table->timestamps();
            
            // Unique constraint and indexes
            $table->unique(['deck_id', 'scene_id']);
            $table->index(['deck_id', 'order']);
            $table->index(['scene_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('deck_scene');
        Schema::dropIfExists('decks');
    }
};
