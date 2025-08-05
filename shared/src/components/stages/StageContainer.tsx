import React from 'react';
import { Stage, StageType } from '../../types/stage';
import { BasicStage } from './BasicStage';

interface StageContainerProps {
  stage: Stage;
  isFallback?: boolean;
  isAdmin?: boolean;
  onStageUpdate?: (stage: Stage) => void;
  onStageDelete?: (stageId: number) => void;
  children?: React.ReactNode;
}

export function StageContainer({
  stage,
  isFallback = false,
  isAdmin = false,
  onStageUpdate,
  onStageDelete,
  children
}: StageContainerProps) {
  const renderStage = () => {
    switch (stage.type) {
      case 'basic':
        return (
          <BasicStage
            stage={stage}
            isFallback={isFallback}
            isAdmin={isAdmin}
          >
            {children}
          </BasicStage>
        );
      
      case 'graph':
        // TODO: Implement GraphStage
        return (
          <div className="stage-graph">
            <p>Graph stage coming soon...</p>
            {isAdmin && children}
          </div>
        );
      
      case 'document':
        // TODO: Implement DocumentStage
        return (
          <div className="stage-document">
            <p>Document stage coming soon...</p>
            {isAdmin && children}
          </div>
        );
      
      default:
        return (
          <div className="stage-unknown">
            <p>Unknown stage type: {stage.type}</p>
            {isAdmin && children}
          </div>
        );
    }
  };

  return (
    <div className="stage-container">
      {renderStage()}
    </div>
  );
} 