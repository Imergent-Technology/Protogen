/**
 * AuthoringSystem Tests - M1 Week 3-4
 * 
 * Tests for AuthoringSystem class
 * Based on Spec 04: Authoring Overlay Framework
 */

import { AuthoringSystem } from '../AuthoringSystem';
import { navigatorSystem } from '../../navigator/NavigatorSystem';

describe('AuthoringSystem', () => {
  let authoringSystem: AuthoringSystem;

  beforeEach(() => {
    authoringSystem = AuthoringSystem.getInstance();
    // Reset state
    if (authoringSystem.isActive()) {
      authoringSystem.deactivate();
    }
  });

  describe('Singleton Pattern', () => {
    test('should return same instance', () => {
      const instance1 = AuthoringSystem.getInstance();
      const instance2 = AuthoringSystem.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('Activation / Deactivation', () => {
    test('should start inactive', () => {
      expect(authoringSystem.isActive()).toBe(false);
      expect(authoringSystem.getMode()).toBe('view');
    });

    test('should activate when entering author mode', async () => {
      await authoringSystem.activate();

      expect(authoringSystem.isActive()).toBe(true);
      expect(authoringSystem.getMode()).toBe('author');
    });

    test('should emit activated event', async () => {
      const handler = jest.fn();
      authoringSystem.on('activated', handler);

      await authoringSystem.activate();

      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          timestamp: expect.any(Number)
        })
      );
    });

    test('should deactivate and emit event', async () => {
      await authoringSystem.activate();

      const handler = jest.fn();
      authoringSystem.on('deactivated', handler);

      await authoringSystem.deactivate();

      expect(authoringSystem.isActive()).toBe(false);
      expect(handler).toHaveBeenCalled();
    });

    test('should not activate multiple times', async () => {
      await authoringSystem.activate();

      const consoleWarn = jest.spyOn(console, 'warn').mockImplementation();

      await authoringSystem.activate(); // Try again

      expect(consoleWarn).toHaveBeenCalled();
      consoleWarn.mockRestore();
    });
  });

  describe('Library Loading', () => {
    test('should load authoring libraries on activation', async () => {
      const config = { autoLoadLibraries: true };
      const system = AuthoringSystem.getInstance(config);

      await system.activate();

      expect(system.isLibrariesLoaded()).toBe(true);
    });

    test('should emit libraries-loaded event', async () => {
      const handler = jest.fn();
      authoringSystem.on('libraries-loaded', handler);

      await authoringSystem.activate();

      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          libraries: expect.any(Array),
          timestamp: expect.any(Number)
        })
      );
    });

    test('should track loaded libraries', async () => {
      await authoringSystem.activate();

      const libraries = authoringSystem.getLoadedLibraries();
      expect(libraries.length).toBeGreaterThan(0);
      expect(libraries).toContain('selection-engine');
      expect(libraries).toContain('hit-test-layer');
    });
  });

  describe('Scene Type Handlers', () => {
    test('should load card scene handler', async () => {
      await authoringSystem.loadSceneTypeHandler('card');

      expect(authoringSystem.hasSceneTypeHandler('card')).toBe(true);
    });

    test('should get scene type handler', async () => {
      await authoringSystem.loadSceneTypeHandler('card');

      const handler = authoringSystem.getSceneTypeHandler('card');
      expect(handler).not.toBeNull();
      expect(handler.type).toBe('card');
    });

    test('should emit scene-type-loaded event', async () => {
      const handler = jest.fn();
      authoringSystem.on('scene-type-loaded', handler);

      await authoringSystem.loadSceneTypeHandler('card');

      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          sceneType: 'card',
          timestamp: expect.any(Number)
        })
      );
    });

    test('should not reload already loaded handler', async () => {
      await authoringSystem.loadSceneTypeHandler('card');

      const handler = jest.fn();
      authoringSystem.on('scene-type-loading', handler);

      await authoringSystem.loadSceneTypeHandler('card'); // Try again

      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe('Unsaved Changes Tracking', () => {
    test('should start with no unsaved changes', () => {
      expect(authoringSystem.hasUnsavedChanges()).toBe(false);
    });

    test('should track unsaved changes', () => {
      authoringSystem.setUnsavedChanges(true);
      expect(authoringSystem.hasUnsavedChanges()).toBe(true);

      authoringSystem.setUnsavedChanges(false);
      expect(authoringSystem.hasUnsavedChanges()).toBe(false);
    });

    test('should emit unsaved-changes-changed event', () => {
      const handler = jest.fn();
      authoringSystem.on('unsaved-changes-changed', handler);

      authoringSystem.setUnsavedChanges(true);

      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          hasChanges: true,
          timestamp: expect.any(Number)
        })
      );
    });

    test('should warn when deactivating with unsaved changes', async () => {
      await authoringSystem.activate();
      authoringSystem.setUnsavedChanges(true);

      const handler = jest.fn();
      authoringSystem.on('unsaved-changes-warning', handler);

      await authoringSystem.deactivate();

      expect(handler).toHaveBeenCalled();
    });
  });

  describe('Navigator Integration', () => {
    test('should activate when navigator enters author mode', async () => {
      navigatorSystem.enterAuthorMode();

      // Give time for async activation
      await new Promise(resolve => setTimeout(resolve, 10));

      expect(authoringSystem.isActive()).toBe(true);
    });

    test('should deactivate when navigator exits author mode', async () => {
      navigatorSystem.enterAuthorMode();
      await new Promise(resolve => setTimeout(resolve, 10));

      navigatorSystem.exitAuthorMode();
      await new Promise(resolve => setTimeout(resolve, 10));

      expect(authoringSystem.isActive()).toBe(false);
    });
  });

  describe('State Management', () => {
    test('should return current state', async () => {
      await authoringSystem.activate();

      const state = authoringSystem.getState();

      expect(state.active).toBe(true);
      expect(state.mode).toBe('author');
      expect(state.librariesLoaded).toBe(true);
      expect(state.loadedLibraries).toBeInstanceOf(Map);
      expect(state.sceneTypeHandlers).toBeInstanceOf(Map);
    });
  });
});

