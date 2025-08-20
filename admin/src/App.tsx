import { useState, useEffect } from 'react';
import { Layers, Users, BarChart3, Home, PanelLeft } from 'lucide-react';
import { apiClient, Stage } from '@progress/shared';
import { UsersList } from './components/UsersList';
import { AdminLogin } from './components/AdminLogin';
import { FullScreenStageViewer } from './components/FullScreenStageViewer';
import { StageMetadataDialog } from './components/StageMetadataDialog';
import { AdminStage } from './components/AdminStage';

import { StageTransition, StageContentWrapper, ToolbarWrapper } from './components/StageTransition';
import { StageNavigation } from './components/StageNavigation';
import { ContextMenu, useContextMenu, getStageContextMenuItems } from './components/ContextMenu';
import { CreateStageDialog } from './components/CreateStageDialog';
import { AdminUserMenu } from './components/AdminUserMenu';
import { ToastContainer, useToasts } from './components/Toast';
import { AnimatePresence, motion } from 'framer-motion';
import { initializeTheme } from '@progress/shared';

interface AdminUser {
  id: number;
  name: string;
  email: string;
  is_admin: boolean;
}

type ViewMode = 'admin' | 'stage' | 'stages-list' | 'users' | 'analytics';

function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('admin');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  
  // Stage management
  const [currentStage, setCurrentStage] = useState<Stage | null>(null);
  const [stages, setStages] = useState<Stage[]>([]);
    const [isMetadataDialogOpen, setIsMetadataDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [_isSaving, setIsSaving] = useState(false);
  
  // Navigation state
  const [isNavigationOpen, setIsNavigationOpen] = useState(true);
  const [transitionDirection, setTransitionDirection] = useState<'forward' | 'backward' | 'up' | 'down'>('forward');

  
  // Context menu
  const { contextMenu, showContextMenu, hideContextMenu } = useContextMenu();
  
  const { toasts, removeToast, showSuccess, showError } = useToasts();

  useEffect(() => {
    // Initialize theme system
    initializeTheme();
    
    // Check if we have a stored token
    const token = localStorage.getItem('admin_token');
    if (token) {
      setAuthToken(token);
      checkAuthStatus(token);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadStages();
    }
  }, [isAuthenticated]);

  const checkAuthStatus = async (token?: string) => {
    try {
      const tokenToUse = token || authToken;
      const response = await fetch('http://localhost:8080/api/auth/admin/check', {
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
    }
  };

  const clearAuth = () => {
      localStorage.removeItem('admin_token');
      setAuthToken(null);
      setIsAuthenticated(false);
      setAdminUser(null);
      apiClient.clearAuthToken();
  };

  const handleLogin = async (email: string, password: string) => {
    setLoginLoading(true);
    setLoginError(null);

    try {
      const response = await fetch('http://localhost:8080/api/auth/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
        await fetch('http://localhost:8080/api/auth/admin/logout', {
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
    try {
      const response = await apiClient.getStages();
      if (response.success) {
        setStages(response.data || []);
      }
    } catch (error) {
      console.error('Failed to load stages:', error);
      showError('Failed to load stages', 'Please try again later');
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
        config: stage.config,
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
    setIsNavigationOpen(false); // Close navigation on mobile when selecting a stage
  };

  const handleStageEdit = () => {
    setIsMetadataDialogOpen(true);
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
      const response = await apiClient.createStage({
        name: stageData.name!,
        description: stageData.description,
        type: stageData.type!,
        config: stageData.config!,
        is_active: stageData.is_active || false,
        sort_order: stageData.sort_order || 0
      });
      
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
  };

  const handleNavigateToUsers = () => {
    setViewMode('users');
  };

  const handleNavigateToAnalytics = () => {
    setTransitionDirection('forward');
    setViewMode('analytics');
  };

  const handleBackToAdmin = () => {
    setTransitionDirection('backward');
    setViewMode('admin');
    setCurrentStage(null);
  };

  const handleCloseStage = () => {
    setTransitionDirection('backward');
    setCurrentStage(null);
    setViewMode('admin');
  };

  const handleNavigationSection = (section: string) => {
    setTransitionDirection('forward');
    switch (section) {
      case 'admin':
        setViewMode('admin');
        setCurrentStage(null);
        break;
      case 'users':
        setViewMode('users');
        break;
      case 'analytics':
        setViewMode('analytics');
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
      () => handleStageShare(stage)
    );
    showContextMenu(event, items);
  };



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
          onSave={handleStageSave}
          onPublish={handleStagePublish}
          onUnpublish={handleStageUnpublish}
        />
      </StageTransition>
    );
  }

  // Render admin stage as default view
  if (viewMode === 'admin') {
    return (
      <>
        <AdminStage
          onNavigateToStages={handleNavigateToStages}
          onNavigateToUsers={handleNavigateToUsers}
          onNavigateToAnalytics={handleNavigateToAnalytics}
          onCreateStage={handleCreateStage}
        />
        
        {/* Stage Metadata Dialog */}
        <StageMetadataDialog
          stage={currentStage}
          isOpen={isMetadataDialogOpen}
          onClose={() => setIsMetadataDialogOpen(false)}
          onSave={handleStageSave}
          onPublish={handleStagePublish}
          onUnpublish={handleStageUnpublish}
        />

        {/* Create Stage Dialog */}
        <CreateStageDialog
          isOpen={isCreateDialogOpen}
          onClose={() => setIsCreateDialogOpen(false)}
          onCreate={handleStageCreate}
        />
        
        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </>
    );
  }

  // Render other views with enhanced navigation
  return (
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
              onStageSelect={handleStageSelect}
              onNavigateToSection={handleNavigationSection}
              currentStage={currentStage}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Toolbar */}
        <ToolbarWrapper>
          <div className="flex items-center justify-between p-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-center space-x-4">
              {/* Navigation Toggle */}
              <button
                onClick={() => setIsNavigationOpen(!isNavigationOpen)}
                className="p-2 hover:bg-muted rounded-lg"
              >
                <PanelLeft className="h-5 w-5" />
              </button>
              
              {/* Logo/Brand */}
              <div className="flex items-center space-x-2">
                <span className="text-2xl">⚙️</span>
                <div>
                  <h1 className="text-lg font-semibold">Progress Admin</h1>
                  <p className="text-sm text-muted-foreground">Stage Management</p>
            </div>
          </div>
        </div>

            {/* Navigation Menu */}
            <div className="hidden lg:flex items-center space-x-2">
                <button
                onClick={handleBackToAdmin}
                                 className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                   viewMode === 'stages-list'
                      ? 'text-primary bg-primary/10'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <Home className="h-4 w-4" />
                  <span>Dashboard</span>
                </button>
              
                <button
                onClick={handleNavigateToStages}
                className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  viewMode === 'stages-list'
                      ? 'text-primary bg-primary/10'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <Layers className="h-4 w-4" />
                  <span>Stages</span>
                </button>
              
                <button
                onClick={handleNavigateToUsers}
                className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  viewMode === 'users'
                      ? 'text-primary bg-primary/10'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <Users className="h-4 w-4" />
                  <span>Users</span>
                </button>
              
              <button
                onClick={handleNavigateToAnalytics}
                className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  viewMode === 'analytics'
                    ? 'text-primary bg-primary/10'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <BarChart3 className="h-4 w-4" />
                <span>Analytics</span>
              </button>
            </div>

            {/* User Profile */}
            <AdminUserMenu 
              user={adminUser} 
              onLogout={handleLogout} 
            />
          </div>
        </ToolbarWrapper>

        {/* Main Content */}
        <StageContentWrapper>
          <main className="flex-1">
            {viewMode === 'stages-list' && (
              <div className="p-8">
                <div className="max-w-6xl mx-auto">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h1 className="text-3xl font-bold mb-2">Stage Management</h1>
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
                          <span className="text-2xl">{stage.config.icon || '📄'}</span>
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
                    <h1 className="text-3xl font-bold mb-2">User Management</h1>
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
                    <h1 className="text-3xl font-bold mb-2">Analytics</h1>
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

      {/* Stage Metadata Dialog */}
      <StageMetadataDialog
        stage={currentStage}
        isOpen={isMetadataDialogOpen}
        onClose={() => setIsMetadataDialogOpen(false)}
        onSave={handleStageSave}
        onPublish={handleStagePublish}
        onUnpublish={handleStageUnpublish}
      />
    </div>
  );
}

export default App;
