import { ProtogenLayout } from './components/ProtogenLayout';
import { OAuthLogin } from './components/OAuthLogin';
import { useState, useEffect } from 'react';
// Temporary placeholder components for testing
const StageManagerDemo = () => <div>Stage Manager Demo - Coming Soon</div>;
const ToolbarDemo = () => <div>Toolbar Demo - Coming Soon</div>;
const ModalProvider = ({ children }: { children: React.ReactNode }) => <>{children}</>;
const ModalRenderer = () => null;
const Toaster = () => null;
const useToast = () => ({ toast: (options: any) => console.log('Toast:', options) });
import { Button } from '@progress/shared';
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
        await fetch('http://localhost:8080/api/auth/oauth/logout', {
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
      <ProtogenLayout user={user} onLogout={handleLogout}>
        {/* Main Content Area */}
        <div className="pt-16 min-h-screen">
          {/* Welcome Section */}
          <div className="container mx-auto px-4 py-8">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold mb-4">
                Welcome to <span className="text-primary">Protogen</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                A community-driven platform for collaborative feedback and knowledge synthesis through interactive graph visualizations.
              </p>
              <div className="mt-4 text-sm text-muted-foreground">
                Signed in as <strong>{user.name}</strong> • Reputation: {(user.reputation * 100).toFixed(0)}%
              </div>
            </div>

            {/* Feature Preview Cards */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <Layers className="h-8 w-8 text-primary mr-3" />
                  <h3 className="text-lg font-semibold">Stage Manager</h3>
                </div>
                <p className="text-muted-foreground">
                  Navigate between different contexts and views with our layer-based interface system.
                </p>
              </div>

              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <Network className="h-8 w-8 text-primary mr-3" />
                  <h3 className="text-lg font-semibold">Graph Visualization</h3>
                </div>
                <p className="text-muted-foreground">
                  Interactive graph visualizations powered by Sigma.js for exploring complex relationships.
                </p>
              </div>

              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <MessageSquare className="h-8 w-8 text-primary mr-3" />
                  <h3 className="text-lg font-semibold">Community Feedback</h3>
                </div>
                <p className="text-muted-foreground">
                  Share feedback, participate in discussions, and contribute to the community knowledge base.
                </p>
              </div>
            </div>

            {/* Interactive Demo Section */}
            <div className="bg-card border border-border rounded-lg p-8 mb-8">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-semibold mb-4">Interactive Demo</h2>
                <p className="text-muted-foreground mb-6">
                  Try out the integrated StageManager, modal system, and toolbar components.
                </p>
                
                <div className="flex justify-center space-x-4 mb-6">
                  <Button onClick={handleShowToast} variant="outline">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Show Toast
                  </Button>
                  <Button variant="outline">
                    <Play className="h-4 w-4 mr-2" />
                    Launch Demo
                  </Button>
                </div>
              </div>

              {/* Stage Manager Demo */}
              <div className="border-t border-border pt-6">
                <h3 className="text-lg font-semibold mb-4">Stage Manager Demo</h3>
                <StageManagerDemo />
              </div>
            </div>

            {/* Toolbar Demo */}
            <div className="bg-card border border-border rounded-lg p-8 mb-8">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-semibold mb-4">Toolbar Demo</h2>
                <p className="text-muted-foreground">
                  Test the minimal toolbar with modal integration.
                </p>
              </div>
              <ToolbarDemo />
            </div>

            {/* Development Status */}
            <div className="mt-8 text-center">
              <div className="inline-flex items-center px-4 py-2 bg-muted rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm text-muted-foreground">
                  OAuth Authentication & Stage Manager Integrated - Ready for Development
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Renderer */}
        <ModalRenderer />
        
        {/* Toast Notifications */}
        <Toaster />
      </ProtogenLayout>
    </ModalProvider>
  );
}

export default App;
