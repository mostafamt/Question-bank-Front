# Studio.jsx Maximum Update Depth Fix

## Problem

```
Studio.jsx:275 Warning: Maximum update depth exceeded
```

The warning points to line 275, which is inside this `useEffect`:

```javascript
// Lines 272-288
React.useEffect(() => {
  if (!imageScaleFactor) return;

  setAreas((prev) => {           // ← Line 275: setState called here
    const newAreas = [...prev];
    if (newAreas[activePageIndex]) {
      newAreas[activePageIndex] = newAreas[activePageIndex].map((area) => ({
        ...area,
        _updated: false,
      }));
    }
    return newAreas;
  });

  const timer = setTimeout(recalculateAreas, 10);
  return () => clearTimeout(timer);
}, [imageScaleFactor, activePageIndex, setAreas, recalculateAreas]);
```

---

## Root Cause Analysis

### The Cascade Effect

```
activePageIndex changes
    ↓
useEffect fires (line 272)
    ↓
setAreas() called (line 275)
    ↓
areas state updates
    ↓
useAreaManagement recalculates → areasProperties changes
    ↓
rightColumnProps useMemo recalculates (areasProperties is a dependency)
    ↓
useStudioColumns receives new rightColumnProps
    ↓
Columns rebuild → potential state updates
    ↓
Component re-renders
    ↓
LOOP continues
```

### Why This Happens

1. **`setAreas` always creates a new array** even if the data is the same
2. **`areasProperties` depends on `areas`** in `useAreaManagement`
3. **`rightColumnProps` depends on `areasProperties`** (line 199)
4. **Every `activePageIndex` change triggers the entire cascade**

---

## Identified Issues

### Issue 1: Unnecessary `setAreas` calls

The effect runs on every `activePageIndex` change and always calls `setAreas`, even when:
- The areas haven't actually changed
- The `_updated` flag is already `false`

### Issue 2: `recalculateAreas` in dependencies

`recalculateAreas` comes from `useAreaManagement` and may change reference frequently, causing the effect to re-run.

### Issue 3: Cascading state updates

`setAreas` → `areasProperties` → `rightColumnProps` → columns → potential re-renders

---

## Solutions

### Fix 1: Guard the `setAreas` call

Only call `setAreas` if areas actually need updating:

```javascript
React.useEffect(() => {
  if (!imageScaleFactor) return;

  setAreas((prev) => {
    // Check if update is actually needed
    const currentPageAreas = prev[activePageIndex];
    if (!currentPageAreas) return prev;

    // Check if any area needs updating
    const needsUpdate = currentPageAreas.some((area) => area._updated !== false);
    if (!needsUpdate) return prev; // Return same reference - no re-render

    const newAreas = [...prev];
    newAreas[activePageIndex] = currentPageAreas.map((area) => ({
      ...area,
      _updated: false,
    }));
    return newAreas;
  });

  const timer = setTimeout(recalculateAreas, 10);
  return () => clearTimeout(timer);
}, [imageScaleFactor, activePageIndex, setAreas, recalculateAreas]);
```

### Fix 2: Use ref for `recalculateAreas`

Remove `recalculateAreas` from dependencies by using a ref:

```javascript
const recalculateAreasRef = React.useRef(recalculateAreas);
React.useEffect(() => {
  recalculateAreasRef.current = recalculateAreas;
}, [recalculateAreas]);

React.useEffect(() => {
  if (!imageScaleFactor) return;

  setAreas((prev) => {
    const currentPageAreas = prev[activePageIndex];
    if (!currentPageAreas) return prev;

    const needsUpdate = currentPageAreas.some((area) => area._updated !== false);
    if (!needsUpdate) return prev;

    const newAreas = [...prev];
    newAreas[activePageIndex] = currentPageAreas.map((area) => ({
      ...area,
      _updated: false,
    }));
    return newAreas;
  });

  const timer = setTimeout(() => recalculateAreasRef.current(), 10);
  return () => clearTimeout(timer);
}, [imageScaleFactor, activePageIndex, setAreas]); // recalculateAreas removed
```

