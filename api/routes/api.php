<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
// StageApiController removed - Stage system has been completely removed
use App\Http\Controllers\Api\UserApiController;
use App\Http\Controllers\Api\CoreGraphApiController;
use App\Http\Controllers\Api\RegistryApiController;
use App\Http\Controllers\Api\SceneApiController;
use App\Http\Controllers\Api\SnapshotApiController;
use App\Http\Controllers\Api\ContextApiController;
use App\Http\Controllers\Api\DeckApiController;
use App\Http\Controllers\Api\SubgraphController;
use App\Http\Controllers\Api\SceneItemController;
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

// Stage API routes removed - Stage system has been completely removed

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
    
    // Node position updates
    Route::put('/nodes/{nodeGuid}/position', [CoreGraphApiController::class, 'updateNodePosition']);
    Route::put('/nodes/positions', [CoreGraphApiController::class, 'updateNodePositions']);
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
    Route::post('/', [SceneApiController::class, 'store']);
    Route::post('/graph', [SceneApiController::class, 'createGraphScene']);
    Route::get('/stats', [SceneApiController::class, 'stats']);
    Route::get('/system', [SceneApiController::class, 'system']);
    Route::get('/slug/{slug}', [SceneApiController::class, 'getBySlug']);
    Route::get('/{guid}', [SceneApiController::class, 'show']);
    Route::put('/{guid}', [SceneApiController::class, 'update']);
    Route::delete('/{guid}', [SceneApiController::class, 'destroy']);
    Route::post('/{guid}/content', [SceneApiController::class, 'saveContent']);
    Route::get('/{guid}/content/{type?}/{key?}', [SceneApiController::class, 'getContent']);
    Route::get('/{guid}/nodes', [SceneApiController::class, 'getNodes']);
    Route::get('/{guid}/edges', [SceneApiController::class, 'getEdges']);
    Route::get('/{guid}/items', [SceneApiController::class, 'getSceneItems']);
    Route::post('/{guid}/nodes', [SceneApiController::class, 'addNodeToScene']);
});

// Snapshot API routes (admin only)
Route::prefix('snapshots')->middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::get('/', [SnapshotApiController::class, 'index']);
    Route::get('/stats', [SnapshotApiController::class, 'stats']);
    Route::get('/detailed-stats', [SnapshotApiController::class, 'detailedStats']);
    Route::post('/', [SnapshotApiController::class, 'store']);
    Route::post('/cleanup', [SnapshotApiController::class, 'cleanup']);
    Route::post('/rollback', [SnapshotApiController::class, 'rollback']);
    Route::get('/{guid}', [SnapshotApiController::class, 'show']);
    Route::post('/{guid}/publish', [SnapshotApiController::class, 'publish']);
    Route::post('/{guid}/archive', [SnapshotApiController::class, 'archive']);
    Route::get('/{guid}/manifest', [SnapshotApiController::class, 'manifest']);
    Route::get('/{guid}/download', [SnapshotApiController::class, 'download']);
    Route::get('/{guid}/validate', [SnapshotApiController::class, 'validate']);
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

// Subgraph API routes (admin only)
Route::prefix('subgraphs')->middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::get('/', [SubgraphController::class, 'index']);
    Route::post('/', [SubgraphController::class, 'store']);
    Route::get('/{subgraph}', [SubgraphController::class, 'show']);
    Route::put('/{subgraph}', [SubgraphController::class, 'update']);
    Route::delete('/{subgraph}', [SubgraphController::class, 'destroy']);
    Route::post('/{subgraph}/nodes', [SubgraphController::class, 'addNode']);
    Route::delete('/{subgraph}/nodes', [SubgraphController::class, 'removeNode']);
    Route::get('/{subgraph}/edges', [SubgraphController::class, 'getEdges']);
    Route::get('/{subgraph}/nodes', [SubgraphController::class, 'getNodes']);
});

// Scene Items API routes (admin only)
Route::prefix('scene-items')->middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::get('/', [SceneItemController::class, 'index']);
    Route::post('/', [SceneItemController::class, 'store']);
    Route::get('/{sceneItem}', [SceneItemController::class, 'show']);
    Route::put('/{sceneItem}', [SceneItemController::class, 'update']);
    Route::delete('/{sceneItem}', [SceneItemController::class, 'destroy']);
    Route::put('/{sceneItem}/position', [SceneItemController::class, 'updatePosition']);
    Route::put('/{sceneItem}/dimensions', [SceneItemController::class, 'updateDimensions']);
    Route::get('/by-type', [SceneItemController::class, 'getByType']);
});