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
        Schema::create('core_graph_node_types', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique(); // Internal name (e.g., 'stage', 'user', 'document')
            $table->string('display_name'); // Human-readable name (e.g., 'Stage', 'User', 'Document')
            $table->text('description')->nullable();
            $table->string('icon')->nullable(); // Icon identifier
            $table->string('icon_color')->nullable(); // Hex color code
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
        Schema::dropIfExists('core_graph_node_types');
    }
};
