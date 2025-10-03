# Protogen Core Foundation Architecture

## Overview
This document outlines the core architectural principles and implementation details for the Protogen system, establishing a durable foundation for scalable graph applications with advanced presentation and collaboration features in a multi-tenant environment.

## Historical Context

Protogen represents a significant architectural evolution to the current Scene & Deck architecture. This transformation was driven by the need for:

- **Greater Flexibility**: Modern architecture supports diverse content types
- **Better Performance**: Scene-based architecture enables more efficient content delivery
- **Multi-Tenant Support**: Clean separation of concerns enables isolated content environments
- **Modern Development**: React-based UI with TypeScript and comprehensive tooling

The project has evolved through 7 completed phases, with a clean, modern architecture. The system now operates entirely on the Scene & Deck foundation described in this document.

## 🚀 **Current Evolution: Central Graph System**

**Status**: In Development - See [Central Graph Roadmap](../CENTRAL_GRAPH_ROADMAP.md)

The system is currently evolving to a **Central Graph System** that simplifies graph traversal while maintaining the excellent multi-tenant, snapshot, and scene type systems. This evolution preserves the winning aspects of the current architecture while introducing:

- **Central Graph**: Single source of truth for all graph data
- **Subgraph System**: Logical groupings of nodes for efficient traversal
- **Enhanced Scene Items**: Spatial positioning for all scene types
- **Improved Performance**: Optimized graph operations and caching

## Core Principles

### 1. Separation of Concerns
- **Central Graph**: Canonical data and relationships (single source of truth)
- **Subgraph System**: Logical groupings of nodes for efficient traversal and organization
- **Scene**: Presentational arrangements with enhanced scene items for spatial positioning
- **Deck**: Collections of related scenes for presentation and navigation
- **Context**: Anchors and coordinates within scenes, documents, and other content
- **Tenant**: Isolated content environments with shared feedback aggregation
- **Snapshot**: Deterministic serialization for instant loading and CDN delivery

### 2. Invariant Enforcement
- **Central Graph Integrity**: All graph operations must maintain data consistency
- **Subgraph Boundaries**: Subgraphs must contain valid node references
- **Edge weights are required and must be numeric**
- **Style cascade**: Type defaults → Scene theme → Instance overrides
- **Engagement aggregation rolls up to Central Graph counters across all tenants**
- **Contexts must resolve to valid Scene+Deck coordinates within tenant scope**
- **Tenant isolation must be maintained for content while allowing shared feedback**
- **Scene Items must have valid spatial positioning and item references**

### 3. Performance & Scalability
- **Subgraph-based caching**: Efficient caching of logical node groupings
- **Aggressive caching via Snapshots**
- **CDN-friendly static delivery**
- **Progressive hydration on the client**
- **Debounced rebuild triggers (500ms-2s)**
- **Tenant-aware caching and performance optimization**
- **Lazy loading of subgraph nodes and edges**

### 4. Multi-Tenant Architecture
- **Content Isolation**: Each tenant has isolated scenes, decks, and presentations
- **Subgraph Sharing**: Controlled sharing of subgraphs across tenants with access policies
- **Feedback Aggregation**: All feedback flows back to centralized Central Graph
- **Shared Knowledge**: Central Graph serves as shared knowledge base across tenants
- **Tenant Management**: Centralized tenant administration with isolated content

### 5. Standing-Based Permissions
- **Standing System**: User progression based on reputation, engagement, and affinity
- **Trust Scoring**: Reliability metrics for security-sensitive operations
- **Progressive Access**: Features unlock as users advance through standing levels
- **Resource Allocation**: Automatic resource assignment based on standing
- **Community Leadership**: Natural leaders emerge through standing-based recognition

## Conceptual Model

### Core Graph (Canonical Data - Shared Across Tenants)
```
CoreGraphNode
├── guid (UUID, primary identifier)
├── node_type_id (classification)
├── label (human-readable name)
├── description (optional)
├── meta (typed JSON for semantic data)
├── is_active (soft delete support)
├── tenant_contributions (aggregated from all tenants)
└── timestamps

CoreGraphEdge
├── guid (UUID, primary identifier)
├── source_node_guid (from CoreGraphNode)
├── target_node_guid (to CoreGraphNode)
├── edge_type_id (classification)
├── weight (numeric, default 1.0)
├── label (optional)
├── description (optional)
├── meta (typed JSON for semantic data)
├── is_active (soft delete support)
├── tenant_contributions (aggregated from all tenants)
└── timestamps
```

