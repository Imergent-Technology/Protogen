export type Theme = 'light' | 'dark';

export interface ThemeColors {
  // Base colors
  background: string;
  foreground: string;
  
  // Card colors
  card: string;
  cardForeground: string;
  
  // Popover colors
  popover: string;
  popoverForeground: string;
  
  // Primary colors
  primary: string;
  primaryForeground: string;
  
  // Secondary colors
  secondary: string;
  secondaryForeground: string;
  
  // Muted colors
  muted: string;
  mutedForeground: string;
  
  // Accent colors
  accent: string;
  accentForeground: string;
  
  // Destructive colors
  destructive: string;
  destructiveForeground: string;
  
  // Border and input colors
  border: string;
  input: string;
  ring: string;
  
  // Stage-specific colors
  stageBackground: string;
  stageForeground: string;
  stageBorder: string;
  stageAccent: string;
}

export const themes: Record<Theme, ThemeColors> = {
  light: {
    // Base colors
    background: 'rgb(255, 255, 255)',
    foreground: 'rgb(10, 10, 10)',
    
    // Card colors
    card: 'rgb(255, 255, 255)',
    cardForeground: 'rgb(10, 10, 10)',
    
    // Popover colors
    popover: 'rgb(255, 255, 255)',
    popoverForeground: 'rgb(10, 10, 10)',
    
    // Primary colors
    primary: 'rgb(59, 130, 246)',
    primaryForeground: 'rgb(248, 250, 252)',
    
    // Secondary colors
    secondary: 'rgb(241, 245, 249)',
    secondaryForeground: 'rgb(10, 10, 10)',
    
    // Muted colors
    muted: 'rgb(241, 245, 249)',
    mutedForeground: 'rgb(100, 116, 139)',
    
    // Accent colors
    accent: 'rgb(241, 245, 249)',
    accentForeground: 'rgb(10, 10, 10)',
    
    // Destructive colors
    destructive: 'rgb(239, 68, 68)',
    destructiveForeground: 'rgb(248, 250, 252)',
    
    // Border and input colors
    border: 'rgb(226, 232, 240)',
    input: 'rgb(226, 232, 240)',
    ring: 'rgb(59, 130, 246)',
    
    // Stage-specific colors
    stageBackground: 'rgb(250, 250, 250)',
    stageForeground: 'rgb(10, 10, 10)',
    stageBorder: 'rgb(241, 245, 249)',
    stageAccent: 'rgb(59, 130, 246)',
  },
  
  dark: {
    // Base colors
    background: 'rgb(10, 10, 10)',
    foreground: 'rgb(250, 250, 250)',
    
    // Card colors
    card: 'rgb(10, 10, 10)',
    cardForeground: 'rgb(250, 250, 250)',
    
    // Popover colors
    popover: 'rgb(10, 10, 10)',
    popoverForeground: 'rgb(250, 250, 250)',
    
    // Primary colors
    primary: 'rgb(34, 197, 94)',
    primaryForeground: 'rgb(254, 247, 240)',
    
    // Secondary colors
    secondary: 'rgb(39, 39, 42)',
    secondaryForeground: 'rgb(250, 250, 250)',
    
    // Muted colors
    muted: 'rgb(39, 39, 42)',
    mutedForeground: 'rgb(161, 161, 170)',
    
    // Accent colors
    accent: 'rgb(39, 39, 42)',
    accentForeground: 'rgb(250, 250, 250)',
    
    // Destructive colors
    destructive: 'rgb(127, 29, 29)',
    destructiveForeground: 'rgb(250, 250, 250)',
    
    // Border and input colors
    border: 'rgb(39, 39, 42)',
    input: 'rgb(39, 39, 42)',
    ring: 'rgb(34, 197, 94)',
    
    // Stage-specific colors
    stageBackground: 'rgb(10, 10, 10)',
    stageForeground: 'rgb(250, 250, 250)',
    stageBorder: 'rgb(39, 39, 42)',
    stageAccent: 'rgb(34, 197, 94)',
  },
};

/**
 * Apply theme colors to CSS custom properties
 */
export function applyThemeColors(theme: Theme): void {
  const colors = themes[theme];
  const root = document.documentElement;
  
  // Apply colors using Tailwind v4 naming convention
  Object.entries(colors).forEach(([key, value]) => {
    const cssVar = `--color-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
    root.style.setProperty(cssVar, value);
  });
  
  // Toggle dark class for Tailwind
  root.classList.toggle('dark', theme === 'dark');
}

/**
 * Get current theme from localStorage or system preference
 */
export function getCurrentTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  
  const saved = localStorage.getItem('theme') as Theme;
  if (saved && (saved === 'light' || saved === 'dark')) {
    return saved;
  }
  
  // Fall back to system preference
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * Save theme preference
 */
export function saveTheme(theme: Theme): void {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem('theme', theme);
  
  // Also save in cookie for SSR
  const maxAge = 365 * 24 * 60 * 60;
  document.cookie = `theme=${theme};path=/;max-age=${maxAge};SameSite=Lax`;
}

/**
 * Initialize theme on app startup
 */
export function initializeTheme(): void {
  try {
    const theme = getCurrentTheme();
    applyThemeColors(theme);
    saveTheme(theme);
    
    // Listen for system theme changes
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', () => {
        const currentTheme = getCurrentTheme();
        applyThemeColors(currentTheme);
      });
    }
  } catch (error) {
    console.error('Error in initializeTheme:', error);
    if (error instanceof Error) {
      console.error('Error stack:', error.stack);
    }
  }
} 