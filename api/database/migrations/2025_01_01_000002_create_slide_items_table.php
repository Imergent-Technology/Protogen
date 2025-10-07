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
        Schema::create('slide_items', function (Blueprint $table) {
            $table->id(); // Uses bigint auto-increment
            $table->foreignId('slide_id');
            $table->foreignId('node_id'); // References scene_item.id
            $table->json('position'); // {x: number, y: number}
            $table->json('scale'); // {x: number, y: number}
            $table->decimal('rotation', 8, 2)->default(0); // Rotation in degrees
            $table->decimal('opacity', 3, 2)->default(1.0); // 0.0 to 1.0
            $table->boolean('visible')->default(true);
            $table->json('style')->nullable(); // Additional CSS styles
            $table->json('transition_config')->nullable(); // TweeningConfig for this item
            $table->timestamps();

            // Foreign key constraints
            $table->foreign('slide_id')->references('id')->on('slides')->onDelete('cascade');
            $table->foreign('node_id')->references('id')->on('scene_items')->onDelete('cascade');
            
            // Indexes
            $table->index(['slide_id', 'node_id']);
            $table->index(['node_id']);
            $table->unique(['slide_id', 'node_id']); // One slide item per slide per node
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('slide_items');
    }
};
