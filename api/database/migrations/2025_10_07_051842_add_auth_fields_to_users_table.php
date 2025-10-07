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
            // Standing metrics (0-1000 scale)
            $table->smallInteger('engagement')->default(0)->after('reputation')->comment('System-maintained activity metric (0-1000)');
            $table->smallInteger('affinity')->default(0)->after('engagement')->comment('Admin-adjusted community integration metric (0-1000)');
            $table->smallInteger('standing')->default(0)->after('affinity')->comment('Calculated standing from reputation, engagement, affinity (0-1000)');
            
            // Admin-only trust level (0-1000)
            $table->smallInteger('trust_level')->default(0)->after('standing')->comment('Admin-only trust tracking (0-1000)');
            
            // Additional fields
            $table->timestamp('last_active_at')->nullable()->after('trust_level');
            $table->json('preferences')->nullable()->after('last_active_at');
            
            // Also update reputation to smallint for consistency
            $table->smallInteger('reputation')->default(0)->change()->comment('Community-adjusted quality metric (0-1000)');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['engagement', 'affinity', 'standing', 'trust_level', 'last_active_at', 'preferences']);
            // Revert reputation back to float if needed
            $table->float('reputation')->default(0.0)->change();
        });
    }
};
