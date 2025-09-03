// Scene System Types
// This file defines the TypeScript interfaces for the Scene layer of the Protogen architecture

export interface Scene {
  id: number;
  guid: string;
  name: string;
  slug: string;
  description?: string;
  scene_type: SceneType;
  config: SceneConfig;
  meta: SceneMetadata;
  style: SceneStyle;
  is_active: boolean;
  is_public: boolean;
  created_by: number;
  stage_id?: number;
  published_at?: string;
  created_at: string;
  updated_at: string;
  
  // Relationships
  nodes?: SceneNode[];
  edges?: SceneEdge[];
  stage?: any; // Stage type from shared library
  creator?: any; // User type from shared library
}

export type SceneType = 'system' | 'stage' | 'custom' | 'template';

export interface SceneConfig {
  layout?: SceneLayout;
  animation?: SceneAnimation;
  interactions?: SceneInteractions;
  constraints?: SceneConstraints;
  [key: string]: any; // Allow for extensibility
}

export interface SceneLayout {
  type: 'force' | 'grid' | 'hierarchical' | 'circular' | 'manual';
  spacing?: number;
  padding?: number;
  center?: { x: number; y: number };
  bounds?: { x: number; y: number; width: number; height: number };
  grid?: {
    columns: number;
    rows: number;
    cellSize: number;
  };
  force?: {
    gravity?: number;
    repulsion?: number;
    attraction?: number;
    damping?: number;
    iterations?: number;
  };
}

export interface SceneAnimation {
  enabled: boolean;
  duration: number;
  easing: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
  stagger?: number;
  entrance?: 'fade' | 'slide' | 'scale' | 'bounce';
  exit?: 'fade' | 'slide' | 'scale' | 'bounce';
}

export interface SceneInteractions {
  drag: boolean;
  zoom: boolean;
  pan: boolean;
  select: boolean;
  hover: boolean;
  contextMenu: boolean;
  keyboard: boolean;
}

export interface SceneConstraints {
  minZoom?: number;
  maxZoom?: number;
  panBounds?: { x: number; y: number; width: number; height: number };
  nodeConstraints?: NodeConstraints;
  edgeConstraints?: EdgeConstraints;
}

export interface NodeConstraints {
  minDistance?: number;
  maxDistance?: number;
  snapToGrid?: boolean;
  gridSize?: number;
  lockAxis?: 'x' | 'y' | 'both' | 'none';
}

export interface EdgeConstraints {
  minLength?: number;
  maxLength?: number;
  avoidNodes?: boolean;
  smoothness?: number;
  routing?: 'straight' | 'curved' | 'orthogonal' | 'manhattan';
}

export interface SceneMetadata {
  tags?: string[];
  category?: string;
  version?: string;
  author?: string;
  license?: string;
  source?: string;
  [key: string]: any;
}

export interface SceneStyle {
  theme?: string;
  colorScheme?: 'light' | 'dark' | 'auto';
  nodeStyles?: NodeStylePresets;
  edgeStyles?: EdgeStylePresets;
  background?: BackgroundStyle;
  fonts?: FontSettings;
}

export interface NodeStylePresets {
  default?: NodeStyle;
  selected?: NodeStyle;
  hover?: NodeStyle;
  [key: string]: NodeStyle | undefined;
}

export interface EdgeStylePresets {
  default?: EdgeStyle;
  selected?: EdgeStyle;
  hover?: EdgeStyle;
  [key: string]: EdgeStyle | undefined;
}

export interface BackgroundStyle {
  color?: string;
  image?: string;
  pattern?: 'grid' | 'dots' | 'lines' | 'none';
  opacity?: number;
}

export interface FontSettings {
  family?: string;
  size?: number;
  weight?: string;
  color?: string;
}

// Scene Node Types
export interface SceneNode {
  id: number;
  guid: string;
  scene_id: number;
  core_node_guid?: string;
  node_type: string;
  position: NodePosition;
  dimensions: NodeDimensions;
  meta: NodeMetadata;
  style: NodeStyle;
  z_index: number;
  is_visible: boolean;
  is_locked: boolean;
  transform: NodeTransform;
  created_at: string;
  updated_at: string;
  
