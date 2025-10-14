/**
 * HitTestLayer Tests - M1 Week 3-4
 * 
 * Tests for HitTestLayer class
 * Based on Spec 04: Authoring Overlay Framework
 */

import { HitTestLayer } from '../services/HitTestLayer';
import type { Point } from '../services/HitTestLayer';

describe('HitTestLayer', () => {
  let hitTestLayer: HitTestLayer;

  beforeEach(() => {
    hitTestLayer = HitTestLayer.getInstance();
  });

  describe('Singleton Pattern', () => {
    test('should return same instance', () => {
      const instance1 = HitTestLayer.getInstance();
      const instance2 = HitTestLayer.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('Handler Registration', () => {
    test('should have card handler registered by default', () => {
      expect(hitTestLayer.hasHandler('card')).toBe(true);
    });

    test('should register custom handler', () => {
      const customHandler = jest.fn();

      hitTestLayer.registerHandler('document', customHandler);

      expect(hitTestLayer.hasHandler('document')).toBe(true);
    });

    test('should unregister handler', () => {
      hitTestLayer.unregisterHandler('card');

      expect(hitTestLayer.hasHandler('card')).toBe(false);
    });
  });

  describe('Card Scene Hit Testing', () => {
    beforeEach(() => {
      // Set up DOM for testing
      document.body.innerHTML = `
        <div data-slide-id="slide-123" data-slide-kind="text" data-order="0" data-title="Test Slide">
          Card content
        </div>
      `;
    });

    afterEach(() => {
      document.body.innerHTML = '';
    });

    test('should hit test card slide', () => {
      const slideElement = document.querySelector('[data-slide-id]') as HTMLElement;
      const bounds = slideElement.getBoundingClientRect();
      const point: Point = { x: bounds.left + 10, y: bounds.top + 10 };

      const result = hitTestLayer.hitTest(point, 'card');

      expect(result).not.toBeNull();
      expect(result?.targetType).toBe('slide');
      expect(result?.targetId).toBe('slide-123');
      expect(result?.metadata.kind).toBe('text');
      expect(result?.metadata.order).toBe(0);
      expect(result?.metadata.title).toBe('Test Slide');
    });

    test('should return null if no slide at point', () => {
      const point: Point = { x: -100, y: -100 };

      const result = hitTestLayer.hitTest(point, 'card');

      expect(result).toBeNull();
    });
  });

  describe('Utilities', () => {
    test('should check if point is in bounds', () => {
      const bounds = new DOMRect(0, 0, 100, 100);
      const point1: Point = { x: 50, y: 50 };
      const point2: Point = { x: 150, y: 150 };

      expect(hitTestLayer.isPointInBounds(point1, bounds)).toBe(true);
      expect(hitTestLayer.isPointInBounds(point2, bounds)).toBe(false);
    });

    test('should get element with attribute at point', () => {
      document.body.innerHTML = `
        <div data-test-attr="value">
          <span>Content</span>
        </div>
      `;

      const element = document.querySelector('span') as HTMLElement;
      const bounds = element.getBoundingClientRect();
      const point: Point = { x: bounds.left + 5, y: bounds.top + 5 };

      const result = hitTestLayer.getElementWithAttribute(point, 'data-test-attr');

      expect(result).not.toBeNull();
      expect(result?.getAttribute('data-test-attr')).toBe('value');

      document.body.innerHTML = '';
    });
  });

  describe('Hit Test All', () => {
    beforeEach(() => {
      // Set up overlapping elements
      document.body.innerHTML = `
        <div data-slide-id="slide-1" style="position: absolute; top: 0; left: 0; width: 100px; height: 100px;">
          <div data-slide-id="slide-2" style="position: absolute; top: 10px; left: 10px; width: 50px; height: 50px;">
            Nested content
          </div>
        </div>
      `;
    });

    afterEach(() => {
      document.body.innerHTML = '';
    });

    test('should get all elements at point', () => {
      const innerElement = document.querySelector('[data-slide-id="slide-2"]') as HTMLElement;
      const bounds = innerElement.getBoundingClientRect();
      const point: Point = { x: bounds.left + 5, y: bounds.top + 5 };

      const results = hitTestLayer.hitTestAll(point, 'card');

      // Should find both slides
      expect(results.length).toBeGreaterThan(0);
    });
  });
});

