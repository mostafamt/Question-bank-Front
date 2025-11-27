# Book Reader - Block Highlighting Implementation Plan

## Overview

Implement dynamic block highlighting in the Book reader (Book.jsx) by removing the static `highlightedBlockId` value and connecting it to the navigation system. When users click up/down arrows in tabs, the referenced block will be highlighted visually on the page.

## Current State Analysis

### What Already Exists

#### 1. Book.jsx (Lines 22-24)
```javascript
const [highlightedBlockId, setHighlightedBlockId] = React.useState(
  "68f0f2f475f84100046d0548"  // ❌ Static hardcoded value
);
```
- ✅ State exists
- ❌ Has static/hardcoded value
- ✅ Passed to InnerComponent (line 128)

#### 2. Areas State (Lines 26-43)
```javascript
const [areas, setAreas] = React.useState(
  pages?.map((page) =>
    page.blocks?.map((block) => ({
      id: block.blockId,
      x: block.coordinates.x,
      y: block.coordinates.y,
      width: block.coordinates.width,
      height: block.coordinates.height,
      unit: "px",
      isChanging: true,
      isNew: true,
      _unit: block.coordinates.unit,
      _updated: false,
    }))
  ) || Array(pages?.length || 1).fill([])
);
```
- ✅ Areas state exists with block data
- ✅ Includes `id` property (from `block.blockId`)

#### 3. BookViewer.jsx (Lines 60-65)
```javascript
console.log("highlightedBlockId= ", highlightedBlockId);
console.log("area= ", area);
if (area.blockId === highlightedBlockId) {
  console.log("founded block");
  newArea = { ...newArea, border: "2px solid #000" };
}
```
- ✅ Highlighting logic exists
- ✅ Applies border style when `area.blockId === highlightedBlockId`
- ⚠️ Uses simple 2px border (Studio uses 4px + background color)

#### 4. Navigation System (Previous Implementation)
```javascript
// BookTabsLayout.jsx
const navigateToBlock = React.useCallback((pageId, blockId) => {
  changePageById(pageId);
  console.log(`Navigated to block ${blockId} on page ${pageId}`);
}, [changePageById]);
```
- ✅ Navigation functions exist
- ❌ Don't call highlighting function (just console.log)

### Studio Implementation Reference

#### Studio's hightBlock Function (Studio.jsx:248-265)
```javascript
const hightBlock = (id) => {
  if (!id) return;

  // Find the block
  const block = getBlockFromBlockId(id);
  if (!block) return;

  setHighlightedBlockId(id);
};
```

#### Studio's Highlighting Style (ocr.js:102-108)
```javascript
if (trialArea.id === highlightedBlockId) {
  return {
    [values[idx]]: {
      border: `4px solid ${"#000"} !important`,
      backgroundColor: `${hexToRgbA("#000")}`,
    },
  };
}
```
- Uses 4px border
- Adds semi-transparent background color
- More prominent visual feedback

## Problems to Solve

### 1. Static highlightedBlockId Value
**Problem:** Line 22-24 in Book.jsx has hardcoded value
**Impact:** Always highlights the same block regardless of navigation
**Solution:** Initialize with `null` instead

### 2. Missing hightBlock Function
**Problem:** No function to update `highlightedBlockId`
**Impact:** Navigation system can't trigger highlighting
**Solution:** Create `hightBlock` function in Book.jsx

### 3. Missing getBlockFromBlockId Function
**Problem:** Need to find blocks across all pages
**Impact:** Can't validate block exists before highlighting
**Solution:** Create `getBlockFromBlockId` function in Book.jsx

### 4. BookTabsLayout Doesn't Receive Highlighting Functions
**Problem:** `navigateToBlock` only changes page, doesn't highlight
**Impact:** Clicking up/down navigates but doesn't highlight
**Solution:** Pass highlighting functions to BookTabsLayout

### 5. No Auto-Clear Mechanism
**Problem:** Highlight stays forever after navigation
**Impact:** Confusing UX - user doesn't know when to stop looking
**Solution:** Add timeout to clear highlight after N seconds

