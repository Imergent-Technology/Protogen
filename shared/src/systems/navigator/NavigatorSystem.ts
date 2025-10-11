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

export class NavigatorSystem implements INavigatorSystem {
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
      error: null
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
      
      // Navigate to the previous entry
      await this.navigateTo(entry.target);
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
      
      // Navigate to the next entry
      await this.navigateTo(entry.target);
    }
  }

  // Slide Navigation - Integrated with Scene System
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
      sceneSlug: target.type === 'scene' ? target.slug : null,
      deckId: target.type === 'deck' ? target.id : null,
      deckSlug: target.type === 'deck' ? target.slug : null,
      slideId: target.type === 'slide' ? target.id : null,
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
      
      // Update navigator context
      const currentScene = sceneSystem.getCurrentScene();
      const currentSlide = sceneSystem.getCurrentSlide();
      
      const newContext: CurrentContext = {
        ...this.state.currentContext,
        sceneId: currentScene?.id.toString() || null,
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
}
