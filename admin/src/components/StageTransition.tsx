import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Stage } from '@progress/shared';

interface StageTransitionProps {
  children: React.ReactNode;
  stage: Stage | null;
  direction?: 'forward' | 'backward' | 'up' | 'down';
  isVisible: boolean;
}

const transitionVariants = {
  // Forward transition (entering from right)
  forward: {
    initial: { x: '100%', opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: '-100%', opacity: 0 }
  },
  // Backward transition (entering from left)
  backward: {
    initial: { x: '-100%', opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: '100%', opacity: 0 }
  },
  // Up transition (entering from bottom)
  up: {
    initial: { y: '100%', opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: '-100%', opacity: 0 }
  },
  // Down transition (entering from top)
  down: {
    initial: { y: '-100%', opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: '100%', opacity: 0 }
  },
  // Zoom in transition (for admin stage)
  zoomIn: {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 1.2, opacity: 0 }
  }
};

export function StageTransition({
  children,
  stage,
  direction = 'forward',
  isVisible
}: StageTransitionProps) {
  const getTransitionType = () => {
    if (!stage) return 'zoomIn';
    
    // Determine transition type based on stage type or context
    switch (stage.type) {
      case 'graph':
        return 'up'; // Graph stages zoom up from below
      default:
        return direction;
    }
  };

  const transitionType = getTransitionType();
  const variants = transitionVariants[transitionType as keyof typeof transitionVariants] || transitionVariants.forward;

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          key={stage?.id || 'admin'}
          initial="initial"
          animate="animate"
          exit="exit"
          variants={variants}
          transition={{
            duration: 0.5,
            ease: [0.4, 0.0, 0.2, 1], // Custom easing for smooth motion
            staggerChildren: 0.1
          }}
          className="w-full h-full"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Enhanced stage content wrapper with staggered animations
export function StageContentWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.6,
        delay: 0.2,
        ease: [0.4, 0.0, 0.2, 1]
      }}
      className="w-full h-full"
    >
      {children}
    </motion.div>
  );
}

// Toolbar animation wrapper
export function ToolbarWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{
        duration: 0.4,
        ease: [0.4, 0.0, 0.2, 1]
      }}
      className="w-full"
    >
      {children}
    </motion.div>
  );
}
