/**
 * Scene System
 * 
 * Manages scene lifecycle, slide navigation, and animation orchestration.
 * Scenes own and control their slides and animations.
 */

import type {
  Scene,
  Slide,
  SlideState,
  SceneSystemState,
  NavigationDirection,
  SceneNavigationEvent,
  SceneEventHandler,
  ApiResponse,
} from './types';
import { SYSTEM_DEFAULT_ANIMATION } from './animationPresets';

export class SceneSystem {
  private state: SceneSystemState = {
    currentScene: null,
    currentSlideIndex: 0,
    slides: [],
    isLoading: false,
    isAnimating: false,
    error: null,
  };

  private eventHandlers: Map<string, Set<SceneEventHandler>> = new Map();
  private apiBaseUrl: string = 'http://protogen.local:8080/api';
  private authToken: string | null = null;

  constructor(apiBaseUrl?: string) {
    if (apiBaseUrl) {
      this.apiBaseUrl = apiBaseUrl;
    }
    this.authToken = localStorage.getItem('oauth_token');
  }

  // ============================================================================
  // Event System
  // ============================================================================

  on(eventType: SceneNavigationEvent['type'], handler: SceneEventHandler): void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, new Set());
    }
    this.eventHandlers.get(eventType)!.add(handler);
  }

  off(eventType: SceneNavigationEvent['type'], handler: SceneEventHandler): void {
    const handlers = this.eventHandlers.get(eventType);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  private emit(event: SceneNavigationEvent): void {
    const handlers = this.eventHandlers.get(event.type);
    if (handlers) {
      handlers.forEach(handler => handler(event));
    }
  }

  // ============================================================================
  // State Management
  // ============================================================================

  getState(): SceneSystemState {
    return { ...this.state };
  }

  getCurrentScene(): Scene | null {
    return this.state.currentScene;
  }

  getCurrentSlide(): Slide | null {
    if (!this.state.currentScene || this.state.slides.length === 0) {
      return null;
    }
    return this.state.slides[this.state.currentSlideIndex] || null;
  }

  getCurrentSlideIndex(): number {
    return this.state.currentSlideIndex;
  }

  getSlideCount(): number {
    return this.state.slides.length;
  }

  isLoading(): boolean {
    return this.state.isLoading;
  }

  isAnimating(): boolean {
    return this.state.isAnimating;
  }

  // ============================================================================
  // Scene Loading
  // ============================================================================

  async loadScene(sceneId: string | number): Promise<void> {
    this.state.isLoading = true;
    this.state.error = null;

    try {
      const response = await fetch(`${this.apiBaseUrl}/scenes/${sceneId}`, {
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to load scene: ${response.statusText}`);
      }

      const data: ApiResponse<Scene> = await response.json();
      
      if (!data.success || !data.data) {
        throw new Error(data.message || 'Failed to load scene');
      }

      const scene = data.data;

      // Load slides for this scene
      const slidesResponse = await fetch(`${this.apiBaseUrl}/slides/scene/${sceneId}`, {
        headers: this.getHeaders(),
      });

      if (slidesResponse.ok) {
        const slidesData = await slidesResponse.json();
        scene.slides = Array.isArray(slidesData) ? slidesData : slidesData.data || [];
      } else {
        scene.slides = [];
      }

      this.state.currentScene = scene;
      this.state.slides = scene.slides || [];
      this.state.currentSlideIndex = 0;
      this.state.isLoading = false;

      this.emit({
        type: 'scene-loaded',
        sceneId: typeof sceneId === 'string' ? parseInt(sceneId) : sceneId,
        timestamp: Date.now(),
      });
    } catch (error) {
      this.state.error = error instanceof Error ? error.message : 'Unknown error';
      this.state.isLoading = false;
      throw error;
    }
  }

  async unloadScene(): Promise<void> {
    const sceneId = this.state.currentScene?.id;
    
    this.state.currentScene = null;
    this.state.slides = [];
    this.state.currentSlideIndex = 0;
    this.state.error = null;

    if (sceneId) {
      this.emit({
        type: 'scene-unloaded',
        sceneId,
        timestamp: Date.now(),
      });
    }
  }

  // ============================================================================
  // Slide Navigation
  // ============================================================================

  async navigateToSlide(slideIndex: number, direction?: NavigationDirection): Promise<void> {
    if (!this.state.currentScene || this.state.slides.length === 0) {
      throw new Error('No scene loaded');
    }

    if (slideIndex < 0 || slideIndex >= this.state.slides.length) {
      throw new Error('Invalid slide index');
    }

    if (this.state.isAnimating) {
      return; // Prevent navigation during animation
    }

    // Determine direction if not specified
    const navDirection = direction || (slideIndex > this.state.currentSlideIndex ? 'forward' : 'reverse');

    this.state.isAnimating = true;

    try {
      this.state.currentSlideIndex = slideIndex;

      this.emit({
        type: 'slide-changed',
        sceneId: this.state.currentScene.id,
        slideIndex,
        timestamp: Date.now(),
      });

      // Wait for animation to complete
      const currentSlide = this.state.slides[slideIndex];
      const exitAnimation = slideIndex > 0 
        ? this.getSlideExitAnimation(this.state.slides[slideIndex - 1])
        : SYSTEM_DEFAULT_ANIMATION.exit;
      
      await new Promise(resolve => setTimeout(resolve, exitAnimation.duration));

      this.emit({
        type: 'animation-complete',
        sceneId: this.state.currentScene.id,
        slideIndex,
        timestamp: Date.now(),
      });
    } finally {
      this.state.isAnimating = false;
    }
  }

  async nextSlide(): Promise<void> {
    if (this.state.currentSlideIndex < this.state.slides.length - 1) {
      await this.navigateToSlide(this.state.currentSlideIndex + 1, 'forward');
    } else if (this.state.currentScene?.slide_config?.loop) {
      await this.navigateToSlide(0, 'forward');
    }
  }

  async previousSlide(): Promise<void> {
    if (this.state.currentSlideIndex > 0) {
      await this.navigateToSlide(this.state.currentSlideIndex - 1, 'reverse');
    } else if (this.state.currentScene?.slide_config?.loop) {
      await this.navigateToSlide(this.state.slides.length - 1, 'reverse');
    }
  }

  canGoNext(): boolean {
    return this.state.currentSlideIndex < this.state.slides.length - 1 ||
           (this.state.currentScene?.slide_config?.loop || false);
  }

  canGoPrevious(): boolean {
    return this.state.currentSlideIndex > 0 ||
           (this.state.currentScene?.slide_config?.loop || false);
  }

  // ============================================================================
  // Animation Resolution
  // ============================================================================

  getSlideEntranceAnimation(slide: Slide) {
    if (slide.entrance_animation) {
      return slide.entrance_animation;
    }

    if (this.state.currentScene?.default_slide_animation?.entrance) {
      return this.state.currentScene.default_slide_animation.entrance;
    }

    return SYSTEM_DEFAULT_ANIMATION.entrance;
  }

  getSlideExitAnimation(slide: Slide) {
    if (slide.exit_animation) {
      return slide.exit_animation;
    }

    if (this.state.currentScene?.default_slide_animation?.exit) {
      return this.state.currentScene.default_slide_animation.exit;
    }

    return SYSTEM_DEFAULT_ANIMATION.exit;
  }

  // ============================================================================
  // Scene Lifecycle
  // ============================================================================

  async play(): Promise<void> {
    if (!this.state.currentScene?.slide_config?.auto_advance) {
      return;
    }

    const advanceSlide = async () => {
      if (!this.state.currentScene?.slide_config?.auto_advance) {
        return;
      }

      await this.nextSlide();

      const duration = this.state.currentScene.slide_config.duration_per_slide || 5000;
      setTimeout(advanceSlide, duration);
    };

    advanceSlide();
  }

  async pause(): Promise<void> {
    // Stop auto-advance (handled by play() check)
  }

  async reset(): Promise<void> {
    await this.navigateToSlide(0, 'forward');
  }

  // ============================================================================
  // Utility Methods
  // ============================================================================

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    return headers;
  }

  setAuthToken(token: string): void {
    this.authToken = token;
    localStorage.setItem('oauth_token', token);
  }

  clearAuthToken(): void {
    this.authToken = null;
    localStorage.removeItem('oauth_token');
  }
}

// Singleton instance
export const sceneSystem = new SceneSystem();

