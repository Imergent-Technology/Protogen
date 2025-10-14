/**
 * ImageSlideRenderer - M1 Week 7-8
 * 
 * Renders image-only slides for Card scenes.
 * 
 * Based on Spec 09: Card Scene Type
 */

import React from 'react';
import type { ImageSlide } from '../../types/card-scene';

export interface ImageSlideRendererProps {
  slide: ImageSlide;
  transitioning?: boolean;
  className?: string;
}

export function ImageSlideRenderer({
  slide,
  transitioning = false,
  className = ''
}: ImageSlideRendererProps) {
  const containerStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    height: '100%',
    overflow: 'hidden'
  };

  const imageStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: slide.fit,
    objectPosition: `${slide.position.x}% ${slide.position.y}%`
  };

  const animationClass = transitioning
    ? `slide-animation slide-animation--${slide.enterAnimation || 'fade'}`
    : '';

  return (
    <div
      className={`image-slide ${animationClass} ${className}`}
      style={containerStyle}
      data-slide-id={slide.id}
      data-slide-kind="image"
      data-order={slide.order}
      data-title={slide.title || ''}
    >
      {/* Image */}
      <img
        src={`/api/assets/${slide.imageAssetId}`}
        alt={slide.title || 'Slide image'}
        style={imageStyle}
        className="image-slide__image"
      />

      {/* Optional caption */}
      {slide.caption && (
        <div
          className={`image-slide__caption image-slide__caption--${slide.caption.position}`}
          style={{
            backgroundColor: slide.caption.backgroundColor,
            color: slide.caption.textColor
          }}
        >
          {slide.caption.text}
        </div>
      )}
    </div>
  );
}

// Export default
export default ImageSlideRenderer;

