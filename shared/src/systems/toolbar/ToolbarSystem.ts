/**
 * ToolbarSystem
 * 
 * Core system class for toolbar and menu management
 */

import type { 
  ToolbarSystemState, 
  NavigationMenuItem, 
  ContextMenuItem, 
  MenuItemClickEvent,
  ToolbarPosition,
  ToolbarItem,
  ToolbarDrawer
} from './types';
import { menuConfigService } from './services/MenuConfigService';

type EventListener = (...args: any[]) => void;

export interface ToolbarPlugin {
  systemId: string;
  initialize: (toolbar: ToolbarSystem) => void | Promise<void>;
  getToolbarItems?: (position: ToolbarPosition) => ToolbarItem[];
  getMenuItems?: (menuId: string) => NavigationMenuItem[];
  cleanup?: () => void;
}

export class ToolbarSystem {
  private state: ToolbarSystemState = {
    navigationMenus: new Map(),
    contextMenus: new Map(),
    toolbarConfigs: new Map(),
    drawers: new Map(),
    openDrawers: new Set(),
    activeContextMenu: null,
    activeNavigationMenu: null
  };

  private subscribers: Set<(state: ToolbarSystemState) => void> = new Set();
  private eventListeners: Map<string, Set<EventListener>> = new Map();
  private plugins: Map<string, ToolbarPlugin> = new Map();

  constructor() {
    // Simple event emitter initialization
  }

