# Toolbar Widget System

## Overview

The Toolbar Widget System provides a flexible, extensible framework for adding custom React components to the toolbar. Widgets are reusable UI components that can display dynamic content, handle user interactions, and integrate with other systems.

## Architecture

### Core Components

**1. Widget Registry (`WidgetRegistry.ts`)**
- Singleton registry for managing widget types
- Methods: `register()`, `get()`, `has()`, `getAll()`, `unregister()`
- Type-safe widget definitions

**2. Widget Types (`widget.ts`)**
```typescript
interface ToolbarWidgetProps {
  widgetId: string;
  data?: Record<string, any>;
  isCollapsed?: boolean;
}

interface ToolbarWidgetDefinition {
  type: string;
  name: string;
  description?: string;
  component: React.ComponentType<ToolbarWidgetProps>;
  defaultData?: Record<string, any>;
  supportsCollapsed?: boolean;
}

interface ToolbarWidgetInstance {
  id: string;
  type: string;
  data?: Record<string, any>;
  responsive?: { priority?: number; hideOnMobile?: boolean; };
}
```

**3. Widget Renderer (`WidgetRenderer.tsx`)**
- Renders registered widgets in the toolbar
- Merges default data with instance data
- Handles collapsed view support
- Provides error handling for missing widgets

## Built-in Widgets

### UserMenu Widget

Displays the current logged-in user with dropdown menu functionality.

**Features:**
- Avatar display with initials fallback
- User name and email
- Admin badge indicator
- Profile navigation
- Settings navigation
- Logout functionality

**Data Interface:**
```typescript
interface UserMenuWidgetData {
  user?: {
    name: string;
    email: string;
    avatar?: string;
    is_admin?: boolean;
  } | null;
  onLogout?: () => void;
  onProfileClick?: () => void;
  onSettingsClick?: () => void;
}
```

**Usage:**
```typescript
// 1. Register the widget (usually in app initialization)
widgetRegistry.register(userMenuWidgetDefinition);

// 2. Add to toolbar configuration
{
  id: 'user-menu-widget',
  type: 'widget',
  widget: {
    type: 'user-menu',
    data: {
      user,
      onLogout: handleLogout,
      onProfileClick: () => navigateTo('/profile'),
      onSettingsClick: () => navigateTo('/settings'),
    }
  },
  responsive: { priority: 95 }
}
```

## Creating Custom Widgets

### 1. Define Your Widget Component

```typescript
import React from 'react';
import { ToolbarWidgetProps } from '@protogen/shared/systems/toolbar';

export interface MyWidgetData {
  title: string;
  count: number;
  onClick?: () => void;
}

export const MyWidget: React.FC<ToolbarWidgetProps> = ({ data }) => {
  const widgetData = data as MyWidgetData | undefined;
  
  if (!widgetData) return null;
  
  return (
    <button onClick={widgetData.onClick} className="px-3 py-1 rounded hover:bg-accent">
      {widgetData.title}: {widgetData.count}
    </button>
  );
};
```

### 2. Create Widget Definition

```typescript
export const myWidgetDefinition = {
  type: 'my-widget',
  name: 'My Custom Widget',
  description: 'A custom widget that shows a count',
  component: MyWidget,
  defaultData: {
    title: 'Items',
    count: 0
  },
  supportsCollapsed: true,
};
```

### 3. Register and Use

```typescript
// Register
widgetRegistry.register(myWidgetDefinition);

// Use in toolbar
toolbarSystem.registerToolbarConfig({
  id: 'my-toolbar',
  edge: 'top',
  sections: [{
    id: 'end-section',
    position: 'end',
    items: [{
      id: 'my-widget-instance',
      type: 'widget',
      widget: {
        type: 'my-widget',
        data: {
          title: 'Tasks',
          count: 5,
          onClick: () => console.log('Clicked!')
        }
      }
    }]
  }]
});
```

## Integration with Toolbar System

### Toolbar Item Type Extension

The `ToolbarItem` type has been extended to support widgets:

```typescript
interface ToolbarItem {
  id: string;
  type: 'button' | 'menu-button' | 'separator' | 'widget' | /* ... */;
  // ... other properties
  widget?: {
    type: string;
    data?: Record<string, any>;
  };
}
```

### Rendering Flow

