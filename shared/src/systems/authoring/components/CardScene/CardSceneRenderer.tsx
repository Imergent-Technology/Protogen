/**
 * CardSceneRenderer - M1 Week 7-8
 * 
 * Main renderer for Card scenes.
 * Renders text, image, and layered slides.
 * 
 * Based on Spec 09: Card Scene Type
 */

import React, { useState, useEffect } from 'react';
import { TextSlideRenderer } from './TextSlideRenderer';
import { ImageSlideRenderer } from './ImageSlideRenderer';
import { LayeredSlideRenderer } from './LayeredSlideRenderer';
import type { CardScene, CardSlideUnion } from '../../types/card-scene';

export interface CardSceneRendererProps {
  scene: CardScene;
  currentSlideIndex?: number;
  onSlideChange?: (index: number) => void;
  authoringMode?: boolean;
  className?: string;
}

export function CardSceneRenderer({
  scene,
  currentSlideIndex = 0,
  onSlideChange,
  authoringMode = false,
  className = ''
}: CardSceneRendererProps) {
  const [currentIndex, setCurrentIndex] = useState(currentSlideIndex);
  const [transitioning, setTransitioning] = useState(false);

  // Sync with prop changes
  useEffect(() => {
    setCurrentIndex(currentSlideIndex);
  }, [currentSlideIndex]);

  // Auto-advance
  useEffect(() => {
    if (!scene.config.autoAdvance || authoringMode) return;

    const currentSlide = scene.slides[currentIndex];
    const delay = currentSlide?.duration || scene.config.autoAdvanceDelay;

    const timer = setTimeout(() => {
      goToNext();
    }, delay);

    return () => clearTimeout(timer);
  }, [currentIndex, scene.config.autoAdvance, authoringMode]);

  const goToNext = () => {
    const nextIndex = currentIndex + 1;

    if (nextIndex < scene.slides.length) {
      navigateToSlide(nextIndex);
    } else if (scene.config.loop) {
      navigateToSlide(0);
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      navigateToSlide(currentIndex - 1);
    } else if (scene.config.loop) {
      navigateToSlide(scene.slides.length - 1);
    }
  };

  const navigateToSlide = (index: number) => {
    if (index < 0 || index >= scene.slides.length) return;

    setTransitioning(true);
    setCurrentIndex(index);

    if (onSlideChange) {
      onSlideChange(index);
    }

    // Reset transition state after animation
    setTimeout(() => {
      setTransitioning(false);
    }, 300);
  };

  const currentSlide = scene.slides[currentIndex];

  if (!currentSlide) {
    return (
      <div className={`card-scene card-scene--empty ${className}`}>
        <p>No slides available</p>
      </div>
    );
  }

  return (
    <div
      className={`card-scene ${transitioning ? 'card-scene--transitioning' : ''} ${className}`}
      data-scene-id={scene.id}
      data-scene-type="card"
      data-slide-count={scene.slides.length}
    >
      {/* Current slide */}
      <div className="card-scene__viewport">
        {renderSlide(currentSlide, transitioning)}
      </div>

      {/* Navigation controls (authoring mode) */}
      {authoringMode && (
        <div className="card-scene__controls">
          <button
            className="card-scene__nav card-scene__nav--prev"
            onClick={goToPrevious}
            disabled={currentIndex === 0 && !scene.config.loop}
            aria-label="Previous slide"
          >
            ←
          </button>
          <span className="card-scene__position">
            {currentIndex + 1} / {scene.slides.length}
          </span>
          <button
            className="card-scene__nav card-scene__nav--next"
            onClick={goToNext}
            disabled={currentIndex === scene.slides.length - 1 && !scene.config.loop}
            aria-label="Next slide"
          >
            →
          </button>
        </div>
      )}

      {/* Slide indicators */}
      {scene.slides.length > 1 && (
        <div className="card-scene__indicators">
          {scene.slides.map((slide, index) => (
            <button
              key={slide.id}
              className={`card-scene__indicator ${index === currentIndex ? 'card-scene__indicator--active' : ''}`}
              onClick={() => navigateToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function renderSlide(slide: CardSlideUnion, transitioning: boolean) {
  const commonProps = {
    key: slide.id,
    slide,
    transitioning
  };

  switch (slide.kind) {
    case 'text':
      return <TextSlideRenderer {...commonProps} slide={slide} />;
    case 'image':
      return <ImageSlideRenderer {...commonProps} slide={slide} />;
    case 'layered':
      return <LayeredSlideRenderer {...commonProps} slide={slide} />;
    default:
      return <div>Unknown slide type</div>;
  }
}

// Export default
export default CardSceneRenderer;

