<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Assets Table Migration
 * 
 * Stores media assets (images, videos, audio, documents) used in slides and other content.
 * Supports both uploaded files and external URLs.
 */
return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('assets', function (Blueprint $table) {
            $table->id();
            
            // Asset metadata
            $table->enum('type', ['image', 'video', 'audio', 'document']);
            $table->string('name', 255);
            $table->string('file_path', 500)->nullable(); // Storage path for uploaded files
            $table->string('url', 1000)->nullable(); // External URL option
            $table->string('mime_type', 100);
            
            // File properties
            $table->bigInteger('file_size')->nullable(); // bytes
            $table->integer('width')->nullable(); // for images/video
            $table->integer('height')->nullable(); // for images/video
            $table->integer('duration')->nullable(); // for video/audio (seconds)
            
            // Additional metadata
            $table->json('metadata')->nullable(); // alt text, captions, etc.
            
            // Ownership and access
            $table->foreignId('uploaded_by')->nullable()->constrained('users')->onDelete('set null');
            $table->boolean('is_public')->default(false);
            
            // Standard timestamps
            $table->timestamps();
            $table->softDeletes();
            
            // Indexes
            $table->index('type');
            $table->index('is_public');
            $table->index('uploaded_by');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('assets');
    }
};


