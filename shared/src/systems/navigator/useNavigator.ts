import { useState, useEffect, useCallback } from 'react';
import { navigatorSystem } from './NavigatorSystem';
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

export function useNavigator(_initialContext?: CurrentContext): UseNavigatorReturn {
  // Use the singleton navigator system
  const [state, setState] = useState<NavigatorState>(navigatorSystem.getState());

  // Subscribe to navigator events
  useEffect(() => {
    // Set up event listeners
    const handleNavigationEvent: NavigationEventHandler = (_event) => {
      setState(navigatorSystem.getState());
    };

    navigatorSystem.on('navigation', handleNavigationEvent);
    navigatorSystem.on('context-change', handleNavigationEvent);
    navigatorSystem.on('history-update', handleNavigationEvent);

    // Set initial state
    setState(navigatorSystem.getState());

    // Cleanup
    return () => {
      navigatorSystem.off('navigation', handleNavigationEvent);
      navigatorSystem.off('context-change', handleNavigationEvent);
      navigatorSystem.off('history-update', handleNavigationEvent);
    };
  }, []); // Empty deps - only run once on mount

  // Navigation Methods
  const navigateTo = useCallback(async (target: NavigationTarget) => {
    await navigatorSystem.navigateTo(target);
  }, []);

  const navigateBack = useCallback(async () => {
    await navigatorSystem.navigateBack();
  }, []);

  const navigateForward = useCallback(async () => {
    await navigatorSystem.navigateForward();
  }, []);

  // Context Management
  const updateContext = useCallback((updates: Partial<CurrentContext>) => {
    navigatorSystem.updateContext(updates);
  }, []);

  // History Management
  const clearHistory = useCallback(() => {
    navigatorSystem.clearHistory();
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
export function useCurrentContext(): CurrentContext {
  const { currentContext } = useNavigator();
  
  // Return the currentContext directly, not wrapped
  return currentContext;
}
