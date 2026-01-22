# StudioAreaSelector Reader Mode Enhancement Plan

**Date:** 2026-01-01
**Status:** Planning
**Component:** `src/components/Studio/StudioAreaSelector/StudioAreaSelector.jsx`

## Overview

Update the StudioAreaSelector component to render blocks differently in reader mode, matching the appearance and behavior of the BookViewer component.

## Current Behavior

### BookViewer (Reader-Focused Component)

**File:** `src/components/Book/BookViewer/BookViewer.jsx`

**Block Rendering (Lines 118-125):**
```javascript
{areas?.map((area) => (
  <button
    key={area.blockId}
    className={styles["area-button"]}
    style={getStyle(area)}
    onClick={() => onClickArea(area)}
  ></button>
))}
```

**Styling (bookViewer.module.scss lines 52-68):**
```scss
.area-button {
  position: absolute;
  background-color: transparent;
  border: 0;
  background-color: rgba(#eee, 0.1);
  box-shadow: rgba(0, 0, 0, 0.1) 0px 1px 3px,
              rgba(0, 0, 0, 0.1) 0px 1px 2px;

  &:hover {
    box-shadow: rgba(0, 0, 0, 0.12) 0px 1px 3px,
                rgba(0, 0, 0, 0.24) 0px 1px 2px;
    background-color: rgba(#eee, 0.5);
  }
}
```

**Characteristics:**
- ✅ Renders as `<button>` elements
- ✅ Minimal visual impact (subtle shadow)
- ✅ Transparent background with slight tint
- ✅ onClick plays the block content
- ✅ Clean, unobtrusive appearance
- ✅ Hover effect for discoverability
- ✅ No text labels or type indicators

### StudioAreaSelector (Current Implementation)

**File:** `src/components/Studio/StudioAreaSelector/StudioAreaSelector.jsx`

**Read-Only Mode (Lines 237-266):**
```javascript
{readOnly ? (
  <div style={{ position: "relative" }}>
    {areas[activePage]?.map((area, idx) => {
      const areaProps = areasProperties[activePage]?.[idx];
      if (!areaProps?.blockId) return null;

      return (
        <div
          key={idx}
          style={{
            position: "absolute",
            top: `${area.y}%`,
            left: `${area.x}%`,
            width: `${area.width}%`,
            height: `${area.height}%`,
            border: `2px solid ${areaProps.color || "#000"}`,
            backgroundColor: areaProps.color
              ? hexToRgbA(areaProps.color)
              : "rgba(0, 0, 0, 0.2)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={() => onAreaClick?.({ areaNumber: idx + 1 })}
        >
          {customRender({ areaNumber: idx + 1, isChanging: false })}
        </div>
      );
    })}
  </div>
) : ...}
```

**Characteristics:**
- ⚠️ Renders as `<div>` elements
- ⚠️ Highly visible (colored borders and backgrounds)
- ⚠️ Shows text labels (type and label name)
- ⚠️ onClick only calls onAreaClick (no play functionality)
- ⚠️ More suitable for editing than reading

## Problem Statement

When StudioAreaSelector is used in **reader mode** (via ScanAndUpload on `/read/` URLs):
1. ❌ Blocks are too visually prominent (colored borders/backgrounds)
2. ❌ Shows editing-related information (type/label text)
3. ❌ Doesn't play blocks when clicked
4. ❌ Inconsistent with BookViewer's reader-focused design

## Proposed Solution

Update StudioAreaSelector to detect reader mode and render blocks like BookViewer when in reader mode.

### Design Goals

1. **Visual Consistency:** Match BookViewer's subtle, shadow-based appearance
2. **Functional Consistency:** Clicking blocks should play them in reader mode
3. **Mode-Appropriate:** Studio mode keeps existing editing-focused UI
4. **Maintainability:** Share styling where possible, minimize duplication

## Implementation Plan

### Phase 1: Detection & Prop Changes

**Step 1.1: Add Mode Detection**

StudioAreaSelector needs to know if it's in reader mode.

