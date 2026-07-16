# Deep Block Handlers — Implementation Plan

## Goal

When a block is marked **Deep** (`isDeep === true`), selecting a label should run a *different*
handler than the normal one. First case: a deep block whose `typeOfLabel` is `text` opens the Quill
editor so the author types the text by hand, instead of running OCR on the cropped image.

The design must leave room for other deep behaviours later (deep `image`, deep `Coordinate`, …)
without turning `onChangeLabel` into a ladder of `if (isDeep && labelType === …)`.

---

## Where the branch belongs

`onChangeLabel` in `src/components/Studio/hooks/useLabelManagement.js` (line ~97) is the single
place where a label selection is turned into content. It already does the work every path needs —
sync, find the area, pick a color, resolve `labelType`, crop the image — and then branches on
`labelType`:

| `labelType` | current behaviour |
| --- | --- |
| `text`, `number` | `ocr(language, img)` → writes `text` |
| `Coordinate` | `extractCoordinateText(area)` → writes `text` |
| in `COMPLEX_TYPES` | opens the SubObject modal |
| anything else | nothing |

`AreaActionHeader` (`src/components/AreaActionHeader/AreaActionHeader.jsx:76`) only calls
`onChangeLabel(trialArea.id, val)`; it has no idea what happens next, and it should stay that way.
The Deep checkbox lives in that same component (line ~45) and writes through
`updateAreaPropertyById(trialArea.id, { isDeep })`, so by the time a label is chosen the flag is
already on the areaProperty that `onChangeLabel` looks up. **No change to `AreaActionHeader` is
needed.**

So: the branch goes in `onChangeLabel`, after `labelType` is resolved and the image is cropped, and
*before* the existing `labelType` ladder.

---

## Step 1 — Deep handler registry

New file `src/components/Studio/services/deepHandlers.service.js`.

A handler is a function receiving one context object and returning `void`/`Promise<void>`. The
registry maps `typeOfLabel` → handler. `onChangeLabel` asks the registry for a handler and, if it
gets one, runs it *instead of* the default ladder.

```js
import { STUDIO_MODALS } from "./modal.service";

/**
 * @typedef {Object} DeepHandlerContext
 * @property {Object} area         - the areaProperty (already has isDeep, type, label, id)
 * @property {number} idx          - index of the area on the active page
 * @property {string} labelType    - resolved typeOfLabel
 * @property {string} image        - cropped image data URL
 * @property {Function} updateAreaPropertyById
 * @property {Function} openModal
 */

/** Deep + text: author writes the text in Quill rather than OCR-ing the crop. */
const handleDeepText = ({ area, labelType, image, updateAreaPropertyById, openModal }) => {
  openModal(STUDIO_MODALS.QUILL, {
    workingArea: {
      id: area.id,           // ← required, see Step 2
      blockId: area.blockId,
      contentType: area.type,
      text: area.text || "",
      typeOfLabel: labelType,
    },
    updateAreaPropertyById,
  });
};

const DEEP_HANDLERS = {
  text: handleDeepText,
};

/**
 * Resolve the deep handler for a block, or null when the default path applies.
 * @returns {Function|null}
 */
export const getDeepHandler = (area, labelType) =>
  (isDeepBlock(area) && DEEP_HANDLERS[labelType]) || null;
```

Export `getDeepHandler` from `src/components/Studio/services/index.js`.

Two deliberate choices:

- **Keyed by `typeOfLabel`, not by `type`.** The request is phrased "if type is text" but `text` is
  a `typeOfLabel` value (from `getTypeOfLabel`), not a `typeName`. `type` is the block type
  (`Question`, `Illustrative Object`, …). Keying on `typeOfLabel` matches how the existing ladder
  already branches.
- **Absence of a key means the default path.** Deep `number` still OCRs, deep `Coordinate` still
  extracts coordinates, until someone adds a handler. No behaviour changes except the one asked for.

**Do not pass `image` into the deep-text `workingArea`.** `QuillModal` (line ~11) initialises its
editor to `<img src=… />` whenever `typeOfLabel === "image"`; for `typeOfLabel === "text"` it uses
`workingArea.text`, which is what we want. Passing `image` here is harmless but pointless — leave it
out so the intent is readable.

---

## Step 2 — Fix the Quill write-back (blocking prerequisite)

`QuillModal` writes with:

```js
updateAreaPropertyById(workingArea.id, { text: value });   // QuillModal.jsx:20
```

but `createQuillModalProps` (`modal.service.js:68`) builds `workingArea` with **`blockId` and no
`id`**. Every existing caller either passes a no-op callback (`usePlayBlock.js:43`,
`StudyBook.jsx:48` — both read-only, so the missing id never showed) or goes through
`createQuillModalProps`. Meaning: **as written today, a Quill edit opened from Studio would silently
write to `undefined` and update nothing.** The deep-text handler is the first path that actually
depends on the write-back, so this must be fixed first or the feature will appear to do nothing.

Fix in `modal.service.js`:

- Add `id` to the `createQuillModalProps` params and to the returned `workingArea`.
- Add `@property {string} workingArea.id` to the `QuillModalProps` typedef (line ~31).
- `StudioModalService.openQuillModal` passes `id: areaProps.id`.

The deep handler above sets `id` directly, so it works either way — but fix the shared helper so the
next caller doesn't hit the same trap.

---

## Step 3 — Thread `updateAreaPropertyById` into `useLabelManagement`

`onChangeLabel` currently only has `updateAreaProperty(idx, …)`, which is **index-based**. That is
fine for the synchronous writes it does today, but a modal callback fires arbitrarily later — after
the user may have drawn or deleted areas — at which point `idx` points at a different block. The
handler must write by **id**.

