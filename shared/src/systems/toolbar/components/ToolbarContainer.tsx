/**
 * ToolbarContainer
 * 
 * Root container for toolbar with sections (start, middle, end) on any edge
 */

import React from 'react';
import { useToolbarConfig } from '../useToolbar';
import { ToolbarSection } from './ToolbarSection';
import type { ToolbarSection as ToolbarSectionType } from '../types';

export interface ToolbarContainerProps {
  toolbarId: string;
  edge?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export const ToolbarContainer: React.FC<ToolbarContainerProps> = ({
  toolbarId,
  edge = 'top',
  className = ''
}) => {
  const config = useToolbarConfig(toolbarId);

  if (!config) {
    return null;
  }

  const isHorizontal = edge === 'top' || edge === 'bottom';
  
  const startItems = config.sections.filter((s: ToolbarSectionType) => s.position === 'start');
  const middleItems = config.sections.filter((s: ToolbarSectionType) => s.position === 'middle');
  const endItems = config.sections.filter((s: ToolbarSectionType) => s.position === 'end');

  return (
    <div
      className={`
        fixed z-40 bg-card border-border
        ${edge === 'top' && 'top-0 left-0 right-0 h-14 border-b'}
        ${edge === 'bottom' && 'bottom-0 left-0 right-0 h-14 border-t'}
        ${edge === 'left' && 'left-0 top-0 bottom-0 w-16 border-r'}
        ${edge === 'right' && 'right-0 top-0 bottom-0 w-16 border-l'}
        ${className}
      `}
      style={{
        height: config.style?.height,
      }}
    >
      <div className={`
        h-full w-full flex gap-4 px-4
        ${isHorizontal ? 'flex-row' : 'flex-col py-4'}
      `}>
        {/* Start Section */}
        <div className={`flex gap-2 ${isHorizontal ? 'justify-start' : 'items-start'}`}>
          {startItems.map((section: ToolbarSectionType) => (
            <ToolbarSection key={section.id} section={section} />
          ))}
        </div>
        
        {/* Middle Section - grows to fill space */}
        <div className={`flex-1 flex gap-2 ${isHorizontal ? 'justify-center' : 'items-center'}`}>
          {middleItems.map((section: ToolbarSectionType) => (
            <ToolbarSection key={section.id} section={section} />
          ))}
        </div>
        
        {/* End Section */}
        <div className={`flex gap-2 ${isHorizontal ? 'justify-end' : 'items-end'}`}>
          {endItems.map((section: ToolbarSectionType) => (
            <ToolbarSection key={section.id} section={section} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ToolbarContainer;

