import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit, Copy, Trash2, Eye, EyeOff, Settings, ExternalLink, Share, Layers, Play, Pause, Volume2, VolumeX, Link } from 'lucide-react';

export interface ContextMenuItem {
  id: string;
  label?: string;
  icon?: React.ReactNode;
  action?: () => void;
  disabled?: boolean;
  divider?: boolean;
  variant?: 'default' | 'destructive';
}

interface ContextMenuProps {
  items: ContextMenuItem[];
  isOpen: boolean;
  onClose: () => void;
  position: { x: number; y: number };
}

export function ContextMenu({ items, isOpen, onClose, position }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [adjustedPosition, setAdjustedPosition] = useState(position);

  // Calculate optimal position considering screen edges
  const calculateOptimalPosition = (originalPosition: { x: number; y: number }) => {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Estimate menu dimensions (will be refined after render)
    const estimatedMenuWidth = 200;
    const estimatedMenuHeight = 300;
    
    let x = originalPosition.x;
    let y = originalPosition.y;
    
    // Check horizontal boundaries
    if (x + estimatedMenuWidth > viewportWidth) {
      // Flip to the left side of the cursor
      x = originalPosition.x - estimatedMenuWidth;
      // If still out of bounds, adjust to viewport edge
      if (x < 0) {
        x = viewportWidth - estimatedMenuWidth - 10; // 10px margin from edge
      }
    }
    
    // Check vertical boundaries
    if (y + estimatedMenuHeight > viewportHeight) {
      // Flip to the top side of the cursor
      y = originalPosition.y - estimatedMenuHeight;
      // If still out of bounds, adjust to viewport edge
      if (y < 0) {
        y = viewportHeight - estimatedMenuHeight - 10; // 10px margin from edge
      }
    }
    
    // Ensure minimum margins from edges
    x = Math.max(10, Math.min(x, viewportWidth - estimatedMenuWidth - 10));
    y = Math.max(10, Math.min(y, viewportHeight - estimatedMenuHeight - 10));
    
    return { x, y };
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
      
      // Calculate initial optimal position
      const optimalPosition = calculateOptimalPosition(position);
      setAdjustedPosition(optimalPosition);
      
      // Refine position after menu is rendered with actual dimensions
      const refinePosition = () => {
        if (menuRef.current) {
          const menuRect = menuRef.current.getBoundingClientRect();
          const viewportWidth = window.innerWidth;
          const viewportHeight = window.innerHeight;
          
          let x = position.x;
          let y = position.y;
          
          // Check horizontal boundaries with actual dimensions
          if (x + menuRect.width > viewportWidth) {
            x = position.x - menuRect.width;
            if (x < 0) {
              x = viewportWidth - menuRect.width - 10;
            }
          }
          
          // Check vertical boundaries with actual dimensions
          if (y + menuRect.height > viewportHeight) {
            y = position.y - menuRect.height;
            if (y < 0) {
              y = viewportHeight - menuRect.height - 10;
            }
          }
          
          // Ensure minimum margins from edges
          x = Math.max(10, Math.min(x, viewportWidth - menuRect.width - 10));
          y = Math.max(10, Math.min(y, viewportHeight - menuRect.height - 10));
          
          setAdjustedPosition({ x, y });
        }
      };
      
      // Refine position after a short delay to allow menu to render
      setTimeout(refinePosition, 10);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose, position]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        ref={menuRef}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.1 }}
        className="fixed z-50 min-w-[200px] bg-background border border-border rounded-lg shadow-lg py-1"
        style={{
          left: adjustedPosition.x,
          top: adjustedPosition.y,
        }}
      >
                 {items.map((item) => (
           <React.Fragment key={item.id}>
                         {item.divider ? (
               <div className="border-t border-border my-1" />
             ) : (
               <button
                 onClick={() => {
                   if (!item.disabled && item.action) {
                     item.action();
                     onClose();
                   }
                 }}
                 disabled={item.disabled}
                 className={`w-full flex items-center space-x-3 px-4 py-2 text-sm transition-colors ${
                   item.disabled 
                     ? 'text-muted-foreground cursor-not-allowed' 
                     : item.variant === 'destructive'
                       ? 'text-destructive hover:bg-destructive hover:text-destructive-foreground'
                       : 'text-foreground hover:bg-muted'
                 }`}
               >
                 {item.icon && <span className="w-4 h-4">{item.icon}</span>}
                 <span>{item.label}</span>
               </button>
             )}
          </React.Fragment>
        ))}
      </motion.div>
    </AnimatePresence>
  );
}

