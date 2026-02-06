# Refactoring Plan: onClickDeleteArea Logic Change

## Overview

Change the logic of `onClickDeleteArea` to check existence in `areas` first before checking server status.

---

## Current Logic

```javascript
const onClickDeleteArea = React.useCallback(
  (idx) => {
    // 1. Check areasProperties first
    const areaProps = areasProperties[activePageIndex]?.[idx];

    if (!areaProps) {
      console.warn(`Cannot delete area at index ${idx}: area not found`);
      return;
    }

    // 2. Check isServer from areasProperties
    if (areaProps.isServer) {
      // Soft delete
      updateAreaProperty(idx, { status: DELETED });
    } else {
      // Hard delete from both arrays
      setAreas((prevAreas) => deleteAreaByIndex(prevAreas, activePageIndex, idx));
      setAreasProperties((prevProps) => deleteAreaByIndex(prevProps, activePageIndex, idx));
    }
  },
  [activePageIndex, areasProperties, updateAreaProperty]
);
```

### Current Flow
```
┌─────────────────────────────────┐
│ Check areasProperties[idx]      │
└─────────────────┬───────────────┘
                  │
        ┌─────────▼─────────┐
        │  areaProps exists? │
        └─────────┬─────────┘
                  │
         No ──────┼────── Yes
                  │         │
    ┌─────────────▼───┐     │
    │ Warn & Return   │     │
    └─────────────────┘     │
                            │
              ┌─────────────▼─────────────┐
              │    areaProps.isServer?    │
              └─────────────┬─────────────┘
                            │
               Yes ─────────┼─────── No
                            │
         ┌──────────────────▼──────────────────┐
         │                                      │
    ┌────▼────┐                          ┌─────▼─────┐
    │Soft Del │                          │ Hard Del  │
    │(status) │                          │(both arr) │
    └─────────┘                          └───────────┘
```

---

## Proposed Logic

```javascript
const onClickDeleteArea = React.useCallback(
  (idx) => {
    // 1. Check areas first (the source of truth for geometry)
    const area = areas[activePageIndex]?.[idx];

    if (!area) {
      console.warn(`Cannot delete area at index ${idx}: area not found in areas`);
      return;
    }

    // 2. Get corresponding areaProps for server check
    const areaProps = areasProperties[activePageIndex]?.[idx];

    // 3. Check if it's a server area
    if (areaProps?.isServer) {
      // Soft delete: mark as deleted for server sync
      updateAreaProperty(idx, { status: DELETED });
    } else {
      // Hard delete: remove from both arrays
      setAreas((prevAreas) => deleteAreaByIndex(prevAreas, activePageIndex, idx));
      setAreasProperties((prevProps) => deleteAreaByIndex(prevProps, activePageIndex, idx));
    }
  },
  [activePageIndex, areas, areasProperties, updateAreaProperty]
);
```

### Proposed Flow
```
┌─────────────────────────────────┐
│ Check areas[idx] FIRST          │
└─────────────────┬───────────────┘
                  │
        ┌─────────▼─────────┐
        │   area exists?    │
        └─────────┬─────────┘
                  │
         No ──────┼────── Yes
                  │         │
    ┌─────────────▼───┐     │
    │ Warn & Return   │     │
    └─────────────────┘     │
                            │
              ┌─────────────▼─────────────┐
              │ Get areaProps (may be     │
              │ undefined if not synced)  │
              └─────────────┬─────────────┘
                            │
              ┌─────────────▼─────────────┐
              │   areaProps?.isServer?    │
              └─────────────┬─────────────┘
                            │
               Yes ─────────┼─────── No/undefined
                            │
         ┌──────────────────▼──────────────────┐
         │                                      │
    ┌────▼────┐                          ┌─────▼─────┐
    │Soft Del │                          │ Hard Del  │
    │(status) │                          │(both arr) │
    └─────────┘                          └───────────┘
```

---

## Key Differences

