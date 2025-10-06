# Unified Portal Design

## 🎯 **Overview**

The Unified Portal represents the evolution of Protogen from separate user-facing and admin-facing applications into a single, comprehensive platform that serves all user types through role-based access control and modular system architecture.

## 🏗️ **Current State Analysis**

### **Existing Architecture**
```
┌─────────────────────────────────────────────────────────────────┐
│                    CURRENT ARCHITECTURE                        │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │   PORTAL        │  │   ADMIN         │  │   SHARED        │  │
│  │   (User-Facing) │  │   (Admin-Facing)│  │   LIBRARY       │  │
│  │                 │  │                 │  │                 │  │
│  │ • Content View  │  │ • Content Mgmt │  │ • Components    │  │
│  │ • Community     │  │ • Scene Author  │  │ • Types         │  │
│  │ • Navigation    │  │ • Deck Mgmt     │  │ • Services      │  │
│  │ • Feedback      │  │ • User Mgmt     │  │ • Theme System  │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
│           │                     │                     │         │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │   API BACKEND   │  │   AUTH SYSTEM   │  │   POLICY SYSTEM │  │
│  │   (Laravel)     │  │   (Multi-role)  │  │   (Standing)    │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### **Key Findings**
- **Portal**: User-facing content consumption with basic community features
- **Admin**: Comprehensive content management and authoring tools
- **Shared Library**: Common components, types, and services
- **Authentication**: Role-based system with standing/permissions
- **API Backend**: Laravel-based with multi-tenant support

## 🎯 **Unified Portal Architecture**

### **Target Architecture**
```
┌─────────────────────────────────────────────────────────────────┐
│                    UNIFIED PORTAL ARCHITECTURE                 │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                    UNIFIED PORTAL                          │ │
│  │                                                             │ │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │ │
│  │  │   USER MODE     │  │   ADMIN MODE    │  │   TENANT    │ │ │
│  │  │   (Public)      │  │   (Authoring)   │  │   MODE      │ │ │
│  │  │                 │  │                 │  │   (Mgmt)    │ │ │
│  │  │ • Content View  │  │ • Scene Author  │  │ • User Mgmt │ │ │
│  │  │ • Community     │  │ • Deck Mgmt     │  │ • Analytics │ │ │
│  │  │ • Navigation    │  │ • Flow Author   │  │ • Settings  │ │ │
│  │  │ • Engagement    │  │ • Context Mgmt  │  │ • Policies  │ │ │
│  │  └─────────────────┘  └─────────────────┘  └─────────────┘ │ │
│  │                                                             │ │
│  │  ┌─────────────────────────────────────────────────────────┐ │ │
│  │  │              MODULAR SYSTEMS                           │ │ │
│  │  │                                                         │ │ │
│  │  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────────┐   │ │ │
│  │  │  │ NAVIGATOR   │ │   CONTEXT   │ │   FLOW SYSTEM   │   │ │ │
│  │  │  │   SYSTEM    │ │   SYSTEM    │ │   (Enhanced)    │   │ │ │
│  │  │  └─────────────┘ └─────────────┘ └─────────────────┘   │ │ │
│  │  │                                                         │ │ │
│  │  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────────┐   │ │ │
│  │  │  │ENGAGEMENT   │ │ORCHESTRATOR │ │   AUTH SYSTEM   │   │ │ │
│  │  │  │   SYSTEM    │ │   SYSTEM    │ │   (Enhanced)    │   │ │ │
│  │  │  └─────────────┘ └─────────────┘ └─────────────────┘   │ │ │
│  │  └─────────────────────────────────────────────────────────┘ │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                    SHARED FOUNDATION                       │ │
│  │                                                             │ │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────────┐       │ │
│  │  │   SHARED    │ │   API       │ │   POLICY        │       │ │
│  │  │   LIBRARY   │ │   BACKEND   │ │   SYSTEM        │       │ │
│  │  │(Enhanced)   │ │(Laravel)    │ │(Standing)       │       │ │
│  │  └─────────────┘ └─────────────┘ └─────────────────┘       │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## 🧭 **Navigator System (Expanded)**

### **Purpose**
The Navigator System serves as the connective backbone for scene traversal and system interoperability, managing navigation state, transitions, and contextual awareness.

### **Core Modules**

#### **1. Context Module**
Manages user traversal and contextual awareness:
- **Navigation Tracks**: Per-scene navigation history and breadcrumbs
- **Current Context**: Active scene, track, and anchor/focal point
- **Named Contexts**: Admin-created contexts for targeting and linking
- **Cross-Scene History**: Track navigation patterns across scenes

#### **2. Flow Module**
Coordinates guided experiences and flow management:
- **Flow State Management**: Active flows, step progression, and branching
- **Transition Overrides**: Per-step transition customization
- **Flow-Specific Surfaces**: Custom UI elements for flow steps
- **Branching Logic**: Dynamic flow paths based on user choices

#### **3. Transitions Module**
Manages navigation transitions and animations:
- **Scene Transitions**: Smooth transitions between scenes
- **Context Transitions**: Context-aware transition effects
- **Flow Transitions**: Guided transition sequences
- **Slide Transitions**: Coordinate slide state transitions within scenes
- **Tweening Integration**: Orchestrate smooth slide animations and state changes