  // Relationships
  scene?: Scene;
  coreNode?: any; // CoreGraphNode type from shared library
  outgoingEdges?: SceneEdge[];
  incomingEdges?: SceneEdge[];
}

export interface NodePosition {
  x: number;
  y: number;
  z?: number;
}

export interface NodeDimensions {
  width: number;
  height: number;
  depth?: number;
}

export interface NodeMetadata {
  label?: string;
  description?: string;
  tags?: string[];
  priority?: number;
  status?: string;
  [key: string]: any;
}

export interface NodeStyle {
  // Visual properties
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  shadow?: ShadowStyle;
  
  // Icon and content
  icon?: string;
  iconColor?: string;
  iconSize?: number;
  textColor?: string;
  fontSize?: number;
  fontWeight?: string;
  
  // State-based styles
  hover?: Partial<NodeStyle>;
  selected?: Partial<NodeStyle>;
  active?: Partial<NodeStyle>;
  disabled?: Partial<NodeStyle>;
  
  // Animation
  transition?: TransitionStyle;
  
  [key: string]: any;
}

export interface ShadowStyle {
  color: string;
  blur: number;
  offsetX: number;
  offsetY: number;
  spread: number;
}

export interface TransitionStyle {
  property: string;
  duration: number;
  easing: string;
  delay?: number;
}

export interface NodeTransform {
  scale: { x: number; y: number; z?: number };
  rotation: { x: number; y: number; z?: number };
  skew: { x: number; y: number };
}

// Scene Edge Types
export interface SceneEdge {
  id: number;
  guid: string;
  scene_id: number;
  core_edge_guid?: string;
  source_node_id: number;
  target_node_id: number;
  edge_type: string;
  path: EdgePath;
  meta: EdgeMetadata;
  style: EdgeStyle;
  is_visible: boolean;
  is_locked: boolean;
  transform: EdgeTransform;
  created_at: string;
  updated_at: string;
  
  // Relationships
  scene?: Scene;
  coreEdge?: any; // CoreGraphEdge type from shared library
  sourceNode?: SceneNode;
  targetNode?: SceneNode;
}

export interface EdgePath {
  type: 'straight' | 'curved' | 'orthogonal' | 'manhattan' | 'custom';
  points?: Point[];
  curvature?: number;
  offset?: number;
}

export interface Point {
  x: number;
  y: number;
  z?: number;
}

export interface EdgeMetadata {
  label?: string;
  weight?: number;
  direction?: 'forward' | 'backward' | 'bidirectional';
  tags?: string[];
  [key: string]: any;
}

export interface EdgeStyle {
  // Line properties
  color: string;
  width: number;
  style: 'solid' | 'dashed' | 'dotted' | 'double';
  opacity: number;
  
  // Arrow properties
  sourceArrow?: ArrowStyle;
  targetArrow?: ArrowStyle;
  
  // State-based styles
  hover?: Partial<EdgeStyle>;
  selected?: Partial<EdgeStyle>;
  active?: Partial<EdgeStyle>;
  
  // Animation
  animation?: EdgeAnimation;
  
  [key: string]: any;
}

export interface ArrowStyle {
  shape: 'none' | 'triangle' | 'circle' | 'diamond' | 'cross';
  size: number;
  color: string;
  fill: boolean;
}

export interface EdgeAnimation {
  flow?: boolean;
  flowSpeed?: number;
  flowColor?: string;
  pulse?: boolean;
  pulseSpeed?: number;
}

export interface EdgeTransform {
  scale: { x: number; y: number };
  rotation: number;
  offset: { x: number; y: number };
}

// Scene Creation and Update Types
export interface CreateSceneRequest {
  name: string;
  slug?: string;
  description?: string;
  scene_type: SceneType;
  config?: Partial<SceneConfig>;
  meta?: Partial<SceneMetadata>;
  style?: Partial<SceneStyle>;
  is_active?: boolean;
  is_public?: boolean;
  stage_id?: number;
}

export interface UpdateSceneRequest extends Partial<CreateSceneRequest> {
  id: number;
}

export interface CreateSceneNodeRequest {
  scene_id: number;
  core_node_guid?: string;
  node_type: string;
  position: NodePosition;
  dimensions?: Partial<NodeDimensions>;
  meta?: Partial<NodeMetadata>;
  style?: Partial<NodeStyle>;
  z_index?: number;
  is_visible?: boolean;
  is_locked?: boolean;
}