### 6. Weak Visual Feedback
**Problem:** BookViewer uses simple 2px border
**Impact:** Highlight might not be noticeable enough
**Solution:** Enhance highlighting style to match Studio (4px + background)

### 7. Areas State Initialization
**Problem:** Areas state initializes with data but might be stale
**Impact:** If pages change, areas might not update
**Solution:** Add useEffect to update areas when pages change

## Implementation Plan

### Phase 1: Create Helper Functions in Book.jsx ✓

**Goal:** Add the necessary functions to support block highlighting

**File:** `src/pages/Book/Book.jsx`

#### Task 1.1: Create getBlockFromBlockId Function

**Add after onChangeActivePage function (around line 99):**

```javascript
/**
 * Find a block by its ID across all pages
 * @param {string} blockId - The block ID to search for
 * @returns {Object|null} Block object with pageIndex or null if not found
 */
const getBlockFromBlockId = React.useCallback(
  (blockId) => {
    if (!blockId || !pages?.length) return null;

    // Search through all pages
    for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
      const block = pages[pageIndex].blocks?.find(
        (b) => b.blockId === blockId
      );

      if (block) {
        return {
          ...block,
          pageIndex,
          pageId: pages[pageIndex]._id,
        };
      }
    }

    console.warn(`Block with id "${blockId}" not found`);
    return null;
  },
  [pages]
);
```

**Why:**
- Needed to validate block exists before highlighting
- Returns block with pageIndex for potential future use
- Matches Studio's implementation pattern

#### Task 1.2: Create hightBlock Function

**Add after getBlockFromBlockId (around line 125):**

```javascript
/**
 * Highlight a block by its ID
 * Auto-clears highlight after 5 seconds
 * @param {string} blockId - The block ID to highlight
 */
const hightBlock = React.useCallback(
  (blockId) => {
    if (!blockId) {
      console.warn("hightBlock called without blockId");
      return;
    }

    // Verify block exists
    const block = getBlockFromBlockId(blockId);
    if (!block) {
      console.warn(`Cannot highlight non-existent block: ${blockId}`);
      return;
    }

    console.log(`Highlighting block: ${blockId}`);
    setHighlightedBlockId(blockId);

    // Auto-clear highlight after 5 seconds
    setTimeout(() => {
      setHighlightedBlockId(null);
      console.log(`Cleared highlight for block: ${blockId}`);
    }, 5000);
  },
  [getBlockFromBlockId]
);
```

**Why:**
- Sets the highlighted block ID
- Validates block exists before highlighting
- Auto-clears after 5 seconds for better UX
- Console logging for debugging

**Configuration:**
- Timeout: 5000ms (5 seconds) - can be adjusted based on UX testing
- Can be made configurable via constant

#### Task 1.3: Remove Static highlightedBlockId Value

**Replace lines 22-24:**

**Before:**
```javascript
const [highlightedBlockId, setHighlightedBlockId] = React.useState(
  "68f0f2f475f84100046d0548"
);
```

**After:**
```javascript
const [highlightedBlockId, setHighlightedBlockId] = React.useState(null);
```

**Why:**
- No longer need static test value
- `null` indicates no block is currently highlighted
- Cleaner initial state

### Phase 2: Update Areas State Management ✓

**Goal:** Ensure areas stay synchronized with pages data

**File:** `src/pages/Book/Book.jsx`

#### Task 2.1: Add useEffect to Update Areas When Pages Change

**Add after existing useEffect (around line 49):**

```javascript
// Update areas when pages data changes
React.useEffect(() => {
  if (pages?.length) {
    const newAreas = pages.map((page) =>
      page.blocks?.map((block) => ({
        id: block.blockId,
        x: block.coordinates.x,
        y: block.coordinates.y,
        width: block.coordinates.width,
        height: block.coordinates.height,
        unit: "px",
        isChanging: true,
        isNew: true,
        _unit: block.coordinates.unit,
        _updated: false,
      })) || []
    );
    setAreas(newAreas);
  }
}, [pages]);
```

**Why:**
- Keeps areas in sync with page data
- Handles case where pages load asynchronously
- Ensures block IDs are always current

### Phase 3: Pass Functions to BookTabsLayout ✓

**Goal:** Make highlighting functions available to navigation system

