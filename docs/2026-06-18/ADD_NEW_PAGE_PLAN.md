# Add New Page Feature Plan

## Goal

Replace the client-side-only `addBlankPage` prop with a local `handleAddNewPage` function
inside `StudioThumbnails` that:
1. Calls `POST /pages/new` to create the page on the server.
2. Syncs the local `areas` / `areasProperties` state via an `onPageAdded` callback.
3. Silently refetches the pages list via `queryClient.invalidateQueries` (no tab reload).

---

## Current State

```
usePageNavigation.addBlankPage (client-side only: canvas URL, local state update, no API call)
  └─▶ Studio.jsx  rightColumnProps memo
        └─▶ useStudioColumns.buildLeftColumns({ addBlankPage })
              └─▶ columns/index.js buildLeftColumns({ addBlankPage })
                    └─▶ <StudioThumbnails addBlankPage={addBlankPage} />
                              └─▶ addBlankPage?.(activePage)  ← "new" button
```

**Problems:**
- Page is created locally with a canvas-generated white image — never persisted to the server until blocks are submitted.
- No real page `_id` from the server exists until submission.

---

## Proposed Data Flow (after)

```
StudioThumbnails.handleAddNewPage()
  ├─▶ POST /pages/new  { blocks: [], chapterId }
  │     ← returns the created page object with server _id
  ├─▶ onPageAdded(insertAt, newPage)
  │     ← callback from Studio: inserts empty areas entry + navigates to new page
  └─▶ queryClient.invalidateQueries({ queryKey: [`book-${bookId}-chapter-${chapterId}`] })
        ← silent background refetch, same pattern as delete
```

---

## API Request

**Endpoint:** `POST /pages/new`  
**Base URL:** `https://questions-api-navy.vercel.app/api` (default axios instance)

**Body:**
```json
{
  "blocks": [],
  "chapterId": "<chapterId from useParams>"
}
```

**Response:** the newly created page object (expected to contain `_id`, `url`, `blocks`, `v_blocks`)

---

## Files Changed

### 1. `src/api/bookapi.js`
Add a new function:
```js
export const addNewPage = async ({ chapterId }) => {
  const res = await axios.post("/pages/new", { blocks: [], chapterId });
  return res.data;
};
```

### 2. `src/components/Studio/StudioThumbnails/StudioThumbnails.jsx`
- **Remove** `addBlankPage` from props.
- **Add** `onPageAdded` to props (`refetch` is already gone; `queryClient` already in scope).
- **Import** `addNewPage` from `bookapi.js`.
- **Add** local `handleAddNewPage`:

```js
const handleAddNewPage = async () => {
  try {
    const newPage = await addNewPage({ chapterId });
    const insertAt = activePage + 1;
    onPageAdded?.(insertAt, newPage);
    await queryClient.invalidateQueries({
      queryKey: [`book-${bookId}-chapter-${chapterId}`],
    });
    toast.success("New page added successfully.");
  } catch (err) {
    toast.error("Failed to add new page.");
  }
};
```
- Replace `onClick: () => addBlankPage?.(activePage)` with `onClick: handleAddNewPage`.

### 3. `src/components/Studio/hooks/usePageNavigation.js`
- **Remove** the entire `addBlankPage` function (lines 57–69).
- **Remove** `addBlankPage` from the return object.
- `insertPageAtRef` parameter stays — it is still used by `addLocalPages`.

### 4. `src/components/Studio/Studio.jsx`
- **Remove** `addBlankPage` from the `usePageNavigation` destructure.
- **Remove** `addBlankPage` from `rightColumnProps` useMemo (value + deps array).
- **Add** `onPageAdded` callback:
  ```js
  const onPageAdded = React.useCallback(
    (insertAt, newPage) => {
      insertPageAt(insertAt, newPage);
      changePageByIndex(insertAt);
    },
    [insertPageAt, changePageByIndex]
  );
  ```
- Pass `onPageAdded` to `useStudioColumns`.

### 5. `src/components/Studio/hooks/useStudioColumns.js`
- **Remove** `addBlankPage: rightColumnProps.addBlankPage` from the `buildLeftColumns` call.
- **Add** `onPageAdded` parameter and pass it to `buildLeftColumns`.

### 6. `src/components/Studio/columns/index.js` (`buildLeftColumns`)
- **Remove** `addBlankPage` from the function's parameter list.
- **Add** `onPageAdded` to the parameter list.
- **Pass** `onPageAdded` to `<StudioThumbnails>` and **remove** `addBlankPage` prop.

---

## Edge Cases

| Case | Handling |
|---|---|
| API call fails | Show toast error, do not call `onPageAdded` or `invalidateQueries` |
| `activePage` is the last page | `insertAt = activePage + 1` appends after last page — valid |
| `onPageAdded` is undefined (sub-object mode) | Guard with `onPageAdded?.()` |

---

## What Is NOT Changed

- `insertPageAtRef` wiring in `Studio.jsx` — still needed by `addLocalPages`.
- `addLocalPages` — unrelated to this feature.
- `createBlankPageUrl` helper — no longer used once `addBlankPage` is removed; can be deleted.
- Reader mode column builder — no "new page" action in reader mode.

---

## Summary of Prop Removals

| File | Removed |
|---|---|
| `usePageNavigation.js` | `addBlankPage` function + return value |
| `Studio.jsx` | `addBlankPage` from destructure, `rightColumnProps` value + deps |
| `useStudioColumns.js` | `addBlankPage: rightColumnProps.addBlankPage` from `buildLeftColumns` call |
| `columns/index.js` | `addBlankPage` param + `StudioThumbnails` prop |
| `StudioThumbnails.jsx` | `addBlankPage` prop |
