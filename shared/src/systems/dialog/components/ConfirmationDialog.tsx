/**
 * ConfirmationDialog Component
 * 
 * Confirmation dialog for user actions
 */

import React from 'react';
import type { Dialog } from '../types';
import { dialogSystem } from '../DialogSystem';
import { Button } from '../../../components/ui-primitives/button';
import {
  Dialog as DialogPrimitive,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '../../../components/ui-primitives/dialog';

export interface ConfirmationDialogProps {
  dialog: Dialog;
  zIndex?: number;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({ dialog, zIndex }) => {
  const config = dialog.metadata || {};
  const {
    title,
    message,
    variant = 'default',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    onConfirm,
    onCancel
  } = config;

  const handleConfirm = async () => {
    await onConfirm?.();
    dialogSystem.close(dialog.id);
  };

  const handleCancel = () => {
    onCancel?.();
    dialogSystem.close(dialog.id);
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'destructive':
        return 'text-destructive';
      case 'warning':
        return 'text-warning';
      case 'info':
        return 'text-blue-600';
      default:
        return '';
    }
  };

  return (
    <DialogPrimitive open={dialog.isOpen}>
      <DialogContent className={dialog.className} style={{ zIndex }}>
        <DialogHeader>
          <DialogTitle className={getVariantStyles()}>{title}</DialogTitle>
          <DialogDescription>{message}</DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
          >
            {cancelText}
          </Button>
          <Button
            variant={variant === 'destructive' ? 'destructive' : 'default'}
            onClick={handleConfirm}
          >
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogPrimitive>
  );
};

export default ConfirmationDialog;

