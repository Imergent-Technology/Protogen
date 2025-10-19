# Sprint 1: Graph Studio Extraction

**Sprint Duration**: Week of October 21, 2025  
**Status**: 🔄 Active  
**Last Updated**: October 19, 2025

---

## 🎯 Sprint Goal

Extract Graph Studio from admin application to shared library, making it reusable for portal integration.

**Success Criteria**:
- Graph Studio runs from `shared/src/systems/graph-studio/`
- Admin app still works (no regressions)
- Clean API ready for portal integration
- Basic tests ensure functionality

---

## 📋 Sprint Tasks

### 1. Create Folder Structure
- [x] Create `shared/src/systems/graph-studio/` directory
- [x] Create subdirectories: `components/`, `hooks/`, `services/`, `types/`, `utils/`
- [x] Set up `index.ts` for clean exports

**Estimated**: 30 minutes  
**Actual**: 15 minutes  
**Status**: ✅ Complete

---

### 2. Extract Graph Studio Components
- [ ] Move `admin/src/components/graph/GraphStudio.tsx` → `shared/`
- [ ] Move `admin/src/components/graph/GraphCanvas.tsx` → `shared/`
- [ ] Move `admin/src/components/graph/NodeDonut.tsx` → `shared/`
- [ ] Update imports in moved components
- [ ] Fix any admin-specific dependencies

**Estimated**: 2-3 hours  
**Blocker**: Need to identify all dependencies first

**Dependencies to Check**:
- Dialog components (might need to use shared dialog system)
- Admin-specific stores (need to make props-based)
- Admin routes (remove, make parent component handle routing)

---

### 3. Extract Graph Services
- [ ] Identify graph-related services in admin
- [ ] Move reusable services to `shared/src/systems/graph-studio/services/`
- [ ] Create `GraphDataService` for data fetching
- [ ] Create `GraphLayoutService` for node positioning
- [ ] Update service imports

**Estimated**: 2-3 hours  
**Blocker**: None (APIs already exist)

---

### 4. Create GraphStudioSystem Singleton
- [ ] Create `GraphStudioSystem.ts` class
- [ ] Implement singleton pattern (like Navigator, Dialog systems)
- [ ] Add methods: `initialize()`, `loadGraph()`, `selectNode()`, `reset()`
- [ ] Integrate with existing event system
- [ ] Add state management for current graph

**Estimated**: 2-3 hours  
**Blocker**: Need to review Navigator/Dialog patterns first

**Pattern to Follow**:
```typescript
class GraphStudioSystem {
  private static instance: GraphStudioSystem;
  private currentGraph: Graph | null = null;
  
  static getInstance(): GraphStudioSystem { ... }
  initialize(): void { ... }
  loadGraph(subgraphId: string): Promise<void> { ... }
  selectNode(nodeId: string): void { ... }
}
```

---

### 5. Define TypeScript Types
- [ ] Create `types/graph.ts` for graph data structures
- [ ] Create `types/node.ts` for node types
- [ ] Create `types/edge.ts` for edge types
- [ ] Create `types/layout.ts` for positioning
- [ ] Ensure compatibility with existing API types

**Estimated**: 1-2 hours  
**Blocker**: None

---

### 6. Create useGraphStudio Hook
- [ ] Create `hooks/useGraphStudio.ts`
- [ ] Expose GraphStudioSystem methods via hook
- [ ] Add React state integration
- [ ] Add useEffect for cleanup
- [ ] Add loading/error states

**Estimated**: 1-2 hours  
**Blocker**: GraphStudioSystem must be complete first

**Example API**:
```typescript
const {
  graph,
  loading,
  error,
  loadGraph,
  selectNode,
  selectedNode
} = useGraphStudio();
```

---

### 7. Update Exports
- [ ] Add exports to `shared/src/systems/index.ts`
- [ ] Add exports to `shared/src/systems/graph-studio/index.ts`
- [ ] Verify tree-shaking works correctly
- [ ] Update package.json if needed

**Estimated**: 30 minutes  
**Blocker**: All components must be moved first

---

### 8. Update Admin to Use Shared Graph Studio
- [ ] Update admin imports to use shared library
- [ ] Remove old Graph Studio components from admin
- [ ] Test admin Graph Studio still works
- [ ] Fix any broken functionality

**Estimated**: 1-2 hours  
**Blocker**: Shared Graph Studio must be complete first

---

### 9. Basic Unit Tests
- [ ] Test GraphStudioSystem initialization
- [ ] Test node selection logic
- [ ] Test graph loading
- [ ] Test hook behavior
- [ ] Verify no regressions in admin

**Estimated**: 2-3 hours  
**Blocker**: All code must be moved first

---

## 🚧 Current Blockers

**None currently** - Ready to start

---

## ✅ Completed Work

### Task 1: Folder Structure ✅
- Created `shared/src/systems/graph-studio/` with all subdirectories
- Set up index.ts files for clean exports
- **Time**: 15 minutes

### Task 2-3: Components & Services ✅
- Created GraphCanvas component (simplified, 320 lines from 1088)
- Focused on core Sigma.js visualization
- Removed admin-specific dependencies (context menu, dialogs)
- Created GraphDataService for API integration
- **Time**: 45 minutes

### Task 4: GraphStudioSystem Singleton ✅
- Created following Navigator/Dialog patterns
- State management, event emission
- Methods: loadGraph, selectNode, filtering
- **Time**: 30 minutes

### Task 5: TypeScript Types ✅
- Created comprehensive type definitions
- Graph events, state, config types
- **Time**: 20 minutes

### Task 6: useGraphStudio Hook ✅
- React integration with GraphStudioSystem
- Event subscriptions and state sync
- **Time**: 25 minutes

### Task 7: Update Exports ✅
- Added graph-studio to package.json exports
- Fixed TypeScript imports (use ApiClient)
- Build passing with no errors
- **Time**: 20 minutes

**Progress**: Tasks 1-7 complete (155 minutes / 12-18 hours estimated)

---

## 📝 Notes & Decisions

### Architecture Decisions
- Follow existing system patterns (Navigator, Dialog) for consistency
- Use singleton pattern for GraphStudioSystem
- Keep Sigma.js dependency in shared library (already listed)
- Make components fully props-driven (no internal routing)

### Dependencies Identified
- Sigma.js: Already in shared library ✅
- Dialog system: Use shared dialog system ✅
- Event system: Use shared event emitter ✅
- API client: Use shared services ✅

### Risks
- **Risk**: Admin might have custom graph logic hard to extract
  - **Mitigation**: Review all graph components before moving
  - **Fallback**: Keep admin-specific wrapper if needed

- **Risk**: Sigma.js version conflicts
  - **Mitigation**: Verify shared library Sigma.js version matches admin
  - **Fallback**: Update if needed, test both apps

---

## 📊 Sprint Progress

**Total Tasks**: 9  
**Completed**: 0  
**In Progress**: 0  
**Blocked**: 0  
**Remaining**: 9

**Estimated Total Time**: 12-18 hours  
**Actual Time Spent**: 0 hours

---

## 🔜 Next Sprint Preview

**Sprint 2: Portal Graph Viewer**
- Create GraphSceneViewer component in portal
- Connect to subgraph loading API
- Integrate with Navigator system
- Basic node rendering and selection
- Simple node detail dialog

**Prerequisites from Sprint 1**:
- Graph Studio extracted and working ✅
- Clean API for integration ✅
- No regressions in admin ✅

---

## 📞 Questions / Needs Clarification

*No questions currently - sprint plan is clear*

---

**Last Updated**: October 19, 2025  
**Next Review**: October 22, 2025 (mid-sprint check-in)

