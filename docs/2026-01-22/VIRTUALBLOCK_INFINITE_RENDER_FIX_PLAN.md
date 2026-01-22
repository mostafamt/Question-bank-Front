# VirtualBlock Infinite Rendering Bug - Fix Plan

## Problem Summary

The VirtualBlock components are rendering infinitely due to unstable prop references, missing memoization, and circular state update patterns.

## Affected Files

| File | Priority |
|------|----------|
| `src/components/VirtualBlocks/VirtualBlocks.jsx` | HIGH |
| `src/components/VirtualBlocks/VirtualBlock/VirtualBlock.jsx` | HIGH |
| `src/components/Modal/VirtualBlockContentModal/VirtualBlockContentModal.jsx` | MEDIUM |
| `src/components/Studio/StudioAreaSelector/StudioAreaSelector.jsx` | MEDIUM |
| `src/components/Studio/hooks/useVirtualBlocks.js` | LOW |

---

## Root Causes Identified

### 1. Inline Arrow Function in VirtualBlocks.jsx (Line ~26-30)

**Location**: `src/components/VirtualBlocks/VirtualBlocks.jsx`

```javascript
// PROBLEM: New function created every render
setCheckedObject={(value) => {
  const newVirtualBlocks = { ...virtualBlocks };
  newVirtualBlocks[label] = value;
  setVirtualBlocks(newVirtualBlocks);
}}
```

**Issue**: The `setCheckedObject` callback is created as a new arrow function on every render, causing all child `VirtualBlock` components to re-render.

---

### 2. Missing React.memo on VirtualBlocks Component

**Location**: `src/components/VirtualBlocks/VirtualBlocks.jsx`

The component is not wrapped with `React.memo()`, causing unnecessary re-renders when parent updates.

---

### 3. Object Reference Instability

**Location**: Multiple files

Props like `virtualBlocks`, `areasProperties`, and `compositeBlocks` are passed without memoization. Every parent render creates new object references.

---

### 4. Modal Callback Circular Update

**Location**: `VirtualBlock.jsx` and `VirtualBlockContentModal.jsx`

The modal's `onSave` callback triggers parent state update, which can cause immediate re-renders before modal properly unmounts.

---

### 5. Deep Object Dependencies in useCallback

**Location**: `VirtualBlock.jsx` (Line ~88)

```javascript
const handleLabelSelect = React.useCallback(
  (selectedLabel) => { ... },
  [label, checkedObject?.contents, openModal, handleSaveContents]
  // checkedObject?.contents changes every render
);
```

---

## Fix Implementation Plan

### Phase 1: Stabilize Callback References (HIGH PRIORITY)

#### Step 1.1: Fix setCheckedObject in VirtualBlocks.jsx

**Before:**
```javascript
setCheckedObject={(value) => {
  const newVirtualBlocks = { ...virtualBlocks };
  newVirtualBlocks[label] = value;
  setVirtualBlocks(newVirtualBlocks);
}}
```

**After:**
```javascript
// Create stable callback using useCallback
const createSetCheckedObject = useCallback(
  (label) => (value) => {
    setVirtualBlocks((prev) => ({
      ...prev,
      [label]: value,
    }));
  },
  [setVirtualBlocks]
);

// In render loop
setCheckedObject={createSetCheckedObject(label)}
```

Or use a Map/ref to cache callbacks per label:

```javascript
const setCheckedObjectCallbacks = useRef({});

const getSetCheckedObject = useCallback(
  (label) => {
    if (!setCheckedObjectCallbacks.current[label]) {
      setCheckedObjectCallbacks.current[label] = (value) => {
        setVirtualBlocks((prev) => ({
          ...prev,
          [label]: value,
        }));
      };
    }
    return setCheckedObjectCallbacks.current[label];
  },
  [setVirtualBlocks]
);
```

---

### Phase 2: Add Memoization (HIGH PRIORITY)

#### Step 2.1: Wrap VirtualBlocks with React.memo

```javascript
const VirtualBlocks = React.memo((props) => {
  // ... existing code
});

export default VirtualBlocks;
```

#### Step 2.2: Wrap VirtualBlock with React.memo

```javascript
const VirtualBlock = React.memo((props) => {
  // ... existing code
});

export default VirtualBlock;
```

#### Step 2.3: Add custom comparison function if needed

