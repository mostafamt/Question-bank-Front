# Tab Close/Reopen Bug Fix

## Issue Description

When closing tabs in the Studio component (like "Thumbnails" or "Block Authoring"), the tab closes and **instantly reopens**.

### Symptoms
- User clicks the minimize/close button on a tab
- Tab panel collapses momentarily
- Tab immediately reopens without user interaction

## Root Cause

The issue had **three layers**:

### Layer 1: Dynamic UUID Generation (PRIMARY CAUSE)

In `src/components/Studio/columns/index.js` and `reader.columns.js`, column IDs were generated using `uuidv4()`:

```javascript
// BEFORE (buggy)
import { v4 as uuidv4 } from "uuid";

return {
  id: uuidv4(),  // NEW random ID every time columns are built!
  label: config.label,
  component: ...
};
```

Every time columns were rebuilt (which happens frequently due to useMemo dependencies), each column got a **NEW random ID**. This made ID-based comparison impossible.

### Layer 2: Reference Equality with `includes()`

The `useEffect` in `useStudioColumns.js` used `includes()` which checks reference equality:

```javascript
if (!rightColumns.includes(activeRightTab)) {
  setActiveRightTab(rightColumns[0]);  // Forces tab back open!
}
```

Since columns are rebuilt via `useMemo`, new object references are created even for the same logical tab.

### Layer 3: Falsy Tab Not Handled

When closing a tab by setting it to `""`, the effect didn't account for intentional closure and would reset the tab.

## Solution

### Fix 1: Use Stable IDs (PRIMARY FIX)

Changed column ID generation from random UUIDs to stable `config.id`:

```javascript
// AFTER (fixed) - in columns/index.js and columns/reader.columns.js
return {
  id: config.id,  // Stable ID like 'thumbnails', 'block-authoring'
  label: config.label,
  component: ...
};
```

### Fix 2: ID-based Comparison in useEffect

Changed from `includes()` to `find()` with id/label comparison:

```javascript
// AFTER (fixed) - in hooks/useStudioColumns.js
React.useEffect(() => {
  if (!activeRightTab) return;  // Guard: skip if intentionally closed
  if (rightColumns.length > 0) {
    const matchingColumn = rightColumns.find(
      (col) => col.id === activeRightTab.id || col.label === activeRightTab.label
    );
    if (matchingColumn) {
      if (matchingColumn !== activeRightTab) {
        setActiveRightTab(matchingColumn);
      }
    } else {
      setActiveRightTab(rightColumns[0]);
    }
  }
}, [rightColumns, activeRightTab]);
```

## Files Modified

| File | Change |
|------|--------|
| `src/components/Studio/columns/index.js` | Changed `id: uuidv4()` to `id: config.id`, removed uuid import |
| `src/components/Studio/columns/reader.columns.js` | Changed `id: uuidv4()` to `id: config.id`, removed uuid import |
| `src/components/Studio/hooks/useStudioColumns.js` | Fixed useEffect to use id/label comparison + guard clause |

## Testing

1. Open the Studio component
2. Expand a tab (Thumbnails, Block Authoring, etc.)
3. Click the minimize/close button
4. Verify the tab stays closed
5. Navigate between pages (which triggers column rebuilds)
6. Verify tabs maintain their open/closed state
7. Test both left and right columns

## Related Files

- `src/components/Book/BookColumn/BookColumn.jsx` - Contains the tab close handler (`onChangeActiveTab("")`)
- `src/components/Book/BookColumnHeader/BookColumnHeader.jsx` - Contains the minimize button

## Key Learnings

1. **Never use dynamic IDs (uuidv4) for objects that need to be compared across re-renders**
2. **Use stable identifiers** based on the logical identity of the object
3. **Don't use `includes()`** for comparing objects that are rebuilt - use `find()` with property comparison
4. **Handle falsy edge cases** when objects can be intentionally set to empty/null values

## Date

2026-01-21
