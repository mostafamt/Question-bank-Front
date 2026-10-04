# Feature Plan: "New" Blank Page Action in StudioThumbnails

## Goal

Add a **"new"** action button to the thumbnails toolbar that inserts a blank white page into the chapter at the position after the currently active page. Clicking it should behave like the existing "add" action (file upload) but skips the file picker — it programmatically generates a white image and inserts it directly.

---

## How Pages Work (Context)

Each page in the `pages` array has this shape:

```js
{ _id: string, blocks: [], v_blocks: [], url: string }
```

`url` is always a string — either a remote URL or a `blob:` URL created via `URL.createObjectURL()`. The existing "add" action creates blob URLs from uploaded files. The new action will create a blob URL from a programmatically generated white canvas image.

---

## Blank Image Generation

The Canvas API is the right tool — no extra dependency needed.

```js
const createBlankPageUrl = (width = 794, height = 1123) => {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  return canvas.toDataURL("image/png"); // or toBlob() for a true blob URL
};
```

**Default dimensions — 794 × 1123 px** — this is A4 at 96 dpi (standard web page size). Open question: should this match the dimensions of the current active page instead?

`canvas.toDataURL()` returns a data URL synchronously, which is simpler. `canvas.toBlob()` returns a real blob URL (smaller memory for large pages) but requires a callback. Either works; `toDataURL` is the simpler path unless page count is very high.

---

## Insertion Position

Two options:

| Option | Behaviour |
|---|---|
| **Append** | New page goes at the end of the list — consistent with how "add" works |
| **After active** | New page inserts right after the currently active page — more natural for authoring |

Recommendation: **after active**, since this is an authoring action and the user likely wants the new page adjacent to where they are working.

```js
const onClickNew = () => {
  const url = createBlankPageUrl();
  const newPage = { _id: uuidv4(), blocks: [], v_blocks: [], url };
  const insertAt = activePage + 1;
  const newPages = [
    ...pages.slice(0, insertAt),
    newPage,
    ...pages.slice(insertAt),
  ];
  setPages(newPages);
  onClickImage(insertAt);
};
```

---

## What Changes

### 1. `src/config/tabs.config.json`

Add a `"new"` entry to the thumbnails `actions` array:

```json
{ "label": "new", "mode": ["book-author"] }
```

### 2. `src/components/Studio/StudioThumbnails/StudioThumbnails.jsx`

**Add `createBlankPageUrl` helper** (pure function, defined outside the component):

```js
const createBlankPageUrl = (width = 794, height = 1123) => {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  return canvas.toDataURL("image/png");
};
```

**Add `onClickNew` handler** inside the component (needs access to `pages`, `setPages`, `activePage`, `onClickImage`):

```js
const onClickNew = () => {
  const url = createBlankPageUrl();
  const newPage = { _id: uuidv4(), blocks: [], v_blocks: [], url };
  const insertAt = activePage + 1;
  const newPages = [
    ...pages.slice(0, insertAt),
    newPage,
    ...pages.slice(insertAt),
  ];
  setPages(newPages);
  onClickImage(insertAt);
};
```

**Add to `thumbnailActions` array**:

```js
{
  label: "new",
  Icon: NoteAddIcon,       // or AddToPhotosIcon
  onClick: onClickNew,
},
```

**Add MUI icon import**:

```js
import NoteAddIcon from "@mui/icons-material/NoteAdd";
```

No changes needed to the filter/render logic — the existing `configuredActions` filter already handles it.

---

## File Touch Summary

| File | Change |
|---|---|
| `src/config/tabs.config.json` | Add `{ "label": "new", "mode": ["book-author"] }` to thumbnails actions |
| `src/components/Studio/StudioThumbnails/StudioThumbnails.jsx` | Add `createBlankPageUrl`, `onClickNew`, new entry in `thumbnailActions`, new icon import |

---

## Open Questions for Review

1. **Insertion position** — insert after active page (recommended) or always append to end?

2. **Page dimensions** — fixed A4 (794 × 1123) or match the dimensions of the current active page's image?

3. **Icon choice** — `NoteAddIcon` (document with +) or `AddToPhotosIcon` (photo with +) — the latter is already thematically close to `AddPhotoAlternateIcon` used by "add".

4. **`toDataURL` vs `toBlob`** — `toDataURL` is synchronous and simpler; `toBlob` produces a lighter blob URL. Worth switching if chapters are large (50+ pages).
