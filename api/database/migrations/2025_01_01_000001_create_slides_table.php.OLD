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
        Schema::create('slides', function (Blueprint $table) {
            $table->id(); // Uses bigint auto-increment
            $table->foreignId('scene_id');
            $table->string('name');
            $table->text('description')->nullable();
            $table->integer('slide_index')->default(0);
            $table->boolean('is_active')->default(false);
            $table->json('transition_config')->nullable(); // TweeningConfig
            $table->timestamps();

            // Foreign key constraints
            $table->foreign('scene_id')->references('id')->on('scenes')->onDelete('cascade');
            
            // Indexes
            $table->index(['scene_id', 'slide_index']);
            $table->index(['scene_id', 'is_active']);
            $table->unique(['scene_id', 'slide_index']);
        });

        // Add slide_id column to scene_items table
        Schema::table('scene_items', function (Blueprint $table) {
            $table->foreignId('slide_id')->nullable()->after('scene_id')->constrained()->onDelete('set null');
            $table->index(['scene_id', 'slide_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remove slide_id column from scene_items table
        Schema::table('scene_items', function (Blueprint $table) {
            $table->dropForeign(['slide_id']);
            $table->dropIndex(['scene_id', 'slide_id']);
            $table->dropColumn('slide_id');
        });

        // Drop slides table
        Schema::dropIfExists('slides');
    }
};
