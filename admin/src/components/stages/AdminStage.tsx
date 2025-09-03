
import { Settings, Users, BarChart3, Layers, Network } from 'lucide-react';
import { Button } from '@progress/shared';
import { AnimatePresence, motion } from 'framer-motion';
import { StageNavigation } from '../layout/StageNavigation';
import { AdminToolbar } from '../layout/AdminToolbar';
import { Stage } from '@progress/shared';

interface AdminStageProps {
  onNavigateToDashboard?: () => void;
  onNavigateToStages?: () => void;
  onNavigateToUsers?: () => void;
  onNavigateToAnalytics?: () => void;
  onNavigateToGraphStudio?: () => void;
  onCreateStage?: () => void;
  stages?: Stage[];
  currentStage?: Stage | null;
  onStageSelect?: (stage: Stage) => void;
  onNavigationSection?: (section: string) => void;
  adminUser?: any;
  onLogout?: () => void;
  isNavigationOpen?: boolean;
  onToggleNavigation?: () => void;
}

export function AdminStage({
  onNavigateToDashboard,
  onNavigateToStages,
  onNavigateToUsers,
  onNavigateToAnalytics,
  onNavigateToGraphStudio,

  stages = [],
  currentStage,
  onStageSelect,
  onNavigationSection,
  adminUser,
  onLogout,
  isNavigationOpen = true,
  onToggleNavigation
}: AdminStageProps) {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Navigation Sidebar */}
      <AnimatePresence>
        {isNavigationOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0.0, 0.2, 1] }}
            className="h-screen overflow-hidden"
          >
            <StageNavigation
              stages={stages}
              onStageSelect={onStageSelect || (() => {})}
              onNavigateToSection={onNavigationSection || (() => {})}
              currentStage={currentStage}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Universal Admin Toolbar */}
        <AdminToolbar
          currentView="dashboard"
          viewSubtitle="System administration and management"
          onToggleNavigation={onToggleNavigation || (() => {})}
          onNavigateToDashboard={onNavigateToDashboard || (() => {})}
          onNavigateToStages={onNavigateToStages || (() => {})}
          onNavigateToDecks={() => {}}
          onNavigateToUsers={onNavigateToUsers || (() => {})}
          onNavigateToAnalytics={onNavigateToAnalytics || (() => {})}
          onNavigateToGraphStudio={onNavigateToGraphStudio || (() => {})}
          adminUser={adminUser}
          onLogout={onLogout}
        />

        {/* Dashboard Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-8">
            <div className="max-w-6xl mx-auto">
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
                      <Network className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-medium">Graph Studio</h3>
                  </div>
                  <p className="text-muted-foreground mb-4">
                    Design, build, and explore the entire graph structure with visual tools.
                  </p>
                  <Button
                    variant="outline"
                    onClick={onNavigateToGraphStudio}
                    className="w-full"
                  >
                    Open Graph Studio
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
                    <div className="text-2xl font-bold text-primary">{stages.filter(s => s.is_active).length}</div>
                    <div className="text-sm text-muted-foreground">Active Stages</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">0</div>
                    <div className="text-sm text-muted-foreground">Total Users</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{stages.filter(s => s.is_active).length}</div>
                    <div className="text-sm text-muted-foreground">Published</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{stages.filter(s => !s.is_active).length}</div>
                    <div className="text-sm text-muted-foreground">Drafts</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
