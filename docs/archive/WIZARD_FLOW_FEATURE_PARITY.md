# Wizard-to-Flow System Feature Parity Analysis

## Executive Summary

This document analyzes the feature parity between the current Wizard System and the proposed Flow System to ensure a smooth migration path while enabling powerful new capabilities.

**Recommendation**: Merge Wizard into Flow as "Form Flow" sub-module, preserving all Wizard features while gaining Flow's navigation and branching capabilities.

## Current Wizard System Features

### Core Features
- ✅ **Multi-step Forms**: Sequential form collection with navigation
- ✅ **Validation Framework**: Centralized validation service with built-in and custom validators
- ✅ **Step Components**: FormStep, SelectionStep, ReviewStep for common patterns
- ✅ **Guidance System**: Visual focus rings, tooltips, helper text
- ✅ **State Management**: Step-level data collection with auto-save capability
- ✅ **Template System**: Reusable wizard templates via WizardSystem
- ✅ **Presentation Modes**: Modal, drawer, full-screen, inline
- ✅ **Progress Tracking**: Visual progress bar and step indicators
- ✅ **Callbacks**: onComplete, onCancel, onEnter, onExit hooks

### Wizard-Specific Capabilities
```typescript
// Wizard Config
interface WizardConfig {
  id: string;
  title: string;
  description?: string;
  steps: WizardStep[];
  initialData?: WizardData;
  onComplete: (data: WizardData) => void | Promise<void>;
  onCancel?: () => void;
  options?: WizardOptions; // showProgress, allowBack, allowSkip, allowSave, etc.
}

// Wizard Step
interface WizardStep {
  id: string;
  title: string;
  description?: string;
  component: React.ComponentType<WizardStepProps>;
  validation?: ValidatorFunction;
  guidance?: WizardStepGuidance; // Focus ring, tooltips
  onEnter?: (data: WizardData) => void;
  onExit?: (data: WizardData) => void;
}

// Validation Service
class ValidationService {
  register(name: string, validator: ValidatorFunction): void;
  validate(validatorName: string, data: any, wizardData?: Record<string, any>): Promise<ValidationResult>;
  combine(...validators: ValidatorFunction[]): ValidatorFunction;
  
  // Built-in: required, email, url, minLength, maxLength, pattern, range, uniqueSlug
}
```

### Wizard Strengths
1. **Form-Optimized**: Designed specifically for data collection
2. **Validation-First**: Rich validation framework with async support
3. **Reusable Components**: Pre-built step components for common patterns
4. **Guidance System**: Visual aids for user guidance
5. **Auto-save**: Built-in state persistence

### Wizard Limitations
1. **No Branching**: Linear step progression only
2. **No Conditional Steps**: All steps shown regardless of data
3. **No Mixed Content**: Can't mix forms with navigation or content
4. **No Exploration**: Strictly sequential flow

## Proposed Flow System Features

### Core Flow Concepts (from docs/core-foundation.md)
- ✅ **Navigation Steps**: Target scenes, decks, nodes, contexts
- ✅ **Control Modes**: Guided, free-explore, hybrid
- ✅ **Branching System**: Multi-path navigation with conditions
- ✅ **Exploration Management**: Track user position, allow exploration
- ✅ **Flow Controls**: Play, pause, advance, rewind, speed control
- ✅ **Flow History**: Maintain navigation history

### Flow System Architecture (documented)
```typescript
interface Flow {
  id: number;
  name: string;
  description: string;
  mode: 'guided' | 'free-explore' | 'hybrid';
  steps: FlowStep[];
  branches: FlowBranch[];
  settings: FlowSettings;
}

interface FlowStep {
  id: number;
  order: number;
  target_type: 'scene' | 'deck' | 'node' | 'context';
  target_id: string;
  coordinates?: { x: number; y: number; z?: number };
  transition: TransitionConfig;
  allow_exploration: boolean;
  exploration_boundaries?: ExplorationConfig;
}

interface FlowBranch {
  id: number;
  from_step_id: number;
  condition: BranchCondition;
  steps: FlowStep[];
  return_to_step?: number;
}
```