### **Navigator System Interface**
```typescript
interface NavigatorSystem {
  // Core Navigation
  navigateTo(target: NavigationTarget): Promise<void>;
  navigateBack(): Promise<void>;
  navigateForward(): Promise<void>;
  canGoBack(): boolean;
  canGoForward(): boolean;
  
  // Context Management
  getCurrentContext(): NavigationEntry | null;
  setCurrentContext(entry: NavigationEntry): void;
  
  // History Management
  getNavigationHistory(): NavigationTrack[];
  getCurrentTrack(): NavigationTrack | null;
  startNewTrack(initialTarget: NavigationTarget): Promise<void>;
  
  // Slide Integration
  navigateToSlide(slideId: string): Promise<void>;
  getCurrentSlide(): SlideState | null;
  getSlideHistory(): SlideState[];
  
  // Event System
  on(event: NavigatorEvent, handler: EventHandler): void;
  emit(event: NavigatorEvent, data: any): void;
}
```

## 🎬 **Slide System Integration**

### **Purpose**
The Navigator System integrates with the Slide System to provide seamless navigation between slide states within scenes.

### **Features**
- **Slide Navigation**: Navigate between slides within a scene
- **Slide State Management**: Track current slide and slide history
- **Slide Transitions**: Coordinate slide state transitions
- **Slide Context**: Maintain context across slide changes

### **Navigator-Slide Integration**
```typescript
interface SlideState {
  id: string;
  sceneId: string;
  slideIndex: number;
  nodeStates: NodeSlideState[];
  transitionConfig?: TweeningConfig;
}

interface NodeSlideState {
  nodeId: string;
  position: { x: number; y: number };
  scale: { x: number; y: number };
  rotation: number;
  opacity: number;
  visible: boolean;
}
```

### **Slide Navigation Events**
- `slideChange`: Emitted when navigating between slides
- `slideTransitionStart`: Emitted when slide transition begins
- `slideTransitionComplete`: Emitted when slide transition completes

## 🎯 **Context System (Enhanced)**

### **Purpose**
The Context System manages user traversal, contextual awareness, current location, and anchor/focal points across the Unified Portal.

### **Core Features**
- **Traversal Tracking**: Track user navigation patterns and paths
- **Contextual Awareness**: Maintain awareness of user's current context
- **Location Management**: Track current scene, slide, and coordinates
- **Anchor Management**: Manage focal points and anchor data
- **Cross-Scene Context**: Maintain context across scene transitions

### **Context Types**
- **Scene Context**: Current scene and scene-specific data
- **Slide Context**: Current slide and slide-specific data
- **Document Context**: Document-specific context and metadata
- **Custom Context**: User-defined context types

### **Coordinate Systems**
- **Scene Coordinates**: x, y coordinates within a scene
- **Slide Coordinates**: x, y coordinates within a slide (requires index)
- **Document Coordinates**: x, y coordinates within a document
- **Custom Coordinates**: User-defined coordinate systems

### **Enhanced Features**
- **Slide Context Support**: Enhanced to support slide-specific coordinate systems
- **Coordinate validation for scene, slide, document, and custom contexts**
- **Cross-scene context preservation**
- **Context-based navigation suggestions**

## 🎭 **Flow System (Enhanced)**

### **Purpose**
The Flow System provides guided user experiences with branching logic, step-specific transitions, and interactive forms.

### **Core Features**
- **Guided Experiences**: Step-by-step guided user journeys
- **Branching Logic**: Dynamic flow paths based on user choices
- **Step-Specific Transitions**: Custom transitions for each flow step
- **Interactive Forms**: Dynamic forms within flow steps
- **Flow State Management**: Track flow progress and state

### **Flow Lifecycle**
1. **Flow Initiation**: Start a new flow session
2. **Step Progression**: Navigate through flow steps
3. **Branching Decisions**: Handle user choices and branching
4. **Step Completion**: Complete individual steps
5. **Flow Completion**: Finish the entire flow

### **Integration Points**
- **Navigator Integration**: Flows integrate with Navigator for navigation
- **Context Integration**: Flows provide context to Context System
- **Engagement Integration**: Flows can trigger engagement features
- **Orchestrator Integration**: Flows coordinate with Orchestrator for scene management

## 💬 **Engagement System**

### **Purpose**
The Engagement System replaces the existing "Feedback" system with a comprehensive community engagement platform.

### **Core Features**
- **Comments and Threads**: Contextual discussions and conversations
- **Visibility Control**: Control who can see and participate in discussions
- **Context Anchoring**: Anchor discussions to specific scenes, slides, or content
- **Roll-up Views**: Aggregate engagement data across contexts
- **Moderation Tools**: Tools for managing community engagement

### **Integration Points**
- **Context Integration**: Engagement anchored to specific contexts
- **Auth Integration**: User authentication and permissions
- **Policy Integration**: Role-based access control for engagement
- **Flow Integration**: Engagement within guided experiences

## 🎼 **Orchestrator System**

