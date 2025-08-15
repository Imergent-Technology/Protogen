
import { Settings, Users, BarChart3, Layers, Plus } from 'lucide-react';
import { Button } from '@progress/shared';

interface AdminStageProps {
  onNavigateToStages?: () => void;
  onNavigateToUsers?: () => void;
  onNavigateToAnalytics?: () => void;
  onCreateStage?: () => void;
}

export function AdminStage({
  onNavigateToStages,
  onNavigateToUsers,
  onNavigateToAnalytics,
  onCreateStage
}: AdminStageProps) {
  return (
    <div className="fixed inset-0 bg-background flex flex-col">
      {/* Top Toolbar */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">⚙️</span>
            <div>
              <h1 className="text-lg font-semibold">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">System administration and management</p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onCreateStage}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Stage
          </Button>
        </div>
      </div>

      {/* Admin Content */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full flex items-center justify-center p-8">
          <div className="text-center max-w-4xl">
            {/* Welcome Message */}
            <div className="mb-12">
              <h1 className="text-5xl font-light text-foreground mb-6">
                Welcome to Progress Admin
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Manage your stages, users, and system settings from this central dashboard.
              </p>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
              <div className="p-6 border border-border rounded-lg hover:border-primary/50 transition-colors">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Layers className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-medium">Stage Management</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  Create, edit, and organize your stages. Manage content and publishing status.
                </p>
                <Button
                  variant="outline"
                  onClick={onNavigateToStages}
                  className="w-full"
                >
                  Manage Stages
                </Button>
              </div>

              <div className="p-6 border border-border rounded-lg hover:border-primary/50 transition-colors">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-medium">User Management</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  View and manage user accounts, permissions, and access controls.
                </p>
                <Button
                  variant="outline"
                  onClick={onNavigateToUsers}
                  className="w-full"
                >
                  Manage Users
                </Button>
              </div>

              <div className="p-6 border border-border rounded-lg hover:border-primary/50 transition-colors">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <BarChart3 className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-medium">Analytics</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  View usage statistics, stage performance, and user engagement metrics.
                </p>
                <Button
                  variant="outline"
                  onClick={onNavigateToAnalytics}
                  className="w-full"
                >
                  View Analytics
                </Button>
              </div>

              <div className="p-6 border border-border rounded-lg hover:border-primary/50 transition-colors">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Settings className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-medium">System Settings</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  Configure system-wide settings, themes, and application preferences.
                </p>
                <Button
                  variant="outline"
                  className="w-full"
                  disabled
                >
                  Coming Soon
                </Button>
              </div>

              <div className="p-6 border border-border rounded-lg hover:border-primary/50 transition-colors">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <span className="text-2xl">🔗</span>
                  </div>
                  <h3 className="text-lg font-medium">Graph Explorer</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  Explore and manage the underlying graph data model and relationships.
                </p>
                <Button
                  variant="outline"
                  className="w-full"
                  disabled
                >
                  Coming Soon
                </Button>
              </div>

              <div className="p-6 border border-border rounded-lg hover:border-primary/50 transition-colors">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <span className="text-2xl">📊</span>
                  </div>
                  <h3 className="text-lg font-medium">Data Dashboard</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  Create and manage data visualizations and dashboard components.
                </p>
                <Button
                  variant="outline"
                  className="w-full"
                  disabled
                >
                  Coming Soon
                </Button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="mt-12 p-6 border border-border rounded-lg bg-muted/30">
              <h3 className="text-lg font-medium mb-4">Quick Stats</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">0</div>
                  <div className="text-sm text-muted-foreground">Active Stages</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">0</div>
                  <div className="text-sm text-muted-foreground">Total Users</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">0</div>
                  <div className="text-sm text-muted-foreground">Published</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">0</div>
                  <div className="text-sm text-muted-foreground">Drafts</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
