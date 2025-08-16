import { useState, useEffect } from 'react';
import { Theme, applyThemeColors, getCurrentTheme, saveTheme } from '../themes';

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>('light');

  const setTheme = (newTheme: Theme) => {
    console.log('setTheme called with:', newTheme);
    setThemeState(newTheme);
    applyThemeColors(newTheme);
    saveTheme(newTheme);
  };

  const toggleTheme = () => {
    console.log('toggleTheme called, current theme:', theme);
    const newTheme = theme === 'light' ? 'dark' : 'light';
    console.log('Switching to theme:', newTheme);
    setTheme(newTheme);
  };

  useEffect(() => {
    // Initialize theme on mount
    console.log('useTheme useEffect running');
    const currentTheme = getCurrentTheme();
    console.log('Current theme from getCurrentTheme:', currentTheme);
    setThemeState(currentTheme);
    applyThemeColors(currentTheme);
  }, []);

  return { theme, setTheme, toggleTheme };
} 