# SSR Architecture - Server-Side Rendering

**Status**: Foundation Ready  
**Date**: October 11, 2025  
**Related**: Shared Library, Navigator System, Orchestrator System

---

## 🎯 Overview

This document defines the Server-Side Rendering (SSR) architecture for Protogen, enabling the API to pre-render shared library system modules and deliver optimized JavaScript bundles to clients.

### **Key Benefits**

- ⚡ **Fast Initial Load**: Pre-rendered HTML with hydration
- 🔍 **SEO-Friendly**: Search engines can index content
- 📱 **Progressive Enhancement**: Works without JavaScript
- 🚀 **Performance**: Reduced Time-to-Interactive (TTI)
- 🎨 **Consistent UX**: Server and client render identically

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT                               │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │   Portal     │    │    Admin     │    │   Mobile     │  │
│  │   (React)    │    │   (React)    │    │   (React     │  │
│  │              │    │              │    │   Native)    │  │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘  │
│         │                   │                    │          │
│         └───────────────────┴────────────────────┘          │
│                             │                                │
│                      Hydration Request                       │
│                             │                                │
└─────────────────────────────┼────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       WEB SERVER (NGINX)                     │
│                     Port 8080 (External)                     │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                      API SERVER (FastAPI)                    │
│                        Port 9000                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │             SSR Rendering Service                     │  │
│  │  - Imports from @protogen/shared                      │  │
│  │  - Server-side React rendering                        │  │
│  │  - Bundle generation & optimization                   │  │
│  │  - State serialization for hydration                  │  │
│  └──────────────────────────────────────────────────────┘  │
│                             │                                │
│                             ▼                                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │          Shared Library System Modules                │  │
│  │  - @protogen/shared/systems/navigator                 │  │
│  │  - @protogen/shared/systems/authoring                 │  │
│  │  - @protogen/shared/systems/scene                     │  │
│  │  - @protogen/shared/systems/slide                     │  │
│  │  - @protogen/shared/components                        │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
└─────────────────────────┬────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                      DATABASE (PostgreSQL)                   │
│                         Port 5432                            │
└──────────────────────────────────────────────────────────────┘
```

---

## 📦 Shared Library Integration

### **System Module Exports**

The shared library exposes system modules for SSR:

```json
// shared/package.json
{
  "exports": {
    ".": "./dist/src/index.js",
    "./systems/navigator": "./dist/src/systems/navigator/index.js",
    "./systems/authoring": "./dist/src/systems/authoring/index.js",
    "./systems/scene": "./dist/src/systems/scene/index.js",
    "./systems/slide": "./dist/src/systems/slide/index.js",
    "./components": "./dist/src/components/index.js",
    "./types": "./dist/src/types/index.js"
  }
}
```

### **API Server Integration**

The API imports and renders shared library modules:

```python
# api/services/ssr_service.py
from nodejs import require

# Import shared library systems
navigator_system = require('@protogen/shared/systems/navigator')
scene_system = require('@protogen/shared/systems/scene')
authoring_system = require('@protogen/shared/systems/authoring')

def render_scene(scene_id: str, user_context: dict) -> str:
    """Server-render a scene with initial state"""
    
    # Initialize systems with user context
    navigator = navigator_system.NavigatorSystem(user_context)
    scene = scene_system.SceneSystem.load(scene_id)
    
    # Render to HTML string
    html = ReactDOMServer.renderToString(
        SceneViewer(scene=scene, navigator=navigator)
    )
    
    # Serialize state for hydration
    initial_state = {
        'navigator': navigator.getState(),
        'scene': scene.getState()
    }
    
    return render_template(
        'ssr_template.html',
        html=html,
        initial_state=json.dumps(initial_state)
    )
```

---

## 🔄 SSR Workflow

### **1. Request Flow**

```
User Request → Nginx → API → SSR Service → Shared Library → Render → Response
```

**Steps:**

1. **User navigates** to `/scene/abc123`
2. **Nginx routes** request to API server
3. **API authenticates** user and fetches data
4. **SSR Service** imports shared library systems
5. **Systems initialize** with server-side state
6. **React renders** components to HTML string
7. **API responds** with pre-rendered HTML + hydration data
8. **Client hydrates** React components with server state

### **2. Component Rendering**

```typescript
// Shared component with SSR support
// shared/src/systems/scene/SceneViewer.tsx

