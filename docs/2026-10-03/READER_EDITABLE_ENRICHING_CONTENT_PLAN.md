# Reader-Editable Enriching Content Tab — Plan

**Date:** 2026-10-03
**Mode:** Reader only (`/read/book/:bookId/chapter/:chapterId`)
**Status:** Implemented with the recommended defaults: separate "My items"
section (Q1), text + link only (Q2), no reorder (Q3), the query-key fix
included (Q5), constant not renamed (Q6). Q4 (images in notes) is still open.
Notes: `deriveEnrichingContentName` moved to
`src/components/Tabs/List/enrichingContent.utils.js` (it would otherwise be a
circular import), and the store slice takes an updater
(`updateReaderEnriching(chapterId, items => …)`) so a write before the chapter
has loaded cannot overwrite stored items.
**Builds on:** `docs/2026-10-03/READER_EDITABLE_VBLOCKS_PLAN.md` (implemented, commit `6da1798`).
It uses the same "personal layer" approach and the same storage pattern.

---

## 1. Goal

In the **Enriching Content** tab in reader mode, the reader can **add**,
**update** and **delete** their own enriching items (text notes and links)
next to the author's items.

## 2. Where we are today

- The tab is the shared `List` component (`src/components/Tabs/List/List.jsx`)
  with `tab = LEFT_TAB_NAMES.ENRICHING_CONTENT`. In reader mode it is created
  in `src/components/Studio/columns/reader.columns.js` with the `reader`
  flag.
- **Author data:** `GET/POST /chapters/:chapterId/enriching-contents`
  (`getEnrichingContents` / `submitEnrichingContents` in `services/api.js`).
  Items are `{ contentType: "text" | "url" | "object", contentValue }`, and
  `List` maps them to `{ _id, type, contentValue, name, url, baseType }`.
- **In reader mode, `List` hides** the **+** button, the Submit button and
  the delete button (`ListItem`), so the tab is play-only.
- **Adding** uses `EnrichingContentModal`, which wraps `ContentItemForm`.
  The form already supports `allowedTypes` (added for reader VBlocks).

### 2.1 Existing issues found while reading the code

1. **Reader can "edit" author text items, but the change goes nowhere.**
   `handlePlay` opens `text-editor` with an `onClickSubmit`. That makes the
   editor editable even in reader mode. The edit only changes local `List`
   state and is lost on reload. **Fix in this feature:** in reader mode,
   open author text items read-only (no `onClickSubmit`).
2. **The query key has no chapter id.** `queryKey: ["tab-objects-<tab>"]`
   means that after switching chapters without a reload, the cached list of
   the previous chapter can show. This is not required for this feature, but
   it is a one-line fix (`[..., chapterId]`). See open question 5.

## 3. Key decision: whose items does the reader edit?

Same answer as for VBlocks: **a personal layer (recommended).** Reader items
belong to the reader and are stored in the browser. They are never sent with
`submitEnrichingContents`, so the author's chapter content cannot be changed
from reader mode. The other option, letting readers POST to the chapter
endpoint, would change the chapter for every reader, and the app has no users
or permissions.

## 4. Behaviour

### 4.1 Layout of the tab in reader mode

```
Enriching Content
───────────────────────────────
 Author item 1            ▶ ↑ ↓
 Author item 2            ▶ ↑ ↓
───────────────────────────────
 My items                    [+]
 👤 My note about …     ▶ ✎ 🗑
 👤 https://youtube…    ▶ ✎ 🗑
   (or: "No items yet. Tap + to add one.")
```

- Author items: unchanged (play, plus the existing up/down reference arrows).
  Text items now open **read-only**.
- A separate **My items** section below them, with its own **+** button.
  Keeping the two lists apart makes it clear which items the reader can edit
  (open question 1 offers one merged list instead).

### 4.2 Actions

| Action | Result |
|---|---|
| **+** in My items | Opens `EnrichingContentModal` limited to **Text** and **Link**. Saving adds the item to the end of My items. |
| ▶ on a reader item | Text opens `text-editor` read-only; a link opens `iframe-display`. These are the same players as author items. |
| ✎ on a reader item | Opens `EnrichingContentModal` with the item pre-filled (title "Edit Enriching Content Item"). Saving replaces it and keeps its `id`. |
| 🗑 on a reader item | Confirmation dialog (MUI `Dialog`), then removes it. |
| Reload / come back | Reader items are still there (same browser). |
| Studio / author mode | No My items section. The author list and Submit work as before. |

### 4.3 Content types

| Type | Reader? | Why |
|---|---|---|
| `text` | ✅ | Personal notes |
| `link` | ✅ | e.g. a video they found |
| `object` | ❌ (open question 2) | Picking from the library is an authoring tool |

Reuse `READER_VBLOCK_CONTENT_TYPES` (`["text", "link"]`), or rename it to
`READER_CONTENT_TYPES`, since it now serves both features.

## 5. Storage design

**Key:** one entry per chapter

```
reader_enriching_<chapterId>
```

**Value:** an ordered array

```json
[
  { "id": "re_1730000000000_ab12cd", "type": "text",
    "contentValue": "<p>My note</p>",
    "createdAt": 1730000000000, "updatedAt": 1730000000000 },
  { "id": "re_1730000005000_ef34gh", "type": "link",
    "contentValue": "https://www.youtube.com/watch?v=…",
    "createdAt": 1730000005000, "updatedAt": 1730000005000 }
]
```

- **Per chapter**, because the tab is per chapter (not per page).
- **Uses the frontend `type` (`link`, not `url`).** A later backend sync maps
  it with the same `link ↔ url` rule `List` already uses.
- `name` is **not stored**. It is derived at render time with
  `deriveEnrichingContentName`, so a change to that rule applies everywhere.
