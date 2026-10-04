# StudioThumbnails — Persist Uploaded Page URL on Save Plan

## Goal

Close the gap left by the ["add" upload feature](./STUDIO_THUMBNAILS_UPLOAD_PDF_IMAGE_PLAN.md):
pages created from an uploaded image or a converted PDF page get a real
image url locally, but the backend page doc only has the blank placeholder
`addNewPage` created it with. Fire `POST /save-blocks` (the "save-pages"
request — it's what actually persists a page's thumbnail/image) for each such
page **when the user clicks the existing "save" action in the thumbnails
toolbar**, not immediately on upload — matching how every other pending
action (`new`, `import`) already only hits the backend on Save.

---

## Current State (after the upload feature)

```
handleAddFiles(event)                          [on file pick — "add" action]
  1. upload images / convert PDFs           → real image url(s)
  2. addNewPage({chapterId}) per url         → { pageId, url: <blank placeholder> }
  3. addImportedPages(activePage, [{pageId, url: <real url>}])
       → pages inserted locally, _isPending: true
       → LOCAL state shows the real url; SERVER page doc still has the blank one

handleSave()                                   [on click — "save" action]
  → submitPages({ pageIds, chapterId })
       → only flips _isPending and attaches page ids to the chapter
       → request body has no pageUrl — never fixes the mismatch above
```

**Problem:** nothing ever sends the real url back to the server for pages
created by the upload feature. Until the author opens such a page in Studio,
adds a block, and hits the per-page submit (which uploads a *snapshot* — a
different image — only when deep blocks exist), the backend's `pageUrl` for
these pages stays wrong. A refresh before that point would show the blank
placeholder instead of the uploaded page.

---

## Proposed Flow

```
handleAddFiles(event)                          [on file pick — unchanged behavior]
  1. upload images / convert PDFs             → real image url(s)
  2. addNewPage({chapterId}) per url           → { pageId, url: <blank placeholder> }
  3. addImportedPages(activePage, importedPages, { needsPageUrlSync: true })
       → pages inserted locally, tagged _pendingPageUrlSync: true
       → NO network call yet — purely local, same as "new" page creation

handleSave()                                   [on click — "save" action]
  1. pageIds = pages.map(p => p._id)
  2. submitPages({ pageIds, chapterId })                          (existing, unchanged)
  3. NEW: pagesNeedingUrlSync = pages.filter(p => p._pendingPageUrlSync)
     await Promise.allSettled(
       pagesNeedingUrlSync.map(p =>
         saveBlocks({ pageId: p._id, chapterId, pageUrl: p.url, blocks: [] })
       )
     )
  4. setPages(pages.map(p => ({ ...p, _isPending: false, _pendingPageUrlSync: false })))
  5. invalidate query cache, toast success                        (existing, unchanged)
```

Only pages tagged `_pendingPageUrlSync` fire a `save-blocks` call — plain
`new` pages (blank placeholder is already correct server-side) and `import`ed
pages (already point at a real, already-persisted page) are left out, so
Save's network cost doesn't grow for the existing flows.

---

## API

**Endpoint:** `POST /save-blocks`
**Base URL:** `https://questions-api-navy.vercel.app/api` (default axios instance — already wired as `axios2` inside `src/services/api.js`, exported as `saveBlocks`)

**Body (per page, blocks empty since the page has no content yet):**
```json
{
  "pageId": "6a89a1f5edf55d000497396e",
  "chapterId": "6a4f86b88a9f4e0004c028bd",
  "pageUrl": "https://.../page-1.png",
  "blocks": []
}
```

**Response:**
```json
{
  "message": "Blocks saved successfully",
  "pageId": "6a89a1f5edf55d000497396e",
  "url": "https://.../page-1.png"
}
```

`saveBlocks` (`src/services/api.js:45`) already wraps this call, already
catches and toasts its own errors, and returns `null` on failure — reused
as-is, no changes needed to that function.

---

## Files Changed

### 1. `src/components/Studio/hooks/usePageNavigation.js` — tag pages that still need a url sync

Extend `addImportedPages` with an optional third argument so callers can mark
the inserted pages. Default behavior (no third argument) is unchanged, so the
existing `ImportPagesModal` → `onClickImport` caller in `StudioThumbnails.jsx`
needs no changes.

