# Shared Library Migration Guide

**Date**: October 11, 2025  
**Impact**: All developers  
**Status**: Migration Complete

---

## 📋 Summary

This guide documents the architectural realignment where **authoring**, **navigator**, **scene**, and **slide** systems were consolidated into the `@protogen/shared` library as system modules.

### **What Changed**

| Before | After |
|--------|-------|
| `authoring/` (standalone project) | `shared/src/systems/authoring/` |
| `portal/src/systems/navigator/` | `shared/src/systems/navigator/` |
| `portal/src/systems/scene/` | `shared/src/systems/scene/` |
| `portal/src/systems/slide/` | `shared/src/systems/slide/` |
| `@protogen/authoring` package | `@protogen/shared/systems/authoring` |

### **Why This Change**

1. **Unified Core UI Library**: Shared library is the single source of truth
2. **SSR-Ready**: API can server-render all systems
3. **Mobile App Support**: Systems work in React Native
4. **Better Code Sharing**: Eliminate duplication
5. **Cleaner Architecture**: Systems as loadable modules

---

## 🔄 Import Path Changes

### **Navigator System**

```typescript
// ❌ OLD (portal-specific)
import { useNavigator } from '../../systems/navigator';
import { NavigatorSystem } from '@protogen/navigator';

// ✅ NEW (shared library)
import { useNavigator, NavigatorSystem } from '@protogen/shared/systems/navigator';
```

### **Scene System**

```typescript
// ❌ OLD  
import { useScene, SceneSystem } from '../../systems/scene';

// ✅ NEW
import { useScene, SceneSystem } from '@protogen/shared/systems/scene';
```

### **Slide System**

```typescript
// ❌ OLD
import { useSlide, SlideSystem } from '../../systems/slide';

// ✅ NEW
import { useSlide, SlideSystem } from '@protogen/shared/systems/slide';
```

### **Authoring System**

```typescript
// ❌ OLD
import { GraphSceneAuthoring } from '@protogen/authoring';
import { SceneTypeManager } from '@protogen/authoring';

// ✅ NEW
import { GraphSceneAuthoring, SceneTypeManager } from '@protogen/shared/systems/authoring';

// For authoring components specifically:
import { GraphSceneAuthoring } from '@protogen/shared/systems/authoring/components';

// For authoring hooks:
import { useAuthoringState } from '@protogen/shared/systems/authoring/hooks';
```

---

## 📦 Package Changes

### **Portal package.json**

```diff
{
  "dependencies": {
-   "@protogen/authoring": "workspace:*",
    "@protogen/shared": "workspace:*"
  }
}
```

### **Admin package.json**

```diff
{
  "dependencies": {
-   "@protogen/authoring": "workspace:*",
    "@protogen/shared": "workspace:*"
  }
}
```

### **Root package.json**

```diff
{
  "scripts": {
-   "dev:authoring": "cd authoring && npm run dev",
-   "build:authoring": "cd authoring && npm run build",
-   "clean:authoring": "cd authoring && rm -rf dist",
-   "lint:authoring": "cd authoring && npm run lint",
-   "dev:all": "concurrently \"npm run dev\" \"npm run dev:admin\" \"npm run dev:portal\" \"npm run dev:authoring\"",
+   "dev:all": "concurrently \"npm run dev\" \"npm run dev:admin\" \"npm run dev:portal\"",
  }
}
```

---

## 🏗️ Directory Structure Changes

### **Before**

```
protogen/
├── authoring/              # Standalone project
│   ├── src/
│   ├── package.json
│   └── vite.config.ts
├── portal/
│   └── src/
│       └── systems/
│           ├── navigator/
│           ├── scene/
│           └── slide/
└── shared/
    └── src/
        ├── components/
        └── hooks/
```

### **After**

```
protogen/
├── portal/
│   └── src/
│       └── components/
└── shared/
    └── src/
        ├── systems/         # ✨ NEW
        │   ├── authoring/   # ✨ Moved from root
        │   ├── navigator/   # ✨ Moved from portal
        │   ├── scene/       # ✨ Moved from portal
        │   └── slide/       # ✨ Moved from portal
        ├── components/
        └── hooks/
```

---

## 🔧 Development Workflow Changes

### **Running Dev Environment**

```bash
# ❌ OLD: Start authoring separately
npm run dev:authoring  # Port 3002

# ✅ NEW: Authoring is in shared library, no separate dev server
# Just run portal or admin
docker compose up  # Preferred
# OR
npm run dev:portal  # Port 3000
npm run dev:admin   # Port 3001
```

### **Building**

```bash
# ❌ OLD: Build authoring separately
npm run build:authoring

# ✅ NEW: Build shared library (includes authoring)
cd shared && npm run build

# OR build all from root
npm run build:all
```

### **Linting**

```bash
# ❌ OLD
npm run lint:authoring

# ✅ NEW
npm run lint:shared  # Lints all of shared including systems
```

---

## 📝 Code Migration Examples

### **Example 1: Portal Scene Page**

