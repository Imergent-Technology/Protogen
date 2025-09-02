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
        Schema::create('core_graph_edges', function (Blueprint $table) {
            $table->id();
            $table->uuid('guid')->unique(); // GUID for the edge
            $table->uuid('source_node_guid'); // Source node GUID
            $table->uuid('target_node_guid'); // Target node GUID
            $table->foreignId('edge_type_id')->constrained('core_graph_edge_types')->onDelete('restrict');
            $table->decimal('weight', 8, 5)->default(1.00000);
            $table->string('label')->nullable();
            $table->text('description')->nullable();
            $table->jsonb('properties')->nullable(); // Edge-specific properties
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            // Foreign key constraints to core_graph_nodes
            $table->foreign('source_node_guid')->references('guid')->on('core_graph_nodes')->onDelete('cascade');
            $table->foreign('target_node_guid')->references('guid')->on('core_graph_nodes')->onDelete('cascade');
            
            // Indexes
            $table->index('guid');
            $table->index(['source_node_guid', 'is_active']);
            $table->index(['target_node_guid', 'is_active']);
            $table->index(['edge_type_id', 'is_active']);
            $table->index(['is_active']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('core_graph_edges');
    }
};
