<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\StageApiController;

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