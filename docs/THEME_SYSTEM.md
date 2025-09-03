# Progress Theme System

## Overview

The Progress application uses a centralized, theme-aware color system that automatically adapts between light and dark modes. This system provides consistent, semantic color naming across all components while maintaining excellent accessibility and visual hierarchy.

## Architecture

### Core Theme Files
- **`shared/src/themes/index.ts`** - Central theme definitions and color schemes
- **`config/tailwind.css`** - Root-level Tailwind CSS with base theme variables
- **`admin/tailwind.config.js`** - Admin app Tailwind configuration with theme integration
- **`ui/tailwind.config.js`** - UI app Tailwind configuration (mirrors admin)

### Theme Provider
- **`shared/src/components/theme/ThemeToggle.tsx`** - Theme switching component
- **`shared/src/hooks/useTheme.tsx`** - Theme management hook

### Build System
- **Root-level build commands** - All builds should be run from the repository root
- **`npm run build:all`** - Builds CSS, admin, and UI apps in sequence
- **`npm run build:css:prod`** - Builds the shared CSS with theme variables
- **`npm run build:admin`** - Builds the admin application
- **`npm run build:ui`** - Builds the UI application

## Color System

### Base Colors
These colors form the foundation of the UI:

```typescript
interface ThemeColors {
  // Base colors
  background: string;        // Main page background
  foreground: string;        // Primary text color
  
  // Card colors
  card: string;              // Card/panel backgrounds
  cardForeground: string;    // Card text
  
  // Popover colors
  popover: string;           // Dropdown/tooltip backgrounds
  popoverForeground: string; // Popover text
  
  // Primary colors
  primary: string;           // Main brand color
  primaryForeground: string; // Text on primary backgrounds
  
  // Secondary colors
  secondary: string;         // Secondary UI elements
  secondaryForeground: string; // Text on secondary backgrounds
  
  // Muted colors
  muted: string;             // Subtle backgrounds
  mutedForeground: string;   // Secondary text
  
  // Accent colors
  accent: string;            // Highlight colors
  accentForeground: string;  // Text on accent backgrounds
}
```

### Semantic Colors
These colors provide meaning and context:

```typescript
interface ThemeColors {
  // Destructive colors
  destructive: string;           // Error states, delete actions
  destructiveForeground: string; // Text on destructive backgrounds
  
  // Success colors
  success: string;               // Success states, confirmations
  successForeground: string;     // Text on success backgrounds
  
  // Warning colors
  warning: string;               // Warning states, cautions
  warningForeground: string;     // Text on warning backgrounds
  
  // Info colors
  info: string;                  // Informational states
  infoForeground: string;        // Text on info backgrounds
}
```

### UI Element Colors
These colors are used for specific UI components:

```typescript
interface ThemeColors {
  // Border and input colors
  border: string;    // Borders, dividers
  input: string;     // Form input backgrounds
  ring: string;      // Focus ring colors
  
  // Stage-specific colors
  stageBackground: string; // Stage content backgrounds
  stageForeground: string; // Stage text
  stageBorder: string;     // Stage borders
  stageAccent: string;     // Stage highlights
}
```

## Usage in Components

### 1. Status Indicators
Use semantic colors for status pills and badges:

```tsx
// ✅ Good - Uses theme system
<span className="bg-status-success/20 text-status-success border border-status-success/30">
  Active
</span>

<span className="bg-status-error/20 text-status-error border border-status-error/30">
  Error
</span>

// ❌ Bad - Hardcoded colors
<span className="bg-green-100 text-green-800">
  Active
</span>
```

### 2. Toast Notifications
Use semantic colors for different message types:

```tsx
// ✅ Good - Uses theme system
const getIcon = () => {
  switch (toast.type) {
    case 'success':
      return <CheckCircle className="h-5 w-5 text-status-success" />;
    case 'error':
      return <AlertCircle className="h-5 w-5 text-status-error" />;
    case 'warning':
      return <AlertCircle className="h-5 w-5 text-status-warning" />;
    case 'info':
      return <Info className="h-5 w-5 text-status-info" />;
  }
};
```

### 3. Form Validation
Use semantic colors for error states:

```tsx
// ✅ Good - Uses theme system
{error && (
  <div className="text-status-error text-sm bg-status-error/10 border border-status-error/20 rounded-md p-3">
    {error}
  </div>
)}

// ❌ Bad - Hardcoded colors
{error && (
  <div className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-md p-3">
    {error}
  </div>
)}
```

### 4. Interactive Elements
Use semantic colors for hover and active states:

```tsx
// ✅ Good - Uses theme system
<button className="text-status-error hover:bg-status-error/10 transition-colors">
  Delete
</button>

// ❌ Bad - Hardcoded colors
<button className="text-red-600 hover:bg-red-50 transition-colors">
  Delete
</button>
```

## Opacity Variants

The theme system supports opacity variants for subtle backgrounds and borders:

