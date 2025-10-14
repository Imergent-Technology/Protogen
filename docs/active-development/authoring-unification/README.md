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

### ✅ Phase 2: Interaction Systems (Complete)

- **[05-context-menu.md](./05-context-menu.md)** - Context Menu System
  - ContextActionRegistry with scene-type and element-type keying
  - Card scene actions (text, image, layered slides + blank space)
  - Document scene actions (blocks, text, pages + blank space)
  - Graph and Video stubs
  - Integration with Dialog system
  - Keyboard navigation and mobile long-press support

- **[06-highlighting-strategies.md](./06-highlighting-strategies.md)** - Selection & Highlighting Strategies
  - Scene-type specific strategies (Card, Document, Graph stub, Video stub)
  - Theme integration with adaptive contrast
  - Multi-selection visual differentiation
  - Hover states and animations
  - Busy background fallback strategies
  - Accessibility (high contrast, screen readers)

- **[07-preview-service.md](./07-preview-service.md)** - Preview Service Specification
  - PreviewService with size tiers (XS, SM, MD)
  - Offscreen canvas rendering
  - Cache management with LRU eviction
  - Preview queue with debouncing and prioritization
  - Content hashing for staleness detection
  - Performance budgets and optimization
  - Database schema and API endpoints
  - React hooks (usePreview, useBatchPreviews)

### ✅ Phase 3: UI Components (Complete)

- **[08-toc-integration.md](./08-toc-integration.md)** - ToC Drawer Integration
  - Integration with existing Toolbar left drawer
  - Tree structure: Deck → Scenes → Slides/Pages
  - Thumbnail previews (XS size)
  - State sync with Navigator
  - Keyboard navigation (arrow keys, Enter, Home/End)
  - Search/filter capability
  - Mobile: single drawer with tabs
  - Virtual scrolling for large trees
  - ARIA tree pattern for accessibility

- **[08a-preview-carousel.md](./08a-preview-carousel.md)** - Preview Carousel Widget
  - New Toolbar widget type
  - Phase 1: Top toolbar placement
  - Visibility rules system (declarative conditions)
  - Collection item loading (Card/Document scenes)
  - Navigation on click and keyboard
  - Drag-to-scroll with snap-to-item
  - Current item highlighting
  - Responsive configs (desktop/tablet/mobile)
  - Virtualization for 100+ items
  - Future: Repositionable to any toolbar slot

### ✅ Phase 4: Scene Types (Complete)

- **[09-card-scene-type.md](./09-card-scene-type.md)** - Card Scene Type
  - Three slide variants: Text, Image, Layered
  - Text slide: typography, colors, spacing
  - Image slide: asset, fit, positioning, caption
  - Layered slide: background + text overlay with timing
  - Declarative animations (fade, slide-up, slide-down, zoom)
  - Property inspector schemas
  - Preview generation without animations
  - Slide transitions

- **[10-document-scene-type.md](./10-document-scene-type.md)** - Document Scene Type
  - Multi-page support with rich text blocks
  - 8 block types (Paragraph, Heading, Image, Code, Quote, List, Divider, Embed)
  - Anchor system (heading, text-selection, block, coordinate)
  - Cross-page and cross-scene linking
  - TipTap integration for rich text editing
  - Page management (add, split, remove)
  - ToC generation from headings
  - Preview per page

- **[11-graph-planning-stub.md](./11-graph-planning-stub.md)** - Graph Scene Planning Stub
  - User stories and UX challenges
  - Selection/highlighting options (glow, ring, overlay)
  - Layout algorithm considerations
  - 6 open questions for design workshop
  - Phased implementation plan (10 weeks)
  - Integration with existing Graph Studio
  - Performance considerations for large graphs

- **[12-video-deferred-stub.md](./12-video-deferred-stub.md)** - Video Scene Deferred Stub
  - Complexity drivers (timeline editing, media management, playback sync)
  - Conceptual data model (clips, transitions, captions)
  - Dependencies (Video.js, FFmpeg, transcoding, CDN)
  - Effort estimate (10-15 weeks)
  - Deferral rationale
  - Success criteria for future implementation

### ✅ Phase 5: System Integration (Complete)

