# Add Chapter Feature Plan

**Date:** 2026-06-25  
**Page:** `src/pages/AddBook/AddBook.jsx`  
**Goal:** When a book is selected and the chapter list appears, show a "+ Add Chapter" entry at the bottom. Clicking it opens a modal where the user fills in chapter details. On success the new chapter is created, the list refreshes, and the new chapter is auto-selected.

---

## Current State

`AddBook.jsx` renders two dropdowns:
1. **Book** — fetched from `GET /books`
2. **Chapter** — fetched from `GET /chapters?bookId={id}` once a book is selected

Both use the custom `Select` component which renders a native HTML `<select>` element with `<option>` children. There is no way to create a chapter — only to pick an existing one.

There is **no existing** `POST /chapters` API call in `src/api/bookapi.js` and no `AddChapterModal` component.

---

## UI Decision — How to Show "+ Add Chapter"

A native `<select>` + `<option>` cannot hold a clickable button. Two approaches:

### Option A — Button below the dropdown (recommended)

Render a small "+ Add Chapter" text button directly below the Chapter select, visible only after a book is selected.

```
[ Chapter ▼ ]
+ Add Chapter        ← small text button / link below the select
```

**Pros:** Clean separation between "select a chapter" and "create a chapter". No hacks.  
**Cons:** Slightly below the dropdown rather than inside it.

### Option B — Sentinel option inside the dropdown

Add a special `<option value="__add_chapter__">+ Add Chapter</option>` as the last item. An `onChange` handler detects the sentinel value, immediately opens the modal, and resets the selection back to empty.

```
[ -- Select an option --  ]
[ Chapter One             ]
[ Chapter Two             ]
[ + Add Chapter           ]  ← sentinel option
```

**Pros:** Literally the "last option" in the list as requested.  
**Cons:** Slightly hacky — selecting an option as a button trigger is non-standard. Options can't be styled distinctly in all browsers.

**Recommendation: Option A** — cleaner, accessible, works the same in all browsers. But Option B is also implementable if you prefer the dropdown feel.

---

## Modal Design

The modal follows the same pattern as `ImportPagesModal` (MUI Dialog, not Bootstrap).

### Fields

| Field | Type | Required | Notes |
|---|---|---|---|
| Title | Text input | Yes | Chapter name |
| Language | Select (en / ar) | No | Defaults to "en" |

### Behaviour

- **Open:** triggered by "+ Add Chapter" button/option; receives `bookId` as a prop
- **Submit:** calls `POST /chapters` → on success: closes modal, invalidates `chapters-{bookId}` React Query cache, auto-selects the new chapter in the dropdown
- **Cancel:** closes modal, no changes
- **Loading state:** submit button shows spinner, fields disabled
- **Error state:** toast error if API call fails

---

## Files to Create

### 1. `src/components/Modal/AddChapterModal/AddChapterModal.jsx`

New MUI Dialog component. Props: `open`, `handleCloseModal`, `bookId`, `onChapterCreated`.

```
AddChapterModal/
└── AddChapterModal.jsx
```

Renders:
- MUI Dialog with title "Add Chapter"
- TextField for title (required, validated before submit)
- Select/RadioGroup for language (en / ar)
- Cancel + Save buttons
- Calls `createChapter({ bookId, title, language })` on submit
- On success: calls `onChapterCreated(newChapter)` so the parent can select it

---

## Files to Modify

### 2. `src/api/bookapi.js`

Add one function:

```js
export const createChapter = async ({ bookId, title, language }) => {
  const res = await axios.post("/chapters", { bookId, title, language });
  return res.data;
};
```

### 3. `src/components/Modal/Modal.jsx`

Register the new modal:

```js
import AddChapterModal from "./AddChapterModal/AddChapterModal";
```

Add a rendering path (same pattern as `import-pages`):

```js
if (name === "add-chapter") {
  return (
    <AddChapterModal open={opened} handleCloseModal={closeModal} {...props} />
  );
}
```

### 4. `src/pages/AddBook/AddBook.jsx`

Changes needed:
- Import `useQueryClient` from `@tanstack/react-query`
- Import `openModal` from the Zustand store (already imported)
- Add `setValue` from `useForm` (to auto-select the new chapter)
- After the Chapter `<Select>`, render the "+ Add Chapter" button (Option A) or sentinel option (Option B)
- Pass `bookId` and `onChapterCreated` callback to the modal via `openModal("add-chapter", { bookId, onChapterCreated })`
- In `onChapterCreated`: invalidate the chapters query + call `setValue("chapter", newChapter._id)`

---

## Data Flow

```
User clicks "+ Add Chapter"
  → openModal("add-chapter", { bookId: watch("book"), onChapterCreated })
    → AddChapterModal opens
      → User fills title + language → clicks Save
        → POST /chapters { bookId, title, language }
          → success: returns { _id, title, language, ... }
            → closeModal()
            → onChapterCreated(newChapter)
              → queryClient.invalidateQueries(["chapters-{bookId}"])
              → setValue("chapter", newChapter._id)
              → toast.success("Chapter created")
```

---

## What Is NOT in Scope

- Editing or deleting existing chapters
- Reordering chapters
- Any chapter fields beyond title and language
- Backend implementation — this plan assumes `POST /chapters` already exists or will be added on the backend side

---

## Open Question Before Implementation

**Does `POST /chapters` exist on the backend?**  
`src/api/bookapi.js` currently has no create-chapter call. Before implementing the modal, confirm the endpoint URL and expected request/response shape with the backend team.

If it doesn't exist yet, the modal can still be built and the API call can be wired up once the endpoint is ready.
