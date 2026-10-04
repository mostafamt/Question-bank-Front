# Feature Plan: Manual "White Overlay" Button in ImageActions

**Date:** August 13, 2026
**Author:** Claude Code
**Status:** Planning

---

## Overview

Add a new button to `ImageActions` (`src/components/ImageActions/ImageActions.jsx`) that lets the user draw a rectangle directly on the page image. That rectangle becomes a permanent white overlay: it's rendered as a solid white box on top of the underlying page content, and when the page snapshot is captured on submit, the white box is baked into the image — visually "deleting" whatever content was underneath.

This reuses the existing white-overlay mechanism built for deep-block deletion (see `bug: fix delete with overlay white`, commit `90f6cb8`, and `docs/DEEPBLOCK_DELETION_PLAN.md`), generalizing it to also accept manually-drawn regions instead of only regions derived from deleting a deep block.

**Confirmed UX (from user):**
- Clicking the button arms a "white-out" drawing mode.
- The user drags a rectangle on the page image (same drag interaction the existing `AreaSelector` uses).
- The rectangle is immediately rendered as a white box.
- Multiple white-out rectangles can be added.
- Each one can be individually deleted/undone before submit (like a normal area).
- It is persisted the same way deep-block white overlays are persisted today: baked into `pageSnapshot` on submit — there is no separate backend field for it.

---

## Current Mechanism (what already exists and will be reused)

1. **State:** `Studio.jsx` → `useAreaManagement.js` owns `deletedDeepBlockAreas`, a 2D array (`deletedDeepBlockAreas[pageIndex] = [{ id, x, y, width, height, unit }]`), created via `addDeletedDeepBlockArea()` when a deep block is deleted (`onClickDeleteArea`, `src/components/Studio/hooks/useAreaManagement.js:230`).
2. **Rendering:** `WhiteAreaOverlay` (`src/components/Studio/WhiteAreaOverlay/WhiteAreaOverlay.jsx`) renders one white `div.white-area-overlay` per entry, absolutely positioned, `pointerEvents: 'none'`, `zIndex: 100`.
3. **Wiring:** `StudioAreaSelector.jsx` passes `deletedDeepBlockAreas` into every renderer (`EditModeRenderer`, `DefaultRenderer`, `HandToolRenderer`, `ReaderModeRenderer`, `BlockOverlayLayer`), each of which mounts `<WhiteAreaOverlay deletedAreas={deletedDeepBlockAreas[activePage]} />` alongside the page image.
4. **Snapshot capture:** `capturePageSnapshot()` (`src/components/Studio/services/pageCapture.service.js`) forces every `.white-area-overlay` element to be visible/opaque during the `html2canvas` clone, while stripping area-selection chrome (borders/backgrounds) from everything else. The resulting `pageSnapshot` data URL is what gets submitted.
5. **Lifecycle:** `deletedDeepBlockAreas` is cleared per-page after a successful submit + refetch (`Studio.jsx` / `useAreaManagement.js: onClickSubmit`), because by then the whiteness is already baked into the persisted snapshot image — it doesn't need to exist as separate client state anymore.

This plan extends steps 1–5 to also accept manually-drawn rectangles, rather than introducing a parallel system.

---

## Design

### 1. Generalize the state shape (`useAreaManagement.js`)

Keep the existing `deletedDeepBlockAreas` array/state (avoid a risky rename across ~10 consuming files), but broaden each entry with a `source` discriminator:

```js
{ id, x, y, width, height, unit, source: 'deep-block' | 'manual' }
```

- `addDeletedDeepBlockArea()` stamps `source: 'deep-block'` (existing call site, `onClickDeleteArea`).
- New `addManualWhiteOverlayArea(area)` stamps `source: 'manual'` and is called when the user finishes drawing a rectangle in white-out mode.
- New `removeWhiteOverlayArea(pageIndex, id)` removes a single entry by `id` — only exposed for/used on `source: 'manual'` entries (deep-block ones stay non-removable, matching current behavior).

Export `addManualWhiteOverlayArea` and `removeWhiteOverlayArea` from the hook alongside the existing `deletedDeepBlockAreas`/`setDeletedDeepBlockAreas`.

### 2. Drawing interaction

Two viable options; recommend (a):

