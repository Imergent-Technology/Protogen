
import { Menu } from 'lucide-react';
import { Button } from '../../ui-primitives/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../ui-primitives/dropdown-menu';

interface ToolbarProps {
  className?: string;
  onNavigate?: (path: string) => void;
}

export function Toolbar({ className = '', onNavigate }: ToolbarProps) {
  const handleNavigation = (path: string) => {
    // Navigating to path
    onNavigate?.(path);
  };

  return (
    <div className={`bg-background border-b border-border px-4 py-2 flex items-center justify-between ${className}`}>
      {/* Left side - Hamburger menu */}
      <div className="flex items-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm"
              className="w-8 h-8 p-0 hover:bg-accent"
              aria-label="Main menu"
            >
              <Menu className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuItem onClick={() => handleNavigation('/dashboard')}>
              Dashboard
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleNavigation('/stages')}>
              Stages
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleNavigation('/graph')}>
              Graph View
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleNavigation('/settings')}>
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleNavigation('/help')}>
              Help
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleNavigation('/demo/modal')}>
              Demo: Modal Test
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleNavigation('/demo/toast')}>
              Demo: Toast Test
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleNavigation('/demo/confirm')}>
              Demo: Confirm Test
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Center - App title/logo space */}
      <div className="flex-1 flex justify-center">
        <h1 className="text-sm font-medium text-foreground">Protogen</h1>
      </div>

      {/* Right side - Future: Profile menu, breadcrumbs, etc. */}
      <div className="flex items-center">
        {/* Placeholder for future components */}
      </div>
    </div>
  );
}