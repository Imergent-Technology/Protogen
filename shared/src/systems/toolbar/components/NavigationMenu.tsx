/**
 * NavigationMenu
 * 
 * Renders navigation menu with items and actions
 */

import React from 'react';
import { useNavigationMenu, useToolbar, useFilteredMenuItems } from '../useToolbar';
import type { NavigationMenuItem, MenuItemClickEvent } from '../types';
import { ChevronRight, ChevronDown } from 'lucide-react';

export interface NavigationMenuProps {
  menuId: string;
  userPermissions?: string[];
  onItemClick?: (event: MenuItemClickEvent) => void;
}

export const NavigationMenu: React.FC<NavigationMenuProps> = ({
  menuId,
  userPermissions = [],
  onItemClick
}) => {
  const menu = useNavigationMenu(menuId);
  const { handleMenuItemClick } = useToolbar();
  const filteredItems = useFilteredMenuItems(menu?.items || [], userPermissions);

  if (!menu) {
    return null;
  }

  const handleClick = (item: NavigationMenuItem, event: React.MouseEvent) => {
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
  };

  return (
    <nav className="navigation-menu">
      <ul className="space-y-1">
        {filteredItems.map(item => (
          <NavigationMenuItem
            key={item.id}
            item={item}
            onClick={handleClick}
            userPermissions={userPermissions}
          />
        ))}
      </ul>
    </nav>
  );
};

interface NavigationMenuItemProps {
  item: NavigationMenuItem;
  onClick: (item: NavigationMenuItem, event: React.MouseEvent) => void;
  userPermissions: string[];
  depth?: number;
}

const NavigationMenuItem: React.FC<NavigationMenuItemProps> = ({
  item,
  onClick,
  userPermissions,
  depth = 0
}) => {
  const [expanded, setExpanded] = React.useState(item.expanded || false);
  const hasChildren = item.children && item.children.length > 0;

  const handleClick = (e: React.MouseEvent) => {
    if (hasChildren) {
      setExpanded(!expanded);
    } else {
      onClick(item, e);
    }
  };

  return (
    <li>
      <button
        onClick={handleClick}
        disabled={item.disabled}
        className={`
          w-full flex items-center justify-between px-3 py-2 text-sm rounded-md
          transition-colors
          ${item.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-accent cursor-pointer'}
          ${depth > 0 ? `ml-${depth * 4}` : ''}
        `}
        style={{ paddingLeft: `${depth * 16 + 12}px` }}
        title={item.tooltip}
      >
        <div className="flex items-center space-x-2">
          {item.icon && <span className="text-muted-foreground">{item.icon}</span>}
          <span>{item.label}</span>
          {item.badge && (
            <span
              className={`
                px-2 py-0.5 text-xs rounded-full
                ${item.badge.variant === 'primary' ? 'bg-primary text-primary-foreground' : ''}
                ${item.badge.variant === 'success' ? 'bg-green-500 text-white' : ''}
                ${item.badge.variant === 'warning' ? 'bg-yellow-500 text-white' : ''}
                ${item.badge.variant === 'danger' ? 'bg-destructive text-destructive-foreground' : ''}
                ${!item.badge.variant || item.badge.variant === 'default' ? 'bg-muted text-muted-foreground' : ''}
              `}
            >
              {item.badge.text || item.badge.count}
            </span>
          )}
        </div>
        {hasChildren && (
          expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
        )}
      </button>

      {hasChildren && expanded && (
        <ul className="mt-1 space-y-1">
          {item.children!.map(child => (
            <NavigationMenuItem
              key={child.id}
              item={child}
              onClick={onClick}
              userPermissions={userPermissions}
              depth={depth + 1}
            />
          ))}
        </ul>
      )}
    </li>
  );
};

export default NavigationMenu;

