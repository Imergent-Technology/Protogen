# Spec 16: Architectural Decision Records

**Initiative**: Authoring-Viewing Unification  
**Date**: October 14, 2025  
**Status**: Planning Phase  
**Type**: Decision Documentation  
**Depends On**: All previous specs (00-15)

---

## Overview

This specification documents the key architectural decisions made during the authoring-viewing unification initiative. These ADRs continue Protogen's existing sequence (ADRs 001-006) with six new decisions (ADRs 007-012).

**Principle**: Document decisions with context, rationale, and consequences.

---

## ADR Index

Protogen's existing ADRs:
- **ADR-001**: Graph Dual Execution
- **ADR-002**: Flow System over Wizard Pattern
- **ADR-003**: Central Graph System Architecture
- **ADR-004**: Scene-First Routing
- **ADR-005**: SSR Architecture
- **ADR-006**: Unified Portal Design

**New ADRs** (from this initiative):
- **ADR-007**: Authoring Overlay Architecture
- **ADR-008**: Preview Service and Thumbnail Strategy
- **ADR-009**: ToC Drawer Integration
- **ADR-010**: Preview Carousel Widget Design
- **ADR-011**: Scene Type Extensibility Model
- **ADR-012**: Orchestrator Integration Pattern

---

## ADR-007: Authoring Overlay Architecture

**Status**: Proposed  
**Date**: October 14, 2025

### Context

Protogen needs authoring capabilities for creating and editing scene content. The question was whether to create separate authoring UIs or integrate authoring into the viewing experience.

### Decision

**We will implement authoring as an overlay on the viewing runtime**, where authoring controls appear only in author mode and the same rendering pipeline serves both viewing and authoring.

### Rationale

1. **Consistency**: Authors see exactly what viewers will see
2. **DRY**: Single rendering codebase, no duplication
3. **Performance**: No separate authoring bundle
4. **UX**: Seamless transition between viewing and authoring
5. **Maintenance**: Changes to rendering automatically affect both modes

### Consequences

**Positive**:
- ✅ True WYSIWYG authoring experience
- ✅ No code duplication between view/author modes
- ✅ Smaller bundle size (shared renderer)
- ✅ Consistent behavior across modes

**Negative**:
- ⚠️ Authoring controls must not interfere with viewing
- ⚠️ Selection/hit-testing adds complexity
- ⚠️ Mode toggle must be clear to users

### Implementation

- AuthoringOverlay component (Spec 04)
- Mode management in Navigator (Spec 03)
- Scene-type plugins for authoring behavior (Spec 04)

---

## ADR-008: Preview Service and Thumbnail Strategy

**Status**: Proposed  
**Date**: October 14, 2025

### Context

Navigation features (ToC, Preview Carousel, overview boards) require thumbnail images of scenes/slides/pages. The question was how to generate and manage these previews efficiently.

### Decision

**We will implement a Preview Service that generates thumbnails on-save using offscreen canvas rendering**, with three size tiers (XS, SM, MD) and aggressive caching with staleness detection.

### Rationale

1. **Performance**: Offscreen rendering doesn't block UI
2. **Quality**: Canvas rendering produces high-quality images
3. **Flexibility**: Multiple sizes for different UI contexts
4. **Efficiency**: Cache with staleness detection avoids redundant generation
5. **Integration**: Extends existing snapshot system patterns

### Consequences

**Positive**:
- ✅ Fast preview generation (< 200ms for SM)
- ✅ Multiple size tiers for different contexts
- ✅ Automatic cache invalidation on content changes
- ✅ Consistent with existing snapshot system

**Negative**:
- ⚠️ Save latency increases slightly (debounced)
- ⚠️ Storage requirements increase (cached images)
- ⚠️ Complex staleness detection logic

### Implementation

- PreviewService with size tiers (Spec 07)
- Debounced queue for generation
- LRU cache with 24-hour TTL
- Database table for persistence

**Alternatives Considered**:
- Server-side generation: Rejected (increases server load)
- Real-time generation: Rejected (too slow for UX)
- External service (e.g., Puppeteer): Rejected (infrastructure complexity)

---

## ADR-009: ToC Drawer Integration

**Status**: Proposed  
**Date**: October 14, 2025

### Context