**Option A: Pass reader prop from parent**
```javascript
// In Studio.jsx
<StudioEditor
  // ... existing props
  isReaderMode={isReaderMode}
/>

// In StudioEditor.jsx
<StudioAreaSelector
  // ... existing props
  isReaderMode={isReaderMode}
/>
```

**Option B: Use useAppMode hook directly**
```javascript
// In StudioAreaSelector.jsx
import { useAppMode } from '../../../utils/tabFiltering';

const StudioAreaSelector = (props) => {
  const mode = useAppMode();
  const isReaderMode = mode === 'reader';
  // ...
};
```

**Recommendation:** Option B (direct hook usage) - simpler, no prop drilling

**Step 1.2: Add Play Block Callback**

StudioAreaSelector needs a callback to play blocks in reader mode.

```javascript
// In StudioEditor.jsx (or Studio.jsx)
const onPlayBlock = (area) => {
  const block = areasProperties[activePage]?.find(
    (prop) => prop.blockId === area.id
  );
  if (block) {
    openModal('play-object', {
      id: block.text, // Assuming text contains object ID
      type: block.type,
    });
  }
};

// Pass to StudioAreaSelector
<StudioAreaSelector
  // ... existing props
  onPlayBlock={onPlayBlock}
/>
```

### Phase 2: Styling Changes

**Step 2.1: Create Reader Mode Styles**

Add styles to `studioAreaSelector.module.scss`:

```scss
// Add to studioAreaSelector.module.scss
.reader-area-button {
  position: absolute;
  background-color: transparent;
  border: 0;
  background-color: rgba(#eee, 0.1);
  box-shadow: rgba(0, 0, 0, 0.1) 0px 1px 3px,
              rgba(0, 0, 0, 0.1) 0px 1px 2px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    box-shadow: rgba(0, 0, 0, 0.12) 0px 1px 3px,
                rgba(0, 0, 0, 0.24) 0px 1px 2px;
    background-color: rgba(#eee, 0.5);
  }

  &:active {
    transform: scale(0.98);
  }
}
```

**Step 2.2: Apply Conditional Styling**

Update render logic to use different styles based on mode:

```javascript
const getBlockStyle = (area, idx) => {
  if (isReaderMode) {
    // Reader mode: simple percentage positioning
    return {
      position: "absolute",
      top: `${area.y}%`,
      left: `${area.x}%`,
      width: `${area.width}%`,
      height: `${area.height}%`,
    };
  } else {
    // Studio mode: existing colored style
    const areaProps = areasProperties[activePage]?.[idx];
    return {
      position: "absolute",
      top: `${area.y}%`,
      left: `${area.x}%`,
      width: `${area.width}%`,
      height: `${area.height}%`,
      border: `2px solid ${areaProps.color || "#000"}`,
      backgroundColor: areaProps.color
        ? hexToRgbA(areaProps.color)
        : "rgba(0, 0, 0, 0.2)",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    };
  }
};
```

### Phase 3: Render Logic Changes

**Step 3.1: Conditional Rendering**

Update the readOnly section to render differently based on mode:

```javascript
{readOnly ? (
  <div style={{ position: "relative" }}>
    {areas[activePage]?.map((area, idx) => {
      const areaProps = areasProperties[activePage]?.[idx];
      if (!areaProps?.blockId) return null;

      // Reader mode: simple button with shadow
      if (isReaderMode) {
        return (
          <button
            key={area.id || idx}
            className={styles["reader-area-button"]}
            style={getBlockStyle(area, idx)}
            onClick={() => onPlayBlock?.(area, areaProps)}
            aria-label={`Play ${areaProps.type || 'content'}`}
          />
        );
      }

      // Studio mode: existing colored div with labels
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
    {/* Image rendering stays the same */}
    <img
      src={pages[activePage]?.url}
      alt={pages[activePage]?.url || pages[activePage]}
      crossOrigin="anonymous"
      ref={ref}
      style={{
        width: `${imageScaleFactor * 100}%`,
        height: `${imageScaleFactor * 100}%`,
        overflow: "scroll",
      }}
      onLoad={onImageLoad}
    />
  </div>
) : ...}
```

### Phase 4: Integration with Studio Component

**Step 4.1: Update Studio.jsx**

