/**
 * Toolbar Widget Types
 * 
 * Widgets are custom React components that can be slotted into toolbars.
 * They provide a way to add complex, stateful UI elements beyond simple buttons.
 */

import React from 'react';

export interface ToolbarWidgetProps {
  /**
   * Unique identifier for this widget instance
   */
  widgetId: string;
  
  /**
   * Custom data passed to the widget
   */
  data?: Record<string, any>;
  
  /**
   * Whether the widget is in a collapsed/mobile view
   */
  isCollapsed?: boolean;
}

export interface ToolbarWidgetDefinition {
  /**
   * Unique identifier for this widget type
   */
  type: string;
  
  /**
   * Display name for the widget
   */
  name: string;
  
  /**
   * Description of what the widget does
   */
  description?: string;
  
  /**
   * React component to render
   */
  component: React.ComponentType<ToolbarWidgetProps>;
  
  /**
   * Default data for the widget
   */
  defaultData?: Record<string, any>;
  
  /**
   * Whether this widget can be shown in collapsed/mobile view
   */
  supportsCollapsed?: boolean;
}

export interface ToolbarWidgetInstance {
  /**
   * Unique instance ID
   */
  id: string;
  
  /**
   * Widget type identifier
   */
  type: string;
  
  /**
   * Instance-specific data
   */
  data?: Record<string, any>;
  
  /**
   * Responsive behavior
   */
  responsive?: {
    priority?: number;
    hideOnMobile?: boolean;
  };
}

