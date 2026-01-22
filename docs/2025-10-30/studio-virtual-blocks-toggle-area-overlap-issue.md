# Studio Virtual Blocks Toggle - Area Overlap Issue

**Date:** 2025-10-30
**Status:** 🔴 Issue Identified → 📋 Solution Plan Ready
**Component:** `src/components/Studio/Studio.jsx`
**Affected Components:** `StudioAreaSelector.jsx`, `StudioActions.jsx`

---

## Problem Summary

When clicking the eye icon (visibility toggle) in Studio Actions to show/hide virtual blocks, the areas (interactive regions on the image) are not properly recalculated and overlap with the virtual blocks. The areas maintain their old positions even though the image dimensions have changed.

**User Impact:**
- Areas appear in wrong positions
- Areas overlap with virtual blocks UI elements
- Difficult to work with areas when virtual blocks are visible
- Poor user experience when toggling views

---

## Root Cause Analysis

### The Layout System

The Studio uses a **CSS Grid layout** that changes dynamically based on virtual blocks visibility:

#### State 1: Virtual Blocks Hidden (`showVB = false`)
```scss
.show {
  & > div:not(:last-child) {
    display: none;  // Hide virtual blocks
  }

  & .block {
    grid-column: 1 / 7;  // Full width (6 columns)
    grid-row: 1 / 10;    // Full height (9 rows)
  }
}
```

**Result:** Image takes up 100% of available grid space

#### State 2: Virtual Blocks Visible (`showVB = true`)
```scss
.studio-area-selector {
  display: grid;
  grid-template-columns: repeat(6, 1fr);  // 6 equal columns
  grid-template-rows: $block-size repeat(6, 1fr) $block-size;  // 8 rows

  // Virtual blocks positions:
  & div:nth-child(1), & div:nth-child(16) { grid-column: 1 / 3; }  // Left/bottom left
  & div:nth-child(2), & div:nth-child(17) { grid-column: 3 / 5; }  // Center top/bottom
  & div:nth-child(3), & div:nth-child(18) { grid-column: 5 / 7; }  // Right top/bottom

  & .block {
    grid-column: 2 / 6;  // Middle 4 columns (reduced!)
    grid-row: 2 / 8;     // Middle 6 rows (reduced!)
  }
}
```

**Result:** Image shrinks to accommodate virtual blocks (approximately 66% of grid width)

### The Problem Sequence

When user clicks the eye icon to toggle from hidden → visible:

```
1. User clicks eye icon
   ↓
2. setShowVB(true) is called
   ↓
3. setTimeout(() => onImageLoad(), 20) is scheduled
   ↓
4. React re-renders component
   ↓
5. CSS class changes from .show to default
   ↓
6. Grid layout starts changing
   ↓
7. [20ms passes - onImageLoad() is called]
   ↓
8. onImageLoad() reads image dimensions from ref
   ↓
9. Problem: Layout may not be fully updated yet!
   ↓
10. Areas are converted using WRONG dimensions
    ↓
11. Image continues resizing to fit new grid
    ↓
12. Areas are now at wrong positions (overlapping)
```

### Technical Details

**Current `onClickToggleVirutalBlocks` implementation:**
```javascript
const onClickToggleVirutalBlocks = () => {
  setShowVB((prevState) => !prevState);
  setTimeout(() => {
    onImageLoad();
  }, 20);
};
```

**Issues:**
1. **20ms timeout is too short** - CSS transitions, layout reflow, and browser rendering take time
2. **No layout stabilization check** - Assumes layout is ready after fixed timeout
3. **Areas not marked for reconversion** - `_updated` flag not reset
4. **Race condition** - onImageLoad might read dimensions before layout completes

**The `onImageLoad` function:**
```javascript
const onImageLoad = () => {
  setAreas((prevState) => {
    return prevState?.map((page, idx1) => {
      return page?.map((block, idx2) => {
        // Gets dimensions from ref
        const { clientHeight, clientWidth } =
          studioEditorRef.current.studioEditorSelectorRef.current;

        // Converts percentage to pixels
        if (block._unit === "percentage" && !block._updated) {
          // Uses clientWidth/clientHeight for conversion
          // ...
        }
      });
    });
  });
};
```

**Problem:** If called before layout stabilizes, `clientWidth/clientHeight` will be incorrect!

### Dimension Changes Example

**Scenario:** 1200px container width

| State | Grid Layout | Image Width | Area at 50% | Actual Position |
|-------|-------------|-------------|-------------|-----------------|
| Hidden VB | 1/7 columns | ~1200px (100%) | 600px | ✅ Correct |
| Show VB | 2/6 columns | ~800px (66%) | 600px | ❌ Wrong! Should be 400px |

