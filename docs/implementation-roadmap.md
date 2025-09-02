# Protogen Implementation Roadmap

## Overview
This document outlines the phased implementation plan for the Protogen Core Foundation architecture, breaking down the work into manageable, incremental steps that maintain system stability throughout the transition.

## Phase 1: Foundation & Core Enhancements (Weeks 1-2)

### 1.1 Edge Weight Implementation
**Priority**: High
**Effort**: 2-3 days

- [ ] Add `weight` column to `core_graph_edges` table (migration)
- [ ] Update `CoreGraphEdge` model to include weight field
- [ ] Backfill existing edges with default weight 1.0
- [ ] Add validation rules for weight (numeric, positive)
- [ ] Update API endpoints to handle weight
- [ ] Add unit tests for weight validation

**Files to modify**:
- `api/database/migrations/` (new migration)
- `api/app/Models/CoreGraphEdge.php`
- `api/app/Http/Controllers/Api/CoreGraphApiController.php`
- `api/tests/` (new test files)

### 1.2 Registry System Foundation
**Priority**: High
**Effort**: 3-4 days

- [ ] Create `registry_catalog` table migration
- [ ] Create `RegistryCatalog` model
- [ ] Implement registry validation service
- [ ] Add registry seeding for common metadata keys
- [ ] Create registry management API endpoints
- [ ] Add unit tests for registry validation

**Files to create**:
- `api/app/Models/RegistryCatalog.php`
- `api/app/Services/RegistryValidationService.php`
- `api/app/Http/Controllers/Api/RegistryApiController.php`
- `api/database/migrations/` (new migration)
- `api/database/seeders/RegistryCatalogSeeder.php`

### 1.3 Event System Setup
**Priority**: Medium
**Effort**: 2-3 days

- [ ] Create domain event classes for Core operations
- [ ] Set up event listeners for Core↔System Scene mirroring
- [ ] Configure queue system for background processing
- [ ] Add structured logging for domain events
- [ ] Create event tests

**Files to create**:
- `api/app/Events/Core/`
- `api/app/Listeners/Core/`
- `api/app/Jobs/` (background processing)

## Phase 2: Scene Layer Implementation (Weeks 3-4)

### 2.1 Scene Models & Database
**Priority**: High
**Effort**: 4-5 days

- [ ] Create Scene, SceneNode, SceneEdge table migrations
- [ ] Create corresponding Eloquent models
- [ ] Implement relationships between models
- [ ] Add database indexes for performance
- [ ] Create model factories for testing
- [ ] Add comprehensive model tests

**Files to create**:
- `api/app/Models/Scene.php`
- `api/app/Models/SceneNode.php`
- `api/app/Models/SceneEdge.php`
- `api/database/migrations/` (multiple migrations)
- `api/database/factories/` (model factories)

### 2.2 System Scene Creation
**Priority**: High
**Effort**: 2-3 days

- [ ] Create System Scene seeder
- [ ] Implement Core↔System Scene mirroring logic
- [ ] Add event listeners for automatic mirroring
- [ ] Create tests for mirroring invariants
- [ ] Add rollback/recovery mechanisms

**Files to create**:
- `api/app/Services/SystemSceneMirrorService.php`
- `api/database/seeders/SystemSceneSeeder.php`
- `api/app/Listeners/SystemSceneMirrorListener.php`

### 2.3 Scene API Endpoints
**Priority**: Medium
**Effort**: 3-4 days

- [ ] Create Scene CRUD API endpoints
- [ ] Implement SceneNode and SceneEdge endpoints
- [ ] Add bulk import/export functionality
- [ ] Implement scene validation
- [ ] Add comprehensive API tests

**Files to create**:
- `api/app/Http/Controllers/Api/SceneApiController.php`
- `api/app/Http/Controllers/Api/SceneNodeApiController.php`
- `api/app/Http/Controllers/Api/SceneEdgeApiController.php`
- `api/routes/api.php` (new routes)

## Phase 3: Snapshot System (Weeks 5-6)

### 3.1 Snapshot Builder
**Priority**: High
**Effort**: 4-5 days

