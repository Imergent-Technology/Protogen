// Context System Types
// This file defines the TypeScript interfaces for the Context layer of the Protogen architecture

export interface Context {
  id: number;
  guid: string;
  name: string;
  slug: string;
  description?: string;
  context_type: ContextType;
  coordinates: ContextCoordinates;
  config: ContextConfig;
  meta: ContextMetadata;
  style: ContextStyle;
  is_active: boolean;
  is_public: boolean;
  tenant_id: number;
  created_by: number;
  created_at: string;
  updated_at: string;
  
  // Relationships
  tenant?: any; // Tenant type from shared library
  creator?: any; // User type from shared library
  scene?: any; // Scene type from shared library
  deck?: any; // Deck type from shared library
  document?: any; // Document type from shared library
  node?: any; // Node type from shared library
}

export type ContextType = 'scene' | 'deck' | 'document' | 'node' | 'edge' | 'pin' | 'custom';

export interface ContextCoordinates {
  // Primary coordinates
  x: number;
  y: number;
  z?: number;
  
  // Bounds for area contexts
  width?: number;
  height?: number;
  depth?: number;
  
  // Viewport coordinates
  viewport?: ContextViewport;
  
  // Graph coordinates
  graph?: ContextGraphCoordinates;
  
  // Document coordinates
  document?: ContextDocumentCoordinates;
  
  // Custom coordinates
  custom?: Record<string, any>;
}

export interface ContextViewport {
  x: number;
  y: number;
  zoom: number;
  rotation: number;
  panX: number;
  panY: number;
}

export interface ContextGraphCoordinates {
  nodeId?: string;
  edgeId?: string;
  path?: string[];
  level?: number;
  cluster?: string;
  subgraph?: string;
}

export interface ContextDocumentCoordinates {
  page?: number;
  section?: string;
  paragraph?: number;
  line?: number;
  character?: number;
  anchor?: string;
  bookmark?: string;
}

export interface ContextConfig {
  // Display settings
  display: ContextDisplay;
  
  // Interaction settings
  interactions: ContextInteractions;
  
  // Navigation settings
  navigation: ContextNavigation;
  
  // Animation settings
  animations: ContextAnimations;
  
  // Custom settings
  custom: Record<string, any>;
}

export interface ContextDisplay {
  title: string;
  subtitle?: string;
  description?: string;
  icon?: string;
  thumbnail?: string;
  badge?: string;
  overlay?: string;
  background?: string;
  tooltip?: string;
  showInOutline: boolean;
  showInNavigation: boolean;
  showInSearch: boolean;
}

export interface ContextInteractions {
  allowClick: boolean;
  allowHover: boolean;
  allowDrag: boolean;
  allowResize: boolean;
  allowEdit: boolean;
  allowDelete: boolean;
  allowComments: boolean;
  allowBookmarks: boolean;
  allowSharing: boolean;
  trackInteractions: boolean;
}

export interface ContextNavigation {
  allowJump: boolean;
  allowZoom: boolean;
  allowPan: boolean;
  keyboardShortcut?: string;
  touchGesture?: string;
  autoFocus: boolean;
  focusDelay: number;
  blurDelay: number;
}

export interface ContextAnimations {
  enabled: boolean;
  entrance: ContextAnimation;
  exit: ContextAnimation;
  hover: ContextAnimation;
  focus: ContextAnimation;
  transition: ContextAnimation;
}

export interface ContextAnimation {
  type: 'fade' | 'slide' | 'zoom' | 'bounce' | 'none';
  duration: number;
  delay: number;
  easing: string;
  direction: 'in' | 'out' | 'both';
  distance?: number;
  scale?: number;
}

export interface ContextMetadata {
  tags: string[];
  category: string;
  version: string;
  author: string;
  license: string;
  source: string;
  language: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // in minutes
  prerequisites: string[];
  objectives: string[];
  [key: string]: any;
}

export interface ContextStyle {
  theme: string;
  colorScheme: 'light' | 'dark' | 'auto';
  typography: ContextTypography;
  spacing: ContextSpacing;
  borders: ContextBorders;
  shadows: ContextShadows;
  customCSS?: string;
  customJS?: string;
}

export interface ContextTypography {
  fontFamily: string;
  fontSize: number;
  fontWeight: string;
  lineHeight: number;
  letterSpacing: number;
  textAlign: 'left' | 'center' | 'right' | 'justify';
  textDecoration: 'none' | 'underline' | 'overline' | 'line-through';
  textTransform: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
}

export interface ContextSpacing {
  margin: number;
  padding: number;
  gap: number;
  borderRadius: number;
  borderWidth: number;
  borderStyle: 'solid' | 'dashed' | 'dotted' | 'none';
}

export interface ContextBorders {
  top: ContextBorder;
  right: ContextBorder;
  bottom: ContextBorder;
  left: ContextBorder;
  radius: number;
  style: 'solid' | 'dashed' | 'dotted' | 'none';
  color: string;
  width: number;
}

export interface ContextBorder {
  color: string;
  width: number;
  style: 'solid' | 'dashed' | 'dotted' | 'none';
}

export interface ContextShadows {
  boxShadow: string;
  textShadow: string;
  dropShadow: string;
  innerShadow: string;
}

