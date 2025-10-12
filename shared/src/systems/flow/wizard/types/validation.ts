/**
 * Validation types for the Wizard System
 */

export interface ValidationError {
  field?: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export type ValidatorFunction = (
  data: any,
  wizardData?: Record<string, any>
) => ValidationResult | Promise<ValidationResult>;

export interface WizardStepValidation {
  validate: ValidatorFunction;
  validateOnChange?: boolean;
  debounceMs?: number;
}

