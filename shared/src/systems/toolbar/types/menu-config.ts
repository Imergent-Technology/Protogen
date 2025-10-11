/**
 * Menu Configuration Types
 * 
 * Configuration for navigation and context menus
 */

import type { NavigationMenuItem, ContextMenuItem, MenuGroup } from './menu-item';

/**
 * Navigation menu configuration
 */
export interface NavigationMenuConfig {
  id: string;
  name: string;
  position: 'top' | 'left' | 'right' | 'bottom';
  items: NavigationMenuItem[];
  groups?: MenuGroup[];
  collapsible?: boolean;
  defaultExpanded?: boolean;
  style?: {
    variant?: 'default' | 'minimal' | 'sidebar';
    theme?: 'light' | 'dark' | 'auto';
  };
}

/**
 * Context menu configuration
 */
export interface ContextMenuConfig {
  id: string;
  targetType: 'scene' | 'slide' | 'node' | 'edge' | 'element' | 'global';
  items: ContextMenuItem[];
  groups?: MenuGroup[];
  conditions?: ContextMenuCondition[];
}

/**
 * Context menu trigger condition
 */
export interface ContextMenuCondition {
  type: 'permission' | 'state' | 'custom';
  check: string | ((context: any) => boolean);
}

/**
 * Toolbar configuration
 */
export interface ToolbarConfig {
  id: string;
  position: 'top' | 'bottom';
  sections: ToolbarSection[];
  style?: {
    height?: number;
    variant?: 'default' | 'compact' | 'prominent';
    transparent?: boolean;
  };
}

/**
 * Toolbar section (left, center, right)
 */
export interface ToolbarSection {
  id: string;
  position: 'left' | 'center' | 'right';
  items: ToolbarItem[];
}

/**
 * Toolbar item types
 */
export type ToolbarItem =
  | { type: 'menu'; menuId: string; label?: string; icon?: string }
  | { type: 'button'; label?: string; icon: string; action: any; tooltip?: string }
  | { type: 'separator' }
  | { type: 'search'; placeholder?: string }
  | { type: 'breadcrumb' }
  | { type: 'context-indicator' }
  | { type: 'user-menu' }
  | { type: 'notifications'; badgeCount?: number }
  | { type: 'bookmarks' }
  | { type: 'custom'; component: React.ComponentType<any>; props?: Record<string, any> };

