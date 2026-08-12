# StudioAreaSelector Refactoring Plan

**Date:** 2026-08-12
**Component:** `src/components/Studio/StudioAreaSelector/StudioAreaSelector.jsx`
**Current LOC:** 578
**Status:** Planning — for review

---

## Context

`StudioAreaSelector.jsx` has grown to 578 lines and now renders **six** mutually-exclusive modes (reader, view-and-play, read-only preview, hand-tool/composite-block-picking, edit mode via the `AreaSelector` library, and a bare default) through one deeply nested ternary.

A refactor plan for this exact component was written before (`docs/2026-01-29/STUDIO_AREA_SELECTOR_REFACTORING_PLAN.md`) but was never executed — the file still has no `renderers/`, `shared/`, or `utils/` subfolders. Since that plan was written, a sixth mode ("view-and-play") was added directly into the same ternary instead of as an extracted piece, which is what made the component hard to reason about in the debugging session just before this plan (toggling "hide block borders" swaps the entire render branch, and areas without a `blockId` silently vanish in two of the six branches).

Goals of this refactor:
- Split the six render modes into small, independently readable components.
- Eliminate the ~6x duplicated `<img>` tag and ~6x duplicated `<WhiteAreaOverlay>` call.
- Merge the two modes (`readOnly` and `view-and-play`) that are already near-identical in output into one component, so behavior can't drift between them again.
- Pull the mode-selection logic out into a pure, testable function.
- Remove dead/debug code that has accumulated (inert debug effect, commented-out dead function, ad-hoc `console.log`s).
- Keep the public prop contract on `StudioAreaSelector` unchanged — it has exactly one consumer, `StudioEditor.jsx` (confirmed via repo-wide search), so this is an internal-only restructuring.

**Out of scope** (flagged for a separate follow-up, not done here): `constructBoxColors` in `services/styling.service.js` computes border/background via nth-of-type CSS selectors on the container, which is a second, parallel styling mechanism alongside the inline `getBlockStyle` already used per-area. That selector-index approach silently misaligns whenever areas are filtered/skipped (as they are in two of the six modes), which is a likely source of border/background bugs seen during Studio use. Reconciling those two systems is a correctness fix, not a structure fix, so it's called out here but left for a separate task.

---

## Current Duplication Inventory

Across all 6 branches:
- `<img src={getImageSource()} ... style={{width, height, overflow:"scroll", [cursor]}} onLoad={onImageLoad} ref={ref} />` — repeated 6 times, differs only by an optional `cursor: "pointer"`.
- `<WhiteAreaOverlay deletedAreas={deletedDeepBlockAreas[activePage]} visible={true} />` — repeated 6 times, identical every time.
- `<div style={{position:"relative"}}>` wrapper — repeated 5 times (all but the `AreaSelector`-library branch).
- The "map areas, skip if `!areaProps?.blockId`, position via `getBlockStyle`, render `customRender()`" pattern is duplicated between the `readOnly` branch (lines 467-499) and the `view-and-play` branch (lines 426-466) — the only differences are an inert `zIndex: 10` and DOM order, both of which have no visible effect since absolutely-positioned siblings always paint above static content regardless of source order.

**Dead/debug code to remove:**
- `onChangeHandlerForCB` (lines 217-219) — empty, commented-out body, unused.
- The `prevPropsRef` / `useEffect` block (lines 322-339) — builds a `changedProps` object every render and never reads or logs it; it's inert.
- Ad-hoc `console.log` calls scattered through the component (lines 63-66, 75, 144, 392, 428, 445).

---

## Proposed Structure

```
src/components/Studio/StudioAreaSelector/
├── StudioAreaSelector.jsx        # orchestrator: mode resolution + shared VirtualBlocks/container wrapper (~90 lines)
├── studioAreaSelector.module.scss
├── index.js
├── utils/
│   ├── renderMode.js             # pure fn: (isReaderMode, readOnly, showBlocksStyling, highlight, activeRightTab) -> mode id
│   └── __tests__/renderMode.test.js
├── shared/
│   ├── PageImage.jsx             # the repeated <img>, takes scaleFactor/cursor/onLoad/forwarded ref
│   └── BlockOverlayLayer.jsx     # unifies readOnly + view-and-play: filters by blockId, positions via getBlockStyle, calls customRender; takes an `interactive` flag
├── renderers/
│   ├── ReaderModeRenderer.jsx    # <button> per area (existing reader behavior, unchanged)
│   ├── HandToolRenderer.jsx      # composite-block-picking boxes (wraps existing blocksToRender logic)
│   ├── EditModeRenderer.jsx      # wraps the third-party <AreaSelector> + customAreaRenderer
│   └── DefaultRenderer.jsx       # image only, no areas
├── hooks/
│   ├── useAreaCustomRenderer.js  # extracts the `customRender` callback (deep-block content switch: text/image/audio/video/object)
│   └── useCompositeBlockPicking.js # extracts `onPickAreaForCompositeBlocks` + the label/category matching logic
```

