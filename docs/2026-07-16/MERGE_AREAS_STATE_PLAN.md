# Merge `areas` + `areasProperties` into a Single Source of Truth — Plan

## Goal

`useAreaManagement` (`src/components/Studio/hooks/useAreaManagement.js`) holds **two** parallel
per-page states that describe the same blocks:

```js
const [areas, setAreas] = React.useState(() => pages.map(() => []));
const [areasProperties, setAreasProperties] = React.useState(() => initAreasProperties(pages, types));
```

Merge them into **one** state so a block's geometry and its content/metadata live in one object and
can never drift out of sync.

---

## What the two arrays actually hold

Both are `Array<Array<block>>` — outer index = page, inner index = block. **They are index-aligned:**
`areas[p][i]` and `areasProperties[p][i]` are the same block. Keeping that alignment across every
mutation is the invariant the whole hook exists to protect.

| | `areas[p][i]` (from `initAreas`) | `areasProperties[p][i]` (from `initAreasProperties`) |
| --- | --- | --- |
| identity | `id` | `id`, `blockId` |
| geometry | `x, y, width, height`, `unit` | `x, y, width, height` **(copy)** |
| render flags | `isChanging, isNew, _unit, _updated` | — |
| % metadata | `_percentX/_percentY/_percentWidth/_percentHeight` | — |
| content | — | `text, image, label, type, typeOfLabel, parameter, color, loading, open, order` |
| persistence | — | `status, isServer, isDeep` |
| misc | `name` | `name` |

Key facts that shape the merge:

1. **Geometry is duplicated.** `x/y/width/height` live in *both*. `areas` has the live pixel values
   (updated on every drag); `areasProperties` has a **copy that is only refreshed when a new area is
   drawn**, via `updateAreasProperties` in `src/utils/ocr.js` (which reads geometry out of `areas`
   and writes it into `areasProperties`). `id` and `name` are duplicated too.

2. **The split currently gives one useful property for free:** `onChangeArea` (drag/resize) calls
   `setAreas` **only**, so `areasProperties` keeps the same reference during a drag, and content
   consumers (the right-panel list, columns) **don't re-render while dragging**. A naive merge loses
   this — see Risk 1. Preserving it is a hard requirement, not a nicety.

3. **There is a latent bug the merge fixes.** Because `areasProperties` geometry is only synced when
   a *new* area is added, resizing an existing area and submitting **without** drawing another area
   can persist stale coordinates (submit reads geometry from `areasProperties`, not `areas`). Unifying
   makes geometry always-current. This is a *behavior change* — desirable, but must be called out and
   verified, not hidden.

---

## Target shape

One state, `blocks`, each entry the **superset** of both objects:

```js
const [blocks, setBlocks] = React.useState(() => initBlocks(pages, types));
// blocks[pageIndex][i] = { id, blockId, name,
//   x, y, width, height, unit, isChanging, isNew, _unit, _updated,
//   _percentX, _percentY, _percentWidth, _percentHeight,
//   color, loading, text, image, type, label, typeOfLabel, parameter,
//   order, open, status, isServer, isDeep }
```

There is no `areas`/`areasProperties` desync possible because there is one array. The per-page,
index-aligned structure is **kept** — only the two-arrays-in-lockstep part goes away.

---

## Strategy: unify internally first, keep the public shape, then migrate consumers

A big-bang rewrite of the ~30 files that read `areas`/`areasProperties` is high risk. Do it in three
phases; the codebase is externally identical after Phase 1, and each phase is independently
shippable and reviewable.

### Phase 0 — Lock current behavior with tests (before touching anything)

The only automated coverage today is `updateAreasProperties` (in `isDeep.test.js`) and
`coordinate.service.test.js`. Add characterization tests for the hook's mutators **as they behave
now**, so the refactor has a safety net:

- Draw a new area → a matching property entry is appended (id, `status: CREATED`, `isDeep: false`).
- `updateAreaProperty(idx, …)` and `updateAreaPropertyById(id, …)` write the right block.
- Delete: server block (`isServer`) → soft delete (`status: DELETED`, stays in array); client block
  → removed from **both** arrays, lengths stay equal.
