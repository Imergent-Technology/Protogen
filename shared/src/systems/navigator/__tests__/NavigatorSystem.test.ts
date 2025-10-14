/**
 * Navigator System Tests - M1 Enhancements
 * 
 * Tests for authoring mode, item navigation, zoom/focus, and selection
 * Based on Spec 03: Navigator State & Flows
 */

import { NavigatorSystemClass } from '../NavigatorSystem';
import type { NavigationMode, ItemType, NavigatorEvent } from '../types';

describe('Navigator Authoring Mode', () => {
  let navigator: NavigatorSystemClass;

  beforeEach(() => {
    navigator = new NavigatorSystemClass();
  });

  test('should initialize in view mode', () => {
    expect(navigator.getMode()).toBe('view');
    expect(navigator.getState().mode).toBe('view');
  });

  test('should enter author mode with permissions', () => {
    navigator.enterAuthorMode();
    expect(navigator.getMode()).toBe('author');
    expect(navigator.getState().mode).toBe('author');
  });

  test('should emit MODE_CHANGED event when entering author mode', () => {
    const handler = jest.fn();
    navigator.on('mode-changed', handler);

    navigator.enterAuthorMode();

    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'mode-changed',
        data: expect.objectContaining({
          previousMode: 'view',
          currentMode: 'author',
          triggeredBy: 'user'
        })
      })
    );
  });

  test('should exit author mode', () => {
    navigator.enterAuthorMode();
    expect(navigator.getMode()).toBe('author');

    navigator.exitAuthorMode();
    expect(navigator.getMode()).toBe('view');
  });

  test('should emit MODE_CHANGED event when exiting author mode', () => {
    navigator.enterAuthorMode();

    const handler = jest.fn();
    navigator.on('mode-changed', handler);

    navigator.exitAuthorMode();

    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'mode-changed',
        data: expect.objectContaining({
          previousMode: 'author',
          currentMode: 'view',
          triggeredBy: 'user'
        })
      })
    );
  });

  test('should toggle mode from view to author', () => {
    expect(navigator.getMode()).toBe('view');
    navigator.toggleMode();
    expect(navigator.getMode()).toBe('author');
  });

  test('should toggle mode from author to view', () => {
    navigator.enterAuthorMode();
    expect(navigator.getMode()).toBe('author');

    navigator.toggleMode();
    expect(navigator.getMode()).toBe('view');
  });

  test('should clear selection when exiting author mode', () => {
    navigator.enterAuthorMode();
    navigator.updateSelection({
      targetId: 'slide-123',
      targetType: 'slide'
    });

    expect(navigator.getSelection()).not.toBeNull();

    navigator.exitAuthorMode();

    expect(navigator.getSelection()).toBeNull();
  });

  test('should not enter author mode multiple times', () => {
    navigator.enterAuthorMode();
    const handler = jest.fn();
    navigator.on('mode-changed', handler);

    navigator.enterAuthorMode(); // Try again

    expect(handler).not.toHaveBeenCalled(); // Should not emit event
    expect(navigator.getMode()).toBe('author');
  });

  test('canEnterAuthorMode should return true by default', () => {
    expect(navigator.canEnterAuthorMode()).toBe(true);
  });

  test('hasUnsavedChanges should return false by default', () => {
    expect(navigator.hasUnsavedChanges()).toBe(false);
  });
});

describe('Navigator Item Navigation', () => {
  let navigator: NavigatorSystemClass;

  beforeEach(() => {
    navigator = new NavigatorSystemClass();
  });

  test('should navigate to specific item', () => {
    navigator.navigateToItem('slide-123', 'slide');

    const current = navigator.getCurrentItem();
    expect(current).toEqual({
      id: 'slide-123',
      type: 'slide'
    });
  });

  test('should update locus when navigating to item', () => {
    navigator.navigateToItem('page-456', 'page');

    const state = navigator.getState();
    expect(state.locus.itemId).toBe('page-456');
    expect(state.locus.itemType).toBe('page');
  });

  test('should update focus level to item', () => {
    navigator.navigateToItem('slide-123', 'slide');

    const state = navigator.getState();
    expect(state.focus.level).toBe('item');
    expect(state.focus.zoomLevel).toBe(100);
  });

  test('should emit NAVIGATE event with item details', () => {
    const handler = jest.fn();
    navigator.on('navigation', handler);

    navigator.navigateToItem('slide-789', 'slide');

    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'navigation',
        data: expect.objectContaining({
          itemId: 'slide-789',
          itemType: 'slide'
        })
      })
    );
  });

  test('getCurrentItem should return null when no item focused', () => {
    expect(navigator.getCurrentItem()).toBeNull();
  });

  test('should support different item types', () => {
    const itemTypes: ItemType[] = ['slide', 'page', 'node', 'edge', 'block'];

    itemTypes.forEach(type => {
      navigator.navigateToItem(`${type}-123`, type);
      const current = navigator.getCurrentItem();
      expect(current?.type).toBe(type);
    });
  });
});

