/**
 * ContextMenu
 * 
 * Right-click context menu component
 */

import React, { useEffect, useRef } from 'react';
import { useContextMenu, useToolbar, useFilteredMenuItems, useIsContextMenuActive } from '../useToolbar';
import type { ContextMenuItem, MenuItemClickEvent } from '../types';

export interface ContextMenuProps {
  menuId: string;
  position: { x: number; y: number };
  context?: any;
  userPermissions?: string[];
  onItemClick?: (event: MenuItemClickEvent) => void;
  onClose?: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  menuId,
  position,
  context: _context,
  userPermissions = [],
  onItemClick,
  onClose
}) => {
  const menu = useContextMenu(menuId);
  const { handleMenuItemClick, closeContextMenu } = useToolbar();
  const isActive = useIsContextMenuActive(menuId);
  const menuRef = useRef<HTMLDivElement>(null);
  const filteredItems = useFilteredMenuItems(menu?.items || [], userPermissions);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        closeContextMenu();
        onClose?.();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeContextMenu();
        onClose?.();
      }
    };

    if (isActive) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isActive, closeContextMenu, onClose]);

  if (!menu || !isActive) {
    return null;
  }

  const handleClick = (item: ContextMenuItem, event: React.MouseEvent) => {
    event.stopPropagation();

    const clickEvent: MenuItemClickEvent = {
      item,
      action: item.action,
      event
    };

    if (onItemClick) {
      onItemClick(clickEvent);
    } else {
      handleMenuItemClick(clickEvent);
    }

    closeContextMenu();
    onClose?.();
  };

  return (
    <div
      ref={menuRef}
      className="fixed z-50 min-w-[200px] bg-popover border rounded-md shadow-md py-1"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`
      }}
    >
      {filteredItems.map((item, index) => (
        <React.Fragment key={item.id}>
          <button
            onClick={(e) => handleClick(item, e)}
            disabled={item.disabled}
            className={`
              w-full flex items-center justify-between px-3 py-2 text-sm
              transition-colors text-left
              ${item.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-accent cursor-pointer'}
              ${'danger' in item && item.danger ? 'text-destructive hover:bg-destructive/10' : ''}
            `}
            title={item.tooltip}
          >
            <div className="flex items-center space-x-2 flex-1">
              {item.icon && <span className="text-muted-foreground">{item.icon}</span>}
              <span>{item.label}</span>
            </div>
            {'shortcut' in item && item.shortcut && (
              <span className="text-xs text-muted-foreground ml-4">{item.shortcut}</span>
            )}
          </button>
          {'separator' in item && item.separator && index < filteredItems.length - 1 && (
            <div className="my-1 h-px bg-border" />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default ContextMenu;

