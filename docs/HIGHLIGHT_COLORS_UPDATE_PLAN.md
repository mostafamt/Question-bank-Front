# Highlight Colors and Shadow Update Plan

**Date:** 2025-11-27
**Author:** Claude Code
**Status:** Planning

## Objective

Update the Studio component's highlighting system to match the Book component's highlighting implementation, ensuring consistent visual appearance across both authoring (Studio) and reading (Book) modes.

## Current State Analysis

### Book Component Highlighting

**Location:** `src/components/Book/BookViewer/BookViewer.jsx`

**Configuration:** `src/config/highlighting.js`

**Current Styles:**
```javascript
{
  border: "4px solid #FF6B00",           // Orange border
  backgroundColor: "rgba(255, 107, 0, 0.2)", // Semi-transparent orange
  boxShadow: "0 0 15px rgba(255, 107, 0, 0.5)", // Glowing shadow effect
  zIndex: 1000,
  transition: "all 0.3s ease-in-out",
}
```

**Features:**
- Centralized configuration
- Helper functions (`getHighlightStyles()`)
- Auto-clear timeout (5 seconds)
- Multiple color schemes available (Orange, Blue, Green, Purple, Red)
- Smooth transitions
- Prominent visual feedback with glow effect

### Studio Component Highlighting

**Location:** `src/utils/ocr.js` (function: `constructBoxColors()`)

**Current Styles:**
```javascript
{
  border: "4px solid #000",              // Black border
  backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent black
  // NO box-shadow
}
```

**Issues:**
- Hardcoded black color `#000`
- No shadow/glow effect
- Inconsistent with Book highlighting
- Less prominent visual feedback
- No centralized configuration

### Area Border Colors

**Location:** `src/constants/highlight-color.js`

**Current Colors:**
```javascript
[
  "#800080", // Purple
  "#FFA500", // Orange
  "#ff0000", // Red
  "#f8ff00", // Yellow
  "#a41a1a", // Dark Red
  "#10ff00", // Green
  "#00ffd9", // Cyan
]
```

**Usage:** Applied to individual area borders (not highlights)

## Problems to Solve

