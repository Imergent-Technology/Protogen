# Spec 00: Project Context & Guardrails

**Initiative**: Authoring-Viewing Unification  
**Date**: October 14, 2025  
**Status**: Planning Phase  
**Type**: Foundation Specification

---

## Overview

This specification establishes the project context, principles, and guardrails for Protogen's evolution into a unified authoring-viewing platform. This is **not a separate project** but rather the natural evolution of Protogen's existing architecture.

**Core Principle**: Authoring = Viewing + Contextual Controls

---

## Project Identity

### What This Is

**Protogen Evolution** - Extending existing systems to support authoring capabilities:
- Same codebase, same architecture, same systems
- Authoring mode as an enhancement, not a replacement
- Viewing experience remains unchanged when not authoring
- Progressive enhancement approach

### What This Is NOT

❌ **Separate "Endogen" Project** - No parallel codebase  
❌ **Complete Rewrite** - Builds on existing foundation  
❌ **New Systems** - Extends Navigator, Toolbar, Scene, Dialog, Orchestrator  
❌ **Breaking Changes** - Backward compatible with existing content

---

## Core Principles

### 1. Viewing-First Architecture

**Viewing is the Foundation**:
- Authoring overlays on top of viewing runtime
- Same rendering pipeline for both modes
- View mode has zero authoring overhead
- Authoring mode loads additional capabilities on demand

**Example**: Card Scene
```
View Mode: Render slide with text/image/layers
Author Mode: View Mode + selection handles + context menus + property inspector
```

### 2. Modular by Default

**Each Feature is a Subsystem**:
- Clear interfaces and contracts
- Lazy loading via Orchestrator
- Independent testing and development
- Plugin architecture for extensibility

**System Module Pattern** (existing):
```typescript
// Follows Protogen's established pattern
import { authoringSystem } from '@protogen/shared/systems/authoring';
import { previewService } from '@protogen/shared/services/preview';
```

### 3. Consistent Mental Model

**Navigation Hierarchy**:
```
Deck
├── Scene (Card | Document | Graph | Video)
    ├── Slides (Card scene)
    ├── Pages (Document scene)
    ├── Nodes/Edges (Graph scene)
    └── Clips (Video scene)
```

**Single Scene View**: Always show one scene at a time  
**Smooth Transitions**: Zoom in/out, next/prev, ToC jumps  
**Previews Available**: Thumbnails in ToC, carousel, overviews

### 4. Contextual Actions First

**Right-Click/Long-Press Drives Actions**:
- On element → element-specific actions
- On blank space → add/create actions
- Context-aware menu items
- Keyboard shortcuts for all actions

**Example**: Card Scene Context Menus
```
On Text: Edit, Format, Timing, Remove
On Image: Replace, Crop, Remove  
On Blank: Add Text, Add Image, Add Layered Slide
```

### 5. Non-Intrusive UI

**Zero Permanent Clutter**:
- Toolbars collapse/expand as needed
- Drawers slide in/out (ToC left, Properties right)
- Context menus appear on demand
- Full-screen viewing when not authoring

**Mobile**: Single drawer with tabs, gesture-friendly

### 6. Progressive Complexity

**Scene Type Rollout**:
1. **Card** (Phase 1): Simple, validates approach
2. **Document** (Phase 2): Multi-page complexity
3. **Graph** (Phase 3): Requires design workshop
4. **Video** (Phase 4): Timeline complexity, deferred

---

## Integration with Protogen

### Extends These Existing Systems

#### Navigator System (`shared/src/systems/navigator/`)

**Current State**:
- Context-based navigation
- Event-driven architecture
- URL synchronization
- History management

**Enhancements**:
- Authoring mode state (`view | author`)
- Deck→Scene→Slide/Page flows
- Enhanced zoom transitions
- Selection-aware navigation

**Backward Compatibility**: All existing navigation patterns preserved

#### Toolbar System (`shared/src/systems/toolbar/`)

**Current State**:
- Multi-edge support (top, bottom, left, right)
- Drawer system for slide-out panels
- Widget plugin architecture
- Configuration service

