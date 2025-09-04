import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Layers, Users, BarChart3, Network, Settings, Building2 } from 'lucide-react';
import { apiClient } from '@progress/shared';
import {
  UsersList,
  AdminLogin,
  ContextMenu,
  useContextMenu,
  GraphStudio,
  AdminToolbar,
  ToastContainer,
  useToasts,
  SceneManager,
  TenantManager,
  SceneNavigation
} from './components';
import { AnimatePresence, motion } from 'framer-motion';
import { initializeTheme } from '@progress/shared';

interface AdminUser {
  id: number;
  name: string;
  email: string;
  is_admin: boolean;
}

type ViewMode = 'admin' | 'scenes' | 'decks' | 'contexts' | 'users' | 'analytics' | 'graph-studio' | 'tenants';

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [viewMode, setViewMode] = useState<ViewMode>('admin');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [authChecking, setAuthChecking] = useState(true);
  
  // Content management
  const [currentScene, setCurrentScene] = useState<any>(null);
  const [scenes, setScenes] = useState<any[]>([]);
  const [_scenesLoading, _setScenesLoading] = useState(false);
  
  // Navigation state
  const [isNavigationOpen, setIsNavigationOpen] = useState(true);
  const [_transitionDirection, _setTransitionDirection] = useState<'forward' | 'backward' | 'up' | 'down'>('forward');
  const [isProgrammaticNavigation, setIsProgrammaticNavigation] = useState(false);

  
  // Context menu
  const { contextMenu, showContextMenu: _showContextMenu, hideContextMenu } = useContextMenu();
  
  const { toasts, removeToast, showSuccess, showError } = useToasts();

  // Helper function to get view subtitle
  const getViewSubtitle = (view: ViewMode): string => {
    switch (view) {
      case 'admin':
        return 'Protogen Admin - System administration and management';
      case 'scenes':
        return 'Scene Management';
      case 'decks':
        return 'Deck Management';
      case 'contexts':
        return 'Context Management';
      case 'tenants':
        return 'Tenant Management';
      case 'users':
        return 'User Management';
      case 'analytics':
        return 'Analytics Dashboard';
      case 'graph-studio':
        return 'Graph Studio';
      default:
        return '';
    }
  };

  useEffect(() => {
    // Initialize theme system
    initializeTheme();
    
    // Check if we have a stored token
    const token = localStorage.getItem('admin_token');
    if (token) {
      setAuthToken(token);
      checkAuthStatus(token);
    } else {
      setAuthChecking(false);
    }
  }, []);

  // Sync URL with state
  useEffect(() => {
    if (isProgrammaticNavigation) return;

    const path = location.pathname;
    
    if (path === '/users') {
      setViewMode('users');
    } else if (path === '/analytics') {
      setViewMode('analytics');
    } else if (path === '/decks') {
      setViewMode('decks');
    } else if (path === '/scenes') {
      setViewMode('scenes');
    } else if (path === '/contexts') {
      setViewMode('contexts');
    } else if (path === '/tenants') {
      setViewMode('tenants');
    } else if (path === '/graph-studio') {
      setViewMode('graph-studio');
    } else if (path === '/') {
      setViewMode('admin');
      setCurrentScene(null);
    }
  }, [location.pathname, isProgrammaticNavigation]);

  // Update URL when state changes
  const updateURL = (mode: ViewMode) => {
    setIsProgrammaticNavigation(true);
    switch (mode) {
      case 'scenes':
        navigate('/scenes');
        break;
      case 'decks':
        navigate('/decks');
        break;
      case 'contexts':
        navigate('/contexts');
        break;
      case 'tenants':
        navigate('/tenants');
        break;
      case 'users':
        navigate('/users');
        break;
      case 'analytics':
        navigate('/analytics');
        break;
      case 'graph-studio':
        navigate('/graph-studio');
        break;
      default:
        navigate('/');
    }
    // Reset the flag after a short delay
    setTimeout(() => setIsProgrammaticNavigation(false), 100);
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadScenes();
    }
  }, [isAuthenticated]);

  const checkAuthStatus = async (token?: string) => {
    try {
      const tokenToUse = token || authToken;
              const response = await fetch('http://progress.local:8080/api/auth/admin/check', {
        headers: {
          'Authorization': `Bearer ${tokenToUse}`,
          'Content-Type': 'application/json',
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.authenticated) {
          setIsAuthenticated(true);
          setAdminUser(data.user);
          if (tokenToUse) {
            apiClient.setAuthToken(tokenToUse);
          }
        } else {
          clearAuth();
        }
      } else {
        clearAuth();
      }
    } catch (error) {
      // Not authenticated
      clearAuth();
    } finally {
      setAuthChecking(false);
    }
  };

  const clearAuth = () => {
      localStorage.removeItem('admin_token');
      setAuthToken(null);
      setIsAuthenticated(false);
      setAdminUser(null);
      apiClient.clearAuthToken();
      setAuthChecking(false);
  };

  const handleLogin = async (email: string, password: string) => {
    setLoginLoading(true);
    setLoginError(null);

    try {
      const response = await fetch('http://progress.local:8080/api/auth/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        const token = data.token;
        
        localStorage.setItem('admin_token', token);
        setAuthToken(token);
        setIsAuthenticated(true);
        setAdminUser(data.user);
        apiClient.setAuthToken(token);
        
        showSuccess('Login Successful', 'Welcome to the admin panel!');
      } else {
        const errorData = await response.json();
        setLoginError(errorData.message || 'Login failed');
      }
    } catch (error) {
      setLoginError('Network error. Please try again.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      if (authToken) {
        await fetch('http://progress.local:8080/api/auth/admin/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          }
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    clearAuth();
    showSuccess('Logged Out', 'You have been successfully logged out');
  };

    const loadScenes = async () => {
    _setScenesLoading(true);
    try {
      // TODO: Replace with actual Scene API call
      setScenes([]);
    } catch (error) {
      console.error('Failed to load scenes:', error);
      showError('Failed to load scenes', 'Please try again later');
    } finally {
      _setScenesLoading(false);
    }
  };

  // Load scenes when component mounts
  useEffect(() => {
    if (isAuthenticated) {
      loadScenes();
    }
  }, [isAuthenticated]);

    const _handleSceneEdit = () => {
    if (currentScene) {
      // TODO: Implement scene editing
      console.log('Scene editing not yet implemented');
    }
  };

  const handleNavigateToScenes = () => {
    _setTransitionDirection('forward');
    setViewMode('scenes');
    updateURL('scenes');
  };

  const handleNavigateToUsers = () => {
    setViewMode('users');
    updateURL('users');
  };

  const handleNavigateToAnalytics = () => {
    _setTransitionDirection('forward');
    setViewMode('analytics');
    updateURL('analytics');
  };

  const handleNavigateToDecks = () => {
          // Navigating to decks
    _setTransitionDirection('forward');
    setViewMode('decks');
    updateURL('decks');
          // View mode set to decks
  };

  const handleBackToAdmin = () => {
    _setTransitionDirection('backward');
    setViewMode('admin');
    setCurrentScene(null);
    updateURL('admin');
  };

  const handleCloseScene = () => {
    _setTransitionDirection('backward');
    setCurrentScene(null);
    setViewMode('admin');
    updateURL('admin');
  };

  const handleNavigationSection = (section: string) => {
    _setTransitionDirection('forward');
    switch (section) {
      case 'admin-dashboard':
        setViewMode('admin');
        setCurrentScene(null);
        updateURL('admin');
        break;
      case 'scenes':
        setViewMode('scenes');
        updateURL('scenes');
        break;
      case 'decks':
        setViewMode('decks');
        updateURL('decks');
        break;
      case 'contexts':
        setViewMode('contexts');
        updateURL('contexts');
        break;
      case 'tenants':
        setViewMode('tenants');
        updateURL('tenants');
        break;
      case 'users':
        setViewMode('users');
        updateURL('users');
        break;
      case 'analytics':
        setViewMode('analytics');
        updateURL('analytics');
        break;
      case 'graph-studio':
        setViewMode('graph-studio');
        updateURL('graph-studio');
        break;
    }
  };

  // Context menu handlers
  // TODO: Implement scene context menu
  const _handleSceneContextMenu = (_event: React.MouseEvent, _scene: any) => {
    // TODO: Implement scene context menu
    console.log('Scene context menu not yet implemented');
  };



  // Show loading screen while checking authentication
  if (authChecking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return (
      <AdminLogin
        onLogin={handleLogin}
        loading={loginLoading}
        error={loginError || undefined}
      />
    );
  }

  // TODO: Implement scene viewer when a scene is selected
  if (viewMode === 'scenes' && currentScene) {
    return (
      <div className="min-h-screen bg-background">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">Scene Viewer</h1>
          <p className="text-muted-foreground mb-4">Scene viewing not yet implemented</p>
          <button
            onClick={handleCloseScene}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Back to Admin
          </button>
        </div>
      </div>
    );
  }

  // Render unified admin interface
  return (
    <>
      <div className="min-h-screen bg-background flex">
        <ToastContainer toasts={toasts} onRemove={removeToast} />
      
      {/* Navigation Sidebar */}
      <AnimatePresence>
        {isNavigationOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0.0, 0.2, 1] }}
            className="h-screen overflow-hidden"
          >
            <SceneNavigation
              onNavigateToSection={handleNavigationSection}
              currentView={viewMode}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Universal Admin Toolbar */}
        <AdminToolbar
          currentView={viewMode}
          viewSubtitle={getViewSubtitle(viewMode)}
          onToggleNavigation={() => setIsNavigationOpen(!isNavigationOpen)}
          onNavigateToDashboard={handleBackToAdmin}
          onNavigateToScenes={handleNavigateToScenes}
          onNavigateToDecks={handleNavigateToDecks}
          onNavigateToUsers={handleNavigateToUsers}
          onNavigateToAnalytics={handleNavigateToAnalytics}
          onNavigateToGraphStudio={() => updateURL('graph-studio')}
          adminUser={adminUser}
          onLogout={handleLogout}
        />

        {/* Main Content */}
        <main className="flex-1">
            {viewMode === 'admin' && (
              <div className="p-8">
                <div className="max-w-6xl mx-auto">
                  {/* Welcome Message */}
                  <div className="mb-12">
                    <h1 className="text-5xl font-light text-foreground mb-6">
                      Welcome to Progress Admin
                    </h1>
                    <p className="text-xl text-muted-foreground leading-relaxed">
                      Manage your scenes, decks, and system settings from this central dashboard.
                    </p>
                  </div>

                  {/* Quick Actions Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
                    <div className="p-6 border border-border rounded-lg hover:border-primary/50 transition-colors">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Layers className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="text-lg font-medium">Scene Management</h3>
                      </div>
                      <p className="text-muted-foreground mb-4">
                        Create, edit, and organize your scenes. Manage content and presentation.
                      </p>
                      <button
                        onClick={handleNavigateToScenes}
                        className="w-full px-4 py-2 border border-border rounded-md hover:bg-muted transition-colors"
                      >
                        Manage Scenes
                      </button>
                    </div>

                    <div className="p-6 border border-border rounded-lg hover:border-primary/50 transition-colors">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Users className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="text-lg font-medium">User Management</h3>
                      </div>
                      <p className="text-muted-foreground mb-4">
                        View and manage user accounts, permissions, and access controls.
                      </p>
                      <button
                        onClick={handleNavigateToUsers}
                        className="w-full px-4 py-2 border border-border rounded-md hover:bg-muted transition-colors"
                      >
                        Manage Users
                      </button>
                    </div>

                    <div className="p-6 border border-border rounded-lg hover:border-primary/50 transition-colors">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <BarChart3 className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="text-lg font-medium">Analytics</h3>
                      </div>
                      <p className="text-muted-foreground mb-4">
                        View usage statistics, scene performance, and user engagement metrics.
                      </p>
                      <button
                        onClick={handleNavigateToAnalytics}
                        className="w-full px-4 py-2 border border-border rounded-md hover:bg-muted transition-colors"
                      >
                        View Analytics
                      </button>
                    </div>

                    <div className="p-6 border border-border rounded-lg hover:border-primary/50 transition-colors">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Network className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="text-lg font-medium">Graph Studio</h3>
                      </div>
                      <p className="text-muted-foreground mb-4">
                        Design, build, and explore the entire graph structure with visual tools.
                      </p>
                      <button
                        onClick={() => updateURL('graph-studio')}
                        className="w-full px-4 py-2 border border-border rounded-md hover:bg-muted transition-colors"
                      >
                        Open Graph Studio
                      </button>
                    </div>

                    <div className="p-6 border border-border rounded-lg hover:border-primary/50 transition-colors">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Layers className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="text-lg font-medium">Scene Management</h3>
                      </div>
                      <p className="text-muted-foreground mb-4">
                        Create and manage scenes as primary content units, then organize them into presentation decks.
                      </p>
                      <button
                        onClick={handleNavigateToDecks}
                        className="w-full px-4 py-2 border border-border rounded-md hover:bg-muted transition-colors"
                      >
                        Manage Scenes
                      </button>
                    </div>

                    <div className="p-6 border border-border rounded-lg hover:border-primary/50 transition-colors">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Building2 className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="text-lg font-medium">Tenant Management</h3>
                      </div>
                      <p className="text-muted-foreground mb-4">
                        Manage multi-tenant environments with isolated content and shared feedback aggregation.
                      </p>
                      <button
                        onClick={() => setViewMode('tenants')}
                        className="w-full px-4 py-2 border border-border rounded-md hover:bg-muted transition-colors"
                      >
                        Manage Tenants
                      </button>
                    </div>

                    <div className="p-6 border border-border rounded-lg hover:border-primary/50 transition-colors">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Settings className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="text-lg font-medium">System Settings</h3>
                      </div>
                      <p className="text-muted-foreground mb-4">
                        Configure system-wide settings, themes, and application preferences.
                      </p>
                      <button
                        className="w-full px-4 py-2 border border-border rounded-md text-muted-foreground cursor-not-allowed"
                        disabled
                      >
                        Coming Soon
                      </button>
                    </div>

                    <div className="p-6 border border-border rounded-lg hover:border-primary/50 transition-colors">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <span className="text-2xl">📊</span>
                        </div>
                        <h3 className="text-lg font-medium">Data Dashboard</h3>
                      </div>
                      <p className="text-muted-foreground mb-4">
                        Create and manage data visualizations and dashboard components.
                      </p>
                      <button
                        className="w-full px-4 py-2 border border-border rounded-md text-muted-foreground cursor-not-allowed"
                        disabled
                      >
                        Coming Soon
                      </button>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="mt-12 p-6 border border-border rounded-lg bg-muted/30">
                    <h3 className="text-lg font-medium mb-4">Quick Stats</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{scenes.filter(s => s.is_active).length}</div>
                        <div className="text-sm text-muted-foreground">Active Scenes</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">0</div>
                        <div className="text-sm text-muted-foreground">Total Users</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{scenes.filter(s => s.is_active).length}</div>
                        <div className="text-sm text-muted-foreground">Published</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{scenes.length}</div>
                        <div className="text-sm text-muted-foreground">Total Scenes</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {viewMode === 'scenes' && (
              <div className="p-8">
                <div className="max-w-6xl mx-auto">
                  <div className="mb-8">
                    <p className="text-muted-foreground">
                      View and manage your scenes
                    </p>
                  </div>
                  <SceneManager />
                </div>
              </div>
            )}

            {viewMode === 'tenants' && (
              <div className="p-8">
                <div className="max-w-6xl mx-auto">
                  <TenantManager />
                </div>
              </div>
            )}

            {viewMode === 'users' && (
              <div className="p-8">
                <div className="max-w-6xl mx-auto">
                  <div className="mb-8">
                    <p className="text-muted-foreground">
                      View and manage user accounts
                    </p>
                  </div>
                  <UsersList
                            onUserSelect={(_user) => {/* TODO: Implement user selection */}}
        onUserEdit={(_user) => {/* TODO: Implement user editing */}}
        onUserDelete={(_userId) => {/* TODO: Implement user deletion */}}
                  />
                </div>
              </div>
            )}

            {viewMode === 'analytics' && (
              <div className="p-8">
                <div className="max-w-6xl mx-auto">
                  <div className="mb-8">
                    <p className="text-muted-foreground">
                      View usage statistics and performance metrics
                    </p>
                  </div>
                  <div className="text-center py-12">
                    <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Analytics Dashboard</h3>
                    <p className="text-muted-foreground">Analytics features coming soon...</p>
                  </div>
                </div>
              </div>
            )}

            {viewMode === 'decks' && (
              <div className="h-full">
                {/* Rendering SceneManager */}
                <SceneManager />
              </div>
            )}

            {viewMode === 'graph-studio' && (
              <div className="h-full">
                <GraphStudio
                  onNodeSelect={(_node) => {/* TODO: Implement node selection */}}
                  onNodeCreate={() => {/* TODO: Implement node creation */}}
                  onNodeEdit={(_node) => {/* TODO: Implement node editing */}}
                  onNodeDelete={(_node) => {/* TODO: Implement node deletion */}}
                />
              </div>
            )}
        </main>
      </div>

      {/* Context Menu */}
      <ContextMenu
        items={contextMenu.items}
        isOpen={contextMenu.isOpen}
        onClose={hideContextMenu}
        position={contextMenu.position}
      />
    </div>
  </>
  );
}

export default App;
