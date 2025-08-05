<?php

namespace App\Http\Controllers;

use App\Models\Stage;
use App\Services\StageManager;
use App\Services\ThemeService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StageController extends Controller
{
    /**
     * Display the specified stage.
     */
    public function show(Request $request, Stage $stage): Response
    {
        // Ensure the stage is active
        if (!$stage->is_active) {
            abort(404);
        }

        return Inertia::render('stages/show', [
            'stage' => $stage->load(['graphNodes', 'graphEdges']),
            'themes' => ThemeService::getAvailableThemes(),
            'currentTheme' => ThemeService::getCurrentTheme(),
        ]);
    }

    /**
     * Display a fallback stage when no specific stage is available.
     */
    public function fallback(): Response
    {
        $fallbackConfig = StageManager::getFallbackStage();
        $fallbackStage = new Stage($fallbackConfig);

        return Inertia::render('stages/show', [
            'stage' => $fallbackStage,
            'isFallback' => true,
            'themes' => ThemeService::getAvailableThemes(),
            'currentTheme' => ThemeService::getCurrentTheme(),
        ]);
    }

    /**
     * Get all active stages for navigation.
     */
    public function index(): Response
    {
        $stages = Stage::active()
            ->orderBy('sort_order')
            ->get(['id', 'name', 'slug', 'type', 'description']);

        return Inertia::render('stages/index', [
            'stages' => $stages,
            'availableTypes' => StageManager::getAvailableTypes(),
            'themes' => ThemeService::getAvailableThemes(),
            'currentTheme' => ThemeService::getCurrentTheme(),
        ]);
    }
} 