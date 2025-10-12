/**
 * MenuConfigService
 * 
 * Service for loading and managing menu configurations
 */

import type { NavigationMenuConfig, ContextMenuConfig, ToolbarConfig } from '../types';

export class MenuConfigService {
  private navigationMenus: Map<string, NavigationMenuConfig> = new Map();
  private contextMenus: Map<string, ContextMenuConfig> = new Map();
  private toolbarConfigs: Map<string, ToolbarConfig> = new Map();

  /**
   * Load menu configuration from API
   */
  async loadConfiguration(apiUrl: string): Promise<void> {
    try {
      const response = await fetch(`${apiUrl}/menu-config`);
      if (!response.ok) {
        throw new Error(`Failed to load menu config: ${response.statusText}`);
      }

      const config = await response.json();
      
      // Load navigation menus
      if (config.navigationMenus) {
        config.navigationMenus.forEach((menu: NavigationMenuConfig) => {
          this.navigationMenus.set(menu.id, menu);
        });
      }

      // Load context menus
      if (config.contextMenus) {
        config.contextMenus.forEach((menu: ContextMenuConfig) => {
          this.contextMenus.set(menu.id, menu);
        });
      }

      // Load toolbar configs
      if (config.toolbarConfigs) {
        config.toolbarConfigs.forEach((toolbar: ToolbarConfig) => {
          this.toolbarConfigs.set(toolbar.id, toolbar);
        });
      }
    } catch (error) {
      console.error('Failed to load menu configuration:', error);
      // Fall back to default configuration
      this.loadDefaultConfiguration();
    }
  }

  /**
   * Load default configuration
   */
  loadDefaultConfiguration(): void {
    // Default navigation menu
    const defaultNavMenu: NavigationMenuConfig = {
      id: 'main-navigation',
      name: 'Main Navigation',
      position: 'left',
      items: [
        {
          id: 'home' as any,
          label: 'Home',
          icon: 'home',
          order: 0,
          action: { type: 'navigate-context', contextPath: '/' }
        },
        {
          id: 'explore' as any,
          label: 'Explore',
          icon: 'compass',
          order: 1,
          action: { type: 'navigate-context', contextPath: '/explore' }
        },
        {
          id: 'profile' as any,
          label: 'Profile',
          icon: 'user',
          order: 2,
          action: { type: 'navigate-context', contextPath: '/profile' }
        },
        {
          id: 'settings' as any,
          label: 'Settings',
          icon: 'settings',
          order: 3,
          action: { type: 'navigate-context', contextPath: '/settings' }
        }
      ],
      collapsible: false,
      defaultExpanded: true
    };

    this.navigationMenus.set(defaultNavMenu.id, defaultNavMenu);

    // Default toolbar
    const defaultToolbar: ToolbarConfig = {
      id: 'main-toolbar',
      edge: 'top',
      sections: [
        {
          id: 'left',
          position: 'start',
          items: [
            { id: 'menu', type: 'menu-button', icon: 'menu' },
            { id: 'breadcrumb', type: 'context-indicator' }
          ]
        },
        {
          id: 'center',
          position: 'middle',
          items: [
            { id: 'search', type: 'search' }
          ]
        },
        {
          id: 'right',
          position: 'end',
          items: [
            { id: 'notifications', type: 'notifications', badge: { count: 0 } },
            { id: 'user-menu', type: 'user-menu' }
          ]
        }
      ]
    };

    this.toolbarConfigs.set(defaultToolbar.id, defaultToolbar);
  }

  /**
   * Get navigation menu by ID
   */
  getNavigationMenu(id: string): NavigationMenuConfig | undefined {
    return this.navigationMenus.get(id);
  }

  /**
   * Get context menu by ID
   */
  getContextMenu(id: string): ContextMenuConfig | undefined {
    return this.contextMenus.get(id);
  }

  /**
   * Get toolbar config by ID
   */
  getToolbarConfig(id: string): ToolbarConfig | undefined {
    return this.toolbarConfigs.get(id);
  }

  /**
   * Get all navigation menus
   */
  getAllNavigationMenus(): NavigationMenuConfig[] {
    return Array.from(this.navigationMenus.values());
  }

  /**
   * Get all context menus
   */
  getAllContextMenus(): ContextMenuConfig[] {
    return Array.from(this.contextMenus.values());
  }

  /**
   * Get all toolbar configs
   */
  getAllToolbarConfigs(): ToolbarConfig[] {
    return Array.from(this.toolbarConfigs.values());
  }

  /**
   * Register navigation menu programmatically
   */
  registerNavigationMenu(config: NavigationMenuConfig): void {
    this.navigationMenus.set(config.id, config);
  }

  /**
   * Register context menu programmatically
   */
  registerContextMenu(config: ContextMenuConfig): void {
    this.contextMenus.set(config.id, config);
  }

  /**
   * Register toolbar config programmatically
   */
  registerToolbarConfig(config: ToolbarConfig): void {
    this.toolbarConfigs.set(config.id, config);
  }

  /**
   * Clear all configurations
   */
  clear(): void {
    this.navigationMenus.clear();
    this.contextMenus.clear();
    this.toolbarConfigs.clear();
  }
}

// Singleton instance
export const menuConfigService = new MenuConfigService();

