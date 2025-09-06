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
        Schema::create('scene_edges', function (Blueprint $table) {
            $table->id();
            $table->uuid('guid')->unique()->index();
            $table->foreignId('scene_id')->constrained('scenes')->onDelete('cascade');
            $table->uuid('core_edge_guid')->nullable()->index(); // Reference to Core Graph edge
            $table->foreignId('source_node_id')->constrained('scene_nodes')->onDelete('cascade');
            $table->foreignId('target_node_id')->constrained('scene_nodes')->onDelete('cascade');
            $table->string('edge_type')->default('phantom'); // 'core', 'phantom'
            $table->json('path')->nullable(); // Edge path coordinates
            $table->json('meta')->nullable(); // Metadata (validated against registry)
            $table->json('style')->nullable(); // Styling and presentation rules
            $table->boolean('is_visible')->default(true);
            $table->boolean('is_locked')->default(false);
            $table->json('transform')->nullable(); // CSS transform properties
            $table->timestamps();
            
            // Indexes for performance
            $table->index(['scene_id', 'edge_type']);
            $table->index(['scene_id', 'is_visible']);
            $table->index(['core_edge_guid', 'scene_id']);
            $table->index(['source_node_id', 'target_node_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('scene_edges');
    }
};
