/**
 * Animation Presets
 * 
 * Predefined animation styles for quick scene configuration.
 */

import type { AnimationPresets, SlideAnimation } from './types';

/**
 * System default animation (fallback)
 */
export const SYSTEM_DEFAULT_ANIMATION = {
  entrance: {
    type: 'fade' as const,
    duration: 300,
    easing: 'ease-in',
  },
  exit: {
    type: 'fade' as const,
    duration: 300,
    easing: 'ease-out',
  },
};

/**
 * Predefined animation presets
 */
export const ANIMATION_PRESETS: AnimationPresets = {
  professional: {
    name: 'Professional',
    description: 'Slide from right, fade exit - clean and modern',
    animations: {
      entrance: {
        type: 'slide',
        direction: 'right',
        distance: 'edge',
        duration: 400,
        easing: 'ease-out',
      },
      exit: {
        type: 'fade',
        duration: 200,
        easing: 'ease-in',
      },
    },
  },

  smooth: {
    name: 'Smooth',
    description: 'Gentle fade in and out - subtle and elegant',
    animations: {
      entrance: {
        type: 'fade',
        duration: 300,
        easing: 'ease-in',
      },
      exit: {
        type: 'fade',
        duration: 300,
        easing: 'ease-out',
      },
    },
  },

  dynamic: {
    name: 'Dynamic',
    description: 'Expand from center, slide up - energetic and bold',
    animations: {
      entrance: {
        type: 'expand',
        direction: 'center',
        duration: 500,
        easing: 'ease-out',
      },
      exit: {
        type: 'slide',
        direction: 'top',
        distance: 'nearby',
        duration: 300,
        easing: 'ease-in',
      },
    },
  },

  quick: {
    name: 'Quick',
    description: 'Fast nearby slides - snappy and responsive',
    animations: {
      entrance: {
        type: 'slide',
        direction: 'bottom',
        distance: 'nearby',
        duration: 250,
        easing: 'ease-out',
      },
      exit: {
        type: 'slide',
        direction: 'top',
        distance: 'nearby',
        duration: 250,
        easing: 'ease-in',
      },
    },
  },
};

/**
 * Get animation preset by name
 */
export function getAnimationPreset(preset: keyof AnimationPresets) {
  return ANIMATION_PRESETS[preset];
}

/**
 * Get all preset names
 */
export function getPresetNames(): string[] {
  return Object.keys(ANIMATION_PRESETS);
}

/**
 * Convert easing name to cubic-bezier values
 */
export const EASING_FUNCTIONS: Record<string, string> = {
  'linear': 'cubic-bezier(0, 0, 1, 1)',
  'ease': 'cubic-bezier(0.25, 0.1, 0.25, 1)',
  'ease-in': 'cubic-bezier(0.42, 0, 1, 1)',
  'ease-out': 'cubic-bezier(0, 0, 0.58, 1)',
  'ease-in-out': 'cubic-bezier(0.42, 0, 0.58, 1)',
  // Custom easing functions
  'ease-in-quad': 'cubic-bezier(0.55, 0.085, 0.68, 0.53)',
  'ease-out-quad': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  'ease-in-cubic': 'cubic-bezier(0.55, 0.055, 0.675, 0.19)',
  'ease-out-cubic': 'cubic-bezier(0.215, 0.61, 0.355, 1)',
  'ease-in-quart': 'cubic-bezier(0.895, 0.03, 0.685, 0.22)',
  'ease-out-quart': 'cubic-bezier(0.165, 0.84, 0.44, 1)',
};

/**
 * Get cubic-bezier value for easing function
 */
export function getEasingValue(easing: string): string {
  return EASING_FUNCTIONS[easing] || easing;
}

