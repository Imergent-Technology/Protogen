/**
 * Menu Configuration Types
 * 
 * Configuration for navigation and context menus
 */

import type { NavigationMenuItem, ContextMenuItem, MenuGroup, MenuAction } from './menu-item';

/**
 * Menu display mode
 */
export type MenuDisplayMode = 'drawer' | 'popover';

/**
 * Toolbar position (three-position layout)
 */
export type ToolbarPosition = 'start' | 'middle' | 'end';

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
 * Toolbar drawer configuration
 */
export interface ToolbarDrawer {
  id: string;
  edge: 'left' | 'right' | 'top' | 'bottom';
  width?: string;
  height?: string;
  overlay?: boolean;
  closeOnClickOutside?: boolean;
  items: DrawerItem[];
}

/**
 * Drawer item
 */
export interface DrawerItem {
  type: 'nav-item' | 'section-header' | 'separator' | 'user-info';
  label?: string;
  icon?: string;
  active?: boolean;
  action?: MenuAction;
  items?: DrawerItem[];
}

/**
 * Toolbar configuration
 */
export interface ToolbarConfig {
  id: string;
  edge?: 'top' | 'bottom' | 'left' | 'right';
  sections: ToolbarSection[];
  style?: {
    height?: string;
    variant?: 'default' | 'compact' | 'prominent';
    transparent?: boolean;
  };
}

/**
 * Toolbar section (start, middle, end)
 */
export interface ToolbarSection {
  id: string;
  position: ToolbarPosition;
  items: ToolbarItem[];
  responsive?: {
    collapseThreshold?: string;
    overflowBehavior?: 'hide' | 'collapse' | 'overflow-menu';
  };
}

/**
 * Toolbar item
 */
export interface ToolbarItem {
  id: string;
  type: 'button' | 'menu-button' | 'separator' | 'search' | 'notifications' | 'user-menu' | 'context-indicator' | 'widget' | 'custom';
  label?: string;
  icon?: string;
  badge?: {
    count?: number;
    text?: string;
    variant?: 'default' | 'danger' | 'warning';
  };
  action?: MenuAction;
  subMenu?: {
    displayMode: MenuDisplayMode;
    menuId: string;
  };
  // Widget configuration (when type === 'widget')
  widget?: {
    type: string; // Widget type ID from registry
    data?: Record<string, any>; // Data passed to widget
  };
  responsive?: {
    hideOnMobile?: boolean;
    collapseToIcon?: boolean;
    priority?: number;
  };
}

