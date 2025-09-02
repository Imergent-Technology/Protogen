# Protogen Core Foundation Architecture

## Overview
This document outlines the core architectural principles and implementation details for the Protogen system, establishing a durable foundation for scalable graph applications with advanced presentation and collaboration features.

## Core Principles

### 1. Separation of Concerns
- **Core Graph**: Canonical data and relationships (source of truth)
- **Stage**: Routing, authentication, and context container
- **Scene**: Presentational arrangements within stages (including phantom elements)
- **Snapshot**: Deterministic serialization for instant loading and CDN delivery

### 2. Invariant Enforcement
- Core ↔ System Scene mirror must always be maintained
- Edge weights are required and must be numeric
- Style cascade: Type defaults → Scene theme → Instance overrides
- Engagement aggregation rolls up to Core counters

### 3. Performance & Scalability
- Aggressive caching via Snapshots
- CDN-friendly static delivery
- Progressive hydration on the client
- Debounced rebuild triggers (500ms-2s)

## Conceptual Model

### Core Graph (Canonical Data)
```
CoreGraphNode
├── guid (UUID, primary identifier)
├── node_type_id (classification)
├── label (human-readable name)
├── description (optional)
├── meta (typed JSON for semantic data)
├── is_active (soft delete support)
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
└── timestamps
```

### Stage & Scene Architecture
```
Stage (Environment Container)
├── id, name, slug, description
├── type (basic, graph, document, table, custom)
├── config (stage-specific configuration)
├── metadata (flexible JSON)
├── is_active, is_system
└── timestamps

Scene (Presentational Layer)
├── id, slug, title, description
├── stage_id (belongs to Stage)
├── theme (style tokens and defaults)
├── is_system (true for System Scene)
└── timestamps

SceneNode (Presentational Instance)
├── id, title, description
├── scene_id (belongs to Scene)
├── core_ref (optional link to CoreGraphNode)
├── phantom (true if no Core link)
├── position (x, y, z, scale)
├── style (resolved from cascade)
├── meta (scene-specific data)
└── timestamps

SceneEdge (Presentational Connection)
├── id, label, description
├── scene_id (belongs to Scene)
├── core_ref (optional link to CoreGraphEdge)
├── phantom (true if no Core link)
├── source_scene_node_id
├── target_scene_node_id
├── weight (inherited from Core or scene-specific)
├── style (resolved from cascade)
├── meta (scene-specific data)
└── timestamps
```

### Registry System
```
RegistryCatalog
├── scope (core.node, core.edge, scene.node, scene.edge)
├── key (semantic identifier)
├── type (string, number, boolean, array, object)
├── description (human-readable explanation)
├── default_value (JSON)
├── is_presentational (boolean)
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
- Discussions, bookmarks, notes accumulate to Core counters
- Background jobs handle aggregation
- Phantom-only anchors roll up to nearest Core link

## Snapshot System

### Purpose
- Fast, CDN-friendly delivery of presentational data
- Instant loads for public scenes
- API fallback for private/authoring scenarios
- Deterministic serialization for caching

### Snapshot Structure
```json
{
  "schema": { "name": "protogen.scene", "version": "1.0.0" },
  "scene": {
    "ids": { "stage": "stage-slug", "scene": "scene-slug" },
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
  "locator": {
    "stage": "stage-slug",
    "scene": "scene-slug",
    "etag": "sha256-BASE64",
    "url": "/snapshots/stage/scene/hash.json.br"
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

### 2. API Design
- RESTful endpoints with consistent patterns
- Proper HTTP status codes and error handling
- Rate limiting on authoring endpoints
- Input validation and sanitization

### 3. Event System
- Laravel events for domain changes
- Queued listeners for background processing
- Structured logging for observability
- Idempotent operations where possible

### 4. Caching Strategy
- Snapshots: Long-term immutable caching
- Manifests: Short TTL for freshness
- API responses: Appropriate TTL based on data type
- Client-side progressive hydration

## Performance Considerations

### 1. Database Optimization
- Proper indexing on frequently queried fields
- Pagination for large result sets
- Efficient JSON queries using GIN indexes
- Connection pooling and query optimization

### 2. Storage Optimization
- Brotli compression for snapshots
- Gzip fallback for compatibility
- Content-addressed storage paths
- Retention policies for old snapshots

### 3. Delivery Optimization
- CDN integration for global caching
- Progressive loading and hydration
- Efficient client-side rendering
- Background processing for heavy operations

## Security & Access Control

### 1. Authentication
- Laravel Sanctum for API authentication
- Session-based admin authentication
- Proper token management and expiration

### 2. Authorization
- Role-based access control (RBAC)
- Resource-level permissions
- Audit logging for sensitive operations
- Input validation and sanitization

### 3. Data Protection
- Secure storage of sensitive metadata
- Proper encryption for credentials
- Rate limiting to prevent abuse
- Input validation to prevent injection

## Testing Strategy

### 1. Unit Testing
- Invariant enforcement
- Style cascade resolution
- Snapshot serialization/deserialization
- Registry validation

### 2. Integration Testing
- Core ↔ System Scene mirroring
- Snapshot publishing and hydration
- Event system and background jobs
- API endpoint functionality

### 3. End-to-End Testing
- Complete user workflows
- Cross-browser compatibility
- Performance under load
- Error handling and recovery

## Deployment & Operations

### 1. Environment Setup
- Laravel backend with PostgreSQL
- React Admin interface
- Shared TypeScript library
- cPanel hosting with optional CDN

### 2. Monitoring & Observability
- Structured logging for all operations
- Performance metrics collection
- Error tracking and alerting
- Health checks and status endpoints

### 3. Backup & Recovery
- Database backup strategies
- Snapshot storage redundancy
- Disaster recovery procedures
- Rollback capabilities for deployments

## Future Considerations

### 1. Scalability
- Horizontal scaling for high-traffic scenarios
- Microservice architecture evolution
- Advanced caching strategies
- Load balancing and failover

### 2. Extensibility
- Plugin system for custom stages
- API versioning and evolution
- Third-party integrations
- Custom visualization components

### 3. Advanced Features
- Real-time collaboration
- Advanced graph algorithms
- Machine learning integration
- Advanced analytics and insights
