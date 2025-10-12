/**
 * ValidationService - Centralized validation framework for Form Flows
 * 
 * Migrated from wizard system and enhanced for Form Flow.
 */

import { ValidationResult, ValidationError, ValidatorFunction } from '../types/validation';

export class ValidationServiceClass {
  private validators: Map<string, ValidatorFunction> = new Map();

  constructor() {
    // Register built-in validators
    this.registerBuiltInValidators();
  }

  /**
   * Register a custom validator
   */
  register(name: string, validator: ValidatorFunction): void {
    this.validators.set(name, validator);
  }

  /**
   * Get a registered validator
   */
  get(name: string): ValidatorFunction | undefined {
    return this.validators.get(name);
  }

  /**
   * Validate data using a specific validator
   */
  async validate(
    validatorName: string,
    data: any,
    formData?: Record<string, any>,
    context?: Record<string, any>
  ): Promise<ValidationResult> {
    const validator = this.validators.get(validatorName);
    if (!validator) {
      return {
        isValid: false,
        errors: [{
          message: `Validator '${validatorName}' not found`,
          severity: 'error'
        }]
      };
    }

    return Promise.resolve(validator(data, formData || {}, context));
  }

  /**
   * Combine multiple validators
   */
  combine(...validators: (string | ValidatorFunction)[]): ValidatorFunction {
    return async (data: any, formData?: Record<string, any>, context?: Record<string, any>) => {
      const errors: ValidationError[] = [];

      for (const v of validators) {
        let result: ValidationResult;
        
        if (typeof v === 'string') {
          result = await this.validate(v, data, formData, context);
        } else {
          result = await Promise.resolve(v(data, formData || {}, context));
        }

        if (!result.isValid) {
          errors.push(...result.errors);
        }
      }

      return {
        isValid: errors.length === 0,
        errors
      };
    };
  }

  /**
   * Register built-in validators
   */
  private registerBuiltInValidators(): void {
    // Required field validator
    this.register('required', (data: any) => {
      if (data === null || data === undefined || data === '') {
        return {
          isValid: false,
          errors: [{ message: 'This field is required', severity: 'error' }]
        };
      }
      return { isValid: true, errors: [] };
    });

    // Email validator
    this.register('email', (data: string) => {
      if (!data) {
        return { isValid: true, errors: [] }; // Empty is valid (use required separately)
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data)) {
        return {
          isValid: false,
          errors: [{ message: 'Invalid email address', severity: 'error' }]
        };
      }
      return { isValid: true, errors: [] };
    });

    // URL validator
    this.register('url', (data: string) => {
      if (!data) {
        return { isValid: true, errors: [] }; // Empty is valid (use required separately)
      }
      try {
        new URL(data);
        return { isValid: true, errors: [] };
      } catch {
        return {
          isValid: false,
          errors: [{ message: 'Invalid URL', severity: 'error' }]
        };
      }
    });

    // Min length validator
    this.register('minLength', (data: string, _formData?: Record<string, any>, context?: Record<string, any>) => {
      const minLength = context?.minLength || 1;
      if (!data || data.length < minLength) {
        return {
          isValid: false,
          errors: [{
            message: `Must be at least ${minLength} characters`,
            severity: 'error'
          }]
        };
      }
      return { isValid: true, errors: [] };
    });

    // Max length validator
    this.register('maxLength', (data: string, _formData?: Record<string, any>, context?: Record<string, any>) => {
      const maxLength = context?.maxLength || 1000;
      if (data && data.length > maxLength) {
        return {
          isValid: false,
          errors: [{
            message: `Must be no more than ${maxLength} characters`,
            severity: 'error'
          }]
        };
      }
      return { isValid: true, errors: [] };
    });

    // Pattern validator
    this.register('pattern', (data: string, _formData?: Record<string, any>, context?: Record<string, any>) => {
      const pattern = context?.pattern;
      if (!pattern) {
        return { isValid: true, errors: [] };
      }

      if (!data) {
        return { isValid: true, errors: [] }; // Empty is valid (use required separately)
      }

      const regex = new RegExp(pattern);
      if (!regex.test(data)) {
        return {
          isValid: false,
          errors: [{
            message: context?.patternMessage || 'Invalid format',
            severity: 'error'
          }]
        };
      }
      return { isValid: true, errors: [] };
    });

    // Numeric range validator
    this.register('range', (data: number, _formData?: Record<string, any>, context?: Record<string, any>) => {
      const min = context?.min;
      const max = context?.max;
      const errors: ValidationError[] = [];

      if (min !== undefined && data < min) {
        errors.push({
          message: `Value must be at least ${min}`,
          severity: 'error'
        });
      }

      if (max !== undefined && data > max) {
        errors.push({
          message: `Value must be no more than ${max}`,
          severity: 'error'
        });
      }

      return {
        isValid: errors.length === 0,
        errors
      };
    });

    // Custom async validator example (API check for unique slugs)
    this.register('uniqueSlug', async (data: string) => {
      if (!data) {
        return { isValid: true, errors: [] };
      }

      // TODO: Implement actual API check
      // Simulated async validation
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Simulate checking if slug is unique
      if (data === 'test-slug-taken') {
        return {
          isValid: false,
          errors: [{
            message: 'This slug is already taken',
            severity: 'error'
          }]
        };
      }

      return { isValid: true, errors: [] };
    });

    // Match validator (for password confirmation, etc.)
    this.register('match', (data: any, formData?: Record<string, any>, context?: Record<string, any>) => {
      const fieldToMatch = context?.field;
      if (!fieldToMatch) {
        console.warn('Match validator requires a field context parameter');
        return { isValid: true, errors: [] };
      }

      const matchValue = formData?.[fieldToMatch];
      if (data !== matchValue) {
        return {
          isValid: false,
          errors: [{
            message: context?.message || 'Values do not match',
            severity: 'error'
          }]
        };
      }

      return { isValid: true, errors: [] };
    });
  }
}

// Export singleton instance
export const validationService = new ValidationServiceClass();

