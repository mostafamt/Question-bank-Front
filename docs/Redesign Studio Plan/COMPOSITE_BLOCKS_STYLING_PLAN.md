# Composite Blocks Styling Refactoring Plan

## Overview

This document outlines the refactoring plan to enable visual styling (colored borders and highlighting) for composite block areas in the Studio component, and to move the `constructBoxColors` utility function to a more appropriate location.

## Problem Statement

### Current Issues

1. **Missing Styling for Composite Blocks**
   - Composite block areas currently display without colored borders/highlighting
   - The `constructBoxColors` function is conditionally disabled when viewing composite blocks
   - This creates visual inconsistency between regular areas and composite block areas

2. **Poor Code Organization**
   - `constructBoxColors` is located in `src/utils/ocr.js` (semantically incorrect - styling ≠ OCR)
   - The function has no relation to OCR functionality
   - Makes the codebase harder to navigate and maintain

### Code Location

**File:** `src/components/Studio/StudioAreaSelector/StudioAreaSelector.jsx` (lines 199-205)

```javascript
css={
  activeRightTab.label === "Composite Blocks"
    ? []  // ❌ No styling applied to composite blocks
    : constructBoxColors(
        areasProperties[activePage],
        highlightedBlockId
      )
}
```

## Solution Design

### Key Insight

**Composite block areas and regular areas share the same data structure**, which means `constructBoxColors` can work for both without modifications to its logic!

Both structures include:
- `id` - Unique identifier (UUID)
- `color` - Hex color for borders/background
- `status` - Status flag (e.g., "deleted")
- `x, y, width, height` - Coordinate properties

**Type Definitions:** `src/components/Studio/types/studio.types.js`

### Proposed Changes

#### 1. Create New Styling Service

**New File:** `src/components/Studio/services/styling.service.js`

**Rationale:**
- Follows the established Phase 3 refactoring pattern (business logic services)
- Similar to existing `coordinate.service.js`
- Centralizes Studio-specific styling logic
- Makes code easier to test and maintain

**Benefits:**
- Clear separation of concerns
- Studio-specific code stays within Studio component folder
- Foundation for future styling utilities

#### 2. Enable Styling for Composite Blocks

**Updated Logic:**

```javascript
// Before: Conditional disables styling for composite blocks
css={
  activeRightTab.label === "Composite Blocks"
    ? []
    : constructBoxColors(areasProperties[activePage], highlightedBlockId)
}

// After: Pass the appropriate areas array based on active tab
css={
  constructBoxColors(
    activeRightTab.label === "Composite Blocks"
      ? compositeBlocks.areas
      : areasProperties[activePage],
    highlightedBlockId
  )
}
```

**How it works:**
- When on "Composite Blocks" tab → pass `compositeBlocks.areas`
- When on other tabs → pass `areasProperties[activePage]`
- The function handles both identically due to compatible data structures

## Implementation Plan

### Step 1: Create Documentation ✓

Create this README file at `docs/COMPOSITE_BLOCKS_STYLING_PLAN.md`

### Step 2: Create Styling Service

**File:** `src/components/Studio/services/styling.service.js`