### Tenant System (Content Isolation)
```
Tenant
├── id, guid, name, slug, description
├── domain (custom domain for tenant)
├── config (tenant-specific configuration)
├── branding (logo, colors, theme)
├── is_active, is_public
├── created_by, created_at
└── timestamps

TenantConfiguration
├── tenant_id (belongs to Tenant)
├── key (configuration key)
├── value (configuration value)
├── scope (global, content, presentation, feedback)
└── timestamps
```

### Scene & Deck Architecture (Tenant-Isolated)
```
Scene (Presentational Layer - Tenant-Isolated)
├── id, guid, name, slug, description
├── tenant_id (belongs to Tenant)
├── scene_type (system, custom, template)
├── config (scene-specific configuration)
├── meta (validated metadata)
├── style (styling and presentation rules)
├── is_active, is_public
├── created_by, stage_id (legacy, for migration)
└── timestamps

SceneItem (Presentational Instance - Tenant-Isolated)
├── id, guid, scene_id
├── core_node_guid (optional link to CoreGraphNode)
├── node_type (core, phantom, presentational)
├── position (x, y, z coordinates)
├── dimensions (width, height)
├── meta (scene-specific data)
├── style (resolved from cascade)
├── z_index, is_visible, is_locked
└── timestamps

SceneItem (Presentational Connection - Tenant-Isolated)
├── id, guid, scene_id
├── core_edge_guid (optional link to CoreGraphEdge)
├── source_node_id, target_node_id
├── edge_type (core, phantom, presentational)
├── path (edge path coordinates)
├── meta (scene-specific data)
├── style (resolved from cascade)
├── is_visible, is_locked
└── timestamps

Deck (Presentation Collection - Tenant-Isolated)
├── id, name, slug, description
├── tenant_id (belongs to Tenant)
├── type (graph, card, document, dashboard)
├── scene_ids (references to scene IDs)
├── navigation (sequential, hierarchical, network, freeform)
├── performance (keepWarm, preloadStrategy)
└── timestamps

Context (Content Anchors - Tenant-Isolated)
├── id, guid, name, description
├── tenant_id (belongs to Tenant)
├── context_type (scene, deck, document, coordinate)
├── target_scene_id (optional, for scene contexts)
├── target_deck_id (optional, for deck contexts)
├── coordinates (x, y, z, or document position)
├── anchor_data (document text, graph position, etc.)
├── meta (context-specific metadata)
└── timestamps
```

### Feedback System (Centralized Across Tenants)
```
Feedback (Centralized - Shared Across Tenants)
├── id, guid, content_type, content_id
├── tenant_id (source tenant)
├── user_id (user who provided feedback)
├── feedback_type (comment, rating, bookmark, etc.)
├── content (feedback content)
├── meta (feedback metadata)
├── is_public, is_moderated
└── timestamps

FeedbackAggregation (Core Graph Integration)
├── core_node_guid (or core_edge_guid)
├── feedback_count (total across all tenants)
├── rating_average (aggregated rating)
├── engagement_score (calculated engagement)
├── last_updated (last feedback received)
└── tenant_breakdown (feedback per tenant)
```

### Registry System
```
RegistryCatalog
├── scope (core.node, core.edge, scene.node, scene.edge, deck, context, tenant)
├── key (semantic identifier)
├── type (string, number, boolean, array, object)
├── description (human-readable explanation)
├── default_value (JSON)
├── is_presentational (boolean)
├── tenant_override (can tenants override this)
└── validation_rules (JSON schema)
```

## System Invariants

### 1. Core ↔ System Scene Mirror
- Any CRUD operation on Core entities **must** mirror to System Scene
- Deleting from System Scene deletes underlying Core entity
- Non-system Scenes can freely manipulate linked/phantom elements

### 2. Edge Weight Requirements
- Every Core Edge must have a numeric weight (default: 1.0)
- Scene Edges inherit weight from Core or set scene-specific values
- Weight affects graph algorithms and visual representation

### 3. Style Cascade Resolution
```
Effective Style = Type Defaults + Scene Theme + Instance Overrides
```
- Server and client must resolve consistently
- Registry validation ensures type safety
- Fallback chain for missing values

### 4. Engagement Aggregation
- Discussions, bookmarks, notes accumulate to Core counters across all tenants
- Background jobs handle aggregation from tenant-isolated feedback
- Phantom-only anchors roll up to nearest Core link
- Tenant feedback contributes to shared knowledge base

