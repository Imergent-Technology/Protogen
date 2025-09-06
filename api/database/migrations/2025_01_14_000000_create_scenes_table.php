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
        Schema::create('scenes', function (Blueprint $table) {
            $table->id();
            $table->uuid('guid')->unique()->index();
            $table->string('name');
            $table->string('slug')->unique()->index();
            $table->text('description')->nullable();
            $table->string('scene_type')->default('custom'); // 'system', 'custom', 'template'
            $table->json('config')->nullable(); // Scene-specific configuration
            $table->json('meta')->nullable(); // Metadata (validated against registry)
            $table->json('style')->nullable(); // Styling and presentation rules
            $table->boolean('is_active')->default(true);
            $table->boolean('is_public')->default(false);
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
            
            // Indexes for performance
            $table->index(['scene_type', 'is_active']);
            $table->index(['created_by', 'is_active']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('scenes');
    }
};
