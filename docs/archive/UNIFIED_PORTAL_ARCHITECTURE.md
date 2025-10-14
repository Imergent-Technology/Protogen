# Unified Portal Architecture

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
- **Flow-Specific Surfaces**: Screens, dialogs, videos for flow steps
- **Future-Ready Forms**: Single-purpose forms with parse-able responses

#### **3. Transitions Module**
Handles navigation transitions and animations:
- **Default Transitions**: System-wide transition defaults
- **Custom Transitions**: Flow-specific and step-specific overrides
- **Animation Management**: Transition timing, easing, and effects
- **State Preservation**: Maintain context during transitions

### **Navigator System Integration**

```typescript
interface NavigatorSystem {
  // Context Management
  context: ContextModule;
  flow: FlowModule;
  transitions: TransitionsModule;
  
  // Core Navigation
  navigateTo(target: NavigationTarget): Promise<void>;
  navigateBack(): Promise<void>;
  navigateForward(): Promise<void>;
  
  // Context Operations
  getCurrentContext(): CurrentContext;
  setCurrentContext(context: ContextData): void;
  createNamedContext(name: string, data: ContextData): NamedContext;
  
  // Flow Integration
  startFlow(flowId: string): FlowSession;
  pauseFlow(): void;
  resumeFlow(): void;
  stopFlow(): void;
  
  // Event System
  on(event: NavigatorEvent, handler: EventHandler): void;
  emit(event: NavigatorEvent, data: any): void;
}
```

## 🎯 **Context System (Enhanced)**

### **Purpose**
The Context System provides precise navigation anchors and coordinate management, serving as the foundation for contextual awareness across all systems.

### **Enhanced Context System Features**

```typescript
interface ContextSystem {
  // Core Context Management
  createContext(data: ContextData): Context;
  resolveContext(contextId: string): ResolvedContext;
  updateContext(contextId: string, data: Partial<ContextData>): Context;
  deleteContext(contextId: string): void;
  
  // Navigation Tracks
  createNavigationTrack(sceneId: string): NavigationTrack;
  addTrackEntry(trackId: string, entry: TrackEntry): void;
  getTrackHistory(trackId: string): TrackEntry[];
  
  // Current Context Management
  getCurrentContext(): CurrentContext;
  setCurrentContext(context: ContextData): void;
  updateCurrentContext(updates: Partial<ContextData>): void;
  
  // Named Contexts
  createNamedContext(name: string, data: ContextData): NamedContext;
  getNamedContext(name: string): NamedContext | null;
  listNamedContexts(): NamedContext[];
  
  // Context Anchoring
  anchorToContext(contextId: string): void;
  getAnchorData(): AnchorData;
  updateAnchorData(data: AnchorData): void;
}
```

## 🌊 **Flow System (Enhanced)**

### **Purpose**
The Flow System provides guided content experiences while maintaining user autonomy, with enhanced integration for context awareness and engagement.

### **Enhanced Flow System Features**

```typescript
interface FlowSystem {
  // Flow Management
  createFlow(config: FlowConfig): Flow;
  startFlow(flowId: string): FlowSession;
  pauseFlow(sessionId: string): void;
  resumeFlow(sessionId: string): void;
  stopFlow(sessionId: string): void;
  
  // Step Management
  nextStep(sessionId: string): void;
  previousStep(sessionId: string): void;
  jumpToStep(sessionId: string, stepId: string): void;
  returnToCurrentStep(sessionId: string): void;
  
  // Exploration Management
  enterExplorationMode(sessionId: string): void;
  exitExplorationMode(sessionId: string): void;
  returnToFlow(sessionId: string): void;
  
  // Branching
  selectBranch(sessionId: string, branchId: string): void;
  returnFromBranch(sessionId: string): void;
  
  // Context Integration
  bindToContext(flowId: string, contextId: string): void;
  getContextualSteps(flowId: string, contextId: string): FlowStep[];
  
  // Engagement Integration
  createEngagementPoint(stepId: string, config: EngagementConfig): void;
  getEngagementData(stepId: string): EngagementData;
}
```

## 💬 **Engagement System**

