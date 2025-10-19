# Strategic Focus: Graph-First Development

**Status**: Active  
**Created**: October 19, 2025  
**Last Updated**: October 19, 2025

---

## 🎯 Vision

Build an **interactive exploration platform** where users can:
- **Explore** knowledge graphs with zoom, focus, and dialog orchestration
- **Navigate** cohesively through decks → scenes → nodes with clear context
- **Engage** through context-sensitive feedback, comments, and bookmarks

**Core Principle**: Graph is the foundation. Everything else builds on it.

---

## 🔄 Strategic Reorder: Why Graph-First?

### The Problem with Authoring-First

The original Authoring-Unification plan (M1→M2→M3) was:
- M1: Card Scene Authoring (6-8 weeks)
- M2: Document Scene Authoring (4-6 weeks)
- M3: Graph Scene Authoring (4-6 weeks)

**Issue**: Graph came LAST, but it's the FOUNDATION for:
- Linking between content (cards need to link to graph nodes)
- Navigation flows (scenes are organized via graph relationships)
- Context (everything anchors to graph structure)
- Exploration (your stated #1 goal requires working graph)

### The Solution: Graph-First

**New Priority Order**:
1. **Graph Viewing & Exploration** (3 weeks) - Foundation
2. **Navigation & Cohesion** (2-3 weeks) - Build on foundation
3. **User Feedback** (2 weeks) - Engagement layer
4. **Card Authoring Polish** (2-3 weeks) - Now makes sense in context
5. **Document Authoring** (4-6 weeks) - Future milestone

**Rationale**: Build the steering wheel before adding more passengers.

---

## 📅 Sprint Plan Overview

### Sprint 1: Graph Studio Extraction (Week 1)
**Goal**: Move Graph Studio from admin to shared library  
**Deliverable**: Reusable Graph Studio system  
**Status**: 🔄 Active (see CURRENT_SPRINT.md)

### Sprint 2: Portal Graph Viewer (Week 2)
**Goal**: Integrate Graph Studio into portal  
**Deliverable**: Graph scenes viewable in portal  
**Status**: ⏳ Pending

### Sprint 3: Interactive Features (Week 3)
**Goal**: Zoom, focus, dialog orchestration  
**Deliverable**: Rich interactive graph exploration  
**Status**: ⏳ Pending

### Sprint 4: Navigation Layer (Weeks 4-5)
**Goal**: Cohesive deck→scene→node flows  
**Deliverable**: Seamless navigation across hierarchy  
**Status**: ⏳ Pending

### Sprint 5: User Feedback (Weeks 6-7)
**Goal**: Context-sensitive comments and bookmarks  
**Deliverable**: Users can engage meaningfully  
**Status**: ⏳ Pending

### Sprint 6+: Future Work
**Goal**: Card authoring polish, document authoring  
**Status**: ⏳ Backlog (see BACKLOG.md)

---

## 🚫 Work Being Parked

### Card Scene Authoring
- **Status**: Partially implemented, has bugs
- **Action**: Strategic pause, document bugs, mark as experimental
- **Revisit**: Sprint 6+ after graph foundation solid
- **Rationale**: Cards need to link to graph nodes; foundation needed first

### Authoring-Unification Specs (M2-M3)
- **Status**: 18 excellent specs completed
- **Action**: Reference as needed, don't follow M1→M2→M3 sequence
- **Revisit**: Document authoring in Sprint 8+
- **Rationale**: Specs are great, but prioritization was backwards

### Other Deferred Work
- Document scene authoring
- Video scene planning
- Advanced authoring features
- See BACKLOG.md for full list

---

## ✅ Success Metrics

### Sprint 1 Success
- ✅ Graph Studio runs from shared library
- ✅ Admin still works (no regression)
- ✅ Clean API for portal integration

### Sprint 2 Success
- ✅ Graph scenes render in portal
- ✅ Can click nodes and see basic info
- ✅ No critical bugs

### Sprint 3 Success
- ✅ Zoom/focus animations smooth (< 300ms)
- ✅ Dialog orchestration working
- ✅ Can explore related nodes easily

### Sprint 4 Success
- ✅ Complete navigation: deck → scene → node
- ✅ Users never feel lost (breadcrumbs work)
- ✅ URL sharing works

### Sprint 5 Success
- ✅ Users can comment on any node
- ✅ Bookmarking functional
- ✅ Feedback visible in context

---

## 📖 Key Strategic Decisions

See [DECISIONS.md](./DECISIONS.md) for full details.

**TL;DR**:
1. **Graph-First Priority** - Graph is foundation, build it first
2. **Strategic Pause on Card Authoring** - Document bugs, revisit later
3. **Defer M2-M3** - Document/Video authoring wait until graph solid

---

## 🔗 Reference Documentation

### Use When Needed
- [`authoring-unification/11-graph-planning-stub.md`](../authoring-unification/11-graph-planning-stub.md) - Graph authoring UX questions
- [`authoring-unification/03-navigator-enhancements.md`](../authoring-unification/03-navigator-enhancements.md) - Navigator zoom/focus APIs
- [`DEVELOPMENT_ROADMAP.md`](../DEVELOPMENT_ROADMAP.md) - Overall project phases
- [`core-foundation.md`](../../core-foundation.md) - Architecture principles

### Ignore For Now
- `authoring-unification/09-card-scene-type.md` - Card authoring (deferred)
- `authoring-unification/10-document-scene-type.md` - Document authoring (deferred)
- `authoring-unification/18-roadmap-milestones.md` - M1→M2→M3 sequence (superseded)

See [INTEGRATION_NOTES.md](./INTEGRATION_NOTES.md) for detailed relationships.

---

## 📅 Timeline

- **Sprint 1**: Week of Oct 21, 2025 (Graph Studio extraction)
- **Sprint 2**: Week of Oct 28, 2025 (Portal integration)
- **Sprint 3**: Week of Nov 4, 2025 (Interactive features)
- **Sprint 4**: Weeks of Nov 11 & 18, 2025 (Navigation layer)
- **Sprint 5**: Weeks of Nov 25 & Dec 2, 2025 (User feedback)
- **Sprint 6+**: TBD (Card polish, document authoring)

**Target**: Functional interactive exploration by early December 2025

---

## 🧭 How to Use This Folder

### For Development Sessions
1. Start here (README.md) - understand the strategy
2. Check [CURRENT_SPRINT.md](./CURRENT_SPRINT.md) - what's active now
3. Reference [BACKLOG.md](./BACKLOG.md) - what's coming next
4. Update [DECISIONS.md](./DECISIONS.md) - record strategic choices

### For AI Agents
**Orient Command**: "Reference `/docs/active-development/strategic-focus/` for current priorities"

This folder provides:
- Clear prioritization (what to work on)
- Context for decisions (why this order)
- Active sprint details (current tasks)
- Backlog visibility (what's next)

### For Stakeholders
This folder answers:
- What are we building? (Graph-first exploration)
- Why this order? (Graph is foundation)
- When will X be done? (See timeline)
- What about Y feature? (See backlog)

---

## 🚀 Next Steps

1. **Review Sprint 1 Tasks**: See [CURRENT_SPRINT.md](./CURRENT_SPRINT.md)
2. **Check Backlog**: See [BACKLOG.md](./BACKLOG.md)
3. **Understand Decisions**: See [DECISIONS.md](./DECISIONS.md)
4. **Begin Extraction**: Start with Graph Studio component analysis

---

**This is your North Star. When in doubt, come back here.**

