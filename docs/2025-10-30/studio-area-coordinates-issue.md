# Studio Area Coordinates Display Issue

**Date:** 2025-10-30
**Component:** Studio (Block Authoring Tool)
**Status:** 🔍 Documented - Solution Provided

## Problem Description

### Issue Summary
When working in Studio:
1. User selects/creates an area on a page
2. User navigates to another page
3. User returns to the original page
4. **Problem:** Area coordinates don't display properly - areas may be misaligned, wrong size, or not visible

### Visual Example
```
Step 1: Create area on Page 1
┌────────────────┐
│  Page 1        │
│  ┌───────┐     │  ← Area created here
│  │ Area  │     │     x: 100, y: 200
│  └───────┘     │     width: 300, height: 150
└────────────────┘

Step 2: Navigate to Page 2
┌────────────────┐
│  Page 2        │  ← User goes here
│                │
└────────────────┘

Step 3: Return to Page 1
┌────────────────┐
│  Page 1        │
│ ┌─┐            │  ← Area displays incorrectly!
│ └─┘            │     Wrong position/size
└────────────────┘
```

## Root Cause Analysis

### File: `src/components/Studio/Studio.jsx`

#### 1. Areas State Management (Lines 96-112)

```javascript
const [areas, setAreas] = React.useState(
  pages?.map((page) =>
    page.blocks?.map((block) => {
      return {
        x: block.coordinates.x,
        y: block.coordinates.y,
        width: block.coordinates.width,
        height: block.coordinates.height,
        unit: "px",
        isChanging: true,
        isNew: true,
        _unit: block.coordinates.unit,  // ← Original unit from server
        _updated: false,                // ← Tracks if converted
      };
    })
  ) || Array(pages?.length || 1).fill([])
);
```

**Key Points:**
- `areas` stores coordinates for ALL pages
- Each area has `_unit` (original unit: "px" or "percentage")
- `_updated` flag tracks if coordinates have been converted

#### 2. Image Load Handler (Lines 191-226)

```javascript
const onImageLoad = () => {
  setAreas((prevState) => {
    return prevState?.map((page, idx1) => {
      return page?.map((block, idx2) => {
        // ❌ PROBLEM: Only converts if unit is "percentage"
        if (block._unit === "percentage") {
          const { clientHeight, clientWidth } =
            studioEditorRef.current.studioEditorSelectorRef.current;

          const properties = areasProperties[idx1][idx2];

          return {
            x: (properties.x / 100) * clientWidth,
            y: (properties.y / 100) * clientHeight,
            width: (properties.width / 100) * clientWidth,
            height: (properties.height / 100) * clientHeight,
            unit: "px",
            isChanging: true,
            isNew: true,
            _updated: true,    // ← Marked as converted
            _unit: block._unit,
          };
        }

        // Returns unchanged for non-percentage units
        return {
          x: block.x,
          y: block.y,
          width: block.width,
          height: block.height,
          unit: "px",
          isChanging: true,
          isNew: true,
        };
      });
    });
  });
};
```

**Problems Identified:**

1. **Missing `_unit` preservation for px-based coordinates**
   - When returning non-percentage blocks, `_unit` is not preserved
   - Next time `onImageLoad` runs, the unit information is lost

2. **No recalculation for dynamically created areas**
   - New areas created via `AreaSelector` don't have `_unit` set
   - They default to "px" but may need conversion on page revisit

3. **Image scale factor not considered**
   - When user zooms in/out (`imageScaleFactor`), areas don't recalculate
   - Areas may appear at wrong positions after zoom

#### 3. Area Change Handler (Lines 263-280)

```javascript
const onChangeHandler = (areasParam) => {
  if (activeRightTab.label === "Composite Blocks") {
    // ... composite blocks handling
  } else {
    if (areasParam.length > areasProperties[activePageIndex].length) {
      syncAreasProperties();  // ← Syncs properties for new areas
    }

    const newAreasParam = [...areas];
    newAreasParam[activePageIndex] = areasParam;  // ← Updates current page
    setAreas(newAreasParam);
  }
};
```

