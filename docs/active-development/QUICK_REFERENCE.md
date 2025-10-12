# Quick Reference for Development Sessions

## 🚀 **Start Here for New Development Sessions**

### **1. Check Current Status**
```bash
# Quick status check
cat docs/active-development/DEVELOPMENT_STATUS.md
cat docs/active-development/DEVELOPMENT_ROADMAP.md
```

### **2. Review Active Development**
```bash
# See what's being worked on
ls docs/active-development/
```

### **3. Key Files to Review**
- `DEVELOPMENT_STATUS.md` - Current implementation status
- `DEVELOPMENT_ROADMAP.md` - Roadmap and priorities
- `DEVELOPMENT_WORKFLOW.md` - Development workflow guide
- `README.md` - Active development overview

## 🎯 **Current Priority: Navigation History & Breadcrumbs UI**

### **Foundation Complete** ✅
- Shared Library Architecture (`@protogen/shared`)
- Dialog System (modal, drawer, toast, confirmation)
- Scene-First Routing with SceneRouter
- Toolbar & Menu System (multi-edge, drawers, plugins)
- Navigator System (singleton pattern, event-driven)

### **Current Phase: Phase 1**
Navigation History & Breadcrumbs UI implementation to provide visual navigation feedback and clickable breadcrumb trails.

---

## 📦 **Shared Library System Locations**

### **Import Paths**
```typescript
// Navigator System
import { 
  navigatorSystem, 
  useNavigator, 
  useCurrentContext,
  useNavigationHistory 
} from '@protogen/shared/systems/navigator';

// Scene System
import { 
  sceneRouter,
  useScene,
  useSceneForContext,
  isSystemScene,
  getSystemSceneComponent
} from '@protogen/shared/systems/scene';

// Dialog System
import {
  dialogSystem,
  useDialog
} from '@protogen/shared/systems/dialog';

// Toolbar System
import {
  toolbarSystem,
  useToolbar,
  useToolbarDrawer,
  ToolbarContainer,
  ToolbarDrawer
} from '@protogen/shared/systems/toolbar';

// Authoring System
import {
  authoringSystem,
  useAuthoring
} from '@protogen/shared/systems/authoring';

// Slide System
import {
  slideSystem,
  useSlide
} from '@protogen/shared/systems/slide';

// Components
import { Button } from '@protogen/shared/components/ui/button';
import { Card } from '@protogen/shared/components/ui/card';
// ... other shared components
```

### **System Locations**
```
shared/src/
├── systems/
│   ├── navigator/          # Navigation and routing
│   ├── scene/              # Scene management
│   ├── dialog/             # Dialog system
│   ├── toolbar/            # Toolbar and menus
│   ├── authoring/          # Content authoring
│   ├── slide/              # Slide management
│   └── flow/               # Flow system (future)
├── components/             # Reusable UI components
├── hooks/                  # Shared React hooks
├── services/               # API and service layer
└── types/                  # TypeScript type definitions
```

---

## 🎨 **Key React Hooks**

### **Navigator Hooks**
```typescript
// Main navigator hook
const { navigateTo, navigateBack, currentContext, history } = useNavigator();

// Current context only
const currentContext = useCurrentContext();

// Navigation history
const { entries, canGoBack, canGoForward, navigateBack } = useNavigationHistory();

// Future: Breadcrumbs hook
const breadcrumbs = useBreadcrumbs();
```

### **Dialog Hooks**
```typescript
const {
  openModal,
  openDrawer,
  openToast,
  openConfirmation,
  closeDialog,
  closeAll
} = useDialog();

// Example usage
openModal({
  title: 'Edit Profile',
  content: <ProfileForm />,
  size: 'large'
});

openToast('Changes saved!', { variant: 'success' });
```

### **Toolbar Hooks**
```typescript
const {
  openDrawer,
  closeDrawer,
  toggleDrawer,
  isDrawerOpen
} = useToolbar();

// Drawer-specific hook
const { isOpen, open, close, toggle } = useToolbarDrawer('main-nav-drawer');
```

### **Scene Hooks**
```typescript
// Get scene for current context
const sceneId = useSceneForContext();

// Load scene data
const { currentScene, isLoading } = useScene(sceneId);

// Check if system scene
const isSystem = isSystemScene(sceneId);
```

---

## 🎯 **TypeScript Interfaces**

### **Navigator Types**
```typescript
interface NavigationTarget {
  type: 'scene' | 'deck' | 'slide' | 'context';
  id: string;
  slug?: string;
  contextPath?: string;
  slideIndex?: number;
}

interface CurrentContext {
  sceneId: string | null;
  sceneSlug: string | null;
  deckId: string | null;
  deckSlug: string | null;
  slideId: string | null;
  contextPath?: string;
  timestamp: number;
}

interface NavigationEntry {
  id: string;
  target: NavigationTarget;
  context: CurrentContext;
  timestamp: number;
}
```

