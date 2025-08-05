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
  
  // Chart colors
  chart1: string;
  chart2: string;
  chart3: string;
  chart4: string;
  chart5: string;
  
  // Sidebar colors
  sidebar: string;
  sidebarForeground: string;
  sidebarPrimary: string;
  sidebarPrimaryForeground: string;
  sidebarAccent: string;
  sidebarAccentForeground: string;
  sidebarBorder: string;
  sidebarRing: string;
  
  // Stage-specific colors
  stageBackground: string;
  stageForeground: string;
  stageBorder: string;
  stageAccent: string;
}

export const themes: Record<Theme, ThemeColors> = {
  light: {
    // Base colors
    background: 'oklch(1 0 0)',
    foreground: 'oklch(0.145 0 0)',
    
    // Card colors
    card: 'oklch(1 0 0)',
    cardForeground: 'oklch(0.145 0 0)',
    
    // Popover colors
    popover: 'oklch(1 0 0)',
    popoverForeground: 'oklch(0.145 0 0)',
    
    // Primary colors
    primary: 'oklch(0.205 0 0)',
    primaryForeground: 'oklch(0.985 0 0)',
    
    // Secondary colors
    secondary: 'oklch(0.97 0 0)',
    secondaryForeground: 'oklch(0.205 0 0)',
    
    // Muted colors
    muted: 'oklch(0.97 0 0)',
    mutedForeground: 'oklch(0.556 0 0)',
    
    // Accent colors
    accent: 'oklch(0.97 0 0)',
    accentForeground: 'oklch(0.205 0 0)',
    
    // Destructive colors
    destructive: 'oklch(0.577 0.245 27.325)',
    destructiveForeground: 'oklch(0.577 0.245 27.325)',
    
    // Border and input colors
    border: 'oklch(0.922 0 0)',
    input: 'oklch(0.922 0 0)',
    ring: 'oklch(0.87 0 0)',
    
    // Chart colors
    chart1: 'oklch(0.646 0.222 41.116)',
    chart2: 'oklch(0.6 0.118 184.704)',
    chart3: 'oklch(0.398 0.07 227.392)',
    chart4: 'oklch(0.828 0.189 84.429)',
    chart5: 'oklch(0.769 0.188 70.08)',
    
    // Sidebar colors
    sidebar: 'oklch(0.985 0 0)',
    sidebarForeground: 'oklch(0.145 0 0)',
    sidebarPrimary: 'oklch(0.205 0 0)',
    sidebarPrimaryForeground: 'oklch(0.985 0 0)',
    sidebarAccent: 'oklch(0.97 0 0)',
    sidebarAccentForeground: 'oklch(0.205 0 0)',
    sidebarBorder: 'oklch(0.922 0 0)',
    sidebarRing: 'oklch(0.87 0 0)',
    
    // Stage-specific colors
    stageBackground: 'oklch(0.99 0 0)',
    stageForeground: 'oklch(0.145 0 0)',
    stageBorder: 'oklch(0.95 0 0)',
    stageAccent: 'oklch(0.646 0.222 41.116)',
  },
  
  dark: {
    // Base colors
    background: 'oklch(0.145 0 0)',
    foreground: 'oklch(0.985 0 0)',
    
    // Card colors
    card: 'oklch(0.145 0 0)',
    cardForeground: 'oklch(0.985 0 0)',
    
    // Popover colors
    popover: 'oklch(0.145 0 0)',
    popoverForeground: 'oklch(0.985 0 0)',
    
    // Primary colors
    primary: 'oklch(0.985 0 0)',
    primaryForeground: 'oklch(0.205 0 0)',
    
    // Secondary colors
    secondary: 'oklch(0.269 0 0)',
    secondaryForeground: 'oklch(0.985 0 0)',
    
    // Muted colors
    muted: 'oklch(0.269 0 0)',
    mutedForeground: 'oklch(0.708 0 0)',
    
    // Accent colors
    accent: 'oklch(0.269 0 0)',
    accentForeground: 'oklch(0.985 0 0)',
    
    // Destructive colors
    destructive: 'oklch(0.396 0.141 25.723)',
    destructiveForeground: 'oklch(0.637 0.237 25.331)',
    
    // Border and input colors
    border: 'oklch(0.269 0 0)',
    input: 'oklch(0.269 0 0)',
    ring: 'oklch(0.439 0 0)',
    
    // Chart colors
    chart1: 'oklch(0.488 0.243 264.376)',
    chart2: 'oklch(0.696 0.17 162.48)',
    chart3: 'oklch(0.769 0.188 70.08)',
    chart4: 'oklch(0.627 0.265 303.9)',
    chart5: 'oklch(0.645 0.246 16.439)',
    
    // Sidebar colors
    sidebar: 'oklch(0.205 0 0)',
    sidebarForeground: 'oklch(0.985 0 0)',
    sidebarPrimary: 'oklch(0.985 0 0)',
    sidebarPrimaryForeground: 'oklch(0.985 0 0)',
    sidebarAccent: 'oklch(0.269 0 0)',
    sidebarAccentForeground: 'oklch(0.985 0 0)',
    sidebarBorder: 'oklch(0.269 0 0)',
    sidebarRing: 'oklch(0.439 0 0)',
    
    // Stage-specific colors
    stageBackground: 'oklch(0.125 0 0)',
    stageForeground: 'oklch(0.985 0 0)',
    stageBorder: 'oklch(0.225 0 0)',
    stageAccent: 'oklch(0.488 0.243 264.376)',
  },
};

/**
 * Apply theme colors to CSS custom properties
 */
export function applyThemeColors(theme: Theme): void {
  const colors = themes[theme];
  const root = document.documentElement;
  
  Object.entries(colors).forEach(([key, value]) => {
    const cssVar = `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
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
} 