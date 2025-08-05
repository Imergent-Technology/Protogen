<?php

namespace App\Services;

class ThemeService
{
    /**
     * Get available themes
     */
    public static function getAvailableThemes(): array
    {
        return [
            'light' => [
                'name' => 'Light',
                'description' => 'Light theme with high contrast',
                'icon' => '☀️',
            ],
            'dark' => [
                'name' => 'Dark',
                'description' => 'Dark theme for low-light environments',
                'icon' => '🌙',
            ],
        ];
    }

    /**
     * Get theme colors for a specific theme
     */
    public static function getThemeColors(string $theme): array
    {
        $themes = [
            'light' => [
                'background' => 'oklch(1 0 0)',
                'foreground' => 'oklch(0.145 0 0)',
                'card' => 'oklch(1 0 0)',
                'cardForeground' => 'oklch(0.145 0 0)',
                'popover' => 'oklch(1 0 0)',
                'popoverForeground' => 'oklch(0.145 0 0)',
                'primary' => 'oklch(0.205 0 0)',
                'primaryForeground' => 'oklch(0.985 0 0)',
                'secondary' => 'oklch(0.97 0 0)',
                'secondaryForeground' => 'oklch(0.205 0 0)',
                'muted' => 'oklch(0.97 0 0)',
                'mutedForeground' => 'oklch(0.556 0 0)',
                'accent' => 'oklch(0.97 0 0)',
                'accentForeground' => 'oklch(0.205 0 0)',
                'destructive' => 'oklch(0.577 0.245 27.325)',
                'destructiveForeground' => 'oklch(0.577 0.245 27.325)',
                'border' => 'oklch(0.922 0 0)',
                'input' => 'oklch(0.922 0 0)',
                'ring' => 'oklch(0.87 0 0)',
                'chart1' => 'oklch(0.646 0.222 41.116)',
                'chart2' => 'oklch(0.6 0.118 184.704)',
                'chart3' => 'oklch(0.398 0.07 227.392)',
                'chart4' => 'oklch(0.828 0.189 84.429)',
                'chart5' => 'oklch(0.769 0.188 70.08)',
                'sidebar' => 'oklch(0.985 0 0)',
                'sidebarForeground' => 'oklch(0.145 0 0)',
                'sidebarPrimary' => 'oklch(0.205 0 0)',
                'sidebarPrimaryForeground' => 'oklch(0.985 0 0)',
                'sidebarAccent' => 'oklch(0.97 0 0)',
                'sidebarAccentForeground' => 'oklch(0.205 0 0)',
                'sidebarBorder' => 'oklch(0.922 0 0)',
                'sidebarRing' => 'oklch(0.87 0 0)',
                'stageBackground' => 'oklch(0.99 0 0)',
                'stageForeground' => 'oklch(0.145 0 0)',
                'stageBorder' => 'oklch(0.95 0 0)',
                'stageAccent' => 'oklch(0.646 0.222 41.116)',
            ],
            'dark' => [
                'background' => 'oklch(0.145 0 0)',
                'foreground' => 'oklch(0.985 0 0)',
                'card' => 'oklch(0.145 0 0)',
                'cardForeground' => 'oklch(0.985 0 0)',
                'popover' => 'oklch(0.145 0 0)',
                'popoverForeground' => 'oklch(0.985 0 0)',
                'primary' => 'oklch(0.985 0 0)',
                'primaryForeground' => 'oklch(0.205 0 0)',
                'secondary' => 'oklch(0.269 0 0)',
                'secondaryForeground' => 'oklch(0.985 0 0)',
                'muted' => 'oklch(0.269 0 0)',
                'mutedForeground' => 'oklch(0.708 0 0)',
                'accent' => 'oklch(0.269 0 0)',
                'accentForeground' => 'oklch(0.985 0 0)',
                'destructive' => 'oklch(0.396 0.141 25.723)',
                'destructiveForeground' => 'oklch(0.637 0.237 25.331)',
                'border' => 'oklch(0.269 0 0)',
                'input' => 'oklch(0.269 0 0)',
                'ring' => 'oklch(0.439 0 0)',
                'chart1' => 'oklch(0.488 0.243 264.376)',
                'chart2' => 'oklch(0.696 0.17 162.48)',
                'chart3' => 'oklch(0.769 0.188 70.08)',
                'chart4' => 'oklch(0.627 0.265 303.9)',
                'chart5' => 'oklch(0.645 0.246 16.439)',
                'sidebar' => 'oklch(0.205 0 0)',
                'sidebarForeground' => 'oklch(0.985 0 0)',
                'sidebarPrimary' => 'oklch(0.985 0 0)',
                'sidebarPrimaryForeground' => 'oklch(0.985 0 0)',
                'sidebarAccent' => 'oklch(0.269 0 0)',
                'sidebarAccentForeground' => 'oklch(0.985 0 0)',
                'sidebarBorder' => 'oklch(0.269 0 0)',
                'sidebarRing' => 'oklch(0.439 0 0)',
                'stageBackground' => 'oklch(0.125 0 0)',
                'stageForeground' => 'oklch(0.985 0 0)',
                'stageBorder' => 'oklch(0.225 0 0)',
                'stageAccent' => 'oklch(0.488 0.243 264.376)',
            ],
        ];

        return $themes[$theme] ?? $themes['light'];
    }

    /**
     * Get current theme from request
     */
    public static function getCurrentTheme(): string
    {
        $theme = request()->cookie('theme');
        
        if ($theme && in_array($theme, ['light', 'dark'])) {
            return $theme;
        }

        // Fall back to system preference
        $acceptHeader = request()->header('Accept');
        if (str_contains($acceptHeader, 'dark')) {
            return 'dark';
        }

        return 'light';
    }

    /**
     * Generate CSS variables for a theme
     */
    public static function generateCssVariables(string $theme): string
    {
        $colors = self::getThemeColors($theme);
        $css = ":root {\n";
        
        foreach ($colors as $key => $value) {
            $cssVar = '--' . strtolower(preg_replace('/([A-Z])/', '-$1', $key));
            $css .= "    {$cssVar}: {$value};\n";
        }
        
        $css .= "}\n";
        
        if ($theme === 'dark') {
            $css .= ".dark {\n";
            foreach ($colors as $key => $value) {
                $cssVar = '--' . strtolower(preg_replace('/([A-Z])/', '-$1', $key));
                $css .= "    {$cssVar}: {$value};\n";
            }
            $css .= "}\n";
        }
        
        return $css;
    }
} 