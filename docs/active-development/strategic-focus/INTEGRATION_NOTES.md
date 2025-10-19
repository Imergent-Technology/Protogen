# Integration Notes

**Purpose**: Bridge strategic-focus to other Protogen documentation.  
**Last Updated**: October 19, 2025

---

## 🎯 Quick Orientation

**This folder (`strategic-focus/`) is your current North Star.**

When documentation conflicts, `strategic-focus/` takes precedence for:
- Current sprint priorities
- Work sequencing
- Strategic decisions
- Active backlog

Other docs provide:
- Technical specifications (how to build)
- Architecture principles (what patterns to follow)
- Historical context (why things are the way they are)

---

## 📁 Relationship to Other Documentation

### Authoring-Unification Specs (`/authoring-unification/`)

**Status**: 18 excellent specifications, superseded prioritization  
**Location**: `docs/active-development/authoring-unification/`

#### What to Use

**Technical Specifications** (when implementing):
- [`03-navigator-enhancements.md`](../authoring-unification/03-navigator-enhancements.md) - Navigator APIs for zoom/focus
- [`11-graph-planning-stub.md`](../authoring-unification/11-graph-planning-stub.md) - Graph UX questions for design workshop
- [`02-event-taxonomy.md`](../authoring-unification/02-event-taxonomy.md) - Event contracts
- [`04-authoring-overlay.md`](../authoring-unification/04-authoring-overlay.md) - Authoring system architecture
- [`06-highlighting-strategies.md`](../authoring-unification/06-highlighting-strategies.md) - Selection/highlighting patterns

**When to Reference**:
- Sprint 3: Navigator enhancements for zoom/focus
- Sprint 6+: Card authoring implementation details
- Sprint 8+: Document authoring specs
- Future: Graph authoring after design workshop

#### What to Ignore (For Now)

