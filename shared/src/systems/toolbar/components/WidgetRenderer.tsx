/**
 * Widget Renderer
 * 
 * Renders registered widgets in the toolbar.
 */

import React from 'react';
import { widgetRegistry } from '../widgets/WidgetRegistry';
import { ToolbarItem } from '../types/menu-config';

export interface WidgetRendererProps {
  item: ToolbarItem;
  isCollapsed?: boolean;
}

export const WidgetRenderer: React.FC<WidgetRendererProps> = ({ item, isCollapsed }) => {
  // Only render if this is a widget item
  if (item.type !== 'widget' || !item.widget) {
    return null;
  }

  const { type, data } = item.widget;
  
  // Get widget definition from registry
  const widgetDef = widgetRegistry.get(type);
  
  if (!widgetDef) {
    console.warn(`Widget type '${type}' not found in registry`);
    return null;
  }

  // Check if widget supports collapsed view
  if (isCollapsed && !widgetDef.supportsCollapsed) {
    return null;
  }

  const WidgetComponent = widgetDef.component;

  // Merge default data with instance data
  const widgetData = {
    ...widgetDef.defaultData,
    ...data,
  };

  return (
    <div className="flex items-center">
      <WidgetComponent 
        widgetId={item.id}
        data={widgetData}
        isCollapsed={isCollapsed}
      />
    </div>
  );
};

