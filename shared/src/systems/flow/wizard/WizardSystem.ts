/**
 * WizardSystem - Core system for managing wizards
 */

import { WizardConfig, WizardState, WizardData } from './types';

export interface WizardInstance {
  id: string;
  config: WizardConfig;
  state: WizardState;
}

export interface WizardTemplate {
  id: string;
  name: string;
  description?: string;
  config: Omit<WizardConfig, 'onComplete' | 'onCancel'>;
}

export type ValidatorFunction = (
  data: any,
  wizardData?: WizardData
) => { isValid: boolean; errors: any[] } | Promise<{ isValid: boolean; errors: any[] }>;

class WizardSystemClass {
  private instances: Map<string, WizardInstance> = new Map();
  private templates: Map<string, WizardTemplate> = new Map();
  private validators: Map<string, ValidatorFunction> = new Map();

  /**
   * Register a wizard template
   */
  registerTemplate(template: WizardTemplate): void {
    this.templates.set(template.id, template);
  }

  /**
   * Get a wizard template
   */
  getTemplate(templateId: string): WizardTemplate | undefined {
    return this.templates.get(templateId);
  }

  /**
   * Create a wizard from a template
   */
  createFromTemplate(
    templateId: string,
    overrides?: Partial<WizardConfig>
  ): WizardConfig | null {
    const template = this.templates.get(templateId);
    if (!template) {
      console.error(`Wizard template not found: ${templateId}`);
      return null;
    }

    return {
      ...template.config,
      ...overrides,
      id: overrides?.id || template.id,
      onComplete: overrides?.onComplete || (() => {}),
      onCancel: overrides?.onCancel
    } as WizardConfig;
  }

  /**
   * Register a custom validator
   */
  registerValidator(name: string, validator: ValidatorFunction): void {
    this.validators.set(name, validator);
  }

  /**
   * Get a registered validator
   */
  getValidator(name: string): ValidatorFunction | undefined {
    return this.validators.get(name);
  }

  /**
   * Save wizard state (to be implemented with persistence layer)
   */
  async saveWizardState(wizardId: string, state: WizardState): Promise<void> {
    // TODO: Implement state persistence (localStorage, API, etc.)
    console.log(`Saving wizard state for ${wizardId}`, state);
  }

  /**
   * Load wizard state (to be implemented with persistence layer)
   */
  async loadWizardState(wizardId: string): Promise<WizardState | null> {
    // TODO: Implement state loading (localStorage, API, etc.)
    console.log(`Loading wizard state for ${wizardId}`);
    return null;
  }

  /**
   * Clear wizard state
   */
  async clearWizardState(wizardId: string): Promise<void> {
    // TODO: Implement state clearing (localStorage, API, etc.)
    console.log(`Clearing wizard state for ${wizardId}`);
  }

  /**
   * Create a wizard instance
   */
  createInstance(config: WizardConfig): WizardInstance {
    const instance: WizardInstance = {
      id: config.id,
      config,
      state: {
        currentStepIndex: 0,
        data: config.initialData || {},
        errors: new Map(),
        isValidating: false,
        isSaving: false,
        isComplete: false
      }
    };

    this.instances.set(config.id, instance);
    return instance;
  }

  /**
   * Get a wizard instance
   */
  getInstance(wizardId: string): WizardInstance | undefined {
    return this.instances.get(wizardId);
  }

  /**
   * Remove a wizard instance
   */
  removeInstance(wizardId: string): void {
    this.instances.delete(wizardId);
  }
}

// Export singleton instance
export const wizardSystem = new WizardSystemClass();
export { WizardSystemClass as WizardSystem };

