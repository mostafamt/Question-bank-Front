# Plan: Local-First New Page Creation

## Goal

Change `handleAddNewPage` so it adds a page locally (client-side only) without hitting the backend. The backend is only called when the user clicks the **Save** button in `StudioThumbnails`.

---

## Current Flow

```
click "new" → addNewPage (POST /pages/new) → submitPages (POST /pages/submit) → invalidate query → navigate
```

All three network calls happen immediately on click.

---

## Proposed Flow

```
click "new"  → add placeholder page to local `pages` state → navigate to it
click "save" → for each pending page: POST /pages/new → POST /pages/submit (all IDs) → sync local state
```

---

## Changes Required

### 1. `usePageNavigation.js` — add `addEmptyPage`

Add a new function alongside `addLocalPages` that inserts a placeholder page object into the local `pages` array without calling the API.

```js
const addEmptyPage = (afterIndex) => {
  const tempPage = {
    _id: uuidv4(),      // temporary client-only ID
    _isPending: true,   // flag: not yet saved to server
    blocks: [],
    v_blocks: [],
    url: null,          // no image yet
  };
  const insertAt = afterIndex + 1;
  const updatedPages = [
    ...pages.slice(0, insertAt),
    tempPage,
    ...pages.slice(insertAt),
  ];
  setPages(updatedPages);
  insertPageAtRef?.current?.(insertAt, tempPage);
  changePageByIndex(insertAt);
};
```

Expose `addEmptyPage` from the hook's return value.

---

### 2. `StudioThumbnails.jsx` — update `handleAddNewPage`

Replace the async API calls with a synchronous local insertion:

```js
const handleAddNewPage = () => {
  addEmptyPage(activePage);  // prop passed from Studio
};
```

`addEmptyPage` must be passed down as a prop from `Studio` → `useStudioColumns` → `StudioThumbnails` (same path as `addLocalPages`).

---

### 3. `StudioThumbnails.jsx` — implement `handleSave`

The save button currently has `onClick: () => {}`. Replace it with a handler that:

1. Finds all pages with `_isPending: true`.
2. For each pending page, calls `POST /pages/new` to get a real `{ pageId, url }`.
3. Replaces the temporary page in local state with `{ _id: pageId, url, _isPending: false }`.
4. Collects all final page IDs (existing + newly created) and calls `submitPages` once.
5. Invalidates the React Query cache so the rest of the app sees the updated list.

```js
const handleSave = async () => {
  try {
    const updatedPages = [...pages];

    for (let i = 0; i < updatedPages.length; i++) {
      if (updatedPages[i]._isPending) {
        const { pageId, url } = await addNewPage({ chapterId });
        updatedPages[i] = { ...updatedPages[i], _id: pageId, url, _isPending: false };
      }
    }

    const pageIds = updatedPages.map((p) => p._id).filter(Boolean);
    await submitPages({ pageIds, chapterId });
    setPages(updatedPages);

    await queryClient.invalidateQueries({
      queryKey: [`book-${bookId}-chapter-${chapterId}`],
    });

    toast.success("Pages saved successfully.");
  } catch {
    toast.error("Failed to save pages.");
  }
};
```

Wire it to the `"save"` entry in `thumbnailActions`.

---

### 4. Prop threading

`addEmptyPage` needs to travel: `usePageNavigation` → `Studio` → `useStudioColumns` → `StudioThumbnails`.

This is the same path `addLocalPages` already takes — add `addEmptyPage` alongside it.

---

## Visual UX for Pending Pages

Pages with `_isPending: true` have `url: null`. The thumbnail `<img>` will break without a `src`. Two options:

| Option | Approach |
|--------|----------|
| **A** | Show a grey placeholder div instead of `<img>` when `url` is null |
| **B** | Use a local blank white PNG as the default `url` |

**Recommendation: Option A** — it makes unsaved pages visually distinct and reminds the user to save.

---

## Edge Cases

| Case | Handling |
|------|----------|
| User deletes a pending page before saving | `handleDeletePage` should skip the API call if `page._isPending` is true — just remove from local state |
| User navigates away without saving | Pending pages are lost (in-memory only). Consider a `beforeunload` warning if any `_isPending` pages exist |
| Save fails mid-way (e.g., 2nd of 3 pending pages fails) | The loop stops; pages created before the failure already have real IDs. Re-running save will skip them (no `_isPending`). Partial saves are recoverable. |

---

## Files to Change

| File | Change |
|------|--------|
| `hooks/usePageNavigation.js` | Add `addEmptyPage`, expose it |
| `StudioThumbnails/StudioThumbnails.jsx` | Replace `handleAddNewPage`, implement `handleSave`, accept `addEmptyPage` prop |
| `hooks/useStudioColumns.js` | Thread `addEmptyPage` prop to `StudioThumbnails` |
| `Studio.jsx` | Pass `addEmptyPage` into `useStudioColumns` |