### 5. Context Resolution
- Contexts must resolve to valid Scene+Deck coordinates within tenant scope
- Document contexts must reference valid text positions
- Graph contexts must reference valid node/edge positions
- Fallback to nearest valid context on resolution failure

### 6. Tenant Content Management
- Content (scenes, decks, contexts) can be tenant-specific or shared across tenants
- Feedback must flow to centralized Core Graph for shared knowledge
- Tenant configurations must not leak between tenants
- Shared resources (Core Graph) must be accessible to all tenants
- Content can be licensed and shared between tenants through the Content Sharing System

## Multi-Tenant Architecture Benefits

### 1. Content Management
- Each tenant can have tenant-specific content
- Content can be shared and licensed between tenants
- Custom branding and theming per tenant
- Independent content management workflows
- Content sharing system for collaborative knowledge building

### 2. Shared Knowledge
- Feedback from all tenants contributes to shared Core Graph
- Collective intelligence grows across tenant base
- Common patterns and insights emerge
- Reduced duplication of knowledge work

### 3. Scalability
- Horizontal scaling per tenant
- Independent performance optimization
- Tenant-specific caching strategies
- Load distribution across tenant instances

### 4. Customization
- Tenant-specific configurations
- Custom domain support per tenant
- Independent content publishing workflows
- Tenant-specific analytics and reporting

## Snapshot System

### Purpose
- Fast, CDN-friendly delivery of presentational data
- Instant loads for public scenes
- API fallback for private/authoring scenarios
- Deterministic serialization for caching
- Tenant-aware snapshot generation and delivery

### Snapshot Structure
```json
{
  "schema": { "name": "protogen.scene", "version": "1.0.0" },
  "tenant": { "id": "tenant-slug", "domain": "tenant.example.com" },
  "scene": {
    "ids": { "scene": "scene-slug" },
    "timestamps": { "created": "ISO8601", "updated": "ISO8601" },
    "source": { "generator": "admin-publisher", "commit": "hash", "coreRev": "revision" },
    "theme": { "tokens": {} },
    "nodes": [...],
    "edges": [...],
    "contexts": [...],
    "indices": { "search": [...] }
  },
  "integrity": { "hash": "sha256-BASE64", "algo": "sha256" },
  "cache": { "ttl": 86400, "immutable": true }
}
```

### Manifest Structure
```json
{
  "schema": { "name": "protogen.scene.manifest", "version": "1.0.0" },
  "tenant": { "id": "tenant-slug", "domain": "tenant.example.com" },
  "locator": {
    "scene": "scene-slug",
    "etag": "sha256-BASE64",
    "url": "/snapshots/tenant/scene/hash.json.br"
  },
  "generatedAt": "ISO8601",
  "expiresAt": "ISO8601"
}
```

## Implementation Guidelines

### 1. Database Design
- Use PostgreSQL JSONB for flexible metadata
- Implement proper indexing for JSON queries
- Use generated columns for hot JSON keys
- Maintain referential integrity with foreign keys
- **NEW**: Implement tenant isolation at database level

### 2. API Design
- RESTful endpoints with consistent patterns
- Proper HTTP status codes and error handling
- Rate limiting on authoring endpoints
- Input validation and sanitization
- **NEW**: Tenant-aware routing and middleware

### 3. Event System
- Laravel events for domain changes
- Queued listeners for background processing
- Structured logging for observability
- Idempotent operations where possible
- **NEW**: Tenant-aware event handling and feedback aggregation

### 4. Caching Strategy
- Snapshots: Long-term immutable caching
- Manifests: Short TTL for freshness
- API responses: Appropriate TTL based on data type
- Client-side progressive hydration
- **NEW**: Tenant-aware caching and CDN distribution

## Performance Considerations

### 1. Database Optimization
- Proper indexing on frequently queried fields
- Pagination for large result sets
- Efficient JSON queries using GIN indexes
- Connection pooling and query optimization
- **NEW**: Tenant-aware query optimization and partitioning

### 2. Storage Optimization
- Brotli compression for snapshots
- Gzip fallback for compatibility
- Content-addressed storage paths
- Retention policies for old snapshots
- **NEW**: Tenant-specific storage optimization

### 3. Delivery Optimization
- CDN integration for global caching
- Progressive loading and hydration
- Efficient client-side rendering
- Background processing for heavy operations
- **NEW**: Tenant-aware CDN distribution and caching

