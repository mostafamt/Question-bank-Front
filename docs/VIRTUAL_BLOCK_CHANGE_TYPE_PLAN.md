# Virtual Block – Change Block Type Plan

## Goal

Let the user change the **type** of an existing virtual block (Overview, Notes, Recall, Example, Check Yourself, Quizz, Activity, Enriching Content, Summary) **without losing its content items**.

Today the type can only be picked once, from the empty slot's dropdown. To change it, the user has to delete the block and re-create every content item.

---

## How "type" works today

| Concept | Where | Notes |
|---|---|---|
| Block type list | `VIRTUAL_BLOCK_MENU` in `src/utils/virtual-blocks.js` | `label` (e.g. `"Recall 🧠"`), `iconSrc`, `category` (`object`/`text`) |
| Block type of a slot | `contents[i].contentType` | The label is stored on **every content item**, not on the slot. The UI reads `contents[0].contentType` for the icon and label. |
| Content item kind | `contents[i].type` | `text` / `link` / `object` / `autogen`. **Independent of the block type.** |
| Picking the type | `VirtualBlock.jsx` → `handleLabelSelect` → opens `"virtual-block-content"` modal with `selectedLabel` | |
| Applying the type | `VirtualBlockContentModal.jsx` → `handleAddContent` sets `contentType: selectedLabel` | `selectedLabel` is a fixed prop. It can't change while the modal is open. |
| Author persistence | `setCheckedObject({ contents })` → Studio state → `formatVirtualBlocksForSubmission` on Submit | `contentType` is sent per item |
| Reader persistence | `onSaveReaderSlot` → `useReaderVBlocks.saveSlot` → localStorage | Stamps `updatedAt` |

What this means:
- Changing the type means **relabelling `contentType` on every item in the slot**. No schema or backend change is needed.
- `category` in `VIRTUAL_BLOCK_MENU` is not used to restrict content. Any item kind can live in any block type. `inferContentType` only checks `NOTES`/`SUMMARY` for legacy items that have no `type`, and parsed items always get an explicit `type`. So relabelling can't change how an item renders.

---

## Proposed UX

### Primary: type selector inside the content modal (recommended)

Replace the static title `Virtual Block: {selectedLabel}` in `VirtualBlockContentModal` with a **block type dropdown** (icon + label for each `VIRTUAL_BLOCK_MENU` entry).

- On open it is set to the current type.
- Changing it updates local state only. Nothing is saved until **Save All**, and **Cancel** throws the change away. This matches how content edits already behave.
- On **Save All**, every item gets the new `contentType`.
- The same thing works for:
  - **Author mode** (Studio): opened from the block icon (`handleEdit`).
  - **Reader mode**: only for the reader's own blocks (`handleReaderEdit`). Author blocks stay read-only for readers.

Why this approach: one place to change, no extra controls on the small slot tile, and it reuses the existing save and cancel flow.

### Optional (phase 2): quick change from the slot

Add a small "change type" icon (e.g. `SwapHoriz`) next to the delete button on an active block in author mode. It opens a `Menu` like the reader "add" menu. Picking an item relabels right away through `setCheckedObject`. Skip this unless it's requested, because the modal path already covers the need.

---

## Implementation Steps

### 1. Utility: `changeVirtualBlockType` (`src/utils/virtual-blocks.js`)

```js
/**
 * Relabel every content item of a slot with a new block type
 * @param {Array} contents - Content items of one slot
 * @param {string} newLabel - New block label (from VIRTUAL_BLOCK_MENU)
 * @returns {Array} - New contents array (same reference if nothing changed)
 */
export const changeVirtualBlockType = (contents, newLabel) => {
  if (!newLabel || !contents?.length) return contents || [];
  if (contents.every((item) => item.contentType === newLabel)) return contents;
  return contents.map((item) => ({ ...item, contentType: newLabel }));
};
```

Also add a small helper for the icon lookup that `VirtualBlock.jsx` and the new dropdown will share:

```js
export const getVirtualBlockMenuItem = (label) =>
  VIRTUAL_BLOCK_MENU.find((item) => item.label === label);
```

