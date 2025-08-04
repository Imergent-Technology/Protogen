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
        Schema::create('stage_links', function (Blueprint $table) {
            $table->id();
            $table->foreignId('source_stage_id')->constrained('stages')->onDelete('cascade');
            $table->foreignId('target_stage_id')->constrained('stages')->onDelete('cascade');
            $table->string('label')->nullable();
            $table->text('description')->nullable();
            $table->enum('type', ['contextual', 'hierarchical', 'related', 'custom'])->default('contextual');
            $table->jsonb('context')->nullable(); // Context information about the link
            $table->jsonb('metadata')->nullable(); // Additional metadata
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            // PostgreSQL-specific indexes
            $table->unique(['source_stage_id', 'target_stage_id']);
            $table->index(['source_stage_id', 'type']);
            $table->index(['target_stage_id', 'type']);
            $table->index(['type', 'is_active']);
            $table->index(['source_stage_id', 'type', 'is_active']);
            $table->index(['target_stage_id', 'type', 'is_active']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stage_links');
    }
}; 