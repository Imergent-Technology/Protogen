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
        Schema::create('contexts', function (Blueprint $table) {
            $table->id();
            $table->uuid('guid')->unique()->index();
            $table->string('name');
            $table->string('slug')->unique()->index();
            $table->text('description')->nullable();
            $table->string('context_type')->default('coordinate'); // 'scene', 'deck', 'document', 'coordinate'
            $table->foreignId('target_scene_id')->nullable()->constrained('scenes')->onDelete('cascade');
            $table->foreignId('target_deck_id')->nullable()->constrained('decks')->onDelete('cascade');
            $table->json('coordinates')->nullable(); // Context-specific coordinates
            $table->json('anchor_data')->nullable(); // Document text, graph position, etc.
            $table->json('meta')->nullable(); // Metadata (validated against registry)
            $table->boolean('is_active')->default(true);
            $table->boolean('is_public')->default(false);
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
            
            // Indexes for performance
            $table->index(['context_type', 'is_active']);
            $table->index(['target_scene_id', 'is_active']);
            $table->index(['target_deck_id', 'is_active']);
            $table->index(['created_by', 'is_active']);
            $table->index(['slug', 'is_active']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('contexts');
    }
};
