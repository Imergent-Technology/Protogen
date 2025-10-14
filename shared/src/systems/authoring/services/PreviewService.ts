/**
 * PreviewService - M1 Week 5
 * 
 * Manages thumbnail generation and caching for scenes, slides, and pages.
 * Extends existing snapshot system with size tiers and aggressive caching.
 * 
 * Based on Spec 07: Preview Service Specification
 */

import { ThumbnailGenerator } from './ThumbnailGenerator';
import { PreviewCache } from './PreviewCache';
import { PreviewQueue } from './PreviewQueue';
import type { 
  PreviewTarget, 
  PreviewSize, 
  PreviewMetadata,
  GenerateOptions,
  CachedPreview
} from '../types/preview';

export class PreviewService {
  private static instance: PreviewService;
  private cache: PreviewCache;
  private generator: ThumbnailGenerator;
  private queue: PreviewQueue;
  private eventHandlers: Map<string, Function[]> = new Map();

  private constructor() {
    this.cache = PreviewCache.getInstance();
    this.generator = ThumbnailGenerator.getInstance();
    this.queue = PreviewQueue.getInstance();

    // Set up event listeners
    this.setupEventListeners();
  }

  // ============================================================================
  // Singleton Pattern
  // ============================================================================

  static getInstance(): PreviewService {
    if (!PreviewService.instance) {
      PreviewService.instance = new PreviewService();
    }
    return PreviewService.instance;
  }

  // ============================================================================
  // Preview Generation
  // ============================================================================

  /**
   * Generate a single preview
   * Checks cache first, then queues generation if needed
   */
  async generatePreview(
    target: PreviewTarget,
    size: PreviewSize = 'sm',
    options?: GenerateOptions
  ): Promise<string> {
    const cacheKey = this.getCacheKey(target, size);

    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && !this.isStale(cached, target)) {
      this.emit('cache-hit', { target, size, cacheKey });
      return cached.dataUrl;
    }

    this.emit('cache-miss', { target, size, cacheKey });

    // Queue generation
    return this.queue.enqueue({
      target,
      size,
      options,
      priority: options?.priority || 'normal'
    });
  }

  /**
   * Generate previews for multiple targets (batch)
   * Used for initial load of ToC or carousel
   */
  async generateBatch(
    targets: PreviewTarget[],
    size: PreviewSize = 'sm',
    options?: GenerateOptions
  ): Promise<Map<string, string>> {
    const results = new Map<string, string>();

    this.emit('batch-started', { count: targets.length, size });

    // Check cache for all targets first
    const uncached: PreviewTarget[] = [];
    for (const target of targets) {
      const cacheKey = this.getCacheKey(target, size);
      const cached = this.cache.get(cacheKey);

      if (cached && !this.isStale(cached, target)) {
        results.set(this.getTargetKey(target), cached.dataUrl);
      } else {
        uncached.push(target);
      }
    }

    // Generate uncached in parallel (max 4 concurrent)
    if (uncached.length > 0) {
      const chunks = this.chunkArray(uncached, 4);

      for (const chunk of chunks) {
        const previews = await Promise.all(
          chunk.map(target => 
            this.generatePreview(target, size, { ...options, priority: 'low' })
          )
        );

        chunk.forEach((target, i) => {
          results.set(this.getTargetKey(target), previews[i]);
        });
      }
    }

    this.emit('batch-completed', { 
      total: targets.length,
      cached: targets.length - uncached.length,
      generated: uncached.length,
      size
    });

    return results;
  }

  /**
   * Prefetch previews for upcoming content
   * Used to preload carousel items before user scrolls to them
   */
  async prefetch(
    targets: PreviewTarget[],
    size: PreviewSize = 'sm'
  ): Promise<void> {
    // Queue with low priority so it doesn't block user-initiated requests
    for (const target of targets) {
      const cacheKey = this.getCacheKey(target, size);
      const cached = this.cache.get(cacheKey);

      if (!cached || this.isStale(cached, target)) {
        await this.queue.enqueue({
          target,
          size,
          priority: 'low',
          options: { skipEvents: true } // Don't emit events for prefetch
        });
      }
    }
  }

  // ============================================================================
  // Cache Management
  // ============================================================================

  /**
   * Get cached preview without generating
   */
  getCached(target: PreviewTarget, size: PreviewSize): string | null {
    const cacheKey = this.getCacheKey(target, size);
    const cached = this.cache.get(cacheKey);

    return cached && !this.isStale(cached, target) ? cached.dataUrl : null;
  }

  /**
   * Invalidate all preview sizes for a target
   * Called when content is edited
   */
  invalidate(target: PreviewTarget): void {
    const sizes: PreviewSize[] = ['xs', 'sm', 'md'];

    sizes.forEach(size => {
      const key = this.getCacheKey(target, size);
      this.cache.delete(key);
    });

    this.emit('cache-invalidated', { target, timestamp: Date.now() });
  }

  /**
   * Invalidate all previews for a scene
   * Called when scene is deleted or fundamentally changed
   */
  invalidateScene(sceneId: string): void {
    this.cache.deletePattern(`scene:${sceneId}:*`);
    this.cache.deletePattern(`slide:${sceneId}:*`);
    this.cache.deletePattern(`page:${sceneId}:*`);

    this.emit('scene-invalidated', { sceneId, timestamp: Date.now() });
  }

  /**
   * Clear entire cache
   * Used for testing or manual cache refresh
   */
  clearCache(): void {
    this.cache.clear();
    this.emit('cache-cleared', { timestamp: Date.now() });
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return this.cache.getStats();
  }

  // ============================================================================
  // Staleness Detection
  // ============================================================================

  /**
   * Check if cached preview is stale
   * Compares content hash to detect changes
   */
  private isStale(cached: CachedPreview, target: PreviewTarget): boolean {
    const currentHash = this.getContentHash(target);
    return cached.hash !== currentHash;
  }

  /**
   * Generate content hash for staleness detection
   * Simple hash of target data
   */
  private getContentHash(target: PreviewTarget): string {
    const content = JSON.stringify(target);
    return this.simpleHash(content);
  }

  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(36);
  }

  // ============================================================================
  // Helper Methods
  // ============================================================================

  private getCacheKey(target: PreviewTarget, size: PreviewSize): string {
    const targetKey = this.getTargetKey(target);
    return `${targetKey}:${size}`;
  }

  private getTargetKey(target: PreviewTarget): string {
    switch (target.type) {
      case 'scene':
        return `scene:${target.sceneId}`;
      case 'slide':
        return `slide:${target.sceneId}:${target.slideId}`;
      case 'page':
        return `page:${target.sceneId}:${target.pageId}`;
      case 'node':
        return `node:${target.sceneId}:${target.nodeId}`;
      default:
        return 'unknown';
    }
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  // ============================================================================
  // Event System
  // ============================================================================

  private setupEventListeners(): void {
    // Listen to generator events
    this.generator.on('preview-ready', (metadata: PreviewMetadata) => {
      this.emit('preview-ready', metadata);
    });

    this.generator.on('preview-failed', (error: any) => {
      this.emit('preview-failed', error);
    });

    // Listen to queue events
    this.queue.on('queue-processed', (result: any) => {
      this.emit('preview-generated', result);
    });
  }

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
  // Cleanup
  // ============================================================================

  destroy(): void {
    this.cache.clear();
    this.queue.clear();
    this.eventHandlers.clear();
  }
}

// Export singleton instance
export const previewService = PreviewService.getInstance();

