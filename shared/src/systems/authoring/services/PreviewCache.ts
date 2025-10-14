/**
 * PreviewCache - M1 Week 5
 * 
 * LRU (Least Recently Used) cache for preview thumbnails.
 * Automatic eviction when cache is full.
 * 
 * Based on Spec 07: Preview Service Specification
 */

import type { CachedPreview, CacheStats } from '../types/preview';

export class PreviewCache {
  private static instance: PreviewCache;
  private cache: Map<string, CachedPreview> = new Map();
  private maxSize: number;
  private hitCount = 0;
  private missCount = 0;
  private evictionCount = 0;

  private constructor(maxSize: number = 200) {
    this.maxSize = maxSize;
  }

  // ============================================================================
  // Singleton Pattern
  // ============================================================================

  static getInstance(maxSize?: number): PreviewCache {
    if (!PreviewCache.instance) {
      PreviewCache.instance = new PreviewCache(maxSize);
    }
    return PreviewCache.instance;
  }

  // ============================================================================
  // Cache Operations
  // ============================================================================

  get(key: string): CachedPreview | null {
    const cached = this.cache.get(key);

    if (cached) {
      // Update access time and count (LRU)
      cached.accessedAt = Date.now();
      cached.accessCount++;

      // Move to end (most recently used)
      this.cache.delete(key);
      this.cache.set(key, cached);

      this.hitCount++;
      return cached;
    }

    this.missCount++;
    return null;
  }

  set(key: string, preview: CachedPreview): void {
    // If key exists, delete it first (will re-add at end)
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }

    // Check if cache is full
    if (this.cache.size >= this.maxSize) {
      this.evictLRU();
    }

    // Add to cache (at end = most recently used)
    this.cache.set(key, {
      ...preview,
      accessedAt: Date.now(),
      accessCount: 1
    });
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Delete all keys matching a pattern
   * Used for invalidating all previews for a scene
   */
  deletePattern(pattern: string): number {
    let deleted = 0;
    const regex = new RegExp(pattern.replace('*', '.*'));

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        deleted++;
      }
    }

    return deleted;
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }

  clear(): void {
    this.cache.clear();
    this.hitCount = 0;
    this.missCount = 0;
    this.evictionCount = 0;
  }

  // ============================================================================
  // LRU Eviction
  // ============================================================================

  private evictLRU(): void {
    // Get first key (least recently used)
    const firstKey = this.cache.keys().next().value;

    if (firstKey) {
      this.cache.delete(firstKey);
      this.evictionCount++;
    }
  }

  /**
   * Manually evict oldest entries to free up space
   */
  evictOldest(count: number): number {
    let evicted = 0;

    for (let i = 0; i < count; i++) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
        evicted++;
      } else {
        break;
      }
    }

    this.evictionCount += evicted;
    return evicted;
  }

  // ============================================================================
  // Statistics
  // ============================================================================

  getStats(): CacheStats {
    const totalRequests = this.hitCount + this.missCount;
    const hitRate = totalRequests > 0 ? this.hitCount / totalRequests : 0;

    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitCount: this.hitCount,
      missCount: this.missCount,
      evictionCount: this.evictionCount,
      hitRate: Math.round(hitRate * 100) / 100
    };
  }

  getSize(): number {
    return this.cache.size;
  }

  getMaxSize(): number {
    return this.maxSize;
  }

  setMaxSize(maxSize: number): void {
    this.maxSize = maxSize;

    // Evict if over new max
    while (this.cache.size > this.maxSize) {
      this.evictLRU();
    }
  }

  // ============================================================================
  // Utilities
  // ============================================================================

  /**
   * Get all cached keys
   */
  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Get all cached values
   */
  values(): CachedPreview[] {
    return Array.from(this.cache.values());
  }

  /**
   * Get cache entries as array
   */
  entries(): [string, CachedPreview][] {
    return Array.from(this.cache.entries());
  }
}

