# Add Chapter Modal — PDF File Upload Plan

**Date:** 2026-09-06
**Builds on:** `docs/2026-06-25/ADD_CHAPTER_PLAN.md`, `docs/2026-06-26/ADD_CHAPTER_MODAL_V2.md`
**Goal:** Add a PDF file field to `AddChapterModal` and switch `createChapter` to submit `multipart/form-data`, matching the updated `POST /chapters` contract that imports PDF pages at creation time.

---

## New Endpoint Contract

**Request** — `multipart/form-data`

| Field | Type | Notes |
|---|---|---|
| `title` | string | required |
| `language` | string | `en` / `ar` |
| `bookId` | string | required |
| `domainId` | string | optional |
| `domainName` | string | optional |
| `subDomainId` | string | optional |
| `subDomainName` | string | optional |
| `topicName` | string | optional |
| `description` | string | optional |
| `file` | File (PDF) | **new** — replaces the old `pdfUrl` string field |

**Response**

```json
{
  "message": "Chapter created and PDF pages imported successfully.",
  "chapterId": "6a87931188fde9000409aeb2",
  "count": 1,
  "pageIds": ["6a87931588fde9000409aeb6"],
  "pages": [
    { "pageId": "6a87931588fde9000409aeb6", "url": "...", "pageNumber": 1 }
  ]
}
```

The backend now imports pages as part of chapter creation when a file is attached, so the pre-existing "convert PDF → import pages" step (`convertPdfToImages` + `submitPages`/`importPages` in `StudioThumbnails`) is no longer needed for chapters created this way.

---

## Gaps vs. Current Code

1. **Transport mismatch** — `createChapter` (`src/api/bookapi.js:76`) posts plain JSON. The new endpoint needs `FormData` because of the `file` part.
2. **Response shape mismatch** — the current modal expects `newChapter._id` (`AddChapterModal.jsx:200`, consumed in `AddBook.jsx:101` via `newChapter._id`). The new response returns `chapterId` instead, plus `pageIds`/`pages`. Callers need to read `chapterId` (with a fallback to `_id` for the old JSON-only path, if that path is kept — see Open Questions).
3. **No file input exists yet** — `ChapterForm` only has title/description/language/depth/cognitive/topicName/domain/subDomain fields. There's an existing `pdfUrl` concept in the V2 doc/payload that was never built into the UI; it should be dropped in favor of the file input.
4. **Optional vs. required file** — the sample payload always includes a file, but the current modal already supports creating a chapter with no PDF (blank chapter flow from `AddBook.jsx:95` `handleBlankChapter`). The file must stay **optional** so that flow keeps working; when omitted, fall back to plain JSON `POST` (no `file` part) so the backend doesn't receive an empty file field.

---

## Proposed Changes

### 1. `src/api/bookapi.js` — `createChapter`

```js
export const createChapter = async (payload) => {
  const { file, ...fields } = payload;

  if (!file) {
    const res = await axios.post("/chapters", fields);
    return res.data;
  }

  const formData = new FormData();
  Object.entries(fields).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      formData.append(key, value);
    }
  });
  formData.append("file", file);

  const res = await axios.post("/chapters", formData);
  return res.data;
};
```

- No manual `Content-Type` header — axios sets the multipart boundary automatically for a `FormData` body (confirmed no default header override in `src/axios.js`).
- Keeps the existing JSON path for the no-file (blank chapter) case, so nothing already relying on it breaks.

### 2. `src/components/Modal/AddChapterModal/AddChapterModal.jsx`

**Form state** — add `file: null` to `INITIAL_FORM`; drop the never-implemented `pdfUrl` concept from the V2 doc (not present in code today, so nothing to remove there).

**UI** — add a file field to `ChapterForm`, following the existing hidden-input pattern used in `ExcelFile.jsx` / `StudioThumbnails.jsx`:

```jsx
<Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
  <Button component="label" variant="outlined" disabled={disabled}>
    {form.file ? "Replace PDF" : "Upload PDF"}
    <VisuallyHiddenInput
      type="file"
      accept="application/pdf"
      onChange={(e) => setForm({ file: e.target.files?.[0] || null })}
    />
  </Button>
  {form.file && (
    <>
      <Typography variant="body2" noWrap>{form.file.name}</Typography>
      <IconButton size="small" onClick={() => setForm({ file: null })} disabled={disabled}>
        <CloseIcon fontSize="small" />
      </IconButton>
    </>
  )}
</Box>
```

Placed after Title/Description, before the Language/Depth row.

**Submit** — extend the payload builder in `handleSubmit`:

```js
const payload = {
  bookId,
  title: form.title.trim(),
  language: form.language,
  ...(form.description && { description: form.description }),
  ...(form.domainId && { domainId: form.domainId, domainName: form.domainName }),
  ...(form.subDomainId && { subDomainId: form.subDomainId, subDomainName: form.subDomainName }),
  ...(form.cognitive && { cognitive: form.cognitive }),
  ...(form.topicName && { topicName: form.topicName }),
  ...(form.depth !== "" && { depth: Number(form.depth) }),
  ...(form.file && { file: form.file }),
};
```

Drop the hardcoded `pdfUrl: ""` and `toc: []` — they aren't part of the new contract and sending an empty `toc` array as a `FormData` field would serialize badly (`"[object Object]"` per entry) anyway.

**Response handling** — normalize before calling back:

```js
const newChapter = await createChapter(payload);
toast.success("Chapter created");
handleClose();
onChapterCreated?.({
  _id: newChapter.chapterId ?? newChapter._id,
  ...newChapter,
});
```

This keeps `AddBook.jsx:101` (`newChapter._id`) working without touching the caller.

### 3. `src/pages/AddBook/AddBook.jsx`

No structural change required if the normalization above is done in the modal. If the caller wants to react to the returned `pages`/`pageIds` (e.g. skip the manual PDF-import step for chapters created with a file), that's an optional follow-up — flagged in Open Questions.

---

## Files to Change

| File | Change |
|---|---|
| `src/api/bookapi.js` | `createChapter` builds `FormData` when a `file` is present, else JSON (unchanged path) |
| `src/components/Modal/AddChapterModal/AddChapterModal.jsx` | Add `file` to form state, add upload UI to `ChapterForm`, extend submit payload, normalize response shape |

No changes needed to `Modal.jsx` (already wires `AddChapterModal` + props through).

---

## Validation Rules

- File input accepts `application/pdf` only (`accept="application/pdf"` on the input; MUI won't hard-block other types client-side, so optionally re-check `file.type === "application/pdf"` before setting state and toast an error otherwise).
- File remains **optional** — no `titleError`-style blocking validation added for it.
- No client-side file size cap unless the backend documents one (none given in the sample).

---

## What Is NOT in Scope

- Building the Stepper / TOC editor from the V2 doc — unrelated to this change, not touched.
- Reworking `StudioThumbnails`' own PDF→pages flow (used for adding pages to an *existing* chapter, a separate code path from chapter creation).
- Drag-and-drop file upload UX (a plain button + hidden input matches the rest of the app).
- Multi-file / multi-PDF upload.

---

## Open Questions

1. Should chapters created **with** a file skip straight into the reader (since pages already exist), instead of landing wherever a blank chapter currently goes? Current `handleBlankChapter` just sets the `chapter` field in a parent form — worth confirming the desired post-create navigation now that pages may already be imported.
2. Should `pageIds`/`pages` from the response be surfaced anywhere (e.g. cached into react-query for the chapter's pages) to avoid an extra fetch on first open?