- [ ] Create Snapshot model and structure
- [ ] Implement deterministic serialization
- [ ] Add schema validation
- [ ] Create content hashing (SHA256)
- [ ] Implement Brotli/Gzip compression
- [ ] Add snapshot tests

**Files to create**:
- `api/app/Services/SnapshotBuilderService.php`
- `api/app/Models/Snapshot.php`
- `api/app/Models/SnapshotManifest.php`
- `api/tests/Unit/SnapshotBuilderTest.php`

### 3.2 Snapshot Publishing
**Priority**: High
**Effort**: 3-4 days

- [ ] Implement snapshot storage system
- [ ] Create manifest management
- [ ] Add retention policies (keep last 10)
- [ ] Implement rollback functionality
- [ ] Add publishing tests

**Files to create**:
- `api/app/Services/SnapshotPublisherService.php`
- `api/app/Jobs/PublishSnapshotJob.php`
- `api/app/Console/Commands/PruneSnapshotsCommand.php`

### 3.3 Storage Integration
**Priority**: Medium
**Effort**: 2-3 days

- [ ] Configure Laravel Storage for snapshots
- [ ] Set up public disk for web access
- [ ] Implement content-addressed paths
- [ ] Add compression middleware
- [ ] Configure cache headers

**Files to modify**:
- `api/config/filesystems.php`
- `api/app/Http/Middleware/` (compression middleware)

## Phase 4: Shared Library & Hydration (Weeks 7-8)

### 4.1 TypeScript Types
**Priority**: High
**Effort**: 2-3 days

- [ ] Define Snapshot schema types
- [ ] Create Scene/SceneNode/SceneEdge types
- [ ] Add validation types
- [ ] Export types from shared library

**Files to create**:
- `shared/src/types/snapshot.ts`
- `shared/src/types/scene.ts`
- `shared/src/types/validation.ts`

### 4.2 Hydration Engine
**Priority**: High
**Effort**: 4-5 days

- [ ] Implement snapshot validation
- [ ] Create migration system for schema versions
- [ ] Build progressive hydration (nodes → edges → contexts)
- [ ] Add style resolution utilities
- [ ] Create comprehensive tests

**Files to create**:
- `shared/src/services/SnapshotHydrator.ts`
- `shared/src/services/StyleResolver.ts`
- `shared/src/utils/snapshotUtils.ts`
- `shared/src/tests/` (test files)

### 4.3 Shared Library Integration
**Priority**: Medium
**Effort**: 2-3 days

- [ ] Update shared library exports
- [ ] Add build configuration for new modules
- [ ] Create documentation for new APIs
- [ ] Add integration tests

## Phase 5: UI Integration & Authoring (Weeks 9-10)

### 5.1 Selection & Import Modal
**Priority**: High
**Effort**: 4-5 days

- [ ] Create dual-tab modal (List/Graph)
- [ ] Implement text search and filtering
- [ ] Add bulk actions (linked/phantom)
- [ ] Integrate with Scene API
- [ ] Add comprehensive UI tests

**Files to create**:
- `admin/src/components/graph/SelectionImportModal.tsx`
- `admin/src/components/graph/ListTab.tsx`
- `admin/src/components/graph/GraphTab.tsx`
- `admin/src/hooks/useSceneImport.ts`

### 5.2 Scene Management UI
**Priority**: Medium
**Effort**: 3-4 days

- [ ] Create Scene list view
- [ ] Add Scene creation/editing forms
- [ ] Implement Scene publishing controls
- [ ] Add snapshot rollback UI
- [ ] Create scene management tests

**Files to create**:
- `admin/src/components/scene/SceneList.tsx`
- `admin/src/components/scene/SceneForm.tsx`
- `admin/src/components/scene/ScenePublishing.tsx`

### 5.3 GraphStudio Integration
**Priority**: High
**Effort**: 2-3 days

- [ ] Integrate Scene layer with existing GraphStudio
- [ ] Add Scene switching functionality
- [ ] Implement phantom element support
- [ ] Update existing components for Scene awareness