**Problem:**
- New areas from `areasParam` are in **percentage** format (from AreaSelector)
- But they're stored without proper `_unit` metadata
- When image reloads, conversion logic doesn't handle them correctly

#### 4. Sync Areas Properties (Lines 252-261)

```javascript
const syncAreasProperties = () => {
  const newAreasProperties = updateAreasProperties(
    areasProperties,
    activePageIndex,
    areas,
    subObject,
    type
  );
  setAreasProperties(newAreasProperties);
};
```

**Issue:**
- Syncs from `areas` to `areasProperties` (copies coordinates)
- But doesn't set `_unit` for newly created areas
- This breaks the conversion logic on next `onImageLoad`

### File: `src/components/Studio/StudioAreaSelector/StudioAreaSelector.jsx`

#### AreaSelector Component (Lines 157-183)

```javascript
<AreaSelector
  areas={renderedAreas}          // ← Areas for current page
  onChange={onChangeHandler}     // ← Fires when areas change
  wrapperStyle={{ width: "100%" }}
  customAreaRenderer={customRender}
  unit="percentage"              // ← ⚠️ Always uses percentage!
>
  <img
    src={pages[activePage]?.url}
    style={{
      width: `${imageScaleFactor * 100}%`,
      height: `${imageScaleFactor * 100}%`,
    }}
    onLoad={onImageLoad}         // ← Triggers conversion
  />
</AreaSelector>
```

**Key Issue:**
- `AreaSelector` uses `unit="percentage"`
- Areas are created/modified in percentage format
- But the conversion tracking (`_unit`, `_updated`) gets lost

## The Complete Problem Flow

### Scenario: User Creates Area and Navigates Away

```
Step 1: User creates new area on Page 1
├─ AreaSelector creates area in percentage: { x: 10%, y: 20%, width: 30%, height: 15% }
├─ onChangeHandler receives area in percentage
├─ Area stored in `areas[0]` WITHOUT _unit="percentage"
└─ areasProperties updated with pixel values

Step 2: onImageLoad runs
├─ Checks if block._unit === "percentage"
├─ ❌ FALSE (because _unit wasn't set)
├─ Returns unchanged coordinates
└─ Area displays correctly (for now)

Step 3: User navigates to Page 2
├─ activePageIndex changes to 1
├─ Different areas rendered
└─ Page 1 areas remain in state

Step 4: Image loads on Page 2
├─ onImageLoad runs for ALL pages
├─ Page 1 areas processed again
├─ Still no _unit, so coordinates unchanged
└─ Page 1 areas still OK

Step 5: User returns to Page 1
├─ activePageIndex changes back to 0
├─ Image loads again
├─ onImageLoad runs AGAIN
├─ Page 1 areas processed YET AGAIN
├─ ❌ Coordinates may be recalculated incorrectly
│   ├─ If _unit was lost, conversion skipped
│   ├─ If image size changed, no recalc
│   └─ If zoom changed, positions wrong
└─ ❌ Area displays at wrong position!
```

## Why It Fails

### Issue 1: Lost Metadata
```javascript
// New area created
const newArea = {
  x: 10,        // percentage
  y: 20,        // percentage
  width: 30,
  height: 15,
  unit: "%",
  // ❌ Missing: _unit, _updated
};

// On next onImageLoad
if (newArea._unit === "percentage") {  // ❌ undefined, condition fails
  // Conversion skipped!
}
```

### Issue 2: State Mutation
```javascript
// onImageLoad returns new object
return {
  x: block.x,
  y: block.y,
  width: block.width,
  height: block.height,
  unit: "px",
  isChanging: true,
  isNew: true,
  // ❌ Missing: _unit (from previous state)
  // ❌ Missing: _updated
};
```

