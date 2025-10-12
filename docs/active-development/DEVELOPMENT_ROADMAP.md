# Development Roadmap

## 🎯 **Overview**

This document outlines the comprehensive development roadmap for the Protogen platform, including completed foundational work and upcoming feature implementation priorities.

## ✅ **Phase 0: Foundation Complete**

### **Shared Library Architecture**
- [x] Monorepo structure with `@protogen/shared` package
- [x] System modules as separately loadable exports
- [x] SSR-ready architecture for API bundle serving
- [x] TypeScript strict mode with comprehensive types
- [x] Mobile app support prepared

### **Dialog System**
- [x] Extensible dialog architecture
- [x] Multiple dialog types (modal, drawer, toast, confirmation)
- [x] Dialog state management with singleton pattern
- [x] React hooks for dialog interactions (`useDialog`)
- [x] Integration with other systems

### **Scene-First Routing**
- [x] SceneRouter for context-to-scene mapping
- [x] Default system scenes (Home, Explore, Profile, Settings)
- [x] SceneContainer component with dynamic rendering
- [x] URL synchronization with Navigator context
- [x] Scene override system for custom routing

### **Toolbar & Menu System**
- [x] Multi-edge toolbar support (top, bottom, left, right)
- [x] Drawer system with overlay and positioning
- [x] Menu configuration service
- [x] Plugin architecture for system extensions
- [x] Integration with Navigator and Dialog systems
- [x] Responsive toolbar behavior

### **Navigator System Foundation**
- [x] Singleton Navigator System pattern
- [x] Event-driven navigation with proper propagation
- [x] Context-based navigation
- [x] History tracking with back/forward
- [x] URL synchronization service

---

## ✅ **Phase 1: Navigation History & Breadcrumbs UI** *(Completed)*

#### **1.1 Breadcrumb System**
- [x] **useBreadcrumbs Hook**
  - Compute breadcrumb trail from current context
  - Map contextPath to human-readable labels
  - Support custom breadcrumb overrides
  - Handle scene/deck/slide breadcrumbs
  - Ellipsis for long trails

- [x] **Breadcrumb Components**
  - `Breadcrumbs.tsx` - Main breadcrumb container
  - `BreadcrumbItem.tsx` - Individual breadcrumb item
  - Clickable navigation to previous locations
  - Responsive design for mobile
  - Accessible with ARIA labels

#### **1.2 Navigation History UI**
- [x] **NavigationHistory Component**
  - Display recent navigation entries
  - Back/forward navigation buttons
  - History list with timestamps
  - Clear history option
  - Click any entry to navigate
  - Integration with existing `useNavigationHistory()` hook

#### **1.3 Toolbar Integration**
- [x] Replace generic "Current Context" indicator
- [x] Breadcrumbs in top toolbar (ToolbarItemRenderer)
- [x] Responsive behavior on small screens
- [x] Accessibility (ARIA labels, keyboard nav)

#### **Deliverables**
- ✅ Working breadcrumb navigation
- ✅ Visual navigation history interface
- ✅ Toolbar integration complete
- ✅ URL synchronization with breadcrumbs

---

## 🧙 **Phase 2: Wizard System Extraction** *(Core Complete)*

### **Status: Phases 2.1-2.3 Completed**

#### **2.1 Core Wizard System** ✅
- [x] Review existing admin wizard implementation
- [x] Extract WorkflowWizard → Wizard component
- [x] Create comprehensive type system
- [x] **Wizard Data Models**
  - `WizardConfig` interface with steps and options
  - `WizardStep` interface for individual steps
  - `WizardStepValidation` for step validation
  - `WizardState` for wizard state management
  - `WizardContext` for step component props

- [x] **Wizard State Management**
  - Current step tracking
  - Step completion validation with async support
  - Form data persistence across steps
  - Step navigation (next/previous)
  - Step lifecycle hooks (onEnter, onExit, onNext, onBack, onSave)

- [x] **WizardSystem Class**
  - Template registration and management
  - Validator registry
  - State persistence hooks
  - Instance management

#### **2.2 Dialog System Integration** ✅
- [x] WizardDialogService for opening wizards in dialogs
- [x] Support for modal, drawer, and full-screen modes
- [x] Integration with dialogSystem.openModal/openDrawer
- [x] Configurable dialog options (size, position, close behavior)

