# Wizard to Flow System Migration Guide

## Overview

The Wizard System has been merged into the Flow System as the **Form Flow** sub-module. This provides a more powerful and unified approach to guided experiences while maintaining all wizard functionality.

**Status**: The Wizard System is now deprecated but will remain functional for 1 release cycle to allow for gradual migration.

## Why Migrate?

The Form Flow sub-module provides all wizard capabilities plus:

1. **Conditional Step Visibility**: Show/hide steps based on collected data
2. **Multi-Path Branching**: Different paths based on user choices
3. **Mixed Content**: Combine form steps with navigation or content steps
4. **Template System**: Reusable flow patterns
5. **Unified Architecture**: One system for all guided experiences

## Quick Migration Guide

### Before (Wizard)

```typescript
import { WizardConfig, wizardDialogService } from '@protogen/shared/systems/flow/wizard';

const config: WizardConfig = {
  id: 'create-scene',
  title: 'Create Scene',
  steps: [
    {
      id: 'basic',
      title: 'Basic Details',
      component: FormStep,
      validation: required,
    }
  ],
  onComplete: async (data) => {
    await createScene(data);
  }
};

wizardDialogService.openWizard(config);
```

### After (Form Flow)

```typescript
import { FormFlow, flowSystem, dialogSystem } from '@protogen/shared/systems/flow';
import { FormStep } from '@protogen/shared/systems/flow/form';

const flow: FormFlow = {
  id: 'create-scene',
  name: 'Create Scene',
  mode: 'guided',
  steps: [
    {
      id: 'basic',
      order: 1,
      title: 'Basic Details',
      step_type: 'form',
      component: FormStep,
      validation: required,
    }
  ],
  onComplete: async (data) => {
    await createScene(data);
  }
};

flowSystem.registerFlow(flow);
const instanceId = flowSystem.startFlow('create-scene');
// Render flow using FormFlowContainer or integrate with Dialog System
```

## Import Changes

### Old Imports
```typescript
import { WizardConfig, WizardStep, WizardOptions } from '@protogen/shared/systems/flow/wizard';
import { validationService } from '@protogen/shared/systems/flow/wizard';
import { FormStep, SelectionStep, ReviewStep } from '@protogen/shared/systems/flow/wizard';
```

### New Imports
```typescript
import { FormFlow, FlowStep, FlowSettings } from '@protogen/shared/systems/flow';
import { FormStepProps, ValidationService, validationService } from '@protogen/shared/systems/flow/form';
import { FormStep, SelectionStep, ReviewStep } from '@protogen/shared/systems/flow/form';
```

## Type Changes

| Wizard Type | Form Flow Type | Notes |
|-------------|----------------|-------|
| `WizardConfig` | `FormFlow` | Flow interface extended for forms |
| `WizardStep` | `FlowStep` with `step_type: 'form'` | More flexible step types |
| `WizardOptions` | `FormFlowSettings` | Extends FlowSettings |
| `WizardStepProps` | `FormStepProps` | Same concept, new name |
| `WizardStepGuidance` | `StepGuidance` | Moved to base flow types |

## Key Differences

### 1. Flow Registration

**Wizard**: Wizards were created inline
```typescript
const config: WizardConfig = { ... };
wizardDialogService.openWizard(config);
```

**Form Flow**: Flows should be registered first
```typescript
const flow: FormFlow = { ... };
flowSystem.registerFlow(flow);
const instanceId = flowSystem.startFlow('create-scene');
```

### 2. Step Configuration

**Wizard**: Steps had implicit ordering
```typescript
steps: [
  { id: 'step1', title: 'Step 1', component: FormStep },
  { id: 'step2', title: 'Step 2', component: FormStep }
]
```

**Form Flow**: Steps have explicit order and type
```typescript
steps: [
  { id: 'step1', order: 1, title: 'Step 1', step_type: 'form', component: FormStep },
  { id: 'step2', order: 2, title: 'Step 2', step_type: 'form', component: FormStep }
]
```

### 3. Validation

**Wizard**: Validation service accessible via wizard system
```typescript
import { validationService } from '@protogen/shared/systems/flow/wizard';
```

**Form Flow**: Validation service in form sub-module
```typescript
import { validationService } from '@protogen/shared/systems/flow/form';
```

## Advanced Features (New in Form Flow)

### Conditional Steps

```typescript
steps: [
  {
    id: 'basic-details',
    order: 1,
    step_type: 'form',
    component: FormStep
  },
  {
    id: 'advanced-config',
    order: 2,
    step_type: 'form',
    component: AdvancedConfigStep,
    condition: {
      field: 'mode',
      operator: 'equals',
      value: 'advanced'
    } // Only show if user selected 'advanced' mode
  }
]
```

### Branching

