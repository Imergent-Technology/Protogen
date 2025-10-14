/**
 * TextSlideRenderer - M1 Week 7-8
 * 
 * Renders text-only slides for Card scenes.
 * 
 * Based on Spec 09: Card Scene Type
 */

import React from 'react';
import type { TextSlide } from '../../types/card-scene';

export interface TextSlideRendererProps {
  slide: TextSlide;
  transitioning?: boolean;
  className?: string;
}

export function TextSlideRenderer({
  slide,
  transitioning = false,
  className = ''
}: TextSlideRendererProps) {
  const style: React.CSSProperties = {
    backgroundColor: slide.backgroundColor,
    color: slide.textColor,
    padding: `${slide.padding}px`,
    fontFamily: slide.fontFamily,
    fontSize: `${slide.fontSize}px`,
    textAlign: slide.alignment,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100%',
    width: '100%'
  };

  const animationClass = transitioning
    ? `slide-animation slide-animation--${slide.enterAnimation || 'fade'}`
    : '';

  return (
    <div
      className={`text-slide ${animationClass} ${className}`}
      style={style}
      data-slide-id={slide.id}
      data-slide-kind="text"
      data-order={slide.order}
      data-title={slide.title || ''}
    >
      <div className="text-slide__content">
        {slide.text}
      </div>
    </div>
  );
}

// Export default
export default TextSlideRenderer;