```typescript
// Before: portal/src/components/pages/ScenePage.tsx
import { useNavigator } from '../../systems/navigator';
import { useScene } from '../../systems/scene';

// After
import { useNavigator } from '@protogen/shared/systems/navigator';
import { useScene } from '@protogen/shared/systems/scene';

export function ScenePage() {
  const { navigateTo } = useNavigator();
  const { currentScene } = useScene();
  
  // Rest of component unchanged
}
```

### **Example 2: Admin Authoring Interface**

```typescript
// Before: admin/src/App.tsx
import { SceneTypeManager, GraphSceneAuthoring } from '@protogen/authoring';

// After
import { SceneTypeManager } from '@protogen/shared/systems/authoring';
import { GraphSceneAuthoring } from '@protogen/shared/systems/authoring/components';

export function App() {
  return (
    <SceneTypeManager>
      <GraphSceneAuthoring sceneId="abc" />
    </SceneTypeManager>
  );
}
```

### **Example 3: Shared Components Using Systems**

```typescript
// Before: shared/src/components/NavigationBar.tsx
// ERROR: Can't import from portal/src/systems!

// After
import { useNavigator } from '@protogen/shared/systems/navigator';

export function NavigationBar() {
  const { currentContext, goBack } = useNavigator();
  
  return <nav>...</nav>;
}
```

---

## 🎯 Migration Checklist

### **For Each Component File**

- [ ] Update navigator imports to `@protogen/shared/systems/navigator`
- [ ] Update scene imports to `@protogen/shared/systems/scene`
- [ ] Update slide imports to `@protogen/shared/systems/slide`
- [ ] Update authoring imports to `@protogen/shared/systems/authoring`
- [ ] Remove any relative path imports (`../../systems/...`)
- [ ] Test component builds successfully
- [ ] Test component runs without errors

### **For Each Package**

- [ ] Remove `@protogen/authoring` from `package.json` dependencies
- [ ] Run `npm install` to update lock file
- [ ] Run `npm run build` to verify builds work
- [ ] Run `npm run lint` to check for issues
- [ ] Run `npm run typecheck` to verify TypeScript

### **For Development Environment**

- [ ] Remove authoring dev server from `docker-compose.yml` (if exists)
- [ ] Update any documentation referencing port 3002
- [ ] Update any environment variables referencing authoring
- [ ] Test `docker compose up` works correctly
- [ ] Verify portal loads at http://localhost:3000
- [ ] Verify admin loads at http://localhost:3001

---

## 🐛 Common Issues & Solutions

### **Issue: Cannot find module '@protogen/authoring'**

**Solution**:

```typescript
// Change from:
import { Something } from '@protogen/authoring';

// To:
import { Something } from '@protogen/shared/systems/authoring';
```

### **Issue: Module not found: '@protogen/shared/systems/navigator'**

**Solution**:

1. Check `shared/package.json` has correct exports:
   ```json
   "./systems/navigator": {
     "types": "./dist/src/systems/navigator/index.d.ts",
     "import": "./dist/src/systems/navigator/index.js"
   }
   ```

2. Build shared library:
   ```bash
   cd shared && npm run build
   ```

3. Reinstall dependencies:
   ```bash
   cd portal && npm install
   ```

### **Issue: TypeScript can't find types**

**Solution**:

1. Ensure shared library is built: `cd shared && npm run build`
2. Check TypeScript can resolve workspace paths
3. Restart TypeScript server in your IDE
4. Check `tsconfig.json` paths configuration

### **Issue: Circular dependency warning**

**Solution**:

If you see circular dependencies in authoring components:

```typescript
// In shared/src/systems/authoring/components/MyComponent.tsx

// ❌ DON'T: Import from @protogen/shared (circular)
import { Button } from '@protogen/shared/components';

// ✅ DO: Use relative imports within shared
import { Button } from '../../../components/Button';
```

---

## 📚 Additional Resources

- **`AUTHORING_SYSTEM_ARCHITECTURE.md`** - Authoring system documentation
- **`NAVIGATOR_SYSTEMS_ARCHITECTURE.md`** - Navigator system documentation  
- **`SSR_ARCHITECTURE.md`** - Server-side rendering guide
- **`DEVELOPMENT.md`** - Updated development workflow
- **`README.md`** - Updated project structure

---

## 🎉 Benefits After Migration

### **For Developers**

- ✅ Single import path for all systems: `@protogen/shared/systems/*`
- ✅ No confusion about where to find code
- ✅ Better TypeScript autocomplete
- ✅ Faster builds (no duplicate dependencies)

### **For the Project**

- ✅ SSR-ready architecture for performance
- ✅ Mobile app integration feasible
- ✅ Cleaner monorepo structure
- ✅ Better code sharing and reuse
- ✅ Future-proof for scaling

### **For Users**

- ✅ Faster initial page loads (SSR)
- ✅ Better SEO (server-rendered content)
- ✅ More consistent experience across apps
- ✅ Future mobile app support

---

## ❓ Questions?

If you encounter issues not covered in this guide:

1. Check `docs/active-development/TYPESCRIPT_FIX_GUIDE.md`
2. Review `docs/active-development/FINAL_SESSION_REPORT.md`
3. Check existing import patterns in `portal/src/` or `admin/src/`
4. Ask the team in the development channel

---

**Migration completed successfully on October 11, 2025** ✅

