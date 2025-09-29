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
        Schema::create('subgraphs', function (Blueprint $table) {
            $table->id();
            $table->uuid('guid')->unique()->index();
            $table->string('name');
            $table->text('description')->nullable();
            $table->foreignId('tenant_id')->constrained('tenants')->onDelete('cascade');
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->boolean('is_public')->default(false);
            $table->timestamps();
            
            // Indexes for performance
            $table->index(['tenant_id', 'is_public']);
            $table->index(['created_by']);
            $table->index(['name']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subgraphs');
    }
};