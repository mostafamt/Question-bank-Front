# Virtual Blocks Navigation Feature - Reader Mode

**Date:** 2026-01-09
**Status:** Planning Phase

---

## Overview

Add Previous/Next navigation buttons to virtual block modals in reader mode, allowing users to navigate between virtual block items without closing the modal.

---

## Current Behavior vs. Desired Behavior

### Current Implementation (What We Have Now)

**When user clicks a virtual block icon in reader mode:**

1. **Single Item**: Opens directly in appropriate modal
   - Text → TextEditorModal (read-only)
   - Link → IframeDisplayModal
   - Object → IframeDisplayModal

2. **Multiple Items**: Opens VirtualBlockReaderModal
   - Shows list of all items in that virtual block
   - User clicks "View/Open/Play" to see individual item
   - Each item opens in separate modal

**Problem:**
- User must close modal to see next virtual block
- No way to navigate between virtual blocks without closing
- Requires multiple clicks to view all virtual blocks on page

### Desired Implementation (What We Want)

**Navigation Buttons in Modal Footer:**
```
┌──────────────────────────────────────┐
│ Notes 📝                      [Close]│
├──────────────────────────────────────┤
│                                      │
│        [Content Display Area]        │
│                                      │
├──────────────────────────────────────┤
│ [← Previous]  [2 of 5]  [Next →]    │ ← NEW FEATURE
└──────────────────────────────────────┘
```

**Features:**
- **Previous button**: Navigate to previous virtual block item
- **Next button**: Navigate to next virtual block item
- **Counter**: Show current position (e.g., "2 of 5")
- **Circular navigation**: From last item → first item (optional)
- **Keyboard shortcuts**: Arrow keys for navigation (optional)

---

## Implementation Questions to Answer

### Question 1: Navigation Scope

**Option A: Navigate within single virtual block (e.g., only items in "Notes")**
- Previous/Next moves between items in the same virtual block
- If Notes has 3 items, navigate between those 3 items only

**Option B: Navigate across all virtual blocks on page**
- Previous/Next moves between ALL virtual block items on the page
- Navigate from Notes item → Summary item → Activity item, etc.

**Option C: Navigate by virtual block groups**
- Previous/Next moves between virtual blocks (not individual items)
- Notes (3 items) → Summary (1 item) → Activity (2 items)

**❓ Which option do you prefer?**

### Question 2: Counter Display

**Option A: Show item index within current block**
- "2 of 3" (showing item 2 out of 3 items in Notes)

**Option B: Show position across all blocks**
- "5 of 12" (showing item 5 out of 12 total items on page)

**Option C: Show both**
- "Notes 2/3 - Overall 5/12"

**❓ Which display format?**

### Question 3: Empty/Disabled States

**When at first item:**
- Option A: Disable Previous button (greyed out)
- Option B: Previous button loops to last item (circular)

**When at last item:**
- Option A: Disable Next button (greyed out)
- Option B: Next button loops to first item (circular)

**❓ Linear navigation or circular?**

### Question 4: Modal Behavior

**Option A: Update modal content in-place**
- Modal stays open, content updates when clicking Previous/Next
- Modal title updates to show new block label
- Same modal instance, just different content

**Option B: Close and reopen modal**
- Close current modal, open new modal with next item
- Brief transition between modals

**❓ Which approach?**

### Question 5: Keyboard Shortcuts

**Should we add keyboard navigation?**
- Left Arrow → Previous
- Right Arrow → Next
- Escape → Close modal

**❓ Enable keyboard shortcuts?**

---

## Recommended Approach (Based on Best UX)

I recommend the following for best user experience:

### Recommendation: **Option B + A (Cross-block navigation with in-place updates)**

**Why:**
1. **Navigate across ALL blocks** - Users want to see all virtual blocks on page sequentially
2. **Update in-place** - Smoother UX, no modal flicker
3. **Show overall counter** - Users understand progress through all content
4. **Circular navigation** - Natural flow, no dead ends
5. **Add keyboard shortcuts** - Power users will love it

