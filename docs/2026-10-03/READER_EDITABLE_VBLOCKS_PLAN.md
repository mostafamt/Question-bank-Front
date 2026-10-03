# Reader-Editable Virtual Blocks — Plan

**Date:** 2026-10-03
**Mode:** Reader only (`/read/book/:bookId/chapter/:chapterId`)
**Status:** Implemented with the recommended defaults: option A (personal
layer), reader uses empty slots only (Q2), text + link only (Q3, see
`READER_VBLOCK_CONTENT_TYPES`), no hiding of author blocks (Q4). Q5 and Q6
are still open. The modal uses a generic `allowedTypes` prop rather than
`readerMode`, and the add button only appears where a reader save handler is
passed (the legacy `BookViewer` keeps its empty placeholder).
**Builds on:** `docs/2026-09-26/READER_PAGE_BOOKMARK_PLAN.md` (same storage pattern)

---

## 1. Goal

In reader mode, the reader can **add**, **update** and **delete** virtual
blocks (VBlocks) around the page: notes, links and similar items, in the same
icon slots the author uses (TL, TM, TR, L1–L6, R1–R6, BL, BM, BR).

## 2. Where we are today

- `VirtualBlock.jsx` has two behaviours, picked by the `reader` flag:
  - **Author (Studio):** an empty slot shows a type dropdown (`MuiSelect`),
    and a filled slot shows a delete button. Clicking the icon opens
    `VirtualBlockContentModal` to edit.
  - **Reader:** an empty slot renders an empty `<div>`, and a filled slot is
    play-only (`handlePlayReader`).
- The VBlock state lives in `Studio.jsx` (`virtualBlocks[pageIndex]`,
  parsed from `page.v_blocks`). It is saved to the backend only from the
  author's Submit (`ScanAndUpload.handleSubmit` → `saveBlocks`). Reader mode
  never saves.
- `VirtualBlockContentModal` already handles add, edit, delete and reorder
  for the items in one slot, with the types `text`, `link`, `object` and
  `autogen`.

So most of the UI exists. What is missing is **where reader edits are
stored** and **how they sit next to the author's blocks**.

## 3. Key decision: whose blocks does the reader edit?

| Option | What it means | Verdict |
|---|---|---|
| **A. Personal layer (recommended)** | Reader blocks are the reader's own, stored apart from the author's `v_blocks`. Author blocks stay read-only for the reader. | Safe. The book content cannot be damaged, and it works without login or backend work. |
| B. Edit the book itself | Reader changes are saved with `saveBlocks`, overwriting the author's `v_blocks`. | Any reader could change the book for everyone, and there are no users or permissions in the app. Not recommended. |

The rest of this plan assumes **option A**.

## 4. Behaviour

### 4.1 Slots

| Slot state (reader mode) | Shows | Click |
|---|---|---|
| Empty | A faint **+** button (visible on hover, always visible on touch) | Opens the type menu, then `VirtualBlockContentModal` in reader mode |
| Author block only | Same as today (icon + count badge) | Plays it, as today |
| Reader block only | Icon + count badge, plus a small "mine" marker (e.g. a person/pencil dot) | Plays it. A pencil button opens the modal to edit |
| Author + reader items in the same slot | See open question 2 | — |

### 4.2 Actions

| Action | Result |
|---|---|
| **Add** | Pick a type (Notes, Recall, Example, …) from `VIRTUAL_BLOCK_MENU`, then add one or more items in the modal and save. |
| **Update** | The pencil button on a reader block opens the modal with that block's items. The reader can edit, reorder, add or remove items. |
| **Delete** | The delete button on a reader block opens a confirmation dialog (an MUI `Dialog`, not `window.confirm`), then removes the reader's items in that slot. |
| Author block | No edit or delete buttons. |
| Reload / come back later | Reader blocks are still there (same browser). |
| Studio / book-author mode | Reader blocks are never shown or saved. |

### 4.3 Content types for readers

