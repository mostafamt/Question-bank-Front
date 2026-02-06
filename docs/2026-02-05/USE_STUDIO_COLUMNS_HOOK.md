# useStudioColumns Hook Documentation

## Overview

`useStudioColumns` is a custom React hook that manages the column configurations and tab state for the Studio component. It handles building both left and right panel columns for Studio mode and Reader mode.

**File Location:** `src/components/Studio/hooks/useStudioColumns.js`

---

## Purpose

The hook centralizes complex column-building logic that was previously in `Studio.jsx`. It:

1. Builds left and right column configurations based on mode (Studio/Reader)
2. Manages active tab state for both panels
3. Provides stable callback references to prevent unnecessary re-renders
4. Handles the tricky problem of stale closures with memoized values

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           useStudioColumns                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐   │
│  │   Input Props    │───▶│   Refs Layer     │───▶│  Memoized Values │   │
│  └──────────────────┘    └──────────────────┘    └──────────────────┘   │
│          │                       │                        │              │
│          │                       │                        ▼              │
│          │               ┌───────┴───────┐      ┌──────────────────┐    │
│          │               │               │      │   leftColumns    │    │
│          │               ▼               ▼      │   rightColumns   │    │
│          │         Stable Refs    Fresh Values  └──────────────────┘    │
│          │         (callbacks)    (from props)          │               │
│          │               │               │              │               │
│          │               └───────┬───────┘              ▼               │
│          │                       │              ┌──────────────────┐    │
│          │                       ▼              │    Tab State     │    │
│          │              ┌──────────────────┐    │  activeLeftTab   │    │
│          │              │  buildColumns()  │    │  activeRightTab  │    │
│          │              └──────────────────┘    └──────────────────┘    │
│          │                                               │              │
│          └───────────────────────────────────────────────┘              │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Input Parameters

```javascript
const useStudioColumns = ({
  isReaderMode,        // Boolean: Reader mode vs Studio mode
  pages,               // Array: Book pages
  activePageIndex,     // Number: Currently active page
  chapterId,           // String: Current chapter ID
  thumbnailsRef,       // Ref: Reference to thumbnails component
  changePageByIndex,   // Function: Navigate by page index
  changePageById,      // Function: Navigate by page ID
  getBlockFromBlockId, // Function: Get block data by ID
  hightBlock,          // Function: Highlight a block
  rightColumnProps,    // Object: Props for right column components
}) => { ... }
```

---

## Return Values

```javascript
return {
  // Column configurations (arrays of tab objects)
  leftColumns,         // Array: Left panel tabs
  rightColumns,        // Array: Right panel tabs

  // Tab state
  activeLeftTab,       // Object: Currently active left tab
  setActiveLeftTab,    // Function: Set active left tab
  activeRightTab,      // Object: Currently active right tab
  setActiveRightTab,   // Function: Set active right tab

  // Helper functions
  navigateToBlock,     // Function: Navigate to specific block
  setActivePage,       // Function: Set active page from page object
};
```

---

## Key Concepts

### 1. Refs for Stable Callbacks

The hook uses refs to store callback functions, preventing them from being dependencies in `useMemo`:

```javascript
// Store callback in ref
const changePageByIdRef = useRef(changePageById);

// Update ref when callback changes
useEffect(() => {
  changePageByIdRef.current = changePageById;
}, [changePageById]);

// Use ref.current in memoized values (stable reference)
const leftColumns = useMemo(() => {
  return buildLeftColumns({
    changePageById: changePageByIdRef.current,  // Won't cause re-memo
  });
}, [/* changePageById NOT in deps */]);
```

**Why?** Callbacks often have new references on every render. Using refs prevents `useMemo` from recalculating when only the callback reference changes (but not its behavior).

### 2. Two-Tier Props Strategy

For `rightColumnProps`, the hook uses a two-tier strategy:

```
┌─────────────────────────────────────────────────────────────────┐
│                     rightColumnProps                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────┐    ┌─────────────────────────────────┐ │
│  │   FROM REF (Stable) │    │   FROM PROPS (Fresh Values)    │ │
│  │   rightColumnPropsRef    │   rightColumnProps directly     │ │
│  ├─────────────────────┤    ├─────────────────────────────────┤ │
│  │ • setAreasProperties│    │ • areasProperties               │ │
│  │ • type              │    │ • compositeBlocks               │ │
│  │ • types             │    │ • loadingSubmit                 │ │
│  │ • subObject         │    │ • loadingSubmitCompositeBlocks  │ │
│  │ • tOfActiveType     │    │ • showVB                        │ │
│  │ • compositeBlocksTypes   │ • highlight                     │ │
│  │ • setHighlight      │    │ • loadingAutoGenerate           │ │
│  │ • setActivePageIndex│    │ • onClickDeleteArea             │ │
│  │ • onSubmitAutoGenerate   │ • updateAreaProperty            │ │
│  │ • onChangeCompositeBlocks│ • updateAreaPropertyById        │ │
│  │ • processCompositeBlock  │ • onEditText                    │ │
│  │ • onSubmitCompositeBlocks│ • onClickSubmit                 │ │
│  │ • DeleteCompositeBlocks  │ • onChangeLabel                 │ │
│  │                     │    │ • onClickToggleVirutalBlocks    │ │
│  │                     │    │ • onClickHand                   │ │
│  └─────────────────────┘    └─────────────────────────────────┘ │
│                                                                  │
│  WHY STABLE?                WHY FRESH?                          │
│  • Setters don't change     • Callbacks use activePageIndex     │
│  • Config values are static • State values change frequently    │
│  • Don't need fresh values  • Need latest closure values        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 3. Tab State Synchronization

The hook maintains tab state and syncs it when columns change:

```javascript
// Initial state from first column
const [activeLeftTab, setActiveLeftTab] = useState(
  () => leftColumns[0] || null
);

