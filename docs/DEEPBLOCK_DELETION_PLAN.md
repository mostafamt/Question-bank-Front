# Deep Block Deletion with White Background Feature

## Overview
When deleting a deep block (an area with `isDeep: true`), the area should be visually removed from the editor but rendered as white/empty in the page snapshot. This ensures that when capturing the page, the deleted deep block area appears blank instead of showing the original page content.

## Problem Statement
Currently, when a deep block area is deleted:
- The area is removed from the `areas` and `areasProperties` arrays
- On page snapshot, the original page content is visible in that location
- This creates an inconsistency between what the editor shows and what the snapshot shows

## Solution Architecture

### State Management
Add a new state to track deleted deep block areas:
```javascript
const [deletedDeepBlockAreas, setDeletedDeepBlockAreas] = useState([]);
// Structure per page: deletedDeepBlockAreas[pageIndex] = [
//   { x, y, width, height, unit: 'percentage' },
//   ...
// ]
```

### Step-by-Step Implementation

#### Step 1: Detect Deep Blocks During Deletion
In `useAreaManagement.js` > `onClickDeleteArea()`:
- Import `isDeepBlock` utility (already used elsewhere in file)
- When deleting an area, check if `areaProps` is a deep block
- If it's a deep block, store its coordinates in `deletedDeepBlockAreas` state

**Pseudo-code:**
```javascript
const onClickDeleteArea = (idx) => {
  const area = areas[activePageIndex]?.[idx];
  const areaProps = areasProperties[activePageIndex]?.[idx];
  
  if (!area || !areaProps) return;
  
  // Check if this is a deep block
  if (isDeepBlock(areaProps)) {
    // Store for white area rendering
    storeDeletedDeepBlockArea(area, areaProps);
  }
  
  // Proceed with existing deletion logic...
  if (areaProps?.isServer) {
    updateAreaProperty(idx, { status: DELETED });
  } else {
    // Hard delete...
  }
};
```

#### Step 2: Render White Areas During Display
Create a new component or utility to render deleted deep block areas with white background:

**Location:** `src/components/Studio/StudioAreaSelector/` or `StudioEditor/`

**Responsibility:**
- Render visual white rectangles over deleted deep block areas
- These are only for visual feedback, not interactive
- Positioned using percentage-based coordinates from `deletedDeepBlockAreas`

**Implementation approach:**
- Create a `<WhiteAreaOverlay />` component that renders on top of the base image
- Use the same coordinate conversion logic as regular areas
- Apply white background color with appropriate opacity/z-index

#### Step 3: Include White Areas in Page Snapshot
Modify snapshot capture to include white area overlays:

**Current flow:**
1. User has deepBlocks → `hasDeepBlock = true`
2. Hide block styling: `setShowBlocksStyling(false)`
3. Capture snapshot: `capturePageSnapshot()`
4. Restore block styling: `setShowBlocksStyling(true)`

**New flow:**
1. User has deepBlocks → `hasDeepBlock = true`
2. Hide block styling: `setShowBlocksStyling(false)`
3. Ensure white areas are visible (add CSS class to show them)
4. Capture snapshot: `capturePageSnapshot()`
5. Restore block styling: `setShowBlocksStyling(true)`
6. Hide white areas again

**Key:** White areas should have `display: block` or visibility during snapshot, and `display: none` normally (unless actively being deleted).

#### Step 4: Clean Up Deleted Deep Block Areas
After submission or when navigating away:
- Clear `deletedDeepBlockAreas` for the current page
- Or persist across pages if needed

### Data Structure Details

**deletedDeepBlockAreas state:**
```javascript
[
  // Page 0
  [
    {
      id: "area-uuid",          // Reference to original area ID
      x: 10,                     // Pixel or percentage coords
      y: 20,
      width: 100,
      height: 150,
      unit: "percentage" | "px"  // Based on area._unit
    },
    ...
  ],
  // Page 1
  [
    ...
  ]
]
```

### File Changes Summary

| File | Change | Priority |
|------|--------|----------|
| `useAreaManagement.js` | Modify `onClickDeleteArea()` to track deleted deep blocks | P0 |
| `useAreaManagement.js` | Add `deletedDeepBlockAreas` state | P0 |
| `useAreaManagement.js` | Export new state to context | P1 |
| `StudioEditor.jsx` or `StudioAreaSelector.jsx` | Add white area rendering logic | P1 |
| `WhiteAreaOverlay.jsx` (new) | Component to render white background overlays | P1 |
| `styling.service.js` | Add helper to convert deleted areas to CSS styles | P2 |
| `pageCapture.service.js` or related | Ensure white areas are visible during snapshot | P2 |

### Coordinate System Considerations
- Deep block areas from `areaProps` contain percentage-based coordinates (`_percentX`, `_percentY`, etc.)
- Need to convert these to pixel coordinates for actual rendering
- Use existing `processPageAreas()` or `getPixelCoordinates()` utilities
- During snapshot, use the same viewport dimensions as when storing

### Visual Feedback
- White areas should be semi-transparent (e.g., `opacity: 0.7`) during editing for visibility
- Or show with a subtle border like `2px dashed #ccc` with white fill
- When `showBlocksStyling` is false, white areas should still be visible (unlike area borders)
- Color should be white (`#ffffff`) or very light gray (`#f5f5f5`)

### Edge Cases to Handle
1. **Multiple deletions on same page:** Append to array, don't replace
2. **Undo capability:** Consider if white areas should persist in state for undo (future feature)
3. **Page navigation:** Clear white areas when switching pages? Or persist?
4. **Resize/zoom:** Recalculate pixel coordinates when image dimensions change
5. **Non-deep blocks:** Ignore these, they use existing deletion flow
6. **Server vs client areas:** Both can be deep blocks, both should track white areas

## Implementation Order

1. **Phase 1 (Core Logic):**
   - Add `deletedDeepBlockAreas` state to `useAreaManagement`
   - Modify `onClickDeleteArea()` to detect and store deep blocks
   - Export new state through context

2. **Phase 2 (Visual Rendering):**
   - Create `WhiteAreaOverlay` component
   - Add it to `StudioAreaSelector` or `StudioEditor`
   - Style white area rectangles

3. **Phase 3 (Snapshot Integration):**
   - Ensure white areas are visible during `capturePageSnapshot`
   - Test that snapshots show white areas correctly
   - Verify white areas don't interfere with interactive areas

4. **Phase 4 (Polish):**
   - Add visual indicators (e.g., icon showing "area deleted")
   - Consider undo capability
   - Handle edge cases (page switching, zoom, etc.)

## Testing Checklist
- [ ] Delete a deep block area → white area appears in editor
- [ ] Delete a non-deep block area → normal deletion occurs
- [ ] Multiple deep block deletions → all show as white
- [ ] Take snapshot with deleted deep blocks → white areas appear in snapshot
- [ ] Page thumbnail updates → white areas visible in thumbnail
- [ ] Submit → white areas are NOT submitted (only areas array is sent)
- [ ] Zoom in/out → white areas adjust coordinates correctly
- [ ] Navigate to different page → white areas only on correct page
- [ ] Delete then modify block styling → white areas persist

## Notes
- The snapshot capture service (`pageCapture.service.js`) already handles stripping area selection styling
- White areas should be rendered as actual page content, not as area selection overlays
- Consider whether white areas should persist across page navigations or be page-specific
- May need to coordinate with `showBlocksStyling` state to control white area visibility