Authors need quick navigation across deck/scene/slide/page hierarchy. The question was where to place the Table of Contents and how to integrate it with existing navigation.

### Decision

**We will integrate ToC into the existing Toolbar's left drawer**, using a hierarchical tree structure (Deck → Scenes → Slides/Pages) with thumbnail previews and state synchronization with the Navigator.

### Rationale

1. **Consistency**: Uses existing Toolbar drawer system
2. **Accessibility**: Always available, doesn't obstruct content
3. **Mobile-Friendly**: Drawer pattern works on all screen sizes
4. **Integration**: Natural sync with Navigator state
5. **Expandable**: Tree structure handles arbitrary depth

### Consequences

**Positive**:
- ✅ Reuses existing Toolbar infrastructure
- ✅ Consistent with other drawer-based features
- ✅ Mobile-friendly (drawer + tabs)
- ✅ Keyboard accessible (ARIA tree pattern)

**Negative**:
- ⚠️ Limited width (280px typical)
- ⚠️ Requires good tree design for deep hierarchies

### Implementation

- ToC component in left drawer (Spec 08)
- ARIA tree pattern for accessibility
- Thumbnail integration with Preview Service
- Mobile: single drawer with tabs

**Alternatives Considered**:
- Sidebar panel: Rejected (not mobile-friendly)
- Top toolbar: Rejected (takes too much vertical space)
- Floating panel: Rejected (accessibility issues)
- Modal overlay: Rejected (blocks content)

---

## ADR-010: Preview Carousel Widget Design

**Status**: Proposed  
**Date**: October 14, 2025

### Context

Authors need quick visual navigation across slide/page collections. The question was how to provide this without cluttering the UI.

### Decision

**We will implement a Preview Carousel as an optional Toolbar widget** with declarative visibility rules, starting with top toolbar placement (Phase 1) and future support for repositioning to any toolbar slot.

### Rationale

1. **Optional**: Can be enabled/disabled per scene/deck
2. **Contextual**: Visibility rules show it only when useful
3. **Flexible**: Future repositioning supports different workflows
4. **Performant**: Virtualization handles large collections
5. **Accessible**: Full keyboard navigation support

### Consequences

**Positive**:
- ✅ Quick visual navigation for collections
- ✅ Optional (zero overhead when disabled)
- ✅ Declarative visibility (adapts to context)
- ✅ Future-proof (repositionable)

**Negative**:
- ⚠️ Takes toolbar space when visible
- ⚠️ May be distracting if always shown

### Implementation

- PreviewCarousel widget (Spec 08a)
- Visibility rules system
- Phase 1: Top toolbar only
- Future: Any edge + slot placement

**Alternatives Considered**:
- Filmstrip at bottom: Rejected (not mobile-friendly)
- Always visible: Rejected (clutters UI)
- Sidebar: Rejected (conflicts with ToC drawer)
- Floating window: Rejected (positioning complexity)

---

## ADR-011: Scene Type Extensibility Model

**Status**: Proposed  
**Date**: October 14, 2025

### Context

Protogen needs to support multiple scene types (Card, Document, Graph, Video) with type-specific authoring behaviors. The question was how to make this extensible without hard-coding each type.

### Decision

**We will implement a plugin architecture where each scene type registers an authoring plugin** containing type-specific hit testing, change handling, components, and context actions.

### Rationale

1. **Extensibility**: New scene types can be added without changing core
2. **Modularity**: Each type's code is isolated
3. **Lazy Loading**: Type-specific code loads only when needed
4. **Testability**: Each type can be tested independently
5. **Flexibility**: Types can have completely different authoring UX

### Consequences

**Positive**:
- ✅ Easy to add new scene types
- ✅ Type-specific code is isolated
- ✅ Lazy loading reduces initial bundle
- ✅ Each type can innovate independently

**Negative**:
- ⚠️ Plugin registration overhead
- ⚠️ Must maintain plugin interface stability

### Implementation

- AuthoringPlugin interface (Spec 04)
- Plugin registration in AuthoringSystem
- Scene-type specific plugins (Specs 09, 10, 11, 12)
- Dynamic loading via Orchestrator (Spec 13)

**Alternatives Considered**:
- Hard-coded types: Rejected (not extensible)
- Inheritance model: Rejected (rigid, hard to compose)
- Configuration-only: Rejected (insufficient for complex types)

