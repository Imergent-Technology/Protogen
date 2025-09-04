// Deck System Types
// This file defines the TypeScript interfaces for the Deck layer of the Protogen architecture

export interface Deck {
  id: number;
  guid: string;
  name: string;
  slug: string;
  description?: string;
  deck_type: DeckType;
  config: DeckConfig;
  meta: DeckMetadata;
  style: DeckStyle;
  is_active: boolean;
  is_public: boolean;
  tenant_id: number;
  created_by: number;
  published_at?: string;
  created_at: string;
  updated_at: string;
  
  // Relationships
  tenant?: any; // Tenant type from shared library
  creator?: any; // User type from shared library
  scenes?: DeckScene[];
  contexts?: any[]; // Context[] from shared library
}

export type DeckType = 'presentation' | 'collection' | 'workflow' | 'template' | 'custom';

export interface DeckConfig {
  // Navigation settings
  navigation: DeckNavigation;
  
  // Presentation settings
  presentation: DeckPresentation;
  
  // Layout settings
  layout: DeckLayout;
  
  // Interaction settings
  interactions: DeckInteractions;
  
  // Custom settings
  custom: Record<string, any>;
}

export interface DeckNavigation {
  type: 'linear' | 'tree' | 'graph' | 'custom';
  allowSkip: boolean;
  allowBack: boolean;
  showProgress: boolean;
  showOutline: boolean;
  autoAdvance: boolean;
  autoAdvanceDelay: number;
  keyboardShortcuts: boolean;
  touchGestures: boolean;
}

export interface DeckPresentation {
  mode: 'slideshow' | 'interactive' | 'embedded' | 'export';
  theme: string;
  aspectRatio: string;
  fullscreen: boolean;
  showControls: boolean;
  showNotes: boolean;
  showTimer: boolean;
  loop: boolean;
  shuffle: boolean;
}

export interface DeckLayout {
  type: 'grid' | 'list' | 'carousel' | 'accordion' | 'tabs' | 'custom';
  columns: number;
  rows: number;
  spacing: number;
  padding: number;
  alignment: 'left' | 'center' | 'right' | 'justify';
  responsive: boolean;
  breakpoints: Record<string, any>;
}

export interface DeckInteractions {
  allowComments: boolean;
  allowRatings: boolean;
  allowBookmarks: boolean;
  allowSharing: boolean;
  allowExport: boolean;
  allowPrint: boolean;
  trackProgress: boolean;
  trackTime: boolean;
  trackInteractions: boolean;
}

export interface DeckMetadata {
  tags: string[];
  category: string;
  version: string;
  author: string;
  license: string;
  source: string;
  language: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // in minutes
  [key: string]: any;
}

export interface DeckStyle {
  theme: string;
  colorScheme: 'light' | 'dark' | 'auto';
  typography: DeckTypography;
  spacing: DeckSpacing;
  animations: DeckAnimations;
  customCSS?: string;
  customJS?: string;
}

export interface DeckTypography {
  fontFamily: string;
  fontSize: number;
  fontWeight: string;
  lineHeight: number;
  letterSpacing: number;
  headingFont: string;
  bodyFont: string;
  monoFont: string;
}

export interface DeckSpacing {
  margin: number;
  padding: number;
  gap: number;
  borderRadius: number;
  shadow: string;
  border: string;
}

export interface DeckAnimations {
  enabled: boolean;
  transitions: DeckTransitions;
  entrance: DeckAnimation;
  exit: DeckAnimation;
  hover: DeckAnimation;
  focus: DeckAnimation;
}

export interface DeckTransitions {
  type: 'fade' | 'slide' | 'zoom' | 'flip' | 'custom';
  duration: number;
  easing: string;
  direction: 'left' | 'right' | 'up' | 'down' | 'none';
}

export interface DeckAnimation {
  type: 'fade' | 'slide' | 'zoom' | 'bounce' | 'none';
  duration: number;
  delay: number;
  easing: string;
  direction: 'in' | 'out' | 'both';
}

// Deck Scene Association Types
export interface DeckScene {
  id: number;
  deck_id: number;
  scene_id: number;
  order: number;
  is_visible: boolean;
  is_required: boolean;
  config: DeckSceneConfig;
  meta: DeckSceneMetadata;
  created_at: string;
  updated_at: string;
  
  // Relationships
  deck?: Deck;
  scene?: any; // Scene type from shared library
}

export interface DeckSceneConfig {
  // Scene-specific settings within the deck
  display: DeckSceneDisplay;
  navigation: DeckSceneNavigation;
  interactions: DeckSceneInteractions;
  timing: DeckSceneTiming;
}

export interface DeckSceneDisplay {
  title: string;
  subtitle?: string;
  description?: string;
  thumbnail?: string;
  icon?: string;
  badge?: string;
  overlay?: string;
  background?: string;
}

export interface DeckSceneNavigation {
  allowSkip: boolean;
  allowBack: boolean;
  showInOutline: boolean;
  showInProgress: boolean;
  keyboardShortcut?: string;
  touchGesture?: string;
}

export interface DeckSceneInteractions {
  allowComments: boolean;
  allowRatings: boolean;
  allowBookmarks: boolean;
  allowSharing: boolean;
  trackTime: boolean;
  trackInteractions: boolean;
}

export interface DeckSceneTiming {
  autoAdvance: boolean;
  autoAdvanceDelay: number;
  minTime: number;
  maxTime: number;
  pauseOnInteraction: boolean;
  resumeOnInteraction: boolean;
}

