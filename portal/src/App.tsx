import { ProtogenLayout } from './components/ProtogenLayout';
import { OAuthLogin } from './components/OAuthLogin';
import { AppLayout } from './components/layout/AppLayout';
import { SceneContainer } from './components/scene/SceneContainer';
import { useState, useEffect } from 'react';
import { sceneRouter } from '@protogen/shared/systems/scene';
import { useNavigator } from '@protogen/shared/systems/navigator';
import { urlSyncService } from '@protogen/shared/systems/navigator';
import { DialogContainer } from '@protogen/shared/systems/dialog/components';
import { useDialog } from '@protogen/shared/systems/dialog';
import { toolbarSystem } from '@protogen/shared/systems/toolbar';
// Removed unused Button import

interface User {
  id: number;
  name: string;
  email: string;
  reputation: number;
  is_admin: boolean;
}

function App() {
  const { openToast } = useDialog();
  const { navigateTo, currentContext } = useNavigator();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Check for existing authentication on app load
  useEffect(() => {
    // Check for OAuth callback parameters first
    const urlParams = new URLSearchParams(window.location.search);
    const callbackToken = urlParams.get('token');
    const callbackUser = urlParams.get('user');
    
    if (callbackToken && callbackUser) {
      try {
        const userData = JSON.parse(decodeURIComponent(callbackUser));
        setToken(callbackToken);
        setUser(userData);
        localStorage.setItem('oauth_token', callbackToken);
        localStorage.setItem('oauth_user', callbackUser);
        
        // Clean up URL parameters
        window.history.replaceState({}, document.title, window.location.pathname);
        
        openToast(`Successfully signed in as ${userData.name}`, {
          title: "Welcome!",
          variant: 'success'
        });
        return;
      } catch (error) {
        console.error('Failed to parse OAuth callback:', error);
      }
    }
    
    // Fallback to saved authentication
    const savedToken = localStorage.getItem('oauth_token');
    const savedUser = localStorage.getItem('oauth_user');
    
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Failed to restore authentication state:', error);
        localStorage.removeItem('oauth_token');
        localStorage.removeItem('oauth_user');
      }
    }
  }, []);

  const handleLogin = (user: User, token: string) => {
    setUser(user);
    setToken(token);
    localStorage.setItem('oauth_token', token);
    localStorage.setItem('oauth_user', JSON.stringify(user));
    
    openToast(`Successfully signed in as ${user.name}`, {
      title: "Welcome back!",
      variant: 'success'
    });
  };

  const handleLogout = async () => {
    try {
      // Call logout API if we have a token
      if (token) {
        await fetch('http://protogen.local:8080/api/auth/oauth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (error) {
      console.error('Logout API call failed:', error);
      // Continue with local logout even if API call fails
    }

    // Clear local state
    setUser(null);
    setToken(null);
    localStorage.removeItem('oauth_token');
    localStorage.removeItem('oauth_user');
    
    openToast("You have been successfully signed out", {
      title: "Signed out",
      variant: 'info'
    });
  };

  // Initialize systems on mount
  useEffect(() => {
    // === Scene Router Configuration ===
    sceneRouter.setDefaultScene('system-home');
    
    // Set up context-to-scene mappings
    sceneRouter.setSceneOverride('/', 'system-home', 10);
    sceneRouter.setSceneOverride('/explore', 'system-explore', 10);
    sceneRouter.setSceneOverride('/profile*', 'system-profile', 10);
    sceneRouter.setSceneOverride('/settings', 'system-settings', 10);

    // === URL Sync Configuration ===
    urlSyncService.setEnabled(true);

    // Handle browser back/forward buttons
    const handleURLChange = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { context } = customEvent.detail;
      if (context && context.contextPath) {
        navigateTo({ type: 'context', id: 'url-context', contextPath: context.contextPath });
      }
    };

    window.addEventListener('navigator:url-changed', handleURLChange as EventListener);

    // Parse initial URL and navigate if needed
    const initialContext = urlSyncService.urlToContext();
    if (initialContext.contextPath && initialContext.contextPath !== '/') {
      navigateTo({ type: 'context', id: 'init-context', contextPath: initialContext.contextPath });
    }

    // === Toolbar System Configuration ===
    // Initialize toolbar with default configuration
    toolbarSystem.initialize().catch(err => {
      console.error('Failed to initialize toolbar system:', err);
    });

    // Configure top toolbar
    toolbarSystem.registerToolbarConfig({
      id: 'top-toolbar',
      edge: 'top',
      sections: [
        {
          id: 'start-section',
          position: 'start',
          items: [
            {
              id: 'menu-button',
              type: 'button',
              icon: 'menu',
              action: {
                type: 'custom',
                handler: () => toolbarSystem.toggleDrawer('main-nav-drawer')
              },
              responsive: { priority: 100 }
            }
          ]
        },
        {
          id: 'middle-section',
          position: 'middle',
          items: [
            {
              id: 'context-indicator',
              type: 'context-indicator',
              responsive: { priority: 90 }
            }
          ]
        },
        {
          id: 'end-section',
          position: 'end',
          items: [],
          responsive: {
            collapseThreshold: 'md',
            overflowBehavior: 'overflow-menu'
          }
        }
      ]
    });

    // Configure main navigation drawer
    toolbarSystem.registerDrawer({
      id: 'main-nav-drawer',
      edge: 'left',
      width: '256px',
      overlay: true,
      closeOnClickOutside: true,
      items: [
        { type: 'section-header', label: 'Navigation' },
        {
          type: 'nav-item',
          label: 'Home',
          icon: 'home',
          action: { type: 'navigate-context', contextPath: '/' }
        },
        {
          type: 'nav-item',
          label: 'Explore',
          icon: 'compass',
          action: { type: 'navigate-context', contextPath: '/explore' }
        },
        {
          type: 'nav-item',
          label: 'Profile',
          icon: 'user',
          action: { type: 'navigate-context', contextPath: '/profile' }
        },
        {
          type: 'nav-item',
          label: 'Settings',
          icon: 'settings',
          action: { type: 'navigate-context', contextPath: '/settings' }
        }
      ]
    });

    // Wire up toolbar menu actions to Navigator and Dialog systems
    const handleMenuAction = (data: any) => {
      const { action } = data;
      
      switch (action.type) {
        case 'navigate-context':
          navigateTo({ type: 'context', id: 'context', contextPath: action.contextPath });
          break;
        
        case 'navigate-scene':
          navigateTo({ type: 'scene', id: action.sceneId });
          break;
        
        case 'open-dialog':
          // Open appropriate dialog based on dialogType
          if (action.dialogType === 'modal') {
            // Example: openModal(action.config);
          } else if (action.dialogType === 'toast') {
            openToast(action.config.message || 'Notification', action.config);
          }
          break;
        
        case 'start-flow':
          // Future: Start a flow
          console.log('Start flow:', action.flowId);
          break;
        
        case 'external-link':
          if (action.newTab) {
            window.open(action.url, '_blank');
          } else {
            window.location.href = action.url;
          }
          break;
        
        default:
          console.warn('Unknown menu action type:', action.type);
      }
    };

    toolbarSystem.on('menu-action', handleMenuAction);

    return () => {
      window.removeEventListener('navigator:url-changed', handleURLChange as EventListener);
      toolbarSystem.off('menu-action', handleMenuAction);
    };
  }, [navigateTo, openToast]);

  // Show login screen if not authenticated
  if (!user || !token) {
    return (
      <>
        <ProtogenLayout user={user} onLogout={handleLogout}>
          <div className="pt-16 min-h-screen flex items-center justify-center">
            <OAuthLogin 
              onLogin={handleLogin}
              onLogout={handleLogout}
              user={user}
              token={token}
            />
          </div>
        </ProtogenLayout>
        <DialogContainer />
      </>
    );
  }

  return (
    <>
      <AppLayout>
        {/* Scene-first routing */}
        <SceneContainer />
      </AppLayout>
      
      {/* Dialog System for all modal interactions */}
      <DialogContainer />
    </>
  );
}

export default App;