```typescript
const flow: FormFlow = {
  // ... other config
  steps: [ /* ... */ ],
  branches: [
    {
      id: 'graph-specific',
      from_step_id: 'basic-details',
      condition: {
        type: 'field',
        rule: { field: 'type', operator: 'equals', value: 'graph' }
      },
      target_step_id: 'graph-config'
    }
  ]
};
```

### Templates

```typescript
// Register a template
flowSystem.registerTemplate({
  id: 'scene-creation',
  name: 'Scene Creation Template',
  category: 'content-management',
  template: {
    name: 'Create Scene',
    mode: 'guided',
    steps: [ /* reusable steps */ ]
  }
});

// Use template
const flow = flowSystem.createFlowFromTemplate('scene-creation', {
  id: 'my-scene-creation',
  onComplete: async (data) => { /* custom logic */ }
});
```

## Step Component Migration

The step components (FormStep, SelectionStep, ReviewStep) work the same way with minor prop changes:

### FormStep

**No changes required** - props are compatible

### SelectionStep

**No changes required** - props are compatible

### ReviewStep

**No changes required** - props are compatible

## Common Patterns

### Simple Form Flow (Basic Wizard Replacement)

```typescript
import { FormFlow, flowSystem } from '@protogen/shared/systems/flow';
import { FormStep } from '@protogen/shared/systems/flow/form';

const createUserFlow: FormFlow = {
  id: 'create-user',
  name: 'Create User',
  mode: 'guided',
  steps: [
    {
      id: 'personal-info',
      order: 1,
      title: 'Personal Information',
      step_type: 'form',
      component: FormStep,
      props: {
        fields: [
          { id: 'firstName', label: 'First Name', type: 'text', required: true },
          { id: 'lastName', label: 'Last Name', type: 'text', required: true },
          { id: 'email', label: 'Email', type: 'email', required: true }
        ]
      }
    },
    {
      id: 'review',
      order: 2,
      title: 'Review',
      step_type: 'review',
      component: ReviewStep
    }
  ],
  onComplete: async (data) => {
    await createUser(data);
  }
};

flowSystem.registerFlow(createUserFlow);
```

### Multi-Step Form with Conditional Logic

```typescript
const advancedUserFlow: FormFlow = {
  id: 'advanced-user',
  name: 'Create Advanced User',
  mode: 'guided',
  steps: [
    {
      id: 'account-type',
      order: 1,
      title: 'Account Type',
      step_type: 'selection',
      component: SelectionStep,
      props: {
        options: [
          { value: 'basic', label: 'Basic User' },
          { value: 'admin', label: 'Administrator' }
        ]
      }
    },
    {
      id: 'admin-permissions',
      order: 2,
      title: 'Admin Permissions',
      step_type: 'form',
      component: FormStep,
      condition: {
        field: 'accountType',
        operator: 'equals',
        value: 'admin'
      },
      props: {
        fields: [
          { id: 'canManageUsers', label: 'Can Manage Users', type: 'checkbox' },
          { id: 'canManageContent', label: 'Can Manage Content', type: 'checkbox' }
        ]
      }
    }
  ],
  onComplete: async (data) => {
    await createUser(data);
  }
};
```

## Dialog Integration

### Opening Form Flow in Modal

```typescript
import { dialogSystem, flowSystem } from '@protogen/shared/systems/flow';
import { FormFlowContainer } from '@protogen/shared/systems/flow/form'; // Coming soon

// Register flow
flowSystem.registerFlow(myFormFlow);

// Start flow
const instanceId = flowSystem.startFlow('my-form-flow');

// Open in dialog
dialogSystem.openModal({
  title: myFormFlow.name,
  size: 'lg',
  content: <FormFlowContainer instanceId={instanceId} />
});
```

## Migration Checklist

- [ ] Update imports from `wizard` to `flow` and `flow/form`
- [ ] Change `WizardConfig` to `FormFlow`
- [ ] Add `order` and `step_type` to all steps
- [ ] Update `onComplete` callback if needed
- [ ] Register flows with `flowSystem.registerFlow()`
- [ ] Use `flowSystem.startFlow()` instead of `wizardDialogService.openWizard()`
- [ ] Update any custom step components to use `FormStepProps`
- [ ] Test all flows thoroughly

## Support

If you encounter any issues during migration:

1. Check this guide for common patterns
2. Review the feature parity document: `docs/active-development/WIZARD_FLOW_FEATURE_PARITY.md`
3. Examine the Flow System implementation: `shared/src/systems/flow/`

## Timeline

- **Current**: Wizard System deprecated, Form Flow available
- **Next Release**: Wizard System will be removed
- **Migration Window**: 1 release cycle

**Recommendation**: Migrate to Form Flow at your earliest convenience to take advantage of new features and ensure future compatibility.

