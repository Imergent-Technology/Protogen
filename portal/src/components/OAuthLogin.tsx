import React, { useState } from 'react';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@protogen/shared';
import { Chrome, User, LogOut } from 'lucide-react';

interface User {
  id: number;
  name: string;
  email: string;
  reputation: number;
  is_admin: boolean;
}

interface OAuthLoginProps {
  onLogin?: (user: User, token: string) => void;
  onLogout?: () => void;
  user?: User | null;
  token?: string | null;
}

export const OAuthLogin: React.FC<OAuthLoginProps> = ({ 
  onLogin, 
  onLogout, 
  user, 
  token 
}) => {
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleOAuthLogin = async (provider: string) => {
    setIsLoading(provider);
    try {
      // Redirect to OAuth provider
      window.location.href = `http://protogen.local:8080/api/auth/oauth/${provider}/redirect`;
    } catch (error) {
      console.error(`OAuth login failed for ${provider}:`, error);
      setIsLoading(null);
    }
  };

  const handleLogout = async () => {
    if (!token) return;
    
    try {
      const response = await fetch('http://protogen.local:8080/api/auth/oauth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        onLogout?.();
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Check for OAuth callback in URL
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const userData = urlParams.get('user');
    const error = urlParams.get('error');
    
    if (error) {
      console.error('OAuth error:', decodeURIComponent(error));
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }
    
    if (token && userData) {
      try {
        const user = JSON.parse(decodeURIComponent(userData));
        onLogin?.(user, token);
        
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (error) {
        console.error('Failed to parse user data:', error);
      }
    }
  }, [onLogin]);

  if (user && token) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Welcome, {user.name}!
          </CardTitle>
          <CardDescription>
            Reputation: {(user.reputation * 100).toFixed(0)}%
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Status:</strong> {user.is_admin ? 'Admin' : 'User'}</p>
            </div>
            <Button 
              onClick={handleLogout} 
              variant="outline" 
              className="w-full"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Sign In to Protogen</CardTitle>
        <CardDescription>
          Choose your preferred authentication method to get started
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button 
            onClick={() => handleOAuthLogin('google')}
            disabled={isLoading !== null}
            className="w-full"
            variant="outline"
          >
            <Chrome className="h-4 w-4 mr-2" />
            {isLoading === 'google' ? 'Connecting...' : 'Continue with Google'}
          </Button>

          {/* Facebook and Instagram OAuth temporarily disabled - requires business verification */}
          <div className="w-full p-3 bg-muted rounded-md text-center text-sm text-muted-foreground">
            <p>Additional providers coming soon</p>
            <p className="text-xs mt-1">Facebook/Instagram require business verification</p>
          </div>

          <div className="text-xs text-muted-foreground text-center">
            By signing in, you agree to our terms of service and privacy policy
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