export function SceneViewer({ scene, navigator }: Props) {
  // Works identically on server and client
  const [currentSlide, setCurrentSlide] = useState(scene.slides[0]);
  
  useEffect(() => {
    // Client-only effects (skip on server)
    if (typeof window === 'undefined') return;
    
    // Initialize client-side features
    setupAnimations();
  }, []);
  
  return (
    <div className="scene-viewer">
      <SlideAnimator slide={currentSlide} />
      <NavigationControls navigator={navigator} />
    </div>
  );
}

// SSR-aware system
export class SceneSystem {
  static isServer = typeof window === 'undefined';
  
  async loadScene(sceneId: string): Promise<Scene> {
    if (this.isServer) {
      // Server: Fetch from database
      return await fetchSceneFromDB(sceneId);
    } else {
      // Client: Fetch from API
      return await fetchSceneFromAPI(sceneId);
    }
  }
}
```

### **3. Hydration Process**

```html
<!-- API-generated HTML response -->
<!DOCTYPE html>
<html>
<head>
  <title>Scene View</title>
  <script>
    // Serialized state for hydration
    window.__INITIAL_STATE__ = {
      navigator: { currentContext: {...}, history: [...] },
      scene: { id: 'abc123', slides: [...] }
    };
  </script>
</head>
<body>
  <!-- Pre-rendered content -->
  <div id="root">
    <div class="scene-viewer">
      <!-- Server-rendered HTML -->
    </div>
  </div>
  
  <!-- Hydration script -->
  <script src="/bundles/portal.js"></script>
  <script>
    // Client hydrates with server state
    ReactDOM.hydrateRoot(
      document.getElementById('root'),
      <SceneViewer initialState={window.__INITIAL_STATE__} />
    );
  </script>
</body>
</html>
```

---

## 🎨 System-Specific SSR

### **Navigator System SSR**

```typescript
// API server-side
import { NavigatorSystem } from '@protogen/shared/systems/navigator';

export function ssrNavigator(userContext: CurrentContext): NavigatorState {
  const navigator = new NavigatorSystem(userContext);
  
  // Pre-initialize navigation history
  navigator.navigateTo({
    type: 'scene',
    sceneId: userContext.sceneId,
    slideIndex: 0
  });
  
  return navigator.getState(); // Serialize for client
}

// Client-side hydration
import { NavigatorSystem } from '@protogen/shared/systems/navigator';

function HydratedNavigator({ initialState }: Props) {
  const navigator = useMemo(() => 
    NavigatorSystem.hydrate(initialState),
    [initialState]
  );
  
  return <NavigatorProvider value={navigator}>...</NavigatorProvider>;
}
```

### **Scene System SSR**

```typescript
// API server-side
import { SceneSystem } from '@protogen/shared/systems/scene';

export async function ssrScene(sceneId: string): Promise<SceneState> {
  const scene = await SceneSystem.loadFromDatabase(sceneId);
  
  // Pre-render first slide
  await scene.goToSlide(0);
  
  return scene.getState();
}

// Client-side hydration
function HydratedScene({ initialState }: Props) {
  const scene = useMemo(() => 
    SceneSystem.hydrate(initialState),
    [initialState]
  );
  
  return <SceneViewer scene={scene} />;
}
```

### **Authoring System SSR**

```typescript
// Authoring system components can be server-rendered
import { GraphSceneAuthoring } from '@protogen/shared/systems/authoring';

export function ssrAuthoringInterface(userId: string, sceneId: string) {
  // Server checks permissions
  const canEdit = await checkAuthoringPermissions(userId, sceneId);
  
  if (!canEdit) {
    return <AccessDenied />;
  }
  
  // Render authoring interface
  return <GraphSceneAuthoring sceneId={sceneId} userId={userId} />;
}
```

---

## 🚀 Bundle Optimization

### **Code Splitting**

```typescript
// Dynamic imports for system modules
const NavigatorSystem = lazy(() => import('@protogen/shared/systems/navigator'));
const SceneSystem = lazy(() => import('@protogen/shared/systems/scene'));
const AuthoringSystem = lazy(() => import('@protogen/shared/systems/authoring'));

