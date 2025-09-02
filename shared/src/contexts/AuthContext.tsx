import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
  reputation: number;
  is_admin: boolean;
}

interface OAuthProvider {
  id: number;
  provider: string;
  provider_id: string;
  provider_data: {
    name?: string;
    email?: string;
    avatar?: string;
    nickname?: string;
  };
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  providers: OAuthProvider[];
  isLoading: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  fetchUserProviders: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
  apiBaseUrl?: string;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ 
  children, 
          apiBaseUrl = 'http://progress.local:8080/api' 
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [providers, setProviders] = useState<OAuthProvider[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem('oauth_token');
    const savedUser = localStorage.getItem('oauth_user');
    
    if (savedToken && savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setToken(savedToken);
        setUser(userData);
      } catch (error) {
        console.error('Failed to restore authentication state:', error);
        localStorage.removeItem('oauth_token');
        localStorage.removeItem('oauth_user');
      }
    }
    
    setIsLoading(false);
  }, []);

  // Fetch user's OAuth providers
  const fetchUserProviders = async () => {
    if (!token || !user) return;

    try {
      const response = await fetch(`${apiBaseUrl}/user`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const userData = await response.json();
        if (userData.oauth_providers) {
          setProviders(userData.oauth_providers);
        }
      }
    } catch (error) {
      console.error('Failed to fetch user providers:', error);
    }
  };

  // Fetch providers when user logs in
  useEffect(() => {
    if (user && token) {
      fetchUserProviders();
    } else {
      setProviders([]);
    }
  }, [user, token]);

  const login = (userData: User, authToken: string) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('oauth_token', authToken);
    localStorage.setItem('oauth_user', JSON.stringify(userData));
  };

  const logout = async () => {
    if (token) {
      try {
        await fetch(`${apiBaseUrl}/auth/oauth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      } catch (error) {
        console.error('Logout request failed:', error);
      }
    }

    setUser(null);
    setToken(null);
    setProviders([]);
    localStorage.removeItem('oauth_token');
    localStorage.removeItem('oauth_user');
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('oauth_user', JSON.stringify(updatedUser));
    }
  };

  const value: AuthContextType = {
    user,
    token,
    providers,
    isLoading,
    login,
    logout,
    updateUser,
    fetchUserProviders,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
