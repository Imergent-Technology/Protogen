# Strategic Decisions Log

**Purpose**: Record key strategic decisions, rationale, and alternatives considered.  
**Format**: Chronological, with most recent first.

---

## Decision 001: Graph-First Priority

**Date**: October 19, 2025  
**Status**: ✅ Active  
**Decision Maker**: Product Team

### The Decision

Prioritize Graph Studio extraction and integration (Sprints 1-3) before completing Card or Document authoring.

### Rationale

**Graph is the Foundation**:
1. **Linking**: Cards and documents need to link to graph nodes
2. **Navigation**: Scene relationships organized via graph structure
3. **Context**: Everything anchors to graph for meaning
4. **Exploration**: User's primary goal requires working graph UI

**Current State Problem**:
- Graph Studio exists but isolated in admin
- Users in portal can't explore graph
- Authoring without navigation creates disconnected content
- Original M1→M2→M3 sequence put graph LAST (backwards)

### Alternative Considered

**Continue Authoring-Unification M1→M2→M3 Sequence**:
- M1: Complete Card authoring (6-8 weeks)
- M2: Document authoring (4-6 weeks)
- M3: Graph authoring (4-6 weeks)

**Why Not Chosen**:
- Creates 10-14 weeks of authoring work before graph available
- Users create content with no way to organize or link it
- Doesn't address primary goal (exploration)
- Leaves foundation for last

### Impact

**Short Term**:
- Card authoring paused (document bugs, revisit Sprint 6+)
- Document authoring deferred (Sprint 8+)
- Graph work accelerated (Sprints 1-3)

**Long Term**:
- Solid foundation enables better authoring later
- Content can properly link when authoring resumes
- Users can explore immediately

### Success Metrics

- Sprint 3 complete: Users can explore graphs interactively
- Sprint 4 complete: Navigation flows work end-to-end
- Sprint 5 complete: Users engage meaningfully with content

---

## Decision 002: Strategic Pause on Card Authoring

**Date**: October 19, 2025  
**Status**: ✅ Active  
**Decision Maker**: Product Team

### The Decision

Place Card scene authoring on strategic pause rather than complete M1 debugging.

### Rationale

**Current State**:
- Card authoring partially implemented
- Has bugs preventing smooth use
- Could spend 2-3 weeks debugging
- But graph foundation more critical

**Strategic Value**:
- Card authoring less valuable without graph to link to
- Debugging now delays critical graph work
- Can fix bugs later with better context

**Clean Pause Approach**:
1. Document all known bugs (create issues)
2. Mark feature as "experimental" in UI
3. Add warning banner about early development
4. Create GitHub issues with full bug list
5. Note: "Blocked by graph foundation"
6. Revisit in Sprint 6+ after graph solid

### Alternative Considered

**Complete M1 Card Authoring Now**:
- Spend 2-3 weeks debugging Card authoring
- Get to "done" state for M1
- Then move to graph work

**Why Not Chosen**:
- Delays graph work by 2-3 weeks
- Still creates content that can't properly link
- Doesn't address primary user goals
- M1 "completion" less valuable without navigation

### Impact

**Short Term**:
- Card authoring marked experimental
- Known bugs documented but not fixed
- Development focus shifts to graph

**Long Term**:
- Return to Card authoring with:
  - Working graph foundation
  - Node linking capability
  - Better understanding of content context
  - Clearer value proposition

### Success Metrics

- Bugs documented in GitHub issues ✅
- Experimental banner added to UI ✅
- No ongoing maintenance burden ✅
- Clear path to resume later ✅

---

## Decision 003: Defer Authoring-Unification M2-M3

**Date**: October 19, 2025  
**Status**: ✅ Active  
**Decision Maker**: Product Team

### The Decision

Defer Document (M2) and Graph (M3) authoring from Authoring-Unification plan until after graph foundation complete.

### Rationale

**M2 (Document Authoring)**:
- Planned for 4-6 weeks implementation
- Requires TipTap integration, anchor system, linking
- Documents need to link to graph nodes
- More valuable with navigation working

