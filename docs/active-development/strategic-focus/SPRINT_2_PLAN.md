# Sprint 2: Portal Graph Viewer

**Sprint Duration**: Week of October 21-28, 2025  
**Status**: 🔄 Active  
**Started**: October 19, 2025

---

## 🎯 Sprint Goal

Integrate Graph Studio into portal application, enabling users to view and explore graph scenes.

**Success Criteria**:
- Graph scenes render in portal
- Users can click nodes and see basic info
- Navigation integration working
- No critical bugs

---

## 📋 Sprint Tasks

### 1. Create GraphSceneViewer Feature Folder
- [ ] Create `portal/src/features/graph-viewer/` directory
- [ ] Create subdirectories: `components/`, `hooks/`, `types/`
- [ ] Set up feature structure

**Estimated**: 15 minutes  
**Blocker**: None

---

### 2. Create GraphSceneViewer Component
- [ ] Create `GraphSceneViewer.tsx` component
- [ ] Import GraphStudio from shared library
- [ ] Add loading state management
- [ ] Add error handling
- [ ] Connect to Navigator for scene context

**Estimated**: 1-2 hours  
**Blocker**: None (shared library ready)

---

### 3. Connect to Subgraph Loading API
- [ ] Create useGraphScene hook
- [ ] Load subgraph data based on scene ID
- [ ] Pass data to GraphStudio component
- [ ] Handle loading and error states
- [ ] Cache loaded graphs

**Estimated**: 2-3 hours  
**Blocker**: API endpoints must exist

---

### 4. Integrate with Navigator System
- [ ] Register graph scene type in SceneRouter
- [ ] Add GraphSceneViewer to scene type mapping
- [ ] Test navigation to graph scenes
- [ ] URL parameter support (e.g., `/scene/:id?node=:nodeGuid`)

**Estimated**: 2-3 hours  
**Blocker**: Navigator APIs must be understood

---

### 5. Node Selection & Detail Dialog
- [ ] Create NodeDetailDialog component
- [ ] Show node info on selection (label, type, description)
- [ ] Display connected nodes list
- [ ] "Explore related" navigation
- [ ] Use shared Dialog system

**Estimated**: 2-3 hours  
**Blocker**: Dialog system integration

---

### 6. Basic Styling and Layout
- [ ] Style GraphSceneViewer container
- [ ] Add toolbar/controls if needed
- [ ] Responsive layout
- [ ] Dark mode support via theme system
- [ ] Polish visual appearance

**Estimated**: 1-2 hours  
**Blocker**: None

---

### 7. Test Graph Viewing Flow
- [ ] Create test graph scene in database
- [ ] Test navigation to graph scene
- [ ] Test node selection
- [ ] Test detail dialog
- [ ] Verify no console errors

**Estimated**: 1-2 hours  
**Blocker**: Test data must exist

---

## 🚧 Current Blockers

**None currently** - Ready to start

**Potential Blockers**:
- Graph scene type may not exist in database (need to verify)
- Subgraph loading API may have issues (need to test)
- Navigator graph scene registration may need updates

---

## ✅ Completed Work

*Sprint just starting - no completed tasks yet*

---

## 📝 Notes & Decisions

### Architecture Approach

**Feature-Based Structure**:
- Create dedicated `features/graph-viewer/` folder in portal
- Keep graph viewing separate from other portal features
- Makes it easy to find and maintain

**Integration Points**:
- Navigator: For scene routing
- Dialog: For node details
- GraphStudio (shared): For visualization
- API: For data loading

### API Verification Needed

Before starting, verify these APIs work:
- `apiClient.getSubgraph(id)` - Load subgraph data
- Scene API returns `scene_type: 'graph'` and `subgraph_id`
- Subgraph includes nodes array

### Test Data Plan

Need to create or verify exists:
- At least one Scene with `scene_type: 'graph'`
- At least one Subgraph with nodes
- Connection between Scene and Subgraph

---

## 📊 Sprint Progress

**Total Tasks**: 7  
**Completed**: 0  
**In Progress**: 0  
**Blocked**: 0  
**Remaining**: 7

**Estimated Total Time**: 10-16 hours  
**Actual Time Spent**: 0 hours

---

## 🔜 Next Sprint Preview

**Sprint 3: Interactive Graph Features**
- Zoom animation on node click
- Enhanced node detail dialog
- "Explore related" functionality
- Keyboard navigation
- Pan/zoom controls
- Mini-map (stretch goal)

**Prerequisites from Sprint 2**:
- Graph scenes viewable in portal ✅
- Node selection working ✅
- Basic navigation integrated ✅

---

**Sprint Status**: Ready to begin  
**Next Task**: Task 1 - Create feature folder structure