### **Purpose**
The Engagement System provides contextual, scene-specific, and global discussion capabilities, replacing the basic feedback system with comprehensive community engagement features.

### **Engagement System Features**

```typescript
interface EngagementSystem {
  // Thread Management
  createThread(config: ThreadConfig): Thread;
  replyToThread(threadId: string, content: ThreadContent): Reply;
  updateThread(threadId: string, updates: ThreadUpdate): Thread;
  deleteThread(threadId: string): void;
  
  // Context Binding
  bindToContext(threadId: string, contextId: string): void;
  bindToScene(threadId: string, sceneId: string): void;
  bindToGlobal(threadId: string): void;
  
  // Visibility Controls
  setVisibility(threadId: string, visibility: VisibilityLevel): void;
  getVisibleThreads(userId: string, contextId?: string): Thread[];
  
  // Engagement Analytics
  getEngagementMetrics(threadId: string): EngagementMetrics;
  getUserEngagement(userId: string): UserEngagement;
  getContextEngagement(contextId: string): ContextEngagement;
  
  // Real-time Features
  subscribeToThread(threadId: string, callback: ThreadCallback): Subscription;
  subscribeToContext(contextId: string, callback: ContextCallback): Subscription;
}
```

## 🎭 **Orchestrator System**

### **Purpose**
The Orchestrator System manages scene lifecycles, spatial data, and coordinates between all other systems.

### **Orchestrator System Features**

```typescript
interface OrchestratorSystem {
  // Scene Lifecycle Management
  createScene(config: SceneConfig): Scene;
  updateScene(sceneId: string, updates: SceneUpdate): Scene;
  deleteScene(sceneId: string): void;
  publishScene(sceneId: string): void;
  unpublishScene(sceneId: string): void;
  
  // Spatial Data Management
  updateSpatialData(sceneId: string, data: SpatialData): void;
  getSpatialData(sceneId: string): SpatialData;
  updateViewport(sceneId: string, viewport: ViewportData): void;
  
  // System Coordination
  coordinateWithNavigator(navigatorData: NavigatorData): void;
  coordinateWithContext(contextData: ContextData): void;
  coordinateWithFlow(flowData: FlowData): void;
  coordinateWithEngagement(engagementData: EngagementData): void;
  
  // Event Management
  emitSceneEvent(event: SceneEvent, data: any): void;
  onSceneEvent(event: SceneEvent, handler: EventHandler): void;
}
```

## 🔐 **Enhanced Authentication System**

### **Purpose**
The Enhanced Authentication System provides unified access control for all user types within the Unified Portal.

### **Authentication Features**

```typescript
interface AuthenticationSystem {
  // User Authentication
  authenticateUser(credentials: UserCredentials): Promise<AuthResult>;
  authenticateAdmin(credentials: AdminCredentials): Promise<AuthResult>;
  authenticateTenant(credentials: TenantCredentials): Promise<AuthResult>;
  
  // Role-Based Access
  getUserRole(userId: string): UserRole;
  getTenantRole(userId: string, tenantId: string): TenantRole;
  getSystemRole(userId: string): SystemRole;
  
  // Permission Management
  checkPermission(userId: string, permission: string, context?: PermissionContext): boolean;
  getPermissions(userId: string, context?: PermissionContext): Permission[];
  
  // Session Management
  createSession(userId: string, role: UserRole): Session;
  updateSession(sessionId: string, updates: SessionUpdate): Session;
  destroySession(sessionId: string): void;
  
  // Multi-Factor Authentication
  enableMFA(userId: string, method: MFAMethod): void;
  verifyMFA(userId: string, code: string): boolean;
}
```

## 🔗 **Inter-System Communication**

### **Event-Based Architecture**

