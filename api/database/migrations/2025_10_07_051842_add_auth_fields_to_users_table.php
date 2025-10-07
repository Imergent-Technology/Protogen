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
        Schema::table('users', function (Blueprint $table) {
            $table->decimal('standing', 5, 2)->default(0.0)->after('reputation');
            $table->integer('trust_level')->default(1)->after('standing');
            $table->timestamp('last_active_at')->nullable()->after('trust_level');
            $table->json('preferences')->nullable()->after('last_active_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['standing', 'trust_level', 'last_active_at', 'preferences']);
        });
    }
};
