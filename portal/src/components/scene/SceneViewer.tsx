/**
 * Scene Viewer Component
 * 
 * Displays a scene with its slides and handles navigation.
 */

import React, { useEffect } from 'react';
import { Card, CardContent, Button } from '@protogen/shared';
import { ChevronLeft, ChevronRight, Play, Pause, RotateCcw } from 'lucide-react';
import { useScene, SlideAnimator } from '../../systems/scene';
import type { NavigationDirection } from '../../systems/scene';

interface SceneViewerProps {
  sceneId: number | string;
  className?: string;
}

export const SceneViewer: React.FC<SceneViewerProps> = ({ sceneId, className }) => {
  const {
    currentScene,
    currentSlide,
    currentSlideIndex,
    slideCount,
    isLoading,
    isAnimating,
    loadScene,
    nextSlide,
    previousSlide,
    reset,
    canGoNext,
    canGoPrevious,
    getSlideEntranceAnimation,
    getSlideExitAnimation,
  } = useScene();

  // Load scene on mount
  useEffect(() => {
    if (sceneId) {
      loadScene(sceneId);
    }
  }, [sceneId, loadScene]);

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-8 text-center">
          <div className="animate-pulse">Loading scene...</div>
        </CardContent>
      </Card>
    );
  }

  if (!currentScene) {
    return (
      <Card className={className}>
        <CardContent className="p-8 text-center text-muted-foreground">
          No scene loaded
        </CardContent>
      </Card>
    );
  }

  if (slideCount === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-8 text-center text-muted-foreground">
          <p>This scene has no slides.</p>
          <p className="text-sm mt-2">Add slides to see them here.</p>
        </CardContent>
      </Card>
    );
  }

  const direction: NavigationDirection = 'forward'; // Could be determined by navigation history

  return (
    <div className={className}>
      {/* Scene Container */}
      <Card className="mb-4">
        <CardContent className="p-0 relative" style={{ minHeight: '400px' }}>
          {currentSlide && (
            <SlideAnimator
              slide={currentSlide}
              direction={direction}
              entranceAnimation={getSlideEntranceAnimation(currentSlide)}
              exitAnimation={getSlideExitAnimation(currentSlide)}
            >
              <div className="p-8">
                <h2 className="text-2xl font-bold mb-4">{currentSlide.name}</h2>
                {currentSlide.description && (
                  <p className="text-muted-foreground mb-6">{currentSlide.description}</p>
                )}
                
                {/* Slide Content */}
                <div className="space-y-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm">Slide {currentSlideIndex + 1} of {slideCount}</p>
                  </div>
                  
                  {/* Slide Items would render here */}
                  <div className="text-sm text-muted-foreground">
                    Scene items and content will render here
                  </div>
                </div>
              </div>
            </SlideAnimator>
          )}
        </CardContent>
      </Card>

      {/* Navigation Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <Button
              size="sm"
              variant="outline"
              onClick={previousSlide}
              disabled={!canGoPrevious || isAnimating}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">
                {currentSlideIndex + 1} / {slideCount}
              </span>
              <Button
                size="sm"
                variant="ghost"
                onClick={reset}
                disabled={isAnimating || currentSlideIndex === 0}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={nextSlide}
              disabled={!canGoNext || isAnimating}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="h-1 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{
                  width: `${((currentSlideIndex + 1) / slideCount) * 100}%`,
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

