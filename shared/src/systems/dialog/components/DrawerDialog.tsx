/**
 * DrawerDialog Component
 * 
 * Drawer/Sheet dialog implementation (slides in from side)
 */

import React from 'react';
import type { Dialog } from '../types';
import { dialogSystem } from '../DialogSystem';

export interface DrawerDialogProps {
  dialog: Dialog;
  zIndex?: number;
}

export const DrawerDialog: React.FC<DrawerDialogProps> = ({ dialog, zIndex }) => {
  const config = dialog.metadata || {};
  const { title, description, footer, side = 'right', width = '400px' } = config;

  const getSideStyles = () => {
    switch (side) {
      case 'left':
        return 'left-0 top-0 bottom-0 animate-in slide-in-from-left';
      case 'right':
        return 'right-0 top-0 bottom-0 animate-in slide-in-from-right';
      case 'top':
        return 'top-0 left-0 right-0 animate-in slide-in-from-top';
      case 'bottom':
        return 'bottom-0 left-0 right-0 animate-in slide-in-from-bottom';
      default:
        return 'right-0 top-0 bottom-0 animate-in slide-in-from-right';
    }
  };

  const handleClose = () => {
    dialogSystem.close(dialog.id);
  };

  if (!dialog.isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      {dialog.closeOnBackdrop && (
        <div
          className="fixed inset-0 bg-black/50 animate-in fade-in"
          style={{ zIndex: zIndex ? zIndex - 1 : undefined }}
          onClick={handleClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed bg-background border shadow-lg ${getSideStyles()} ${dialog.className || ''}`}
        style={{
          zIndex,
          width: (side === 'left' || side === 'right') ? width : 'auto'
        }}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          {title && (
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-lg font-semibold">{title}</h2>
                {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
              </div>
              {dialog.showCloseButton && (
                <button
                  onClick={handleClose}
                  className="rounded-sm opacity-70 hover:opacity-100"
                >
                  ✕
                </button>
              )}
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {dialog.content}
          </div>

          {/* Footer */}
          {footer && (
            <div className="p-6 border-t">
              {footer}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default DrawerDialog;

