/**
 * SlideControls Component
 * 
 * Control interface for slide navigation, including previous/next buttons,
 * slide selection, and slide management controls.
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@protogen/shared';
import { ChevronLeft, ChevronRight, Play, Pause, Square, RotateCcw } from 'lucide-react';
import { SlideControlsProps } from '../../systems/slide/types';
import { useSlide } from '../../systems/slide/useSlide';

export const SlideControls: React.FC<SlideControlsProps> = ({
  sceneId,
  currentSlideIndex,
  totalSlides,
  onPreviousSlide,
  onNextSlide,
  onSlideSelect,
  className = '',
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playInterval, setPlayInterval] = useState<NodeJS.Timeout | null>(null);

  const {
    isTransitioning,
    pauseTransition,
    resumeTransition,
    stopTransition,
  } = useSlide();

  // Auto-play functionality
  useEffect(() => {
    if (isPlaying && !isTransitioning) {
      const interval = setInterval(() => {
        if (currentSlideIndex < totalSlides - 1) {
          onNextSlide();
        } else {
          setIsPlaying(false);
        }
      }, 3000); // 3 seconds per slide

      setPlayInterval(interval);
    } else {
      if (playInterval) {
        clearInterval(playInterval);
        setPlayInterval(null);
      }
    }

    return () => {
      if (playInterval) {
        clearInterval(playInterval);
      }
    };
  }, [isPlaying, isTransitioning, currentSlideIndex, totalSlides, onNextSlide, playInterval]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (playInterval) {
        clearInterval(playInterval);
      }
    };
  }, [playInterval]);

  const handlePlayPause = () => {
    if (isTransitioning) {
      if (isPlaying) {
        pauseTransition();
        setIsPlaying(false);
      } else {
        resumeTransition();
        setIsPlaying(true);
      }
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const handleStop = () => {
    setIsPlaying(false);
    stopTransition();
  };

  const handleReset = () => {
    setIsPlaying(false);
    stopTransition();
    onSlideSelect(0);
  };

  const canGoPrevious = currentSlideIndex > 0;
  const canGoNext = currentSlideIndex < totalSlides - 1;

  return (
    <div className={`slide-controls ${className}`}>
      {/* Navigation Controls */}
      <div className="flex items-center space-x-2">
        {/* Previous Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={onPreviousSlide}
          disabled={!canGoPrevious || isTransitioning}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Play/Pause Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handlePlayPause}
          disabled={totalSlides === 0}
          className="h-8 w-8 p-0"
        >
          {isPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </Button>

        {/* Stop Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleStop}
          disabled={!isPlaying && !isTransitioning}
          className="h-8 w-8 p-0"
        >
          <Square className="h-4 w-4" />
        </Button>

        {/* Reset Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
          disabled={currentSlideIndex === 0}
          className="h-8 w-8 p-0"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>

        {/* Next Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={onNextSlide}
          disabled={!canGoNext || isTransitioning}
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Slide Indicator */}
      <div className="flex items-center space-x-2 ml-4">
        <span className="text-sm text-muted-foreground">
          {currentSlideIndex + 1} of {totalSlides}
        </span>
        
        {/* Slide Progress Bar */}
        {totalSlides > 0 && (
          <div className="w-20 h-1 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{
                width: `${((currentSlideIndex + 1) / totalSlides) * 100}%`,
              }}
            />
          </div>
        )}
      </div>

      {/* Slide Selector */}
      {totalSlides > 1 && (
        <div className="flex items-center space-x-1 ml-4">
          {Array.from({ length: totalSlides }, (_, index) => (
            <button
              key={index}
              onClick={() => onSlideSelect(index)}
              disabled={isTransitioning}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentSlideIndex
                  ? 'bg-primary'
                  : 'bg-muted hover:bg-muted-foreground'
              } ${isTransitioning ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              title={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Status Indicator */}
      {isTransitioning && (
        <div className="flex items-center space-x-2 ml-4">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          <span className="text-xs text-muted-foreground">Transitioning...</span>
        </div>
      )}

      {/* Auto-play Indicator */}
      {isPlaying && (
        <div className="flex items-center space-x-2 ml-4">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-xs text-muted-foreground">Auto-playing</span>
        </div>
      )}
    </div>
  );
};
