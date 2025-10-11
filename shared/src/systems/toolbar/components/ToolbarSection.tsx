/**
 * ToolbarSection
 * 
 * Renders a section of the toolbar (left, center, or right)
 */

import React from 'react';
import type { ToolbarSection as ToolbarSectionType } from '../types';
import { ToolbarItemRenderer } from './ToolbarItemRenderer';

export interface ToolbarSectionProps {
  section: ToolbarSectionType;
}

export const ToolbarSection: React.FC<ToolbarSectionProps> = ({ section }) => {
  return (
    <>
      {section.items.map((item, index) => (
        <ToolbarItemRenderer key={`${section.id}-item-${index}`} item={item} />
      ))}
    </>
  );
};

export default ToolbarSection;

