# Dialog System Architecture

**Status**: ✅ Implemented (Phase 1 Complete)  
**Location**: `shared/src/systems/dialog/`  
**Package**: `@protogen/shared`  
**Import Path**: `@protogen/shared/systems/dialog`

---

## Overview

The Dialog System is a comprehensive, extensible system for managing all non-scene user interactions in Protogen. It provides a unified API for modals, drawers, confirmations, toasts, forms, and custom dialogs with proper z-index management, animations, and accessibility features.

---

## Core Concept

**Dialogs are the primary UI pattern for auxiliary interactions**. While scenes handle main content navigation, dialogs orchestrate all secondary interactions: notifications, forms, confirmations, comment threads, media viewers, and wizards.

---

## Architecture

### System Components

```
shared/src/systems/dialog/
├── DialogSystem.ts              # Core system class (singleton)
├── useDialog.ts                 # React hooks
├── types/                       # Dialog type definitions
│   ├── base.ts                  # Base dialog types
│   ├── modal.ts                 # Modal dialog config
│   ├── drawer.ts                # Drawer dialog config
│   ├── confirmation.ts          # Confirmation dialog config
│   ├── toast.ts                 # Toast notification config
│   ├── popover.ts               # Popover dialog config
│   ├── form.ts                  # Form dialog config
│   ├── comment-thread.ts        # Comment thread dialog config
│   ├── media-viewer.ts          # Media viewer dialog config
│   ├── wizard.ts                # Wizard dialog config (for Flow System)
│   └── custom.ts                # Custom extensible dialog config
├── components/
│   ├── DialogContainer.tsx      # Root portal container
│   ├── DialogStack.tsx          # Z-index/layer manager
│   ├── ModalDialog.tsx          # Modal implementation
│   ├── DrawerDialog.tsx         # Drawer implementation
│   ├── ConfirmationDialog.tsx   # Confirmation implementation
│   ├── ToastDialog.tsx          # Toast implementation
│   ├── PopoverDialog.tsx        # Popover implementation
│   ├── FormDialog.tsx           # Form dialog implementation
│   ├── CommentThreadDialog.tsx  # Comment thread implementation
│   └── MediaViewerDialog.tsx    # Media viewer implementation
└── services/
    ├── DialogStateService.ts    # State management
    ├── DialogStackService.ts    # Z-index/layering
    └── DialogAnimationService.ts # Transitions
```

---

## Dialog Types

### 1. Modal Dialog

Standard centered modal with backdrop.

```typescript
const { openModal, close } = useDialog();

const dialogId = openModal({
  title: "Edit Profile",
  content: <ProfileForm />,
  size: 'lg',
  closeOnEscape: true,
  closeOnBackdrop: true,
  animation: 'fade'
});
```

**Use Cases**: Forms, content editing, detailed views, settings

### 2. Drawer Dialog

Slide-in panel from screen edges.

```typescript
const { openDrawer } = useDialog();

openDrawer({
  title: "Notifications",
  content: <NotificationList />,
  side: 'right', // 'left' | 'right' | 'top' | 'bottom'
  size: 'md',
  animation: 'slide'
});
```

**Use Cases**: Navigation menus, filters, notifications, bookmarks

### 3. Confirmation Dialog

Promise-based yes/no confirmation.

```typescript
const { openConfirmation } = useDialog();

const confirmed = await openConfirmation({
  title: "Delete Scene",
  message: "Are you sure you want to delete this scene? This action cannot be undone.",
  confirmText: "Delete",
  cancelText: "Cancel",
  variant: 'destructive'
});

if (confirmed) {
  // Proceed with deletion
}
```

**Use Cases**: Destructive actions, important decisions

### 4. Toast Notification

Auto-dismissing notification.

```typescript
const { openToast } = useDialog();

openToast("Scene saved successfully", {
  title: "Success",
  variant: 'success',
  duration: 3000,
  position: 'top-right'
});
```

**Use Cases**: Success messages, errors, info notifications

### 5. Popover Dialog

Contextual popover positioned relative to trigger element.

```typescript
const { openPopover } = useDialog();

openPopover({
  triggerRef: buttonRef,
  content: <ContextMenu items={menuItems} />,
  placement: 'bottom-start',
  closeOnClickOutside: true
});
```

**Use Cases**: Context menus, tooltips, dropdowns

### 6. Form Dialog

Promise-based form submission.

```typescript
const { openForm } = useDialog();

const formData = await openForm({
  title: "Create Scene",
  fields: sceneFormFields,
  onValidate: validateSceneData
});

if (formData) {
  // Submit form data
  await createScene(formData);
}
```

**Use Cases**: Data entry, quick forms, inline editing

### 7. Comment Thread Dialog

Display and interact with comment threads.

