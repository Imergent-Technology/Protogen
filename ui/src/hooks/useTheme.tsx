import { useState, useEffect } from 'react';
import { Theme, applyThemeColors, getCurrentTheme, saveTheme } from '../lib/themes';

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>('light');

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    applyThemeColors(newTheme);
    saveTheme(newTheme);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  useEffect(() => {
    // Initialize theme on mount
    const currentTheme = getCurrentTheme();
    setThemeState(currentTheme);
    applyThemeColors(currentTheme);
  }, []);

  return { theme, setTheme, toggleTheme };
} 