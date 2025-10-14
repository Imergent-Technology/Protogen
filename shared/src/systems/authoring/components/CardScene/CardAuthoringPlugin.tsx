/**
 * CardAuthoringPlugin - M1 Week 7-8
 * 
 * Authoring plugin for Card scenes.
 * Handles slide creation, editing, deletion, and reordering.
 * Integrates with AuthoringOverlay and SelectionEngine.
 * 
 * Based on Spec 09: Card Scene Type
 */

import React, { useState, useCallback } from 'react';
import { selectionEngine } from '../../services/SelectionEngine';
import { AuthoringOverlay } from '../AuthoringOverlay';
import type { CardScene, CardSlideUnion, SlideKind } from '../../types/card-scene';

export interface CardAuthoringPluginProps {
  scene: CardScene;
  onSlideCreate?: (kind: SlideKind, order: number) => void;
  onSlideUpdate?: (slideId: string, updates: Partial<CardSlideUnion>) => void;
  onSlideDelete?: (slideId: string) => void;
  onSlideReorder?: (slideId: string, newOrder: number) => void;
  className?: string;
}

export function CardAuthoringPlugin({
  scene,
  onSlideCreate,
  onSlideUpdate,
  onSlideDelete,
  onSlideReorder,
  className = ''
}: CardAuthoringPluginProps) {
  const [contextMenuOpen, setContextMenuOpen] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });

  // Handle right-click for context menu
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();

    const selection = selectionEngine.getSelection();

    setContextMenuPosition({ x: e.clientX, y: e.clientY });
    setContextMenuOpen(true);
  }, []);

  // Create new slide
  const createSlide = useCallback((kind: SlideKind) => {
    if (onSlideCreate) {
      const newOrder = scene.slides.length;
      onSlideCreate(kind, newOrder);
    }

    setContextMenuOpen(false);
  }, [scene.slides.length, onSlideCreate]);

  // Update slide
  const updateSlide = useCallback((slideId: string, updates: Partial<CardSlideUnion>) => {
    if (onSlideUpdate) {
      onSlideUpdate(slideId, updates);
    }
  }, [onSlideUpdate]);

  // Delete slide
  const deleteSlide = useCallback((slideId: string) => {
    if (confirm('Are you sure you want to delete this slide?')) {
      if (onSlideDelete) {
        onSlideDelete(slideId);
      }
    }

    setContextMenuOpen(false);
  }, [onSlideDelete]);

  // Reorder slide
  const reorderSlide = useCallback((slideId: string, newOrder: number) => {
    if (onSlideReorder) {
      onSlideReorder(slideId, newOrder);
    }
  }, [onSlideReorder]);

  return (
    <div
      className={`card-authoring-plugin ${className}`}
      onContextMenu={handleContextMenu}
    >
      {/* Authoring overlay for hit testing and selection */}
      <AuthoringOverlay
        sceneId={scene.id}
        sceneType="card"
      />

      {/* Context menu */}
      {contextMenuOpen && (
        <CardContextMenu
          position={contextMenuPosition}
          onClose={() => setContextMenuOpen(false)}
          onCreateSlide={createSlide}
          onDeleteSlide={(slideId) => deleteSlide(slideId)}
          selection={selectionEngine.getSelection()}
        />
      )}
    </div>
  );
}

// Context menu component
interface CardContextMenuProps {
  position: { x: number; y: number };
  onClose: () => void;
  onCreateSlide: (kind: SlideKind) => void;
  onDeleteSlide: (slideId: string) => void;
  selection: any;
}

function CardContextMenu({
  position,
  onClose,
  onCreateSlide,
  onDeleteSlide,
  selection
}: CardContextMenuProps) {
  const style: React.CSSProperties = {
    position: 'fixed',
    left: `${position.x}px`,
    top: `${position.y}px`,
    zIndex: 2000
  };

  return (
    <div
      className="card-context-menu"
      style={style}
      onMouseLeave={onClose}
    >
      {selection ? (
        // Actions for selected slide
        <>
          <button onClick={() => { /* Edit */ onClose(); }}>
            Edit Slide
          </button>
          <button onClick={() => { onDeleteSlide(selection.targetId); }}>
            Delete Slide
          </button>
        </>
      ) : (
        // Actions for blank space (create new slide)
        <>
          <button onClick={() => onCreateSlide('text')}>
            Add Text Slide (T)
          </button>
          <button onClick={() => onCreateSlide('image')}>
            Add Image Slide (I)
          </button>
          <button onClick={() => onCreateSlide('layered')}>
            Add Layered Slide (L)
          </button>
        </>
      )}
    </div>
  );
}

// Export default
export default CardAuthoringPlugin;