## Security & Access Control

### 1. Authentication
- Laravel Sanctum for API authentication
- Session-based admin authentication
- Proper token management and expiration
- **NEW**: Tenant-aware authentication and session management

### 2. Authorization
- Role-based access control (RBAC)
- Resource-level permissions
- Audit logging for sensitive operations
- Input validation and sanitization
- **NEW**: Tenant isolation and cross-tenant access controls

### 3. Data Protection
- Secure storage of sensitive metadata
- Proper encryption for credentials
- Rate limiting to prevent abuse
- Input validation to prevent injection
- **NEW**: Tenant data isolation and privacy controls

## Testing Strategy

### 1. Unit Testing
- Invariant enforcement
- Style cascade resolution
- Snapshot serialization/deserialization
- Registry validation
- Context resolution
- **NEW**: Tenant isolation and feedback aggregation

### 2. Integration Testing
- Core ↔ System Scene mirroring
- Snapshot publishing and hydration
- Event system and background jobs
- API endpoint functionality
- Context resolution workflows
- **NEW**: Multi-tenant workflows and isolation

### 3. End-to-End Testing
- Complete user workflows
- Cross-browser compatibility
- Performance under load
- Error handling and recovery
- **NEW**: Tenant-specific workflows and cross-tenant feedback

## Deployment & Operations

### 1. Environment Setup
- Laravel backend with PostgreSQL
- React Admin interface
- React User Portal (tenant-facing client)
- Shared TypeScript library
- cPanel hosting with optional CDN
- **NEW**: Multi-tenant deployment and scaling

### 2. Monitoring & Observability
- Structured logging for all operations
- Performance metrics collection
- Error tracking and alerting
- Health checks and status endpoints
- **NEW**: Tenant-specific monitoring and analytics

### 3. Backup & Recovery
- Database backup strategies
- Snapshot storage redundancy
- Disaster recovery procedures
- Rollback capabilities for deployments
- **NEW**: Tenant-specific backup and recovery

## Content Sharing System

### Purpose
- Enable scenes, decks, and contexts to be shared across tenants
- Provide licensing and attribution mechanisms
- Support collaborative knowledge building
- Maintain content ownership and permissions

### Content Sharing Features
- **Content Licensing**: Creative Commons and custom license support
- **Attribution System**: Track content creators and contributors
- **Dependency Management**: Ensure shared content dependencies are available
- **Version Control**: Track content evolution across tenants
- **Usage Analytics**: Monitor how shared content is used

### Implementation Approach
- Shared Content Registry for discoverable content
- Content import/export workflows
- Dependency resolution and validation
- Tenant-specific content customization
- Feedback aggregation from shared content usage

## Flow System

### Purpose
The Flow System provides a sophisticated, flexible content navigation and exploration system that allows authors to create guided experiences while maintaining user autonomy. Flows can engage scenes, decks, nodes/coordinates, and contexts to provide full author control over user journeys while enabling exploration and branching paths.

### Core Flow Concepts

#### **Flow Steps & Navigation**
- **Flow Steps**: Individual waypoints that can target scenes, decks, specific nodes/coordinates, or contexts
- **Guided Navigation**: Author-controlled progression through defined steps
- **Free Exploration**: User ability to explore content while maintaining flow context
- **Resume Capability**: Return to flow progression from any exploration point
- **Rewind/Return**: Navigate back to previous steps or return to current step view

#### **Flow Control Modes**
- **Guided Mode**: Strict step-by-step progression with limited exploration
- **Free-Explore Mode**: Full exploration capability while maintaining flow context
- **Hybrid Mode**: Exploration allowed during pauses, guided during active flow
- **Branch Mode**: Multiple path options with return-to-flow capability

#### **Flow Features**
- **Flow Engine**: Coordinate transitions between scenes, decks, nodes, and contexts
- **Flow Controls**: Play, pause, manual advance, speed control, and navigation
- **Exploration Management**: Track user position and enable return to flow
- **Branching System**: Multiple path options with conditional navigation
- **Context Preservation**: Maintain flow state during exploration
- **Flow Exit**: Always available escape to regain full session control

### Advanced Flow Capabilities

#### **Branching & Conditional Navigation**
- **Flow Branches**: Multiple path options from any step
- **Conditional Logic**: Dynamic path selection based on user choices or context
- **Return Paths**: Seamless return to main flow after branch exploration
- **Branch Merging**: Rejoin main flow from different branch endpoints

