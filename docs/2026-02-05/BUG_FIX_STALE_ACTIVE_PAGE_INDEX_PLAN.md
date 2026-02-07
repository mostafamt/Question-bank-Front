# Bug Fix Plan: Stale activePageIndex in onClickDeleteArea

## Bug Description

When deleting an area, `onClickDeleteArea` uses an incorrect (stale) `activePageIndex` value. This causes deletion to target the wrong page's areas.

---

## Root Cause Analysis

### The Problem Chain

The bug occurs due to a **stale closure** caused by ref-based memoization in `useStudioColumns.js`.

### Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│ 1. User changes page (activePageIndex: 0 → 1)                           │
└─────────────────────────────────┬───────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ 2. useAreaManagement recreates onClickDeleteArea with NEW               │
│    activePageIndex (1) due to useCallback dependency                    │
│                                                                         │
│    [activePageIndex, areas, areasProperties, updateAreaProperty]        │
└─────────────────────────────────┬───────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ 3. Studio.jsx recreates rightColumnProps with NEW onClickDeleteArea     │
│    via useMemo (onClickDeleteArea is in dependency array)               │
└─────────────────────────────────┬───────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ 4. useStudioColumns receives NEW rightColumnProps                       │
│                                                                         │
│    BUT: rightColumns useMemo does NOT re-run because                    │
│    onClickDeleteArea is NOT in its dependency array!                    │
│                                                                         │
│    Dependencies: [isReaderMode, pages, activePageIndex, chapterId,      │
│                   setActivePage, navigateToBlock,                       │
│                   rightColumnProps.areasProperties,      ← ✓ included   │
│                   rightColumnProps.compositeBlocks,      ← ✓ included   │
│                   rightColumnProps.loadingSubmitCompositeBlocks]        │
│                                                                         │
│    Missing: rightColumnProps.onClickDeleteArea           ← ✗ NOT HERE!  │
└─────────────────────────────────┬───────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ 5. rightColumns uses STALE onClickDeleteArea from rightColumnPropsRef   │
│                                                                         │
│    const props = rightColumnPropsRef.current;  ← OLD reference!         │
│    const { onClickDeleteArea, ... } = props;   ← OLD function!          │
│                                                                         │
│    This old function still has activePageIndex = 0 in its closure       │
└─────────────────────────────────┬───────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ 6. User clicks delete on page 1, but function uses activePageIndex = 0  │
│    → WRONG PAGE TARGETED!                                               │
└─────────────────────────────────────────────────────────────────────────┘
```

### Code Evidence

**File: `src/components/Studio/hooks/useStudioColumns.js`**

```javascript
// Line 130-134: rightColumnProps stored in ref
const rightColumnPropsRef = useRef(rightColumnProps);
useEffect(() => {
  rightColumnPropsRef.current = rightColumnProps;
}, [rightColumnProps]);

// Line 140-239: rightColumns useMemo
const rightColumns = useMemo(() => {
  // ...

  // Line 153: Reading from REF (stale!)
  const props = rightColumnPropsRef.current;

  // Line 159: onClickDeleteArea comes from stale ref
  const { onClickDeleteArea, ... } = props;

  // Line 191-227: buildRightColumns uses stale onClickDeleteArea
  return buildRightColumns({
    onClickDeleteArea,  // ← STALE!
    // ...
  });
}, [
  // Line 228-239: Dependencies - onClickDeleteArea is MISSING!
  isReaderMode,
  pages,
  activePageIndex,
  chapterId,
  setActivePage,
  navigateToBlock,
  rightColumnProps.areasProperties,
  rightColumnProps.compositeBlocks,
  rightColumnProps.loadingSubmitCompositeBlocks,
  // ❌ rightColumnProps.onClickDeleteArea is NOT here!
]);
```

---

## Solution Options

### Option A: Add onClickDeleteArea to Dependencies (Recommended)

Add `rightColumnProps.onClickDeleteArea` to the `rightColumns` useMemo dependency array and read it directly from `rightColumnProps`.

**Pros:**
- Simple fix
- Follows React best practices
- Ensures fresh function reference

**Cons:**
- May cause more re-renders of rightColumns

### Option B: Pass activePageIndex as Parameter

Modify `onClickDeleteArea` to accept `activePageIndex` as a parameter instead of capturing it in closure.

**Pros:**
- Eliminates closure issues entirely
- More explicit data flow

**Cons:**
- Requires changes in multiple files (hook, columns, components)
- Breaking change to function signature

### Option C: Use Ref for activePageIndex in Hook

Store `activePageIndex` in a ref inside `useAreaManagement` and read from ref in `onClickDeleteArea`.

**Pros:**
- Always gets latest value
- No dependency changes needed

**Cons:**
- Hides dependency, harder to reason about
- Not idiomatic React

---

## Recommended Solution: Option A

### Changes Required

**File: `src/components/Studio/hooks/useStudioColumns.js`**

#### Change 1: Read onClickDeleteArea from rightColumnProps directly

```javascript
// Line 184-189: Add onClickDeleteArea to the "fresh values" section
const {
  areasProperties,
  compositeBlocks,
  loadingSubmitCompositeBlocks,
  onClickDeleteArea,  // ← ADD THIS
} = rightColumnProps;
```

#### Change 2: Remove onClickDeleteArea from ref destructuring

```javascript
// Line 156-182: Remove onClickDeleteArea from props destructuring
const {
  setAreasProperties,
  onEditText,
  // onClickDeleteArea,  ← REMOVE THIS
  type,
  // ... rest stays the same
} = props;
```

#### Change 3: Add to dependency array

```javascript
// Line 228-239: Add to dependencies
}, [
  isReaderMode,
  pages,
  activePageIndex,
  chapterId,
  setActivePage,
  navigateToBlock,
  rightColumnProps.areasProperties,
  rightColumnProps.compositeBlocks,
  rightColumnProps.loadingSubmitCompositeBlocks,
  rightColumnProps.onClickDeleteArea,  // ← ADD THIS
]);
```

---

## Full Code Change

```javascript
// In useStudioColumns.js, update the rightColumns useMemo:

