/**
 * ModalDialog Component
 * 
 * Standard modal dialog implementation
 */

import React, { useEffect } from 'react';
import type { Dialog } from '../types';
import { dialogSystem } from '../DialogSystem';
import {
  Dialog as DialogPrimitive,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '../../../components/ui-primitives/dialog';

export interface ModalDialogProps {
  dialog: Dialog;
  zIndex?: number;
}

export const ModalDialog: React.FC<ModalDialogProps> = ({ dialog, zIndex }) => {
  const config = dialog.metadata || {};
  const { title, description, footer, header, showHeader = true, showFooter = true } = config;

  // Handle escape key
  useEffect(() => {
    if (!dialog.closeOnEscape) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && dialogSystem.getActiveDialog()?.id === dialog.id) {
        dialogSystem.close(dialog.id);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [dialog.id, dialog.closeOnEscape]);

  const handleOpenChange = (open: boolean) => {
    if (!open && dialog.closeOnBackdrop) {
      dialogSystem.close(dialog.id);
    }
  };

  return (
    <DialogPrimitive open={dialog.isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        className={dialog.className}
        style={{ zIndex }}
      >
        {showHeader && (header || title) && (
          <DialogHeader>
            {header || (
              <>
                {title && <DialogTitle>{title}</DialogTitle>}
                {description && <DialogDescription>{description}</DialogDescription>}
              </>
            )}
          </DialogHeader>
        )}

        <div className="dialog-body">
          {dialog.content}
        </div>

        {showFooter && footer && (
          <DialogFooter>
            {footer}
          </DialogFooter>
        )}
      </DialogContent>
    </DialogPrimitive>
  );
};

export default ModalDialog;

