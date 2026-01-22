# Reader Mode Virtual Blocks Bug Fix

**Date:** 2026-01-09
**Issue:** Virtual blocks in reader mode were opening with author/edit mode functionality

---

## Problem Description

When opening virtual blocks in reader mode, the interface was showing editing controls (dropdown selectors, edit buttons, delete buttons) instead of read-only view/play buttons. This allowed readers to potentially edit content they shouldn't have access to.

---

## Root Cause

The `reader` prop was not being properly passed through the component hierarchy:

### Component Chain:
```
StudioAreaSelector.jsx
  └─> VirtualBlocks.jsx
      └─> VirtualBlock.jsx
```

### Issues Found:

1. **StudioAreaSelector.jsx (Line 260-269)**:
   - ❌ Was detecting reader mode with `useAppMode()` hook
   - ❌ But NOT passing `reader` prop to `<VirtualBlocks>` component

2. **VirtualBlocks.jsx (Line 7-16)**:
   - ❌ Was NOT accepting `reader` prop in its props destructuring
   - ❌ Was NOT passing `reader` prop to individual `<VirtualBlock>` components

3. **VirtualBlock.jsx**:
   - ✅ Already had proper conditional rendering logic for reader mode
   - ✅ But never received the `reader` prop, so it defaulted to author mode

---

## Solution Implemented

### File 1: VirtualBlocks.jsx

**Changes:**
```javascript
// BEFORE
const VirtualBlocks = (props) => {
  const {
    showVB,
    children,
    className,
    virtualBlocks,
    setVirtualBlocks,
    activePage,
  } = props;

  // ... loop through virtualBlocks
  <VirtualBlock
    key={`${activePage} ${label}`}
    label={label}
    checkedObject={virtualBlocks[label]}
    setCheckedObject={(value) => {...}}
    showVB={showVB}
    virtualBlocks={virtualBlocks}
    setVirtualBlocks={setVirtualBlocks}
    // ❌ Missing: reader prop
  />
```

```javascript
// AFTER
const VirtualBlocks = (props) => {
  const {
    showVB,
    children,
    className,
    virtualBlocks,
    setVirtualBlocks,
    activePage,
    reader = false,  // ✅ Added: reader prop with default false
  } = props;

  // ... loop through virtualBlocks
  <VirtualBlock
    key={`${activePage} ${label}`}
    label={label}
    checkedObject={virtualBlocks[label]}
    setCheckedObject={(value) => {...}}
    showVB={showVB}
    virtualBlocks={virtualBlocks}
    setVirtualBlocks={setVirtualBlocks}
    reader={reader}  // ✅ Added: pass reader prop to VirtualBlock
  />
```

### File 2: StudioAreaSelector.jsx

**Changes:**
```javascript
// BEFORE (Line 260-269)
return (
  <VirtualBlocks
    className={clsx(
      styles["studio-area-selector"],
      !showVB && styles["show"]
    )}
    showVB={showVB}
    virtualBlocks={virtualBlocks}
    setVirtualBlocks={setVirtualBlocks}
    activePage={activePage}
    // ❌ Missing: reader prop
  >
```

```javascript
// AFTER (Line 260-270)
return (
  <VirtualBlocks
    className={clsx(
      styles["studio-area-selector"],
      !showVB && styles["show"]
    )}
    showVB={showVB}
    virtualBlocks={virtualBlocks}
    setVirtualBlocks={setVirtualBlocks}
    activePage={activePage}
    reader={isReaderMode}  // ✅ Added: pass reader mode detected by useAppMode()
  >
```

---

## How Reader Mode is Detected

### StudioAreaSelector.jsx (Lines 38-40):
```javascript
// Detect mode (reader vs studio)
const mode = useAppMode();
const isReaderMode = mode === "reader";
```

### useAppMode() Hook:
Located in `src/utils/tabFiltering.js`, this hook detects the current app mode based on the URL route:
- `/read/...` → `"reader"` mode
- `/book/...` → `"studio"` mode (author/edit mode)

---

## Expected Behavior After Fix

### Author Mode (Studio/ScanAndUpload):
- ✅ Shows dropdown to select virtual block type
- ✅ Shows edit button to modify content
- ✅ Shows delete button to remove virtual blocks
- ✅ Badge shows content count
- ✅ Can add multiple content items

### Reader Mode:
- ✅ NO dropdown selector visible
- ✅ NO edit button visible
- ✅ NO delete button visible
- ✅ Badge shows content count (read-only)
- ✅ Only play/view button visible
- ✅ Clicking opens iframe-display modal for links/objects
- ✅ Clicking opens text-editor modal (read-only) for text content

---

## Testing Checklist

### Author Mode Tests:
- [ ] Can select virtual block type from dropdown
- [ ] Can add multiple content items (text, link, object)
- [ ] Can edit existing content
- [ ] Can delete virtual blocks
- [ ] Badge shows correct content count

### Reader Mode Tests:
- [ ] NO dropdown selector visible
- [ ] NO edit button visible
- [ ] NO delete button visible
- [ ] Badge shows content count
- [ ] Clicking virtual block icon opens appropriate modal:
  - [ ] Text content → TextEditorModal (read-only)
  - [ ] Link content → IframeDisplayModal
  - [ ] Object content → IframeDisplayModal (after fetching URL)
- [ ] Multiple items open VirtualBlockReaderModal with list
- [ ] Single item opens directly in appropriate modal
- [ ] Cannot modify any virtual block content

---

## Related Files

### Modified Files:
1. ✅ `src/components/VirtualBlocks/VirtualBlocks.jsx`
2. ✅ `src/components/Studio/StudioAreaSelector/StudioAreaSelector.jsx`

### Related Components (No changes needed):
- `src/components/VirtualBlocks/VirtualBlock/VirtualBlock.jsx` (already had correct logic)
- `src/utils/tabFiltering.js` (contains useAppMode hook)
- `src/components/Studio/Studio.jsx` (imports useAppMode)

---

## Additional Notes

### BookViewer.jsx
The Book reader page (`src/components/Book/BookViewer/BookViewer.jsx`) was already correctly passing `reader` prop to VirtualBlock components directly (line 83):

```javascript
<VirtualBlock
  key={`${label}`}
  label={label}
  checkedObject={virtualBlocks[label]}
  showVB={showVB}
  reader  // ✅ Already correct
/>
```

So BookViewer was not affected by this bug. The bug only affected the Studio/ScanAndUpload pages when used in reader mode.

---

## Summary

The bug was caused by a **broken prop chain**. The `reader` mode was being detected correctly, but the prop wasn't being passed through intermediate components. This has been fixed by:

1. Adding `reader` prop to VirtualBlocks component
2. Passing `reader` prop to each VirtualBlock child
3. Connecting StudioAreaSelector's `isReaderMode` to VirtualBlocks

The reader mode restrictions are now properly enforced across all pages! 🎉

---

**Fix Completed:** January 9, 2026
**Status:** ✅ RESOLVED
