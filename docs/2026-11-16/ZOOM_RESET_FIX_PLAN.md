# Zoom Reset Fix Plan

**Date:** 2026-11-16
**Branch:** IBook-2-development
**File:** `src/components/ImageActions/ImageActions.jsx`
**Status:** ✅ Implemented — `onClickZoomOff` in `ImageActions.jsx`. The `oldAreas`
re-baseline from section 3 was **dropped**. `recalculateAreas`
(`Studio/hooks/useAreaManagement.js:124`) always rebuilds pixel boxes from the stored
percentages, and Studio runs it after every zoom change, so the re-baseline wasn't needed.
It would also have read stale `areas` from the timeout's closure.
**Scope:** Make the **Reset zoom** button work. No refactoring.

---

## 1. Problem

`onClickZoomOff` (`ImageActions.jsx:124-139`) has its whole body commented out. Two places call it:

- the desktop/tablet toolbar "Reset zoom" button (`ImageActions.jsx:444-448`)
- the phone ⋮ menu item "Reset zoom" (`ImageActions.jsx:334-339`)

So clicking either one does nothing.

---

## 2. Why the fix can be small

`Studio.jsx:405-431` already has an effect on `imageScaleFactor`. Whenever the zoom level
changes, it calls `recalculateAreas`, which rebuilds each block's pixel box from its stored
percentages. Pinch-zoom (`usePinchZoom`) only sets the zoom level and depends on this path.

So reset only needs to set the zoom level back to the default (`DEFAULTS.IMAGE_SCALE_FACTOR = 1`)
and trigger a recalculation. It does not need to reverse the pixel math done by zoom in/out.
Recalculating from percentages puts every block back in its exact original position.

---

## 3. Change

In `ImageActions.jsx`:

```js
import { DEFAULTS } from "../Studio/constants";

const onClickZoomOff = () => {
  setImageScaleFactor(DEFAULTS.IMAGE_SCALE_FACTOR); // 1 = fit width
  setTimeout(() => {
    onImageLoad();            // recalculate block positions at the new size
  }, 1);
};
```

`onImageLoad` is called explicitly, as zoom in/out already do. That keeps the reset working
even when the zoom level is already 1: Studio's effect doesn't run then, but blocks may
still need re-syncing.

Re-baseline `oldAreas` after reset. Zoom in/out use `oldAreas` as their reference for each
step, so it must match the blocks at 100% zoom:

```js
setOldAreas(areas?.[activePage] || []);
```

This line should run after the recalculation, inside the same `setTimeout` after
`onImageLoad()`. Zoom in/out after a reset then step from the correct sizes. The existing
re-baseline effect (`ImageActions.jsx:83-86`) only reacts to page or area-count changes, not
to zoom, so it won't do this on its own.

> If `areas` inside the timeout turns out to be stale (a closure from before the
> recalculation), the fallback is to leave `oldAreas` alone. Zoom in/out already fall back
> to `area` when no baseline is available. Confirm this during testing.

Nothing else changes: no new files, no changes to props or to consumers.

---

## 4. Files touched

| File | Change |
|------|--------|
| `src/components/ImageActions/ImageActions.jsx` | Implement `onClickZoomOff`, add `DEFAULTS` import |

---

## 5. Testing

**Manual**
1. Studio author mode: zoom in ×3, then Reset. The page and all blocks return to their original size and position.
2. Zoom out ×3, then Reset. Same result.
3. Reset, then zoom in/out again. Blocks still scale correctly with the page (checks the `oldAreas` re-baseline).
4. Reader mode: same as steps 1–3.
5. Phone width: pinch-zoom, then ⋮ → Reset zoom.
6. Change page while zoomed, then Reset. Blocks on the new page line up.
7. Sticky toolbar (after scrolling): Reset behaves the same.
8. CompositeBlocksModal: Reset returns the page to 100% (`onImageLoad` is a no-op there, which is fine).
9. Click Reset when already at 100%. Nothing breaks and nothing moves.

**Unit (optional)**
- Render `ImageActions` with mocked `useBreakpoint`/`useAppMode`, click "Reset zoom",
  and check that `setImageScaleFactor` was called with `1`.

---

## 6. Out of scope (later)

- Refactoring `ImageActions.jsx` into smaller files.
- Replacing the manual pixel math in zoom in/out with Studio's recalculation.
- Zoom limits on the buttons (zoom out can currently reach 0 or below).
- Publish spinner getting stuck when publishing fails.
