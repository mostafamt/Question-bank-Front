# Fix: `onClickDeleteArea` Deletes the Wrong Area (Index Mismatch)

**Status:** Plan — awaiting review
**File:** `src/components/Studio/hooks/useAreaManagement.js`

---

## 1. The Problem

`onClickDeleteArea(idx)` receives an index and uses it directly on the
**unfiltered** per-page arrays:

```js
const area      = areas[activePageIndex]?.[idx];
const areaProps = areasProperties[activePageIndex]?.[idx];
...
updateAreaProperty(idx, { status: DELETED });               // soft delete
deleteAreaByIndex(prevAreas, activePageIndex, idx);         // hard delete
deleteAreaByIndex(prevProps, activePageIndex, idx);
```

But the index comes from a **filtered** list. In
`src/components/Studio/StudioActions/StudioActions.jsx`:

```jsx
{(areasProperties[activePage] || [])
  .filter((item) => item.status !== DELETED)   // <-- removes soft-deleted items
  .map((area, idx) => (
    <AreaAction idx={idx} onClickDeleteArea={onClickDeleteArea} ... />
  ))}
```

and `AreaAction.handleDelete` calls `onClickDeleteArea(idx)`.

So once any server block on the page has been soft-deleted (it stays in the
arrays with `status: "deleted"`), every item after it in the UI has an `idx`
that is **smaller than its real position** in `areas` / `areasProperties`.

### Reproduction

Page has three server blocks: `A`, `B`, `C` (real indexes 0, 1, 2).

1. Delete `A` → `A` gets `status: DELETED`, stays at index 0. UI now shows
   `B` (idx 0), `C` (idx 1).
2. Delete `C` (UI idx 1) → hook operates on real index 1 → **`B` is deleted**
   instead of `C`.
3. Delete `B`/`C` (UI idx 0) → hook targets index 0 → `A` again (already
   deleted) → nothing visible happens.

The same mismatch affects client-only (hard-deleted) areas whenever a
soft-deleted server area precedes them, and a deep-block white overlay may be
recorded for the wrong block.

### Same bug, other call sites

`updateAreaProperty(idx, ...)` has the identical problem when called with the
filtered idx:

- `AreaAction.handleToggle` → `updateAreaProperty(idx, { open: !area.open })`
  (expand/collapse toggles the wrong item).

`onChangeLabel` is **not** affected — `useLabelManagement` already resolves the
index from the id via `findIndex(area => area.id === id)`. That is the pattern
we should follow.

---

## 2. Proposed Fix — Delete by `id`, not by index

Every area property has a stable `id` (`area.id`), and `areas` /
`areasProperties` are index-aligned per page. So: pass the `id` from the UI,
resolve the **real** index inside the hook, then reuse the existing logic.

### Step 1 — `useAreaManagement.js`: change `onClickDeleteArea` signature

```js
const onClickDeleteArea = React.useCallback(
  (id) => {
    const pageProps = areasProperties[activePageIndex] || [];
    const idx = pageProps.findIndex((a) => a.id === id);

    if (idx === -1) {
      console.warn(`Cannot delete area "${id}": not found`);
      return;
    }

    const area = areas[activePageIndex]?.[idx];
    const areaProps = pageProps[idx];

    if (!area) {
      console.warn(`Cannot delete area "${id}": no matching rendered area`);
      return;
    }

    if (isDeepBlock(areaProps) && areaProps?.isServer) {
      addDeletedDeepBlockArea(area, areaProps);
    }

    if (areaProps?.isServer) {
      updateAreaPropertyById(id, { status: DELETED });   // by id, not idx
    } else {
      setAreas((prev) => deleteAreaByIndex(prev, activePageIndex, idx));
      setAreasProperties((prev) => deleteAreaByIndex(prev, activePageIndex, idx));
    }
  },
  [activePageIndex, areas, areasProperties, addDeletedDeepBlockArea, updateAreaPropertyById]
);
```

Notes:
- Remove the temporary `console.log('idx= ', idx); return;` debug lines.
- `updateAreaPropertyById` is a plain function declared *after*
  `onClickDeleteArea`; move it above (and wrap in `useCallback` with a
  functional `setAreasProperties`) so it can be listed as a dependency and
  doesn't operate on stale state.
- Update the JSDoc: `@param {string} id - Id of the area to delete`.

### Step 2 — Hard delete: keep index-based removal, but compute index inside the updater (optional hardening)

Because the index is resolved from the render-time `areasProperties`, a rapid
double action could in theory use a stale index. Safer variant: resolve the
index inside each functional updater from `prevProps[activePageIndex]`:

```js
setAreasProperties((prev) => {
  const i = prev[activePageIndex]?.findIndex((a) => a.id === id) ?? -1;
  if (i === -1) return prev;
  setAreas((prevAreas) => deleteAreaByIndex(prevAreas, activePageIndex, i));
  return deleteAreaByIndex(prev, activePageIndex, i);
});
```

(Or add a `deleteAreaById(collection, pageIndex, id)` helper to
`utils/areaUtils.js`. Note `areas` items don't carry the `id`, so `areas`
must still be removed by the index found in `areasProperties`.)
→ **Decision for review:** do we want this hardening, or is Step 1 enough?

### Step 3 — `AreaAction.jsx`: pass the id

```js
const handleDelete = (id, event) => {
  event.stopPropagation();
  onClickDeleteArea(area.id);
};

const handleToggle = () => updateAreaPropertyById(area.id, { open: !area.open });
```

### Step 4 — Check other consumers of `onClickDeleteArea`

It's threaded through, but only *invoked* in `AreaAction`. Verify none of these
call it with an index:

- `src/components/AreaActionHeader/AreaActionHeader.jsx` (receives it as a prop)
- `src/components/Studio/Studio.jsx`
- `src/components/Studio/context/StudioContext.jsx`
- `src/components/Studio/hooks/useStudioColumns.js`
- `src/components/Studio/columns/index.js`
- `src/components/Studio/StudioActions/StudioActions.jsx`

### Step 5 — (Out of scope, note only)

- `StudioActions.onDragEnd` is currently disabled (`return areasProperties;`
  + TODO). When re-enabled it will hit the same filtered-vs-real index issue
  and should map `result.source.index` / `destination.index` through the
  filtered list's ids.
- The `display: area.status === DELETED ? "none" : "block"` style in
  `StudioActions` is dead code (deleted items are already filtered out).

---

## 3. Test Plan

Manual, in Studio on a page with existing server blocks:

| # | Scenario | Expected |
|---|----------|----------|
| 1 | Delete the **first** of 3 server blocks, then the **last** | Exactly those two are gone; middle one remains |
| 2 | Delete a server block, then a **new client** block drawn after it | Correct client block removed (hard delete), server one stays soft-deleted |
| 3 | Delete a server **deep block** after another deleted block | White overlay appears over the correct block's area |
| 4 | Soft-delete a block, then toggle open/close on the next item | The clicked item toggles, not its neighbour |
| 5 | Delete, then Submit | Payload marks the right blocks as `deleted` (check network request) |
| 6 | Sub-object Studio (`subObject = true`) | Delete still works |

---

## 4. Files to Change

| File | Change |
|------|--------|
| `src/components/Studio/hooks/useAreaManagement.js` | `onClickDeleteArea(id)`; resolve index by id; remove debug lines; make `updateAreaPropertyById` a stable `useCallback` declared earlier |
| `src/components/AreaAction/AreaAction.jsx` | Pass `area.id` to delete; toggle via `updateAreaPropertyById` |
| `src/components/Studio/utils/areaUtils.js` | *(Optional, Step 2)* add `deleteAreaById` helper |
