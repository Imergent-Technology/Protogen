/**
 * Widget Registry
 * 
 * Central registry for toolbar widgets.
 */

import { ToolbarWidgetDefinition } from '../types/widget';

class WidgetRegistryClass {
  private widgets: Map<string, ToolbarWidgetDefinition> = new Map();

  /**
   * Register a widget type
   */
  register(widget: ToolbarWidgetDefinition): void {
    if (this.widgets.has(widget.type)) {
      console.warn(`Widget type '${widget.type}' is already registered. Overwriting.`);
    }
    this.widgets.set(widget.type, widget);
  }

  /**
   * Get a widget definition by type
   */
  get(type: string): ToolbarWidgetDefinition | undefined {
    return this.widgets.get(type);
  }

  /**
   * Check if a widget type is registered
   */
  has(type: string): boolean {
    return this.widgets.has(type);
  }

  /**
   * Get all registered widgets
   */
  getAll(): ToolbarWidgetDefinition[] {
    return Array.from(this.widgets.values());
  }

  /**
   * Unregister a widget type
   */
  unregister(type: string): boolean {
    return this.widgets.delete(type);
  }
}

// Export singleton instance
export const widgetRegistry = new WidgetRegistryClass();