1. `ToolbarContainer` renders `ToolbarSection` components
2. `ToolbarSection` renders `ToolbarItemRenderer` for each item
3. `ToolbarItemRenderer` checks item type and renders `WidgetRenderer` for widgets
4. `WidgetRenderer` looks up widget definition in registry
5. Widget component is rendered with merged data

## Best Practices

### 1. Widget Design

- **Keep widgets focused**: Each widget should do one thing well
- **Handle null states**: Always check if required data is present
- **Support responsive views**: Consider collapsed/mobile views
- **Use semantic HTML**: Ensure accessibility
- **Follow design system**: Use shared components and Tailwind classes

### 2. Data Management

- **Type your data**: Always define a TypeScript interface for widget data
- **Provide defaults**: Use `defaultData` for sensible defaults
- **Make callbacks optional**: Not all use cases need all callbacks
- **Document data shape**: Clear JSDoc comments help other developers

### 3. Performance

- **Avoid expensive renders**: Use `React.memo` if necessary
- **Don't fetch in widgets**: Pass data from parent, don't make API calls directly
- **Keep state minimal**: Widgets should be mostly presentational
- **Use event delegation**: For interactive widgets, minimize event listeners

### 4. Registration

- **Register early**: Register widgets during app initialization
- **Use unique type IDs**: Avoid naming collisions
- **Provide good metadata**: Name and description help discoverability
- **Version your widgets**: Consider versioning for breaking changes

## Future Enhancements

### Planned Features

1. **Widget Marketplace**
   - Admin UI for browsing available widgets
   - Enable/disable widgets per toolbar
   - Configure widget instances visually

2. **Advanced Positioning**
   - Drag-and-drop widget reordering
   - Conditional visibility rules
   - Dynamic widget injection by plugins

3. **Widget State Management**
   - Built-in state persistence
   - Cross-widget communication
   - Shared widget context

4. **Additional Built-in Widgets**
   - Notifications widget
   - Search widget
   - Bookmarks widget
   - Theme toggle widget
   - Breadcrumbs widget

## Examples

### Notification Widget

```typescript
export const NotificationWidget: React.FC<ToolbarWidgetProps> = ({ data }) => {
  const { count, onClick } = data as { count: number; onClick: () => void };
  
  return (
    <button
      onClick={onClick}
      className="relative p-2 rounded-full hover:bg-accent"
      aria-label={`${count} notifications`}
    >
      <Bell className="h-5 w-5" />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center">
          {count > 9 ? '9+' : count}
        </span>
      )}
    </button>
  );
};
```

### Theme Toggle Widget

```typescript
export const ThemeToggleWidget: React.FC<ToolbarWidgetProps> = () => {
  const { theme, setTheme } = useTheme();
  
  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="p-2 rounded-full hover:bg-accent"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </button>
  );
};
```

## API Reference

### widgetRegistry

**`register(widget: ToolbarWidgetDefinition): void`**
- Registers a widget type
- Overwrites if already registered (with warning)

**`get(type: string): ToolbarWidgetDefinition | undefined`**
- Retrieves a widget definition by type

**`has(type: string): boolean`**
- Checks if a widget type is registered

**`getAll(): ToolbarWidgetDefinition[]`**
- Returns all registered widgets

**`unregister(type: string): boolean`**
- Removes a widget type
- Returns true if widget was found and removed

## Migration from Old Toolbar

The old `Toolbar.tsx` component in `shared/src/components/navigation/toolbar/` has been replaced by the new Toolbar System. To migrate:

1. **Replace toolbar component**:
   ```typescript
   // Old
   import { Toolbar } from '@protogen/shared/components';
   <Toolbar onNavigate={handleNav} />
   
   // New
   import { ToolbarContainer } from '@protogen/shared/systems/toolbar';
   <ToolbarContainer toolbarId="top-toolbar" edge="top" />
   ```

2. **Configure via ToolbarSystem**:
   ```typescript
   toolbarSystem.registerToolbarConfig({ /* ... */ });
   ```

3. **Use widgets for custom UI**:
   Instead of hardcoding UI in the toolbar, create widgets.

## Conclusion

The Toolbar Widget System provides a professional, idiomatic way to extend the toolbar with custom functionality. It's type-safe, extensible, and integrates seamlessly with the existing toolbar infrastructure.

For questions or contributions, see the main toolbar system documentation.

