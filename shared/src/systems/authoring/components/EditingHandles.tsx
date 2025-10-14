/**
 * EditingHandles - M1 Week 3-4
 * 
 * Provides resize/move handles for selected elements.
 * Scene-type-aware handle positioning and behavior.
 * 
 * Based on Spec 04: Authoring Overlay Framework
 */

import React from 'react';
import type { SelectionState } from '../services/SelectionEngine';
import type { SceneType } from '../services/HitTestLayer';

export interface EditingHandlesProps {
  selection: SelectionState;
  sceneType: SceneType;
  onResize?: (direction: string, delta: { x: number; y: number }) => void;
  onMove?: (delta: { x: number; y: number }) => void;
  className?: string;
}

export function EditingHandles({
  selection,
  sceneType,
  onResize,
  onMove,
  className = ''
}: EditingHandlesProps) {
  if (!selection) {
    return null;
  }

  const { bounds } = selection;

  // Position handles container
  const style: React.CSSProperties = {
    position: 'fixed',
    left: `${bounds.left}px`,
    top: `${bounds.top}px`,
    width: `${bounds.width}px`,
    height: `${bounds.height}px`,
    pointerEvents: 'none',
    zIndex: 1002 // Above editor
  };

  // Determine which handles to show based on scene type
  const handleConfig = getHandleConfig(sceneType, selection.targetType);

  return (
    <div
      className={`editing-handles ${className}`}
      style={style}
      data-testid="editing-handles"
    >
      {/* Resize handles */}
      {handleConfig.showResize && onResize && (
        <>
          <Handle position="n" onDrag={(delta) => onResize('n', delta)} />
          <Handle position="e" onDrag={(delta) => onResize('e', delta)} />
          <Handle position="s" onDrag={(delta) => onResize('s', delta)} />
          <Handle position="w" onDrag={(delta) => onResize('w', delta)} />
          <Handle position="ne" onDrag={(delta) => onResize('ne', delta)} />
          <Handle position="se" onDrag={(delta) => onResize('se', delta)} />
          <Handle position="sw" onDrag={(delta) => onResize('sw', delta)} />
          <Handle position="nw" onDrag={(delta) => onResize('nw', delta)} />
        </>
      )}

      {/* Move handle (center) */}
      {handleConfig.showMove && onMove && (
        <div
          className="editing-handles__move"
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            cursor: 'move',
            pointerEvents: 'auto'
          }}
          draggable
          onDragStart={(e) => {
            e.dataTransfer.effectAllowed = 'move';
          }}
          onDrag={(e) => {
            if (e.clientX !== 0 && e.clientY !== 0) {
              onMove({ x: e.movementX, y: e.movementY });
            }
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24">
            <path d="M10 9h4V6h3l-5-5-5 5h3v3zm-1 1H6V7l-5 5 5 5v-3h3v-4zm14 2l-5-5v3h-3v4h3v3l5-5zm-9 3h-4v3H7l5 5 5-5h-3v-3z"/>
          </svg>
        </div>
      )}

      {/* Rotation handle (top center) */}
      {handleConfig.showRotate && (
        <div
          className="editing-handles__rotate"
          style={{
            position: 'absolute',
            left: '50%',
            top: '-30px',
            transform: 'translateX(-50%)',
            cursor: 'grab',
            pointerEvents: 'auto'
          }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20">
            <circle cx="10" cy="10" r="8" fill="currentColor"/>
          </svg>
        </div>
      )}
    </div>
  );
}

interface HandleProps {
  position: string;
  onDrag: (delta: { x: number; y: number }) => void;
}

function Handle({ position, onDrag }: HandleProps) {
  const style = getHandleStyle(position);

  return (
    <div
      className={`editing-handle editing-handle--${position}`}
      style={style}
      draggable
      onDrag={(e) => {
        if (e.clientX !== 0 && e.clientY !== 0) {
          onDrag({ x: e.movementX, y: e.movementY });
        }
      }}
      data-position={position}
    />
  );
}

function getHandleStyle(position: string): React.CSSProperties {
  const baseStyle: React.CSSProperties = {
    position: 'absolute',
    width: '8px',
    height: '8px',
    backgroundColor: 'var(--color-primary, #0066cc)',
    border: '1px solid white',
    borderRadius: '50%',
    pointerEvents: 'auto',
    cursor: getCursor(position)
  };

  // Position mapping
  const positions: Record<string, React.CSSProperties> = {
    n: { left: '50%', top: '-4px', transform: 'translateX(-50%)' },
    e: { right: '-4px', top: '50%', transform: 'translateY(-50%)' },
    s: { left: '50%', bottom: '-4px', transform: 'translateX(-50%)' },
    w: { left: '-4px', top: '50%', transform: 'translateY(-50%)' },
    ne: { right: '-4px', top: '-4px' },
    se: { right: '-4px', bottom: '-4px' },
    sw: { left: '-4px', bottom: '-4px' },
    nw: { left: '-4px', top: '-4px' }
  };

  return { ...baseStyle, ...positions[position] };
}

function getCursor(position: string): string {
  const cursors: Record<string, string> = {
    n: 'ns-resize',
    e: 'ew-resize',
    s: 'ns-resize',
    w: 'ew-resize',
    ne: 'nesw-resize',
    se: 'nwse-resize',
    sw: 'nesw-resize',
    nw: 'nwse-resize'
  };

  return cursors[position] || 'default';
}

interface HandleConfig {
  showResize: boolean;
  showMove: boolean;
  showRotate: boolean;
}

function getHandleConfig(sceneType: SceneType, targetType: string): HandleConfig {
  switch (sceneType) {
    case 'card':
      // Card scenes: Resize and move for slides
      return {
        showResize: false, // Slides are fixed size in M1
        showMove: targetType === 'slide', // Can reorder slides
        showRotate: false
      };

    case 'document':
      // Document scenes: No handles for blocks (inline editing only)
      return {
        showResize: false,
        showMove: false,
        showRotate: false
      };

    case 'graph':
      // Graph scenes: Move nodes, no resize
      return {
        showResize: false,
        showMove: targetType === 'node',
        showRotate: false
      };

    case 'video':
      // Video scenes: Resize clips on timeline
      return {
        showResize: targetType === 'edge', // Edge handles for clip duration
        showMove: true,
        showRotate: false
      };

    default:
      return {
        showResize: false,
        showMove: false,
        showRotate: false
      };
  }
}

// Export default
export default EditingHandles;

