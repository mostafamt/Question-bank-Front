# ListItem Up/Down Navigation Implementation Plan

## Overview

Implement up/down navigation functionality in the `ListItem` component, similar to the existing implementation in `GlossaryAndKeywords` component. This will allow users to navigate to specific blocks on pages and highlight them when clicking the up/down arrow buttons.

## Current State Analysis

### GlossaryAndKeywords Component (Reference Implementation)

**Location:** `src/components/Tabs/GlossaryAndKeywords/GlossaryAndKeywords.jsx`

**Current Implementation:**
```javascript
const onClickUp = (event, references) => {
  event.stopPropagation();
  const { pageId, blockId } = references?.[0];
  changePageById(pageId);
  const blockDetails = getBlockFromBlockId(blockId);
  hightBlock(blockId);
};

const onClickDown = (event, references) => {
  event.stopPropagation();
  const { pageId, blockId } = references?.[0];
  changePageById(pageId);
  const blockDetails = getBlockFromBlockId(blockId);
  hightBlock(blockId);
};
```

**Props Received:**
- `chapterId` - Chapter identifier
- `changePageById` - Function to navigate to a specific page
- `getBlockFromBlockId` - Function to retrieve block details by ID
- `hightBlock` - Function to highlight a block

**Data Structure:**
Items have a `references` array with structure:
```javascript
{
  term: "...",
  definition: "...",
  references: [
    {
      pageId: "...",
      blockId: "..."
    }
  ]
}
```

### ListItem Component (Target Implementation)

**Location:** `src/components/Tabs/ListItem/ListItem.jsx`

**Current State:**
- ✅ UI already has NorthIcon and SouthIcon buttons
- ❌ onClick handlers are empty: `onClick={() => {}}`
- ❌ No navigation/highlighting functionality

**Props Received:**
- `item` - Object with _id, name, type properties
- `onPlay` - Function to play/preview the item
- `onDelete` - Function to delete the item
- `reader` - Boolean flag for read-only mode

**Missing:**
- `onMoveUp` callback prop
- `onMoveDown` callback prop

### List Component (Parent of ListItem)

**Location:** `src/components/Tabs/List/List.jsx`

**Current State:**
- ✅ Has `handlePlay` and `handleDelete` callbacks
- ❌ Missing `handleMoveUp` and `handleMoveDown` callbacks
- ❌ Doesn't receive navigation props from parent

**Props Received:**
- `tabName` - Tab identifier (Recalls, Micro Learning, etc.)
- `chapterId` - Chapter identifier
- `reader` - Boolean flag for read-only mode

**Missing:**
- `changePageById`
- `getBlockFromBlockId`
- `hightBlock`

### BookTabsLayout (Parent of List)

**Location:** `src/layouts/BookTabsLayout/BookTabsLayout.jsx`

**Current State:**
- Has access to `setActivePage` and `onChangeActivePage`
- Doesn't have `changePageById`, `getBlockFromBlockId`, `hightBlock` functions
- These functions exist in **Studio component** context

**Props Available:**
- `pages` - Array of page objects
- `chapterId` - Chapter identifier
- `activePage` - Current active page index
- `setActivePage` - Function to set active page
- `onChangeActivePage` - Callback for page change

## Problem Analysis

### Key Issues

1. **Missing Navigation Functions:**
   - `changePageById`, `getBlockFromBlockId`, `hightBlock` only exist in Studio component
   - BookTabsLayout (reader mode) doesn't have these functions
   - Need to implement or adapt these for BookTabsLayout context

2. **Data Structure Uncertainty:**
   - Tab objects (recalls, micro-los, etc.) may or may not have `references` property
   - Need to verify API response structure from `getTabObjects(chapterId, tabName)`
   - If references don't exist, navigation won't be possible

3. **Props Propagation Chain:**
   - Need to thread navigation functions through multiple component levels:
     - BookTabsLayout → List → ListItem

