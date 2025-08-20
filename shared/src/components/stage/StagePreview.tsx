import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui-primitives/card';
import { Badge } from '../ui-primitives/badge';
import { Button } from '../ui-primitives/button';
import { 
  FileText, 
  Network, 
  Table, 
  Puzzle,
  Share,
  BarChart3,
  Settings
} from 'lucide-react';
import { Stage, StageType } from '../../types/stage';

interface StagePreviewProps {
  stage: Stage;
  mode?: 'view' | 'admin';
  onEdit?: () => void;
  onShare?: () => void;
  onViewAnalytics?: () => void;
  className?: string;
}

export const StagePreview: React.FC<StagePreviewProps> = ({
  stage,
  mode = 'view',
  onEdit,
  onShare,
  onViewAnalytics,
  className = ''
}) => {
  const getStageTypeIcon = (type: StageType) => {
    switch (type) {
      case 'basic':
        return <FileText className="h-5 w-5" />;
      case 'graph':
        return <Network className="h-5 w-5" />;
      case 'document':
        return <FileText className="h-5 w-5" />;
      case 'table':
        return <Table className="h-5 w-5" />;
      case 'custom':
        return <Puzzle className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const getStageTypeColor = (type: StageType) => {
    switch (type) {
      case 'basic':
        return 'bg-blue-500';
      case 'graph':
        return 'bg-green-500';
      case 'document':
        return 'bg-purple-500';
      case 'table':
        return 'bg-orange-500';
      case 'custom':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const renderStageContent = () => {
    switch (stage.type) {
      case 'basic':
        return renderBasicStageContent();
      case 'graph':
        return renderGraphStageContent();
      case 'document':
        return renderDocumentStageContent();
      case 'table':
        return renderTableStageContent();
      case 'custom':
        return renderCustomStageContent();
      default:
        return <div>Unknown stage type</div>;
    }
  };

  const renderBasicStageContent = () => (
    <div className="space-y-4">
      {stage.config?.title && (
        <h3 className="text-lg font-semibold">{stage.config.title}</h3>
      )}
      
      {stage.config?.content && (
        <div className="prose prose-sm max-w-none">
          <p className="text-muted-foreground whitespace-pre-wrap">
            {stage.config.content}
          </p>
        </div>
      )}

      {!stage.config?.title && !stage.config?.content && (
        <div className="text-center py-8 text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>No content configured yet</p>
          {mode === 'admin' && (
            <p className="text-sm">Click edit to add content</p>
          )}
        </div>
      )}
    </div>
  );

  const renderGraphStageContent = () => (
    <div className="space-y-4">
      <div className="text-center py-12 text-muted-foreground border-2 border-dashed border-border rounded-lg">
        <Network className="h-16 w-16 mx-auto mb-4 opacity-50" />
        <h4 className="font-medium mb-2">Interactive Graph Visualization</h4>
        <p className="text-sm">
          Graph nodes and edges will be displayed here using Sigma.js
        </p>
        {stage.config?.layout && (
          <Badge variant="outline" className="mt-2">
            Layout: {stage.config.layout}
          </Badge>
        )}
      </div>
      
      {stage.config?.showAnalytics && (
        <div className="bg-muted/50 p-3 rounded-md">
          <div className="flex items-center space-x-2 text-sm">
            <BarChart3 className="h-4 w-4" />
            <span>Graph analytics enabled</span>
          </div>
        </div>
      )}
    </div>
  );

  const renderDocumentStageContent = () => (
    <div className="space-y-4">
      <div className="text-center py-12 text-muted-foreground border-2 border-dashed border-border rounded-lg">
        <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
        <h4 className="font-medium mb-2">Collaborative Document</h4>
        <p className="text-sm">
          Rich text editor with real-time collaboration will appear here
        </p>
      </div>
      
      <div className="flex space-x-4 text-sm">
        {stage.config?.allowCollaboration && (
          <div className="flex items-center space-x-1 text-green-600">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Collaboration enabled</span>
          </div>
        )}
        {stage.config?.trackVersions && (
          <div className="flex items-center space-x-1 text-blue-600">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>Version tracking enabled</span>
          </div>
        )}
      </div>
    </div>
  );

  const renderTableStageContent = () => (
    <div className="space-y-4">
      <div className="text-center py-12 text-muted-foreground border-2 border-dashed border-border rounded-lg">
        <Table className="h-16 w-16 mx-auto mb-4 opacity-50" />
        <h4 className="font-medium mb-2">Data Table Interface</h4>
        <p className="text-sm">
          Spreadsheet-like data grid with import/export capabilities
        </p>
      </div>
      
      <div className="flex space-x-4 text-sm">
        {stage.config?.allowEditing && (
          <div className="flex items-center space-x-1 text-green-600">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Editing enabled</span>
          </div>
        )}
        {stage.config?.showCharts && (
          <div className="flex items-center space-x-1 text-blue-600">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>Chart builder available</span>
          </div>
        )}
      </div>
    </div>
  );

  const renderCustomStageContent = () => (
    <div className="space-y-4">
      <div className="text-center py-12 text-muted-foreground border-2 border-dashed border-border rounded-lg">
        <Puzzle className="h-16 w-16 mx-auto mb-4 opacity-50" />
        <h4 className="font-medium mb-2">Custom Plugin Stage</h4>
        <p className="text-sm">
          Custom functionality provided by plugins
        </p>
        {stage.config?.pluginId && (
          <Badge variant="outline" className="mt-2">
            Plugin: {stage.config.pluginId}
          </Badge>
        )}
      </div>
    </div>
  );

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded ${getStageTypeColor(stage.type)} text-white`}>
              {getStageTypeIcon(stage.type)}
            </div>
            <div>
              <CardTitle className="text-lg">{stage.name}</CardTitle>
              {stage.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {stage.description}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge 
              variant={stage.is_active ? "default" : "secondary"}
              className="text-xs"
            >
              {stage.is_active ? 'Active' : 'Inactive'}
            </Badge>
            
            <Badge variant="outline" className="text-xs capitalize">
              {stage.type}
            </Badge>
          </div>
        </div>

        {/* Action Buttons */}
        {mode === 'admin' && (
          <div className="flex items-center space-x-2 pt-2">
            {onEdit && (
              <Button variant="outline" size="sm" onClick={onEdit}>
                <Settings className="h-4 w-4 mr-1" />
                Edit
              </Button>
            )}
            {onShare && (
              <Button variant="outline" size="sm" onClick={onShare}>
                <Share className="h-4 w-4 mr-1" />
                Share
              </Button>
            )}
            {onViewAnalytics && (
              <Button variant="outline" size="sm" onClick={onViewAnalytics}>
                <BarChart3 className="h-4 w-4 mr-1" />
                Analytics
              </Button>
            )}
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        {renderStageContent()}
        
        {/* Stage Metadata */}
        {stage.metadata && Object.keys(stage.metadata).length > 0 && (
          <div className="mt-6 pt-4 border-t border-border">
            <h4 className="text-sm font-medium mb-2">Metadata</h4>
            <div className="text-xs text-muted-foreground space-y-1">
              {Object.entries(stage.metadata).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="capitalize">{key}:</span>
                  <span>{String(value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stage Info */}
        <div className="mt-4 pt-4 border-t border-border text-xs text-muted-foreground">
          <div className="flex justify-between items-center">
            <span>Sort Order: {stage.sort_order}</span>
            {stage.created_at && (
              <span>
                Created: {new Date(stage.created_at).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
