# Protogen: Authoring-Viewing Unification & Navigator Overhaul

**Date**: October 14, 2025  
**Status**: Planning Phase  
**Integration**: Extends existing Protogen architecture

---

## Overview

This initiative evolves Protogen's existing architecture by unifying authoring and viewing experiences while overhauling the Navigator system. All changes build directly on Protogen's current foundation, extending existing systems rather than creating parallel ones.

**Core Principle**: Authoring = Viewing + Contextual Controls

**Integration Approach**: Enhance existing Protogen systems (Navigator, Toolbar, Scene, Dialog, Orchestrator)

---

## Priority & Scope

### Scene Type Priority

1. **Phase 1**: Card Scene Type (immediate)
2. **Phase 2**: Document Scene Type (immediate)  
3. **Phase 3**: Graph Scene Type (next design phase)
4. **Phase 4**: Video Scene Type (deferred)

### Deliverable Type

**Planning documents and specifications** (18 specification docs), NOT production code.  
Implementation follows after planning approval.

---

## Architecture Overview

### Enhanced Existing Systems

**Navigator System** (existing → enhanced):
- Complete overhaul for deck→scene→slide flows
- New state model supporting authoring mode
- Enhanced URL synchronization
- Integration with existing navigatorSystem singleton

**Toolbar/Drawer System** (existing → enhanced):
- ToC integration in left drawer
- Properties/Inspector in right drawer
- New Preview Carousel widget
- Maintains existing toolbar configuration

**Scene System** (existing → enhanced):
- Extended with new scene types (Card, Document, Graph, Video)
- SceneRouter remains compatible
- Scene rendering pipeline enhanced with authoring overlay
- Backward compatible with existing scenes

**Dialog System** (existing → enhanced):
- Context menus rendered as dialog overlays
- Property inspectors in drawer dialogs
- Maintained compatibility with existing dialog types

**Orchestrator System** (existing → enhanced):
- Dynamic subsystem loading/unloading
- Scene-type library loading
- Event emission and coordination
- Policy enforcement (authoring libs only in author mode)

### New Subsystems (Integrated into Protogen)

**AuthoringOverlay**:
- Mode-aware layer augmenting viewing with controls
- Integrated as system module in `shared/src/systems/authoring/`
- Works with existing scene rendering pipeline

**PreviewService**:
- Thumbnail generation and management
- Integrated as service in shared library
- Works with existing snapshot system

**Selection/Highlighting Engine**:
- Scene-type-specific visual states
- Theme-aware highlighting
- Integrated with existing theme system

---

## Implementation Phases

### Phase 0: Foundation & Context (Specs 0-1)

**Objectives**:
- Document project context within Protogen architecture
- Define module structure extending existing systems
- Create integration plan with milestones

**Deliverables**:
- `docs/active-development/authoring-unification/00-project-context.md`
- `docs/active-development/authoring-unification/01-module-integration.md`
- Module dependency diagram showing integration points
- Folder structure in existing `shared/src/systems/`
- Milestone timeline with estimates

**Acceptance Criteria**:
- [ ] Project context documented as Protogen evolution
- [ ] Integration points with existing systems defined
- [ ] Milestones established: Card → Document → Graph → Video
- [ ] No new parallel systems - only extensions
- [ ] Estimates validated for Phase 1-2

### Phase 1: Core Contracts & Events (Specs 2-4)

**Objectives**:
- Extend existing event taxonomy for authoring interactions
- Design Navigator state machine enhancements
- Specify AuthoringOverlay framework

**Deliverables**:
- `docs/active-development/authoring-unification/02-event-taxonomy.md`
  - New event types: SELECT, EDIT, PREVIEW_READY, MODE_CHANGED
  - Extended existing events: NAVIGATE, FOCUS, ZOOM
  - Payload schemas and error handling
  - Sequence diagrams for key flows
- `docs/active-development/authoring-unification/03-navigator-enhancements.md`
  - State machine extensions (mermaid statechart)
  - New transitions for authoring mode
  - Enhanced URL/routing strategy
  - Integration with existing Navigator state
  - Test scenarios for edge cases
