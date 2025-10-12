/**
 * Wizard configuration types
 */

import { WizardStep, WizardData } from './step';
import { ValidationError } from './validation';

export type WizardPresentationMode = 'modal' | 'drawer' | 'full-screen' | 'inline';

export interface WizardOptions {
  showProgress?: boolean;
  allowBack?: boolean;
  allowSkip?: boolean;
  allowSave?: boolean;
  confirmCancel?: boolean;
  autoSave?: boolean;
  autoSaveInterval?: number; // ms
  presentationMode?: WizardPresentationMode;
}

export interface WizardConfig {
  id: string;
  title: string;
  description?: string;
  steps: WizardStep[];
  initialData?: WizardData;
  onComplete: (data: WizardData) => void | Promise<void>;
  onCancel?: () => void;
  options?: WizardOptions;
}

export interface WizardState {
  currentStepIndex: number;
  data: WizardData;
  errors: Map<string, ValidationError[]>; // stepId -> errors
  isValidating: boolean;
  isSaving: boolean;
  isComplete: boolean;
}

export interface WizardContext {
  config: WizardConfig;
  state: WizardState;
  currentStep: WizardStep;
  isFirstStep: boolean;
  isLastStep: boolean;
  goToStep: (stepIndex: number) => void;
  goBack: () => void;
  goNext: () => Promise<void>;
  save: () => Promise<void>;
  cancel: () => void;
  updateData: (stepId: string, data: any) => void;
}

