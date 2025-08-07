import React, { useEffect } from 'react';
import { useStageManager } from '../../../shared/src/hooks/useStageManager';
import { Stage, StageType } from '../../../shared/src/types/stage';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Loader2, Plus, Eye, Edit, Trash2, ArrowLeft, ArrowRight } from 'lucide-react';
import { useToast } from './ui/use-toast';

export const StageManagerDemo: React.FC = () => {
  const { toast } = useToast();
  
  const {
    stages,
    currentStage,
    loading,
    error,
    loadStages,
    createStage,
    deleteStage,
    navigateToStage,
    goBack,
    canGoBack,
    getBreadcrumbs,
    clearError,
  } = useStageManager({
    autoLoad: true,
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    // Load stages on mount
    loadStages();
  }, []);

  const handleCreateStage = async () => {
    try {
      await createStage({
        name: `New Stage ${Date.now()}`,
        type: 'basic',
        description: 'A new stage created via the demo',
        config: {
          icon: '✨',
          title: 'New Stage',
          content: 'This is a new stage created from the demo interface.',
        },
      });
      
      toast({
        title: "Success",
        description: "Stage created successfully!",
      });
    } catch (error) {
      console.error('Failed to create stage:', error);
    }
  };

  const handleDeleteStage = async (stage: Stage) => {
    if (!stage.id) return;
    
    try {
      await deleteStage(stage.id);
      toast({
        title: "Success",
        description: "Stage deleted successfully!",
      });
    } catch (error) {
      console.error('Failed to delete stage:', error);
    }
  };

  const handleNavigateToStage = async (stage: Stage) => {
    const stageId = stage.id?.toString() || stage.slug;
    await navigateToStage(stageId);
  };

  const getStageTypeIcon = (type: StageType) => {
    const icons: Record<StageType, string> = {
      basic: '📄',
      graph: '📊',
      document: '📋',
      table: '📋',
      custom: '⚙️',
    };
    return icons[type] || '📄';
  };

  const getStageTypeColor = (type: StageType) => {
    const colors: Record<StageType, string> = {
      basic: 'bg-blue-100 text-blue-800',
      graph: 'bg-green-100 text-green-800',
      document: 'bg-purple-100 text-purple-800',
      table: 'bg-orange-100 text-orange-800',
      custom: 'bg-gray-100 text-gray-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  if (error) {
    return (
      <div className="space-y-4">
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <h3 className="text-destructive font-semibold mb-2">Error Loading Stages</h3>
          <p className="text-destructive/80 mb-4">{error.message}</p>
          <Button onClick={clearError} variant="outline" size="sm">
            Clear Error
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Stage Manager</h3>
          <p className="text-sm text-muted-foreground">
            {loading ? 'Loading stages...' : `${stages.length} stages available`}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {canGoBack() && (
            <Button onClick={goBack} variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          )}
          <Button onClick={handleCreateStage} disabled={loading}>
            {loading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Plus className="h-4 w-4 mr-2" />
            )}
            Create Stage
          </Button>
        </div>
      </div>

      {/* Breadcrumbs */}
      {getBreadcrumbs().length > 0 && (
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          {getBreadcrumbs().map((breadcrumb, index) => (
            <React.Fragment key={breadcrumb.path}>
              {index > 0 && <ArrowRight className="h-3 w-3" />}
              <button
                onClick={() => navigateToStage(breadcrumb.stage.id?.toString() || breadcrumb.stage.slug)}
                className="hover:text-foreground transition-colors"
              >
                {breadcrumb.label}
              </button>
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Current Stage Display */}
      {currentStage && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center">
              <span className="mr-2">{currentStage.config.icon || getStageTypeIcon(currentStage.type)}</span>
              Current Stage: {currentStage.name}
            </CardTitle>
            <CardDescription>{currentStage.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className={getStageTypeColor(currentStage.type)}>
                  {currentStage.type}
                </Badge>
                {currentStage.is_active ? (
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    Active
                  </Badge>
                ) : (
                  <Badge variant="secondary">Inactive</Badge>
                )}
              </div>
              {currentStage.config.content && (
                <p className="text-sm text-muted-foreground">{currentStage.config.content}</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stages Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stages.map((stage) => (
          <Card key={stage.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{stage.config.icon || getStageTypeIcon(stage.type)}</span>
                  <div>
                    <CardTitle className="text-base">{stage.name}</CardTitle>
                    <Badge variant="outline" className={`text-xs ${getStageTypeColor(stage.type)}`}>
                      {stage.type}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <Button
                    onClick={() => handleNavigateToStage(stage)}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => handleDeleteStage(stage)}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {stage.description && (
                <CardDescription className="mb-3">{stage.description}</CardDescription>
              )}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>ID: {stage.id}</span>
                <span>Order: {stage.sort_order}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {!loading && stages.length === 0 && (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">📄</div>
          <h3 className="text-lg font-semibold mb-2">No Stages Found</h3>
          <p className="text-muted-foreground mb-4">
            Create your first stage to get started with the stage manager.
          </p>
          <Button onClick={handleCreateStage}>
            <Plus className="h-4 w-4 mr-2" />
            Create First Stage
          </Button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading stages...</p>
        </div>
      )}
    </div>
  );
}; 