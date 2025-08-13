import React from 'react';
import { useStages, EnhancedStageForm } from '@progress/shared';
import { Stage } from '@progress/shared';

interface StageFormProps {
  stage?: Stage | null;
  onSave?: (stage: Stage) => void;
  onCancel?: () => void;
  isOpen: boolean;
}

export function StageForm({ stage, onSave, onCancel, isOpen }: StageFormProps) {
  const { createStage, updateStage, loading } = useStages();

  const handleSave = async (stageData: Partial<Stage>) => {
    try {
      if (stage?.id) {
        // Update existing stage
        const updatedStage = await updateStage(stage.id, stageData);
        onSave?.(updatedStage);
      } else {
        // Create new stage - ensure required fields are present
        if (!stageData.name) {
          throw new Error('Stage name is required');
        }
        const newStage = await createStage(stageData as any);
        onSave?.(newStage);
      }
    } catch (error) {
      console.error('Failed to save stage:', error);
    }
  };

  const handlePreview = (stageData: Partial<Stage>) => {
    // TODO: Implement preview functionality
    console.log('Preview stage:', stageData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background border border-border rounded-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <EnhancedStageForm
          stage={stage}
          onSave={handleSave}
          onCancel={onCancel || (() => {})}
          onPreview={handlePreview}
          isLoading={loading}
        />
      </div>
    </div>
  );
} 