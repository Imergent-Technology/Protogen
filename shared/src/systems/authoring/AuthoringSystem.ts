/**
 * AuthoringSystem - M1 Week 3-4
 * 
 * Core system managing authoring mode, library loading, and overlay coordination.
 * Integrates with Navigator to respond to mode changes.
 * 
 * Based on Spec 04: Authoring Overlay Framework
 */

import { navigatorSystem } from '../navigator/NavigatorSystem';
import type { NavigatorEvent } from '../navigator/types';

export interface AuthoringSystemConfig {
  autoLoadLibraries?: boolean;
  lazyLoadSceneTypes?: boolean;
  preloadSceneTypes?: string[];
}

export interface AuthoringLibrary {
  name: string;
  version: string;
  loaded: boolean;
  size: number;
  module?: any;
}

export interface AuthoringSystemState {
  active: boolean;
  mode: 'view' | 'author';
  librariesLoaded: boolean;
  loadedLibraries: Map<string, AuthoringLibrary>;
  sceneTypeHandlers: Map<string, any>;
  unsavedChanges: boolean;
}

export class AuthoringSystem {
  private static instance: AuthoringSystem;
  private state: AuthoringSystemState;
  private config: AuthoringSystemConfig;
  private eventHandlers: Map<string, Function[]> = new Map();

  private constructor(config?: AuthoringSystemConfig) {
    this.config = {
      autoLoadLibraries: true,
      lazyLoadSceneTypes: true,
      preloadSceneTypes: ['card'], // Card scene for M1
      ...config
    };

    this.state = {
      active: false,
      mode: 'view',
      librariesLoaded: false,
      loadedLibraries: new Map(),
      sceneTypeHandlers: new Map(),
      unsavedChanges: false
    };

    // Listen to Navigator mode changes
    this.setupNavigatorIntegration();
  }

  // Singleton pattern
  static getInstance(config?: AuthoringSystemConfig): AuthoringSystem {
    if (!AuthoringSystem.instance) {
      AuthoringSystem.instance = new AuthoringSystem(config);
    }
    return AuthoringSystem.instance;
  }

  // ============================================================================
  // Navigator Integration
  // ============================================================================

  private setupNavigatorIntegration(): void {
    navigatorSystem.on('mode-changed', this.handleModeChange.bind(this));
  }

  private handleModeChange(event: NavigatorEvent): void {
    const { currentMode } = event.data;

    if (currentMode === 'author') {
      this.activate();
    } else {
      this.deactivate();
    }
  }

  // ============================================================================
  // Activation / Deactivation
  // ============================================================================

  async activate(): Promise<void> {
    if (this.state.active) {
      console.warn('AuthoringSystem already active');
      return;
    }

    this.state.active = true;
    this.state.mode = 'author';

    this.emit('activated', { timestamp: Date.now() });

    // Load authoring libraries if configured
    if (this.config.autoLoadLibraries && !this.state.librariesLoaded) {
      await this.loadAuthoringLibraries();
    }

    // Preload scene type handlers
    if (this.config.preloadSceneTypes && this.config.preloadSceneTypes.length > 0) {
      await this.preloadSceneTypeHandlers(this.config.preloadSceneTypes);
    }
  }

  async deactivate(): Promise<void> {
    if (!this.state.active) {
      return;
    }

    // Check for unsaved changes
    if (this.state.unsavedChanges) {
      this.emit('unsaved-changes-warning', {
        message: 'Deactivating with unsaved changes',
        timestamp: Date.now()
      });
    }

    this.state.active = false;
    this.state.mode = 'view';

    this.emit('deactivated', { timestamp: Date.now() });

    // Optionally unload libraries to save memory
    // For now, keep them loaded for faster re-activation
  }

  isActive(): boolean {
    return this.state.active;
  }

  getMode(): 'view' | 'author' {
    return this.state.mode;
  }

  // ============================================================================
  // Library Loading
  // ============================================================================