  /**
   * Add event listener
   */
  on(event: string, listener: EventListener): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(listener);
  }

  /**
   * Remove event listener
   */
  off(event: string, listener: EventListener): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(listener);
    }
  }

  /**
   * Emit event
   */
  emit(event: string, ...args: any[]): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(listener => listener(...args));
    }
  }

  /**
   * Initialize toolbar system
   */
  async initialize(apiUrl?: string): Promise<void> {
    if (apiUrl) {
      await menuConfigService.loadConfiguration(apiUrl);
    } else {
      menuConfigService.loadDefaultConfiguration();
    }

    // Load configurations into state
    this.reloadConfigurations();
  }

  /**
   * Reload configurations from service
   */
  reloadConfigurations(): void {
    const navMenus = menuConfigService.getAllNavigationMenus();
    const contextMenus = menuConfigService.getAllContextMenus();
    const toolbarConfigs = menuConfigService.getAllToolbarConfigs();

    navMenus.forEach(menu => {
      this.state.navigationMenus.set(menu.id, menu);
    });

    contextMenus.forEach(menu => {
      this.state.contextMenus.set(menu.id, menu);
    });

    toolbarConfigs.forEach(config => {
      this.state.toolbarConfigs.set(config.id, config);
    });

    this.notifySubscribers();
  }

  /**
   * Handle menu item click
   */
  handleMenuItemClick(event: MenuItemClickEvent): void {
    const { item, action } = event;

    // Emit event
    this.emit('menu-item-clicked', { itemId: item.id, action });

    // Handle action (delegated to consumers via event)
    // Consumers (e.g., Navigator, Dialog System) listen to this event
  }

  /**
   * Open context menu
   */
  openContextMenu(menuId: string, context: any, position: { x: number; y: number }): void {
    this.state.activeContextMenu = menuId;
    this.notifySubscribers();

    this.emit('context-menu-opened', { menuId, context, position });
  }

  /**
   * Close context menu
   */
  closeContextMenu(): void {
    if (this.state.activeContextMenu) {
      const menuId = this.state.activeContextMenu;
      this.state.activeContextMenu = null;
      this.notifySubscribers();

      this.emit('context-menu-closed', { menuId });
    }
  }

  /**
   * Toggle navigation menu
   */
  toggleNavigationMenu(menuId: string): void {
    const currentlyActive = this.state.activeNavigationMenu === menuId;
    this.state.activeNavigationMenu = currentlyActive ? null : menuId;
    this.notifySubscribers();

    this.emit('navigation-menu-toggled', { menuId, expanded: !currentlyActive });
  }

  /**
   * Get navigation menu by ID
   */
  getNavigationMenu(id: string) {
    return this.state.navigationMenus.get(id);
  }

  /**
   * Get context menu by ID
   */
  getContextMenu(id: string) {
    return this.state.contextMenus.get(id);
  }

  /**
   * Get toolbar config by ID
   */
  getToolbarConfig(id: string) {
    return this.state.toolbarConfigs.get(id);
  }

  /**
   * Get current state
   */
  getState(): ToolbarSystemState {
    return { ...this.state };
  }

  /**
   * Subscribe to state changes
   */
  subscribe(callback: (state: ToolbarSystemState) => void): () => void {
    this.subscribers.add(callback);
    return () => {
      this.subscribers.delete(callback);
    };
  }

  /**
   * Notify subscribers of state changes
   */
  private notifySubscribers(): void {
    this.subscribers.forEach(callback => {
      callback(this.getState());
    });
  }

  /**
   * Check if menu item is visible based on permissions
   */
  isMenuItemVisible(item: NavigationMenuItem | ContextMenuItem, userPermissions: string[]): boolean {
    if (!('permissions' in item) || !item.permissions || item.permissions.length === 0) {
      return true;
    }

    // Check if user has at least one of the required permissions
    return item.permissions.some(permission => userPermissions.includes(permission));
  }

  /**
   * Filter menu items based on permissions and visibility
   */
  filterMenuItems<T extends NavigationMenuItem | ContextMenuItem>(
    items: T[],
    userPermissions: string[]
  ): T[] {
    return items
      .filter(item => {
        if (item.hidden) return false;
        return this.isMenuItemVisible(item, userPermissions);
      })
      .map(item => {
        // Recursively filter children for navigation menu items
        if ('children' in item && item.children) {
          return {
            ...item,
            children: this.filterMenuItems(item.children, userPermissions)
          };
        }
        return item;
      });
  }

  // ========== Plugin System ==========

  /**
   * Register a plugin
   */
  registerPlugin(plugin: ToolbarPlugin): void {
    this.plugins.set(plugin.systemId, plugin);
    plugin.initialize(this);
  }

  /**
   * Unregister a plugin
   */
  unregisterPlugin(systemId: string): void {
    const plugin = this.plugins.get(systemId);
    plugin?.cleanup?.();
    this.plugins.delete(systemId);
  }

  /**
   * Inject toolbar item at runtime
   */
  injectToolbarItem(toolbarId: string, position: ToolbarPosition, item: ToolbarItem): void {
    const config = this.state.toolbarConfigs.get(toolbarId);
    if (!config) return;

    const section = config.sections.find((s: any) => s.position === position);
    if (section) {
      section.items.push(item);
      this.notifySubscribers();
    }
  }

  /**
   * Inject menu item at runtime
   */
  injectMenuItem(menuId: string, item: NavigationMenuItem): void {
    const menu = this.state.navigationMenus.get(menuId) || this.state.contextMenus.get(menuId);
    if (menu) {
      menu.items.push(item);
      this.notifySubscribers();
    }
  }

  // ========== Drawer Management ==========

  /**
   * Register a drawer
   */
  registerDrawer(drawer: ToolbarDrawer): void {
    this.state.drawers.set(drawer.id, drawer);
    this.notifySubscribers();
  }

  /**
   * Toggle drawer open/closed
   */
  toggleDrawer(drawerId: string): void {
    if (this.state.openDrawers.has(drawerId)) {
      this.closeDrawer(drawerId);
    } else {
      this.openDrawer(drawerId);
    }
  }

  /**
   * Open drawer
   */
  openDrawer(drawerId: string): void {
    this.state.openDrawers.add(drawerId);
    this.emit('drawer-opened', { drawerId });
    this.notifySubscribers();
  }

  /**
   * Close drawer
   */
  closeDrawer(drawerId: string): void {
    this.state.openDrawers.delete(drawerId);
    this.emit('drawer-closed', { drawerId });
    this.notifySubscribers();
  }

  /**
   * Check if drawer is open
   */
  isDrawerOpen(drawerId: string): boolean {
    return this.state.openDrawers.has(drawerId);
  }

  /**
   * Get drawer configuration
   */
  getDrawer(drawerId: string): ToolbarDrawer | undefined {
    return this.state.drawers.get(drawerId);
  }
}

// Singleton instance
export const toolbarSystem = new ToolbarSystem();