---

## Implementation Plan

### Phase 1: Build Navigation State Management

**Objective:** Create a system to track all virtual blocks and current position

**Tasks:**

1. **Create navigation utility function** (`src/utils/virtual-blocks-navigation.js`)
   ```javascript
   /**
    * Build flat list of all virtual block items on page
    * @param {Object} virtualBlocks - Virtual blocks object
    * @returns {Array} - Flat array of all items with metadata
    */
   export const buildNavigationList = (virtualBlocks) => {
     const items = [];
     for (const location in virtualBlocks) {
       const block = virtualBlocks[location];
       if (block.contents && block.contents.length > 0) {
         block.contents.forEach((content) => {
           items.push({
             location,
             contentType: content.contentType,
             type: content.type,
             contentValue: content.contentValue,
           });
         });
       }
     }
     return items;
   };
   ```

2. **Create navigation hook** (`src/hooks/useVirtualBlockNavigation.js`)
   ```javascript
   export const useVirtualBlockNavigation = (virtualBlocks, initialIndex = 0) => {
     const [currentIndex, setCurrentIndex] = React.useState(initialIndex);
     const navigationList = buildNavigationList(virtualBlocks);

     const goToNext = () => {
       setCurrentIndex((prev) =>
         prev < navigationList.length - 1 ? prev + 1 : 0  // Circular
       );
     };

     const goToPrevious = () => {
       setCurrentIndex((prev) =>
         prev > 0 ? prev - 1 : navigationList.length - 1  // Circular
       );
     };

     return {
       currentItem: navigationList[currentIndex],
       currentIndex,
       totalItems: navigationList.length,
       goToNext,
       goToPrevious,
       hasNext: currentIndex < navigationList.length - 1,
       hasPrevious: currentIndex > 0,
     };
   };
   ```

---

### Phase 2: Update VirtualBlock Component

**Objective:** Pass navigation context when opening reader modals

**File to Modify:** `src/components/VirtualBlocks/VirtualBlock/VirtualBlock.jsx`

**Changes:**

1. **Calculate initial index** when opening modal
   ```javascript
   const handlePlayReader = React.useCallback(() => {
     // Build navigation list
     const navList = buildNavigationList(virtualBlocks);

     // Find index of first item in current block
     const initialIndex = navList.findIndex(
       item => item.location === label
     );

     // Open modal with navigation context
     openModal("virtual-block-reader-nav", {
       virtualBlocks: virtualBlocks,
       initialIndex: initialIndex,
     });
   }, [virtualBlocks, label, openModal]);
   ```

---

### Phase 3: Create New Navigation-Enabled Modal

**Objective:** Create new modal with Previous/Next navigation

**Option A: Create New Modal Component**
- `VirtualBlockReaderNavigationModal.jsx`
- Separate from existing VirtualBlockReaderModal
- Cleaner, doesn't affect existing functionality

**Option B: Enhance Existing Modal**
- Modify `VirtualBlockReaderModal.jsx`
- Add optional navigation props
- Conditional rendering of nav buttons

**Recommendation: Option A** (create new modal to avoid breaking existing code)

**File to Create:** `src/components/Modal/VirtualBlockReaderNavigationModal/VirtualBlockReaderNavigationModal.jsx`

