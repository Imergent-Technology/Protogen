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
        Schema::create('tenant_memberships', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('tenant_id');
            $table->string('role')->default('member');
            $table->enum('status', ['active', 'pending', 'suspended', 'left'])->default('pending');
            $table->timestamp('joined_at')->nullable();
            $table->unsignedBigInteger('invited_by')->nullable();
            $table->json('permissions')->nullable();
            $table->decimal('standing_in_tenant', 5, 2)->default(0.0);
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
            $table->foreign('invited_by')->references('id')->on('users')->onDelete('set null');
            
            $table->unique(['user_id', 'tenant_id']);
            $table->index(['tenant_id', 'status']);
            $table->index(['user_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tenant_memberships');
    }
};
