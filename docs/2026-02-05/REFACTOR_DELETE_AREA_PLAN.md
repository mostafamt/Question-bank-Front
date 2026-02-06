# Refactoring Plan: onClickDeleteArea and deleteAreaByIndex

## Overview

This document outlines the plan to refactor the `onClickDeleteArea` function in `useAreaManagement.js` and consolidate the duplicate `deleteAreaByIndex` utility function.

---

## Current State Analysis

### 1. Duplicate `deleteAreaByIndex` Function

The function exists in **two files** with slightly different implementations:

#### Location 1: `src/utils/ocr.js` (lines 102-106)
```javascript
export const deleteAreaByIndex = (areas, activePage, index) => {
  const newAreas = [...areas];
  newAreas[activePage] = newAreas[activePage].filter((_, idx) => idx !== index);
  return newAreas;
};
```
- Uses `.filter()` method
- Currently imported by `useAreaManagement.js`

#### Location 2: `src/components/Studio/utils/areaUtils.js` (lines 93-100)
```javascript
export const deleteAreaByIndex = (collection, pageIndex, areaIndex) => {
  const newCollection = [...collection];
  newCollection[pageIndex] = [
    ...newCollection[pageIndex].slice(0, areaIndex),
    ...newCollection[pageIndex].slice(areaIndex + 1),
  ];
  return newCollection;
};
```
- Uses `.slice()` method
- Exported via barrel file `src/components/Studio/utils/index.js`
- Better parameter naming (`collection`, `pageIndex`, `areaIndex`)

### 2. Current `onClickDeleteArea` Implementation

**File**: `src/components/Studio/hooks/useAreaManagement.js` (lines 113-138)

```javascript
const onClickDeleteArea = (idx) => {
  console.log("areas= ", areas);
  console.log("areasProperties= ", areasProperties);
  console.log("areasProperties[activePageIndex]= ", areasProperties[activePageIndex]);
  console.log("areasProperties[activePageIndex][idx]= ", areasProperties[activePageIndex][idx]);

  const { isServer } = areasProperties[activePageIndex]?.[idx];
  if (isServer) {
    updateAreaProperty(idx, { status: DELETED });
  } else {
    const newAreas = deleteAreaByIndex(areas, activePageIndex, idx);
    setAreas(newAreas);

    const newAreasProperties = deleteAreaByIndex(areasProperties, activePageIndex, idx);
    setAreasProperties(newAreasProperties);
  }
};
```

### 3. Issues Identified

| Issue | Severity | Description |
|-------|----------|-------------|
| **Duplicate function** | Medium | `deleteAreaByIndex` exists in two files, violating DRY principle |
| **Debug logs in production** | Low | Console.log statements should be removed |
| **Potential null access** | High | Destructuring `isServer` without null check can crash |
| **Stale closure risk** | High | Reading `areas` and `areasProperties` from closure instead of callback |
| **Non-atomic updates** | Medium | Two separate `setState` calls may cause race conditions |
| **Import from wrong location** | Low | Importing from `ocr.js` instead of dedicated `areaUtils.js` |

---

## Refactoring Plan

### Phase 1: Consolidate `deleteAreaByIndex`

#### Step 1.1: Keep Single Source of Truth
- **Keep**: `src/components/Studio/utils/areaUtils.js` version (better naming, proper location)
- **Remove**: `src/utils/ocr.js` version

#### Step 1.2: Update Imports
Update all files that import from `ocr.js` to import from the Studio utils:

```javascript
// Before
import { deleteAreaByIndex, DELETED, ... } from "../../../utils/ocr";

// After
import { DELETED, ... } from "../../../utils/ocr";
import { deleteAreaByIndex } from "../utils";
```

#### Step 1.3: Verify No Other Usages
Check all files importing `deleteAreaByIndex` from `ocr.js` and update them.

---

### Phase 2: Refactor `onClickDeleteArea`

#### Step 2.1: Remove Debug Logs
Remove all `console.log` statements.

#### Step 2.2: Add Null Safety
Add proper null checks before accessing properties:

```javascript
const areaProps = areasProperties[activePageIndex]?.[idx];
if (!areaProps) {
  console.warn(`Cannot delete area at index ${idx}: area not found`);
  return;
}
```

#### Step 2.3: Use Callback Form for State Updates
Prevent stale closure issues by using the callback form of setState:

```javascript
// Before (stale closure risk)
const newAreas = deleteAreaByIndex(areas, activePageIndex, idx);
setAreas(newAreas);

// After (always uses latest state)
setAreas((prevAreas) => deleteAreaByIndex(prevAreas, activePageIndex, idx));
```

#### Step 2.4: Atomic State Updates (Optional Enhancement)
Consider combining both state updates to ensure consistency:

