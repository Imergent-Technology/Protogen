// Navigator System Types and Interfaces

export interface NavigationTarget {
  type: 'scene' | 'deck' | 'context' | 'slide' | 'external';
  id: string;
  slug?: string;
  slideIndex?: number; // For slide navigation
  params?: Record<string, any>;
}

export interface CurrentContext {
  sceneId: string | null;
  sceneSlug: string | null;
  deckId: string | null;
  deckSlug: string | null;
  slideId: string | null;
  contextPath?: string; // Path for scene routing (e.g., '/explore', '/profile')
  coordinates?: {
    x: number;
    y: number;
    z?: number;
  };
  timestamp: number;
}

export interface NavigationEntry {
  id: string;
  target: NavigationTarget;
  context: CurrentContext;
  timestamp: number;
  duration?: number;
}

export interface NavigationHistory {
  entries: NavigationEntry[];
  currentIndex: number;
  canGoBack: boolean;
  canGoForward: boolean;
}

export interface NavigatorEvent {
  type: 'navigation' | 'context-change' | 'history-update' | 'slide-change';
  data: any;
  timestamp: number;
}

export interface NavigatorState {
  currentContext: CurrentContext;
  history: NavigationHistory;
  isLoading: boolean;
  error: string | null;
}

// Navigator System Interface
export interface NavigatorSystem {
  // Core Navigation
  navigateTo(target: NavigationTarget): Promise<void>;
  navigateBack(): Promise<void>;
  navigateForward(): Promise<void>;
  
  // Context Management
  getCurrentContext(): CurrentContext;
  setCurrentContext(context: CurrentContext): void;
  updateContext(updates: Partial<CurrentContext>): void;
  
  // History Management
  getNavigationHistory(): NavigationHistory;
  clearHistory(): void;
  addHistoryEntry(entry: NavigationEntry): void;
  
  // State Management
  getState(): NavigatorState;
  isLoading(): boolean;
  getError(): string | null;
  
  // Event System
  on(event: NavigatorEvent['type'], handler: (event: NavigatorEvent) => void): void;
  off(event: NavigatorEvent['type'], handler: (event: NavigatorEvent) => void): void;
  emit(event: NavigatorEvent): void;
  
  // Extension Points (for future slide integration)
  navigateToSlide?(slideId: string): Promise<void>;
  getCurrentSlide?(): string | null;
  getSlideHistory?(): string[];
}

// Navigation Event Types
export type NavigationEventHandler = (event: NavigatorEvent) => void;

// Default Context
export const DEFAULT_CONTEXT: CurrentContext = {
  sceneId: null,
  sceneSlug: null,
  deckId: null,
  deckSlug: null,
  slideId: null,
  timestamp: Date.now()
};

// Navigation Constants
export const NAVIGATION_EVENTS = {
  NAVIGATION_START: 'navigation-start',
  NAVIGATION_END: 'navigation-end',
  CONTEXT_CHANGE: 'context-change',
  HISTORY_UPDATE: 'history-update',
  ERROR: 'navigation-error'
} as const;

export type NavigationEventType = typeof NAVIGATION_EVENTS[keyof typeof NAVIGATION_EVENTS];
