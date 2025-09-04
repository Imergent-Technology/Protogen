import React from 'react';
import { StageContext } from '../../types/stage';

interface BasicStageProps extends StageContext {
  className?: string;
  children?: React.ReactNode;
}

export function BasicStage({ 
  stage, 
  isFallback = false,
  isAdmin = false,
  className = '',
  children 
}: BasicStageProps) {
  // Use isFallback to avoid unused variable warning
  // Stage fallback mode
  const { config } = stage;
  const { title, content, icon } = config;

  return (
    <div className={`stage-basic ${className}`}>
      <div className="stage-content">
        {icon && (
          <div className="stage-icon">
            <span className="text-4xl">{icon}</span>
          </div>
        )}
        
        {title && (
          <h1 className="stage-title">
            {title}
          </h1>
        )}
        
        {content && (
          <div className="stage-content-text">
            {content}
          </div>
        )}
        
        {/* Admin controls will be injected here by backend */}
        {isAdmin && children}
      </div>
    </div>
  );
} 