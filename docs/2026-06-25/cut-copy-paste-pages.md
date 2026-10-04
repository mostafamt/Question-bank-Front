# Plan: Cut, Copy, Paste Pages

## Goal

Add three toolbar actions in `StudioThumbnails` that manipulate pages locally only.
Clicking **Save** calls `submitPages` as usual — no additional endpoints are needed for these operations.

---

## Behavior Summary

| Action | Effect on `pages` state | Clipboard |
|--------|------------------------|-----------|
| **Copy** | No change | Stores `{ page, mode: 'copy' }` |
| **Cut** | Removes active page from `pages` | Stores `{ page, mode: 'cut' }` |
| **Paste** | Inserts clipboard page after active page | Cleared after paste |

---

## Clipboard State

A single state in `StudioThumbnails`:

```js
const [clipboard, setClipboard] = useState(null);
// shape: { page: { _id, url, blocks, v_blocks, ... }, mode: 'copy' | 'cut' }
```

---

## Handler Logic

### `handleCopy`
```js
const handleCopy = () => {
  setClipboard({ page: pages[activePage], mode: 'copy' });
};
```
No pages mutation. Just stores the current page object.

---

### `handleCut`
```js
const handleCut = () => {
  const page = pages[activePage];
  setPages((prev) => prev.filter((_, i) => i !== activePage));
  onPageDeleted?.(activePage);             // cleans up areas + navigates
  setClipboard({ page, mode: 'cut' });
};
```
Same local removal path as `handleDeletePage`, but the page is kept in clipboard instead of discarded.

**Guard**: disable Cut when `pages.length === 1` (can't cut the only page).

---

### `handlePaste`
```js
const handlePaste = () => {
  if (!clipboard) return;
  const insertAt = activePage + 1;
  const newPage = { ...clipboard.page, _isPending: true };
  setPages((prev) => [
    ...prev.slice(0, insertAt),
    newPage,
    ...prev.slice(insertAt),
  ]);
  insertPageAtRef?.current?.(insertAt, newPage);   // sync areas
  setClipboard(null);                              // clear after paste
};
```

- **Cut → Paste**: re-inserts the same page object (same `_id`) at the new position. `submitPages` will receive it in the new order — clean reorder.
- **Copy → Paste**: re-inserts the same page object (same `_id`) at the new position. This means the same `_id` appears **twice** in the chapter's page list (see open question below).

`insertPageAtRef` is already available in `usePageNavigation` and is threaded to `StudioThumbnails` via the same ref mechanism used by `addEmptyPage`.

---

## Paste requires `insertPageAtRef`

`handlePaste` needs to call `insertPageAtRef?.current?.(insertAt, newPage)` to keep `useAreaManagement`'s `areas` and `areasProperties` arrays in sync. 

`insertPageAtRef` is not currently a prop of `StudioThumbnails`. It must be threaded:
`usePageNavigation` already owns the ref — expose a stable `insertPageAt` wrapper from the hook, thread it through `Studio` → `useStudioColumns` → `buildLeftColumns` → `StudioThumbnails` as a prop (same pattern as `addEmptyPage`).

Alternatively, extract a shared `insertPageLocally(insertAt, page)` helper inside `usePageNavigation` and expose it.

**Recommended**: add `insertPageLocally` to `usePageNavigation`:
```js
const insertPageLocally = (insertAt, page) => {
  setPages((prev) => [
    ...prev.slice(0, insertAt),
    page,
    ...prev.slice(insertAt),
  ]);
  insertPageAtRef?.current?.(insertAt, page);
};
```
Then `addEmptyPage` and `handlePaste` both use `insertPageLocally` internally — removes duplication.

---

## Save (no change)

`handleSave` already collects all `pages._id`s and calls `submitPages`. No changes needed.

- **Cut → Paste**: the page's `_id` appears once in the new position — clean.
- **Copy → Paste**: the same `_id` appears twice (see open question).

---

## UI / Icons

| Label | MUI Icon |
|-------|----------|
| `cut` | `ContentCutIcon` |
| `copy` | `ContentCopyIcon` (`ContentCopyIcon` already imported but unused) |
| `paste` | `ContentPasteIcon` |

**Paste button** should be visually disabled when `clipboard === null`.

---

## `tabs.config.json` changes

Add three entries to the `thumbnails` actions array:

```json
{ "label": "cut",   "mode": ["book-author"] },
{ "label": "copy",  "mode": ["book-author"] },
{ "label": "paste", "mode": ["book-author"] }
```

---

## Files to Change

| File | Change |
|------|--------|
| `hooks/usePageNavigation.js` | Add `insertPageLocally` helper; use it inside `addEmptyPage` |
| `Studio.jsx` | Thread `insertPageLocally` to `useStudioColumns` |
| `hooks/useStudioColumns.js` | Accept and forward `insertPageLocally` to `buildLeftColumns` |
| `columns/index.js` | Pass `insertPageLocally` to `<StudioThumbnails>` |
| `StudioThumbnails.jsx` | Add `clipboard` state; add `handleCopy`, `handleCut`, `handlePaste`; add 3 entries to `thumbnailActions` |
| `config/tabs.config.json` | Add `cut`, `copy`, `paste` action entries |

---

## Open Question: Copy + Paste Duplicate IDs

When a page is copied and pasted, the same `_id` appears at two positions in the `pages` array. `submitPages` will send `[..., id_A, ..., id_A, ...]` to the server.

**You should confirm**: does the server deduplicate IDs, reject duplicates, or store both references? If duplicates are not supported, copy+paste would need to call `addNewPage` on save to create a real second copy — which would require a change to `handleSave`.