**File:** `src/pages/Book/Book.jsx`

#### Task 3.1: Update BookTabsLayout Props

**Update BookTabsLayout component call (lines 115-122):**

**Before:**
```javascript
<BookTabsLayout
  pages={pages}
  chapterId={chapterId}
  activePage={activePage}
  setActivePage={setActivePage}
  onChangeActivePage={onChangeActivePage}
  ref={thumbnailsRef}
>
```

**After:**
```javascript
<BookTabsLayout
  pages={pages}
  chapterId={chapterId}
  activePage={activePage}
  setActivePage={setActivePage}
  onChangeActivePage={onChangeActivePage}
  ref={thumbnailsRef}
  getBlockFromBlockId={getBlockFromBlockId}  // NEW
  hightBlock={hightBlock}                    // NEW
>
```

**Why:**
- Makes functions available to BookTabsLayout
- BookTabsLayout can pass them to List/GlossaryAndKeywords components
- Enables highlighting from navigation

### Phase 4: Update BookTabsLayout Navigation ✓

**Goal:** Connect navigation to highlighting

**File:** `src/layouts/BookTabsLayout/BookTabsLayout.jsx`

#### Task 4.1: Receive New Props

**Update function signature (around line 30):**

**Before:**
```javascript
const BookTabsLayout = React.forwardRef((props, ref) => {
  const {
    children,
    pages: newPages,
    chapterId,
    activePage,
    setActivePage,
    onChangeActivePage,
  } = props;
```

**After:**
```javascript
const BookTabsLayout = React.forwardRef((props, ref) => {
  const {
    children,
    pages: newPages,
    chapterId,
    activePage,
    setActivePage,
    onChangeActivePage,
    getBlockFromBlockId,  // NEW
    hightBlock,           // NEW
  } = props;
```

#### Task 4.2: Update navigateToBlock Function

**Update navigateToBlock function (around line 74):**

**Before:**
```javascript
const navigateToBlock = React.useCallback(
  (pageId, blockId) => {
    changePageById(pageId);
    console.log(`Navigated to block ${blockId} on page ${pageId}`);
  },
  [changePageById]
);
```

**After:**
```javascript
const navigateToBlock = React.useCallback(
  (pageId, blockId) => {
    // Navigate to the page
    changePageById(pageId);

    // Highlight the block (if highlighting functions available)
    if (hightBlock) {
      // Add small delay to ensure page has changed
      setTimeout(() => {
        hightBlock(blockId);
      }, 300);
    } else {
      // Fallback: just log (for contexts without highlighting)
      console.log(`Navigated to block ${blockId} on page ${pageId}`);
    }
  },
  [changePageById, hightBlock]
);
```

**Why:**
- Calls highlighting after page navigation
- 300ms delay ensures page transition completes
- Graceful fallback for contexts without highlighting
- Maintains console.log for debugging

**Timing Considerations:**
- 300ms delay chosen to allow page change animation
- Can be adjusted based on actual page transition time
- Alternative: Use callback from setActivePage

### Phase 5: Enhance Highlighting Style (Optional) ✓

