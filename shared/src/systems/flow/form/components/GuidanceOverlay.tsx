/**
 * GuidanceOverlay - Visual guidance overlay for wizard steps
 * Provides focus ring, tooltips, and visual cues
 */

import React, { useEffect, useState } from 'react';
import { StepGuidance } from '../../types/flow';

export interface GuidanceOverlayProps {
  targetSelector?: string; // CSS selector for element to highlight
  guidance: StepGuidance;
  isActive?: boolean;
}

export const GuidanceOverlay: React.FC<GuidanceOverlayProps> = ({
  targetSelector,
  guidance,
  isActive = true
}) => {
  useEffect(() => {
    if (targetSelector && isActive) {
      const element = document.querySelector(targetSelector) as HTMLElement;

      // Apply focus ring if enabled
      if (element && guidance.focusRing?.enabled) {
        const color = guidance.focusRing.color || 'ring-primary';
        element.classList.add('ring-2', color, 'ring-offset-2', 'rounded-md', 'transition-all');
        
        return () => {
          element.classList.remove('ring-2', color, 'ring-offset-2', 'rounded-md', 'transition-all');
        };
      }
    }
  }, [targetSelector, guidance, isActive]);

  if (!isActive || !guidance.focusRing?.enabled) {
    return null;
  }

  return null; // Visual guidance is applied via class manipulation
};

/**
 * Tooltip Component for field-specific help
 */
export interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'right' | 'bottom' | 'left';
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top'
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2'
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          className={`absolute z-50 px-3 py-2 text-sm text-white bg-gray-900 rounded-md shadow-lg whitespace-nowrap ${positionClasses[position]}`}
        >
          {content}
          {/* Tooltip arrow */}
          <div
            className={`absolute w-2 h-2 bg-gray-900 transform rotate-45 ${
              position === 'top' ? 'bottom-[-4px] left-1/2 -translate-x-1/2' :
              position === 'right' ? 'left-[-4px] top-1/2 -translate-y-1/2' :
              position === 'bottom' ? 'top-[-4px] left-1/2 -translate-x-1/2' :
              'right-[-4px] top-1/2 -translate-y-1/2'
            }`}
          />
        </div>
      )}
    </div>
  );
};