| Type | Reader? | Why |
|---|---|---|
| `text` (Quill) | ✅ | The main use: personal notes |
| `link` | ✅ | |
| `object` (pick from library) | ⚠️ open question 3 | Opens the object library, which is an authoring tool |
| `autogen` | ❌ | Starts backend generation jobs |

## 5. Storage design

Same approach as bookmarks: `localStorage`, held in a Zustand slice.

**Key:** one entry per chapter

```
reader_vblocks_<chapterId>
```

**Value:** keyed by page `_id`, then by slot

```json
{
  "55959621bec7fcbc38a3bb1d": {
    "TR": {
      "contents": [
        { "id": "rb_1730000000000", "type": "text", "contentType": "Notes 📝",
          "contentValue": "<p>…</p>", "iconLocation": "TR",
          "createdAt": 1730000000000, "updatedAt": 1730000000000 }
      ]
    }
  }
}
```

Why these choices:
- **Page `_id`, not index:** pages can be reordered or inserted in Studio.
- **Same item shape as author contents** (`type / contentType / contentValue
  / iconLocation`), so the modal, the player and
  `formatVirtualBlocksForSubmission` all work with it unchanged. This also
  makes a later move to the backend easy (§9).
- **`id` and timestamps** are needed for a later backend sync and for stable
  React keys.
- Every read and write goes in `try/catch`. Bad JSON or blocked storage
  means "no reader blocks", not a crash. Data from a deleted page is ignored.
- **Size:** Quill HTML can contain base64 images and quickly fill
  `localStorage` (~5 MB). Catch `QuotaExceededError` and show a toast. Image
  upload in the reader's Quill could also be turned off (open question 5).

New constant: `STORAGE_KEYS.READER_VBLOCKS = "reader_vblocks"` in
`src/components/Studio/constants/studio.constants.js`.

## 6. Implementation

### 6.1 Store slice — `src/store/store.js`

Next to the bookmarks slice:

```js
readerVBlocks: {},                       // { [chapterId]: { [pageId]: { [loc]: { contents } } } }
loadReaderVBlocks: (chapterId) => …,
setReaderVBlockSlot: (chapterId, pageId, location, contents) => …, // [] = delete
```

`setReaderVBlockSlot` replaces one slot's contents, removes empty slots and
pages, and writes to `localStorage`.

### 6.2 Hook — `src/components/Studio/hooks/useReaderVBlocks.js` (new)

```js
const { readerBlocks, saveSlot, deleteSlot } = useReaderVBlocks(pageId);
```

A thin wrapper around the store, like `usePageBookmarks`. It reads
`chapterId` from `useParams`. `saveSlot` adds an `id` and timestamps to new
items.

### 6.3 Merge author + reader blocks for display

In `StudioAreaSelector.jsx`, reader mode only: pass `readerBlocks` (for the
active page) to `<VirtualBlocks>` **next to** the existing author
`virtualBlocks`. **Do not merge them into Studio's `virtualBlocks` state.**
That state is what the author's Submit sends, so keeping the reader layer
apart ensures it can never reach `saveBlocks`.

`VirtualBlocks.jsx` passes each `VirtualBlock` both:
- `checkedObject`: the author's contents (as today)
- `readerObject` + `onSaveReader(contents)` / `onDeleteReader()`

### 6.4 `VirtualBlock.jsx`

The reader branch changes:
1. **Empty slot:** render an add button. Clicking it shows the
   `VIRTUAL_BLOCK_MENU` list (reuse `MuiSelect` or an MUI `Menu`), then calls
   `openModal("virtual-block-content", { …, readerMode: true, onSave: onSaveReader })`.
2. **Reader-owned slot:** render the icon (play on click, as today), plus a
   header with edit (pencil) and delete buttons. Delete opens a confirm dialog
   first.
3. **Author slot:** unchanged.

`handlePlayReader` already takes a `contents` array, so it can play reader
items once it reads them from the right source.