#### **Exploration Management**
- **Position Tracking**: Monitor user location within content during exploration
- **Flow Context**: Maintain awareness of current flow step and progress
- **Auto-Focus**: Return user attention to next step when flow advances
- **Exploration Boundaries**: Define limits of exploration while in flow mode

#### **Author Control & Configuration**
- **Flow Authoring**: Create step sequences with targets and transitions
- **Mode Selection**: Choose guided, free-explore, or hybrid modes per flow
- **Branch Definition**: Create conditional paths and return points
- **Exploration Settings**: Configure exploration boundaries and behavior

### Implementation Architecture

#### **Flow Model Structure**
```typescript
interface Flow {
  id: number;
  name: string;
  description: string;
  mode: 'guided' | 'free-explore' | 'hybrid';
  steps: FlowStep[];
  branches: FlowBranch[];
  settings: FlowSettings;
}

interface FlowStep {
  id: number;
  order: number;
  target_type: 'scene' | 'deck' | 'node' | 'context';
  target_id: string;
  coordinates?: { x: number; y: number; z?: number };
  transition: TransitionConfig;
  allow_exploration: boolean;
  exploration_boundaries?: ExplorationConfig;
}

interface FlowBranch {
  id: number;
  from_step_id: number;
  condition: BranchCondition;
  steps: FlowStep[];
  return_to_step?: number;
}
```

#### **Flow State Management**
- **Current Step Tracking**: Monitor active flow step and user position
- **Exploration State**: Track user exploration and return points
- **Flow History**: Maintain navigation history for rewind capability
- **Session Integration**: Seamless integration with existing session management

#### **Flow Control System**
- **Playback Controls**: Play, pause, advance, rewind, speed control
- **Navigation Controls**: Next, previous, jump to step, return to flow
- **Exploration Controls**: Enter/exit exploration mode, return to step
- **Flow Exit**: Always available escape to full session control

### Future Applications

#### **Admin UI Integration**
- **Setup Wizards**: Guided configuration and setup processes
- **Onboarding Flows**: Step-by-step user introduction and training
- **Feature Tours**: Guided exploration of new features and capabilities

#### **Marketing & Engagement**
- **Marketing Funnels**: Structured user journey through content
- **Educational Paths**: Guided learning experiences with exploration
- **Interactive Demos**: Controlled demonstration with user interaction

#### **Content Management**
- **Content Creation Flows**: Guided content authoring processes
- **Review Workflows**: Structured content review and approval processes
- **Publishing Pipelines**: Step-by-step content publishing workflows

### Implementation Approach
- **Modular Design**: Flexible flow engine with pluggable step types
- **State Management**: Comprehensive flow state tracking and restoration
- **API Integration**: Seamless integration with existing scene/deck/context systems
- **UI Components**: Reusable flow control and navigation components
- **Performance**: Efficient flow state management and transition handling
- **Extensibility**: Open architecture for future flow types and capabilities

## Migration Strategy

### 1. Content Management
- Assign existing content to default "Progress" tenant
- Migrate any legacy content to new Scene/Deck/Context system
- Update routing to use new architecture
- Establish default tenant as primary content owner

### 2. Context System Implementation
- Create Context model and database schema
- Implement context resolution engine
- Add context management UI
- Integrate with existing Scene/Deck systems
- **NEW**: Implement tenant-aware context management

### 3. Multi-Tenant Implementation
- Create default tenant for existing content
- Implement tenant isolation middleware
- Add tenant-aware routing and API endpoints
- Implement feedback aggregation system
- **NEW**: Gradual tenant rollout and migration

### 4. Content Management
- Document new architecture and workflows
- Focus on Scene/Deck/Context system
- Maintain tenant isolation during content import

## Future Considerations

### 1. Scalability
- Horizontal scaling for high-traffic scenarios
- Microservice architecture evolution
- Advanced caching strategies
- Load balancing and failover
- **NEW**: Multi-tenant scaling and performance optimization

### 2. Extensibility
- Plugin system for custom scene types
- API versioning and evolution
- Third-party integrations
- Custom visualization components
- **NEW**: Tenant-specific plugin systems and customizations

### 3. Advanced Features
- Real-time collaboration
- Advanced graph algorithms
- Machine learning integration
- Advanced analytics and insights
- Context-aware navigation
- **NEW**: Cross-tenant collaboration and knowledge sharing
- **NEW**: Tenant-specific AI and ML features