```tsx
// Background with 10% opacity
className="bg-status-success/10"

// Border with 20% opacity  
className="border-status-error/20"

// Text with full opacity
className="text-status-warning"
```

## Adding New Colors

### 1. Extend the Theme Interface
Add new colors to `shared/src/themes/index.ts`:

```typescript
interface ThemeColors {
  // ... existing colors
  
  // New semantic color
  highlight: string;
  highlightForeground: string;
}
```

### 2. Add Light Theme Values
```typescript
export const themes: Record<Theme, ThemeColors> = {
  light: {
    // ... existing colors
    
    highlight: 'rgb(168, 85, 247)',        // Purple
    highlightForeground: 'rgb(248, 250, 252)',
  },
  // ... dark theme
};
```

### 3. Add to Tailwind Config
Update `admin/tailwind.config.js` and `ui/tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      // ... existing colors
      
      highlight: {
        DEFAULT: "var(--color-highlight)",
        foreground: "var(--color-highlight-foreground)",
      },
    },
  },
},
```

### 4. Add Status Variant (Optional)
If it's a status color, add it to the status object:

```javascript
status: {
  // ... existing status colors
  highlight: "var(--color-highlight)",
},
```

## Best Practices

### ✅ Do's
- Use semantic color names (`text-status-success`, `bg-status-error`)
- Leverage opacity variants for subtle effects (`bg-primary/10`)
- Use the theme system for all color decisions
- Test components in both light and dark modes
- **Build from the repository root** using `npm run build:all`

### ❌ Don'ts
- Don't use hardcoded Tailwind colors (`text-red-500`, `bg-green-100`)
- Don't mix theme colors with hardcoded colors
- Don't assume colors will look the same in both themes
- Don't forget to test accessibility contrast ratios
- **Don't build individual apps from their subdirectories** - use root commands

### Color Naming Convention
- **Status colors**: `status-{type}` (success, error, warning, info, admin, user)
- **Base colors**: Use semantic names (primary, secondary, muted, accent)
- **Opacity**: Use `/` notation (`bg-primary/20` for 20% opacity)

### Build Process
- **Always build from root**: `cd /path/to/progress && npm run build:all`
- **CSS builds first**: Theme variables are compiled before app builds
- **Apps build in sequence**: Admin and UI apps build after CSS is ready
- **Development workflow**: Use `npm run dev:all` for concurrent development

## Development Workflow

### Building Applications
```bash
# Build everything from root
npm run build:all

# Build individual components
npm run build:css:prod    # Build shared CSS with theme variables
npm run build:admin       # Build admin application
npm run build:ui          # Build UI application

# Development mode (concurrent)
npm run dev:all           # Start all dev servers simultaneously
npm run dev:admin         # Start admin dev server only
npm run dev:ui            # Start UI dev server only
```

### Theme Development
```bash
# 1. Update theme colors in shared/src/themes/index.ts
# 2. Update root Tailwind CSS in config/tailwind.css
# 3. Build CSS: npm run build:css:prod
# 4. Build apps: npm run build:all
# 5. Test theme switching in both apps
```

## Testing Themes

### 1. Visual Testing
- Switch between light and dark themes
- Verify all components maintain proper contrast
- Check that semantic meaning is preserved

### 2. Accessibility Testing
- Use browser dev tools to check contrast ratios
- Verify WCAG AA compliance (4.5:1 for normal text)
- Test with color blindness simulators

### 3. Component Testing
- Test components in isolation with different themes
- Verify theme switching works correctly
- Check that colors update immediately

### 4. Build Testing
- Verify CSS builds correctly: `npm run build:css:prod`
- Test individual app builds: `npm run build:admin`
- Test full build process: `npm run build:all`

## Migration Guide

### From Hardcoded Colors
If you have existing components with hardcoded colors:

1. **Identify the semantic meaning** of the color
2. **Choose the appropriate theme color** from the system
3. **Replace hardcoded classes** with theme-aware ones
4. **Test in both themes** to ensure proper contrast

### Example Migration
```tsx
// Before (hardcoded)
<div className="bg-green-100 text-green-800 border border-green-200">
  Success Message
</div>

// After (theme-aware)
<div className="bg-status-success/10 text-status-success border border-status-success/20">
  Success Message
</div>
```

## Future Enhancements

### Planned Features
- **Custom theme support** for user preferences
- **High contrast mode** for accessibility
- **Seasonal themes** for special occasions
- **Brand customization** for different deployments

### Extension Points
- **Plugin system** for custom color schemes
- **CSS custom properties** for dynamic theming
- **Theme inheritance** for component libraries
- **Performance optimization** for theme switching

## Support

For questions about the theme system:
- Check this documentation first
- Review existing component implementations
- Consult the design system guidelines
- Open an issue for bugs or feature requests

---

*This documentation is maintained alongside the theme system. Please update it when making changes to the color system.*