#### **2.3 Validation Framework** ✅
- [x] ValidationService with centralized validation
- [x] Built-in validators (required, email, url, minLength, maxLength, pattern, range, uniqueSlug)
- [x] Support for sync and async validators
- [x] Validator composition with combine()
- [x] Custom validator registration

#### **2.4 Enhanced Step Components** (Deferred)
- [ ] Extract reusable step primitives (FormStep, SelectionStep, ReviewStep)
- [ ] Advanced guidance UI (tooltips, focus ring, animations)
- [ ] Conditional field display within steps

#### **Deliverables**
- ✅ Extracted wizard system in shared library (`@protogen/shared/systems/flow/wizard`)
- ✅ Dialog integration complete
- ✅ Flow system integration (wizard as sub-module)
- ✅ Validation framework with built-in and custom validators
- 🔄 Reusable step components (deferred to Phase 2.4)

---

## ⚙️ **Phase 3: Admin UI for Toolbar Configuration**

### **Priority: Medium**
**Estimated Time: 2 weeks**

#### **3.1 Menu Configuration Interface**
- [ ] **CRUD Operations**
  - Create/edit/delete toolbar configs
  - Create/edit/delete menu items
  - Reorder menu items
  - Preview changes

- [ ] **Visual Menu Builder**
  - Drag-and-drop menu item ordering
  - Visual toolbar editor
  - Menu item property editors
  - Icon selection interface

#### **3.2 Permission Management**
- [ ] Role-based menu visibility
- [ ] Permission-based menu items
- [ ] Admin-only configuration access
- [ ] Menu item access control

#### **3.3 Configuration Storage**
- [ ] Database schema for toolbar configs
- [ ] API endpoints for config management
- [ ] Config versioning and history
- [ ] Import/export functionality

#### **Deliverables**
- Admin interface for toolbar management
- Dynamic menu configuration
- Permission-based menu visibility
- Configuration persistence

---

## 💬 **Phase 4: Bookmarks & Comments System**

### **Priority: Medium**
**Estimated Time: 2-3 weeks**

#### **4.1 Bookmarks System**
- [ ] **User Bookmarks**
  - Bookmark any context (scene, node, etc.)
  - Organize bookmarks into folders
  - Search and filter bookmarks
  - Quick access from toolbar

- [ ] **Bookmark Management**
  - Create/edit/delete bookmarks
  - Share bookmarks with users/groups
  - Bookmark collections
  - Recent bookmarks list

#### **4.2 Comments System**
- [ ] **Context-Anchored Comments**
  - Comment on scenes, nodes, slides
  - Thread-based discussions
  - Reply to comments
  - Comment moderation

- [ ] **Comment Features**
  - Rich text editing
  - Mentions (@username)
  - Reactions/likes
  - Comment visibility control

#### **4.3 Notification System**
- [ ] Comment reply notifications
- [ ] Mention notifications
- [ ] Notification preferences
- [ ] Notification history

#### **4.4 Dialog Integration**
- [ ] Comment threads in dialogs
- [ ] Comment composition in dialogs
- [ ] Notification panel in dialogs
- [ ] Quick reply interface

#### **Deliverables**
- Working bookmarks system
- Context-anchored comments
- Notification system
- Dialog-based engagement UI

---

## 🌊 **Phase 5: Flow System Implementation**

### **Priority: Medium**
**Estimated Time: 3-4 weeks**

#### **5.1 Flow System Core**
- [ ] **Flow Data Models**
  - `Flow` interface with scene association
  - `FlowStep` interface for guided experiences
  - `FlowTransition` for step transitions
  - Database schema for flows

- [ ] **Flow State Management**
  - Flow session management
  - Step progression tracking
  - Branching logic implementation
  - Flow completion handling

#### **5.2 Flow Navigation**
- [ ] **Step Management**
  - Next/previous step navigation
  - Step completion validation
  - Flow progress indicators
  - Step-specific UI controls

- [ ] **Flow Transitions**
  - Step-to-step animations
  - Scene transitions within flows
  - Progress visualization
  - Conditional branching

#### **5.3 Wizard Integration**
- [ ] Wizard-powered flow steps
- [ ] Form validation in flows
- [ ] Multi-step data collection
- [ ] Flow-wizard coordination

