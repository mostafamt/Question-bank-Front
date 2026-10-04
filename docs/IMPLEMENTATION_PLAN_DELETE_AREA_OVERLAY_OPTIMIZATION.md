# Implementation Plan: Delete Area Overlay Optimization

## Overview
Optimize the `onClickDeleteArea` function in `useAreaManagement` hook to skip overlay rendering for non-server-side areas/blocks. This prevents unnecessary white background overlays when deleting areas that haven't been persisted to the server yet.

## Problem Statement
Currently, when a deep block (an area with child objects) is deleted, the system always stores its coordinates in `deletedDeepBlockAreas` for white background rendering during snapshot capture. However, this is unnecessary for areas that haven't been saved to the server yet (`isServer: false`), because:

1. **No Snapshot Exists**: Client-only areas have never been captured in a page snapshot
2. **No Overlay Needed**: There's no existing snapshot image that needs white area overlays
3. **Cleaner State**: Reduces unnecessary data tracking for transient areas

## Current Behavior
In `useAreaManagement.js`, the `onClickDeleteArea` function (lines 167-202):
```javascript
const onClickDeleteArea = React.useCallback(
  (idx) => {
    // ... validation ...
    
    // CURRENT: Always stores deleted deep blocks, regardless of isServer status
    if (isDeepBlock(areaProps)) {
      addDeletedDeepBlockArea(area, areaProps);  // ← Always called
    }
    
    // Then handle deletion based on server status
    if (areaProps?.isServer) {
      updateAreaProperty(idx, { status: DELETED });
    } else {
      // Hard delete
    }
  },
  [activePageIndex, areas, areasProperties, updateAreaProperty]
);
```

## Proposed Solution
Modify the deep block storage logic to only track deleted areas that are server-side:

```javascript
const onClickDeleteArea = React.useCallback(
  (idx) => {
    // ... validation ...
    
    // UPDATED: Only store deleted deep blocks if they're server-side
    if (isDeepBlock(areaProps) && areaProps?.isServer) {
      addDeletedDeepBlockArea(area, areaProps);
    }
    
    // Then handle deletion (unchanged)
    if (areaProps?.isServer) {
      updateAreaProperty(idx, { status: DELETED });
    } else {
      // Hard delete
    }
  },
  [activePageIndex, areas, areasProperties, updateAreaProperty]
);
```

## Key Changes

### File: `src/components/Studio/hooks/useAreaManagement.js`

**Location**: Lines 180-185 (within `onClickDeleteArea` function)

**Current Code**:
```javascript
// 3. Check if this is a deep block and store coordinates for white rendering
if (isDeepBlock(areaProps)) {
  addDeletedDeepBlockArea(area, areaProps);
}
```

**Updated Code**:
```javascript
// 3. Check if this is a deep block and store coordinates for white rendering
// Only store if it's server-side (has a snapshot to render the overlay on)
if (isDeepBlock(areaProps) && areaProps?.isServer) {
  addDeletedDeepBlockArea(area, areaProps);
}
```

## Why This Works

1. **Server-side blocks** (`isServer: true`):
   - Have been persisted and appear in snapshots
   - Need white background overlays when deleted
   - Are soft-deleted (status: DELETED) to maintain server consistency
   - Overlay prevents showing the deleted block's visual in the snapshot

2. **Client-side blocks** (`isServer: false`):
   - Are transient, never persisted
   - Have no snapshot to render on
   - Are hard-deleted immediately
   - No overlay needed since there's no snapshot to render it on

## Testing Checklist

- [ ] Delete a client-side deep block (never saved)
  - Verify it's removed immediately without overlay
  - Check `deletedDeepBlockAreas` doesn't include this block
  
- [ ] Delete a server-side deep block (already saved)
  - Verify it's soft-deleted with `status: DELETED`
  - Check `deletedDeepBlockAreas` includes this block
  - Verify white overlay appears during snapshot capture
  
- [ ] Delete a client-side regular block
  - Verify it's hard-deleted without issues
  
- [ ] Delete a server-side regular block
  - Verify it's soft-deleted with `status: DELETED`

## Performance Impact
- **Positive**: Reduces unnecessary entries in `deletedDeepBlockAreas` state
- **Memory**: Smaller state object when editing pages with many unsaved blocks
- **Snapshot**: Smaller snapshot overlay data when capturing

## Backward Compatibility
✅ Fully compatible - only affects deletion flow for new/unsaved areas. Already-saved areas follow the same path.

## Related Code References
- `addDeletedDeepBlockArea()` - Lines 220-236 (unchanged)
- `isDeepBlock()` - Utility to check if area is a deep block
- `capturePageSnapshot()` - Uses `deletedDeepBlockAreas` for white overlays
- `deleteAreaByIndex()` - Utility for hard deletion

## Implementation Steps
1. Open `src/components/Studio/hooks/useAreaManagement.js`
2. Locate the `onClickDeleteArea` callback (line 167)
3. Find the deep block check (line 183)
4. Add `&& areaProps?.isServer` condition to the `if` statement
5. Save file
6. Run tests to verify deletion behavior
7. Manual testing with server and client areas

## Notes
- This is a low-risk optimization that improves state management
- No breaking changes to the API
- Improves clarity of intent: overlays are only for persisted blocks
