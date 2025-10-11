# Scene-First Routing Architecture

**Status**: ✅ Implemented (Phase 2 Complete)  
**Location**: `shared/src/systems/scene/`  
**Package**: `@protogen/shared`  
**Import Paths**: 
- `@protogen/shared/systems/scene` (SceneRouter, hooks)
- Default scenes included

---

## Overview

Scene-First Routing transforms Protogen from traditional page-based routing to a full-screen, scene-oriented interface. Users navigate between scenes (system scenes or admin-authored custom scenes) via the Navigator system, with all auxiliary interactions handled through the Dialog System.

---

## Core Concept

**Scenes are the primary UI paradigm**. The entire application is scene-driven:

1. User loads the portal → Default scene renders
2. User navigates → Context changes → SceneRouter maps context to scene → New scene renders
3. Auxiliary interactions → Dialog System handles (comments, settings, etc.)

---

## Architecture Components

### 1. SceneRouter

**Location**: `shared/src/systems/scene/SceneRouter.ts`

Maps navigation contexts to scene IDs with pattern matching support.

```typescript
export class SceneRouter {
  // Get scene for current context
  getSceneForContext(context: CurrentContext): string;
  
  // Admin configuration
  setSceneOverride(pattern: string, sceneId: string, priority?: number): void;
  removeSceneOverride(pattern: string): void;
  
  // Default scene
  getDefaultScene(): string;
  setDefaultScene(sceneId: string): void;
  
  // Load/export configuration
  loadConfiguration(config: RouteConfig): Promise<void>;
  exportConfiguration(): RouteConfig;
}
```

#### Pattern Matching

SceneRouter supports flexible pattern matching:

```typescript
// Exact match
sceneRouter.setSceneOverride('/explore', 'system-explore');

// Glob pattern
sceneRouter.setSceneOverride('/profile/*', 'system-profile');

// Regex pattern
sceneRouter.setSceneOverride('^/admin/.*', 'admin-dashboard');

// Priority-based (higher priority matches first)
sceneRouter.setSceneOverride('/special', 'special-scene', 100);
sceneRouter.setSceneOverride('/*', 'default-scene', 0);
```

#### Route Resolution Order

1. Check for exact context path match
2. Check pattern mappings (sorted by priority)
3. Check if context specifies sceneId directly
4. Fallback to default scene

### 2. Default System Scenes

**Location**: `shared/src/systems/scene/default-scenes/`

System scenes that ship with the platform:

#### SystemHomeScene

- **ID**: `system-home`
- **Purpose**: Default landing scene
- **Features**: Welcome message, platform overview, quick actions
- **Route**: `/` (default)

```typescript
import { SystemHomeScene, SYSTEM_HOME_SCENE_ID } from '@protogen/shared/systems/scene';
```

#### SystemExploreScene

- **ID**: `system-explore`
- **Purpose**: Content discovery and exploration
- **Features**: Content cards, search, filters
- **Route**: `/explore`

```typescript
import { SystemExploreScene, SYSTEM_EXPLORE_SCENE_ID } from '@protogen/shared/systems/scene';
```

#### SystemProfileScene

- **ID**: `system-profile`
- **Purpose**: User profile and activity
- **Features**: Profile info, activity, bookmarks, comments
- **Route**: `/profile/*`

```typescript
import { SystemProfileScene, SYSTEM_PROFILE_SCENE_ID } from '@protogen/shared/systems/scene';
```

#### SystemSettingsScene

- **ID**: `system-settings`
- **Purpose**: Application settings
- **Features**: Appearance, notifications, privacy settings
- **Route**: `/settings`

```typescript
import { SystemSettingsScene, SYSTEM_SETTINGS_SCENE_ID } from '@protogen/shared/systems/scene';
```

All system scenes are fully styled with Tailwind and responsive.

### 3. SceneContainer

**Location**: `portal/src/components/scene/SceneContainer.tsx`

Main scene rendering container that:

- Uses `useSceneForContext()` to get current scene ID
- Renders system scenes or authored scenes
- Handles loading states
- Provides fallback for missing scenes

```typescript
export const SceneContainer: React.FC = () => {
  const sceneId = useSceneForContext();
  const isSystem = isSystemScene(sceneId);
  
  // Render system scene component
  if (isSystem) {
    const SystemSceneComponent = getSystemSceneComponent(sceneId);
    return <SystemSceneComponent />;
  }
  
  // Render authored scene via SceneViewer
  return <SceneViewer sceneId={sceneId} />;
};
```

---

## React Hooks

### `useSceneForContext()`

Returns the scene ID for the current navigation context.

```typescript
const sceneId = useSceneForContext();
// Returns: 'system-home', 'system-explore', 'custom-scene-123', etc.
```

