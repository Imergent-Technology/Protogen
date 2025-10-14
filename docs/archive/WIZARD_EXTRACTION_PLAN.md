# Wizard System Extraction Plan

> **⚠️ SUPERSEDED**: This plan has been superseded by the Flow System implementation. The wizard functionality was merged into the Flow System as the "Form Flow" sub-module instead of being a separate wizard system. See [WIZARD_FLOW_FEATURE_PARITY.md](./WIZARD_FLOW_FEATURE_PARITY.md) for the analysis and [FLOW_SCENE_MGMT_SESSION.md](./FLOW_SCENE_MGMT_SESSION.md) for implementation details.
>
> **Status**: ✅ Complete via Flow System / Form Flow  
> **Date Completed**: October 13, 2025

## Overview

~~Extract and enhance the existing `WorkflowWizard` from the admin site and integrate it into the shared library as a sub-module of the Flow System. The wizard will interface with the Dialog System for presentation and provide a cohesive, user-friendly experience for complex multi-step data input.~~

**Actual Implementation**: Wizard functionality integrated into Flow System as Form Flow sub-module with FormStep, SelectionStep, and ReviewStep components. Provides same capabilities with better integration.

## Current State Analysis

### Existing Implementation (admin/src/components/workflows/)

**Core Component:** `WorkflowWizard.tsx`
- **State Management:** Step navigation, data collection, validation
- **Features:** Progress bar, step navigation (back/next), validation per step, save/cancel
- **Props:** Steps array, initial data, callbacks for complete/cancel/update
- **Validation:** Per-step validation with error display
- **Data Flow:** Accumulates data across steps, updates parent on change

**Step Pattern:**
```typescript
interface WorkflowStep {
  id: string;
  title: string;
  description?: string;
  component: React.ComponentType<any>;
  props?: Record<string, any>;
  validation?: (data: any) => { isValid: boolean; errors: string[] };
  onNext?: (data: any) => void;
  onBack?: (data: any) => void;
  onSave?: (data: any) => void;
}
```

**Example Usage:** `SceneWorkflow.tsx`, `DeckWorkflow.tsx`
- Define workflow steps
- Provide step components (e.g., `BasicDetailsStep`, `DesignStep`)
- Handle completion with final data

### Enhancements Needed

1. **Dialog Integration:** Wizard should render in Dialog System (modal or drawer)
2. **Flow System Integration:** Place as sub-module under Flow System
3. **Enhanced Step Types:** Support different step rendering modes (full-page, inline, compact)
4. **Admin Enhancement:** Allow admins to add prompts, guidance (Tailwind ring), tooltips
5. **Extensibility:** Plugin architecture for custom step types and behaviors
6. **Validation Framework:** More robust validation with async support
7. **Animation Support:** Integrate with Flow System for guided animations
8. **State Persistence:** Auto-save progress, resume later
9. **Conditional Steps:** Show/hide steps based on previous answers

## Architecture

### Location
```
shared/src/systems/flow/
├── wizard/
│   ├── types/
│   │   ├── index.ts
│   │   ├── step.ts
│   │   ├── wizard-config.ts
│   │   └── validation.ts
│   ├── components/
│   │   ├── Wizard.tsx                  # Main wizard container
│   │   ├── WizardStep.tsx              # Step wrapper component
│   │   ├── WizardProgress.tsx          # Progress indicator
│   │   ├── WizardNavigation.tsx        # Back/Next buttons
│   │   ├── WizardStepHeader.tsx        # Title, description, guidance
│   │   └── index.ts
│   ├── hooks/
│   │   ├── useWizard.ts                # Main wizard hook
│   │   ├── useWizardStep.ts            # Current step management
│   │   ├── useWizardValidation.ts      # Validation logic
│   │   └── index.ts
│   ├── services/
│   │   ├── WizardStateManager.ts       # State persistence
│   │   ├── ValidationService.ts        # Validation orchestration
│   │   └── index.ts
│   ├── WizardSystem.ts                 # Core wizard system
│   └── index.ts                        # Public API
└── index.ts                            # Export wizard from flow system
```

### Integration Points

**With Dialog System:**
- Wizard opens in modal or drawer via `dialogSystem.openModal()` or `dialogSystem.openDrawer()`
- Wizard completion triggers dialog close
- Cancel action closes dialog with confirmation

**With Flow System:**
- Wizard is a sub-module: `@protogen/shared/systems/flow/wizard`
- Flow System can trigger wizards as part of a flow
- Wizard steps can trigger flow animations for guidance
- Flow System manages wizard lifecycle in complex flows

**With Navigator System:**
- Wizard can be launched from navigator context
- Deep linking to specific wizard + step
- URL synchronization for wizard state (optional)

