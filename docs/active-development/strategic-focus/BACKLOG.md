# Strategic Backlog

**Last Updated**: October 19, 2025  
**Priority System**: P0 (Critical) → P1 (High) → P2 (Medium) → P3 (Low) → P4 (Future)

---

## P0: Critical Path (Graph Foundation)

### Sprint 1: Graph Studio Extraction ✅ Active
**Status**: 🔄 In Progress  
**Target**: Week of Oct 21, 2025  
**Effort**: 12-18 hours

**Deliverables**:
- Graph Studio in shared library
- GraphStudioSystem singleton
- useGraphStudio hook
- Admin still works

**Why P0**: Foundation for all graph work. Blocks Sprint 2.

---

### Sprint 2: Portal Graph Viewer
**Status**: ⏳ Next Up  
**Target**: Week of Oct 28, 2025  
**Effort**: 16-20 hours

**Tasks**:
- [ ] Create GraphSceneViewer component in portal
- [ ] Connect to subgraph loading API (already exists)
- [ ] Integrate with Navigator for routing
- [ ] Basic node rendering with Sigma.js
- [ ] Node selection click handler
- [ ] Simple node detail dialog

**Deliverable**: Graph scenes viewable in portal  
**Why P0**: Enables interactive exploration (core goal #1)  
**Blocked By**: Sprint 1 completion

---

### Sprint 3: Interactive Graph Features
**Status**: ⏳ Planned  
**Target**: Week of Nov 4, 2025  
**Effort**: 16-24 hours

**Tasks**:
- [ ] Zoom animation on node click (Navigator focus APIs)
- [ ] Node detail dialog with rich context
- [ ] "Explore related" functionality (traverse edges)
- [ ] Pan/zoom controls with smooth animations
- [ ] Keyboard navigation (arrows, Enter, Escape)
- [ ] Mini-map for orientation (stretch goal)
- [ ] Performance optimization (100+ node graphs)

**Deliverable**: Rich interactive graph exploration  
**Why P0**: Core exploration experience (stated goal #1)  
**Blocked By**: Sprint 2 completion

---

## P1: Core Experience (Navigation & Cohesion)

### Sprint 4: Navigation Layer
**Status**: ⏳ Planned  
**Target**: Weeks of Nov 11 & 18, 2025  
**Effort**: 24-32 hours

**Tasks**:
- [ ] DeckOverview component (visual scene grid)
- [ ] Scene cards with basic thumbnails
- [ ] Click-to-navigate transitions
- [ ] Breadcrumb trail (Deck > Scene > Node)
- [ ] Inter-scene navigation (graph-based links)
- [ ] Back/forward browser navigation
- [ ] URL deep-linking to specific nodes
- [ ] Context preservation across navigation

**Deliverable**: Cohesive deck→scene→node navigation  
**Why P1**: Addresses cohesion goal (#2), enables exploration flows  
**Blocked By**: Sprint 3 completion

---

## P2: Engagement (User Feedback)

### Sprint 5: User Feedback Foundation
**Status**: ⏳ Planned  
**Target**: Weeks of Nov 25 & Dec 2, 2025  
**Effort**: 20-28 hours

**Tasks**:
- [ ] Comment anchor system (nodes, scenes)
- [ ] Feedback API endpoints (CRUD)
- [ ] Feedback sidebar component (right drawer)
- [ ] Comment threading (basic)
- [ ] Bookmark system (star nodes/scenes)
- [ ] Bookmarks collection view
- [ ] Recent/favorites in navigation
- [ ] User engagement tracking (basic analytics)

**Deliverable**: Context-sensitive feedback and bookmarks  
**Why P2**: Addresses feedback goal (#3), drives engagement  
**Blocked By**: Sprint 4 completion (need navigation context)

---

## P3: Deferred (Authoring Polish)

### Sprint 6: Card Authoring Bug Fixes
**Status**: ⏳ Backlog  
**Target**: Mid-December 2025  
**Effort**: 16-24 hours

**Tasks**:
- [ ] Document all current Card authoring bugs
- [ ] Fix critical bugs preventing basic use
- [ ] Improve slide creation UX
- [ ] Add graph node linking to cards
- [ ] Polish property inspectors
- [ ] Test full authoring workflow
- [ ] Remove "experimental" banner

**Deliverable**: Stable card authoring  
**Why P3**: Can defer until graph foundation solid  
**Blocked By**: Sprint 4 (need node linking capability)

**Current Issues** (to document):
- Unknown bugs preventing use
- Missing node linking
- Incomplete workflow

---

### Sprint 7: Card Scene Enhancements
**Status**: ⏳ Backlog  
**Target**: Late December 2025  
**Effort**: 12-16 hours

**Tasks**:
- [ ] Preview generation for slides
- [ ] Slide transitions and animations
- [ ] Timing controls for layered slides
- [ ] Full-screen presentation mode
- [ ] ToC integration for slides
- [ ] Carousel navigation

**Deliverable**: Rich card scene experience  
**Why P3**: Enhancement, not foundation  
**Blocked By**: Sprint 6 (need stable authoring)

---

## P3: Deferred (Document Authoring)

### Sprint 8: Document Scene Foundation
**Status**: ⏳ Backlog  
**Target**: January 2026  
**Effort**: 24-32 hours

**Tasks**:
- [ ] Database migrations (document_pages, anchors, links)
- [ ] Document page model and API
- [ ] TipTap editor integration
- [ ] Block types implementation (8 types)
- [ ] Basic page management (add, split, remove)
- [ ] Document scene viewer component

**Deliverable**: Basic document authoring  
**Why P3**: Deferred per Authoring-Unification M2  
**Blocked By**: Sprint 6 (authoring foundation needed)

---

### Sprint 9: Document Authoring Advanced
**Status**: ⏳ Backlog  
**Target**: February 2026  
**Effort**: 20-28 hours

**Tasks**:
- [ ] Anchor system (4 anchor types)
- [ ] Link system (cross-page, cross-scene, external)
- [ ] Link picker dialog
- [ ] Anchor navigation
- [ ] ToC generation from headings
- [ ] Page previews
- [ ] Document authoring polish

**Deliverable**: Full document authoring capability  
**Why P3**: Advanced authoring feature  
**Blocked By**: Sprint 8

---

## P4: Future Work

### Graph Authoring (Future Milestone)
**Status**: 📋 Planning Only  
**Target**: TBD (requires design workshop)  
**Effort**: 32-48 hours

**Prerequisites**:
- Graph viewing working perfectly ✅ (from Sprints 1-3)
- Navigation solid ✅ (from Sprint 4)
- Design workshop completed (UX questions answered)
- Decision on selection/highlighting approach

**See**: `authoring-unification/11-graph-planning-stub.md` for UX questions

**Why P4**: Complex, requires design session first

---

### Video Scene (Far Future)
**Status**: 📋 Deferred  
**Target**: TBD (2026+)  
**Effort**: 80-120 hours (full implementation)

**Complexity Drivers**:
- Timeline editor implementation
- Clip sequencing and trimming
- Playback synchronization
- Captioning system
- Video transcoding infrastructure
- CDN integration

**See**: `authoring-unification/12-video-deferred-stub.md` for details

**Why P4**: Very complex, low priority, defer until demand validated

---

### Admin-Portal Unification
**Status**: 📋 Future Consideration  
**Target**: TBD (2026)  
**Effort**: 40-60 hours

**Concept**: Single portal with permission-based admin features

**Tasks** (if pursued):
- Merge authentication systems
- Role-based access control
- Dynamic admin component loading
- Permission-based UI rendering
- Admin component migration

**Why P4**: Nice-to-have, not critical for core goals

---

### Advanced Features (Wishlist)

**Performance Optimizations**:
- [ ] Virtual scrolling for large ToC trees
- [ ] Web workers for graph layout
- [ ] Progressive loading for huge graphs
- [ ] Improved caching strategies

**Enhanced Feedback**:
- [ ] Real-time collaboration on comments
- [ ] @mentions in feedback
- [ ] Rich text in comments
- [ ] Notification system

**Graph Enhancements**:
- [ ] Force-directed layout algorithms
- [ ] Layout presets and templates
- [ ] Graph search and filtering
- [ ] Subgraph comparison views

**Navigation**:
- [ ] Saved navigation paths
- [ ] Guided tours through content
- [ ] Content recommendations
- [ ] Related content suggestions

---

## Backlog Maintenance

### Review Cycle
- **Weekly**: Update sprint progress
- **Bi-weekly**: Reprioritize P1-P2 items
- **Monthly**: Review P3-P4, add new items

### Promotion Criteria
- **P3 → P2**: When becomes blocker for P2 work
- **P2 → P1**: When critical for core experience
- **P1 → P0**: When becomes immediate blocker

### Demotion Criteria
- **Lower Priority**: When dependencies not met
- **Future**: When effort exceeds value
- **Archive**: When no longer relevant

---

## Quick Reference

**Current Focus**: Sprint 1 (Graph Studio Extraction)  
**Next Up**: Sprint 2 (Portal Graph Viewer)  
**Critical Path**: P0 (Sprints 1-3)  
**Total Estimated Effort**: 140-200 hours through Sprint 5

**Target Completion**: Early December 2025 (through Sprint 5)

---

**Last Updated**: October 19, 2025  
**Next Review**: October 26, 2025 (Sprint 1 complete)

