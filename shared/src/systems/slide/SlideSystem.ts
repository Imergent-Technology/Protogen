/**
 * Slide System Implementation
 * 
 * Core implementation of the Slide System for managing slide states,
 * transitions, and navigation within scenes.
 */

import { Slide, SlideItem, SlideState, TweeningConfig, SlideEvent, SlideEventHandler } from './types';

export class SlideSystemImpl {
  private currentSlide: SlideState | null = null;
  private slideHistory: SlideState[] = [];
  private eventHandlers: { [key in SlideEvent]?: SlideEventHandler[] } = {};
  private isTransitioning: boolean = false;
  private transitionProgress: number = 0;
  private transitionConfig: TweeningConfig | null = null;

  constructor() {
    // Initialize with empty state
    this.currentSlide = null;
    this.slideHistory = [];
  }

  // ============================================================================
  // Core Slide Management
  // ============================================================================

  async createSlide(sceneId: string, slideData: Partial<Slide>): Promise<Slide> {
    const response = await fetch(`/api/slides/scene/${sceneId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`,
      },
      body: JSON.stringify(slideData),
    });

    if (!response.ok) {
      throw new Error(`Failed to create slide: ${response.statusText}`);
    }

    const result = await response.json();
    this.emit('slideCreate', result.data);
    return result.data;
  }

  async updateSlide(slideId: string, updates: Partial<Slide>): Promise<Slide> {
    const response = await fetch(`/api/slides/${slideId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`,
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error(`Failed to update slide: ${response.statusText}`);
    }

    const result = await response.json();
    this.emit('slideUpdate', result.data);
    return result.data;
  }

  async deleteSlide(slideId: string): Promise<void> {
    const response = await fetch(`/api/slides/${slideId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to delete slide: ${response.statusText}`);
    }

    this.emit('slideDelete', { slideId });
  }

  async getSlide(slideId: string): Promise<Slide> {
    const response = await fetch(`/api/slides/${slideId}`, {
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get slide: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data;
  }

  async getSlidesForScene(sceneId: string): Promise<Slide[]> {
    const response = await fetch(`/api/slides/scene/${sceneId}`, {
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get slides for scene: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data;
  }

  // ============================================================================
  // Slide Item Management
  // ============================================================================

  async createSlideItem(slideId: string, nodeId: string, itemData: Partial<SlideItem>): Promise<SlideItem> {
    const response = await fetch(`/api/slide-items/slide/${slideId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`,
      },
      body: JSON.stringify({ node_id: nodeId, ...itemData }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create slide item: ${response.statusText}`);
    }

    const result = await response.json();
    this.emit('slideItemUpdate', result.data);
    return result.data;
  }

  async updateSlideItem(itemId: string, updates: Partial<SlideItem>): Promise<SlideItem> {
    const response = await fetch(`/api/slide-items/${itemId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`,
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error(`Failed to update slide item: ${response.statusText}`);
    }

    const result = await response.json();
    this.emit('slideItemUpdate', result.data);
    return result.data;
  }

  async deleteSlideItem(itemId: string): Promise<void> {
    const response = await fetch(`/api/slide-items/${itemId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to delete slide item: ${response.statusText}`);
    }

    this.emit('slideItemUpdate', { itemId });
  }

  async getSlideItem(itemId: string): Promise<SlideItem> {
    const response = await fetch(`/api/slide-items/${itemId}`, {
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get slide item: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data;
  }

  async getSlideItemsForSlide(slideId: string): Promise<SlideItem[]> {
    const response = await fetch(`/api/slide-items/slide/${slideId}`, {
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get slide items: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data;
  }

  // ============================================================================
  // Slide Navigation
  // ============================================================================

  async navigateToSlide(slideId: string): Promise<void> {
    if (this.isTransitioning) {
      console.warn('Slide transition in progress, ignoring navigation request');
      return;
    }

    const slide = await this.getSlide(slideId);
    const slideItems = await this.getSlideItemsForSlide(slideId);
    
    const newSlideState: SlideState = {
      id: slide.id,
      sceneId: slide.sceneId,
      slideIndex: slide.slideIndex,
      nodeStates: slideItems.map(item => ({
        nodeId: item.nodeId,
        position: item.position,
        scale: item.scale,
        rotation: item.rotation,
        opacity: item.opacity,
        visible: item.visible,
        style: item.style || {},
      })),
      transitionConfig: slide.transitionConfig,
      isTransitioning: false,
      transitionProgress: 0,
    };

    // Add to history if different from current slide
    if (!this.currentSlide || this.currentSlide.id !== slideId) {
      if (this.currentSlide) {
        this.slideHistory.push(this.currentSlide);
      }
      this.currentSlide = newSlideState;
      this.emit('slideChange', newSlideState);
    }
  }

  async navigateToSlideByIndex(sceneId: string, slideIndex: number): Promise<void> {
    const slides = await this.getSlidesForScene(sceneId);
    const slide = slides.find(s => s.slideIndex === slideIndex);
    
    if (!slide) {
      throw new Error(`Slide with index ${slideIndex} not found in scene ${sceneId}`);
    }

    await this.navigateToSlide(slide.id);
  }

  getCurrentSlide(): SlideState | null {
    return this.currentSlide;
  }

  getSlideHistory(): SlideState[] {
    return [...this.slideHistory];
  }

  // ============================================================================
  // Animation and Transitions
  // ============================================================================

  async startSlideTransition(fromSlideId: string, toSlideId: string, config?: TweeningConfig): Promise<void> {
    if (this.isTransitioning) {
      console.warn('Slide transition already in progress');
      return;
    }

    this.isTransitioning = true;
    this.transitionProgress = 0;
    this.transitionConfig = config || {
      duration: 500,
      easing: 'easeInOutQuad',
    };

    this.emit('slideTransitionStart', { fromSlideId, toSlideId, config });

    // Start the transition
    await this.navigateToSlide(toSlideId);

    // Simulate transition progress
    await this.animateTransition();

    this.isTransitioning = false;
    this.transitionProgress = 1;
    this.emit('slideTransitionComplete', { toSlideId });
  }

  private async animateTransition(): Promise<void> {
    if (!this.transitionConfig) return;

    const startTime = Date.now();
    const duration = this.transitionConfig.duration;

    return new Promise((resolve) => {
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        this.transitionProgress = progress;

        if (this.transitionConfig?.onUpdate) {
          this.transitionConfig.onUpdate(progress);
        }

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          if (this.transitionConfig?.onComplete) {
            this.transitionConfig.onComplete();
          }
          resolve();
        }
      };

      requestAnimationFrame(animate);
    });
  }

  pauseSlideTransition(): void {
    if (this.isTransitioning) {
      this.emit('slideTransitionPause', {});
      // Implementation would pause the animation
    }
  }

  resumeSlideTransition(): void {
    if (this.isTransitioning) {
      this.emit('slideTransitionResume', {});
      // Implementation would resume the animation
    }
  }

  stopSlideTransition(): void {
    if (this.isTransitioning) {
      this.isTransitioning = false;
      this.transitionProgress = 0;
      this.transitionConfig = null;
      this.emit('slideTransitionStop', {});
    }
  }

  // ============================================================================
  // Event System
  // ============================================================================

  on(event: SlideEvent, handler: SlideEventHandler): void {
    if (!this.eventHandlers[event]) {
      this.eventHandlers[event] = [];
    }
    this.eventHandlers[event]?.push(handler);
  }

  emit(event: SlideEvent, data: any): void {
    this.eventHandlers[event]?.forEach(handler => handler(data));
  }

  // ============================================================================
  // Utility Methods
  // ============================================================================

  private getAuthToken(): string {
    // Get authentication token from localStorage or context
    return localStorage.getItem('auth_token') || '';
  }

  isCurrentlyTransitioning(): boolean {
    return this.isTransitioning;
  }

  getTransitionProgress(): number {
    return this.transitionProgress;
  }

  getTransitionConfig(): TweeningConfig | null {
    return this.transitionConfig;
  }
}

// Export singleton instance
export const slideSystem = new SlideSystemImpl();
