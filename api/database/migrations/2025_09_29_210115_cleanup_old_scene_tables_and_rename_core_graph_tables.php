<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Drop old scene tables that are no longer needed
        if (Schema::hasTable('scene_edges')) {
            Schema::drop('scene_edges');
        }
        if (Schema::hasTable('scene_nodes')) {
            Schema::drop('scene_nodes');
        }

        // Rename core graph tables to remove prefix
        if (Schema::hasTable('core_graph_node_types')) {
            Schema::rename('core_graph_node_types', 'node_types');
        }
        if (Schema::hasTable('core_graph_nodes')) {
            Schema::rename('core_graph_nodes', 'nodes');
        }
        if (Schema::hasTable('core_graph_edge_types')) {
            Schema::rename('core_graph_edge_types', 'edge_types');
        }
        if (Schema::hasTable('core_graph_edges')) {
            Schema::rename('core_graph_edges', 'edges');
        }

        // Update foreign key constraints in subgraph_nodes table
        if (Schema::hasTable('subgraph_nodes')) {
            Schema::table('subgraph_nodes', function (Blueprint $table) {
                $table->dropForeign(['node_id']);
                $table->foreign('node_id')->references('id')->on('nodes')->onDelete('cascade');
            });
        }
    }

    public function down(): void
    {
        // Restore foreign key constraints
        Schema::table('subgraph_nodes', function (Blueprint $table) {
            $table->dropForeign(['node_id']);
            $table->foreign('node_id')->references('id')->on('core_graph_nodes')->onDelete('cascade');
        });

        // Rename tables back
        Schema::rename('node_types', 'core_graph_node_types');
        Schema::rename('nodes', 'core_graph_nodes');
        Schema::rename('edge_types', 'core_graph_edge_types');
        Schema::rename('edges', 'core_graph_edges');

        // Note: We don't recreate scene_nodes and scene_edges as they're being permanently removed
    }
};