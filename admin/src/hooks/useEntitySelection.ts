import { useState, useCallback } from 'react';

export interface EntitySelectionState {
  selectedEntityId: string | null;
  isSelected: (entityId: string) => boolean;
  selectEntity: (entityId: string) => void;
  clearSelection: () => void;
}

/**
 * Hook for managing entity selection state
 * Provides a consistent way to track which entity is currently selected
 * and apply selection styling across different components
 */
export function useEntitySelection(): EntitySelectionState {
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);

  const isSelected = useCallback((entityId: string) => {
    return selectedEntityId === entityId;
  }, [selectedEntityId]);

  const selectEntity = useCallback((entityId: string) => {
    setSelectedEntityId(entityId);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedEntityId(null);
  }, []);

  return {
    selectedEntityId,
    isSelected,
    selectEntity,
    clearSelection
  };
}

/**
 * Hook for managing entity selection with context menu integration
 * Combines entity selection with context menu state for seamless UX
 */
export function useEntitySelectionWithContextMenu() {
  const selection = useEntitySelection();
  
  const handleContextMenuOpen = useCallback((entityId: string) => {
    selection.selectEntity(entityId);
  }, [selection]);

  const handleContextMenuClose = useCallback(() => {
    selection.clearSelection();
  }, [selection]);

  return {
    ...selection,
    handleContextMenuOpen,
    handleContextMenuClose
  };
}
