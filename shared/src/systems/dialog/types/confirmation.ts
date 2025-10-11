/**
 * Confirmation Dialog Types
 */

import { BaseDialogConfig } from './base';

export type ConfirmationVariant = 'default' | 'destructive' | 'warning' | 'info';

export interface ConfirmationDialogConfig extends BaseDialogConfig {
  type: 'confirmation';
  title: string;
  message: string;
  variant?: ConfirmationVariant;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
}

