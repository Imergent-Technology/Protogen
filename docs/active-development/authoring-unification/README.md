# Authoring-Viewing Unification Specifications

**Initiative**: Protogen Evolution  
**Date Started**: October 14, 2025  
**Status**: Phase 0 Complete ✅ | Phase 1 In Progress 🔄

---

## Overview

This directory contains the 18 specification documents for Protogen's evolution into a unified authoring-viewing platform. These are **planning documents** that define interfaces, contracts, and integration strategies—**not production code**.

**Core Principle**: Authoring = Viewing + Contextual Controls

---

## Quick Links

- **Master Plan**: [`../AUTHORING_VIEWING_UNIFICATION.md`](../AUTHORING_VIEWING_UNIFICATION.md)
- **Consolidated TODO**: [`../../CONSOLIDATED_TODO_PLAN.md`](../../CONSOLIDATED_TODO_PLAN.md)
- **Completion Summary**: `./COMPLETION_SUMMARY.md` (coming soon)

---

## Specification Index

### ✅ Phase 0: Foundation & Context (Complete)

- **[00-project-context.md](./00-project-context.md)** - Project Context & Guardrails
  - Protogen evolution (not separate project)
  - Core principles and guardrails
  - Integration with existing systems
  - Scene type priority and rationale
  - Risk management strategy

- **[01-module-integration.md](./01-module-integration.md)** - Module Integration & Layout
  - Extends `shared/src/systems/` structure
  - New systems: Authoring, Preview Service
  - Enhanced systems: Navigator, Scene, Toolbar, Orchestrator
  - Dependency graph and import patterns
  - Migration strategy

### ✅ Phase 1: Core Contracts & Events (Complete)

- **[02-event-taxonomy.md](./02-event-taxonomy.md)** - Event Taxonomy & Contracts
  - 17 event types defined (MODE_CHANGED, SELECTION_CHANGED, EDIT_*, CONTENT_*, PREVIEW_*, TOC_*, NAVIGATE extended)
  - Payload schemas with TypeScript contracts
  - Error handling and idempotency strategies
  - 3 sequence diagrams for key flows

- **[03-navigator-enhancements.md](./03-navigator-enhancements.md)** - Navigator State & Flows
  - Extended state model with mode, locus, focus, selection
  - State machine with transitions
  - Item navigation methods (navigate, next, prev, zoom)
  - Enhanced URL synchronization for authoring

- **[04-authoring-overlay.md](./04-authoring-overlay.md)** - Authoring Overlay Framework
  - AuthoringSystem class with mode management
  - Hit test layer with scene-type handlers
  - Selection engine (single and multi-select)
  - Inline editor and editing handles
  - Plugin architecture for scene types
  - Keyboard shortcuts and focus management

### ⏳ Phase 2: Interaction Systems (Pending)

- **05-context-menu.md** - Context Menu System
- **06-highlighting-strategies.md** - Selection & Highlighting Strategies
- **07-preview-service.md** - Preview Service Specification

### ⏳ Phase 3: UI Components (Pending)

- **08-toc-integration.md** - ToC Drawer Integration
- **08a-preview-carousel.md** - Preview Carousel Widget

### ⏳ Phase 4: Scene Types (Pending)

- **09-card-scene-type.md** - Card Scene Type
- **10-document-scene-type.md** - Document Scene Type
- **11-graph-planning-stub.md** - Graph Scene Planning Stub
- **12-video-deferred-stub.md** - Video Scene Deferred Stub

### ⏳ Phase 5: System Integration (Pending)

- **13-orchestrator-integration.md** - Orchestrator Integration
- **14-persistence-models.md** - Persistence Models & Migrations

### ⏳ Phase 6: Quality & Testing (Pending)

- **15-qa-accessibility.md** - QA & Accessibility Strategy
- **16-adrs.md** - Architectural Decision Records

### ⏳ Phase 7: Demo & Roadmap (Pending)

- **17-demo-script.md** - Integration Demo Script
- **18-roadmap-milestones.md** - Milestone Roadmap

---

## Progress Summary

### Completed: 5 of 18 (28%)

**Phase 0** (2 specs): ✅ Complete
- Project context and guardrails established
- Module structure and integration points defined
- Foundation ready for detailed specifications

**Phase 1** (3 specs): ✅ Complete
- Event taxonomy extending existing event system
- Navigator enhancements for authoring mode and item navigation
- Authoring overlay framework with selection and editing
**Phase 2** (3 specs): ⏳ Pending  
**Phase 3** (2 specs): ⏳ Pending  
**Phase 4** (4 specs): ⏳ Pending  
**Phase 5** (2 specs): ⏳ Pending  
**Phase 6** (2 specs): ⏳ Pending  
**Phase 7** (2 specs): ⏳ Pending