### **Purpose**
The Orchestrator System manages scene lifecycles and coordinates with other systems.

### **Core Features**
- **Scene Lifecycle Management**: Load, unload, and manage scenes
- **Spatial Data Supply**: Provide spatial data to other systems
- **Performance Optimization**: Optimize scene loading and rendering
- **Slide System Coordination**: Manage slide states during scene transitions

### **Slide System Coordination**
- **Purpose**: Orchestrator manages slide states during scene loading/unloading
- **Slide Lifecycle Management**: Preloading, caching, and state synchronization
- **Performance Optimization**: Strategies for efficient slide rendering
- **Orchestrator-Slide Integration**: How Orchestrator interacts with the Slide System

## 🔐 **Authentication and Policy System**

### **Purpose**
Enhanced authentication system supporting multiple user types and role-based access control.

### **Core Features**
- **Multi-User Support**: Support for users, admins, and tenants
- **Role-Based Access**: Comprehensive role-based access control
- **Policy Cascade**: Hierarchical policy application (Global → Tenant → Deck → Scene → Link/Context/Step)
- **Standing System**: User standing scores and trust levels

### **Policy Cascade Hierarchy**
1. **Global Policies**: System-wide policies
2. **Tenant Policies**: Tenant-specific policies
3. **Deck Policies**: Deck-specific policies
4. **Scene Policies**: Scene-specific policies
5. **Link/Context/Step Policies**: Fine-grained policies

## 🚀 **Migration Strategy**

### **Phase 1: Foundation and Preparation (Weeks 1-4)**
- **Unified Portal Structure**: Create unified Portal project structure
- **Role-Based Access Control**: Implement comprehensive role-based access control
- **Authentication Enhancement**: Enhance authentication system for multiple user types
- **Shared Library Integration**: Integrate enhanced shared library components

### **Phase 2: Core System Implementation (Weeks 5-12)**
- **Navigator System**: Implement core Navigator System
- **Context System**: Enhance Context System with slide support
- **Flow System**: Implement enhanced Flow System
- **Engagement System**: Implement Engagement System

### **Phase 3: Admin Functionality Migration (Weeks 13-20)**
- **Admin Components**: Migrate Admin components to Unified Portal
- **Admin Services**: Migrate Admin services and logic
- **Admin UI**: Integrate Admin UI into Unified Portal
- **Admin Testing**: Test all Admin functionality in Unified Portal

### **Phase 4: System Integration and Testing (Weeks 21-24)**
- **System Integration**: Integrate all systems
- **Testing**: Comprehensive testing of all functionality
- **Performance Optimization**: Optimize system performance
- **User Experience**: Refine user experience

### **Phase 5: Legacy Admin Deprecation (Weeks 25-28)**
- **Legacy Admin Deprecation**: Deprecate legacy Admin project
- **Migration Completion**: Complete migration to Unified Portal
- **Documentation**: Update documentation
- **Training**: Train users on new Unified Portal

## 🎯 **Implementation Roadmap**

### **Key Milestones**
- **Phase 1**: Foundation and Preparation (Weeks 1-4)
- **Phase 2**: Core System Implementation (Weeks 5-12)
- **Phase 3**: Admin Functionality Migration (Weeks 13-20)
- **Phase 4**: System Integration and Testing (Weeks 21-24)
- **Phase 5**: Legacy Admin Deprecation (Weeks 25-28)
- **Phase 6**: Advanced Features (Weeks 29-32)
- **Phase 7**: Optimization and Polish (Weeks 33-36)

### **Success Criteria**
- **Functionality Preservation**: All existing functionality preserved
- **Performance Maintenance**: No degradation in system performance
- **User Experience**: Improved user experience for all user types
- **Development Efficiency**: Reduced development and maintenance overhead
- **Scalability**: Enhanced scalability and extensibility

## 🔍 **Validation Checklist**

### **Pre-Implementation Review**
- [ ] Architecture design reviewed and approved
- [ ] Migration strategy validated
- [ ] Risk assessment completed
- [ ] Resource allocation confirmed
- [ ] Timeline validated

### **Phase-by-Phase Validation**
- [ ] Phase 1: Foundation setup complete
- [ ] Phase 2: Core systems implemented
- [ ] Phase 3: Admin functionality migrated
- [ ] Phase 4: Systems integrated and tested
- [ ] Phase 5: Legacy Admin deprecated

### **Success Criteria Validation**
- [ ] All functionality preserved
- [ ] Performance maintained or improved
- [ ] User experience enhanced
- [ ] Development efficiency improved
- [ ] Scalability enhanced

## 💡 **Next Steps**

The Unified Portal design is comprehensive and ready for implementation. The next phase should focus on:

1. **Foundation Setup**: Create unified Portal structure
2. **Core System Implementation**: Implement Navigator, Context, Flow, and Engagement systems
3. **Admin Migration**: Migrate Admin functionality to Unified Portal
4. **System Integration**: Integrate all systems and test functionality
5. **Legacy Deprecation**: Deprecate legacy Admin project

**The Unified Portal design provides a clear roadmap for creating a single, comprehensive platform that serves all user types through role-based access control and modular system architecture.** 🚀