```typescript
// System Events
interface SystemEvents {
  // Navigator Events
  'navigator:navigate': { target: NavigationTarget; context: CurrentContext };
  'navigator:context-change': { oldContext: CurrentContext; newContext: CurrentContext };
  'navigator:flow-start': { flowId: string; sessionId: string };
  
  // Context Events
  'context:create': { contextId: string; data: ContextData };
  'context:update': { contextId: string; updates: Partial<ContextData> };
  'context:delete': { contextId: string };
  
  // Flow Events
  'flow:create': { flowId: string; config: FlowConfig };
  'flow:start': { flowId: string; sessionId: string };
  'flow:step': { sessionId: string; stepId: string };
  'flow:complete': { sessionId: string; flowId: string };
  
  // Engagement Events
  'engagement:thread-create': { threadId: string; config: ThreadConfig };
  'engagement:thread-reply': { threadId: string; replyId: string };
  'engagement:thread-update': { threadId: string; updates: ThreadUpdate };
  
  // Orchestrator Events
  'orchestrator:scene-create': { sceneId: string; config: SceneConfig };
  'orchestrator:scene-update': { sceneId: string; updates: SceneUpdate };
  'orchestrator:scene-publish': { sceneId: string };
}
```

### **System Integration Map**

```
┌─────────────────────────────────────────────────────────────────┐
│                    SYSTEM INTEGRATION MAP                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  NAVIGATOR SYSTEM                                              │
│  ├── Context Module ←→ CONTEXT SYSTEM                          │
│  ├── Flow Module ←→ FLOW SYSTEM                                │
│  └── Transitions Module ←→ ORCHESTRATOR SYSTEM                 │
│                                                                 │
│  CONTEXT SYSTEM                                                │
│  ├── Provides anchor data to ENGAGEMENT SYSTEM                │
│  ├── Provides context to FLOW SYSTEM                          │
│  └── Consumes spatial data from ORCHESTRATOR SYSTEM           │
│                                                                 │
│  FLOW SYSTEM                                                   │
│  ├── Consumes context from CONTEXT SYSTEM                      │
│  ├── Emits navigation events to NAVIGATOR SYSTEM               │
│  ├── Creates engagement points for ENGAGEMENT SYSTEM           │
│  └── Consumes policies from AUTH SYSTEM                         │
│                                                                 │
│  ENGAGEMENT SYSTEM                                             │
│  ├── Consumes context from CONTEXT SYSTEM                     │
│  ├── Consumes auth from AUTH SYSTEM                           │
│  ├── Consumes policies from AUTH SYSTEM                       │
│  └── Emits engagement events to ANALYTICS SYSTEM              │
│                                                                 │
│  ORCHESTRATOR SYSTEM                                           │
│  ├── Manages scene lifecycles                                 │
│  ├── Supplies spatial data to CONTEXT SYSTEM                  │
│  └── Coordinates with NAVIGATOR SYSTEM                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 🎨 **Unified Portal User Experience**

### **Role-Based Interface**

#### **User Mode (Public)**
- **Content Discovery**: Browse and explore scenes, decks, and community content
- **Interactive Experiences**: Engage with graphs, documents, and presentations
- **Community Features**: Participate in discussions and feedback systems
- **Navigation**: Seamless navigation with context awareness
- **Engagement**: Rich discussion and collaboration features

#### **Admin Mode (Authoring)**
- **Content Creation**: Create and manage scenes, decks, and flows
- **Authoring Tools**: Advanced authoring capabilities for all content types
- **Context Management**: Create and manage named contexts
- **Flow Authoring**: Create guided experiences and flows
- **Engagement Management**: Moderate discussions and manage community

#### **Tenant Mode (Management)**
- **User Management**: Manage tenant users and permissions
- **Analytics**: View tenant analytics and insights
- **Settings**: Configure tenant settings and policies
- **Content Management**: Oversee tenant content and engagement
- **System Administration**: Manage tenant-specific system settings

### **Unified Navigation**

```typescript
interface UnifiedNavigation {
  // Mode Switching
  switchToUserMode(): void;
  switchToAdminMode(): void;
  switchToTenantMode(): void;
  
  // Context-Aware Navigation
  navigateToScene(sceneId: string, context?: ContextData): void;
  navigateToDeck(deckId: string, context?: ContextData): void;
  navigateToFlow(flowId: string, context?: ContextData): void;
  
  // Role-Based Navigation
  getNavigationForRole(role: UserRole): NavigationItem[];
  getNavigationForTenant(tenantId: string): NavigationItem[];
  