Mode resolution keeps the exact existing precedence (reader > view-and-play > readOnly > hand-tool > editing-tab > default) — `utils/renderMode.js` is a straight extraction of the current ternary condition chain into a switch/if-else pure function, not a behavior change. Note the existing code checks `activeRightTab.id` (not `.label`, which the abandoned 2026-01-29 plan assumed) — the new util matches the real prop.

`BlockOverlayLayer` takes `interactive` (true for view-and-play, false for readOnly) and internally does what `getBlockStyle`/`customRender` already do based on `showBlocksStyling`/`isInteractiveMode` — no behavior change, just one component instead of two copies.

---

## Implementation Steps

1. **Utilities first** (no behavior change, easy to unit test in isolation):
   - `utils/renderMode.js` with a pure function extracted from the current ternary conditions.
   - Add `utils/__tests__/renderMode.test.js` covering all 6 mode combinations (mirrors the "Unit Tests" table from the abandoned plan).
2. **Shared pieces**:
   - `shared/PageImage.jsx` — extract the repeated `<img>` (forwardRef, accepts `cursor`).
   - `shared/BlockOverlayLayer.jsx` — extract the readOnly/view-and-play shared JSX, parameterized by `interactive`.
3. **Remaining renderers**: `ReaderModeRenderer`, `HandToolRenderer`, `EditModeRenderer`, `DefaultRenderer` — each a direct lift of its existing branch's JSX, now using `PageImage` and the already-shared `WhiteAreaOverlay` component.
4. **Extract logic hooks**:
   - `hooks/useAreaCustomRenderer.js` — move the `customRender` `useCallback` (lines 138-211) here verbatim, same dependency array.
   - `hooks/useCompositeBlockPicking.js` — move `onPickAreaForCompositeBlocks` (lines 221-292) and `blocksToRender` (lines 294-320) here verbatim.
5. **Rewrite `StudioAreaSelector.jsx`** as the orchestrator: resolve the mode via `renderMode.js`, keep the `<VirtualBlocks>` wrapper, the `pageContainerRef` div, and the `constructBoxColors` `css` prop exactly as they are today (untouched — out of scope per above), and switch-render the matching sub-component. Drop the dead code and console.logs identified above during this step.
6. **Wire up `index.js`** barrel export (matches the pattern already used in `Studio/components/index.js` etc.).
7. Leave `StudioEditor.jsx` untouched — it already passes/receives exactly the same prop names.

---

## Verification

- No existing automated tests cover `StudioAreaSelector` itself (only `services/`, `utils/`, and `DeepBlockContent` have `__tests__`), so add the `renderMode.test.js` unit tests as the only new automated coverage, following the existing Jest conventions in `src/components/Studio/utils/__tests__/`.
- Run `npm test -- --watchAll=false` to confirm nothing existing breaks and the new util tests pass.
- Manual smoke test via `npm start` (or `npm run serve` for the mock backend) through the Studio page, exercising each of the 6 modes since they aren't unit-tested:
  1. Reader mode (`/read/book/:bookId/chapter/:chapterId`) — click a block, confirm playback modal still opens.
  2. Studio edit mode (`block-authoring` tab) — draw a new area, confirm it's still resizable/draggable via the library.
  3. Toggle "Hide block borders" (view-and-play) with an existing linked block — confirm it still renders playable content, and toggling back returns to the normal bordered edit view.
  4. Hand tool (composite blocks) — confirm pickable boxes still appear and clicking still adds to `compositeBlocks.areas`.
  5. `readOnly` mode (used by `CompositeBlocksModal.jsx`) — confirm preview still shows colored/labeled blocks.
  6. Default fallback (a right tab outside the 4 editing tabs) — confirm plain image still renders.
