/**
 * Base Dialog Types
 * 
 * Core type definitions for the Dialog System
 */

import { ReactNode } from 'react';

// Dialog type enum
export type DialogType = 
  | 'modal'
  | 'drawer'
  | 'confirmation'
  | 'toast'
  | 'popover'
  | 'wizard'
  | 'comment-thread'
  | 'media-viewer'
  | 'form'
  | 'fullscreen'
  | 'custom';

// Dialog priority for z-index management
export type DialogPriority = 'low' | 'normal' | 'high' | 'critical';

// Dialog size variants
export type DialogSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

// Dialog position
export type DialogPosition = 
  | 'center'
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right';

// Animation variants
export type DialogAnimation = 'fade' | 'slide' | 'zoom' | 'none';

// Base dialog configuration
export interface BaseDialogConfig {
  id?: string; // Auto-generated if not provided
  type: DialogType;
  priority?: DialogPriority;
  size?: DialogSize;
  position?: DialogPosition;
  animation?: DialogAnimation;
  closeOnEscape?: boolean;
  closeOnBackdrop?: boolean;
  showCloseButton?: boolean;
  className?: string;
  zIndex?: number;
  onOpen?: () => void;
  onClose?: () => void;
  onBeforeClose?: () => boolean | Promise<boolean>; // Return false to prevent close
}

// Dialog state
export interface Dialog extends BaseDialogConfig {
  id: string; // Always present in state
  isOpen: boolean;
  content: ReactNode;
  metadata?: Record<string, any>;
  createdAt: number;
  updatedAt: number;
}

// Dialog system state
export interface DialogSystemState {
  dialogs: Dialog[];
  activeDialogId: string | null;
  stack: string[]; // Dialog IDs in z-index order (bottom to top)
}

// Dialog event types
export type DialogEvent =
  | { type: 'dialog-opened'; dialogId: string }
  | { type: 'dialog-closed'; dialogId: string }
  | { type: 'dialog-updated'; dialogId: string }
  | { type: 'stack-changed'; stack: string[] }
  | { type: 'active-changed'; dialogId: string | null };

// Dialog event handler
export type DialogEventHandler = (event: DialogEvent) => void;

// Dialog result type for dialogs that return values
export type DialogResult<T = any> = {
  confirmed: boolean;
  data?: T;
  cancelled?: boolean;
};

