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
        Schema::table('slides', function (Blueprint $table) {
            // Individual slide animation overrides
            $table->json('entrance_animation')->nullable()->after('transition_config');
            $table->json('exit_animation')->nullable()->after('entrance_animation');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('slides', function (Blueprint $table) {
            $table->dropColumn(['entrance_animation', 'exit_animation']);
        });
    }
};
