/**
 * ValidationService - Centralized validation framework for wizards
 */

import { ValidationResult, ValidationError, ValidatorFunction } from '../types';

export class ValidationService {
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
    wizardData?: Record<string, any>
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

    return validator(data, wizardData);
  }

  /**
   * Combine multiple validators
   */
  combine(...validators: ValidatorFunction[]): ValidatorFunction {
    return async (data: any, wizardData?: Record<string, any>) => {
      const errors: ValidationError[] = [];

      for (const validator of validators) {
        const result = await validator(data, wizardData);
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
    this.register('minLength', (data: string, wizardData?: Record<string, any>) => {
      const minLength = wizardData?.minLength || 1;
      if (data.length < minLength) {
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
    this.register('maxLength', (data: string, wizardData?: Record<string, any>) => {
      const maxLength = wizardData?.maxLength || 1000;
      if (data.length > maxLength) {
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
    this.register('pattern', (data: string, wizardData?: Record<string, any>) => {
      const pattern = wizardData?.pattern;
      if (!pattern) {
        return { isValid: true, errors: [] };
      }

      const regex = new RegExp(pattern);
      if (!regex.test(data)) {
        return {
          isValid: false,
          errors: [{
            message: wizardData?.patternMessage || 'Invalid format',
            severity: 'error'
          }]
        };
      }
      return { isValid: true, errors: [] };
    });

    // Numeric range validator
    this.register('range', (data: number, wizardData?: Record<string, any>) => {
      const min = wizardData?.min;
      const max = wizardData?.max;
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

    // Custom async validator example (API check)
    this.register('uniqueSlug', async (data: string) => {
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
  }
}

// Export singleton instance
export const validationService = new ValidationService();

