/**
 * SlideContainer Component
 * 
 * Main container component for displaying slides and managing slide content.
 * Handles slide rendering, transitions, and node state management.
 */

import React, { useEffect, useRef, useState } from 'react';
import { useSlide } from '@protogen/shared/systems/slide/useSlide';
import { SlideContainerProps, NodeSlideState } from '@protogen/shared/systems/slide/types';
import { TweeningUtils } from '@protogen/shared/systems/slide/TweeningSystem';

export const SlideContainer: React.FC<SlideContainerProps> = ({
  slideId,
  sceneId,
  className = '',
  style = {},
  onSlideChange,
  onTransitionStart,
  onTransitionComplete,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionProgress, setTransitionProgress] = useState(0);

  const {
    currentSlide,
    isTransitioning: systemTransitioning,
    transitionProgress: systemProgress,
    navigateToSlide,
  } = useSlide();

  // Handle slide changes
  useEffect(() => {
    if (currentSlide && currentSlide.id === slideId) {
      onSlideChange?.(slideId);
    }
  }, [currentSlide, slideId, onSlideChange]);

  // Handle transition state
  useEffect(() => {
    setIsTransitioning(systemTransitioning);
    setTransitionProgress(systemProgress);
  }, [systemTransitioning, systemProgress]);

  // Handle transition events
  useEffect(() => {
    if (isTransitioning && transitionProgress === 0) {
      onTransitionStart?.(currentSlide?.id || '', slideId);
    }
    
    if (!isTransitioning && transitionProgress === 1) {
      onTransitionComplete?.(slideId);
    }
  }, [isTransitioning, transitionProgress, slideId, currentSlide, onTransitionStart, onTransitionComplete]);

  // Render node states
  const renderNodeStates = (nodeStates: NodeSlideState[]) => {
    return nodeStates.map((nodeState) => {
      const nodeElement = containerRef.current?.querySelector(`[data-node-id="${nodeState.nodeId}"]`) as HTMLElement;
      
      if (nodeElement) {
        // Apply node state styles
        nodeElement.style.transform = `
          translate(${nodeState.position.x}px, ${nodeState.position.y}px)
          scale(${nodeState.scale.x}, ${nodeState.scale.y})
          rotate(${nodeState.rotation}deg)
        `;
        nodeElement.style.opacity = nodeState.opacity.toString();
        nodeElement.style.visibility = nodeState.visible ? 'visible' : 'hidden';
        
        // Apply custom styles
        if (nodeState.style) {
          Object.entries(nodeState.style).forEach(([key, value]) => {
            nodeElement.style.setProperty(key, value);
          });
        }
      }

      return (
        <div
          key={nodeState.nodeId}
          data-node-id={nodeState.nodeId}
          className="slide-node"
          style={{
            position: 'absolute',
            transform: `
              translate(${nodeState.position.x}px, ${nodeState.position.y}px)
              scale(${nodeState.scale.x}, ${nodeState.scale.y})
              rotate(${nodeState.rotation}deg)
            `,
            opacity: nodeState.opacity,
            visibility: nodeState.visible ? 'visible' : 'hidden',
            transition: isTransitioning ? 'none' : 'all 0.3s ease',
            ...nodeState.style,
          }}
        >
          {/* Node content will be rendered here by the scene system */}
        </div>
      );
    });
  };

  // Handle slide navigation
  const handleSlideNavigation = async (targetSlideId: string) => {
    if (targetSlideId !== slideId) {
      await navigateToSlide(targetSlideId);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`slide-container ${className}`}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        ...style,
      }}
      data-slide-id={slideId}
      data-scene-id={sceneId}
    >
      {/* Slide Content */}
      {currentSlide && currentSlide.id === slideId && (
        <div className="slide-content">
          {renderNodeStates(currentSlide.nodeStates)}
        </div>
      )}

      {/* Transition Overlay */}
      {isTransitioning && (
        <div
          className="slide-transition-overlay"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.1)',
            pointerEvents: 'none',
            opacity: transitionProgress,
          }}
        />
      )}

      {/* Slide Loading State */}
      {!currentSlide && (
        <div className="slide-loading">
          <div className="loading-spinner">Loading slide...</div>
        </div>
      )}
    </div>
  );
};
