/**
 * ToolbarItemRenderer
 * 
 * Renders individual toolbar items based on type
 */

import React from 'react';
import { Button } from '../../../components';
import { Menu, Search, Bookmark, Bell, User } from 'lucide-react';
import type { ToolbarItem } from '../types';
import { useToolbar } from '../useToolbar';

export interface ToolbarItemRendererProps {
  item: ToolbarItem;
}

export const ToolbarItemRenderer: React.FC<ToolbarItemRendererProps> = ({ item }) => {
  const { toggleNavigationMenu } = useToolbar();

  switch (item.type) {
    case 'menu':
      return (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => toggleNavigationMenu(item.menuId)}
          className="h-8 w-8 p-0"
        >
          {item.icon === 'menu' ? <Menu className="h-4 w-4" /> : null}
          {item.label && <span className="ml-2">{item.label}</span>}
        </Button>
      );

    case 'button':
      return (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => item.action && item.action()}
          title={item.tooltip}
          className="h-8 w-8 p-0"
        >
          {item.icon && <span>{item.icon}</span>}
          {item.label && <span className="ml-2">{item.label}</span>}
        </Button>
      );

    case 'separator':
      return <div className="h-6 w-px bg-border mx-2" />;

    case 'search':
      return (
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder={item.placeholder || 'Search...'}
            className="w-full h-8 pl-10 pr-4 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      );

    case 'breadcrumb':
      return (
        <div className="text-sm text-muted-foreground">
          {/* Breadcrumb will be implemented with Navigator integration */}
          <span>Home / Current Scene</span>
        </div>
      );

    case 'context-indicator':
      return (
        <div className="text-sm font-medium">
          {/* Context indicator will be implemented with Navigator integration */}
          <span>Current Context</span>
        </div>
      );

    case 'bookmarks':
      return (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
        >
          <Bookmark className="h-4 w-4" />
        </Button>
      );

    case 'notifications':
      return (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 relative"
        >
          <Bell className="h-4 w-4" />
          {item.badgeCount && item.badgeCount > 0 && (
            <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center">
              {item.badgeCount > 9 ? '9+' : item.badgeCount}
            </span>
          )}
        </Button>
      );

    case 'user-menu':
      return (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
        >
          <User className="h-4 w-4" />
        </Button>
      );

    case 'custom':
      const CustomComponent = item.component;
      return <CustomComponent {...(item.props || {})} />;

    default:
      return null;
  }
};

export default ToolbarItemRenderer;

