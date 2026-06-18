# Import Pages — Submit After Import Plan

## Goal

After `importPages` succeeds, call `POST /pages/submit` with the combined list of page IDs (existing pages in the destination chapter + newly imported page IDs) so the destination chapter's page order is persisted on the server.

---

## Endpoint

```
POST https://questions-api-navy.vercel.app/api/pages/submit

Body:
{
  "pageIds": ["id1", "id2", ...],   // existing page IDs + new imported page IDs
  "chapterId": "ed8da075..."        // destination chapter — from useParams()
}
```

---

## Current `handleConfirm` Flow

```
1. importPages({ pageIds: selectedPages, chapterId: selectedChapter })
   └── return value is discarded
2. invalidateQueries
3. toast.success + onClose
```

---

## New `handleConfirm` Flow

```
1. importPages({ pageIds: selectedPages, chapterId: selectedChapter })
   └── capture response → extract new page IDs

2. getChapterPages(chapterId)          ← fetch DESTINATION chapter's current pages
   └── extract existing page IDs

3. submitPages({
     pageIds: [...existingPageIds, ...newPageIds],
     chapterId                          ← from useParams()
   })

4. invalidateQueries
5. toast.success + onClose
```

---

## Assumptions to Verify Before Implementing

### 1. `importPages` response shape — **confirmed**
```js
// actual response
{
  "message": "Pages imported successfully.",
  "pageIds": ["6a32c800b1df7c0004df5960", "6a32c800b1df7c0004df5964"]
}

// extract IDs as:
const newPageIds = importResponse.pageIds;
```

### 2. `getChapterPages` response shape
Already used in the modal for the source chapter. Assumed to return an array of page objects:
```js
[{ _id: "xyz", url: "...", ... }, ...]

// extract IDs as:
const existingPageIds = destinationPages.map((p) => p._id);
```

---

## Files to Change

| File | Change |
|------|--------|
| `src/api/bookapi.js` | Add `submitPages` function |
| `src/components/Modal/ImportPagesModal/hooks/useImportPages.js` | Update `handleConfirm` |

---

## Implementation Detail

### `src/api/bookapi.js` — add `submitPages`

```js
export const submitPages = async ({ pageIds, chapterId }) => {
  const res = await axios.post("/pages/submit", { pageIds, chapterId });
  return res.data;
};
```

### `hooks/useImportPages.js` — update imports

```js
import { getBooks, getChapters, getChapterPages, importPages, submitPages } from "../../../../api/bookapi";
```

### `hooks/useImportPages.js` — updated `handleConfirm`

```js
const handleConfirm = async () => {
  setIsImporting(true);
  try {
    // Step 1 — import selected pages, capture new page IDs from response
    const { pageIds: newPageIds } = await importPages({ pageIds: selectedPages, chapterId: selectedChapter });

    // Step 2 — fetch current pages in destination chapter
    const existingPages = await getChapterPages(chapterId);
    const existingPageIds = existingPages.map((p) => p._id);

    // Step 3 — submit combined page list to destination chapter
    await submitPages({ pageIds: [...existingPageIds, ...newPageIds], chapterId });

    // Step 4 — refresh and close
    await queryClient.invalidateQueries({ queryKey: [`book-${bookId}-chapter-${chapterId}`] });
    toast.success("Pages imported successfully");
    onClose();
  } catch (error) {
    toast.error("Failed to import pages");
  } finally {
    setIsImporting(false);
  }
};
```

---

## Open Questions

1. **Order of IDs** — **confirmed**: new pages appended at the end (`[...existingPageIds, ...newPageIds]`).
2. **Error granularity** — **confirmed**: use a single generic `"Failed to import pages"` toast for all failures.
