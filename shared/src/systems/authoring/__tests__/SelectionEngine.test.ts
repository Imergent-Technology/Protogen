/**
 * SelectionEngine Tests - M1 Week 3-4
 * 
 * Tests for SelectionEngine class
 * Based on Spec 04: Authoring Overlay Framework
 */

import { SelectionEngine } from '../services/SelectionEngine';
import type { HitTestResult } from '../services/SelectionEngine';

describe('SelectionEngine', () => {
  let selectionEngine: SelectionEngine;
  let mockTarget: HitTestResult;

  beforeEach(() => {
    selectionEngine = SelectionEngine.getInstance();
    selectionEngine.reset(); // Reset state between tests

    mockTarget = {
      targetType: 'slide',
      targetId: 'slide-123',
      bounds: new DOMRect(0, 0, 100, 100),
      element: document.createElement('div'),
      metadata: { kind: 'text' }
    };
  });

  describe('Singleton Pattern', () => {
    test('should return same instance', () => {
      const instance1 = SelectionEngine.getInstance();
      const instance2 = SelectionEngine.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('Single Selection', () => {
    test('should select a target', () => {
      selectionEngine.select(mockTarget);

      const selection = selectionEngine.getSelection();
      expect(selection).not.toBeNull();
      expect(selection?.targetId).toBe('slide-123');
      expect(selection?.targetType).toBe('slide');
    });

    test('should deselect', () => {
      selectionEngine.select(mockTarget);
      expect(selectionEngine.hasSelection()).toBe(true);

      selectionEngine.deselect();

      expect(selectionEngine.hasSelection()).toBe(false);
      expect(selectionEngine.getSelection()).toBeNull();
    });

    test('should check if target is selected', () => {
      selectionEngine.select(mockTarget);

      expect(selectionEngine.isSelected('slide-123')).toBe(true);
      expect(selectionEngine.isSelected('slide-456')).toBe(false);
    });

    test('should replace previous selection in single mode', () => {
      selectionEngine.select(mockTarget);

      const newTarget = { ...mockTarget, targetId: 'slide-456' };
      selectionEngine.select(newTarget);

      expect(selectionEngine.getSelection()?.targetId).toBe('slide-456');
      expect(selectionEngine.isSelected('slide-123')).toBe(false);
    });

    test('should emit selection-changed event', () => {
      const handler = jest.fn();
      selectionEngine.on('selection-changed', handler);

      selectionEngine.select(mockTarget);

      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          selection: expect.objectContaining({
            targetId: 'slide-123'
          }),
          mode: 'single',
          timestamp: expect.any(Number)
        })
      );
    });
  });

  describe('Multi-Selection', () => {
    beforeEach(() => {
      selectionEngine.setMode('multi');
    });

    test('should add to selection in multi mode', () => {
      selectionEngine.select(mockTarget);

      const target2 = { ...mockTarget, targetId: 'slide-456' };
      selectionEngine.addToSelection(target2);

      expect(selectionEngine.getSelectionCount()).toBe(2);
      expect(selectionEngine.isSelected('slide-123')).toBe(true);
      expect(selectionEngine.isSelected('slide-456')).toBe(true);
    });

    test('should remove from selection', () => {
      selectionEngine.select(mockTarget);

      const target2 = { ...mockTarget, targetId: 'slide-456' };
      selectionEngine.addToSelection(target2);

      selectionEngine.removeFromSelection('slide-123');

      expect(selectionEngine.isSelected('slide-123')).toBe(false);
      expect(selectionEngine.isSelected('slide-456')).toBe(true);
      expect(selectionEngine.getSelectionCount()).toBe(1);
    });

    test('should get multi-selection', () => {
      selectionEngine.select(mockTarget);

      const target2 = { ...mockTarget, targetId: 'slide-456' };
      selectionEngine.addToSelection(target2);

      const multiSelection = selectionEngine.getMultiSelection();

      expect(multiSelection.length).toBe(2);
      expect(multiSelection[0].targetId).toBe('slide-123');
      expect(multiSelection[1].targetId).toBe('slide-456');
    });

    test('should clear multi-selection', () => {
      selectionEngine.select(mockTarget);
      const target2 = { ...mockTarget, targetId: 'slide-456' };
      selectionEngine.addToSelection(target2);

      selectionEngine.clearMultiSelection();

      expect(selectionEngine.getSelectionCount()).toBe(0);
      expect(selectionEngine.hasSelection()).toBe(false);
    });

    test('should select all targets', () => {
      const targets = [
        mockTarget,
        { ...mockTarget, targetId: 'slide-456' },
        { ...mockTarget, targetId: 'slide-789' }
      ];

      selectionEngine.selectAll(targets);

      expect(selectionEngine.getSelectionCount()).toBe(3);
      expect(selectionEngine.getSelectedIds()).toEqual(['slide-123', 'slide-456', 'slide-789']);
    });
  });

  describe('Selection Modes', () => {
    test('should start in single-select mode', () => {
      expect(selectionEngine.getMode()).toBe('single');
    });

    test('should switch to multi-select mode', () => {
      selectionEngine.setMode('multi');
      expect(selectionEngine.getMode()).toBe('multi');
    });

    test('should emit mode-changed event', () => {
      const handler = jest.fn();
      selectionEngine.on('mode-changed', handler);

      selectionEngine.setMode('multi');

      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          previousMode: 'single',
          currentMode: 'multi',
          timestamp: expect.any(Number)
        })
      );
    });

    test('should clear multi-selection when switching to single mode', () => {
      selectionEngine.setMode('multi');
      selectionEngine.select(mockTarget);

      const target2 = { ...mockTarget, targetId: 'slide-456' };
      selectionEngine.addToSelection(target2);

      selectionEngine.setMode('single');

      expect(selectionEngine.getSelectionCount()).toBe(1);
    });
  });

  describe('Keyboard Selection Helpers', () => {
    const targets: HitTestResult[] = [
      mockTarget,
      { ...mockTarget, targetId: 'slide-456' },
      { ...mockTarget, targetId: 'slide-789' }
    ];

    test('should select next target', () => {
      selectionEngine.select(targets[0]);

      selectionEngine.selectNext('slide-123', targets);

      expect(selectionEngine.getSelection()?.targetId).toBe('slide-456');
    });

    test('should select previous target', () => {
      selectionEngine.select(targets[1]);

      selectionEngine.selectPrevious('slide-456', targets);

      expect(selectionEngine.getSelection()?.targetId).toBe('slide-123');
    });

    test('should not select next if at end', () => {
      selectionEngine.select(targets[2]);

      selectionEngine.selectNext('slide-789', targets);

      expect(selectionEngine.getSelection()?.targetId).toBe('slide-789');
    });

    test('should not select previous if at start', () => {
      selectionEngine.select(targets[0]);

      selectionEngine.selectPrevious('slide-123', targets);

      expect(selectionEngine.getSelection()?.targetId).toBe('slide-123');
    });
  });

  describe('Utilities', () => {
    test('should get selected IDs', () => {
      selectionEngine.select(mockTarget);

      expect(selectionEngine.getSelectedIds()).toEqual(['slide-123']);
    });

    test('should get selected IDs in multi mode', () => {
      selectionEngine.setMode('multi');
      selectionEngine.select(mockTarget);

      const target2 = { ...mockTarget, targetId: 'slide-456' };
      selectionEngine.addToSelection(target2);

      const ids = selectionEngine.getSelectedIds();
      expect(ids).toContain('slide-123');
      expect(ids).toContain('slide-456');
    });

    test('should reset to initial state', () => {
      selectionEngine.setMode('multi');
      selectionEngine.select(mockTarget);

      selectionEngine.reset();

      expect(selectionEngine.hasSelection()).toBe(false);
      expect(selectionEngine.getMode()).toBe('single');
    });
  });
});

