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
    console.log('useNavigator useEffect running, navigatorRef.current:', navigatorRef.current);
    if (!navigatorRef.current) {
      console.log('Creating new NavigatorSystem instance');
      navigatorRef.current = new NavigatorSystem(initialContext);
      console.log('NavigatorSystem instance created:', navigatorRef.current);
      
      // Set up event listeners
      const handleNavigationEvent: NavigationEventHandler = (event) => {
        console.log('useNavigator - received event:', event.type, event.data);
        setState(navigatorRef.current!.getState());
        console.log('useNavigator - new state:', navigatorRef.current!.getState());
      };

      console.log('Subscribing to NavigatorSystem events...');
      navigatorRef.current.on('navigation', handleNavigationEvent);
      navigatorRef.current.on('context-change', handleNavigationEvent);
      navigatorRef.current.on('history-update', handleNavigationEvent);
      console.log('Event listeners subscribed');

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
    console.log('useNavigator navigateTo called, navigatorRef.current:', navigatorRef.current);
    if (navigatorRef.current) {
      console.log('Calling navigateTo on NavigatorSystem instance');
      await navigatorRef.current.navigateTo(target);
    } else {
      console.error('navigatorRef.current is null!');
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
export function useCurrentContext(): CurrentContext {
  const { currentContext } = useNavigator();
  
  // Return the currentContext directly, not wrapped
  return currentContext;
}
