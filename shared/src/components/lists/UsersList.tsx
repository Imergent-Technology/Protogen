import React, { useState, useEffect } from 'react';
import { Search, Edit, Trash2, Eye, Shield, User, Mail, Star } from 'lucide-react';

interface User {
  id: number;
  name: string;
  email: string;
  reputation: number;
  is_admin: boolean;
  created_at: string;
  oauth_providers?: Array<{
    provider: string;
    provider_id: string;
  }>;
}

interface UsersListProps {
  onUserSelect?: (user: User) => void;
  onUserEdit?: (user: User) => void;
  onUserDelete?: (userId: number) => void;
  showActions?: boolean;
  className?: string;
}

export const UsersList: React.FC<UsersListProps> = ({
  onUserSelect,
  onUserEdit,
  onUserDelete,
  showActions = true,
  className = ''
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAdmin, setFilterAdmin] = useState<'all' | 'admin' | 'user'>('all');
  const [reputationRange, setReputationRange] = useState<{ min: number; max: number }>({ min: 0, max: 1 });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
              const response = await fetch('http://protogen.local:8080/api/users', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      
      const data = await response.json();
      setUsers(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAdminFilter = filterAdmin === 'all' || 
                              (filterAdmin === 'admin' && user.is_admin) ||
                              (filterAdmin === 'user' && !user.is_admin);
    
    const matchesReputation = user.reputation >= reputationRange.min && 
                             user.reputation <= reputationRange.max;
    
    return matchesSearch && matchesAdminFilter && matchesReputation;
  });

  const getReputationColor = (reputation: number) => {
    if (reputation >= 0.7) return 'text-green-600';
    if (reputation >= 0.4) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getReputationLabel = (reputation: number) => {
    if (reputation >= 0.7) return 'High';
    if (reputation >= 0.4) return 'Medium';
    return 'Low';
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center py-12 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="text-red-500 mb-4">
          <User className="h-12 w-12 mx-auto mb-2" />
          <p className="text-lg font-semibold">Error Loading Users</p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
        <button
          onClick={fetchUsers}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">User Management</h2>
          <p className="text-muted-foreground">
            Manage user accounts, reputation, and permissions
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-primary">{filteredUsers.length}</p>
          <p className="text-sm text-muted-foreground">Total Users</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-lg p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Admin Filter */}
          <select
            value={filterAdmin}
            onChange={(e) => setFilterAdmin(e.target.value as 'all' | 'admin' | 'user')}
            className="px-4 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Users</option>
            <option value="admin">Admins Only</option>
            <option value="user">Regular Users</option>
          </select>
        </div>

        {/* Reputation Range */}
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium">Reputation Range:</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={reputationRange.min}
            onChange={(e) => setReputationRange(prev => ({ ...prev, min: parseFloat(e.target.value) }))}
            className="flex-1"
          />
          <span className="text-sm text-muted-foreground">
            {reputationRange.min.toFixed(1)} - {reputationRange.max.toFixed(1)}
          </span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={reputationRange.max}
            onChange={(e) => setReputationRange(prev => ({ ...prev, max: parseFloat(e.target.value) }))}
            className="flex-1"
          />
        </div>
      </div>

      {/* Users List */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Reputation
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Joined
                </th>
                {showActions && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-muted/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-medium">{user.name}</p>
                          {user.is_admin && (
                            <Shield className="h-4 w-4 text-primary" />
                          )}
                        </div>
                        <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          <span>{user.email}</span>
                        </div>
                        {user.oauth_providers && user.oauth_providers.length > 0 && (
                          <div className="flex items-center space-x-1 mt-1">
                            {user.oauth_providers.map((provider, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary"
                              >
                                {provider.provider}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <Star className={`h-4 w-4 ${getReputationColor(user.reputation)}`} />
                      <div>
                        <p className={`text-sm font-medium ${getReputationColor(user.reputation)}`}>
                          {user.reputation.toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {getReputationLabel(user.reputation)}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.is_admin 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {user.is_admin ? 'Admin' : 'User'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  {showActions && (
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {onUserSelect && (
                          <button
                            onClick={() => onUserSelect(user)}
                            className="p-1 text-muted-foreground hover:text-foreground"
                            title="View User"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        )}
                        {onUserEdit && (
                          <button
                            onClick={() => onUserEdit(user)}
                            className="p-1 text-muted-foreground hover:text-foreground"
                            title="Edit User"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        )}
                        {onUserDelete && !user.is_admin && (
                          <button
                            onClick={() => onUserDelete(user.id)}
                            className="p-1 text-muted-foreground hover:text-red-600"
                            title="Delete User"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Users Found</h3>
            <p className="text-muted-foreground">
              {searchTerm || filterAdmin !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'No users have been created yet'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