```javascript
/**
 * @fileoverview Styling service for Studio component area boxes
 * Handles color generation, highlighting, and visual state management
 */

import { getStudioHighlightStyles, getDeletedBlockStyles } from '../../../config/highlighting';
import { hexToRgbA } from '../../../utils/helper';
import { DELETED } from '../../../utils/ocr';

/**
 * Generates dynamic CSS-in-JS styles for area boxes using Emotion syntax
 *
 * Creates distinct visual states for area boxes:
 * - Normal: Colored border with semi-transparent background
 * - Highlighted: Thick black border with shadow effect
 * - Deleted: Dark border with semi-transparent black background
 *
 * @param {Array<AreaProperty|CompositeBlockArea>} areas - Array of area properties
 * @param {string} highlightedBlockId - UUID of the currently highlighted block
 * @returns {Object} Emotion CSS-in-JS object for styling area boxes
 *
 * @example
 * // For regular areas
 * const styles = constructBoxColors(areasProperties[activePage], highlightedBlockId);
 *
 * @example
 * // For composite block areas
 * const styles = constructBoxColors(compositeBlocks.areas, highlightedBlockId);
 */
export const constructBoxColors = (areas, highlightedBlockId) => {
  // Create nth-child selectors for each area
  const values = areas?.map((_, idx) => `& > div:nth-of-type(${idx + 2})`);

  // Get styling configurations
  const highlightStyles = getStudioHighlightStyles();
  const deletedStyles = getDeletedBlockStyles();

  // Generate CSS object for each area
  const obj = areas?.map((area, idx) => {
    if (values[idx]) {
      // Case 1: Deleted area
      if (area.status === DELETED) {
        return {
          [values[idx]]: {
            border: `${deletedStyles.border} !important`,
            backgroundColor: deletedStyles.backgroundColor,
          },
        };
      }

      // Case 2: Highlighted area
      if (area.id === highlightedBlockId) {
        return {
          [values[idx]]: {
            border: `${highlightStyles.border} !important`,
            backgroundColor: highlightStyles.backgroundColor,
            boxShadow: highlightStyles.boxShadow,
            transition: highlightStyles.transition,
          },
        };
      }

      // Case 3: Normal area
      return {
        [values[idx]]: {
          border: `2px solid ${area.color} !important`,
          backgroundColor: `${hexToRgbA(area.color)}`,
        },
      };
    }

    return {};
  });

  return { "& > div": obj };
};
```

### Step 3: Update StudioAreaSelector

**File:** `src/components/Studio/StudioAreaSelector/StudioAreaSelector.jsx`

**Change 1: Update import (line 3)**

```javascript
// Before
import { constructBoxColors } from "../../../utils/ocr";

// After
import { constructBoxColors } from "../services/styling.service";
```

**Change 2: Update conditional logic (lines 199-205)**

```javascript
// Before
<div
  className={styles.block}
  css={
    activeRightTab.label === "Composite Blocks"
      ? []
      : constructBoxColors(
          areasProperties[activePage],
          highlightedBlockId
        )
  }
>

// After
<div
  className={styles.block}
  css={
    constructBoxColors(
      activeRightTab.label === "Composite Blocks"
        ? compositeBlocks.areas
        : areasProperties[activePage],
      highlightedBlockId
    )
  }
>
```

### Step 4: Clean Up OCR.js

**File:** `src/utils/ocr.js`

Remove `constructBoxColors` function (lines 93-132)

**What to keep:**
- All OCR-related functions (processOCR, extractText, etc.)
- `DELETED`, `UPDATED`, `CREATED` constants (for now - may migrate later)

**What to remove:**
- `constructBoxColors` function
- Imports related only to this function (`getStudioHighlightStyles`, `getDeletedBlockStyles` if not used elsewhere)

### Step 5: Testing

Verify the following scenarios:

#### Visual Testing Checklist

- [ ] **Regular Areas Tab**
  - [ ] Areas display with colored borders
  - [ ] Background has semi-transparent color overlay
  - [ ] Clicking an area highlights it with thick black border and shadow
  - [ ] Multiple areas show different colors from the palette

- [ ] **Composite Blocks Tab**
  - [ ] Composite block areas display with colored borders ✨ (NEW)
  - [ ] Background has semi-transparent color overlay ✨ (NEW)
  - [ ] Clicking an area highlights it with thick black border and shadow ✨ (NEW)
  - [ ] Multiple composite block areas show different colors ✨ (NEW)

- [ ] **Deleted Areas** (if applicable)
  - [ ] Deleted areas show dark black border
  - [ ] Deleted areas have semi-transparent black background

- [ ] **Tab Switching**
  - [ ] Switching from regular areas to composite blocks updates styling correctly
  - [ ] Switching back maintains proper styling
  - [ ] No console errors or warnings

- [ ] **Edge Cases**
  - [ ] Empty areas array doesn't cause errors
  - [ ] Highlighted block ID that doesn't exist doesn't cause errors
  - [ ] Multiple highlighted clicks work correctly

