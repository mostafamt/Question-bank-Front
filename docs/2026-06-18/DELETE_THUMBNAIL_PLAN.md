# Delete Thumbnail Feature Plan

## Goal

Replace the client-side-only `deletePage` prop with a local `handleDeletePage` function
inside `StudioThumbnails` that:
1. Calls the existing `submitPages` API with the IDs of the **remaining** pages (all pages except the deleted one) — same endpoint used for importing pages.
2. Refetches the pages list from the server (same pattern as import/submit).

---

## Current State

```
usePageNavigation.deletePage (client-side only: filters pages array, no API call)
  └─▶ Studio.jsx  rightColumnProps memo
        └─▶ useStudioColumns.buildLeftColumns({ deletePage })
              └─▶ columns/index.js buildLeftColumns({ deletePage })
                    └─▶ <StudioThumbnails deletePage={deletePage} />
                              └─▶ deletePage?.(activePage)  ← thumbnail actions button
```

**Problems:**
- No API call is made — deletion is never persisted to the server.
- No refetch after deletion — server and client state diverge.

---

## Proposed Data Flow (after)

```
StudioThumbnails.handleDeletePage(pageIndex)
  ├─▶ submitPages({ pageIds: remainingIds, chapterId })
  │     ← existing API: POST /pages/submit with all page IDs except the deleted one
  ├─▶ onPageDeleted(pageIndex)   ← callback from Studio to clean up areas state
  └─▶ refetch()                  ← re-query server → ScanAndUpload.setPages(fetchedPages)
```

`remainingIds` = `pages.filter((_, i) => i !== pageIndex).map(p => p._id)`

`refetch` and `onPageDeleted` are passed down:
```
ScanAndUpload.refetch
  └─▶ Studio.jsx (already has refetch as prop)
        └─▶ useStudioColumns({ refetch })           ← new param
              └─▶ buildLeftColumns({ refetch })     ← new param
                    └─▶ <StudioThumbnails refetch={refetch} onPageDeleted={onPageDeleted} />
```

`onPageDeleted` is a callback created in `Studio.jsx` that wraps the existing
area-state cleanup without being the old client-side page-array mutation:
```
Studio.jsx:
  const onPageDeleted = useCallback((pageIndex) => {
    deletePageAt(pageIndex);                              // clean up areas/areasProperties
    changePageByIndex(Math.max(0, pageIndex - 1));        // navigate away from deleted page
  }, [deletePageAt, changePageByIndex]);
```

---

## Files Changed

### 1. `src/api/bookapi.js`
No changes needed. The existing `submitPages` function is reused:
```js
// already exists — no new function required
export const submitPages = async ({ pageIds, chapterId }) => {
  const res = await axios.post("/pages/submit", { pageIds, chapterId });
  return res.data;
};
```

### 2. `src/components/Studio/StudioThumbnails/StudioThumbnails.jsx`
- **Remove** `deletePage` from props.
- **Add** `refetch` and `onPageDeleted` to props.
- `chapterId` is already available via `useParams()` — no prop change needed.
- **Import** `submitPages` from `bookapi.js`.
- **Add** local `handleDeletePage`:

```js
const handleDeletePage = async (pageIndex) => {
  const remainingIds = pages
    .filter((_, i) => i !== pageIndex)
    .map((p) => p._id)
    .filter(Boolean);                    // exclude locally-created pages with no server id

  try {
    await submitPages({ pageIds: remainingIds, chapterId });
    onPageDeleted?.(pageIndex);
    refetch?.();
  } catch (err) {
    toast.error("Failed to delete the page.");
  }
};
```
- Replace `onClick: () => deletePage?.(activePage)` with `onClick: () => handleDeletePage(activePage)`.

### 3. `src/components/Studio/hooks/usePageNavigation.js`
- **Remove** the entire `deletePage` function (lines 89–96).
- **Remove** `deletePage` from the return object.
- `deletePageAtRef` parameter can stay — it is still used by `Studio.jsx` for the
  `onPageDeleted` callback described above.

### 4. `src/components/Studio/Studio.jsx`
- **Remove** `deletePage` from the `rightColumnProps` useMemo (line 209).
- **Add** `onPageDeleted` callback:
  ```js
  const onPageDeleted = React.useCallback((pageIndex) => {
    deletePageAt(pageIndex);
    changePageByIndex(Math.max(0, pageIndex - 1));
  }, [deletePageAt, changePageByIndex]);
  ```
- Pass `refetch` and `onPageDeleted` to `useStudioColumns`.

### 5. `src/components/Studio/hooks/useStudioColumns.js`
- **Add** `refetch` and `onPageDeleted` to the hook's parameter object.
- **Remove** `deletePage: rightColumnProps.deletePage` from the `buildLeftColumns` call.
- **Add** `refetch` and `onPageDeleted` to the `buildLeftColumns` call.

### 6. `src/components/Studio/columns/index.js` (`buildLeftColumns`)
- **Remove** `deletePage` from the function's parameter list.
- **Add** `refetch` and `onPageDeleted` to the parameter list.
- **Pass** them to `<StudioThumbnails>` and **remove** the `deletePage` prop.

---

## Edge Cases

| Case | Handling |
|---|---|
| Page has no `_id` (blank page added locally but never saved) | Its ID is excluded from `remainingIds` via `.filter(Boolean)` — it simply won't be in the submitted list |
| API call fails | Show toast error, do not call `onPageDeleted` or `refetch` |
| `pages` is empty after deletion | `changePageByIndex(Math.max(0, pageIndex - 1))` lands on index 0 or stays safe |
| `refetch` is undefined (Studio used as sub-object) | Guard with `refetch?.()` |

---

## What Is NOT Changed

- `deletePageAt` in `useAreaManagement` — still used via `onPageDeleted` callback.
- `deletePageAtRef` wiring in `Studio.jsx` — still needed to keep the ref updated.
- `addBlankPage` / `addLocalPages` — unrelated to this feature.
- Reader mode column builder (`buildReaderLeftColumns`) — thumbnails there don't have a delete action.

---

## Summary of Prop Removals

| File | Removed |
|---|---|
| `usePageNavigation.js` | `deletePage` function + return |
| `Studio.jsx` | `deletePage` from `rightColumnProps` |
| `useStudioColumns.js` | `deletePage: rightColumnProps.deletePage` from `buildLeftColumns` call |
| `columns/index.js` | `deletePage` param + `StudioThumbnails` prop |
| `StudioThumbnails.jsx` | `deletePage` prop |
