import { ProtogenLayout } from './components/ProtogenLayout';
import { OAuthLogin } from './components/OAuthLogin';
import { AppLayout } from './components/layout/AppLayout';
import { SceneContainer } from './components/scene/SceneContainer';
import { useState, useEffect } from 'react';
import { sceneRouter } from '@protogen/shared/systems/scene';
import { useNavigator } from '@protogen/shared/systems/navigator';
import { DialogContainer } from '@protogen/shared/systems/dialog/components';
import { useDialog } from '@protogen/shared/systems/dialog';
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

  // Initialize scene router on mount
  useEffect(() => {
    // Load scene router configuration from API
    // For now, use default configuration
    sceneRouter.setDefaultScene('system-home');
    
    // Set up context-to-scene mappings
    sceneRouter.setSceneOverride('/explore', 'system-explore', 10);
    sceneRouter.setSceneOverride('/profile*', 'system-profile', 10);
    sceneRouter.setSceneOverride('/settings', 'system-settings', 10);
  }, []);

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
      <AppLayout 
        user={user} 
        onLogout={handleLogout}
        currentContext={currentContext.sceneSlug || 'Home'}
        onContextClick={() => {
          openToast("History interface would open here", {
            title: "Navigation History",
            variant: 'info'
          });
        }}
        onNavigation={(target) => {
          // Use Navigator system for navigation
          navigateTo(target);
        }}
      >
        {/* Scene-first routing */}
        <SceneContainer />
      </AppLayout>
      
      {/* Dialog System for all modal interactions */}
      <DialogContainer />
    </>
  );
}

export default App;
