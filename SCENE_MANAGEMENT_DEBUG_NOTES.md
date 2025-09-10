# Scene Management Debug Notes - Handoff for Tomorrow

## 🎯 Current Status

**Commit**: `e171c79` - "fix: Scene management improvements and debugging"

**Overall Progress**: Scene management system is 80% complete. Core functionality works, but design data saving needs debugging.

## ✅ Issues Fixed Today

1. **Name Field Duplication** - Removed duplicate name field from DocumentSceneAuthoring
2. **Slug Field Empty** - Added slug mapping from API response to SceneCardData interface
3. **Update Scene Error** - Fixed undefined GUID error in updateScene API calls
4. **Infinite Re-rendering** - Fixed with useCallback in DesignStep component
5. **Scene Content Loading** - Added loadSceneContent method to store
6. **Navigation Issues** - Fixed routing to scene list instead of admin dashboard

## 🔍 Current Issue: Design Data Not Saving

### Problem Description
When creating or editing Document scenes, the design data is not being saved to the `scene_content` table, even when the user clicks the "Save Scene" button.

### Debugging Evidence
- Console shows: `Design data: {type: 'graph', designData: undefined}`
- User clicks "Save Scene" but no logs from DocumentSceneAuthoring handleSave
- Workflow completes with `designData: undefined`
- Scene content is not saved to database

### Key Files to Investigate

#### 1. `admin/src/components/authoring/DocumentSceneAuthoring.tsx`
- **Lines 282-294**: `handleSave` function with debugging logs
- **Lines 329-335**: Save button with click handler
- **Issue**: Save button click is not triggering handleSave function

#### 2. `admin/src/components/workflows/scene/DesignStep.tsx`
- **Lines 30-40**: `handleSave` function with useCallback
- **Lines 58-61**: `commonProps` passed to DocumentSceneAuthoring
- **Issue**: Data flow from DocumentSceneAuthoring to DesignStep

#### 3. `admin/src/App.tsx`
- **Lines 98-104**: Workflow completion handler
- **Issue**: Design data is undefined when workflow completes

### Debugging Steps for Tomorrow

#### Step 1: Verify Save Button Functionality
```bash
# Test the save button click
1. Go to Create New Scene → Basic Details (Document) → Design
2. Fill out some content in DocumentSceneAuthoring
3. Click "Save Scene" button
4. Check console for "Save button clicked" log
```

**Expected**: Should see "Save button clicked" in console
**If not**: Button click handler is not working

#### Step 2: Verify Data Flow
```bash
# Check if handleSave is called
1. After clicking Save Scene, check for:
   - "DocumentSceneAuthoring handleSave function called"
   - "DesignStep handleSave called with:"
   - "DesignStep current data:"
   - "DesignStep updated data:"
```

**Expected**: All logs should appear
**If not**: Data flow is broken somewhere

#### Step 3: Check Workflow Data Structure
```bash
# Verify workflow data is updated
1. After saving, check WorkflowWizard logs:
   - "Saving workflow data: {basicDetails: {...}, design: {...}}"
2. Check if design.designData contains the saved content
```

**Expected**: design.designData should contain the DocumentSceneAuthoring data
**If not**: WorkflowWizard is not receiving updated data

### Potential Root Causes

#### 1. Button Click Handler Issue
- Save button might not be properly bound to handleSave
- Event propagation might be blocked
- Button might be disabled or not clickable

#### 2. Data Flow Issue
- DocumentSceneAuthoring onSave prop might not be the correct function
- DesignStep handleSave might not be calling onDataChange properly
- WorkflowWizard might not be updating workflow data

#### 3. Component Re-rendering Issue
- useCallback dependencies might be causing stale closures
- Component might be re-rendering and losing state

### Files to Check

#### Critical Files:
1. `admin/src/components/authoring/DocumentSceneAuthoring.tsx` (lines 282-335)
2. `admin/src/components/workflows/scene/DesignStep.tsx` (lines 30-61)
3. `admin/src/components/workflows/WorkflowWizard.tsx` (lines 46-52, 120-126)
4. `admin/src/App.tsx` (lines 98-104)

#### API Files:
1. `api/app/Http/Controllers/Api/SceneApiController.php` (saveContent method)
2. `api/routes/api.php` (scene content routes)

### Quick Fixes to Try

#### 1. Add More Debugging
```typescript
// In DocumentSceneAuthoring.tsx handleSave
const handleSave = () => {
  console.log('=== SAVE BUTTON CLICKED ===');
  console.log('formData:', formData);
  console.log('htmlContent:', htmlContent);
  console.log('onSave function:', onSave);
  // ... rest of function
};
```

#### 2. Check Button State
```typescript
// In DocumentSceneAuthoring.tsx render
<Button 
  onClick={() => {
    console.log('Button clicked, handleSave:', handleSave);
    handleSave();
  }}
  disabled={false} // Explicitly set
>
```

#### 3. Verify onSave Prop
```typescript
// In DesignStep.tsx
const commonProps = {
  onSave: (data) => {
    console.log('DesignStep onSave called with:', data);
    handleSave(data);
  },
  // ... other props
};
```

### Database Verification

#### Check if content is being saved:
```sql
-- Check scene_content table
SELECT * FROM scene_content ORDER BY created_at DESC LIMIT 5;

-- Check scenes table
SELECT id, guid, name, scene_type FROM scenes ORDER BY created_at DESC LIMIT 5;
```

### Next Steps Priority

1. **HIGH**: Debug why Save Scene button click is not working
2. **HIGH**: Verify data flow from DocumentSceneAuthoring to WorkflowWizard
3. **MEDIUM**: Test scene content loading when editing existing scenes
4. **LOW**: Remove debugging logs once issues are resolved

### Testing Checklist

- [ ] Save Scene button click triggers handleSave
- [ ] DocumentSceneAuthoring data is passed to DesignStep
- [ ] DesignStep updates WorkflowWizard data
- [ ] Workflow completion saves content to scene_content table
- [ ] Editing existing scenes loads previous content
- [ ] Scene content persists after page refresh

### Environment Notes

- **API**: Running on `http://protogen.local:8080`
- **Frontend**: Running on `http://protogen.local:3001`
- **Auth Token**: `4|pVp2D0IITXJjBoOkOiQ7Z8U0tO9l2vvPY8pJOjjv54e20d1e`
- **Database**: PostgreSQL with scene_content table created

### Key Commands

```bash
# Check API logs
docker-compose logs api --tail=20

# Check database
docker-compose exec api php artisan tinker

# Restart services if needed
docker-compose restart admin api
```

---

**Good luck tomorrow! The foundation is solid, just need to debug the data flow issue.**