4. **Up vs Down Distinction:**
   - In GlossaryAndKeywords, both functions are identical
   - Need to clarify intended behavior difference
   - Possible interpretations:
     - Navigate to first/last reference
     - Navigate to previous/next reference in sequence
     - Both just navigate to the reference (current behavior)

## Implementation Plan

### Phase 1: Data Structure Verification ✓ PREREQUISITE

**Goal:** Confirm that tab objects have references with pageId and blockId

**Tasks:**
1. Check API response from `getTabObjects()` for sample data
2. Verify objects have `references` array property
3. Verify references contain `pageId` and `blockId` fields
4. Document actual data structure

**Verification Method:**
```javascript
// In List.jsx, add logging:
console.log("Sample tab object structure:", tabObjects?.[0]);
```

**Decision Point:**
- ✅ If references exist → Proceed with implementation
- ❌ If references don't exist → Cannot implement navigation (feature not supported by backend)

### Phase 2: Create Navigation Functions in BookTabsLayout

**Goal:** Implement the navigation helper functions needed for up/down functionality

**Files to Modify:**
- `src/layouts/BookTabsLayout/BookTabsLayout.jsx`

**Implementation:**

```javascript
// Add these functions to BookTabsLayout component

const changePageById = (pageId) => {
  if (!pageId || !newPages) return;

  const pageIndex = newPages.findIndex((page) => page._id === pageId);

  if (pageIndex === -1) {
    console.warn(`Page with id "${pageId}" not found`);
    return;
  }

  setActivePage(pageIndex);
  if (onChangeActivePage) {
    onChangeActivePage(pageIndex);
  }
};

// Note: In reader mode (BookTabsLayout), we don't have areas state
// So getBlockFromBlockId and hightBlock may not be applicable
// These would need the areas/areasProperties state from Studio

// Simplified version without highlighting:
const navigateToBlock = (pageId, blockId) => {
  changePageById(pageId);
  // Highlighting would require implementing a block highlighting system
  // in the book reader view (currently only exists in Studio)
  console.log(`Navigated to block ${blockId} on page ${pageId}`);
};
```

**Alternative Approach:**
If highlighting is essential, we may need to:
1. Add areas state management to BookTabsLayout
2. Fetch block data for pages
3. Implement a lightweight highlighting mechanism

**Recommended:** Start with navigation only (no highlighting) for reader mode

### Phase 3: Update List Component

**Goal:** Add up/down handler callbacks and pass navigation functions down

**Files to Modify:**
- `src/components/Tabs/List/List.jsx`

**Changes:**

1. **Add new props to List component:**
```javascript
const List = (props) => {
  const {
    tabName,
    chapterId,
    reader,
    changePageById,      // NEW
    navigateToBlock,     // NEW
  } = props;
```

2. **Add handler functions:**
```javascript
const handleMoveUp = React.useCallback(
  (item) => {
    if (!item?.references?.length) {
      console.warn("Item has no references:", item);
      return;
    }

    const { pageId, blockId } = item.references[0];

    if (navigateToBlock) {
      navigateToBlock(pageId, blockId);
    } else if (changePageById) {
      changePageById(pageId);
    }
  },
  [navigateToBlock, changePageById]
);

const handleMoveDown = React.useCallback(
  (item) => {
    if (!item?.references?.length) {
      console.warn("Item has no references:", item);
      return;
    }

    // Currently identical to handleMoveUp
    // Could be enhanced to navigate to last reference or next reference
    const { pageId, blockId } = item.references[0];

    if (navigateToBlock) {
      navigateToBlock(pageId, blockId);
    } else if (changePageById) {
      changePageById(pageId);
    }
  },
  [navigateToBlock, changePageById]
);
```

