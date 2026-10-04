# Feature Plan: Conditional AreaSelector Removal Based on showBlocksStyling

**Date:** August 8, 2026  
**Author:** Claude Code  
**Status:** Planning  

---

## Overview

This plan outlines the implementation of a feature to conditionally remove the AreaSelector component from StudioAreaSelector when `showBlocksStyling` is `false`. When this flag is false, the application should operate in a **view-and-play mode** where users can only interact with existing blocks without the ability to create new ones.

---

## Problem Statement

Currently, when `showBlocksStyling` is false, the AreaSelector is still rendered and users can theoretically create new blocks. However, the intent of this flag is to indicate that styling/creation UI should be hidden. This creates a mismatch between the UI state and the intended user interaction model.

**Use Case:** A read-only viewer or presentation mode where users can view and interact with educational blocks but cannot create or modify them.

---

## Current State Analysis

### Key Files Involved

1. **`src/components/Studio/Studio.jsx`**
   - Manages `showBlocksStyling` state (line 75)
   - Passes it to `StudioLayout` (line 464-465)

2. **`src/components/Studio/components/StudioLayout.jsx`**
   - Forwards `showBlocksStyling` and `setShowBlocksStyling` to `StudioEditor` (lines 56-57, 100-101)

3. **`src/components/Studio/StudioEditor/StudioEditor.jsx`**
   - Receives `showBlocksStyling` from `StudioLayout` (line 26)
   - Passes it to `StudioAreaSelector` (line 61)
   - Has a toggle button for `showBlocksStyling` (line 56)

4. **`src/components/Studio/StudioAreaSelector/StudioAreaSelector.jsx`** ⭐ **MAIN COMPONENT**
   - Receives `showBlocksStyling` as prop (line 53)
   - Currently uses it only to conditionally apply inline styles to blocks (lines 100-102, 366)
   - Renders `<AreaSelector>` component from `@bmunozg/react-image-area` (lines 469-493)
   - Renders inside conditional logic based on `activeRightTab.id` and other conditions

### Current AreaSelector Rendering Logic

The AreaSelector is currently rendered in the following condition (lines 465-493):

```javascript
activeRightTab.id === "block-authoring" ||
activeRightTab.id === "composite-blocks" ||
activeRightTab.id === "glossary-keywords" ||
activeRightTab.id === "illustrative-interactions" ? (
  <AreaSelector
    areas={renderedAreas}
    onChange={onChangeHandler}
    wrapperStyle={wrapperStyle}
    customAreaRenderer={customRender}
    areaProps={areaPropsConfig}
    unit="percentage"
  >
    {/* Content */}
  </AreaSelector>
) : (
  // Fallback
)
```

---

## Implementation Strategy

### Phase 1: Core Logic Change (StudioAreaSelector)

**File:** `src/components/Studio/StudioAreaSelector/StudioAreaSelector.jsx`

#### Change 1.1: Modify Rendering Logic

When `showBlocksStyling` is `false`, bypass the `AreaSelector` component and render the image in a plain read-only container instead.

**Current Logic (lines 465-514):**
```
if (isReaderMode) {
  // Reader mode rendering
} else if (readOnly) {
  // Read-only mode rendering
} else if (highlight === "hand") {
  // Hand-highlight mode rendering
} else if (specific tabs) {
  // AreaSelector mode (WITH CREATION CAPABILITY)
} else {
  // Default rendering
}
```

**New Logic:**
```
if (isReaderMode) {
  // Reader mode rendering (unchanged)
} else if (!showBlocksStyling) {
  // NEW: When styling is disabled, render blocks but NO AreaSelector
  // This is like read-only mode but in Studio component
  // Users can see and interact with existing blocks, cannot create new ones
} else if (readOnly) {
  // Read-only mode rendering (unchanged)
} else if (highlight === "hand") {
  // Hand-highlight mode rendering (unchanged)
} else if (specific tabs) {
  // AreaSelector mode (WITH CREATION CAPABILITY)
} else {
  // Default rendering (unchanged)
}
```

#### Change 1.2: Handle Block Interaction