**Enhancements**:
- ToC integration in left drawer
- Properties/Inspector in right drawer
- Preview Carousel widget (top toolbar)
- Mode toggle controls

**Backward Compatibility**: Existing toolbar configurations work unchanged

#### Dialog System (`shared/src/systems/dialog/`)

**Current State**:
- Multiple dialog types (modal, drawer, toast, confirmation)
- State management with singleton
- Event-driven lifecycle

**Enhancements**:
- Context menu rendering
- Property inspector dialogs
- Authoring-specific dialogs

**Backward Compatibility**: All existing dialog types continue to work

#### Scene System (`shared/src/systems/scene/`)

**Current State**:
- SceneRouter for context→scene mapping
- Default system scenes
- Scene rendering pipeline
- URL integration

**Enhancements**:
- New scene types (Card, Document, Graph, Video)
- Authoring overlay integration
- Preview generation
- Enhanced rendering pipeline

**Backward Compatibility**: Existing scenes render identically

#### Orchestrator System (`shared/src/systems/orchestrator/`)

**Current State**:
- System coordination
- Event distribution
- State management

**Enhancements**:
- Dynamic subsystem loading
- Scene-type library management
- Authoring mode policies
- Lazy loading coordination

**Backward Compatibility**: Existing coordination patterns maintained

### New Subsystems (Integrated into Protogen)

#### Authoring System (`shared/src/systems/authoring/`)

**Purpose**: Provide authoring capabilities as overlay on viewing

**Components**:
- AuthoringOverlay: Selection, handles, inline editing
- SelectionEngine: Scene-type-specific selection logic
- HighlightingEngine: Theme-aware visual feedback
- Mode management: Toggle between view/author

**Integration**: Loads only when authoring mode active

#### Preview Service (`shared/src/services/preview/`)

**Purpose**: Generate and manage scene/slide/page thumbnails

**Capabilities**:
- Offscreen rendering for snapshots
- Size tiers (XS, SM, MD) for different UI contexts
- Metadata hashing for staleness detection
- Cache management

**Integration**: Extends existing snapshot system

---

## Deliverable Type

### Planning Phase (Current)

**18 Specification Documents** (this is spec 00/18):
- Detailed interfaces and contracts
- State machines and diagrams
- Integration points with existing systems
- Test strategies and acceptance criteria
- **NO production code**

### Implementation Phase (Future)

**After planning approval**:
- TypeScript implementation
- React components
- Tests (Jest/RTL)
- Documentation updates
- Incremental rollout with feature flags

---

## Scene Type Priority & Rationale

### Phase 1: Card Scene Type

**Why First**:
- Simplest scene type (slides with text/images)
- Validates authoring overlay approach
- Tests preview generation
- Minimal dependencies

**Complexity**: Low  
**Risk**: Low  
**Value**: High (validates entire approach)

### Phase 2: Document Scene Type

**Why Second**:
- Introduces multi-page complexity
- Tests anchor/linking system
- Validates ToC integration
- Real-world use case

**Complexity**: Medium  
**Risk**: Medium  
**Value**: High (practical authoring tool)

### Phase 3: Graph Scene Type

**Why Third**:
- Complex UX requiring design workshop
- Integrates with existing Graph Studio
- Node/edge selection challenges
- Mini-map and zoom complexity

**Complexity**: High  
**Risk**: Medium-High  
**Value**: Very High (core Protogen feature)

**Note**: Requires dedicated design workshop before implementation

### Phase 4: Video Scene Type

**Why Last (Deferred)**:
- Timeline editor complexity
- Clip sequencing and trimming
- Playback synchronization
- Captioning system

**Complexity**: Very High  
**Risk**: High  
**Value**: High (but can be added later)

**Note**: Deferred until Card, Document, Graph proven successful

---

## Guardrails & Constraints

### Technical Guardrails

1. **No Breaking Changes**: Existing features must continue to work
2. **TypeScript Strict Mode**: All code must compile without errors
3. **A11y First**: WCAG 2.1 AA compliance required
4. **Performance Budgets**: No degradation of existing performance
5. **SSR Compatible**: All systems work in SSR context

