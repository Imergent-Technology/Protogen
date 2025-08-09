import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { User, Shield, Star, Calendar, ExternalLink } from 'lucide-react';

interface User {
  id: number;
  name: string;
  email: string;
  reputation: number;
  is_admin: boolean;
  created_at?: string;
  updated_at?: string;
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

interface UserProfileProps {
  user: User;
  providers?: OAuthProvider[];
  showAdminInfo?: boolean;
  className?: string;
}

export const UserProfile: React.FC<UserProfileProps> = ({
  user,
  providers = [],
  showAdminInfo = false,
  className = ''
}) => {
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

  const getReputationColor = (reputation: number) => {
    if (reputation >= 0.8) return 'text-green-600';
    if (reputation >= 0.6) return 'text-blue-600';
    if (reputation >= 0.4) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getReputationLabel = (reputation: number) => {
    if (reputation >= 0.8) return 'Excellent';
    if (reputation >= 0.6) return 'Good';
    if (reputation >= 0.4) return 'Average';
    return 'Needs Improvement';
  };

  return (
    <Card className={`w-full max-w-2xl ${className}`}>
      <CardHeader>
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarImage 
              src={providers.find(p => p.provider_data?.avatar)?.provider_data?.avatar} 
              alt={user.name} 
            />
            <AvatarFallback>
              <User className="h-8 w-8" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              {user.name}
              {user.is_admin && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  Admin
                </Badge>
              )}
            </CardTitle>
            <CardDescription>{user.email}</CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Reputation Section */}
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            <span className="font-medium">Reputation</span>
          </div>
          <div className="text-right">
            <div className={`text-2xl font-bold ${getReputationColor(user.reputation)}`}>
              {(user.reputation * 100).toFixed(0)}%
            </div>
            <div className="text-sm text-muted-foreground">
              {getReputationLabel(user.reputation)}
            </div>
          </div>
        </div>

        {/* Connected Accounts */}
        {providers.length > 0 && (
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <ExternalLink className="h-4 w-4" />
              Connected Accounts
            </h4>
            <div className="space-y-2">
              {providers.map((provider) => (
                <div
                  key={provider.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{getProviderIcon(provider.provider)}</span>
                    <div>
                      <div className="font-medium capitalize">{provider.provider}</div>
                      <div className="text-sm text-muted-foreground">
                        {provider.provider_data?.email || provider.provider_data?.name}
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline">Connected</Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Admin Information */}
        {showAdminInfo && (
          <div>
            <h4 className="font-medium mb-3">Account Information</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">User ID:</span>
                <div className="font-mono">{user.id}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Account Type:</span>
                <div>{user.is_admin ? 'Administrator' : 'Standard User'}</div>
              </div>
              {user.created_at && (
                <div>
                  <span className="text-muted-foreground">Member Since:</span>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(user.created_at).toLocaleDateString()}
                  </div>
                </div>
              )}
              {user.updated_at && (
                <div>
                  <span className="text-muted-foreground">Last Updated:</span>
                  <div>{new Date(user.updated_at).toLocaleDateString()}</div>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
