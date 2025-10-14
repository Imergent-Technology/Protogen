/**
 * Carousel Types - M1 Week 6
 * 
 * Type definitions for Preview Carousel widget.
 * Based on Spec 08a: Preview Carousel Widget
 */

// ============================================================================
// Carousel Configuration
// ============================================================================

export interface CarouselConfig {
  size: 'sm' | 'md';
  maxVisible: number;
  showLabels: boolean;
  showIndicator: boolean;
  enableKeyboard: boolean;
  enableDrag: boolean;
  snapToItems: boolean;
}

export const DEFAULT_CAROUSEL_CONFIG: CarouselConfig = {
  size: 'sm',
  maxVisible: 10,
  showLabels: true,
  showIndicator: true,
  enableKeyboard: true,
  enableDrag: true,
  snapToItems: true
};

// ============================================================================
// Visibility Rules
// ============================================================================

export interface VisibilityRules {
  show: VisibilityCondition[];
  hide?: VisibilityCondition[];
  defaultVisible?: boolean;
}

export interface VisibilityCondition {
  type: 'scene-type' | 'mode' | 'item-count' | 'custom';
  operator: 'equals' | 'not-equals' | 'greater-than' | 'less-than' | 'contains';
  value: any;
  field?: string;
}

// Example visibility rules
export const CARD_SCENE_CAROUSEL_RULES: VisibilityRules = {
  show: [
    { type: 'scene-type', operator: 'equals', value: 'card' },
    { type: 'mode', operator: 'equals', value: 'author' }
  ],
  defaultVisible: false
};

// ============================================================================
// Carousel Item
// ============================================================================

export interface CarouselItem {
  id: string;
  type: 'slide' | 'page' | 'scene';
  label: string;
  preview?: string;  // Data URL
  current?: boolean;
  selected?: boolean;
  order: number;
  metadata?: Record<string, any>;
}

// ============================================================================
// Carousel State
// ============================================================================

export interface CarouselState {
  items: CarouselItem[];
  currentIndex: number;
  scrollPosition: number;
  visible: boolean;
  loading: boolean;
}

