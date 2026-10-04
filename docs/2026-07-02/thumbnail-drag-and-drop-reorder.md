# Drag-and-Drop Reordering for StudioThumbnails

## Context

`StudioThumbnails` (`src/components/Studio/StudioThumbnails/StudioThumbnails.jsx`) renders the vertical list of page thumbnails (`pages.map(...)` → `<img>`) alongside the toolbar of page actions (new, add, delete, copy, cut, paste, import, save). Today thumbnails are click-only: clicking a thumbnail calls `onClickImage(idx)` to navigate to that page. There is no way to reorder pages.

**Goal:** Let a book author drag a thumbnail up/down to reorder pages, then persist the new order to the backend on **save**.

### Current data flow (what we build on)

- `pages` and `setPages` are owned by a parent (`Studio.jsx` receives them as props) and passed down to `StudioThumbnails`. Each page is an object like `{ _id, url, blocks, v_blocks, _isPending }`.
- `usePageNavigation` (`src/components/Studio/hooks/usePageNavigation.js`) manages `activePageIndex` and page mutations (insert/add/import). It keeps a **parallel** structure in sync via refs — every insert calls `insertPageAtRef`/`insertPagesAtRef`, and deletes call `deletePageAtRef`. These refs point at `useAreaManagement`'s `insertPageAt`/`insertPagesAt`/`deletePageAt`, which keep `areas` and `areasProperties` (the per-page interactive blocks) aligned by index.
  - **Critical constraint:** `areas` and `areasProperties` are index-aligned with `pages`. Any reorder of `pages` MUST apply the identical permutation to those arrays, or blocks will attach to the wrong page. This is the main risk of the feature.
- `activePageIndex` is a numeric index (persisted to `localStorage` under `STORAGE_KEYS.AUTHOR_PAGE`). After a reorder, the active page's **index** changes even though it's the same page — we must remap it so the highlighted thumbnail follows the page the user was on.
- Save already exists: `handleSave` in `StudioThumbnails` calls `submitPages({ pageIds, chapterId })` where `pageIds = pages.map(p => p._id)`. **The order of `pageIds` in that request already reflects array order** — so if `pages` is reordered in state before save, the existing submit call transmits the new order for free, *if the backend treats the array order as the page order.*

### The DnD library is already in the stack

`@hello-pangea/dnd` is a project dependency and already used in `StudioActions.jsx` (`DragDropContext` / `Droppable` / `Draggable`). We reuse the same pattern for consistency rather than introducing a new library.

## Design

### Where the change lives

Primary file: `src/components/Studio/StudioThumbnails/StudioThumbnails.jsx` (wrap the thumbnail list in DnD, add `onDragEnd`).

Supporting change: a new reorder handler that permutes `pages` **and** the index-aligned `areas`/`areasProperties`/`activePageIndex`. Because those aligned arrays live in `Studio.jsx`/`useAreaManagement`, the cleanest approach is to add a `reorderPages(fromIndex, toIndex)` function to `usePageNavigation` (mirroring how `insertPageLocally` already coordinates `setPages` + the ref-based sibling updates) and pass it down as a prop, exactly like `insertPageLocally` / `addImportedPages` are passed today.

### 1. Add a `reorderPageAt` to the area layer

In `useAreaManagement`, add a handler alongside `insertPageAt` / `deletePageAt`:

```js
const reorderPageAt = (fromIndex, toIndex) => {
  setAreas((prev) => reorderArray(prev, fromIndex, toIndex));
  setAreasProperties((prev) => reorderArray(prev, fromIndex, toIndex));
};
```

Expose a ref for it (`reorderPageAtRef`) in `Studio.jsx`, matching the existing `insertPageAtRef` / `deletePageAtRef` wiring (a `useEffect` that keeps `reorderPageAtRef.current = reorderPageAt`).

### 2. Add `reorderPages` to `usePageNavigation`

```js
const reorderPages = (fromIndex, toIndex) => {
  if (fromIndex === toIndex) return;
  setPages((prev) => reorderArray(prev, fromIndex, toIndex));
  reorderPageAtRef?.current?.(fromIndex, toIndex);

  // Keep the highlighted page following the page the user was on.
  setActivePageIndex((current) => remapIndexAfterReorder(current, fromIndex, toIndex));
};
```

`remapIndexAfterReorder(current, from, to)`:
- if `current === from` → `to`
- if `from < current <= to` → `current - 1`
- if `to <= current < from` → `current + 1`
- else unchanged

Also update the `localStorage` `AUTHOR_PAGE` value to the remapped index (reuse `changePageByIndex`).

Return `reorderPages` from the hook and thread it through `Studio.jsx` → `StudioThumbnails` props (same path as `insertPageLocally`).

Shared helper `reorderArray(list, from, to)` (splice out, splice in) — put it in `src/components/Studio/utils/` (or reuse the existing `reorder` helper already imported in `StudioActions.jsx` if it lives in a shared util; confirm its location before duplicating).

### 3. Wrap the thumbnail list in DnD (`StudioThumbnails.jsx`)

Replace the current `pages.map(...)` block:

