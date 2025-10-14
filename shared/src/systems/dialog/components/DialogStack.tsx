/**
 * DialogStack Component
 * 
 * Manages rendering of multiple dialogs with proper z-index layering
 */

import React from 'react';
import type { Dialog } from '../types';
import { dialogSystem } from '../DialogSystem';
import { ModalDialog } from './ModalDialog';
import { DrawerDialog } from './DrawerDialog';
import { ConfirmationDialog } from './ConfirmationDialog';
import { ToastDialog } from './ToastDialog';
import { PopoverDialog } from './PopoverDialog';
import { CommentThreadDialog } from './CommentThreadDialog';
import { MediaViewerDialog } from './MediaViewerDialog';
import { FormDialog } from './FormDialog';
import { FullScreenDialog } from './FullScreenDialog';

export interface DialogStackProps {
  dialogs: Dialog[];
}

export const DialogStack: React.FC<DialogStackProps> = ({ dialogs }) => {
  // Render appropriate component based on dialog type
  const renderDialog = (dialog: Dialog) => {
    const zIndex = dialogSystem.getZIndex(dialog.id);
    const commonProps = {
      key: dialog.id,
      dialog,
      zIndex
    };

    switch (dialog.type) {
      case 'modal':
        return <ModalDialog {...commonProps} />;
      
      case 'drawer':
        return <DrawerDialog {...commonProps} />;
      
      case 'confirmation':
        return <ConfirmationDialog {...commonProps} />;
      
      case 'toast':
        return <ToastDialog {...commonProps} />;
      
      case 'popover':
        return <PopoverDialog {...commonProps} />;
      
      case 'comment-thread':
        return <CommentThreadDialog {...commonProps} />;
      
      case 'media-viewer':
        return <MediaViewerDialog {...commonProps} />;
      
      case 'form':
        return <FormDialog {...commonProps} />;
      
      case 'fullscreen':
        return <FullScreenDialog {...commonProps} />;
      
      case 'wizard':
        // Wizard will be implemented when we extract from admin
        return null;
      
      case 'custom':
        // Custom dialogs render their content directly
        return (
          <div
            key={dialog.id}
            style={{ zIndex }}
            className={dialog.className}
          >
            {dialog.content}
          </div>
        );
      
      default:
        console.warn(`Unknown dialog type: ${dialog.type}`);
        return null;
    }
  };

  return (
    <>
      {dialogs.map(renderDialog)}
    </>
  );
};

export default DialogStack;

