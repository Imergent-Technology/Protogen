/**
 * Wizard Component - Main wizard container
 * Extracted and enhanced from admin WorkflowWizard
 */

import React, { useState, useEffect, useCallback } from 'react';
import { WizardConfig, WizardState } from '../types';
import { WizardProgress } from './WizardProgress';
import { WizardNavigation } from './WizardNavigation';
import { WizardStepHeader } from './WizardStepHeader';
import { AlertCircle } from 'lucide-react';

export interface WizardProps {
  config: WizardConfig;
  onStateChange?: (state: WizardState) => void;
}

export const Wizard: React.FC<WizardProps> = ({ config, onStateChange }) => {
  const {
    steps,
    initialData = {},
    onComplete,
    onCancel,
    options = {}
  } = config;

  const {
    showProgress = true,
    allowBack = true,
    allowSave = false,
    confirmCancel = true
  } = options;

  // Initialize state
  const [state, setState] = useState<WizardState>({
    currentStepIndex: 0,
    data: initialData,
    errors: new Map(),
    isValidating: false,
    isSaving: false,
    isComplete: false
  });

  // Notify parent of state changes
  useEffect(() => {
    if (onStateChange) {
      onStateChange(state);
    }
  }, [state, onStateChange]);

  // Get current step
  const currentStep = steps[state.currentStepIndex];
  const isFirstStep = state.currentStepIndex === 0;
  const isLastStep = state.currentStepIndex === steps.length - 1;
  const progress = ((state.currentStepIndex + 1) / steps.length) * 100;

  // Update step data
  const updateData = useCallback((stepId: string, data: any) => {
    setState(prev => ({
      ...prev,
      data: {
        ...prev.data,
        [stepId]: data
      }
    }));
  }, []);

  // Validate current step
  const validateCurrentStep = useCallback(async (): Promise<boolean> => {
    if (!currentStep.validation) return true;

    setState(prev => ({ ...prev, isValidating: true }));

    try {
      const stepData = state.data[currentStep.id] || {};
      const result = await currentStep.validation.validate(stepData, state.data);

      if (result.isValid) {
        // Clear errors for this step
        setState(prev => {
          const newErrors = new Map(prev.errors);
          newErrors.delete(currentStep.id);
          return { ...prev, errors: newErrors, isValidating: false };
        });
        return true;
      } else {
        // Set errors for this step
        setState(prev => {
          const newErrors = new Map(prev.errors);
          newErrors.set(currentStep.id, result.errors);
          return { ...prev, errors: newErrors, isValidating: false };
        });
        return false;
      }
    } catch (error) {
      console.error('Validation error:', error);
      setState(prev => {
        const newErrors = new Map(prev.errors);
        newErrors.set(currentStep.id, [{
          message: 'Validation failed due to an error',
          severity: 'error'
        }]);
        return { ...prev, errors: newErrors, isValidating: false };
      });
      return false;
    }
  }, [currentStep, state.data]);

  // Navigate to next step or complete
  const goNext = useCallback(async () => {
    const isValid = await validateCurrentStep();
    if (!isValid) return;

    // Call step's onNext handler if defined
    if (currentStep.onNext) {
      currentStep.onNext(state.data[currentStep.id] || {});
    }

    // Call step's onExit handler if defined
    if (currentStep.onExit) {
      await currentStep.onExit(state.data);
    }

    if (isLastStep) {
      // Complete wizard
      setState(prev => ({ ...prev, isComplete: true }));
      if (onComplete) {
        await onComplete(state.data);
      }
    } else {
      // Move to next step
      const nextIndex = state.currentStepIndex + 1;
      const nextStep = steps[nextIndex];

      // Call next step's onEnter handler if defined
      if (nextStep.onEnter) {
        await nextStep.onEnter(state.data);
      }

      setState(prev => ({ ...prev, currentStepIndex: nextIndex }));
    }
  }, [validateCurrentStep, currentStep, isLastStep, state.data, onComplete, steps, state.currentStepIndex]);

  // Navigate to previous step
  const goBack = useCallback(async () => {
    if (isFirstStep) return;

    // Call step's onBack handler if defined
    if (currentStep.onBack) {
      currentStep.onBack(state.data[currentStep.id] || {});
    }

    // Call step's onExit handler if defined
    if (currentStep.onExit) {
      await currentStep.onExit(state.data);
    }

    const prevIndex = state.currentStepIndex - 1;
    const prevStep = steps[prevIndex];

    // Call previous step's onEnter handler if defined
    if (prevStep.onEnter) {
      await prevStep.onEnter(state.data);
    }

    setState(prev => ({ ...prev, currentStepIndex: prevIndex }));
  }, [isFirstStep, currentStep, state.data, state.currentStepIndex, steps]);

  // Go to specific step - Currently unused in component but available for future features
  // const goToStep = useCallback((stepIndex: number) => {
  //   if (stepIndex < 0 || stepIndex >= steps.length) return;
  //   setState(prev => ({ ...prev, currentStepIndex: stepIndex }));
  // }, [steps.length]);

  // Save draft
  const save = useCallback(async () => {
    const isValid = await validateCurrentStep();
    if (!isValid) return;

    setState(prev => ({ ...prev, isSaving: true }));

    try {
      // Call step's onSave handler if defined
      if (currentStep.onSave) {
        await currentStep.onSave(state.data[currentStep.id] || {});
      }
      // TODO: Implement auto-save to backend/local storage
    } finally {
      setState(prev => ({ ...prev, isSaving: false }));
    }
  }, [validateCurrentStep, currentStep, state.data]);

  // Cancel wizard
  const cancel = useCallback(() => {
    if (confirmCancel) {
      // TODO: Show confirmation dialog
      if (window.confirm('Are you sure you want to cancel? Your progress will be lost.')) {
        if (onCancel) {
          onCancel();
        }
      }
    } else {
      if (onCancel) {
        onCancel();
      }
    }
  }, [confirmCancel, onCancel]);

  // Render current step component
  const renderStep = () => {
    const StepComponent = currentStep.component;
    const stepData = state.data[currentStep.id] || {};
    const stepErrors = state.errors.get(currentStep.id) || [];

    const stepProps = {
      ...currentStep.props,
      data: stepData,
      onDataChange: (data: any) => updateData(currentStep.id, data),
      errors: stepErrors,
      isValidating: state.isValidating
    };

    return <StepComponent {...stepProps} />;
  };

  return (
    <div className="wizard-container">
      {/* Progress Bar */}
      {showProgress && steps.length > 1 && (
        <WizardProgress
          currentStep={state.currentStepIndex + 1}
          totalSteps={steps.length}
          progress={progress}
        />
      )}

      {/* Step Header */}
      <WizardStepHeader
        title={currentStep.title}
        description={currentStep.description}
        guidance={currentStep.guidance}
      />

      {/* Step Errors */}
      {state.errors.has(currentStep.id) && (
        <div className="mb-4 p-4 border border-destructive bg-destructive/10 rounded-lg">
          <div className="flex items-start space-x-2">
            <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium text-destructive mb-2">Please fix the following errors:</h4>
              <ul className="list-disc list-inside space-y-1">
                {state.errors.get(currentStep.id)?.map((error, index) => (
                  <li key={index} className="text-sm text-destructive">
                    {error.field && <span className="font-medium">{error.field}: </span>}
                    {error.message}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Step Content */}
      <div className="wizard-step-content mb-6">
        {renderStep()}
      </div>

      {/* Navigation */}
      <WizardNavigation
        isFirstStep={isFirstStep}
        isLastStep={isLastStep}
        allowBack={allowBack}
        allowSave={allowSave}
        isValidating={state.isValidating}
        isSaving={state.isSaving}
        onNext={goNext}
        onBack={goBack}
        onSave={save}
        onCancel={cancel}
      />
    </div>
  );
};

