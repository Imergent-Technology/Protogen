/**
 * Toolbar System Types
 * 
 * Export all toolbar type definitions
 */

export * from './menu-item';
export * from './menu-config';

/**
 * Toolbar system state
 */
export interface ToolbarSystemState {
  navigationMenus: Map<string, any>; // MenuId -> NavigationMenuConfig
  contextMenus: Map<string, any>; // MenuId -> ContextMenuConfig
  toolbarConfigs: Map<string, any>; // ToolbarId -> ToolbarConfig
  drawers: Map<string, any>; // DrawerId -> ToolbarDrawer
  openDrawers: Set<string>; // Set of open drawer IDs
  activeContextMenu: string | null;
  activeNavigationMenu: string | null;
}

/**
 * Toolbar system events
 */
export type ToolbarEvent =
  | { type: 'menu-item-clicked'; payload: { itemId: string; action: any } }
  | { type: 'context-menu-opened'; payload: { menuId: string; context: any } }
  | { type: 'context-menu-closed'; payload: { menuId: string } }
  | { type: 'navigation-menu-toggled'; payload: { menuId: string; expanded: boolean } };