### Issue 3: Reference vs Value
```javascript
const { clientHeight, clientWidth } =
  studioEditorRef.current.studioEditorSelectorRef.current;

// ❌ If image hasn't loaded yet, these may be 0
// ❌ If zoom changed, these are different from before
// ❌ No check if ref exists or has valid dimensions
```

## Solution

### Fix 1: Preserve Metadata in onImageLoad

**File:** `src/components/Studio/Studio.jsx` (Lines 191-226)

**Before:**
```javascript
const onImageLoad = () => {
  setAreas((prevState) => {
    return prevState?.map((page, idx1) => {
      return page?.map((block, idx2) => {
        if (block._unit === "percentage") {
          // ... conversion
          return {
            // ... converted coordinates
            _updated: true,
            _unit: block._unit,
          };
        }

        return {
          x: block.x,
          y: block.y,
          width: block.width,
          height: block.height,
          unit: "px",
          isChanging: true,
          isNew: true,
          // ❌ Missing _unit and _updated
        };
      });
    });
  });
};
```

**After:**
```javascript
const onImageLoad = () => {
  setAreas((prevState) => {
    return prevState?.map((page, idx1) => {
      return page?.map((block, idx2) => {
        if (block._unit === "percentage") {
          const { clientHeight, clientWidth } =
            studioEditorRef.current.studioEditorSelectorRef.current;

          const properties = areasProperties[idx1][idx2];

          return {
            x: (properties.x / 100) * clientWidth,
            y: (properties.y / 100) * clientHeight,
            width: (properties.width / 100) * clientWidth,
            height: (properties.height / 100) * clientHeight,
            unit: "px",
            isChanging: true,
            isNew: true,
            _updated: true,
            _unit: block._unit,
          };
        }

        // ✅ Preserve _unit and _updated for non-percentage blocks
        return {
          x: block.x,
          y: block.y,
          width: block.width,
          height: block.height,
          unit: "px",
          isChanging: true,
          isNew: true,
          _unit: block._unit || "px",        // ✅ Preserve or default
          _updated: block._updated || false, // ✅ Preserve flag
        };
      });
    });
  });
};
```

### Fix 2: Set Metadata for New Areas

**File:** `src/components/Studio/Studio.jsx` (Lines 263-280)

**Before:**
```javascript
const onChangeHandler = (areasParam) => {
  if (activeRightTab.label === "Composite Blocks") {
    // ...
  } else {
    if (areasParam.length > areasProperties[activePageIndex].length) {
      syncAreasProperties();
    }

    const newAreasParam = [...areas];
    newAreasParam[activePageIndex] = areasParam;
    setAreas(newAreasParam);
  }
};
```

**After:**
```javascript
const onChangeHandler = (areasParam) => {
  if (activeRightTab.label === "Composite Blocks") {
    // ... composite blocks handling
  } else {
    if (areasParam.length > areasProperties[activePageIndex].length) {
      syncAreasProperties();
    }

    // ✅ Add metadata to new areas
    const areasWithMetadata = areasParam.map((area, idx) => {
      // Check if this is an existing area
      const existingArea = areas[activePageIndex]?.[idx];

      if (existingArea) {
        // Preserve metadata from existing area
        return {
          ...area,
          _unit: existingArea._unit || "percentage",
          _updated: existingArea._updated || false,
        };
      } else {
        // New area - set metadata
        return {
          ...area,
          _unit: "percentage", // ✅ AreaSelector uses percentage
          _updated: false,     // ✅ Not yet converted
        };
      }
    });

    const newAreasParam = [...areas];
    newAreasParam[activePageIndex] = areasWithMetadata;
    setAreas(newAreasParam);
  }
};
```

### Fix 3: Force Recalculation on Page Change

**File:** `src/components/Studio/Studio.jsx` (Lines 228-250)

