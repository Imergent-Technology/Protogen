/**
 * HitTestLayer - M1 Week 3-4
 * 
 * Provides hit testing functionality for authoring mode.
 * Converts screen coordinates to scene targets.
 * Supports scene-type-specific handlers.
 * 
 * Based on Spec 04: Authoring Overlay Framework
 */

import type { ItemType } from '../../navigator/types';
import type { HitTestResult } from './SelectionEngine';

export interface Point {
  x: number;
  y: number;
}

export type SceneType = 'card' | 'document' | 'graph' | 'video';

export type HitTestHandler = (point: Point, sceneElement: HTMLElement | null) => HitTestResult | null;

export class HitTestLayer {
  private static instance: HitTestLayer;
  private handlers: Map<SceneType, HitTestHandler> = new Map();

  private constructor() {
    // Register default handlers
    this.registerHandler('card', this.cardHitTest.bind(this));
    // Document, Graph, Video handlers will be added in future milestones
  }

  // ============================================================================
  // Singleton Pattern
  // ============================================================================

  static getInstance(): HitTestLayer {
    if (!HitTestLayer.instance) {
      HitTestLayer.instance = new HitTestLayer();
    }
    return HitTestLayer.instance;
  }

  // ============================================================================
  // Hit Testing
  // ============================================================================

  hitTest(point: Point, sceneType: SceneType, sceneElement: HTMLElement | null = null): HitTestResult | null {
    const handler = this.handlers.get(sceneType);
    if (!handler) {
      console.warn(`No hit test handler registered for scene type: ${sceneType}`);
      return null;
    }

    return handler(point, sceneElement);
  }

  hitTestAll(point: Point, sceneType: SceneType, sceneElement: HTMLElement | null = null): HitTestResult[] {
    // Get all elements at point (for overlapping elements)
    const elements = this.getElementsAtPoint(point);
    const results: HitTestResult[] = [];

    const handler = this.handlers.get(sceneType);
    if (!handler) {
      return results;
    }

    // Test each element
    for (const element of elements) {
      const result = handler(point, element as HTMLElement);
      if (result) {
        results.push(result);
      }
    }

    return results;
  }

  private getElementsAtPoint(point: Point): Element[] {
    if (typeof document === 'undefined') {
      return [];
    }

    const elements: Element[] = [];
    let element = document.elementFromPoint(point.x, point.y);

    while (element) {
      elements.push(element);
      // Temporarily hide element to get next one below it
      const originalPointerEvents = (element as HTMLElement).style.pointerEvents;
      (element as HTMLElement).style.pointerEvents = 'none';

      element = document.elementFromPoint(point.x, point.y);

      // Restore pointer events
      if (elements[elements.length - 1]) {
        (elements[elements.length - 1] as HTMLElement).style.pointerEvents = originalPointerEvents;
      }

      // Prevent infinite loop
      if (elements.length > 50) break;
    }

    return elements;
  }

  // ============================================================================
  // Handler Registration
  // ============================================================================

  registerHandler(sceneType: SceneType, handler: HitTestHandler): void {
    this.handlers.set(sceneType, handler);
  }

  unregisterHandler(sceneType: SceneType): void {
    this.handlers.delete(sceneType);
  }

  hasHandler(sceneType: SceneType): boolean {
    return this.handlers.has(sceneType);
  }

  // ============================================================================
  // Scene-Type-Specific Handlers
  // ============================================================================

