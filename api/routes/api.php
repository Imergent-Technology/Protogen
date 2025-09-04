<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\StageApiController;
use App\Http\Controllers\Api\UserApiController;
use App\Http\Controllers\Api\CoreGraphApiController;
use App\Http\Controllers\Api\RegistryApiController;
use App\Http\Controllers\Api\SceneApiController;
use App\Http\Controllers\Api\SnapshotApiController;
use App\Http\Controllers\Api\ContextApiController;
use App\Http\Controllers\Api\DeckApiController;
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
Route::group(['prefix' => 'auth/admin'], function () {
    Route::post('login', [AdminAuthController::class, 'login']);
    Route::post('logout', [AdminAuthController::class, 'logout'])->middleware('auth:sanctum');
    Route::get('user', [AdminAuthController::class, 'user'])->middleware('auth:sanctum');
    Route::get('check', [AdminAuthController::class, 'check'])->middleware('auth:sanctum');
});

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Stage API routes (legacy - will be deprecated)
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

// Core Graph System API routes (admin only)
Route::prefix('graph')->middleware(['auth:sanctum', 'admin'])->group(function () {
    // Node management
    Route::get('/nodes', [CoreGraphApiController::class, 'getNodes']);
    Route::post('/nodes', [CoreGraphApiController::class, 'createNode']);
    Route::get('/nodes/{guid}', [CoreGraphApiController::class, 'getNode']);
    Route::put('/nodes/{guid}', [CoreGraphApiController::class, 'updateNode']);
    Route::delete('/nodes/{guid}', [CoreGraphApiController::class, 'deleteNode']);
    
    // Edge management
    Route::get('/edges', [CoreGraphApiController::class, 'getEdges']);
    Route::post('/edges', [CoreGraphApiController::class, 'createEdge']);
    Route::delete('/edges/{guid}', [CoreGraphApiController::class, 'deleteEdge']);
    
    // Node type management
    Route::get('/node-types', [CoreGraphApiController::class, 'getNodeTypes']);
    Route::post('/node-types', [CoreGraphApiController::class, 'createNodeType']);
    
    // Edge type management
    Route::get('/edge-types', [CoreGraphApiController::class, 'getEdgeTypes']);
    
    // Complete graph
    Route::get('/', [CoreGraphApiController::class, 'getGraph']);
});

// Registry API routes (admin only)
Route::prefix('registry')->middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::get('/', [RegistryApiController::class, 'index']);
    Route::get('/scope/{scope}', [RegistryApiController::class, 'getScope']);
    Route::get('/{scope}/{key}', [RegistryApiController::class, 'show']);
    Route::post('/', [RegistryApiController::class, 'store']);
    Route::put('/{scope}/{key}', [RegistryApiController::class, 'update']);
    Route::delete('/{scope}/{key}', [RegistryApiController::class, 'destroy']);
    Route::post('/validate', [RegistryApiController::class, 'validateMetadata']);
    Route::get('/{scope}/schema', [RegistryApiController::class, 'getSchema']);
    Route::get('/{scope}/presentational', [RegistryApiController::class, 'getPresentationalKeys']);
    Route::get('/{scope}/defaults', [RegistryApiController::class, 'getDefaults']);
});

// Scene API routes (admin only)
Route::prefix('scenes')->middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::get('/', [SceneApiController::class, 'index']);
    Route::get('/stats', [SceneApiController::class, 'stats']);
    Route::get('/system', [SceneApiController::class, 'system']);
    Route::get('/stage/{stageId}', [SceneApiController::class, 'forStage']);
    Route::get('/{guid}', [SceneApiController::class, 'show']);
});

// Snapshot API routes (admin only)
Route::prefix('snapshots')->middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::get('/', [SnapshotApiController::class, 'index']);
    Route::get('/stats', [SnapshotApiController::class, 'stats']);
    Route::post('/', [SnapshotApiController::class, 'store']);
    Route::get('/{guid}', [SnapshotApiController::class, 'show']);
    Route::post('/{guid}/publish', [SnapshotApiController::class, 'publish']);
    Route::post('/{guid}/archive', [SnapshotApiController::class, 'archive']);
    Route::get('/{guid}/manifest', [SnapshotApiController::class, 'manifest']);
    Route::get('/{guid}/download', [SnapshotApiController::class, 'download']);
    Route::delete('/{guid}', [SnapshotApiController::class, 'destroy']);
});

// Deck API routes (admin only)
Route::prefix('decks')->middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::get('/', [DeckApiController::class, 'index']);
    Route::get('/stats', [DeckApiController::class, 'stats']);
    Route::post('/', [DeckApiController::class, 'store']);
    Route::get('/{guid}', [DeckApiController::class, 'show']);
    Route::put('/{guid}', [DeckApiController::class, 'update']);
    Route::delete('/{guid}', [DeckApiController::class, 'destroy']);
    Route::post('/{guid}/scenes', [DeckApiController::class, 'addScene']);
    Route::delete('/{guid}/scenes', [DeckApiController::class, 'removeScene']);
    Route::put('/{guid}/scenes/reorder', [DeckApiController::class, 'reorderScenes']);
});

// Context API routes (admin only)
Route::prefix('contexts')->middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::get('/', [ContextApiController::class, 'index']);
    Route::get('/stats', [ContextApiController::class, 'stats']);
    Route::post('/', [ContextApiController::class, 'store']);
    Route::get('/{guid}', [ContextApiController::class, 'show']);
    Route::put('/{guid}', [ContextApiController::class, 'update']);
    Route::delete('/{guid}', [ContextApiController::class, 'destroy']);
    Route::get('/{guid}/resolve', [ContextApiController::class, 'resolve']);
    Route::get('/scene/{sceneSlug}', [ContextApiController::class, 'forScene']);
    Route::get('/deck/{deckSlug}', [ContextApiController::class, 'forDeck']);
});