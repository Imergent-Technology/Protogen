import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SceneType, useDeckStore } from '../../../stores/deckStore';
import WorkflowWizard, { WorkflowStep } from '../WorkflowWizard';
import BasicDetailsStep, { BasicDetailsData } from './BasicDetailsStep';
import DesignStep from './DesignStep';

export interface SceneWorkflowData {
  basicDetails: BasicDetailsData;
  design: {
    type: SceneType;
    designData?: any;
  };
}

export interface SceneWorkflowProps {
  initialData?: Partial<SceneWorkflowData>;
  sceneId?: string; // For editing existing scenes
  mode?: 'create' | 'edit';
  startStep?: number; // Which step to start on (0 = Basic Details, 1 = Design)
  onComplete?: (data: SceneWorkflowData) => void;
  onCancel?: () => void;
  availableDecks?: Array<{ id: string; name: string; type: string }>;
}

const SceneWorkflow: React.FC<SceneWorkflowProps> = ({
  initialData = {},
  sceneId,
  mode = 'create',
  startStep = 0,
  onComplete,
  onCancel,
  availableDecks = []
}) => {
  const navigate = useNavigate();
  const { loadSceneContent } = useDeckStore();
  const [workflowData, setWorkflowData] = useState<SceneWorkflowData>({
    basicDetails: {
      name: '',
      slug: '',
      description: '',
      type: 'graph',
      deckIds: []
    },
    design: {
      type: 'graph',
      designData: undefined
    },
    ...initialData
  });

  // Load scene data when in edit mode
  useEffect(() => {
    if (mode === 'edit' && sceneId) {
      console.log('=== SCENE WORKFLOW EDIT MODE ===');
      console.log('sceneId:', sceneId);
      console.log('initialData:', initialData);
      
      // Load scene content for document scenes
      // Check both initialData and workflowData for the scene type
      const sceneType = initialData.basicDetails?.type || workflowData.basicDetails?.type;
      if (sceneType === 'document') {
        console.log('Loading scene content for document scene...');
        loadSceneContent(sceneId, 'document', 'main').then((content) => {
          console.log('Loaded scene content:', content);
          if (content) {
            setWorkflowData(prev => ({
              ...prev,
              design: {
                ...prev.design,
                designData: {
                  ...prev.design.designData,
                  content: {
                    ...(prev.design.designData?.content || {}),
                    html: content
                  }
                }
              }
            }));
          }
        }).catch((error) => {
          console.error('Failed to load scene content:', error);
        });
      }
    }
  }, [mode, sceneId, initialData, workflowData.basicDetails?.type, loadSceneContent]);

  // Update workflow data when external data changes (from WorkflowWizard)
  useEffect(() => {
    if (initialData) {
      setWorkflowData(prev => ({
        ...prev,
        ...initialData
      }));
    }
  }, [initialData]);

  // Validation functions
  const validateBasicDetails = (data: BasicDetailsData): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!data.name.trim()) {
      errors.push('Scene name is required');
    }

    if (!data.slug.trim()) {
      errors.push('Scene slug is required');
    } else if (!/^[a-z0-9-]+$/.test(data.slug)) {
      errors.push('Scene slug can only contain lowercase letters, numbers, and hyphens');
    }

    if (!data.type) {
      errors.push('Scene type is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  };

  const validateDesign = (data: any): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // Basic validation - could be expanded based on scene type
    if (!data.type) {
      errors.push('Scene type is required');
    }

    // Type-specific validation could be added here
    // For example, graph scenes might require at least one node
    // Card scenes might require at least one slide
    // Document scenes might require some content

    return {
      isValid: errors.length === 0,
      errors
    };
  };

  // Handle workflow completion
  const handleWorkflowComplete = (data: Record<string, any>) => {
    const completeData: SceneWorkflowData = {
      basicDetails: data.basicDetails || workflowData.basicDetails,
      design: data.design || workflowData.design
    };

    if (onComplete) {
      onComplete(completeData);
    } else {
      // Default behavior - could save to store or navigate
      console.log('Scene workflow completed:', completeData);
      
      // Navigate back to scene management
      navigate('/scenes');
    }
  };

  // Handle workflow cancellation
  const handleWorkflowCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      // Default behavior - navigate back
      navigate('/scenes');
    }
  };

  // Define workflow steps
  const steps: WorkflowStep[] = [
    {
      id: 'basicDetails',
      title: 'Basic Details',
      description: 'Set up the basic information for your scene',
      component: BasicDetailsStep,
      props: {
        availableDecks
      },
      validation: validateBasicDetails,
      onNext: (data: BasicDetailsData) => {
        setWorkflowData(prev => ({
          ...prev,
          basicDetails: data,
          design: { ...prev.design, type: data.type }
        }));
      }
    },
    {
      id: 'design',
      title: 'Design & Content',
      description: 'Configure the design and content for your scene',
      component: DesignStep,
      validation: validateDesign,
      onNext: (data: any) => {
        setWorkflowData(prev => ({
          ...prev,
          design: data
        }));
      }
    }
  ];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">
          {mode === 'create' ? 'Create New Scene' : 'Edit Scene'}
        </h1>
        <p className="text-muted-foreground">
          {mode === 'create' 
            ? 'Follow the steps below to create a new scene'
            : 'Update your scene configuration'
          }
        </p>
      </div>

      <WorkflowWizard
        steps={steps}
        initialData={{
          basicDetails: workflowData.basicDetails,
          design: workflowData.design
        }}
        data={{
          basicDetails: workflowData.basicDetails,
          design: workflowData.design
        }}
        startStep={startStep}
        onComplete={handleWorkflowComplete}
        onCancel={handleWorkflowCancel}
        onDataUpdate={(data) => {
          console.log('=== WORKFLOW DATA UPDATE ===');
          console.log('Updated workflow data:', data);
          setWorkflowData(data);
        }}
        showProgress={true}
        allowSave={true}
      />
    </div>
  );
};

export default SceneWorkflow;
