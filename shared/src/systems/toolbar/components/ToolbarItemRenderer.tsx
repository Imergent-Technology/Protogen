/**
 * ToolbarItemRenderer
 * 
 * Renders individual toolbar items based on type
 */

import React from 'react';
import { Button } from '../../../components';
import { Menu, Search, Bookmark, Bell, User } from 'lucide-react';
import type { ToolbarItem } from '../types';
import { toolbarSystem } from '../ToolbarSystem';

export interface ToolbarItemRendererProps {
  item: ToolbarItem;
}

export const ToolbarItemRenderer: React.FC<ToolbarItemRendererProps> = ({ item }) => {
  const handleAction = () => {
    if (!item.action) return;
    
    // Handle different action types
    if (item.action.type === 'custom' && item.action.handler) {
      // Call the custom handler directly
      item.action.handler();
    } else {
      // Emit the action for other systems to handle
      toolbarSystem.emit('menu-action', { action: item.action });
    }
  };

  // Render icon based on string name
  const renderIcon = (iconName?: string) => {
    if (!iconName) return null;
    
    switch (iconName) {
      case 'menu':
        return <Menu className="h-4 w-4" />;
      case 'search':
        return <Search className="h-4 w-4" />;
      case 'bell':
      case 'notifications':
        return <Bell className="h-4 w-4" />;
      case 'user':
        return <User className="h-4 w-4" />;
      case 'bookmark':
        return <Bookmark className="h-4 w-4" />;
      default:
        return <span>{iconName}</span>;
    }
  };

  switch (item.type) {
    case 'button':
    case 'menu-button':
      return (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleAction}
          className="h-8 w-8 p-0 relative"
        >
          {renderIcon(item.icon)}
          {item.label && <span className="ml-2">{item.label}</span>}
          {item.badge && (item.badge.count ?? 0) > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center">
              {(item.badge.count ?? 0) > 9 ? '9+' : item.badge.count}
            </span>
          )}
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
            placeholder="Search..."
            className="w-full h-8 pl-10 pr-4 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      );

    case 'context-indicator':
      return (
        <div className="text-sm font-medium px-3">
          {item.label || 'Current Context'}
        </div>
      );

    case 'notifications':
      return (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleAction}
          className="h-8 w-8 p-0 relative"
        >
          <Bell className="h-4 w-4" />
          {item.badge && (item.badge.count ?? 0) > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center">
              {(item.badge.count ?? 0) > 9 ? '9+' : item.badge.count}
            </span>
          )}
        </Button>
      );

    case 'user-menu':
      return (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleAction}
          className="h-8 w-8 p-0"
        >
          <User className="h-4 w-4" />
        </Button>
      );

    case 'custom':
      // Custom components not yet implemented
      return null;

    default:
      return null;
  }
};

export default ToolbarItemRenderer;
