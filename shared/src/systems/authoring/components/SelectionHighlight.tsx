/**
 * SelectionHighlight - M1 Week 3-4
 * 
 * Visual feedback for selected elements in authoring mode.
 * Adapts highlighting strategy based on scene type.
 * 
 * Based on Spec 04: Authoring Overlay Framework
 * Based on Spec 06: Highlighting Strategies
 */

import React from 'react';
import type { SelectionState } from '../services/SelectionEngine';
import type { SceneType } from '../services/HitTestLayer';

export interface SelectionHighlightProps {
  selection: SelectionState;
  sceneType: SceneType;
  className?: string;
}

export function SelectionHighlight({
  selection,
  sceneType,
  className = ''
}: SelectionHighlightProps) {
  if (!selection) {
    return null;
  }

  const { bounds, targetType } = selection;

  // Calculate position from bounds
  const style: React.CSSProperties = {
    position: 'fixed',
    left: `${bounds.left}px`,
    top: `${bounds.top}px`,
    width: `${bounds.width}px`,
    height: `${bounds.height}px`,
    pointerEvents: 'none',
    zIndex: 1000
  };

  // Choose highlight strategy based on scene type
  const highlightClass = getHighlightClass(sceneType, targetType);

  return (
    <div
      className={`selection-highlight ${highlightClass} ${className}`}
      style={style}
      data-testid="selection-highlight"
      aria-label={`Selected ${targetType}: ${selection.targetId}`}
    >
      {/* Inner border */}
      <div className="selection-highlight__border" />

      {/* Corner indicators (for resize handles later) */}
      <div className="selection-highlight__corners">
        <div className="corner corner--tl" />
        <div className="corner corner--tr" />
        <div className="corner corner--bl" />
        <div className="corner corner--br" />
      </div>
    </div>
  );
}

/**
 * Get highlighting CSS class based on scene type and target type
 * Per Spec 06: Different scene types use different highlight strategies
 */
function getHighlightClass(sceneType: SceneType, targetType: string): string {
  switch (sceneType) {
    case 'card':
      // Card scenes: Full border with subtle shadow
      return 'selection-highlight--card';

    case 'document':
      // Document scenes: Inline text or block highlighting
      return targetType === 'block'
        ? 'selection-highlight--block'
        : 'selection-highlight--text';

    case 'graph':
      // Graph scenes: Glow effect for nodes/edges
      return targetType === 'node'
        ? 'selection-highlight--node'
        : 'selection-highlight--edge';

    case 'video':
      // Video scenes: Timeline clip highlighting
      return 'selection-highlight--clip';

    default:
      return 'selection-highlight--default';
  }
}

// Export default
export default SelectionHighlight;