  async loadAuthoringLibraries(): Promise<void> {
    if (this.state.librariesLoaded) {
      return;
    }

    this.emit('libraries-loading', { timestamp: Date.now() });

    try {
      // Load core authoring libraries
      const libraries: AuthoringLibrary[] = [
        {
          name: 'selection-engine',
          version: '1.0.0',
          loaded: false,
          size: 0
        },
        {
          name: 'hit-test-layer',
          version: '1.0.0',
          loaded: false,
          size: 0
        },
        {
          name: 'editing-handles',
          version: '1.0.0',
          loaded: false,
          size: 0
        }
      ];

      // Simulate dynamic import (actual implementation will use real imports)
      for (const library of libraries) {
        await this.loadLibrary(library);
      }

      this.state.librariesLoaded = true;

      this.emit('libraries-loaded', {
        libraries: Array.from(this.state.loadedLibraries.keys()),
        timestamp: Date.now()
      });
    } catch (error) {
      this.emit('libraries-load-error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      });
      throw error;
    }
  }

  private async loadLibrary(library: AuthoringLibrary): Promise<void> {
    try {
      // In production, this will dynamically import the library
      // For now, we'll mark it as loaded
      library.loaded = true;
      this.state.loadedLibraries.set(library.name, library);

      this.emit('library-loaded', {
        name: library.name,
        version: library.version,
        timestamp: Date.now()
      });
    } catch (error) {
      throw new Error(`Failed to load library: ${library.name}`);
    }
  }

  isLibrariesLoaded(): boolean {
    return this.state.librariesLoaded;
  }

  getLoadedLibraries(): string[] {
    return Array.from(this.state.loadedLibraries.keys());
  }

  // ============================================================================
  // Scene Type Handler Management
  // ============================================================================

  async loadSceneTypeHandler(sceneType: string): Promise<void> {
    if (this.state.sceneTypeHandlers.has(sceneType)) {
      return; // Already loaded
    }

    this.emit('scene-type-loading', { sceneType, timestamp: Date.now() });

    try {
      // Dynamically load scene-type specific handler
      // For M1, we focus on Card scene type
      let handler;

      switch (sceneType) {
        case 'card':
          // Will import CardSceneHandler when implemented
          handler = await this.loadCardSceneHandler();
          break;
        case 'document':
          // Defer to M2
          handler = null;
          break;
        case 'graph':
          // Defer to M3
          handler = null;
          break;
        default:
          throw new Error(`Unknown scene type: ${sceneType}`);
      }

      if (handler) {
        this.state.sceneTypeHandlers.set(sceneType, handler);
        this.emit('scene-type-loaded', { sceneType, timestamp: Date.now() });
      }
    } catch (error) {
      this.emit('scene-type-load-error', {
        sceneType,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      });
      throw error;
    }
  }

  private async loadCardSceneHandler(): Promise<any> {
    // TODO: Implement in M1 Week 7-8
    return {
      type: 'card',
      version: '1.0.0',
      hitTest: () => null,
      renderOverlay: () => null
    };
  }

  private async preloadSceneTypeHandlers(sceneTypes: string[]): Promise<void> {
    await Promise.all(
      sceneTypes.map(type => this.loadSceneTypeHandler(type))
    );
  }

  getSceneTypeHandler(sceneType: string): any | null {
    return this.state.sceneTypeHandlers.get(sceneType) || null;
  }

  hasSceneTypeHandler(sceneType: string): boolean {
    return this.state.sceneTypeHandlers.has(sceneType);
  }

  // ============================================================================
  // Unsaved Changes Tracking
  // ============================================================================

  setUnsavedChanges(hasChanges: boolean): void {
    this.state.unsavedChanges = hasChanges;

    this.emit('unsaved-changes-changed', {
      hasChanges,
      timestamp: Date.now()
    });
  }

  hasUnsavedChanges(): boolean {
    return this.state.unsavedChanges;
  }

  // ============================================================================
  // Event System
  // ============================================================================

  on(event: string, handler: Function): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)!.push(handler);
  }

  off(event: string, handler: Function): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  private emit(event: string, payload: any): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(payload);
        } catch (error) {
          console.error(`Error in ${event} handler:`, error);
        }
      });
    }
  }

  // ============================================================================
  // State Management
  // ============================================================================

  getState(): AuthoringSystemState {
    return {
      ...this.state,
      loadedLibraries: new Map(this.state.loadedLibraries),
      sceneTypeHandlers: new Map(this.state.sceneTypeHandlers)
    };
  }

  // ============================================================================
  // Cleanup
  // ============================================================================

  destroy(): void {
    this.deactivate();
    this.state.loadedLibraries.clear();
    this.state.sceneTypeHandlers.clear();
    this.eventHandlers.clear();
  }
}

// Export singleton instance
export const authoringSystem = AuthoringSystem.getInstance();

