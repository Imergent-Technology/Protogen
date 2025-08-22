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
        Schema::create('core_graph_edge_types', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique(); // Internal name (e.g., 'references', 'depends_on', 'contains')
            $table->string('display_name'); // Human-readable name (e.g., 'References', 'Depends On', 'Contains')
            $table->text('description')->nullable();
            $table->string('color')->nullable(); // Hex color code for edge visualization
            $table->jsonb('style')->nullable(); // Additional styling properties
            $table->boolean('is_system')->default(false); // System-provided vs custom
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            // Indexes
            $table->index(['is_system', 'is_active']);
            $table->index('name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('core_graph_edge_types');
    }
};
