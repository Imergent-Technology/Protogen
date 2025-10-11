/**
 * Toast/Notification Dialog Types
 */

import { ReactNode } from 'react';
import { BaseDialogConfig } from './base';

export type ToastVariant = 'default' | 'success' | 'error' | 'warning' | 'info';

export interface ToastDialogConfig extends BaseDialogConfig {
  type: 'toast';
  message: string;
  title?: string;
  variant?: ToastVariant;
  duration?: number; // Auto-close after ms (0 = no auto-close)
  action?: {
    label: string;
    onClick: () => void;
  };
  icon?: ReactNode;
}