When toggling from hidden → visible:
- Image shrinks from 1200px → 800px
- Area at 50% should be at 400px (50% of 800px)
- But if onImageLoad uses old dimensions (1200px), area stays at 600px
- Result: Area is 200px too far to the right (overlapping!)

---

## Why the Issue Occurs

### 1. Timing Issue
- `setTimeout(onImageLoad, 20)` is called immediately after state change
- But layout update happens in next render cycle
- 20ms may not be enough for:
  - React render cycle
  - CSS class update
  - CSS grid recalculation
  - Image resize
  - Browser reflow/repaint

### 2. No _updated Reset
The toggle function doesn't reset the `_updated` flag:
```javascript
const onClickToggleVirutalBlocks = () => {
  setShowVB((prevState) => !prevState);

  // Missing: Reset _updated flags for all areas!

  setTimeout(() => {
    onImageLoad();
  }, 20);
};
```

Without resetting `_updated`, areas that were already converted won't be reconverted even if dimensions changed!

### 3. Ref Timing
The ref `studioEditorRef.current.studioEditorSelectorRef.current` points to the image element. If read before the image has resized to fit the new grid layout, dimensions will be stale.

### 4. No Visual Feedback
User doesn't know if/when areas have been recalculated, leading to confusion.

---

## Solution Design

### Option 1: Reset Flags + Longer Timeout ⚠️ SIMPLE BUT UNRELIABLE

**Approach:** Reset `_updated` flags and increase timeout

```javascript
const onClickToggleVirutalBlocks = () => {
  setShowVB((prevState) => !prevState);

  // Reset _updated flags
  setAreas((prevState) => {
    return prevState.map((page) =>
      page.map((area) => ({
        ...area,
        _updated: false,
      }))
    );
  });

  // Longer timeout for layout to stabilize
  setTimeout(() => {
    onImageLoad();
  }, 100);  // Increased from 20ms
};
```

**Pros:**
- ✅ Simple implementation
- ✅ Reuses existing onImageLoad logic

**Cons:**
- ❌ Still relies on arbitrary timeout
- ❌ 100ms might not be enough on slow devices
- ❌ 100ms might be too long on fast devices
- ❌ No guarantee layout is ready

### Option 2: Use requestAnimationFrame ✅ BETTER

**Approach:** Wait for next animation frame, then wait one more

```javascript
const onClickToggleVirutalBlocks = () => {
  setShowVB((prevState) => !prevState);

  // Reset _updated flags
  setAreas((prevState) => {
    return prevState.map((page) =>
      page.map((area) => ({
        ...area,
        _updated: false,
      }))
    );
  });

  // Wait for layout to update
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      onImageLoad();
    });
  });
};
```

**Pros:**
- ✅ Waits for browser render cycle
- ✅ More reliable than setTimeout
- ✅ Adapts to device performance

**Cons:**
- ⚠️ Still might not be enough for CSS transitions
- ⚠️ Two frames might be overkill

### Option 3: ResizeObserver ✅✅ RECOMMENDED

**Approach:** Listen for actual dimension changes

```javascript
// In Studio component
const imageResizeObserverRef = React.useRef(null);

React.useEffect(() => {
  const imageElement = studioEditorRef.current?.studioEditorSelectorRef?.current;

  if (imageElement && !imageResizeObserverRef.current) {
    imageResizeObserverRef.current = new ResizeObserver(() => {
      // Image has resized, recalculate areas
      onImageLoad();
    });

    imageResizeObserverRef.current.observe(imageElement);
  }

  return () => {
    if (imageResizeObserverRef.current) {
      imageResizeObserverRef.current.disconnect();
    }
  };
}, []);

const onClickToggleVirutalBlocks = () => {
  setShowVB((prevState) => !prevState);

  // Reset _updated flags so areas will be reconverted when ResizeObserver fires
  setAreas((prevState) => {
    return prevState.map((page) =>
      page.map((area) => ({
        ...area,
        _updated: false,
      }))
    );
  });

  // No manual timeout needed - ResizeObserver will fire when image resizes!
};
```

**Pros:**
- ✅ ✅ Fires exactly when image actually resizes
- ✅ ✅ Works regardless of device performance
- ✅ No arbitrary timeouts
- ✅ Future-proof
- ✅ Also handles other resize events (zoom, window resize, etc.)

**Cons:**
- ⚠️ Slightly more complex
- ⚠️ Need to manage observer lifecycle
- ⚠️ May fire multiple times during animation (can debounce if needed)

### Option 4: Hybrid Approach ✅✅✅ BEST

**Approach:** Combine ResizeObserver with immediate flag reset

```javascript
const onClickToggleVirutalBlocks = () => {
  setShowVB((prevState) => !prevState);

  // Immediately reset _updated flags
  setAreas((prevState) => {
    return prevState.map((page) =>
      page.map((area) => ({
        ...area,
        _updated: false,
      }))
    );
  });

  // Fallback: Call onImageLoad after a short delay
  // (in case ResizeObserver doesn't fire)
  setTimeout(() => {
    onImageLoad();
  }, 50);

  // Primary: ResizeObserver will fire when layout actually changes
  // (implemented via useEffect as shown in Option 3)
};
```