```js
const addImportedPages = (afterIndex, importedPages, { needsPageUrlSync = false } = {}) => {
  const newPages = importedPages.map(({ pageId, url }) => ({
    _id: pageId,
    _isPending: true,
    ...(needsPageUrlSync && { _pendingPageUrlSync: true }),
    blocks: [],
    v_blocks: [],
    url: url ?? BLANK_PAGE_URL,
  }));
  const insertAt = afterIndex + 1;
  setPages((prev) => [
    ...prev.slice(0, insertAt),
    ...newPages,
    ...prev.slice(insertAt),
  ]);
  insertPagesAtRef?.current?.(insertAt, newPages);
};
```

### 2. `src/components/Studio/StudioThumbnails/StudioThumbnails.jsx`

- Import `saveBlocks` from `../../../services/api`.
- In `handleAddFiles`, pass the new flag instead of firing any request:

```js
addImportedPages(activePage, importedPages, { needsPageUrlSync: true });
toast.success(
  `${importedPages.length} page(s) added. Click Save to persist.`
);
```
(No other change to `handleAddFiles` — the upload/convert/mint steps stay exactly as in the previous plan.)

- Update `handleSave` to sync urls for tagged pages alongside the existing submit:

```js
const handleSave = async () => {
  try {
    const pageIds = pages.map((p) => p._id).filter(Boolean);
    await submitPages({ pageIds, chapterId });

    const pagesNeedingUrlSync = pages.filter((p) => p._pendingPageUrlSync);
    if (pagesNeedingUrlSync.length) {
      await Promise.allSettled(
        pagesNeedingUrlSync.map((p) =>
          saveBlocks({ pageId: p._id, chapterId, pageUrl: p.url, blocks: [] })
        )
      );
    }

    setPages(
      pages.map((p) => ({ ...p, _isPending: false, _pendingPageUrlSync: false }))
    );
    await queryClient.invalidateQueries({
      queryKey: [`book-${bookId}-chapter-${chapterId}`],
    });
    toast.success("Pages saved successfully.");
  } catch {
    toast.error("Failed to save pages.");
  }
};
```

---

## Edge Cases

| Case | Handling |
|---|---|
| User clicks "add", then deletes an uploaded page before clicking "save" | `handleDeletePage` removes it from `pages`, so it's naturally excluded from `pagesNeedingUrlSync` — no stale/orphaned sync call |
| User clicks "add" multiple times before "save" | All tagged pages accumulate in `pages`; a single "save" click syncs all of them together |
| One page's `save-blocks` call fails during Save | `saveBlocks` already shows its own error toast and returns `null`; `Promise.allSettled` lets the rest complete and the overall `handleSave` still finishes (submit + success toast) rather than throwing |
| `submitPages` itself fails | Existing behavior unchanged — `handleSave`'s catch fires, `_pendingPageUrlSync` flags are left untouched so a retry will pick them up again |
| Plain "new" (blank) page saved alongside uploaded pages | Not tagged `_pendingPageUrlSync`, so no `save-blocks` call for it — its blank url is already correct server-side |
| `import`ed pages saved alongside uploaded pages | Same as above — `onClickImport`'s `addImportedPages` call doesn't pass the new option, so they're never tagged |
| Very large batch (many PDF pages) saved at once | `Promise.allSettled` fires all requests concurrently; consider chunking if the backend rate-limits `/save-blocks` |

---

## What Is NOT Changed

- `src/services/api.js` `saveBlocks` — reused unchanged.
- The upload/convert/mint steps in `handleAddFiles` — unchanged, still purely local after this change (no network call until Save).
- `submitPages` — unchanged.
- `ImportPagesModal` / `onClickImport` — unchanged; doesn't opt into `needsPageUrlSync`.
- Studio's per-page block submit (`onClickSubmit` → `handleSubmit` → `saveBlocks` with real blocks/snapshot) — unrelated, still the path used once the author actually adds content to a page.

---

## Summary of Changes

| File | Change |
|---|---|
| `src/components/Studio/hooks/usePageNavigation.js` | `addImportedPages` accepts an optional `{ needsPageUrlSync }` option, tagging inserted pages with `_pendingPageUrlSync: true` |
| `src/components/Studio/StudioThumbnails/StudioThumbnails.jsx` | Import `saveBlocks`; `handleAddFiles` passes `{ needsPageUrlSync: true }`; `handleSave` fires `saveBlocks` for every `_pendingPageUrlSync` page (via `Promise.allSettled`) before clearing the flags |