export interface DeckSceneMetadata {
  tags: string[];
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // in minutes
  prerequisites: string[];
  objectives: string[];
  [key: string]: any;
}

// Deck Creation and Update Types
export interface CreateDeckRequest {
  name: string;
  slug?: string;
  description?: string;
  deck_type: DeckType;
  config?: Partial<DeckConfig>;
  meta?: Partial<DeckMetadata>;
  style?: Partial<DeckStyle>;
  is_active?: boolean;
  is_public?: boolean;
  tenant_id: number;
}

export interface UpdateDeckRequest extends Partial<CreateDeckRequest> {
  id: number;
}

export interface CreateDeckSceneRequest {
  deck_id: number;
  scene_id: number;
  order?: number;
  is_visible?: boolean;
  is_required?: boolean;
  config?: Partial<DeckSceneConfig>;
  meta?: Partial<DeckSceneMetadata>;
}

export interface UpdateDeckSceneRequest extends Partial<CreateDeckSceneRequest> {
  id: number;
}

// Deck Validation Types
export interface DeckValidationResult {
  isValid: boolean;
  errors: DeckValidationError[];
  warnings: DeckValidationWarning[];
  suggestions: DeckValidationSuggestion[];
}

export interface DeckValidationError {
  type: 'error';
  code: string;
  message: string;
  path: string[];
  severity: 'critical' | 'high' | 'medium' | 'low';
  data?: any;
}

export interface DeckValidationWarning {
  type: 'warning';
  code: string;
  message: string;
  path: string[];
  severity: 'medium' | 'low';
  data?: any;
}

export interface DeckValidationSuggestion {
  type: 'suggestion';
  code: string;
  message: string;
  path: string[];
  impact: 'high' | 'medium' | 'low';
  data?: any;
}

// Deck Statistics Types
export interface DeckStatistics {
  deck: Deck;
  content: DeckContentStats;
  usage: DeckUsageStats;
  engagement: DeckEngagementStats;
  performance: DeckPerformanceStats;
  lastUpdated: string;
}

export interface DeckContentStats {
  scenes: number;
  contexts: number;
  totalDuration: number;
  averageSceneDuration: number;
  lastActivity: string;
}

export interface DeckUsageStats {
  views: number;
  completions: number;
  shares: number;
  exports: number;
  bookmarks: number;
  period: 'day' | 'week' | 'month' | 'year';
  startDate: string;
  endDate: string;
}

export interface DeckEngagementStats {
  averageTime: number;
  completionRate: number;
  bounceRate: number;
  interactionRate: number;
  feedbackCount: number;
  ratingAverage: number;
  ratingCount: number;
}

export interface DeckPerformanceStats {
  loadTime: number;
  renderTime: number;
  interactionTime: number;
  errorRate: number;
  uptime: number;
  lastMeasured: string;
}

// Deck Event Types
export interface DeckEvent {
  type: 'created' | 'updated' | 'deleted' | 'published' | 'unpublished' |
        'scene_added' | 'scene_removed' | 'scene_reordered' | 'viewed' |
        'completed' | 'shared' | 'exported' | 'bookmarked';
  target: 'deck' | 'scene' | 'context' | 'user' | 'system';
  data: any;
  timestamp: number;
  source: 'user' | 'system' | 'api' | 'scheduled';
  metadata?: Record<string, any>;
}

// Deck State Management
export interface DeckState {
  decks: Deck[];
  currentDeck: Deck | null;
  scenes: DeckScene[];
  statistics: DeckStatistics | null;
  loading: boolean;
  error: string | null;
  events: DeckEvent[];
  validation: DeckValidationResult | null;
}

// Deck Export/Import Types
export interface DeckExport {
  version: string;
  deck: Omit<Deck, 'id' | 'created_at' | 'updated_at'>;
  scenes: Omit<DeckScene, 'id' | 'created_at' | 'updated_at'>[];
  metadata: {
    exportedAt: string;
    exportedBy: string;
    source: string;
    format: string;
  };
}

export interface DeckImport {
  deck: CreateDeckRequest;
  scenes: CreateDeckSceneRequest[];
  options: {
    overwrite?: boolean;
    merge?: boolean;
    validateOnly?: boolean;
    preserveIds?: boolean;
  };
}

// Deck Rendering Types
export interface DeckRenderOptions {
  mode: 'preview' | 'presentation' | 'export' | 'embed';
  theme: string;
  quality: 'low' | 'medium' | 'high';
  includeNotes: boolean;
  includeControls: boolean;
  includeProgress: boolean;
  responsive: boolean;
  accessibility: boolean;
}

export interface DeckViewport {
  width: number;
  height: number;
  aspectRatio: string;
  orientation: 'landscape' | 'portrait';
  device: 'desktop' | 'tablet' | 'mobile';
  browser: string;
  version: string;
}

export interface DeckProgress {
  currentScene: number;
  totalScenes: number;
  completedScenes: number;
  skippedScenes: number;
  timeSpent: number;
  timeRemaining: number;
  percentage: number;
  isComplete: boolean;
}

// Utility Types
export type DeckStatus = 'draft' | 'published' | 'archived' | 'scheduled';
export type DeckVisibility = 'public' | 'private' | 'restricted' | 'internal';
export type DeckFormat = 'html' | 'pdf' | 'pptx' | 'json' | 'markdown';
export type DeckQuality = 'draft' | 'review' | 'production' | 'archive';
