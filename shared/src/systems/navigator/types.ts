// Navigator System Types and Interfaces

// ============================================================================
// Base Navigation Types
// ============================================================================

export interface NavigationTarget {
  type: 'scene' | 'deck' | 'context' | 'slide' | 'external';
  id: string;
  slug?: string;
  slideIndex?: number; // For slide navigation
  contextPath?: string; // For URL-based navigation
  params?: Record<string, any>;
}

// ============================================================================
// Authoring Mode Types (M1 Enhancement)
// ============================================================================

export type NavigationMode = 'view' | 'author';

export type ItemType = 'slide' | 'page' | 'node' | 'edge' | 'block';

export type FocusLevel = 'overview' | 'scene' | 'item';

export interface Coordinate {
  x: number;
  y: number;
  z?: number;
}

export interface NavigationLocus {
  deckId?: string;
  sceneId?: string;
  itemId?: string;
  itemType?: ItemType;
  coordinate?: Coordinate;
}

export interface FocusState {
  level: FocusLevel;
  zoomLevel: number; // 0-100 scale
  target?: {
    itemId: string;
    itemType: ItemType;
  };
  animated: boolean;
}

export interface SelectionState {
  targetId: string;
  targetType: ItemType;
  multi?: boolean;
  selectedIds?: string[];
  range?: {
    start: string;
    end: string;
  };
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
  // ✨ NEW: Authoring mode tracking
  mode?: NavigationMode;
  locus?: NavigationLocus;
  focusLevel?: FocusLevel;
  zoomLevel?: number;
}

export interface NavigationHistory {
  entries: NavigationEntry[];
  currentIndex: number;
  canGoBack: boolean;
  canGoForward: boolean;
}

export interface NavigatorEvent {
  type: 'navigation' | 'context-change' | 'history-update' | 'slide-change' |
        'mode-changed' | 'focus' | 'zoom' | 'selection-changed' | 
        'edit-started' | 'edit-completed' | 'edit-canceled';
  data: any;
  timestamp: number;
}

export interface NavigatorState {
  currentContext: CurrentContext;
  history: NavigationHistory;
  isLoading: boolean;
  error: string | null;
  // ✨ NEW: Authoring mode enhancements
  mode: NavigationMode;
  locus: NavigationLocus;
  focus: FocusState;
  selection: SelectionState | null;
  tocOpen: boolean;
  editing: boolean; // True when user is actively editing (disables navigation)
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
  
  // ✨ NEW: Authoring Mode (M1)
  enterAuthorMode(): void;
  exitAuthorMode(): void;
  toggleMode(): void;
  getMode(): NavigationMode;
  canEnterAuthorMode(): boolean;
  hasUnsavedChanges(): boolean;
  
  // ✨ NEW: Item Navigation (M1)
  navigateToItem(itemId: string, itemType: ItemType): void;
  getCurrentItem(): { id: string; type: ItemType } | null;
  nextItem(): Promise<void>;
  previousItem(): Promise<void>;
  
  // ✨ NEW: Zoom & Focus (M1)
  focusOnItem(itemId: string, itemType: ItemType): Promise<void>;
  zoomOut(): Promise<void>;
  setZoomLevel(level: number): Promise<void>;
  getZoomLevel(): number;
  getFocusLevel(): FocusLevel;
  
  // ✨ NEW: Selection Integration (M1)
  updateSelection(selection: SelectionState | null): void;
  clearSelection(): void;
  getSelection(): SelectionState | null;
  
  // ✨ NEW: ToC Drawer (M1)
  setTocOpen(open: boolean): void;
  isTocOpen(): boolean;
  toggleToc(): void;
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
