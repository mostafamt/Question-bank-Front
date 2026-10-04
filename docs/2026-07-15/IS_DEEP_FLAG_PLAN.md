# `isDeep` Flag — Implementation Plan

## Goal

1. Add a **"Deep" checkbox** to `AreaActionHeader`, rendered *before* the type `MuiSelect`.
2. Give **every block / areaProperty** an `isDeep` boolean flag.
3. Default is `false`. A block with **no** `isDeep` key is treated as `false`.

---

## Where blocks actually live

`isDeep` belongs on the **areaProperty** object (the metadata record), not on the `area` object
(the geometry rectangle owned by `@bmunozg/react-image-area`). The two arrays are index-aligned
per page:

| Array | Owner | Holds |
|---|---|---|
| `areas[pageIndex][i]` | `useAreaManagement` | x/y/width/height, unit, `_percent*` metadata |
| `areasProperties[pageIndex][i]` | `useAreaManagement` | id, label, type, text, image, status, color… **← `isDeep` goes here** |

Lifecycle of an areaProperty:

- **Born from server** → `initAreasProperties()` in `src/components/Studio/initializers/index.js:26`
- **Born from a new drawn rectangle** → `updateAreasProperties()` in `src/utils/ocr.js:142`
- **Edited** → `updateAreaProperty(idx, patch)` / `updateAreaPropertyById(id, patch)` in `src/components/Studio/hooks/useAreaManagement.js:126,184`
- **Sent to server** → `handleSubmit()` in `src/pages/ScanAndUpload/ScanAndUpload.jsx:65`

---

## ⚠️ The one thing that will silently break this

`updateAreasProperties` (`src/utils/ocr.js:142`) does **not** spread the existing object. It
rebuilds each areaProperty field-by-field from an explicit whitelist:

```js
newAreas = [...newAreas, {
  x: areas[activePage][block].x,
  // …
  status: …,
  isServer,
}];
```

This function runs from `syncAreasProperties()`, which fires inside `onChangeArea` **every time the
user draws a new rectangle on the page**. Any property not in that whitelist is dropped from *every
block on the page*.

So if you only add the checkbox and the initializer, the flag will appear to work — and then quietly
reset to `false` on all blocks the next time the user draws an area. **`isDeep` must be added to the
whitelist in that copy loop.** This is the highest-risk step in the plan; do it first.

---

## Step 1 — Normalizer helper (do this before anything else)

Add to `src/components/Studio/utils/areaUtils.js` and re-export from `src/components/Studio/utils/index.js`:

```js
/**
 * Read the isDeep flag off a block/areaProperty.
 * Absent, null, or undefined all mean false — never trust the raw key.
 * @param {Object} area
 * @returns {boolean}
 */
export const isDeepBlock = (area) => area?.isDeep === true;
```

Every **read** of the flag goes through this helper. Nothing reads `area.isDeep` directly. That is
what makes "no flag = false" true by construction instead of by convention, and it keeps legacy
blocks already stored on the server (which have no `isDeep` key) working without a migration.

---

## Step 2 — Default `isDeep: false` at all creation sites

### 2a. `src/utils/ocr.js` — `updateAreasProperties` (**critical**, both branches)

Copy loop (~line 156), add alongside `isServer`:

```js
isDeep: areasProperties[activePage][block].isDeep === true,
```

New-area branch (~line 181), add alongside `isServer: false`:

```js
isDeep: false,
```

### 2b. `src/components/Studio/initializers/index.js` — `initAreasProperties` (~line 31)

Blocks hydrated from the server. Add:

```js
isDeep: block.isDeep === true,
```

Normalizing here (rather than `block.isDeep ?? false`) means a server that omits the field, sends
`null`, or sends a string still lands on a real boolean in state.

### 2c. `src/components/Studio/services/block.service.js`

Add `isDeep: false` to `createBlock()` (~line 241) and `transformBlockFromServer()` (~line 207).

> Note: these two are exported but currently unused by the live Studio path (the live path is 2a/2b).
> Update them anyway so they don't become a source of flagless blocks later.

### 2d. `src/components/Studio/utils/areaUtils.js` — `initializeAreasProperties` (~line 42)

Same treatment. Also currently unused (legacy duplicate of 2b) — worth a comment noting the
duplication, or removing it in a separate cleanup PR. Not in scope here.

---

## Step 3 — The checkbox in `AreaActionHeader`

File: `src/components/AreaActionHeader/AreaActionHeader.jsx`

Place it inside the existing `<Box>`, above the `<div>` wrapping the type select, so it renders
before the type `MuiSelect` in DOM order:

```jsx
import { Box, Checkbox, FormControlLabel } from "@mui/material";
import { isDeepBlock } from "../Studio/utils";

// …
<FormControlLabel
  label="Deep"
  control={
    <Checkbox
      size="small"
      checked={isDeepBlock(trialArea)}
      onChange={(event) =>
        updateAreaPropertyById(trialArea.id, { isDeep: event.target.checked })
      }
    />
  }
/>
```

Three details that matter:

- `checked={isDeepBlock(trialArea)}` — never `checked={trialArea.isDeep}`. A legacy block with no
  flag would pass `undefined`, flipping MUI's Checkbox to uncontrolled and emitting a console
  warning the first time the user clicks it.
- `updateAreaPropertyById` is already threaded down from `AreaAction` → `AreaActionHeader`, so no new
  props are needed.
