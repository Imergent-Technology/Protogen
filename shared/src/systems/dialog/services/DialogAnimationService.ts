/**
 * Dialog Animation Service
 * 
 * Handles animation timing and transitions for dialogs
 */

import { DialogAnimation } from '../types';

export interface AnimationConfig {
  duration: number; // milliseconds
  easing: string;
  delay?: number;
}

export class DialogAnimationService {
  private animations: Map<DialogAnimation, AnimationConfig> = new Map([
    ['fade', { duration: 200, easing: 'ease-out' }],
    ['slide', { duration: 300, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' }],
    ['zoom', { duration: 200, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' }],
    ['none', { duration: 0, easing: 'linear' }]
  ]);

  // Get animation config
  getAnimationConfig(animation: DialogAnimation): AnimationConfig {
    return this.animations.get(animation) || this.animations.get('fade')!;
  }

  // Set custom animation config
  setAnimationConfig(animation: DialogAnimation, config: AnimationConfig): void {
    this.animations.set(animation, config);
  }

  // Get animation classes for opening
  getOpenClasses(animation: DialogAnimation): string {
    switch (animation) {
      case 'fade':
        return 'animate-in fade-in';
      case 'slide':
        return 'animate-in slide-in-from-bottom';
      case 'zoom':
        return 'animate-in zoom-in-95';
      case 'none':
        return '';
      default:
        return 'animate-in fade-in';
    }
  }

  // Get animation classes for closing
  getCloseClasses(animation: DialogAnimation): string {
    switch (animation) {
      case 'fade':
        return 'animate-out fade-out';
      case 'slide':
        return 'animate-out slide-out-to-bottom';
      case 'zoom':
        return 'animate-out zoom-out-95';
      case 'none':
        return '';
      default:
        return 'animate-out fade-out';
    }
  }

  // Wait for animation to complete
  async waitForAnimation(animation: DialogAnimation): Promise<void> {
    const config = this.getAnimationConfig(animation);
    const totalDuration = config.duration + (config.delay || 0);
    
    if (totalDuration === 0) {
      return Promise.resolve();
    }

    return new Promise(resolve => {
      setTimeout(resolve, totalDuration);
    });
  }

  // Check if animation is enabled
  isAnimationEnabled(animation: DialogAnimation): boolean {
    return animation !== 'none';
  }
}

// Singleton instance
export const dialogAnimationService = new DialogAnimationService();

