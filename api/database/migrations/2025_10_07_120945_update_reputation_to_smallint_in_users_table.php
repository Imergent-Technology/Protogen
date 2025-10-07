<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Convert reputation from float to smallint (0-1000)
            // First, scale existing values: multiply by 10 to convert 0-100 to 0-1000 scale
            DB::statement('UPDATE users SET reputation = LEAST(1000, GREATEST(0, ROUND(reputation * 10)))');
            
            // Change column type to smallint
            $table->smallInteger('reputation')->default(0)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Scale back down: divide by 10 to convert 0-1000 to 0-100
            DB::statement('UPDATE users SET reputation = reputation / 10.0');
            
            // Revert to float
            $table->float('reputation')->default(0.0)->change();
        });
    }
};