- `docs/active-development/authoring-unification/04-authoring-overlay.md`
  - Overlay framework interfaces
  - hitTest, selection model, handles/ghosts
  - Mode toggle mechanism
  - Integration with existing scene renderer
  - Keyboard interaction spec

**Acceptance Criteria**:
- [ ] Event taxonomy extends existing event system
- [ ] Navigator enhancements documented as additions
- [ ] Authoring overlay integrates with scene system
- [ ] Sequence diagrams show integration flows
- [ ] Test plan includes existing Navigator features

### Phase 2: Interaction Systems (Specs 5-7)

**Objectives**:
- Design context menu system using existing Dialog system
- Define selection/highlighting strategies per scene type
- Specify preview service extending snapshot system

**Deliverables**:
- `docs/active-development/authoring-unification/05-context-menu.md`
  - Context ActionRegistry design
  - Integration with Dialog system for menu rendering
  - Action specs for Card (Add Text/Image, Timing)
  - Action specs for Document (Insert Block, Link to Anchor)
  - Keyboard/A11y alternatives
- `docs/active-development/authoring-unification/06-highlighting-strategies.md`
  - Visual strategies per scene type
  - Integration with existing theme system
  - Theme tokens for selection states
  - Wireframes/screenshots
  - Fallback strategies for busy backgrounds
- `docs/active-development/authoring-unification/07-preview-service.md`
  - Extends existing snapshot system
  - Offscreen snapshot lifecycle
  - Size tiers (XS/SM/MD) specification
  - Metadata hashing for staleness detection
  - Cache policy and performance budget
  - Usage map: ToC, filmstrip, overview boards

**Acceptance Criteria**:
- [ ] ContextActionRegistry uses Dialog system
- [ ] Selection strategies use existing theme tokens
- [ ] Preview service extends snapshot system
- [ ] Performance targets align with existing benchmarks
- [ ] Theme integration preserves existing themes

### Phase 3: UI Components (Specs 8-8A)

**Objectives**:
- Design ToC integration into existing Toolbar drawer
- Specify Preview Carousel as new Toolbar widget

**Deliverables**:
- `docs/active-development/authoring-unification/08-toc-integration.md`
  - Integration with existing left Toolbar drawer
  - Tree structure: Deck → Scenes → Slides/Pages
  - Thumbnail integration using Preview service
  - State sync with Navigator system
  - Keyboard navigation map
  - Mobile: single drawer with tabs (existing pattern)
- `docs/active-development/authoring-unification/08a-preview-carousel.md`
  - New Toolbar widget (top placement)
  - Visibility rule schema
  - Navigation behaviors (click/keyboard/drag)
  - Selection reflection with Navigator
  - Future: Repositionable to any toolbar slot via existing toolbar config
  - Slot model uses existing toolbar architecture
  - Performance: thumbnail virtualization

**Acceptance Criteria**:
- [ ] ToC uses existing Toolbar drawer system
- [ ] Preview Carousel follows Toolbar widget patterns
- [ ] Accessibility behaviors match existing standards
- [ ] Mobile strategy uses existing drawer approach
- [ ] Future repositioning uses existing toolbar config

### Phase 4: Scene Type Specifications (Specs 9-12)

**Objectives**:
- Specify Card scene type (new)
- Specify Document scene type (new)
- Create planning stub for Graph scene type
- Create deferred stub for Video scene type

**Deliverables**:
- `docs/active-development/authoring-unification/09-card-scene-type.md`
  - Data model extending Scene base
  - Slides with kind (text/image/layered)
  - Timing for layered text animations
  - Authoring actions and inspector schema
  - JSON schemas for all slide types
  - Preview snapshot criteria
  - Enter animation spec (declarative)
  - Integration with existing scene rendering
- `docs/active-development/authoring-unification/10-document-scene-type.md`
  - Data model extending Scene base
  - Multi-page support with blocks
  - Anchor system for cross-page links
  - Context menus: Insert Block, Add Page, Link to Anchor
  - Page/anchor JSON schemas
  - Navigation rules for pages
  - Preview per page
  - ToC sync strategy
  - Integration with existing context system