3. **Pass handlers to ListItem:**
```javascript
return objects.map((item) => (
  <ListItem
    key={item._id}
    item={item}
    onPlay={() => handlePlay(item)}
    onDelete={() => handleDelete(item._id)}
    onMoveUp={() => handleMoveUp(item)}      // NEW
    onMoveDown={() => handleMoveDown(item)}  // NEW
    reader={reader}
  />
));
```

### Phase 4: Update ListItem Component

**Goal:** Connect up/down buttons to handler functions

**Files to Modify:**
- `src/components/Tabs/ListItem/ListItem.jsx`

**Changes:**

1. **Add new props:**
```javascript
const ListItem = ({
  item,
  onPlay,
  onDelete,
  onMoveUp,    // NEW
  onMoveDown,  // NEW
  reader
}) => {
```

2. **Connect buttons to handlers:**
```javascript
<span className={styles["up-down"]}>
  <IconButton
    onClick={(e) => {
      e.stopPropagation();
      onMoveUp?.();
    }}
    disabled={!item?.references?.length}  // Disable if no references
  >
    <NorthIcon />
  </IconButton>
  <IconButton
    onClick={(e) => {
      e.stopPropagation();
      onMoveDown?.();
    }}
    disabled={!item?.references?.length}  // Disable if no references
  >
    <SouthIcon />
  </IconButton>
</span>
```

3. **Optional: Add visual feedback when disabled**
```javascript
// Add to styles or use sx prop
disabled={!item?.references?.length}
sx={{
  opacity: item?.references?.length ? 1 : 0.3,
  cursor: item?.references?.length ? 'pointer' : 'not-allowed'
}}
```

### Phase 5: Update BookTabsLayout Props

**Goal:** Pass navigation functions to List components

**Files to Modify:**
- `src/layouts/BookTabsLayout/BookTabsLayout.jsx`

**Changes:**

Update all List component instantiations:

```javascript
const LEFT_COLUMNS = [
  // ... thumbnails column
  {
    id: uuidv4(),
    label: "Recalls",
    position: LEFT_POSITION,
    component: (
      <List
        chapterId={chapterId}
        tabName={RECALLS}
        reader
        changePageById={changePageById}      // NEW
        navigateToBlock={navigateToBlock}    // NEW
      />
    ),
  },
  {
    id: uuidv4(),
    label: "Micro Learning",
    position: LEFT_POSITION,
    component: (
      <List
        chapterId={chapterId}
        tabName={MICRO_LEARNING}
        reader
        changePageById={changePageById}      // NEW
        navigateToBlock={navigateToBlock}    // NEW
      />
    ),
  },
  {
    id: uuidv4(),
    label: "Enriching Contents",
    position: LEFT_POSITION,
    component: (
      <List
        chapterId={chapterId}
        tabName={ENRICHING_CONTENT}
        reader
        changePageById={changePageById}      // NEW
        navigateToBlock={navigateToBlock}    // NEW
      />
    ),
  },
];

const RIGHT_COLUMNS = [
  // ... table of contents
  {
    id: uuidv4(),
    label: "Glossary & keywords",
    position: LEFT_POSITION,
    component: (
      <GlossaryAndKeywords
        chapterId={chapterId}
        changePageById={changePageById}      // NEW
        navigateToBlock={navigateToBlock}    // NEW
      />
    ),
  },
  {
    id: uuidv4(),
    label: "Illustrative Interactions",
    position: LEFT_POSITION,
    component: (
      <List
        chapterId={chapterId}
        tabName={ILLUSTRATIVE_INTERACTIONS}
        reader
        changePageById={changePageById}      // NEW
        navigateToBlock={navigateToBlock}    // NEW
      />
    ),
  },
  {
    id: uuidv4(),
    label: "Check Yourself",
    position: LEFT_POSITION,
    component: (
      <List
        chapterId={chapterId}
        tabName={CHECK_YOURSELF}
        reader
        changePageById={changePageById}      // NEW
        navigateToBlock={navigateToBlock}    // NEW
      />
    ),
  },
];
```

