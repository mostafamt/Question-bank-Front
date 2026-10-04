# StudioThumbnails — Upload PDF / Image Pages Plan

## Goal

Enable the "add" action in `StudioThumbnails` so an author can pick one or more
image files and/or a PDF file, have them uploaded/converted to page images,
and get the resulting page(s) inserted into the local thumbnail strip —
without a page reload, following the same "local-first, real backend id"
pattern already used by the `new` and `import` actions.

---

## Current State

```
"add" action (AddPhotoAlternateIcon)
  └─▶ disabled: true   ← hardcoded, feature was never finished
  └─▶ onChange={onChange} → addLocalPages(files, activePage)
        └─▶ usePageNavigation.addLocalPages
              creates pages with a client-only uuid + URL.createObjectURL(file)
              (an in-memory blob URL — never uploaded, never persisted)
```

**Problems:**
- The button is force-disabled in `StudioThumbnails.jsx:164`, so it's unreachable in the UI today (the `Ctrl+Shift+A` shortcut is also gated on `disabled`, so it's dead too).
- `addLocalPages` pages get a **blob URL** (`blob:...`) that only exists in the current tab and a **client-generated uuid** as `_id`. They are not marked `_isPending`, so `onClickSubmit` / `handleSave` never picks them up to persist — even if the button were enabled, saved pages would break on refresh.
- There's no PDF handling at all today.

For comparison, the `new` and `import` actions both insert pages that carry a **real backend page id** and are flagged `_isPending: true`, which is what makes them eligible for `submitPages` (`POST /pages/submit`) later:
- `new` → `addNewPage({chapterId})` (`POST /pages/new`) → `addEmptyPage(activePage, {pageId, url})`
- `import` → `ImportPagesModal` returns `{pageId, url}[]` → `addImportedPages(activePage, importedPages)`

The upload feature should follow the same shape so saved pages survive a refresh, instead of repeating the broken `addLocalPages` pattern.

---

## Proposed Flow

```
click "add" (now enabled)
  → hidden <input type="file" multiple accept="image/*,application/pdf">
  → onChange(event)
      1. split event.target.files into images[] and pdfs[]
      2. images: upload(file) for each                 → POST /upload           → url
         pdfs:   convertPdfToImages(file) for each      → POST /pdf/to-images    → { count, pages: [url, ...] }
      3. flatten to a single ordered list of resulting page urls
         (preserve file selection order; a PDF contributes its pages in order)
      4. for each url: addNewPage({ chapterId })         → POST /pages/new       → { pageId, url: blankUrl }
      5. build importedPages = urls.map((url, i) => ({ pageId: mintedIds[i], url }))
      6. addImportedPages(activePage, importedPages)
         → inserts pages locally with _isPending: true, real _id
      7. reset the file input value (so re-selecting the same file re-fires onChange)
      8. toast success/failure summary
click "save" (existing, unchanged)
  → submitPages({ pageIds, chapterId }) persists all _isPending pages, including these
```

This reuses `addNewPage` purely to mint a real page id (step 4), then overwrites
the blank `url` it returns with the real uploaded/converted image url before
inserting — so the resulting page objects are structurally identical to
imported pages and flow through the existing save/submit path unchanged.

> **Open question for backend:** if `POST /pages/new` can accept an optional
> `url` in its body (`{ blocks: [], chapterId, url }`) and store it directly,
> step 4 collapses into a single call per page instead of "create blank, then
> rely on local state holding the real url until Save." Worth confirming — it
> would remove the local/server url mismatch that exists between "add" and
> "save" (see Edge Cases).

---

## API

### 1. Upload a single image (existing, reused)
`src/utils/upload.js` → `upload(file)` → `POST /upload` (default axios instance, `REACT_APP_REMOTE_URL`) → returns the uploaded file's URL as a string.

### 2. Convert a PDF to page images (new)
**Endpoint:** `POST /pdf/to-images`
**Base URL:** `https://questions-api-navy.vercel.app/api` (default axios instance — same host as `/upload` and `/pages/new`)
**Body:** `multipart/form-data`, field `file`

**Response:**
```json
{
  "count": 1,
  "pages": [
    "https://scube-applications-media....amazonaws.com/.../page-1.png"
  ]
}
```

### 3. Mint a real page id (existing, reused)
`src/api/bookapi.js` → `addNewPage({ chapterId })` → `POST /pages/new` → `{ pageId, url }`

---

## Files Changed

### 1. `src/api/bookapi.js` — add `convertPdfToImages`
```js
export const convertPdfToImages = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  const res = await axios.post("/pdf/to-images", formData);
  return res.data; // { count, pages: string[] }
};
```

