# Development Caching Issues & Solutions

**Last Updated**: October 20, 2025  
**Status**: Active Issue - Multiple Cache Layers

---

## 🚨 The Problem

When making changes to the Protogen codebase (especially UI components), changes often **don't appear in the browser** even after:
- Hard refresh (Ctrl+Shift+R / Cmd+Shift+R)
- Clearing browser cache
- Using incognito/private browsing mode
- Restarting Docker containers

This is **not a browser caching issue** - it's a **multi-layer caching problem** in the development environment.

---

## 🔍 Why This Happens

### The Caching Layers

Protogen has **4 distinct cache layers** in development:

```
[Browser Cache]
      ↓
[Vite Dev Server Cache]
      ↓
[Docker Container Cache]
      ↓
[Shared Library Build State]
```

### Root Cause

1. **Shared Library Build State**
   - Changes to `shared/src/` don't automatically trigger rebuilds
   - Portal/Admin import from `shared/dist/` (compiled JavaScript)
   - If `shared/dist/` is stale, apps use old code

2. **Docker Volume Mounting**
   - `node_modules/@protogen/shared` is symlinked to `../shared`
   - Docker may not detect file changes in symlinked directories
   - Vite dev server doesn't always detect changes across Docker volumes

3. **Vite HMR (Hot Module Replacement)**
   - Works great for changes within portal/admin
   - **Doesn't reliably detect** changes in `@protogen/shared`
   - Vite caches module resolutions

4. **Browser Caching**
   - Even with hard refresh, service workers may cache
   - DevTools "Disable cache" only works when DevTools is open

---

## ✅ Solutions

### Quick Fix (90% of cases)

Run the dev-refresh script:

```bash
./dev-refresh.sh portal   # Refresh portal only
./dev-refresh.sh admin    # Refresh admin only
./dev-refresh.sh all      # Refresh everything (recommended)
```

**What it does**:
1. Rebuilds shared library (`npm run build` in `shared/`)
2. Restarts relevant Docker containers
3. Clears Vite's module cache

### Manual Steps (if script fails)

```bash
# Step 1: Rebuild shared library
cd shared
npm run build
cd ..

# Step 2: Restart portal
docker-compose restart portal

# Step 3: Wait for Vite to start
sleep 3

# Step 4: Hard refresh browser (Ctrl+Shift+R)
```

### Nuclear Option (stubborn caching)

```bash
./dev-refresh.sh nuclear
```

**Warning**: This stops and restarts ALL containers. Takes ~30 seconds.

---

## 🛠️ When to Use Each Solution

### Use Quick Fix When:
- ✅ Made changes to `shared/src/` components
- ✅ Made changes to graph-studio system
- ✅ Added new hooks or services
- ✅ Modified TypeScript types
- ✅ Changes aren't showing up after 10 seconds

### Use Nuclear Option When:
- ✅ Quick fix didn't work
- ✅ Seeing "Pre-transform error" in logs
- ✅ npm dependencies changed
- ✅ Docker volumes seem corrupted

### Don't Need Refresh When:
- ❌ Only changed portal/admin code (not shared)
- ❌ Only changed CSS/styles
- ❌ Only changed API/backend code
- ❌ Only changed documentation

---

## 🔧 Long-term Solutions (TODO)

### Option 1: Watch Mode for Shared Library

Add to `shared/package.json`:
```json
"scripts": {
  "dev": "tsc --watch"
}
```

Run in separate terminal:
```bash
cd shared && npm run dev
```

**Pros**: Automatic rebuilds on save  
**Cons**: Extra terminal window, slower builds

### Option 2: Vite Plugin for Shared Library

Create custom Vite plugin to watch and rebuild shared library automatically.

**Pros**: Seamless DX, no extra steps  
**Cons**: Complex to implement

### Option 3: Monorepo Build System

Use Turborepo or Nx to manage builds across packages.

**Pros**: Professional solution, handles dependencies  
**Cons**: Significant setup overhead

