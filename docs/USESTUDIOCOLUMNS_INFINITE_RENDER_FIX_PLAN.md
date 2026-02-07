# useStudioColumns Infinite Rendering Bug - Fix Plan

## Problem Summary

The `useStudioColumns` hook causes infinite rendering due to unstable object references, circular dependency patterns in useEffect hooks, and improper memoization.

## Affected Files

| File | Priority |
|------|----------|
| `src/components/Studio/Studio.jsx` | CRITICAL |
| `src/components/Studio/hooks/useStudioColumns.js` | CRITICAL |
| `src/components/Studio/columns/index.js` | MEDIUM |
| `src/components/Studio/columns/reader.columns.js` | LOW |

---

## Root Causes Identified

### 1. CRITICAL: rightColumnProps Object Created Every Render

**Location**: `Studio.jsx` (lines ~182-211)

```javascript
// PROBLEM: New object reference on EVERY render
rightColumnProps: {
  areasProperties,
  setAreasProperties,
  onEditText,
  onClickDeleteArea,
  type,
  onClickSubmit,
  // ... 25+ more properties
}
```

**Issue**: This object is passed to `useStudioColumns` and used as a dependency in useMemo. Since it's a new object every render, it triggers recalculation every time.

---

### 2. CRITICAL: Circular useEffect Dependency

**Location**: `useStudioColumns.js` (lines ~230-250)

```javascript
// useEffect that updates state based on columns
React.useEffect(() => {
  // ... finds matching column
  if (matchingColumn !== activeRightTab) {
    setActiveRightTab(matchingColumn);  // STATE UPDATE!
  }
}, [rightColumns, activeRightTab]);  // rightColumns changes every render!
```

**Infinite Loop Cycle**:
```
Studio.jsx renders
    ↓
rightColumnProps created (new object)
    ↓
useStudioColumns receives new rightColumnProps
    ↓
rightColumns useMemo recalculates
    ↓
useEffect fires (rightColumns dependency changed)
    ↓
setActiveRightTab() called
    ↓
Hook state updates → triggers re-render
    ↓
LOOP: Back to step 1
```

---

### 3. rightColumnProps in useMemo Dependencies

**Location**: `useStudioColumns.js` (line ~202)

```javascript
const rightColumns = React.useMemo(() => {
  return buildRightColumns({
    // ... many props from rightColumnProps
  });
}, [
  isReaderMode,
  // ... other deps
  rightColumnProps,  // PROBLEM: Changes every render!
]);
```

---

### 4. navigateToBlock Function Instability

**Location**: `useStudioColumns.js` (lines ~47-52)

```javascript
const navigateToBlock = React.useCallback(
  (pageId, blockId) => {
    changePageById(pageId);
    hightBlock(blockId);
  },
  [changePageById, hightBlock]  // If these change, navigateToBlock changes
);
```

Used in both `leftColumns` and `rightColumns` useMemo dependencies, causing cascading recalculations.

---

### 5. useState Initialized with Computed Values

**Location**: `useStudioColumns.js` (lines ~206-207)

```javascript
const [activeLeftTab, setActiveLeftTab] = React.useState(leftColumns[0]);
const [activeRightTab, setActiveRightTab] = React.useState(rightColumns[0]);
```

**Issue**: useState only uses the initial value once. If columns change, state becomes stale but doesn't auto-update, leading to inconsistencies that trigger the useEffect sync logic.

---

## Fix Implementation Plan

### Phase 1: Memoize rightColumnProps in Studio.jsx (CRITICAL)

#### Step 1.1: Extract and memoize rightColumnProps

**Before:**
```javascript
const { leftColumns, rightColumns, ... } = useStudioColumns({
  // ...
  rightColumnProps: {
    areasProperties,
    setAreasProperties,
    // ... 25+ inline props
  },
});
```

**After:**
```javascript
// Memoize rightColumnProps to prevent new object reference every render
const rightColumnProps = useMemo(
  () => ({
    areasProperties,
    setAreasProperties,
    onEditText,
    onClickDeleteArea,
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
    compositeBlocks,
    compositeBlocksTypes,
    onChangeCompositeBlocks,
    processCompositeBlock,
    onSubmitCompositeBlocks,
    loadingSubmitCompositeBlocks,
    DeleteCompositeBlocks,
    highlight,
    setHighlight,
    setActivePageIndex,
    onClickHand,
  }),
  [
    areasProperties,
    setAreasProperties,
    onEditText,
    onClickDeleteArea,
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
    compositeBlocks,
    compositeBlocksTypes,
    onChangeCompositeBlocks,
    processCompositeBlock,
    onSubmitCompositeBlocks,
    loadingSubmitCompositeBlocks,
    DeleteCompositeBlocks,
    highlight,
    setHighlight,
    setActivePageIndex,
    onClickHand,
  ]
);

const { leftColumns, rightColumns, ... } = useStudioColumns({
  // ...
  rightColumnProps,
});
```

---

### Phase 2: Break the useEffect Dependency Cycle (CRITICAL)

#### Step 2.1: Use refs to track previous column values

