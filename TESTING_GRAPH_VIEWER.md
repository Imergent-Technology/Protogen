# Testing the Graph Viewer

**Created**: October 20, 2025  
**Status**: Sprint 2 Complete - Ready to Test

---

## 🎯 What Was Built

Sprint 2 delivered:
- ✅ **GraphSceneViewer** - Main graph viewing component
- ✅ **NodeDetailDialog** - Interactive node information display
- ✅ **useGraphScene** hook - Data loading integration
- ✅ **SceneViewer integration** - Routes graph scenes to viewer
- ✅ **Test data** - 3 nodes with subgraph and scene

---

## 🧪 How to Test

### Prerequisites

1. **Run the cache-buster**:
   ```bash
   ./dev-refresh.sh all
   ```

2. **Hard refresh browser** (Ctrl+Shift+R / Cmd+Shift+R)

### Test Steps

#### Option 1: Via Scene Navigation (if scenes are visible)

1. **Open Portal**: http://localhost:3000
2. **Look for scenes** in the navigation/home page
3. **Click on "System Graph" scene** (if visible)
4. **Should see**: Interactive Sigma.js graph visualization

#### Option 2: Direct URL Navigation

1. **Navigate directly** to: `http://localhost:3000/scene/system-graph`
2. **Or try**: `http://localhost:3000/scene/1` (using scene ID)
3. **Should see**: Interactive graph with nodes

#### Option 3: Via Browser Console

1. **Open portal**: http://localhost:3000
2. **Open DevTools** (F12)
3. **Go to Console tab**
4. **Check for errors** - should see no graph-studio related errors
5. **Try navigating** to a scene programmatically

### What to Look For

#### ✅ Success Indicators

- **Graph renders** - You see a Sigma.js canvas with nodes
- **Nodes are visible** - You can see "Machine Learning", "Neural Networks", "Deep Learning"
- **Nodes are clickable** - Clicking opens NodeDetailDialog
- **No console errors** - Check DevTools Console tab
- **Loading state works** - Brief "Loading graph..." message
- **Responsive** - Graph fills the container

#### ❌ Failure Indicators

- **Blank screen** - SceneViewer not detecting graph type
- **"No nodes to display"** - Data not loading from API
- **Console errors** about graph-studio - Import issues
- **"Scene Not Found"** - Scene doesn't exist or routing broken

---

## 🐛 Debugging

### If Graph Doesn't Appear

1. **Check Browser Console**:
   ```javascript
   // Open DevTools Console (F12)
   // Look for errors mentioning:
   // - graph-studio
   // - GraphSceneViewer
   // - Sigma
   // - graphology
   ```

2. **Check Network Tab**:
   - Open DevTools > Network
   - Check "Disable cache"
   - Reload page
   - Look for API calls to `/api/scenes/` or `/api/subgraphs/`
   - Check if they return data

3. **Verify Scene Exists**:
   ```bash
   # In terminal
   docker-compose exec api php artisan db:seed --class=SystemSceneSeeder
   ```

4. **Check Portal Logs**:
   ```bash
   docker-compose logs portal --tail=50
   ```
   Look for errors about missing modules or imports

### If Nodes Don't Render

1. **Verify test data exists**:
   ```bash
   docker-compose exec api php artisan db:seed --class=TestGraphDataSeeder
   ```

2. **Check if API is accessible**:
   ```bash
   # Test API endpoint (from within portal container)
   docker-compose exec portal curl http://api:9000/api/scenes
   ```

### If Dialog Doesn't Open

1. **Click a node** and check Console for errors
2. **Verify Dialog system** is loaded:
   ```javascript
   // In browser console
   console.log(window.__PROTOGEN_DIALOG__)
   ```

---

## 📊 Expected Test Data

### Scene
- **Name**: System Graph
- **Type**: graph
- **Slug**: system-graph
- **Subgraph**: System Graph Subgraph

### Nodes
1. **Machine Learning**
   - GUID: 550e8400-e29b-41d4-a716-446655440001
   - Type: Concept
   - Description: "A branch of artificial intelligence..."

2. **Neural Networks**
   - GUID: 550e8400-e29b-41d4-a716-446655440002
   - Type: Concept
   - Description: "Computing systems inspired by biological..."

3. **Deep Learning**
   - GUID: 550e8400-e29b-41d4-a716-446655440003
   - Type: Concept
   - Description: "A subset of machine learning..."

---

## 🔧 Quick Fixes

### Graph Viewer Not Loading

```bash
# Rebuild shared library and restart
./dev-refresh.sh portal

# Wait 5 seconds, then hard refresh browser
```

### Scene Not Found

```bash
# Recreate the scene
docker-compose exec api php artisan db:seed --class=SystemSceneSeeder
```

### Nodes Not Visible

```bash
# Recreate test data
docker-compose exec api php artisan db:seed --class=TestGraphDataSeeder
```

### Port 8080 Conflict (API not accessible)

```bash
# Check what's using port 8080
lsof -i :8080

# Kill the process or change docker-compose.yml port
```

---

## ✅ Success Criteria

For Sprint 2 to be considered fully tested:

1. ✅ **Graph scene renders** in portal
2. ✅ **Nodes are visible** and positioned
3. ✅ **Click node** opens detail dialog
4. ✅ **Dialog shows** node information correctly
5. ✅ **No console errors** in DevTools
6. ✅ **Navigation works** (can get to scene via URL)
7. ✅ **Loading states** display correctly

---

## 📝 Testing Checklist

- [ ] Ran `./dev-refresh.sh all`
- [ ] Hard refreshed browser (Ctrl+Shift+R)
- [ ] Navigated to portal (http://localhost:3000)
- [ ] Can see or navigate to graph scene
- [ ] Graph canvas renders with Sigma.js
- [ ] Test nodes are visible (Machine Learning, Neural Networks, Deep Learning)
- [ ] Clicking node opens dialog
- [ ] Dialog shows node name and description
- [ ] No errors in browser console
- [ ] No errors in Docker logs

---

## 🚀 Next Steps (Sprint 3)

Once graph viewing is confirmed working:

1. **Zoom/focus animations** on node click
2. **Enhanced node detail dialog** with relationships
3. **"Explore related" functionality** (traverse edges)
4. **Keyboard navigation** (arrows, Enter, Escape)
5. **Pan/zoom controls**

---

**Need Help?**
- Check: [docs/CACHING_ISSUES.md](docs/CACHING_ISSUES.md)
- Logs: `docker-compose logs portal --tail=50`
- Nuclear option: `./dev-refresh.sh nuclear`

