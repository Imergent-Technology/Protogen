<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // This migration documents the changes that were made manually:
        // 1. Dropped old scene tables: scene_edges, scene_nodes
        // 2. Renamed core graph tables:
        //    - core_graph_node_types → node_types
        //    - core_graph_nodes → nodes  
        //    - core_graph_edge_types → edge_types
        //    - core_graph_edges → edges
        // 3. Updated foreign key constraints in subgraph_nodes table
        
        // Since the changes were already applied manually, this migration
        // serves as documentation and ensures the migration state is consistent
    }

    public function down(): void
    {
        // This migration cannot be rolled back as the old tables
        // (scene_nodes, scene_edges) have been permanently removed
        // and the core graph tables have been renamed
    }
};