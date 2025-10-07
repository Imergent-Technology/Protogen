/**
 * useSlide Hook
 * 
 * React hook for interacting with the Slide System.
 * Provides state management and methods for slide navigation and management.
 */

import { useEffect, useState, useCallback } from 'react';
import { slideSystem } from './SlideSystem';
import { UseSlideReturn, SlideState, TweeningConfig } from './types';

export const useSlide = (sceneId?: string): UseSlideReturn => {
  const [currentSlide, setCurrentSlide] = useState<SlideState | null>(slideSystem.getCurrentSlide());
  const [slideHistory, setSlideHistory] = useState<SlideState[]>(slideSystem.getSlideHistory());
  const [isTransitioning, setIsTransitioning] = useState(slideSystem.isCurrentlyTransitioning());
  const [transitionProgress, setTransitionProgress] = useState(slideSystem.getTransitionProgress());

  // Update state when slide system state changes
  useEffect(() => {
    const handleSlideChange = (slideState: SlideState) => {
      setCurrentSlide(slideState);
    };

    const handleHistoryUpdate = (history: SlideState[]) => {
      setSlideHistory(history);
    };

    const handleTransitionStart = () => {
      setIsTransitioning(true);
      setTransitionProgress(0);
    };

    const handleTransitionComplete = () => {
      setIsTransitioning(false);
      setTransitionProgress(1);
    };

    const handleTransitionUpdate = (progress: number) => {
      setTransitionProgress(progress);
    };

    // Subscribe to slide system events
    slideSystem.on('slideChange', handleSlideChange);
    slideSystem.on('slideTransitionStart', handleTransitionStart);
    slideSystem.on('slideTransitionComplete', handleTransitionComplete);
    slideSystem.on('slideTransitionPause', () => setIsTransitioning(false));
    slideSystem.on('slideTransitionResume', () => setIsTransitioning(true));
    slideSystem.on('slideTransitionStop', () => {
      setIsTransitioning(false);
      setTransitionProgress(0);
    });

    // Cleanup event listeners
    return () => {
      // Note: In a real implementation, we'd need a way to unsubscribe specific handlers
      // For now, we'll rely on the component unmounting to clean up
    };
  }, []);

  // Navigation methods
  const navigateToSlide = useCallback(async (slideId: string): Promise<void> => {
    try {
      await slideSystem.navigateToSlide(slideId);
    } catch (error) {
      console.error('Failed to navigate to slide:', error);
      throw error;
    }
  }, []);

  const navigateToSlideByIndex = useCallback(async (sceneId: string, slideIndex: number): Promise<void> => {
    try {
      await slideSystem.navigateToSlideByIndex(sceneId, slideIndex);
    } catch (error) {
      console.error('Failed to navigate to slide by index:', error);
      throw error;
    }
  }, []);

  const canGoToPreviousSlide = useCallback((): boolean => {
    return slideHistory.length > 0;
  }, [slideHistory]);

  const canGoToNextSlide = useCallback((): boolean => {
    // This would need to be implemented based on the current slide's scene
    // and available slides in that scene
    return false; // Placeholder
  }, []);

  const goToPreviousSlide = useCallback(async (): Promise<void> => {
    if (slideHistory.length > 0) {
      const previousSlide = slideHistory[slideHistory.length - 1];
      await navigateToSlide(previousSlide.id);
    }
  }, [slideHistory, navigateToSlide]);

  const goToNextSlide = useCallback(async (): Promise<void> => {
    // This would need to be implemented based on the current slide's scene
    // and available slides in that scene
    console.warn('goToNextSlide not yet implemented');
  }, []);

  // Slide management methods
  const createSlide = useCallback(async (sceneId: string, slideData: any) => {
    try {
      return await slideSystem.createSlide(sceneId, slideData);
    } catch (error) {
      console.error('Failed to create slide:', error);
      throw error;
    }
  }, []);

  const updateSlide = useCallback(async (slideId: string, updates: any) => {
    try {
      return await slideSystem.updateSlide(slideId, updates);
    } catch (error) {
      console.error('Failed to update slide:', error);
      throw error;
    }
  }, []);

  const deleteSlide = useCallback(async (slideId: string): Promise<void> => {
    try {
      await slideSystem.deleteSlide(slideId);
    } catch (error) {
      console.error('Failed to delete slide:', error);
      throw error;
    }
  }, []);

  // Slide item management methods
  const createSlideItem = useCallback(async (slideId: string, nodeId: string, itemData: any) => {
    try {
      return await slideSystem.createSlideItem(slideId, nodeId, itemData);
    } catch (error) {
      console.error('Failed to create slide item:', error);
      throw error;
    }
  }, []);

  const updateSlideItem = useCallback(async (itemId: string, updates: any) => {
    try {
      return await slideSystem.updateSlideItem(itemId, updates);
    } catch (error) {
      console.error('Failed to update slide item:', error);
      throw error;
    }
  }, []);

  const deleteSlideItem = useCallback(async (itemId: string): Promise<void> => {
    try {
      await slideSystem.deleteSlideItem(itemId);
    } catch (error) {
      console.error('Failed to delete slide item:', error);
      throw error;
    }
  }, []);

  // Animation control methods
  const startTransition = useCallback(async (toSlideId: string, config?: TweeningConfig): Promise<void> => {
    try {
      if (!currentSlide) {
        throw new Error('No current slide to transition from');
      }
      await slideSystem.startSlideTransition(currentSlide.id, toSlideId, config);
    } catch (error) {
      console.error('Failed to start transition:', error);
      throw error;
    }
  }, [currentSlide]);

  const pauseTransition = useCallback((): void => {
    slideSystem.pauseSlideTransition();
  }, []);

  const resumeTransition = useCallback((): void => {
    slideSystem.resumeSlideTransition();
  }, []);

  const stopTransition = useCallback((): void => {
    slideSystem.stopSlideTransition();
  }, []);

  return {
    // Current state
    currentSlide,
    slideHistory,
    isTransitioning,
    transitionProgress,
    
    // Navigation
    navigateToSlide,
    navigateToSlideByIndex,
    canGoToPreviousSlide,
    canGoToNextSlide,
    goToPreviousSlide,
    goToNextSlide,
    
    // Slide management
    createSlide,
    updateSlide,
    deleteSlide,
    
    // Slide item management
    createSlideItem,
    updateSlideItem,
    deleteSlideItem,
    
    // Animation control
    startTransition,
    pauseTransition,
    resumeTransition,
    stopTransition,
  };
};
