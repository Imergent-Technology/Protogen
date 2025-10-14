<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * M1 Week 7-8: Slides Table Migration
 * 
 * Creates slides table for Card scene type.
 * Supports three slide variants: text, image, layered.
 * 
 * Based on Spec 09: Card Scene Type
 */
return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('slides', function (Blueprint $table) {
            $table->id();
            
            // Relationships
            $table->foreignId('scene_id')->constrained()->onDelete('cascade');
            
            // Slide metadata
            $table->enum('kind', ['text', 'image', 'layered'])->default('text');
            $table->integer('order')->default(0);
            $table->string('title', 100)->nullable();
            $table->text('notes')->nullable();
            $table->integer('duration')->nullable(); // milliseconds for auto-advance
            
            // Text slide fields
            $table->text('text')->nullable();
            $table->integer('font_size')->nullable(); // 12-128
            $table->string('font_family', 50)->nullable();
            $table->enum('alignment', ['left', 'center', 'right'])->default('center');
            $table->string('text_color', 9)->nullable(); // #RRGGBB or #RRGGBBAA
            
            // Image slide fields
            $table->foreignId('image_asset_id')->nullable()->constrained('assets')->onDelete('set null');
            $table->enum('fit', ['contain', 'cover', 'fill'])->nullable();
            $table->json('position')->nullable(); // {x: number, y: number} in %
            
            // Caption for image slides
            $table->json('caption')->nullable(); // {text, position, backgroundColor, textColor}
            
            // Layered slide fields (image + text overlay)
            $table->foreignId('background_asset_id')->nullable()->constrained('assets')->onDelete('set null');
            $table->json('text_overlay')->nullable(); // {text, fontSize, color, position, timing}
            
            // Styling (applies to all types)
            $table->string('background_color', 9)->nullable();
            $table->json('background_gradient')->nullable(); // For gradients
            $table->integer('padding')->default(32); // px
            
            // Animation
            $table->enum('enter_animation', ['none', 'fade', 'slide-up', 'slide-down', 'zoom'])->default('fade');
            $table->integer('animation_duration')->default(300); // ms
            
            // Standard timestamps
            $table->timestamps();
            $table->softDeletes();
            
            // Indexes
            $table->index(['scene_id', 'order']); // Fast ordering
            $table->index('kind'); // Filter by slide type
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('slides');
    }
};