**M3 (Graph Authoring)**:
- Planned for 4-6 weeks implementation
- Requires design workshop first
- Should come AFTER graph viewing works perfectly
- Users need to explore before they author

**Specs Are Excellent**:
- All 18 Authoring-Unification specs well done
- Technical details solid
- Just prioritization was backwards

### Alternative Considered

**Follow Original M1→M2→M3 Sequence**:
- Complete Card authoring (M1)
- Document authoring (M2)
- Graph authoring (M3)
- 14-20 weeks total

**Why Not Chosen**:
- Puts graph last (should be first)
- Creates disconnected content
- Doesn't build on foundation
- Wrong order for user value

### New Sequence

**Graph-First Order**:
1. Graph Viewing (Sprints 1-3) - 3 weeks
2. Navigation Layer (Sprint 4) - 2 weeks
3. User Feedback (Sprint 5) - 2 weeks
4. Card Authoring Polish (Sprint 6-7) - 3 weeks
5. Document Authoring (Sprint 8-9) - 6 weeks
6. Graph Authoring (Sprint 10+) - 6 weeks (after design workshop)

### Impact

**Short Term**:
- Document authoring deferred to Sprint 8+ (January 2026)
- Graph authoring deferred to Sprint 10+ (February 2026+)
- Focus on foundation first

**Long Term**:
- Better authoring experience when it comes
- Content created in proper context
- Users can organize before creating

### Success Metrics

- Sprint 5 complete before any M2 work ✅
- Design workshop for graph authoring complete before M3 ✅
- All authoring builds on solid foundation ✅

---

## Decision 004: Focus on Exploration Before Creation

**Date**: October 19, 2025  
**Status**: ✅ Active  
**Decision Maker**: Product Team

### The Decision

Prioritize user exploration, navigation, and feedback capabilities before content creation (authoring) features.

### Rationale

**User Goals Stated**:
1. Exploration - "highly interactive experiences, zoom in on nodes, orchestrate dialogs"
2. Cohesion - "coherent navigation system, intra and inter-scene navigation"
3. Feedback - "context-sensitive feedback, community engagement"

**None of these are authoring**. All require:
- Working graph UI (for exploration)
- Navigation flows (for cohesion)
- Feedback anchors (for engagement)

**Value Priority**:
- Exploration provides immediate value (users can do things)
- Cohesion makes platform usable (users don't get lost)
- Feedback drives engagement (users participate)
- Authoring enables creation (users contribute content)

### Alternative Considered

**Authoring-First Approach**:
- Build content creation tools first
- Hope users create valuable content
- Then add navigation and exploration

**Why Not Chosen**:
- Doesn't align with stated user goals
- Content without navigation = confusing
- Creation without exploration = unclear context
- Backwards value delivery

### Impact

**Sprint Sequencing**:
- Sprints 1-3: Exploration (graph viewing, interaction)
- Sprint 4: Cohesion (navigation flows)
- Sprint 5: Feedback (engagement)
- Sprints 6+: Creation (authoring)

**User Experience**:
- Users can explore immediately (Sprint 3)
- Users never get lost (Sprint 4)
- Users can engage (Sprint 5)
- Users can create (Sprint 6+)

### Success Metrics

- By Sprint 3: Interactive exploration working
- By Sprint 4: Navigation never confusing
- By Sprint 5: Users engaging with feedback
- Sprint 6+: Authoring makes sense in context

---

## Decision Template (For Future Decisions)

### Decision XXX: [Title]

**Date**: YYYY-MM-DD  
**Status**: Active / Superseded / Archived  
**Decision Maker**: Team / Individual

### The Decision

[Clear statement of what was decided]

### Rationale

[Why this decision was made, context, analysis]

### Alternative Considered

[What else was considered, why not chosen]

### Impact

[Short-term and long-term effects]

### Success Metrics

[How to measure if this was the right call]

---

**Total Decisions**: 4  
**Active**: 4  
**Superseded**: 0  
**Last Updated**: October 19, 2025