describe('Navigator Zoom & Focus', () => {
  let navigator: NavigatorSystemClass;

  beforeEach(() => {
    navigator = new NavigatorSystemClass();
  });

  test('should initialize at overview focus level', () => {
    expect(navigator.getFocusLevel()).toBe('overview');
    expect(navigator.getZoomLevel()).toBe(0);
  });

  test('should zoom to item', async () => {
    await navigator.focusOnItem('slide-123', 'slide');

    expect(navigator.getFocusLevel()).toBe('item');
    expect(navigator.getZoomLevel()).toBe(100);
  });

  test('should emit FOCUS event when focusing on item', async () => {
    const handler = jest.fn();
    navigator.on('focus', handler);

    await navigator.focusOnItem('slide-456', 'slide');

    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'focus',
        data: expect.objectContaining({
          itemId: 'slide-456',
          itemType: 'slide',
          zoomLevel: 100,
          animated: true
        })
      })
    );
  });

  test('should zoom out from item to scene', async () => {
    // Setup: navigate to item
    navigator.navigateToItem('slide-123', 'slide');
    expect(navigator.getFocusLevel()).toBe('item');

    // Zoom out
    await navigator.zoomOut();

    expect(navigator.getFocusLevel()).toBe('scene');
    expect(navigator.getState().locus.itemId).toBeUndefined();
    expect(navigator.getZoomLevel()).toBe(50);
  });

  test('should zoom out from scene to overview', async () => {
    // Setup: set scene focus
    const state = navigator.getState();
    state.locus.sceneId = 'scene-123';
    state.focus.level = 'scene';
    state.focus.zoomLevel = 50;

    await navigator.zoomOut();

    expect(navigator.getFocusLevel()).toBe('overview');
    expect(navigator.getState().locus.sceneId).toBeUndefined();
    expect(navigator.getZoomLevel()).toBe(0);
  });

  test('should emit ZOOM event when zooming out', async () => {
    navigator.navigateToItem('slide-123', 'slide');

    const handler = jest.fn();
    navigator.on('zoom', handler);

    await navigator.zoomOut();

    expect(handler).toHaveBeenCalled();
    // Note: Multiple zoom events are emitted during animation
    const calls = handler.mock.calls.filter(call =>
      call[0].data.currentZoom === 50
    );
    expect(calls.length).toBeGreaterThan(0);
  });

  test('should set zoom level directly', async () => {
    await navigator.setZoomLevel(75);
    expect(navigator.getZoomLevel()).toBe(75);
  });

  test('should clamp zoom level to 0-100 range', async () => {
    await navigator.setZoomLevel(150);
    expect(navigator.getZoomLevel()).toBe(100);

    await navigator.setZoomLevel(-50);
    expect(navigator.getZoomLevel()).toBe(0);
  });
});

describe('Navigator Selection Integration', () => {
  let navigator: NavigatorSystemClass;

  beforeEach(() => {
    navigator = new NavigatorSystemClass();
  });

  test('should update selection state', () => {
    navigator.updateSelection({
      targetId: 'slide-123',
      targetType: 'slide'
    });

    const selection = navigator.getSelection();
    expect(selection).toEqual({
      targetId: 'slide-123',
      targetType: 'slide'
    });
  });

  test('should emit SELECTION_CHANGED event', () => {
    const handler = jest.fn();
    navigator.on('selection-changed', handler);

    navigator.updateSelection({
      targetId: 'page-456',
      targetType: 'page'
    });

    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'selection-changed',
        data: expect.objectContaining({
          selection: {
            targetId: 'page-456',
            targetType: 'page'
          }
        })
      })
    );
  });

  test('should clear selection', () => {
    navigator.updateSelection({
      targetId: 'slide-123',
      targetType: 'slide'
    });

    expect(navigator.getSelection()).not.toBeNull();

    navigator.clearSelection();

    expect(navigator.getSelection()).toBeNull();
  });

  test('should emit SELECTION_CHANGED event when clearing', () => {
    navigator.updateSelection({
      targetId: 'slide-123',
      targetType: 'slide'
    });

    const handler = jest.fn();
    navigator.on('selection-changed', handler);

    navigator.clearSelection();

    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'selection-changed',
        data: expect.objectContaining({
          selection: null
        })
      })
    );
  });

  test('should support multi-selection', () => {
    navigator.updateSelection({
      targetId: 'slide-123',
      targetType: 'slide',
      multi: true,
      selectedIds: ['slide-123', 'slide-456', 'slide-789']
    });

    const selection = navigator.getSelection();
    expect(selection?.multi).toBe(true);
    expect(selection?.selectedIds).toHaveLength(3);
  });

  test('should support range selection', () => {
    navigator.updateSelection({
      targetId: 'slide-123',
      targetType: 'slide',
      range: {
        start: 'slide-100',
        end: 'slide-200'
      }
    });

    const selection = navigator.getSelection();
    expect(selection?.range).toEqual({
      start: 'slide-100',
      end: 'slide-200'
    });
  });
});

