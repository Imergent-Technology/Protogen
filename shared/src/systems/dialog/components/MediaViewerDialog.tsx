/**
 * MediaViewerDialog Component
 * 
 * Media viewer dialog for images, videos, etc.
 */

import React from 'react';
import type { Dialog } from '../types';
import { dialogSystem } from '../DialogSystem';

export interface MediaViewerDialogProps {
  dialog: Dialog;
  zIndex?: number;
}

export const MediaViewerDialog: React.FC<MediaViewerDialogProps> = ({ dialog, zIndex }) => {
  // TODO: Full media viewer implementation
  // Placeholder for now

  const handleClose = () => {
    dialogSystem.close(dialog.id);
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/90"
        style={{ zIndex: zIndex ? zIndex - 1 : undefined }}
        onClick={handleClose}
      />
      
      <div
        className={`fixed inset-0 flex items-center justify-center ${dialog.className || ''}`}
        style={{ zIndex }}
      >
        <div className="relative max-w-7xl max-h-screen p-4">
          {dialog.showCloseButton && (
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/70"
            >
              ✕
            </button>
          )}
          
          {dialog.content}
        </div>
      </div>
    </>
  );
};

export default MediaViewerDialog;

