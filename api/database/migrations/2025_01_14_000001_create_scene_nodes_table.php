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
        Schema::create('scene_nodes', function (Blueprint $table) {
            $table->id();
            $table->uuid('guid')->unique()->index();
            $table->foreignId('scene_id')->constrained('scenes')->onDelete('cascade');
            $table->uuid('core_node_guid')->nullable()->index(); // Reference to Core Graph node
            $table->string('node_type')->default('phantom'); // 'core', 'phantom'
            $table->json('position')->nullable(); // {x, y} coordinates
            $table->json('dimensions')->nullable(); // {width, height}
            $table->json('meta')->nullable(); // Metadata (validated against registry)
            $table->json('style')->nullable(); // Styling and presentation rules
            $table->integer('z_index')->default(0); // Layering order
            $table->boolean('is_visible')->default(true);
            $table->boolean('is_locked')->default(false);
            $table->json('transform')->nullable(); // CSS transform properties
            $table->timestamps();
            
            // Indexes for performance
            $table->index(['scene_id', 'node_type']);
            $table->index(['scene_id', 'is_visible']);
            $table->index(['core_node_guid', 'scene_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('scene_nodes');
    }
};
