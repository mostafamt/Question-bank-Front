# Book Reader — Language-Aware Pages Plan

## Goal

`GET /pages?chapterId=...&language=...` now returns pages whose block
content (`contentValue`, `notes`, `audio`) is **already resolved to the
requested language** server-side, plus chapter/book metadata
(`chapterName`, `bookName`) in the same response. Wire the Book reader
(`/read/book/:bookId/chapter/:chapterId`) to call this endpoint with the
reader's current language instead of the plain `GET /pages?chapterId=...`
it uses today, so:

1. Opening a book to read already shows content in the language chosen on
   [the AddBook page](../2026-09-06/STUDIO_THUMBNAILS_BATCH_PAGE_CREATE_PLAN.md's
   sibling feature — the Read split-button) or in `localStorage`.
2. Toggling the language switcher in the navbar **while reading** actually
   re-fetches and re-renders the page content in the new language — today
   it only flips the page RTL/LTR direction, the underlying block text
   stays whatever the unfiltered endpoint returned.

---

## Current State

```
Book.jsx
  chapterLanguage = location.state?.language        (set once, from AddBook's navigate state)
  useEffect: if chapterLanguage → setLanguage(chapterLanguage)   (store + localStorage only)

  useQuery({
    queryKey: [`book-${bookId}-chapter-${chapterId}`],          ← no language in the key
    queryFn: () => getChapterPages(chapterId),                  ← GET /pages?chapterId=...  (no language)
  })
  data: pages = [...]                                           ← bare array

  useEffect: if pages.length → setActivePage(pages[0])          ← runs on every `pages` identity change
```

`getChapterPages` (`src/api/bookapi.js:34`) returns the bare array shape
and is shared with `ScanAndUpload.jsx` (authoring) and
`ImportPagesModal`'s `useImportPages` hook (import flow) — those callers
don't want per-language resolution, they need the raw authoring data.

**Problems:**
- The reader never sends `language`, so it always gets whatever the
  unfiltered response defaults to — not necessarily the language the user
  picked to read in.
- The global `language` value (navbar switch or AddBook selection) isn't
  part of the query key, so changing it mid-read doesn't refetch anything.
- `chapterName`/`bookName` aren't available to the reader UI at all today.

---

## New Endpoint Contract

**Endpoint:** `GET /pages?chapterId=<id>&language=<code>`
**Base URL:** `https://questions-api-navy.vercel.app/api`

**Response:**
```json
{
  "chapterId": "ed8da075f9f4f1105d53bd06",
  "chapterName": "Cell structure",
  "bookId": "12b149cf8881ef7ad905b037",
  "bookName": "Biology for Cambridge International",
  "pages": [
    {
      "_id": "55959621bec7fcbc38a3bb1d",
      "url": "http://.../wtfuxon0rgbltowmgsir.png",
      "blocks": [
        {
          "blockId": "6a94174699238600040fb354",
          "contentValue": "نعمل مع هيئة كامبريدج...",
          "contentType": "Paragraph",
          "coordinates": { "x": 19.81, "y": 0.43, "width": 62.97, "height": 2.47, "unit": "percentage" },
          "translations": [{ "language": "ar", "contentValue": "نعمل مع هيئة كامبريدج..." }],
          "narration": [
            { "language": "en", "audio": "https://.../...-en-....mp3" },
            { "language": "ar", "audio": "https://.../...-ar-....mp3" }
          ],
          "notes": "نعمل مع هيئة كامبريدج...",
          "audio": "https://.../...-ar-....mp3"
        }
      ],
      "v_blocks": [],
      "isNewPage": false
    }
  ]
}
```

Note the shape difference from today's `GET /pages?chapterId=...`
(no `language`): the response is now an **object** (`{ chapterId,
chapterName, bookId, bookName, pages }`), not a bare pages array.

**Key observation — no client-side merge needed:** for `language=ar`,
`block.contentValue`, `block.notes`, and the top-level `block.audio`
are already the Arabic values (matching the `"ar"` entry inside
`translations`/`narration`). The reader's existing rendering code
already reads exactly those fields (`contentValue`, `audio`), so once
the fetch passes the right `language`, no per-component translation
logic is required — the backend does the resolution.

---

## Proposed Flow

```
Book.jsx
  language = useStore(s => s.language)                          ← now READ from the global store directly
                                                                    (still seeded once from location.state, as today)

  useQuery({
    queryKey: [`book-${bookId}-chapter-${chapterId}`, language], ← language included, so switching it refetches
    queryFn: () => getChapterPagesByLanguage({ chapterId, language }),
  })
  data: { chapterName, bookName, pages = [] } = data ?? {}

  useEffect: setActivePage by matching the previous page's _id in the
             new `pages` array (falls back to pages[0] only when there
             was no previous active page) — keeps the reader on the same
             page across a language switch instead of jumping back to
             page 1
```