**Features:**
```javascript
const VirtualBlockReaderNavigationModal = (props) => {
  const {
    virtualBlocks,
    initialIndex = 0,
    handleCloseModal
  } = props;

  const {
    currentItem,
    currentIndex,
    totalItems,
    goToNext,
    goToPrevious,
    hasNext,
    hasPrevious,
  } = useVirtualBlockNavigation(virtualBlocks, initialIndex);

  // Handle keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") goToPrevious();
      if (e.key === "ArrowRight") goToNext();
      if (e.key === "Escape") handleCloseModal();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToPrevious, goToNext, handleCloseModal]);

  // Render content based on type
  const renderContent = () => {
    switch (currentItem.type) {
      case "text":
        return <TextContentDisplay value={currentItem.contentValue} />;
      case "link":
        return <IframeContentDisplay url={currentItem.contentValue} />;
      case "object":
        return <ObjectContentDisplay objectId={currentItem.contentValue} />;
      default:
        return <div>Unknown content type</div>;
    }
  };

  return (
    <div className={styles["vb-nav-modal"]}>
      <BootstrapModal.Header closeButton>
        <BootstrapModal.Title>
          {currentItem.contentType}
        </BootstrapModal.Title>
      </BootstrapModal.Header>

      <BootstrapModal.Body>
        {renderContent()}
      </BootstrapModal.Body>

      <BootstrapModal.Footer>
        <Box display="flex" justifyContent="space-between" width="100%">
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={goToPrevious}
            disabled={!hasPrevious && !CIRCULAR_NAVIGATION}
          >
            Previous
          </Button>

          <Typography variant="body1">
            {currentIndex + 1} of {totalItems}
          </Typography>

          <Button
            variant="outlined"
            endIcon={<ArrowForward />}
            onClick={goToNext}
            disabled={!hasNext && !CIRCULAR_NAVIGATION}
          >
            Next
          </Button>
        </Box>
      </BootstrapModal.Footer>
    </div>
  );
};
```

---

### Phase 4: Content Display Components

**Objective:** Create reusable components for displaying different content types within navigation modal

**Files to Create:**

1. **TextContentDisplay.jsx** - Display text content inline
2. **IframeContentDisplay.jsx** - Display iframe content inline
3. **ObjectContentDisplay.jsx** - Fetch URL and display object in iframe

**Why separate components?**
- Reusability
- Clean separation of concerns
- Easier testing
- Better performance (only render active content)

---

### Phase 5: Register Modal and Update Handlers

**Objective:** Wire up the new modal to the application

**Files to Modify:**

1. **Modal.jsx** - Register new modal
   ```javascript
   import VirtualBlockReaderNavigationModal from "./VirtualBlockReaderNavigationModal/VirtualBlockReaderNavigationModal";

   const MODAL_COMPONENTS = {
     // ... existing modals
     "virtual-block-reader-nav": VirtualBlockReaderNavigationModal,
   };
   ```

2. **VirtualBlock.jsx** - Use new modal in reader mode
   ```javascript
   const handlePlayReader = () => {
     openModal("virtual-block-reader-nav", {
       virtualBlocks: virtualBlocks,
       initialIndex: calculateInitialIndex(),
     });
   };
   ```

---

### Phase 6: Styling and Polish

**Objective:** Make navigation controls visually appealing and accessible

**File to Create:** `virtualBlockReaderNavigationModal.module.scss`

**Features:**
- Responsive button sizing
- Clear visual hierarchy
- Disabled state styling
- Smooth transitions between content
- Loading states for object URL fetching
- ARIA labels for accessibility
- Focus management

---

### Phase 7: Testing

**Objective:** Ensure navigation works correctly in all scenarios

**Test Cases:**

1. **Single virtual block with single item**
   - Previous/Next buttons disabled (or loop to self)
   - Counter shows "1 of 1"

2. **Single virtual block with multiple items**
   - Navigate through items in sequence
   - Counter updates correctly

3. **Multiple virtual blocks**
   - Navigate across different block types
   - Title updates to show current block label
   - Content displays correctly for each type

4. **Content Type Transitions**
   - Text → Link (should load iframe)
   - Link → Object (should fetch URL and load iframe)
   - Object → Text (should display text inline)

5. **Keyboard Navigation**
   - Left arrow goes to previous
   - Right arrow goes to next
   - Escape closes modal

6. **Edge Cases**
   - Page with no virtual blocks
   - All virtual blocks are empty
   - Only one virtual block with content

---

## Alternative Implementation (Simpler Approach)

If the full cross-block navigation is too complex, here's a simpler alternative:

### Simpler Version: Navigate within VirtualBlockReaderModal only

