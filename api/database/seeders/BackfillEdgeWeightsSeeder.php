<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class BackfillEdgeWeightsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('Backfilling edge weights...');

        // Update all existing edges to have weight = 1.00000
        $updated = DB::table('core_graph_edges')
            ->whereNull('weight')
            ->orWhere('weight', '=', 0)
            ->update(['weight' => 1.00000]);

        $this->command->info("Updated {$updated} edges with default weight.");

        // Verify all edges now have weights
        $edgesWithoutWeight = DB::table('core_graph_edges')
            ->whereNull('weight')
            ->count();

        if ($edgesWithoutWeight > 0) {
            $this->command->warn("Warning: {$edgesWithoutWeight} edges still don't have weights.");
        } else {
            $this->command->info('All edges now have weights assigned.');
        }

        // Show weight distribution
        $weightDistribution = DB::table('core_graph_edges')
            ->select('weight', DB::raw('count(*) as count'))
            ->groupBy('weight')
            ->orderBy('weight')
            ->get();

        $this->command->info('Weight distribution:');
        foreach ($weightDistribution as $dist) {
            $this->command->info("  Weight {$dist->weight}: {$dist->count} edges");
        }
    }
}
