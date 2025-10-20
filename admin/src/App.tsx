import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Layers, Users, BarChart3, Network, Settings, Building2 } from 'lucide-react';
import { apiClient } from '@protogen/shared';
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
  DeckManager,
  TenantManager,
  SceneNavigation,
} from './components';
import {
  SceneTypeManager,
  GraphSceneAuthoring,
  DocumentSceneAuthoring,
} from '@protogen/shared/systems/authoring';
import { SceneWorkflow } from './components/workflows';
import DeckWorkflow from './components/workflows/deck/DeckWorkflow';
import { useDeckStore } from './stores/deckStore';
import { AnimatePresence, motion } from 'framer-motion';
import { initializeTheme } from '@protogen/shared';

interface AdminUser {
  id: number;
  name: string;
  email: string;
  is_admin: boolean;
}

type ViewMode = 'admin' | 'scenes' | 'decks' | 'contexts' | 'flows' | 'users' | 'analytics' | 'graph-studio' | 'subgraph-studio' | 'tenants' | 'create-scene' | 'edit-scene' | 'scene-workflow' | 'scene-edit' | 'scene-design' | 'deck-workflow' | 'deck-edit';

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
  
  // Deck store for scene management
  const { createScene, updateScene, saveSceneContent, loadSceneContent, scenes: storeScenes, loadDecks, createDeck, updateDeck, decks } = useDeckStore();
  
  // Content management
  const [currentScene, setCurrentScene] = useState<any>(null);
  const [currentDeck, setCurrentDeck] = useState<any>(null);
  const [scenes, setScenes] = useState<any[]>([]);
  const [_scenesLoading, _setScenesLoading] = useState(false);
  
  // Scene authoring state
  const [selectedSceneType, setSelectedSceneType] = useState<any>(null);
  const [editingScene, setEditingScene] = useState<any>(null);
  const [_availableNodes, _setAvailableNodes] = useState<any[]>([]);
  
  // Navigation state
  const [isNavigationOpen, setIsNavigationOpen] = useState(true);
  const [_transitionDirection, _setTransitionDirection] = useState<'forward' | 'backward' | 'up' | 'down'>('forward');
  const [isProgrammaticNavigation, setIsProgrammaticNavigation] = useState(false);

  
  // Context menu
  const { contextMenu, showContextMenu: _showContextMenu, hideContextMenu } = useContextMenu();
  
  const { toasts, removeToast, showSuccess, showError } = useToasts();

  // Scene workflow handlers
  const handleSceneWorkflowComplete = async (data: any) => {
    try {
      console.log('=== APP.TSX WORKFLOW COMPLETION ===');
      console.log('App.tsx received data:', data);
      const { basicDetails, design } = data;
      console.log('App.tsx basicDetails:', basicDetails);
      console.log('App.tsx design:', design);
      
      const newScene = {
        name: basicDetails.name,
        slug: basicDetails.slug,
        description: basicDetails.description,
        type: basicDetails.type, // deckStore expects 'type', it will map to 'scene_type' for API
        deckIds: basicDetails.deckIds,
        content: {
          data: design.designData || {},
          metadata: {},
        },
        // Map design data to Scene model fields
        config: design.designData?.config || {},
        meta: design.designData?.metadata || {},
        style: design.designData?.style || {},
        toolset: {
          libraries: [],
          preload: false,
          keepWarm: false,
        },
        isActive: true,
        isPublic: false,
      };

      console.log('=== SCENE CREATION DEBUG ===');
      console.log('newScene data being sent to deckStore:', newScene);
      console.log('newScene.name:', newScene.name);
      console.log('newScene.slug:', newScene.slug);
      console.log('newScene.type:', newScene.type);

      const createdScene = await createScene(newScene) as any;
      
      console.log('=== CREATED SCENE DEBUG ===');
      console.log('createdScene:', createdScene);
      console.log('createdScene.id:', createdScene.id);
      console.log('createdScene.guid:', createdScene.guid);
      
      // Save content separately for document scenes
      console.log('Design data:', design);
      console.log('Basic details type:', basicDetails.type);
      console.log('Design type:', design.type);
      console.log('Design designData:', design.designData);
      if (basicDetails.type === 'document' && design.designData?.content?.html) {
        console.log('=== SAVING SCENE CONTENT ===');
        console.log('Using scene ID:', createdScene.id);
        console.log('Content HTML length:', design.designData.content.html.length);
        await saveSceneContent(createdScene.id, design.designData.content.html, 'document', 'main');
      }
      
      showSuccess('Scene created successfully!');
      setCurrentScene(null);
      setViewMode('scenes');
      updateURL('scenes');
    } catch (error) {
      showError('Failed to create scene: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleSceneEditComplete = async (data: any) => {
    try {
      const { basicDetails } = data;
      
      if (!currentScene?.id) {
        showError('No scene selected for editing');
        return;
      }

      await updateScene(currentScene.id, {
        name: basicDetails.name,
        slug: basicDetails.slug,
        description: basicDetails.description,
        type: basicDetails.type,
        deckIds: basicDetails.deckIds,
      });

      showSuccess('Scene updated successfully!');
      setCurrentScene(null);
      setViewMode('scenes');
      updateURL('scenes');
    } catch (error) {
      showError('Failed to update scene: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleSceneDesignComplete = async (data: any) => {
    try {
      const { design } = data;
      
      if (!currentScene?.id) {
        showError('No scene selected for editing');
        return;
      }

      // Update the main scene record with metadata, config, and style
      const sceneUpdateData: any = {};
      
      if (design.designData?.metadata) {
        sceneUpdateData.meta = design.designData.metadata;
      }
      
      if (design.designData?.config) {
        sceneUpdateData.config = design.designData.config;
      }
      
      if (design.designData?.style) {
        sceneUpdateData.style = design.designData.style;
      }

      // Update the scene with metadata, config, and style
      if (Object.keys(sceneUpdateData).length > 0) {
        await updateScene(currentScene.id, sceneUpdateData);
      }

      // Handle content separately based on scene type
      if (currentScene.type === 'document' && design.designData?.content?.html) {
        // For document scenes, save HTML content to scene_content table
        await saveSceneContent(currentScene.id, design.designData.content.html, 'document', 'main');
      } else if (design.designData) {
        // For other scene types, save to the main content field
        await updateScene(currentScene.id, {
          content: {
            data: design.designData || {},
            metadata: {},
          },
        });
      }

      showSuccess('Scene design updated successfully!');
      setCurrentScene(null);
      setViewMode('scenes');
      updateURL('scenes');
    } catch (error) {
      showError('Failed to update scene design: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleDeckWorkflowComplete = async (data: any) => {
    try {
      const { basicDetails } = data;
      
      if (viewMode === 'deck-edit' && currentDeck?.guid) {
        // Update existing deck
        await updateDeck(currentDeck.guid, {
          name: basicDetails.name,
          slug: basicDetails.slug,
          description: basicDetails.description,
          keep_warm: basicDetails.keepWarm,
          preload_strategy: basicDetails.preloadStrategy,
        });
        showSuccess('Deck updated successfully!');
      } else {
        // Create new deck
        await createDeck({
          name: basicDetails.name,
          slug: basicDetails.slug,
          description: basicDetails.description,
          type: 'graph', // Default type, will be auto-determined when scenes are added
          keep_warm: basicDetails.keepWarm,
          preload_strategy: basicDetails.preloadStrategy,
          scene_ids: [],
          tags: [],
          is_active: true,
          is_public: false,
        });
        showSuccess('Deck created successfully!');
      }
      
      setCurrentDeck(null);
      setViewMode('decks');
      updateURL('decks');
    } catch (error) {
      showError('Failed to save deck: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

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
      case 'flows':
        return 'Flow Management';
      case 'tenants':
        return 'Tenant Management';
      case 'users':
        return 'User Management';
      case 'analytics':
        return 'Analytics Dashboard';
      case 'graph-studio':
        return 'Graph Studio';
      case 'subgraph-studio':
        return 'Subgraph Studio';
      case 'create-scene':
        return 'Create New Scene';
      case 'edit-scene':
        return 'Edit Scene';
      case 'scene-workflow':
        return 'Create New Scene';
      case 'scene-edit':
        return 'Edit Scene Details';
      case 'scene-design':
        return 'Edit Scene Design';
      case 'deck-workflow':
        return 'Create New Deck';
      case 'deck-edit':
        return 'Edit Deck';
      default:
        return '';
    }
  };

  useEffect(() => {
    // Configure API base URL
    apiClient.setBaseUrl('http://api.protogen.local:3333/api');
    
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
    const path = location.pathname;
    
    // Skip route handling for programmatic navigation to prevent flashing
    if (isProgrammaticNavigation) {
      return;
    }
    
    if (path === '/users') {
      setViewMode('users');
    } else if (path === '/analytics') {
      setViewMode('analytics');
    } else if (path === '/decks') {
      setViewMode('decks');
    } else if (path === '/decks/new') {
      setViewMode('deck-workflow');
    } else if (path.startsWith('/decks/edit/')) {
      const deckId = path.split('/')[3]; // /decks/edit/{guid} - guid is at index 3
      const deck = decks.find(d => d.guid === deckId);
      setCurrentDeck(deck || null);
      setViewMode('deck-edit');
    } else if (path === '/scenes') {
      setViewMode('scenes');
      setCurrentScene(null); // Clear current scene when going to scenes list
    } else if (path === '/scenes/new') {
      setViewMode('scene-workflow');
    } else if (path.startsWith('/scenes/') && path.endsWith('/edit')) {
      const sceneId = path.split('/')[2];
      const scene = storeScenes.find(s => s.id === sceneId);
      setCurrentScene(scene || null);
      setViewMode('scene-edit');
    } else if (path.startsWith('/scenes/') && path.endsWith('/design')) {
      const sceneId = path.split('/')[2];
      const scene = storeScenes.find(s => s.id === sceneId);
      setCurrentScene(scene || null);
      setViewMode('scene-design');
    } else if (path === '/contexts') {
      setViewMode('contexts');
    } else if (path === '/flows') {
      setViewMode('flows');
    } else if (path === '/tenants') {
      setViewMode('tenants');
    } else if (path === '/graph-studio') {
      setViewMode('graph-studio');
    } else if (path === '/subgraph-studio') {
      setViewMode('subgraph-studio');
    } else if (path === '/') {
      setViewMode('admin');
      setCurrentScene(null);
    }
  }, [location.pathname, isProgrammaticNavigation]);

  // Reset programmatic navigation flag after route handling
  useEffect(() => {
    if (isProgrammaticNavigation) {
      const timer = setTimeout(() => {
        setIsProgrammaticNavigation(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isProgrammaticNavigation]);

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
      case 'flows':
        navigate('/flows');
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
      case 'subgraph-studio':
        navigate('/subgraph-studio');
        break;
      case 'scene-workflow':
        navigate('/scenes/new');
        break;
      case 'scene-edit':
        // This will be handled by the component based on current scene
        break;
      case 'scene-design':
        // This will be handled by the component based on current scene
        break;
      case 'deck-workflow':
        navigate('/decks/new');
        break;
      case 'deck-edit':
        // This will be handled by the component based on current deck
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
      loadDecks();
    }
  }, [isAuthenticated]);

  const checkAuthStatus = async (token?: string) => {
    try {
      const tokenToUse = token || authToken;
              const response = await fetch('http://api.protogen.local:3333/api/auth/admin/check', {
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
      const response = await fetch('http://api.protogen.local:3333/api/auth/admin/login', {
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
        await fetch('http://api.protogen.local:3333/api/auth/admin/logout', {
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

  // Load scenes and decks when component mounts
  useEffect(() => {
    if (isAuthenticated) {
      loadScenes();
      loadDecks();
    }
  }, [isAuthenticated]);

    // const _handleSceneEdit = () => {
    // if (currentScene) {
    //   // TODO: Implement scene editing
    //   console.log('Scene editing not yet implemented');
    // }
    // };

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
    setViewMode('scenes');
    updateURL('scenes');
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
      case 'flows':
        setViewMode('flows');
        updateURL('flows');
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
      case 'subgraph-studio':
        setViewMode('subgraph-studio');
        updateURL('subgraph-studio');
        break;
    }
  };

  // Context menu handlers
  // TODO: Implement scene context menu
  // const _handleSceneContextMenu = (_event: React.MouseEvent, _scene: any) => {
  //   // TODO: Implement scene context menu
  //   console.log('Scene context menu not yet implemented');
  // };

  // Scene authoring handlers
  const handleCreateScene = (sceneType: any) => {
    setSelectedSceneType(sceneType);
    setViewMode('create-scene');
  };

  // const _handleEditScene = (scene: any) => {
  //   setEditingScene(scene);
  //   setViewMode('edit-scene');
  // };

  const handleSaveScene = (sceneData: any) => {
    // TODO: Implement scene saving
    console.log('Saving scene:', sceneData);
    showSuccess('Scene saved successfully!');
    setViewMode('scenes');
    setSelectedSceneType(null);
    setEditingScene(null);
  };

  const handlePreviewScene = (sceneData: any) => {
    // TODO: Implement scene preview
    console.log('Previewing scene:', sceneData);
    showSuccess('Scene preview opened!');
  };

  const handleCancelSceneCreation = () => {
    setViewMode('scenes');
    setSelectedSceneType(null);
    setEditingScene(null);
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
                          <Network className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="text-lg font-medium">Subgraph Studio</h3>
                      </div>
                      <p className="text-muted-foreground mb-4">
                        Manage logical groupings of nodes and create efficient subgraph structures.
                      </p>
                      <button
                        onClick={() => updateURL('subgraph-studio')}
                        className="w-full px-4 py-2 border border-border rounded-md hover:bg-muted transition-colors"
                      >
                        Open Subgraph Studio
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
              <div className="h-full">
                <SceneManager />
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
                <DeckManager />
              </div>
            )}

            {viewMode === 'contexts' && (
              <div className="p-8">
                <div className="max-w-6xl mx-auto">
                  <div className="mb-8">
                    <h1 className="text-3xl font-bold text-foreground mb-2">Context Management</h1>
                    <p className="text-muted-foreground">
                      Manage anchors and coordinates within scenes, documents, and other content
                    </p>
                  </div>
                  
                  <div className="text-center py-12">
                    <div className="text-4xl mb-4">🎯</div>
                    <h3 className="text-lg font-semibold mb-2">Contexts Coming Soon</h3>
                    <p className="text-muted-foreground mb-4">
                      The Context system will allow you to create anchors and coordinates within your content
                    </p>
                    <div className="space-y-2 text-sm text-muted-foreground max-w-md mx-auto">
                      <p>• Scene coordinates for graph navigation</p>
                      <p>• Document anchors for text references</p>
                      <p>• Deck positions for presentation flow</p>
                      <p>• Custom coordinate systems</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {viewMode === 'flows' && (
              <div className="p-8">
                <div className="max-w-6xl mx-auto">
                  <div className="mb-8">
                    <h1 className="text-3xl font-bold text-foreground mb-2">Flow Management</h1>
                    <p className="text-muted-foreground">
                      Design and manage user interaction flows and navigation patterns
                    </p>
                  </div>
                  
                  <div className="text-center py-12">
                    <div className="text-4xl mb-4">🌊</div>
                    <h3 className="text-lg font-semibold mb-2">Flows Coming Soon</h3>
                    <p className="text-muted-foreground mb-4">
                      The Flow system will allow you to create and manage user interaction patterns
                    </p>
                    <div className="space-y-2 text-sm text-muted-foreground max-w-md mx-auto">
                      <p>• User journey mapping</p>
                      <p>• Navigation flow design</p>
                      <p>• Interactive state management</p>
                      <p>• Flow analytics and optimization</p>
                    </div>
                  </div>
                </div>
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


            {viewMode === 'create-scene' && (
              <div className="p-8">
                <div className="max-w-6xl mx-auto">
                  {selectedSceneType?.id === 'graph' ? (
                    <GraphSceneAuthoring
                      availableNodes={_availableNodes}
                      onSave={handleSaveScene}
                      onPreview={handlePreviewScene}
                      onCancel={handleCancelSceneCreation}
                    />
                  ) : selectedSceneType?.id === 'document' ? (
                    <DocumentSceneAuthoring
                      availableNodes={_availableNodes}
                      onSave={handleSaveScene}
                      onPreview={handlePreviewScene}
                      onCancel={handleCancelSceneCreation}
                    />
                  ) : (
                    <SceneTypeManager
                      availableTypes={[]}
                      onCreateScene={handleCreateScene}
                    />
                  )}
                </div>
              </div>
            )}

            {viewMode === 'edit-scene' && (
              <div className="p-8">
                <div className="max-w-6xl mx-auto">
                  {editingScene?.type === 'graph' ? (
                    <GraphSceneAuthoring
                      scene={editingScene}
                      availableNodes={_availableNodes}
                      onSave={handleSaveScene}
                      onPreview={handlePreviewScene}
                      onCancel={handleCancelSceneCreation}
                    />
                  ) : editingScene?.type === 'document' ? (
                    <DocumentSceneAuthoring
                      scene={editingScene}
                      availableNodes={_availableNodes}
                      onSave={handleSaveScene}
                      onPreview={handlePreviewScene}
                      onCancel={handleCancelSceneCreation}
                    />
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">
                        Scene editing for type "{editingScene?.type}" is not yet implemented.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* New Scene Workflow */}
            {viewMode === 'scene-workflow' && (
              <div className="h-full">
                <SceneWorkflow
                  mode="create"
                  onComplete={handleSceneWorkflowComplete}
                  onCancel={() => {
                    setViewMode('scenes');
                    updateURL('scenes');
                  }}
                />
              </div>
            )}

            {/* Edit Scene Basic Details */}
            {viewMode === 'scene-edit' && (
              <div className="h-full">
                <SceneWorkflow
                  mode="edit"
                  sceneId={currentScene?.id}
                  initialData={{
                    basicDetails: {
                      name: currentScene?.name || '',
                      slug: currentScene?.slug || '',
                      description: currentScene?.description || '',
                      type: currentScene?.type || 'graph',
                      deckIds: currentScene?.deckIds || []
                    },
                    design: {
                      type: currentScene?.type || 'graph',
                      designData: currentScene?.type === 'document' ? {
                        content: {
                          html: '', // Will be loaded from scene_content table
                          markdown: '',
                          media: [],
                          links: []
                        },
                        metadata: {
                          title: currentScene?.meta?.title || currentScene?.name || '',
                          subtitle: currentScene?.meta?.subtitle || '',
                          author: currentScene?.meta?.author || currentScene?.metadata?.author || '',
                          version: currentScene?.meta?.version || '1.0.0',
                          tags: currentScene?.meta?.tags || currentScene?.metadata?.tags || []
                        },
                        style: {
                          theme: currentScene?.style?.theme || 'default',
                          typography: {
                            fontFamily: currentScene?.style?.typography?.fontFamily || 'Inter',
                            fontSize: currentScene?.style?.typography?.fontSize || '16px',
                            lineHeight: currentScene?.style?.typography?.lineHeight || '1.6'
                          }
                        },
                        config: {
                          showTableOfContents: currentScene?.config?.showTableOfContents || true,
                          enableSearch: currentScene?.config?.enableSearch || true,
                          allowComments: currentScene?.config?.allowComments || false,
                          autoSave: currentScene?.config?.autoSave || true
                        }
                      } : undefined
                    }
                  }}
                  onComplete={handleSceneEditComplete}
                  onCancel={() => {
                    setViewMode('scenes');
                    updateURL('scenes');
                  }}
                />
              </div>
            )}

            {/* Edit Scene Design */}
            {viewMode === 'scene-design' && (
              <div className="h-full">
                <SceneWorkflow
                  mode="edit"
                  sceneId={currentScene?.id}
                  startStep={1}
                  initialData={{
                    basicDetails: {
                      name: currentScene?.name || '',
                      slug: currentScene?.slug || '',
                      description: currentScene?.description || '',
                      type: currentScene?.type || 'graph',
                      deckIds: currentScene?.deckIds || []
                    },
                    design: {
                      type: currentScene?.type || 'graph',
                      designData: currentScene?.type === 'document' ? {
                        content: {
                          html: '', // Will be loaded from scene_content table
                          markdown: '',
                          media: [],
                          links: []
                        },
                        metadata: {
                          title: currentScene?.meta?.title || currentScene?.name || '',
                          subtitle: currentScene?.meta?.subtitle || '',
                          author: currentScene?.meta?.author || currentScene?.metadata?.author || '',
                          version: currentScene?.meta?.version || '1.0.0',
                          tags: currentScene?.meta?.tags || currentScene?.metadata?.tags || []
                        },
                        style: {
                          theme: currentScene?.style?.theme || 'default',
                          typography: {
                            fontFamily: currentScene?.style?.typography?.fontFamily || 'Inter',
                            fontSize: currentScene?.style?.typography?.fontSize || '16px',
                            lineHeight: currentScene?.style?.typography?.lineHeight || '1.6'
                          }
                        },
                        config: {
                          showTableOfContents: currentScene?.config?.showTableOfContents || true,
                          enableSearch: currentScene?.config?.enableSearch || true,
                          allowComments: currentScene?.config?.allowComments || false,
                          autoSave: currentScene?.config?.autoSave || true
                        }
                      } : currentScene
                    }
                  }}
                  onComplete={handleSceneDesignComplete}
                  onCancel={() => {
                    setViewMode('scenes');
                    updateURL('scenes');
                  }}
                />
              </div>
            )}

            {/* New Deck Workflow */}
            {viewMode === 'deck-workflow' && (
              <div className="h-full">
                <DeckWorkflow
                  mode="create"
                  onComplete={handleDeckWorkflowComplete}
                  onCancel={() => {
                    setViewMode('decks');
                    updateURL('decks');
                  }}
                />
              </div>
            )}

            {/* Edit Deck Workflow */}
            {viewMode === 'deck-edit' && (
              <div className="h-full">
                <DeckWorkflow
                  mode="edit"
                  initialData={{
                    basicDetails: {
                      name: currentDeck?.name || '',
                      slug: currentDeck?.slug || '',
                      description: currentDeck?.description || '',
                      keepWarm: currentDeck?.performance?.keepWarm || true,
                      preloadStrategy: currentDeck?.performance?.preloadStrategy || 'proximity',
                    }
                  }}
                  onComplete={handleDeckWorkflowComplete}
                  onCancel={() => {
                    setViewMode('decks');
                    updateURL('decks');
                  }}
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
