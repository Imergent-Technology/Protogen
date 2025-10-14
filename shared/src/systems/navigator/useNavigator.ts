import { useState, useEffect, useCallback } from 'react';
import { navigatorSystem } from './NavigatorSystem';
import {
  NavigationTarget,
  CurrentContext,
  NavigationHistory,
  NavigatorState,
  NavigationEventHandler,
  NavigationMode,
  ItemType,
  SelectionState,
  FocusLevel,
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

  // ✨ M1: Authoring Mode
  mode: NavigationMode;
  enterAuthorMode: () => void;
  exitAuthorMode: () => void;
  toggleMode: () => void;
  canEnterAuthorMode: boolean;
  hasUnsavedChanges: boolean;

  // ✨ M1: Item Navigation
  navigateToItem: (itemId: string, itemType: ItemType) => void;
  currentItem: { id: string; type: ItemType } | null;
  nextItem: () => void;
  previousItem: () => void;

  // ✨ M1: Zoom & Focus
  focusOnItem: (itemId: string, itemType: ItemType) => Promise<void>;
  zoomOut: () => Promise<void>;
  setZoomLevel: (level: number) => Promise<void>;
  zoomLevel: number;
  focusLevel: FocusLevel;

  // ✨ M1: Selection
  selection: SelectionState | null;
  updateSelection: (selection: SelectionState | null) => void;
  clearSelection: () => void;

  // ✨ M1: ToC Drawer
  tocOpen: boolean;
  setTocOpen: (open: boolean) => void;
  toggleToc: () => void;
}

export function useNavigator(_initialContext?: CurrentContext): UseNavigatorReturn {
  // Use the singleton navigator system
  const [state, setState] = useState<NavigatorState>(navigatorSystem.getState());

  // Subscribe to navigator events
  useEffect(() => {
    // Set up event listeners
    const handleNavigationEvent: NavigationEventHandler = (event) => {
      console.log('[useNavigator] Received event:', event.type);
      setState(navigatorSystem.getState());
    };

    // Subscribe to all navigator events including M1 enhancements
    navigatorSystem.on('navigation', handleNavigationEvent);
    navigatorSystem.on('context-change', handleNavigationEvent);
    navigatorSystem.on('history-update', handleNavigationEvent);
    navigatorSystem.on('mode-changed', handleNavigationEvent);
    navigatorSystem.on('focus', handleNavigationEvent);
    navigatorSystem.on('zoom', handleNavigationEvent);
    navigatorSystem.on('selection-changed', handleNavigationEvent);

    // Set initial state
    setState(navigatorSystem.getState());

    // Cleanup
    return () => {
      navigatorSystem.off('navigation', handleNavigationEvent);
      navigatorSystem.off('context-change', handleNavigationEvent);
      navigatorSystem.off('history-update', handleNavigationEvent);
      navigatorSystem.off('mode-changed', handleNavigationEvent);
      navigatorSystem.off('focus', handleNavigationEvent);
      navigatorSystem.off('zoom', handleNavigationEvent);
      navigatorSystem.off('selection-changed', handleNavigationEvent);
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

  // ✨ M1: Authoring Mode
  const enterAuthorMode = useCallback(() => {
    navigatorSystem.enterAuthorMode();
  }, []);

  const exitAuthorMode = useCallback(() => {
    navigatorSystem.exitAuthorMode();
  }, []);

  const toggleMode = useCallback(() => {
    navigatorSystem.toggleMode();
  }, []);

  // ✨ M1: Item Navigation
  const navigateToItem = useCallback((itemId: string, itemType: ItemType) => {
    navigatorSystem.navigateToItem(itemId, itemType);
  }, []);

  const nextItem = useCallback(async () => {
    await navigatorSystem.nextItem();
  }, []);

  const previousItem = useCallback(async () => {
    await navigatorSystem.previousItem();
  }, []);

  // ✨ M1: Zoom & Focus
  const focusOnItem = useCallback(async (itemId: string, itemType: ItemType) => {
    await navigatorSystem.focusOnItem(itemId, itemType);
  }, []);

  const zoomOut = useCallback(async () => {
    await navigatorSystem.zoomOut();
  }, []);

  const setZoomLevel = useCallback(async (level: number) => {
    await navigatorSystem.setZoomLevel(level);
  }, []);

  // ✨ M1: Selection
  const updateSelectionCb = useCallback((selection: SelectionState | null) => {
    navigatorSystem.updateSelection(selection);
  }, []);

  const clearSelectionCb = useCallback(() => {
    navigatorSystem.clearSelection();
  }, []);

  // ✨ M1: ToC Drawer
  const setTocOpenCb = useCallback((open: boolean) => {
    navigatorSystem.setTocOpen(open);
  }, []);

  const toggleTocCb = useCallback(() => {
    navigatorSystem.toggleToc();
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
    canGoForward: state.history.canGoForward,

    // ✨ M1: Authoring Mode
    mode: state.mode,
    enterAuthorMode,
    exitAuthorMode,
    toggleMode,
    canEnterAuthorMode: navigatorSystem.canEnterAuthorMode(),
    hasUnsavedChanges: navigatorSystem.hasUnsavedChanges(),

    // ✨ M1: Item Navigation
    navigateToItem,
    currentItem: navigatorSystem.getCurrentItem(),
    nextItem,
    previousItem,

    // ✨ M1: Zoom & Focus
    focusOnItem,
    zoomOut,
    setZoomLevel,
    zoomLevel: state.focus.zoomLevel,
    focusLevel: state.focus.level,

    // ✨ M1: Selection
    selection: state.selection,
    updateSelection: updateSelectionCb,
    clearSelection: clearSelectionCb,

    // ✨ M1: ToC Drawer
    tocOpen: state.tocOpen,
    setTocOpen: setTocOpenCb,
    toggleToc: toggleTocCb
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