### Phase 6: Update GlossaryAndKeywords (Optional Consistency)

**Goal:** Update GlossaryAndKeywords to use the same navigation functions

**Files to Modify:**
- `src/components/Tabs/GlossaryAndKeywords/GlossaryAndKeywords.jsx`

**Changes:**

1. **Update props:**
```javascript
const GlossaryAndKeywords = (props) => {
  const {
    chapterId,
    changePageById,      // Already exists (currently not passed)
    getBlockFromBlockId, // Already exists (currently not passed)
    hightBlock,          // Already exists (currently not passed)
    navigateToBlock,     // NEW alternative
  } = props;
```

2. **Update handlers to use new navigation function if available:**
```javascript
const onClickUp = (event, references) => {
  event.stopPropagation();
  const { pageId, blockId } = references?.[0];

  if (navigateToBlock) {
    navigateToBlock(pageId, blockId);
  } else {
    // Fallback to existing implementation
    changePageById(pageId);
    const blockDetails = getBlockFromBlockId(blockId);
    hightBlock(blockId);
  }
};
```

## Enhanced Features (Optional)

### Feature 1: Multiple References Navigation

If items have multiple references, differentiate up/down behavior:

```javascript
const handleMoveUp = (item) => {
  if (!item?.references?.length) return;

  // Navigate to FIRST reference
  const { pageId, blockId } = item.references[0];
  navigateToBlock(pageId, blockId);
};

const handleMoveDown = (item) => {
  if (!item?.references?.length) return;

  // Navigate to LAST reference
  const lastIndex = item.references.length - 1;
  const { pageId, blockId } = item.references[lastIndex];
  navigateToBlock(pageId, blockId);
};
```

### Feature 2: Sequential Reference Navigation

Maintain state for current reference index:

```javascript
const [currentReferenceIndex, setCurrentReferenceIndex] = React.useState(0);

const handleMoveUp = (item) => {
  if (!item?.references?.length) return;

  // Navigate to PREVIOUS reference
  const newIndex = Math.max(0, currentReferenceIndex - 1);
  setCurrentReferenceIndex(newIndex);

  const { pageId, blockId } = item.references[newIndex];
  navigateToBlock(pageId, blockId);
};

const handleMoveDown = (item) => {
  if (!item?.references?.length) return;

  // Navigate to NEXT reference
  const newIndex = Math.min(
    item.references.length - 1,
    currentReferenceIndex + 1
  );
  setCurrentReferenceIndex(newIndex);

  const { pageId, blockId } = item.references[newIndex];
  navigateToBlock(pageId, blockId);
};
```

### Feature 3: Visual Highlighting in Reader Mode

Implement block highlighting for BookTabsLayout (requires significant work):

1. Add areas state management to BookTabsLayout
2. Fetch block coordinates from API
3. Create overlay component for highlighting
4. Manage highlighted block ID state
5. Clear highlight after timeout or user action

### Feature 4: Smooth Scrolling to Block

After navigation, scroll to the block position:

```javascript
const navigateToBlock = (pageId, blockId) => {
  changePageById(pageId);

  // Wait for page to render, then scroll
  setTimeout(() => {
    const blockElement = document.querySelector(`[data-block-id="${blockId}"]`);
    if (blockElement) {
      blockElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, 300);
};
```

## Testing Plan

### Test Cases

1. **Basic Navigation**
   - ✓ Click up button navigates to correct page
   - ✓ Click down button navigates to correct page
   - ✓ Buttons are disabled when item has no references
   - ✓ Navigation works for all tab types (Recalls, Micro Learning, etc.)

2. **Edge Cases**
   - ✓ Item with no references - buttons disabled
   - ✓ Item with invalid pageId - graceful error handling
   - ✓ Item with invalid blockId - graceful error handling
   - ✓ Empty references array - buttons disabled

3. **Reader Mode**
   - ✓ Navigation works in reader mode (read-only)
   - ✓ No console errors in reader mode

