/**
 * useWizard Hook - React hook for wizard state management
 */

import { useState, useCallback } from 'react';
import { WizardConfig, WizardState, WizardContext } from '../types';

export function useWizard(config: WizardConfig): WizardContext {
  const {
    steps,
    initialData = {},
    onComplete,
    onCancel,
    options = {}
  } = config;

  const { allowBack = true } = options;

  // Initialize state
  const [state, setState] = useState<WizardState>({
    currentStepIndex: 0,
    data: initialData,
    errors: new Map(),
    isValidating: false,
    isSaving: false,
    isComplete: false
  });

  // Get current step
  const currentStep = steps[state.currentStepIndex];
  const isFirstStep = state.currentStepIndex === 0;
  const isLastStep = state.currentStepIndex === steps.length - 1;

  // Update data
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
        setState(prev => {
          const newErrors = new Map(prev.errors);
          newErrors.delete(currentStep.id);
          return { ...prev, errors: newErrors, isValidating: false };
        });
        return true;
      } else {
        setState(prev => {
          const newErrors = new Map(prev.errors);
          newErrors.set(currentStep.id, result.errors);
          return { ...prev, errors: newErrors, isValidating: false };
        });
        return false;
      }
    } catch (error) {
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

  // Go to next step or complete
  const goNext = useCallback(async () => {
    const isValid = await validateCurrentStep();
    if (!isValid) return;

    if (currentStep.onNext) {
      currentStep.onNext(state.data[currentStep.id] || {});
    }

    if (currentStep.onExit) {
      await currentStep.onExit(state.data);
    }

    if (isLastStep) {
      setState(prev => ({ ...prev, isComplete: true }));
      if (onComplete) {
        await onComplete(state.data);
      }
    } else {
      const nextIndex = state.currentStepIndex + 1;
      const nextStep = steps[nextIndex];

      if (nextStep.onEnter) {
        await nextStep.onEnter(state.data);
      }

      setState(prev => ({ ...prev, currentStepIndex: nextIndex }));
    }
  }, [validateCurrentStep, currentStep, isLastStep, state.data, onComplete, steps, state.currentStepIndex]);

  // Go to previous step
  const goBack = useCallback(async () => {
    if (isFirstStep || !allowBack) return;

    if (currentStep.onBack) {
      currentStep.onBack(state.data[currentStep.id] || {});
    }

    if (currentStep.onExit) {
      await currentStep.onExit(state.data);
    }

    const prevIndex = state.currentStepIndex - 1;
    const prevStep = steps[prevIndex];

    if (prevStep.onEnter) {
      await prevStep.onEnter(state.data);
    }

    setState(prev => ({ ...prev, currentStepIndex: prevIndex }));
  }, [isFirstStep, allowBack, currentStep, state.data, state.currentStepIndex, steps]);

  // Go to specific step
  const goToStep = useCallback((stepIndex: number) => {
    if (stepIndex < 0 || stepIndex >= steps.length) return;
    setState(prev => ({ ...prev, currentStepIndex: stepIndex }));
  }, [steps.length]);

  // Save draft
  const save = useCallback(async () => {
    const isValid = await validateCurrentStep();
    if (!isValid) return;

    setState(prev => ({ ...prev, isSaving: true }));

    try {
      if (currentStep.onSave) {
        await currentStep.onSave(state.data[currentStep.id] || {});
      }
    } finally {
      setState(prev => ({ ...prev, isSaving: false }));
    }
  }, [validateCurrentStep, currentStep, state.data]);

  // Cancel wizard
  const cancel = useCallback(() => {
    if (onCancel) {
      onCancel();
    }
  }, [onCancel]);

  return {
    config,
    state,
    currentStep,
    isFirstStep,
    isLastStep,
    goToStep,
    goBack,
    goNext,
    save,
    cancel,
    updateData
  };
}

