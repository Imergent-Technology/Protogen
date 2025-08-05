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
        Schema::create('stages', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->enum('type', ['basic', 'graph', 'document', 'table', 'custom'])->default('basic');
            $table->jsonb('config')->nullable(); // Stage-specific configuration - using JSONB for better performance
            $table->jsonb('metadata')->nullable(); // Additional metadata
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
            
            // PostgreSQL-specific indexes for JSONB columns
            $table->index(['type', 'is_active']);
            $table->index(['sort_order', 'is_active']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stages');
    }
}; 