export interface UpdateSceneNodeRequest extends Partial<CreateSceneNodeRequest> {
  id: number;
}

export interface CreateSceneEdgeRequest {
  scene_id: number;
  core_edge_guid?: string;
  source_node_id: number;
  target_node_id: number;
  edge_type: string;
  path?: Partial<EdgePath>;
  meta?: Partial<EdgeMetadata>;
  style?: Partial<EdgeStyle>;
  is_visible?: boolean;
  is_locked?: boolean;
}

export interface UpdateSceneEdgeRequest extends Partial<CreateSceneEdgeRequest> {
  id: number;
}

// Scene Rendering Types
export interface SceneRenderOptions {
  showLabels: boolean;
  showIcons: boolean;
  showGrid: boolean;
  showBounds: boolean;
  animationSpeed: number;
  quality: 'low' | 'medium' | 'high';
}

export interface SceneViewport {
  x: number;
  y: number;
  zoom: number;
  rotation: number;
}

export interface SceneSelection {
  nodes: string[];
  edges: string[];
  area?: { x: number; y: number; width: number; height: number };
}

// Scene Export/Import Types
export interface SceneExport {
  version: string;
  scene: Omit<Scene, 'id' | 'created_at' | 'updated_at'>;
  nodes: Omit<SceneNode, 'id' | 'scene_id' | 'created_at' | 'updated_at'>[];
  edges: Omit<SceneEdge, 'id' | 'scene_id' | 'created_at' | 'updated_at'>[];
  metadata: {
    exportedAt: string;
    exportedBy: string;
    source: string;
  };
}

export interface SceneImport {
  scene: CreateSceneRequest;
  nodes: CreateSceneNodeRequest[];
  edges: CreateSceneEdgeRequest[];
  options: {
    overwrite?: boolean;
    merge?: boolean;
    validateOnly?: boolean;
  };
}

// Scene Validation Types
export interface SceneValidationResult {
  isValid: boolean;
  errors: SceneValidationError[];
  warnings: SceneValidationWarning[];
  suggestions: SceneValidationSuggestion[];
}

export interface SceneValidationError {
  type: 'error';
  code: string;
  message: string;
  path: string[];
  severity: 'critical' | 'high' | 'medium' | 'low';
}

export interface SceneValidationWarning {
  type: 'warning';
  code: string;
  message: string;
  path: string[];
  severity: 'medium' | 'low';
}

export interface SceneValidationSuggestion {
  type: 'suggestion';
  code: string;
  message: string;
  path: string[];
  impact: 'high' | 'medium' | 'low';
}

// Scene Performance Types
export interface ScenePerformanceMetrics {
  renderTime: number;
  nodeCount: number;
  edgeCount: number;
  memoryUsage: number;
  fps: number;
  interactions: {
    drag: boolean;
    zoom: boolean;
    pan: boolean;
  };
}

// Scene Event Types
export interface SceneEvent {
  type: 'node:select' | 'node:deselect' | 'node:move' | 'node:resize' | 
        'edge:select' | 'edge:deselect' | 'edge:move' | 'edge:resize' |
        'viewport:change' | 'selection:change' | 'scene:load' | 'scene:save';
  target: 'node' | 'edge' | 'viewport' | 'selection' | 'scene';
  data: any;
  timestamp: number;
  source: 'user' | 'system' | 'api';
}

// Scene State Management
export interface SceneState {
  scene: Scene | null;
  nodes: SceneNode[];
  edges: SceneEdge[];
  selection: SceneSelection;
  viewport: SceneViewport;
  renderOptions: SceneRenderOptions;
  performance: ScenePerformanceMetrics;
  events: SceneEvent[];
  loading: boolean;
  error: string | null;
}

// Utility Types
export type SceneNodeType = 'core' | 'phantom' | 'template' | 'custom';
export type SceneEdgeType = 'core' | 'phantom' | 'template' | 'custom';
export type SceneLayoutAlgorithm = 'force' | 'grid' | 'hierarchical' | 'circular' | 'manual';
export type SceneAnimationType = 'entrance' | 'exit' | 'transition' | 'interaction';
export type SceneInteractionMode = 'view' | 'edit' | 'design' | 'present';