| Aspect | Current | Proposed |
|--------|---------|----------|
| **Primary check** | `areasProperties[idx]` | `areas[idx]` |
| **Server check** | `areaProps.isServer` | `areaProps?.isServer` |
| **Handles missing areaProps** | Returns early | Treats as non-server (hard delete) |
| **Dependency array** | `[..., areasProperties, ...]` | `[..., areas, areasProperties, ...]` |

---

## Rationale

### Why check `areas` first?

1. **Source of Truth**: `areas` is the primary data structure containing the geometry/coordinates. It's what the user sees on screen.

2. **Sync Issues**: There may be cases where `areas` and `areasProperties` are out of sync (as we've seen in previous bugs). Checking `areas` first ensures we're validating against what's actually rendered.

3. **Graceful Degradation**: If `areasProperties` is missing an entry (sync bug), the function can still:
   - Validate the area exists in `areas`
   - Treat it as a non-server area (safe to hard delete)
   - Clean up both arrays

### Edge Cases Handled

| Scenario | Current Behavior | Proposed Behavior |
|----------|------------------|-------------------|
| Area in `areas` but not in `areasProperties` | Crashes or warns | Hard deletes from `areas` |
| Area in `areasProperties` but not in `areas` | Soft/hard delete | Warns and returns (nothing to delete) |
| Both arrays have area, `isServer=true` | Soft delete | Soft delete |
| Both arrays have area, `isServer=false` | Hard delete | Hard delete |

---

## Implementation

### Changes Required

**File**: `src/components/Studio/hooks/useAreaManagement.js`

```javascript
/**
 * Handle area deletion
 * - First checks if area exists in areas array
 * - Server areas: Mark as DELETED status (soft delete)
 * - Client areas: Remove from both arrays (hard delete)
 * @param {number} idx - Index of area to delete
 */
const onClickDeleteArea = React.useCallback(
  (idx) => {
    // 1. Check areas first (source of truth for rendered areas)
    const area = areas[activePageIndex]?.[idx];

    if (!area) {
      console.warn(`Cannot delete area at index ${idx}: area not found in areas`);
      return;
    }

    // 2. Get corresponding areaProps for server status check
    const areaProps = areasProperties[activePageIndex]?.[idx];

    // 3. Determine delete strategy based on server status
    if (areaProps?.isServer) {
      // Soft delete: mark as deleted for server sync
      updateAreaProperty(idx, { status: DELETED });
    } else {
      // Hard delete: remove from both arrays using callback form
      setAreas((prevAreas) =>
        deleteAreaByIndex(prevAreas, activePageIndex, idx)
      );
      setAreasProperties((prevProps) =>
        deleteAreaByIndex(prevProps, activePageIndex, idx)
      );
    }
  },
  [activePageIndex, areas, areasProperties, updateAreaProperty]
);
```

---

## Testing Checklist

### Test Cases

- [ ] **Delete new client area**: Draw a new area → Delete → Should remove from both arrays
- [ ] **Delete server area**: Load page with existing blocks → Delete → Should mark as DELETED status
- [ ] **Delete with sync issue**: If `areas` has item but `areasProperties` doesn't → Should hard delete from `areas`
- [ ] **Delete non-existent**: Try to delete index that doesn't exist → Should warn and return
- [ ] **Delete on different pages**: Switch pages → Delete → Should use correct `activePageIndex`
- [ ] **Rapid deletions**: Delete multiple areas quickly → Should handle correctly

### Verification Steps

1. Open Studio with a page that has existing server blocks
2. Draw a new area (client-side)
3. Delete the new area → Verify it's removed from both arrays
4. Delete a server area → Verify it's marked as DELETED, not removed
5. Check console for any warnings or errors

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Adding `areas` to dependencies causes extra re-renders | Low | Low | `areas` changes are already triggering re-renders elsewhere |
| Missing `areaProps` causes unintended hard delete | Low | Medium | This is actually desired behavior for orphaned areas |
| Stale closure on `areas` | Low | Medium | Using callback form for state updates |

---

## Rollback Plan

If issues arise:
```bash
git revert <commit-hash>
```

The previous implementation is preserved in git history.