### 2. `src/components/Studio/constants/studio.constants.js` — add accepted file types
```js
export const UPLOAD_FILE_TYPES = {
  ACCEPT: "image/*,application/pdf",
  PDF_MIME: "application/pdf",
};
```

### 3. `src/components/Studio/StudioThumbnails/StudioThumbnails.jsx`
- Import `convertPdfToImages` from `bookapi.js`, `upload` from `utils/upload.js`, `UPLOAD_FILE_TYPES` from `../constants`.
- Add local state: `const [isUploadingFiles, setIsUploadingFiles] = React.useState(false);`
- Replace `onChange` with an async handler:

```js
const handleAddFiles = async (event) => {
  const files = Array.from(event.target.files || []);
  event.target.value = null; // allow re-selecting the same file(s) later
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

    const mintedPages = await Promise.all(
      urls.map(() => addNewPage({ chapterId }))
    );
    const importedPages = mintedPages.map(({ pageId }, i) => ({
      pageId,
      url: urls[i],
    }));

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

- Update the `"add"` entry in `thumbnailActions`:
```js
{
  label: "add",
  Icon: AddPhotoAlternateIcon,
  isFileInput: true,
  disabled: isUploadingFiles,
  shortcut: { key: "a", ctrlKey: true, shiftKey: true },
},
```
- Update the hidden input:
```jsx
<VisuallyHiddenInput
  ref={fileInputRef}
  type="file"
  multiple
  accept={UPLOAD_FILE_TYPES.ACCEPT}
  onChange={handleAddFiles}
/>
```
- Optionally swap the icon for a small `<CircularProgress size={16} />` while `isUploadingFiles` is true (same visual pattern `ImportPagesModal` uses for `isImporting`).
- Remove the now-unused `onChange` wrapper around `addLocalPages` (still keep `addLocalPages` prop unused-import cleanup only if nothing else in this file references it — check before removing since it's still threaded through `Studio.jsx`/`useStudioColumns.js` for other potential callers).

---

## Edge Cases

| Case | Handling |
|---|---|
| Mixed selection (images + PDF in one pick) | Each file resolves to 0..N urls; flattened in file-selection order, PDF pages stay in their own order |
| PDF with 0 pages returned | `pdfPages ?? []` → contributes nothing; if the whole batch nets 0 urls, show one error toast and do nothing else |
| One file fails (upload or convert throws) | Currently the whole `Promise.all` rejects and the batch aborts with a single error toast. Acceptable for v1; see "Possible improvement" below for partial-success handling |
| `addNewPage` fails after urls were successfully produced | Same as above — aborts before any local insertion, so no orphaned/partial pages appear in the thumbnail strip |
| User re-selects the exact same file twice in a row | Handled by resetting `event.target.value = null` after reading `files` |
| Non-image/non-pdf file somehow selected (`accept` bypass) | `upload(file)` is attempted and will either succeed (backend stores it as-is) or fail — no extra client-side validation planned for v1 |
| Local page url vs. server-stored url mismatch | `addNewPage` returns a blank placeholder `url` server-side; the client immediately overwrites it locally with the real uploaded url before ever rendering it. This mismatch is invisible to the user but means a refresh *before* clicking Save could show the blank placeholder instead of the real image — same pre-existing risk `new`/`import` already carry for `_isPending` pages, not new to this feature |
| Large PDF (many pages) | No batching/pagination in this plan — `addNewPage` calls run in parallel via `Promise.all`; consider sequential/chunked calls if the backend rate-limits `/pages/new` |

**Possible improvement (not in v1):** switch `Promise.all` to `Promise.allSettled` for both the upload/convert step and the `addNewPage` step, so a single bad file doesn't block the rest of a multi-file batch. Flagged here rather than implemented up front to keep the first pass simple and match the existing `handleSave`/`handleAddNewPage` error-handling style (single try/catch, single toast).

---

## What Is NOT Changed

- `new` and `import` actions — unrelated, unchanged.
- `addLocalPages` / blob-URL local preview logic in `usePageNavigation.js` — left in place but no longer wired to the "add" button; can be deleted in a follow-up cleanup once confirmed unused elsewhere.
- `submitPages` / `handleSave` — the new pages are just more `_isPending` entries, no changes needed.
- Backend `/pages/new` and `/upload` contracts — assumed unchanged; only a new `/pdf/to-images` call is added.

---

## Summary of Changes

| File | Change |
|---|---|
| `src/api/bookapi.js` | Add `convertPdfToImages(file)` |
| `src/components/Studio/constants/studio.constants.js` | Add `UPLOAD_FILE_TYPES` |
| `src/components/Studio/StudioThumbnails/StudioThumbnails.jsx` | Enable "add" button, replace `onChange` with async `handleAddFiles`, add `multiple`/`accept` to the hidden input, add `isUploadingFiles` loading state |