## Visual States Reference

### 1. Normal Area

**Styling:**
```javascript
{
  border: "2px solid ${area.color}",
  backgroundColor: "rgba(..., 0.2)"  // 20% opacity of area color
}
```

**Appearance:**
- Thin colored border matching the area's assigned color
- Light semi-transparent background fill
- No shadow

### 2. Highlighted Area

**Styling:**
```javascript
{
  border: "4px solid #000",
  backgroundColor: "rgba(0, 0, 0, 0.2)",
  boxShadow: "0 0 15px rgba(0, 0, 0, 0.5)",
  transition: "all 0.3s ease-in-out"
}
```

**Appearance:**
- Thick black border (4px)
- Semi-transparent black background
- Prominent shadow around the box
- Smooth transition animation

### 3. Deleted Area

**Styling:**
```javascript
{
  border: "2px solid #000",
  backgroundColor: "rgba(0, 0, 0, 0.5)"
}
```

**Appearance:**
- Black border (2px)
- Dark semi-transparent black background (50% opacity)
- No shadow

## Before/After Comparison

### Before

```
Regular Areas Tab:
┌──────────────┐
│ Area 1       │ ← Purple border + background ✓
└──────────────┘
┌──────────────┐
│ Area 2       │ ← Orange border + background ✓
└──────────────┘

Composite Blocks Tab:
┌──────────────┐
│ Block Area 1 │ ← No colored styling ✗
└──────────────┘
┌──────────────┐
│ Block Area 2 │ ← No colored styling ✗
└──────────────┘
```

### After

```
Regular Areas Tab:
┌──────────────┐
│ Area 1       │ ← Purple border + background ✓
└──────────────┘
┌──────────────┐
│ Area 2       │ ← Orange border + background ✓
└──────────────┘

Composite Blocks Tab:
┌──────────────┐
│ Block Area 1 │ ← Purple border + background ✓ (NEW!)
└──────────────┘
┌──────────────┐
│ Block Area 2 │ ← Orange border + background ✓ (NEW!)
└──────────────┘
```

## Dependencies

### Function Dependencies

**`constructBoxColors` requires:**

1. **`getStudioHighlightStyles()`** - `src/config/highlighting.js`
   - Returns highlight styling config (border, background, shadow)

2. **`getDeletedBlockStyles()`** - `src/config/highlighting.js`
   - Returns deleted area styling config

3. **`hexToRgbA(hex)`** - `src/utils/helper.js`
   - Converts hex color to RGBA format with 0.2 opacity
   - Example: `#800080` → `rgba(128, 0, 128, 0.2)`

4. **`DELETED` constant** - `src/utils/ocr.js`
   - Status constant for deleted areas
   - Value: `"deleted"`

### Import Structure

```javascript
// styling.service.js imports
import { getStudioHighlightStyles, getDeletedBlockStyles } from '../../../config/highlighting';
import { hexToRgbA } from '../../../utils/helper';
import { DELETED } from '../../../utils/ocr';

// StudioAreaSelector.jsx imports
import { constructBoxColors } from "../services/styling.service";
```

## Files Modified

| File | Type | Changes |
|------|------|---------|
| `docs/COMPOSITE_BLOCKS_STYLING_PLAN.md` | CREATE | This documentation file |
| `src/components/Studio/services/styling.service.js` | CREATE | New styling service with `constructBoxColors` |
| `src/components/Studio/StudioAreaSelector/StudioAreaSelector.jsx` | UPDATE | Import path + conditional logic (2 changes) |
| `src/utils/ocr.js` | UPDATE | Remove `constructBoxColors` function (~40 lines) |

**Total lines changed:** ~50-60 lines

## Benefits

### Immediate Benefits

1. **Visual Consistency** - Composite block areas now have the same professional styling as regular areas
2. **Better UX** - Users can easily distinguish and identify different composite block areas by color
3. **Highlighting Support** - Composite blocks can be highlighted when selected, improving user feedback
4. **Better Code Organization** - Styling logic moved to semantically correct location

### Long-term Benefits

