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
            $table->foreignId('subgraph_id')->nullable()->constrained('subgraphs')->onDelete('set null');
            $table->index(['subgraph_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('scenes', function (Blueprint $table) {
            $table->dropForeign(['subgraph_id']);
            $table->dropIndex(['subgraph_id']);
            $table->dropColumn('subgraph_id');
        });
    }
};