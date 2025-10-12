/**
 * Step types for the Wizard System
 */

import { WizardStepValidation, ValidationError } from './validation';

export type WizardData = Record<string, any>;

export interface WizardStepGuidance {
  helpText?: string;
  tooltips?: Record<string, string>; // fieldId -> tooltip
  examples?: string[];
  focusRing?: {
    enabled: boolean;
    color?: string; // Tailwind color class
  };
}

export interface WizardStepProps<T = any> {
  data: T;
  onDataChange: (data: Partial<T>) => void;
  errors: ValidationError[];
  isValidating: boolean;
}

export interface WizardStep {
  id: string;
  title: string;
  description?: string;
  component: React.ComponentType<WizardStepProps>;
  props?: Record<string, any>;
  validation?: WizardStepValidation;
  isOptional?: boolean;
  isVisible?: (data: WizardData) => boolean; // Conditional visibility
  guidance?: WizardStepGuidance;
  onEnter?: (data: WizardData) => void | Promise<void>;
  onExit?: (data: WizardData) => void | Promise<void>;
  onNext?: (data: any) => void;
  onBack?: (data: any) => void;
  onSave?: (data: any) => void;
}