**Add new function:**
```javascript
const onClickImage = (idx) => {
  setActivePageIndex(idx);
  localStorage.setItem("author_page", `${idx}`);

  // ✅ Force recalculation when changing pages
  setTimeout(() => {
    onImageLoad();
  }, 50); // Small delay to ensure image is loaded
};
```

### Fix 4: Add Safeguards in onImageLoad

**File:** `src/components/Studio/Studio.jsx` (Lines 191-226)

**Enhanced version:**
```javascript
const onImageLoad = () => {
  setAreas((prevState) => {
    return prevState?.map((page, idx1) => {
      return page?.map((block, idx2) => {
        // ✅ Safety check: ensure ref exists
        if (!studioEditorRef.current?.studioEditorSelectorRef?.current) {
          return {
            ...block,
            _unit: block._unit || "px",
            _updated: block._updated || false,
          };
        }

        if (block._unit === "percentage" && !block._updated) {
          const { clientHeight, clientWidth } =
            studioEditorRef.current.studioEditorSelectorRef.current;

          // ✅ Safety check: ensure valid dimensions
          if (!clientWidth || !clientHeight) {
            return {
              ...block,
              _unit: block._unit,
              _updated: false,
            };
          }

          const properties = areasProperties[idx1]?.[idx2];

          // ✅ Safety check: ensure properties exist
          if (!properties) {
            return {
              ...block,
              _unit: block._unit,
              _updated: false,
            };
          }

          return {
            x: (properties.x / 100) * clientWidth,
            y: (properties.y / 100) * clientHeight,
            width: (properties.width / 100) * clientWidth,
            height: (properties.height / 100) * clientHeight,
            unit: "px",
            isChanging: true,
            isNew: true,
            _updated: true,
            _unit: block._unit,
          };
        }

        // Preserve all metadata
        return {
          x: block.x,
          y: block.y,
          width: block.width,
          height: block.height,
          unit: "px",
          isChanging: true,
          isNew: true,
          _unit: block._unit || "px",
          _updated: block._updated || false,
        };
      });
    });
  });
};
```

### Fix 5: Handle Image Scale Changes

**File:** `src/components/Studio/Studio.jsx`

**Add effect to watch for scale changes:**
```javascript
React.useEffect(() => {
  // When scale factor changes, recalculate areas
  onImageLoad();
}, [imageScaleFactor]);
```

## Testing the Fix

### Test Case 1: Create Area and Navigate
```javascript
// 1. Open Studio on Page 1
// 2. Create a new area at position (10%, 20%) with size (30%, 15%)
// 3. Note the area's pixel position on screen
// 4. Navigate to Page 2
// 5. Navigate back to Page 1
// ✅ Expected: Area displays at same position as step 3
```

### Test Case 2: Zoom and Navigate
```javascript
// 1. Create area on Page 1
// 2. Zoom in (increase imageScaleFactor)
// 3. Navigate to Page 2
// 4. Navigate back to Page 1
// ✅ Expected: Area displays at correct position for current zoom level
```

### Test Case 3: Multiple Areas
```javascript
// 1. Create 3 areas on Page 1
// 2. Navigate to Page 2
// 3. Create 2 areas on Page 2
// 4. Navigate back to Page 1
// ✅ Expected: All 3 areas from step 1 display correctly
// 5. Navigate to Page 2
// ✅ Expected: All 2 areas from step 3 display correctly
```

### Test Case 4: Server-loaded Areas
```javascript
// 1. Open chapter with existing blocks from server
// 2. Navigate between pages
// ✅ Expected: All server-loaded areas display correctly
```

## Implementation Steps

### Step 1: Apply Fix 1 (Preserve Metadata)
```bash
# Edit: src/components/Studio/Studio.jsx
# Lines: 191-226 (onImageLoad function)
# Add: _unit and _updated preservation
```

### Step 2: Apply Fix 2 (New Area Metadata)
```bash
# Edit: src/components/Studio/Studio.jsx
# Lines: 263-280 (onChangeHandler function)
# Add: Metadata assignment for new areas
```