- Add `updateAreaPropertyById` to the `useLabelManagement` params (destructure at line ~36, add to
  the JSDoc and to the `useCallback` dependency array at line ~177).
- In `Studio.jsx` (line ~197) pass `updateAreaPropertyById` into the `useLabelManagement({ … })`
  call. It is already in scope from `useAreaManagement` (line ~116).

Note `updateAreaPropertyById` in `useAreaManagement.js:184` is **not** memoized and closes over
`areasProperties`. It is recreated every render, so adding it to `onChangeLabel`'s deps makes
`onChangeLabel` unstable — which cascades into `rightColumnProps` (`Studio.jsx:228`) and the
column memos. This repo has a history of infinite-render bugs from exactly this shape (see
`docs/USESTUDIOCOLUMNS_INFINITE_RENDER_FIX_PLAN.md`).

**Do not add it to the dependency array as-is.** Instead hold it in a ref inside
`useLabelManagement`:

```js
const updateByIdRef = React.useRef(updateAreaPropertyById);
React.useEffect(() => {
  updateByIdRef.current = updateAreaPropertyById;
});
```

and have the deep handler call `updateByIdRef.current`, keeping it out of `onChangeLabel`'s deps.
The ref always holds the latest closure, which is exactly what a deferred modal callback wants.

---

## Step 4 — Wire the branch into `onChangeLabel`

In `useLabelManagement.js`, keep everything up to and including the existing
`updateAreaProperty(idx, { color, label, typeOfLabel: labelType, image: img })` call (line ~138) —
a deep block still gets its color, label, resolved type and cropped image. Then, before the
`if (labelType === "text" || …)` ladder:

```js
const area = areasProperties[activePageIndex][idx];
const deepHandler = getDeepHandler(area, labelType);

if (deepHandler) {
  deepHandler({
    area,
    idx,
    labelType,
    image: img,
    updateAreaPropertyById: (id, prop) => updateByIdRef.current(id, prop),
    openModal,
  });
  return;
}

// existing labelType ladder unchanged
```

The early `return` is what makes this a *replacement* rather than an addition — a deep text block
must not also kick off a Tesseract run whose result would land on top of what the author typed.

One caveat to be aware of: `area` is read from the `areasProperties` closure, so `area.text` is the
value as of this render, not including the `updateAreaProperty` call two lines above. That's fine —
the handler only needs `id`, `blockId`, `type`, and any previously saved `text`, none of which that
call touches.

Add `getDeepHandler` to the imports at the top of `useLabelManagement.js`.

---

## Step 5 — Scope limits worth stating

- **Sub-objects are out of scope.** The Deep checkbox is hidden when `subObject` is true
  (`AreaActionHeader.jsx:38`) because sub-object areas submit as a label→value map with nowhere to
  carry the flag. `getDeepHandler` will therefore always return `null` on that path (`isDeep` is
  never `true` there), so no explicit `subObject` guard is needed — but don't "fix" this by showing
  the checkbox without also solving the submit shape.
- **Toggling Deep after a label is already chosen does nothing retroactively.** The handler runs on
  label selection. A block that was OCR'd and *then* marked deep keeps its OCR text; the author
  re-picks the label to get the Quill editor. This is acceptable for v1 — call it out to the user
  rather than building a re-run-on-toggle path nobody asked for.
- **Reader mode is unaffected.** `usePlayBlock` has its own modal routing and passes a no-op
  update callback; deep blocks play back like any other block.

---

## Step 6 — Tests

Extend `src/components/Studio/utils/__tests__/` (or add
`src/components/Studio/services/__tests__/deepHandlers.test.js`):

- `getDeepHandler` returns `null` for a non-deep text block.
- `getDeepHandler` returns `null` for a deep block whose `labelType` has no handler (`number`).
- `getDeepHandler` returns a function for `{ isDeep: true }` + `text`.
- `getDeepHandler` returns `null` for a legacy block with no `isDeep` key (relies on `isDeepBlock`,
  already covered by `isDeep.test.js`).
- `handleDeepText` calls `openModal` with `STUDIO_MODALS.QUILL` and a `workingArea` carrying the
  area's `id`.

Manual check, in Studio:

1. Draw an area, tick **Deep**, pick a `text` label → Quill opens, no OCR spinner, no OCR text.
2. Type in Quill, close → the text shows on the block row and survives a submit/refetch.
3. Draw a second area, leave Deep unticked, pick the same label → OCR runs as before.
4. Tick Deep, pick a `number` label → OCR still runs (no handler registered).

---

## Order of work

1. Step 2 (Quill `id` fix) — everything else is dead without it.
2. Step 1 (registry) + Step 3 (thread the callback via ref).
3. Step 4 (the branch).
4. Step 6 (tests).

## Files touched

| File | Change |
| --- | --- |
| `src/components/Studio/services/deepHandlers.service.js` | **new** — registry + `handleDeepText` + `getDeepHandler` |
| `src/components/Studio/services/index.js` | export `getDeepHandler` |
| `src/components/Studio/services/modal.service.js` | `id` in `createQuillModalProps` / `openQuillModal` / typedef |
| `src/components/Studio/hooks/useLabelManagement.js` | accept `updateAreaPropertyById` (ref), deep branch + early return |
| `src/components/Studio/Studio.jsx` | pass `updateAreaPropertyById` to `useLabelManagement` |
| `src/components/Studio/services/__tests__/deepHandlers.test.js` | **new** — unit tests |

`AreaActionHeader.jsx` is intentionally **not** in this list.