### 6.5 `VirtualBlockContentModal` / `ContentItemForm`

Add a `readerMode` prop (or `allowedTypes`):
- Show only the allowed type toggles (§4.3). Hide `autogen` (and `object`,
  depending on open question 3).
- Skip autogen polling when `readerMode` is set.

### 6.6 Styles — `virtualBlock.module.scss`

The `.add` button (faint, appears on hover) and the "mine" marker. Keep the
empty slot the same size so the grid layout does not move.

## 7. Files touched

| File | Change |
|---|---|
| `src/components/Studio/constants/studio.constants.js` | `STORAGE_KEYS.READER_VBLOCKS` |
| `src/store/store.js` | `readerVBlocks` slice |
| `src/components/Studio/hooks/useReaderVBlocks.js` | **New** hook |
| `src/components/Studio/StudioAreaSelector/StudioAreaSelector.jsx` | Pass reader blocks + handlers (reader mode only) |
| `src/components/VirtualBlocks/VirtualBlocks.jsx` | Forward reader props per slot |
| `src/components/VirtualBlocks/VirtualBlock/VirtualBlock.jsx` | Reader add / edit / delete UI |
| `src/components/VirtualBlocks/VirtualBlock/virtualBlock.module.scss` | Add button, "mine" marker |
| `src/components/Modal/VirtualBlockContentModal/*.jsx` | `readerMode` / `allowedTypes` |

Not touched: `ScanAndUpload.handleSubmit`, `formatVirtualBlocksForSubmission`,
and Studio's `virtualBlocks` state.

## 8. Test checklist

- [ ] Reader mode, empty slot: **+** → pick Notes → add text → save. The icon appears with badge 1.
- [ ] Click it: the note plays (text modal). The pencil opens the editor with the note.
- [ ] Edit the note, add a second item, reorder. The badge shows 2, and play opens the navigation modal.
- [ ] Delete: the confirm dialog appears. Cancel keeps the block; confirm removes it and the slot shows **+** again.
- [ ] Author blocks: play only, no edit or delete buttons.
- [ ] Reload: reader blocks remain. Change page and come back: they remain.
- [ ] Chapter A blocks are not shown in chapter B.
- [ ] Studio mode: no reader blocks shown, and Submit payload `v_blocks` is unchanged.
- [ ] Blocked storage / bad JSON: no crash. Quota exceeded: a toast, no crash.
- [ ] VB visibility toggle (`showVB`) hides and shows reader blocks too.
- [ ] Narration and highlighting still work (no extra re-renders or loops in `VirtualBlocks` memoization).

## 9. Later (out of scope)

- **Backend storage** so reader blocks follow the user across devices. This
  needs user identity, which the app does not have yet. It would need an
  endpoint such as `GET/PUT /reader-vblocks/:chapterId` scoped to the user.
  Because the item shape matches the author's, migrating means uploading the
  `localStorage` object once.
- Listing reader notes in the **My Bag** tab, with a click jumping to the
  page and slot.
- Sharing reader notes with a teacher or class.

## 10. Open questions for review

1. **Option A vs B (§3):** personal per-reader blocks (recommended), or should
   readers really change the shared book?
2. **Slots the author already uses:** may a reader add items to them? The
   recommendation is **no**: the reader uses empty slots only, which keeps
   ownership clear. The alternative is to append the reader's items after the
   author's, behind a "mine" marker.
3. **`object` type:** should readers be able to attach interactive objects
   from the library, or only text and links?
4. **Hiding author blocks:** "delete" here only removes the reader's own
   blocks. Do readers also need to hide an author block for themselves?
5. **Images in notes:** allow image paste/upload in the reader's Quill editor?
   Base64 images fill `localStorage` fast. Either turn it off, or upload to
   Cloudinary as the author flow does.
6. **Content language:** do pages keep the same `_id` across content
   languages? (Same question as for bookmarks.) This decides whether notes
   carry over between languages.
