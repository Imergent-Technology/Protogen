import { Scene, Deck } from '../stores/deckStore';
import { toolsetManager } from './ToolsetManager';

// Performance strategies for different scene types
export type PreloadStrategy = 'immediate' | 'proximity' | 'on-demand';

// Scene rendering state
export type RenderState = 'unloaded' | 'json' | 'rendered' | 'warm';

// Performance configuration for scenes
export interface PerformanceConfig {
  keepWarm: boolean;
  preloadStrategy: PreloadStrategy;
  maxWarmScenes: number;
  warmTimeout: number; // How long to keep scenes warm (ms)
}

// Scene performance state
interface ScenePerformanceState {
  sceneId: string;
  renderState: RenderState;
  lastAccessed: number;
  warmUntil: number;
  renderElement?: React.ReactElement;
}

// Performance Manager class
export class PerformanceManager {
  private warmScenes: Map<string, ScenePerformanceState> = new Map();
  private offScreenContainer: HTMLDivElement | null = null;
  private config: PerformanceConfig = {
    keepWarm: true,
    preloadStrategy: 'proximity',
    maxWarmScenes: 10,
    warmTimeout: 5 * 60 * 1000, // 5 minutes
  };

  // Initialize the performance manager
  initialize(): void {
    this.createOffScreenContainer();
    this.startCleanupTimer();
  }

  // Create off-screen container for warm scenes
  private createOffScreenContainer(): void {
    if (this.offScreenContainer) {
      return;
    }

    this.offScreenContainer = document.createElement('div');
    this.offScreenContainer.style.cssText = `
      position: absolute;
      left: -9999px;
      top: -9999px;
      width: 1px;
      height: 1px;
      overflow: hidden;
      pointer-events: none;
    `;
    
    document.body.appendChild(this.offScreenContainer);
  }

  // Warm a scene (keep it rendered in memory)
  async warmScene(scene: Scene): Promise<void> {
    const sceneId = scene.id;
    
    // If already warm, update access time
    if (this.warmScenes.has(sceneId)) {
      const existing = this.warmScenes.get(sceneId)!;
      existing.lastAccessed = Date.now();
      existing.warmUntil = Date.now() + this.config.warmTimeout;
      return;
    }

    // Check if we need to make room for new warm scene
    if (this.warmScenes.size >= this.config.maxWarmScenes) {
      await this.evictOldestWarmScene();
    }

    // Load toolset if needed
    await toolsetManager.loadToolset(scene.type);

    // Create performance state
    const performanceState: ScenePerformanceState = {
      sceneId,
      renderState: 'unloaded',
      lastAccessed: Date.now(),
      warmUntil: Date.now() + this.config.warmTimeout,
    };

    this.warmScenes.set(sceneId, performanceState);

    // Pre-render the scene
    await this.prerenderScene(scene, performanceState);

    console.log(`Scene ${scene.name} warmed successfully`);
  }

  // Unwarm a scene (remove from warm memory)
  unwarmScene(sceneId: string): void {
    if (!this.warmScenes.has(sceneId)) {
      return;
    }

    const performanceState = this.warmScenes.get(sceneId)!;
    
    // Remove from off-screen container
    if (performanceState.renderElement && this.offScreenContainer) {
      // In a real implementation, you'd remove the React element
      // For now, we'll just mark it as unloaded
      performanceState.renderState = 'unloaded';
      performanceState.renderElement = undefined;
    }

    this.warmScenes.delete(sceneId);
    console.log(`Scene ${sceneId} unwarmed`);
  }

  // Get a warm scene (fast access to pre-rendered content)
  getWarmScene(sceneId: string): ScenePerformanceState | null {
    const performanceState = this.warmScenes.get(sceneId);
    
    if (!performanceState) {
      return null;
    }

    // Update access time
    performanceState.lastAccessed = Date.now();
    performanceState.warmUntil = Date.now() + this.config.warmTimeout;

    return performanceState;
  }

  // Pre-render a scene to the off-screen container
  private async prerenderScene(scene: Scene, performanceState: ScenePerformanceState): Promise<void> {
    try {
      // For now, we'll simulate pre-rendering
      // In a real implementation, you'd use ReactDOM.render or similar
      performanceState.renderState = 'rendered';
      
      // Simulate render time
      await new Promise(resolve => setTimeout(resolve, 100));
      
      console.log(`Scene ${scene.name} pre-rendered successfully`);
    } catch (error) {
      console.error(`Failed to pre-render scene ${scene.name}:`, error);
      performanceState.renderState = 'unloaded';
    }
  }

