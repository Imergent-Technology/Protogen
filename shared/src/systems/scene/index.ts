/**
 * Scene System
 * 
 * Export all scene system components, types, and utilities.
 */

// Core System
export { SceneSystem, sceneSystem } from './SceneSystem';
export { useScene } from './useScene';
export { SceneRouter, sceneRouter } from './SceneRouter';
export { useSceneForContext, useSceneRouter } from './useSceneRouter';

// Components
export { SlideAnimator, getSystemDefaultAnimation } from './SlideAnimator';

// Default System Scenes
export * from './default-scenes';

// Animation Presets
export {
  ANIMATION_PRESETS,
  SYSTEM_DEFAULT_ANIMATION,
  EASING_FUNCTIONS,
  getAnimationPreset,
  getPresetNames,
  getEasingValue,
} from './animationPresets';

// Types
export type {
  Scene,
  Slide,
  SlideState,
  SlideItem,
  SceneItem,
  SlideAnimation,
  DefaultSlideAnimation,
  SlideConfig,
  AnimationType,
  AnimationDirection,
  AnimationDistance,
  NavigationDirection,
  SceneNavigationEvent,
  SceneEventHandler,
  SceneSystemState,
  SceneType,
  SceneItemType,
  Position,
  Scale,
  Dimensions,
  NodeState,
  ApiResponse,
  AnimationPreset,
  AnimationPresetDefinition,
  AnimationPresets,
} from './types';

