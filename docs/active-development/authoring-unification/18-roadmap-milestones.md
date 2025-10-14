# Spec 18: Milestone Roadmap

**Initiative**: Authoring-Viewing Unification  
**Date**: October 14, 2025  
**Status**: Planning Phase  
**Type**: Implementation Roadmap  
**Depends On**: All previous specs (00-17)

---

## Overview

This specification defines the implementation milestones for authoring-viewing unification, integrated with Protogen's existing development roadmap. Milestones are sequenced to deliver value incrementally while managing risk.

**Principle**: Incremental delivery with working software at each milestone.

---

## Integration with Protogen Roadmap

### Current Protogen Status

Per `docs/active-development/DEVELOPMENT_ROADMAP.md`:

**Completed Phases**:
- Phase 0: Foundation (Dialog, Scene Routing, Toolbar, Navigator)
- Phase 1: Navigation History & Breadcrumbs
- Phase 2: Flow System (complete)
- Phase 2.5: Scene Management (70% complete)

**Current Development**:
- Scene Management UI (Phase 2.5.3 next)
- TypeScript error resolution
- Testing foundation completion

---

## Authoring Milestones

### Milestone 1 (M1): Card Scene + Core Systems

**Duration**: 6-8 weeks  
**Start After**: Scene Management (Phase 2.5) complete  
**Depends On**: TypeScript errors resolved, testing foundation complete

#### Entry Criteria

- [ ] Phase 2.5.3 (Scene Viewer Integration) complete
- [ ] TypeScript errors reduced to < 20 (currently 45)
- [ ] Testing foundation at 70%+ coverage
- [ ] All 18 planning specs approved

#### Deliverables

**Week 1-2**: Navigator Enhancements
- [ ] Extended Navigator state model (mode, locus, focus, selection)
- [ ] Mode toggle methods (enter/exit/toggle author mode)
- [ ] Item navigation methods (navigateToItem, next, prev)
- [ ] Zoom and focus with animation
- [ ] Enhanced URL synchronization
- [ ] Unit tests (22 tests)

**Week 3-4**: Authoring Overlay & Selection
- [ ] AuthoringSystem class with mode management
- [ ] SelectionEngine (single and multi-select)
- [ ] HitTestLayer with Card scene handler
- [ ] SelectionHighlight component
- [ ] InlineEditor component
- [ ] EditingHandles component
- [ ] Unit tests (27 tests)

**Week 5**: Preview Service
- [ ] PreviewService class
- [ ] ThumbnailGenerator with offscreen canvas
- [ ] Preview cache with LRU eviction
- [ ] Preview queue with debouncing
- [ ] Database migration for previews table
- [ ] API endpoints
- [ ] Unit tests (25 tests)

**Week 6**: ToC & Carousel
- [ ] ToC component with tree structure
- [ ] ToC integration in left Toolbar drawer
- [ ] Preview thumbnail loading
- [ ] Preview Carousel widget
- [ ] Visibility rules evaluation
- [ ] Keyboard navigation for both
- [ ] Unit tests (25 tests)

**Week 7-8**: Card Scene Type
- [ ] Slides table migration
- [ ] Slide model (Laravel)
- [ ] Card scene renderer (3 variants)
- [ ] Card authoring plugin
- [ ] Context menu actions
- [ ] Property inspectors
- [ ] Preview generation for slides
- [ ] E2E tests (5 scenarios)

#### Exit Criteria

- [ ] All Card scene features working
- [ ] Can create/edit/delete text/image/layered slides
- [ ] ToC and Carousel functional
- [ ] Previews generate correctly
- [ ] All tests passing (99 unit + 5 E2E)
- [ ] Documentation updated
- [ ] Performance targets met
- [ ] A11y audit passed

#### Success Metrics

- Unit test coverage: >= 90%
- Performance: Preview generation < 200ms
- Bundle size: Authoring libraries < 100KB
- User feedback: Positive on authoring UX

---

### Milestone 2 (M2): Document Scene

**Duration**: 4-6 weeks  
**Start After**: M1 complete  

#### Entry Criteria

- [ ] M1 complete and stable
- [ ] User feedback incorporated from M1
- [ ] No critical bugs from M1

#### Deliverables

**Week 1-2**: Document Infrastructure
- [ ] Document pages table migration
- [ ] Document page model (Laravel)
- [ ] Block types implementation (8 types)
- [ ] TipTap editor integration
- [ ] Block editor component
- [ ] Context menu actions for blocks
- [ ] Unit tests (30 tests)

