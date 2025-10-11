/**
 * Dialog System
 * 
 * Core system class for managing dialogs throughout the application
 */

import type {
  Dialog,
  DialogConfig,
  DialogSystemState,
  DialogType,
  DialogEventHandler,
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
import { dialogStateService } from './services/DialogStateService';
import { dialogStackService } from './services/DialogStackService';
import { dialogAnimationService } from './services/DialogAnimationService';

export class DialogSystem {
  private stateService = dialogStateService;
  private stackService = dialogStackService;
  private animationService = dialogAnimationService;

  // Generate unique dialog ID
  private generateId(): string {
    return `dialog-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Create base dialog from config
  private createDialog(config: DialogConfig): Dialog {
    const now = Date.now();
    return {
      ...config,
      id: config.id || this.generateId(),
      isOpen: true,
      content: 'content' in config ? (config as any).content : null,
      createdAt: now,
      updatedAt: now,
      closeOnEscape: config.closeOnEscape !== false,
      closeOnBackdrop: config.closeOnBackdrop !== false,
      showCloseButton: config.showCloseButton !== false,
      priority: config.priority || 'normal',
      animation: config.animation || 'fade'
    };
  }

  // Open modal dialog
  openModal(config: Omit<ModalDialogConfig, 'type'>): string {
    const dialog = this.createDialog({ ...config, type: 'modal' });
    this.stateService.addDialog(dialog);
    
    // Update z-indices
    this.updateZIndices();
    
    config.onOpen?.();
    return dialog.id;
  }

  // Open drawer dialog
  openDrawer(config: Omit<DrawerDialogConfig, 'type'>): string {
    const dialog = this.createDialog({ ...config, type: 'drawer' });
    this.stateService.addDialog(dialog);
    this.updateZIndices();
    
    config.onOpen?.();
    return dialog.id;
  }

  // Open confirmation dialog (returns promise)
  openConfirmation(config: Omit<ConfirmationDialogConfig, 'type'>): Promise<boolean> {
    return new Promise((resolve) => {
      const dialogConfig: ConfirmationDialogConfig = {
        ...config,
        type: 'confirmation',
        onConfirm: async () => {
          await config.onConfirm?.();
          this.close(dialog.id);
          resolve(true);
        },
        onCancel: () => {
          config.onCancel?.();
          this.close(dialog.id);
          resolve(false);
        }
      };

      const dialog = this.createDialog(dialogConfig);
      this.stateService.addDialog(dialog);
      this.updateZIndices();
      
      config.onOpen?.();
    });
  }

  // Open toast notification
  openToast(config: Omit<ToastDialogConfig, 'type'>): string {
    const duration = config.duration ?? 3000;
    const dialog = this.createDialog({ ...config, type: 'toast', duration });
    this.stateService.addDialog(dialog);
    this.updateZIndices();
    
    config.onOpen?.();

    // Auto-close after duration
    if (duration > 0) {
      setTimeout(() => {
        this.close(dialog.id);
      }, duration);
    }

    return dialog.id;
  }

  // Open popover dialog
  openPopover(config: Omit<PopoverDialogConfig, 'type'>): string {
    const dialog = this.createDialog({ ...config, type: 'popover' });
    this.stateService.addDialog(dialog);
    this.updateZIndices();
    
    config.onOpen?.();
    return dialog.id;
  }

  // Open comment thread dialog
  openCommentThread(config: Omit<CommentThreadDialogConfig, 'type'>): string {
    const dialog = this.createDialog({ ...config, type: 'comment-thread' });
    this.stateService.addDialog(dialog);
    this.updateZIndices();
    
    config.onOpen?.();
    return dialog.id;
  }

  // Open media viewer dialog
  openMediaViewer(config: Omit<MediaViewerDialogConfig, 'type'>): string {
    const dialog = this.createDialog({ ...config, type: 'media-viewer' });
    this.stateService.addDialog(dialog);
    this.updateZIndices();
    
    config.onOpen?.();
    return dialog.id;
  }

  // Open form dialog (returns promise with form data)
  openForm(config: Omit<FormDialogConfig, 'type'>): Promise<any> {
    return new Promise((resolve, reject) => {
      const dialogConfig: FormDialogConfig = {
        ...config,
        type: 'form',
        onSubmit: async (data: any) => {
          await config.onSubmit?.(data);
          this.close(dialog.id);
          resolve(data);
        },
        onCancel: () => {
          config.onCancel?.();
          this.close(dialog.id);
          reject(new Error('Form cancelled'));
        }
      };

      const dialog = this.createDialog(dialogConfig);
      this.stateService.addDialog(dialog);
      this.updateZIndices();
      
      config.onOpen?.();
    });
  }

  // Open custom dialog
  openCustom(config: Omit<CustomDialogConfig, 'type'>): string {
    const dialog = this.createDialog({ ...config, type: 'custom' });
    this.stateService.addDialog(dialog);
    this.updateZIndices();
    
    config.onOpen?.();
    return dialog.id;
  }

  // Open wizard dialog (for later integration with Flow System)
  openWizard(config: Omit<WizardDialogConfig, 'type'>): string {
    const dialog = this.createDialog({ ...config, type: 'wizard' });
    this.stateService.addDialog(dialog);
    this.updateZIndices();
    
    config.onOpen?.();
    return dialog.id;
  }

  // Close a specific dialog
  async close(dialogId: string): Promise<void> {
    const dialog = this.stateService.getDialog(dialogId);
    if (!dialog) return;

    // Check if close is allowed
    if (dialog.onBeforeClose) {
      const canClose = await dialog.onBeforeClose();
      if (!canClose) return;
    }

    // Wait for close animation
    await this.animationService.waitForAnimation(dialog.animation || 'fade');

    // Remove dialog
    this.stateService.removeDialog(dialogId);
    this.stackService.removeZIndex(dialogId);
    
    dialog.onClose?.();
  }

  // Close all dialogs
  async closeAll(): Promise<void> {
    const dialogs = this.stateService.getAllDialogs();
    
    for (const dialog of dialogs) {
      await this.close(dialog.id);
    }
  }

  // Close dialogs by type
  async closeByType(type: DialogType): Promise<void> {
    const dialogs = this.stateService.getDialogsByType(type);
    
    for (const dialog of dialogs) {
      await this.close(dialog.id);
    }
  }

  // Bring dialog to front
  bringToFront(dialogId: string): void {
    this.stateService.setActiveDialog(dialogId);
    this.updateZIndices();
  }

  // Get stack order
  getStackOrder(): string[] {
    return this.stateService.getStackOrder();
  }

  // Check if dialog is open
  isOpen(dialogId: string): boolean {
    return this.stateService.isDialogOpen(dialogId);
  }

  // Get active dialog
  getActiveDialog(): Dialog | null {
    return this.stateService.getActiveDialog();
  }

  // Get all dialogs
  getAllDialogs(): Dialog[] {
    return this.stateService.getAllDialogs();
  }

  // Get system state
  getState(): DialogSystemState {
    return this.stateService.getState();
  }

  // Subscribe to events
  on(eventType: string, handler: DialogEventHandler): () => void {
    return this.stateService.on(eventType, handler);
  }

  // Update z-indices for all dialogs in stack
  private updateZIndices(): void {
    const stack = this.stateService.getStackOrder();
    const priorityMap = new Map();
    
    this.stateService.getAllDialogs().forEach(dialog => {
      priorityMap.set(dialog.id, dialog.priority || 'normal');
    });

    this.stackService.updateStack(stack, priorityMap);
  }

  // Get z-index for a dialog
  getZIndex(dialogId: string): number | undefined {
    return this.stackService.getZIndex(dialogId);
  }
}

// Singleton instance
export const dialogSystem = new DialogSystem();

