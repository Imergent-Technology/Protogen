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
        Schema::create('core_graph_nodes', function (Blueprint $table) {
            $table->id();
            $table->uuid('guid')->unique(); // GUID for the core graph system
            $table->foreignId('node_type_id')->constrained('core_graph_node_types')->onDelete('restrict');
            $table->string('label');
            $table->text('description')->nullable();
            $table->jsonb('properties')->nullable(); // Node-specific properties
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            // Indexes
            $table->index('guid');
            $table->index(['node_type_id', 'is_active']);
            $table->index(['is_active']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('core_graph_nodes');
    }
};