**Week 3-4**: Anchors & Links
- [ ] Anchors table migration
- [ ] Links table migration
- [ ] Anchor model and service
- [ ] Link model and service
- [ ] Anchor creation UI
- [ ] Link picker dialog
- [ ] Anchor navigation
- [ ] Unit tests (25 tests)

**Week 5**: Pages & ToC
- [ ] Page management (add, split, remove)
- [ ] ToC generation from headings
- [ ] Page navigation
- [ ] Cross-page linking
- [ ] Page preview generation
- [ ] E2E tests (4 scenarios)

**Week 6**: Polish & Testing
- [ ] Document authoring plugin complete
- [ ] Property inspectors for all block types
- [ ] Performance optimization
- [ ] A11y audit
- [ ] Documentation
- [ ] User acceptance testing

#### Exit Criteria

- [ ] All Document scene features working
- [ ] Can create multi-page documents with rich content
- [ ] Anchor and link system functional
- [ ] ToC generation works
- [ ] Cross-scene links work
- [ ] All tests passing (55 unit + 4 E2E)
- [ ] Performance targets met
- [ ] User feedback positive

#### Success Metrics

- Unit test coverage: >= 90%
- Page preview generation: < 300ms
- TipTap editor load: < 500ms
- User feedback: Positive on document authoring

---

### Milestone 3 (M3): Graph Scene

**Duration**: 4-6 weeks  
**Start After**: M2 complete + Design Workshop  

#### Entry Criteria

- [ ] M2 complete and stable
- [ ] Design workshop completed
- [ ] All UX questions answered (from Spec 11)
- [ ] Graph authoring approach decided

#### Deliverables (Tentative - Post-Workshop)

**Week 1**: Design Workshop & Specification
- [ ] 2-hour design workshop
- [ ] UX decisions documented
- [ ] Full Graph authoring specification (Spec 11 v2)
- [ ] Technical feasibility confirmed

**Week 2-3**: Node & Edge Authoring
- [ ] Graph authoring plugin
- [ ] Node selection (chosen approach from workshop)
- [ ] Edge selection and management
- [ ] Node/edge context menus
- [ ] Property inspectors
- [ ] Unit tests (35 tests)

**Week 4-5**: Layouts & Navigation
- [ ] Layout algorithm implementation
- [ ] Layout selector UI
- [ ] Mini-map component
- [ ] Zoom/pan for large graphs
- [ ] Graph preview generation
- [ ] Unit tests (20 tests)

**Week 6**: Integration & Testing
- [ ] Integration with existing Graph Studio
- [ ] Performance optimization (1000+ nodes)
- [ ] E2E tests (3 scenarios)
- [ ] A11y audit
- [ ] User testing

#### Exit Criteria

- [ ] Graph authoring functional
- [ ] Layout algorithms working
- [ ] Large graph performance acceptable
- [ ] Integration with Graph Studio complete
- [ ] All tests passing (55 unit + 3 E2E)

#### Success Metrics

- Graph render performance: 1000+ nodes at 60fps
- Preview generation: < 1s for large graphs
- User feedback: Positive on graph authoring UX

---

### Milestone 4 (M4): Video Scene (Deferred)

**Duration**: TBD (2-4 weeks for planning, 8-12 weeks for implementation)  
**Start After**: M1-M3 proven successful  

#### Entry Criteria

- [ ] M1-M3 complete and stable
- [ ] User demand for video features validated
- [ ] Video infrastructure ready (transcoding, CDN)
- [ ] Resources available for 10-15 week effort

#### Scope

- Video scene planning (full specification)
- Infrastructure assessment
- Library evaluation (Video.js vs Plyr.js)
- Timeline editor design
- Implementation plan

**Note**: This milestone may be split or descoped based on priority

---

## Timeline Summary

```
Planning Phase (Complete): October 14 - Present
└─ 18 Specifications: ✅ Complete

Implementation Phase: TBD Start Date
├─ M1: Card Scene + Core (6-8 weeks)
│   └─ Target: Feb 2026
├─ M2: Document Scene (4-6 weeks)
│   └─ Target: April 2026
├─ M3: Graph Scene (4-6 weeks)
│   └─ Target: June 2026
└─ M4: Video Scene (TBD)
    └─ Target: TBD

Total Implementation: 14-20 weeks (excluding M4)
Expected Completion: June 2026 (M1-M3)
```

---

## Resource Requirements

### Team Composition

**M1** (Card Scene + Core):
- 1 Senior Frontend Developer (full-time)
- 1 Frontend Developer (full-time)
- 1 Backend Developer (50% time)
- 1 UX Designer (25% time for review)
- 1 QA Engineer (50% time)