#### **5.4 Scene Integration**
- [ ] Flow steps within scenes
- [ ] Scene-specific flow behaviors
- [ ] Flow-guided scene navigation
- [ ] Scene context in flows

#### **Deliverables**
- Working Flow System
- Wizard integration complete
- Scene-flow coordination
- Flow authoring tools

---

## 🎭 **Phase 6: Enhanced Engagement System**

### **Priority: Low**
**Estimated Time: 2-3 weeks**

#### **6.1 Advanced Comment Features**
- [ ] Comment threading depth
- [ ] Comment search and filtering
- [ ] Comment analytics
- [ ] Comment moderation tools

#### **6.2 Collaborative Features**
- [ ] Real-time collaboration indicators
- [ ] Shared navigation sessions
- [ ] Collaborative annotations
- [ ] User presence awareness

#### **6.3 Analytics Integration**
- [ ] User engagement tracking
- [ ] Navigation pattern analysis
- [ ] Comment engagement metrics
- [ ] Flow completion analytics

#### **Deliverables**
- Enhanced engagement features
- Collaboration tools
- Analytics dashboard
- Moderation interface

---

## 🏗️ **Phase 7: Unified Portal Migration**

### **Priority: Low**
**Estimated Time: 4-6 weeks**

#### **7.1 Admin Functionality Migration**
- [ ] **Admin Components**
  - Migrate admin components to portal
  - Admin-specific UI components
  - Admin navigation and layout
  - Admin dashboard

- [ ] **Admin Services**
  - Migrate admin services and logic
  - Admin API integration
  - Admin state management
  - Admin authentication

#### **7.2 Role-Based Access Control**
- [ ] **User Role Management**
  - User role assignment
  - Role-based UI rendering
  - Permission-based access control
  - Admin/user mode switching

#### **7.3 Unified Experience**
- [ ] **Single Portal Interface**
  - Unified navigation
  - Consistent user experience
  - Role-aware UI components
  - Seamless mode switching

#### **Deliverables**
- Unified Portal with admin functionality
- Role-based access control
- Consistent user experience
- Admin migration complete

---

## 📅 **Implementation Timeline**

### **Total Duration: 16-20 weeks**

- **Phase 0**: Foundation Complete ✅
- **Phase 1**: Navigation History & Breadcrumbs (1 week) 🚀 **CURRENT**
- **Phase 2**: Wizard System Extraction (2-3 weeks)
- **Phase 3**: Admin UI for Toolbar Configuration (2 weeks)
- **Phase 4**: Bookmarks & Comments System (2-3 weeks)
- **Phase 5**: Flow System Implementation (3-4 weeks)
- **Phase 6**: Enhanced Engagement System (2-3 weeks)
- **Phase 7**: Unified Portal Migration (4-6 weeks)

### **Key Milestones**
- **Now**: Navigation History & Breadcrumbs
- **Week 3**: Wizard System extracted and integrated
- **Week 5**: Admin toolbar configuration UI complete
- **Week 8**: Bookmarks & Comments operational
- **Week 12**: Flow System complete
- **Week 15**: Enhanced Engagement features
- **Week 21**: Unified Portal complete

## 🎯 **Success Criteria**

### **Technical Success**
- [x] Shared library architecture established
- [x] Dialog system operational
- [x] Scene-first routing working
- [x] Toolbar system functional
- [ ] All systems integrated successfully
- [ ] Performance maintained or improved
- [ ] Code quality and maintainability
- [ ] Comprehensive testing coverage

### **User Experience Success**
- [x] Modern, responsive UI
- [x] Smooth navigation between scenes
- [ ] Intuitive breadcrumb navigation
- [ ] Wizard-guided data input
- [ ] Context-aware bookmarks and comments
- [ ] Consistent interface across all modes
- [ ] Responsive design across devices

### **Business Success**
- [ ] Reduced development overhead
- [ ] Improved maintainability
- [ ] Enhanced scalability
- [ ] Better user engagement

## 💡 **Next Steps**

The immediate next step is **Phase 1: Navigation History & Breadcrumbs UI**:

1. Create `useBreadcrumbs` hook for trail computation
2. Build breadcrumb React components
3. Create NavigationHistory component
4. Integrate breadcrumbs into Toolbar
5. Style and polish with accessibility

**The roadmap provides a clear path forward for building the future of Protogen with sophisticated navigation, dynamic content, and unified user experience.** 🚀