**Pros:**
- ✅ ✅ ✅ Reliable - uses ResizeObserver as primary mechanism
- ✅ ✅ Safe fallback with setTimeout
- ✅ Handles edge cases
- ✅ Works even if ResizeObserver fails

**Cons:**
- ⚠️ May call onImageLoad twice (once from timeout, once from observer)
- ⚠️ Need to debounce or prevent duplicate calls

---

## Recommended Solution: Option 4 (Hybrid)

### Implementation Plan

#### Step 1: Add ResizeObserver Setup

**File:** `src/components/Studio/Studio.jsx`

**Location:** After existing useEffect hooks

```javascript
/**
 * Set up ResizeObserver to recalculate areas when image resizes
 * This handles virtual blocks toggle, zoom changes, and window resizes
 */
React.useEffect(() => {
  const imageElement = studioEditorRef.current?.studioEditorSelectorRef?.current;

  if (!imageElement) return;

  // Create observer
  const resizeObserver = new ResizeObserver((entries) => {
    // Debounce: only recalculate after resize is stable
    if (resizeTimeoutRef.current) {
      clearTimeout(resizeTimeoutRef.current);
    }

    resizeTimeoutRef.current = setTimeout(() => {
      console.log('Image resized, recalculating areas');
      onImageLoad();
    }, 50);
  });

  // Start observing
  resizeObserver.observe(imageElement);

  // Cleanup
  return () => {
    resizeObserver.disconnect();
    if (resizeTimeoutRef.current) {
      clearTimeout(resizeTimeoutRef.current);
    }
  };
}, [studioEditorRef.current?.studioEditorSelectorRef?.current]);

// Add ref for debouncing
const resizeTimeoutRef = React.useRef(null);
```

#### Step 2: Update Toggle Function

**File:** `src/components/Studio/Studio.jsx`

**Location:** Line 146-151 (current `onClickToggleVirutalBlocks`)

```javascript
const onClickToggleVirutalBlocks = () => {
  // Toggle visibility
  setShowVB((prevState) => !prevState);

  // Reset _updated flags for all areas on all pages
  setAreas((prevState) => {
    return prevState.map((page) =>
      page.map((area) => ({
        ...area,
        _updated: false,  // Force reconversion
      }))
    );
  });

  // Fallback: recalculate after short delay
  // ResizeObserver will also fire, but this ensures we don't miss it
  setTimeout(() => {
    onImageLoad();
  }, 50);
};
```

#### Step 3: Improve onImageLoad Logging (Optional)

**File:** `src/components/Studio/Studio.jsx`

**Location:** Inside `onImageLoad` function

```javascript
const onImageLoad = () => {
  // Log dimensions for debugging
  const imageElement = studioEditorRef.current?.studioEditorSelectorRef?.current;
  if (imageElement) {
    console.log('onImageLoad - Image dimensions:', {
      width: imageElement.clientWidth,
      height: imageElement.clientHeight,
      showVB,
    });
  }

  setAreas((prevState) => {
    // ... existing logic
  });
};
```

#### Step 4: Add Visual Feedback (Optional Enhancement)

**File:** `src/components/Studio/StudioActions/StudioActions.jsx`

Add loading indicator during recalculation:

```javascript
const [isRecalculating, setIsRecalculating] = React.useState(false);

const onClickToggle = () => {
  setIsRecalculating(true);
  props.onClickToggleVirutalBlocks();
  setTimeout(() => setIsRecalculating(false), 200);
};

// In render:
<IconButton
  aria-label="visibility-icon"
  onClick={onClickToggle}
  disabled={isRecalculating}
>
  {isRecalculating ? (
    <CircularProgress size={20} />
  ) : showVB ? (
    <VisibilityIcon fontSize={iconFontSize} />
  ) : (
    <VisibilityOffIcon fontSize={iconFontSize} />
  )}
</IconButton>
```

---

## Alternative Solutions (Not Recommended)

### Alternative 1: Store Areas in Percentage Only

**Idea:** Keep areas in percentage format always, convert to pixels only for display

**Pros:**
- ✅ No conversion issues

**Cons:**
- ❌ Major refactoring required
- ❌ AreaSelector library expects pixels
- ❌ High risk of breaking existing functionality
- ❌ Not worth the effort

### Alternative 2: Force Image Dimensions

**Idea:** Set fixed image dimensions in CSS regardless of virtual blocks

**Pros:**
- ✅ No dimension changes

**Cons:**
- ❌ Virtual blocks would overlap image
- ❌ Poor UX
- ❌ Defeats purpose of responsive layout

---

## Testing Plan

