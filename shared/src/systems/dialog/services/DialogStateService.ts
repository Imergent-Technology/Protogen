/**
 * Dialog State Service
 * 
 * Manages the state of all dialogs in the system
 */

import { Dialog, DialogSystemState, DialogEvent, DialogEventHandler } from '../types';

export class DialogStateService {
  private state: DialogSystemState = {
    dialogs: [],
    activeDialogId: null,
    stack: []
  };

  private eventHandlers: Map<string, DialogEventHandler[]> = new Map();

  // Get current state
  getState(): DialogSystemState {
    return { ...this.state };
  }

  // Add a dialog
  addDialog(dialog: Dialog): void {
    this.state.dialogs.push(dialog);
    this.state.stack.push(dialog.id);
    this.state.activeDialogId = dialog.id;
    
    this.emit({ type: 'dialog-opened', dialogId: dialog.id });
    this.emit({ type: 'stack-changed', stack: [...this.state.stack] });
    this.emit({ type: 'active-changed', dialogId: dialog.id });
  }

  // Remove a dialog
  removeDialog(dialogId: string): void {
    const dialogIndex = this.state.dialogs.findIndex(d => d.id === dialogId);
    if (dialogIndex === -1) return;

    this.state.dialogs.splice(dialogIndex, 1);
    
    const stackIndex = this.state.stack.indexOf(dialogId);
    if (stackIndex !== -1) {
      this.state.stack.splice(stackIndex, 1);
    }

    // Update active dialog
    if (this.state.activeDialogId === dialogId) {
      this.state.activeDialogId = this.state.stack.length > 0
        ? this.state.stack[this.state.stack.length - 1]
        : null;
    }

    this.emit({ type: 'dialog-closed', dialogId });
    this.emit({ type: 'stack-changed', stack: [...this.state.stack] });
    this.emit({ type: 'active-changed', dialogId: this.state.activeDialogId });
  }

  // Update a dialog
  updateDialog(dialogId: string, updates: Partial<Dialog>): void {
    const dialog = this.state.dialogs.find(d => d.id === dialogId);
    if (!dialog) return;

    Object.assign(dialog, updates, { updatedAt: Date.now() });
    this.emit({ type: 'dialog-updated', dialogId });
  }

  // Get a specific dialog
  getDialog(dialogId: string): Dialog | null {
    return this.state.dialogs.find(d => d.id === dialogId) || null;
  }

  // Get all dialogs
  getAllDialogs(): Dialog[] {
    return [...this.state.dialogs];
  }

  // Get dialogs by type
  getDialogsByType(type: string): Dialog[] {
    return this.state.dialogs.filter(d => d.type === type);
  }

  // Check if dialog is open
  isDialogOpen(dialogId: string): boolean {
    return this.state.dialogs.some(d => d.id === dialogId && d.isOpen);
  }

  // Get active dialog
  getActiveDialog(): Dialog | null {
    if (!this.state.activeDialogId) return null;
    return this.getDialog(this.state.activeDialogId);
  }

  // Set active dialog
  setActiveDialog(dialogId: string): void {
    if (!this.getDialog(dialogId)) return;
    
    this.state.activeDialogId = dialogId;
    
    // Move to top of stack
    const stackIndex = this.state.stack.indexOf(dialogId);
    if (stackIndex !== -1) {
      this.state.stack.splice(stackIndex, 1);
      this.state.stack.push(dialogId);
    }

    this.emit({ type: 'active-changed', dialogId });
    this.emit({ type: 'stack-changed', stack: [...this.state.stack] });
  }

  // Get stack order
  getStackOrder(): string[] {
    return [...this.state.stack];
  }

  // Clear all dialogs
  clearAll(): void {
    const dialogIds = [...this.state.dialogs.map(d => d.id)];
    
    this.state.dialogs = [];
    this.state.stack = [];
    this.state.activeDialogId = null;

    dialogIds.forEach(id => {
      this.emit({ type: 'dialog-closed', dialogId: id });
    });
    
    this.emit({ type: 'stack-changed', stack: [] });
    this.emit({ type: 'active-changed', dialogId: null });
  }

  // Event handling
  on(eventType: string, handler: DialogEventHandler): () => void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, []);
    }
    
    this.eventHandlers.get(eventType)!.push(handler);

    // Return unsubscribe function
    return () => {
      const handlers = this.eventHandlers.get(eventType);
      if (handlers) {
        const index = handlers.indexOf(handler);
        if (index !== -1) {
          handlers.splice(index, 1);
        }
      }
    };
  }

  private emit(event: DialogEvent): void {
    const handlers = this.eventHandlers.get(event.type);
    if (handlers) {
      handlers.forEach(handler => handler(event));
    }

    // Also emit to wildcard listeners
    const wildcardHandlers = this.eventHandlers.get('*');
    if (wildcardHandlers) {
      wildcardHandlers.forEach(handler => handler(event));
    }
  }
}

// Singleton instance
export const dialogStateService = new DialogStateService();

