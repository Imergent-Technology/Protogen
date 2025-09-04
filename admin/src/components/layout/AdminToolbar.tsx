import { PanelLeft, Home, Layers, Users, BarChart3, Network } from 'lucide-react';
import { AdminUserMenu } from './AdminUserMenu';

interface AdminToolbarProps {
  currentView: string;
  viewSubtitle?: string;
  onToggleNavigation: () => void;
  onNavigateToDashboard: () => void;
  onNavigateToScenes: () => void;
  onNavigateToDecks: () => void;
  onNavigateToUsers: () => void;
  onNavigateToAnalytics: () => void;
  onNavigateToGraphStudio: () => void;
  adminUser?: any;
  onLogout?: () => void;
}

export function AdminToolbar({
  currentView,
  viewSubtitle,
  onToggleNavigation,
  onNavigateToDashboard,
  onNavigateToScenes,
  onNavigateToDecks,
  onNavigateToUsers,
  onNavigateToAnalytics,
  onNavigateToGraphStudio,
  adminUser,
  onLogout
}: AdminToolbarProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center space-x-4">
        {/* Navigation Toggle */}
        <button
          onClick={onToggleNavigation}
          className="p-2 hover:bg-muted rounded-lg"
        >
          <PanelLeft className="h-5 w-5" />
        </button>
        
        {/* Logo/Brand */}
        <div className="flex items-center space-x-2">
          <span className="text-2xl"><img src="/protogen-logo.png" className="h-10 w-10" /></span>
          <div>
            <h1 className="text-lg font-semibold">Progress Admin</h1>
            <p className="text-sm text-muted-foreground">{viewSubtitle || currentView}</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="hidden lg:flex items-center space-x-2">
        <button
          onClick={onNavigateToDashboard}
          className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            currentView === 'dashboard'
              ? 'text-primary bg-primary/10'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          }`}
        >
          <Home className="h-4 w-4" />
          <span>Dashboard</span>
        </button>
        
        <button
          onClick={onNavigateToScenes}
          className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            currentView === 'scenes'
              ? 'text-primary bg-primary/10'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          }`}
        >
          <Layers className="h-4 w-4" />
          <span>Scenes</span>
        </button>
        
        <button
          onClick={onNavigateToDecks}
          className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            currentView === 'decks'
              ? 'text-primary bg-primary/10'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          }`}
        >
          <Layers className="h-4 w-4" />
          <span>Decks</span>
        </button>
        
        <button
          onClick={onNavigateToUsers}
          className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            currentView === 'users'
              ? 'text-primary bg-primary/10'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Users</span>
        </button>
        
        <button
          onClick={onNavigateToAnalytics}
          className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            currentView === 'analytics'
              ? 'text-primary bg-primary/10'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          }`}
        >
          <BarChart3 className="h-4 w-4" />
          <span>Analytics</span>
        </button>
        
        <button
          onClick={onNavigateToGraphStudio}
          className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            currentView === 'graph-studio'
              ? 'text-primary bg-primary/10'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          }`}
        >
          <Network className="h-4 w-4" />
          <span>Graph Studio</span>
        </button>
      </div>

      {/* User Profile */}
      <AdminUserMenu 
        user={adminUser} 
        onLogout={onLogout || (() => {})} 
      />
    </div>
  );
}
