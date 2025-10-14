// Core authoring types
export * from './scene';
export * from './permissions';
export * from './node-selection';
export * from './common';

// M1 Week 5: Preview Types
export * from './preview';

// M1 Week 6: ToC and Carousel Types
export * from './toc';
export * from './carousel';

// M1 Week 7-8: Card Scene Types (explicit exports to avoid conflicts)
export type { 
  CardScene, 
  CardSceneConfig, 
  CardThemeConfig, 
  TransitionType,
  CardSlideUnion,
  SlideKind,
  TextSlide,
  ImageSlide,
  LayeredSlide,
  AnimationType,
  DEFAULT_CARD_SCENE_CONFIG,
  DEFAULT_TEXT_SLIDE,
  DEFAULT_IMAGE_SLIDE,
  DEFAULT_LAYERED_SLIDE
} from './card-scene';

// Re-export shared types that are commonly used
// export type { User, Tenant } from '@protogen/shared';
