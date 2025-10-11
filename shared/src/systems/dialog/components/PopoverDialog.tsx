/**
 * PopoverDialog Component
 * 
 * Popover dialog implementation (anchored to trigger element)
 */

import React from 'react';
import type { Dialog } from '../types';
import { dialogSystem } from '../DialogSystem';

export interface PopoverDialogProps {
  dialog: Dialog;
  zIndex?: number;
}

export const PopoverDialog: React.FC<PopoverDialogProps> = ({ dialog, zIndex }) => {
  // TODO: Full popover implementation with positioning
  // For now, render as simple floating element
  
  const handleClose = () => {
    if (dialog.closeOnBackdrop) {
      dialogSystem.close(dialog.id);
    }
  };

  if (!dialog.isOpen) return null;

  return (
    <>
      {dialog.closeOnBackdrop && (
        <div
          className="fixed inset-0"
          style={{ zIndex: zIndex ? zIndex - 1 : undefined }}
          onClick={handleClose}
        />
      )}
      
      <div
        className={`fixed bg-background border rounded-lg shadow-lg p-4 animate-in fade-in zoom-in-95 ${dialog.className || ''}`}
        style={{
          zIndex,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)'
        }}
      >
        {dialog.content}
      </div>
    </>
  );
};

export default PopoverDialog;

