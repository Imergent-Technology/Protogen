/**
 * Form Flow Types
 * 
 * Form-specific extension of the base Flow system for data collection.
 */

import { Flow, FlowStep, FlowSettings } from '../../types/flow';

/**
 * Form Flow extends Flow with form-specific properties
 * Form flows are always in guided mode
 */
export interface FormFlow extends Omit<Flow, 'mode'> {
  mode: 'guided'; // Form flows are always guided
  autoSave?: boolean;
  autoSaveInterval?: number; // ms
  confirmCancel?: boolean;
}

/**
 * Form Flow Settings extends FlowSettings with form-specific options
 */
export interface FormFlowSettings extends FlowSettings {
  // Form-specific settings
  showProgress?: boolean;
  allowBack?: boolean;
  allowSkip?: boolean;
  allowSave?: boolean;
  confirmCancel?: boolean;
  
  // Auto-save settings
  autoSave?: boolean;
  autoSaveInterval?: number; // ms
  
  // Validation settings
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

/**
 * Form step specific properties
 */
export interface FormStepProps<T = any> {
  data: T;
  onDataChange: (data: T) => void;
  errors: Array<{ field?: string; message: string; severity?: 'error' | 'warning' | 'info' }>;
  isValidating: boolean;
  
  // Callbacks from the flow
  onNext?: () => void;
  onBack?: () => void;
  onSave?: () => void;
  goToStep?: (stepId: string) => void;
  
  // Context from the overall flow
  flowData: Record<string, any>;
  currentStepId: string;
}

/**
 * Form Flow Step extends FlowStep with form-specific types
 */
export interface FormFlowStep extends FlowStep {
  step_type: 'form' | 'selection' | 'review';
  component: React.ComponentType<FormStepProps<any>>;
}

/**
 * Form Flow Configuration helper type
 */
export type FormFlowConfig = Omit<FormFlow, 'mode'> & {
  settings?: FormFlowSettings;
  steps: FormFlowStep[];
};

