/**
 * Wizard System - Public API
 * Sub-module of the Flow System
 */

// Core System
export { WizardSystem, wizardSystem } from './WizardSystem';
export type { WizardInstance, WizardTemplate } from './WizardSystem';

// Types
export * from './types';

// Components
export { Wizard } from './components/Wizard';
export { WizardProgress } from './components/WizardProgress';
export { WizardStepHeader } from './components/WizardStepHeader';
export { WizardNavigation } from './components/WizardNavigation';

// Hooks
export { useWizard } from './hooks/useWizard';

// Services
export { WizardDialogService, wizardDialogService } from './services/WizardDialogService';
export type { OpenWizardDialogOptions } from './services/WizardDialogService';
export { ValidationService, validationService } from './services/ValidationService';