describe('Navigator ToC Drawer', () => {
  let navigator: NavigatorSystemClass;

  beforeEach(() => {
    navigator = new NavigatorSystemClass();
  });

  test('should initialize with ToC closed', () => {
    expect(navigator.isTocOpen()).toBe(false);
  });

  test('should open ToC drawer', () => {
    navigator.setTocOpen(true);
    expect(navigator.isTocOpen()).toBe(true);
  });

  test('should close ToC drawer', () => {
    navigator.setTocOpen(true);
    navigator.setTocOpen(false);
    expect(navigator.isTocOpen()).toBe(false);
  });

  test('should toggle ToC drawer', () => {
    expect(navigator.isTocOpen()).toBe(false);

    navigator.toggleToc();
    expect(navigator.isTocOpen()).toBe(true);

    navigator.toggleToc();
    expect(navigator.isTocOpen()).toBe(false);
  });
});

describe('Navigator History Management', () => {
  let navigator: NavigatorSystemClass;

  beforeEach(() => {
    navigator = new NavigatorSystemClass();
  });

  test('should track mode in history entries', () => {
    navigator.enterAuthorMode();
    navigator.navigateToItem('slide-123', 'slide');

    const history = navigator.getNavigationHistory();
    const lastEntry = history.entries[history.entries.length - 1];

    expect(lastEntry.mode).toBe('author');
  });

  test('should track locus in history entries', () => {
    const state = navigator.getState();
    state.locus.deckId = 'deck-1';
    state.locus.sceneId = 'scene-2';

    navigator.navigateToItem('slide-123', 'slide');

    const history = navigator.getNavigationHistory();
    const lastEntry = history.entries[history.entries.length - 1];

    expect(lastEntry.locus).toEqual(
      expect.objectContaining({
        deckId: 'deck-1',
        sceneId: 'scene-2',
        itemId: 'slide-123',
        itemType: 'slide'
      })
    );
  });

  test('should track focus level and zoom in history entries', async () => {
    await navigator.focusOnItem('slide-123', 'slide');

    const history = navigator.getNavigationHistory();
    const lastEntry = history.entries[history.entries.length - 1];

    expect(lastEntry.focusLevel).toBe('item');
    expect(lastEntry.zoomLevel).toBe(100);
  });

  test('should restore mode when navigating back', async () => {
    // Navigate in view mode
    navigator.navigateToItem('slide-1', 'slide');

    // Enter author mode and navigate
    navigator.enterAuthorMode();
    navigator.navigateToItem('slide-2', 'slide');

    expect(navigator.getMode()).toBe('author');

    // Go back
    await navigator.navigateBack();

    // Should be back in view mode
    expect(navigator.getMode()).toBe('view');
  });

  test('should restore locus when navigating back', async () => {
    const state = navigator.getState();
    state.locus.sceneId = 'scene-1';

    navigator.navigateToItem('slide-1', 'slide');
    navigator.navigateToItem('slide-2', 'slide');

    expect(navigator.getCurrentItem()?.id).toBe('slide-2');

    await navigator.navigateBack();

    expect(navigator.getCurrentItem()?.id).toBe('slide-1');
  });

  test('should restore focus level when navigating back', async () => {
    await navigator.focusOnItem('slide-1', 'slide');
    expect(navigator.getFocusLevel()).toBe('item');

    await navigator.zoomOut();
    expect(navigator.getFocusLevel()).toBe('scene');

    await navigator.navigateBack();
    expect(navigator.getFocusLevel()).toBe('item');
  });
});

