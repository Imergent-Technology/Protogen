# TypeScript Compilation Fixes Guide

**Date**: 2025-10-11  
**Status**: 62 errors remaining after initial fixes

---

## ✅ Completed Fixes

1. **ApiClient Generic Methods** ✅
   - Added `get()`, `post()`, `put()`, `delete()` methods to ApiClient
   - Enables GraphQueryService to work correctly
   - Location: `shared/src/services/ApiClient.ts` lines 189-228

2. **CardSceneAuthoring Imports** ✅
   - Removed unused imports (`useEffect`, `Badge`, `Textarea`, `NodeMetadata`)
   - Fixed circular dependency by using relative imports
   - Location: `shared/src/systems/authoring/components/CardSceneAuthoring.tsx`

---

## ⚠️ Remaining Errors by Category

### Category 1: Unused Variables/Parameters (41 errors)
**Type**: TS6133 - Variable declared but never read

#### Quick Fix Strategy:
Prefix unused variables with underscore `_` or remove if truly unused.

```typescript
// Before:
const unusedVar = something;

// After:
const _unusedVar = something; // For future use
// OR remove entirely if not needed
```

#### Files with Unused Variables:
- `src/systems/authoring/hooks/useAuthoringPermissions.ts` (6 errors)
- `src/systems/authoring/hooks/useSceneAuthoring.ts` (2 errors)
- `src/systems/authoring/hooks/useSceneValidation.ts` (1 error)
- `src/systems/authoring/services/PermissionService.ts` (6 errors)
- `src/systems/authoring/components/*` (15 errors)
- `src/systems/navigator/*` (3 errors)
- `src/systems/scene/*` (4 errors)
- `src/systems/slide/*` (4 errors)

---

### Category 2: Type Mismatches (15 errors)

#### 2.1 Scene/Slide Animation Type Errors
**File**: `src/systems/scene/SlideAnimator.tsx`  
**Issue**: String values assigned to number properties

```typescript
// Lines 52, 55, 58, 61, 68, 71, 74, 77
// Error: Type 'string' is not assignable to type 'number'

// Fix: Parse string values to numbers
const duration = parseInt(value, 10);
// OR ensure values are numbers from the start
const duration: number = 500;
```

#### 2.2 Framer Motion Transition Type
**File**: `src/systems/scene/SlideAnimator.tsx` line 175  
**Issue**: Easing property type mismatch

```typescript
// Current (incorrect):
transition: { duration: number; ease: string; }

// Fix:
import { Easing } from 'framer-motion';
transition: { 
  duration: number; 
  ease: Easing | Easing[]; 
}
// OR use predefined easing:
ease: "easeInOut" // type-safe string literal
```

#### 2.3 Navigator Method Signature Mismatch
**File**: `src/systems/navigator/NavigatorSystem.ts` line 123  
**Issue**: `navigateToSlide` parameter type conflict

```typescript
// Interface expects:
navigateToSlide(slideId: string): Promise<void>

// Implementation has:
navigateToSlide(target: NavigationTarget): Promise<void>

// Fix: Match the interface signature
async navigateToSlide(slideId: string): Promise<void> {
  const target: NavigationTarget = {
    type: 'slide',
    id: slideId,
    // ... build proper target
  };
  return this.navigateTo(target);
}
```

#### 2.4 SlideSystem Method Argument Count
**File**: `src/systems/slide/SlideSystem.ts` lines 321, 328, 338  
**Issue**: Expected 2 arguments, got 1

```typescript
// Check method signature and provide missing argument
// OR update method to accept single argument if that's the intended API
```

---

### Category 3: Implicit 'any' Types (10+ errors)

**Files Affected**:
- `src/systems/authoring/components/CardSceneAuthoring.tsx`
- `src/systems/authoring/components/DocumentSceneAuthoring.tsx`

**Issue**: Function parameters without explicit types

```typescript
// Before:
onChange={(value) => { ... }}
onClick={(e) => { ... }}

// After:
onChange={(value: string | number) => { ... }}
onClick={(e: React.MouseEvent<HTMLButtonElement>) => { ... }}
```

---

### Category 4: Export/Import Conflicts (1 error)

**File**: `src/systems/navigator/index.ts` line 4  
**Issue**: Duplicate export of `NavigatorSystem`

```typescript
// Current:
export * from './types';  // Contains NavigatorSystem type
export { NavigatorSystem as Navigator } from './NavigatorSystem'; // Re-exports same name

// Fix option 1: Rename re-export
export { NavigatorSystem as Navigator } from './NavigatorSystem';

// Fix option 2: Use explicit exports in types
// In types.ts, don't export NavigatorSystem if it's exported from NavigatorSystem.ts
```

---

### Category 5: Other Type Issues (5 errors)

#### 5.1 Promise State Type Mismatches
**File**: `src/hooks/useGraphQuery.ts` lines 110, 162, 205  
**Issue**: Setting non-Promise values to Promise state

```typescript
// Current state type:
const [data, setData] = useState<Promise<DataType> | null>(null);

// Problem: Setting direct values instead of Promises
setData({ nodes: [...], scores: {...} }); // Wrong!

// Fix option 1: Remove Promise from state type
const [data, setData] = useState<DataType | null>(null);

// Fix option 2: Wrap values in Promise.resolve()
setData(Promise.resolve({ nodes: [...], scores: {...} }));
```

#### 5.2 Undefined in Union Type
**File**: `src/systems/navigator/NavigatorSystem.ts` lines 289, 291  
**Issue**: Type includes `undefined` but target type doesn't allow it

```typescript
// Add null check or use non-null assertion
const value = something ?? null; // Provide default
// OR
const value = something!; // Assert non-null (use carefully)
```

---

## 🔧 Systematic Fix Approach

### Step 1: Fix Unused Variables (Fastest)
Run this script to identify all unused variables:
```bash
cd /home/tennyson/development/protogen/shared
npm run build 2>&1 | grep "TS6133" > unused_vars.txt
```

Then fix each by either:
- Prefixing with `_` if needed for future
- Removing if truly unused

### Step 2: Fix Type Annotations
Add explicit types to all parameters:
```bash
npm run build 2>&1 | grep "TS7006" > implicit_any.txt
```

### Step 3: Fix Type Mismatches
Handle the complex type issues:
```bash
npm run build 2>&1 | grep -E "TS2322|TS2345|TS2416" > type_mismatches.txt
```

### Step 4: Verify Build
```bash
npm run build
# Should complete without errors
```

---

## 🎯 Priority Order for Fixes

1. **HIGH**: Category 2 (Type Mismatches) - These affect functionality
2. **MEDIUM**: Category 3 (Implicit any) - TypeScript safety
3. **MEDIUM**: Category 4 (Export conflicts) - May cause runtime issues
4. **LOW**: Category 1 (Unused variables) - Cleanup only
5. **LOW**: Category 5 (Other) - Edge cases

---

## ✅ Testing After Fixes

```bash
# 1. Build shared library
cd /home/tennyson/development/protogen/shared
npm run build

# 2. Rebuild portal and admin
cd ../portal && npm install && npm run build
cd ../admin && npm install && npm run build

# 3. Test in Docker
docker-compose restart portal admin

# 4. Verify applications load
curl http://localhost:3000
curl http://localhost:3001
```

---

## 📝 Notes

- Most errors are in authoring system components (not critical for basic operation)
- Navigator and scene systems have fewer errors (more critical)
- Slide system has some method signature issues
- API client fix was critical and is complete

**Estimated fix time**: 2-3 hours for systematic cleanup