- `docs/active-development/authoring-unification/11-graph-planning-stub.md`
  - User stories for graph authoring
  - UX risks and challenges
  - Node/edge selection concepts
  - Integration with existing Graph Studio
  - Mini-map vs zoom considerations
  - Authoring affordances needed
  - Preview approach options
  - Phased implementation plan
  - Open questions for design workshop
- `docs/active-development/authoring-unification/12-video-deferred-stub.md`
  - Clip sequencing concepts
  - Trim controls (start/end)
  - Playback policy options
  - Captioning system outline
  - Poster/preview generation
  - Timeline-lite editor concepts
  - Complexity drivers identified
  - Dependencies on other systems
  - Success criteria for future phase

**Acceptance Criteria**:
- [ ] All scene types extend existing Scene base model
- [ ] Card and Document integrate with scene rendering pipeline
- [ ] Graph planning integrates with existing Graph Studio
- [ ] Video stub identifies integration points
- [ ] All scene types work with existing snapshot system

### Phase 5: System Integration (Specs 13-14)

**Objectives**:
- Document Orchestrator system integration for dynamic loading
- Define persistence models extending existing schemas

**Deliverables**:
- `docs/active-development/authoring-unification/13-orchestrator-integration.md`
  - Integration with existing Orchestrator system
  - Dynamic subsystem loading API (extends existing)
  - Scene-type library ensure() mechanism
  - Event emission patterns (extends existing events)
  - Policy: authoring libs only in author mode
  - Failure handling and recovery
  - Integration sequence with Navigator & Overlay
  - No new Orchestrator - extends existing
- `docs/active-development/authoring-unification/14-persistence-models.md`
  - Deck, Scene, Slide models (extends existing)
  - DocumentPage, Asset, Preview models
  - Placeholders: Graph, Video
  - Revision ID strategy (compatible with existing)
  - Preview staleness via hash
  - ERD showing integration with existing models
  - Migration plan (non-breaking, additive)
  - Sample JSON fixtures for testing
  - Backward compatibility with existing scenes

**Acceptance Criteria**:
- [ ] Orchestrator integration documented (not new system)
- [ ] Lazy loading strategy extends existing patterns
- [ ] All persistence models extend existing schemas
- [ ] Migration plan preserves existing data
- [ ] Test fixtures compatible with existing system

### Phase 6: Quality & Testing (Specs 15-16)

**Objectives**:
- Define accessibility and QA strategy consistent with Protogen
- Create architectural decision records (ADRs)

**Deliverables**:
- `docs/active-development/authoring-unification/15-qa-accessibility.md`
  - Keyboard navigation extending existing patterns
  - ARIA roles consistent with existing components
  - Unit test matrix for state machine
  - Integration test scenarios
  - Registry testing strategy
  - Preview service testing
  - A11y checklist (WCAG compliance)
  - Tooling recommendations (uses existing Jest/RTL)
- `docs/active-development/authoring-unification/16-adrs.md`
  - ADR-007: Authoring overlay approach
  - ADR-008: Preview service and thumbnail strategy
  - ADR-009: ToC drawer integration
  - ADR-010: Preview Carousel widget design
  - ADR-011: Scene type extensibility model
  - ADR-012: Orchestrator integration pattern
  - ADR index with cross-references to existing ADRs (001-006)

**Acceptance Criteria**:
- [ ] A11y checklist aligns with existing standards
- [ ] Test matrix uses existing testing infrastructure
- [ ] ADRs numbered sequentially from existing (007-012)
- [ ] Tooling plan uses existing Jest/RTL setup
- [ ] WCAG compliance consistent with existing goals

### Phase 7: Demo & Roadmap (Specs 17-18)

**Objectives**:
- Create integration demo script
- Produce milestone roadmap integrated with Protogen roadmap

