# Studio — Allow Opening a Chapter With Zero Pages

## Goal

`GET /pages?chapterId=...` legitimately returns an empty array for a
newly created chapter that has no pages yet. Today `Studio` treats that
as a hard error and blocks the whole page behind:

```jsx
if (!pages?.length) {
  return <Alert severity="error">No pages available.</Alert>;
}
```

This prevents the one thing the user actually wants to do at that
point — use the "new"/"add" thumbnail actions to create the first
page(s). Remove the guard so Studio renders normally with an empty
page list, and the author adds pages from there.

---

## Where this shows up

- `src/pages/ScanAndUpload/ScanAndUpload.jsx` fetches pages via
  `getChapterPages(chapterId)` (`GET /pages?chapterId=...`) and passes
  the (possibly empty) `pages` array straight into `<Studio pages={pages} .../>`.
- `src/components/Studio/Studio.jsx:427` (`if (!pages?.length) return <Alert .../>`)
  was the only place that hard-stopped on an empty array.

## Why removing the guard is safe

Every place downstream that indexes into `pages` at the current active
index already does so defensively, or the operation itself is only
ever reachable via explicit user action (not on initial render):

- `usePageNavigation.js`: `activePageId = pages?.[activePageIndex]?._id`
  — optional-chained, `undefined` when `pages` is empty.
- `StudioAreaSelector.jsx` (`getImageSource`): `pages[activePage]?.url`
  falls back to `WHITE_PAGE_FALLBACK` when there's no page/url yet.
- `StudioThumbnails.jsx`: `pages.map(...)` over `[]` simply renders no
  thumbnails; the "new" and "add" actions (`handleAddNewPage`,
  `handleAddFiles`) don't read `pages[activePage]` at all — they call
  `addEmptyPage`/`addImportedPages` with `activePage` only as the
  insertion index. "copy"/"cut"/"delete" do read `pages[activePage]`
  but are only reachable by clicking a thumbnail or an enabled action
  button, which requires a page to already exist.
- `useAreaManagement.js`: `areas` is seeded via `pages.map(() => [])`,
  which is `[]` for an empty `pages` array — no crash, nothing to
  render.
- `parseVirtualBlocksFromPages(pages)`: `pages?.map(...)` — `[]` in,
  `[]` out.

So an empty `pages` array flows through as "zero of everything" rather
than hitting any unguarded index access.

---

## Change

`src/components/Studio/Studio.jsx`:

1. Delete the `if (!pages?.length) return <Alert severity="error">No pages available.</Alert>;` guard.
2. Drop the now-unused `import { Alert } from "@mui/material";`.

No other files change. `StudioHeader`/`StudioLayout` and their
children already tolerate `pages = []`, `activePageIndex = 0`,
`areas = []`, as shown above.

---

## Manual test plan

- Open `/book/:bookId/chapter/:chapterId` for a chapter whose
  `/pages?chapterId=...` response is `[]`.
  - Expect: Studio renders (toolbar, thumbnails rail, empty canvas
    with the white-page fallback) instead of the red "No pages
    available." alert.
- Click the "new" thumbnail action → a blank page is created and
  becomes the active page.
- Click the "add" thumbnail action and upload an image/PDF → page(s)
  are created from the upload and become active.
- Click "save" → pages persist via `submitPages`; reload the chapter
  and confirm the pages are still there (now via the normal non-empty
  path, unaffected by this change).
