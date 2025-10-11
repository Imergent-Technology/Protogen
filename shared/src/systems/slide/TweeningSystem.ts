/**
 * Tweening System
 * 
 * Animation engine for smooth slide transitions and node state changes.
 * Provides easing functions, interpolation, and animation management.
 */

import { TweeningConfig, EasingFunction, Position, Scale } from './types';

export class TweeningSystem {
  private animations: Map<string, Animation> = new Map();
  private animationId: number = 0;

  /**
   * Create a new animation
   */
  createAnimation(config: TweeningConfig): Animation {
    const id = `animation_${++this.animationId}`;
    const animation = new Animation(id, config);
    this.animations.set(id, animation);
    return animation;
  }

  /**
   * Start an animation
   */
  startAnimation(animation: Animation): Promise<void> {
    return animation.start();
  }

  /**
   * Stop an animation
   */
  stopAnimation(animationId: string): void {
    const animation = this.animations.get(animationId);
    if (animation) {
      animation.stop();
      this.animations.delete(animationId);
    }
  }

  /**
   * Pause an animation
   */
  pauseAnimation(animationId: string): void {
    const animation = this.animations.get(animationId);
    if (animation) {
      animation.pause();
    }
  }

  /**
   * Resume an animation
   */
  resumeAnimation(animationId: string): void {
    const animation = this.animations.get(animationId);
    if (animation) {
      animation.resume();
    }
  }

  /**
   * Stop all animations
   */
  stopAllAnimations(): void {
    this.animations.forEach(animation => animation.stop());
    this.animations.clear();
  }
}

export class Animation {
  private id: string;
  private config: TweeningConfig;
  private startTime: number = 0;
  private pausedTime: number = 0;
  private isRunning: boolean = false;
  private isPaused: boolean = false;
  private animationFrameId: number | null = null;

  constructor(id: string, config: TweeningConfig) {
    this.id = id;
    this.config = config;
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      console.warn(`Animation ${this.id} is already running`);
      return;
    }

    this.isRunning = true;
    this.isPaused = false;
    this.startTime = Date.now() - this.pausedTime;
    this.pausedTime = 0;

    return new Promise((resolve) => {
      const animate = (currentTime: number) => {
        if (!this.isRunning) {
          resolve();
          return;
        }

        if (this.isPaused) {
          this.pausedTime = currentTime - this.startTime;
          this.animationFrameId = requestAnimationFrame(animate);
          return;
        }

        const elapsed = currentTime - this.startTime - this.pausedTime;
        const delay = this.config.delay || 0;
        
        if (elapsed < delay) {
          this.animationFrameId = requestAnimationFrame(animate);
          return;
        }

        const progress = Math.min((elapsed - delay) / this.config.duration, 1);
        const easedProgress = this.applyEasing(progress, this.config.easing);

        // Call update callback
        if (this.config.onUpdate) {
          this.config.onUpdate(easedProgress);
        }

        if (progress >= 1) {
          this.isRunning = false;
          if (this.config.onComplete) {
            this.config.onComplete();
          }
          resolve();
        } else {
          this.animationFrameId = requestAnimationFrame(animate);
        }
      };

      this.animationFrameId = requestAnimationFrame(animate);
    });
  }

  pause(): void {
    if (this.isRunning && !this.isPaused) {
      this.isPaused = true;
    }
  }

  resume(): void {
    if (this.isRunning && this.isPaused) {
      this.isPaused = false;
      this.startTime = Date.now() - this.pausedTime;
    }
  }

  stop(): void {
    this.isRunning = false;
    this.isPaused = false;
    this.pausedTime = 0;
    
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private applyEasing(t: number, easing: EasingFunction): number {
    switch (easing) {
      case 'linear':
        return t;
      
      case 'easeInQuad':
        return t * t;
      
      case 'easeOutQuad':
        return t * (2 - t);
      
      case 'easeInOutQuad':
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      
      case 'easeInCubic':
        return t * t * t;
      
      case 'easeOutCubic':
        return (--t) * t * t + 1;
      
      case 'easeInOutCubic':
        return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
      
      case 'easeInQuart':
        return t * t * t * t;
      
      case 'easeOutQuart':
        return 1 - (--t) * t * t * t;
      
      case 'easeInOutQuart':
        return t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t;
      
      case 'easeInQuint':
        return t * t * t * t * t;
      
      case 'easeOutQuint':
        return 1 + (--t) * t * t * t * t;
      
      case 'easeInOutQuint':
        return t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * (--t) * t * t * t * t;
      
      case 'easeInSine':
        return 1 - Math.cos((t * Math.PI) / 2);
      
      case 'easeOutSine':
        return Math.sin((t * Math.PI) / 2);
      
      case 'easeInOutSine':
        return -(Math.cos(Math.PI * t) - 1) / 2;
      
      case 'easeInExpo':
        return t === 0 ? 0 : Math.pow(2, 10 * (t - 1));
      
      case 'easeOutExpo':
        return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      
      case 'easeInOutExpo':
        if (t === 0) return 0;
        if (t === 1) return 1;
        return t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2;
      
      case 'easeInCirc':
        return 1 - Math.sqrt(1 - t * t);
      
      case 'easeOutCirc':
        return Math.sqrt(1 - (--t) * t);
      
      case 'easeInOutCirc':
        return t < 0.5 ? (1 - Math.sqrt(1 - 4 * t * t)) / 2 : (Math.sqrt(1 - 4 * (t - 1) * (t - 1)) + 1) / 2;
      
      case 'easeInBack':
        const c1 = 1.70158;
        const c3 = c1 + 1;
        return c3 * t * t * t - c1 * t * t;
      
      case 'easeOutBack':
        const c1_2 = 1.70158;
        const c3_2 = c1_2 + 1;
        return 1 + c3_2 * Math.pow(t - 1, 3) + c1_2 * Math.pow(t - 1, 2);
      
      case 'easeInOutBack':
        const c1_3 = 1.70158;
        const c2_3 = c1_3 * 1.525;
        return t < 0.5 ? (Math.pow(2 * t, 2) * ((c2_3 + 1) * 2 * t - c2_3)) / 2 : (Math.pow(2 * t - 2, 2) * ((c2_3 + 1) * (t * 2 - 2) + c2_3) + 2) / 2;
      
      case 'easeInElastic':
        const c4 = (2 * Math.PI) / 3;
        return t === 0 ? 0 : t === 1 ? 1 : -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * c4);
      
      case 'easeOutElastic':
        const c4_2 = (2 * Math.PI) / 3;
        return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4_2) + 1;
      
      case 'easeInOutElastic':
        const c5 = (2 * Math.PI) / 4.5;
        return t === 0 ? 0 : t === 1 ? 1 : t < 0.5 ? -(Math.pow(2, 20 * t - 10) * Math.sin((20 * t - 11.125) * c5)) / 2 : (Math.pow(2, -20 * t + 10) * Math.sin((20 * t - 11.125) * c5)) / 2 + 1;
      
      case 'easeInBounce':
        return 1 - this.bounceOut(1 - t);
      
      case 'easeOutBounce':
        return this.bounceOut(t);
      
      case 'easeInOutBounce':
        return t < 0.5 ? (1 - this.bounceOut(1 - 2 * t)) / 2 : (1 + this.bounceOut(2 * t - 1)) / 2;
      
      default:
        return t;
    }
  }

  private bounceOut(t: number): number {
    const n1 = 7.5625;
    const d1 = 2.75;

    if (t < 1 / d1) {
      return n1 * t * t;
    } else if (t < 2 / d1) {
      return n1 * (t -= 1.5 / d1) * t + 0.75;
    } else if (t < 2.5 / d1) {
      return n1 * (t -= 2.25 / d1) * t + 0.9375;
    } else {
      return n1 * (t -= 2.625 / d1) * t + 0.984375;
    }
  }
}

