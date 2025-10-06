# Unified Portal System Documentation

## 🎯 **Overview**

This document provides comprehensive documentation for all modular systems within the Unified Portal architecture, including Navigator, Context, Flow, Engagement, and Orchestrator systems.

## 🧭 **Navigator System**

### **Purpose**
The Navigator System serves as the connective backbone for scene traversal and system interoperability, managing navigation state, transitions, and contextual awareness across the Unified Portal.

### **Core Architecture**

```typescript
interface NavigatorSystem {
  // Core Navigation
  navigateTo(target: NavigationTarget): Promise<void>;
  navigateBack(): Promise<void>;
  navigateForward(): Promise<void>;
  
  // Context Management
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

### **Integration Points**
- **Context System**: Provides navigation tracks and current context
- **Flow System**: Coordinates guided experiences and flow management
- **Orchestrator System**: Manages scene lifecycles and spatial data
- **Engagement System**: Provides contextual engagement capabilities

## 🎯 **Context System (Enhanced)**

### **Purpose**
The Context System provides precise navigation anchors and coordinate management, serving as the foundation for contextual awareness across all systems within the Unified Portal.

### **Core Architecture**

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

### **Enhanced Features**

#### **Navigation Tracks**
- **Per-Scene Tracks**: Track navigation within individual scenes
- **Cross-Scene History**: Track navigation patterns across scenes
- **User-Specific Tracks**: Personalized navigation history
- **Track Analytics**: Analyze navigation patterns and user behavior

#### **Current Context Management**
- **Active Context**: Track current scene, track, and anchor point
- **Context Updates**: Real-time context updates and synchronization
- **Context Persistence**: Persist context across sessions
- **Context Sharing**: Share context between users and systems

#### **Named Contexts**
- **Admin-Created Contexts**: Contexts created by administrators
- **Context Targeting**: Use named contexts for targeting and linking
- **Context Management**: Create, update, and delete named contexts
- **Context Discovery**: Find and use existing named contexts

### **Integration Points**
- **Navigator System**: Provides navigation tracks and current context
- **Flow System**: Provides context for flow targeting and branching
- **Engagement System**: Provides anchor data for contextual discussions
- **Orchestrator System**: Consumes spatial data for context positioning

## 🌊 **Flow System (Enhanced)**

### **Purpose**
The Flow System provides guided content experiences while maintaining user autonomy, with enhanced integration for context awareness and engagement within the Unified Portal.

### **Core Architecture**

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

### **Enhanced Features**

#### **Transition Overrides**
- **Per-Step Transitions**: Customize transitions for individual steps
- **Flow-Specific Transitions**: Override default transitions for specific flows
- **User Preferences**: Allow users to customize transition preferences
- **Transition Analytics**: Track transition effectiveness and user preferences

#### **Flow-Specific Surfaces**
- **Screens**: Full-screen content surfaces for flow steps
- **Dialogs**: Modal dialogs for user interaction
- **Videos**: Video content surfaces with playback controls
- **Overlays**: Overlay surfaces for additional information

#### **Future-Ready Forms**
- **Single-Purpose Forms**: Forms designed for specific purposes
- **Parse-able Responses**: Responses that can be automatically parsed
- **Branching Logic**: Forms that influence flow branching
- **Validation**: Comprehensive form validation and error handling

### **Integration Points**
- **Navigator System**: Coordinates with Navigator for flow navigation
- **Context System**: Uses context for flow targeting and branching
- **Engagement System**: Creates engagement points for user interaction
- **Orchestrator System**: Manages flow-specific scene lifecycles

## 💬 **Engagement System**

### **Purpose**
The Engagement System provides contextual, scene-specific, and global discussion capabilities, replacing the basic feedback system with comprehensive community engagement features within the Unified Portal.

### **Core Architecture**

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

### **Core Features**

#### **Thread Management**
- **Thread Creation**: Create discussion threads with rich content
- **Reply System**: Nested replies and threaded discussions
- **Thread Updates**: Update thread content and metadata
- **Thread Moderation**: Moderate threads and manage content

#### **Context Binding**
- **Scene Binding**: Bind threads to specific scenes
- **Context Binding**: Bind threads to named contexts
- **Global Binding**: Bind threads to global discussions
- **Dynamic Binding**: Change thread binding dynamically

#### **Visibility Controls**
- **Public Threads**: Threads visible to all users
- **Tenant Threads**: Threads visible to tenant members
- **Group Threads**: Threads visible to specific groups
- **Private Threads**: Threads visible to specific users

#### **Real-time Features**
- **Live Updates**: Real-time thread updates and notifications
- **Presence System**: Show user presence and activity
- **Collaborative Editing**: Real-time collaborative editing
- **Notification System**: Push notifications for engagement

### **Integration Points**
- **Context System**: Uses context for thread binding and targeting
- **Auth System**: Consumes user identity and permissions
- **Policy System**: Applies visibility and moderation rules
- **Flow System**: Creates engagement points for guided experiences

## 🎭 **Orchestrator System**

### **Purpose**
The Orchestrator System manages scene lifecycles, spatial data, and coordinates between all other systems within the Unified Portal.

### **Core Architecture**

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

### **Core Features**

#### **Scene Lifecycle Management**
- **Scene Creation**: Create new scenes with configuration
- **Scene Updates**: Update scene content and metadata
- **Scene Publishing**: Publish scenes for public access
- **Scene Deletion**: Remove scenes and clean up data

#### **Spatial Data Management**
- **Viewport Management**: Manage scene viewport and camera
- **Spatial Coordinates**: Track spatial coordinates and positioning
- **Spatial Relationships**: Manage relationships between spatial elements
- **Spatial Analytics**: Analyze spatial usage and patterns

#### **System Coordination**
- **Event Coordination**: Coordinate events between systems
- **Data Synchronization**: Synchronize data between systems
- **State Management**: Manage shared state between systems
- **Performance Optimization**: Optimize system performance

### **Integration Points**
- **Navigator System**: Coordinates navigation and transitions
- **Context System**: Provides spatial data for context positioning
- **Flow System**: Manages flow-specific scene lifecycles
- **Engagement System**: Coordinates engagement with scene content

## 🔐 **Enhanced Authentication System**

### **Purpose**
The Enhanced Authentication System provides unified access control for all user types within the Unified Portal.

### **Core Architecture**

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

### **Core Features**

#### **Multi-Role Authentication**
- **User Authentication**: Standard user authentication
- **Admin Authentication**: Administrative user authentication
- **Tenant Authentication**: Tenant-specific authentication
- **System Authentication**: System-level authentication

#### **Role-Based Access Control**
- **User Roles**: Standard user roles and permissions
- **Admin Roles**: Administrative roles and permissions
- **Tenant Roles**: Tenant-specific roles and permissions
- **System Roles**: System-level roles and permissions

#### **Permission Management**
- **Permission Checking**: Check user permissions for actions
- **Permission Inheritance**: Inherit permissions from roles
- **Context-Aware Permissions**: Permissions based on context
- **Permission Auditing**: Audit permission usage and changes

### **Integration Points**
- **All Systems**: Provides authentication for all systems
- **Policy System**: Integrates with policy system for access control
- **Audit System**: Provides audit trail for authentication events
- **Notification System**: Sends authentication-related notifications

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

## 📊 **Policy Integration**

### **Policy Cascade Model**

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

## 🎯 **System Dependencies**

### **Core Dependencies**
- **Shared Library**: Common components, types, and services
- **API Backend**: Laravel-based backend with multi-tenant support
- **Database**: PostgreSQL with comprehensive schema
- **Authentication**: Role-based authentication system

### **External Dependencies**
- **React**: Frontend framework for all components
- **TypeScript**: Type safety and development experience
- **Tailwind CSS**: Styling and theming system
- **Vite**: Build system and development server

### **Internal Dependencies**
- **Event System**: Inter-system communication
- **State Management**: Shared state management
- **API Client**: HTTP client for backend communication
- **Theme System**: Centralized theming and styling

This comprehensive system documentation provides the foundation for implementing all modular systems within the Unified Portal architecture while maintaining clear boundaries, event-based communication, and extensibility for future enhancements.
