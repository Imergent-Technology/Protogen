import React, { useCallback } from 'react';
import { Card } from '@progress/shared';
import { SceneType } from '../../../stores/deckStore';
import GraphSceneAuthoring from '../../authoring/GraphSceneAuthoring';
import CardSceneAuthoring from '../../authoring/CardSceneAuthoring';
import DocumentSceneAuthoring from '../../authoring/DocumentSceneAuthoring';

export interface DesignStepProps {
  data: {
    type: SceneType;
    designData?: any;
  };
  onDataChange: (data: any) => void;
  errors: string[];
  isValidating?: boolean;
}

const DesignStep: React.FC<DesignStepProps> = ({
  data,
  onDataChange,
  errors,
  isValidating
}) => {
  // Handle design data changes
  const handleDesignChange = useCallback((designData: any) => {
    onDataChange({ ...data, designData });
  }, [data, onDataChange]);

  // Handle save (from authoring components)
  const handleSave = useCallback((designData: any) => {
    console.log('DesignStep handleSave called with:', designData);
    console.log('DesignStep current data:', data);
    const updatedData = { 
      ...data, 
      designData,
      type: data.type // Ensure type is preserved
    };
    console.log('DesignStep updated data:', updatedData);
    onDataChange(updatedData);
  }, [data, onDataChange]);

  // Handle preview (from authoring components)
  const handlePreview = useCallback((designData: any) => {
    // Could open preview modal or navigate to preview
    console.log('Preview design:', designData);
  }, []);

  // Handle cancel (from authoring components)
  const handleCancel = useCallback(() => {
    // Could navigate back or show confirmation
    console.log('Cancel design');
  }, []);

  // Render appropriate authoring component based on scene type
  const renderAuthoringComponent = () => {
    // console.log('DesignStep renderAuthoringComponent - data.type:', data.type);
    const commonProps = {
      onSave: handleSave,
      onPreview: handlePreview,
      onCancel: handleCancel
    };

    switch (data.type) {
      case 'graph':
        return (
          <GraphSceneAuthoring
            {...commonProps}
            scene={data.designData}
            availableNodes={[]} // TODO: Get from store or props
          />
        );
      
      case 'card':
        return (
          <CardSceneAuthoring
            {...commonProps}
            scene={data.designData}
            availableNodes={[]}
          />
        );
      
      case 'document':
        return (
          <DocumentSceneAuthoring
            {...commonProps}
            scene={data.designData}
            availableNodes={[]} // TODO: Get from store or props
          />
        );
      
      case 'dashboard':
        return (
          <Card className="p-8 text-center">
            <div className="text-4xl mb-4">📈</div>
            <h3 className="text-lg font-semibold mb-2">Dashboard Scene</h3>
            <p className="text-muted-foreground mb-4">
              Dashboard scene authoring is coming soon. For now, you can create a basic dashboard scene.
            </p>
            <div className="space-y-4">
              <div className="p-4 border border-border rounded-lg">
                <h4 className="font-medium mb-2">Basic Dashboard Configuration</h4>
                <p className="text-sm text-muted-foreground">
                  Configure your dashboard layout, widgets, and data sources.
                </p>
              </div>
            </div>
          </Card>
        );
      
      default:
        return (
          <Card className="p-8 text-center">
            <div className="text-4xl mb-4">❓</div>
            <h3 className="text-lg font-semibold mb-2">Unknown Scene Type</h3>
            <p className="text-muted-foreground">
              The selected scene type "{data.type}" is not supported yet.
            </p>
          </Card>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Scene Type Info */}
      <Card className="p-4">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">
            {data.type === 'graph' ? '📊' :
             data.type === 'card' ? '🃏' :
             data.type === 'document' ? '📄' :
             data.type === 'dashboard' ? '📈' : '❓'}
          </div>
          <div>
            <h3 className="font-semibold">
              {data.type === 'graph' ? 'Graph Scene Design' :
               data.type === 'card' ? 'Card Scene Design' :
               data.type === 'document' ? 'Document Scene Design' :
               data.type === 'dashboard' ? 'Dashboard Scene Design' : 'Unknown Scene Type'}
            </h3>
            <p className="text-sm text-muted-foreground">
              Configure the design and content for your {data.type} scene
            </p>
          </div>
        </div>
      </Card>

      {/* Design Errors */}
      {errors.length > 0 && (
        <Card className="p-4 border-destructive/20 bg-destructive/5">
          <h4 className="font-medium text-destructive mb-2">Design Issues</h4>
          <ul className="text-sm text-destructive space-y-1">
            {errors.map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </Card>
      )}

      {/* Authoring Component */}
      <div className="min-h-[400px]">
        {renderAuthoringComponent()}
      </div>
    </div>
  );
};

export default DesignStep;