**Goal:** Make highlighting more noticeable (match Studio's style)

**File:** `src/components/Book/BookViewer/BookViewer.jsx`

#### Task 5.1: Enhance getStyle Function

**Update lines 60-65:**

**Before:**
```javascript
console.log("highlightedBlockId= ", highlightedBlockId);
console.log("area= ", area);
if (area.blockId === highlightedBlockId) {
  console.log("founded block");
  newArea = { ...newArea, border: "2px solid #000" };
}
```

**After:**
```javascript
// Apply highlighting if this block is the highlighted one
if (area.blockId === highlightedBlockId) {
  newArea = {
    ...newArea,
    border: "4px solid #FF6B00",
    backgroundColor: "rgba(255, 107, 0, 0.2)",
    boxShadow: "0 0 15px rgba(255, 107, 0, 0.5)",
    zIndex: 1000,
    transition: "all 0.3s ease-in-out",
  };
}
```

**Why:**
- More prominent visual feedback
- Orange color stands out better than black
- Semi-transparent background doesn't obscure content
- Box shadow adds depth
- Smooth transition animation
- Higher z-index ensures visibility

**Color Options:**
```javascript
// Option 1: Orange (Recommended)
border: "4px solid #FF6B00"
backgroundColor: "rgba(255, 107, 0, 0.2)"

// Option 2: Blue
border: "4px solid #2196F3"
backgroundColor: "rgba(33, 150, 243, 0.2)"

// Option 3: Green
border: "4px solid #4CAF50"
backgroundColor: "rgba(76, 175, 80, 0.2)"

// Option 4: Purple
border: "4px solid #9C27B0"
backgroundColor: "rgba(156, 39, 176, 0.2)"
```

#### Task 5.2: Remove Debug Console Logs

**Remove unnecessary console.logs:**
```javascript
// Remove these (lines 60-61, 63):
console.log("highlightedBlockId= ", highlightedBlockId);
console.log("area= ", area);
console.log("founded block");
```

**Keep for production:**
- Console logs in Book.jsx's `hightBlock` and `getBlockFromBlockId` can stay
- They're useful for debugging and don't fire constantly

### Phase 6: Add Highlight Configuration (Optional Enhancement) ✓

**Goal:** Make highlighting configurable

**File:** Create `src/config/highlighting.js`

```javascript
/**
 * Block Highlighting Configuration
 */
export const HIGHLIGHT_CONFIG = {
  // How long to show highlight before auto-clearing (milliseconds)
  AUTO_CLEAR_TIMEOUT: 5000,

  // Delay before highlighting after page navigation (milliseconds)
  NAVIGATION_DELAY: 300,

  // Highlight styles
  STYLES: {
    border: "4px solid #FF6B00",
    backgroundColor: "rgba(255, 107, 0, 0.2)",
    boxShadow: "0 0 15px rgba(255, 107, 0, 0.5)",
    zIndex: 1000,
    transition: "all 0.3s ease-in-out",
  },

  // Whether to auto-clear highlight
  ENABLE_AUTO_CLEAR: true,

  // Whether to scroll to highlighted block
  ENABLE_AUTO_SCROLL: false, // Future feature
};
```

**Then import and use:**
```javascript
// In Book.jsx
import { HIGHLIGHT_CONFIG } from "../../config/highlighting";

// In hightBlock function:
setTimeout(() => {
  setHighlightedBlockId(null);
}, HIGHLIGHT_CONFIG.AUTO_CLEAR_TIMEOUT);

// In BookTabsLayout.jsx
setTimeout(() => {
  hightBlock(blockId);
}, HIGHLIGHT_CONFIG.NAVIGATION_DELAY);

// In BookViewer.jsx
if (area.blockId === highlightedBlockId) {
  newArea = {
    ...newArea,
    ...HIGHLIGHT_CONFIG.STYLES,
  };
}
```

**Benefits:**
- Centralized configuration
- Easy to adjust timing/styling
- Can be exposed to user settings later
- Consistent across codebase

## Files to Modify

### Required Changes

1. **`src/pages/Book/Book.jsx`**
   - Add `getBlockFromBlockId` function
   - Add `hightBlock` function
   - Change `highlightedBlockId` initial state from static to `null`
   - Add useEffect to sync areas with pages
   - Pass new props to BookTabsLayout

2. **`src/layouts/BookTabsLayout/BookTabsLayout.jsx`**
   - Receive `getBlockFromBlockId` and `hightBlock` props
   - Update `navigateToBlock` to call `hightBlock`

3. **`src/components/Book/BookViewer/BookViewer.jsx`**
   - Enhance highlighting style (optional)
   - Remove debug console.logs

### Optional Files

4. **`src/config/highlighting.js`** (New File)
   - Centralized highlighting configuration
   - Makes customization easier

## Testing Plan

### Manual Testing Steps

#### 1. Basic Highlighting
- [ ] Open a book in reader mode
- [ ] Navigate to "Recalls" tab
- [ ] Click up arrow on an item with references
- [ ] **Verify:** Page changes to correct page
- [ ] **Verify:** Referenced block is highlighted with visible style
- [ ] **Verify:** Highlight disappears after 5 seconds

#### 2. Multiple Navigations
- [ ] Click up on first item
- [ ] Wait 2 seconds
- [ ] Click up on second item
- [ ] **Verify:** First highlight clears when second activates
- [ ] **Verify:** Second highlight appears correctly

#### 3. All Tabs
- [ ] Test in Recalls tab
- [ ] Test in Micro Learning tab
- [ ] Test in Enriching Contents tab
- [ ] Test in Glossary & Keywords tab
- [ ] Test in Illustrative Interactions tab
- [ ] Test in Check Yourself tab
- [ ] **Verify:** Highlighting works in all tabs

#### 4. Edge Cases
- [ ] Click up on item without references
- [ ] **Verify:** Nothing happens, console shows warning
- [ ] Click up on item with invalid blockId
- [ ] **Verify:** Nothing happens, console shows warning
- [ ] Click up on item on current page
- [ ] **Verify:** Highlight appears without page change

#### 5. Visual Verification
- [ ] Check highlighting is visible on light backgrounds
- [ ] Check highlighting is visible on dark backgrounds
- [ ] Check highlighting doesn't obscure text content
- [ ] Check transition animation is smooth
- [ ] Check highlight color is consistent

#### 6. Timing Verification
- [ ] Measure time from click to highlight appearing
- [ ] **Expected:** ~300ms delay
- [ ] Measure time from highlight to auto-clear
- [ ] **Expected:** ~5 seconds
- [ ] **Verify:** No flickering or layout shifts

### Console Verification

**Expected Console Output:**

**Successful Highlighting:**
```
Highlighting block: 68f0f2f475f84100046d0548
Cleared highlight for block: 68f0f2f475f84100046d0548
```

**Block Not Found:**
```
Block with id "invalid_id" not found
Cannot highlight non-existent block: invalid_id
```

**Missing Block ID:**
```
hightBlock called without blockId
```

### Automated Testing (Future)

```javascript
// Example test cases
describe('Block Highlighting', () => {
  it('should highlight block when navigating', () => {
    // Test implementation
  });

  it('should auto-clear highlight after timeout', () => {
    // Test with fake timers
  });

  it('should handle invalid block IDs gracefully', () => {
    // Test error handling
  });
});
```

## Expected Behavior

### Before Implementation
- ✅ Static block always highlighted
- ❌ Clicking up/down doesn't change highlight
- ❌ Confusing UX

### After Implementation
- ✅ No highlight on page load
- ✅ Clicking up/down navigates to page AND highlights block
- ✅ Highlight is visually prominent
- ✅ Highlight auto-clears after 5 seconds
- ✅ Smooth transitions and professional feel

## User Experience Flow

```
1. User opens "Recalls" tab
2. User sees list of recall items with up/down buttons
3. User clicks up arrow on "Photosynthesis" item
   ↓
4. Page changes to page containing referenced block
   (300ms delay for page transition)
   ↓
5. Referenced block highlights with orange border + shadow
   (Smooth fade-in animation)
   ↓
6. User can clearly see which block is being referenced
   ↓
7. After 5 seconds, highlight automatically fades out
   (Smooth fade-out animation)
   ↓
8. User can navigate to next item
```

## Configuration Options

### Timing Settings

| Setting | Default | Range | Purpose |
|---------|---------|-------|---------|
| AUTO_CLEAR_TIMEOUT | 5000ms | 3000-10000ms | How long to show highlight |
| NAVIGATION_DELAY | 300ms | 100-500ms | Delay before highlighting |

### Style Options

| Property | Default | Alternatives |
|----------|---------|--------------|
| Border | 4px solid #FF6B00 | 2-6px, any color |
| Background | rgba(255,107,0,0.2) | Any semi-transparent |
| Shadow | 0 0 15px rgba(...) | Adjust blur/spread |
| Transition | 0.3s ease-in-out | Adjust duration/easing |

## Future Enhancements

### 1. Manual Highlight Control
Add button to clear highlight manually:
```javascript
<Button onClick={() => setHighlightedBlockId(null)}>
  Clear Highlight
</Button>
```

### 2. Persistent Highlight Mode
Add toggle to disable auto-clear:
```javascript
const [persistentHighlight, setPersistentHighlight] = useState(false);

// In hightBlock:
if (!persistentHighlight) {
  setTimeout(() => setHighlightedBlockId(null), 5000);
}
```

### 3. Smooth Scroll to Block
Scroll viewport to center highlighted block:
```javascript
const scrollToBlock = (blockId) => {
  const blockElement = document.querySelector(`[data-block-id="${blockId}"]`);
  if (blockElement) {
    blockElement.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'center'
    });
  }
};
```

### 4. Multiple Highlight Colors
Different colors for different tabs:
```javascript
const getHighlightColor = (tabName) => {
  const colors = {
    recalls: '#FF6B00',
    'micro-learning': '#2196F3',
    glossary: '#4CAF50',
  };
  return colors[tabName] || '#FF6B00';
};
```

### 5. Highlight History
Track which blocks have been viewed:
```javascript
const [viewedBlocks, setViewedBlocks] = useState(new Set());

// Add to set when highlighting
setViewedBlocks(prev => new Set([...prev, blockId]));

// Show different style for previously viewed blocks
```

### 6. Keyboard Shortcuts
Add keyboard controls:
```javascript
useEffect(() => {
  const handleKeyPress = (e) => {
    if (e.key === 'Escape') {
      setHighlightedBlockId(null);
    }
  };
  window.addEventListener('keydown', handleKeyPress);
  return () => window.removeEventListener('keydown', handleKeyPress);
}, []);
```

## Success Criteria

✅ Implementation is successful when:

1. ✅ `highlightedBlockId` is dynamic (not static)
2. ✅ Clicking up/down buttons highlights the referenced block
3. ✅ Highlighting is visually prominent and noticeable
4. ✅ Highlight auto-clears after configured timeout
5. ✅ No console errors during highlighting
6. ✅ Works across all tabs that use List/GlossaryAndKeywords
7. ✅ Graceful handling of invalid block IDs
8. ✅ Smooth transitions and professional UX
9. ✅ Page navigation works correctly before highlighting
10. ✅ Areas state stays in sync with pages data

## Rollback Plan

If issues occur, revert in this order:

1. Revert BookViewer.jsx highlighting style changes
2. Revert BookTabsLayout.jsx navigateToBlock changes
3. Revert Book.jsx prop passing
4. Revert Book.jsx new functions
5. Restore static highlightedBlockId value

Keep changes in git commits separated by file for easy rollback.

## Risk Assessment

### Low Risk
- ✅ Adding new functions (doesn't affect existing code)
- ✅ Changing initial state value (minimal impact)
- ✅ Enhancing visual style (cosmetic only)

### Medium Risk
- ⚠️ Updating BookTabsLayout props (many components affected)
- ⚠️ Adding useEffect for areas (potential performance impact)

### Mitigation
- Test thoroughly in development
- Use React DevTools to verify state updates
- Monitor console for warnings
- Test with large numbers of pages/blocks

## Dependencies

### No New Dependencies Required
- ✅ All features use existing React hooks
- ✅ All styling uses inline styles (no new CSS)
- ✅ All functions use existing utilities

### Existing Dependencies Used
- React (useState, useCallback, useEffect)
- Existing component props system
- Existing areas/blocks data structure

## Performance Considerations

### Potential Issues
1. **Auto-clear timeouts** - Multiple active timeouts
2. **Block searching** - O(n*m) complexity for getBlockFromBlockId
3. **Areas sync** - useEffect runs on every pages change

### Optimizations
1. Clear previous timeout when setting new highlight
2. Consider memoizing getBlockFromBlockId results
3. Deep comparison in useEffect to prevent unnecessary updates

### Implementation
```javascript
// Clear previous timeout
const timeoutRef = useRef(null);

const hightBlock = (blockId) => {
  // Clear previous timeout
  if (timeoutRef.current) {
    clearTimeout(timeoutRef.current);
  }

  setHighlightedBlockId(blockId);

  // Set new timeout
  timeoutRef.current = setTimeout(() => {
    setHighlightedBlockId(null);
  }, 5000);
};
```

---

**Plan Created:** 2025-11-20
**Status:** Ready for Implementation
**Estimated Time:** 2-3 hours
**Priority:** High
**Complexity:** Medium
