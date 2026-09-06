# StudioThumbnails — Batch Page Creation on Upload Plan

## Goal

`POST /pages/new` now accepts an array of page urls and, in one request,
creates a page doc per url **with that url already set** — no follow-up
write needed. Use that to collapse the "add" upload flow in
`StudioThumbnails` from *N* `/pages/new` calls + *N* `/save-blocks` calls
down to a single `/pages/new` call, and delete the `/save-blocks`
url-sync mechanism (`_pendingPageUrlSync` / `needsPageUrlSync`) added in
[the previous plan](../2026-08-29/STUDIO_THUMBNAILS_PERSIST_UPLOADED_PAGE_URL_PLAN.md)
entirely — it exists only to paper over the old endpoint's limitation.

---

## Current State

```
handleAddFiles(event)                              [on file pick — "add" action]
  1. upload images / convert PDFs                → real image url(s)
  2. Promise.all(urls.map(() =>
       addNewPage({ chapterId })                  → POST /pages/new {blocks:[], chapterId}
     ))                                           → N requests, each returns {pageId, url: <blank placeholder>}
  3. addImportedPages(activePage, importedPages, { needsPageUrlSync: true })
       → pages inserted locally, tagged _pendingPageUrlSync: true
       → LOCAL state shows the real url; SERVER page doc still has the blank one

handleSave()                                       [on click — "save" action]
  1. submitPages({ pageIds, chapterId })
  2. pagesNeedingUrlSync = pages.filter(p => p._pendingPageUrlSync)
     Promise.allSettled(pagesNeedingUrlSync.map(p =>
       saveBlocks({ pageId: p._id, chapterId, pageUrl: p.url, blocks: [] })   → N requests
     ))
  3. clear _isPending / _pendingPageUrlSync, invalidate cache, toast
```

Uploading 5 pages currently fires **5×** `/pages/new` and, on the next
Save, another **5×** `/save-blocks` — 10 requests total for 5 pages.

---

## New Endpoint Contract

**Endpoint:** `POST /pages/new`
**Base URL:** `https://questions-api-navy.vercel.app/api`

**Body (batch form — new):**
```json
{
  "chapterId": "6a26b24bfbca231f980eead2",
  "pageUrls": ["http://res.cloudinary.com/dd9turntq/image/upload/v1775738182/wtfuxon0rgbltowmgsir.png"]
}
```

**Response:**
```json
{
  "message": "Pages created successfully.",
  "pages": [
    {
      "pageId": "6a9845dfaf87260004e24911",
      "url": "http://res.cloudinary.com/dd9turntq/image/upload/v1775738182/wtfuxon0rgbltowmgsir.png",
      "isNewPage": false
    }
  ]
}
```

The single blank-page form (`{ blocks: [], chapterId }`, no `pageUrls`,
used by the "new" toolbar action) is **not changing** — it's kept as-is
via the existing `addNewPage`. Only the "add" (upload) action switches to
the batch form.

**Open item to verify against the live API before/while implementing:**
`pages` in the response must preserve the same order as the input
`pageUrls` array, since `importedPages` are inserted at `activePage`
positionally by index. If the backend doesn't guarantee order, match
results back to inputs by `url` instead of by array index.

---

## Proposed Flow

```
handleAddFiles(event)                              [on file pick — unchanged steps 1]
  1. upload images / convert PDFs                → real image url(s)          (unchanged)
  2. addNewPages({ chapterId, pageUrls: urls })   → POST /pages/new           (1 request, was N)
       → { pages: [{ pageId, url, isNewPage }, ...] }
  3. importedPages = pages.map(({ pageId, url }) => ({ pageId, url }))
  4. addImportedPages(activePage, importedPages)                             (no sync flag — url is already correct server-side)

handleSave()                                       [on click — "save" action]
  1. submitPages({ pageIds, chapterId })                                     (unchanged)
  2. clear _isPending, invalidate cache, toast                               (url-sync step removed — nothing left to sync)
```

5 uploaded pages now cost **1** request on add and **0** extra requests on
save (down from 10 total).

---

## Files Changed

### 1. `src/api/bookapi.js` — add the batch creation call

```js
export const addNewPage = async ({ chapterId }) => {
  const res = await axios.post("/pages/new", { blocks: [], chapterId });
  return res.data;
};

export const addNewPages = async ({ chapterId, pageUrls }) => {
  const res = await axios.post("/pages/new", { chapterId, pageUrls });
  return res.data; // { message, pages: [{ pageId, url, isNewPage }] }
};
```

`addNewPage` (singular, blank page) is untouched — still used by
`handleAddNewPage` for the "new" toolbar action.