- When `showBlocksStyling` is false, make blocks interactive (clickable/playable) similar to read-only mode
- Maintain the ability to play/view blocks via `onPlayBlock` callback
- Disable area selection/drawing functionality

---

### Phase 2: Refactor Conditional Logic (Optional but Recommended)

**Current Issue:** The rendering logic in StudioAreaSelector has deeply nested conditionals that are hard to maintain.

**Recommendation:** Extract rendering modes into separate sub-components or utility functions:

```javascript
// Before (hard to follow)
if (isReaderMode) { ... }
else if (readOnly) { ... }
else if (highlight === "hand") { ... }
else if (activeRightTab.id === "block-authoring" || ...) { ... }
else { ... }

// After (clearer intent)
const content = getAreaSelectorContent({
  isReaderMode,
  showBlocksStyling,
  readOnly,
  highlight,
  activeRightTab
});
```

However, this refactoring is **optional** and can be deferred to a later phase.

---

## Implementation Steps

### Step 1: Update StudioAreaSelector Rendering Logic

**File:** `src/components/Studio/StudioAreaSelector/StudioAreaSelector.jsx`

1. Add a new condition to check `showBlocksStyling` early in the rendering logic
2. When `showBlocksStyling === false` and NOT in reader mode:
   - Render blocks as interactive but non-editable
   - Show blocks with their type/label information
   - Allow playing blocks via `onPlayBlock`
   - Do NOT render the `AreaSelector` component
3. Ensure this condition is checked before the AreaSelector rendering logic

**Pseudo-code location:**
```javascript
// Around line 378 in StudioAreaSelector.jsx
if (isReaderMode) {
  // existing reader mode
} else if (!showBlocksStyling && !readOnly) {
  // NEW: View-and-play mode (Studio component in view mode)
  return (
    <VirtualBlocks {...props}>
      <div ref={pageContainerRef} className={styles.block}>
        <div style={{ position: "relative" }}>
          {areas[activePage]?.map((area, idx) => {
            const areaProps = areasProperties[activePage]?.[idx];
            if (!areaProps?.blockId) return null;

            return (
              <div
                key={idx}
                style={getBlockStyle(area, idx)}
                onClick={() => onAreaClick?.({ areaNumber: idx + 1 })}
              >
                {customRender({ areaNumber: idx + 1, isChanging: false })}
              </div>
            );
          })}
          <WhiteAreaOverlay {...} />
          <img src={getImageSource()} ... />
        </div>
      </div>
    </VirtualBlocks>
  );
} else if (readOnly) {
  // existing read-only mode
} else {
  // ... rest of the logic
}
```

### Step 2: Verify Block Styling When showBlocksStyling is False

**File:** `src/components/Studio/StudioAreaSelector/StudioAreaSelector.jsx` - `getBlockStyle()` function

Current behavior already handles this (lines 99-102), but verify that:
- When `showBlocksStyling` is false, blocks show no border/background styling
- Blocks still maintain proper positioning and click handling
- No visual disruption to the view-and-play experience

### Step 3: Test Interaction Flow

Verify the following user flows work correctly:

1. **Normal Studio Mode** (showBlocksStyling = true)
   - AreaSelector renders ✓
   - Users can create new blocks ✓
   - Users can edit existing blocks ✓
   - Blocks have styling (borders, backgrounds) ✓

2. **View-and-Play Mode** (showBlocksStyling = false)
   - AreaSelector does NOT render ✓
   - Users can see blocks on the page ✓
   - Users can click blocks to view details ✓
   - Users can play/interact with blocks ✓
   - No drawing/creating capability ✓
   - Blocks have minimal/no styling ✓

3. **Toggle Behavior**
   - Toggling `showBlocksStyling` in ImageActions switches between modes ✓
   - UI updates correctly without page reload ✓

### Step 4: Update UI Controls (if needed)

**File:** `src/components/ImageActions/ImageActions.jsx`

- Verify that the toggle button for `showBlocksStyling` is appropriately labeled
- Consider if the label needs updating to reflect "View Mode" vs "Edit Mode"
- Current implementation likely has a toggle button (referenced in line 56 of StudioEditor)