Automatically updates when Navigator context changes.

### `useSceneRouter()`

Access to SceneRouter instance methods.

```typescript
const {
  getSceneForContext,
  setSceneOverride,
  removeSceneOverride,
  getDefaultScene,
  setDefaultScene,
  loadConfiguration,
  exportConfiguration
} = useSceneRouter();
```

---

## Integration with Navigator

### CurrentContext Enhancement

Added `contextPath` field to `CurrentContext`:

```typescript
export interface CurrentContext {
  sceneId: string | null;
  sceneSlug: string | null;
  deckId: string | null;
  deckSlug: string | null;
  slideId: string | null;
  contextPath?: string; // NEW: Path for scene routing
  coordinates?: { x: number; y: number; z?: number };
  timestamp: number;
}
```

### Navigation Flow

```
User Action
  ↓
Navigator.navigateTo(target)
  ↓
CurrentContext updated (with contextPath)
  ↓
useSceneForContext() triggered
  ↓
SceneRouter.getSceneForContext(context)
  ↓
Scene ID returned
  ↓
SceneContainer renders scene
```

---

## Portal Integration

### App.tsx Restructure

The portal `App.tsx` was restructured for scene-first routing:

```typescript
function App() {
  const { navigateTo, currentContext } = useNavigator();
  const { openToast } = useDialog();
  
  // Initialize scene router
  useEffect(() => {
    sceneRouter.setDefaultScene('system-home');
    sceneRouter.setSceneOverride('/explore', 'system-explore', 10);
    sceneRouter.setSceneOverride('/profile*', 'system-profile', 10);
    sceneRouter.setSceneOverride('/settings', 'system-settings', 10);
  }, []);
  
  return (
    <>
      <AppLayout user={user} onLogout={handleLogout}>
        {/* Scene-first routing */}
        <SceneContainer />
      </AppLayout>
      
      {/* Dialog System for all modal interactions */}
      <DialogContainer />
    </>
  );
}
```

**Key Changes**:

- ❌ Removed: Page-based routing (`currentPage` state)
- ❌ Removed: Manual page rendering (`renderPage()`)
- ✅ Added: `SceneContainer` as primary content
- ✅ Added: SceneRouter initialization
- ✅ Added: Dialog System integration
- ✅ Added: Navigator-driven navigation

---

## Admin Configuration

### Scene Override Management

Admins can configure context-to-scene mappings via API:

```typescript
// Load configuration from API
const config = await apiClient.get('/api/scene-routing/config');

await sceneRouter.loadConfiguration({
  defaultSceneId: 'system-home',
  routes: [
    { pattern: '/explore', sceneId: 'system-explore', priority: 10 },
    { pattern: '/custom', sceneId: 'custom-scene-123', priority: 20 },
    { pattern: '/profile/*', sceneId: 'system-profile', priority: 10 }
  ]
});

// Export configuration for saving
const config = sceneRouter.exportConfiguration();
await apiClient.post('/api/scene-routing/config', config);
```

### Scene Authoring

Admins can mark scenes as "route targets" and map them to specific contexts:

1. Create/edit scene in admin
2. Mark as "Route Target"
3. Configure context pattern (e.g., `/products`, `/docs/*`)
4. Set priority (higher priority = preferred match)
5. Save configuration

Portal respects admin-configured mappings with fallback to system scenes.

---

## Migration Strategy

### Incremental Migration (Recommended)

**Phase 2a**: Foundation (✅ Complete)
- SceneRouter implemented
- System scenes created
- SceneContainer component
- Portal App.tsx restructured

**Phase 2b**: Gradual Page Migration
- Identify existing page components
- Convert to scene representation
- Map routes to scenes
- Test and validate

**Phase 2c**: Complete Transition
- Remove old page components
- Full scene-first paradigm
- No React Router in portal

### Example: Page to Scene Migration

**Before** (Page-based):
```typescript
// portal/src/pages/ExplorePage.tsx
export function ExplorePage() {
  return (
    <div>
      <h1>Explore</h1>
      {/* Content */}
    </div>
  );
}
```

**After** (Scene-based):
```typescript
// Use SystemExploreScene (already implemented)
// Or create custom authored scene via admin
// SceneRouter handles routing automatically
```

---

## Best Practices

### 1. Scene Design

- **Full-screen**: Scenes should fill the viewport
- **Self-contained**: Each scene is an independent unit
- **Responsive**: Design for all screen sizes
- **Accessible**: ARIA labels, keyboard navigation

### 2. Route Patterns

- Use exact matches for specific routes
- Use glob patterns for nested routes
- Use regex for complex patterns
- Set priorities for overlapping patterns