### Architectural Guardrails

1. **Extend, Don't Replace**: Enhance existing systems
2. **Event-Driven**: Use existing event system patterns
3. **Lazy Loading**: Authoring libs load only when needed
4. **Single Responsibility**: Each subsystem has clear purpose
5. **Testing Required**: Unit and integration tests for all new code

### UX Guardrails

1. **Viewing Unchanged**: View mode users see no difference
2. **Progressive Disclosure**: Show complexity only when needed
3. **Keyboard Navigation**: All actions accessible via keyboard
4. **Mobile Friendly**: Touch-optimized for mobile/tablet
5. **Consistent Patterns**: Follow existing Protogen UX patterns

### Process Guardrails

1. **Planning Before Code**: Complete specs before implementation
2. **Incremental Rollout**: Feature flags for gradual deployment
3. **Backward Compatibility**: Migration path for existing content
4. **Documentation Required**: Update all relevant docs
5. **Stakeholder Review**: Major decisions require approval

---

## Success Criteria

### Planning Phase Success

**18 Complete Specifications**:
- [ ] All interfaces and contracts defined
- [ ] State machines documented
- [ ] Integration points mapped
- [ ] Test strategies established
- [ ] Acceptance criteria clear

**Architectural Soundness**:
- [ ] No circular dependencies
- [ ] Event taxonomy comprehensive
- [ ] Lazy loading well-defined
- [ ] Performance considered
- [ ] A11y integrated from start

**Integration Clarity**:
- [ ] Every spec shows Protogen integration
- [ ] Backward compatibility confirmed
- [ ] Migration paths defined
- [ ] Risk mitigation planned

### Implementation Phase Success (Future)

**Card Scene Type**:
- [ ] Create, edit, delete slides
- [ ] Text/Image/Layered slide support
- [ ] Preview generation working
- [ ] ToC integration functional
- [ ] Existing scenes unaffected

**Document Scene Type**:
- [ ] Multi-page support
- [ ] Anchor linking working
- [ ] Block editing functional
- [ ] Page previews generated
- [ ] Existing scenes unaffected

**System Integration**:
- [ ] Navigator authoring mode working
- [ ] Toolbar drawers integrated
- [ ] Context menus functional
- [ ] Preview Carousel operational
- [ ] Performance targets met

---

## Risk Management

### High-Risk Areas

**Navigator Overhaul**:
- Risk: Breaking existing navigation
- Mitigation: Incremental changes, feature flags, extensive testing
- Rollback: Keep old Navigator accessible during migration

**Performance Impact**:
- Risk: Preview generation slows down saves
- Mitigation: Debouncing, offscreen rendering, background processing
- Monitoring: Performance budgets and alerts

### Medium-Risk Areas

**Authoring Overlay Complexity**:
- Risk: Different scene types require different approaches
- Mitigation: Clear interfaces, plugin architecture, scene-type registry

**ToC State Synchronization**:
- Risk: ToC out of sync with Navigator
- Mitigation: Event-driven updates, single source of truth

### Low-Risk Areas

**Preview Carousel**:
- Risk: Minimal (optional feature)
- Mitigation: Feature flag, can be disabled

**Graph Scene Planning**:
- Risk: Complexity understood upfront
- Mitigation: Dedicated design workshop, phased approach

---

## Milestone Overview

### M1: Card Scene + Core Systems (6-8 weeks)
- Navigator authoring mode
- Authoring overlay framework
- Card scene type implementation
- Preview service
- ToC integration
- Preview Carousel

### M2: Document Scene (4-6 weeks)
- Document scene type
- Multi-page support
- Anchor system
- Block editing
- Page previews

### M3: Graph Scene (4-6 weeks)
- Design workshop (1 week)
- Planning and prototyping (1 week)
- Implementation (2-4 weeks)
- Integration with Graph Studio

### M4: Video Scene (2-4 weeks)
- Deferred pending M1-M3 success
- Planning phase only initially
- Implementation TBD