Pass isReaderMode to StudioEditor:

```javascript
// In Studio.jsx
<StudioEditor
  // ... existing props
  isReaderMode={isReaderMode}
/>
```

**Step 4.2: Update StudioEditor.jsx**

Pass through to StudioAreaSelector:

```javascript
// In StudioEditor.jsx
const StudioEditor = React.forwardRef((props, ref) => {
  const { isReaderMode, /* ... other props */ } = props;

  return (
    <StudioAreaSelector
      // ... existing props
      isReaderMode={isReaderMode}
      onPlayBlock={handlePlayBlock}
    />
  );
});
```

**Step 4.3: Implement Play Block Handler**

```javascript
// In StudioEditor.jsx or Studio.jsx
const handlePlayBlock = (area, areaProps) => {
  const { openModal } = useStore();

  if (areaProps?.text) {
    openModal('play-object', {
      id: areaProps.text,
      type: areaProps.type,
    });
  }
};
```

## Detailed Comparison

### Visual Appearance

| Aspect | Studio Mode (Current) | Reader Mode (Proposed) |
|--------|----------------------|------------------------|
| **Element Type** | `<div>` | `<button>` |
| **Border** | 2px solid colored | None |
| **Background** | Colored with opacity | Subtle gray tint |
| **Shadow** | None | Subtle box-shadow |
| **Text Content** | Type + Label name | None (clean) |
| **Hover Effect** | None | Enhanced shadow + background |
| **Visual Weight** | High (editing focus) | Low (reading focus) |

### Behavior Comparison

| Action | Studio Mode | Reader Mode |
|--------|-------------|-------------|
| **Click Block** | onAreaClick (metadata) | onPlayBlock (play content) |
| **Hover** | No change | Shadow intensifies |
| **Purpose** | Select for editing | Play/view content |
| **Discoverability** | Highly visible | Subtle but discoverable |

### Code Structure

```
StudioAreaSelector
├── isReaderMode (from useAppMode hook)
├── Render Logic
│   ├── readOnly === true
│   │   ├── isReaderMode === true
│   │   │   └── Render as BookViewer-style buttons
│   │   └── isReaderMode === false
│   │       └── Render as colored divs (current)
│   ├── highlight === "hand"
│   │   └── Hand tool mode (unchanged)
│   └── else (AreaSelector for editing)
│       └── Editing mode (unchanged)
```

## Files to Modify

### 1. StudioAreaSelector.jsx

**Changes:**
- Import `useAppMode` hook
- Add `onPlayBlock` prop
- Add `isReaderMode` detection
- Add `getBlockStyle` helper function
- Update readOnly rendering logic
- Add conditional rendering based on mode

**Estimated Lines:** ~50 lines changed/added

### 2. studioAreaSelector.module.scss

**Changes:**
- Add `.reader-area-button` class
- Add hover/active states

**Estimated Lines:** ~20 lines added

### 3. StudioEditor.jsx

**Changes:**
- Add `isReaderMode` prop passthrough
- Add `handlePlayBlock` function
- Pass `onPlayBlock` to StudioAreaSelector

**Estimated Lines:** ~15 lines added

### 4. Studio.jsx

**Changes:**
- Pass `isReaderMode` to StudioEditor

**Estimated Lines:** ~1 line changed

## Testing Plan

### Test 1: Visual Appearance

**Reader Mode (`/read/book/...`):**
- [ ] Blocks have subtle shadow (not colored borders)
- [ ] Blocks have minimal background tint
- [ ] No text labels visible on blocks
- [ ] Hover increases shadow intensity
- [ ] Cursor changes to pointer on hover

**Studio Mode (`/book/...`):**
- [ ] Blocks have colored borders (existing)
- [ ] Blocks show type/label text (existing)
- [ ] Existing functionality unchanged

### Test 2: Click Behavior

**Reader Mode:**
- [ ] Clicking block opens play modal
- [ ] Correct content is played
- [ ] Modal displays properly

**Studio Mode:**
- [ ] Clicking block triggers onAreaClick
- [ ] Existing behavior unchanged

### Test 3: Mode Switching

