import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit, Copy, Trash2, Eye, EyeOff, Settings, ExternalLink, Share, Layers } from 'lucide-react';

interface ContextMenuItem {
  id: string;
  label?: string;
  icon?: React.ReactNode;
  action?: () => void;
  disabled?: boolean;
  divider?: boolean;
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
                 className={`w-full flex items-center space-x-3 px-4 py-2 text-sm hover:bg-muted transition-colors ${
                   item.disabled ? 'text-muted-foreground cursor-not-allowed' : 'text-foreground'
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

// Predefined context menu items for scenes
export const getSceneContextMenuItems = (
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
    action: onDelete
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
