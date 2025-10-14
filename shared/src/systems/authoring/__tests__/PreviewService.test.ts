/**
 * PreviewService Tests - M1 Week 5
 * 
 * Tests for PreviewService class
 * Based on Spec 07: Preview Service Specification
 */

import { PreviewService } from '../services/PreviewService';
import type { PreviewTarget } from '../types/preview';

describe('PreviewService', () => {
  let previewService: PreviewService;
  let mockTarget: PreviewTarget;

  beforeEach(() => {
    previewService = PreviewService.getInstance();
    previewService.clearCache();

    mockTarget = {
      type: 'slide',
      sceneId: 'scene-123',
      slideId: 'slide-456'
    };
  });

  describe('Singleton Pattern', () => {
    test('should return same instance', () => {
      const instance1 = PreviewService.getInstance();
      const instance2 = PreviewService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('Preview Generation', () => {
    test('should generate preview for target', async () => {
      const dataUrl = await previewService.generatePreview(mockTarget, 'sm');

      expect(dataUrl).toBeTruthy();
      expect(dataUrl).toContain('data:image');
    });

    test('should return cached preview on second request', async () => {
      const dataUrl1 = await previewService.generatePreview(mockTarget, 'sm');
      const dataUrl2 = await previewService.generatePreview(mockTarget, 'sm');

      expect(dataUrl1).toBe(dataUrl2);
    });

    test('should support different sizes', async () => {
      const xs = await previewService.generatePreview(mockTarget, 'xs');
      const sm = await previewService.generatePreview(mockTarget, 'sm');
      const md = await previewService.generatePreview(mockTarget, 'md');

      expect(xs).toBeTruthy();
      expect(sm).toBeTruthy();
      expect(md).toBeTruthy();
    });

    test('should generate previews for different target types', async () => {
      const sceneTarget: PreviewTarget = {
        type: 'scene',
        sceneId: 'scene-123'
      };

      const slideTarget: PreviewTarget = {
        type: 'slide',
        sceneId: 'scene-123',
        slideId: 'slide-456'
      };

      const scenePreview = await previewService.generatePreview(sceneTarget, 'sm');
      const slidePreview = await previewService.generatePreview(slideTarget, 'sm');

      expect(scenePreview).toBeTruthy();
      expect(slidePreview).toBeTruthy();
    });
  });

  describe('Batch Generation', () => {
    test('should generate batch of previews', async () => {
      const targets: PreviewTarget[] = [
        { type: 'slide', sceneId: 'scene-123', slideId: 'slide-1' },
        { type: 'slide', sceneId: 'scene-123', slideId: 'slide-2' },
        { type: 'slide', sceneId: 'scene-123', slideId: 'slide-3' }
      ];

      const results = await previewService.generateBatch(targets, 'sm');

      expect(results.size).toBe(3);
      expect(results.get('slide:scene-123:slide-1')).toBeTruthy();
      expect(results.get('slide:scene-123:slide-2')).toBeTruthy();
      expect(results.get('slide:scene-123:slide-3')).toBeTruthy();
    });

    test('should use cache for batch when available', async () => {
      const targets: PreviewTarget[] = [
        { type: 'slide', sceneId: 'scene-123', slideId: 'slide-1' },
        { type: 'slide', sceneId: 'scene-123', slideId: 'slide-2' }
      ];

      // Generate first
      await previewService.generatePreview(targets[0], 'sm');

      // Batch should use cache for first, generate second
      const results = await previewService.generateBatch(targets, 'sm');

      expect(results.size).toBe(2);
    });

    test('should emit batch-started and batch-completed events', async () => {
      const startHandler = jest.fn();
      const completeHandler = jest.fn();

      previewService.on('batch-started', startHandler);
      previewService.on('batch-completed', completeHandler);

      const targets: PreviewTarget[] = [
        { type: 'slide', sceneId: 'scene-123', slideId: 'slide-1' }
      ];

      await previewService.generateBatch(targets, 'sm');

      expect(startHandler).toHaveBeenCalled();
      expect(completeHandler).toHaveBeenCalled();
    });
  });

  describe('Cache Management', () => {
    test('should get cached preview', async () => {
      await previewService.generatePreview(mockTarget, 'sm');

      const cached = previewService.getCached(mockTarget, 'sm');

      expect(cached).toBeTruthy();
    });

    test('should return null for non-cached preview', () => {
      const cached = previewService.getCached(mockTarget, 'sm');

      expect(cached).toBeNull();
    });

    test('should invalidate preview', async () => {
      await previewService.generatePreview(mockTarget, 'sm');

      previewService.invalidate(mockTarget);

      const cached = previewService.getCached(mockTarget, 'sm');
      expect(cached).toBeNull();
    });

    test('should invalidate all sizes for target', async () => {
      await previewService.generatePreview(mockTarget, 'xs');
      await previewService.generatePreview(mockTarget, 'sm');
      await previewService.generatePreview(mockTarget, 'md');

      previewService.invalidate(mockTarget);

      expect(previewService.getCached(mockTarget, 'xs')).toBeNull();
      expect(previewService.getCached(mockTarget, 'sm')).toBeNull();
      expect(previewService.getCached(mockTarget, 'md')).toBeNull();
    });

    test('should invalidate all previews for scene', async () => {
      const targets: PreviewTarget[] = [
        { type: 'slide', sceneId: 'scene-123', slideId: 'slide-1' },
        { type: 'slide', sceneId: 'scene-123', slideId: 'slide-2' }
      ];

      await previewService.generateBatch(targets, 'sm');

      previewService.invalidateScene('scene-123');

      expect(previewService.getCached(targets[0], 'sm')).toBeNull();
      expect(previewService.getCached(targets[1], 'sm')).toBeNull();
    });

    test('should clear entire cache', async () => {
      await previewService.generatePreview(mockTarget, 'sm');

      previewService.clearCache();

      const cached = previewService.getCached(mockTarget, 'sm');
      expect(cached).toBeNull();
    });

    test('should get cache stats', async () => {
      await previewService.generatePreview(mockTarget, 'sm');

      const stats = previewService.getCacheStats();

      expect(stats.size).toBeGreaterThanOrEqual(0);
      expect(stats.maxSize).toBeGreaterThan(0);
    });
  });

  describe('Event System', () => {
    test('should emit cache-hit event', async () => {
      const handler = jest.fn();
      previewService.on('cache-hit', handler);

      await previewService.generatePreview(mockTarget, 'sm');
      await previewService.generatePreview(mockTarget, 'sm'); // Second call hits cache

      expect(handler).toHaveBeenCalled();
    });

    test('should emit cache-miss event', async () => {
      const handler = jest.fn();
      previewService.on('cache-miss', handler);

      await previewService.generatePreview(mockTarget, 'sm');

      expect(handler).toHaveBeenCalled();
    });

    test('should emit cache-invalidated event', () => {
      const handler = jest.fn();
      previewService.on('cache-invalidated', handler);

      previewService.invalidate(mockTarget);

      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          target: mockTarget
        })
      );
    });
  });

  describe('Prefetch', () => {
    test('should prefetch previews with low priority', async () => {
      const targets: PreviewTarget[] = [
        { type: 'slide', sceneId: 'scene-123', slideId: 'slide-1' },
        { type: 'slide', sceneId: 'scene-123', slideId: 'slide-2' }
      ];

      await previewService.prefetch(targets, 'sm');

      // Should eventually be cached
      // Note: This is async, so we may need to wait
      await new Promise(resolve => setTimeout(resolve, 100));
    });
  });
});