1. **Maintainability** - Studio styling logic is centralized in one service
2. **Extensibility** - Easy to add more styling utilities to the service
3. **Testing** - Styling logic can be tested in isolation
4. **Clarity** - Clear separation between OCR utilities and styling utilities

## Risk Assessment

**Risk Level:** LOW

**Rationale:**
- Data structures are fully compatible
- No changes to function logic (just relocation)
- Simple conditional change in component
- Easy to roll back if issues occur

**Potential Issues:**
- Import path errors (easily caught during testing)
- Missing dependencies (build will fail, easy to fix)

## Rollback Plan

If issues occur after deployment:

1. **Immediate Rollback:**
   ```javascript
   // Revert StudioAreaSelector.jsx to:
   css={
     activeRightTab.label === "Composite Blocks"
       ? []
       : constructBoxColors(areasProperties[activePage], highlightedBlockId)
   }
   ```

2. **Keep Service File:**
   - Leave `styling.service.js` in place for future use
   - No harm in having it even if not used

3. **Restore OCR.js** (if needed):
   - Re-add `constructBoxColors` to `src/utils/ocr.js`
   - Revert import in StudioAreaSelector

## Future Enhancements

### Optional: Migrate Status Constants

**Move from:** `src/utils/ocr.js`
**Move to:** `src/components/Studio/constants/studio.constants.js`

```javascript
// Add to studio.constants.js
export const AREA_STATUS = {
  DELETED: "deleted",
  UPDATED: "updated",
  CREATED: "new",
};
```

**Benefit:** Better organization, constants grouped with related code

### Optional: Additional Styling Utilities

Consider adding to `styling.service.js`:

```javascript
/**
 * Gets the next color from the color palette
 * @param {number} currentIndex - Current color index
 * @returns {Object} { color: string, nextIndex: number }
 */
export const getNextAreaColor = (currentIndex) => {
  // Implementation
};

/**
 * Generates CSS for area hover effects
 * @param {string} color - Area color
 * @returns {Object} Emotion CSS object
 */
export const getAreaHoverStyles = (color) => {
  // Implementation
};
```

## Related Documentation

- **Studio Refactoring Plan:** `docs/2025-11-06/STUDIO_REFACTORING_PLAN.md`
- **Phase 1 Refactoring:** `docs/2025-11-06/PHASE_1_REFACTORING.md`
- **Area Selector Debug Guide:** `docs/debugging/STUDIO_AREA_SELECTOR_DEBUG_GUIDE.md`
- **Highlight Colors Plan:** `docs/HIGHLIGHT_COLORS_UPDATE_PLAN.md`

## Color Palette Reference

**Source:** `src/constants/highlight-color.js`

```javascript
export const colors = [
  "#800080",   // Purple
  "#FFA500",   // Orange
  "#ff0000",   // Red
  "#f8ff00",   // Yellow
  "#a41a1a",   // Dark Red
  "#10ff00",   // Lime Green
  "#00ffd9",   // Cyan
];
```

Colors are assigned sequentially to areas in the order they're created.

## Questions & Answers

### Q: Why not just fix the conditional without moving the function?

**A:** While that would solve the immediate issue, it leaves the code organization problem unaddressed. Styling logic doesn't belong in `ocr.js` (OCR utilities). Moving it to a proper service improves long-term maintainability.

### Q: Will this affect existing functionality?

**A:** No. Regular areas will continue to work exactly as before. We're only adding styling support for composite blocks, which currently have no styling.

### Q: What if composite blocks need different styling than regular areas?

**A:** The function already supports different styling through the `highlightedBlockId` and `status` properties. If future requirements need completely different styling, we can easily add a new function to the styling service (e.g., `constructCompositeBlockStyles`).

### Q: Why create a service instead of a utility file?

**A:** The Phase 3 refactoring plan designates services for business logic. Color and styling logic is business logic (not a simple helper function). This also matches the existing pattern (`coordinate.service.js`).

---

**Document Version:** 1.0
**Created:** 2025-12-18
**Last Updated:** 2025-12-18
**Status:** Ready for Implementation
