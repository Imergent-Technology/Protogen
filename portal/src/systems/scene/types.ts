/**
 * Scene System Types
 * 
 * Type definitions for the Scene-centric slide animation system.
 * Scenes own and manage their slides with entrance/exit animations.
 */

// ============================================================================
// Animation Types
// ============================================================================

/**
 * Animation types for slide transitions
 */
export type AnimationType = 'fade' | 'slide' | 'expand';

/**
 * Direction for directional animations (slide, expand)
 */
export type AnimationDirection = 'left' | 'right' | 'top' | 'bottom' | 'center';

/**
 * Distance for slide animations
 */
export type AnimationDistance = 'nearby' | 'edge';

/**
 * Slide animation configuration
 */
export interface SlideAnimation {
  type: AnimationType;
  direction?: AnimationDirection;
  distance?: AnimationDistance;
  duration: number; // milliseconds
  easing: string; // CSS easing function or cubic-bezier
}

/**
 * Default slide animations for a scene (entrance and exit)
 */
export interface DefaultSlideAnimation {
  entrance: SlideAnimation;
  exit: SlideAnimation;
}

// ============================================================================
// Slide Configuration Types
// ============================================================================

/**
 * Configuration for slide behavior within a scene
 */
export interface SlideConfig {
  auto_advance: boolean;
  loop: boolean;
  duration_per_slide: number; // milliseconds
}

// ============================================================================
// Scene Types
// ============================================================================

/**
 * Scene type enumeration
 */
export type SceneType = 'graph' | 'card' | 'document' | 'dashboard' | 'custom';

/**
 * Scene with slide animation support
 */
export interface Scene {
  id: number;
  guid: string;
  name: string;
  slug: string;
  description?: string;
  scene_type: SceneType;
  config?: Record<string, any>;
  meta?: Record<string, any>;
  style?: Record<string, any>;
  slide_config?: SlideConfig;
  default_slide_animation?: DefaultSlideAnimation;
  is_active: boolean;
  is_public: boolean;
  created_by: number;
  tenant_id?: number;
  subgraph_id?: number;
  published_at?: string;
  created_at: string;
  updated_at: string;
  slides?: Slide[];
  items?: SceneItem[];
}

// ============================================================================
// Slide Types
// ============================================================================

/**
 * Slide within a scene
 */
export interface Slide {
  id: number;
  scene_id: number;
  name: string;
  description?: string;
  slide_index: number;
  is_active: boolean;
  transition_config?: Record<string, any>;
  entrance_animation?: SlideAnimation;
  exit_animation?: SlideAnimation;
  created_at: string;
  updated_at: string;
  slide_items?: SlideItem[];
}

/**
 * Slide state for rendering (includes resolved animations)
 */
export interface SlideState {
  id: number;
  sceneId: number;
  slideIndex: number;
  name: string;
  description?: string;
  isActive: boolean;
  transitionConfig?: Record<string, any>;
  entranceAnimation: SlideAnimation;
  exitAnimation: SlideAnimation;
  nodeStates: NodeState[];
}

// ============================================================================
// Slide Item Types
// ============================================================================

/**
 * Position in 2D space
 */
export interface Position {
  x: number;
  y: number;
}

/**
 * Scale in 2D
 */
export interface Scale {
  x: number;
  y: number;
}

/**
 * Node state within a slide
 */
export interface NodeState {
  nodeId: number;
  position: Position;
  scale: Scale;
  rotation: number;
  opacity: number;
  visible: boolean;
  style?: Record<string, any>;
}

/**
 * Slide item (defines node state for a specific slide)
 */
export interface SlideItem {
  id: number;
  slide_id: number;
  node_id: number;
  position: Position;
  scale: Scale;
  rotation: number;
  opacity: number;
  visible: boolean;
  style?: Record<string, any>;
  transition_config?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// Scene Item Types
// ============================================================================

/**
 * Scene item type
 */
export type SceneItemType = 'node' | 'edge' | 'text' | 'image' | 'video' | 'custom';

/**
 * Dimensions in 2D
 */
export interface Dimensions {
  width: number;
  height: number;
}

/**
 * Scene item (node/content in the scene)
 */
export interface SceneItem {
  id: number;
  scene_id: number;
  slide_id?: number;
  item_type: SceneItemType;
  item_id?: number;
  item_guid?: string;
  position: Position & { z: number };
  dimensions: Dimensions;
  style?: Record<string, any>;
  meta?: Record<string, any>;
  is_visible: boolean;
  z_index: number;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// Navigation Types
// ============================================================================

/**
 * Direction for slide navigation
 */
export type NavigationDirection = 'forward' | 'reverse';

/**
 * Scene navigation event
 */
export interface SceneNavigationEvent {
  type: 'scene-loaded' | 'scene-unloaded' | 'slide-changed' | 'animation-complete';
  sceneId: number;
  slideIndex?: number;
  timestamp: number;
}

/**
 * Scene System event handler
 */
export type SceneEventHandler = (event: SceneNavigationEvent) => void;

// ============================================================================
// System State Types
// ============================================================================

/**
 * Scene System state
 */
export interface SceneSystemState {
  currentScene: Scene | null;
  currentSlideIndex: number;
  slides: Slide[];
  isLoading: boolean;
  isAnimating: boolean;
  error: string | null;
}

// ============================================================================
// API Response Types
// ============================================================================

/**
 * API response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

// ============================================================================
// Animation Preset Types
// ============================================================================

/**
 * Predefined animation presets
 */
export type AnimationPreset = 'professional' | 'smooth' | 'dynamic' | 'quick' | 'custom';

/**
 * Animation preset definition
 */
export interface AnimationPresetDefinition {
  name: string;
  description: string;
  animations: DefaultSlideAnimation;
}

/**
 * Collection of animation presets
 */
export interface AnimationPresets {
  professional: AnimationPresetDefinition;
  smooth: AnimationPresetDefinition;
  dynamic: AnimationPresetDefinition;
  quick: AnimationPresetDefinition;
}

