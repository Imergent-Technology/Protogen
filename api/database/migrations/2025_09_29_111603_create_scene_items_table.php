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
        Schema::create('scene_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('scene_id')->constrained('scenes')->onDelete('cascade');
            $table->string('item_type'); // 'node', 'edge', 'text', 'image', 'video', 'other'
            $table->unsignedBigInteger('item_id')->nullable(); // Reference to core_graph_nodes, core_graph_edges, or other
            $table->uuid('item_guid')->nullable(); // Alternative reference
            $table->json('position')->nullable(); // {x, y, z} coordinates
            $table->json('dimensions')->nullable(); // {width, height} for sizing
            $table->json('style')->nullable(); // Scene-specific styling
            $table->json('meta')->nullable(); // Additional metadata
            $table->boolean('is_visible')->default(true);
            $table->integer('z_index')->default(0);
            $table->timestamps();
            
            // Indexes for performance
            $table->index(['scene_id', 'item_type']);
            $table->index(['item_id', 'item_type']);
            $table->index(['item_guid']);
            $table->index(['scene_id', 'is_visible']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('scene_items');
    }
};