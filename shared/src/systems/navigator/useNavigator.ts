import { useState, useEffect, useCallback, useRef } from 'react';
import { NavigatorSystem } from './NavigatorSystem';
import {
  NavigationTarget,
  CurrentContext,
  NavigationHistory,
  NavigatorState,
  NavigationEventHandler,
  DEFAULT_CONTEXT
} from './types';

export interface UseNavigatorReturn {
  // Navigation Methods
  navigateTo: (target: NavigationTarget) => Promise<void>;
  navigateBack: () => Promise<void>;
  navigateForward: () => Promise<void>;
  
  // State
  currentContext: CurrentContext;
  history: NavigationHistory;
  isLoading: boolean;
  error: string | null;
  
  // Context Management
  updateContext: (updates: Partial<CurrentContext>) => void;
  
  // History Management
  clearHistory: () => void;
  
  // Utility
  canGoBack: boolean;
  canGoForward: boolean;
}

export function useNavigator(initialContext?: CurrentContext): UseNavigatorReturn {
  const navigatorRef = useRef<NavigatorSystem | null>(null);
  const [state, setState] = useState<NavigatorState>({
    currentContext: initialContext || DEFAULT_CONTEXT,
    history: {
      entries: [],
      currentIndex: -1,
      canGoBack: false,
      canGoForward: false
    },
    isLoading: false,
    error: null
  });

  // Initialize Navigator System
  useEffect(() => {
    if (!navigatorRef.current) {
      navigatorRef.current = new NavigatorSystem(initialContext);
      
      // Set up event listeners
      const handleNavigationEvent: NavigationEventHandler = (_event) => {
        setState(navigatorRef.current!.getState());
      };

      navigatorRef.current.on('navigation', handleNavigationEvent);
      navigatorRef.current.on('context-change', handleNavigationEvent);
      navigatorRef.current.on('history-update', handleNavigationEvent);

      // Set initial state
      setState(navigatorRef.current.getState());

      // Cleanup
      return () => {
        if (navigatorRef.current) {
          navigatorRef.current.off('navigation', handleNavigationEvent);
          navigatorRef.current.off('context-change', handleNavigationEvent);
          navigatorRef.current.off('history-update', handleNavigationEvent);
        }
      };
    }
  }, [initialContext]);

  // Navigation Methods
  const navigateTo = useCallback(async (target: NavigationTarget) => {
    if (navigatorRef.current) {
      await navigatorRef.current.navigateTo(target);
    }
  }, []);

  const navigateBack = useCallback(async () => {
    if (navigatorRef.current) {
      await navigatorRef.current.navigateBack();
    }
  }, []);

  const navigateForward = useCallback(async () => {
    if (navigatorRef.current) {
      await navigatorRef.current.navigateForward();
    }
  }, []);

  // Context Management
  const updateContext = useCallback((updates: Partial<CurrentContext>) => {
    if (navigatorRef.current) {
      navigatorRef.current.updateContext(updates);
    }
  }, []);

  // History Management
  const clearHistory = useCallback(() => {
    if (navigatorRef.current) {
      navigatorRef.current.clearHistory();
    }
  }, []);

  return {
    // Navigation Methods
    navigateTo,
    navigateBack,
    navigateForward,
    
    // State
    currentContext: state.currentContext,
    history: state.history,
    isLoading: state.isLoading,
    error: state.error,
    
    // Context Management
    updateContext,
    
    // History Management
    clearHistory,
    
    // Utility
    canGoBack: state.history.canGoBack,
    canGoForward: state.history.canGoForward
  };
}

// Helper hook for navigation history
export function useNavigationHistory() {
  const { history, canGoBack, canGoForward, navigateBack, navigateForward } = useNavigator();
  
  return {
    entries: history.entries,
    currentIndex: history.currentIndex,
    canGoBack,
    canGoForward,
    navigateBack,
    navigateForward,
    totalEntries: history.entries.length
  };
}

// Helper hook for current context
export function useCurrentContext() {
  const { currentContext, updateContext } = useNavigator();
  
  return {
    context: currentContext,
    updateContext,
    sceneId: currentContext.sceneId,
    sceneSlug: currentContext.sceneSlug,
    deckId: currentContext.deckId,
    deckSlug: currentContext.deckSlug,
    slideId: currentContext.slideId,
    timestamp: currentContext.timestamp
  };
}
