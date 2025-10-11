/**
 * DialogContainer Component
 * 
 * Root container for rendering all dialogs
 * Manages portal rendering and dialog lifecycle
 */

import React from 'react';
import { createPortal } from 'react-dom';
import { useDialogs } from '../useDialog';
import { DialogStack } from './DialogStack';

export interface DialogContainerProps {
  /**
   * DOM element to render dialogs into
   * Defaults to document.body
   */
  container?: HTMLElement;
  
  /**
   * Class name for the container
   */
  className?: string;
}

export const DialogContainer: React.FC<DialogContainerProps> = ({
  container,
  className = ''
}) => {
  const dialogs = useDialogs();
  const [mounted, setMounted] = React.useState(false);

  // Ensure we only render on client side
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const targetContainer = container || (typeof document !== 'undefined' ? document.body : null);

  if (!targetContainer) {
    return null;
  }

  const content = (
    <div className={`dialog-container ${className}`} data-dialog-container>
      <DialogStack dialogs={dialogs} />
    </div>
  );

  return createPortal(content, targetContainer);
};

export default DialogContainer;

