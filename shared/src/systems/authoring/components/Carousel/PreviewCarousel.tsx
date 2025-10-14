/**
 * PreviewCarousel Component - M1 Week 6
 * 
 * Carousel widget for quick visual navigation across collections.
 * Supports keyboard navigation, drag scrolling, and visibility rules.
 * 
 * Based on Spec 08a: Preview Carousel Widget
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigator } from '../../../navigator/useNavigator';
import { useBatchPreviews } from '../../hooks/useBatchPreviews';
import type {
  CarouselConfig,
  CarouselItem,
  VisibilityRules
} from '../../types/carousel';
import { DEFAULT_CAROUSEL_CONFIG } from '../../types/carousel';
import type { PreviewTarget } from '../../types/preview';

export interface PreviewCarouselProps {
  sceneId?: string;
  items: CarouselItem[];
  config?: Partial<CarouselConfig>;
  visibilityRules?: VisibilityRules;
  onItemClick?: (item: CarouselItem) => void;
  className?: string;
}

export function PreviewCarousel({
  sceneId,
  items,
  config: userConfig,
  visibilityRules,
  onItemClick,
  className = ''
}: PreviewCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scrollPosition, setScrollPosition] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const dragStart = useRef(0);

  const { mode, currentItem, navigateToItem } = useNavigator();
  const config = { ...DEFAULT_CAROUSEL_CONFIG, ...userConfig };

  // Check visibility
  const visible = evaluateVisibilityRules(visibilityRules, mode, items);

  // Load previews for items
  const previewTargets: PreviewTarget[] = items.map(item => ({
    type: item.type,
    sceneId: sceneId || '',
    slideId: item.type === 'slide' ? item.id : '',
    pageId: item.type === 'page' ? item.id : ''
  } as PreviewTarget));

  const { previews, loading } = useBatchPreviews(previewTargets, config.size);

  // Sync current index with navigator
  useEffect(() => {
    if (currentItem) {
      const index = items.findIndex(item => item.id === currentItem.id);
      if (index !== -1) {
        setCurrentIndex(index);
        scrollToIndex(index);
      }
    }
  }, [currentItem, items]);

  // Keyboard navigation
  useEffect(() => {
    if (!config.enableKeyboard || !visible) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle if carousel is visible and focused
      if (!carouselRef.current?.contains(document.activeElement)) {
        return;
      }

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          navigatePrevious();
          break;
        case 'ArrowRight':
          e.preventDefault();
          navigateNext();
          break;
        case 'Home':
          e.preventDefault();
          navigateToIndex(0);
          break;
        case 'End':
          e.preventDefault();
          navigateToIndex(items.length - 1);
          break;
        case 'Enter':
          e.preventDefault();
          handleItemClick(items[currentIndex]);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [config.enableKeyboard, visible, currentIndex, items]);

  const scrollToIndex = (index: number) => {
    if (!carouselRef.current) return;

    const itemWidth = getItemWidth();
    const targetScroll = index * itemWidth;

    if (config.snapToItems) {
      carouselRef.current.scrollTo({
        left: targetScroll,
        behavior: 'smooth'
      });
    } else {
      carouselRef.current.scrollLeft = targetScroll;
    }

    setScrollPosition(targetScroll);
  };

  const navigateNext = () => {
    if (currentIndex < items.length - 1) {
      navigateToIndex(currentIndex + 1);
    }
  };

  const navigatePrevious = () => {
    if (currentIndex > 0) {
      navigateToIndex(currentIndex - 1);
    }
  };

  const navigateToIndex = (index: number) => {
    setCurrentIndex(index);
    scrollToIndex(index);

    const item = items[index];
    if (item) {
      navigateToItem(item.id, item.type as any);
    }
  };

  const handleItemClick = (item: CarouselItem) => {
    const index = items.findIndex(i => i.id === item.id);
    if (index !== -1) {
      navigateToIndex(index);
    }

    if (onItemClick) {
      onItemClick(item);
    }
  };

  const getItemWidth = (): number => {
    const baseWidth = config.size === 'sm' ? 160 : 320;
    const gap = 8;
    return baseWidth + gap;
  };

  // Drag scrolling
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!config.enableDrag) return;

    isDragging.current = true;
    dragStart.current = e.clientX - scrollPosition;
    e.preventDefault();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !carouselRef.current) return;

    const x = e.clientX - dragStart.current;
    carouselRef.current.scrollLeft = -x;
    setScrollPosition(-x);
  };

  const handleMouseUp = () => {
    if (isDragging.current && config.snapToItems) {
      // Snap to nearest item
      const itemWidth = getItemWidth();
      const nearestIndex = Math.round(Math.abs(scrollPosition) / itemWidth);
      scrollToIndex(nearestIndex);
    }

    isDragging.current = false;
  };

  if (!visible) {
    return null;
  }

  return (
    <div
      ref={carouselRef}
      className={`preview-carousel ${className}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      role="region"
      aria-label="Preview Carousel"
      tabIndex={0}
    >
      {/* Loading state */}
      {loading && (
        <div className="preview-carousel__loading">Loading previews...</div>
      )}

      {/* Carousel items */}
      <div className="preview-carousel__track">
        {items.map((item, index) => (
          <div
            key={item.id}
            className={`preview-carousel__item ${index === currentIndex ? 'preview-carousel__item--current' : ''} ${item.selected ? 'preview-carousel__item--selected' : ''}`}
            onClick={() => handleItemClick(item)}
            role="button"
            tabIndex={-1}
            aria-current={index === currentIndex}
          >
            {/* Thumbnail */}
            <div className="preview-carousel__thumbnail">
              {previews.get(getPreviewKey(item, sceneId)) || item.preview ? (
                <img
                  src={previews.get(getPreviewKey(item, sceneId)) || item.preview}
                  alt={item.label}
                  className="preview-carousel__image"
                />
              ) : (
                <div className="preview-carousel__placeholder">
                  {getNodeIcon(item.type)}
                </div>
              )}
            </div>

            {/* Label */}
            {config.showLabels && (
              <div className="preview-carousel__label">
                {item.label}
              </div>
            )}

            {/* Current indicator */}
            {index === currentIndex && config.showIndicator && (
              <div className="preview-carousel__indicator" />
            )}
          </div>
        ))}
      </div>

      {/* Navigation arrows */}
      {items.length > config.maxVisible && (
        <>
          <button
            className="preview-carousel__arrow preview-carousel__arrow--prev"
            onClick={(e) => { e.stopPropagation(); navigatePrevious(); }}
            disabled={currentIndex === 0}
            aria-label="Previous item"
          >
            ←
          </button>
          <button
            className="preview-carousel__arrow preview-carousel__arrow--next"
            onClick={(e) => { e.stopPropagation(); navigateNext(); }}
            disabled={currentIndex === items.length - 1}
            aria-label="Next item"
          >
            →
          </button>
        </>
      )}
    </div>
  );
}