**(a) Reuse `AreaSelector` in a dedicated "white-out" pass.** When white-out mode is armed, render a second, transparent `AreaSelector` instance (from `@bmunozg/react-image-area`, same library `EditModeRenderer` already uses) stacked on top of the page image, with its own `onChange` handler. Its only job is to capture one drag gesture, convert the resulting area to `{x, y, width, height, unit: 'percentage'}`, call `addManualWhiteOverlayArea`, then immediately clear itself (so it doesn't accumulate draggable/resizable library-managed areas — those belong to `WhiteAreaOverlay` once committed). This avoids teaching the main `AreaSelector`/`onChangeHandler` pipeline (which is wired to block-type creation, composite blocks, `areasProperties` schema, etc.) about a concept it doesn't need to know about.

**(b) Lightweight custom mousedown/mousemove/mouseup rectangle tracker.** Skip the library entirely and implement a minimal drag-rectangle overlay by hand. More code, but zero risk of interfering with the existing `AreaSelector`/area-creation state machine. Consider this only if (a) proves awkward to stack cleanly with the existing renderer that's already showing (edit mode already renders one `AreaSelector` for real block creation — two overlapping instances could fight over pointer events).

Given `EditModeRenderer` already owns the one `AreaSelector` instance for the page, prefer arming/disarming *that same* instance's mode rather than stacking a second one: when white-out mode is on, temporarily swap `onChangeHandler`/`customAreaRenderer` so the next completed drag becomes a manual white-out entry instead of a new block area, then swap back. This needs a small state machine (`isWhiteOutMode`) threaded from `ImageActions` down through `StudioEditor` → `StudioAreaSelector` → `EditModeRenderer`.

### 3. New button in `ImageActions.jsx`

- Icon: `FormatColorResetIcon` or `CropFreeIcon` (MUI) — needs a visual that reads as "redact/white-out", distinct from the existing `BorderStyleIcon` toggle.
- Behavior: toggles `isWhiteOutMode` (new prop, lifted to `Studio.jsx`, passed down the same way `showBlocksStyling` currently is: `Studio.jsx` → `StudioLayout.jsx` → `StudioEditor.jsx` → `ImageActions.jsx` + `StudioAreaSelector.jsx`).
- Visual feedback: button shows active/pressed state while armed (same pattern as the existing `showBlocksStyling` toggle at `ImageActions.jsx:156-168`), and the cursor over the page image should change (e.g. `cursor: crosshair`) while armed.
- Auto-disarm after one rectangle is committed, OR stay armed for multiple rectangles until the user clicks the button again — **recommend staying armed** so "multiple regions can be added" (per confirmed UX) doesn't require re-clicking the toolbar each time; user explicitly turns it off when done.

### 4. Rendering committed white-out rectangles with delete affordance

`WhiteAreaOverlay` currently sets `pointerEvents: 'none'` on every entry (deep-block ones are intentionally non-interactive). Manual entries need to be individually deletable, so:

- Add a prop, e.g. `interactive` (or filter by `area.source === 'manual'` inside the component), that renders `pointerEvents: 'auto'` plus a small delete "×" affordance (MUI `IconButton` + `CloseIcon`, positioned top-right corner of the box) for manual entries only.
- Clicking delete calls `removeWhiteOverlayArea(activePage, area.id)`.
- The delete button must **not** appear in the snapshot. Extend `pageCapture.service.js`'s `onclone` hook to also hide elements matching a new marker class (e.g. `.white-area-delete-btn`) with `display: none !important` before `html2canvas` rasterizes — mirroring how it already strips area-selection borders/backgrounds.

### 5. Persistence / lifecycle — no backend changes needed

Per the confirmed design, manual white-out areas follow the exact same lifecycle as deep-block ones:
- They live only in client state (`deletedDeepBlockAreas[pageIndex]`, now holding both sources) until submit.
- `onClickSubmit` (`useAreaManagement.js`) already captures a `pageSnapshot` whenever the page has deep blocks (`hasDeepBlock` check, `useAreaManagement.js:360`). That condition needs to also trigger when there are manual white-out areas with no deep blocks present, e.g.:
  ```js
  const hasDeepBlock = areasProperties[activePageIndex]?.some(isDeepBlock);
  const hasManualWhiteOut = deletedDeepBlockAreas[activePageIndex]?.some(a => a.source === 'manual');
  if (hasDeepBlock || hasManualWhiteOut) { /* capture snapshot */ }
  ```
- After a successful submit + refetch, `deletedDeepBlockAreas[activePageIndex]` is already cleared to `[]` (`useAreaManagement.js:418-422`) — this naturally clears manual entries too, since by then they're baked into the persisted `pageSnapshot`. No extra cleanup needed.
- No new backend/API fields required — the whiteness travels as pixels inside the existing `pageSnapshot` upload, same as today.

---

## Files to touch

| File | Change |
|---|---|
| `src/components/Studio/hooks/useAreaManagement.js` | Add `source` field to deep-block entries; add `addManualWhiteOverlayArea`, `removeWhiteOverlayArea`; broaden the `hasDeepBlock` snapshot-trigger check in `onClickSubmit`; export the two new functions. |
| `src/components/Studio/WhiteAreaOverlay/WhiteAreaOverlay.jsx` | Add interactive/delete-button rendering for `source: 'manual'` entries; keep deep-block entries as-is (`pointerEvents: 'none'`). |
| `src/components/Studio/services/pageCapture.service.js` | Extend `onclone` to hide the new delete-button marker class before capture. |
| `src/components/ImageActions/ImageActions.jsx` | New button + icon; new `isWhiteOutMode`/`onToggleWhiteOutMode` props, mirroring the existing `showBlocksStyling`/`onToggleBlocksStyling` pair. |
| `src/components/Studio/StudioEditor/StudioEditor.jsx` | Thread `isWhiteOutMode`/`onToggleWhiteOutMode` to `ImageActions` and down to `StudioAreaSelector`. |
| `src/components/Studio/StudioAreaSelector/StudioAreaSelector.jsx` | Pass `isWhiteOutMode` into `EditModeRenderer` (only mode where drawing happens); pass `addManualWhiteOverlayArea`/`removeWhiteOverlayArea` down. |
| `src/components/Studio/StudioAreaSelector/renderers/EditModeRenderer.jsx` | When `isWhiteOutMode` is armed, redirect the next committed `AreaSelector` drag to `addManualWhiteOverlayArea` instead of `onChangeHandler`; pass `removeWhiteOverlayArea` to `WhiteAreaOverlay` for the delete button. |
| `src/components/Studio/Studio.jsx` | Own `isWhiteOutMode` state (or lift from `useAreaManagement`); pass through to `StudioLayout`. |
| `src/components/Studio/components/StudioLayout.jsx` | Forward the new props to `StudioEditor` (same pattern as `deletedDeepBlockAreas` today). |
| `src/components/Studio/StudioStickyToolbar/StudioStickyToolbar.jsx` | Decide whether the button also appears here (sticky/reader toolbar) — likely **not**, since white-out is an authoring-only action; keep the button studio-editor-only unless product wants it in the sticky toolbar too. |

---

## Open questions to confirm before implementation

1. **Icon/label** for the new button — no strong convention in the codebase to copy from; pick something visually distinct from `BorderStyleIcon`.
2. **Minimum rectangle size** — should tiny/accidental drags (e.g. a stray click) be discarded (similar to how `AreaSelector` usually has a min-size threshold for real areas)?
3. **Scope of `isWhiteOutMode`** — should it be mutually exclusive with normal block-drawing (i.e., disable normal area creation while armed), to avoid the user accidentally creating a real block instead of a white-out box, or vice versa? Recommend **yes, mutually exclusive**, toggled the same way `showVB`/other modes already gate interaction.
4. **Sticky toolbar (`StudioStickyToolbar`)** — confirm whether the button should be exposed there too, since that toolbar is currently reader/read-only-oriented and doesn't receive `showBlocksStyling` today.

---

## Testing plan

- Manual: arm white-out mode, draw a rectangle, verify it renders as a solid white box immediately; delete it via the "×" and verify it disappears; draw two, submit, refetch, and verify the resulting page snapshot shows white in both regions with no delete-button artifacts baked in.
- Verify white-out mode doesn't let the user simultaneously create a normal block area (per open question 3, once resolved).
- Verify existing deep-block deletion white-overlay flow is unaffected (regression check on `source: 'deep-block'` entries — no delete button, no snapshot changes).
- Reuse existing test patterns from `src/components/Studio/utils/__tests__/whiteAreaUtils.test.js` for any new utility logic.
