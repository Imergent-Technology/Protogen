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
        Schema::create('scene_content', function (Blueprint $table) {
            $table->id();
            $table->foreignId('scene_id')->constrained('scenes')->onDelete('cascade');
            $table->string('content_type')->default('document'); // 'document', 'graph', 'card', 'dashboard', etc.
            $table->string('content_key')->default('main'); // 'main', 'header', 'footer', 'sidebar', etc.
            $table->longText('content_data')->nullable(); // Rich text, JSON, or other content
            $table->string('content_format')->default('html'); // 'html', 'markdown', 'json', 'text'
            $table->json('metadata')->nullable(); // Additional metadata for the content
            $table->integer('sort_order')->default(0); // For ordering multiple content pieces
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            // Indexes for performance
            $table->index(['scene_id', 'content_type']);
            $table->index(['scene_id', 'content_key']);
            $table->index(['scene_id', 'content_type', 'content_key']);
            $table->unique(['scene_id', 'content_type', 'content_key']); // Ensure unique content per scene/type/key
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('scene_content');
    }
};