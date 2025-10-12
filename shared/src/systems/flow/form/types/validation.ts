/**
 * Form Validation Types
 * 
 * Migrated from wizard system and enhanced for Form Flow.
 */

export interface ValidationError {
  field?: string; // Optional field name for field-specific errors
  message: string;
  severity?: 'error' | 'warning' | 'info';
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export type ValidatorFunction<T = any> = (
  value: T,
  allData: Record<string, any>,
  context?: Record<string, any>
) => Promise<ValidationResult> | ValidationResult;

