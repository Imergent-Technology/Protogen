/**
 * useBatchPreviews Hook - M1 Week 5
 * 
 * React hook for batch preview generation.
 * Optimized for loading multiple previews at once (ToC, Carousel).
 * 
 * Based on Spec 07: Preview Service Specification
 */

import { useState, useEffect } from 'react';
import { previewService } from '../services/PreviewService';
import type { PreviewTarget, PreviewSize, GenerateOptions } from '../types/preview';

export interface UseBatchPreviewsReturn {
  previews: Map<string, string>;
  loading: boolean;
  error: string | null;
  progress: number; // 0-100
}

export function useBatchPreviews(
  targets: PreviewTarget[],
  size: PreviewSize = 'sm',
  options?: GenerateOptions
): UseBatchPreviewsReturn {
  const [previews, setPreviews] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (targets.length === 0) {
      setPreviews(new Map());
      setProgress(0);
      return;
    }

    let cancelled = false;

    async function generateBatch() {
      setLoading(true);
      setError(null);
      setProgress(0);

      try {
        // Generate batch
        const results = await previewService.generateBatch(targets, size, options);

        if (!cancelled) {
          setPreviews(results);
          setProgress(100);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to generate previews');
          setLoading(false);
        }
      }
    }

    generateBatch();

    // Listen to progress events
    const handleProgress = (payload: any) => {
      if (!cancelled) {
        const completed = payload.cached + payload.generated;
        const total = payload.total;
        setProgress(Math.round((completed / total) * 100));
      }
    };

    previewService.on('batch-completed', handleProgress);

    return () => {
      cancelled = true;
      previewService.off('batch-completed', handleProgress);
    };
  }, [targets, size, options]);

  return {
    previews,
    loading,
    error,
    progress
  };
}

/**
 * Simplified hook for ToC tree (returns array of data URLs in order)
 */
export function useTocPreviews(
  targets: PreviewTarget[],
  size: PreviewSize = 'xs'
): string[] {
  const { previews } = useBatchPreviews(targets, size, { priority: 'low' });

  // Convert map to array in same order as targets
  return targets.map(target => {
    const key = getTargetKey(target);
    return previews.get(key) || '';
  });
}

function getTargetKey(target: PreviewTarget): string {
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

