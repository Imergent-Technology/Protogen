/**
 * ToolbarContainer
 * 
 * Root container for toolbar with sections (left, center, right)
 */

import React from 'react';
import { useToolbarConfig } from '../useToolbar';
import { ToolbarSection } from './ToolbarSection';
import type { ToolbarSection as ToolbarSectionType } from '../types';

export interface ToolbarContainerProps {
  toolbarId: string;
  className?: string;
}

export const ToolbarContainer: React.FC<ToolbarContainerProps> = ({
  toolbarId,
  className = ''
}) => {
  const config = useToolbarConfig(toolbarId);

  if (!config) {
    return null;
  }

  const positionClasses: Record<string, string> = {
    top: 'top-0',
    bottom: 'bottom-0'
  };

  const variantClasses: Record<string, string> = {
    default: 'bg-background border-b',
    compact: 'bg-background border-b h-12',
    prominent: 'bg-background border-b h-16 shadow-sm'
  };

  const variant: string = config.style?.variant || 'default';
  const transparent = config.style?.transparent ? 'bg-transparent border-none' : '';

  return (
    <div
      className={`
        fixed left-0 right-0 z-40 
        ${positionClasses[config.position]}
        ${variantClasses[variant]}
        ${transparent}
        ${className}
      `}
      style={{ height: config.style?.height }}
    >
      <div className="container mx-auto h-full">
        <div className="flex items-center justify-between h-full px-4">
          {/* Left section */}
          <div className="flex items-center space-x-2">
            {config.sections
              .filter((s: ToolbarSectionType) => s.position === 'left')
              .map((section: ToolbarSectionType) => (
                <ToolbarSection key={section.id} section={section} />
              ))}
          </div>

          {/* Center section */}
          <div className="flex items-center space-x-2 flex-1 justify-center max-w-2xl">
            {config.sections
              .filter((s: ToolbarSectionType) => s.position === 'center')
              .map((section: ToolbarSectionType) => (
                <ToolbarSection key={section.id} section={section} />
              ))}
          </div>

          {/* Right section */}
          <div className="flex items-center space-x-2">
            {config.sections
              .filter((s: ToolbarSectionType) => s.position === 'right')
              .map((section: ToolbarSectionType) => (
                <ToolbarSection key={section.id} section={section} />
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToolbarContainer;

