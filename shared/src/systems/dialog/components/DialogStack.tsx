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
    // Extract key separately - React doesn't allow spreading key prop
    const dialogProps = {
      dialog,
      zIndex
    };

    switch (dialog.type) {
      case 'modal':
        return <ModalDialog key={dialog.id} {...dialogProps} />;
      
      case 'drawer':
        return <DrawerDialog key={dialog.id} {...dialogProps} />;
      
      case 'confirmation':
        return <ConfirmationDialog key={dialog.id} {...dialogProps} />;
      
      case 'toast':
        return <ToastDialog key={dialog.id} {...dialogProps} />;
      
      case 'popover':
        return <PopoverDialog key={dialog.id} {...dialogProps} />;
      
      case 'comment-thread':
        return <CommentThreadDialog key={dialog.id} {...dialogProps} />;
      
      case 'media-viewer':
        return <MediaViewerDialog key={dialog.id} {...dialogProps} />;
      
      case 'form':
        return <FormDialog key={dialog.id} {...dialogProps} />;
      
      case 'fullscreen':
        return <FullScreenDialog key={dialog.id} {...dialogProps} />;
      
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