  // Context Preservation
  preserveContext(context: ContextData): void;
  restoreContext(): ContextData | null;
}
```

## 📊 **Policy Cascade Integration**

### **Policy Hierarchy**
```
Global Policies
    ↓
Tenant Policies
    ↓
Deck Policies
    ↓
Scene Policies
    ↓
Link/Context/Step Policies
```

### **Policy Integration Points**

```typescript
interface PolicyIntegration {
  // Navigator Policies
  navigationPolicies: {
    allowedTransitions: TransitionPolicy[];
    navigationBoundaries: BoundaryPolicy[];
    contextRetention: RetentionPolicy[];
  };
  
  // Flow Policies
  flowPolicies: {
    stepConfiguration: StepPolicy[];
    explorationBoundaries: ExplorationPolicy[];
    branchingRules: BranchingPolicy[];
  };
  
  // Context Policies
  contextPolicies: {
    retentionStrategies: RetentionPolicy[];
    anchorStrategies: AnchorPolicy[];
    privacyRules: PrivacyPolicy[];
  };
  
  // Engagement Policies
  engagementPolicies: {
    visibilityRules: VisibilityPolicy[];
    moderationRules: ModerationPolicy[];
    participationRules: ParticipationPolicy[];
  };
}
```

## 🚀 **Implementation Strategy**

### **Phase 1: Foundation (Weeks 1-4)**
- **Unified Portal Setup**: Create unified Portal architecture
- **Role-Based Access**: Implement role-based access control
- **Authentication Enhancement**: Enhance authentication system
- **Shared Library Integration**: Integrate enhanced shared library

### **Phase 2: Navigator System (Weeks 5-8)**
- **Navigator System**: Implement Navigator System core
- **Context Module**: Enhance Context System with navigation tracks
- **Flow Module**: Implement Flow System with enhanced features
- **Transitions Module**: Create transitions and animation system

### **Phase 3: Engagement System (Weeks 9-12)**
- **Engagement System**: Implement comprehensive engagement system
- **Thread Management**: Create thread and discussion management
- **Context Binding**: Implement context-aware engagement
- **Real-time Features**: Add real-time collaboration features

### **Phase 4: System Integration (Weeks 13-16)**
- **Event System**: Implement comprehensive event system
- **System Coordination**: Integrate all systems
- **Performance Optimization**: Optimize system performance
- **Testing and Validation**: Comprehensive testing and validation

### **Phase 5: Admin Migration (Weeks 17-20)**
- **Admin Functionality Migration**: Migrate admin functionality to Portal
- **Legacy Admin Deprecation**: Deprecate legacy Admin project
- **User Training**: Train users on new unified interface
- **Documentation**: Complete system documentation

## 🎯 **Success Metrics**

### **Technical Metrics**
- **System Integration**: All systems communicate through events
- **Performance**: Navigation transitions < 200ms
- **Scalability**: Support 1000+ concurrent users
- **Reliability**: 99.9% uptime for navigation services

### **Functional Metrics**
- **User Experience**: Seamless navigation between systems
- **Context Awareness**: Accurate context tracking and preservation
- **Flow Completion**: 80%+ flow completion rates
- **Engagement**: 50%+ user participation in discussions

### **Business Metrics**
- **User Adoption**: 90%+ of users utilize navigation features
- **Community Engagement**: 300%+ increase in discussion participation
- **System Utilization**: 80%+ of features actively used
- **Content Quality**: Improved content quality through guided creation

## 🔒 **Security Considerations**

### **Access Control**
- All systems respect tenant isolation
- Context data is scoped to appropriate users
- Flow access is controlled by permissions
- Engagement features respect privacy settings

### **Data Protection**
- Context data is encrypted at rest
- Navigation history is anonymized
- Flow data is tenant-isolated
- Engagement data follows GDPR compliance

### **Audit Trail**
- All navigation events are logged
- Context changes are tracked
- Flow interactions are recorded
- Engagement activities are monitored

This unified architecture provides a comprehensive foundation for sophisticated content navigation, guided experiences, contextual awareness, and community engagement while maintaining security, scalability, and extensibility.
