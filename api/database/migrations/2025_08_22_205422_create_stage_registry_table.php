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
        Schema::create('stage_registry', function (Blueprint $table) {
            $table->id();
            $table->foreignId('stage_id')->constrained()->onDelete('cascade');
            $table->string('registry_key'); // Key for the registry entry
            $table->jsonb('registry_value')->nullable(); // Value stored as JSON
            $table->timestamps();
            
            // Unique constraint to prevent duplicate keys for the same stage
            $table->unique(['stage_id', 'registry_key']);
            
            // Indexes
            $table->index(['stage_id', 'registry_key']);
            $table->index('registry_key');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stage_registry');
    }
};