### Flow Strengths
1. **Navigation-Optimized**: Designed for content exploration
2. **Branching Support**: Multiple paths with conditions
3. **Exploration Modes**: Mix guided and free exploration
4. **Flexible Control**: Play/pause/rewind capabilities
5. **Complex Sequences**: Timeline-based orchestration

### Flow Limitations (Current)
1. **No Form Handling**: No built-in data collection
2. **No Validation**: No validation framework
3. **No Form Components**: No pre-built form step components
4. **No Guidance System**: No visual guidance features

## Feature Parity Requirements

### Must-Have (From Wizard)
1. ✅ Form data collection and state management
2. ✅ Validation framework (ValidationService)
3. ✅ Pre-built form step components (FormStep, SelectionStep, ReviewStep)
4. ✅ Guidance system (focus rings, tooltips)
5. ✅ onComplete/onCancel callbacks
6. ✅ Template system for reusable flows
7. ✅ Presentation modes (modal, drawer, full-screen)

### Must-Have (From Flow)
1. ✅ Branching with conditions
2. ✅ Conditional step visibility
3. ✅ Multiple step types (form, navigation, content)
4. ✅ Navigation to scenes/decks/contexts
5. ✅ Flow control (play, pause, advance, rewind)

### Nice-to-Have (Enhanced)
1. ⚠️ Mix form steps with navigation steps (e.g., "show content, then ask questions")
2. ⚠️ Exploration mode for forms (allow users to explore while filling forms)
3. ⚠️ Complex branching based on form data
4. ⚠️ Rewind/replay form flows for review

## Unified Flow System Design

### Proposed Architecture

```typescript
// Base Flow Interface (unified)
interface Flow {
  id: string;
  name: string;
  description?: string;
  mode: 'guided' | 'free-explore' | 'hybrid';
  steps: FlowStep[];
  branches?: FlowBranch[];
  settings?: FlowSettings;
  onComplete?: (data: Record<string, any>) => void | Promise<void>;
  onCancel?: () => void;
}

// FlowStep (supports both navigation and forms)
interface FlowStep {
  id: string;
  order: number;
  title: string;
  description?: string;
  
  // Step type determines rendering behavior
  step_type: 'form' | 'navigation' | 'selection' | 'review' | 'content';
  
  // Navigation step properties
  target_type?: 'scene' | 'deck' | 'node' | 'context';
  target_id?: string;
  coordinates?: { x: number; y: number; z?: number };
  
  // Form step properties
  component?: React.ComponentType<any>;
  validation?: ValidatorFunction;
  guidance?: StepGuidance;
  
  // Conditional visibility
  condition?: ConditionalRule;
  
  // Callbacks
  onEnter?: (data: Record<string, any>) => void;
  onExit?: (data: Record<string, any>) => void;
}

// Conditional logic (new)
interface ConditionalRule {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'exists';
  value: any;
  logic?: 'and' | 'or';
  rules?: ConditionalRule[]; // Nested rules
}

// Branching (enhanced)
interface FlowBranch {
  id: string;
  from_step_id: string;
  condition: BranchCondition;
  target_step_id: string;
}

interface BranchCondition {
  type: 'field' | 'expression' | 'custom';
  rule: ConditionalRule;
  evaluate?: (data: Record<string, any>) => boolean;
}
```

### Form Flow Sub-Module

```typescript
// FormFlow extends Flow with form-specific enhancements
interface FormFlow extends Flow {
  mode: 'guided'; // Form flows are always guided
  initialData?: Record<string, any>;
  autoSave?: boolean;
  autoSaveInterval?: number;
  showProgress?: boolean;
  allowBack?: boolean;
  allowSkip?: boolean;
}

// FormFlowContainer wraps Flow with form state management
class FormFlowContainer extends React.Component {
  // Handles form data collection
  // Integrates ValidationService
  // Manages step-by-step validation
  // Provides form-specific navigation (Back, Next, Save, Cancel)
}
```

## Migration Strategy

### Phase 1: Core Flow System
1. Create base `Flow` interface supporting both navigation and form steps
2. Implement `FlowSystem` class with registration, instance management
3. Add conditional logic evaluation
4. Add branching support

