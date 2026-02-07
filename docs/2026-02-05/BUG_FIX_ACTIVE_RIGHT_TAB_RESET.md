# Bug Fix: activeRightTab Resets to Default

## Issue Description

When changing `activeRightTab` state, it first changes to an empty string, then resets to its default value.

---

## Root Cause Analysis

### Problem 1: Close Action Sets Empty String

In `BookColumn.jsx` (line 25):

```javascript
<BookColumnHeader
  columnName={column.label}
  close={() => onChangeActiveTab("")}  // Sets to empty string!
/>
```

When user clicks the minimize button, it calls `setActiveTab("")`, setting `activeRightTab` to `""`.

### Problem 2: Sync Effect Resets to Default

In `useStudioColumns.js` (lines 299-311):

```javascript
useEffect(() => {
  if (!rightColumns.length) return;

  const next =
    rightColumns.find(
      (col) => col.label === activeRightTabLabelRef.current  // "" matches nothing
    ) || rightColumns[0];  // Falls back to default!

  if (next.label !== activeRightTabLabelRef.current) {
    setActiveRightTab(next);  // Resets to default!
  }
}, [rightColumns]);
```

**Flow:**
1. User clicks close → `setActiveRightTab("")`
2. Ref updates: `activeRightTabLabelRef.current = ""`
3. `rightColumns` changes (many dependencies cause frequent rebuilds)
4. Sync effect runs, can't find tab with label `""`, falls back to `rightColumns[0]`
5. `setActiveRightTab(rightColumns[0])` → Tab resets to default!

### Problem 3: Sync Effect Runs Too Frequently

The `rightColumns` useMemo has 15+ dependencies:

```javascript
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
  rightColumnProps.loadingSubmit,
  rightColumnProps.showVB,
  rightColumnProps.highlight,
  rightColumnProps.loadingAutoGenerate,
  rightColumnProps.onClickDeleteArea,
  // ... more
]);
```

Any time ANY of these props change, `rightColumns` gets a new reference, triggering the sync effect.

---

## The Flow Diagram

```
User clicks close button
         │
         ▼
┌─────────────────────────┐
│ setActiveRightTab("")   │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────────────────┐
│ React re-render                     │
│ rightColumns recalculates           │
│ (because some prop changed)         │
└───────────┬─────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────┐
│ Sync Effect runs (rightColumns changed)         │
│                                                 │
│ activeRightTabLabelRef.current = ""             │
│ rightColumns.find(c => c.label === "")          │
│ → Not found! Falls back to rightColumns[0]      │
│                                                 │
│ setActiveRightTab(rightColumns[0])              │
└───────────┬─────────────────────────────────────┘
            │
            ▼
┌─────────────────────────┐
│ Tab resets to default!  │
└─────────────────────────┘
```

---

## Solution

### Fix 1: Track Tab Labels, Not Reference

Change the sync effect to only run when tabs are actually added/removed, not when object references change:

```javascript
// Create a stable string of tab labels
const rightColumnsLabels = useMemo(
  () => rightColumns.map((c) => c.label).join(","),
  [rightColumns]
);

// Sync only when tab configuration changes (add/remove)
useEffect(() => {
  if (!rightColumns.length) return;

  // Skip if activeRightTab is intentionally empty (collapsed)
  if (activeRightTabLabelRef.current === "") return;

  const next =
    rightColumns.find(
      (col) => col.label === activeRightTabLabelRef.current
    ) || rightColumns[0];

  if (next.label !== activeRightTabLabelRef.current) {
    setActiveRightTab(next);
  }
}, [rightColumnsLabels]); // Depend on labels string, not reference
```

### Fix 2: Handle Empty String (Collapsed State)

Update the sync effect to respect the collapsed state:

```javascript
useEffect(() => {
  if (!rightColumns.length) return;

  // If tab is intentionally collapsed (empty string or null), don't reset
  if (activeRightTabLabelRef.current === "" || activeRightTabLabelRef.current === null) {
    return;
  }

  const next =
    rightColumns.find(
      (col) => col.label === activeRightTabLabelRef.current
    ) || rightColumns[0];

  if (next.label !== activeRightTabLabelRef.current) {
    setActiveRightTab(next);
  }
}, [rightColumnsLabels]);
```

### Fix 3: Use Proper Collapsed Value

In `BookColumn.jsx`, use `null` instead of empty string for collapsed state:

```javascript
<BookColumnHeader
  columnName={column.label}
  close={() => onChangeActiveTab(null)}  // Use null, not ""
/>
```

---

## Implementation

### Changes in `useStudioColumns.js`:

```javascript
// Add memoized labels string
const rightColumnsLabels = useMemo(
  () => rightColumns.map((c) => c.label).join(","),
  [rightColumns]
);

const leftColumnsLabels = useMemo(
  () => leftColumns.map((c) => c.label).join(","),
  [leftColumns]
);

// Update sync effect for left tabs
useEffect(() => {
  if (!leftColumns.length) return;

  // Respect collapsed state
  if (activeLeftTabLabelRef.current === "" || activeLeftTabLabelRef.current === null) {
    return;
  }

  const next =
    leftColumns.find((col) => col.label === activeLeftTabLabelRef.current) ||
    leftColumns[0];

  if (next.label !== activeLeftTabLabelRef.current) {
    setActiveLeftTab(next);
  }
}, [leftColumnsLabels]); // Use labels string

// Update sync effect for right tabs
useEffect(() => {
  if (!rightColumns.length) return;

  // Respect collapsed state
  if (activeRightTabLabelRef.current === "" || activeRightTabLabelRef.current === null) {
    return;
  }

  const next =
    rightColumns.find(
      (col) => col.label === activeRightTabLabelRef.current
    ) || rightColumns[0];

  if (next.label !== activeRightTabLabelRef.current) {
    setActiveRightTab(next);
  }
}, [rightColumnsLabels]); // Use labels string
```

### Changes in `BookColumn.jsx`:

```javascript
<BookColumnHeader
  columnName={column.label}
  close={() => onChangeActiveTab(null)}  // Changed from ""
/>
```

---

## Testing

1. Click minimize button → Tab should collapse and stay collapsed
2. Click on a different tab → Should switch to that tab
3. Change page → Tab should remain the same
4. Edit an area → Tab should remain the same
5. Rapidly click between tabs → Should not reset unexpectedly

---

## Summary

| Issue | Cause | Fix |
|-------|-------|-----|
| Empty string set | Close button calls `setActiveTab("")` | Use `null` for collapsed |
| Resets to default | Sync effect runs too often | Depend on labels string, not reference |
| Sync overwrites manual change | Doesn't respect collapsed state | Skip sync when collapsed |