**Deliverables**:
- `docs/active-development/authoring-unification/17-demo-script.md`
  - End-to-end flow using existing systems:
    1. Open Deck with Card+Document scenes
    2. Zoom to Card; add layered text; SAVE → preview updates
    3. Open ToC; jump to Document page; add anchor; navigate
    4. Toggle Author off → viewing parity check
  - Success criteria checklist
  - Screenshots/wireframes to capture
  - Integration points with existing features
- `docs/active-development/authoring-unification/18-roadmap-milestones.md`
  - M1: Card + Navigator + Overlay + ToC + Previews
  - M2: Document (pages/anchors)
  - M3: Graph (design→spike)
  - M4: Video (kickoff)
  - Integration with existing Protogen development roadmap
  - Entry/exit criteria per milestone
  - Risk assessment and mitigation
  - Contingency options
  - Resource requirements
  - Timeline estimates

**Acceptance Criteria**:
- [ ] Demo script validates integration with existing systems
- [ ] Milestone roadmap aligns with Protogen roadmap
- [ ] Risks account for existing system dependencies
- [ ] Timeline coordinated with ongoing development

### Phase 8: Documentation & Collation (Final)

**Objectives**:
- Collate all specifications
- Create comprehensive README
- Provide changelog

**Deliverables**:
- `docs/active-development/authoring-unification/README.md`
  - Overview as Protogen evolution
  - Links to all 18 specification documents
  - Quick reference guide
  - Implementation priorities
  - Integration points with existing Protogen systems
  - References to existing architecture docs
- `docs/active-development/authoring-unification/CHANGELOG.md`
  - Decision summary
  - Specification completion timeline
  - Major design choices
  - Integration notes
  - Open questions and TODOs

**Acceptance Criteria**:
- [ ] All 18 specs linked from README
- [ ] Changelog captures integration decisions
- [ ] Documentation cross-references existing Protogen docs
- [ ] No production code generated (specs only)
- [ ] Clear path from specs to implementation

---

## Integration with Existing Protogen Architecture

### Extends These Existing Systems

**Navigator System** (`shared/src/systems/navigator/`):
- Maintains existing singleton pattern
- Extends state model with authoring mode
- Enhances URL sync service
- Preserves context-based navigation
- Backward compatible with existing navigation

**Dialog System** (`shared/src/systems/dialog/`):
- Context menus use existing dialog overlays
- Property inspectors use drawer dialogs
- Maintains all existing dialog types
- No breaking changes to dialog API

**Toolbar System** (`shared/src/systems/toolbar/`):
- ToC integrates into existing left drawer
- Properties into existing right drawer
- Preview Carousel as new widget type
- Uses existing toolbar configuration system
- Maintains existing menu structure

**Scene System** (`shared/src/systems/scene/`):
- New scene types extend Scene base
- SceneRouter enhanced, not replaced
- Rendering pipeline augmented with overlay
- Existing scenes continue to work

**Orchestrator System** (`shared/src/systems/orchestrator/`):
- **Not a new "OrchestratorBridge"** - extends existing system
- Adds dynamic library loading capabilities
- Enhances event coordination
- Implements authoring mode policies
- Maintains existing system coordination

**Shared Library** (`shared/`):
- New subsystems as additional system modules
- SSR-ready architecture preserved
- TypeScript strict mode maintained
- Follows existing export patterns

### New System Modules (Added to Protogen)

**Authoring System** (`shared/src/systems/authoring/`):
- New system module following existing patterns
- AuthoringOverlay component
- Selection/Highlighting engine
- Integration hooks for scene types
- Follows existing system module structure

**Preview System** (`shared/src/systems/preview/` or service):
- Thumbnail generation service
- Extends existing snapshot system
- Cache management
- Size tier handling
- Integration with existing storage

---

## New ADRs (Continuing Existing Sequence)

Protogen currently has ADRs 001-006. These new decisions continue the sequence:

1. **ADR-007**: Authoring Overlay Architecture
2. **ADR-008**: Preview Service and Thumbnail Strategy
3. **ADR-009**: ToC Drawer Integration
4. **ADR-010**: Preview Carousel Widget Design
5. **ADR-011**: Scene Type Extensibility Model
6. **ADR-012**: Orchestrator Integration Pattern

---

