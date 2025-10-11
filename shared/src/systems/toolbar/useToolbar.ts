/**
 * useToolbar Hook
 * 
 * React hooks for Toolbar System
 */

import { useState, useEffect, useCallback } from 'react';
import { toolbarSystem } from './ToolbarSystem';
import type {
  ToolbarSystemState,
  NavigationMenuItem,
  ContextMenuItem,
  MenuItemClickEvent,
  MenuAction
} from './types';

/**
 * Main toolbar hook
 */
export function useToolbar() {
  const handleMenuItemClick = useCallback((event: MenuItemClickEvent) => {
    toolbarSystem.handleMenuItemClick(event);
  }, []);

  const openContextMenu = useCallback((menuId: string, context: any, position: { x: number; y: number }) => {
    toolbarSystem.openContextMenu(menuId, context, position);
  }, []);

  const closeContextMenu = useCallback(() => {
    toolbarSystem.closeContextMenu();
  }, []);

  const toggleNavigationMenu = useCallback((menuId: string) => {
    toolbarSystem.toggleNavigationMenu(menuId);
  }, []);

  return {
    handleMenuItemClick,
    openContextMenu,
    closeContextMenu,
    toggleNavigationMenu,
    getNavigationMenu: (id: string) => toolbarSystem.getNavigationMenu(id),
    getContextMenu: (id: string) => toolbarSystem.getContextMenu(id),
    getToolbarConfig: (id: string) => toolbarSystem.getToolbarConfig(id)
  };
}

/**
 * Subscribe to toolbar system state
 */
export function useToolbarState() {
  const [state, setState] = useState<ToolbarSystemState>(() => toolbarSystem.getState());

  useEffect(() => {
    const unsubscribe = toolbarSystem.subscribe(setState);
    return unsubscribe;
  }, []);

  return state;
}

/**
 * Get navigation menu hook
 */
export function useNavigationMenu(menuId: string) {
  const state = useToolbarState();
  return state.navigationMenus.get(menuId);
}

/**
 * Get context menu hook
 */
export function useContextMenu(menuId: string) {
  const state = useToolbarState();
  return state.contextMenus.get(menuId);
}

/**
 * Get toolbar config hook
 */
export function useToolbarConfig(toolbarId: string) {
  const state = useToolbarState();
  return state.toolbarConfigs.get(toolbarId);
}

/**
 * Check if context menu is active
 */
export function useIsContextMenuActive(menuId: string): boolean {
  const state = useToolbarState();
  return state.activeContextMenu === menuId;
}

/**
 * Check if navigation menu is active
 */
export function useIsNavigationMenuActive(menuId: string): boolean {
  const state = useToolbarState();
  return state.activeNavigationMenu === menuId;
}

/**
 * Hook for handling menu actions with integration to Navigator and Dialog systems
 */
export function useMenuActions() {
  const handleAction = useCallback((action: MenuAction, context?: any) => {
    // Emit action event that will be handled by App-level integration
    (toolbarSystem as any).emit('menu-action', { action, context });
  }, []);

  return { handleAction };
}

/**
 * Hook for filtering menu items based on user permissions
 */
export function useFilteredMenuItems<T extends NavigationMenuItem | ContextMenuItem>(
  items: T[],
  userPermissions: string[]
): T[] {
  return toolbarSystem.filterMenuItems(items, userPermissions);
}