- [ ] Navigate from studio → reader: blocks update appearance
- [ ] Navigate from reader → studio: blocks revert to studio style
- [ ] No console errors during mode switch

### Test 4: Edge Cases

- [ ] Page with no blocks: no errors
- [ ] Page with many blocks: all render correctly
- [ ] Blocks with missing blockId: handled gracefully
- [ ] Zoom in/out: blocks scale correctly

## Benefits

### For Users

✅ **Consistent Experience:** Reader mode in Studio matches BookViewer appearance
✅ **Less Visual Clutter:** Subtle shadows instead of colored borders/labels
✅ **Playable Blocks:** Clicking blocks plays them (like BookViewer)
✅ **Better Reading Focus:** Minimal UI distraction in reader mode

### For Developers

✅ **Mode-Appropriate UI:** Different UX for different purposes
✅ **Shared Styling:** Reuse BookViewer's proven design
✅ **Clear Separation:** Reader vs Studio mode clearly distinguished
✅ **Maintainable:** Centralized mode detection via useAppMode

## Potential Challenges

### Challenge 1: Block ID Mapping

**Issue:** BookViewer uses `area.blockId` while StudioAreaSelector might use different ID structure

**Solution:** Normalize ID access in getBlockStyle and click handlers

### Challenge 2: Play Modal Integration

**Issue:** Need to ensure correct object ID and type are passed to play modal

**Solution:** Extract object ID from areasProperties[activePage][idx].text

### Challenge 3: Highlighting

**Issue:** BookViewer applies highlight styles differently

**Solution:** Reuse existing highlightedBlockId logic with conditional styling

## Future Enhancements

1. **Accessibility:** Add ARIA labels and keyboard navigation for reader mode blocks
2. **Animations:** Add subtle entrance animations for blocks
3. **Preview on Hover:** Show small preview tooltip on hover in reader mode
4. **Analytics:** Track which blocks are played most in reader mode
5. **Customization:** Allow users to adjust shadow intensity/color

## Migration Strategy

### Phase 1: Implementation (This Plan)
- Implement reader mode rendering
- Test in isolation
- No breaking changes to studio mode

### Phase 2: Gradual Rollout
- Enable for specific users/routes
- Collect feedback
- Iterate on styling

### Phase 3: Full Deployment
- Enable for all reader mode URLs
- Monitor performance
- Optimize if needed

## Success Criteria

- [ ] Reader mode blocks visually match BookViewer
- [ ] Clicking blocks in reader mode plays content
- [ ] Studio mode functionality unchanged
- [ ] No performance degradation
- [ ] No console errors
- [ ] All tests passing

## Timeline Estimate

| Phase | Tasks | Time |
|-------|-------|------|
| **Setup** | Import hooks, add props | 30 min |
| **Styling** | Create reader mode styles | 30 min |
| **Logic** | Update render logic | 1 hour |
| **Integration** | Wire up play functionality | 1 hour |
| **Testing** | All test scenarios | 1 hour |
| **Refinement** | Polish and edge cases | 30 min |
| **Total** | | **4.5 hours** |

## Summary

This plan updates StudioAreaSelector to render blocks like BookViewer when in reader mode, providing:
- **Subtle visual appearance** (shadows instead of colored borders)
- **Playable blocks** (clicking plays content)
- **Consistent reader experience** (matches BookViewer)
- **Preserved studio functionality** (editing mode unchanged)

The implementation uses mode detection (`useAppMode` hook) to conditionally render blocks as simple, shadow-styled buttons in reader mode, while maintaining the existing colored, labeled appearance in studio mode.

## Questions for Confirmation

Before implementation, please confirm:

1. ✅ **Visual Match:** Should reader mode blocks exactly match BookViewer's shadow style?
2. ✅ **Click Behavior:** Should clicking blocks in reader mode open the play modal?
3. ✅ **Studio Mode:** Should studio mode keep its current appearance (colored borders/labels)?
4. ✅ **Hover Effect:** Should reader mode include the hover effect (shadow intensifies)?
5. ⚠️ **Play Modal:** Which modal should be used to play blocks? (play-object modal?)

Please review this plan and confirm it matches your requirements before I proceed with implementation.
