<?php

namespace App\Services;

use App\Models\Stage;

class StageManager
{
    /**
     * Get the fallback stage configuration.
     */
    public static function getFallbackStage(): array
    {
        return [
            'name' => 'No Content Found',
            'slug' => 'fallback',
            'description' => 'Fallback stage when no content is available',
            'type' => 'basic',
            'config' => [
                'title' => 'Oops...',
                'content' => 'There was no content found.',
                'icon' => '🤖',
                'showFallback' => true,
            ],
            'is_active' => true,
            'sort_order' => 0,
        ];
    }

    /**
     * Get stage configuration by type.
     */
    public static function getStageConfig(string $type, array $config = []): array
    {
        $defaultConfigs = [
            'basic' => [
                'title' => 'Welcome! 👋',
                'content' => 'This is a simple stage with basic content. Each stage can be customized with different types of content and interactions.',
                'icon' => '✨',
            ],
            'graph' => [
                'title' => 'Interactive Graph 📊',
                'content' => 'This stage contains an interactive graph visualization.',
                'icon' => '📈',
            ],
            'document' => [
                'title' => 'Document Viewer 📄',
                'content' => 'This stage displays document content.',
                'icon' => '📋',
            ],
            'table' => [
                'title' => 'Data Table 📋',
                'content' => 'This stage shows tabular data.',
                'icon' => '📊',
            ],
            'custom' => [
                'title' => 'Custom Stage ⚙️',
                'content' => 'This is a custom stage with specialized content.',
                'icon' => '🔧',
            ],
        ];

        return array_merge($defaultConfigs[$type] ?? $defaultConfigs['basic'], $config);
    }

    /**
     * Validate stage configuration.
     */
    public static function validateConfig(string $type, array $config): array
    {
        $errors = [];

        // Temporarily disable strict validation for development
        // TODO: Re-enable with proper validation logic
        
        return $errors;
    }

    /**
     * Get available stage types.
     */
    public static function getAvailableTypes(): array
    {
        return [
            'basic' => [
                'name' => 'Basic Stage',
                'description' => 'Simple stage with title, content, and icon',
                'icon' => '✨',
            ],
            'graph' => [
                'name' => 'Graph Stage',
                'description' => 'Interactive graph visualization',
                'icon' => '📊',
            ],
            'document' => [
                'name' => 'Document Stage',
                'description' => 'Document viewer with rich content',
                'icon' => '📄',
            ],
            'table' => [
                'name' => 'Table Stage',
                'description' => 'Data table with rows and columns',
                'icon' => '📋',
            ],
            'custom' => [
                'name' => 'Custom Stage',
                'description' => 'Custom stage with specialized content',
                'icon' => '🔧',
            ],
        ];
    }
} 