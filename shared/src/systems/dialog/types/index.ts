/**
 * Dialog System Types
 * 
 * Central export for all dialog-related types
 */

// Base types
export * from './base';

// Specific dialog types
export * from './modal';
export * from './drawer';
export * from './confirmation';
export * from './toast';
export * from './popover';
export * from './wizard';
export * from './comment-thread';
export * from './media-viewer';
export * from './form';
export * from './fullscreen';
export * from './custom';

// Union type for all dialog configs
import type { ModalDialogConfig } from './modal';
import type { DrawerDialogConfig } from './drawer';
import type { ConfirmationDialogConfig } from './confirmation';
import type { ToastDialogConfig } from './toast';
import type { PopoverDialogConfig } from './popover';
import type { WizardDialogConfig } from './wizard';
import type { CommentThreadDialogConfig } from './comment-thread';
import type { MediaViewerDialogConfig } from './media-viewer';
import type { FormDialogConfig } from './form';
import type { FullScreenDialogConfig } from './fullscreen';
import type { CustomDialogConfig } from './custom';

export type DialogConfig =
  | ModalDialogConfig
  | DrawerDialogConfig
  | ConfirmationDialogConfig
  | ToastDialogConfig
  | PopoverDialogConfig
  | WizardDialogConfig
  | CommentThreadDialogConfig
  | MediaViewerDialogConfig
  | FormDialogConfig
  | FullScreenDialogConfig
  | CustomDialogConfig;