  // Evict the oldest warm scene to make room
  private async evictOldestWarmScene(): Promise<void> {
    let oldestSceneId: string | null = null;
    let oldestAccessTime = Date.now();

    for (const [sceneId, state] of this.warmScenes) {
      if (state.lastAccessed < oldestAccessTime) {
        oldestAccessTime = state.lastAccessed;
        oldestSceneId = sceneId;
      }
    }

    if (oldestSceneId) {
      this.unwarmScene(oldestSceneId);
    }
  }

  // Smart preloading based on user behavior
  async smartPreload(_currentScene: Scene, nearbyScenes: Scene[]): Promise<void> {
    if (this.config.preloadStrategy === 'on-demand') {
      return; // Don't preload anything
    }

    if (this.config.preloadStrategy === 'immediate') {
      // Preload all nearby scenes immediately
      await Promise.all(
        nearbyScenes.map(scene => this.warmScene(scene))
      );
      return;
    }

    if (this.config.preloadStrategy === 'proximity') {
      // Preload only the next few scenes
      const scenesToPreload = nearbyScenes.slice(0, 3);
      await Promise.all(
        scenesToPreload.map(scene => this.warmScene(scene))
      );
    }
  }

  // Preload deck scenes based on deck type and performance config
  async preloadDeck(deck: Deck, allScenes: Scene[]): Promise<void> {
    if (!deck.performance.keepWarm) {
      return;
    }

    const deckScenes = allScenes.filter(scene => scene.deckIds.includes(deck.id));
    const scenesToPreload = deckScenes.slice(0, 5); // Preload first 5 scenes
    
    await Promise.all(
      scenesToPreload.map(scene => this.warmScene(scene))
    );

    console.log(`Preloaded ${scenesToPreload.length} scenes for deck ${deck.name}`);
  }

  // Clean up expired warm scenes
  private cleanupExpiredScenes(): void {
    const now = Date.now();
    const expiredScenes: string[] = [];

    for (const [sceneId, state] of this.warmScenes) {
      if (state.warmUntil < now) {
        expiredScenes.push(sceneId);
      }
    }

    expiredScenes.forEach(sceneId => {
      this.unwarmScene(sceneId);
    });

    if (expiredScenes.length > 0) {
      console.log(`Cleaned up ${expiredScenes.length} expired warm scenes`);
    }
  }

  // Start cleanup timer
  private startCleanupTimer(): void {
    setInterval(() => {
      this.cleanupExpiredScenes();
    }, 60000); // Check every minute
  }

  // Get performance statistics
  getPerformanceStats(): {
    warmScenesCount: number;
    totalMemoryUsage: number;
    averageWarmTime: number;
  } {
    const warmScenesCount = this.warmScenes.size;
    
    let totalMemoryUsage = 0;
    let totalWarmTime = 0;
    
    for (const state of this.warmScenes.values()) {
      // Estimate memory usage based on render state
      switch (state.renderState) {
        case 'unloaded':
          totalMemoryUsage += 1; // Minimal
          break;
        case 'json':
          totalMemoryUsage += 10; // JSON data
          break;
        case 'rendered':
          totalMemoryUsage += 100; // Rendered component
          break;
        case 'warm':
          totalMemoryUsage += 200; // Fully warm
          break;
      }
      
      totalWarmTime += Date.now() - state.lastAccessed;
    }

    const averageWarmTime = warmScenesCount > 0 ? totalWarmTime / warmScenesCount : 0;

    return {
      warmScenesCount,
      totalMemoryUsage,
      averageWarmTime,
    };
  }

  // Update performance configuration
  updateConfig(newConfig: Partial<PerformanceConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('Performance configuration updated:', this.config);
  }

  // Clean up resources
  destroy(): void {
    // Clear all warm scenes
    for (const sceneId of this.warmScenes.keys()) {
      this.unwarmScene(sceneId);
    }

    // Remove off-screen container
    if (this.offScreenContainer && this.offScreenContainer.parentNode) {
      this.offScreenContainer.parentNode.removeChild(this.offScreenContainer);
      this.offScreenContainer = null;
    }
  }
}

// Export singleton instance
export const performanceManager = new PerformanceManager();
