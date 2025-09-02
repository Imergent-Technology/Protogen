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
        Schema::create('registry_catalog', function (Blueprint $table) {
            $table->id();
            $table->string('scope', 50)->comment('core.node, core.edge, scene.node, scene.edge');
            $table->string('key', 100)->comment('Semantic identifier for the metadata key');
            $table->string('type', 20)->comment('string, number, boolean, array, object');
            $table->text('description')->comment('Human-readable explanation');
            $table->json('default_value')->nullable()->comment('Default value for the key');
            $table->boolean('is_presentational')->default(false)->comment('Whether this key affects visual presentation');
            $table->json('validation_rules')->nullable()->comment('JSON schema validation rules');
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            // Indexes
            $table->unique(['scope', 'key']);
            $table->index(['scope', 'is_active']);
            $table->index(['key', 'is_active']);
            $table->index('is_presentational');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('registry_catalog');
    }
};
