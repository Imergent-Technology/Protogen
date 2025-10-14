/**
 * Card Scene Types - M1 Week 7-8
 * 
 * Type definitions for Card scene type.
 * Supports three slide variants: text, image, layered.
 * 
 * Based on Spec 09: Card Scene Type
 */

// ============================================================================
// Card Scene
// ============================================================================

export interface CardScene {
  id: string;
  scene_type: 'card';
  title: string;
  slug: string;
  config: CardSceneConfig;
  slides: CardSlideUnion[];
}

export interface CardSceneConfig {
  defaultTransition: TransitionType;
  autoAdvance: boolean;
  autoAdvanceDelay: number;  // ms between slides
  loop: boolean;
  theme: CardThemeConfig;
}

export interface CardThemeConfig {
  defaultBackground: string;
  defaultTextColor: string;
  defaultFontFamily: string;
  defaultFontSize: number;
  defaultAlignment: 'left' | 'center' | 'right';
}

export type TransitionType = 'none' | 'fade' | 'slide' | 'zoom';

// ============================================================================
// Slide Variants
// ============================================================================

export type CardSlideUnion = TextSlide | ImageSlide | LayeredSlide;

export type SlideKind = 'text' | 'image' | 'layered';

// Text Slide
export interface TextSlide {
  id: string;
  kind: 'text';
  order: number;

  // Text content
  text: string;
  fontSize: number;  // 12-128
  fontFamily?: string;
  alignment: 'left' | 'center' | 'right';

  // Styling
  textColor: string;
  backgroundColor: string;
  padding: number;

  // Metadata
  title?: string;
  notes?: string;
  duration?: number;

  // Animation
  enterAnimation?: AnimationType;
  animationDuration?: number;
}

// Image Slide
export interface ImageSlide {
  id: string;
  kind: 'image';
  order: number;

  // Image content
  imageAssetId: string;
  fit: 'contain' | 'cover' | 'fill';
  position: { x: number; y: number };  // % for positioning

  // Optional caption
  caption?: {
    text: string;
    position: 'top' | 'bottom';
    backgroundColor: string;
    textColor: string;
  };

  // Metadata
  title?: string;
  notes?: string;
  duration?: number;

  // Animation
  enterAnimation?: AnimationType;
  animationDuration?: number;
}

// Layered Slide
export interface LayeredSlide {
  id: string;
  kind: 'layered';
  order: number;

  // Background layer
  backgroundImageId: string;
  backgroundFit: 'contain' | 'cover';
  backgroundDim: number;  // 0-100 (darkening overlay)

  // Text layer
  text: string;
  fontSize: number;
  fontFamily?: string;
  alignment: 'left' | 'center' | 'right';
  textColor: string;
  textPosition: {
    vertical: 'top' | 'center' | 'bottom';
    horizontal: 'left' | 'center' | 'right';
  };

  // Timing/animation
  textTiming: {
    delay: number;
    duration: number;
    animation: AnimationType;
  };

  // Metadata
  title?: string;
  notes?: string;
  duration?: number;  // Total slide duration
}

export type AnimationType = 'none' | 'fade' | 'slide-up' | 'slide-down' | 'zoom';

// ============================================================================
// Defaults
// ============================================================================

export const DEFAULT_CARD_SCENE_CONFIG: CardSceneConfig = {
  defaultTransition: 'fade',
  autoAdvance: false,
  autoAdvanceDelay: 5000,
  loop: false,
  theme: {
    defaultBackground: '#ffffff',
    defaultTextColor: '#000000',
    defaultFontFamily: 'Inter, sans-serif',
    defaultFontSize: 24,
    defaultAlignment: 'center'
  }
};

export const DEFAULT_TEXT_SLIDE: Partial<TextSlide> = {
  kind: 'text',
  text: '',
  fontSize: 24,
  alignment: 'center',
  textColor: '#000000',
  backgroundColor: '#ffffff',
  padding: 32,
  enterAnimation: 'fade',
  animationDuration: 300
};

export const DEFAULT_IMAGE_SLIDE: Partial<ImageSlide> = {
  kind: 'image',
  fit: 'contain',
  position: { x: 50, y: 50 },
  enterAnimation: 'fade',
  animationDuration: 300
};

export const DEFAULT_LAYERED_SLIDE: Partial<LayeredSlide> = {
  kind: 'layered',
  backgroundFit: 'cover',
  backgroundDim: 30,
  fontSize: 48,
  alignment: 'center',
  textColor: '#ffffff',
  textPosition: { vertical: 'center', horizontal: 'center' },
  textTiming: {
    delay: 300,
    duration: 500,
    animation: 'fade'
  }
};

