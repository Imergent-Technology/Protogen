/**
 * Slide Animator
 * 
 * Component for animating slide entrance and exit transitions using Framer Motion.
 * Supports fade, slide, and expand animations with configurable parameters.
 */

import React from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import type { SlideAnimation, NavigationDirection, Slide } from './types';
import { getEasingValue } from './animationPresets';

interface SlideAnimatorProps {
  slide: Slide;
  direction: NavigationDirection;
  entranceAnimation: SlideAnimation;
  exitAnimation: SlideAnimation;
  children: React.ReactNode;
}

/**
 * Get Framer Motion variants for a slide animation
 */
function getAnimationVariants(
  animation: SlideAnimation,
  type: 'entrance' | 'exit',
  direction: NavigationDirection
): Variants {
  const isForward = direction === 'forward';
  
  switch (animation.type) {
    case 'fade':
      return {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
      };
    
    case 'slide': {
      const distance = animation.distance === 'edge' ? '100%' : '50px';
      const slideDirection = animation.direction || 'right';
      
      let enterX: number | string = 0;
      let enterY: number | string = 0;
      let exitX: number | string = 0;
      let exitY: number | string = 0;
      
      // Calculate entrance position
      if (type === 'entrance') {
        switch (slideDirection) {
          case 'left':
            enterX = isForward ? distance : `-${distance}`;
            break;
          case 'right':
            enterX = isForward ? distance : `-${distance}`;
            break;
          case 'top':
            enterY = isForward ? distance : `-${distance}`;
            break;
          case 'bottom':
            enterY = isForward ? distance : `-${distance}`;
            break;
        }
      } else {
        // Exit position
        switch (slideDirection) {
          case 'left':
            exitX = isForward ? `-${distance}` : distance;
            break;
          case 'right':
            exitX = isForward ? `-${distance}` : distance;
            break;
          case 'top':
            exitY = isForward ? `-${distance}` : distance;
            break;
          case 'bottom':
            exitY = isForward ? `-${distance}` : distance;
            break;
        }
      }
      
      return {
        initial: { x: enterX, y: enterY, opacity: 0 },
        animate: { x: 0, y: 0, opacity: 1 },
        exit: { x: exitX, y: exitY, opacity: 0 },
      };
    }
    
    case 'expand': {
      const expandDirection = animation.direction || 'center';
      
      if (expandDirection === 'center') {
        return {
          initial: { scale: 0, opacity: 0 },
          animate: { scale: 1, opacity: 1 },
          exit: { scale: 0.8, opacity: 0 },
        };
      } else {
        // Expand from direction (corner/edge)
        const originMap: Record<string, string> = {
          left: '0% 50%',
          right: '100% 50%',
          top: '50% 0%',
          bottom: '50% 100%',
        };
        
        return {
          initial: { 
            scale: 0, 
            opacity: 0,
            transformOrigin: originMap[expandDirection] || '50% 50%',
          },
          animate: { 
            scale: 1, 
            opacity: 1,
            transformOrigin: originMap[expandDirection] || '50% 50%',
          },
          exit: { 
            scale: 0.5, 
            opacity: 0,
            transformOrigin: originMap[expandDirection] || '50% 50%',
          },
        };
      }
    }
    
    default:
      // Fallback to fade
      return {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
      };
  }
}

/**
 * SlideAnimator Component
 * 
 * Wraps slide content with entrance/exit animations.
 */
export const SlideAnimator: React.FC<SlideAnimatorProps> = ({
  slide,
  direction,
  entranceAnimation,
  exitAnimation,
  children,
}) => {
  // Combine entrance and exit variants
  const variants: Variants = {
    initial: getAnimationVariants(entranceAnimation, 'entrance', direction).initial,
    animate: getAnimationVariants(entranceAnimation, 'entrance', direction).animate,
    exit: getAnimationVariants(exitAnimation, 'exit', direction).exit,
  };
  
  // Calculate transition timing
  const transition = {
    duration: entranceAnimation.duration / 1000, // Convert ms to seconds
    ease: getEasingValue(entranceAnimation.easing),
  };
  
  const _exitTransition = {
    duration: exitAnimation.duration / 1000,
    ease: getEasingValue(exitAnimation.easing),
  };
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`slide-${slide.id}-${slide.slide_index}`}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={transition as any}
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

/**
 * Get system default animation
 */
export function getSystemDefaultAnimation(): { entrance: SlideAnimation; exit: SlideAnimation } {
  return {
    entrance: {
      type: 'fade',
      duration: 300,
      easing: 'ease-in',
    },
    exit: {
      type: 'fade',
      duration: 300,
      easing: 'ease-out',
    },
  };
}

