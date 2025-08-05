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
    background: '0 0% 100%',
    foreground: '222.2 84% 4.9%',
    
    // Card colors
    card: '0 0% 100%',
    cardForeground: '222.2 84% 4.9%',
    
    // Popover colors
    popover: '0 0% 100%',
    popoverForeground: '222.2 84% 4.9%',
    
    // Primary colors
    primary: '221.2 83.2% 53.3%',
    primaryForeground: '210 40% 98%',
    
    // Secondary colors
    secondary: '210 40% 96%',
    secondaryForeground: '222.2 84% 4.9%',
    
    // Muted colors
    muted: '210 40% 96%',
    mutedForeground: '215.4 16.3% 46.9%',
    
    // Accent colors
    accent: '210 40% 96%',
    accentForeground: '222.2 84% 4.9%',
    
    // Destructive colors
    destructive: '0 84.2% 60.2%',
    destructiveForeground: '210 40% 98%',
    
    // Border and input colors
    border: '214.3 31.8% 91.4%',
    input: '214.3 31.8% 91.4%',
    ring: '221.2 83.2% 53.3%',
    
    // Stage-specific colors
    stageBackground: '0 0% 99%',
    stageForeground: '222.2 84% 4.9%',
    stageBorder: '214.3 31.8% 95%',
    stageAccent: '221.2 83.2% 53.3%',
  },
  
  dark: {
    // Base colors
    background: '222.2 84% 4.9%',
    foreground: '210 40% 98%',
    
    // Card colors
    card: '222.2 84% 4.9%',
    cardForeground: '210 40% 98%',
    
    // Popover colors
    popover: '222.2 84% 4.9%',
    popoverForeground: '210 40% 98%',
    
    // Primary colors
    primary: '217.2 91.2% 59.8%',
    primaryForeground: '222.2 84% 4.9%',
    
    // Secondary colors
    secondary: '217.2 32.6% 17.5%',
    secondaryForeground: '210 40% 98%',
    
    // Muted colors
    muted: '217.2 32.6% 17.5%',
    mutedForeground: '215 20.2% 65.1%',
    
    // Accent colors
    accent: '217.2 32.6% 17.5%',
    accentForeground: '210 40% 98%',
    
    // Destructive colors
    destructive: '0 62.8% 30.6%',
    destructiveForeground: '210 40% 98%',
    
    // Border and input colors
    border: '217.2 32.6% 17.5%',
    input: '217.2 32.6% 17.5%',
    ring: '224.3 76.3% 94.1%',
    
    // Stage-specific colors
    stageBackground: '222.2 84% 2%',
    stageForeground: '210 40% 98%',
    stageBorder: '217.2 32.6% 22%',
    stageAccent: '217.2 91.2% 59.8%',
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