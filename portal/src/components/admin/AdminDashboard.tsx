import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@protogen/shared';
import { Users, FileText, Building2, Activity, TrendingUp, Shield } from 'lucide-react';
import { AdminDashboardStats } from '../../types/admin';
import { apiClient } from '../../services/apiClient';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      // TODO: Create actual API endpoint for admin stats
      // const data = await apiClient.get<AdminDashboardStats>('/admin/dashboard/stats');
      // setStats(data);
      
      // Mock data for now
      setStats({
        users: {
          total: 1250,
          active_today: 342,
          new_this_week: 58,
          by_standing_level: {
            'Member': 450,
            'Contributor': 380,
            'Collaborator': 250,
            'Steward': 120,
            'Curator': 40,
            'Guardian': 10,
          }
        },
        content: {
          total_scenes: 456,
          published_scenes: 328,
          draft_scenes: 128,
          total_decks: 87,
        },
        tenants: {
          total: 12,
          active: 9,
        },
        engagement: {
          total_feedback: 3245,
          total_comments: 8934,
          average_standing: 385,
        }
      });
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">System overview and statistics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.users.total.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+{stats?.users.new_this_week}</span> this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Today</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.users.active_today.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((stats?.users.active_today || 0) / (stats?.users.total || 1) * 100)}% of total users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Scenes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.content.total_scenes.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.content.published_scenes} published, {stats?.content.draft_scenes} drafts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tenants</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.tenants.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.tenants.active} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Standing</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.engagement.average_standing}</div>
            <p className="text-xs text-muted-foreground">
              Out of 1000
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.engagement.total_comments.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Total comments
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Standing Levels Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Standing Level Distribution</CardTitle>
          <CardDescription>User distribution across standing levels</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {stats && Object.entries(stats.users.by_standing_level).map(([level, count]) => (
              <div key={level} className="flex items-center justify-between">
                <span className="text-sm font-medium">{level}</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-muted rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-primary h-full rounded-full" 
                      style={{ 
                        width: `${(count / stats.users.total) * 100}%` 
                      }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-12 text-right">
                    {count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