5 uploaded pages, switching language, etc. are unaffected in cost — this
is a read (not upload) path; the change is what's requested, not how
often.

---

## Files Changed

### 1. `src/api/bookapi.js` — add the language-aware reader fetch

```js
export const getChapterPages = async (id) => {
  const res = await axios.get(`/pages?chapterId=${id}`);
  return res.data;
};

export const getChapterPagesByLanguage = async ({ chapterId, language }) => {
  const res = await axios.get("/pages", { params: { chapterId, language } });
  return res.data; // { chapterId, chapterName, bookId, bookName, pages }
};
```

`getChapterPages` stays exactly as-is — `ScanAndUpload.jsx` and
`useImportPages.js` keep using it unchanged, since authoring/import don't
want language-filtered content.

### 2. `src/pages/Book/Book.jsx`

- Import `getChapterPagesByLanguage` instead of `getChapterPages`.
- Read the current language from the store so navbar toggles are picked up:

```js
const language = useStore((s) => s.language);
```

(The existing `location.state?.language` → `setLanguage()` effect stays,
so navigating from AddBook still seeds the store on first load; after
that, the reader's own `language` variable tracks whatever the store
holds, navbar switch included.)

- Update the query:

```js
const { data, isFetching } = useQuery({
  queryKey: [`book-${bookId}-chapter-${chapterId}`, language],
  queryFn: () => getChapterPagesByLanguage({ chapterId, language }),
  refetchOnWindowFocus: false,
});
const pages = data?.pages ?? [];
```

- Fix the active-page effect so a language refetch doesn't reset reading
  position:

```js
React.useEffect(() => {
  if (!pages?.length) return;
  setActivePage((prev) => {
    if (!prev) return pages[INITIAL_PAGE_INDEX];
    return pages.find((p) => p._id === prev._id) ?? pages[INITIAL_PAGE_INDEX];
  });
}, [pages]);
```

- No changes needed anywhere else in the file — `getBlockFromBlockId`,
  `hightBlock`, `onChangeActivePage`, and the `areas` derivation all
  operate on the unwrapped `pages` array exactly as they do today.

### 3. (Optional, out of scope unless requested) surface `chapterName` / `bookName`

`data?.chapterName` / `data?.bookName` are now available in `Book.jsx` but
nothing currently renders a book/chapter title in the reader header
(`BookHeaderLayout` only renders the outer/inner tab bars). Not wiring
this into the UI — flagged here so it's easy to pick up later if a title
is wanted.

---

## Edge Cases

| Case | Handling |
|---|---|
| User switches language via navbar mid-read | Query key changes (`language` included) → refetch fires; active-page effect matches by `_id` so the reader stays on the same page, now showing the new language's content |
| Direct URL load / page refresh (no `location.state`) | `language` falls back to whatever `useStore` initializes from `localStorage` (`store.js:4`), same as today — no behavior change |
| Backend has no translation for a block in the requested language | Out of this plan's control — whatever `contentValue`/`audio` the endpoint returns for that language is rendered as-is; no client-side fallback logic added |
| `ScanAndUpload.jsx` / `ImportPagesModal` (authoring/import) | Untouched — still call `getChapterPages(id)` with the old bare-array, no-language contract |
| Language switched before the first fetch resolves | `isFetching` gate already returns the loading spinner (existing behavior in `Book.jsx:213-219`), so no half-translated flash |

---

## What Is NOT Changed

- `getChapterPages` — untouched, still used by `ScanAndUpload.jsx` and `useImportPages.js`.
- `BookTabsLayout`, per-page/-block rendering components (`BookColumn`,
  `BookColumn2`, etc.) — they already read `block.contentValue` /
  `block.audio` directly, which the backend now resolves per-language, so
  no translation-lookup code needs to be added there.
- The navbar `LanguageSwitcher` component itself — unchanged; it already
  calls the shared `setLanguage()` store action, which is now also the
  signal `Book.jsx` reacts to.
- The AddBook split-button language picker — unrelated; it only decides
  which language `Book.jsx` starts with via `location.state`.

---

## Summary of Changes

| File | Change |
|---|---|
| `src/api/bookapi.js` | Add `getChapterPagesByLanguage({ chapterId, language })` wrapping `GET /pages?chapterId=...&language=...`; existing `getChapterPages` untouched |
| `src/pages/Book/Book.jsx` | Read `language` from the store; query key includes `language`; `queryFn` switches to `getChapterPagesByLanguage`; unwrap `pages` from the new `{ chapterName, bookName, pages }` response shape; active-page effect preserves position across a language refetch by matching page `_id` |