  /**
   * Card Scene Hit Test Handler (M1)
   * Detects clicks on slides within a card scene
   */
  private cardHitTest(point: Point, sceneElement: HTMLElement | null): HitTestResult | null {
    if (typeof document === 'undefined') {
      return null;
    }

    // Find slide at point
    const element = sceneElement || document.elementFromPoint(point.x, point.y);
    if (!element) {
      return null;
    }

    // Look for slide element (with data-slide-id attribute)
    const slideElement = element.closest('[data-slide-id]') as HTMLElement;
    if (!slideElement) {
      return null;
    }

    const slideId = slideElement.getAttribute('data-slide-id');
    if (!slideId) {
      return null;
    }

    return {
      targetType: 'slide' as ItemType,
      targetId: slideId,
      bounds: slideElement.getBoundingClientRect(),
      element: slideElement,
      metadata: {
        kind: slideElement.getAttribute('data-slide-kind') || 'unknown',
        order: parseInt(slideElement.getAttribute('data-order') || '0'),
        title: slideElement.getAttribute('data-title') || ''
      }
    };
  }

  /**
   * Document Scene Hit Test Handler (M2 - Deferred)
   * Detects clicks on blocks within a document scene
   */
  private documentHitTest(point: Point, _sceneElement: HTMLElement | null): HitTestResult | null {
    if (typeof document === 'undefined') {
      return null;
    }

    const element = document.elementFromPoint(point.x, point.y);
    if (!element) {
      return null;
    }

    // Check for block
    const blockElement = element.closest('[data-block-id]') as HTMLElement;
    if (blockElement) {
      const blockId = blockElement.getAttribute('data-block-id');
      if (!blockId) {
        return null;
      }

      return {
        targetType: 'block' as ItemType,
        targetId: blockId,
        bounds: blockElement.getBoundingClientRect(),
        element: blockElement,
        metadata: {
          blockType: blockElement.getAttribute('data-block-type') || 'unknown'
        }
      };
    }

    // Check for text selection
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const rangeBounds = range.getBoundingClientRect();

      // Only consider as hit if point is within range bounds
      if (
        point.x >= rangeBounds.left &&
        point.x <= rangeBounds.right &&
        point.y >= rangeBounds.top &&
        point.y <= rangeBounds.bottom
      ) {
        return {
          targetType: 'block' as ItemType, // Use block for text selection
          targetId: 'text-selection',
          bounds: rangeBounds,
          element: range.commonAncestorContainer as HTMLElement,
          metadata: {
            text: range.toString(),
            isTextSelection: true
          }
        };
      }
    }

    return null;
  }

  /**
   * Graph Scene Hit Test Handler (M3 - Deferred)
   * Detects clicks on nodes and edges
   */
  private graphHitTest(_point: Point, _sceneElement: HTMLElement | null): HitTestResult | null {
    // TODO: Implement in M3
    // Will detect clicks on SVG nodes and edges
    return null;
  }

  /**
   * Video Scene Hit Test Handler (M4 - Deferred)
   * Detects clicks on video clips in timeline
   */
  private videoHitTest(_point: Point, _sceneElement: HTMLElement | null): HitTestResult | null {
    // TODO: Implement in M4
    // Will detect clicks on video clips in timeline
    return null;
  }

  // ============================================================================
  // Utilities
  // ============================================================================

  /**
   * Check if point is within element bounds
   */
  isPointInBounds(point: Point, bounds: DOMRect): boolean {
    return (
      point.x >= bounds.left &&
      point.x <= bounds.right &&
      point.y >= bounds.top &&
      point.y <= bounds.bottom
    );
  }

  /**
   * Get element at point with specific attribute
   */
  getElementWithAttribute(point: Point, attribute: string): HTMLElement | null {
    if (typeof document === 'undefined') {
      return null;
    }

    const element = document.elementFromPoint(point.x, point.y);
    if (!element) {
      return null;
    }

    return element.closest(`[${attribute}]`) as HTMLElement;
  }

  /**
   * Get all elements at point with specific attribute
   */
  getAllElementsWithAttribute(point: Point, attribute: string): HTMLElement[] {
    const elements = this.getElementsAtPoint(point);
    return elements.filter(el => el.hasAttribute(attribute)) as HTMLElement[];
  }
}

// Export singleton instance
export const hitTestLayer = HitTestLayer.getInstance();

