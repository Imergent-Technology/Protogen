import React, { useState, useEffect } from 'react';
import WorkflowWizard from '../WorkflowWizard';
import DeckDetailsStep from './DeckDetailsStep';
import { DeckCardData } from '../../decks/DeckCard';

export interface DeckWorkflowData {
  basicDetails: {
    name: string;
    slug: string;
    description: string;
    type: string;
    keepWarm: boolean;
    preloadStrategy: string;
  };
}

export interface DeckWorkflowProps {
  mode: 'create' | 'edit';
  initialData?: Partial<DeckWorkflowData>;
  onComplete: (data: DeckWorkflowData) => void;
  onCancel: () => void;
}

const DeckWorkflow: React.FC<DeckWorkflowProps> = ({
  mode,
  initialData,
  onComplete,
  onCancel
}) => {
  const [workflowData, setWorkflowData] = useState<DeckWorkflowData>({
    basicDetails: {
      name: '',
      slug: '',
      description: '',
      type: 'graph',
      keepWarm: true,
      preloadStrategy: 'proximity',
      ...initialData?.basicDetails
    }
  });

  // Load deck data when in edit mode
  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setWorkflowData(prev => ({
        ...prev,
        basicDetails: {
          ...prev.basicDetails,
          ...initialData.basicDetails
        }
      }));
    }
  }, [mode, initialData]);

  const handleComplete = (data: DeckWorkflowData) => {
    onComplete(data);
  };

  const steps = [
    {
      id: 'basicDetails',
      title: 'Basic Details',
      description: 'Configure deck name, description, and settings',
      component: DeckDetailsStep
    }
  ];

  return (
    <div className="deck-workflow">
      <WorkflowWizard
        steps={steps}
        initialData={workflowData}
        onComplete={handleComplete}
        onCancel={onCancel}
        title={mode === 'create' ? 'Create New Deck' : 'Edit Deck'}
        description={mode === 'create' 
          ? 'Set up a new deck to organize your scenes'
          : 'Update deck settings and configuration'
        }
      />
    </div>
  );
};

export default DeckWorkflow;
