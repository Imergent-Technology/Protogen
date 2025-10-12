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
export { GuidanceOverlay, Tooltip } from './components/GuidanceOverlay';

// Reusable Step Components
export { FormStep } from './components/steps/FormStep';
export type { FormField, FormStepData, FormStepProps } from './components/steps/FormStep';
export { SelectionStep } from './components/steps/SelectionStep';
export type { SelectionOption, SelectionStepData, SelectionStepProps } from './components/steps/SelectionStep';
export { ReviewStep } from './components/steps/ReviewStep';
export type { ReviewSection, ReviewItem, ReviewStepData, ReviewStepProps } from './components/steps/ReviewStep';

// Hooks
export { useWizard } from './hooks/useWizard';

// Services
export { WizardDialogService, wizardDialogService } from './services/WizardDialogService';
export type { OpenWizardDialogOptions } from './services/WizardDialogService';
export { ValidationService, validationService } from './services/ValidationService';

