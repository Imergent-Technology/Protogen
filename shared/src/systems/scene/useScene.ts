/**
 * useScene Hook
 * 
 * React hook for interacting with the Scene System.
 * Provides state and methods for scene and slide management.
 */

import { useState, useEffect, useCallback } from 'react';
import { sceneSystem } from './SceneSystem';
import type {
  Scene,
  Slide,
  SceneSystemState,
  NavigationDirection,
  SlideAnimation,
} from './types';

export interface UseSceneReturn {
  // State
  currentScene: Scene | null;
  currentSlide: Slide | null;
  currentSlideIndex: number;
  slideCount: number;
  isLoading: boolean;
  isAnimating: boolean;
  error: string | null;
  
  // Navigation
  navigateToSlide: (slideIndex: number, direction?: NavigationDirection) => Promise<void>;
  nextSlide: () => Promise<void>;
  previousSlide: () => Promise<void>;
  canGoNext: boolean;
  canGoPrevious: boolean;
  
  // Scene Management
  loadScene: (sceneId: string | number) => Promise<void>;
  unloadScene: () => Promise<void>;
  
  // Animation Resolution
  getSlideEntranceAnimation: (slide: Slide) => SlideAnimation;
  getSlideExitAnimation: (slide: Slide) => SlideAnimation;
  
  // Lifecycle
  play: () => Promise<void>;
  pause: () => Promise<void>;
  reset: () => Promise<void>;
}

/**
 * Hook for scene and slide management
 */
export function useScene(autoLoadSceneId?: string | number): UseSceneReturn {
  const [state, setState] = useState<SceneSystemState>(sceneSystem.getState());

  // Subscribe to scene system state changes
  useEffect(() => {
    const handleStateChange = () => {
      setState(sceneSystem.getState());
    };

    // Listen to all scene events
    sceneSystem.on('scene-loaded', handleStateChange);
    sceneSystem.on('scene-unloaded', handleStateChange);
    sceneSystem.on('slide-changed', handleStateChange);
    sceneSystem.on('animation-complete', handleStateChange);

    // Auto-load scene if specified
    if (autoLoadSceneId) {
      sceneSystem.loadScene(autoLoadSceneId);
    }

    return () => {
      sceneSystem.off('scene-loaded', handleStateChange);
      sceneSystem.off('scene-unloaded', handleStateChange);
      sceneSystem.off('slide-changed', handleStateChange);
      sceneSystem.off('animation-complete', handleStateChange);
    };
  }, [autoLoadSceneId]);

  // Memoized callbacks
  const loadScene = useCallback(async (sceneId: string | number) => {
    await sceneSystem.loadScene(sceneId);
    setState(sceneSystem.getState());
  }, []);

  const unloadScene = useCallback(async () => {
    await sceneSystem.unloadScene();
    setState(sceneSystem.getState());
  }, []);

  const navigateToSlide = useCallback(async (slideIndex: number, direction?: NavigationDirection) => {
    await sceneSystem.navigateToSlide(slideIndex, direction);
    setState(sceneSystem.getState());
  }, []);

  const nextSlide = useCallback(async () => {
    await sceneSystem.nextSlide();
    setState(sceneSystem.getState());
  }, []);

  const previousSlide = useCallback(async () => {
    await sceneSystem.previousSlide();
    setState(sceneSystem.getState());
  }, []);

  const play = useCallback(async () => {
    await sceneSystem.play();
  }, []);

  const pause = useCallback(async () => {
    await sceneSystem.pause();
  }, []);

  const reset = useCallback(async () => {
    await sceneSystem.reset();
    setState(sceneSystem.getState());
  }, []);

  const getSlideEntranceAnimation = useCallback((slide: Slide) => {
    return sceneSystem.getSlideEntranceAnimation(slide);
  }, []);

  const getSlideExitAnimation = useCallback((slide: Slide) => {
    return sceneSystem.getSlideExitAnimation(slide);
  }, []);

  return {
    // State
    currentScene: state.currentScene,
    currentSlide: sceneSystem.getCurrentSlide(),
    currentSlideIndex: state.currentSlideIndex,
    slideCount: state.slides.length,
    isLoading: state.isLoading,
    isAnimating: state.isAnimating,
    error: state.error,

    // Navigation
    navigateToSlide,
    nextSlide,
    previousSlide,
    canGoNext: sceneSystem.canGoNext(),
    canGoPrevious: sceneSystem.canGoPrevious(),

    // Scene Management
    loadScene,
    unloadScene,

    // Animation Resolution
    getSlideEntranceAnimation,
    getSlideExitAnimation,

    // Lifecycle
    play,
    pause,
    reset,
  };
}

