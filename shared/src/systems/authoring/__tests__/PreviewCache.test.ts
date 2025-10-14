/**
 * PreviewCache Tests - M1 Week 5
 * 
 * Tests for PreviewCache (LRU cache)
 * Based on Spec 07: Preview Service Specification
 */

import { PreviewCache } from '../services/PreviewCache';
import type { CachedPreview } from '../types/preview';

describe('PreviewCache', () => {
  let cache: PreviewCache;
  let mockPreview: CachedPreview;

  beforeEach(() => {
    cache = PreviewCache.getInstance();
    cache.clear();

    mockPreview = {
      targetType: 'slide',
      targetId: 'slide-123',
      size: 'sm',
      hash: 'abc123',
      width: 160,
      height: 120,
      generatedAt: Date.now(),
      dataUrl: 'data:image/jpeg;base64,test',
      accessedAt: Date.now(),
      accessCount: 0
    };
  });

  describe('Basic Operations', () => {
    test('should set and get value', () => {
      cache.set('key1', mockPreview);

      const result = cache.get('key1');

      expect(result).not.toBeNull();
      expect(result?.targetId).toBe('slide-123');
    });

    test('should return null for non-existent key', () => {
      const result = cache.get('nonexistent');

      expect(result).toBeNull();
    });

    test('should check if key exists', () => {
      cache.set('key1', mockPreview);

      expect(cache.has('key1')).toBe(true);
      expect(cache.has('key2')).toBe(false);
    });

    test('should delete key', () => {
      cache.set('key1', mockPreview);
      cache.delete('key1');

      expect(cache.has('key1')).toBe(false);
    });

    test('should clear all entries', () => {
      cache.set('key1', mockPreview);
      cache.set('key2', { ...mockPreview, targetId: 'slide-456' });

      cache.clear();

      expect(cache.getSize()).toBe(0);
    });
  });

  describe('LRU Behavior', () => {
    test('should update access time on get', () => {
      cache.set('key1', mockPreview);

      const before = cache.get('key1');
      const beforeAccess = before?.accessedAt || 0;

      // Wait a bit
      setTimeout(() => {
        const after = cache.get('key1');
        const afterAccess = after?.accessedAt || 0;

        expect(afterAccess).toBeGreaterThanOrEqual(beforeAccess);
      }, 10);
    });

    test('should increment access count on get', () => {
      cache.set('key1', mockPreview);

      cache.get('key1');
      cache.get('key1');
      cache.get('key1');

      const result = cache.get('key1');

      expect(result?.accessCount).toBeGreaterThan(0);
    });

    test('should evict least recently used when full', () => {
      const smallCache = PreviewCache.getInstance(3); // Max 3 items
      smallCache.clear();

      smallCache.set('key1', { ...mockPreview, targetId: 'slide-1' });
      smallCache.set('key2', { ...mockPreview, targetId: 'slide-2' });
      smallCache.set('key3', { ...mockPreview, targetId: 'slide-3' });

      // This should evict key1 (oldest)
      smallCache.set('key4', { ...mockPreview, targetId: 'slide-4' });

      expect(smallCache.has('key1')).toBe(false);
      expect(smallCache.has('key2')).toBe(true);
      expect(smallCache.has('key3')).toBe(true);
      expect(smallCache.has('key4')).toBe(true);
    });

    test('should move accessed item to end (most recent)', () => {
      const smallCache = PreviewCache.getInstance(3);
      smallCache.clear();

      smallCache.set('key1', { ...mockPreview, targetId: 'slide-1' });
      smallCache.set('key2', { ...mockPreview, targetId: 'slide-2' });
      smallCache.set('key3', { ...mockPreview, targetId: 'slide-3' });

      // Access key1 to make it most recent
      smallCache.get('key1');

      // Add key4 - should evict key2 (oldest) not key1
      smallCache.set('key4', { ...mockPreview, targetId: 'slide-4' });

      expect(smallCache.has('key1')).toBe(true);
      expect(smallCache.has('key2')).toBe(false);
      expect(smallCache.has('key3')).toBe(true);
      expect(smallCache.has('key4')).toBe(true);
    });
  });

  describe('Pattern Deletion', () => {
    test('should delete keys matching pattern', () => {
      cache.set('scene:123:slide-1:sm', mockPreview);
      cache.set('scene:123:slide-2:sm', mockPreview);
      cache.set('scene:456:slide-3:sm', mockPreview);

      const deleted = cache.deletePattern('scene:123:*');

      expect(deleted).toBe(2);
      expect(cache.has('scene:123:slide-1:sm')).toBe(false);
      expect(cache.has('scene:123:slide-2:sm')).toBe(false);
      expect(cache.has('scene:456:slide-3:sm')).toBe(true);
    });
  });

  describe('Statistics', () => {
    test('should track cache hits and misses', () => {
      cache.set('key1', mockPreview);

      cache.get('key1'); // Hit
      cache.get('key2'); // Miss

      const stats = cache.getStats();

      expect(stats.hitCount).toBe(1);
      expect(stats.missCount).toBe(1);
      expect(stats.hitRate).toBeCloseTo(0.5);
    });

    test('should track evictions', () => {
      const smallCache = PreviewCache.getInstance(2);
      smallCache.clear();

      smallCache.set('key1', mockPreview);
      smallCache.set('key2', mockPreview);
      smallCache.set('key3', mockPreview); // Evicts key1

      const stats = smallCache.getStats();

      expect(stats.evictionCount).toBeGreaterThan(0);
    });

    test('should return cache size and max size', () => {
      cache.set('key1', mockPreview);
      cache.set('key2', mockPreview);

      const stats = cache.getStats();

      expect(stats.size).toBe(2);
      expect(stats.maxSize).toBeGreaterThan(0);
    });
  });

  describe('Manual Eviction', () => {
    test('should evict oldest entries', () => {
      cache.set('key1', mockPreview);
      cache.set('key2', mockPreview);
      cache.set('key3', mockPreview);

      const evicted = cache.evictOldest(2);

      expect(evicted).toBe(2);
      expect(cache.getSize()).toBe(1);
    });
  });

  describe('Size Management', () => {
    test('should get and set max size', () => {
      const initialMax = cache.getMaxSize();

      cache.setMaxSize(100);

      expect(cache.getMaxSize()).toBe(100);
    });

    test('should evict excess entries when reducing max size', () => {
      cache.set('key1', mockPreview);
      cache.set('key2', mockPreview);
      cache.set('key3', mockPreview);

      cache.setMaxSize(2);

      expect(cache.getSize()).toBeLessThanOrEqual(2);
    });
  });

  describe('Utility Methods', () => {
    test('should get all keys', () => {
      cache.set('key1', mockPreview);
      cache.set('key2', mockPreview);

      const keys = cache.keys();

      expect(keys).toHaveLength(2);
      expect(keys).toContain('key1');
      expect(keys).toContain('key2');
    });

    test('should get all values', () => {
      cache.set('key1', mockPreview);
      cache.set('key2', mockPreview);

      const values = cache.values();

      expect(values).toHaveLength(2);
    });

    test('should get all entries', () => {
      cache.set('key1', mockPreview);
      cache.set('key2', mockPreview);

      const entries = cache.entries();

      expect(entries).toHaveLength(2);
      expect(entries[0][0]).toBe('key1');
    });
  });
});