- **[13-orchestrator-integration.md](./13-orchestrator-integration.md)** - Orchestrator Integration
  - Extends existing Orchestrator system (NOT new "OrchestratorBridge")
  - Dynamic library loading with LibraryRegistry
  - Scene-type library management (viewing + authoring)
  - Policy enforcement (authoring libs only in author mode)
  - Failure handling with retry logic
  - State persistence for authoring session
  - Integration sequences for enter/exit author mode
  - Event emission patterns

- **[14-persistence-models.md](./14-persistence-models.md)** - Persistence Models & Migrations
  - 6 new tables (slides, document_pages, anchors, links, previews, content_revisions)
  - Enhanced assets table
  - Laravel models for all entities
  - 6 migration files (additive, non-breaking)
  - API endpoint specifications
  - Sample JSON fixtures
  - Entity Relationship Diagram
  - Backward compatibility with existing scenes

### ✅ Phase 6: Quality & Testing (Complete)

- **[15-qa-accessibility.md](./15-qa-accessibility.md)** - QA & Accessibility Strategy
  - WCAG 2.1 AA compliance requirements
  - Keyboard navigation coverage (all components)
  - ARIA roles and attributes
  - Screen reader announcements
  - Reduced motion support
  - Unit test matrix (163 tests, 90% coverage target)
  - Integration test scenarios (3 workflows)
  - E2E test scenarios (2 complete flows)
  - Performance budgets (Lighthouse >= 90)
  - Tooling recommendations (Jest, axe, Playwright, Lighthouse)

- **[16-adrs.md](./16-adrs.md)** - Architectural Decision Records
  - ADR-007: Authoring Overlay Architecture
  - ADR-008: Preview Service and Thumbnail Strategy
  - ADR-009: ToC Drawer Integration
  - ADR-010: Preview Carousel Widget Design
  - ADR-011: Scene Type Extensibility Model
  - ADR-012: Orchestrator Integration Pattern
  - Cross-references with existing ADRs (001-006)
  - ADR documentation process defined

### ✅ Phase 7: Demo & Roadmap (Complete)

- **[17-demo-script.md](./17-demo-script.md)** - Integration Demo Script
  - 5-part demo scenario (Setup, Card Edit, Navigate, Document Edit, Viewing)
  - Complete user journey as content creator
  - 19 screenshots identified
  - 40+ success criteria checkpoints
  - Mock data requirements
  - Validation points for each part
  - Tests all major integration points

- **[18-roadmap-milestones.md](./18-roadmap-milestones.md)** - Milestone Roadmap
  - M1: Card Scene + Core (6-8 weeks, Feb 2026 target)
  - M2: Document Scene (4-6 weeks, April 2026 target)
  - M3: Graph Scene (4-6 weeks, June 2026 target)
  - M4: Video Scene (deferred, TBD)
  - Entry/exit criteria for each milestone
  - Resource requirements (2-3 FTE per milestone)
  - Risk assessment with mitigation plans
  - Go/No-Go decision points
  - Release strategy (Alpha → Beta → V1.0)
  - Budget estimates (36.5-52 person-weeks total)

---

## Progress Summary

### Completed: 18 of 18 (100%) 🎉

**Phase 0** (2 specs): ✅ Complete
- Project context and guardrails established
- Module structure and integration points defined
- Foundation ready for detailed specifications

**Phase 1** (3 specs): ✅ Complete
- Event taxonomy extending existing event system
- Navigator enhancements for authoring mode and item navigation
- Authoring overlay framework with selection and editing

**Phase 2** (3 specs): ✅ Complete
- Context menu system with scene-type specific actions
- Selection and highlighting strategies for all scene types
- Preview service with size tiers, caching, and staleness detection

**Phase 3** (2 specs): ✅ Complete
- ToC drawer integration with tree navigation and thumbnails
- Preview Carousel widget with visibility rules and keyboard navigation

**Phase 4** (4 specs): ✅ Complete
- Card scene type with text/image/layered slide variants
- Document scene type with multi-page, blocks, and anchors
- Graph scene planning stub (requires design workshop)
- Video scene deferred stub (complexity documented)

**Phase 5** (2 specs): ✅ Complete
- Orchestrator integration for dynamic library loading
- Persistence models and database migrations

**Phase 6** (2 specs): ✅ Complete
- QA and accessibility strategy with WCAG 2.1 AA compliance
- Architectural Decision Records (ADRs 007-012)

**Phase 7** (2 specs): ✅ Complete
- Integration demo script with complete user journey
- Milestone roadmap with timeline and resource estimates

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

