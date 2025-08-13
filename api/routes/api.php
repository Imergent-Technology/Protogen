<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\StageApiController;
use App\Http\Controllers\Api\UserApiController;
use App\Http\Controllers\Auth\AdminAuthController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// OAuth routes moved to web.php for session support

// Admin authentication routes (use Sanctum for API auth)
Route::prefix('auth/admin')->group(function () {
    Route::post('login', [AdminAuthController::class, 'login']);
    Route::post('logout', [AdminAuthController::class, 'logout'])->middleware('auth:sanctum');
    Route::get('user', [AdminAuthController::class, 'user'])->middleware('auth:sanctum');
    Route::get('check', [AdminAuthController::class, 'check'])->middleware('auth:sanctum');
});

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Stage API routes
Route::prefix('stages')->group(function () {
    Route::get('/', [StageApiController::class, 'index']);
    Route::get('/types', [StageApiController::class, 'types']);
    Route::post('/', [StageApiController::class, 'store']);
    Route::get('/{stage}', [StageApiController::class, 'show']);
    Route::put('/{stage}', [StageApiController::class, 'update']);
    Route::delete('/{stage}', [StageApiController::class, 'destroy']);
    Route::get('/{stage}/relationships', [StageApiController::class, 'relationships']);
});

// Admin-only user management routes (use Sanctum for API auth)
Route::prefix('users')->middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::get('/', [UserApiController::class, 'index']);
    Route::get('/stats', [UserApiController::class, 'stats']);
    Route::get('/{user}', [UserApiController::class, 'show']);
    Route::put('/{user}', [UserApiController::class, 'update']);
    Route::delete('/{user}', [UserApiController::class, 'destroy']);
}); 