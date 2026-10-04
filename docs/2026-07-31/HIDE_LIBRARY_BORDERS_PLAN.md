# Plan: Hide React-Image-Area Library Default Borders

## Problem Analysis

When `showBlocksStyling` is toggled OFF, the toggle button hides our custom borders/backgrounds via the `constructBoxColors()` function. However, the **react-image-area library** (@bmunozg/react-image-area) renders its own default grey dashed borders on area elements, which are still visible.

### Current State
- Our emotion CSS-in-JS styles are removed when toggle is OFF ✓
- Library's default grey dashed border still appears ✗
- Blocks appear with unwanted grey borders instead of clean, borderless view

### Root Cause
The AreaSelector component from react-image-area has built-in default styling that renders a grey dashed border on area divs. This is independent of our custom styling system.

## Solution Overview

We have **three approaches** to hide the library's default borders:

### Approach A: CSS Override with !important (Recommended - Simplest)
**Pros:** 
- Minimal code changes
- Easy to maintain and understand
- Works immediately

**Cons:**
- Uses !important (not ideal but necessary to override library styles)

### Approach B: Dynamic CSS Classes
**Pros:**
- Cleaner CSS without !important
- More maintainable

**Cons:**
- Requires adding CSS classes to StudioAreaSelector
- More complex prop threading

### Approach C: Emotion CSS Conditional Override
**Pros:**
- Keeps styling centralized
- No CSS classes needed

**Cons:**
- Requires modifying emotion CSS logic
- Slightly more complex

## Recommended Implementation: Approach A

### Step 1: Identify Library Selectors
The react-image-area library applies default border styling to area divs. These are typically:
- Direct children of the AreaSelector wrapper
- Have data attributes like `data-id` or similar
- Display with `position: absolute`

Common selectors:
```css
/* Library default area styling */
[data-id] { /* or similar */
  border: 2px dashed rgb(128, 128, 128);
  /* other default styles */
}
```

### Step 2: Override via CSS Module or Emotion

**Option 1: CSS Module Override** (Simplest)
In `studioAreaSelector.module.scss`, add:

```scss
.block {
  /* existing styles */
  
  /* Override library default borders when styling is hidden */
  &.hideBlocksStyling {
    /* Target all area elements and remove their default border */
    & > div:nth-of-type(n+2) {
      border: none !important;
      background-color: transparent !important;
    }
  }
}
```

Then in StudioAreaSelector.jsx, conditionally apply the class:
```jsx
<div
  ref={pageContainerRef}
  className={clsx(styles.block, !showBlocksStyling && styles.hideBlocksStyling)}
  css={constructBoxColors(...)}
>
```

**Option 2: Emotion CSS Override** (Alternative)
Modify the emotion css prop to include library border overrides:

```jsx
css={css`
  ${constructBoxColors(...)}
  
  /* Override library default borders */
  ${!showBlocksStyling && `
    & > div:nth-of-type(n+2) {
      border: none !important;
      background-color: transparent !important;
    }
  `}
`}
```

### Step 3: Implementation Choice

For this codebase, **Option 1 (CSS Module)** is preferred because:
1. The project already uses SCSS modules consistently
2. Less invasive - doesn't modify emotion CSS logic
3. Easier to debug and maintain
4. Follows existing patterns in studioAreaSelector.module.scss

## Implementation Steps

### 1. Update SCSS Module
File: `src/components/Studio/StudioAreaSelector/studioAreaSelector.module.scss`

Add new class after line 59:
```scss
.hideBlocksStyling {
  & > div:nth-of-type(n+2) {
    border: none !important;
    background-color: transparent !important;
  }
}
```

### 2. Update JSX
File: `src/components/Studio/StudioAreaSelector/StudioAreaSelector.jsx`

Change the className on the block div:
```jsx
// Current:
className={styles.block}

// Updated:
className={clsx(styles.block, !showBlocksStyling && styles.hideBlocksStyling)}
```

Note: `clsx` is already imported in the file

### 3. Verify Emotion CSS Still Works
The emotion `css` prop should continue working as-is:
```jsx
css={constructBoxColors(
  readOnly ? [] : activeRightTab.id === "composite-blocks" 
    ? compositeBlocks.areas || [] 
    : areasProperties[activePage] || [],
  highlightedBlockId,
  showBlocksStyling
)}
```

## CSS Selector Explanation

### Current Selector Chain
```scss
& .block {
  & > div:last-child {
    & > div:not(:first-child) {
      & {
        border: 2px solid green;
      }
    }
  }
}
```

This targets:
- `.block` container
- Its last child div (wrapper from AreaSelector)
- All div children except the first one (first is the image)
- Applies green border

### New Selector for Hiding
```scss
.hideBlocksStyling {
  & > div:nth-of-type(n+2) {
    border: none !important;
    background-color: transparent !important;
  }
}
```

This targets:
- Applied only when toggle is OFF
- All div children starting from 2nd position (skips image at position 1)
- Removes border with `!important` to override library styles
- Removes background color

The `nth-of-type(n+2)` is equivalent to `:nth-child(n+2)` but targets only div elements, ensuring we skip the image.

## Why !important?

The react-image-area library applies inline styles or has higher CSS specificity. Using `!important` is necessary here because:
1. We're overriding a third-party library's default styles
2. The library's styles have high specificity or are inline
3. This is a common pattern when overriding library behavior
4. It's only used on this specific override, not throughout the codebase

## Testing Checklist

- [ ] Toggle button is visible and clickable
- [ ] When toggle is ON: blocks show normal styling (borders + backgrounds)
- [ ] When toggle is OFF: blocks have no visible borders or backgrounds
- [ ] No grey dashed border appears when toggle is OFF
- [ ] Blocks remain interactive/clickable in both states
- [ ] Hover effects still work (if applicable)
- [ ] Works across all pages
- [ ] No console errors or warnings
- [ ] Emotion CSS and SCSS overrides don't conflict

## Files to Modify

1. `src/components/Studio/StudioAreaSelector/studioAreaSelector.module.scss`
   - Add `.hideBlocksStyling` class
   
2. `src/components/Studio/StudioAreaSelector/StudioAreaSelector.jsx`
   - Update className with conditional class

## Rollback Plan

If issues arise:
1. Remove the `.hideBlocksStyling` class from SCSS
2. Remove the `clsx` conditional from className
3. Blocks will show with library's default grey border again

## Future Improvements

1. Consider contributing to react-image-area library to add a "no border" mode
2. Add CSS variable for controlling library border appearance
3. Create a theming system for library overrides

---

**Status:** Ready for implementation  
**Complexity:** Low  
**Risk:** Very Low (CSS-only changes, no logic changes)
