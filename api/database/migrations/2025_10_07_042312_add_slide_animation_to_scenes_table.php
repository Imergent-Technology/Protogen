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
        Schema::table('scenes', function (Blueprint $table) {
            // Slide configuration (auto-advance, loop, duration)
            $table->json('slide_config')->nullable()->after('style');
            
            // Default slide animations (entrance and exit)
            $table->json('default_slide_animation')->nullable()->after('slide_config');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('scenes', function (Blueprint $table) {
            $table->dropColumn(['slide_config', 'default_slide_animation']);
        });
    }
};