**M2** (Document Scene):
- 1 Senior Frontend Developer (full-time)
- 1 Frontend Developer (full-time)
- 1 Backend Developer (25% time)
- 1 QA Engineer (50% time)

**M3** (Graph Scene):
- 1 Senior Frontend Developer (full-time)
- 1 Visualization Specialist (full-time)
- 1 Backend Developer (25% time)
- 1 UX Designer (50% time for workshop + review)
- 1 QA Engineer (50% time)

---

## Risk Assessment & Mitigation

### High Risk Items

**Risk**: Navigator overhaul breaks existing navigation
- Impact: Critical (core feature)
- Probability: Medium
- Mitigation: Feature flags, incremental rollout, extensive testing
- Contingency: Rollback plan, keep old Navigator available

**Risk**: Preview generation degrades save performance
- Impact: High (UX degradation)
- Probability: Medium
- Mitigation: Debouncing, offscreen rendering, background workers
- Contingency: Disable auto-preview, manual generation

**Risk**: Graph scene complexity exceeds estimates
- Impact: Medium (timeline delay)
- Probability: High
- Mitigation: Design workshop upfront, phased approach
- Contingency: Defer complex features to M3.5

### Medium Risk Items

**Risk**: Browser compatibility issues with authoring features
- Impact: Medium (some users affected)
- Probability: Low
- Mitigation: Cross-browser testing, progressive enhancement
- Contingency: Browser-specific fallbacks

**Risk**: A11y compliance issues discovered late
- Impact: Medium (must fix before release)
- Probability: Low
- Mitigation: A11y testing throughout, not just at end
- Contingency: Accessibility specialist review

### Low Risk Items

**Risk**: Preview Carousel visibility rules too complex
- Impact: Low (optional feature)
- Probability: Low
- Mitigation: Simple default rules, power users can customize
- Contingency: Disable feature if problematic

---

## Contingency Plans

### If M1 Exceeds Timeline

**Option A**: Reduce Scope
- Remove preview carousel (focus on core)
- Simplify ToC (no thumbnails initially)
- Reduce slide variants (text only first)

**Option B**: Extend Timeline
- Add 2 weeks to M1
- Delay M2 start
- Maintain full scope

**Option C**: Parallel Workstreams
- Split team: core + preview service in parallel
- Increases coordination overhead
- May finish faster overall

**Recommendation**: Option A (reduce scope) if > 2 weeks behind

### If Critical Bug Found

**Severity 1** (Blocks usage):
- Stop feature development
- All hands on fix
- Release patch ASAP
- Resume after fix deployed

**Severity 2** (Degrades experience):
- Continue development
- Fix in parallel
- Include in next release

**Severity 3** (Minor issue):
- Add to backlog
- Fix in polish phase
- May defer if time-constrained

---

## Success Criteria

### Milestone 1 (M1) Success

**Functional**:
- [ ] Author mode toggle works
- [ ] Card scenes fully authorable
- [ ] Previews generate correctly
- [ ] ToC and Carousel functional

**Technical**:
- [ ] Test coverage >= 90%
- [ ] Performance budgets met
- [ ] No critical bugs
- [ ] A11y audit passed

**Business**:
- [ ] User feedback positive
- [ ] Authoring faster than old method
- [ ] Reduced support tickets

### Milestone 2 (M2) Success

**Functional**:
- [ ] Document scenes fully authorable
- [ ] Multi-page support works
- [ ] Anchor and link system functional

**Technical**:
- [ ] Test coverage >= 90%
- [ ] TipTap editor performant
- [ ] No regressions from M1

**Business**:
- [ ] User adoption of document scenes
- [ ] Positive feedback on rich text editing

### Milestone 3 (M3) Success

**Functional**:
- [ ] Graph scenes authorable
- [ ] Layout algorithms work
- [ ] Large graph performance acceptable

**Technical**:
- [ ] 1000+ node graphs at 60fps
- [ ] Test coverage >= 85% (graph is complex)
- [ ] No regressions from M1-M2

**Business**:
- [ ] Graph authoring faster than old tools
- [ ] User feedback positive

---

## Go/No-Go Decision Points

### Before M1 Start

**Go Criteria**:
- [ ] All 18 specs approved
- [ ] Team assembled
- [ ] Prerequisites complete (Phase 2.5, TypeScript, Testing)
- [ ] Stakeholder sign-off

**No-Go Triggers**:
- [ ] More than 2 specs rejected
- [ ] Team unavailable
- [ ] Critical Protogen bugs need fixing
- [ ] Competing higher-priority initiative

