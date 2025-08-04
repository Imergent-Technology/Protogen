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
        Schema::create('graph_edges', function (Blueprint $table) {
            $table->id();
            $table->foreignId('stage_id')->constrained()->onDelete('cascade');
            $table->string('edge_id')->unique(); // Unique identifier for the edge
            $table->string('source_node_id'); // References graph_nodes.node_id
            $table->string('target_node_id'); // References graph_nodes.node_id
            $table->string('label')->nullable();
            $table->text('description')->nullable();
            $table->enum('type', ['relationship', 'influence', 'dependency', 'association', 'custom'])->default('relationship');
            $table->jsonb('properties')->nullable(); // Edge-specific properties - using JSONB for better performance
            $table->jsonb('style')->nullable(); // Visual styling properties
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            // PostgreSQL-specific indexes
            $table->index(['stage_id', 'edge_id']);
            $table->index(['source_node_id', 'target_node_id']);
            $table->index(['type', 'is_active']);
            $table->index(['stage_id', 'type', 'is_active']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('graph_edges');
    }
}; 