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
        Schema::create('graph_nodes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('stage_id')->constrained()->onDelete('cascade');
            $table->string('node_id')->unique(); // Unique identifier for the node
            $table->string('label');
            $table->text('description')->nullable();
            $table->enum('type', ['concept', 'person', 'organization', 'event', 'resource', 'custom'])->default('concept');
            $table->json('properties')->nullable(); // Node-specific properties
            $table->json('position')->nullable(); // x, y coordinates for visualization
            $table->json('style')->nullable(); // Visual styling properties
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            $table->index(['stage_id', 'node_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('graph_nodes');
    }
}; 