---

## ADR-012: Orchestrator Integration Pattern

**Status**: Proposed  
**Date**: October 14, 2025

### Context

Authoring features require dynamic loading of scene-type-specific libraries. The question was how to integrate this with Protogen's existing architecture without creating a new coordination system.

### Decision

**We will extend the existing Orchestrator system with library loading capabilities** rather than creating a separate "OrchestratorBridge" or new system.

### Rationale

1. **Integration**: Extends existing system, no new coordination layer
2. **Consistency**: Uses existing event patterns
3. **Policy**: Orchestrator already coordinates cross-system concerns
4. **Simplicity**: One orchestrator, not multiple coordination systems
5. **Maintenance**: Fewer systems to maintain

### Consequences

**Positive**:
- ✅ Reuses existing Orchestrator
- ✅ No new coordination layer
- ✅ Consistent with existing architecture
- ✅ Simpler mental model

**Negative**:
- ⚠️ Orchestrator grows in responsibility
- ⚠️ Must maintain backward compatibility

### Implementation

- Library loading methods in Orchestrator (Spec 13)
- LibraryRegistry for dynamic imports
- Policy enforcement in Orchestrator
- State persistence in Orchestrator

**Alternatives Considered**:
- New "OrchestratorBridge" system: Rejected (unnecessary layer)
- Library loading in each system: Rejected (duplication)
- Navigator handles loading: Rejected (wrong responsibility)
- Global module loader: Rejected (lacks policy enforcement)

---

## ADR Summary Table

| ADR | Decision | Impact | Status |
|-----|----------|--------|--------|
| ADR-007 | Authoring Overlay | High | Proposed |
| ADR-008 | Preview Service | Medium | Proposed |
| ADR-009 | ToC Drawer | Medium | Proposed |
| ADR-010 | Preview Carousel | Low | Proposed |
| ADR-011 | Scene Type Plugins | High | Proposed |
| ADR-012 | Orchestrator Integration | Medium | Proposed |

---

## Cross-References

### Related Existing ADRs

**ADR-002 (Flow System)**:
- Authoring uses Flow System for multi-step wizards
- Layered slide creation uses Flow
- Document page setup may use Flow

**ADR-003 (Central Graph)**:
- Graph scene authoring works with Subgraph system
- Scene Items for spatial positioning
- Integration with existing Graph Studio

**ADR-004 (Scene Routing)**:
- Authoring mode extends SceneRouter
- Item-level navigation (slides/pages)
- URL patterns for authoring

**ADR-005 (SSR Architecture)**:
- Authoring overlay client-side only
- Preview generation can be server-side
- SSR serves viewing content, not authoring UI

**ADR-006 (Unified Portal)**:
- Authoring features live in unified portal
- Role-based access to author mode
- Consistent UX across all modes

---

## ADR Documentation Process

### Creating ADR Documents

When implementation begins, create formal ADR documents:

```bash
# Create ADR file
touch docs/decisions/ADR-007-authoring-overlay.md

# Template structure
# ADR-007: Authoring Overlay Architecture
# Status: Accepted | Proposed | Rejected | Superseded
# Date: YYYY-MM-DD
# Context: ...
# Decision: ...
# Consequences: ...
# Alternatives Considered: ...
```

### ADR Lifecycle

1. **Proposed**: Initial specification (current state)
2. **Under Review**: Stakeholder review in progress
3. **Accepted**: Approved for implementation
4. **Implemented**: Code written and merged
5. **Superseded**: Replaced by newer decision

---

## Acceptance Criteria

- [x] Six new ADRs defined (007-012)
- [x] Each ADR includes context, decision, rationale, consequences
- [x] Alternatives considered documented
- [x] Implementation references provided
- [x] Cross-references with existing ADRs (001-006)
- [x] ADR summary table
- [x] ADR documentation process defined
- [x] ADR lifecycle stages specified

**Status**: ✅ Complete - Phase 6 Complete!

---

## References

- **Previous**: [Spec 15: QA & Accessibility Strategy](./15-qa-accessibility.md)
- **Next**: [Spec 17: Integration Demo Script](./17-demo-script.md)
- **Related**: Existing ADRs in `docs/decisions/`

---

## Changelog

**2025-10-14**: Initial specification created  
**Status**: Ready for stakeholder review

