/**
 * Dialog System
 * 
 * Public API for the Dialog System
 */

// Core system
export { DialogSystem, dialogSystem } from './DialogSystem';

// React hooks
export {
  useDialog,
  useDialogState,
  useActiveDialog,
  useDialogSystem,
  useDialogs,
  useHasOpenDialogs
} from './useDialog';

// Types
export * from './types';

// Components (will be added as we implement them)
export * from './components/DialogContainer';
export * from './components/DialogStack';
export * from './components/ModalDialog';
export * from './components/DrawerDialog';
export * from './components/ConfirmationDialog';
export * from './components/ToastDialog';
export * from './components/PopoverDialog';
export * from './components/CommentThreadDialog';
export * from './components/MediaViewerDialog';
export * from './components/FormDialog';

// Services (internal, but exported for advanced use cases)
export { dialogStateService } from './services/DialogStateService';
export { dialogStackService } from './services/DialogStackService';
export { dialogAnimationService } from './services/DialogAnimationService';