// Helper functions
function evaluateVisibilityRules(
  rules: VisibilityRules | undefined,
  mode: string,
  items: CarouselItem[]
): boolean {
  if (!rules) return true;

  // Check show conditions
  const showConditions = rules.show.every(condition => {
    switch (condition.type) {
      case 'mode':
        return condition.operator === 'equals'
          ? mode === condition.value
          : mode !== condition.value;
      case 'item-count':
        return evaluateNumericCondition(items.length, condition.operator, condition.value);
      default:
        return true;
    }
  });

  // Check hide conditions
  const hideConditions = rules.hide?.some(condition => {
    switch (condition.type) {
      case 'mode':
        return condition.operator === 'equals'
          ? mode === condition.value
          : mode !== condition.value;
      default:
        return false;
    }
  }) || false;

  return showConditions && !hideConditions;
}

function evaluateNumericCondition(value: number, operator: string, target: number): boolean {
  switch (operator) {
    case 'equals': return value === target;
    case 'not-equals': return value !== target;
    case 'greater-than': return value > target;
    case 'less-than': return value < target;
    default: return true;
  }
}

function getPreviewKey(item: CarouselItem, sceneId?: string): string {
  switch (item.type) {
    case 'slide':
      return `slide:${sceneId}:${item.id}`;
    case 'page':
      return `page:${sceneId}:${item.id}`;
    case 'scene':
      return `scene:${item.id}`;
    default:
      return `unknown:${item.id}`;
  }
}

function getNodeIcon(type: string): string {
  const icons: Record<string, string> = {
    slide: '📄',
    page: '📝',
    scene: '🎬'
  };
  return icons[type] || '•';
}

// Export default
export default PreviewCarousel;

