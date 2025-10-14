// Main exports for @protogen/authoring library

// Export all types (explicit to avoid conflicts)
export type { 
  CardScene, 
  CardSlideUnion,
  TextSlide,
  ImageSlide,
  LayeredSlide,
  SlideKind,
  AnimationType
} from './types/card-scene';
export type { PreviewTarget, PreviewSize, PreviewMetadata, CachedPreview } from './types/preview';
export type { ToCNode, ToCConfig } from './types/toc';
export type { CarouselConfig, CarouselItem, VisibilityRules } from './types/carousel';
export * from './types/permissions';
export * from './types/node-selection';
// Note: scene.ts types conflicts resolved by explicit imports above

// Export all hooks
export * from './hooks';

// Export all components
export * from './components';

// Export all services
export * from './services';

// M1 Week 3-4: Core Authoring System
export { AuthoringSystem, authoringSystem } from './AuthoringSystem';
export type { AuthoringSystemConfig, AuthoringLibrary, AuthoringSystemState } from './AuthoringSystem';
