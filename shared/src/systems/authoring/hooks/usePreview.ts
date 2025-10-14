/**
 * usePreview Hook - M1 Week 5
 * 
 * React hook for preview generation and caching.
 * Handles loading states and automatic regeneration.
 * 
 * Based on Spec 07: Preview Service Specification
 */

import { useState, useEffect } from 'react';
import { previewService } from '../services/PreviewService';
import type { PreviewTarget, PreviewSize, GenerateOptions } from '../types/preview';

export interface UsePreviewReturn {
  dataUrl: string | null;
  loading: boolean;
  error: string | null;
  regenerate: () => Promise<void>;
}

export function usePreview(
  target: PreviewTarget | null,
  size: PreviewSize = 'sm',
  options?: GenerateOptions
): UsePreviewReturn {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!target) {
      setDataUrl(null);
      return;
    }

    let cancelled = false;

    async function generate() {
      // Check cache first
      const cached = previewService.getCached(target!, size);
      if (cached) {
        setDataUrl(cached);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const url = await previewService.generatePreview(target!, size, options);

        if (!cancelled) {
          setDataUrl(url);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to generate preview');
          setLoading(false);
        }
      }
    }

    generate();

    return () => {
      cancelled = true;
    };
  }, [target, size, options]);

  const regenerate = async () => {
    if (!target) return;

    setLoading(true);
    setError(null);

    try {
      // Invalidate cache first
      previewService.invalidate(target);

      // Generate new preview
      const url = await previewService.generatePreview(target, size, { ...options, skipCache: true });
      setDataUrl(url);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to regenerate preview');
      setLoading(false);
    }
  };

  return {
    dataUrl,
    loading,
    error,
    regenerate
  };
}

