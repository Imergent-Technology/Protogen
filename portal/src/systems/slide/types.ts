/**
 * Slide System Types
 * 
 * Defines TypeScript interfaces for the Slide System, including slides,
 * slide items, tweening configurations, and animation states.
 */

// ============================================================================
// Core Slide System Types
// ============================================================================

export interface Slide {
  id: string;
  sceneId: string;
  name: string;
  description?: string;
  slideIndex: number;
  isActive: boolean;
  transitionConfig?: TweeningConfig;
  createdAt: string;
  updatedAt: string;
}

export interface SlideItem {
  id: string;
  slideId: string;
  nodeId: string; // References scene_item.id
  position: Position;
  scale: Scale;
  rotation: number;
  opacity: number;
  visible: boolean;
  style?: Record<string, any>;
  transitionConfig?: TweeningConfig;
  createdAt: string;
  updatedAt: string;
}

export interface SceneItem {
  id: string;
  sceneId: string;
  nodeId: string;
  slideId?: string; // Optional reference to default slide state
  // ... other scene item properties
}

// ============================================================================
// Tweening and Animation Types
// ============================================================================

export interface TweeningConfig {
  duration: number; // Duration in milliseconds
  easing: EasingFunction;
  delay?: number; // Delay in milliseconds
  onComplete?: () => void;
  onUpdate?: (progress: number) => void;
}

export type EasingFunction = 
  | 'linear'
  | 'easeInQuad'
  | 'easeOutQuad'
  | 'easeInOutQuad'
  | 'easeInCubic'
  | 'easeOutCubic'
  | 'easeInOutCubic'
  | 'easeInQuart'
  | 'easeOutQuart'
  | 'easeInOutQuart'
  | 'easeInQuint'
  | 'easeOutQuint'
  | 'easeInOutQuint'
  | 'easeInSine'
  | 'easeOutSine'
  | 'easeInOutSine'
  | 'easeInExpo'
  | 'easeOutExpo'
  | 'easeInOutExpo'
  | 'easeInCirc'
  | 'easeOutCirc'
  | 'easeInOutCirc'
  | 'easeInBack'
  | 'easeOutBack'
  | 'easeInOutBack'
  | 'easeInElastic'
  | 'easeOutElastic'
  | 'easeInOutElastic'
  | 'easeInBounce'
  | 'easeOutBounce'
  | 'easeInOutBounce';

// ============================================================================
// Position and Transform Types
// ============================================================================

export interface Position {
  x: number;
  y: number;
}

export interface Scale {
  x: number;
  y: number;
}

export interface Rotation {
  angle: number; // In degrees
  origin?: Position; // Rotation origin point
}

// ============================================================================
// Slide State Types
// ============================================================================

export interface SlideState {
  id: string;
  sceneId: string;
  slideIndex: number;
  nodeStates: NodeSlideState[];
  transitionConfig?: TweeningConfig;
  isTransitioning: boolean;
  transitionProgress: number; // 0-1
}

export interface NodeSlideState {
  nodeId: string;
  position: Position;
  scale: Scale;
  rotation: number;
  opacity: number;
  visible: boolean;
  style?: Record<string, any>;
}

// ============================================================================
// Animation Types
// ============================================================================

export interface AnimationKeyframe {
  time: number; // 0-1 (0 = start, 1 = end)
  position?: Position;
  scale?: Scale;
  rotation?: number;
  opacity?: number;
  visible?: boolean;
  style?: Record<string, any>;
}

export interface AnimationSequence {
  id: string;
  name: string;
  keyframes: AnimationKeyframe[];
  duration: number;
  easing: EasingFunction;
  loop?: boolean;
  direction?: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';
}

// ============================================================================
// Slide System API Types
// ============================================================================

export interface SlideSystem {
  // Core Slide Management
  createSlide(sceneId: string, slideData: Partial<Slide>): Promise<Slide>;
  updateSlide(slideId: string, updates: Partial<Slide>): Promise<Slide>;
  deleteSlide(slideId: string): Promise<void>;
  getSlide(slideId: string): Promise<Slide>;
  getSlidesForScene(sceneId: string): Promise<Slide[]>;
  