**Before:**
```javascript
React.useEffect(() => {
  if (matchingColumn !== activeRightTab) {
    setActiveRightTab(matchingColumn);
  }
}, [rightColumns, activeRightTab]);
```

**After:**
```javascript
// Use ref to track if initial tab has been set
const initialRightTabSetRef = useRef(false);
const prevRightColumnsRef = useRef(rightColumns);

React.useEffect(() => {
  // Only update on initial mount or when columns structurally change
  const columnsChanged = prevRightColumnsRef.current !== rightColumns;
  prevRightColumnsRef.current = rightColumns;

  // Skip if columns reference changed but structure is same
  if (!initialRightTabSetRef.current) {
    initialRightTabSetRef.current = true;
    const defaultTab = rightColumns[0];
    if (defaultTab) {
      setActiveRightTab(defaultTab);
    }
    return;
  }

  // Only update if the current active tab no longer exists in columns
  if (columnsChanged && activeRightTab) {
    const tabStillExists = rightColumns.some(
      (col) => col.label === activeRightTab.label
    );
    if (!tabStillExists && rightColumns[0]) {
      setActiveRightTab(rightColumns[0]);
    }
  }
}, [rightColumns]);  // Remove activeRightTab from deps
```

#### Step 2.2: Alternative - Use lazy state initialization

```javascript
const [activeRightTab, setActiveRightTab] = React.useState(() => null);

// Set initial tab only once after columns are computed
React.useEffect(() => {
  if (activeRightTab === null && rightColumns.length > 0) {
    setActiveRightTab(rightColumns[0]);
  }
}, [rightColumns, activeRightTab]);
```

---

### Phase 3: Stabilize navigateToBlock and Related Functions

#### Step 3.1: Use refs for callback functions

```javascript
// Store in refs to avoid dependency changes
const changePageByIdRef = useRef(changePageById);
const hightBlockRef = useRef(hightBlock);

useEffect(() => {
  changePageByIdRef.current = changePageById;
  hightBlockRef.current = hightBlock;
});

const navigateToBlock = React.useCallback(
  (pageId, blockId) => {
    changePageByIdRef.current(pageId);
    hightBlockRef.current(blockId);
  },
  []  // Empty deps - always stable
);
```

---

### Phase 4: Remove rightColumnProps from useMemo Dependencies

#### Step 4.1: Destructure and use individual props

**Before:**
```javascript
const rightColumns = React.useMemo(() => {
  return buildRightColumns({
    ...rightColumnProps,
    // other props
  });
}, [isReaderMode, /* ... */, rightColumnProps]);
```

**After:**
```javascript
// Destructure props needed for column building
const {
  areasProperties,
  setAreasProperties,
  onEditText,
  // ... other needed props
} = rightColumnProps;

const rightColumns = React.useMemo(() => {
  return buildRightColumns({
    areasProperties,
    setAreasProperties,
    onEditText,
    // ... explicitly list each prop
  });
}, [
  isReaderMode,
  areasProperties,
  // Only include props that actually affect column structure
  // NOT callback functions that are stable
]);
```

---

### Phase 5: Optimize Column Building Functions

#### Step 5.1: Ensure buildRightColumns/buildLeftColumns are pure

In `columns/index.js`:

```javascript
// Ensure these functions don't create new objects unnecessarily
export const buildRightColumns = (props) => {
  // Only return new column definitions when structure changes
  // Avoid creating new objects/arrays inline
};
```

---

## Testing Strategy

### 1. Add Render Tracking

```javascript
// Add to useStudioColumns temporarily
const renderCount = useRef(0);
useEffect(() => {
  renderCount.current += 1;
  console.log(`useStudioColumns render: ${renderCount.current}`);
  console.log('rightColumnProps ref:', rightColumnProps);
});
```

### 2. Track useMemo Recalculations

```javascript
const rightColumns = React.useMemo(() => {
  console.log('rightColumns useMemo recalculating');
  return buildRightColumns({ ... });
}, [/* deps */]);
```

### 3. Manual Test Cases

| Test Case | Expected Result |
|-----------|-----------------|
| Open Studio component | Should render 1-2 times max |
| Switch tabs | Should not trigger infinite loop |
| Change page | Limited re-renders, no loop |
| Edit area properties | Controlled re-renders |

---

## Implementation Order

1. [ ] **Phase 1.1** - Memoize rightColumnProps in Studio.jsx
2. [ ] **Phase 2.1** - Fix useEffect dependency cycle with refs
3. [ ] **Phase 3.1** - Stabilize navigateToBlock with refs
4. [ ] **Phase 4.1** - Remove rightColumnProps from useMemo deps
5. [ ] **Phase 5.1** - Optimize column building functions (if still needed)

---

## Expected Outcome

After implementing these fixes:
- `useStudioColumns` will only recalculate columns when actual data changes
- Tab switching will not trigger infinite loops
- The useEffect hooks will fire only when necessary
- Studio component will have predictable, controlled re-renders

---

## Rollback Plan

If fixes cause regressions:
1. Revert changes one phase at a time
2. Test each phase independently
3. Use git stash to preserve work

---

## Related Issues

This fix may also help resolve:
- Slow page navigation in Studio
- Laggy area selection
- Memory issues from excessive re-renders
