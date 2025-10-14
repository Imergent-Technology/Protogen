/**
 * AuthoringOverlay - M1 Week 3-4
 * 
 * Main authoring overlay component that coordinates all authoring UI.
 * Only renders in author mode.
 * Scene-type-aware.
 * 
 * Based on Spec 04: Authoring Overlay Framework
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigator } from '../../navigator/useNavigator';
import { selectionEngine } from '../services/SelectionEngine';
import { hitTestLayer } from '../services/HitTestLayer';
import type { SelectionState } from '../services/SelectionEngine';
import type { SceneType, Point } from '../services/HitTestLayer';
import SelectionHighlight from './SelectionHighlight';
import InlineEditor from './InlineEditor';
import EditingHandles from './EditingHandles';

export interface AuthoringOverlayProps {
  sceneId: string;
  sceneType: SceneType;
  className?: string;
}

export function AuthoringOverlay({
  sceneId,
  sceneType,
  className = ''
}: AuthoringOverlayProps) {
  const { mode } = useNavigator();
  const [selection, setSelection] = useState<SelectionState | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Only render in author mode
  if (mode !== 'author') {
    return null;
  }

  // Subscribe to selection changes
  useEffect(() => {
    const handleSelectionChanged = (payload: any) => {
      setSelection(payload.selection);
      setIsEditing(false); // Exit editing mode on new selection
    };

    selectionEngine.on('selection-changed', handleSelectionChanged);

    return () => {
      selectionEngine.off('selection-changed', handleSelectionChanged);
    };
  }, []);

  // Handle click for selection
  const handleClick = useCallback((event: React.MouseEvent) => {
    // Don't process clicks on the overlay itself
    if (event.target === overlayRef.current) {
      return;
    }

    const point: Point = {
      x: event.clientX,
      y: event.clientY
    };

    const result = hitTestLayer.hitTest(point, sceneType);

    if (result) {
      selectionEngine.select(result);
    } else {
      selectionEngine.deselect();
    }
  }, [sceneType]);

  // Handle double-click to start editing
  const handleDoubleClick = useCallback((event: React.MouseEvent) => {
    if (selection) {
      event.preventDefault();
      setIsEditing(true);
    }
  }, [selection]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Delete selected item
      if (event.key === 'Delete' && selection && !isEditing) {
        // TODO: Implement delete in M1 Week 7-8
        console.log('Delete selected:', selection.targetId);
      }

      // Enter edit mode
      if (event.key === 'Enter' && selection && !isEditing) {
        event.preventDefault();
        setIsEditing(true);
      }

      // Escape to deselect
      if (event.key === 'Escape') {
        if (isEditing) {
          setIsEditing(false);
        } else {
          selectionEngine.deselect();
        }
      }

      // Multi-select with Cmd/Ctrl
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'a') {
        event.preventDefault();
        selectionEngine.setMode('multi');
        // TODO: Select all items in M1 Week 7-8
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selection, isEditing]);

  // Save inline edit
  const handleSave = useCallback((value: string) => {
    if (selection) {
      // TODO: Implement save in M1 Week 7-8
      console.log('Save:', selection.targetId, value);
      setIsEditing(false);
    }
  }, [selection]);

  // Cancel inline edit
  const handleCancel = useCallback(() => {
    setIsEditing(false);
  }, []);

  // Handle resize
  const handleResize = useCallback((direction: string, delta: { x: number; y: number }) => {
    if (selection) {
      // TODO: Implement resize in M1 Week 7-8
      console.log('Resize:', direction, delta);
    }
  }, [selection]);

  // Handle move
  const handleMove = useCallback((delta: { x: number; y: number }) => {
    if (selection) {
      // TODO: Implement move in M1 Week 7-8
      console.log('Move:', delta);
    }
  }, [selection]);

  return (
    <div
      ref={overlayRef}
      className={`authoring-overlay authoring-overlay--${sceneType} ${className}`}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      data-scene-id={sceneId}
      data-testid="authoring-overlay"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'auto',
        zIndex: 999
      }}
    >
      {/* Selection highlight */}
      {selection && !isEditing && (
        <SelectionHighlight
          selection={selection}
          sceneType={sceneType}
        />
      )}

      {/* Editing handles */}
      {selection && !isEditing && (
        <EditingHandles
          selection={selection}
          sceneType={sceneType}
          onResize={handleResize}
          onMove={handleMove}
        />
      )}

      {/* Inline editor */}
      {selection && isEditing && (
        <InlineEditor
          selection={selection}
          sceneType={sceneType}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}

      {/* Context menu trigger (will be added in Spec 05) */}
      {/* TODO: Implement ContextMenuTrigger in Week 4 */}
    </div>
  );
}

// Export default
export default AuthoringOverlay;