  // Slide Item Management
  createSlideItem(slideId: string, nodeId: string, itemData: Partial<SlideItem>): Promise<SlideItem>;
  updateSlideItem(itemId: string, updates: Partial<SlideItem>): Promise<SlideItem>;
  deleteSlideItem(itemId: string): Promise<void>;
  getSlideItem(itemId: string): Promise<SlideItem>;
  getSlideItemsForSlide(slideId: string): Promise<SlideItem[]>;
  
  // Slide Navigation
  navigateToSlide(slideId: string): Promise<void>;
  navigateToSlideByIndex(sceneId: string, slideIndex: number): Promise<void>;
  getCurrentSlide(): SlideState | null;
  getSlideHistory(): SlideState[];
  
  // Animation and Transitions
  startSlideTransition(fromSlideId: string, toSlideId: string, config?: TweeningConfig): Promise<void>;
  pauseSlideTransition(): void;
  resumeSlideTransition(): void;
  stopSlideTransition(): void;
  
  // Event System
  on(event: SlideEvent, handler: SlideEventHandler): void;
  emit(event: SlideEvent, data: any): void;
}

// ============================================================================
// Event Types
// ============================================================================

export type SlideEvent = 
  | 'slideChange'
  | 'slideTransitionStart'
  | 'slideTransitionComplete'
  | 'slideTransitionPause'
  | 'slideTransitionResume'
  | 'slideTransitionStop'
  | 'slideItemUpdate'
  | 'slideCreate'
  | 'slideUpdate'
  | 'slideDelete';

export type SlideEventHandler = (data: any) => void;

// ============================================================================
// Slide System Hook Types
// ============================================================================

export interface UseSlideReturn {
  // Current State
  currentSlide: SlideState | null;
  slideHistory: SlideState[];
  isTransitioning: boolean;
  transitionProgress: number;
  
  // Navigation
  navigateToSlide: (slideId: string) => Promise<void>;
  navigateToSlideByIndex: (sceneId: string, slideIndex: number) => Promise<void>;
  canGoToPreviousSlide: () => boolean;
  canGoToNextSlide: () => boolean;
  goToPreviousSlide: () => Promise<void>;
  goToNextSlide: () => Promise<void>;
  
  // Slide Management
  createSlide: (sceneId: string, slideData: Partial<Slide>) => Promise<Slide>;
  updateSlide: (slideId: string, updates: Partial<Slide>) => Promise<Slide>;
  deleteSlide: (slideId: string) => Promise<void>;
  
  // Slide Item Management
  createSlideItem: (slideId: string, nodeId: string, itemData: Partial<SlideItem>) => Promise<SlideItem>;
  updateSlideItem: (itemId: string, updates: Partial<SlideItem>) => Promise<SlideItem>;
  deleteSlideItem: (itemId: string) => Promise<void>;
  
  // Animation Control
  startTransition: (toSlideId: string, config?: TweeningConfig) => Promise<void>;
  pauseTransition: () => void;
  resumeTransition: () => void;
  stopTransition: () => void;
}

// ============================================================================
// Component Props Types
// ============================================================================

export interface SlideContainerProps {
  slideId: string;
  sceneId: string;
  className?: string;
  style?: React.CSSProperties;
  onSlideChange?: (slideId: string) => void;
  onTransitionStart?: (fromSlideId: string, toSlideId: string) => void;
  onTransitionComplete?: (slideId: string) => void;
}

export interface SlideControlsProps {
  sceneId: string;
  currentSlideIndex: number;
  totalSlides: number;
  onPreviousSlide: () => void;
  onNextSlide: () => void;
  onSlideSelect: (slideIndex: number) => void;
  className?: string;
}

export interface SlidePreviewProps {
  slide: Slide;
  isActive: boolean;
  onSelect: (slideId: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

// ============================================================================
// Utility Types
// ============================================================================

export interface SlideTransitionOptions {
  duration?: number;
  easing?: EasingFunction;
  delay?: number;
  onComplete?: () => void;
  onUpdate?: (progress: number) => void;
}

export interface SlideValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface SlideSystemConfig {
  defaultTransitionDuration: number;
  defaultEasing: EasingFunction;
  maxSlidesPerScene: number;
  enableAnimations: boolean;
  enableAutoSave: boolean;
  autoSaveInterval: number; // milliseconds
}
