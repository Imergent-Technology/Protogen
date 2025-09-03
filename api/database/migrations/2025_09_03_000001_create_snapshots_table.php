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
        Schema::create('snapshots', function (Blueprint $table) {
            $table->id();
            $table->uuid('guid')->unique()->index();
            $table->string('name');
            $table->string('slug')->unique()->index();
            $table->text('description')->nullable();
            $table->foreignId('scene_id')->constrained('scenes')->onDelete('cascade');
            $table->string('version')->default('1.0.0');
            $table->string('status')->default('draft'); // draft, published, archived
            $table->json('manifest')->nullable(); // Snapshot manifest data
            $table->string('content_hash')->nullable(); // SHA256 hash of content
            $table->string('storage_path')->nullable(); // Path to stored snapshot file
            $table->string('compression_type')->default('brotli'); // brotli, gzip, none
            $table->integer('file_size')->nullable(); // Size in bytes
            $table->json('metadata')->nullable(); // Additional metadata
            $table->timestamp('published_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
            
            // Indexes for performance
            $table->index(['scene_id', 'status']);
            $table->index(['status', 'published_at']);
            $table->index(['content_hash']);
            $table->index(['created_by', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('snapshots');
    }
};
