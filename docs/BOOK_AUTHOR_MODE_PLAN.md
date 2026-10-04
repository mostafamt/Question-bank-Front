# Feature Plan: Three-Mode System — `reader` / `studio` / `book-author`

## Background

The app currently has two modes detected from the URL:

| URL prefix | Mode | Behaviour |
|---|---|---|
| `/read/book/…` | `reader` | View-only tabs — Thumbnails, Recalls, TOC, Glossary, etc. |
| `/book/book/…` | `studio` | Authoring tabs — Block Authoring, Composite Blocks, + all reader tabs |
| `/book-author/book/…` | `studio` ← **wrong** | Currently falls through to `studio` because it doesn't contain `/read/` |

The `/book-author/` route was added as a distinct entry point but the mode system never grew to match it. Today it behaves identically to studio.

---

## Goal

Introduce `book-author` as a **first-class mode** that:

- Is detected automatically from the `/book-author/` URL prefix
- Shares all studio-level tabs (same left/right sidebar content)
- Augments individual tabs with **mode-scoped actions** — each tab can declare actions that only appear in specific modes
- Requires no new route — the existing `/book-author/book/:bookId/chapter/:chapterId` route already exists

---

## Actions Design

Tab entries in `tabs.config.json` can now carry an optional `actions` array. Each action declares which modes it is visible in:

```json
"actions": [
  { "name": "copy",      "mode": ["book-author"] },
  { "name": "duplicate", "mode": ["book-author"] }
]
```

The consuming component filters by current mode at render time:

```js
const visibleActions = (tab.actions ?? []).filter(a => a.mode.includes(currentMode));
```

This keeps the tab definition single-source — no duplicate entries, no `componentByMode` map — and makes it trivial to extend any tab with new per-mode actions in the future.

Currently applied to the **thumbnails** tab (`copy`, `duplicate` in `book-author` mode). Other tabs can adopt the same pattern as needed.

---

## What Changes

### 1. `src/utils/tabFiltering.js`

**`detectModeFromUrl()` and `useAppMode()`** — extend mode detection:

```js
// Before
return pathname.includes("/read/") ? "reader" : "studio";

// After
if (pathname.includes("/read/"))        return "reader";
if (pathname.includes("/book-author/")) return "book-author";
return "studio";
```

**`validateTabConfig()`** — add `"book-author"` to the valid modes list:

```js
// Before
const invalidModes = tab.modes.filter(
  (mode) => !["reader", "studio"].includes(mode)
);

// After
const invalidModes = tab.modes.filter(
  (mode) => !["reader", "studio", "book-author"].includes(mode)
);
```

Add validation for the `actions` field while here:

```js
(tab.actions ?? []).forEach(action => {
  if (!action.name) errors.push(`Tab ${tab.id}: action missing "name"`);
  if (!Array.isArray(action.mode)) errors.push(`Tab ${tab.id}: action "${action.name}" has invalid "mode"`);
});
```

**Return type update** — JSDoc type: `'reader' | 'studio' | 'book-author'`

---

### 2. `src/config/tabs.config.json`

Bump version to `1.1.0` and update description.

**Tabs visible in `book-author` mode** (same visibility as `studio`):

| Tab | Current modes | After |
|---|---|---|
| `thumbnails` | `["reader", "studio"]` | `["reader", "studio", "book-author"]` |
| `recalls` | `["reader", "studio"]` | `["reader", "studio", "book-author"]` |
| `micro-learning` | `["reader", "studio"]` | `["reader", "studio", "book-author"]` |
| `enriching-content` | `["reader", "studio"]` | `["reader", "studio", "book-author"]` |
| `check-yourself-left` | `["studio"]` | `["studio", "book-author"]` |
| `exercise-left` | `["studio"]` | `["studio", "book-author"]` |
| `block-authoring` | `["studio"]` | `["studio", "book-author"]` |
| `composite-blocks` | `["studio"]` | `["studio", "book-author"]` |
| `table-of-contents` | `["reader", "studio"]` | `["reader", "studio", "book-author"]` |
| `glossary-keywords` | `["reader", "studio"]` | `["reader", "studio", "book-author"]` |
| `illustrative-interactions` | `["reader", "studio"]` | `["reader", "studio", "book-author"]` |

**Thumbnails tab — already updated:**

```json
{
  "id": "thumbnails",
  "component": "StudioThumbnails",
  "actions": [
    { "name": "copy",      "mode": ["book-author"] },
    { "name": "duplicate", "mode": ["book-author"] }
  ]
}
```

No new component needed. `StudioThumbnails` reads the actions list and renders the appropriate controls.

---

### 3. `src/components/Studio/constants/tabs.constants.js`

Add a `MODES` constant for all three values:

```js
export const MODES = {
  READER: "reader",
  STUDIO: "studio",
  BOOK_AUTHOR: "book-author",
};
```

---

### 4. `src/components/Studio/columns/index.js` (column builder)

The column builder currently branches on `isReaderMode`. Extend to handle three modes and pass the current mode down to each tab component:

```js
// Before
const isReaderMode = mode === "reader";

// After — pass mode as prop so components can filter their own actions
buildColumns(tabs, { mode });
```

Each tab component receives `mode` and uses it to filter `tab.actions`.

---

### 5. `StudioThumbnails` — action rendering

**No new component required.** Update `StudioThumbnails` to accept a `mode` prop and render per-thumbnail action buttons from the tab config:

```js
const visibleActions = (tabConfig.actions ?? []).filter(a => a.mode.includes(mode));
```

| Action name | Icon | Behaviour |
|---|---|---|
| `copy` | `ContentCopyIcon` | Copy page to clipboard / another chapter |
| `duplicate` | `FileCopyIcon` | Duplicate page within the same chapter |

Both actions are only rendered when `mode === "book-author"`.

---

## File Touch Summary

| File | Change type |
|---|---|
| `src/utils/tabFiltering.js` | Extend mode detection + validation (modes + actions) |
| `src/config/tabs.config.json` | Add `book-author` to modes arrays; `actions` already added to thumbnails |
| `src/components/Studio/constants/tabs.constants.js` | Add `MODES` constant |
| `src/components/Studio/columns/index.js` | Pass `mode` through to tab components |
| `src/components/Studio/StudioThumbnails.jsx` | Read `actions` from tab config, render filtered action buttons |

No new files. No changes to routes, `ScanAndUpload`, `Book.jsx`, or any API layer.

---

## Open Questions for Review

1. **Action icons** — `copy` and `duplicate` are named but icon and exact behaviour are not finalised. Are these page-level operations (copy a page to another chapter) or thumbnail-UI operations (duplicate a thumbnail card locally)?

2. **Additional actions** — the plan currently only adds actions to thumbnails. Should other tabs (e.g. `block-authoring`, `composite-blocks`) also carry `book-author`-specific actions?

3. **API endpoints** — `copy` and `duplicate` will likely need backend support. Are those endpoints available?

4. **Delete / reorder** — the original plan included upload, delete, and reorder page actions. Are those still in scope, or replaced by copy/duplicate?