## Implementation Phases

### Phase 2.1: Core Wizard System (Priority: Immediate)

**Tasks:**
1. Create `shared/src/systems/flow/wizard/` directory structure
2. Extract and refactor `WorkflowWizard.tsx` → `Wizard.tsx`
3. Define core types (`WizardConfig`, `WizardStep`, `WizardState`)
4. Create `WizardSystem.ts` with state management
5. Create `useWizard` hook for React integration
6. Export from `@protogen/shared/systems/flow/wizard`

**Success Criteria:**
- Wizard renders with steps
- Navigation (back/next) works
- Data accumulates across steps
- Basic validation per step

### Phase 2.2: Dialog Integration (Priority: High)

**Tasks:**
1. Create wizard dialog variants (modal, drawer, full-screen)
2. Add `openWizard()` method to Dialog System or helper function
3. Wire up wizard completion → dialog close
4. Add confirmation dialog for cancel action
5. Test wizard in different dialog modes

**Success Criteria:**
- Wizard opens in modal/drawer via Dialog System
- Wizard closes on completion
- Cancel shows confirmation dialog
- UI looks good in all dialog modes

### Phase 2.3: Validation Framework (Priority: High)

**Tasks:**
1. Create `ValidationService.ts` for centralized validation
2. Support sync + async validation
3. Add field-level validation (per-field errors)
4. Add step-level validation (before proceeding)
5. Add cross-step validation (e.g., step 3 depends on step 1 data)
6. Create common validators (required, email, url, etc.)

**Success Criteria:**
- Validation runs on step completion
- Async validation (API checks) works
- Errors display clearly
- Users can't proceed with invalid data

### Phase 2.4: Enhanced Step Components (Priority: Medium)

**Tasks:**
1. Extract step components from admin workflows
2. Create reusable step primitives (FormStep, SelectionStep, ReviewStep)
3. Add guidance UI (tooltips, help text, visual indicators)
4. Add Tailwind ring support for focus guidance
5. Support conditional field display within steps

**Success Criteria:**
- Reusable step components available
- Guidance UI renders correctly
- Steps adapt to different wizard contexts

### Phase 2.5: Admin Wizard Configuration UI (Priority: Medium)

**Tasks:**
1. Create admin UI for configuring wizards
2. CRUD operations for wizard definitions
3. Step builder (add/remove/reorder steps)
4. Field builder (configure fields within steps)
5. Validation rule builder (attach validators to fields/steps)
6. Guidance configuration (add prompts, tooltips, help text)

**Success Criteria:**
- Admins can create/edit wizards via UI
- Wizard definitions persist to database
- Wizards load dynamically from configs
- Non-developers can build simple wizards

### Phase 2.6: Advanced Features (Priority: Low)

**Tasks:**
1. State persistence (auto-save progress)
2. Resume wizard from saved state
3. Conditional steps (show/hide based on previous answers)
4. Branching logic (step 2A vs 2B based on step 1)
5. Animation integration with Flow System (highlight, pulse, guide)
6. Multi-wizard flows (wizard A → wizard B)
7. Wizard templates (pre-configured for common tasks)

**Success Criteria:**
- Wizards auto-save progress
- Users can resume interrupted wizards
- Conditional logic works correctly
- Animations guide users effectively

## Types & Interfaces

### Core Types

```typescript
// Step Configuration
interface WizardStep {
  id: string;
  title: string;
  description?: string;
  component: React.ComponentType<WizardStepProps>;
  validation?: WizardStepValidation;
  isOptional?: boolean;
  isVisible?: (data: WizardData) => boolean; // Conditional visibility
  guidance?: WizardStepGuidance;
  onEnter?: (data: WizardData) => void | Promise<void>;
  onExit?: (data: WizardData) => void | Promise<void>;
}

// Step Component Props
interface WizardStepProps<T = any> {
  data: T;
  onDataChange: (data: Partial<T>) => void;
  errors: ValidationError[];
  isValidating: boolean;
  wizard: WizardContext;
}

// Wizard Configuration
interface WizardConfig {
  id: string;
  title: string;
  description?: string;
  steps: WizardStep[];
  initialData?: WizardData;
  onComplete: (data: WizardData) => void | Promise<void>;
  onCancel?: () => void;
  options?: WizardOptions;
}

// Wizard Options
interface WizardOptions {
  showProgress?: boolean;
  allowBack?: boolean;
  allowSkip?: boolean;
  allowSave?: boolean;
  confirmCancel?: boolean;
  autoSave?: boolean;
  autoSaveInterval?: number; // ms
  presentationMode?: 'modal' | 'drawer' | 'full-screen' | 'inline';
}

// Wizard State
interface WizardState {
  currentStepIndex: number;
  data: WizardData;
  errors: Map<string, ValidationError[]>; // stepId -> errors
  isValidating: boolean;
  isSaving: boolean;
  isComplete: boolean;
}

// Validation
interface WizardStepValidation {
  validate: (data: any, wizardData: WizardData) => ValidationResult | Promise<ValidationResult>;
  validateOnChange?: boolean;
  debounceMs?: number;
}

interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

interface ValidationError {
  field?: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

// Guidance
interface WizardStepGuidance {
  helpText?: string;
  tooltips?: Record<string, string>; // fieldId -> tooltip
  examples?: string[];
  focusRing?: {
    enabled: boolean;
    color?: string; // Tailwind color class
  };
  animations?: FlowAnimation[]; // Integrate with Flow System
}

// Wizard Context (provided to steps)
interface WizardContext {
  config: WizardConfig;
  state: WizardState;
  currentStep: WizardStep;
  isFirstStep: boolean;
  isLastStep: boolean;
  goToStep: (stepId: string) => void;
  goBack: () => void;
  goNext: () => void;
  save: () => Promise<void>;
  cancel: () => void;
}
```

