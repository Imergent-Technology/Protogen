/**
 * Full-Screen Dialog Component
 * 
 * Large dialog optimized for data management interfaces that takes up most of the viewport.
 */

import React from 'react';
import { X } from 'lucide-react';
import { Button } from '../../../components';
import type { Dialog } from '../types';
import { dialogSystem } from '../DialogSystem';

export interface FullScreenDialogProps {
  dialog: Dialog;
  zIndex?: number;
}

export const FullScreenDialog: React.FC<FullScreenDialogProps> = ({ dialog, zIndex }) => {
  const config = dialog.metadata || {};
  const {
    title,
    description,
    footer,
    headerActions,
    size = 'default',
  } = config;

  const closeOnEscape = dialog.closeOnEscape ?? true;
  const closeOnBackdrop = dialog.closeOnBackdrop ?? true;
  const showCloseButton = dialog.showCloseButton ?? true;

  // Handle escape key
  React.useEffect(() => {
    if (!closeOnEscape) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        dialogSystem.close(dialog.id);
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [closeOnEscape, dialog.id]);

  // Size-based max-width classes
  const sizeClass = size === 'large' ? 'max-w-7xl' : size === 'xlarge' ? 'max-w-[90vw]' : 'max-w-6xl';

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (closeOnBackdrop && e.target === e.currentTarget) {
      dialogSystem.close(dialog.id);
    }
  };

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center p-4" 
      style={{ zIndex }}
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" aria-hidden="true" />
      
      {/* Dialog Container */}
      <div 
        className={`relative bg-background rounded-lg shadow-xl ${sizeClass} max-h-[95vh] w-full flex flex-col`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'fullscreen-dialog-title' : undefined}
        aria-describedby={description ? 'fullscreen-dialog-description' : undefined}
      >
        {/* Header */}
        {(title || description || headerActions || showCloseButton) && (
          <div className="border-b px-6 py-4 flex-shrink-0">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                {title && (
                  <h2 id="fullscreen-dialog-title" className="text-xl font-semibold mb-1">
                    {title}
                  </h2>
                )}
                {description && (
                  <p id="fullscreen-dialog-description" className="text-sm text-muted-foreground">
                    {description}
                  </p>
                )}
              </div>
              
              {/* Header Actions */}
              {headerActions && (
                <div className="flex items-center gap-2 flex-shrink-0">
                  {headerActions}
                </div>
              )}
              
              {/* Close Button */}
              {showCloseButton && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => dialogSystem.close(dialog.id)}
                  className="flex-shrink-0"
                  aria-label="Close dialog"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        )}
        
        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {dialog.content}
        </div>
        
        {/* Footer */}
        {footer && (
          <div className="border-t px-6 py-4 flex-shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