// Sync when columns rebuild
useEffect(() => {
  if (!leftColumns.length) return;

  // Find same tab by label (not reference)
  const next = leftColumns.find(
    (col) => col.label === activeLeftTabLabelRef.current
  ) || leftColumns[0];

  // Only update if label actually changed
  if (next.label !== activeLeftTabLabelRef.current) {
    setActiveLeftTab(next);
  }
}, [leftColumns]);
```

**Why compare by label?** Column objects are recreated on each `useMemo` recalculation. Comparing by label (value) instead of object reference prevents unnecessary state updates.

---

## Data Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────────┐
│ Studio.jsx  │────▶│useStudio    │────▶│ StudioLayout    │
│             │     │Columns      │     │                 │
│ • pages     │     │             │     │ • leftColumns   │
│ • activeIdx │     │ Builds      │     │ • rightColumns  │
│ • callbacks │     │ columns     │     │ • activeTab     │
│ • props     │     │ config      │     │                 │
└─────────────┘     └─────────────┘     └─────────────────┘
       │                   │                    │
       │                   ▼                    │
       │          ┌─────────────────┐           │
       │          │ buildLeftColumns│           │
       │          │ buildRightColumns           │
       │          └─────────────────┘           │
       │                   │                    │
       │                   ▼                    │
       │          ┌─────────────────┐           │
       │          │ Column Config   │           │
       │          │ { label, icon,  │           │
       │          │   component,    │───────────┘
       │          │   props }       │
       └──────────└─────────────────┘
```

---

## Mode-Based Column Building

### Studio Mode
```javascript
if (!isReaderMode) {
  leftColumns = buildLeftColumns({...});   // Thumbnails, Recalls, etc.
  rightColumns = buildRightColumns({...}); // Block Authoring, Composite Blocks, etc.
}
```

### Reader Mode
```javascript
if (isReaderMode) {
  leftColumns = buildReaderLeftColumns({...});   // Simplified navigation
  rightColumns = buildReaderRightColumns({...}); // Reading-focused tabs
}
```

---

## Dependency Arrays Explained

### leftColumns Dependencies
```javascript
useMemo(() => {...}, [
  isReaderMode,      // Rebuild when mode changes
  pages,             // Rebuild when pages change
  activePageIndex,   // Rebuild when page changes
  chapterId,         // Rebuild when chapter changes
  thumbnailsRef,     // Rebuild when ref changes
  setActivePage,     // Stable (useCallback with [])
  navigateToBlock,   // Stable (useCallback with [])
]);
```

### rightColumns Dependencies
```javascript
useMemo(() => {...}, [
  isReaderMode,
  pages,
  activePageIndex,
  chapterId,
  setActivePage,
  navigateToBlock,
  // Frequently changing props (need fresh values)
  rightColumnProps.areasProperties,
  rightColumnProps.compositeBlocks,
  rightColumnProps.loadingSubmit,
  rightColumnProps.showVB,
  rightColumnProps.highlight,
  // ... callbacks that capture activePageIndex
  rightColumnProps.onClickDeleteArea,
  rightColumnProps.updateAreaProperty,
  // ... etc
]);
```

---

## Common Issues & Solutions

### Issue 1: Stale Closure Values

**Problem:** Callback has old `activePageIndex` value.

**Solution:** Add callback to dependency array and read from `rightColumnProps` directly:
```javascript
const { onClickDeleteArea } = rightColumnProps; // Fresh value
// NOT: const { onClickDeleteArea } = props;    // Stale from ref
```

### Issue 2: Infinite Re-renders

**Problem:** `useMemo` keeps recalculating.

**Solution:** Use refs for callbacks, compare tabs by label not reference.

### Issue 3: Tab Resets on Column Rebuild

**Problem:** Active tab jumps to first tab when columns rebuild.

**Solution:** Find matching tab by label before updating state:
```javascript
const next = columns.find(col => col.label === currentLabel) || columns[0];
```

---

## Usage Example

```javascript
// In Studio.jsx
const {
  leftColumns,
  rightColumns,
  activeLeftTab,
  setActiveLeftTab,
  activeRightTab,
  setActiveRightTab,
} = useStudioColumns({
  isReaderMode,
  pages,
  activePageIndex,
  chapterId,
  thumbnailsRef,
  changePageByIndex,
  changePageById,
  getBlockFromBlockId,
  hightBlock,
  rightColumnProps,  // Memoized object with all right column props
});

// Pass to StudioLayout
<StudioLayout
  leftColumns={leftColumns}
  rightColumns={rightColumns}
  activeLeftTab={activeLeftTab}
  setActiveLeftTab={setActiveLeftTab}
  activeRightTab={activeRightTab}
  setActiveRightTab={setActiveRightTab}
  // ...
/>
```

---

## Performance Considerations

1. **Refs over Dependencies:** Using refs for callbacks reduces `useMemo` recalculations
2. **Selective Fresh Values:** Only props that actually change are in dependency array
3. **Label-Based Comparison:** Prevents state updates when only object references change
4. **Lazy State Initialization:** `useState(() => ...)` avoids computing initial value on every render

---

## Related Files

| File | Description |
|------|-------------|
| `src/components/Studio/columns/index.js` | Column builder functions |
| `src/components/Studio/Studio.jsx` | Main component using this hook |
| `src/components/Studio/components/StudioLayout.jsx` | Renders the columns |
| `src/components/Studio/constants/tabs.constants.js` | Tab name constants |
