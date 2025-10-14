/**
 * InlineEditor - M1 Week 3-4
 * 
 * Provides inline editing capabilities for selected elements.
 * Scene-type-aware editors (text, rich text, properties).
 * 
 * Based on Spec 04: Authoring Overlay Framework
 */

import React, { useState, useEffect, useRef } from 'react';
import type { SelectionState } from '../services/SelectionEngine';
import type { SceneType } from '../services/HitTestLayer';

export interface InlineEditorProps {
  selection: SelectionState;
  sceneType: SceneType;
  onSave: (value: string) => void;
  onCancel: () => void;
  className?: string;
}

export function InlineEditor({
  selection,
  sceneType,
  onSave,
  onCancel,
  className = ''
}: InlineEditorProps) {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLTextAreaElement | HTMLInputElement>(null);

  // Initialize value from selection metadata
  useEffect(() => {
    const initialValue = selection.metadata.text || selection.metadata.content || '';
    setValue(initialValue);

    // Focus input when editor mounts
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 0);
  }, [selection]);

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && sceneType !== 'document') {
      // Save on Enter (except in document mode where Enter creates new lines)
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      // Cancel on Escape
      e.preventDefault();
      onCancel();
    }
  };

  const handleSave = () => {
    onSave(value);
  };

  const handleBlur = () => {
    // Auto-save on blur
    handleSave();
  };

  const { bounds } = selection;

  // Position editor over selected element
  const style: React.CSSProperties = {
    position: 'fixed',
    left: `${bounds.left}px`,
    top: `${bounds.top}px`,
    width: `${bounds.width}px`,
    minHeight: `${bounds.height}px`,
    zIndex: 1001 // Above selection highlight
  };

  // Choose editor type based on scene type and target type
  const editorType = getEditorType(sceneType, selection.targetType);

  return (
    <div
      className={`inline-editor inline-editor--${editorType} ${className}`}
      style={style}
      data-testid="inline-editor"
    >
      {editorType === 'multiline' ? (
        <textarea
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          className="inline-editor__textarea"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          rows={3}
          placeholder="Enter text..."
        />
      ) : (
        <input
          ref={inputRef as React.RefObject<HTMLInputElement>}
          className="inline-editor__input"
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          placeholder="Enter text..."
        />
      )}

      {/* Action buttons */}
      <div className="inline-editor__actions">
        <button
          className="inline-editor__button inline-editor__button--save"
          onClick={handleSave}
          type="button"
        >
          Save
        </button>
        <button
          className="inline-editor__button inline-editor__button--cancel"
          onClick={onCancel}
          type="button"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

/**
 * Determine editor type based on scene type and target type
 */
function getEditorType(sceneType: SceneType, targetType: string): 'simple' | 'multiline' | 'rich' {
  switch (sceneType) {
    case 'card':
      // Card scenes: Simple or multiline text
      return targetType === 'slide' ? 'multiline' : 'simple';

    case 'document':
      // Document scenes: Rich text editor for blocks
      return 'rich'; // Will integrate TipTap in M2

    case 'graph':
      // Graph scenes: Simple text for node labels
      return 'simple';

    case 'video':
      // Video scenes: Simple text for clip titles
      return 'simple';

    default:
      return 'simple';
  }
}

// Export default
export default InlineEditor;