### Step 3: Apply Fix 3 (Force Recalc)
```bash
# Edit: src/components/Studio/Studio.jsx
# Lines: 228-250 (onClickImage function)
# Add: setTimeout with onImageLoad call
```

### Step 4: Apply Fix 4 (Safety Checks)
```bash
# Edit: src/components/Studio/Studio.jsx
# Lines: 191-226 (onImageLoad function)
# Add: Null checks and dimension validation
```

### Step 5: Apply Fix 5 (Scale Effect)
```bash
# Edit: src/components/Studio/Studio.jsx
# Add: useEffect for imageScaleFactor
```

### Step 6: Test All Scenarios
```bash
# Run through all test cases
# Verify areas display correctly
# Check console for errors
```

## Prevention Strategy

### Best Practices

1. **Always preserve metadata**
   - When creating/updating area state, include `_unit` and `_updated`
   - Never return partial state objects

2. **Use consistent coordinate systems**
   - Store areas in percentage (from AreaSelector)
   - Convert to pixels only for display
   - Keep original percentage values in areasProperties

3. **Add null checks**
   - Verify refs exist before accessing
   - Check dimensions are valid (> 0)
   - Handle missing properties gracefully

4. **Force recalculation on state changes**
   - When page changes, trigger onImageLoad
   - When zoom changes, trigger onImageLoad
   - When image loads, trigger onImageLoad

### Code Review Checklist

When modifying Studio area handling:
- [ ] Are `_unit` and `_updated` preserved in state updates?
- [ ] Do new areas get proper metadata?
- [ ] Are coordinate conversions only done when needed?
- [ ] Are refs and dimensions validated before use?
- [ ] Does page navigation trigger recalculation?
- [ ] Does zoom change trigger recalculation?

## Related Files

- `src/components/Studio/Studio.jsx` - Main component with state management
- `src/components/Studio/StudioAreaSelector/StudioAreaSelector.jsx` - Area selection UI
- `src/components/Studio/StudioEditor/StudioEditor.jsx` - Editor container
- `src/utils/ocr.js` - Area processing utilities
- `src/utils/studio.js` - Studio helper functions

## Additional Notes

### Why Percentage vs Pixels?

The `@bmunozg/react-image-area` library uses **percentage-based coordinates** which are:
- ✅ Independent of image size
- ✅ Work across different zoom levels
- ✅ Easier to store and share

But the Studio displays areas in **pixel coordinates** which are:
- ✅ Absolute positions on screen
- ✅ Easier to work with for cropping/OCR
- ✅ Match the actual rendered positions

This dual-system requires careful conversion tracking!

### Performance Considerations

- `onImageLoad` runs for ALL pages, not just active page
- With many pages and areas, this can be slow
- Consider optimization: only recalculate active page

```javascript
const onImageLoad = () => {
  setAreas((prevState) => {
    return prevState?.map((page, idx1) => {
      // ✅ Only recalculate active page
      if (idx1 !== activePageIndex) {
        return page; // Return unchanged
      }

      // Recalculate active page areas
      return page?.map((block, idx2) => {
        // ... conversion logic
      });
    });
  });
};
```

## Summary

### Problem
Area coordinates display incorrectly after navigating between pages due to:
1. Lost metadata (`_unit`, `_updated`)
2. Missing metadata on new areas
3. No recalculation trigger on page change
4. Missing safety checks

### Solution
1. ✅ Preserve `_unit` and `_updated` in all state updates
2. ✅ Set metadata on newly created areas
3. ✅ Force recalculation on page navigation
4. ✅ Add null checks and dimension validation
5. ✅ Trigger recalculation on zoom changes

### Result
- Areas display correctly after navigation
- New areas work properly
- Zoom changes handled correctly
- Server-loaded areas preserved
- More robust error handling

---

**Status:** Solution documented, ready for implementation
**Priority:** High (affects core functionality)
**Effort:** 2-3 hours to implement and test