```jsx
<DragDropContext onDragEnd={onDragEnd}>
  <Droppable droppableId="studio-thumbnails">
    {(provided) => (
      <div
        className={styles["thumbnails-container"]}
        ref={(el) => { containerRef.current = el; provided.innerRef(el); }}
        {...provided.droppableProps}
      >
        {pages.map((img, idx) => {
          const key = img?._id ?? idx; // stable key required for DnD
          const isActive = activePage === idx;
          return (
            <Draggable key={key} draggableId={String(key)} index={idx}>
              {(dragProvided, snapshot) => (
                <img
                  ref={dragProvided.innerRef}
                  {...dragProvided.draggableProps}
                  {...dragProvided.dragHandleProps}
                  src={img?.url || img}
                  alt={img?.url || img}
                  width="100%"
                  onClick={() => onClickImage(idx)}
                  style={{
                    border: isActive ? "1rem solid #ccc" : "1rem solid transparent",
                    opacity: snapshot.isDragging ? 0.8 : 1,
                    ...dragProvided.draggableProps.style,
                  }}
                />
              )}
            </Draggable>
          );
        })}
        {provided.placeholder}
      </div>
    )}
  </Droppable>
</DragDropContext>
```

`onDragEnd`:

```js
const onDragEnd = (result) => {
  if (!result.destination) return;
  const from = result.source.index;
  const to = result.destination.index;
  if (from === to) return;
  reorderPages(from, to);
};
```

**Notes / caveats to handle:**
- **Stable keys:** the current list uses `key={idx}`, which breaks DnD (index keys make React reuse the wrong nodes during a reorder). Switch to `img._id`. Confirm every page has an `_id` — pages created via `addLocalPages` get a `uuidv4()`, imported/new pages get a backend `pageId`, so this holds. Fall back to `idx` only if `_id` is missing.
- **containerRef vs Droppable innerRef:** the existing auto-scroll `useEffect` reads `containerRef.current.children[activePage]`. With DnD, `Draggable` may add a wrapper — verify `container.children[idx]` still maps 1:1 to thumbnails. Merge the two refs as shown above.
- **Click vs drag:** `@hello-pangea/dnd` distinguishes a click from a drag by movement threshold, so `onClick` (page navigation) still works. Verify manually.

### 4. Persisting order on save

Two options — pick based on backend capability:

- **Option A (no backend change, preferred if the API respects array order):** do nothing extra. `handleSave` already sends `pageIds = pages.map(p => p._id)` in array order to `submitPages`. After a reorder, `pages` is already permuted, so the request carries the new order. Confirm the backend persists the received order.
- **Option B (explicit order field):** add a dedicated endpoint/param. Add `reorderPages` API in `src/api/bookapi.js`:

  ```js
  export const reorderPages = async ({ chapterId, pageIds }) => {
    const res = await axios.post("/pages/reorder", { chapterId, pageIds });
    return res.data;
  };
  ```

  and call it from `handleSave` (or immediately on drop for autosave). Order is conveyed by array position of `pageIds`, or by an explicit `{ pageId, order }[]` payload if the backend wants indices.

**Recommendation:** Option A if the existing `/pages/submit` already treats array order as canonical; otherwise Option B. This needs a one-line confirmation from the backend contract before implementing.

### 5. Mark reordered state as pending / dirty

After a reorder, the on-screen order differs from what's saved. Match the existing pattern: `handleSave` flips `_isPending: false` on all pages after a successful submit, so consider setting `_isPending: true` on reorder (or at least track a `dirty` flag) so the user knows a save is needed. Low priority; confirm whether current UX already surfaces unsaved state.

## Files touched

| File | Change |
|---|---|
| `src/components/Studio/StudioThumbnails/StudioThumbnails.jsx` | Wrap list in `DragDropContext`/`Droppable`/`Draggable`, add `onDragEnd`, switch to `_id` keys, merge refs, accept `reorderPages` prop |
| `src/components/Studio/hooks/usePageNavigation.js` | Add `reorderPages(from, to)` + `remapIndexAfterReorder`, return it |
| `src/components/Studio/hooks/useAreaManagement.js` | Add `reorderPageAt(from, to)` to keep `areas`/`areasProperties` aligned |
| `src/components/Studio/Studio.jsx` | Add `reorderPageAtRef` wiring; pass `reorderPages` down to `StudioThumbnails` |
| `src/components/Studio/utils/` (or reuse existing `reorder`) | `reorderArray(list, from, to)` helper |
| `src/api/bookapi.js` | *(Option B only)* `reorderPages` API call |
| `studioThumbnails.module.scss` | *(optional)* dragging/hover styles, drag-handle affordance |

## Risks & open questions

1. **Index alignment is the #1 risk.** `pages`, `areas`, and `areasProperties` must be permuted identically. Any path that reorders one but not the others corrupts block-to-page mapping. Reordering must go through a single coordinated function.
2. **Backend contract:** Does `/pages/submit` already persist array order, or is a new `/pages/reorder` endpoint / explicit `order` field required? (Decides Option A vs B.) **Needs confirmation.**
3. **When to persist:** on explicit Save (matches current model, safest) vs autosave-on-drop (snappier but more requests). Recommend on Save.
4. **`activePageIndex` remap** must be correct so the highlighted/active editing page follows the moved page; also update the `localStorage` value.
5. **Auto-scroll `useEffect`** depends on `containerRef.current.children[activePage]` — verify DnD wrappers don't offset the child indexing.
6. **Pending/dirty UX:** should a reorder mark pages dirty so the user knows to save?

## Suggested implementation order

1. Add `reorderArray` helper + `reorderPageAt` in `useAreaManagement` + ref wiring in `Studio.jsx`.
2. Add `reorderPages` + index remap in `usePageNavigation`; thread the prop to `StudioThumbnails`.
3. Wire DnD UI in `StudioThumbnails` (`_id` keys, `onDragEnd`).
4. Confirm backend contract; implement Option A or B in `handleSave`.
5. Manual test: drag reorder, confirm blocks stay on correct pages, active page follows, save persists, reload shows new order.