```javascript
// Option A: Sequential callbacks (guaranteed order)
setAreas((prevAreas) => deleteAreaByIndex(prevAreas, activePageIndex, idx));
setAreasProperties((prevProps) => deleteAreaByIndex(prevProps, activePageIndex, idx));

// Option B: Use React.startTransition for batching (React 18+)
React.startTransition(() => {
  setAreas((prev) => deleteAreaByIndex(prev, activePageIndex, idx));
  setAreasProperties((prev) => deleteAreaByIndex(prev, activePageIndex, idx));
});
```

#### Step 2.5: Wrap in useCallback
Ensure stable function reference to prevent unnecessary re-renders:

```javascript
const onClickDeleteArea = React.useCallback((idx) => {
  // ... implementation
}, [activePageIndex, updateAreaProperty]);
```

---

### Phase 3: Final Refactored Code

#### 3.1 Updated `deleteAreaByIndex` in `areaUtils.js`

```javascript
/**
 * Delete area by index immutably
 * @param {Array} collection - Areas or areasProperties 2D array
 * @param {number} pageIndex - Page index
 * @param {number} areaIndex - Area index to delete
 * @returns {Array} - New collection with area removed, or original if invalid
 */
export const deleteAreaByIndex = (collection, pageIndex, areaIndex) => {
  // Null safety checks
  if (!collection || !Array.isArray(collection[pageIndex])) {
    console.warn('deleteAreaByIndex: Invalid collection or page index');
    return collection;
  }

  if (areaIndex < 0 || areaIndex >= collection[pageIndex].length) {
    console.warn(`deleteAreaByIndex: Invalid area index ${areaIndex}`);
    return collection;
  }

  const newCollection = [...collection];
  newCollection[pageIndex] = collection[pageIndex].filter(
    (_, idx) => idx !== areaIndex
  );
  return newCollection;
};
```

#### 3.2 Updated `onClickDeleteArea` in `useAreaManagement.js`

```javascript
/**
 * Handle area deletion
 * - Server areas: Mark as DELETED status (soft delete)
 * - Client areas: Remove from arrays (hard delete)
 * @param {number} idx - Index of area to delete
 */
const onClickDeleteArea = React.useCallback(
  (idx) => {
    // Get area properties with null safety
    const areaProps = areasProperties[activePageIndex]?.[idx];

    if (!areaProps) {
      console.warn(`Cannot delete area at index ${idx}: area not found`);
      return;
    }

    if (areaProps.isServer) {
      // Soft delete: mark as deleted for server sync
      updateAreaProperty(idx, { status: DELETED });
    } else {
      // Hard delete: remove from both arrays using callback form
      setAreas((prevAreas) =>
        deleteAreaByIndex(prevAreas, activePageIndex, idx)
      );
      setAreasProperties((prevProps) =>
        deleteAreaByIndex(prevProps, activePageIndex, idx)
      );
    }
  },
  [activePageIndex, areasProperties, updateAreaProperty, setAreas, setAreasProperties]
);
```

---

## Implementation Checklist

### Phase 1: Consolidate deleteAreaByIndex
- [ ] Update `deleteAreaByIndex` in `areaUtils.js` with null safety
- [ ] Remove `deleteAreaByIndex` from `ocr.js`
- [ ] Update import in `useAreaManagement.js`
- [ ] Verify no other files import from `ocr.js`
- [ ] Run tests to ensure no breakage

### Phase 2: Refactor onClickDeleteArea
- [ ] Remove console.log debug statements
- [ ] Add null safety check for `areaProps`
- [ ] Convert `setAreas` to callback form
- [ ] Convert `setAreasProperties` to callback form
- [ ] Wrap function in `useCallback`
- [ ] Update dependency array

### Phase 3: Testing
- [ ] Test deleting a new (client-side) area
- [ ] Test deleting a server-synced area
- [ ] Test deleting on different pages
- [ ] Test rapid consecutive deletions
- [ ] Verify no console errors

### Phase 4: Cleanup
- [ ] Remove any unused imports
- [ ] Update JSDoc comments
- [ ] Verify barrel exports are correct

---

## Files to Modify

| File | Action |
|------|--------|
| `src/components/Studio/utils/areaUtils.js` | Update `deleteAreaByIndex` with null safety |
| `src/utils/ocr.js` | Remove `deleteAreaByIndex` function |
| `src/components/Studio/hooks/useAreaManagement.js` | Refactor `onClickDeleteArea`, update imports |

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Breaking other components using `deleteAreaByIndex` | Low | High | Search all usages before removing |
| Stale closure bugs | Medium | Medium | Use callback form of setState |
| Performance regression from useCallback | Low | Low | Dependencies are stable |

---

## Rollback Plan

If issues arise after deployment:
1. Revert the commit: `git revert <commit-hash>`
2. Restore `deleteAreaByIndex` to `ocr.js`
3. Investigate the specific failure before re-attempting

---

## Notes

- The `isServer` property indicates whether the area exists on the backend
- Server areas use "soft delete" (status: DELETED) to sync with backend
- Client-only areas use "hard delete" (removed from arrays)
- Both `areas` and `areasProperties` must stay in sync (same length per page)