1. **Inconsistent Highlight Colors**
   - Studio uses black (#000)
   - Book uses orange (#FF6B00)
   - User confusion when switching between authoring and reading modes

2. **Missing Shadow Effect**
   - Studio lacks the glowing shadow effect
   - Highlighted blocks less prominent in Studio

3. **Hardcoded Values**
   - Studio highlight color is hardcoded in `constructBoxColors()`
   - No easy way to change or configure

4. **No Centralized Configuration**
   - Studio doesn't use the existing `highlighting.js` config
   - Duplicate styling logic

## Proposed Solution

### Phase 1: Centralize Highlight Configuration

**1.1 Update `src/config/highlighting.js`**

Add Studio-specific highlight configuration:

```javascript
export const HIGHLIGHT_CONFIG = {
  // ... existing config ...

  // ==================== Studio Highlighting ====================

  /**
   * Styles for Studio component highlighting
   * Matches Book reader for consistency
   */
  STUDIO_STYLES: {
    border: "4px solid #FF6B00",
    backgroundColor: "rgba(255, 107, 0, 0.2)",
    boxShadow: "0 0 15px rgba(255, 107, 0, 0.5)",
    transition: "all 0.3s ease-in-out",
  },

  /**
   * Styles for deleted blocks in Studio
   */
  DELETED_BLOCK_STYLES: {
    border: "2px solid #000",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
};
```

**1.2 Add Helper Functions**

```javascript
/**
 * Get highlight styles for Studio component
 * @returns {Object} Styles object for highlighted blocks in Studio
 */
export const getStudioHighlightStyles = () => {
  return HIGHLIGHT_CONFIG.STUDIO_STYLES;
};

/**
 * Get deleted block styles for Studio component
 * @returns {Object} Styles object for deleted blocks
 */
export const getDeletedBlockStyles = () => {
  return HIGHLIGHT_CONFIG.DELETED_BLOCK_STYLES;
};
```

### Phase 2: Update Studio Component

**2.1 Update `src/utils/ocr.js`**

Modify the `constructBoxColors()` function to use centralized config:

```javascript
import {
  getStudioHighlightStyles,
  getDeletedBlockStyles
} from "../config/highlighting";

export const constructBoxColors = (trialAreas, highlightedBlockId) => {
  const values = trialAreas?.map((_, idx) => `& > div:nth-of-type(${idx + 2})`);
  const highlightStyles = getStudioHighlightStyles();
  const deletedStyles = getDeletedBlockStyles();

  const obj = trialAreas?.map((trialArea, idx) => {
    if (values[idx]) {
      if (trialArea.status === DELETED) {
        return {
          [values[idx]]: deletedStyles,
        };
      } else {
        if (trialArea.id === highlightedBlockId) {
          // Use centralized highlight styles
          return {
            [values[idx]]: {
              ...highlightStyles,
              border: `${highlightStyles.border} !important`,
            },
          };
        } else {
          return {
            [values[idx]]: {
              border: `2px solid ${trialArea.color} !important`,
              backgroundColor: `${hexToRgbA(trialArea.color)}`,
            },
          };
        }
      }
    } else {
      return {};
    }
  });

  return { "& > div": obj };
};
```

**Changes:**
- Import highlight config functions
- Replace hardcoded `#000` with `getStudioHighlightStyles()`
- Add box-shadow to highlighted blocks
- Add transition for smooth effect
- Use `getDeletedBlockStyles()` for deleted blocks

**2.2 Update `hexToRgbA()` Usage**

Ensure the `hexToRgbA()` function properly handles the new orange color:

```javascript
// Example in ocr.js
const hexToRgbA = (hex, alpha = 0.2) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};
```

### Phase 3: Testing & Verification

**3.1 Visual Testing**

Test highlighting in both components:

1. **Studio Component:**
   - Navigate to a block from Glossary/Keywords tab
   - Navigate to a block from other tabs
   - Verify orange highlight with shadow
   - Verify highlight clears properly
   - Check deleted blocks still show black

2. **Book Component:**
   - Navigate to blocks from tabs
   - Verify orange highlight with shadow
   - Verify auto-clear timeout works
   - Compare side-by-side with Studio

**3.2 Functional Testing**

- Ensure highlighting doesn't break existing functionality
- Verify block navigation works correctly
- Test with multiple blocks on same page
- Test highlight timeout behavior

### Phase 4: Optional Enhancements

**4.1 Add Color Scheme Selection**

Allow users to choose highlight color scheme:

```javascript
// In highlighting.js
export const setHighlightColorScheme = (scheme) => {
  const colors = HIGHLIGHT_CONFIG.COLOR_SCHEMES[scheme];
  HIGHLIGHT_CONFIG.STYLES = { ...HIGHLIGHT_CONFIG.STYLES, ...colors };
  HIGHLIGHT_CONFIG.STUDIO_STYLES = { ...HIGHLIGHT_CONFIG.STUDIO_STYLES, ...colors };
};
```

**4.2 Add Highlight Intensity Control**

Allow adjusting shadow intensity:

```javascript
export const setHighlightIntensity = (intensity) => {
  // intensity: 'low', 'medium', 'high'
  const shadowSizes = {
    low: '0 0 5px',
    medium: '0 0 15px',
    high: '0 0 25px',
  };
  // Update config...
};
```

## File Changes Summary

### Files to Modify

1. **`src/config/highlighting.js`**
   - Add `STUDIO_STYLES` configuration
   - Add `DELETED_BLOCK_STYLES` configuration
   - Add `getStudioHighlightStyles()` helper
   - Add `getDeletedBlockStyles()` helper

2. **`src/utils/ocr.js`**
   - Import highlight config functions
   - Update `constructBoxColors()` to use centralized config
   - Replace hardcoded `#000` with config values
   - Add box-shadow and transition

### Files to Review (No Changes)

1. **`src/constants/highlight-color.js`**
   - Keep as-is (used for area borders, not highlights)

2. **`src/components/Book/BookViewer/BookViewer.jsx`**
   - No changes needed (already using config)

## Implementation Order

1. ✅ **Step 1:** Update `highlighting.js` with Studio config
2. ✅ **Step 2:** Update `ocr.js` to use centralized config
3. ✅ **Step 3:** Test in Studio component
4. ✅ **Step 4:** Test in Book component
5. ✅ **Step 5:** Visual comparison and adjustments
6. ⏸️ **Step 6:** Optional enhancements (future)

## Expected Benefits

1. **Consistency:** Same highlight appearance in Studio and Book
2. **Maintainability:** Single source of truth for highlight styles
3. **Visibility:** Improved prominence with shadow effect
4. **Flexibility:** Easy to change colors/styles globally
5. **User Experience:** Better visual feedback when navigating

## Rollback Plan

If issues arise:

1. Revert `ocr.js` to use hardcoded black
2. Keep `highlighting.js` changes for future use
3. Document any specific issues encountered
4. Create targeted fixes for edge cases

## Notes

- The `hexToRgbA()` function may need adjustment if not already present
- CSS-in-JS (emotion) syntax used in Studio via `css` prop
- Ensure `!important` flag maintained for border overrides
- Consider z-index conflicts if highlights appear behind elements

## Success Criteria

- [ ] Studio highlighted blocks match Book appearance
- [ ] Box-shadow visible and consistent
- [ ] Orange color (#FF6B00) used in both components
- [ ] No visual regressions in existing functionality
- [ ] Deleted blocks maintain black appearance
- [ ] Normal (non-highlighted) blocks unchanged
- [ ] Smooth transitions working

## References

- Book implementation: `src/components/Book/BookViewer/BookViewer.jsx:39-70`
- Current config: `src/config/highlighting.js:39-45`
- Studio highlighting: `src/utils/ocr.js:89-124`
- Area colors: `src/constants/highlight-color.js:1-9`
