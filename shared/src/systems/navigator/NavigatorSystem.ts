import {
  NavigatorSystem as INavigatorSystem,
  NavigationTarget,
  CurrentContext,
  NavigationEntry,
  NavigationHistory,
  NavigatorEvent,
  NavigatorState,
  NavigationEventHandler,
  DEFAULT_CONTEXT
} from './types';
import { urlSyncService } from './services/URLSyncService';

class NavigatorSystemClass implements INavigatorSystem {
  private state: NavigatorState;
  private eventHandlers: Map<string, NavigationEventHandler[]> = new Map();
  private maxHistorySize = 50;

  constructor(initialContext?: CurrentContext) {
    this.state = {
      currentContext: initialContext || DEFAULT_CONTEXT,
      history: {
        entries: [],
        currentIndex: -1,
        canGoBack: false,
        canGoForward: false
      },
      isLoading: false,
      error: null,
      // ✨ M1: Authoring mode enhancements
      mode: 'view',
      locus: {},
      focus: {
        level: 'overview',
        zoomLevel: 0,
        animated: true
      },
      selection: null,
      tocOpen: false,
      editing: false
    };
  }

  // Core Navigation Methods
  async navigateTo(target: NavigationTarget): Promise<void> {
    try {
      this.setLoading(true);
      this.clearError();

      // Emit navigation start event
      this.emit({
        type: 'navigation',
        data: { target, action: 'start' },
        timestamp: Date.now()
      });

      // Handle slide navigation
      if (target.type === 'slide') {
        await this.navigateToSlide(target);
        return;
      }

      // Create new context based on navigation target
      const newContext = await this.createContextFromTarget(target);
      
      // Create navigation entry
      const entry: NavigationEntry = {
        id: this.generateEntryId(),
        target,
        context: newContext,
        timestamp: Date.now()
      };

      // Add to history
      this.addHistoryEntry(entry);
      
      // Update current context
      this.setCurrentContext(newContext);

      // Emit navigation end event
      this.emit({
        type: 'navigation',
        data: { target, action: 'end', context: newContext },
        timestamp: Date.now()
      });

    } catch (error) {
      this.setError(error instanceof Error ? error.message : 'Navigation failed');
      this.emit({
        type: 'navigation',
        data: { target, action: 'error', error: this.getError() },
        timestamp: Date.now()
      });
    } finally {
      this.setLoading(false);
    }
  }

  async navigateBack(): Promise<void> {
    if (!this.state.history.canGoBack) {
      throw new Error('Cannot navigate back - no history available');
    }

    const targetIndex = this.state.history.currentIndex - 1;
    const entry = this.state.history.entries[targetIndex];
    
    if (entry) {
      // Update history index
      this.updateHistoryIndex(targetIndex);
      
      // Restore full state from history entry
      this.restoreFromHistoryEntry(entry);
    }
  }

  async navigateForward(): Promise<void> {
    if (!this.state.history.canGoForward) {
      throw new Error('Cannot navigate forward - no history available');
    }

    const targetIndex = this.state.history.currentIndex + 1;
    const entry = this.state.history.entries[targetIndex];
    
    if (entry) {
      // Update history index
      this.updateHistoryIndex(targetIndex);
      
      // Restore full state from history entry
      this.restoreFromHistoryEntry(entry);
    }
  }

  private restoreFromHistoryEntry(entry: NavigationEntry): void {
    // Restore mode
    if (entry.mode && entry.mode !== this.state.mode) {
      if (entry.mode === 'author') {
        this.enterAuthorMode();
      } else {
        this.exitAuthorMode();
      }
    }

    // Restore locus
    if (entry.locus) {
      this.state.locus = { ...entry.locus };
    }

    // Restore focus
    if (entry.focusLevel) {
      this.state.focus.level = entry.focusLevel;
    }
    if (entry.zoomLevel !== undefined) {
      this.state.focus.zoomLevel = entry.zoomLevel;
    }

    // Emit navigate event
    this.emit({
      type: 'navigation',
      data: {
        path: entry.target.contextPath || this.getCurrentPath(),
        sceneId: entry.locus?.sceneId,
        deckId: entry.locus?.deckId,
        itemId: entry.locus?.itemId,
        itemType: entry.locus?.itemType,
        authoringMode: entry.mode === 'author'
      },
      timestamp: Date.now()
    });

    // Update URL
    this.updateURL();
  }

