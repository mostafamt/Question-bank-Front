# Composite Blocks Filter SimpleItem Plan

## Problem Statement
In the Composite Blocks tab, when clicking the hand icon button (BackHand icon), it displays all blocks on the page as clickable overlays. Currently, this includes all block types including "SimpleItem" blocks. The user wants to **filter out SimpleItem blocks** so they are not shown/clickable when the hand icon is active.

## User Experience Issue
1. User is in the Studio authoring mode with Composite Blocks tab active
2. User clicks the hand icon button (BackHand icon) to select blocks for composite
3. **CURRENT**: All blocks appear as clickable overlays, including SimpleItem blocks
4. **ISSUE**: SimpleItem blocks should not be selectable for composite blocks
5. **EXPECTED**: Only blocks that are NOT SimpleItem should appear as clickable overlays

## What is SimpleItem?

From `src/services/data.js` (line 130-132), **SimpleItem** is a type with the following labels:
- Objective (text)
- Paragraph (image)
- Picture (text)
- Voice (text)
- Video (text)

These represent simple, non-interactive content elements that shouldn't be part of composite blocks.

## Component Architecture

### Data Flow

```
Studio.jsx
├─ State: highlight (line 91)
├─ State: areasProperties (lines 114-140)
│  └─ Contains blocks with properties:
│     ├─ type (e.g., "SimpleItem", "Question", "Illustrative object")
│     ├─ label (e.g., "Paragraph", "Picture")
│     ├─ coordinates, color, text, etc.
│
├─ Passes to: StudioAreaSelector
│
StudioAreaSelector.jsx
├─ Receives: highlight, areasProperties, areas
├─ renderBlocks() function (lines 98-114)
│  └─ Maps areas[activePage] to clickable divs
├─ When highlight === "hand" (line 136)
│  └─ Renders: renderBlocks() + image
├─ onPickAreaForCompositeBlocks() (lines 67-96)
│  └─ Filters blocks based on type:
│     ├─ Allows: "Illustrative object" + list includes "Object"
│     ├─ Allows: "Question" + list includes "Question"
│     └─ Adds to compositeBlocks.areas

StudioCompositeBlocks.jsx
├─ Hand icon button (lines 122-130)
│  └─ Toggles highlight state
├─ Displays: compositeBlocks.areas (lines 164-184)
```

## Root Cause Analysis

### Where Blocks Are Rendered

**File:** `src/components/Studio/StudioAreaSelector/StudioAreaSelector.jsx`

**Function:** `renderBlocks()` (lines 98-114)
```javascript
const renderBlocks = () => {
  return areas[activePage].map((area, idx) => (
    <div
      key={idx}
      style={{
        position: "absolute",
        top: `${area.y}px`,
        left: `${area.x}px`,
        width: `${area.width}px`,
        height: `${area.height}px`,
        backgroundColor: "rgba(0, 0, 0, 0.2)",
        cursor: "pointer",
      }}
      onClick={() => onPickAreaForCompositeBlocks(idx)}
    />
  ));
};
```

**Problem:**
- Maps through **all areas** without filtering
- Renders every area as a clickable overlay
- No check for SimpleItem type

### Where Blocks Are Filtered (But Not Enough)

**Function:** `onPickAreaForCompositeBlocks()` (lines 67-96)
```javascript
const onPickAreaForCompositeBlocks = (idx) => {
  const area = areasProperties[activePage][idx];
  const list = getList2FromData(compositeBlocksTypes, compositeBlocks.type);

  const condition1 =
    (area.type === "Illustrative object" || area.type === "Question") &&
    list.includes("Object");
  const condition2 = area.type === "Question" && list.includes("Question");

  if (condition1 || condition2) {
    setCompositeBlocks((prevState) => ({
      ...prevState,
      areas: [
        ...prevState.areas,
        {
          x: area.x,
          y: area.y,
          height: area.height,
          width: area.width,
          type: list.includes("Object") ? "Object" : "Question",
          text: area.blockId,
          unit: "%",
        },
      ],
    }));
  }
};
```

