import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Input } from '@protogen/shared';
import { Search, UserPlus, Shield, TrendingUp } from 'lucide-react';
import { AdminUser } from '../../types/admin';
import { apiClient } from '../../services/apiClient';

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      // TODO: Create actual API endpoint for user management
      // const data = await apiClient.get<AdminUser[]>('/admin/users');
      // setUsers(data);
      
      // Mock data for now
      setUsers([
        {
          id: 1,
          name: 'John Doe',
          email: 'john@example.com',
          reputation: 450,
          engagement: 380,
          affinity: 420,
          standing: 416,
          standing_level: 'Collaborator',
          trust_level: 500,
          is_admin: false,
          last_active_at: new Date().toISOString(),
          created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 2,
          name: 'Jane Smith',
          email: 'jane@example.com',
          reputation: 750,
          engagement: 820,
          affinity: 680,
          standing: 750,
          standing_level: 'Curator',
          trust_level: 800,
          is_admin: true,
          last_active_at: new Date().toISOString(),
          created_at: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ]);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStandingColor = (standing: number) => {
    if (standing >= 750) return 'text-purple-600 dark:text-purple-400';
    if (standing >= 600) return 'text-blue-600 dark:text-blue-400';
    if (standing >= 400) return 'text-green-600 dark:text-green-400';
    if (standing >= 200) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">Manage users, roles, and permissions</p>
        </div>
        <Button className="flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          Invite User
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({filteredUsers.length})</CardTitle>
          <CardDescription>All registered users in the system</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-20 bg-muted animate-pulse rounded"></div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">
                        {user.name.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{user.name}</h3>
                        {user.is_admin && (
                          <Shield className="h-4 w-4 text-amber-600" title="Admin" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    {/* Standing */}
                    <div className="text-right">
                      <div className={`text-sm font-medium ${getStandingColor(user.standing)}`}>
                        {user.standing_level}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Standing: {user.standing}
                      </div>
                    </div>

                    {/* Metrics */}
                    <div className="text-right">
                      <div className="text-sm font-medium">R/E/A</div>
                      <div className="text-xs text-muted-foreground">
                        {user.reputation}/{user.engagement}/{user.affinity}
                      </div>
                    </div>

                    {/* Trust Level (admin only) */}
                    <div className="text-right">
                      <div className="text-sm font-medium">Trust</div>
                      <div className="text-xs text-muted-foreground">
                        {user.trust_level}
                      </div>
                    </div>

                    <Button variant="outline" size="sm">
                      Manage
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

