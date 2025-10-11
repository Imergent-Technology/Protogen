/**
 * DialogSystem Tests
 * 
 * Tests for the core DialogSystem class.
 */

import { DialogSystem } from '../DialogSystem';
import { DialogConfig } from '../types';

describe('DialogSystem', () => {
  let dialogSystem: DialogSystem;

  beforeEach(() => {
    dialogSystem = new DialogSystem();
  });

  afterEach(() => {
    // Clean up all dialogs
    dialogSystem.closeAll();
  });

  describe('Dialog Lifecycle', () => {
    it('should open a modal dialog', () => {
      const dialogId = dialogSystem.openModal({
        title: 'Test Dialog',
        content: 'Test content',
      });

      expect(dialogId).toBeDefined();
      expect(typeof dialogId).toBe('string');

      const state = dialogSystem.getState();
      expect(state.dialogs.length).toBe(1);
      expect(state.dialogs[0].id).toBe(dialogId);
      expect(state.dialogs[0].type).toBe('modal');
    });

    it('should close a dialog', () => {
      const dialogId = dialogSystem.openModal({
        title: 'Test Dialog',
      });
      
      dialogSystem.close(dialogId);

      const state = dialogSystem.getState();
      expect(state.dialogs.length).toBe(0);
    });

    it('should close all dialogs', () => {
      dialogSystem.openModal({ title: 'Dialog 1' });
      dialogSystem.openModal({ title: 'Dialog 2' });
      dialogSystem.openToast({ message: 'Toast 1' });

      let state = dialogSystem.getState();
      expect(state.dialogs.length).toBe(3);

      dialogSystem.closeAll();

      state = dialogSystem.getState();
      expect(state.dialogs.length).toBe(0);
    });
  });

  describe('Z-Index Management', () => {
    it('should assign increasing z-index to dialogs', () => {
      const id1 = dialogSystem.openModal({ title: 'Dialog 1' });
      const id2 = dialogSystem.openModal({ title: 'Dialog 2' });
      const id3 = dialogSystem.openModal({ title: 'Dialog 3' });

      const state = dialogSystem.getState();
      const dialog1 = state.dialogs.find(d => d.id === id1);
      const dialog2 = state.dialogs.find(d => d.id === id2);
      const dialog3 = state.dialogs.find(d => d.id === id3);

      expect(dialog1?.zIndex).toBeLessThan(dialog2?.zIndex || 0);
      expect(dialog2?.zIndex).toBeLessThan(dialog3?.zIndex || 0);
    });

    it('should bring dialog to front when focused', () => {
      const id1 = dialogSystem.openModal({ title: 'Dialog 1' });
      const id2 = dialogSystem.openModal({ title: 'Dialog 2' });
      const id3 = dialogSystem.openModal({ title: 'Dialog 3' });

      dialogSystem.bringToFront(id1);

      const state = dialogSystem.getState();
      const dialog1 = state.dialogs.find(d => d.id === id1);
      const dialog2 = state.dialogs.find(d => d.id === id2);
      const dialog3 = state.dialogs.find(d => d.id === id3);

      // Dialog 1 should now have highest z-index
      expect(dialog1?.zIndex).toBeGreaterThan(dialog2?.zIndex || 0);
      expect(dialog1?.zIndex).toBeGreaterThan(dialog3?.zIndex || 0);
    });
  });

  describe('Multiple Concurrent Dialogs', () => {
    it('should support multiple dialogs of different types', () => {
      dialogSystem.openModal({ title: 'Modal' });
      dialogSystem.openDrawer({ title: 'Drawer' });
      dialogSystem.openToast({ message: 'Toast' });

      const state = dialogSystem.getState();
      expect(state.dialogs.length).toBe(3);
      expect(state.dialogs.find(d => d.type === 'modal')).toBeDefined();
      expect(state.dialogs.find(d => d.type === 'drawer')).toBeDefined();
      expect(state.dialogs.find(d => d.type === 'toast')).toBeDefined();
    });

    it('should handle multiple toasts', () => {
      dialogSystem.openToast({ message: 'Toast 1' });
      dialogSystem.openToast({ message: 'Toast 2' });
      dialogSystem.openToast({ message: 'Toast 3' });

      const state = dialogSystem.getState();
      const toasts = state.dialogs.filter(d => d.type === 'toast');
      expect(toasts.length).toBe(3);
    });
  });

  describe('Dialog State', () => {
    it('should update dialog state', () => {
      const dialogId = dialogSystem.openModal({ title: 'Test' });

      dialogSystem.update(dialogId, {
        title: 'Updated Title',
        content: 'Updated content',
      });

      const state = dialogSystem.getState();
      const dialog = state.dialogs.find(d => d.id === dialogId);

      expect(dialog?.title).toBe('Updated Title');
      expect(dialog?.content).toBe('Updated content');
    });

    it('should not update non-existent dialog', () => {
      const initialState = dialogSystem.getState();

      // Try to update non-existent dialog
      dialogSystem.update('non-existent-id', { title: 'New Title' });

      const finalState = dialogSystem.getState();
      expect(finalState).toEqual(initialState);
    });
  });

  describe('State Subscription', () => {
    it('should notify subscribers when dialog is opened', () => {
      const mockSubscriber = jest.fn();
      dialogSystem.subscribe(mockSubscriber);

      dialogSystem.openModal({ title: 'Test' });

      expect(mockSubscriber).toHaveBeenCalled();
      const state = mockSubscriber.mock.calls[0][0];
      expect(state.dialogs.length).toBe(1);
    });

    it('should notify subscribers when dialog is closed', () => {
      const mockSubscriber = jest.fn();
      const dialogId = dialogSystem.openModal({ title: 'Test' });

      dialogSystem.subscribe(mockSubscriber);
      mockSubscriber.mockClear();

      dialogSystem.close(dialogId);

      expect(mockSubscriber).toHaveBeenCalled();
      const state = mockSubscriber.mock.calls[0][0];
      expect(state.dialogs.length).toBe(0);
    });

    it('should allow unsubscribing', () => {
      const mockSubscriber = jest.fn();
      const unsubscribe = dialogSystem.subscribe(mockSubscriber);

      unsubscribe();
      mockSubscriber.mockClear();

      dialogSystem.openModal({ title: 'Test' });

      expect(mockSubscriber).not.toHaveBeenCalled();
    });
  });

  describe('Dialog Types', () => {
    it('should create modal dialog', () => {
      const id = dialogSystem.openModal({
        title: 'Modal Test',
        content: 'Content',
      });

      const state = dialogSystem.getState();
      const dialog = state.dialogs.find(d => d.id === id);

      expect(dialog?.type).toBe('modal');
      expect(dialog?.title).toBe('Modal Test');
    });

    it('should create toast dialog', () => {
      const id = dialogSystem.openToast({
        message: 'Toast message',
        variant: 'success',
      });

      const state = dialogSystem.getState();
      const dialog = state.dialogs.find(d => d.id === id);

      expect(dialog?.type).toBe('toast');
      expect(dialog?.message).toBe('Toast message');
      expect(dialog?.variant).toBe('success');
    });

    it('should create drawer dialog', () => {
      const id = dialogSystem.openDrawer({
        title: 'Drawer Test',
        position: 'right',
      });

      const state = dialogSystem.getState();
      const dialog = state.dialogs.find(d => d.id === id);

      expect(dialog?.type).toBe('drawer');
      expect(dialog?.position).toBe('right');
    });

    it('should create confirmation dialog', async () => {
      // Confirmation returns a promise, so we need to handle it differently
      const confirmationPromise = dialogSystem.openConfirmation({
        title: 'Confirm',
        message: 'Are you sure?',
        confirmText: 'Yes',
        cancelText: 'No',
      });

      // Check that dialog was created
      const state = dialogSystem.getState();
      const dialog = state.dialogs.find(d => d.type === 'confirmation');

      expect(dialog).toBeDefined();
      expect(dialog?.type).toBe('confirmation');
      expect(dialog?.title).toBe('Confirm');
      expect(dialog?.confirmText).toBe('Yes');
      expect(dialog?.cancelText).toBe('No');

      // Clean up - call onCancel to resolve the promise
      if (dialog && 'onCancel' in dialog && dialog.onCancel) {
        dialog.onCancel();
      }
    });
  });

  describe('Auto-dismiss for Toasts', () => {
    jest.useFakeTimers();

    it('should auto-dismiss toast after duration', () => {
      const id = dialogSystem.openToast({
        message: 'Auto dismiss',
        duration: 3000,
      });

      let state = dialogSystem.getState();
      expect(state.dialogs.length).toBe(1);

      jest.advanceTimersByTime(3000);

      state = dialogSystem.getState();
      expect(state.dialogs.length).toBe(0);
    });

    it('should not auto-dismiss toast if duration is 0', () => {
      const id = dialogSystem.openToast({
        message: 'No auto dismiss',
        duration: 0,
      });

      jest.advanceTimersByTime(10000);

      const state = dialogSystem.getState();
      expect(state.dialogs.length).toBe(1);
    });

    jest.useRealTimers();
  });
});