### Before M2 Start

**Go Criteria**:
- [ ] M1 delivered successfully
- [ ] No critical bugs from M1
- [ ] User feedback positive (>= 4/5 rating)
- [ ] Performance acceptable

**No-Go Triggers**:
- [ ] M1 has critical unresolved bugs
- [ ] User feedback negative (< 3/5 rating)
- [ ] Performance below targets
- [ ] Team needs to support M1 issues

### Before M3 Start

**Go Criteria**:
- [ ] M2 delivered successfully
- [ ] Design workshop completed
- [ ] Graph authoring approach validated
- [ ] No critical bugs from M1-M2

**No-Go Triggers**:
- [ ] Design workshop reveals show-stoppers
- [ ] Technical feasibility in question
- [ ] Resource constraints
- [ ] Competing priorities

---

## Coordination with Existing Work

### Blocks M1 Start

- Scene Management Phase 2.5.3 must complete
- TypeScript error count must be < 20
- Testing foundation must be >= 70% coverage

### Parallel During M1-M3

**Can Continue**:
- Admin Menu Builder (low priority, independent)
- Documentation updates (synergy)
- Performance optimization (benefits authoring)

**Should Pause**:
- Major Navigator changes (conflicts)
- Major Scene system changes (conflicts)
- Major Toolbar changes (conflicts)

### After M3 Complete

**Enables**:
- Unified Portal migration (Phase 7 in main roadmap)
- Enhanced Engagement System (Phase 6)
- Bookmarks & Comments (Phase 4)

---

## Release Strategy

### M1 Release: Alpha

**Audience**: Internal users, early adopters  
**Features**: Card scene authoring  
**Release Type**: Feature flag (disabled by default)

**Rollout**:
- Week 1: Internal testing only
- Week 2: Beta testers (opt-in)
- Week 3: General availability (opt-in)
- Week 4: Default enabled (can opt-out)

### M2 Release: Beta

**Audience**: All users  
**Features**: Card + Document authoring  
**Release Type**: Beta (with feedback collection)

**Rollout**:
- Week 1: Existing beta users
- Week 2: All users (promoted in UI)
- Week 3: Beta status removed

### M3 Release: V1.0

**Audience**: Production users  
**Features**: Card + Document + Graph authoring  
**Release Type**: Stable release

**Rollout**:
- Week 1: Staged rollout (10% of users)
- Week 2: 50% of users
- Week 3: 100% of users
- Week 4: Old authoring tools deprecated

---

## Budget Estimates

### Development Costs (Rough)

**M1**: 6-8 weeks × 2.75 FTE = 16.5-22 person-weeks  
**M2**: 4-6 weeks × 2.25 FTE = 9-13.5 person-weeks  
**M3**: 4-6 weeks × 2.75 FTE = 11-16.5 person-weeks  

**Total**: 36.5-52 person-weeks

### Infrastructure Costs

**Additional Services**:
- CDN for preview delivery: ~$50/month
- Increased storage for previews: ~$20/month
- Transcoding (if M4 pursued): ~$200/month

**One-Time**:
- Design workshop: 1 day UX designer time
- User testing: 3 sessions × $500 = $1,500

---

## Acceptance Criteria

- [x] Four milestones defined (M1-M4)
- [x] Timeline estimates (14-20 weeks for M1-M3)
- [x] Entry and exit criteria for each milestone
- [x] Deliverables broken down by week
- [x] Resource requirements specified
- [x] Risk assessment with mitigation strategies
- [x] Contingency plans documented
- [x] Go/No-Go decision points
- [x] Coordination with existing Protogen roadmap
- [x] Release strategy (Alpha, Beta, V1.0)
- [x] Budget estimates
- [x] Success criteria for each milestone

**Status**: ✅ Complete - All 18 Specs Complete! 🎉

---

## References

- **Previous**: [Spec 17: Integration Demo Script](./17-demo-script.md)
- **Master Plan**: `../AUTHORING_VIEWING_UNIFICATION.md`
- **Protogen Roadmap**: `../DEVELOPMENT_ROADMAP.md`

---

## Changelog

**2025-10-14**: Initial specification created  
**Status**: Ready for stakeholder approval

---

## Next Steps

1. **Review all 18 specifications** with stakeholders
2. **Approve/iterate** on any specs needing changes
3. **Schedule Go/No-Go decision** for M1
4. **Assemble team** for implementation
5. **Set M1 start date** (after prerequisites complete)

**Planning Phase**: ✅ COMPLETE  
**Implementation Phase**: 🔄 READY TO BEGIN (pending approval)

