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
        Schema::create('feedback', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('stage_id')->constrained()->onDelete('cascade');
            $table->enum('level', ['high_level', 'contextual'])->default('high_level');
            $table->enum('privacy', ['private', 'group', 'public'])->default('public');
            $table->string('title');
            $table->text('content');
            $table->json('context')->nullable(); // For contextual feedback - references to specific nodes/edges
            $table->json('metadata')->nullable(); // Additional metadata
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            $table->index(['stage_id', 'level']);
            $table->index(['user_id', 'privacy']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('feedback');
    }
}; 