**Files to modify**:
- `admin/src/components/graph/GraphStudio.tsx`
- `admin/src/components/graph/GraphCanvas.tsx`

## Phase 6: Performance & Polish (Weeks 11-12)

### 6.1 Rebuild Triggers
**Priority**: Medium
**Effort**: 3-4 days

- [ ] Implement debounced rebuild system
- [ ] Add Core/Scene/Type event subscriptions
- [ ] Create rebuild queue management
- [ ] Add performance monitoring
- [ ] Create rebuild tests

**Files to create**:
- `api/app/Services/RebuildTriggerService.php`
- `api/app/Jobs/TriggerRebuildJob.php`
- `api/app/Listeners/RebuildTriggerListener.php`

### 6.2 Engagement System
**Priority**: Low
**Effort**: 4-5 days

- [ ] Create discussion anchoring system
- [ ] Implement engagement aggregation
- [ ] Add Core counter updates
- [ ] Create engagement tests

**Files to create**:
- `api/app/Models/Discussion.php`
- `api/app/Services/EngagementAggregatorService.php`
- `api/app/Jobs/AggregateEngagementJob.php`

### 6.3 Testing & Documentation
**Priority**: Medium
**Effort**: 3-4 days

- [ ] Complete end-to-end test coverage
- [ ] Update API documentation
- [ ] Create user guides
- [ ] Add performance benchmarks
- [ ] Document deployment procedures

## Implementation Notes

### Database Migration Strategy
- Use Laravel's migration system for all schema changes
- Create rollback migrations for each change
- Test migrations on development database before production
- Use database transactions for complex migrations

### API Versioning
- Maintain backward compatibility during transition
- Use feature flags for new functionality
- Implement proper deprecation notices
- Create migration guides for API consumers

### Testing Strategy
- Unit tests for all new services and models
- Integration tests for API endpoints
- End-to-end tests for complete workflows
- Performance tests for snapshot system
- Golden file tests for snapshot stability

### Deployment Considerations
- Deploy database migrations first
- Use blue-green deployment for zero-downtime
- Monitor system performance during transition
- Have rollback procedures ready
- Test on staging environment first

## Success Criteria

### Phase 1 Complete
- [ ] Edge weights are implemented and validated
- [ ] Registry system is functional
- [ ] Event system is operational
- [ ] All tests pass

### Phase 2 Complete
- [ ] Scene models are created and tested
- [ ] System Scene is functional
- [ ] Scene API endpoints are working
- [ ] Core↔System Scene mirroring is verified

### Phase 3 Complete
- [ ] Snapshots can be created and stored
- [ ] Publishing system is operational
- [ ] Storage integration is working
- [ ] Compression and caching are functional

### Phase 4 Complete
- [ ] Shared library exports new types
- [ ] Hydration engine is functional
- [ ] Style resolution is working
- [ ] All tests pass

### Phase 5 Complete
- [ ] Selection/import modal is functional
- [ ] Scene management UI is working
- [ ] GraphStudio integration is complete
- [ ] UI tests pass

### Phase 6 Complete
- [ ] Rebuild triggers are operational
- [ ] Engagement system is functional
- [ ] Performance targets are met
- [ ] Documentation is complete

## Risk Mitigation

### Technical Risks
- **Database Performance**: Monitor query performance, add indexes as needed
- **Memory Usage**: Implement pagination and streaming for large datasets
- **Storage Costs**: Monitor snapshot storage usage, implement retention policies
- **API Complexity**: Maintain backward compatibility, use feature flags

### Operational Risks
- **Deployment Issues**: Use blue-green deployment, have rollback procedures
- **Data Migration**: Test migrations thoroughly, backup before deployment
- **Performance Degradation**: Monitor system metrics, implement performance budgets
- **User Experience**: Gather feedback, iterate on UI/UX improvements

### Timeline Risks
- **Scope Creep**: Stick to defined phases, defer non-essential features
- **Resource Constraints**: Prioritize critical path items, adjust scope as needed
- **Integration Complexity**: Start integration early, identify issues early
- **Testing Delays**: Automate testing, run tests continuously