// Load only what's needed
function ScenePage() {
  return (
    <Suspense fallback={<Loading />}>
      <NavigatorSystem />
      <SceneSystem />
    </Suspense>
  );
}
```

### **Bundle Serving**

```python
# API endpoint for serving optimized bundles
@app.get("/bundles/{system}/{module}.js")
async def serve_bundle(system: str, module: str):
    """Serve optimized shared library bundles"""
    
    bundle_path = f"../shared/dist/src/systems/{system}/{module}.js"
    
    # Production: Minified, tree-shaken bundle
    # Development: Source maps included
    
    return FileResponse(
        bundle_path,
        media_type="application/javascript",
        headers={"Cache-Control": "public, max-age=31536000"}
    )
```

### **CDN Integration (Future)**

```
https://cdn.protogen.io/bundles/v1.2.3/systems/navigator.js
https://cdn.protogen.io/bundles/v1.2.3/systems/scene.js
https://cdn.protogen.io/bundles/v1.2.3/systems/authoring.js
```

---

## 📊 Performance Considerations

### **Metrics to Track**

- **Time to First Byte (TTFB)**: < 200ms
- **First Contentful Paint (FCP)**: < 1s
- **Time to Interactive (TTI)**: < 3s
- **Cumulative Layout Shift (CLS)**: < 0.1
- **Bundle Size**: Navigator < 50KB, Scene < 100KB

### **Optimization Strategies**

1. **Caching**:
   - Cache rendered HTML for public scenes
   - Cache system bundles with aggressive TTL
   - Invalidate on content updates

2. **Streaming SSR** (Future):
   - Stream HTML as it renders
   - Progressive hydration
   - Faster perceived performance

3. **Edge Rendering** (Future):
   - Deploy SSR to edge locations
   - Reduce latency globally
   - Use Cloudflare Workers or similar

4. **Selective Hydration**:
   - Only hydrate interactive components
   - Static content remains HTML
   - Reduces JavaScript execution

---

## 🔧 Development Workflow

### **Testing SSR**

```bash
# Build shared library for SSR
cd shared
npm run build

# Start API with SSR enabled
cd ../api
SSR_ENABLED=true uvicorn main:app --reload

# Test SSR endpoint
curl http://localhost:8080/scene/abc123
# Should return pre-rendered HTML
```

### **Debugging SSR**

```typescript
// Add server-side logging
export class NavigatorSystem {
  constructor(initialContext?: CurrentContext) {
    if (typeof window === 'undefined') {
      console.log('[SSR] Initializing NavigatorSystem', initialContext);
    }
    // ...
  }
}

// Check for SSR-specific issues
if (typeof window === 'undefined') {
  // Server-only code
} else {
  // Client-only code
}
```

---

## 🎯 Implementation Status

### **Phase 1: Foundation** (Complete)

- ✅ Shared library structured for SSR
- ✅ System modules with subpath exports
- ✅ Components work on server and client
- ✅ Build process generates Node-compatible bundles

### **Phase 2: API Integration** (Next)

- ⏳ API SSR service implementation
- ⏳ React server rendering setup
- ⏳ State serialization/hydration
- ⏳ Bundle serving endpoints

### **Phase 3: Optimization** (Future)

- ⏳ Caching strategy
- ⏳ Code splitting
- ⏳ Streaming SSR
- ⏳ Edge rendering
- ⏳ CDN integration

---

## 📚 Related Documentation

- **`NAVIGATOR_SYSTEMS_ARCHITECTURE.md`** - Navigator SSR integration
- **`AUTHORING_SYSTEM_ARCHITECTURE.md`** - Authoring system SSR
- **`core-foundation.md`** - Overall architecture
- **`DEVELOPMENT.md`** - Development workflow

---

## 💡 Key Takeaways

1. **Shared library is SSR-ready** - All systems can be server-rendered
2. **API serves pre-rendered HTML** - Fast initial load, SEO-friendly
3. **Hydration maintains interactivity** - Client takes over seamlessly
4. **Performance is critical** - Optimize bundles, caching, and rendering
5. **Mobile apps benefit** - Same systems work in React Native

**The SSR architecture enables Protogen to deliver fast, SEO-friendly experiences while maintaining the flexibility of a modern single-page application.** 🚀

