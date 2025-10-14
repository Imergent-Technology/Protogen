/**
 * useSceneManagement Hook
 * 
 * React hook for managing scenes with loading states and error handling.
 */

import { useState, useCallback } from 'react';
import { sceneManagementService } from '../services/SceneManagementService';
import type {
  SceneConfig,
  CreateSceneInput,
  UpdateSceneInput,
  ScenePermissions
} from '../types/scene-config';

export interface UseSceneManagementReturn {
  scenes: SceneConfig[];
  loading: boolean;
  error: string | null;
  loadScenes: (params?: Parameters<typeof sceneManagementService.getScenes>[0]) => Promise<void>;
  getScene: (id: string) => Promise<SceneConfig | null>;
  getSceneBySlug: (slug: string) => Promise<SceneConfig | null>;
  createScene: (input: CreateSceneInput) => Promise<SceneConfig | null>;
  updateScene: (id: string, input: UpdateSceneInput) => Promise<SceneConfig | null>;
  deleteScene: (id: string) => Promise<boolean>;
  publishScene: (id: string) => Promise<SceneConfig | null>;
  unpublishScene: (id: string) => Promise<SceneConfig | null>;
  duplicateScene: (id: string, newName?: string) => Promise<SceneConfig | null>;
  getPermissions: (id: string) => Promise<ScenePermissions | null>;
  linkDecks: (id: string, deckIds: string[]) => Promise<SceneConfig | null>;
  unlinkDecks: (id: string, deckIds: string[]) => Promise<SceneConfig | null>;
}

export function useSceneManagement(): UseSceneManagementReturn {
  const [scenes, setScenes] = useState<SceneConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadScenes = useCallback(async (params?: Parameters<typeof sceneManagementService.getScenes>[0]) => {
    setLoading(true);
    setError(null);
    try {
      const data = await sceneManagementService.getScenes(params);
      setScenes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load scenes');
      console.error('Failed to load scenes:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const getScene = useCallback(async (id: string): Promise<SceneConfig | null> => {
    setLoading(true);
    setError(null);
    try {
      const scene = await sceneManagementService.getScene(id);
      return scene;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get scene');
      console.error('Failed to get scene:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getSceneBySlug = useCallback(async (slug: string): Promise<SceneConfig | null> => {
    setLoading(true);
    setError(null);
    try {
      const scene = await sceneManagementService.getSceneBySlug(slug);
      return scene;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get scene');
      console.error('Failed to get scene by slug:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createScene = useCallback(async (input: CreateSceneInput): Promise<SceneConfig | null> => {
    setLoading(true);
    setError(null);
    try {
      const scene = await sceneManagementService.createScene(input);
      setScenes(prev => [...prev, scene]);
      return scene;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create scene');
      console.error('Failed to create scene:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateScene = useCallback(async (id: string, input: UpdateSceneInput): Promise<SceneConfig | null> => {
    setLoading(true);
    setError(null);
    try {
      const scene = await sceneManagementService.updateScene(id, input);
      setScenes(prev => prev.map(s => s.id === id ? scene : s));
      return scene;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update scene');
      console.error('Failed to update scene:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteScene = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await sceneManagementService.deleteScene(id);
      setScenes(prev => prev.filter(s => s.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete scene');
      console.error('Failed to delete scene:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const publishScene = useCallback(async (id: string): Promise<SceneConfig | null> => {
    setLoading(true);
    setError(null);
    try {
      const scene = await sceneManagementService.publishScene(id);
      setScenes(prev => prev.map(s => s.id === id ? scene : s));
      return scene;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish scene');
      console.error('Failed to publish scene:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const unpublishScene = useCallback(async (id: string): Promise<SceneConfig | null> => {
    setLoading(true);
    setError(null);
    try {
      const scene = await sceneManagementService.unpublishScene(id);
      setScenes(prev => prev.map(s => s.id === id ? scene : s));
      return scene;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unpublish scene');
      console.error('Failed to unpublish scene:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const duplicateScene = useCallback(async (id: string, newName?: string): Promise<SceneConfig | null> => {
    setLoading(true);
    setError(null);
    try {
      const scene = await sceneManagementService.duplicateScene(id, newName);
      setScenes(prev => [...prev, scene]);
      return scene;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to duplicate scene');
      console.error('Failed to duplicate scene:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getPermissions = useCallback(async (id: string): Promise<ScenePermissions | null> => {
    try {
      return await sceneManagementService.getScenePermissions(id);
    } catch (err) {
      console.error('Failed to get scene permissions:', err);
      return null;
    }
  }, []);

  const linkDecks = useCallback(async (id: string, deckIds: string[]): Promise<SceneConfig | null> => {
    setLoading(true);
    setError(null);
    try {
      const scene = await sceneManagementService.linkDecks(id, deckIds);
      setScenes(prev => prev.map(s => s.id === id ? scene : s));
      return scene;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to link decks');
      console.error('Failed to link decks:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const unlinkDecks = useCallback(async (id: string, deckIds: string[]): Promise<SceneConfig | null> => {
    setLoading(true);
    setError(null);
    try {
      const scene = await sceneManagementService.unlinkDecks(id, deckIds);
      setScenes(prev => prev.map(s => s.id === id ? scene : s));
      return scene;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unlink decks');
      console.error('Failed to unlink decks:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    scenes,
    loading,
    error,
    loadScenes,
    getScene,
    getSceneBySlug,
    createScene,
    updateScene,
    deleteScene,
    publishScene,
    unpublishScene,
    duplicateScene,
    getPermissions,
    linkDecks,
    unlinkDecks,
  };
}

