/**
 * Menu Item Types
 * 
 * Defines menu items for navigation and context menus
 */

export type MenuItemId = string & { readonly __brand: 'MenuItemId' };

/**
 * Menu action types
 */
export type MenuAction =
  | { type: 'navigate-scene'; sceneId: string; context?: Record<string, any> }
  | { type: 'navigate-context'; contextPath: string; params?: Record<string, any> }
  | { type: 'start-flow'; flowId: string; config?: Record<string, any> }
  | { type: 'open-dialog'; dialogType: string; config: Record<string, any> }
  | { type: 'custom'; handler: string; data?: Record<string, any> }
  | { type: 'external-link'; url: string; newTab?: boolean };

/**
 * Menu item base configuration
 */
export interface BaseMenuItem {
  id: MenuItemId;
  label: string;
  icon?: string;
  order: number;
  disabled?: boolean;
  hidden?: boolean;
  tooltip?: string;
  badge?: {
    count?: number;
    text?: string;
    variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  };
}

/**
 * Navigation menu item
 */
export interface NavigationMenuItem extends BaseMenuItem {
  action: MenuAction;
  permissions?: string[];
  children?: NavigationMenuItem[];
  expanded?: boolean; // For collapsible menu groups
}

/**
 * Context menu item
 */
export interface ContextMenuItem extends BaseMenuItem {
  action: MenuAction;
  separator?: boolean; // Show separator after this item
  shortcut?: string; // Keyboard shortcut display (e.g., "Ctrl+C")
  danger?: boolean; // Destructive action styling
}

/**
 * Menu group for organizing items
 */
export interface MenuGroup {
  id: string;
  label?: string;
  items: NavigationMenuItem[] | ContextMenuItem[];
  collapsible?: boolean;
  expanded?: boolean;
}

/**
 * Menu item click event
 */
export interface MenuItemClickEvent {
  item: NavigationMenuItem | ContextMenuItem;
  action: MenuAction;
  event: React.MouseEvent;
}