### 3. Performance

- Lazy load scene components
- Preload likely next scenes
- Cache scene data
- Optimize scene transitions

### 4. State Management

- Use Navigator for cross-scene state
- Use local state for scene-specific data
- Use Dialog System for auxiliary interactions
- Persist important state to API

---

## System Scene Helpers

### `isSystemScene(sceneId)`

Check if a scene ID is a system scene.

```typescript
if (isSystemScene(sceneId)) {
  // Handle system scene
}
```

### `getSystemSceneComponent(sceneId)`

Get the React component for a system scene.

```typescript
const SceneComponent = getSystemSceneComponent('system-home');
return <SceneComponent />;
```

### `getSystemSceneMetadata(sceneId)`

Get metadata for a system scene.

```typescript
const metadata = getSystemSceneMetadata('system-explore');
// { id, name, description, slug }
```

---

## TypeScript Support

Full TypeScript support with:

- Type-safe scene IDs
- Type-safe route configuration
- Type-safe scene metadata
- Strict null checks

```typescript
// Type-safe scene routing
const sceneId: string = sceneRouter.getSceneForContext(context);

// Type-safe configuration
const config: RouteConfig = sceneRouter.exportConfiguration();

// Type-safe helpers
const isSystem: boolean = isSystemScene(sceneId);
const Component: React.FC | undefined = getSystemSceneComponent(sceneId);
```

---

## Testing

Scene-First Routing is fully testable:

```typescript
import { sceneRouter, isSystemScene } from '@protogen/shared/systems/scene';

test('routes to default scene', () => {
  sceneRouter.setDefaultScene('system-home');
  const sceneId = sceneRouter.getSceneForContext({ contextPath: '/' });
  expect(sceneId).toBe('system-home');
});

test('pattern matching works', () => {
  sceneRouter.setSceneOverride('/explore', 'system-explore');
  const sceneId = sceneRouter.getSceneForContext({ contextPath: '/explore' });
  expect(sceneId).toBe('system-explore');
});

test('priority sorting works', () => {
  sceneRouter.setSceneOverride('/test', 'scene-low', 10);
  sceneRouter.setSceneOverride('/test', 'scene-high', 100);
  const sceneId = sceneRouter.getSceneForContext({ contextPath: '/test' });
  expect(sceneId).toBe('scene-high');
});
```

---

## Performance Considerations

### Scene Preloading

Preload likely next scenes:

```typescript
const likelyScenes = ['system-explore', 'system-profile'];
likelyScenes.forEach(sceneId => {
  if (!isSystemScene(sceneId)) {
    // Preload authored scene data
    prefetchScene(sceneId);
  }
});
```

### Transition Optimization

- Use CSS transforms for GPU acceleration
- Minimize DOM changes during transitions
- Preload next scene before transition
- Cache previously viewed scenes

### Bundle Size

- System scenes: ~20KB total (gzipped)
- SceneRouter: ~5KB (gzipped)
- Tree-shaking eliminates unused scenes

---

## Future Enhancements

### Phase 3+

- **URL synchronization**: Sync browser URL with scenes
- **History API integration**: Browser back/forward buttons
- **Scene preloading**: Smart preloading of next scenes
- **Transition effects**: Custom transitions between scenes
- **Scene caching**: Remember scene state
- **Deep linking**: Direct links to specific scenes
- **SEO optimization**: Server-side rendering of scenes

---

## Related Documentation

- [Dialog System Architecture](./DIALOG_SYSTEM_ARCHITECTURE.md)
- [Navigator System Architecture](./NAVIGATOR_SYSTEMS_ARCHITECTURE.md)
- [Scene System Types](../../shared/src/systems/scene/types.ts)
- [Architectural Plan](../architectural-realignment-plan.plan.md)

---

## Status & Roadmap

### ✅ Phase 2 Complete

- [x] SceneRouter implementation
- [x] Pattern matching (exact, glob, regex)
- [x] Priority-based routing
- [x] Default system scenes (Home, Explore, Profile, Settings)
- [x] SceneContainer component
- [x] Portal App.tsx restructure
- [x] Navigator integration
- [x] Dialog System integration
- [x] React hooks
- [x] TypeScript support
- [x] Full Tailwind styling

### 🔄 Phase 3-5 Integration

- [ ] Toolbar/Menu navigation (Phase 3)
- [ ] Bookmarks scene integration (Phase 4)
- [ ] Comments scene integration (Phase 4)
- [ ] Wizard scenes (Phase 5)
- [ ] Admin scene management UI

---

**Last Updated**: 2025-01-11  
**Version**: 1.0.0  
**Maintainer**: Protogen Core Team

