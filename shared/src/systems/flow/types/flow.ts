/**
 * Core Flow System Types
 * 
 * Unified flow system supporting both navigation and form-based flows.
 */

import { ValidationResult, ValidatorFunction } from '../wizard/types/validation';

/**
 * Flow mode determines the level of user control
 */
export type FlowMode = 'guided' | 'free-explore' | 'hybrid';

/**
 * Step type determines how the step is rendered and handled
 */
export type FlowStepType = 'form' | 'navigation' | 'selection' | 'review' | 'content';

/**
 * Target type for navigation steps
 */
export type FlowTargetType = 'scene' | 'deck' | 'node' | 'context';

/**
 * Conditional operators for step visibility and branching
 */
export type ConditionalOperator = 
  | 'equals' 
  | 'not_equals' 
  | 'contains' 
  | 'not_contains'
  | 'greater_than' 
  | 'less_than'
  | 'greater_than_or_equal'
  | 'less_than_or_equal'
  | 'exists'
  | 'not_exists';

/**
 * Logic operators for combining conditions
 */
export type ConditionalLogic = 'and' | 'or';

/**
 * Conditional rule for step visibility or branching
 */
export interface ConditionalRule {
  field: string;
  operator: ConditionalOperator;
  value?: any;
  logic?: ConditionalLogic;
  rules?: ConditionalRule[]; // Nested rules for complex conditions
}

/**
 * Branch condition configuration
 */
export interface BranchCondition {
  type: 'field' | 'expression' | 'custom';
  rule?: ConditionalRule;
  expression?: string; // JavaScript expression string
  evaluate?: (data: Record<string, any>) => boolean; // Custom function
}

/**
 * Flow branch for conditional navigation
 */
export interface FlowBranch {
  id: string;
  from_step_id: string;
  condition: BranchCondition;
  target_step_id: string;
  priority?: number; // Higher priority branches evaluated first
}

/**
 * Transition configuration for navigation steps
 */
export interface TransitionConfig {
  type?: 'fade' | 'slide' | 'zoom' | 'none';
  duration?: number;
  easing?: string;
}

/**
 * Coordinates for navigation to specific positions
 */
export interface FlowCoordinates {
  x: number;
  y: number;
  z?: number;
}

/**
 * Exploration boundaries for free-explore mode
 */
export interface ExplorationConfig {
  maxDistance?: number;
  allowedContexts?: string[];
  restrictToScene?: boolean;
}

/**
 * Step guidance configuration (from wizard system)
 */
export interface StepGuidance {
  prompt?: string;
  helperText?: string;
  tooltip?: {
    content: React.ReactNode;
    position?: 'top' | 'right' | 'bottom' | 'left';
  };
  focusRing?: {
    enabled: boolean;
    color?: string;
  };
  animation?: {
    type: 'fade' | 'slide' | 'scale';
    direction?: 'left' | 'right' | 'up' | 'down';
    duration?: number;
  };
}

/**
 * Individual flow step
 */
export interface FlowStep {
  id: string;
  order: number;
  title: string;
  description?: string;
  
  // Step type determines rendering behavior
  step_type: FlowStepType;
  
  // Navigation step properties
  target_type?: FlowTargetType;
  target_id?: string;
  coordinates?: FlowCoordinates;
  transition?: TransitionConfig;
  allow_exploration?: boolean;
  exploration_boundaries?: ExplorationConfig;
  
  // Form step properties
  component?: React.ComponentType<any>;
  props?: Record<string, any>;
  validation?: ValidatorFunction;
  guidance?: StepGuidance;
  
  // Conditional visibility
  condition?: ConditionalRule;
  
  // Callbacks
  onEnter?: (data: Record<string, any>) => void | Promise<void>;
  onExit?: (data: Record<string, any>) => void | Promise<void>;
  onValidate?: (data: Record<string, any>) => Promise<ValidationResult>;
}

/**
 * Flow settings
 */
export interface FlowSettings {
  // Progress display
  showProgress?: boolean;
  progressPosition?: 'top' | 'bottom' | 'side';
  
  // Navigation controls
  allowBack?: boolean;
  allowSkip?: boolean;
  allowRewind?: boolean;
  
  // Auto-advance settings
  autoAdvance?: boolean;
  autoAdvanceDelay?: number; // ms
  
  // Persistence
  autoSave?: boolean;
  autoSaveInterval?: number; // ms
  storageKey?: string;
  
  // Presentation
  presentationMode?: 'modal' | 'drawer' | 'full-screen' | 'inline';
  
  // Exploration mode settings (for hybrid flows)
  explorationMode?: 'on-pause' | 'always' | 'never';
}

/**
 * Core Flow interface
 */
export interface Flow {
  id: string;
  name: string;
  description?: string;
  mode: FlowMode;
  steps: FlowStep[];
  branches?: FlowBranch[];
  settings?: FlowSettings;
  initialData?: Record<string, any>;
  onComplete?: (data: Record<string, any>) => void | Promise<void>;
  onCancel?: () => void;
  onStepChange?: (currentStepId: string, previousStepId?: string) => void;
}

/**
 * Flow state for tracking active flow instance
 */
export interface FlowState {
  flowId: string;
  currentStepId: string;
  currentStepIndex: number;
  visitedSteps: string[];
  data: Record<string, any>;
  errors: Map<string, ValidationResult>;
  isValidating: boolean;
  isComplete: boolean;
  isPaused: boolean;
  startedAt: Date;
  completedAt?: Date;
}

/**
 * Flow instance (active flow with state)
 */
export interface FlowInstance {
  id: string; // Instance ID
  flow: Flow;
  state: FlowState;
}

/**
 * Flow template for reusable flow patterns
 */
export interface FlowTemplate {
  id: string;
  name: string;
  description?: string;
  category?: string;
  tags?: string[];
  template: Omit<Flow, 'id' | 'onComplete' | 'onCancel'>;
}

/**
 * Flow context provided to step components
 */
export interface FlowContext {
  flow: Flow;
  state: FlowState;
  currentStep: FlowStep;
  isFirstStep: boolean;
  isLastStep: boolean;
  canGoBack: boolean;
  canGoNext: boolean;
  progress: number; // 0-100
  
  // Navigation
  next: () => Promise<void>;
  back: () => void;
  goToStep: (stepId: string) => void;
  skip: () => void;
  
  // Control
  pause: () => void;
  resume: () => void;
  cancel: () => void;
  
  // Data
  updateData: (data: Partial<Record<string, any>>) => void;
  getData: () => Record<string, any>;
  getStepData: (stepId: string) => any;
}

/**
 * Flow events
 */
export interface FlowEvents {
  'flow-start': { instanceId: string; flow: Flow };
  'flow-step-enter': { instanceId: string; stepId: string; step: FlowStep };
  'flow-step-exit': { instanceId: string; stepId: string; step: FlowStep };
  'flow-step-change': { instanceId: string; fromStepId: string; toStepId: string };
  'flow-data-update': { instanceId: string; data: Record<string, any> };
  'flow-validation-error': { instanceId: string; stepId: string; errors: ValidationResult };
  'flow-pause': { instanceId: string };
  'flow-resume': { instanceId: string };
  'flow-complete': { instanceId: string; data: Record<string, any> };
  'flow-cancel': { instanceId: string };
}

