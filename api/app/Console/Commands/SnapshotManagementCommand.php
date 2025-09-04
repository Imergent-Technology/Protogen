<?php

namespace App\Console\Commands;

use App\Services\SnapshotManagementService;
use App\Models\Snapshot;
use Illuminate\Console\Command;

class SnapshotManagementCommand extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'snapshots:manage 
                            {action : The action to perform (cleanup|stats|validate|rollback)}
                            {--scene-id= : Scene ID for rollback action}
                            {--snapshot-id= : Snapshot ID for rollback action}
                            {--keep-drafts=7 : Days to keep draft snapshots}
                            {--keep-versions=5 : Number of published versions to keep per scene}
                            {--archive-after=30 : Days after which to archive published snapshots}
                            {--delete-archived=90 : Days after which to delete archived snapshots}';

    /**
     * The console command description.
     */
    protected $description = 'Manage snapshots: cleanup, stats, validation, and rollback';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $action = $this->argument('action');
        $service = app(SnapshotManagementService::class);

        switch ($action) {
            case 'cleanup':
                $this->handleCleanup($service);
                break;
            case 'stats':
                $this->handleStats($service);
                break;
            case 'validate':
                $this->handleValidate($service);
                break;
            case 'rollback':
                $this->handleRollback($service);
                break;
            default:
                $this->error("Unknown action: {$action}");
                $this->info('Available actions: cleanup, stats, validate, rollback');
                return 1;
        }

        return 0;
    }

    /**
     * Handle cleanup action
     */
    protected function handleCleanup(SnapshotManagementService $service): void
    {
        $this->info('Starting snapshot cleanup...');

        $policies = [
            'keep_drafts_days' => (int) $this->option('keep-drafts'),
            'keep_published_versions' => (int) $this->option('keep-versions'),
            'archive_after_days' => (int) $this->option('archive-after'),
            'delete_archived_after_days' => (int) $this->option('delete-archived'),
        ];

        $results = $service->applyRetentionPolicies($policies);

        $this->info('Cleanup completed:');
        $this->line("  - Drafts cleaned: {$results['drafts_cleaned']}");
        $this->line("  - Excess versions cleaned: {$results['versions_cleaned']}");
        $this->line("  - Snapshots archived: {$results['archived_cleaned']}");
        $this->line("  - Archived snapshots deleted: {$results['deleted_cleaned']}");
    }

    /**
     * Handle stats action
     */
    protected function handleStats(SnapshotManagementService $service): void
    {
        $this->info('Snapshot Statistics:');
        
        $stats = $service->getSnapshotStats();
        
        $this->line("  Total snapshots: {$stats['total']}");
        $this->line("  Published: {$stats['published']}");
        $this->line("  Drafts: {$stats['drafts']}");
        $this->line("  Archived: {$stats['archived']}");
        $this->line("  Total size: " . $this->formatBytes($stats['total_size']));
        $this->line("  Average size: " . $this->formatBytes($stats['average_size']));
        
        if ($stats['oldest_published']) {
            $this->line("  Oldest published: {$stats['oldest_published']}");
        }
        if ($stats['newest_published']) {
            $this->line("  Newest published: {$stats['newest_published']}");
        }
    }

    /**
     * Handle validate action
     */
    protected function handleValidate(SnapshotManagementService $service): void
    {
        $this->info('Validating snapshots...');
        
        $snapshots = Snapshot::all();
        $valid = 0;
        $invalid = 0;
        
        $progressBar = $this->output->createProgressBar($snapshots->count());
        $progressBar->start();
        
        foreach ($snapshots as $snapshot) {
            $result = $service->validateSnapshotIntegrity($snapshot);
            
            if ($result['is_valid']) {
                $valid++;
            } else {
                $invalid++;
                $this->newLine();
                $this->error("Snapshot {$snapshot->id} ({$snapshot->name}) has issues:");
                foreach ($result['issues'] as $issue) {
                    $this->line("  - {$issue}");
                }
            }
            
            $progressBar->advance();
        }
        
        $progressBar->finish();
        $this->newLine();
        $this->info("Validation completed: {$valid} valid, {$invalid} invalid");
    }

    /**
     * Handle rollback action
     */
    protected function handleRollback(SnapshotManagementService $service): void
    {
        $sceneId = $this->option('scene-id');
        $snapshotId = $this->option('snapshot-id');
        
        if (!$sceneId || !$snapshotId) {
            $this->error('Both --scene-id and --snapshot-id are required for rollback');
            return;
        }
        
        $scene = \App\Models\Scene::find($sceneId);
        if (!$scene) {
            $this->error("Scene with ID {$sceneId} not found");
            return;
        }
        
        $snapshot = Snapshot::find($snapshotId);
        if (!$snapshot) {
            $this->error("Snapshot with ID {$snapshotId} not found");
            return;
        }
        
        if ($snapshot->scene_id !== $scene->id) {
            $this->error("Snapshot {$snapshotId} does not belong to scene {$sceneId}");
            return;
        }
        
        if (!$snapshot->isPublished()) {
            $this->error("Snapshot {$snapshotId} is not published and cannot be used for rollback");
            return;
        }
        
        if (!$this->confirm("Are you sure you want to rollback scene '{$scene->name}' to snapshot '{$snapshot->name}'?")) {
            $this->info('Rollback cancelled');
            return;
        }
        
        $this->info('Starting rollback...');
        
        if ($service->rollbackToSnapshot($scene, $snapshot)) {
            $this->info('Rollback completed successfully');
        } else {
            $this->error('Rollback failed');
        }
    }

    /**
     * Format bytes to human readable format
     */
    protected function formatBytes(?int $bytes): string
    {
        if (!$bytes) {
            return '0 B';
        }
        
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        $unit = 0;
        
        while ($bytes >= 1024 && $unit < count($units) - 1) {
            $bytes /= 1024;
            $unit++;
        }
        
        return round($bytes, 2) . ' ' . $units[$unit];
    }
}
