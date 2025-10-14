/**
 * useSlideManagement Hook
 * 
 * React hook for managing slides with loading states and error handling.
 */

import { useState, useCallback } from 'react';
import { slideManagementService } from '../services/SlideManagementService';
import type {
  SlideConfig,
  CreateSlideInput,
  UpdateSlideInput,
  SlidePermissions
} from '../types/slide-config';

export interface UseSlideManagementReturn {
  slides: SlideConfig[];
  loading: boolean;
  error: string | null;
  loadSlidesByDeck: (deckId: string) => Promise<void>;
  loadSlidesByScene: (sceneId: string) => Promise<void>;
  getSlide: (id: string) => Promise<SlideConfig | null>;
  createSlide: (input: CreateSlideInput) => Promise<SlideConfig | null>;
  updateSlide: (id: string, input: UpdateSlideInput) => Promise<SlideConfig | null>;
  deleteSlide: (id: string) => Promise<boolean>;
  duplicateSlide: (id: string) => Promise<SlideConfig | null>;
  reorderSlide: (id: string, newOrder: number) => Promise<SlideConfig | null>;
  getPermissions: (id: string) => Promise<SlidePermissions | null>;
  uploadMedia: (id: string, file: File) => Promise<{ url: string; thumbnail?: string } | null>;
  deleteMedia: (id: string, mediaId: string) => Promise<boolean>;
}

export function useSlideManagement(): UseSlideManagementReturn {
  const [slides, setSlides] = useState<SlideConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSlidesByDeck = useCallback(async (deckId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await slideManagementService.getSlidesByDeck(deckId);
      setSlides(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load slides');
      console.error('Failed to load slides by deck:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadSlidesByScene = useCallback(async (sceneId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await slideManagementService.getSlidesByScene(sceneId);
      setSlides(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load slides');
      console.error('Failed to load slides by scene:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const getSlide = useCallback(async (id: string): Promise<SlideConfig | null> => {
    setLoading(true);
    setError(null);
    try {
      const slide = await slideManagementService.getSlide(id);
      return slide;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get slide');
      console.error('Failed to get slide:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createSlide = useCallback(async (input: CreateSlideInput): Promise<SlideConfig | null> => {
    setLoading(true);
    setError(null);
    try {
      const slide = await slideManagementService.createSlide(input);
      setSlides(prev => [...prev, slide]);
      return slide;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create slide');
      console.error('Failed to create slide:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSlide = useCallback(async (id: string, input: UpdateSlideInput): Promise<SlideConfig | null> => {
    setLoading(true);
    setError(null);
    try {
      const slide = await slideManagementService.updateSlide(id, input);
      setSlides(prev => prev.map(s => s.id === id ? slide : s));
      return slide;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update slide');
      console.error('Failed to update slide:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteSlide = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await slideManagementService.deleteSlide(id);
      setSlides(prev => prev.filter(s => s.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete slide');
      console.error('Failed to delete slide:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const duplicateSlide = useCallback(async (id: string): Promise<SlideConfig | null> => {
    setLoading(true);
    setError(null);
    try {
      const slide = await slideManagementService.duplicateSlide(id);
      setSlides(prev => [...prev, slide]);
      return slide;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to duplicate slide');
      console.error('Failed to duplicate slide:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const reorderSlide = useCallback(async (id: string, newOrder: number): Promise<SlideConfig | null> => {
    setLoading(true);
    setError(null);
    try {
      const slide = await slideManagementService.reorderSlide(id, newOrder);
      setSlides(prev => prev.map(s => s.id === id ? slide : s));
      return slide;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reorder slide');
      console.error('Failed to reorder slide:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getPermissions = useCallback(async (id: string): Promise<SlidePermissions | null> => {
    try {
      return await slideManagementService.getSlidePermissions(id);
    } catch (err) {
      console.error('Failed to get slide permissions:', err);
      return null;
    }
  }, []);

  const uploadMedia = useCallback(async (id: string, file: File): Promise<{ url: string; thumbnail?: string } | null> => {
    setLoading(true);
    setError(null);
    try {
      const result = await slideManagementService.uploadMedia(id, file);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload media');
      console.error('Failed to upload media:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteMedia = useCallback(async (id: string, mediaId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await slideManagementService.deleteMedia(id, mediaId);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete media');
      console.error('Failed to delete media:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    slides,
    loading,
    error,
    loadSlidesByDeck,
    loadSlidesByScene,
    getSlide,
    createSlide,
    updateSlide,
    deleteSlide,
    duplicateSlide,
    reorderSlide,
    getPermissions,
    uploadMedia,
    deleteMedia,
  };
}

