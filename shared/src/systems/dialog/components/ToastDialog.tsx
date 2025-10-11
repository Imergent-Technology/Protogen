/**
 * ToastDialog Component
 * 
 * Toast notification implementation
 */

import React from 'react';
import type { Dialog } from '../types';
import { dialogSystem } from '../DialogSystem';
import { X } from 'lucide-react';

export interface ToastDialogProps {
  dialog: Dialog;
  zIndex?: number;
}

export const ToastDialog: React.FC<ToastDialogProps> = ({ dialog, zIndex }) => {
  const config = dialog.metadata || {};
  const {
    message,
    title,
    variant = 'default',
    action,
    icon
  } = config;

  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-900';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-900';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-900';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-900';
      default:
        return 'bg-background border-border';
    }
  };

  const handleClose = () => {
    dialogSystem.close(dialog.id);
  };

  return (
    <div
      className={`fixed bottom-4 right-4 max-w-sm p-4 rounded-lg border shadow-lg animate-in slide-in-from-bottom-5 ${getVariantStyles()} ${dialog.className || ''}`}
      style={{ zIndex }}
      role="alert"
    >
      <div className="flex items-start gap-3">
        {icon && (
          <div className="flex-shrink-0">
            {icon}
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          {title && (
            <div className="font-semibold mb-1">
              {title}
            </div>
          )}
          <div className="text-sm">
            {message}
          </div>
          {action && (
            <button
              onClick={action.onClick}
              className="mt-2 text-sm font-medium underline hover:no-underline"
            >
              {action.label}
            </button>
          )}
        </div>

        {dialog.showCloseButton && (
          <button
            onClick={handleClose}
            className="flex-shrink-0 p-1 rounded-md hover:bg-black/5 transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ToastDialog;

