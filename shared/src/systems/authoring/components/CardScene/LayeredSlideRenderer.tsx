/**
 * LayeredSlideRenderer - M1 Week 7-8
 * 
 * Renders layered slides (background image + text overlay) for Card scenes.
 * Supports text timing and animations.
 * 
 * Based on Spec 09: Card Scene Type
 */

import React, { useState, useEffect } from 'react';
import type { LayeredSlide } from '../../types/card-scene';

export interface LayeredSlideRendererProps {
  slide: LayeredSlide;
  transitioning?: boolean;
  className?: string;
}

export function LayeredSlideRenderer({
  slide,
  transitioning = false,
  className = ''
}: LayeredSlideRendererProps) {
  const [textVisible, setTextVisible] = useState(false);

  // Handle text timing
  useEffect(() => {
    setTextVisible(false);

    const timer = setTimeout(() => {
      setTextVisible(true);
    }, slide.textTiming.delay);

    return () => clearTimeout(timer);
  }, [slide.id, slide.textTiming.delay]);

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    height: '100%',
    overflow: 'hidden'
  };

  const backgroundStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: slide.backgroundFit,
    filter: `brightness(${1 - slide.backgroundDim / 100})`
  };

  const textContainerStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: getVerticalAlignment(slide.textPosition.vertical),
    justifyContent: getHorizontalAlignment(slide.textPosition.horizontal),
    padding: '32px',
    pointerEvents: 'none'
  };

  const textStyle: React.CSSProperties = {
    color: slide.textColor,
    fontSize: `${slide.fontSize}px`,
    fontFamily: slide.fontFamily,
    textAlign: slide.alignment,
    maxWidth: '80%'
  };

  const animationClass = transitioning
    ? `slide-animation slide-animation--${slide.textTiming.animation}`
    : '';

  const textAnimationStyle: React.CSSProperties = {
    animationDuration: `${slide.textTiming.duration}ms`,
    opacity: textVisible ? 1 : 0,
    transform: textVisible ? 'none' : getAnimationTransform(slide.textTiming.animation)
  };

  return (
    <div
      className={`layered-slide ${animationClass} ${className}`}
      style={containerStyle}
      data-slide-id={slide.id}
      data-slide-kind="layered"
      data-order={slide.order}
      data-title={slide.title || ''}
    >
      {/* Background image layer */}
      <img
        src={`/api/assets/${slide.backgroundImageId}`}
        alt="Background"
        style={backgroundStyle}
        className="layered-slide__background"
      />

      {/* Text overlay layer */}
      <div
        className="layered-slide__text-container"
        style={textContainerStyle}
      >
        <div
          className={`layered-slide__text ${textVisible ? 'layered-slide__text--visible' : ''}`}
          style={{ ...textStyle, ...textAnimationStyle }}
        >
          {slide.text}
        </div>
      </div>
    </div>
  );
}

// Helper functions
function getVerticalAlignment(vertical: 'top' | 'center' | 'bottom'): string {
  switch (vertical) {
    case 'top': return 'flex-start';
    case 'center': return 'center';
    case 'bottom': return 'flex-end';
    default: return 'center';
  }
}

function getHorizontalAlignment(horizontal: 'left' | 'center' | 'right'): string {
  switch (horizontal) {
    case 'left': return 'flex-start';
    case 'center': return 'center';
    case 'right': return 'flex-end';
    default: return 'center';
  }
}

function getAnimationTransform(animation: string): string {
  switch (animation) {
    case 'slide-up': return 'translateY(20px)';
    case 'slide-down': return 'translateY(-20px)';
    case 'zoom': return 'scale(0.9)';
    default: return 'none';
  }
}

// Export default
export default LayeredSlideRenderer;