```typescript
const { openCommentThread } = useDialog();

openCommentThread({
  targetId: sceneId,
  targetType: 'scene',
  comments: existingComments,
  onReply: handleReply,
  onEdit: handleEdit,
  onDelete: handleDelete
});
```

**Use Cases**: Comments, discussions, replies (Phase 4 integration)

### 8. Media Viewer Dialog

Full-screen media viewer.

```typescript
const { openMediaViewer } = useDialog();

openMediaViewer({
  mediaUrl: imageUrl,
  mediaType: 'image',
  title: "Scene Thumbnail",
  allowDownload: true
});
```

**Use Cases**: Image galleries, video playback, document preview

### 9. Wizard Dialog

Multi-step wizard (integrates with Flow System).

```typescript
const { openWizard } = useDialog();

const result = await openWizard({
  wizardId: 'create-scene-wizard',
  steps: wizardSteps,
  onStepComplete: handleStepComplete,
  onComplete: handleWizardComplete
});
```

**Use Cases**: Multi-step forms, onboarding, setup wizards (Phase 5)

### 10. Custom Dialog

Fully extensible custom dialogs.

```typescript
const { openCustom } = useDialog();

openCustom({
  type: 'my-custom-dialog',
  content: <MyCustomComponent />,
  config: customConfig
});
```

**Use Cases**: Advanced custom UI, specialized interactions

---

## React Hooks

### `useDialog()`

Main hook for dialog operations.

```typescript
const {
  // Open dialogs
  openModal,
  openDrawer,
  openConfirmation,
  openToast,
  openPopover,
  openForm,
  openCommentThread,
  openMediaViewer,
  openWizard,
  openCustom,
  
  // Close dialogs
  close,
  closeAll,
  closeByType
} = useDialog();
```

### `useDialogState(dialogId)`

Subscribe to specific dialog state.

```typescript
const dialogState = useDialogState('my-dialog-id');
// { isOpen, isFocused, zIndex, ... }
```

### `useActiveDialog()`

Get currently active (focused) dialog.

```typescript
const activeDialog = useActiveDialog();
```

### `useDialogSystem()`

Subscribe to entire dialog system state.

```typescript
const { dialogs, activeDialogId, stack } = useDialogSystem();
```

### `useDialogs()`

Get all open dialogs.

```typescript
const openDialogs = useDialogs();
```

### `useHasOpenDialogs()`

Check if any dialogs are open.

```typescript
const hasOpenDialogs = useHasOpenDialogs();
```

---

## Features

### Z-Index Management

Automatic z-index calculation based on priority and order:

```typescript
// Base z-indexes
toast: 9999,
popover: 9000,
drawer: 8000,
modal: 7000

// Stacking: Each new dialog increments by 10
// dialog1: 7000
// dialog2: 7010
// dialog3: 7020
```

### Animations

Built-in animation types:

- **fade**: Fade in/out
- **slide**: Slide from direction
- **zoom**: Scale up/down
- **none**: No animation

All animations use CSS transitions with GPU acceleration.

### Keyboard Navigation

- **Escape**: Close topmost dialog (if `closeOnEscape: true`)
- **Tab**: Focus trapped within dialog
- **Arrow Keys**: Navigate within dialog content

### Accessibility

- ARIA labels and roles
- Focus management
- Screen reader announcements
- Keyboard navigation
- Color contrast compliance

### Multiple Concurrent Dialogs

Support for multiple dialogs open simultaneously with proper stacking and focus management.

---

## Integration with Other Systems

### Navigator System

Dialogs can trigger navigation:

```typescript
openModal({
  title: "Navigate?",
  content: <NavigationPrompt />,
  onConfirm: () => {
    navigateTo({ sceneId: 'target-scene' });
  }
});
```

### Scene System

Scenes can open dialogs for auxiliary interactions:

```typescript
// In a scene component
const { openToast } = useDialog();

const handleSceneLoad = () => {
  openToast("Scene loaded successfully");
};
```

### Flow System (Phase 5)

Wizards integrate with Flow System for multi-step experiences:

```typescript
const flow = {
  steps: [
    { type: 'scene', sceneId: 'intro' },
    { type: 'dialog', dialogType: 'wizard', wizardId: 'setup' },
    { type: 'scene', sceneId: 'complete' }
  ]
};
```

---

## Usage Examples

### Success Notification

```typescript
const handleSave = async () => {
  await saveScene();
  openToast("Scene saved successfully", {
    variant: 'success',
    duration: 3000
  });
};
```

### Confirmation Before Delete

```typescript
const handleDelete = async (sceneId: string) => {
  const confirmed = await openConfirmation({
    title: "Delete Scene",
    message: "This action cannot be undone.",
    variant: 'destructive'
  });
  
  if (confirmed) {
    await deleteScene(sceneId);
    openToast("Scene deleted", { variant: 'info' });
  }
};
```