### Test Case 1: Toggle Virtual Blocks On
**Steps:**
1. Open Studio with some areas created
2. Virtual blocks initially hidden (showVB=false)
3. Click eye icon to show virtual blocks
4. Wait for recalculation

**Expected:**
- ✅ Virtual blocks appear
- ✅ Image shrinks to accommodate them
- ✅ Areas maintain correct positions relative to image content
- ✅ No overlapping

### Test Case 2: Toggle Virtual Blocks Off
**Steps:**
1. Open Studio with virtual blocks visible
2. Create some areas
3. Click eye icon to hide virtual blocks

**Expected:**
- ✅ Virtual blocks disappear
- ✅ Image expands to full size
- ✅ Areas scale correctly
- ✅ No overlapping

### Test Case 3: Multiple Toggles
**Steps:**
1. Toggle virtual blocks on/off rapidly (5 times)

**Expected:**
- ✅ Areas always correct after each toggle
- ✅ No race conditions
- ✅ No performance issues

### Test Case 4: With Zoom
**Steps:**
1. Toggle virtual blocks
2. Zoom in/out
3. Toggle again

**Expected:**
- ✅ Areas correct at all zoom levels
- ✅ Works with virtual blocks visible/hidden

### Test Case 5: Page Navigation
**Steps:**
1. Create areas on page 1
2. Toggle virtual blocks
3. Navigate to page 2
4. Navigate back to page 1

**Expected:**
- ✅ Areas correct on return to page 1
- ✅ Virtual blocks state maintained

### Test Case 6: Window Resize (Bonus)
**Steps:**
1. Resize browser window with virtual blocks visible

**Expected:**
- ✅ ResizeObserver fires
- ✅ Areas recalculated
- ✅ Still correct positions

---

## Implementation Checklist

- [ ] Add `resizeTimeoutRef` ref
- [ ] Implement ResizeObserver useEffect
- [ ] Update `onClickToggleVirutalBlocks` to reset `_updated` flags
- [ ] Update `onClickToggleVirutalBlocks` to use 50ms fallback timeout
- [ ] Add debug logging to `onImageLoad` (optional)
- [ ] Add visual feedback (loading state) (optional)
- [ ] Test Case 1: Toggle on
- [ ] Test Case 2: Toggle off
- [ ] Test Case 3: Multiple toggles
- [ ] Test Case 4: With zoom
- [ ] Test Case 5: Page navigation
- [ ] Test Case 6: Window resize
- [ ] Remove debug logging before production
- [ ] Document the fix

---

## Risk Assessment

### Low Risk ✅
- ResizeObserver is well-supported (95%+ browsers)
- Fallback with setTimeout ensures compatibility
- Only affects area positioning, not creation

### Medium Risk ⚠️
- May fire onImageLoad multiple times during transition
- Need proper debouncing
- Could impact performance if many areas

### High Risk ❌
- None identified

---

## Performance Considerations

### ResizeObserver Frequency
- May fire multiple times during CSS transition
- **Solution:** Debounce with 50ms timeout
- Only last call will execute onImageLoad

### onImageLoad Performance
- Iterates through all pages and all areas
- With many areas (100+), could be slow
- **Mitigation:** Only recalculate active page (future optimization)

### Memory
- ResizeObserver needs cleanup on unmount
- **Solution:** Return cleanup function from useEffect

---

## Future Enhancements

### 1. Optimize to Only Recalculate Active Page
```javascript
const onImageLoad = (pageIndex = activePageIndex) => {
  setAreas((prevState) => {
    return prevState.map((page, idx) => {
      if (idx !== pageIndex) return page;  // Skip other pages
      return page.map((area) => {
        // ... conversion logic
      });
    });
  });
};
```

### 2. Add Loading Overlay
Show semi-transparent overlay during recalculation for better UX

### 3. Animate Transition
Smooth CSS transition when virtual blocks appear/disappear

### 4. Persist Virtual Blocks State
Save showVB to localStorage so user preference persists

---

## Summary

**Problem:** Areas overlap with virtual blocks when toggling visibility because layout changes but areas aren't recalculated with correct dimensions.

**Root Cause:**
1. 20ms timeout too short for layout to stabilize
2. No reset of `_updated` flags
3. Timing race condition

**Solution:**
1. Use ResizeObserver to detect actual dimension changes
2. Reset `_updated` flags immediately on toggle
3. Keep setTimeout fallback for reliability
4. Debounce to prevent multiple recalculations

**Benefits:**
- ✅ Reliable - fires when layout actually changes
- ✅ Performant - debounced
- ✅ Safe - has fallback
- ✅ Future-proof - handles all resize cases

**Estimated Effort:** ~1 hour implementation + 30 min testing

---

**Documented by:** Claude Code
**Date:** 2025-10-30
**Status:** 📋 Ready for implementation
