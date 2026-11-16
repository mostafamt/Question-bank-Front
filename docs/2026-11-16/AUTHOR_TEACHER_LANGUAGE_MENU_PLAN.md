# Language Menu for Author & Teacher Buttons — Plan

**Date:** 2026-11-16
**Page:** `src/pages/AddBook/AddBook.jsx`
**Status:** Implemented — open questions resolved with the proposed defaults (shared language; arrow disabled when no languages; Teacher menu enabled; new-page language tagging out of scope)

---

## 1. Goal

Give the **Author** and **Teacher** buttons the same split-button + language menu that the **Read** button has today.

| Button  | Main button click                                   | Language item click                                        |
|---------|-----------------------------------------------------|------------------------------------------------------------|
| Read    | *(unchanged)* Opens the reader in the selected language | *(unchanged)* Opens the reader in the clicked language |
| Author  | Opens the author page in the selected language     | **Opens the author page** in the clicked language          |
| Teacher | Does nothing (same as today)                        | **Does nothing**: only closes the menu                     |

---

## 2. Current State

### AddBook.jsx
- **Read** is an MUI `ButtonGroup`: the main button plus an `ArrowDropDown` button that opens a `Menu`.
  - State: `readLanguage`, `languageMenuAnchor`.
  - Languages come from `getChapterLanguages(chapterId)` → `availableLanguages`.
  - Clicking an item calls `handleReadLanguageSelect(code)`, which runs `handleSubmit(...)` and then `handleRead(values, code)`.
  - `handleRead` sends `state: { contentLanguage }` to `/read/book/:bookId/chapter/:chapterId`.
- **Author** (`name="book-author"`, `type="submit"`) calls `handleBookAuthor`, which:
  - loads `getTypes()` and runs `setFormState({ types })`;
  - sets the **layout** language (RTL/LTR) from `chapterDetails.language` through `setLanguage`;
  - navigates to `/book-author/book/:bookId/chapter/:chapterId` with `state: { language }`.
- **Teacher** is `type="button"` with no `onClick`, so it does nothing.

### ScanAndUpload.jsx (renders `/book-author/...`)
```js
const contentLanguage = location.state?.contentLanguage;
const shouldQueryByLanguage = isReaderMode && Boolean(contentLanguage);
```
⚠️ **Pages are filtered by language only in reader mode.** Passing `contentLanguage` to the author route has **no effect** until this condition is changed. This is the one change outside AddBook.

---

## 3. Proposed Design

### 3.1 Extract a reusable `LanguageSplitButton` component
Writing the ButtonGroup + Menu out three times would duplicate about 50 lines each. Instead, create:

`src/pages/AddBook/LanguageSplitButton.jsx`

```jsx
<LanguageSplitButton
  label="Author"
  icon={<AutoStoriesIcon />}
  color="#1565c0"
  hoverColor="#0d47a1"
  languages={availableLanguages}
  selectedLanguage={selectedLanguage}
  disabled={loadingScan}
  mainButtonProps={{ type: "submit", name: "book-author" }}
  onLanguageSelect={(code) => ...}
/>
```

Responsibilities:
- Holds its **own** `anchorEl` state, so each button's menu opens independently.
- Renders the main button with the label plus `(Language label)` when one is selected.
- The dropdown arrow is disabled when `languages.length === 0`.
- The menu shows a ✓ next to `selectedLanguage`.
- An item click closes the menu and calls `onLanguageSelect(code)`.

**Read** is then switched to this same component, so all three buttons behave and look the same.