**Superseded Sequencing**:
- [`18-roadmap-milestones.md`](../authoring-unification/18-roadmap-milestones.md) - M1→M2→M3 sequence (we're doing graph-first)
- [`README.md`](../authoring-unification/README.md) - Says M1 (Card) comes first (we're doing graph first)
- [`CHANGELOG.md`](../authoring-unification/CHANGELOG.md) - Historical, planning phase context

**Deferred Implementations**:
- [`09-card-scene-type.md`](../authoring-unification/09-card-scene-type.md) - Card details (deferred to Sprint 6+)
- [`10-document-scene-type.md`](../authoring-unification/10-document-scene-type.md) - Document details (deferred to Sprint 8+)
- [`12-video-deferred-stub.md`](../authoring-unification/12-video-deferred-stub.md) - Video planning (P4, far future)

#### Key Clarification

**The specs are excellent** - well-researched, comprehensive, technically sound.  
**The prioritization was wrong** - Card→Document→Graph sequence was backwards.  
**We're using the specs** - just in different order: Graph→Card→Document.

---

### Development Roadmap (`/DEVELOPMENT_ROADMAP.md`)

**Status**: Overall project phases, needs update  
**Location**: `docs/active-development/DEVELOPMENT_ROADMAP.md`

#### Relationship

**Development Roadmap covers**:
- Phase 0-7: Historical project phases
- Overall vision and long-term direction
- Multiple parallel workstreams
- Broader project context

**Strategic-Focus covers**:
- Sprints 1-5: Immediate tactical execution
- Single focused workstream (graph-first)
- Specific deliverables and timelines
- Current priorities only

#### Coordination

**Strategic-Focus fits into Development Roadmap as**:
- Phase 5.1: Scene Viewing & Navigation Restructuring
- Phase 5.2: Context-Specific User Engagement
- Prioritized subset of larger roadmap

**After Sprint 5**:
- Update Development Roadmap with Sprint 6+ plans
- Integrate completed sprints into historical record
- Align future phases with sprint outcomes

---

### M1 Completion Summary (`/M1_COMPLETION_SUMMARY.md`)

**Status**: Historical completion report (October 15, 2025)  
**Location**: `docs/active-development/M1_COMPLETION_SUMMARY.md`

#### Relationship

**M1 Summary documents**:
- Authoring-Unification M1 implementation
- Navigator enhancements, authoring overlay, preview service
- Card scene type, ToC drawer, carousel
- 153 tests, 8,200 lines of code

**Important Context**:
- M1 was "completed" in planning/specification
- Some implementation exists but has bugs
- This is why Card authoring on strategic pause

**Current Status**:
- Code exists in shared library (authoring system)
- Needs integration and debugging (Sprint 6+)
- Foundation work (Navigator, etc.) is valuable
- Card-specific parts need graph foundation first

---

### Core Foundation (`/core-foundation.md`)

**Status**: Architecture principles, always relevant  
**Location**: `docs/core-foundation.md`

#### When to Reference

**Always follow** for:
- System architecture patterns (singleton, event-driven)
- Data model principles (graph, scenes, decks)
- Multi-tenant considerations
- Performance guidelines
- Invariants and constraints

**Use when**:
- Designing new systems (Sprint 1: GraphStudioSystem)
- Making architectural decisions
- Ensuring consistency with existing patterns
- Understanding data relationships

#### Key Sections for Sprints 1-5

**Sprint 1-3** (Graph):
- Section on Central Graph System
- Subgraph architecture
- Scene items and spatial positioning

**Sprint 4** (Navigation):
- Scene-First Routing section
- Navigator System architecture
- Context system principles

**Sprint 5** (Feedback):
- Feedback System section
- Multi-tenant considerations
- Standing-based permissions (future)

---

### Implementation Status (`/IMPLEMENTATION_STATUS.md`)

**Status**: Historical status (October 11, 2025)  
**Location**: `docs/active-development/IMPLEMENTATION_STATUS.md`

#### What's Relevant

**Completed Foundation Work**:
- Graph System Foundation (80% complete)
- Fluent Graph Query API ✅
- Dual Execution Strategies ✅
- Caching Layer ✅
- UUID v7 Implementation ✅

**This enables Sprint 1-3**:
- Graph backend APIs working
- Subgraph system operational
- Query capabilities available
- Just need UI extraction/integration

#### What's Not Relevant

**Phase 2-3 items**: UUID migration, permissions - not blocking Sprints 1-5

---

### Consolidated TODO Plan (`/CONSOLIDATED_TODO_PLAN.md`)

**Status**: Historical consolidated todos  
**Location**: `docs/CONSOLIDATED_TODO_PLAN.md`

#### Relationship

**Old TODOs** (from various phases):
- TypeScript error resolution
- Testing foundation
- Admin Menu Builder (deferred)
- Permission system (future)

**Strategic-Focus supersedes** for:
- Work prioritization
- Sprint sequencing
- Active backlog

**Consolidated TODO useful for**:
- Technical debt awareness
- Long-term issues tracking
- Context on past decisions

#### Action

Consider archiving or updating CONSOLIDATED_TODO_PLAN after Sprint 5 to reflect new strategic direction.

---

## 📊 Documentation Hierarchy

### Current Authority (Highest to Lowest)

1. **`strategic-focus/`** - Current sprint priorities and active backlog
2. **`core-foundation.md`** - Architecture principles (always follow)
3. **`authoring-unification/` specs** - Technical implementation details (use as needed)
4. **`DEVELOPMENT_ROADMAP.md`** - Overall project vision (broader context)
5. **Historical completion summaries** - Context only, not active priorities

### When in Conflict

**Strategic-Focus wins for**:
- What to work on now
- Sprint sequencing
- Priority decisions

**Core-Foundation wins for**:
- How to architect solutions
- Pattern consistency
- System design principles

**Authoring-Unification wins for**:
- Implementation details when building features
- Technical specifications

---

## 🔄 Update Strategy

### This Folder (`strategic-focus/`)

**Update Frequently**:
- CURRENT_SPRINT.md: Daily/weekly during active sprint
- BACKLOG.md: Weekly, after sprint reviews
- DECISIONS.md: When making strategic decisions
- README.md: When sprint plan changes

### Other Documentation

**Update After Major Milestones**:
- DEVELOPMENT_ROADMAP.md: After Sprint 5 (update with graph-first approach)
- core-foundation.md: When architecture patterns emerge
- authoring-unification/: Reference only, don't update (historical planning)

### Archive Strategy

**After Sprint 5 Complete**:
- Create `strategic-focus/archive/` folder
- Move completed sprint docs
- Summarize Sprints 1-5 outcomes
- Plan Sprints 6+ based on learnings

---

## 🧭 Navigation Guide for AI Agents

### Starting a Development Session

**Step 1**: Read `strategic-focus/README.md` (North Star)  
**Step 2**: Check `strategic-focus/CURRENT_SPRINT.md` (Active work)  
**Step 3**: Reference other docs as needed for implementation details

### During Implementation

**For Architecture Questions**: → `core-foundation.md`  
**For Implementation Details**: → `authoring-unification/` specs  
**For API Questions**: → Existing API documentation  
**For Patterns**: → Existing code in shared library

### Making Decisions

**Record in**: `strategic-focus/DECISIONS.md`  
**Cross-reference**: Related architectural docs  
**Update**: CURRENT_SPRINT.md or BACKLOG.md as needed

---

## 📞 Quick Reference

**Current Priority**: Graph-first development (Sprints 1-5)  
**Active Sprint**: Sprint 1 (Graph Studio Extraction)  
**Primary Docs**: `strategic-focus/` folder  
**Technical Reference**: `authoring-unification/` specs (selective)  
**Architecture Guide**: `core-foundation.md`

---

## ⚠️ Important Notes

### For Future Sessions

When starting a new development session, **always begin with**:
```
"Reference /docs/active-development/strategic-focus/ for current priorities"
```

This ensures:
- Current sprint is clear
- Strategic decisions are understood
- Backlog priorities are known
- No confusion about what to work on

### For Stakeholders

**One Folder to Rule Them All**: `strategic-focus/` answers:
- What are we working on? (CURRENT_SPRINT.md)
- What's coming next? (BACKLOG.md)
- Why this order? (README.md, DECISIONS.md)
- How does this fit? (INTEGRATION_NOTES.md - this file)

---

**Last Updated**: October 19, 2025  
**Next Review**: After Sprint 1 completion (update with learnings)