---

## 📊 Debugging Caching Issues

### Check If Shared Library Is Built

```bash
ls -la shared/dist/src/systems/graph-studio/
```

Should see `.js` and `.d.ts` files with recent timestamps.

### Check If Portal Can Access Shared Library

```bash
docker-compose exec portal ls -la /app/node_modules/@protogen/shared/dist/src/systems/graph-studio/
```

Should see files matching local `shared/dist/`.

### Check Vite Logs for Errors

```bash
docker-compose logs portal --tail=50 | grep -i error
```

Look for "Pre-transform error" or "Failed to load url".

### Check Browser Network Tab

1. Open DevTools (F12)
2. Go to Network tab
3. Check "Disable cache"
4. Reload page
5. Look for 304 (cached) vs 200 (fresh) responses

---

## 🎯 Recommended Workflow

### For UI Changes

1. **Make changes** to portal/admin code
2. **Save files** (Vite HMR should work automatically)
3. **If no change in browser** → Hard refresh
4. **If still no change** → Run `./dev-refresh.sh all`

### For Shared Library Changes

1. **Make changes** to `shared/src/` code
2. **Run refresh** immediately: `./dev-refresh.sh all`
3. **Wait 5 seconds** for containers to restart
4. **Hard refresh** browser (Ctrl+Shift+R)
5. **Check DevTools** for errors if still not working

### For Testing Graph Viewer

Since graph viewer is in shared library:

```bash
# After making any changes to graph-studio system:
./dev-refresh.sh portal

# Then in browser:
# 1. Hard refresh (Ctrl+Shift+R)
# 2. Navigate to a graph scene
# 3. Check console for errors
```

---

## 🚨 Known Issues

### Issue 1: Vite Doesn't Detect Shared Library Changes

**Symptoms**: Changes to `shared/src/` don't appear, no HMR update  
**Cause**: Vite doesn't watch symlinked `node_modules/@protogen/shared`  
**Solution**: Run `./dev-refresh.sh` after shared library changes

### Issue 2: "Pre-transform error: Failed to load url"

**Symptoms**: Portal won't load, errors about missing `.js` files  
**Cause**: Shared library not built, or stale build  
**Solution**: `cd shared && npm run build`

### Issue 3: Changes Appear in Incognito But Not Normal Browser

**Symptoms**: Incognito shows new code, normal browser shows old  
**Cause**: Service worker or persistent cache in normal browser  
**Solution**: Clear all site data in browser settings

### Issue 4: Docker Container Won't Restart

**Symptoms**: `docker-compose restart portal` hangs  
**Cause**: Process locked or port conflict  
**Solution**: `docker-compose down && docker-compose up -d`

---

## 📝 Quick Reference

| Problem | Solution | Time |
|---------|----------|------|
| Changes not showing | `./dev-refresh.sh all` | 30s |
| Shared library changes | `./dev-refresh.sh portal` | 20s |
| Stubborn caching | `./dev-refresh.sh nuclear` | 60s |
| Just CSS changes | Hard refresh browser | 1s |
| API changes | Restart API container | 10s |

---

## 🔗 Related Documentation

- `/README.md` - Quick start and dev commands
- `/docker-compose.yml` - Container configuration
- `/portal/vite.config.ts` - Vite configuration
- `/shared/package.json` - Build scripts

---

## 💡 Tips

1. **Always run `./dev-refresh.sh` after pulling from git** if shared library changed
2. **Keep DevTools Network tab open** with "Disable cache" checked
3. **Use incognito for testing** to eliminate browser cache entirely
4. **Check Docker logs** if something seems really broken: `docker-compose logs portal`
5. **When in doubt**: `./dev-refresh.sh nuclear` and start fresh

---

**Need help?** Check Docker logs: `docker-compose logs portal --tail=50`  
**Still stuck?** Try nuclear option: `./dev-refresh.sh nuclear`