  // Slide Navigation - Integrated with Scene System
  // @ts-ignore - Method signature intentionally differs from interface for internal use
  private async navigateToSlide(target: NavigationTarget): Promise<void> {
    try {
      // Import scene system dynamically to avoid circular dependencies
      const { sceneSystem } = await import('../scene/SceneSystem');
      
      if (target.slideIndex !== undefined) {
        // Navigate to specific slide index within current scene
        await sceneSystem.navigateToSlide(target.slideIndex);
      } else {
        // If slide ID is provided, we need to determine which scene it belongs to
        // For now, assume we're navigating within the current scene
        console.warn('Slide navigation by ID not yet implemented. Use slideIndex instead.');
      }

      // Update current context with slide information
      const currentSlide = sceneSystem.getCurrentSlide();
      const currentScene = sceneSystem.getCurrentScene();
      const newContext: CurrentContext = {
        ...this.state.currentContext,
        slideId: currentSlide?.id.toString() || null,
        sceneId: currentScene?.id.toString() || this.state.currentContext.sceneId,
        timestamp: Date.now(),
      };

      this.updateContext(newContext);

      // Emit slide change event
      this.emit({
        type: 'slide-change',
        data: { 
          slideId: currentSlide?.id, 
          slideIndex: target.slideIndex || sceneSystem.getCurrentSlideIndex(),
          sceneId: currentScene?.id 
        },
        timestamp: Date.now()
      });

      this.setLoading(false);
    } catch (error) {
      this.setError(`Failed to navigate to slide: ${error}`);
      this.setLoading(false);
    }
  }

  // Context Management
  getCurrentContext(): CurrentContext {
    return { ...this.state.currentContext };
  }

  setCurrentContext(context: CurrentContext): void {
    const oldContext = this.state.currentContext;
    this.state.currentContext = { ...context };

    // Sync to URL
    urlSyncService.syncContextToURL(context);

    // Emit context change event
    this.emit({
      type: 'context-change',
      data: { oldContext, newContext: context },
      timestamp: Date.now()
    });
  }

  updateContext(updates: Partial<CurrentContext>): void {
    const newContext = { ...this.state.currentContext, ...updates };
    this.setCurrentContext(newContext);
  }

  // History Management
  getNavigationHistory(): NavigationHistory {
    return { ...this.state.history };
  }

  clearHistory(): void {
    this.state.history = {
      entries: [],
      currentIndex: -1,
      canGoBack: false,
      canGoForward: false
    };

    this.emit({
      type: 'history-update',
      data: { action: 'clear' },
      timestamp: Date.now()
    });
  }

  addHistoryEntry(entry: NavigationEntry): void {
    const history = this.state.history;
    
    // If we're not at the end of history, remove future entries
    if (history.currentIndex < history.entries.length - 1) {
      history.entries = history.entries.slice(0, history.currentIndex + 1);
    }

    // Add new entry
    history.entries.push(entry);
    
    // Update index
    history.currentIndex = history.entries.length - 1;
    
    // Enforce max history size
    if (history.entries.length > this.maxHistorySize) {
      history.entries = history.entries.slice(-this.maxHistorySize);
      history.currentIndex = history.entries.length - 1;
    }

    // Update navigation capabilities
    this.updateNavigationCapabilities();

    this.emit({
      type: 'history-update',
      data: { action: 'add', entry },
      timestamp: Date.now()
    });
  }

  // State Management
  getState(): NavigatorState {
    return { ...this.state };
  }

  isLoading(): boolean {
    return this.state.isLoading;
  }

  getError(): string | null {
    return this.state.error;
  }

