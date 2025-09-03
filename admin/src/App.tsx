import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Layers, Users, BarChart3, Network, Settings } from 'lucide-react';
import { apiClient, Stage } from '@progress/shared';
import {
  UsersList,
  AdminLogin,
  FullScreenStageViewer,
  StageMetadataDialog,
  StageTransition,
  StageContentWrapper,
  StageNavigation,
  ContextMenu,
  useContextMenu,
  getStageContextMenuItems,
  CreateStageDialog,
  StageTypeManager,
  GraphStudio,
  AdminToolbar,
  ToastContainer,
  useToasts,
  DeckManager
} from './components';
import { AnimatePresence, motion } from 'framer-motion';
import { initializeTheme } from '@progress/shared';

interface AdminUser {
  id: number;
  name: string;
  email: string;
  is_admin: boolean;
}

type ViewMode = 'admin' | 'stage' | 'stages-list' | 'users' | 'analytics' | 'graph-studio' | 'decks';

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
  
  // Stage management
  const [currentStage, setCurrentStage] = useState<Stage | null>(null);
  const [stages, setStages] = useState<Stage[]>([]);
  const [stagesLoading, setStagesLoading] = useState(false);
  const [isMetadataDialogOpen, setIsMetadataDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isStageTypeManagerOpen, setIsStageTypeManagerOpen] = useState(false);
  const [_isSaving, setIsSaving] = useState(false);
  
  // Navigation state
  const [isNavigationOpen, setIsNavigationOpen] = useState(true);
  const [transitionDirection, setTransitionDirection] = useState<'forward' | 'backward' | 'up' | 'down'>('forward');
  const [isProgrammaticNavigation, setIsProgrammaticNavigation] = useState(false);

  
  // Context menu
  const { contextMenu, showContextMenu, hideContextMenu } = useContextMenu();
  
  const { toasts, removeToast, showSuccess, showError } = useToasts();

  // Helper function to get view subtitle
  const getViewSubtitle = (view: ViewMode): string => {
    switch (view) {
      case 'admin':
        return 'System administration and management';
      case 'stages-list':
        return 'Stage Management';
      case 'decks':
        return 'Deck Management';
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
    const stageSlugMatch = path.match(/\/stage\/([^\/]+)/);
    
    if (stageSlugMatch) {
      const stageSlug = stageSlugMatch[1];
      const stage = stages.find(s => s.slug === stageSlug);
      if (stage && stage.id !== currentStage?.id) {
        setCurrentStage(stage);
        setViewMode('stage');
      }
    } else if (path === '/users') {
      setViewMode('users');
    } else if (path === '/analytics') {
      setViewMode('analytics');
    } else if (path === '/stages') {
      setViewMode('stages-list');
    } else if (path === '/decks') {
      setViewMode('decks');
    } else if (path === '/graph-studio') {
      setViewMode('graph-studio');
    } else if (path === '/') {
      setViewMode('admin');
      setCurrentStage(null);
    }
  }, [location.pathname, stages, currentStage?.id, isProgrammaticNavigation]);

  // Update URL when state changes
  const updateURL = (mode: ViewMode, stage?: Stage) => {
    setIsProgrammaticNavigation(true);
    switch (mode) {
                      case 'stage':
                  if (stage?.slug) {
                    navigate(`/stage/${stage.slug}`);
                  }
                  break;
      case 'users':
        navigate('/users');
        break;
      case 'analytics':
        navigate('/analytics');
        break;
      case 'stages-list':
        navigate('/stages');
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
      loadStages();
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
      console.log('Not authenticated');
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

  const loadStages = async () => {
    setStagesLoading(true);
    try {
      const response = await apiClient.getStages();
      if (response.success) {
        setStages(response.data || []);
      }
    } catch (error) {
      console.error('Failed to load stages:', error);
      showError('Failed to load stages', 'Please try again later');
    } finally {
      setStagesLoading(false);
    }
  };

  // Load stages when component mounts
  useEffect(() => {
    if (isAuthenticated) {
      loadStages();
    }
  }, [isAuthenticated]);

  const handleStageSave = async (stage: Stage) => {
    setIsSaving(true);
    try {
      const response = await apiClient.updateStage(stage.id!, {
        name: stage.name,
        slug: stage.slug,
        description: stage.description,
        config: stage.config || {},
        is_active: stage.is_active
      });
      
      if (response.success) {
        showSuccess('Stage Saved', `Successfully saved "${stage.name}"`);
        await loadStages(); // Refresh the stages list
      } else {
        showError('Save Failed', 'Failed to save stage changes');
      }
    } catch (error) {
      console.error('Failed to save stage:', error);
      showError('Save Failed', 'Failed to save stage changes');
    } finally {
      setIsSaving(false);
    }
  };

  const handleStagePublish = async (stage: Stage) => {
    try {
      const response = await apiClient.updateStage(stage.id!, {
        is_active: true
      });
      
      if (response.success) {
        showSuccess('Stage Published', `"${stage.name}" is now published`);
        await loadStages();
        setCurrentStage({ ...stage, is_active: true });
      } else {
        showError('Publish Failed', 'Failed to publish stage');
      }
    } catch (error) {
      console.error('Failed to publish stage:', error);
      showError('Publish Failed', 'Failed to publish stage');
    }
  };

  const handleStageUnpublish = async (stage: Stage) => {
    try {
      const response = await apiClient.updateStage(stage.id!, {
        is_active: false
      });
      
      if (response.success) {
        showSuccess('Stage Unpublished', `"${stage.name}" is now unpublished`);
        await loadStages();
        setCurrentStage({ ...stage, is_active: false });
      } else {
        showError('Unpublish Failed', 'Failed to unpublish stage');
      }
    } catch (error) {
      console.error('Failed to unpublish stage:', error);
      showError('Unpublish Failed', 'Failed to unpublish stage');
    }
  };

  const handleStageSelect = (stage: Stage) => {
    setTransitionDirection('forward');
    setCurrentStage(stage);
    setViewMode('stage');
    updateURL('stage', stage);
    setIsNavigationOpen(false); // Close navigation on mobile when selecting a stage
  };

  const handleStageEdit = () => {
    setIsMetadataDialogOpen(true);
  };

  const handleStageTypeManager = () => {
    setIsStageTypeManagerOpen(true);
  };

  const handleStageDelete = async (stage: Stage) => {
    if (confirm(`Are you sure you want to delete "${stage.name}"?`)) {
      try {
        const response = await apiClient.deleteStage(stage.id!);
        if (response.success) {
          showSuccess('Stage Deleted', `"${stage.name}" has been deleted`);
          await loadStages();
          if (currentStage?.id === stage.id) {
            setCurrentStage(null);
            setViewMode('admin');
          }
        } else {
          showError('Delete Failed', 'Failed to delete stage');
        }
      } catch (error) {
        console.error('Failed to delete stage:', error);
        showError('Delete Failed', 'Failed to delete stage');
      }
    }
  };

  const handleStageCopy = (_stage: Stage) => {
    // TODO: Implement stage copying
    showSuccess('Coming Soon', 'Stage copying will be implemented in the next phase');
  };

  const handleStageShare = (_stage: Stage) => {
    // TODO: Implement stage sharing
    showSuccess('Coming Soon', 'Stage sharing will be implemented in the next phase');
  };

  const handleCreateStage = () => {
    setIsCreateDialogOpen(true);
  };

  const handleStageCreate = async (stageData: Partial<Stage>) => {
    try {
      const requestData = {
        name: stageData.name!,
        description: stageData.description,
        type: stageData.type!,
        config: stageData.config!,
        is_active: stageData.is_active || false,
        sort_order: stageData.sort_order || 0
      };
      
      console.log('Creating stage with data:', requestData);
      
      const response = await apiClient.createStage(requestData);
      
      if (response.success) {
        showSuccess('Stage Created', `Successfully created "${stageData.name}"`);
        await loadStages(); // Refresh the stages list
      } else {
        showError('Create Failed', 'Failed to create stage');
      }
    } catch (error) {
      console.error('Failed to create stage:', error);
      showError('Create Failed', 'Failed to create stage');
    }
  };

  const handleNavigateToStages = () => {
    setTransitionDirection('forward');
    setViewMode('stages-list');
    updateURL('stages-list');
  };

  const handleNavigateToUsers = () => {
    setViewMode('users');
    updateURL('users');
  };

  const handleNavigateToAnalytics = () => {
    setTransitionDirection('forward');
    setViewMode('analytics');
    updateURL('analytics');
  };

  const handleNavigateToDecks = () => {
    setTransitionDirection('forward');
    setViewMode('decks');
    updateURL('decks');
  };

  const handleBackToAdmin = () => {
    setTransitionDirection('backward');
    setViewMode('admin');
    setCurrentStage(null);
    updateURL('admin');
  };

  const handleCloseStage = () => {
    setTransitionDirection('backward');
    setCurrentStage(null);
    setViewMode('admin');
    updateURL('admin');
  };

  const handleNavigationSection = (section: string) => {
    setTransitionDirection('forward');
    switch (section) {
      case 'admin':
        setViewMode('admin');
        setCurrentStage(null);
        updateURL('admin');
        break;
      case 'users':
        setViewMode('users');
        updateURL('users');
        break;
      case 'analytics':
        setViewMode('analytics');
        updateURL('analytics');
        break;
      case 'decks':
        setViewMode('decks');
        updateURL('decks');
        break;
    }
  };

  // Context menu handlers
  const handleStageContextMenu = (event: React.MouseEvent, stage: Stage) => {
    const items = getStageContextMenuItems(
      stage,
      () => handleStageEdit(),
      () => handleStageDelete(stage),
      () => handleStagePublish(stage),
      () => handleStageUnpublish(stage),
      () => handleStageCopy(stage),
      () => handleStageShare(stage),
      () => handleStageTypeManager()
    );
    showContextMenu(event, items);
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

  // Render stage viewer when a stage is selected
  if (viewMode === 'stage' && currentStage) {
    return (
      <>
        <StageTransition
          stage={currentStage}
          direction={transitionDirection}
          isVisible={true}
        >
          <FullScreenStageViewer
            stage={currentStage}
            isAdmin={true}
            onClose={handleCloseStage}
            onEdit={handleStageEdit}
            onSettings={handleStageEdit}
            onSave={handleStageSave}
            onPublish={handleStagePublish}
            onUnpublish={handleStageUnpublish}
            stages={stages}
            showError={showError}
          />
        </StageTransition>
        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </>
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
            <StageNavigation
              stages={stages}
              loading={stagesLoading}
              onStageSelect={handleStageSelect}
              onNavigateToSection={handleNavigationSection}
              currentStage={currentStage}
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
          onNavigateToStages={handleNavigateToStages}
          onNavigateToDecks={handleNavigateToDecks}
          onNavigateToUsers={handleNavigateToUsers}
          onNavigateToAnalytics={handleNavigateToAnalytics}
          onNavigateToGraphStudio={() => updateURL('graph-studio')}
          adminUser={adminUser}
          onLogout={handleLogout}
        />

        {/* Main Content */}
        <StageContentWrapper>
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
                      Manage your stages, users, and system settings from this central dashboard.
                    </p>
                  </div>

                  {/* Quick Actions Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
                    <div className="p-6 border border-border rounded-lg hover:border-primary/50 transition-colors">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Layers className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="text-lg font-medium">Stage Management</h3>
                      </div>
                      <p className="text-muted-foreground mb-4">
                        Create, edit, and organize your stages. Manage content and publishing status.
                      </p>
                      <button
                        onClick={handleNavigateToStages}
                        className="w-full px-4 py-2 border border-border rounded-md hover:bg-muted transition-colors"
                      >
                        Manage Stages
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
                        View usage statistics, stage performance, and user engagement metrics.
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
                        <h3 className="text-lg font-medium">Deck Management</h3>
                      </div>
                      <p className="text-muted-foreground mb-4">
                        Create and manage presentation decks with different scene types and performance optimizations.
                      </p>
                      <button
                        onClick={handleNavigateToDecks}
                        className="w-full px-4 py-2 border border-border rounded-md hover:bg-muted transition-colors"
                      >
                        Manage Decks
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
                        <div className="text-2xl font-bold text-primary">{stages.filter(s => s.is_active).length}</div>
                        <div className="text-sm text-muted-foreground">Active Stages</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">0</div>
                        <div className="text-sm text-muted-foreground">Total Users</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{stages.filter(s => s.is_active).length}</div>
                        <div className="text-sm text-muted-foreground">Published</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{stages.length}</div>
                        <div className="text-sm text-muted-foreground">Total Stages</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {viewMode === 'stages-list' && (
              <div className="p-8">
                <div className="max-w-6xl mx-auto">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <p className="text-muted-foreground">
                        Create, edit, and organize your stages
                      </p>
                    </div>
                    <button
                      onClick={handleCreateStage}
                      className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
                    >
                      <Layers className="h-4 w-4" />
                      <span>New Stage</span>
                    </button>
                  </div>
                  
                  {/* Stages Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {stages.map((stage) => (
                      <div
                        key={stage.id}
                        className="p-6 border border-border rounded-lg hover:border-primary/50 transition-colors cursor-pointer group"
                        onClick={() => handleStageSelect(stage)}
                        onContextMenu={(e) => handleStageContextMenu(e, stage)}
                      >
                        <div className="flex items-center space-x-3 mb-4">
                          <span className="text-2xl">{stage.config?.icon || '📄'}</span>
                          <div className="flex-1">
                            <h3 className="font-medium">{stage.name}</h3>
                            <p className="text-sm text-muted-foreground">{stage.type}</p>
                          </div>
                          <div className={`w-2 h-2 rounded-full ${
                            stage.is_active ? 'bg-green-500' : 'bg-yellow-500'
                          }`} />
                        </div>
                        {stage.description && (
                          <p className="text-sm text-muted-foreground mb-4">
                            {stage.description}
                          </p>
                        )}
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{stage.is_active ? 'Published' : 'Draft'}</span>
                          <span>{stage.slug}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {stages.length === 0 && (
                    <div className="text-center py-12">
                      <Layers className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Stages Yet</h3>
                      <p className="text-muted-foreground mb-4">
                        Create your first stage to get started
                      </p>
                      <button
                        onClick={handleCreateStage}
                        className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 mx-auto"
                      >
                        <Layers className="h-4 w-4" />
                        <span>Create First Stage</span>
                      </button>
                    </div>
                  )}
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
                    onUserSelect={(user) => console.log('User selected:', user)}
                    onUserEdit={(user) => console.log('Edit user:', user)}
                    onUserDelete={(userId) => console.log('Delete user:', userId)}
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
                <DeckManager />
              </div>
            )}

            {viewMode === 'graph-studio' && (
              <div className="h-full">
                <GraphStudio
                  onNodeSelect={(node) => {
                    console.log('Node selected:', node);
                  }}
                  onNodeCreate={() => {
                    console.log('Create node');
                  }}
                  onNodeEdit={(node) => {
                    console.log('Edit node:', node);
                  }}
                  onNodeDelete={(node) => {
                    console.log('Delete node:', node);
                  }}
                />
              </div>
            )}
        </main>
        </StageContentWrapper>
      </div>

      {/* Context Menu */}
      <ContextMenu
        items={contextMenu.items}
        isOpen={contextMenu.isOpen}
        onClose={hideContextMenu}
        position={contextMenu.position}
      />
    </div>

    {/* Global Modals - Rendered at top level to avoid stacking context issues */}
    <StageMetadataDialog
      stage={currentStage}
      isOpen={isMetadataDialogOpen}
      onClose={() => setIsMetadataDialogOpen(false)}
      onSave={handleStageSave}
      onPublish={handleStagePublish}
      onUnpublish={handleStageUnpublish}
    />

    <CreateStageDialog
      isOpen={isCreateDialogOpen}
      onClose={() => setIsCreateDialogOpen(false)}
      onCreate={handleStageCreate}
    />

    {currentStage && isStageTypeManagerOpen && (
      <StageTypeManager
        stage={currentStage}
        onUpdate={handleStageSave}
        onClose={() => setIsStageTypeManagerOpen(false)}
      />
    )}
  </>
  );
}

export default App;
