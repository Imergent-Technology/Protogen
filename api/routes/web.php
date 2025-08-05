<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\StageController;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    // Stage routes
    Route::get('stages', [StageController::class, 'index'])->name('stages.index');
    Route::get('stages/fallback', [StageController::class, 'fallback'])->name('stages.fallback');
    Route::get('stages/{stage:slug}', [StageController::class, 'show'])->name('stages.show');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