  // Event System
  on(event: NavigatorEvent['type'], handler: NavigationEventHandler): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)!.push(handler);
  }

  off(event: NavigatorEvent['type'], handler: NavigationEventHandler): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  emit(event: NavigatorEvent): void {
    const handlers = this.eventHandlers.get(event.type);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(event);
        } catch (error) {
          console.error('Error in navigation event handler:', error);
        }
      });
    }
  }

  // Private Helper Methods
  private async createContextFromTarget(target: NavigationTarget): Promise<CurrentContext> {
    // For now, create a basic context from the target
    // In the future, this will integrate with the API to get scene/deck data
    const context: CurrentContext = {
      sceneId: target.type === 'scene' ? target.id : null,
      sceneSlug: target.type === 'scene' ? (target.slug ?? null) : null,
      deckId: target.type === 'deck' ? target.id : null,
      deckSlug: target.type === 'deck' ? (target.slug ?? null) : null,
      slideId: target.type === 'slide' ? target.id : null,
      contextPath: target.contextPath, // Copy contextPath for context-based navigation
      timestamp: Date.now()
    };

    return context;
  }

  // Scene System Integration Methods
  async loadSceneInNavigator(sceneId: string | number, slideIndex?: number): Promise<void> {
    try {
      const { sceneSystem } = await import('../scene/SceneSystem');
      
      // Load the scene
      await sceneSystem.loadScene(sceneId);
      
      // Navigate to specific slide if provided
      if (slideIndex !== undefined && slideIndex >= 0) {
        await sceneSystem.navigateToSlide(slideIndex);
      }
      
      // Update navigator context (M1: use GUID for API compatibility)
      const currentScene = sceneSystem.getCurrentScene();
      const currentSlide = sceneSystem.getCurrentSlide();
      
      const newContext: CurrentContext = {
        ...this.state.currentContext,
        sceneId: currentScene?.guid || null,  // Use GUID instead of integer ID
        sceneSlug: currentScene?.slug || null,
        slideId: currentSlide?.id.toString() || null,
        timestamp: Date.now(),
      };
      
      this.setCurrentContext(newContext);
      
      // Emit scene loaded event
      this.emit({
        type: 'navigation',
        data: { sceneId, slideIndex, action: 'scene-loaded' },
        timestamp: Date.now()
      });
    } catch (error) {
      this.setError(`Failed to load scene in navigator: ${error}`);
      throw error;
    }
  }

  async nextSlideInNavigator(): Promise<void> {
    const { sceneSystem } = await import('../scene/SceneSystem');
    await sceneSystem.nextSlide();
    
    // Update context
    const currentSlide = sceneSystem.getCurrentSlide();
    this.updateContext({
      slideId: currentSlide?.id.toString() || null,
      timestamp: Date.now(),
    });
  }

  async previousSlideInNavigator(): Promise<void> {
    const { sceneSystem } = await import('../scene/SceneSystem');
    await sceneSystem.previousSlide();
    
    // Update context
    const currentSlide = sceneSystem.getCurrentSlide();
    this.updateContext({
      slideId: currentSlide?.id.toString() || null,
      timestamp: Date.now(),
    });
  }

  private generateEntryId(): string {
    return `nav_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private updateHistoryIndex(index: number): void {
    this.state.history.currentIndex = index;
    this.updateNavigationCapabilities();
  }

  private updateNavigationCapabilities(): void {
    const history = this.state.history;
    history.canGoBack = history.currentIndex > 0;
    history.canGoForward = history.currentIndex < history.entries.length - 1;
  }

  private setLoading(loading: boolean): void {
    this.state.isLoading = loading;
  }

  private setError(error: string | null): void {
    this.state.error = error;
  }

  private clearError(): void {
    this.state.error = null;
  }

  // ============================================================================
  // M1 ENHANCEMENTS: Authoring Mode Management
  // ============================================================================

  enterAuthorMode(): void {
    if (!this.canEnterAuthorMode()) {
      throw new Error('Insufficient permissions to enter authoring mode');
    }

    if (this.state.mode === 'author') {
      // Already in author mode
      return;
    }

    const previousMode = this.state.mode;
    this.state.mode = 'author';

    this.emit({
      type: 'mode-changed',
      data: {
        previousMode,
        currentMode: 'author',
        timestamp: Date.now(),
        triggeredBy: 'user'
      },
      timestamp: Date.now()
    });

    // Note: Authoring system will listen to this event and load libraries
  }

  exitAuthorMode(): void {
    if (this.state.mode === 'view') {
      // Already in view mode
      return;
    }

    if (this.hasUnsavedChanges()) {
      console.warn('Exiting author mode with unsaved changes. Consider implementing auto-save or confirmation dialog.');
      // TODO: Implement confirmation dialog or auto-save
    }

    const previousMode = this.state.mode;
    this.state.mode = 'view';

    // Clear selection when exiting author mode
    this.state.selection = null;
    this.state.editing = false;

    this.emit({
      type: 'mode-changed',
      data: {
        previousMode,
        currentMode: 'view',
        timestamp: Date.now(),
        triggeredBy: 'user'
      },
      timestamp: Date.now()
    });

    // Note: Authoring system will listen to this event and unload libraries
  }

  toggleMode(): void {
    if (this.state.mode === 'view') {
      this.enterAuthorMode();
    } else {
      this.exitAuthorMode();
    }
  }

  getMode(): 'view' | 'author' {
    return this.state.mode;
  }

  canEnterAuthorMode(): boolean {
    // TODO: Integrate with auth service when available
    // For now, return true to allow development
    // In production, this will check: this.authService.hasPermission('authoring.access')
    return true;
  }

  hasUnsavedChanges(): boolean {
    // TODO: Integrate with authoring system when available
    // For now, return false
    // In production, this will check: this.authoringSystem?.hasUnsavedChanges()
    return false;
  }

  // ============================================================================
  // M1 ENHANCEMENTS: Item Navigation
  // ============================================================================

  navigateToItem(itemId: string, itemType: 'slide' | 'page' | 'node' | 'edge' | 'block'): void {
    this.state.locus.itemId = itemId;
    this.state.locus.itemType = itemType;

    this.updateFocus({
      level: 'item',
      zoomLevel: 100,
      target: { itemId, itemType },
      animated: true
    });

    this.updateURL();
    this.addToHistory();

    this.emit({
      type: 'navigation',
      data: {
        path: this.getCurrentPath(),
        sceneId: this.state.locus.sceneId,
        deckId: this.state.locus.deckId,
        itemId,
        itemType,
        authoringMode: this.state.mode === 'author'
      },
      timestamp: Date.now()
    });
  }

  getCurrentItem(): { id: string; type: 'slide' | 'page' | 'node' | 'edge' | 'block' } | null {
    if (!this.state.locus.itemId || !this.state.locus.itemType) {
      return null;
    }

    return {
      id: this.state.locus.itemId,
      type: this.state.locus.itemType
    };
  }

  async nextItem(): Promise<void> {
    const current = this.getCurrentItem();
    if (!current || !this.state.locus.sceneId) {
      return;
    }

    try {
      const { sceneSystem } = await import('../scene/SceneSystem');
      
      // TODO: SceneSystem will implement getNextItem in M1 Week 7-8
      // For now, use slide navigation as fallback
      if (current.type === 'slide') {
        await sceneSystem.nextSlide();
        const currentSlide = sceneSystem.getCurrentSlide();
        if (currentSlide) {
          this.navigateToItem(currentSlide.id.toString(), 'slide');
        }
      } else {
        console.warn('Next item navigation not yet implemented for type:', current.type);
      }
    } catch (error) {
      console.error('Error navigating to next item:', error);
    }
  }

  async previousItem(): Promise<void> {
    const current = this.getCurrentItem();
    if (!current || !this.state.locus.sceneId) {
      return;
    }

    try {
      const { sceneSystem } = await import('../scene/SceneSystem');
      
      // TODO: SceneSystem will implement getPreviousItem in M1 Week 7-8
      // For now, use slide navigation as fallback
      if (current.type === 'slide') {
        await sceneSystem.previousSlide();
        const currentSlide = sceneSystem.getCurrentSlide();
        if (currentSlide) {
          this.navigateToItem(currentSlide.id.toString(), 'slide');
        }
      } else {
        console.warn('Previous item navigation not yet implemented for type:', current.type);
      }
    } catch (error) {
      console.error('Error navigating to previous item:', error);
    }
  }

  // ============================================================================
  // M1 ENHANCEMENTS: Zoom & Focus
  // ============================================================================

  async focusOnItem(itemId: string, itemType: 'slide' | 'page' | 'node' | 'edge' | 'block'): Promise<void> {
    const previousFocus = { ...this.state.focus };

    this.state.locus.itemId = itemId;
    this.state.locus.itemType = itemType;

    this.updateFocus({
      level: 'item',
      zoomLevel: 100,
      target: { itemId, itemType },
      animated: true
    });

    this.emit({
      type: 'focus',
      data: {
        sceneId: this.state.locus.sceneId || '',
        itemId,
        itemType,
        previousFocus: previousFocus.target,
        zoomLevel: 100,
        animated: true
      },
      timestamp: Date.now()
    });

    await this.animateZoom(previousFocus.zoomLevel, 100);
    this.updateURL();
  }

  async zoomOut(): Promise<void> {
    const previousZoom = this.state.focus.zoomLevel;
    let targetZoom = 0;

    if (this.state.focus.level === 'item') {
      // Item → Scene
      this.state.locus.itemId = undefined;
      this.state.locus.itemType = undefined;
      this.updateFocus({ level: 'scene', zoomLevel: 50 });
      targetZoom = 50;
    } else if (this.state.focus.level === 'scene') {
      // Scene → Overview
      this.state.locus.sceneId = undefined;
      this.updateFocus({ level: 'overview', zoomLevel: 0 });
      targetZoom = 0;
    }

    this.emit({
      type: 'zoom',
      data: {
        sceneId: this.state.locus.sceneId || '',
        previousZoom,
        currentZoom: targetZoom,
        target: this.state.focus.target
      },
      timestamp: Date.now()
    });

    await this.animateZoom(previousZoom, targetZoom);
    this.updateURL();
  }

  async setZoomLevel(level: number): Promise<void> {
    const previousZoom = this.state.focus.zoomLevel;
    this.state.focus.zoomLevel = Math.max(0, Math.min(100, level));

    this.emit({
      type: 'zoom',
      data: {
        sceneId: this.state.locus.sceneId || '',
        previousZoom,
        currentZoom: this.state.focus.zoomLevel,
        target: this.state.focus.target
      },
      timestamp: Date.now()
    });

    if (this.state.focus.animated) {
      await this.animateZoom(previousZoom, this.state.focus.zoomLevel);
    }
  }

  getZoomLevel(): number {
    return this.state.focus.zoomLevel;
  }

  getFocusLevel(): 'overview' | 'scene' | 'item' {
    return this.state.focus.level;
  }

  private async animateZoom(from: number, to: number): Promise<void> {
    // Smooth zoom animation using requestAnimationFrame
    return new Promise(resolve => {
      const duration = 300; // ms
      const startTime = performance.now();

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Ease-in-out
        const eased = progress < 0.5
          ? 2 * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 2) / 2;

        const currentZoom = from + (to - from) * eased;

        // Emit zoom progress event for listeners
        this.emit({
          type: 'zoom',
          data: {
            progress: currentZoom,
            animating: progress < 1
          },
          timestamp: currentTime
        });

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };

      requestAnimationFrame(animate);
    });
  }

  private updateFocus(partial: Partial<{
    level: 'overview' | 'scene' | 'item';
    zoomLevel: number;
    target?: { itemId: string; itemType: 'slide' | 'page' | 'node' | 'edge' | 'block' };
    animated: boolean;
  }>): void {
    this.state.focus = {
      ...this.state.focus,
      ...partial
    };
  }

  // ============================================================================
  // M1 ENHANCEMENTS: Selection Integration
  // ============================================================================

  updateSelection(selection: {
    targetId: string;
    targetType: 'slide' | 'page' | 'node' | 'edge' | 'block';
    multi?: boolean;
    selectedIds?: string[];
    range?: { start: string; end: string };
  } | null): void {
    this.state.selection = selection;

    this.emit({
      type: 'selection-changed',
      data: {
        selection,
        timestamp: Date.now()
      },
      timestamp: Date.now()
    });

    // Optionally focus on selected item
    if (selection && selection.targetId && !selection.multi) {
      // Don't await - let focus happen in background
      this.focusOnItem(selection.targetId, selection.targetType).catch(err => {
        console.error('Error focusing on selected item:', err);
      });
    }
  }

  clearSelection(): void {
    this.state.selection = null;

    this.emit({
      type: 'selection-changed',
      data: {
        selection: null,
        timestamp: Date.now()
      },
      timestamp: Date.now()
    });
  }

  getSelection(): {
    targetId: string;
    targetType: 'slide' | 'page' | 'node' | 'edge' | 'block';
    multi?: boolean;
    selectedIds?: string[];
    range?: { start: string; end: string };
  } | null {
    return this.state.selection;
  }

  // ============================================================================
  // M1 ENHANCEMENTS: ToC Drawer
  // ============================================================================

  setTocOpen(open: boolean): void {
    this.state.tocOpen = open;
  }

  isTocOpen(): boolean {
    return this.state.tocOpen;
  }

  toggleToc(): void {
    this.state.tocOpen = !this.state.tocOpen;
  }

  // ============================================================================
  // M1 ENHANCEMENTS: Helper Methods
  // ============================================================================

  private getCurrentPath(): string {
    let path = '/';

    if (this.state.mode === 'author') {
      path += 'author/';
    }

    if (this.state.locus.deckId) {
      path += `deck/${this.state.locus.deckId}/`;
    }

    if (this.state.locus.sceneId) {
      path += `scenes/${this.state.locus.sceneId}/`;
    }

    if (this.state.locus.itemId) {
      path += `items/${this.state.locus.itemId}`;
    }

    return path;
  }

  private updateURL(): void {
    // M1: Use enhanced URL sync for authoring mode support
    urlSyncService.syncEnhancedStateToURL({
      mode: this.state.mode,
      locus: this.state.locus,
      zoomLevel: this.state.focus.zoomLevel
    });
  }

  private addToHistory(): void {
    const history = this.state.history;

    // If we're not at the end of history, remove future entries
    if (history.currentIndex < history.entries.length - 1) {
      history.entries = history.entries.slice(0, history.currentIndex + 1);
    }

    // Add new entry with full state
    const entry = {
      id: this.generateEntryId(),
      target: {
        type: 'scene' as const,
        id: this.state.locus.sceneId || '',
        contextPath: this.getCurrentPath()
      },
      context: this.state.currentContext,
      timestamp: Date.now(),
      mode: this.state.mode,
      locus: { ...this.state.locus },
      focusLevel: this.state.focus.level,
      zoomLevel: this.state.focus.zoomLevel
    };

    history.entries.push(entry);
    history.currentIndex = history.entries.length - 1;

    // Enforce max history size
    if (history.entries.length > this.maxHistorySize) {
      history.entries = history.entries.slice(-this.maxHistorySize);
      history.currentIndex = history.entries.length - 1;
    }

    this.updateNavigationCapabilities();

    this.emit({
      type: 'history-update',
      data: { action: 'add', entry },
      timestamp: Date.now()
    });
  }
}

// Export singleton instance as the default export
export const navigatorSystem = new NavigatorSystemClass();

// Also export the class for type purposes
export { NavigatorSystemClass as NavigatorSystem };