**When:** User opens a virtual block with multiple items (e.g., Notes with 3 items)

**Instead of:** Showing list of items with "View" buttons

**Show:** First item directly with Previous/Next to navigate between the 3 items

**Benefits:**
- Simpler implementation
- Only affects multi-item blocks
- No cross-block navigation complexity

**Limitations:**
- Can't navigate between different virtual blocks
- User must close modal to see next block

**Would you prefer this simpler approach?**

---

## Files Summary

### To Create (5-7 files)

**Phase 1:**
1. `src/utils/virtual-blocks-navigation.js` - Navigation utility functions
2. `src/hooks/useVirtualBlockNavigation.js` - Navigation hook

**Phase 3:**
3. `src/components/Modal/VirtualBlockReaderNavigationModal/VirtualBlockReaderNavigationModal.jsx`
4. `src/components/Modal/VirtualBlockReaderNavigationModal/virtualBlockReaderNavigationModal.module.scss`

**Phase 4 (Optional - if inline display):**
5. `src/components/Modal/VirtualBlockReaderNavigationModal/TextContentDisplay.jsx`
6. `src/components/Modal/VirtualBlockReaderNavigationModal/IframeContentDisplay.jsx`
7. `src/components/Modal/VirtualBlockReaderNavigationModal/ObjectContentDisplay.jsx`

### To Modify (2 files)

1. `src/components/VirtualBlocks/VirtualBlock/VirtualBlock.jsx` - Update handlePlayReader
2. `src/components/Modal/Modal.jsx` - Register new modal

### Documentation

1. `VIRTUAL_BLOCKS_NAVIGATION_IMPLEMENTATION.md` - Implementation summary

---

## Configuration Options

### Constants to Define

```javascript
// src/config/virtual-blocks-navigation.js

export const NAVIGATION_CONFIG = {
  // Enable circular navigation (last → first, first → last)
  CIRCULAR_NAVIGATION: true,

  // Enable keyboard shortcuts
  KEYBOARD_SHORTCUTS: true,

  // Show counter format
  COUNTER_FORMAT: "overall", // "overall" | "within-block" | "both"

  // Auto-advance timer (optional)
  AUTO_ADVANCE_ENABLED: false,
  AUTO_ADVANCE_DELAY: 5000, // ms

  // Transition animation
  TRANSITION_ENABLED: true,
  TRANSITION_DURATION: 300, // ms
};
```

---

## Questions for You to Answer

Before I start implementation, please answer these questions:

### 1. Navigation Scope
- [ ] **Option A**: Navigate within single virtual block only (e.g., just items in Notes)
- [ ] **Option B**: Navigate across ALL virtual blocks on page
- [ ] **Option C**: Navigate by virtual block groups (Notes → Summary → Activity)

### 2. Circular Navigation
- [ ] **Yes**: Previous from first item goes to last item
- [ ] **No**: Previous button disabled on first item

### 3. Counter Display
- [ ] **Format A**: "2 of 5" (overall position)
- [ ] **Format B**: Show block label + count: "Notes (2 of 3)"
- [ ] **Format C**: Both: "Notes 2/3 - Overall 5/12"

### 4. Keyboard Shortcuts
- [ ] **Yes**: Enable arrow key navigation
- [ ] **No**: Only button clicks

### 5. Content Display
- [ ] **Option A**: Display content inline within navigation modal (text/iframe in same modal)
- [ ] **Option B**: Keep opening separate modals (TextEditor, IframeDisplay) and add nav buttons there

### 6. Implementation Approach
- [ ] **Full version**: Cross-block navigation with all features
- [ ] **Simpler version**: Only navigate within multi-item blocks

---

## Next Steps

1. **Review this plan** - Confirm approach is correct
2. **Answer the questions above** - Clarify requirements
3. **Approve implementation** - Which phases to start with
4. **Begin coding** - Start with Phase 1

---

**Document Version**: 1.0
**Created**: 2026-01-09
**Status**: Awaiting Review & Decisions
