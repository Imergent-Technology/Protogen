// @ts-nocheck
/**
 * Flow Renderer Component
 * 
 * Renders a flow instance with step navigation and progress tracking.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { flowSystem } from '../core/FlowSystem';
import type { Flow, FlowStep } from '../types/flow';
import { Button } from '../../../components';
import { FormStep } from '../form/components/steps/FormStep';
import { SelectionStep } from '../form/components/steps/SelectionStep';
import { ReviewStep } from '../form/components/steps/ReviewStep';

export interface FlowRendererProps {
  flowId: string;
  instanceId: string;
  onComplete?: (data: Record<string, any>) => void;
  onCancel?: () => void;
}

export const FlowRenderer: React.FC<FlowRendererProps> = ({
  flowId,
  instanceId,
  onComplete,
  onCancel,
}) => {
  const [flow, setFlow] = useState<Flow | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Get flow from system
    const flowInstance = flowSystem['flows'].get(flowId);
    if (flowInstance) {
      setFlow(flowInstance);
    }

    // Listen for step changes
    const handleStepChange = (data: { stepIndex: number }) => {
      setCurrentStepIndex(data.stepIndex);
    };

    flowSystem.on('step-change', handleStepChange);

    return () => {
      flowSystem.off('step-change', handleStepChange);
    };
  }, [flowId]);

  const handleNext = useCallback(async () => {
    console.log('handleNext called, current step:', currentStepIndex);
    if (!flow) return;

    const currentStep = flow.steps[currentStepIndex];
    console.log('Current step:', currentStep);

    // Validate current step if it's a form step
    if (currentStep.type === 'form' && currentStep.data?.fields) {
      const stepErrors: Record<string, string> = {};
      console.log('Validating fields:', currentStep.data.fields, 'Form data:', formData);
      
      for (const field of currentStep.data.fields) {
        if (field.validation?.required && !formData[field.id]) {
          stepErrors[field.id] = `${field.label} is required`;
        }
        
        if (field.validation?.pattern && formData[field.id]) {
          const pattern = new RegExp(field.validation.pattern);
          if (!pattern.test(formData[field.id])) {
            stepErrors[field.id] = `${field.label} format is invalid`;
          }
        }
      }

      if (Object.keys(stepErrors).length > 0) {
        console.log('Validation errors:', stepErrors);
        setErrors(stepErrors);
        return;
      }
    }

    setErrors({});

    // Move to next step
    if (currentStepIndex < flow.steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
      flowSystem.emit('step-change', { stepIndex: currentStepIndex + 1 });
    } else {
      // Complete flow
      await onComplete?.(formData);
    }
  }, [flow, currentStepIndex, formData, onComplete]);

  const handlePrevious = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
      flowSystem.emit('step-change', { stepIndex: currentStepIndex - 1 });
    }
  }, [currentStepIndex]);

  const handleFieldChange = useCallback((newData: Record<string, any>) => {
    // Merge new data with existing data to preserve fields from other steps
    setFormData(prev => ({ ...prev, ...newData }));
    
    // Clear errors for fields that have been updated
    setErrors(prev => {
      const newErrors = { ...prev };
      Object.keys(newData).forEach(fieldId => {
        if (newErrors[fieldId]) {
          delete newErrors[fieldId];
        }
      });
      return newErrors;
    });
  }, []);

  const handleCancel = useCallback(() => {
    onCancel?.();
  }, [onCancel]);

  // Helper to transform review sections with field names to ReviewItem objects
  const transformReviewSections = useCallback((sections: any[]) => {
    if (!sections) return [];
    
    return sections.map(section => ({
      ...section,
      items: (section.fields || []).map((fieldId: string) => {
        let fieldLabel = fieldId;
        let fieldValue = formData[fieldId];
        
        // Find field definition for better label and formatting
        for (const step of flow?.steps || []) {
          if (step.type === 'form' && step.data?.fields) {
            const fieldDef = step.data.fields.find((f: any) => f.id === fieldId);
            if (fieldDef) {
              fieldLabel = fieldDef.label || fieldId;
              
              // Format value based on field type
              if (fieldDef.type === 'checkbox') {
                fieldValue = fieldValue === true ? 'Yes' : 'No';
              } else if (fieldDef.type === 'select' && fieldDef.options) {
                const option = fieldDef.options.find((opt: any) => opt.value === fieldValue);
                fieldValue = option?.label || fieldValue;
              }
              break;
            }
          }
        }
        
        return {
          label: fieldLabel,
          value: fieldValue !== undefined && fieldValue !== '' ? String(fieldValue) : 'Not provided'
        };
      }),
    }));
  }, [formData, flow]);

  if (!flow) {
    return <div className="text-center py-8">Loading flow...</div>;
  }

  const currentStep = flow.steps[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === flow.steps.length - 1;

  return (
    <div className="flow-renderer">
      {/* Progress indicator */}
      {flow.metadata?.showProgress && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">
              Step {currentStepIndex + 1} of {flow.steps.length}
            </span>
            <span className="text-sm text-muted-foreground">
              {Math.round(((currentStepIndex + 1) / flow.steps.length) * 100)}%
            </span>
          </div>
          <div className="w-full bg-secondary rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStepIndex + 1) / flow.steps.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Step header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">{currentStep.title}</h3>
        {currentStep.description && (
          <p className="text-sm text-muted-foreground">{currentStep.description}</p>
        )}
        {currentStep.guidance?.message && (
          <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-900">{currentStep.guidance.message}</p>
          </div>
        )}
      </div>

      {/* Step content */}
      <div className="mb-6">
        {currentStep.type === 'form' && currentStep.data?.fields && (
          <FormStep
            fields={currentStep.data.fields}
            data={formData}
            onDataChange={handleFieldChange}
            errors={Object.entries(errors).map(([field, message]) => ({ field, message }))}
            isValidating={false}
            flowData={formData}
            currentStepId={currentStep.id}
          />
        )}
        
        {currentStep.type === 'selection' && currentStep.data?.options && (
          <SelectionStep
            step={currentStep}
            data={formData}
            onDataChange={handleFieldChange}
            errors={[]}
            isValidating={false}
            flowData={formData}
            currentStepId={currentStep.id}
          />
        )}
        
        {currentStep.type === 'review' && currentStep.data?.sections && (
          <ReviewStep
            sections={transformReviewSections(currentStep.data.sections)}
            data={formData}
            onDataChange={handleFieldChange}
            errors={[]}
            isValidating={false}
            flowData={formData}
            currentStepId={currentStep.id}
            title={currentStep.title}
            description={currentStep.description}
          />
        )}
      </div>

      {/* Navigation buttons */}
      <div className="flex justify-between items-center pt-4 border-t">
        <div>
          {flow.metadata?.cancelable && (
            <Button variant="ghost" onClick={handleCancel}>
              Cancel
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          {!isFirstStep && flow.metadata?.canGoBack && (
            <Button variant="outline" onClick={handlePrevious}>
              Previous
            </Button>
          )}
          <Button onClick={handleNext}>
            {isLastStep ? 'Complete' : 'Next'}
          </Button>
        </div>
      </div>
    </div>
  );
};

