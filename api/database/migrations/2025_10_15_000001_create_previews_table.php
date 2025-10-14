<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * M1 Week 5: Preview Service Migration
 * 
 * Creates previews table for storing generated thumbnails.
 * Based on Spec 07: Preview Service Specification
 */
return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('previews', function (Blueprint $table) {
            $table->id();
            
            // Target identification
            $table->string('target_type', 20); // 'scene', 'slide', 'page', 'node'
            $table->string('target_id', 100);  // ID of the target
            $table->foreignId('scene_id')->nullable()->constrained()->onDelete('cascade');
            
            // Preview metadata
            $table->enum('size', ['xs', 'sm', 'md'])->default('sm');
            $table->string('hash', 64); // Content hash for staleness detection
            $table->integer('width');
            $table->integer('height');
            
            // Storage
            $table->text('data_url')->nullable(); // Base64 data URL (for quick access)
            $table->string('file_path')->nullable(); // CDN path (for larger previews)
            $table->integer('file_size')->nullable(); // In bytes
            
            // Cache metadata
            $table->timestamp('generated_at');
            $table->timestamp('accessed_at')->nullable();
            $table->integer('access_count')->default(0);
            
            // Standard timestamps
            $table->timestamps();
            
            // Indexes
            $table->index(['target_type', 'target_id', 'size']); // Fast lookup
            $table->index('scene_id'); // For scene-level invalidation
            $table->index('hash'); // For staleness detection
            $table->index('generated_at'); // For cleanup of old previews
            $table->index('accessed_at'); // For LRU eviction
            
            // Unique constraint: one preview per target+size
            $table->unique(['target_type', 'target_id', 'size']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('previews');
    }
};

