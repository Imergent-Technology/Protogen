/**
 * Toolbar System
 * 
 * Public API for the Toolbar System
 */

// Core system
export { ToolbarSystem, toolbarSystem } from './ToolbarSystem';
export type { ToolbarPlugin } from './ToolbarSystem';

// React hooks
export {
  useToolbar,
  useToolbarState,
  useNavigationMenu,
  useContextMenu,
  useToolbarConfig,
  useIsContextMenuActive,
  useIsNavigationMenuActive,
  useMenuActions,
  useFilteredMenuItems,
  useToolbarDrawer
} from './useToolbar';

// Components
export { 
  ToolbarContainer,
  ToolbarDrawer,
  NavigationMenu,
  ContextMenu,
  ToolbarItemRenderer
} from './components';

// Types
export * from './types';

// Services
export { menuConfigService } from './services/MenuConfigService';

