import { useState, useEffect } from 'react';
import { Settings, Layers, Users, BarChart3, Home, LogOut } from 'lucide-react';
import { StagesList, apiClient, Stage } from '@progress/shared';
import { UsersList } from './components/UsersList';
import { AdminLogin } from './components/AdminLogin';
import { StagePreviewModal } from './components/StagePreviewModal';
import { ToastContainer, useToasts } from './components/Toast';

interface AdminUser {
  id: number;
  name: string;
  email: string;
  is_admin: boolean;
}

function App() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'stages' | 'analytics' | 'users'>('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [previewStage, setPreviewStage] = useState<Stage | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const { toasts, removeToast, showSuccess } = useToasts();

  useEffect(() => {
    // Check if we have a stored token
    const token = localStorage.getItem('admin_token');
    if (token) {
      setAuthToken(token);
      checkAuthStatus(token);
    }
  }, []);

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
          // Set the auth token on the shared API client
          if (tokenToUse) {
            apiClient.setAuthToken(tokenToUse);
          }
        } else {
          // Token is invalid, clear it
          localStorage.removeItem('admin_token');
          setAuthToken(null);
          setIsAuthenticated(false);
          setAdminUser(null);
          apiClient.clearAuthToken();
        }
      } else {
        // Token is invalid, clear it
        localStorage.removeItem('admin_token');
        setAuthToken(null);
        setIsAuthenticated(false);
        setAdminUser(null);
        apiClient.clearAuthToken();
      }
    } catch (error) {
      console.log('Not authenticated');
      localStorage.removeItem('admin_token');
      setAuthToken(null);
      setIsAuthenticated(false);
      setAdminUser(null);
      apiClient.clearAuthToken();
    }
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
        
        // Store the token
        localStorage.setItem('admin_token', token);
        setAuthToken(token);
        setIsAuthenticated(true);
        setAdminUser(data.user);
        
        // Set the auth token on the shared API client
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
    
    // Clear token and state
    localStorage.removeItem('admin_token');
    setAuthToken(null);
    setIsAuthenticated(false);
    setAdminUser(null);
    
    // Clear the auth token from the shared API client
    apiClient.clearAuthToken();
    
    showSuccess('Logged Out', 'You have been successfully logged out');
  };

  const handlePreviewStage = (stage: Stage) => {
    setPreviewStage(stage);
    setIsPreviewOpen(true);
  };

  const handleClosePreview = () => {
    setIsPreviewOpen(false);
    setPreviewStage(null);
  };

  const handleStageSelect = (stage: any) => {
    console.log('Stage selected:', stage);
    // TODO: Navigate to stage detail view
  };

  const handleStageEdit = (stage: any) => {
    console.log('Edit stage:', stage);
    showSuccess('Stage Updated', `Successfully updated "${stage.name}"`);
  };

  const handleStageDelete = (stageId: number) => {
    console.log('Stage deleted:', stageId);
    showSuccess('Stage Deleted', 'Stage has been successfully deleted');
  };

  const handleUserSelect = (user: any) => {
    console.log('User selected:', user);
    // TODO: Navigate to user detail view
  };

  const handleUserEdit = (user: any) => {
    console.log('Edit user:', user);
    showSuccess('User Updated', `Successfully updated "${user.name}"`);
  };

  const handleUserDelete = (userId: number) => {
    console.log('User deleted:', userId);
    showSuccess('User Deleted', 'User has been successfully deleted');
  };

  const renderMainContent = () => {
    switch (currentView) {
      case 'stages':
        return (
          <StagesList
            onStageSelect={handleStageSelect}
            onStageEdit={handleStageEdit}
            onStageDelete={handleStageDelete}
            onStagePreview={handlePreviewStage}
          />
        );
      case 'analytics':
        return (
          <div className="text-center py-12">
            <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Analytics</h3>
            <p className="text-muted-foreground">Analytics dashboard coming soon...</p>
          </div>
        );
      case 'users':
        return (
          <UsersList
            onUserSelect={handleUserSelect}
            onUserEdit={handleUserEdit}
            onUserDelete={handleUserDelete}
          />
        );
      default:
        return (
          <div className="max-w-4xl mx-auto">
            {/* Welcome Section */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2">Welcome to Protogen Admin</h2>
              <p className="text-muted-foreground">
                Manage stages, monitor user activity, and control the platform from this centralized dashboard.
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Stages</p>
                    <p className="text-2xl font-bold">12</p>
                  </div>
                  <Layers className="h-8 w-8 text-primary" />
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                    <p className="text-2xl font-bold">156</p>
                  </div>
                  <Users className="h-8 w-8 text-primary" />
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Graph Views</p>
                    <p className="text-2xl font-bold">89</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-primary" />
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button 
                  onClick={() => setCurrentView('stages')}
                  className="flex items-center space-x-3 p-4 border border-border rounded-lg hover:bg-muted transition-colors"
                >
                  <Layers className="h-5 w-5 text-primary" />
                  <div className="text-left">
                    <p className="font-medium">Manage Stages</p>
                    <p className="text-sm text-muted-foreground">View and edit all stages</p>
                  </div>
                </button>

                <button className="flex items-center space-x-3 p-4 border border-border rounded-lg hover:bg-muted transition-colors">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  <div className="text-left">
                    <p className="font-medium">View Analytics</p>
                    <p className="text-sm text-muted-foreground">Check platform usage statistics</p>
                  </div>
                </button>

                <button 
                  onClick={() => setCurrentView('users')}
                  className="flex items-center space-x-3 p-4 border border-border rounded-lg hover:bg-muted transition-colors"
                >
                  <Users className="h-5 w-5 text-primary" />
                  <div className="text-left">
                    <p className="font-medium">Manage Users</p>
                    <p className="text-sm text-muted-foreground">View and manage user accounts</p>
                  </div>
                </button>

                <button className="flex items-center space-x-3 p-4 border border-border rounded-lg hover:bg-muted transition-colors">
                  <Settings className="h-5 w-5 text-primary" />
                  <div className="text-left">
                    <p className="font-medium">Platform Settings</p>
                    <p className="text-sm text-muted-foreground">Configure platform options</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-card border border-border rounded-lg p-6 mt-8">
              <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-3 bg-muted/50 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">New stage created: "Getting Started Guide"</p>
                    <p className="text-xs text-muted-foreground">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 p-3 bg-muted/50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">User feedback received on "Welcome Stage"</p>
                    <p className="text-xs text-muted-foreground">4 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 p-3 bg-muted/50 rounded-lg">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Stage "First Goal" updated</p>
                    <p className="text-xs text-muted-foreground">6 hours ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
    }
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

  return (
    <div className="min-h-screen bg-background">
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-primary">Protogen Admin</h1>
              <div className="text-sm text-muted-foreground">
                Stage Management & Control Panel
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{adminUser?.name || 'Admin'}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 border-r border-border bg-card min-h-screen">
          <nav className="p-4">
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => setCurrentView('dashboard')}
                  className={`w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    currentView === 'dashboard'
                      ? 'text-primary bg-primary/10'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <Home className="h-4 w-4" />
                  <span>Dashboard</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView('stages')}
                  className={`w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    currentView === 'stages'
                      ? 'text-primary bg-primary/10'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <Layers className="h-4 w-4" />
                  <span>Stages</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView('analytics')}
                  className={`w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    currentView === 'analytics'
                      ? 'text-primary bg-primary/10'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <BarChart3 className="h-4 w-4" />
                  <span>Analytics</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView('users')}
                  className={`w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    currentView === 'users'
                      ? 'text-primary bg-primary/10'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <Users className="h-4 w-4" />
                  <span>Users</span>
                </button>
              </li>
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {renderMainContent()}
        </main>
      </div>

      {/* Stage Preview Modal */}
      <StagePreviewModal
        stage={previewStage}
        isOpen={isPreviewOpen}
        onClose={handleClosePreview}
        onEdit={() => {
          handleClosePreview();
          // TODO: Open edit form for the previewed stage
        }}
        onShare={() => {
          // TODO: Implement share functionality
          console.log('Share stage:', previewStage);
        }}
        onViewAnalytics={() => {
          // TODO: Implement analytics view
          console.log('View analytics for stage:', previewStage);
        }}
      />
    </div>
  );
}

export default App;