---

## Development Workflow

### Planning Phase (Current)

1. **Create Specifications** (Specs 00-18)
2. **Review with Stakeholders** (after each phase)
3. **Iterate on Feedback** (refine specs as needed)
4. **Approval Gate** (before implementation begins)

### Implementation Phase (Future)

1. **Feature Branch** per milestone
2. **Incremental Development** following specs
3. **Continuous Testing** (Jest/RTL/E2E)
4. **Code Review** (peer review required)
5. **Feature Flags** (for gradual rollout)
6. **Documentation Updates** (as features land)
7. **User Testing** (before general availability)

---

## Coordination with Existing Work

Per `docs/CONSOLIDATED_TODO_PLAN.md`:

### High Priority (Coordinate With)

**TypeScript Error Resolution**:
- Don't introduce new TypeScript errors
- Follow existing strict mode patterns
- Use proper typing for all new code

**Testing Foundation**:
- Use existing Jest/RTL infrastructure
- Follow established testing patterns
- Integrate with existing test suites

### Medium Priority (Consider)

**Documentation Updates**:
- Cross-reference authoring specs
- Update main roadmap with milestones
- Link from existing architecture docs

**Store Type Improvements**:
- New stores follow existing Zustand patterns
- Proper TypeScript definitions
- Consistent state management

### Deferred (May Integrate)

**Admin Menu Builder**:
- May integrate with authoring toolbar UI
- Consider unified configuration approach

**Permission System**:
- Authoring mode will require permissions
- Plan for permission integration

---

## Specification Index

This is **Spec 00 of 18** in the Authoring-Viewing Unification initiative.

**Next**: [Spec 01: Module Integration & Layout](./01-module-integration.md)

### Phase 0: Foundation
- ✅ **00**: Project Context & Guardrails (this document)
- 🔄 **01**: Module Integration & Layout

### Phase 1: Core Contracts
- ⏳ **02**: Event Taxonomy & Contracts
- ⏳ **03**: Navigator State & Flows  
- ⏳ **04**: Authoring Overlay Framework

### Phase 2: Interaction Systems
- ⏳ **05**: Context Menu System
- ⏳ **06**: Selection & Highlighting Strategies
- ⏳ **07**: Preview Service Specification

### Phase 3: UI Components
- ⏳ **08**: ToC Drawer Integration
- ⏳ **08a**: Preview Carousel Widget

### Phase 4: Scene Types
- ⏳ **09**: Card Scene Type
- ⏳ **10**: Document Scene Type
- ⏳ **11**: Graph Scene Planning Stub
- ⏳ **12**: Video Scene Deferred Stub

### Phase 5: System Integration
- ⏳ **13**: Orchestrator Integration
- ⏳ **14**: Persistence Models & Migrations

### Phase 6: Quality & Testing
- ⏳ **15**: QA & Accessibility Strategy
- ⏳ **16**: Architectural Decision Records

### Phase 7: Demo & Roadmap
- ⏳ **17**: Integration Demo Script
- ⏳ **18**: Milestone Roadmap

---

## References

- **Master Plan**: `docs/active-development/AUTHORING_VIEWING_UNIFICATION.md`
- **Consolidated TODO**: `docs/CONSOLIDATED_TODO_PLAN.md`
- **Development Roadmap**: `docs/active-development/DEVELOPMENT_ROADMAP.md`
- **Existing ADRs**: `docs/decisions/ADR-001` through `ADR-006`

---

## Changelog

**2025-10-14**: Initial specification created  
**Status**: Ready for stakeholder review

---

## Acceptance Criteria

- [x] Project context documented as Protogen evolution
- [x] Core principles established (6 principles)
- [x] Integration points with existing systems defined
- [x] Scene type priority and rationale documented
- [x] Guardrails and constraints established
- [x] Success criteria defined for planning and implementation
- [x] Risk management strategy outlined
- [x] Milestone overview provided
- [x] Coordination with existing work documented
- [x] Specification index created

**Status**: ✅ Complete - Ready for Spec 01

