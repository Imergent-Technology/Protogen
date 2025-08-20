import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { 
  Calendar, 
  ExternalLink, 
  Trash2, 
  AlertTriangle,
  Users
} from 'lucide-react';

interface OAuthProvider {
  id: number;
  user_id: number;
  provider: string;
  provider_id: string;
  provider_data: {
    name?: string;
    email?: string;
    avatar?: string;
    nickname?: string;
  };
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    name: string;
    email: string;
    reputation: number;
    is_admin: boolean;
  };
}

interface OAuthProvidersListProps {
  token?: string;
  apiBaseUrl?: string;
  showUserInfo?: boolean;
  onProviderDelete?: (providerId: number) => void;
}

export const OAuthProvidersList: React.FC<OAuthProvidersListProps> = ({
  token,
  apiBaseUrl = 'http://localhost:8080/api',
  showUserInfo = true,
  onProviderDelete
}) => {
  const [providers, setProviders] = useState<OAuthProvider[]>([]);
  const [stats, setStats] = useState<{ [key: string]: number }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProviders = async () => {
    if (!token) return;

    try {
      setIsLoading(true);
      const response = await fetch(`${apiBaseUrl}/users?include_providers=1`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch OAuth providers');
      }

      const data = await response.json();
      const allProviders: OAuthProvider[] = [];
      const providerStats: { [key: string]: number } = {};

      // Extract providers from all users
      data.data?.forEach((user: any) => {
        user.oauth_providers?.forEach((provider: OAuthProvider) => {
          allProviders.push({
            ...provider,
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              reputation: user.reputation,
              is_admin: user.is_admin,
            }
          });

          // Count providers by type
          providerStats[provider.provider] = (providerStats[provider.provider] || 0) + 1;
        });
      });

      setProviders(allProviders);
      setStats(providerStats);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, [token]);

  const getProviderIcon = (provider: string) => {
    switch (provider.toLowerCase()) {
      case 'google':
        return '🌐';
      case 'facebook':
        return '📘';
      case 'instagram':
        return '📸';
      default:
        return '🔗';
    }
  };

  const handleDeleteProvider = async (providerId: number) => {
    if (!token || !confirm('Are you sure you want to delete this OAuth provider connection?')) {
      return;
    }

    try {
      const response = await fetch(`${apiBaseUrl}/oauth-providers/${providerId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setProviders(prev => prev.filter(p => p.id !== providerId));
        onProviderDelete?.(providerId);
      } else {
        throw new Error('Failed to delete provider');
      }
    } catch (err) {
      console.error('Delete provider error:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete provider');
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">Loading OAuth providers...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-destructive flex items-center justify-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Provider Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-2xl font-bold">{providers.length}</div>
                <div className="text-sm text-muted-foreground">Total Connections</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {Object.entries(stats).map(([provider, count]) => (
          <Card key={provider}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <span className="text-lg">{getProviderIcon(provider)}</span>
                <div>
                  <div className="text-2xl font-bold">{count}</div>
                  <div className="text-sm text-muted-foreground capitalize">
                    {provider} Users
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Providers List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5" />
            OAuth Provider Connections
          </CardTitle>
        </CardHeader>
        <CardContent>
          {providers.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No OAuth provider connections found
            </div>
          ) : (
            <div className="space-y-4">
              {providers.map((provider) => (
                <div
                  key={provider.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">{getProviderIcon(provider.provider)}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium capitalize">{provider.provider}</span>
                        <Badge variant="outline">{provider.provider_id}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {provider.provider_data?.email || provider.provider_data?.name}
                      </div>
                      {showUserInfo && provider.user && (
                        <div className="text-xs text-muted-foreground mt-1">
                          User: {provider.user.name} ({provider.user.email})
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(provider.created_at).toLocaleDateString()}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteProvider(provider.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
