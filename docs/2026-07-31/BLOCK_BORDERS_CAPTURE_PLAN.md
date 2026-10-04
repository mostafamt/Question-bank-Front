# Plan: Hide Block Borders When Capturing Page Snapshot

## Problem Statement

When capturing a page snapshot for deep blocks via `capturePageSnapshot()` (called from `useAreaManagement.onClickSubmit()`), the area block borders and backgrounds are still visible in the captured image.

**Current Flow:**
```
useAreaManagement.onClickSubmit()
  ↓
  checks if there's a deep block
  ↓
  calls capturePageSnapshot(pageContainerRef.current)
  ↓
  html2canvas tries to strip borders via onclone hook
  ↓
  ISSUE: Borders still appear in the image
```

**Root Cause:**

The area boxes are rendered by `@bmunozg/react-image-area` and their borders/backgrounds are applied through:

1. **Emotion CSS-in-JS styling** (from `constructBoxColors()` in `styling.service.js`):
   - Selectors like `& > div:nth-of-type(${idx + 2})`
   - Applied via `css` prop on the container div
   - These styles target nested area boxes

2. **Inline styles** (from `getBlockStyle()` in `StudioAreaSelector.jsx`):
   - Border and backgroundColor set directly on area elements
   - Applied only when `showBlocksStyling` is true

3. **Structure Complexity:**
   - The `pageContainerRef` points to the `.block` div (class from `StudioAreaSelector`)
   - Area boxes are nested inside `AreaSelector` component from external library
   - Direct children stripping may not reach the actual area elements

## Solutions

### Solution 1: Temporarily Disable Block Styling During Capture ⭐ RECOMMENDED

**Approach:**
- Before capturing, temporarily set `showBlocksStyling = false` to hide all block borders
- This removes all CSS styling from area boxes
- Capture the page with clean styling
- Restore the styling after capture

**Advantages:**
- ✅ Cleanest and most reliable solution
- ✅ Works with current architecture (no new code needed)
- ✅ Already supported - `showBlocksStyling` prop is already passed to components
- ✅ Blocks all border sources at once (inline + CSS-in-JS)
- ✅ Minimal risk and side effects

**Implementation:**
1. Add `showBlocksStyling` state to `useAreaManagement` hook
2. Set it to `false` before capturing
3. Pass it to `StudioEditor` component
4. Pass it to `StudioAreaSelector` component
5. Restore it to `true` after capture

**Files to Modify:**
- `src/components/Studio/hooks/useAreaManagement.js` - Add state, pass to capture
- `src/components/Studio/StudioEditor/StudioEditor.jsx` - Pass prop
- `src/components/Studio/StudioAreaSelector/StudioAreaSelector.jsx` - Respects prop (already does!)
- `src/components/Studio/services/pageCapture.service.js` - Optional: could document this

### Solution 2: Enhanced Border Stripping in Capture Service

**Approach:**
- Enhance `capturePageSnapshot()` to use more aggressive selectors
- Target not just direct children, but all nested elements with borders
- Use multiple selectors to catch all possible border sources

**Implementation:**
```javascript
onclone: (clonedDoc, clonedEl) => {
  // Current: only direct children
  Array.from(clonedEl.children).forEach((child) => {
    child.style.setProperty('border', 'none', 'important');
    child.style.setProperty('background-color', 'transparent', 'important');
    child.style.setProperty('box-shadow', 'none', 'important');
  });
  
  // NEW: Also target nested elements
  clonedEl.querySelectorAll('[style*="border"], [style*="background"]')
    .forEach((el) => {
      el.style.setProperty('border', 'none', 'important');
      el.style.setProperty('background-color', 'transparent', 'important');
      el.style.setProperty('box-shadow', 'none', 'important');
    });
}
```

**Advantages:**
- ✅ Handles deeply nested elements
- ✅ Standalone solution in capture service

**Disadvantages:**
- ❌ Doesn't handle Emotion CSS-in-JS (computed styles)
- ❌ Less reliable for complex styling scenarios
- ❌ May miss some edge cases

### Solution 3: Add Temporary CSS Class

**Approach:**
- Add a temporary CSS class (e.g., `.no-borders-for-capture`) to the container
- Define CSS rules that override all border styles
- Remove class after capture

**Advantages:**
- ✅ Handles Emotion CSS-in-JS through CSS specificity
- ✅ Centralized in CSS file