// Context Creation and Update Types
export interface CreateContextRequest {
  name: string;
  slug?: string;
  description?: string;
  context_type: ContextType;
  coordinates: ContextCoordinates;
  config?: Partial<ContextConfig>;
  meta?: Partial<ContextMetadata>;
  style?: Partial<ContextStyle>;
  is_active?: boolean;
  is_public?: boolean;
  tenant_id: number;
  scene_id?: number;
  deck_id?: number;
  document_id?: number;
  node_id?: number;
}

export interface UpdateContextRequest extends Partial<CreateContextRequest> {
  id: number;
}

// Context Validation Types
export interface ContextValidationResult {
  isValid: boolean;
  errors: ContextValidationError[];
  warnings: ContextValidationWarning[];
  suggestions: ContextValidationSuggestion[];
}

export interface ContextValidationError {
  type: 'error';
  code: string;
  message: string;
  path: string[];
  severity: 'critical' | 'high' | 'medium' | 'low';
  data?: any;
}

export interface ContextValidationWarning {
  type: 'warning';
  code: string;
  message: string;
  path: string[];
  severity: 'medium' | 'low';
  data?: any;
}

export interface ContextValidationSuggestion {
  type: 'suggestion';
  code: string;
  message: string;
  path: string[];
  impact: 'high' | 'medium' | 'low';
  data?: any;
}

// Context Statistics Types
export interface ContextStatistics {
  context: Context;
  usage: ContextUsageStats;
  engagement: ContextEngagementStats;
  performance: ContextPerformanceStats;
  lastUpdated: string;
}

export interface ContextUsageStats {
  views: number;
  clicks: number;
  hovers: number;
  interactions: number;
  shares: number;
  bookmarks: number;
  period: 'day' | 'week' | 'month' | 'year';
  startDate: string;
  endDate: string;
}

export interface ContextEngagementStats {
  averageTime: number;
  interactionRate: number;
  clickThroughRate: number;
  hoverRate: number;
  feedbackCount: number;
  ratingAverage: number;
  ratingCount: number;
}

export interface ContextPerformanceStats {
  loadTime: number;
  renderTime: number;
  interactionTime: number;
  errorRate: number;
  uptime: number;
  lastMeasured: string;
}

// Context Event Types
export interface ContextEvent {
  type: 'created' | 'updated' | 'deleted' | 'viewed' | 'clicked' | 'hovered' |
        'focused' | 'blurred' | 'shared' | 'bookmarked' | 'commented';
  target: 'context' | 'coordinates' | 'display' | 'interactions' | 'navigation';
  data: any;
  timestamp: number;
  source: 'user' | 'system' | 'api' | 'scheduled';
  metadata?: Record<string, any>;
}

// Context State Management
export interface ContextState {
  contexts: Context[];
  currentContext: Context | null;
  statistics: ContextStatistics | null;
  loading: boolean;
  error: string | null;
  events: ContextEvent[];
  validation: ContextValidationResult | null;
}

// Context Export/Import Types
export interface ContextExport {
  version: string;
  context: Omit<Context, 'id' | 'created_at' | 'updated_at'>;
  metadata: {
    exportedAt: string;
    exportedBy: string;
    source: string;
    format: string;
  };
}

export interface ContextImport {
  context: CreateContextRequest;
  options: {
    overwrite?: boolean;
    merge?: boolean;
    validateOnly?: boolean;
    preserveIds?: boolean;
  };
}

// Context Search and Filter Types
export interface ContextSearchOptions {
  query?: string;
  context_type?: ContextType[];
  tenant_id?: number[];
  scene_id?: number[];
  deck_id?: number[];
  document_id?: number[];
  node_id?: number[];
  created_by?: number[];
  is_active?: boolean;
  is_public?: boolean;
  tags?: string[];
  category?: string[];
  date_range?: {
    start: string;
    end: string;
  };
  coordinates?: {
    x: number;
    y: number;
    radius: number;
  };
  sort?: {
    field: string;
    direction: 'asc' | 'desc';
  };
  pagination?: {
    page: number;
    per_page: number;
  };
}

export interface ContextSearchResult {
  contexts: Context[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
  facets: ContextSearchFacets;
  suggestions: string[];
}

export interface ContextSearchFacets {
  context_types: Record<ContextType, number>;
  tenants: Record<string, number>;
  scenes: Record<string, number>;
  decks: Record<string, number>;
  documents: Record<string, number>;
  nodes: Record<string, number>;
  creators: Record<string, number>;
  tags: Record<string, number>;
  categories: Record<string, number>;
  dates: Record<string, number>;
}

// Context Focus and Visibility Types
export interface ContextFocus {
  context: Context;
  isInFocus: boolean;
  focusScore: number;
  visibility: ContextVisibilityState;
  viewport: ContextViewport;
  interactions: ContextInteraction[];
  lastInteraction: string;
}

export interface ContextVisibilityState {
  isVisible: boolean;
  visibilityScore: number;
  viewportCoverage: number;
  occlusionLevel: number;
  zIndex: number;
  opacity: number;
}

export interface ContextInteraction {
  type: 'click' | 'hover' | 'focus' | 'blur' | 'drag' | 'resize';
  timestamp: number;
  coordinates: ContextCoordinates;
  duration: number;
  data: any;
}

// Utility Types
export type ContextStatus = 'active' | 'inactive' | 'archived' | 'deleted';
export type ContextVisibility = 'public' | 'private' | 'restricted' | 'internal';
export type ContextPriority = 'low' | 'medium' | 'high' | 'urgent';
export type ContextSource = 'manual' | 'auto' | 'import' | 'api' | 'system';