// Hook for managing context menu state with selection
export function useContextMenu() {
  const [contextMenu, setContextMenu] = useState<{
    isOpen: boolean;
    position: { x: number; y: number };
    items: ContextMenuItem[];
    selectedEntityId?: string;
  }>({
    isOpen: false,
    position: { x: 0, y: 0 },
    items: [],
    selectedEntityId: undefined
  });

  const showContextMenu = (event: React.MouseEvent, items: ContextMenuItem[], entityId?: string) => {
    event.preventDefault();
    setContextMenu({
      isOpen: true,
      position: { x: event.clientX, y: event.clientY },
      items,
      selectedEntityId: entityId
    });
  };

  const hideContextMenu = () => {
    setContextMenu(prev => ({ ...prev, isOpen: false, selectedEntityId: undefined }));
  };

  return {
    contextMenu,
    showContextMenu,
    hideContextMenu
  };
}

// Utility function to get selection styling classes
export function getSelectionClasses(isSelected: boolean, baseClasses: string = '') {
  if (!isSelected) return baseClasses;
  
  const selectionClasses = 'ring-2 ring-primary ring-offset-2 ring-offset-background';
  return `${baseClasses} ${selectionClasses}`.trim();
}

// Utility function to get selection styling classes for list items
export function getListSelectionClasses(isSelected: boolean, baseClasses: string = '') {
  if (!isSelected) return baseClasses;
  
  const selectionClasses = 'ring-2 ring-primary ring-offset-2 ring-offset-background bg-primary/5';
  return `${baseClasses} ${selectionClasses}`.trim();
}

// Scene context menu interface
export interface SceneContextMenuActions {
  onEditBasicDetails?: () => void;
  onEditDesign?: () => void;
  onPreview?: () => void;
  onLinkToDeck?: () => void;
  onToggleActive?: () => void;
  onTogglePublic?: () => void;
  onDelete?: () => void;
}

// Deck context menu interface
export interface DeckContextMenuActions {
  onEdit?: () => void;
  onPreview?: () => void;
  onLinkToScene?: () => void;
  onToggleActive?: () => void;
  onTogglePublic?: () => void;
  onDelete?: () => void;
}

// Predefined context menu items for scenes
export const getSceneContextMenuItems = (
  scene: any,
  actions: SceneContextMenuActions
): ContextMenuItem[] => {
  const items: ContextMenuItem[] = [];

  // Edit options
  if (actions.onEditBasicDetails) {
    items.push({
      id: 'edit-basic',
      label: 'Edit Basic Details',
      icon: <Edit className="w-4 h-4" />,
      action: actions.onEditBasicDetails
    });
  }

  if (actions.onEditDesign) {
    items.push({
      id: 'edit-design',
      label: 'Edit Design',
      icon: <Settings className="w-4 h-4" />,
      action: actions.onEditDesign
    });
  }

  if (actions.onPreview) {
    items.push({
      id: 'preview',
      label: 'Preview',
      icon: <Eye className="w-4 h-4" />,
      action: actions.onPreview
    });
  }

  if (actions.onLinkToDeck) {
    items.push({
      id: 'link-to-deck',
      label: 'Link to Deck',
      icon: <Link className="w-4 h-4" />,
      action: actions.onLinkToDeck
    });
  }

  // Add divider if we have edit options
  if (items.length > 0) {
    items.push({ id: 'divider1', divider: true });
  }

  // Status toggle options
  if (actions.onToggleActive) {
    items.push({
      id: 'toggle-active',
      label: scene?.isActive ? 'Deactivate' : 'Activate',
      icon: scene?.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />,
      action: actions.onToggleActive
    });
  }

  if (actions.onTogglePublic) {
    items.push({
      id: 'toggle-public',
      label: scene?.isPublic ? 'Make Private' : 'Make Public',
      icon: scene?.isPublic ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />,
      action: actions.onTogglePublic
    });
  }

  // Add divider before destructive action
  if (actions.onDelete) {
    items.push({ id: 'divider2', divider: true });
    items.push({
      id: 'delete',
      label: 'Delete Scene',
      icon: <Trash2 className="w-4 h-4" />,
      action: actions.onDelete,
      variant: 'destructive'
    });
  }

  return items;
};

// Predefined context menu items for decks
export const getDeckContextMenuItems = (
  deck: any,
  actions: DeckContextMenuActions
): ContextMenuItem[] => {
  const items: ContextMenuItem[] = [];

  // Edit option
  if (actions.onEdit) {
    items.push({
      id: 'edit',
      label: 'Edit Deck',
      icon: <Edit className="w-4 h-4" />,
      action: actions.onEdit
    });
  }

  if (actions.onPreview) {
    items.push({
      id: 'preview',
      label: 'Preview',
      icon: <Eye className="w-4 h-4" />,
      action: actions.onPreview
    });
  }

  if (actions.onLinkToScene) {
    items.push({
      id: 'link-to-scene',
      label: 'Link to Scene',
      icon: <Link className="w-4 h-4" />,
      action: actions.onLinkToScene
    });
  }

  // Add divider if we have edit options
  if (items.length > 0) {
    items.push({ id: 'divider1', divider: true });
  }

  // Status toggle options
  if (actions.onToggleActive) {
    items.push({
      id: 'toggle-active',
      label: deck?.isActive ? 'Deactivate' : 'Activate',
      icon: deck?.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />,
      action: actions.onToggleActive
    });
  }

  if (actions.onTogglePublic) {
    items.push({
      id: 'toggle-public',
      label: deck?.isPublic ? 'Make Private' : 'Make Public',
      icon: deck?.isPublic ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />,
      action: actions.onTogglePublic
    });
  }

  // Add divider before destructive action
  if (actions.onDelete) {
    items.push({ id: 'divider2', divider: true });
    items.push({
      id: 'delete',
      label: 'Delete Deck',
      icon: <Trash2 className="w-4 h-4" />,
      action: actions.onDelete,
      variant: 'destructive'
    });
  }

  return items;
};