- Same failure handling as the bookmarks and reader VBlocks: reads and writes
  are wrapped in `try/catch`. A failed write shows a toast (quota or blocked
  storage). Bad JSON means "no items".

New constant: `STORAGE_KEYS.READER_ENRICHING = "reader_enriching"`.

## 6. Implementation

### 6.1 Store slice — `src/store/store.js`

Next to `readerVBlocks`:

```js
readerEnriching: {},                               // { [chapterId]: Item[] }
loadReaderEnriching: (chapterId) => …,
setReaderEnriching: (chapterId, items) => boolean, // false = not persisted
```

`readReaderVBlocks` / `writeReaderVBlocks` and the new pair would be nearly
identical. Extract two small helpers, `readJSON(key, fallback, isValid)` and
`writeJSON(key, value)`, and use them for all three slices (bookmarks, VBlocks,
enriching). This is a small refactor inside `store.js` and changes no
behaviour.

### 6.2 Hook — `src/components/Studio/hooks/useReaderEnriching.js` (new)

```js
const { items, addItem, updateItem, removeItem } = useReaderEnriching(chapterId);
```

Built the same way as `useReaderVBlocks`: it loads the chapter on first use,
adds `id` / `createdAt` / `updatedAt` stamps, and shows the toast on a failed
write.

### 6.3 `EnrichingContentModal.jsx`

Add optional props, all backwards compatible:
- `allowedTypes`: passed through to `ContentItemForm` (already supported).
- `editingContent`: passed through to `ContentItemForm` (already supported)
  to pre-fill an edit.
- `title`: defaults to "Add Enriching Content Item".

### 6.4 New component — `src/components/Tabs/ReaderEnrichingItems/ReaderEnrichingItems.jsx`

The **My items** section: header with **+**, the list of reader items,
empty state, and delete confirmation dialog.
- Each row reuses the `ListItem` styles (`listItem.module.scss`) and adds an
  edit button. It does not reuse the `ListItem` component, whose `reader`
  flag hides delete and shows the reference arrows; reader items need the
  opposite.
- Play uses the same `text-editor` (read-only) and `iframe-display` modals.

### 6.5 `List.jsx`

Two small changes:
1. In `handlePlay`, pass `onClickSubmit` for enriching text items only when
   `!reader`. This fixes issue §2.1-1.
2. After `<ul>{objectsList}</ul>`, render
   `{reader && isEnrichingContent && <ReaderEnrichingItems chapterId={chapterId} />}`.

`List` stays responsible for author data. All reader logic lives in the new
component and hook, so the author path (query, mapping, Submit) is not
touched.

### 6.6 Styles

A thin divider and a "My items" heading row in a small SCSS module next to
the new component. Rows use the existing `list-item` look, plus a person icon
to match the "mine" marker on reader VBlocks.

## 7. Files touched

| File | Change |
|---|---|
| `src/components/Studio/constants/studio.constants.js` | `STORAGE_KEYS.READER_ENRICHING` (+ optionally rename the content-types constant) |
| `src/store/store.js` | `readerEnriching` slice (+ shared JSON helpers) |
| `src/components/Studio/hooks/useReaderEnriching.js` | **New** hook |
| `src/components/Tabs/ReaderEnrichingItems/ReaderEnrichingItems.jsx` (+ scss) | **New** "My items" section |
| `src/components/Modal/EnrichingContentModal/EnrichingContentModal.jsx` | `allowedTypes`, `editingContent`, `title` props |
| `src/components/Tabs/List/List.jsx` | Read-only author text in reader; render the new section |

Not touched: `services/api.js`, `submitEnrichingContents`, the author
mapping, `reader.columns.js`, other tabs.

## 8. Test checklist

- [ ] Reader: the tab shows the author items, then "My items" with its empty state.
- [ ] **+** → Text → save: the item appears with a name derived from the text. ▶ opens it read-only.
- [ ] **+** → Link → save: the name is the URL. ▶ opens it in the iframe modal (YouTube embeds work).
- [ ] ✎ on a text item: pre-filled; save updates the name and content, and the item keeps its position.
- [ ] 🗑: Cancel keeps the item; Delete removes it.
- [ ] Only Text and Link are offered in the reader modal.
- [ ] Reload: the items remain. Chapter A's items don't show in chapter B.
- [ ] Author text item in reader mode opens **read-only** (regression fix).
- [ ] Studio mode: no My items section. The **+** button and Submit work exactly as before, and the Submit payload contains only author items.
- [ ] Blocked storage / bad JSON: no crash. Quota exceeded: a toast.
- [ ] Bookmarks and reader VBlocks still load and save after the `store.js` helper refactor.

## 9. Later (out of scope)

- Backend storage per user (needs user identity), e.g.
  `GET/PUT /reader/enriching-contents/:chapterId`.
- Linking a reader item to a page (a "go to page" arrow like the author
  references).
- A shared view listing all of the reader's personal content (reader VBlocks
  + enriching items) in one place.

## 10. Open questions for review

1. **Layout:** a separate "My items" section under the author items
   (recommended), or one merged list with a person marker on the reader's
   items?
2. **Object type:** may readers attach interactive objects from the library?
3. **Reorder:** do readers need to reorder their own items? The plan keeps
   them in the order they were added. Reorder could be added later with
   `@hello-pangea/dnd`, which the app already uses.
4. **Images in text notes:** same concern as reader VBlocks. Base64 images in
   Quill fill `localStorage` quickly. Turn images off for readers, or upload
   them to Cloudinary?
5. **Query-key fix (§2.1-2):** include the `chapterId` fix in this change,
   or do it separately? It affects every `List` tab, not only this one.
6. **Constant name:** rename `READER_VBLOCK_CONTENT_TYPES` to
   `READER_CONTENT_TYPES` now that two features use it?