## Risk Assessment

### High Risk

**Navigator Overhaul**: Major refactoring of critical system
- *Mitigation*: Incremental migration, maintain backward compatibility, feature flags
- *Integration*: Preserve existing navigation patterns, add new capabilities

**Performance**: Preview generation on save could impact UX
- *Mitigation*: Debouncing, offscreen rendering, size optimization
- *Integration*: Use existing snapshot system patterns

### Medium Risk

**Authoring Overlay Complexity**: Different strategies per scene type
- *Mitigation*: Clear interfaces, plugin architecture
- *Integration*: Follow existing system module patterns

**ToC State Sync**: Keeping ToC in sync with Navigator
- *Mitigation*: Event-driven updates, single source of truth
- *Integration*: Use existing Navigator event system

### Low Risk

**Preview Carousel**: Additive feature, can be disabled
- *Mitigation*: Feature flag, progressive rollout
- *Integration*: Optional toolbar widget following existing patterns

**Graph Scene Type**: Deferred to design phase
- *Mitigation*: Stub interfaces, clear planning document
- *Integration*: Builds on existing Graph Studio

---

## Success Metrics

### Documentation Quality
- [ ] All 18 specs complete and integrated with existing docs
- [ ] Interfaces defined extending existing systems
- [ ] State diagrams show integration points
- [ ] Acceptance criteria include backward compatibility

### Architectural Soundness
- [ ] Event taxonomy extends existing events
- [ ] No circular dependencies introduced
- [ ] Lazy loading uses existing patterns
- [ ] A11y and performance align with existing standards

### Integration Readiness
- [ ] Full compatibility with existing Protogen systems
- [ ] Migration path from current architecture
- [ ] ADRs continue existing numbering (007-012)
- [ ] Demo script validates existing feature preservation

---

## Timeline Estimate

**Planning Phase** (Specification Documents): 10-15 weeks

- **Phase 0-1** (Foundation & Contracts): 2-3 weeks
- **Phase 2-3** (Interaction & UI): 2-3 weeks
- **Phase 4** (Scene Types): 3-4 weeks
- **Phase 5-6** (Integration & QA): 2-3 weeks
- **Phase 7-8** (Demo & Documentation): 1-2 weeks

**Implementation Phase** (after planning approval): 16-24 weeks

- **M1** (Card + Core): 6-8 weeks
- **M2** (Document): 4-6 weeks
- **M3** (Graph Design/Spike): 4-6 weeks
- **M4** (Video Kickoff): 2-4 weeks

---

## Coordination with Existing Development

Per `docs/CONSOLIDATED_TODO_PLAN.md`, coordinate with:

**High Priority Tasks**:
- TypeScript error resolution (don't introduce new errors)
- Testing foundation completion (new tests follow existing patterns)

**Medium Priority Tasks**:
- Documentation updates (cross-reference authoring specs)
- Store type improvements (new stores follow existing patterns)

**Deferred Tasks**:
- Admin Menu Builder UI (may integrate with authoring UI)
- Permission System (authoring mode requires permissions)

---

## Next Steps

1. **Review this integration plan** with stakeholders
2. **Begin Phase 0**: Document project context as Protogen evolution
3. **Execute specs sequentially** ensuring integration at each phase
4. **Schedule Graph design workshop** (before M3)
5. **Coordinate with ongoing development** per Consolidated TODO Plan
6. **Update main development roadmap** with these milestones

---

## Notes

- **Protogen evolution, not separate project**: All work extends existing systems
- **No "Endogen" branding**: This is Protogen's next phase
- **Integration first**: Every spec must show integration points
- **Backward compatibility**: Existing scenes, navigation, dialogs must continue to work
- **Scene type priority**: Card → Document → Graph → Video
- **A11y first**: Consistent with existing accessibility standards
- **Performance budgets**: Align with existing performance targets
- **OrchestratorBridge → Orchestrator Integration**: Not a new system, extends existing

---

**This plan evolves Protogen's existing architecture through carefully integrated enhancements, maintaining backward compatibility while introducing powerful new authoring capabilities.**

