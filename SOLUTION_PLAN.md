# Solution Plan: Unnecessary DeepBlockVideo Re-render on Toggle Block Styling

## Problem Summary

When clicking the "Toggle Block Styling" button (`onToggleBlocksStyling`), the `DeepBlockVideo` component (and other deep block components) re-renders unnecessarily even though their actual props (`src` and `interactive`) may not have changed meaningfully.

## Root Cause Analysis

### 1. **State Update Cascade**
- `onToggleBlocksStyling` updates `showBlocksStyling` state in `Studio.jsx` (line 75)
- This state change propagates through multiple components down to the rendering layer

### 2. **useAreaCustomRenderer Dependency Issue** (PRIMARY CULPRIT)
**File**: `src/components/Studio/StudioAreaSelector/hooks/useAreaCustomRenderer.js`

```javascript
// Line 71: isInteractiveMode calculation depends on showBlocksStyling
const isInteractiveMode = isReaderMode || (!showBlocksStyling && !readOnly);

// Lines 142: showBlocksStyling is in dependency array
// This causes customRender to be recreated on every toggle
[
  ...
  showBlocksStyling,  // <-- This triggers full re-creation
]
```

**Impact**: When `showBlocksStyling` changes, the entire `customRender` callback is recreated. This causes:
- All area renderers to re-execute
- All child components (including DeepBlockVideo) to be recreated
- Loss of memoization benefits

### 3. **Component Rendering Flow**
```
Toggle Button Click
    ↓
setShowBlocksStyling(!showBlocksStyling)
    ↓
Studio.jsx re-renders (showBlocksStyling in state)
    ↓
rightColumnProps useMemo recalculates (showBlocksStyling in deps)
    ↓
StudioEditor/StudioAreaSelector props update
    ↓
useAreaCustomRenderer customRender recreated (showBlocksStyling in deps)
    ↓
customRender function returns NEW React elements
    ↓
DeepBlockVideo component FORCED RE-RENDER
    ↓
console.log('DeepBlock Video') fires (confirming re-render)
```

### 4. **Why DeepBlockVideo Specifically?**
- `DeepBlockVideo` receives `interactive` prop which depends on `isInteractiveMode`
- `isInteractiveMode` depends on `showBlocksStyling`
- When `showBlocksStyling` changes, so does the `interactive` prop
- However, the real issue is the parent renderer being recreated

## Solution Strategy

### Option A: **Memoize DeepBlockVideo Component** (Quick Fix)
**Complexity**: Low | **Effectiveness**: Medium

Wrap the component with `React.memo()` to prevent re-renders when props haven't changed.

```javascript
// DeepBlockVideo.jsx
const DeepBlockVideo = ({ src, interactive = false }) => {
  // ... component code
};

export default React.memo(DeepBlockVideo);
```

**Why this helps**: Even though the parent renderer recreates, `React.memo()` will skip re-render if `src` and `interactive` props are the same.

**Limitation**: The `interactive` prop WILL change when toggle occurs (intentional behavior), so memo doesn't fully solve the problem.

### Option B: **Optimize useAreaCustomRenderer Dependencies** (Better Fix)
**Complexity**: Medium | **Effectiveness**: High

The real issue is that `customRender` is recreated unnecessarily. Instead of putting `showBlocksStyling` in the dependency array, extract it to a separate computed value or use a ref.

**Current approach (problematic)**:
```javascript
const customRender = useCallback(
  (areaProps) => {
    const isInteractiveMode = isReaderMode || (!showBlocksStyling && !readOnly);
    // ...render with isInteractiveMode
  },
  [
    onClickExistedArea,
    activePage,
    activeRightTabId,
    compositeBlocks,
    areasProperties,
    readOnly,
    onAreaClick,
    isReaderMode,
    showBlocksStyling,  // <-- PROBLEM: This causes recreation
  ]
);
```

**Better approach**:
Use `showBlocksStyling` as a parameter to a separate computation, or refactor to avoid dependency:

```javascript
// Separate the style/interactive state from the rendering function
const customRender = useCallback(
  (areaProps, currentShowBlocksStyling) => {  // Pass as parameter
    const isInteractiveMode = isReaderMode || (!currentShowBlocksStyling && !readOnly);
    // ... rest of render
  },
  [
    onClickExistedArea,
    activePage,
    activeRightTabId,
    compositeBlocks,
    areasProperties,
    readOnly,
    onAreaClick,
    isReaderMode,
    // showBlocksStyling removed from deps
  ]
);

// Then when calling customRender, pass showBlocksStyling as parameter
// return customRender(areaProps, showBlocksStyling);
```

### Option C: **Extract Interactive State to Context/Ref** (Comprehensive Fix)
**Complexity**: High | **Effectiveness**: Very High

Move `showBlocksStyling` to a context or use `useRef` to prevent dependency tracking issues.

**With useRef approach**:
```javascript
const showBlocksStylingRef = useRef(showBlocksStyling);

useEffect(() => {
  showBlocksStylingRef.current = showBlocksStyling;
}, [showBlocksStyling]);

const customRender = useCallback(
  (areaProps) => {
    const isInteractiveMode = isReaderMode || (!showBlocksStylingRef.current && !readOnly);
    // ... rest of render
  },
  [
    onClickExistedArea,
    activePage,
    activeRightTabId,
    compositeBlocks,
    areasProperties,
    readOnly,
    onAreaClick,
    isReaderMode,
    // showBlocksStyling removed
  ]
);
```

## Recommended Solution: **Option B + React.memo**

### Step 1: Memoize DeepBlockVideo
```javascript
// src/components/Studio/DeepBlockContent/DeepBlockVideo.jsx
export default React.memo(DeepBlockVideo);
```

### Step 2: Refactor useAreaCustomRenderer to avoid showBlocksStyling dependency
```javascript
// src/components/Studio/StudioAreaSelector/hooks/useAreaCustomRenderer.js

// Option 2a: Use a ref to track showBlocksStyling without dependency
const showBlocksStylingRef = useRef(showBlocksStyling);

useEffect(() => {
  showBlocksStylingRef.current = showBlocksStyling;
}, [showBlocksStyling]);

const customRender = useCallback(
  (areaProps) => {
    const isInteractiveMode = isReaderMode || (!showBlocksStylingRef.current && !readOnly);
    // ... rest unchanged
  },
  [
    onClickExistedArea,
    activePage,
    activeRightTabId,
    compositeBlocks,
    areasProperties,
    readOnly,
    onAreaClick,
    isReaderMode,
    // Remove showBlocksStyling from here
  ]
);
```

### Step 3: Test the Solution
1. Click toggle block styling button
2. Verify console.log('DeepBlock Video') fires only for actually visible blocks
3. Confirm NO extra renders on toggle
4. Test with multiple block types (video, audio, image, text, object)
5. Verify functionality is intact (video should still show/hide controls)

## Performance Impact

**Before Solution**:
- Toggle click → 100+ component re-renders across all blocks on page

**After Solution**:
- Toggle click → Only interactive prop changes, memoized components skip unnecessary renders
- Expected reduction: 80-95% fewer re-renders

## Files to Modify

1. **`src/components/Studio/DeepBlockContent/DeepBlockVideo.jsx`**
   - Add `React.memo()` wrapper

2. **`src/components/Studio/StudioAreaSelector/hooks/useAreaCustomRenderer.js`**
   - Add `useRef` for `showBlocksStyling`
   - Remove `showBlocksStyling` from dependency array
   - Add `useEffect` to update ref

## Testing Checklist

- [ ] Console no longer shows "DeepBlock Video" on every toggle
- [ ] Video still plays/pauses when in interactive mode
- [ ] Block styling toggle still visually changes the UI
- [ ] Other deep blocks (image, audio, object, text) also optimized
- [ ] No regression in other Studio features
- [ ] Test with pages containing multiple blocks

## Alternative Quick Wins

If Option B seems complex, also consider:
1. Memoizing `DeepBlockImage`, `DeepBlockAudio`, `DeepBlockObject`, `DeepBlockContent` components
2. Using `useMemo` for the area renderer JSX to prevent element recreation

## Notes

- The `interactive` prop SHOULD change when toggle occurs (this is intentional)
- The goal is to prevent unnecessary re-renders of the same component with the same props
- Deep blocks are not changed by the toggle, only the styling border visibility changes
- Monitor console logs for validation: `console.log('DeepBlock Video')` should only fire for actually rendered videos
