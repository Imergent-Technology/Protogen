import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit, Copy, Trash2, Eye, EyeOff, Settings, ExternalLink, Share, Layers, Play, Pause, Volume2, VolumeX } from 'lucide-react';

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
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

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
          left: position.x,
          top: position.y,
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

// Hook for managing context menu state
export function useContextMenu() {
  const [contextMenu, setContextMenu] = useState<{
    isOpen: boolean;
    position: { x: number; y: number };
    items: ContextMenuItem[];
  }>({
    isOpen: false,
    position: { x: 0, y: 0 },
    items: []
  });

  const showContextMenu = (event: React.MouseEvent, items: ContextMenuItem[]) => {
    event.preventDefault();
    setContextMenu({
      isOpen: true,
      position: { x: event.clientX, y: event.clientY },
      items
    });
  };

  const hideContextMenu = () => {
    setContextMenu(prev => ({ ...prev, isOpen: false }));
  };

  return {
    contextMenu,
    showContextMenu,
    hideContextMenu
  };
}

// Scene context menu interface
export interface SceneContextMenuActions {
  onEditBasicDetails?: () => void;
  onEditDesign?: () => void;
  onPreview?: () => void;
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