### 2. `src/components/Studio/StudioThumbnails/StudioThumbnails.jsx`

- Swap the `addNewPage` import for `addNewPages`; drop the `saveBlocks`
  import (no longer used in this file once the url-sync block below is
  removed).
- Replace the per-url minting loop in `handleAddFiles`:

```js
const handleAddFiles = async (event) => {
  const files = Array.from(event.target.files || []);
  event.target.value = null;
  if (!files.length) return;

  setIsUploadingFiles(true);
  try {
    const fileUrlGroups = await Promise.all(
      files.map(async (file) => {
        if (file.type === UPLOAD_FILE_TYPES.PDF_MIME) {
          const { pages: pdfPages } = await convertPdfToImages(file);
          return pdfPages ?? [];
        }
        const url = await upload(file);
        return url ? [url] : [];
      })
    );
    const urls = fileUrlGroups.flat();
    if (!urls.length) {
      toast.error("No pages could be added from the selected file(s).");
      return;
    }

    const { pages: createdPages } = await addNewPages({ chapterId, pageUrls: urls });
    const importedPages = createdPages.map(({ pageId, url }) => ({ pageId, url }));

    addImportedPages(activePage, importedPages);
    toast.success(
      `${importedPages.length} page(s) added. Click Save to persist.`
    );
  } catch {
    toast.error("Failed to add page(s) from file.");
  } finally {
    setIsUploadingFiles(false);
  }
};
```

- Simplify `handleSave` back down — drop the `_pendingPageUrlSync` /
  `saveBlocks` block entirely:

```js
const handleSave = async () => {
  try {
    const pageIds = pages.map((p) => p._id).filter(Boolean);
    await submitPages({ pageIds, chapterId });

    setPages(pages.map((p) => ({ ...p, _isPending: false })));
    await queryClient.invalidateQueries({
      queryKey: [`book-${bookId}-chapter-${chapterId}`],
    });
    toast.success("Pages saved successfully.");
  } catch {
    toast.error("Failed to save pages.");
  }
};
```

### 3. `src/components/Studio/hooks/usePageNavigation.js` — drop the sync flag

Revert `addImportedPages` to take no options, since no caller needs
`needsPageUrlSync` any more (the only caller that passed it was
`handleAddFiles` above):

```js
const addImportedPages = (afterIndex, importedPages) => {
  const newPages = importedPages.map(({ pageId, url }) => ({
    _id: pageId,
    _isPending: true,
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

`onClickImport` (the "import" toolbar action) already calls
`addImportedPages` with two arguments only, so it needs no change.

---

## Edge Cases

| Case | Handling |
|---|---|
| Backend returns `pages` in a different order than the input `pageUrls` | Breaks positional mapping to `importedPages`; match by `url` instead of index if this turns out to be true (see Open item above) |
| One url in the batch fails to create a page server-side | Depends on whether the endpoint is all-or-nothing or partial; if partial, `createdPages.length` may be less than `urls.length` — current code assumes a 1:1 result, so this needs confirming against the real API response before shipping |
| `isNewPage: false` in the response (url matched an existing page) | Not acted on — `createdPages.map` only reads `pageId`/`url`; if the backend is telling us it reused an existing page doc rather than creating one, that's fine for this flow (we just want a valid pageId + correct url) |
| User clicks "add" multiple times before "save" | Each click is its own batch request, same as today — unaffected by this change |
| Mixed PDF + image files in one selection | Unaffected — url collection (step 1) is unchanged, only the minting step after it is batched |

---

## What Is NOT Changed

- `src/services/api.js` `saveBlocks` — untouched; still used by Studio's
  real per-page block submit flow.
- `submitPages`, `importPages`, `convertPdfToImages`, `upload` — unchanged.
- `handleAddNewPage` / the "new" blank-page action — still uses the
  singular `addNewPage({ chapterId })` call, unaffected by the batch
  endpoint change.
- `ImportPagesModal` / `onClickImport` — unchanged.

---

## Summary of Changes

| File | Change |
|---|---|
| `src/api/bookapi.js` | Add `addNewPages({ chapterId, pageUrls })` wrapping the batch `POST /pages/new`; existing `addNewPage` untouched |
| `src/components/Studio/StudioThumbnails/StudioThumbnails.jsx` | `handleAddFiles` calls `addNewPages` once instead of `addNewPage` in a loop; drops `needsPageUrlSync`; `handleSave` drops the `_pendingPageUrlSync`/`saveBlocks` sync block |
| `src/components/Studio/hooks/usePageNavigation.js` | `addImportedPages` reverts to its pre-08-29 signature (no `needsPageUrlSync` option) |
