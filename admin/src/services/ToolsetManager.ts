import { DeckType } from '../stores/deckStore';

// Toolset configuration for each deck type
export interface ToolsetConfig {
  libraries: string[];
  css?: string[];
  preload: boolean;
  keepWarm: boolean;
  chunkSize: 'small' | 'medium' | 'large';
}

// Toolset registry
const TOOLSET_REGISTRY: Record<DeckType, ToolsetConfig> = {
  graph: {
    libraries: ['sigma', 'graphology', 'd3'],
    css: [],
    preload: true,
    keepWarm: true,
    chunkSize: 'medium',
  },
  card: {
    libraries: ['react-transition-group'],
    css: [],
    preload: false,
    keepWarm: false,
    chunkSize: 'small',
  },
  document: {
    libraries: ['marked', 'highlight.js'],
    css: ['highlight.js/styles/github.css'],
    preload: false,
    keepWarm: false,
    chunkSize: 'small',
  },
  dashboard: {
    libraries: ['recharts', 'd3'],
    css: [],
    preload: true,
    keepWarm: true,
    chunkSize: 'medium',
  },
};

// Toolset loading state
interface ToolsetState {
  loaded: Set<DeckType>;
  loading: Set<DeckType>;
  failed: Set<DeckType>;
}

// Toolset Manager class
export class ToolsetManager {
  private state: ToolsetState = {
    loaded: new Set(),
    loading: new Set(),
    failed: new Set(),
  };

  private listeners: Set<(state: ToolsetState) => void> = new Set();

  // Get toolset configuration for a deck type
  getToolsetConfig(deckType: DeckType): ToolsetConfig {
    return TOOLSET_REGISTRY[deckType];
  }

  // Check if a toolset is loaded
  isToolsetLoaded(deckType: DeckType): boolean {
    return this.state.loaded.has(deckType);
  }

  // Check if a toolset is currently loading
  isToolsetLoading(deckType: DeckType): boolean {
    return this.state.loading.has(deckType);
  }

  // Check if a toolset failed to load
  isToolsetFailed(deckType: DeckType): boolean {
    return this.state.failed.has(deckType);
  }

  // Load a toolset for a specific deck type
  async loadToolset(deckType: DeckType): Promise<void> {
    // If already loaded, return immediately
    if (this.state.loaded.has(deckType)) {
      return;
    }

    // If currently loading, wait for it to complete
    if (this.state.loading.has(deckType)) {
      await this.waitForToolset(deckType);
      return;
    }

    // If failed to load previously, try again
    if (this.state.failed.has(deckType)) {
      this.state.failed.delete(deckType);
    }

    // Mark as loading
    this.state.loading.add(deckType);
    this.notifyListeners();

    try {
      const config = this.getToolsetConfig(deckType);
      
      // Load CSS files if specified
      if (config.css) {
        await this.loadCSSFiles(config.css);
      }

      // Load JavaScript libraries
      await this.loadLibraries(config.libraries);

      // Mark as loaded
      this.state.loaded.add(deckType);
      this.state.loading.delete(deckType);
      
      console.log(`Toolset for ${deckType} loaded successfully`);
    } catch (error) {
      console.error(`Failed to load toolset for ${deckType}:`, error);
      
      // Mark as failed
      this.state.failed.add(deckType);
      this.state.loading.delete(deckType);
      
      throw error;
    } finally {
      this.notifyListeners();
    }
  }

  // Unload a toolset (for memory management)
  async unloadToolset(deckType: DeckType): Promise<void> {
    if (!this.state.loaded.has(deckType)) {
      return;
    }

    try {
      const config = this.getToolsetConfig(deckType);
      
      // Unload JavaScript libraries
      await this.unloadLibraries(config.libraries);
      
      // Remove from loaded state
      this.state.loaded.delete(deckType);
      
      console.log(`Toolset for ${deckType} unloaded successfully`);
    } catch (error) {
      console.error(`Failed to unload toolset for ${deckType}:`, error);
      throw error;
    } finally {
      this.notifyListeners();
    }
  }

  // Preload toolsets based on strategy
  async preloadToolsets(deckTypes: DeckType[]): Promise<void> {
    const preloadTypes = deckTypes.filter(type => 
      this.getToolsetConfig(type).preload && 
      !this.state.loaded.has(type) && 
      !this.state.loading.has(type)
    );

    if (preloadTypes.length === 0) {
      return;
    }

    console.log(`Preloading toolsets for: ${preloadTypes.join(', ')}`);
    
    // Load toolsets in parallel
    await Promise.all(
      preloadTypes.map(type => this.loadToolset(type))
    );
  }

  // Wait for a specific toolset to finish loading
  private async waitForToolset(deckType: DeckType): Promise<void> {
    return new Promise((resolve, reject) => {
      const checkState = () => {
        if (this.state.loaded.has(deckType)) {
          resolve();
        } else if (this.state.failed.has(deckType)) {
          reject(new Error(`Toolset ${deckType} failed to load`));
        } else {
          // Still loading, check again in 100ms
          setTimeout(checkState, 100);
        }
      };
      
      checkState();
    });
  }

  // Load CSS files
  private async loadCSSFiles(cssFiles: string[]): Promise<void> {
    const loadPromises = cssFiles.map(cssFile => {
      return new Promise<void>((resolve, reject) => {
        // Check if already loaded
        if (document.querySelector(`link[href="${cssFile}"]`)) {
          resolve();
          return;
        }

        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = cssFile;
        
        link.onload = () => resolve();
        link.onerror = () => reject(new Error(`Failed to load CSS: ${cssFile}`));
        
        document.head.appendChild(link);
      });
    });

    await Promise.all(loadPromises);
  }

  // Load JavaScript libraries
  private async loadLibraries(libraries: string[]): Promise<void> {
    // For now, we'll assume libraries are available globally
    // In a real implementation, you might use dynamic imports or script loading
    
    const missingLibraries = libraries.filter(lib => {
      // Check if library is available globally
      return !(window as any)[lib];
    });

    if (missingLibraries.length > 0) {
      console.warn(`Some libraries may not be available: ${missingLibraries.join(', ')}`);
      // In production, you might want to throw an error here
    }
  }

  // Unload JavaScript libraries
  private async unloadLibraries(libraries: string[]): Promise<void> {
    // For now, we'll just log the unload
    // In a real implementation, you might clean up global variables or remove script tags
    console.log(`Unloading libraries: ${libraries.join(', ')}`);
  }

  // Subscribe to toolset state changes
  subscribe(listener: (state: ToolsetState) => void): () => void {
    this.listeners.add(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  // Notify all listeners of state changes
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener({ ...this.state });
      } catch (error) {
        console.error('Error in toolset state listener:', error);
      }
    });
  }

  // Get current state
  getState(): ToolsetState {
    return { ...this.state };
  }

  // Clean up resources
  destroy(): void {
    this.listeners.clear();
  }
}

// Export singleton instance
export const toolsetManager = new ToolsetManager();
