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
        Schema::create('permissions', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->enum('category', ['system', 'tenant', 'content', 'user'])->default('user');
            $table->enum('scope', ['global', 'tenant', 'resource', 'user'])->default('user');
            $table->boolean('is_system')->default(false);
            $table->boolean('is_tenant_scoped')->default(false);
            $table->decimal('standing_requirement', 5, 2)->nullable();
            $table->timestamps();

            $table->index(['category', 'scope']);
            $table->index(['is_system', 'is_tenant_scoped']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('permissions');
    }
};