---

## Technical Considerations

### 1. State Management
- `showBlocksStyling` is already properly managed through Zustand/React state
- No additional state management needed
- Toggle mechanism already exists in ImageActions component

### 2. Block Interaction Modes
- **Read-Only Mode**: User viewing a saved book (no creation, only viewing/playing)
- **View-and-Play Mode**: Studio component with `showBlocksStyling = false` (no creation, only viewing/playing)
- These modes are conceptually similar and can share rendering logic

### 3. Performance Impact
- No significant performance impact expected
- Removing AreaSelector (large library component) might actually improve performance in view mode
- Conditional rendering is minimal overhead

### 4. Backwards Compatibility
- This change should be backwards compatible
- `showBlocksStyling = true` maintains existing behavior
- No breaking changes to APIs or props

---

## Edge Cases to Consider

1. **Switching modes while viewing a block**
   - Ensure modal/detail view is closed when toggling `showBlocksStyling`
   - Or maintain state gracefully

2. **Keyboard/Mobile Interaction**
   - Ensure blocks are still accessible via keyboard in view mode
   - Touch interaction should still work on mobile devices

3. **Different Tab States**
   - Verify behavior works correctly for all right-tab options:
     - block-authoring
     - composite-blocks
     - glossary-keywords
     - illustrative-interactions
     - Others

4. **Deep Block Content**
   - Ensure deep block content (text, image, audio, video, objects) still displays correctly
   - Verify `customRender()` function works in view-and-play mode

---

## Files to Modify

| File | Changes | Impact |
|------|---------|--------|
| `src/components/Studio/StudioAreaSelector/StudioAreaSelector.jsx` | Add conditional rendering logic to skip AreaSelector when `showBlocksStyling = false` | HIGH - Core change |
| `src/components/Studio/StudioEditor/StudioEditor.jsx` | Optional: Add documentation or clarify the modes | LOW - Documentation only |
| `src/components/ImageActions/ImageActions.jsx` | Optional: Update button label/tooltip for clarity | LOW - UI polish |

---

## Testing Checklist

- [ ] AreaSelector is NOT rendered when `showBlocksStyling = false`
- [ ] AreaSelector IS rendered when `showBlocksStyling = true`
- [ ] Blocks remain visible and interactive in view-and-play mode
- [ ] Toggle between modes works smoothly
- [ ] No console errors in either mode
- [ ] Block styling is correctly hidden when appropriate
- [ ] Deep block content displays correctly
- [ ] Play/view block functionality works in view-and-play mode
- [ ] Modal interactions work correctly
- [ ] Read-only mode still works as expected
- [ ] Reader mode still works as expected
- [ ] Virtual blocks still work correctly

---

## Future Enhancements

1. **Create dedicated ViewAndPlayMode component**
   - Extract common logic between read-only and view-and-play modes
   - Improve code maintainability

2. **Add Analytics/Logging**
   - Track when users switch between edit and view modes
   - Monitor usage patterns

3. **UI/UX Improvements**
   - Add visual indicators for mode (e.g., "View Mode" label)
   - Disable/hide irrelevant toolbar buttons in view mode
   - Provide keyboard shortcuts for mode switching

4. **Refactor Rendering Logic**
   - Extract rendering modes into separate sub-components
   - Use composition pattern for better code organization

---

## References

- Current `showBlocksStyling` implementation: Studio.jsx line 75
- AreaSelector rendering: StudioAreaSelector.jsx lines 465-493
- Block styling logic: StudioAreaSelector.jsx lines 73-123
- Read-only rendering pattern: StudioAreaSelector.jsx lines 411-443

---

## Questions & Notes

1. **Should we show block highlights/colors in view mode?**
   - Current: No (showBlocksStyling = false hides styling)
   - Consider: Might help users understand block structure better

2. **Should we add a mode indicator to the UI?**
   - Current: No visible indicator
   - Recommendation: Add a status badge or highlight in ImageActions toolbar

3. **Is the ImageActions toggle sufficient?**
   - Current: Yes, toggle works
   - Verify: Confirm button is discoverable and labeled clearly