// Utility functions for common animations
export const TweeningUtils = {
  /**
   * Interpolate between two positions
   */
  interpolatePosition(from: Position, to: Position, progress: number): Position {
    return {
      x: from.x + (to.x - from.x) * progress,
      y: from.y + (to.y - from.y) * progress,
    };
  },

  /**
   * Interpolate between two scales
   */
  interpolateScale(from: Scale, to: Scale, progress: number): Scale {
    return {
      x: from.x + (to.x - from.x) * progress,
      y: from.y + (to.y - from.y) * progress,
    };
  },

  /**
   * Interpolate between two numbers
   */
  interpolateNumber(from: number, to: number, progress: number): number {
    return from + (to - from) * progress;
  },

  /**
   * Create a position animation
   */
  animatePosition(
    element: HTMLElement,
    from: Position,
    to: Position,
    config: TweeningConfig,
    onUpdate?: (progress: number) => void
  ): Animation {
    const tweeningSystem = new TweeningSystem();
    const animation = tweeningSystem.createAnimation({
      ...config,
      onUpdate: (progress) => {
        const position = TweeningUtils.interpolatePosition(from, to, progress);
        element.style.transform = `translate(${position.x}px, ${position.y}px)`;
        if (onUpdate) onUpdate(progress);
      },
    });
    return animation;
  },

  /**
   * Create a scale animation
   */
  animateScale(
    element: HTMLElement,
    from: Scale,
    to: Scale,
    config: TweeningConfig,
    onUpdate?: (progress: number) => void
  ): Animation {
    const tweeningSystem = new TweeningSystem();
    const animation = tweeningSystem.createAnimation({
      ...config,
      onUpdate: (progress) => {
        const scale = TweeningUtils.interpolateScale(from, to, progress);
        element.style.transform = `scale(${scale.x}, ${scale.y})`;
        if (onUpdate) onUpdate(progress);
      },
    });
    return animation;
  },

  /**
   * Create an opacity animation
   */
  animateOpacity(
    element: HTMLElement,
    from: number,
    to: number,
    config: TweeningConfig,
    onUpdate?: (progress: number) => void
  ): Animation {
    const tweeningSystem = new TweeningSystem();
    const animation = tweeningSystem.createAnimation({
      ...config,
      onUpdate: (progress) => {
        const opacity = TweeningUtils.interpolateNumber(from, to, progress);
        element.style.opacity = opacity.toString();
        if (onUpdate) onUpdate(progress);
      },
    });
    return animation;
  },
};

// Export singleton instance
export const tweeningSystem = new TweeningSystem();