- `insertPageAt` / `deletePageAt` / `reorderPageAt` keep the two arrays the same length and order.
- Submit payload geometry after resizing an existing area (this pins the current — arguably buggy —
  behavior so Phase 2's fix is a conscious, reviewed change).

Test the hook via `@testing-library/react`'s `renderHook`. These tests are written against the
public return values (`areas`, `areasProperties`) so they survive Phase 1 unchanged.

### Phase 1 — One state, derived outputs (the keystone)

Replace the two `useState`s with a single `blocks` state, and **derive** `areas` and
`areasProperties` from it so the hook's return value is byte-for-byte compatible. Nothing outside the
hook changes.

1. Add `initBlocks(pages, types)` to `src/components/Studio/initializers/index.js` — the merge of
   `initAreas` + `initAreasProperties` producing the superset object above. Keep `initAreas` /
   `initAreasProperties` for now (Phase 1 derivation + existing tests still call them).

2. In the hook:
   ```js
   const [blocks, setBlocks] = React.useState(() => initBlocks(pages, types));

   const areas = React.useMemo(() => selectAreas(blocks), [blocks]);
   const areasProperties = React.useMemo(() => selectAreasProperties(blocks), [blocks]);
   ```
   `selectAreas` / `selectAreasProperties` (new, in `utils/areaUtils.js`) project each block to the
   respective legacy shape.

3. Reimplement every setter to update `blocks`; keep method names/signatures identical:
   - `setAreas` / `setAreasProperties` exported today are used by consumers (StudioHeader,
     StudioLayout, columns). Provide **compat shims** that translate an incoming legacy-shaped update
     back into `blocks` (merge geometry-only or content-only fields onto the matching blocks by
     index). This is the fiddliest part — enumerate call sites (grep below) and confirm each shim
     covers them. Where a caller does `setAreas(prev => …)`, the shim must run the updater against
     the derived `areas`, then fold the result back into `blocks`.
   - All internal mutators (`updateAreaProperty`, `updateAreaPropertyById`, `onEditText`,
     `onChangeArea`, `onClickDeleteArea`, `insert/delete/reorderPageAt`, `syncAreasProperties`,
     `recalculateAreas`) rewritten to `setBlocks`. The "update both arrays" pairs collapse to one
     update each — e.g. `onClickDeleteArea`'s hard-delete stops calling `deleteAreaByIndex` twice.

**Risk 1 mitigation (must be built into Phase 1, not deferred):** to preserve "content consumers
don't re-render on drag", `selectAreasProperties` must return **referentially stable** per-block
objects when only geometry changed. Implement it with a per-block memo cache keyed by block `id` +
the content fields, so a geometry-only `setBlocks` yields a new `areas` array but an `areasProperties`
array whose items keep their identities → `React.memo`'d content consumers skip re-render. Verify with
the React DevTools profiler while dragging (Risk 1 in the checklist). If stable projection proves
impractical, the fallback is committing geometry on pointer-up instead of per-tick — but that changes
interaction feel and should be a separate, explicit decision.

After Phase 1: **single source of truth achieved.** `areas`/`areasProperties` still exist as derived
views; no consumer knows the difference.

### Phase 2 — Simplify the now-redundant machinery

With one state, delete the duplication the two-array design forced:

- `updateAreasProperties` (`src/utils/ocr.js`) exists to copy geometry `areas → areasProperties`.
  With unified blocks its geometry-copy job is gone; `syncAreasProperties` reduces to "append a
  property record for a newly drawn area" (the `areas.length > areasProperties.length` branch). Move
  that append logic into the hook operating on `blocks`, and **update `isDeep.test.js`** (which
  imports `updateAreasProperties` directly) to the new function or a block-level equivalent.
- `getOriginalPercentageCoords` (`coordinate.service.js`) has a fallback that reads
  `properties.x/y/...` because geometry used to live in a separate object. With unified blocks the
  primary (`_percentX…`) and fallback are the same object — the fallback branch can be simplified.
- `extractImage` (`ocr.js`) does `findIndex` in `areasProperties` then indexes `areas` at that idx —
  with one array it is a single `find`.
- This is the phase that pays down the debt; guard it entirely with the Phase 0 tests.

### Phase 3 — Migrate consumers off the derived shapes (optional, later)

Once stable, migrate the ~30 files to read `blocks` directly and delete `selectAreas` /
`selectAreasProperties` / the `setAreas`/`setAreasProperties` shims. Do it per-consumer, not all at
once. This phase is cosmetic — the single source of truth is already real after Phase 1 — so it can be
deprioritized or dropped.

---

## Consumer inventory (what reads the two arrays)

Run this to keep the list current:

```
grep -rn "areasProperties\|\bareas\b\|setAreas\b\|setAreasProperties" src/components/Studio
```

Live path is **`Studio.jsx`** (used by `ScanAndUpload` and `SubObjectModal`). Notable consumers:

| Consumer | Reads | Notes |
| --- | --- | --- |
| `StudioAreaSelector.jsx` | `areas[p]` to render, `areasProperties[p][idx]` for content | index-alignment is load-bearing here; deep-text/-image overlays read `areasProperties` |
| `useStudioColumns` / `columns/index.js` | `areasProperties` | right-panel list — the re-render-on-drag sensitive consumer (Risk 1) |
| `useCompositeBlocks.js` | `areasProperties[i]` | **has its own unrelated `compositeBlocks.areas`** — do not conflate with page `areas` |
| `useLabelManagement.js` | both | OCR/crop path; `extractImage` pairs the two by index |
| `StudioHeader` / `StudioLayout` | both + setters | prop-drill down to selector/columns |
| `coordinate.service.js` | both | %↔px; `pageProperties?.[areaIdx]` fallback |

**`StudioContext.jsx` + `StudioWithContext.jsx` are a parallel, unused implementation** (no page
imports them; the live app uses `Studio.jsx`). Decision: **leave them untouched and note as unused**,
or delete them in a separate cleanup — do **not** expand this refactor's blast radius to keep dead
code in lockstep. Confirm they're dead with `grep -rn "StudioWithContext\|useStudioContext" src`
before deciding.

---

## Risks & how each is handled

1. **Re-render on drag (perf).** Highest risk. Mitigated by referentially-stable
   `selectAreasProperties` + `React.memo` on content consumers; verified with the profiler. Fallback:
   commit geometry on pointer-up. → Build the stable projection in Phase 1; do not ship without the
   profiler check.
2. **Silent geometry-persistence change.** Unifying makes resizes of existing areas persist even
   without drawing a new area (fixes the latent bug). Pin current behavior in Phase 0, then make the
   change a reviewed line in Phase 2 with a note in the PR. Verify the submit payload before/after.
3. **`setAreas`/`setAreasProperties` shims.** External callers pass legacy-shaped updates (incl.
   functional updaters). Enumerate every call site, cover each with the shim, and add a test per
   call-site shape. This is where a merge quietly breaks if rushed.
4. **Infinite-render regressions.** This repo has documented history (see
   `docs/USESTUDIOCOLUMNS_INFINITE_RENDER_FIX_PLAN.md`,
   `docs/2025-11-06/INFINITE_LOOP_FIX_*`). Keep the derived selectors memoized and their dependency
   arrays minimal; do not introduce a selector that returns a new array identity on every render.
5. **Direct importers of `updateAreasProperties`.** `isDeep.test.js` imports it. Update in Phase 2
   alongside the function change; don't delete it out from under the test.

---

## Verification

- **Automated:** Phase 0 characterization tests (must stay green through Phases 1–2); extend for the
  new `initBlocks` / selectors; update `isDeep.test.js` in Phase 2.
- **Profiler:** drag/resize a block with the right panel open — content rows must not re-render
  (Risk 1).
- **Manual (live Studio via ScanAndUpload):** draw / resize / delete areas (client and server-backed);
  OCR a text area; mark a block Deep and author text/image (regression on the recent deep-block
  work); add/insert/delete/reorder pages and confirm blocks follow the right page; submit and confirm
  the payload geometry matches what's on screen (Risk 2); reopen/refetch and confirm round-trip.
- **Sub-object path:** exercise `SubObjectModal` (it renders its own `<Studio subObject />`), since
  `subObject` changes `syncAreasProperties`/`onClickSubmit` behavior.

---

## Order of work

1. Phase 0 — characterization tests (green against current code).
2. Phase 1 — `initBlocks` + single `blocks` state + derived `areas`/`areasProperties` + setter shims
   + stable projection. Ship. Tests + profiler must pass.
3. Phase 2 — collapse `updateAreasProperties`/`extractImage`/`getOriginalPercentageCoords`
   duplication; update `isDeep.test.js`; verify the geometry-persistence change.
4. Phase 3 (optional) — migrate consumers to `blocks`, drop the derived adapters.

## Files touched (Phases 1–2)

| File | Change |
| --- | --- |
| `src/components/Studio/hooks/useAreaManagement.js` | single `blocks` state; all mutators rewritten; derived `areas`/`areasProperties`; setter shims |
| `src/components/Studio/initializers/index.js` | add `initBlocks`; (Phase 3) retire `initAreas`/`initAreasProperties` |
| `src/components/Studio/utils/areaUtils.js` | add `selectAreas` / `selectAreasProperties` (stable projection) |
| `src/utils/ocr.js` | Phase 2: collapse `updateAreasProperties`, simplify `extractImage` |
| `src/components/Studio/services/coordinate.service.js` | Phase 2: simplify `getOriginalPercentageCoords` fallback |
| `src/components/Studio/hooks/__tests__/useAreaManagement.test.js` | **new** — Phase 0 characterization tests |
| `src/components/Studio/utils/__tests__/isDeep.test.js` | Phase 2: update for the new sync function |

## Open questions for you

1. **Scope:** stop after Phase 1 (single source of truth achieved, adapters remain) or push through
   Phase 2 (debt paid down) and/or Phase 3 (consumers migrated)? I recommend Phases 1–2.
2. **The geometry-persistence fix (Risk 2):** confirm it's desired to persist existing-area resizes
   without requiring a new area to be drawn. I believe it's a bug fix, but it changes what gets saved.
3. **`StudioContext`/`StudioWithContext`:** leave as unused (my recommendation) or delete as part of
   this work?
