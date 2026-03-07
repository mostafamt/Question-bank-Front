# Fix: Composite Blocks Hand Tool Stores blockId Instead of objectId

## Problem

When using the **hand tool** to select a block for composite objects, the system
stores the `blockId` (the block's page-level ID) in the `text` field of the
composite block area. However, the backend expects `contentValue` to hold the
**objectId** — the actual ID of the interactive object (question, illustrative
object, etc.) that the block references.

As a result, when a composite block is saved, `contentValue` receives the wrong
identifier and the linked object cannot be resolved correctly.

---

## Data Model Clarification

Each block loaded from the server has two different identifiers:

| Field          | Source            | Meaning                                              |
|----------------|-------------------|------------------------------------------------------|
| `blockId`      | `block.blockId`   | ID of the block placement on the page                |
| `contentValue` | `block.contentValue` | ID (or value) of the actual object the block references |

In `initAreasProperties` (`src/components/Studio/initializers/index.js:39`),
both are stored in the area property:

```js
text: block.contentValue,  // <- objectId / the object reference
blockId: block.blockId,    // <- page-level block identifier
```

So `areasProperties[page][i].text` already holds the correct **objectId**,
while `areasProperties[page][i].blockId` holds the page block ID.

---

## Root Cause

There are **two places** where a composite block area is created, and both
incorrectly write `blockId` into the `text` field instead of the objectId.

### Location 1 — `useCompositeBlocks.js` (hand tool modal path)

**File:** `src/components/Studio/hooks/useCompositeBlocks.js`
**Line:** 187

```js
// WRONG — stores the blockId, not the objectId
const newArea = {
  ...
  text: blockId,   // <-- bug
  ...
};
```

The variable `selectedObject` is already resolved from `areasProperties` and
contains `selectedObject.text` which is the correct objectId. The fix is:

```js
// CORRECT — stores the objectId (contentValue from server)
const newArea = {
  ...
  text: selectedObject.text,   // <-- fix
  blockId: blockId,            // <-- keep for modal tracking (see below)
  ...
};
```

### Location 2 — `StudioAreaSelector.jsx` (direct click-on-page path)

**File:** `src/components/Studio/StudioAreaSelector/StudioAreaSelector.jsx`
**Line:** 190

```js
// WRONG — stores the blockId, not the objectId
{
  ...
  text: area.blockId,   // <-- bug
  ...
}
```

`area` here is an element from `areasProperties`, so `area.text` holds the
correct objectId. The fix is:

```js
// CORRECT
{
  ...
  text: area.text,      // <-- fix: objectId (contentValue)
  blockId: area.blockId,  // <-- keep for modal tracking (see below)
  ...
}
```

---

## Side Effect: Modal Tracking Must Be Updated

`CompositeBlocksModal.jsx` currently uses `area.text` from composite block
areas to track which blocks are already added (for visual highlighting). This
works only because `text` currently equals `blockId`.

After the fix, `text` will hold the objectId, which no longer matches
`area.blockId` in `displayAreas`. The modal's tracking logic must be updated to
use the new `blockId` field on composite block areas.

**File:** `src/components/Modal/CompositeBlocksModal/CompositeBlocksModal.jsx`

### `blockColorMap` (line 64–72) — update key source

```js
// BEFORE
compositeBlocks?.areas?.forEach((area) => {
  if (area.text && area.color) {
    map[area.text] = area.color;   // <-- was using text as blockId
  }
});

// AFTER
compositeBlocks?.areas?.forEach((area) => {
  if (area.blockId && area.color) {
    map[area.blockId] = area.color;  // <-- use explicit blockId field
  }
});
```

### `addedBlockIds` (line 75–81) — update key source

```js
// BEFORE
compositeBlocks?.areas?.forEach((area) => {
  if (area.text) set.add(area.text);  // <-- was using text as blockId
});

// AFTER
compositeBlocks?.areas?.forEach((area) => {
  if (area.blockId) set.add(area.blockId);  // <-- use explicit blockId field
});
```

The `displayAreas` computation (line 87–95) already compares against
`area.blockId` from `selectableAreas`, so it requires no changes once the two
maps above are corrected.

---

## Type Definition Update

**File:** `src/components/Studio/types/studio.types.js`

Add `blockId` to the `CompositeBlockArea` typedef so it is documented:

```js
/**
 * @typedef {Object} CompositeBlockArea
 * @property {string} id - Unique local identifier (UUID)
 * @property {string} type - Block type chosen by user
 * @property {string} text - objectId / contentValue sent to server as contentValue
 * @property {string} blockId - Page-level block ID used for modal visual tracking
 * @property {string} unit - Coordinate unit ("%" or "px")
 * @property {string} color - Highlight color
 */
```

---

## Summary of Changes

| File | Line | Change |
|------|------|--------|
| `src/components/Studio/hooks/useCompositeBlocks.js` | 187 | `text: blockId` → `text: selectedObject.text`, add `blockId: blockId` |
| `src/components/Studio/StudioAreaSelector/StudioAreaSelector.jsx` | 190 | `text: area.blockId` → `text: area.text`, add `blockId: area.blockId` |
| `src/components/Modal/CompositeBlocksModal/CompositeBlocksModal.jsx` | 64–81 | Replace `area.text` with `area.blockId` in `blockColorMap` and `addedBlockIds` |
| `src/components/Studio/types/studio.types.js` | `CompositeBlockArea` typedef | Add `blockId` field to JSDoc |

---

## Verification

After applying the fix:

1. Open the Studio on any chapter with saved blocks.
2. Click a composite block type, then click the **hand tool** icon.
3. Select a block in the modal — verify the modal closes and the block appears in
   the composite list.
4. Assign a type to the block.
5. Submit the composite block.
6. Inspect the API request payload — `contentValue` inside each `blocks[]` entry
   should be the objectId (a UUID referencing the question/object), **not** the
   blockId.
7. Confirm that the modal correctly highlights already-added blocks (dashed
   border) and colored blocks (solid colored border).
