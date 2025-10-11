/**
 * FormDialog Component
 * 
 * Form dialog implementation
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

export interface FormDialogProps {
  dialog: Dialog;
  zIndex?: number;
}

export const FormDialog: React.FC<FormDialogProps> = ({ dialog, zIndex }) => {
  const config = dialog.metadata || {};
  const {
    title,
    description,
    formContent,
    onSubmit,
    onCancel,
    submitText = 'Submit',
    cancelText = 'Cancel',
    showFooter = true
  } = config;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Form data will be passed from formContent
    onSubmit?.({}); 
  };

  const handleCancel = () => {
    onCancel?.();
    dialogSystem.close(dialog.id);
  };

  return (
    <DialogPrimitive open={dialog.isOpen}>
      <DialogContent className={dialog.className} style={{ zIndex }}>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>

          <div className="py-4">
            {formContent || dialog.content}
          </div>

          {showFooter && (
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
              >
                {cancelText}
              </Button>
              <Button type="submit">
                {submitText}
              </Button>
            </DialogFooter>
          )}
        </form>
      </DialogContent>
    </DialogPrimitive>
  );
};

export default FormDialog;