const rightColumns = useMemo(() => {
  if (isReaderMode) {
    return buildReaderRightColumns({
      pages,
      setActivePage,
      onChangeActivePage: setActivePage,
      changePageById: changePageByIdRef.current,
      navigateToBlock,
      chapterId,
    });
  }

  // Read from ref for stable access to most props
  const props = rightColumnPropsRef.current;

  // Destructure right column props for studio mode (stable props from ref)
  const {
    setAreasProperties,
    onEditText,
    // onClickDeleteArea,  ← REMOVED FROM HERE
    type,
    onClickSubmit,
    loadingSubmit,
    updateAreaProperty,
    updateAreaPropertyById,
    types,
    onChangeLabel,
    subObject,
    tOfActiveType,
    onSubmitAutoGenerate,
    loadingAutoGenerate,
    onClickToggleVirutalBlocks,
    showVB,
    compositeBlocksTypes,
    onChangeCompositeBlocks,
    processCompositeBlock,
    onSubmitCompositeBlocks,
    DeleteCompositeBlocks,
    highlight,
    setHighlight,
    setActivePageIndex,
    onClickHand,
  } = props;

  // Get frequently changing props directly from rightColumnProps (not ref)
  const {
    areasProperties,
    compositeBlocks,
    loadingSubmitCompositeBlocks,
    onClickDeleteArea,  // ← ADDED HERE (fresh value)
  } = rightColumnProps;

  return buildRightColumns({
    areasProperties,
    setAreasProperties,
    activePageIndex,
    onEditText,
    onClickDeleteArea,
    // ... rest unchanged
  });
}, [
  isReaderMode,
  pages,
  activePageIndex,
  chapterId,
  setActivePage,
  navigateToBlock,
  rightColumnProps.areasProperties,
  rightColumnProps.compositeBlocks,
  rightColumnProps.loadingSubmitCompositeBlocks,
  rightColumnProps.onClickDeleteArea,  // ← ADDED TO DEPENDENCIES
]);
```

---

## Testing Checklist

- [ ] Navigate to page 0, draw an area, delete it → Should delete from page 0
- [ ] Navigate to page 1, draw an area, delete it → Should delete from page 1
- [ ] Navigate to page 0, then page 1, delete existing area → Should use correct page
- [ ] Rapid page switches then delete → Should use latest page
- [ ] Delete server area after page change → Should soft-delete on correct page
- [ ] Check console logs show correct `activePageIndex` value

---

## Additional Cleanup

After fixing the bug, remove the debug console.logs from `onClickDeleteArea`:

```javascript
// Remove these lines from useAreaManagement.js:
console.log("areas= ", areas);
console.log("activePageIndex= ", activePageIndex);
console.log("areas[activePageIndex]= ", areas[activePageIndex]);
```

---

## Summary

| Aspect | Details |
|--------|---------|
| **Bug** | `onClickDeleteArea` uses stale `activePageIndex` |
| **Cause** | `rightColumns` useMemo reads from ref, missing dependency |
| **Fix** | Read `onClickDeleteArea` directly from `rightColumnProps` and add to dependencies |
| **Files** | `src/components/Studio/hooks/useStudioColumns.js` |
| **Risk** | Low - straightforward dependency fix |
