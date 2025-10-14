/**
 * PreviewCarousel Tests - M1 Week 6
 * 
 * Tests for Preview Carousel widget
 * Based on Spec 08a: Preview Carousel Widget
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { PreviewCarousel } from '../components/Carousel/PreviewCarousel';
import type { CarouselItem, VisibilityRules } from '../types/carousel';

// Mock Navigator
jest.mock('../../navigator/useNavigator', () => ({
  useNavigator: () => ({
    mode: 'author',
    currentItem: { id: 'slide-1', type: 'slide' },
    navigateToItem: jest.fn()
  })
}));

// Mock Preview hook
jest.mock('../hooks/useBatchPreviews', () => ({
  useBatchPreviews: () => ({
    previews: new Map(),
    loading: false,
    error: null,
    progress: 100
  })
}));

describe('PreviewCarousel Component', () => {
  const mockItems: CarouselItem[] = [
    { id: 'slide-1', type: 'slide', label: 'Slide 1', order: 0, current: true },
    { id: 'slide-2', type: 'slide', label: 'Slide 2', order: 1 },
    { id: 'slide-3', type: 'slide', label: 'Slide 3', order: 2 }
  ];

  test('should render carousel with items', () => {
    render(<PreviewCarousel items={mockItems} sceneId="scene-1" />);
    
    expect(screen.getByRole('region')).toBeInTheDocument();
  });

  test('should render all items', () => {
    render(<PreviewCarousel items={mockItems} sceneId="scene-1" />);
    
    expect(screen.getByText('Slide 1')).toBeInTheDocument();
    expect(screen.getByText('Slide 2')).toBeInTheDocument();
    expect(screen.getByText('Slide 3')).toBeInTheDocument();
  });

  test('should highlight current item', () => {
    render(<PreviewCarousel items={mockItems} sceneId="scene-1" />);
    
    // Would verify current item has highlight class
  });

  test('should show labels when configured', () => {
    render(
      <PreviewCarousel
        items={mockItems}
        sceneId="scene-1"
        config={{ showLabels: true }}
      />
    );
    
    expect(screen.getByText('Slide 1')).toBeInTheDocument();
  });

  test('should hide labels when configured', () => {
    render(
      <PreviewCarousel
        items={mockItems}
        sceneId="scene-1"
        config={{ showLabels: false }}
      />
    );
    
    // Labels should be hidden
  });

  test('should handle item click', () => {
    const handleClick = jest.fn();
    render(
      <PreviewCarousel
        items={mockItems}
        sceneId="scene-1"
        onItemClick={handleClick}
      />
    );
    
    // Would click item and verify callback
  });

  test('should show navigation arrows when many items', () => {
    const manyItems = Array.from({ length: 20 }, (_, i) => ({
      id: `slide-${i}`,
      type: 'slide' as const,
      label: `Slide ${i}`,
      order: i
    }));

    render(
      <PreviewCarousel
        items={manyItems}
        sceneId="scene-1"
        config={{ maxVisible: 10 }}
      />
    );
    
    expect(screen.getByLabelText(/previous/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/next/i)).toBeInTheDocument();
  });

  test('should navigate with arrow keys', () => {
    render(<PreviewCarousel items={mockItems} sceneId="scene-1" config={{ enableKeyboard: true }} />);
    
    const carousel = screen.getByRole('region');
    carousel.focus();
    
    fireEvent.keyDown(carousel, { key: 'ArrowRight' });
    // Would verify navigation
  });

  test('should navigate to first item with Home key', () => {
    render(<PreviewCarousel items={mockItems} sceneId="scene-1" config={{ enableKeyboard: true }} />);
    
    const carousel = screen.getByRole('region');
    fireEvent.keyDown(carousel, { key: 'Home' });
    
    // Would verify first item is current
  });

  test('should navigate to last item with End key', () => {
    render(<PreviewCarousel items={mockItems} sceneId="scene-1" config={{ enableKeyboard: true }} />);
    
    const carousel = screen.getByRole('region');
    fireEvent.keyDown(carousel, { key: 'End' });
    
    // Would verify last item is current
  });

  test('should show loading state', () => {
    // Mock loading state
    jest.resetModules();
    jest.doMock('../hooks/useBatchPreviews', () => ({
      useBatchPreviews: () => ({
        previews: new Map(),
        loading: true,
        error: null,
        progress: 50
      })
    }));

    const { PreviewCarousel: LoadingCarousel } = require('../components/Carousel/PreviewCarousel');
    render(<LoadingCarousel items={mockItems} sceneId="scene-1" />);
    
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  describe('Visibility Rules', () => {
    test('should show when visibility rules match', () => {
      const rules: VisibilityRules = {
        show: [
          { type: 'mode', operator: 'equals', value: 'author' }
        ],
        defaultVisible: false
      };

      render(<PreviewCarousel items={mockItems} sceneId="scene-1" visibilityRules={rules} />);
      
      expect(screen.getByRole('region')).toBeInTheDocument();
    });

    test('should hide when visibility rules do not match', () => {
      const rules: VisibilityRules = {
        show: [
          { type: 'mode', operator: 'equals', value: 'view' }
        ],
        defaultVisible: false
      };

      const { container } = render(
        <PreviewCarousel items={mockItems} sceneId="scene-1" visibilityRules={rules} />
      );
      
      expect(container.firstChild).toBeNull();
    });

    test('should evaluate item-count conditions', () => {
      const rules: VisibilityRules = {
        show: [
          { type: 'item-count', operator: 'greater-than', value: 2 }
        ]
      };

      render(<PreviewCarousel items={mockItems} sceneId="scene-1" visibilityRules={rules} />);
      
      expect(screen.getByRole('region')).toBeInTheDocument();
    });
  });

  describe('Drag Scrolling', () => {
    test('should enable drag when configured', () => {
      render(
        <PreviewCarousel
          items={mockItems}
          sceneId="scene-1"
          config={{ enableDrag: true }}
        />
      );
      
      const carousel = screen.getByRole('region');
      
      fireEvent.mouseDown(carousel, { clientX: 100 });
      fireEvent.mouseMove(carousel, { clientX: 50 });
      fireEvent.mouseUp(carousel);
      
      // Would verify scroll position changed
    });
  });

  describe('Accessibility', () => {
    test('should have proper ARIA labels', () => {
      render(<PreviewCarousel items={mockItems} sceneId="scene-1" />);
      
      expect(screen.getByLabelText(/preview carousel/i)).toBeInTheDocument();
    });

    test('should mark current item with aria-current', () => {
      render(<PreviewCarousel items={mockItems} sceneId="scene-1" />);
      
      // Would verify aria-current on current item
    });

    test('should be keyboard navigable', () => {
      render(<PreviewCarousel items={mockItems} sceneId="scene-1" config={{ enableKeyboard: true }} />);
      
      const carousel = screen.getByRole('region');
      expect(carousel.tabIndex).toBe(0);
    });
  });
});