### **Dialog Types**
```typescript
interface ModalDialogConfig {
  type: 'modal';
  title?: string;
  content: React.ReactNode;
  size?: 'small' | 'medium' | 'large' | 'fullscreen';
  closeOnOverlayClick?: boolean;
  showCloseButton?: boolean;
}

interface ToastConfig {
  type: 'toast';
  message: string;
  variant?: 'default' | 'success' | 'warning' | 'error';
  duration?: number;
}
```

### **Toolbar Types**
```typescript
interface ToolbarConfig {
  id: string;
  edge?: 'top' | 'bottom' | 'left' | 'right';
  sections: ToolbarSection[];
  style?: ToolbarStyle;
}

interface ToolbarDrawer {
  id: string;
  edge: 'left' | 'right' | 'top' | 'bottom';
  width?: string;
  height?: string;
  overlay?: boolean;
  closeOnClickOutside?: boolean;
  items: DrawerItem[];
}
```

---

## 🔧 **Development Environment**

### **Start Development**
```bash
# Start Docker services (always use Docker)
docker-compose up -d

# Start development servers (run from root)
npm run dev

# This runs concurrently:
# - portal: http://localhost:3000
# - admin: http://localhost:3001
# - shared library watch mode
```

### **Build Shared Library**
```bash
cd shared
npm run build

# Watch mode for development
npm run dev
```

### **Database Management**
```bash
# Run migrations
docker exec -it protogen-api php artisan migrate

# Check status
docker exec -it protogen-api php artisan migrate:status

# Seed database
docker exec -it protogen-api php artisan db:seed
```

### **Frontend Development**
```bash
# Portal development
cd portal
npm run dev

# Admin development
cd admin
npm run dev

# Shared library development
cd shared
npm run dev
```

---

## 📚 **Key Documentation**

### **Architecture Documents**
- `ORCHESTRATOR_SYSTEM_ARCHITECTURE.md` - System coordination
- `NAVIGATOR_SYSTEMS_ARCHITECTURE.md` - Navigation architecture
- `DIALOG_SYSTEM_ARCHITECTURE.md` - Dialog system
- `SCENE_FIRST_ROUTING.md` - Scene routing
- `AUTHORING_SYSTEM_ARCHITECTURE.md` - Authoring system
- `SSR_ARCHITECTURE.md` - Server-side rendering

### **Implementation Guides**
- `SHARED_LIBRARY_MIGRATION_GUIDE.md` - Shared library migration
- `TYPESCRIPT_FIX_GUIDE.md` - TypeScript error fixing
- `DEVELOPMENT_WORKFLOW.md` - Development workflow
- `TESTING_CHECKLIST.md` - Testing procedures

### **Roadmaps**
- `DEVELOPMENT_ROADMAP.md` - Overall development plan
- `CENTRAL_GRAPH_ROADMAP.md` - Graph system evolution

---

## 🎯 **Success Criteria**

### **Foundation Success** ✅
- [x] Shared library architecture established
- [x] Dialog system operational
- [x] Scene-first routing working
- [x] Toolbar system functional
- [x] Navigator singleton pattern
- [x] URL synchronization working

### **Phase 1 Success** (Current)
- [ ] Breadcrumb trail displays correctly
- [ ] Clickable breadcrumb navigation
- [ ] Navigation history UI functional
- [ ] Back/forward buttons working
- [ ] Toolbar integration complete

### **Future Phase Success**
- [ ] Wizard system extracted
- [ ] Admin toolbar configuration UI
- [ ] Bookmarks and comments operational
- [ ] Flow system implemented

---

## 🚨 **Common Tasks**

### **Adding a New System Module**
1. Create system directory in `shared/src/systems/[system-name]/`
2. Implement system class with singleton pattern
3. Create React hooks for system interaction
4. Add to `shared/package.json` exports
5. Export from `shared/src/systems/[system-name]/index.ts`
6. Document in architecture docs

### **Creating a New Dialog**
```typescript
// In your component
const { openModal } = useDialog();

const handleOpenDialog = () => {
  openModal({
    title: 'My Dialog',
    content: <MyDialogContent />,
    size: 'medium',
    closeOnOverlayClick: true
  });
};
```

### **Adding a Toolbar Menu Item**
```typescript
// In App.tsx or toolbar configuration
toolbarSystem.injectMenuItem('main-menu', {
  type: 'nav-item',
  label: 'New Item',
  icon: 'star',
  action: { type: 'navigate-context', contextPath: '/new-item' }
});
```

### **Navigating to a New Context**
```typescript
const { navigateTo } = useNavigator();

navigateTo({
  type: 'context',
  id: 'context',
  contextPath: '/path/to/content'
});
```

---

## 🚀 **Ready to Start Development**

With the foundation complete and comprehensive documentation available, you're ready to implement Phase 1: Navigation History & Breadcrumbs UI.

**Next immediate steps:**
1. Create `useBreadcrumbs` hook
2. Build `Breadcrumbs` component
3. Create `NavigationHistory` component
4. Integrate with Toolbar
5. Test and polish

The foundation is solid, the path is clear, and the success criteria are well-defined. Time to build! 🎉
