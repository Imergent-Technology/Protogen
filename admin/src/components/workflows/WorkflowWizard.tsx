import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Save, X, AlertCircle } from 'lucide-react';
import { Button } from '@protogen/shared';

export interface WorkflowStep {
  id: string;
  title: string;
  description?: string;
  component: React.ComponentType<any>;
  props?: Record<string, any>;
  validation?: (data: any) => { isValid: boolean; errors: string[] };
  onNext?: (data: any) => void;
  onBack?: (data: any) => void;
  onSave?: (data: any) => void;
}

export interface WorkflowWizardProps {
  steps: WorkflowStep[];
  initialData?: Record<string, any>;
  data?: Record<string, any>; // External data that can update the workflow state
  startStep?: number; // Which step to start on (0-based index)
  onComplete?: (data: Record<string, any>) => void;
  onCancel?: () => void;
  onDataUpdate?: (data: Record<string, any>) => void; // Callback when workflow data is updated
  showProgress?: boolean;
  allowSave?: boolean;
  className?: string;
}

const WorkflowWizard: React.FC<WorkflowWizardProps> = ({
  steps,
  initialData = {},
  data,
  startStep = 0,
  onComplete,
  onCancel,
  onDataUpdate,
  showProgress = true,
  allowSave = true,
  className = ''
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(startStep);
  const [workflowData, setWorkflowData] = useState<Record<string, any>>(initialData);
  const [stepErrors, setStepErrors] = useState<Record<string, string[]>>({});
  const [isValidating, setIsValidating] = useState(false);

  // Update workflow data when external data changes
  useEffect(() => {
    if (data) {
      setWorkflowData(prev => ({ ...prev, ...data }));
    }
  }, [data]);

  const currentStep = steps[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  // Update workflow data
  const updateWorkflowData = (stepId: string, data: any) => {
    setWorkflowData(prev => {
      const newData = {
        ...prev,
        [stepId]: data
      };
      
      // Call onDataUpdate callback to notify parent component
      if (onDataUpdate) {
        onDataUpdate(newData);
      }
      
      return newData;
    });
  };

  // Validate current step
  const validateCurrentStep = async (): Promise<boolean> => {
    if (!currentStep.validation) return true;

    setIsValidating(true);
    try {
      const result = currentStep.validation(workflowData[currentStep.id] || {});
      
      if (result.isValid) {
        setStepErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[currentStep.id];
          return newErrors;
        });
        return true;
      } else {
        setStepErrors(prev => ({
          ...prev,
          [currentStep.id]: result.errors
        }));
        return false;
      }
    } finally {
      setIsValidating(false);
    }
  };

  // Handle next step
  const handleNext = async () => {
    const isValid = await validateCurrentStep();
    if (!isValid) return;

    // Get current step's data
    const currentStepData = workflowData[currentStep.id] || {};

    // Call step's onNext handler
    if (currentStep.onNext) {
      currentStep.onNext(currentStepData);
    }

    if (isLastStep) {
      // Complete workflow
      console.log('=== WORKFLOW COMPLETION ===');
      console.log('WorkflowWizard workflowData at completion:', workflowData);
      console.log('WorkflowWizard design data:', workflowData.design);
      if (onComplete) {
        onComplete(workflowData);
      }
    } else {
      // Move to next step
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  // Handle back step
  const handleBack = () => {
    // Call step's onBack handler
    if (currentStep.onBack) {
      currentStep.onBack(workflowData[currentStep.id] || {});
    }

    if (!isFirstStep) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  // Handle save (for draft functionality)
  const handleSave = async () => {
    const isValid = await validateCurrentStep();
    if (!isValid) return;

    // Call step's onSave handler
    if (currentStep.onSave) {
      currentStep.onSave(workflowData[currentStep.id] || {});
    }

    // Could emit save event or call parent save handler
    console.log('Saving workflow data:', workflowData);
  };

  // Handle cancel
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  // Render current step component
  const renderCurrentStep = () => {
    const StepComponent = currentStep.component;
    let stepData = workflowData[currentStep.id] || {};
    
    // Special handling for DesignStep to ensure it gets the correct type and designData
    if (currentStep.id === 'design') {
      stepData = {
        type: workflowData.basicDetails?.type || 'graph',
        designData: workflowData.design?.designData || undefined
      };
    }
    
    const stepProps = {
      ...currentStep.props,
      data: stepData,
      onDataChange: (data: any) => updateWorkflowData(currentStep.id, data),
      errors: stepErrors[currentStep.id] || [],
      isValidating
    };

    return <StepComponent {...stepProps} />;
  };

  return (
    <div className={`workflow-wizard ${className}`}>
      {/* Progress Bar */}
      {showProgress && steps.length > 1 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">
              Step {currentStepIndex + 1} of {steps.length}
            </span>
            <span className="text-sm text-muted-foreground">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Step Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">{currentStep.title}</h2>
        {currentStep.description && (
          <p className="text-muted-foreground">{currentStep.description}</p>
        )}
      </div>

      {/* Step Errors */}
      {stepErrors[currentStep.id] && stepErrors[currentStep.id].length > 0 && (
        <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <div className="flex items-start space-x-2">
            <AlertCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-destructive mb-1">Please fix the following errors:</h4>
              <ul className="text-sm text-destructive space-y-1">
                {stepErrors[currentStep.id].map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Step Content */}
      <div className="mb-8">
        {renderCurrentStep()}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-6 border-t border-border">
        <div className="flex items-center space-x-3">
          {!isFirstStep && (
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={isValidating}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          )}
        </div>

        <div className="flex items-center space-x-3">
          {onCancel && (
            <Button
              variant="ghost"
              onClick={handleCancel}
              disabled={isValidating}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          )}
          
          {allowSave && (
            <Button
              variant="outline"
              onClick={isLastStep ? handleNext : handleSave}
              disabled={isValidating}
            >
              <Save className="h-4 w-4 mr-2" />
              Save & Close
            </Button>
          )}

          {!isLastStep && (
            <Button
              onClick={handleNext}
              disabled={isValidating}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkflowWizard;
