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
        Schema::create('tenants', function (Blueprint $table) {
            $table->id();
            $table->uuid('guid')->unique()->index();
            $table->string('name');
            $table->string('slug')->unique()->index();
            $table->text('description')->nullable();
            $table->string('domain')->nullable()->unique()->index();
            $table->json('config')->nullable(); // Tenant-specific configuration
            $table->json('branding')->nullable(); // Logo, colors, theme
            $table->boolean('is_active')->default(true);
            $table->boolean('is_public')->default(false);
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
            
            // Indexes for performance
            $table->index(['is_active', 'is_public']);
            $table->index(['created_by', 'is_active']);
            $table->index(['slug', 'is_active']);
        });

        // Create tenant configurations table
        Schema::create('tenant_configurations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->onDelete('cascade');
            $table->string('key');
            $table->json('value')->nullable();
            $table->string('scope')->default('global'); // global, content, presentation, feedback
            $table->text('description')->nullable();
            $table->timestamps();
            
            // Unique constraint and indexes
            $table->unique(['tenant_id', 'key', 'scope']);
            $table->index(['tenant_id', 'scope']);
            $table->index(['key', 'scope']);
        });

        // Create feedback table for centralized feedback collection
        Schema::create('feedback', function (Blueprint $table) {
            $table->id();
            $table->uuid('guid')->unique()->index();
            $table->string('content_type'); // scene, deck, context, core_node, core_edge
            $table->string('content_id'); // ID of the content being feedback on
            $table->foreignId('tenant_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->string('feedback_type'); // comment, rating, bookmark, like, report, suggestion
            $table->json('content')->nullable(); // Feedback content (text, rating value, etc.)
            $table->json('meta')->nullable(); // Additional metadata
            $table->boolean('is_public')->default(true);
            $table->boolean('is_moderated')->default(false);
            $table->string('moderation_status')->default('pending'); // pending, approved, rejected, flagged
            $table->foreignId('moderated_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('moderated_at')->nullable();
            $table->timestamps();
            
            // Indexes for performance
            $table->index(['content_type', 'content_id']);
            $table->index(['tenant_id', 'feedback_type']);
            $table->index(['user_id', 'feedback_type']);
            $table->index(['moderation_status', 'is_moderated']);
            $table->index(['created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('feedback');
        Schema::dropIfExists('tenant_configurations');
        Schema::dropIfExists('tenants');
    }
};
