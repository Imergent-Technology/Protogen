import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

interface ThemeToggleProps {
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  ButtonComponent?: React.ComponentType<any>;
}

export function ThemeToggle({ 
  className, 
  variant = 'ghost', 
  size = 'icon',
  ButtonComponent
}: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  // Default button component - can be overridden by consuming projects
  const Button = ButtonComponent || 'button';

  return (
    <Button
      type="button"
      onClick={toggleTheme}
      className={className}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
      data-variant={variant}
      data-size={size}
    >
      {theme === 'light' ? (
        <Moon className="h-4 w-4" />
      ) : (
        <Sun className="h-4 w-4" />
      )}
    </Button>
  );
} 