```javascript
const VirtualBlock = React.memo(
  (props) => { /* ... */ },
  (prevProps, nextProps) => {
    return (
      prevProps.label === nextProps.label &&
      prevProps.showVB === nextProps.showVB &&
      prevProps.reader === nextProps.reader &&
      // Deep compare checkedObject contents
      JSON.stringify(prevProps.checkedObject) === JSON.stringify(nextProps.checkedObject)
    );
  }
);
```

---

### Phase 3: Memoize Props (MEDIUM PRIORITY)

#### Step 3.1: Memoize virtualBlocks transformations

In parent component (StudioAreaSelector or wherever virtualBlocks originates):

```javascript
const memoizedVirtualBlocks = useMemo(
  () => virtualBlocks,
  [JSON.stringify(virtualBlocks)] // or use a deep comparison library
);
```

#### Step 3.2: Use functional updates for state

```javascript
// Instead of:
setVirtualBlocks({ ...virtualBlocks, [label]: value });

// Use:
setVirtualBlocks((prev) => ({ ...prev, [label]: value }));
```

---

### Phase 4: Fix Modal Callback Chain (MEDIUM PRIORITY)

#### Step 4.1: Update handleSaveContents in VirtualBlock.jsx

```javascript
const handleSaveContents = React.useCallback(
  (contents) => {
    // Close modal first
    closeModal();

    // Defer state update to next tick
    setTimeout(() => {
      setCheckedObject({
        contents: contents,
      });
    }, 0);
  },
  [setCheckedObject, closeModal]
);
```

Or use `requestAnimationFrame`:

```javascript
const handleSaveContents = React.useCallback(
  (contents) => {
    closeModal();
    requestAnimationFrame(() => {
      setCheckedObject({ contents });
    });
  },
  [setCheckedObject, closeModal]
);
```

---

### Phase 5: Optimize Dependency Arrays (LOW PRIORITY)

#### Step 5.1: Use specific properties instead of entire objects

```javascript
// Before:
const handleLabelSelect = React.useCallback(
  (selectedLabel) => { ... },
  [label, checkedObject?.contents, openModal, handleSaveContents]
);

// After - use ref for stable access
const checkedObjectContentsRef = useRef(checkedObject?.contents);
checkedObjectContentsRef.current = checkedObject?.contents;

const handleLabelSelect = React.useCallback(
  (selectedLabel) => {
    const existingContents = checkedObjectContentsRef.current || [];
    // ... rest of code
  },
  [label, openModal, handleSaveContents]  // Removed checkedObject?.contents
);
```

---

## Testing Strategy

### 1. Add Render Tracking (Debug Only)

```javascript
// Add to VirtualBlock.jsx temporarily
const renderCount = useRef(0);
useEffect(() => {
  renderCount.current += 1;
  console.log(`VirtualBlock [${label}] rendered: ${renderCount.current} times`);
});
```

### 2. Use React DevTools Profiler

- Open React DevTools
- Go to Profiler tab
- Record while interacting with VirtualBlocks
- Check for excessive re-renders

### 3. Manual Test Cases

| Test Case | Expected Result |
|-----------|-----------------|
| Open page with VirtualBlocks | Should render once per block |
| Toggle showVB | Should re-render once |
| Save content in modal | Should update only affected block |
| Navigate between pages | Should not render infinitely |

---

## Implementation Order

1. [ ] **Phase 1.1** - Fix setCheckedObject inline function
2. [ ] **Phase 2.1** - Add React.memo to VirtualBlocks
3. [ ] **Phase 2.2** - Add React.memo to VirtualBlock
4. [ ] **Phase 3.2** - Use functional updates for state
5. [ ] **Phase 4.1** - Fix modal callback chain
6. [ ] **Phase 3.1** - Memoize virtualBlocks props
7. [ ] **Phase 2.3** - Add custom comparison if still needed
8. [ ] **Phase 5.1** - Optimize dependency arrays

---

## Rollback Plan

If fixes cause regressions:

1. Revert to previous commit
2. Apply fixes incrementally
3. Test each phase separately

---

## Success Criteria

- VirtualBlock components render only when their data changes
- No infinite loops in React DevTools Profiler
- Modal interactions complete without excessive re-renders
- Page navigation works smoothly without freezing
