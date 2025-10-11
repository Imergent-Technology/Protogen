import React, { useState } from 'react';
import { Button, useTheme } from '@protogen/shared';
import { 
  Menu, 
  X, 
  User, 
  Settings, 
  LogOut, 
  Home,
  Layers,
  MessageSquare,
  Network,
  BookOpen,
  Moon,
  Sun,
  Edit,
  Shield,
  Users as UsersIcon
} from 'lucide-react';
import { useResponsiveSidebar } from './ResponsiveLayout';
import { useNavigator, NavigationTarget } from '@protogen/shared/systems/navigator';
import { ContextDisplay, NavigationHistory, NavigationControls } from '../navigation';

interface User {
  id: number;
  name: string;
  email: string;
  reputation: number;
  is_admin: boolean;
}

interface AppLayoutProps {
  children: React.ReactNode;
  user: User | null;
  onLogout: () => void;
  currentContext?: string;
  onContextClick?: () => void;
  onNavigation?: (target: NavigationTarget) => void;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  user,
  onLogout,
  currentContext = "Home",
  onContextClick,
  onNavigation
}) => {
  const { isMobile, sidebarOpen, setSidebarOpen, toggleSidebar } = useResponsiveSidebar();
  const { navigateTo } = useNavigator();
  const { theme, toggleTheme } = useTheme();
  const [historyOpen, setHistoryOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleNavigation = (target: NavigationTarget) => {
    // Use the parent navigation callback if available, otherwise use the navigator
    if (onNavigation) {
      onNavigation(target);
    } else {
      navigateTo(target);
    }
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const navigationItems = [
    { 
      id: 'home', 
      label: 'Home', 
      icon: Home, 
      active: true,
      onClick: () => handleNavigation({ type: 'scene', id: 'home', slug: 'home' })
    },
    { 
      id: 'scenes', 
      label: 'Scenes', 
      icon: Layers, 
      active: false,
      onClick: () => handleNavigation({ type: 'scene', id: 'scenes', slug: 'scenes' })
    },
    { 
      id: 'authoring', 
      label: 'Scene Authoring', 
      icon: Edit, 
      active: false,
      onClick: () => handleNavigation({ type: 'scene', id: 'authoring', slug: 'authoring' })
    },
    { 
      id: 'decks', 
      label: 'Decks', 
      icon: BookOpen, 
      active: false,
      onClick: () => handleNavigation({ type: 'deck', id: 'decks', slug: 'decks' })
    },
    { 
      id: 'graph', 
      label: 'Graph', 
      icon: Network, 
      active: false,
      onClick: () => handleNavigation({ type: 'scene', id: 'graph', slug: 'graph' })
    },
    { 
      id: 'engagement', 
      label: 'Engagement', 
      icon: MessageSquare, 
      active: false,
      onClick: () => handleNavigation({ type: 'scene', id: 'engagement', slug: 'engagement' })
    },
  ];

  const handleContextClick = () => {
    if (onContextClick) {
      onContextClick();
    } else {
      setHistoryOpen(!historyOpen);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Top Bar */}
      <header className="h-14 bg-card border-b border-border flex items-center justify-between px-4 shrink-0">
        {/* Left: Menu Button */}
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="h-8 w-8 p-0"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>

        {/* Center: Context Name Button */}
        <div className="flex-1 flex justify-center">
          <ContextDisplay onClick={handleContextClick} />
        </div>

        {/* Right: Context Controls Area */}
        <div className="flex items-center space-x-2">
          {/* Navigation Controls */}
          <NavigationControls />
          
          {/* Context-specific controls */}
          <div className="flex items-center space-x-1">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MessageSquare className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        {!isMobile && (
          <aside className={`
            ${sidebarOpen ? 'w-64' : 'w-0'} 
            bg-card border-r border-border 
            transition-all duration-300 ease-in-out 
            overflow-hidden shrink-0
          `}>
          {sidebarOpen && (
            <div className="p-4 space-y-6">
              {/* Navigation */}
              <nav className="space-y-1">
                {navigationItems.map((item) => (
                  <Button
                    key={item.id}
                    variant={item.active ? "secondary" : "ghost"}
                    className="w-full justify-start space-x-3 h-9"
                    onClick={item.onClick}
                  >
                    <item.icon className="h-4 w-4" />
                    <span className="text-sm">{item.label}</span>
                  </Button>
                ))}
              </nav>

              {/* User Section */}
              <div className="border-t border-border pt-4">
                <div className="relative">
                  <Button
                    variant="ghost"
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="w-full justify-start space-x-3 h-9"
                  >
                    <User className="h-4 w-4" />
                    <div className="flex-1 text-left">
                      <div className="text-sm font-medium truncate">{user?.name || 'Guest'}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {(user?.reputation || 0) * 100}% reputation
                      </div>
                    </div>
                  </Button>

                  {/* User Menu Dropdown */}
                  {userMenuOpen && (
                    <div className="absolute bottom-full left-0 right-0 mb-2 bg-popover border border-border rounded-md shadow-lg z-50">
                      <div className="p-2 space-y-1">
                        <Button variant="ghost" size="sm" className="w-full justify-start">
                          <User className="h-4 w-4 mr-2" />
                          Profile
                        </Button>
                        <Button variant="ghost" size="sm" className="w-full justify-start">
                          <Settings className="h-4 w-4 mr-2" />
                          Settings
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="w-full justify-start"
                          onClick={toggleTheme}
                        >
                          {theme === 'light' ? (
                            <Moon className="h-4 w-4 mr-2" />
                          ) : (
                            <Sun className="h-4 w-4 mr-2" />
                          )}
                          Theme
                        </Button>
                        <div className="border-t border-border my-1" />
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="w-full justify-start text-destructive"
                          onClick={onLogout}
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Sign Out
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </aside>
        )}

        {/* Mobile Sidebar Overlay */}
        {isMobile && sidebarOpen && (
          <>
            <div 
              className="fixed inset-0 z-40 bg-black/50" 
              onClick={() => setSidebarOpen(false)}
            />
            <aside className="fixed left-0 top-0 h-full w-80 max-w-[85vw] z-50 bg-card border-r border-border transform transition-transform duration-300 ease-in-out">
              <div className="p-4 space-y-6">
                {/* Close Button */}
                <div className="flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSidebarOpen(false)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Navigation */}
                <nav className="space-y-1">
                  {navigationItems.map((item) => (
                    <Button
                      key={item.id}
                      variant={item.active ? "secondary" : "ghost"}
                      className="w-full justify-start space-x-3 h-9"
                      onClick={item.onClick}
                    >
                      <item.icon className="h-4 w-4" />
                      <span className="text-sm">{item.label}</span>
                    </Button>
                  ))}
                </nav>

                {/* User Section */}
                <div className="border-t border-border pt-4">
                  <div className="relative">
                    <Button
                      variant="ghost"
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="w-full justify-start space-x-3 h-9"
                    >
                      <User className="h-4 w-4" />
                      <div className="flex-1 text-left">
                        <div className="text-sm font-medium truncate">{user?.name || 'Guest'}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          {(user?.reputation || 0) * 100}% reputation
                        </div>
                      </div>
                    </Button>

                    {/* User Menu Dropdown */}
                    {userMenuOpen && (
                      <div className="absolute bottom-full left-0 right-0 mb-2 bg-popover border border-border rounded-md shadow-lg z-50">
                        <div className="p-2 space-y-1">
                          <Button variant="ghost" size="sm" className="w-full justify-start">
                            <User className="h-4 w-4 mr-2" />
                            Profile
                          </Button>
                          <Button variant="ghost" size="sm" className="w-full justify-start">
                            <Settings className="h-4 w-4 mr-2" />
                            Settings
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="w-full justify-start"
                            onClick={toggleTheme}
                          >
                            {theme === 'light' ? (
                              <Moon className="h-4 w-4 mr-2" />
                            ) : (
                              <Sun className="h-4 w-4 mr-2" />
                            )}
                            Theme
                          </Button>
                          <div className="border-t border-border my-1" />
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="w-full justify-start text-destructive"
                            onClick={onLogout}
                          >
                            <LogOut className="h-4 w-4 mr-2" />
                            Sign Out
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </aside>
          </>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>

      {/* Navigation History Overlay */}
      <NavigationHistory isOpen={historyOpen} onClose={() => setHistoryOpen(false)} />

    </div>
  );
};
