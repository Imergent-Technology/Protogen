/**
 * useDialog Hook
 * 
 * React hooks for interacting with the Dialog System
 */

import { useEffect, useState, useCallback } from 'react';
import { dialogSystem } from './DialogSystem';
import type {
  Dialog,
  DialogSystemState,
  ModalDialogConfig,
  DrawerDialogConfig,
  ConfirmationDialogConfig,
  ToastDialogConfig,
  PopoverDialogConfig,
  CommentThreadDialogConfig,
  MediaViewerDialogConfig,
  FormDialogConfig,
  CustomDialogConfig,
  WizardDialogConfig
} from './types';

export function useDialog() {
  // Modal dialog
  const openModal = useCallback((config: Omit<ModalDialogConfig, 'type'>) => {
    return dialogSystem.openModal(config);
  }, []);

  // Drawer dialog
  const openDrawer = useCallback((config: Omit<DrawerDialogConfig, 'type'>) => {
    return dialogSystem.openDrawer(config);
  }, []);

  // Confirmation dialog
  const openConfirmation = useCallback((config: Omit<ConfirmationDialogConfig, 'type'>) => {
    return dialogSystem.openConfirmation(config);
  }, []);

  // Toast notification
  const openToast = useCallback((
    message: string,
    options?: Partial<Omit<ToastDialogConfig, 'type' | 'message'>>
  ) => {
    return dialogSystem.openToast({ message, ...options });
  }, []);

  // Popover dialog
  const openPopover = useCallback((config: Omit<PopoverDialogConfig, 'type'>) => {
    return dialogSystem.openPopover(config);
  }, []);

  // Comment thread dialog
  const openCommentThread = useCallback((config: Omit<CommentThreadDialogConfig, 'type'>) => {
    return dialogSystem.openCommentThread(config);
  }, []);

  // Media viewer dialog
  const openMediaViewer = useCallback((config: Omit<MediaViewerDialogConfig, 'type'>) => {
    return dialogSystem.openMediaViewer(config);
  }, []);

  // Form dialog
  const openForm = useCallback((config: Omit<FormDialogConfig, 'type'>) => {
    return dialogSystem.openForm(config);
  }, []);

  // Custom dialog
  const openCustom = useCallback((config: Omit<CustomDialogConfig, 'type'>) => {
    return dialogSystem.openCustom(config);
  }, []);

  // Wizard dialog
  const openWizard = useCallback((config: Omit<WizardDialogConfig, 'type'>) => {
    return dialogSystem.openWizard(config);
  }, []);

  // Close dialog
  const close = useCallback((dialogId: string) => {
    return dialogSystem.close(dialogId);
  }, []);

  // Close all dialogs
  const closeAll = useCallback(() => {
    return dialogSystem.closeAll();
  }, []);

  // Bring dialog to front
  const bringToFront = useCallback((dialogId: string) => {
    dialogSystem.bringToFront(dialogId);
  }, []);

  // Check if dialog is open
  const isOpen = useCallback((dialogId: string) => {
    return dialogSystem.isOpen(dialogId);
  }, []);

  return {
    // Open methods
    openModal,
    openDrawer,
    openConfirmation,
    openToast,
    openPopover,
    openCommentThread,
    openMediaViewer,
    openForm,
    openCustom,
    openWizard,
    
    // Close methods
    close,
    closeAll,
    
    // Other methods
    bringToFront,
    isOpen
  };
}

/**
 * Hook to subscribe to a specific dialog's state
 */
export function useDialogState(dialogId: string): Dialog | null {
  const [dialog, setDialog] = useState<Dialog | null>(() => {
    return dialogSystem.getState().dialogs.find(d => d.id === dialogId) || null;
  });

  useEffect(() => {
    const updateDialog = () => {
      const currentDialog = dialogSystem.getState().dialogs.find(d => d.id === dialogId);
      setDialog(currentDialog || null);
    };

    // Subscribe to dialog events
    const unsubscribeUpdated = dialogSystem.on('dialog-updated', (event) => {
      if (event.type === 'dialog-updated' && event.dialogId === dialogId) {
        updateDialog();
      }
    });

    const unsubscribeClosed = dialogSystem.on('dialog-closed', (event) => {
      if (event.type === 'dialog-closed' && event.dialogId === dialogId) {
        setDialog(null);
      }
    });

    return () => {
      unsubscribeUpdated();
      unsubscribeClosed();
    };
  }, [dialogId]);

  return dialog;
}

/**
 * Hook to get the currently active dialog
 */
export function useActiveDialog(): Dialog | null {
  const [activeDialog, setActiveDialog] = useState<Dialog | null>(() => {
    return dialogSystem.getActiveDialog();
  });

  useEffect(() => {
    const updateActive = () => {
      setActiveDialog(dialogSystem.getActiveDialog());
    };

    const unsubscribe = dialogSystem.on('active-changed', () => {
      updateActive();
    });

    return unsubscribe;
  }, []);

  return activeDialog;
}

/**
 * Hook to subscribe to all dialog system state changes
 */
export function useDialogSystem(): DialogSystemState {
  const [state, setState] = useState<DialogSystemState>(() => {
    return dialogSystem.getState();
  });

  useEffect(() => {
    const updateState = () => {
      setState(dialogSystem.getState());
    };

    // Subscribe to all events
    const unsubscribe = dialogSystem.on('*', () => {
      updateState();
    });

    return unsubscribe;
  }, []);

  return state;
}

/**
 * Hook to get all open dialogs
 */
export function useDialogs(): Dialog[] {
  const state = useDialogSystem();
  return state.dialogs;
}

/**
 * Hook to check if any dialogs are open
 */
export function useHasOpenDialogs(): boolean {
  const dialogs = useDialogs();
  return dialogs.length > 0;
}