- The header is inside `AreaItem`'s collapsible body; clicking the checkbox must not toggle the
  accordion. Verify — if it does bubble, add `onClick={(e) => e.stopPropagation()}` on the
  `FormControlLabel`.

### Styling

`src/components/AreaActionHeader/areaActionHeader.module.scss` uses `& > *:nth-child(2) { flex-grow: 1 }`
to make the `<Box>` fill the row next to the color swatch. Adding the checkbox **inside** the `<Box>`
keeps the child count at 2 and leaves that rule intact. If instead you put the checkbox as a direct
child of `.area-action-header`, the `nth-child(2)` target shifts to the checkbox and the layout
breaks — so keep it inside the `<Box>`.

---

## Step 4 — Persistence

### 4a. Send it: `src/pages/ScanAndUpload/ScanAndUpload.jsx` — `handleSubmit` (~line 65)

Three branches build the payload (`DELETED`, `CREATED`, `else`/`UPDATED`). Add to **each**:

```js
isDeep: item.isDeep === true,
```

Missing one branch produces the nastiest possible bug shape: the flag saves correctly on create and
then silently reverts on the next edit of the same block.

### 4b. Read it back

`initAreasProperties` (2b) reads `block.isDeep` off the server block. This closes the round-trip —
**provided the backend persists and returns the field**.

### 4c. Backend dependency (confirm before starting)

`saveBlocks` posts to the API described in `src/axios.js`. If the block schema strips unknown fields,
`isDeep` round-trips as `undefined` → normalizes to `false`, and the checkbox will appear to reset
after a refetch while working fine in-session. **Confirm the API accepts `isDeep` on the block schema
before building 4a/4b**, otherwise this ships as a UI-only flag that loses state on reload.

Also add `isDeep` to the mock blocks in `src/api/test-data.js` so the json-server path exercises it.

### 4d. Sub-objects — explicit scope decision

`SubObjectModal.handleSubmit` (`src/components/Modal/SubObjectModal/SubObjectModal.jsx:36`) does
**not** use the block payload shape. It flattens areas into
`objectElements: [{ [item.label]: value }]` — a label→value map with nowhere to hang a per-area
boolean.

Sub-object areas still get `isDeep` in state (they flow through the same `updateAreasProperties`),
and `AreaActionHeader` renders in sub-object mode too, so **the checkbox will be visible and
clickable there but will not persist**. Options:

1. **Hide the checkbox when `subObject` is true** (`{!subObject && <FormControlLabel … />}`) —
   smallest change, no misleading UI. **Recommended** unless deep sub-objects are a real requirement.
2. Extend `objectElements` to a richer shape — needs a backend contract change, out of scope here.

Pick one before implementing Step 3; option 1 is one line.

---

## Step 5 — Types

`src/components/Studio/types/studio.types.js` — add to the `AreaProperty` typedef (~line 36) and the
server `Block` typedef (~line 106):

```js
 * @property {boolean} [isDeep] - Whether the block is marked "deep". Optional: absent means false.
```

Keep it optional (`[isDeep]`) in both. Marking it required would misdescribe every block already
persisted without the field.

---

## Implementation order

1. Confirm the backend accepts `isDeep` (4c) and decide the sub-object scope (4d).
2. `isDeepBlock` helper (Step 1).
3. `updateAreasProperties` whitelist (2a) — the trap.
4. Remaining creation defaults (2b–2d).
5. Checkbox (Step 3).
6. Submit payload (4a).
7. Types (Step 5).

---

## Verification

Manual, in Studio:

1. Draw an area → open it → checkbox is unchecked. Check it.
2. **Draw a second area on the same page** → the first area's checkbox is *still checked*. This is
   the regression test for the `updateAreasProperties` whitelist (2a); it fails loudly if 2a was missed.
3. Save → refetch/reload → the flag survives. (Fails if 4a/4b/4c are incomplete.)
4. Toggle off → save → reload → stays off. Confirms `false` persists and isn't confused with absent.
5. Open a page whose blocks predate this feature → checkboxes render unchecked, no console warning
   about controlled/uncontrolled inputs. Confirms Step 1.
6. Delete a checked block and undo/re-add → no stale flag.

Automated: extend `src/components/Studio/services/__tests__/` with a unit test for `isDeepBlock`
(`undefined`/`null`/`false`/`true`/`"true"` → expect `false,false,false,true,false`) and one for
`updateAreasProperties` asserting `isDeep` survives a sync round-trip.

---

## Files touched

| File | Change |
|---|---|
| `src/components/Studio/utils/areaUtils.js` | add `isDeepBlock`; default in `initializeAreasProperties` |
| `src/components/Studio/utils/index.js` | export `isDeepBlock` |
| `src/utils/ocr.js` | **`updateAreasProperties` whitelist — both branches** |
| `src/components/Studio/initializers/index.js` | default in `initAreasProperties` |
| `src/components/Studio/services/block.service.js` | default in `createBlock`, `transformBlockFromServer`; add to `transformBlockForSubmit` |
| `src/components/AreaActionHeader/AreaActionHeader.jsx` | the Deep checkbox |
| `src/pages/ScanAndUpload/ScanAndUpload.jsx` | `isDeep` in all 3 submit branches |
| `src/components/Studio/types/studio.types.js` | typedefs |
| `src/api/test-data.js` | mock data |
| `src/components/Modal/SubObjectModal/SubObjectModal.jsx` | only if sub-object option 2 is chosen |

No changes needed in `useAreaManagement` — `updateAreaPropertyById` already merges arbitrary patches.
