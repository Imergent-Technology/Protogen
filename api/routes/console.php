<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use App\Console\Commands\SnapshotManagementCommand;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Register snapshot management command
Artisan::command('snapshots:manage', function () {
    $this->call(SnapshotManagementCommand::class);
})->purpose('Manage snapshots');