**Current filtering:**
- ✅ Only adds blocks to composite if they meet specific conditions
- ✅ Filters out SimpleItem when clicked (won't be added to composite)
- ❌ Still **displays** SimpleItem blocks as clickable overlays
- ❌ Users see SimpleItem blocks but they do nothing when clicked

**The Issue:**
- Filtering happens on **click**, not on **render**
- SimpleItem blocks still appear visually
- Confusing UX: users click on SimpleItem blocks but nothing happens

## Solution

### Option 1: Filter in renderBlocks() (Recommended)

Filter out SimpleItem blocks before rendering them as overlays.

**Approach:**
```javascript
const renderBlocks = () => {
  return areas[activePage]
    .map((area, idx) => ({ area, idx }))  // Keep index reference
    .filter(({ idx }) => {
      const areaProps = areasProperties[activePage][idx];
      return areaProps.type !== "SimpleItem";  // Filter out SimpleItem
    })
    .map(({ area, idx }) => (
      <div
        key={idx}
        style={{
          position: "absolute",
          top: `${area.y}px`,
          left: `${area.x}px`,
          width: `${area.width}px`,
          height: `${area.height}px`,
          backgroundColor: "rgba(0, 0, 0, 0.2)",
          cursor: "pointer",
        }}
        onClick={() => onPickAreaForCompositeBlocks(idx)}
      />
    ));
};
```

**Advantages:**
- ✅ SimpleItem blocks are never rendered
- ✅ Clean user experience
- ✅ Consistent with existing logic
- ✅ Single place to maintain filter

**Disadvantages:**
- None

### Option 2: Filter with Additional Conditions

Add more sophisticated filtering logic that considers the current composite block type.

**Approach:**
```javascript
const shouldShowBlock = (idx) => {
  const area = areasProperties[activePage][idx];
  const list = getList2FromData(compositeBlocksTypes, compositeBlocks.type);

  // Don't show SimpleItem
  if (area.type === "SimpleItem") {
    return false;
  }

  // Show if matches composite block requirements
  const condition1 =
    (area.type === "Illustrative object" || area.type === "Question") &&
    list.includes("Object");
  const condition2 = area.type === "Question" && list.includes("Question");

  return condition1 || condition2;
};

const renderBlocks = () => {
  return areas[activePage]
    .map((area, idx) => ({ area, idx }))
    .filter(({ idx }) => shouldShowBlock(idx))
    .map(({ area, idx }) => (
      <div ... />
    ));
};
```

**Advantages:**
- ✅ Very explicit filtering logic
- ✅ Only shows blocks that can actually be added
- ✅ Eliminates all non-addable blocks

**Disadvantages:**
- More complex
- Duplicates logic from `onPickAreaForCompositeBlocks`
- Requires knowing composite block type before showing

### Option 3: Visual Indicator for Non-Selectable Blocks

Show SimpleItem blocks but make them visually distinct (grayed out, no cursor).

**Approach:**
```javascript
const renderBlocks = () => {
  return areas[activePage].map((area, idx) => {
    const areaProps = areasProperties[activePage][idx];
    const isSimpleItem = areaProps.type === "SimpleItem";

    return (
      <div
        key={idx}
        style={{
          position: "absolute",
          top: `${area.y}px`,
          left: `${area.x}px`,
          width: `${area.width}px`,
          height: `${area.height}px`,
          backgroundColor: isSimpleItem
            ? "rgba(200, 0, 0, 0.1)"   // Red tint for SimpleItem
            : "rgba(0, 0, 0, 0.2)",     // Normal
          cursor: isSimpleItem ? "not-allowed" : "pointer",
          opacity: isSimpleItem ? 0.3 : 1,
        }}
        onClick={() => !isSimpleItem && onPickAreaForCompositeBlocks(idx)}
      />
    );
  });
};
```

**Advantages:**
- ✅ Shows all blocks
- ✅ Clear visual distinction
- ✅ Educational for users

**Disadvantages:**
- ❌ Clutters the interface
- ❌ Not what user requested (wants blocks hidden, not grayed out)
- ❌ Still clickable (even if disabled)

## Recommended Solution: Option 1

**Implement simple filtering in renderBlocks()** because:
- ✅ Simplest solution
- ✅ Exactly what user requested (hide SimpleItem blocks)
- ✅ Clean UX (only show clickable blocks)
- ✅ Easy to maintain
- ✅ Minimal code changes

## Implementation Steps

### Step 1: Update renderBlocks Function

**File:** `/src/components/Studio/StudioAreaSelector/StudioAreaSelector.jsx`

**Current code (lines 98-114):**
```javascript
const renderBlocks = () => {
  return areas[activePage].map((area, idx) => (
    <div
      key={idx}
      style={{
        position: "absolute",
        top: `${area.y}px`,
        left: `${area.x}px`,
        width: `${area.width}px`,
        height: `${area.height}px`,
        backgroundColor: "rgba(0, 0, 0, 0.2)",
        cursor: "pointer",
      }}
      onClick={() => onPickAreaForCompositeBlocks(idx)}
    />
  ));
};
```

**Updated code:**
```javascript
const renderBlocks = () => {
  return areas[activePage]
    .map((area, idx) => ({ area, idx }))  // Preserve index
    .filter(({ idx }) => {
      // Filter out SimpleItem blocks
      const areaProps = areasProperties[activePage][idx];
      return areaProps.type !== "SimpleItem";
    })
    .map(({ area, idx }) => (
      <div
        key={idx}
        style={{
          position: "absolute",
          top: `${area.y}px`,
          left: `${area.x}px`,
          width: `${area.width}px`,
          height: `${area.height}px`,
          backgroundColor: "rgba(0, 0, 0, 0.2)",
          cursor: "pointer",
        }}
        onClick={() => onPickAreaForCompositeBlocks(idx)}
      />
    ));
};
```

**Changes:**
1. Use `.map()` to preserve original index with area
2. Add `.filter()` to exclude blocks where `type === "SimpleItem"`
3. Access `areasProperties[activePage][idx]` to get block type
4. Map the filtered results back to JSX

**Why preserve index?**
- The `idx` is used in `onPickAreaForCompositeBlocks(idx)`
- Must match the original position in `areasProperties[activePage]`
- Filtering changes array indices, so we preserve the original index

## Alternative Implementation (Simpler but Less Flexible)

If we don't care about preserving exact indices:

```javascript
const renderBlocks = () => {
  return areas[activePage]
    .filter((_, idx) => areasProperties[activePage][idx].type !== "SimpleItem")
    .map((area, filteredIdx) => {
      // Find original index in areasProperties
      const originalIdx = areasProperties[activePage].findIndex(
        (prop) => prop.x === area.x && prop.y === area.y
      );

      return (
        <div
          key={originalIdx}
          style={{ /* ... */ }}
          onClick={() => onPickAreaForCompositeBlocks(originalIdx)}
        />
      );
    });
};
```

**Not recommended** because:
- More complex (requires finding original index)
- Coordinate matching could fail if multiple blocks have same position
- Less performant (extra findIndex call)

## Testing Checklist

After implementing the fix:

### Visual Testing
- [ ] Navigate to Studio authoring mode
- [ ] Select Composite Blocks tab
- [ ] Click the hand icon (BackHand)
- [ ] **Verify**: Only non-SimpleItem blocks appear as overlays
- [ ] **Verify**: SimpleItem blocks (Objective, Paragraph, Picture, Voice, Video) are NOT visible as overlays

### Functional Testing
- [ ] Click on a visible block (e.g., Question, Illustrative object)
- [ ] **Verify**: Block is added to composite (as before)
- [ ] Try clicking where a SimpleItem block would be
- [ ] **Verify**: Nothing happens (no overlay there to click)
- [ ] **Verify**: Console shows no errors

### Block Type Testing

Test with different block types on the page:

**Should appear as overlays:**
- [ ] "Question" blocks
- [ ] "Illustrative object" blocks
- [ ] Other interactive block types

**Should NOT appear as overlays:**
- [ ] "SimpleItem" blocks with label "Objective"
- [ ] "SimpleItem" blocks with label "Paragraph"
- [ ] "SimpleItem" blocks with label "Picture"
- [ ] "SimpleItem" blocks with label "Voice"
- [ ] "SimpleItem" blocks with label "Video"

### Edge Cases
- [ ] Page with only SimpleItem blocks → No overlays shown
- [ ] Page with no SimpleItem blocks → All blocks shown (as before)
- [ ] Page with mixed blocks → Only non-SimpleItem shown
- [ ] Switch pages while hand is active → Filter applies to new page
- [ ] Toggle hand icon off/on → Filter consistently applied

### Integration Testing
- [ ] Add blocks to composite → Works as before
- [ ] Submit composite blocks → Works as before
- [ ] Edit composite blocks → Works as before
- [ ] Delete composite blocks → Works as before
- [ ] Hand icon toggle → Works smoothly

## Potential Side Effects

### None Expected
- The filter only affects **rendering** of overlay divs
- Does not modify `areas` or `areasProperties` arrays
- Does not change `onPickAreaForCompositeBlocks` logic
- Existing composite blocks functionality unchanged

### What Won't Break
- ✅ Existing composite blocks will still work
- ✅ Other block types will function normally
- ✅ Hand icon toggle will work as before
- ✅ Adding/editing/deleting composites unchanged

## Rollback Plan

If issues arise, simply revert the `renderBlocks()` function:

**Revert to:**
```javascript
const renderBlocks = () => {
  return areas[activePage].map((area, idx) => (
    <div
      key={idx}
      style={{
        position: "absolute",
        top: `${area.y}px`,
        left: `${area.x}px`,
        width: `${area.width}px`,
        height: `${area.height}px`,
        backgroundColor: "rgba(0, 0, 0, 0.2)",
        cursor: "pointer",
      }}
      onClick={() => onPickAreaForCompositeBlocks(idx)}
    />
  ));
};
```

This restores the original behavior (all blocks shown).

## Performance Considerations

**Impact:** Negligible

- Filter operation: O(n) where n = number of blocks on page
- Typical page: 5-20 blocks
- Filter runs only when hand icon is active
- No performance degradation expected

**Before:** Render all blocks
**After:** Filter + render non-SimpleItem blocks
**Difference:** < 1ms for typical pages

## Future Enhancements

After implementing this filter, consider:

1. **Configurable Filters**: Allow users to toggle which block types to show
2. **Type Indicators**: Show block type as tooltip on hover
3. **Color Coding**: Different overlay colors for different block types
4. **Filter Presets**: Quick filters for "Questions only", "Interactive only", etc.
5. **Block Count**: Show "X blocks available" when hand is active

## Related Block Types

For reference, other block types that should **still appear**:
- "Question"
- "Illustrative object"
- "SI" (Smart Interactive)
- "InteractiveObject"
- "MCQ"
- "ImageChoice"
- "FlashCards"
- "ImageHotspot"
- "DragTheWords"
- "Essay"
- "Accordion"
- "Charts"
- etc.

## Files to Modify

1. `/src/components/Studio/StudioAreaSelector/StudioAreaSelector.jsx` - Update `renderBlocks()` function (lines 98-114)

## Estimated Effort

- **Code changes**: 5-10 minutes
- **Testing**: 10-15 minutes
- **Documentation**: Already complete
- **Total**: ~20 minutes

## Success Criteria

✅ **Implementation is successful when:**
1. Hand icon button works as before
2. SimpleItem blocks do NOT appear as overlays when hand is active
3. All other block types appear as overlays normally
4. Clicking on visible overlays adds blocks to composite (unchanged behavior)
5. No console errors or warnings
6. Performance is unchanged
7. All existing functionality continues to work

## Additional Notes

- The filter is based on `area.type === "SimpleItem"` string matching
- If block type naming changes in the future, update the filter accordingly
- Consider creating a constant for block types that should be filtered:
  ```javascript
  const NON_SELECTABLE_TYPES = ["SimpleItem", /* future additions */];
  const isSelectable = (type) => !NON_SELECTABLE_TYPES.includes(type);
  ```

This approach makes it easier to add more filtered types in the future.
