/**
 * WizardStepHeader - Header for wizard step (title, description, guidance)
 */

import React from 'react';
import { WizardStepGuidance } from '../types';

export interface WizardStepHeaderProps {
  title: string;
  description?: string;
  guidance?: WizardStepGuidance;
}

export const WizardStepHeader: React.FC<WizardStepHeaderProps> = ({
  title,
  description,
  guidance
}) => {
  return (
    <div className="mb-6">
      <h2 className="text-2xl font-bold mb-2">{title}</h2>
      {description && (
        <p className="text-muted-foreground mb-2">{description}</p>
      )}
      {guidance?.helpText && (
        <div className="mt-3 p-3 bg-primary/5 border border-primary/20 rounded-md">
          <p className="text-sm text-primary/90">{guidance.helpText}</p>
        </div>
      )}
      {guidance?.examples && guidance.examples.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-medium text-muted-foreground mb-1">Examples:</p>
          <ul className="list-disc list-inside space-y-1">
            {guidance.examples.map((example, index) => (
              <li key={index} className="text-xs text-muted-foreground">
                {example}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