---

## Key Decisions

### This IS Protogen

- **Not** a separate "Endogen" project
- **Not** a rewrite or parallel system
- **IS** Protogen's evolution
- **IS** backward compatible

### Integration First

Every specification:
- Shows integration with existing systems
- Extends rather than replaces
- Maintains backward compatibility
- Follows established patterns

### Scene Type Priority

1. **Card** (Phase 1) - Validates approach
2. **Document** (Phase 2) - Real-world use case
3. **Graph** (Phase 3) - Requires design workshop
4. **Video** (Phase 4) - Deferred

---

## Acceptance Criteria

### Per Specification

Each spec must include:
- [ ] Clear interfaces and contracts
- [ ] Integration points with Protogen systems
- [ ] TypeScript-style type definitions
- [ ] State diagrams or flow charts (where applicable)
- [ ] Test strategy
- [ ] Acceptance criteria checklist

### Overall Initiative

- [ ] All 18 specifications complete
- [ ] No circular dependencies
- [ ] Backward compatibility confirmed
- [ ] Performance budgets defined
- [ ] A11y requirements integrated
- [ ] Migration paths documented

---

## Timeline

### Planning Phase (Current)

**Estimated**: 10-15 weeks total

- Phase 0-1 (Foundation & Contracts): 2-3 weeks ✅ Week 1 in progress
- Phase 2-3 (Interaction & UI): 2-3 weeks
- Phase 4 (Scene Types): 3-4 weeks
- Phase 5-6 (Integration & QA): 2-3 weeks
- Phase 7-8 (Demo & Docs): 1-2 weeks

### Implementation Phase (Future)

**Estimated**: 16-24 weeks after planning approval

- M1 (Card + Core): 6-8 weeks
- M2 (Document): 4-6 weeks
- M3 (Graph): 4-6 weeks
- M4 (Video): 2-4 weeks

---

## New ADRs

Continuing from existing ADRs 001-006:

- **ADR-007**: Authoring Overlay Architecture
- **ADR-008**: Preview Service and Thumbnail Strategy
- **ADR-009**: ToC Drawer Integration
- **ADR-010**: Preview Carousel Widget Design
- **ADR-011**: Scene Type Extensibility Model
- **ADR-012**: Orchestrator Integration Pattern

---

## How to Use These Specs

### For Stakeholders

1. Start with **00-project-context.md** for overview
2. Review **01-module-integration.md** for architecture
3. Dive into specific phases as needed
4. Provide feedback on each spec before proceeding

### For Developers

1. Read specs sequentially (00→18)
2. Understand interfaces before implementation
3. Follow established Protogen patterns
4. Reference existing systems for consistency
5. **No coding until planning phase complete**

### For Reviewers

1. Check integration points with existing systems
2. Verify backward compatibility
3. Validate test strategies
4. Confirm A11y requirements
5. Review acceptance criteria

---

## Deliverable Type

**Planning Phase** (Current):
- Specifications (interfaces, contracts, diagrams)
- Type definitions (TypeScript-style)
- Test strategies
- Migration plans
- **NO production code**

**Implementation Phase** (Future):
- TypeScript implementation
- React components
- Jest/RTL tests
- Updated documentation
- Incremental rollout

---

## Integration with Existing Work

Per `docs/CONSOLIDATED_TODO_PLAN.md`:

### Coordinates With

- **TypeScript Error Resolution**: Follow existing strict mode patterns
- **Testing Foundation**: Use established Jest/RTL infrastructure
- **Documentation Updates**: Cross-reference with existing docs
- **Store Type Improvements**: New stores follow Zustand patterns

### May Integrate Later

- **Admin Menu Builder**: Consider unified configuration
- **Permission System**: Authoring requires permission integration

---

## Questions?

- **Master Plan**: See [`../AUTHORING_VIEWING_UNIFICATION.md`](../AUTHORING_VIEWING_UNIFICATION.md)
- **Project Context**: See `./00-project-context.md`
- **Module Layout**: See `./01-module-integration.md`
- **Protogen Docs**: See `../../DEVELOPMENT.md`

---

## Status

**Phase 0**: ✅ Complete (2/2 specs)  
**Phase 1**: 🔄 Ready to begin (0/3 specs)  
**Overall**: 2 of 18 specifications complete (11%)

**Next**: Begin Phase 1 with Spec 02 (Event Taxonomy & Contracts)

---

**Last Updated**: October 14, 2025  
**Planning Phase Started**: October 14, 2025  
**Estimated Completion**: December 2025 - February 2026

