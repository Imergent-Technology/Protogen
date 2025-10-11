/**
 * CommentThreadDialog Component
 * 
 * Comment thread dialog (to be implemented with Comment System)
 */

import React from 'react';
import type { Dialog } from '../types';
import { dialogSystem } from '../DialogSystem';

export interface CommentThreadDialogProps {
  dialog: Dialog;
  zIndex?: number;
}

export const CommentThreadDialog: React.FC<CommentThreadDialogProps> = ({ dialog, zIndex }) => {
  // TODO: Implement with Comment System integration
  // Placeholder implementation
  
  const config = dialog.metadata || {};
  const { title = 'Comments', targetId, targetType } = config;

  const handleClose = () => {
    dialogSystem.close(dialog.id);
  };

  return (
    <div
      className={`fixed right-0 top-0 bottom-0 w-96 bg-background border-l shadow-lg animate-in slide-in-from-right ${dialog.className || ''}`}
      style={{ zIndex }}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={handleClose} className="p-1 hover:bg-accent rounded">✕</button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          <p className="text-sm text-muted-foreground">
            Comment thread for {targetType} {targetId}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            (To be implemented with Comment System)
          </p>
        </div>
      </div>
    </div>
  );
};

export default CommentThreadDialog;