### Form in Modal

```typescript
const handleCreateScene = async () => {
  const formData = await openForm({
    title: "Create New Scene",
    fields: [
      { name: 'name', type: 'text', label: 'Name', required: true },
      { name: 'description', type: 'textarea', label: 'Description' },
      { name: 'type', type: 'select', label: 'Type', options: sceneTypes }
    ]
  });
  
  if (formData) {
    await createScene(formData);
    openToast("Scene created", { variant: 'success' });
  }
};
```

### Drawer with Filters

```typescript
const openFilters = () => {
  openDrawer({
    title: "Filters",
    side: 'right',
    content: <FilterPanel onApply={handleApplyFilters} />,
    size: 'sm'
  });
};
```

---

## Best Practices

### 1. Use Appropriate Dialog Types

- **Toast**: Quick feedback, non-blocking
- **Confirmation**: Yes/no decisions
- **Modal**: Complex forms, detailed views
- **Drawer**: Navigation, filters, side content
- **Popover**: Context menus, small options

### 2. Keep Dialogs Focused

Each dialog should have a single, clear purpose.

### 3. Provide Clear Actions

Always have clear primary/secondary actions and labels.

### 4. Handle Loading States

Show loading indicators within dialogs for async operations.

### 5. Error Handling

Display errors within the dialog context, not as separate dialogs.

### 6. Avoid Dialog Chains

Minimize opening dialogs from within dialogs. Use wizards for multi-step flows.

---

## Configuration

### Global Dialog Configuration

```typescript
// In app initialization
dialogSystem.configure({
  defaultAnimation: 'fade',
  defaultCloseOnEscape: true,
  defaultCloseOnBackdrop: true,
  toastPosition: 'top-right',
  toastDuration: 3000
});
```

### Per-Dialog Configuration

Each dialog type supports extensive configuration options. See type definitions in `shared/src/systems/dialog/types/`.

---

## TypeScript Support

Full TypeScript support with:

- **Discriminated unions** for type-safe dialog configs
- **Branded types** for dialog IDs
- **Generic type parameters** for dialog results
- **Strict null checks** for optional fields

```typescript
// Type-safe dialog opening
const dialogId: DialogId = openModal(config);

// Type-safe confirmation result
const result: boolean = await openConfirmation(config);

// Type-safe form result
const data: FormData | null = await openForm<FormData>(config);
```

---

## Performance

- **Lazy loading**: Dialog components loaded on demand
- **Virtual scrolling**: For long lists in dialogs
- **GPU acceleration**: CSS transforms for animations
- **Memory management**: Dialogs destroyed when closed
- **Event delegation**: Efficient event handling

---

## Testing

Dialog System is fully testable:

```typescript
import { dialogSystem } from '@protogen/shared/systems/dialog';

test('opens modal dialog', () => {
  const dialogId = dialogSystem.openModal({ title: 'Test' });
  expect(dialogSystem.isOpen(dialogId)).toBe(true);
});

test('confirmation returns promise', async () => {
  const promise = dialogSystem.openConfirmation({ message: 'Confirm?' });
  // Simulate user confirmation
  dialogSystem.confirmDialog(dialogId);
  const result = await promise;
  expect(result).toBe(true);
});
```

---

## Future Enhancements

### Phase 3+

- **Drag-and-drop**: Draggable dialog positioning
- **Resize**: Resizable modals
- **Minimize**: Minimize dialogs to taskbar
- **Persistent dialogs**: Remember state across sessions
- **Dialog history**: Navigate back through dialog stack
- **Themes**: Customizable dialog themes
- **Animations**: Additional animation presets

---

## Related Documentation

- [Scene-Oriented Dialog Architecture](../architectural-realignment-plan.plan.md)
- [Scene System Architecture](./SCENE_FIRST_ROUTING.md)
- [Navigator System Architecture](./NAVIGATOR_SYSTEMS_ARCHITECTURE.md)
- [Flow System Architecture](./WIZARD_SYSTEM_ARCHITECTURE.md) (Phase 5)

---

## Status & Roadmap

### ✅ Phase 1 Complete

- [x] Core Dialog System
- [x] All dialog types implemented
- [x] React hooks
- [x] Dialog components
- [x] Z-index management
- [x] Animations
- [x] Accessibility
- [x] TypeScript support
- [x] Portal integration
- [x] Multiple concurrent dialogs

### 🔄 Phase 3-5 Integration

- [ ] Toolbar/Menu dialogs (Phase 3)
- [ ] Comment thread dialogs (Phase 4)
- [ ] Bookmark dialogs (Phase 4)
- [ ] Wizard dialogs (Phase 5)

---

**Last Updated**: 2025-01-11  
**Version**: 1.0.0  
**Maintainer**: Protogen Core Team