4. **Interaction**
   - ✓ Event propagation is stopped (doesn't trigger parent onClick)
   - ✓ Multiple rapid clicks don't break navigation
   - ✓ Navigation during ongoing navigation is handled

### Manual Testing Steps

1. Load a book with chapters
2. Open a tab (e.g., "Recalls")
3. Verify items are displayed with up/down buttons
4. Click up button on an item with references
5. Verify page changes to correct page
6. Click down button
7. Verify behavior matches expectations
8. Test with items without references
9. Verify buttons are disabled/non-functional

## Considerations & Limitations

### Current Limitations

1. **No Block Highlighting in Reader Mode**
   - Studio component has highlighting via `hightBlock()` and `highlightedBlockId` state
   - Reader mode (BookTabsLayout) doesn't have this infrastructure
   - Navigation will work, but visual highlighting won't

2. **Up/Down Behavior Identical**
   - Currently both buttons do the same thing (navigate to first reference)
   - Need product decision on desired behavior difference

3. **Data Dependency**
   - Feature only works if backend provides `references` array
   - If data doesn't exist, feature cannot be implemented

4. **Context Differences**
   - Studio context: Has areas, can highlight blocks
   - Reader context: No areas, no highlighting capability
   - Implementation needs to handle both contexts

### Recommended Approach

**MVP (Minimum Viable Product):**
- Navigation only (no highlighting)
- Both up/down navigate to first reference
- Graceful degradation when references missing

**Future Enhancements:**
- Add highlighting to reader mode
- Implement different up/down behaviors
- Add smooth scrolling to blocks
- Support multiple references navigation

## Files Summary

### Files to Modify
1. `src/layouts/BookTabsLayout/BookTabsLayout.jsx` - Add navigation functions
2. `src/components/Tabs/List/List.jsx` - Add move handlers, pass to ListItem
3. `src/components/Tabs/ListItem/ListItem.jsx` - Connect buttons to handlers
4. `src/components/Tabs/GlossaryAndKeywords/GlossaryAndKeywords.jsx` - Optional: Update to use new navigation

### Files to Reference
- `src/components/Studio/Studio.jsx` - Reference for `changePageById`, `getBlockFromBlockId`, `hightBlock` implementations

## Implementation Order

1. **Phase 1** - Verify data structure (MUST DO FIRST)
2. **Phase 2** - Implement navigation functions in BookTabsLayout
3. **Phase 4** - Update ListItem component (can do in parallel with Phase 3)
4. **Phase 3** - Update List component
5. **Phase 5** - Connect everything in BookTabsLayout
6. **Phase 6** - Optional: Update GlossaryAndKeywords for consistency

## Success Criteria

- ✅ Up/down buttons in ListItem are functional
- ✅ Clicking buttons navigates to correct page
- ✅ Buttons are disabled when no references available
- ✅ No console errors or warnings
- ✅ Feature works in both Studio and Reader contexts
- ✅ Code follows existing patterns from GlossaryAndKeywords
- ✅ Graceful handling of missing data

## Open Questions

1. **Should up/down buttons behave differently?**
   - Current: Both navigate to first reference
   - Option A: Up = first reference, Down = last reference
   - Option B: Up = previous reference, Down = next reference
   - Option C: Keep identical (simplest)

2. **Should we implement highlighting in reader mode?**
   - Requires significant additional work
   - May not be necessary for MVP
   - Could be future enhancement

3. **What if tab objects don't have references property?**
   - Feature cannot be implemented
   - Need backend API update first
   - Should we request this from backend team?

4. **Should we update GlossaryAndKeywords to use new navigation functions?**
   - For consistency across components
   - Optional, not strictly necessary
   - Depends on time/priority

---

**Created:** 2025-11-20
**Status:** Ready for Review
**Priority:** Medium
**Estimated Effort:** 4-6 hours (MVP), 8-12 hours (with highlighting)