### 3.2 Language state: one shared selection
Rename `readLanguage` to `selectedLanguage` and share it across the three buttons.
- It is still initialised by the existing `useEffect` (the chapter's own language, else the first available one).
- Picking a language in any menu updates the label on all three buttons.

> **Alternative:** a separate language per button (`readLanguage`, `authorLanguage`, `teacherLanguage`). See open question Q1.

### 3.3 Author navigation
Change `handleBookAuthor` to take the language explicitly, as `handleRead` does:

```js
const handleBookAuthor = async ({ book, chapter }, contentLanguage = selectedLanguage) => {
  setLoadingScan(true);
  try {
    const types = await getTypes();
    setFormState({ types });

    const chapterDetails = chapters.find((c) => c._id === chapter);
    const language = chapterDetails?.language || "en"; // layout (RTL/LTR) — unchanged
    setLanguage(language);

    navigate(`/book-author/book/${book}/chapter/${chapter}`, {
      state: contentLanguage ? { language, contentLanguage } : { language },
    });
  } finally {
    setLoadingScan(false);
  }
};

const handleAuthorLanguageSelect = (code) => {
  setSelectedLanguage(code);
  handleSubmit((values) => handleBookAuthor(values, code))();
};
```

- The layout language and the content language stay **separate**, following the Read flow's rule.
- `handleSubmit` keeps the book/chapter validation.
- `loadingScan` disables the Author button while types load.

### 3.4 Teacher
```js
onLanguageSelect={(code) => setSelectedLanguage(code)}
```
- The main button stays `type="button"` with no handler.
- The menu works and the selection updates, but nothing navigates.

### 3.5 ScanAndUpload: let author mode load pages by language
```js
const isBookAuthorMode = mode === "book-author";
const shouldQueryByLanguage =
  (isReaderMode || isBookAuthorMode) && Boolean(contentLanguage);
```
- The query key already contains `contentLanguage`, so caching stays correct.
- `Studio.jsx:244` already reads `location.state?.contentLanguage` for narration, so no change is needed there.

---

## 4. Files to Change

| File | Change |
|------|--------|
| `src/pages/AddBook/LanguageSplitButton.jsx` | **New**: reusable split button + language menu |
| `src/pages/AddBook/AddBook.jsx` | Use the component for Read/Author/Teacher; rename to `selectedLanguage`; `handleBookAuthor` takes a language; add `handleAuthorLanguageSelect` |
| `src/pages/ScanAndUpload/ScanAndUpload.jsx` | Allow the language-filtered page query in `book-author` mode |

---

## 5. Risks

1. **Saving in author mode.** After this change, the author page loads only the pages for one language. The save flow (`handleSubmit` / `refetch` in ScanAndUpload) has to keep working on that subset. Saves are keyed by page ID, so this *should* be safe, but it needs checking: page ordering, adding new pages, and `refetch` after a save.
2. **Mode detection.** `useAppMode()` returns `"book-author"` based on `pathname.includes("/book-author/")`, which needs confirming during implementation.
3. **Narrow screens.** Three split buttons with language labels are wider than before. Check the responsive `.actions` layout in `addBook.module.scss`.

---

## 6. Open Questions

- **Q1.** Should all three buttons share **one** selected language (proposed), or should each button keep its own?
- **Q2.** Should Author also show the language menu when the chapter has **no** language options? Proposed: the arrow is disabled and Author navigates without `contentLanguage`, exactly as today.
- **Q3.** For Teacher, should the dropdown be **enabled** (it only changes the selection) or **disabled** until Teacher has a route? Proposed: enabled.
- **Q4.** Should new pages created in author mode be tagged with the selected `contentLanguage`? Proposed: **out of scope** for this change.

---

## 7. Test Checklist

- [ ] Read: the main button and each language item still navigate correctly (no regression).
- [ ] Author main button: opens `/book-author/...` with `contentLanguage` = the selected language, and the pages shown match that language.
- [ ] Author language item: opens the author page in the **clicked** language.
- [ ] Author with no chapter selected: shows the validation error and does not navigate.
- [ ] Author on a chapter with no languages: the arrow is disabled and the author page loads all pages (old behaviour).
- [ ] Author: the navbar RTL/LTR still follows the chapter's language, not the selected content language.
- [ ] Author: saving a page still works after loading by language.
- [ ] Teacher main button: does nothing.
- [ ] Teacher language item: closes the menu and updates the selection; no navigation.
- [ ] Layout looks correct on mobile and desktop widths.