### 2. `VirtualBlockContentModal.jsx`

- Add local state: `const [blockLabel, setBlockLabel] = React.useState(selectedLabel);`
- Header: render a block type selector (MUI `Select` with icon + label) bound to `blockLabel`, in place of the plain title text.
  - If the current `selectedLabel` is **not** in `VIRTUAL_BLOCK_MENU` (legacy labels such as `"Recall"` without the emoji), add it as an extra option so the current value still shows. Don't silently overwrite it.
- `handleAddContent`: use `contentType: blockLabel` instead of `selectedLabel`.
- `handleSaveAll`: `onSave(changeVirtualBlockType(contents, blockLabel))`.
- Pass `blockLabel` (not `selectedLabel`) to `ContentItemList` and `ContentItemForm` so preview titles match the new type.
- Optional new prop `allowTypeChange = true`, so a caller can turn the selector off if needed.

### 3. `VirtualBlock.jsx`

- No change to the save callbacks. `handleSaveContents` and `handleSaveReaderContents` already save whatever contents the modal returns.
- Swap the inline `VIRTUAL_BLOCK_MENU.find(...)` in `selectedBlockIcon` for `getVirtualBlockMenuItem`.
- (Phase 2 only) add the quick "change type" menu on active author blocks.

### 4. Reader mode

- `useReaderVBlocks.saveSlot` keeps `id` and `createdAt` and sets `updatedAt`, so relabelled items keep their identity. Nothing else to do.
- Author blocks: the reader can't open the edit modal on them (`isReaderOwned` guard), so they can't change the type either. ✔

### 5. Persistence and backend

- Author: the new `contentType` goes through the existing `formatVirtualBlocksForSubmission` on Studio Submit. **No API change.**
- Autogen items: `changeVirtualBlockType` spreads the item, so `jobId`, `status`, `objectId`, etc. are kept. `useAutoGenPolling` patches by index, so relabelling doesn't affect it.

### 6. Tests (`src/utils/virtual-blocks.test.js`)

- `changeVirtualBlockType`
  - relabels all items, other fields (incl. autogen fields, `id`, `createdAt`) are kept
  - returns the same reference when the label is unchanged
  - handles empty or undefined contents
- Round trip: relabel → `formatVirtualBlocksForSubmission` → `parseVirtualBlocksFromActivePage` → new label comes back on every item.

### 7. Manual QA checklist

- [ ] Studio: create a Notes block with 2 text items → change to Summary → Save All → icon and label update; Submit → reload → still Summary.
- [ ] Studio: change the type, then Cancel → type unchanged.
- [ ] Studio: change the type and add a new item in the same session → the new item gets the new type.
- [ ] Block with an autogen item that is still pending → change the type → polling still finishes and updates the item.
- [ ] Reader: own block → change the type → persists after reload (localStorage).
- [ ] Reader: author block → no way to change its type.
- [ ] Legacy label not in the menu → dropdown shows it and doesn't crash.
- [ ] Reader play / navigation modal titles show the new type.

---

## Files Touched

| File | Change |
|---|---|
| `src/utils/virtual-blocks.js` | Add `changeVirtualBlockType`, `getVirtualBlockMenuItem` |
| `src/components/Modal/VirtualBlockContentModal/VirtualBlockContentModal.jsx` | Type selector in header, `blockLabel` state, relabel on save |
| `src/components/Modal/VirtualBlockContentModal/virtualBlockContentModal.module.scss` | Styling for the header selector |
| `src/components/VirtualBlocks/VirtualBlock/VirtualBlock.jsx` | Use shared icon helper (+ optional quick-change menu) |
| `src/utils/virtual-blocks.test.js` | Unit tests |

---

## Open Questions for Review

1. **Category restriction:** should switching between `text`-category types (Notes, Summary) and `object`-category types (Overview, Recall, …) be blocked or show a warning? Proposal: **allow it with no warning**, because content item kinds don't depend on the block type today.
2. **Quick-change from the slot (phase 2):** needed, or is the modal selector enough?
3. **Same type in two slots on one page:** nothing prevents this today. Should changing the type keep allowing it? Proposal: yes, no new restriction.
