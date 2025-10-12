/**
 * WizardNavigation - Navigation buttons for wizard
 */

import React from 'react';
import { ChevronLeft, ChevronRight, Save, X } from 'lucide-react';
import { Button } from '../../../../components';

export interface WizardNavigationProps {
  isFirstStep: boolean;
  isLastStep: boolean;
  allowBack: boolean;
  allowSave: boolean;
  isValidating: boolean;
  isSaving: boolean;
  onNext: () => void;
  onBack: () => void;
  onSave: () => void;
  onCancel: () => void;
}

export const WizardNavigation: React.FC<WizardNavigationProps> = ({
  isFirstStep,
  isLastStep,
  allowBack,
  allowSave,
  isValidating,
  isSaving,
  onNext,
  onBack,
  onSave,
  onCancel
}) => {
  return (
    <div className="flex items-center justify-between pt-6 border-t border-border">
      {/* Left side - Back button */}
      <div>
        {!isFirstStep && allowBack && (
          <Button
            variant="outline"
            onClick={onBack}
            disabled={isValidating || isSaving}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        )}
      </div>

      {/* Right side - Save, Cancel, Next/Complete buttons */}
      <div className="flex items-center space-x-2">
        {allowSave && (
          <Button
            variant="outline"
            onClick={onSave}
            disabled={isValidating || isSaving}
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Draft'}
          </Button>
        )}
        
        <Button
          variant="ghost"
          onClick={onCancel}
          disabled={isValidating || isSaving}
        >
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>

        <Button
          onClick={onNext}
          disabled={isValidating || isSaving}
        >
          {isValidating ? 'Validating...' : (isLastStep ? 'Complete' : 'Next')}
          {!isLastStep && <ChevronRight className="h-4 w-4 ml-2" />}
        </Button>
      </div>
    </div>
  );
};

