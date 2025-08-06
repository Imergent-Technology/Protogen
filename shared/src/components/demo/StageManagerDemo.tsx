import { useEffect } from 'react';
import { StageManagerProvider, useStageManager } from '../../hooks/useStageManager';
import { StageRouter, useStageNavigation } from '../routing/StageRouter';
import { Toolbar } from '../toolbar/Toolbar';
import { StageContainer } from '../stages/StageContainer';
import { useModal } from '../modals/ModalProvider';
import { useToast } from '../../hooks/use-toast';
import { FormModal } from '../modals/FormModal';
import { Button } from '../ui/button';
import { Stage } from '../../types/stage';

function StageManagerContent() {
  const { 
    stageManager, 
    currentStage, 
    navigationHistory, 
    canGoBack, 
    goBack,
    createStage,
    deleteStage 
  } = useStageManager();
  
  const { navigateToStageById } = useStageNavigation();
  const { openModal } = useModal();
  const { toast } = useToast();

  // Initialize demo stages
  useEffect(() => {
    const initializeStages = async () => {
      // Create demo stages
      await createStage({
        id: 'welcome',
        type: 'basic',
        title: 'Welcome',
        content: 'Welcome to the Stage Manager Demo! This is your starting point.',
        icon: '👋',
      });

      await createStage({
        id: 'dashboard',
        type: 'basic',
        title: 'Dashboard',
        content: 'This is the main dashboard where you can see an overview of your stages.',
        icon: '📊',
      });

      await createStage({
        id: 'graph-view',
        type: 'basic',
        title: 'Graph View',
        content: 'Visualize your stages and their relationships in an interactive graph.',
        icon: '🕸️',
      });

      await createStage({
        id: 'analytics',
        type: 'basic',
        title: 'Analytics',
        content: 'Deep dive into your stage performance and usage analytics.',
        icon: '📈',
      });

      // Navigate to welcome stage initially
      await navigateToStageById('welcome');
    };

    // Only initialize if no stages exist
    if (stageManager.getAllStages().length === 0) {
      initializeStages();
    }
  }, [stageManager, createStage, navigateToStageById]);

  const handleToolbarNavigation = async (path: string) => {
    switch (path) {
      case '/dashboard':
        await navigateToStageById('dashboard');
        break;
      case '/stages':
        await navigateToStageById('welcome');
        break;
      case '/graph':
        await navigateToStageById('graph-view');
        break;
      case '/analytics':
        await navigateToStageById('analytics');
        break;
      case '/demo/create-stage':
        openModal({
          component: FormModal,
          props: {
            title: 'Create New Stage',
            description: 'Create a new stage in the system',
            children: (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Stage Title</label>
                  <input 
                    id="stage-title"
                    type="text" 
                    className="w-full p-2 border rounded" 
                    placeholder="Enter stage title..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Content</label>
                  <textarea 
                    id="stage-content"
                    className="w-full p-2 border rounded h-24" 
                    placeholder="Enter stage content..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Icon (emoji)</label>
                  <input 
                    id="stage-icon"
                    type="text" 
                    className="w-full p-2 border rounded" 
                    placeholder="🎯"
                    maxLength={2}
                  />
                </div>
              </div>
            ),
            onSubmit: async () => {
              const titleEl = document.getElementById('stage-title') as HTMLInputElement;
              const contentEl = document.getElementById('stage-content') as HTMLTextAreaElement;
              const iconEl = document.getElementById('stage-icon') as HTMLInputElement;
              
              const title = titleEl?.value || '';
              const content = contentEl?.value || '';
              const icon = iconEl?.value || '';
              
              if (title) {
                const stageId = title.toLowerCase().replace(/\s+/g, '-');
                await createStage({
                  id: stageId,
                  type: 'basic',
                  title,
                  content: content || 'New stage content',
                  icon: icon || '📄',
                });
                
                toast({
                  title: 'Stage Created',
                  description: `Stage "${title}" has been created successfully!`,
                });
                
                await navigateToStageById(stageId);
              }
            }
          },
          options: { size: 'lg' }
        });
        break;
      case '/demo/stage-list':
        const stages = stageManager.getAllStages();
        openModal({
          component: () => (
            <div className="p-4">
              <h2 className="text-lg font-semibold mb-4">All Stages</h2>
              <div className="space-y-2">
                {stages.map((stage: Stage) => (
                  <div key={stage.id} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center gap-2">
                      <span>{stage.config.icon}</span>
                      <span className="font-medium">{stage.config.title}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          const stageId = stage.id?.toString() || stage.slug;
                          navigateToStageById(stageId);
                        }}
                      >
                        Navigate
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={async () => {
                          const stageId = stage.id?.toString() || stage.slug;
                          await deleteStage(stageId);
                          toast({
                            title: 'Stage Deleted',
                            description: `Stage "${stage.config.title || stage.name}" has been deleted.`,
                          });
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ),
          options: { size: 'lg' }
        });
        break;
      default:
        toast({
          title: 'Navigation Demo',
          description: `Would navigate to: ${path}`,
        });
        break;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Toolbar onNavigate={handleToolbarNavigation} />
      
      <div className="flex">
        {/* Sidebar with navigation info */}
        <div className="w-64 border-r border-border p-4 bg-card">
          <h3 className="font-semibold mb-4">Stage Manager Demo</h3>
          
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Current Stage</h4>
              <div className="text-sm text-muted-foreground">
                {currentStage ? (
                  <div className="flex items-center gap-2">
                    <span>{currentStage.config.icon}</span>
                    <span>{currentStage.config.title}</span>
                  </div>
                ) : (
                  'No stage selected'
                )}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2">Navigation History</h4>
              <div className="space-y-1">
                {navigationHistory.map((item, index) => (
                  <div key={index} className="text-xs text-muted-foreground">
                    {item.stage.config.icon} {item.label}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={goBack}
                disabled={!canGoBack}
                className="w-full"
              >
                ← Go Back
              </Button>
            </div>

            <div className="border-t pt-4">
              <h4 className="text-sm font-medium mb-2">Demo Actions</h4>
              <div className="space-y-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleToolbarNavigation('/demo/create-stage')}
                  className="w-full"
                >
                  Create Stage
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleToolbarNavigation('/demo/stage-list')}
                  className="w-full"
                >
                  View All Stages
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 p-8">
          {currentStage ? (
            <StageContainer 
              stage={currentStage} 
              isAdmin={true}
              onStageUpdate={() => {
                toast({
                  title: 'Stage Updated',
                  description: 'Stage has been updated successfully!',
                });
              }}
              onStageDelete={() => {
                toast({
                  title: 'Stage Deleted',
                  description: 'Stage has been deleted successfully!',
                });
              }}
            />
          ) : (
            <div className="text-center text-muted-foreground">
              <h2 className="text-2xl font-semibold mb-4">No Stage Selected</h2>
              <p>Use the hamburger menu to navigate to a stage or create a new one.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function StageManagerDemo() {
  return (
    <StageManagerProvider
      onStageChange={(stage, context) => {
        console.log('Stage changed:', stage.config.title, context);
      }}
      onNavigate={(path, stage) => {
        console.log('Navigation:', path, stage?.config.title);
      }}
      onError={(error, stage) => {
        console.error('Stage Manager Error:', error, stage?.config.title);
      }}
    >
      <StageRouter basePath="/stages">
        <StageManagerContent />
      </StageRouter>
    </StageManagerProvider>
  );
}