### Fix 3: Separate concerns - split the effect

```javascript
// Effect 1: Reset _updated flag (only when needed)
React.useEffect(() => {
  if (!imageScaleFactor) return;

  setAreas((prev) => {
    const currentPageAreas = prev[activePageIndex];
    if (!currentPageAreas) return prev;

    const needsUpdate = currentPageAreas.some((area) => area._updated !== false);
    if (!needsUpdate) return prev;

    const newAreas = [...prev];
    newAreas[activePageIndex] = currentPageAreas.map((area) => ({
      ...area,
      _updated: false,
    }));
    return newAreas;
  });
}, [imageScaleFactor, activePageIndex, setAreas]);

// Effect 2: Recalculate areas (debounced, separate trigger)
React.useEffect(() => {
  if (!imageScaleFactor) return;

  const timer = setTimeout(() => recalculateAreasRef.current(), 10);
  return () => clearTimeout(timer);
}, [imageScaleFactor, activePageIndex]);
```

---

## Recommended Complete Fix

Apply this to `Studio.jsx`:

```javascript
// Add ref for recalculateAreas
const recalculateAreasRef = React.useRef(recalculateAreas);
React.useEffect(() => {
  recalculateAreasRef.current = recalculateAreas;
}, [recalculateAreas]);

// Replace the problematic useEffect (lines 272-288) with:
React.useEffect(() => {
  if (!imageScaleFactor) return;

  // Guard: Only update if actually needed
  setAreas((prev) => {
    const currentPageAreas = prev[activePageIndex];
    if (!currentPageAreas) return prev;

    // Check if any area actually needs the _updated flag reset
    const needsUpdate = currentPageAreas.some((area) => area._updated !== false);
    if (!needsUpdate) return prev; // Same reference = no re-render

    const newAreas = [...prev];
    newAreas[activePageIndex] = currentPageAreas.map((area) => ({
      ...area,
      _updated: false,
    }));
    return newAreas;
  });

  // Use ref to avoid dependency
  const timer = setTimeout(() => recalculateAreasRef.current(), 10);
  return () => clearTimeout(timer);
}, [imageScaleFactor, activePageIndex, setAreas]);
```

---

## Why This Fix Works

| Before | After |
|--------|-------|
| Always creates new array | Only creates new array if needed |
| `recalculateAreas` in deps causes extra runs | Ref removes unstable dependency |
| Every page change triggers cascade | Guarded setState prevents unnecessary updates |

---

## Key Principle

> **Never return a new object/array from setState if the data hasn't changed**

React uses reference equality. If you return the same reference (`return prev`), React knows nothing changed and skips the re-render.

```javascript
// BAD - always triggers re-render
setAreas((prev) => {
  return [...prev]; // New array reference
});

// GOOD - only triggers re-render when needed
setAreas((prev) => {
  if (!needsChange) return prev; // Same reference
  return [...prev]; // New array only when needed
});
```

---

## Additional Checks

Also verify these hooks don't have similar issues:

1. **`useAreaManagement`** - check if `areasProperties` changes unnecessarily
2. **`useCompositeBlocks`** - check if `compositeBlocks` changes unnecessarily
3. **`useStudioActions`** - check if `highlight` changes unnecessarily

Each of these feeds into `rightColumnProps`, which can cause cascading updates.

---

## Testing

After applying the fix:

```javascript
// Add this temporarily to verify
console.count("Studio render");
```

- Before fix: Count increases rapidly (infinite loop)
- After fix: Count increases only on real user interactions

---

## Summary

1. ✅ Guard `setAreas` - return `prev` if no change needed
2. ✅ Use ref for `recalculateAreas` - remove from dependencies
3. ✅ Check downstream hooks for similar patterns
