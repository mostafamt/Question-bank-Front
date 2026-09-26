# Reader Page Bookmark — Plan

**Date:** 2026-09-26
**Mode:** Reader only (`/read/book/:bookId/chapter/:chapterId`)
**Status:** Implemented with option A (Zustand slice). The thumbnail is wrapped in reader mode only. Open questions 1–3 still need answers.
**Reference:** `snapshot.jpeg` → "Toggle Button Bookmark" callout

---

## 1. Goal

Let the reader bookmark the page they are viewing, from a toggle button in
the page toolbar. Bookmarked pages are marked on their thumbnail. Bookmarks
are saved in the browser's `localStorage`, so they survive a page reload.
Nothing is sent to the backend.

## 2. Scope

**In scope**
- A bookmark toggle button in the page toolbar (next to the page navigation).
- A bookmark marker on bookmarked page thumbnails in the Thumbnails tab.
- Saving and loading bookmarks with `localStorage`.

**Out of scope** (shown in the mockup, but separate features)
- Bookmarking individual elements inside tabs (the "Add/remove bookmark for
  any element for each tab" callout).
- Narration, Music, and the right-click menu on a block.
- Saving bookmarks to the backend or syncing them between devices.

## 3. User behaviour

| Action | Result |
|---|---|
| Open a page that isn't bookmarked | Toolbar shows an outlined bookmark icon (`BookmarkBorderIcon`) |
| Click it | Page is bookmarked. The icon becomes filled (`BookmarkIcon`) and the thumbnail gets a marker |
| Click the filled icon | Bookmark is removed. The icon goes back to outlined and the thumbnail marker disappears |
| Go to another page | The icon updates to that page's state |
| Reload the page / come back later | Bookmarks are still there (same browser) |
| Open Studio or book-author mode | No bookmark button or markers |

The button's tooltip reads "Bookmark this page" or "Remove bookmark",
depending on the state.

## 4. Storage design

**Key:** one entry per chapter

```
reader_bookmarks_<chapterId>
```

**Value:** a JSON array of bookmarked page IDs

```json
["55959621bec7fcbc38a3bb1d", "6a01..."]
```

Why these choices:
- **Keyed by page `_id`, not page index.** Pages can be reordered or inserted
  in the Studio, and an index would then point at the wrong page. An ID
  stays with its page.
- **One key per chapter.** Each read and write stays small, and a chapter's
  bookmarks can be cleared without touching the others.
- **Robust against failure.** Every `localStorage` read and write is wrapped
  in `try/catch`. If storage is blocked (e.g. private mode) or holds bad
  JSON, the feature falls back to "no bookmarks" instead of crashing.
- **Stale IDs are ignored.** If a bookmarked page is deleted, its ID stays in
  storage but never matches a page, so nothing shows. It is not cleaned up
  automatically.

The key prefix is added to the existing constants:
`src/components/Studio/constants/studio.constants.js` → `STORAGE_KEYS.READER_BOOKMARKS = "reader_bookmarks"`.

## 5. Implementation

### 5.1 New hook — `src/components/Studio/hooks/usePageBookmarks.js`

```js
const { isBookmarked, toggleBookmark, bookmarkedIds } = usePageBookmarks(chapterId);
```

- Loads the chapter's array from `localStorage` once, keyed on `chapterId`.
- Keeps it in React state as a `Set` for fast lookups.
- `toggleBookmark(pageId)` adds or removes the ID, updates state, and writes
  the array back to `localStorage`.
- `isBookmarked(pageId)` returns a boolean.

**Keeping the toolbar and thumbnails in sync:** both need the same bookmark
state. Two options:
- **A (recommended):** a small Zustand slice in `src/store/store.js`
  (`bookmarks: { [chapterId]: string[] }` plus `toggleBookmark`). It
  persists to `localStorage` using the key above. The app already uses
  Zustand for global state, and this avoids passing props through Studio →
  StudioLayout → StudioEditor/columns.
- **B:** call the hook in `Studio.jsx` and pass `isBookmarked` and
  `toggleBookmark` down through props. Adds no new global state, but touches
  more files and the memoised column builders.

`usePageBookmarks` would then be a thin wrapper around the store.

### 5.2 Toolbar button — `src/components/ImageActions/ImageActions.jsx`

Inside the existing `isReaderMode && (...)` block, next to the virtual-block
visibility toggle:

```jsx
const activePageId = pages?.[activePage]?._id;
const bookmarked = isBookmarked(activePageId);

<Tooltip title={bookmarked ? "Remove bookmark" : "Bookmark this page"}>
  <IconButton
    aria-label="toggle-bookmark"
    aria-pressed={bookmarked}
    onClick={() => toggleBookmark(activePageId)}
    disabled={!activePageId}
  >
    {bookmarked ? <BookmarkIcon /> : <BookmarkBorderIcon />}
  </IconButton>
</Tooltip>
```

`ImageActions` is rendered in two places, `StudioEditor.jsx:39` and
`StudioStickyToolbar.jsx:28`. With option A both copies stay in sync
automatically, because they read the same store.

### 5.3 Thumbnail marker — `src/components/Studio/StudioThumbnails/StudioThumbnails.jsx`

Currently the draggable element (`StudioThumbnails.jsx:361`) is the `<img>`
itself. To add a marker on top of it:
- Wrap the `<img>` in a `position: relative` `<div>`, and move the drag ref
  and props onto that wrapper.
- In reader mode, when the page is bookmarked, render a small `BookmarkIcon`
  pinned to the top-right corner of the thumbnail.
- Add styles in the existing `studioThumbnails` SCSS module.

⚠️ **Risk:** moving the drag ref changes the book-author drag-to-reorder
behaviour. Check reordering still works afterwards. If that's a concern, only
wrap the thumbnail in reader mode, where dragging isn't used.

## 6. Files touched

| File | Change |
|---|---|
| `src/components/Studio/constants/studio.constants.js` | Add `STORAGE_KEYS.READER_BOOKMARKS` |
| `src/store/store.js` | Bookmark slice (option A) |
| `src/components/Studio/hooks/usePageBookmarks.js` | **New** hook |
| `src/components/ImageActions/ImageActions.jsx` | Toggle button (reader mode only) |
| `src/components/Studio/StudioThumbnails/StudioThumbnails.jsx` (+ scss) | Thumbnail marker |

## 7. Test checklist

- [ ] Toggle on and off on one page; the icon and thumbnail marker update immediately.
- [ ] Both toolbars (in the editor and the sticky one) show the same state.
- [ ] Reload the browser: bookmarks remain.
- [ ] Bookmark pages in chapter A, open chapter B: B has none, and A's are unchanged.
- [ ] Switch content language (`contentLanguage`) and check whether bookmarks carry over (see open question 2).
- [ ] With `localStorage` blocked or holding bad JSON: no crash, no bookmarks.
- [ ] Studio and book-author modes: no button, no markers, and drag-to-reorder still works.

## 8. Open questions for review

1. **Placement:** the plan puts the toggle in the page toolbar (`ImageActions`),
   next to the page navigation. The mockup shows it slightly above the toolbar,
   near the book title. Is the toolbar OK?
2. **Language variants:** does the same page keep the same `_id` in every
   content language? If not, a bookmark made in English won't show in
   Arabic. Should bookmarks be shared across languages?
3. **My Bag:** should bookmarked pages also be listed in the new **My Bag**
   tab, where clicking one jumps to that page? This is not part of this plan,
   but it would be an easy follow-up.
4. **Option A vs B** (§5.1): OK to add a small Zustand slice?