### WizardSystem API

```typescript
class WizardSystem {
  // Create and open a wizard
  openWizard(config: WizardConfig, options?: WizardOptions): WizardInstance;
  
  // Resume a saved wizard
  resumeWizard(wizardId: string): WizardInstance | null;
  
  // Register wizard template
  registerTemplate(template: WizardTemplate): void;
  
  // Create wizard from template
  createFromTemplate(templateId: string, overrides?: Partial<WizardConfig>): WizardInstance;
  
  // State management
  saveWizardState(wizardId: string, state: WizardState): Promise<void>;
  loadWizardState(wizardId: string): Promise<WizardState | null>;
  clearWizardState(wizardId: string): Promise<void>;
  
  // Validation
  registerValidator(name: string, validator: ValidatorFunction): void;
  getValidator(name: string): ValidatorFunction | undefined;
}
```

## Migration Strategy

### Admin Site Migration

**Phase 1: Parallel Implementation**
1. Build wizard system in shared library
2. Keep existing admin wizards functional
3. Test new wizard system in portal first

**Phase 2: Incremental Migration**
1. Migrate `DeckWorkflow` to new system (simplest)
2. Migrate `SceneWorkflow` to new system
3. Add any missing features discovered during migration

**Phase 3: Complete Transition**
1. Update admin to import from `@protogen/shared/systems/flow/wizard`
2. Remove old `admin/src/components/workflows/WorkflowWizard.tsx`
3. Update all workflow usages to new API

### Portal Integration

**Use Cases:**
1. **User Onboarding:** Multi-step welcome wizard
2. **Profile Setup:** Complete user profile in steps
3. **Content Creation:** Guide users through creating content
4. **Settings Configuration:** Step-by-step settings updates

## Testing Strategy

### Unit Tests
- Wizard state management
- Step navigation logic
- Validation framework
- Data accumulation across steps

### Component Tests
- Wizard component rendering
- Step component integration
- Navigation button behavior
- Progress indicator accuracy

### Integration Tests
- Wizard + Dialog System integration
- Wizard + Flow System integration
- Validation with API calls
- State persistence and resume

### E2E Tests
- Complete wizard flows (admin + portal)
- Cancel and resume flows
- Validation error handling
- Cross-browser compatibility

## Success Metrics

1. **Functionality:** All existing admin wizards work with new system
2. **Extensibility:** New wizards can be created without modifying wizard core
3. **Usability:** Wizard UI is intuitive and guides users effectively
4. **Performance:** Wizards load quickly, validation is responsive
5. **Maintainability:** Code is modular, well-typed, and documented

## Timeline Estimate

- **Phase 2.1 (Core):** 4-6 hours
- **Phase 2.2 (Dialog):** 2-3 hours
- **Phase 2.3 (Validation):** 3-4 hours
- **Phase 2.4 (Enhanced Steps):** 3-4 hours
- **Phase 2.5 (Admin UI):** 6-8 hours (deferred)
- **Phase 2.6 (Advanced):** 8-10 hours (deferred)

**Immediate Focus:** Phases 2.1-2.4 (12-17 hours total)

## Next Steps

1. Review and approve this plan
2. Implement Phase 2.1 (Core Wizard System)
3. Implement Phase 2.2 (Dialog Integration)
4. Implement Phase 2.3 (Validation Framework)
5. Implement Phase 2.4 (Enhanced Step Components)
6. Test with existing admin workflows
7. Create portal example wizard
8. Document public API and usage patterns