// Legacy scene context menu items (keeping for backward compatibility)
export const getLegacySceneContextMenuItems = (
  scene: any,
  onEdit: () => void,
  onDelete: () => void,
  onPublish: () => void,
  onUnpublish: () => void,
  onCopy: () => void,
  onShare: () => void,
  onTypeManager?: () => void
): ContextMenuItem[] => [
  {
    id: 'edit',
    label: 'Edit Stage',
    icon: <Edit className="w-4 h-4" />,
    action: onEdit
  },
  {
    id: 'copy',
    label: 'Copy Stage',
    icon: <Copy className="w-4 h-4" />,
    action: onCopy
  },
  {
    id: 'divider1',
    divider: true
  },
  {
    id: 'publish',
    label: scene?.is_active ? 'Unpublish' : 'Publish',
    icon: scene?.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />,
    action: scene?.is_active ? onUnpublish : onPublish
  },
  {
    id: 'share',
    label: 'Share Stage',
    icon: <Share className="w-4 h-4" />,
    action: onShare
  },
  {
    id: 'divider2',
    divider: true
  },
  {
    id: 'settings',
    label: 'Stage Settings',
    icon: <Settings className="w-4 h-4" />,
    action: onEdit
  },
  {
    id: 'type-manager',
    label: 'Type Manager',
    icon: <Layers className="w-4 h-4" />,
    action: onTypeManager,
    disabled: !onTypeManager
  },
  {
    id: 'divider3',
    divider: true
  },
  {
    id: 'delete',
    label: 'Delete Stage',
    icon: <Trash2 className="w-4 h-4" />,
    action: onDelete,
    variant: 'destructive'
  }
];

// Predefined context menu items for navigation
export const getNavigationContextMenuItems = (
  onRefresh: () => void,
  onCollapseAll: () => void,
  onExpandAll: () => void
): ContextMenuItem[] => [
  {
    id: 'refresh',
    label: 'Refresh',
    icon: <ExternalLink className="w-4 h-4" />,
    action: onRefresh
  },
  {
    id: 'divider1',
    divider: true
  },
  {
    id: 'collapse',
    label: 'Collapse All',
    icon: <EyeOff className="w-4 h-4" />,
    action: onCollapseAll
  },
  {
    id: 'expand',
    label: 'Expand All',
    icon: <Eye className="w-4 h-4" />,
    action: onExpandAll
  }
];

// Graph node context menu interface
export interface GraphNodeContextMenuActions {
  onEdit?: () => void;
  onDelete?: () => void;
  onConnect?: () => void;
  onViewDetails?: () => void;
  onCopy?: () => void;
  onMove?: () => void;
}

// Predefined context menu items for graph nodes
export const getGraphNodeContextMenuItems = (
  _node: any,
  actions: GraphNodeContextMenuActions
): ContextMenuItem[] => {
  const items: ContextMenuItem[] = [];

  // Primary actions
  if (actions.onEdit) {
    items.push({
      id: 'edit',
      label: 'Edit Node',
      icon: <Edit className="w-4 h-4" />,
      action: actions.onEdit
    });
  }

  if (actions.onViewDetails) {
    items.push({
      id: 'view-details',
      label: 'View Details',
      icon: <Eye className="w-4 h-4" />,
      action: actions.onViewDetails
    });
  }

  if (actions.onConnect) {
    items.push({
      id: 'connect',
      label: 'Connect to Node',
      icon: <Link className="w-4 h-4" />,
      action: actions.onConnect
    });
  }

  // Add divider if we have primary actions
  if (items.length > 0) {
    items.push({ id: 'divider1', divider: true });
  }

  // Secondary actions
  if (actions.onCopy) {
    items.push({
      id: 'copy',
      label: 'Copy Node',
      icon: <Copy className="w-4 h-4" />,
      action: actions.onCopy
    });
  }

  if (actions.onMove) {
    items.push({
      id: 'move',
      label: 'Move Node',
      icon: <Settings className="w-4 h-4" />,
      action: actions.onMove
    });
  }

  // Add divider before destructive action
  if (actions.onDelete) {
    items.push({ id: 'divider2', divider: true });
    items.push({
      id: 'delete',
      label: 'Delete Node',
      icon: <Trash2 className="w-4 h-4" />,
      action: actions.onDelete,
      variant: 'destructive'
    });
  }

  return items;
};
