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
        Schema::create('subgraph_nodes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('subgraph_id')->constrained('subgraphs')->onDelete('cascade');
            $table->foreignId('node_id')->constrained('nodes')->onDelete('cascade');
            $table->timestamps();
            
            $table->unique(['subgraph_id', 'node_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subgraph_nodes');
    }
};
