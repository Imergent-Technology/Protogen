import { ProtogenLayout } from './components/ProtogenLayout';
import { OAuthLogin } from './components/OAuthLogin';
import { SimpleTest } from './components/SimpleTest';
import { AppLayout } from './components/layout/AppLayout';
import { HomePage } from './components/pages/HomePage';
import { useState, useEffect } from 'react';
// Temporary placeholder components for testing
const SceneManagerDemo = () => <div>Scene Manager Demo - Coming Soon</div>;
const ToolbarDemo = () => <div>Toolbar Demo - Coming Soon</div>;
const ModalProvider = ({ children }: { children: React.ReactNode }) => <>{children}</>;
const ModalRenderer = () => null;
const Toaster = () => null;
const useToast = () => ({ toast: (_options: unknown) => {/* TODO: Implement toast */} });
import { Button } from '@protogen/shared';
import { Layers, Network, MessageSquare, Play } from 'lucide-react';

interface User {
  id: number;
  name: string;
  email: string;
  reputation: number;
  is_admin: boolean;
}

function App() {
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Check for existing authentication on app load
  useEffect(() => {
    // Check for OAuth callback parameters first
    const urlParams = new URLSearchParams(window.location.search);
    const callbackToken = urlParams.get('token');
    const callbackUser = urlParams.get('user');
    const provider = urlParams.get('provider');
    
    if (callbackToken && callbackUser) {
      try {
        const userData = JSON.parse(decodeURIComponent(callbackUser));
        setToken(callbackToken);
        setUser(userData);
        localStorage.setItem('oauth_token', callbackToken);
        localStorage.setItem('oauth_user', callbackUser);
        
        // Clean up URL parameters
        window.history.replaceState({}, document.title, window.location.pathname);
        
        toast({
          title: "Welcome!",
          description: `Successfully signed in as ${userData.name}`,
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
    
    toast({
      title: "Welcome back!",
      description: `Successfully signed in as ${user.name}`,
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
    
    toast({
      title: "Signed out",
      description: "You have been successfully signed out",
    });
  };

  const handleShowToast = () => {
    toast({
      title: "Welcome to Protogen!",
      description: "The stage manager and modal system are now integrated.",
    });
  };

  // Show login screen if not authenticated
  if (!user || !token) {
    return (
      <ModalProvider>
        <ProtogenLayout user={user} onLogout={handleLogout}>
          <div className="pt-16 min-h-screen flex items-center justify-center">
            <OAuthLogin 
              onLogin={handleLogin}
              onLogout={handleLogout}
              user={user}
              token={token}
            />
          </div>
          <ModalRenderer />
          <Toaster />
        </ProtogenLayout>
      </ModalProvider>
    );
  }

  return (
    <ModalProvider>
      <AppLayout 
        user={user} 
        onLogout={handleLogout}
        currentContext="Home"
        onContextClick={() => {
          toast({
            title: "Navigation History",
            description: "History interface would open here",
          });
        }}
      >
        <HomePage />
      </AppLayout>
      <ModalRenderer />
      <Toaster />
    </ModalProvider>
  );
}

export default App;