**Disadvantages:**
- ❌ More complex than Solution 1
- ❌ Requires adding CSS rules
- ❌ Less direct control

### Solution 4: Use `showBlocksStyling` Flag Directly

**Current State:**
- The `showBlocksStyling` prop is ALREADY defined in `StudioAreaSelector` (line 52)
- The prop is ALREADY being used in styling logic
- `constructBoxColors()` checks `showBlocksStyling` parameter (line 60)
- `getBlockStyle()` checks `showBlocksStyling` parameter (line 92)

**Why This is the Best Solution:**
- The infrastructure is already in place
- No new code patterns needed
- Just need to pass the prop through the component tree

## Recommended Implementation Path

### Phase 1: Implement Solution 1 (Temporary Style Disable)

1. **Modify `useAreaManagement.js`:**
   ```javascript
   // Add state
   const [showBlocksStyling, setShowBlocksStyling] = useState(true);
   
   // In onClickSubmit, before capture:
   setShowBlocksStyling(false);
   const pageSnapshot = await capturePageSnapshot(pageContainerRef.current);
   setShowBlocksStyling(true);
   ```

2. **Pass through component tree:**
   - `useAreaManagement` → returns `showBlocksStyling`
   - `StudioEditor` → receives from parent, passes to `StudioAreaSelector`
   - `StudioAreaSelector` → already respects the prop

3. **Testing:**
   - Verify borders disappear before capture
   - Verify snapshot has no borders
   - Verify UI restores borders after capture
   - Check with various block types (text, image, audio, video, objects)

### Phase 2: Clean Up (Optional)

If Solution 1 works well:
- Document the `showBlocksStyling` prop usage in component JSDoc
- Consider adding a helper function in `pageCapture.service.js`:
  ```javascript
  export async function capturePageSnapshotWithoutBorders(
    containerEl,
    showBlocksStylingCallback
  ) {
    // Hide blocks, capture, restore
  }
  ```

## Edge Cases to Consider

1. **Multiple Deep Blocks on Same Page:**
   - Should work fine - style toggle happens once per capture

2. **Rapid Submit Clicks:**
   - Race condition possible if user clicks submit multiple times quickly
   - Solution: Use `loadingSubmit` flag (already exists!) to prevent multiple submissions

3. **Composite Blocks:**
   - These also render with borders via `constructBoxColors()`
   - Solution 1 handles this since it's the same styling system

4. **Reader Mode:**
   - Reader mode doesn't show borders anyway (line 68-76 in `StudioAreaSelector`)
   - No impact on reader functionality

5. **Virtual Blocks Toggle:**
   - Virtual blocks overlay also uses same styling
   - May also hide on capture (might be desired behavior)

## Success Criteria

- ✅ Captured image shows no block borders
- ✅ Captured image shows no block backgrounds
- ✅ Deep block content (text, images, audio, video, objects) is captured correctly
- ✅ UI remains responsive and styling is restored
- ✅ Works with all block types
- ✅ No console errors or warnings
- ✅ No performance regression

## Files Reference

**Key Files:**
- `src/components/Studio/hooks/useAreaManagement.js` - Where capture is triggered
- `src/components/Studio/services/pageCapture.service.js` - Where capture happens
- `src/components/Studio/StudioAreaSelector/StudioAreaSelector.jsx` - Renders areas with borders
- `src/components/Studio/services/styling.service.js` - Generates border styles
- `src/components/Studio/StudioEditor/StudioEditor.jsx` - Parent component

**Related:**
- `src/components/Studio/types/studio.types.js` - Type definitions
- `src/components/Studio/constants/studio.constants.js` - Constants

## Implementation Checklist

- [ ] Add `showBlocksStyling` state to `useAreaManagement`
- [ ] Modify `onClickSubmit` to toggle the state
- [ ] Update prop drilling through `StudioEditor`
- [ ] Verify prop is received in `StudioAreaSelector`
- [ ] Test with deep blocks of different types
- [ ] Test capture functionality end-to-end
- [ ] Verify styling is restored after capture
- [ ] Check for any console errors
- [ ] Update component JSDoc comments if needed
- [ ] Clean up any debug console.log statements

## Alternative: Direct css Prop Manipulation

Instead of state toggle, could manipulate `css` prop directly:
```javascript
const pageSnapshot = await capturePageSnapshot(
  pageContainerRef.current,
  () => ({ "& > div": [] }) // Empty styles
);
```

But this requires changing function signature and is less clean than Solution 1.