### Phase 2: Form Flow Sub-Module
1. Move Wizard components to `shared/src/systems/flow/form/`
2. Create `FormFlow` type extending base `Flow`
3. Create `FormFlowContainer` component
4. Integrate `ValidationService`
5. Update step components (FormStep, SelectionStep, ReviewStep)

### Phase 3: Deprecation
1. Mark `shared/src/systems/flow/wizard/` as deprecated
2. Create migration guide
3. Update all wizard references
4. Keep wizard code for 1 release cycle
5. Remove wizard system

## API Comparison

### Before (Wizard)
```typescript
// Create a wizard
const wizardConfig: WizardConfig = {
  id: 'create-scene',
  title: 'Create Scene',
  steps: [
    { id: 'basic', component: FormStep, validation: required },
    { id: 'review', component: ReviewStep }
  ],
  onComplete: async (data) => { await createScene(data); }
};

wizardDialogService.openWizard(wizardConfig);
```

### After (FormFlow)
```typescript
// Create a form flow (same simplicity for basic cases)
const createSceneFlow: FormFlow = {
  id: 'create-scene',
  name: 'Create Scene',
  mode: 'guided',
  steps: [
    { id: 'basic', order: 1, step_type: 'form', component: FormStep, validation: required },
    { id: 'review', order: 2, step_type: 'review', component: ReviewStep }
  ],
  onComplete: async (data) => { await createScene(data); }
};

flowSystem.registerFlow(createSceneFlow);
const flowId = flowSystem.startFlow('create-scene');
dialogSystem.openModal({
  content: <FormFlowContainer flowId={flowId} />
});
```

### Advanced (FormFlow with Branching)
```typescript
// Advanced form flow with conditional steps and branching
const advancedFlow: FormFlow = {
  id: 'advanced-scene',
  name: 'Advanced Scene Creation',
  mode: 'guided',
  steps: [
    { 
      id: 'basic', 
      order: 1, 
      step_type: 'form', 
      component: FormStep 
    },
    { 
      id: 'deck-selection', 
      order: 2, 
      step_type: 'selection', 
      component: SelectionStep,
      // Only show if type != 'custom'
      condition: { field: 'type', operator: 'not_equals', value: 'custom' }
    },
    { 
      id: 'advanced-config', 
      order: 3, 
      step_type: 'form', 
      component: AdvancedConfigStep,
      // Only show if user selected 'advanced' mode
      condition: { field: 'mode', operator: 'equals', value: 'advanced' }
    },
    { 
      id: 'review', 
      order: 4, 
      step_type: 'review', 
      component: ReviewStep 
    }
  ],
  branches: [
    {
      id: 'graph-specific',
      from_step_id: 'basic',
      condition: { 
        type: 'field',
        rule: { field: 'type', operator: 'equals', value: 'graph' }
      },
      target_step_id: 'graph-config'
    }
  ],
  onComplete: async (data) => { await createScene(data); }
};
```

## Success Criteria

- [ ] All Wizard features have equivalent in FormFlow
- [ ] ValidationService works seamlessly with Flow system
- [ ] Pre-built step components (FormStep, SelectionStep, ReviewStep) work with FormFlow
- [ ] Guidance system (focus rings, tooltips) preserved
- [ ] Conditional step visibility implemented
- [ ] Multi-path branching implemented
- [ ] Template system supports Flow/FormFlow
- [ ] Simple form flows are as easy to create as Wizards
- [ ] Advanced flows enable powerful new combinations
- [ ] Migration guide provides clear path for existing wizards
- [ ] Tests pass for all new Flow system components

## Conclusion

The Wizard-to-Flow migration makes strong architectural sense:

1. **Preserves all Wizard capabilities** via FormFlow sub-module
2. **Enables powerful new features** (branching, conditional steps, mixed content)
3. **Maintains simplicity** for basic use cases
4. **Provides clear upgrade path** for advanced scenarios
5. **Reduces duplication** by unifying two similar systems
6. **Future-proofs** the architecture for complex guided experiences

The unified Flow system will support:
- Simple multi-step forms (current Wizard use case)
- Content navigation flows (documented Flow use case)
- Mixed flows (forms + navigation + content)
- Complex branching scenarios
- Guided onboarding experiences
- Feature tours with interaction
- Admin configuration wizards

All while maintaining a clean, intuitive API for both simple and advanced use cases.

