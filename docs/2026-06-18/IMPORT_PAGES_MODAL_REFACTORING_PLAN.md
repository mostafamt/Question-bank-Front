# ImportPagesModal Refactoring Plan

## Overview

`ImportPagesModal.jsx` is a 234-line modal that lets users import pages from another book/chapter into the current chapter. It is self-contained but mixes data fetching, state management, and UI into a single file. This plan breaks it into clean, testable pieces without changing any visible behavior.

---

## Current State Analysis

### Component Structure

```
ImportPagesModal.jsx (234 lines — single file)
├── react-hook-form setup (register, watch)
├── useState: selectedPages, isImporting
├── useQuery: books, chapters, pages
├── useEffect: reset selectedPages on selection change
├── handleConfirm (import mutation + cache invalidation)
└── JSX
    ├── Dialog > DialogTitle + CloseIcon
    ├── Divider
    ├── DialogContent
    │   ├── Select (Book)
    │   ├── Select (Chapter)
    │   └── Page grid (inline map → Box + img + Typography + CheckCircleIcon)
    ├── Divider
    └── DialogActions (Cancel + Confirm buttons)
```

### Identified Issues

#### 1. Wrong query key format (Severity: Medium)
React Query best practice uses arrays, not template-string keys. String keys break `invalidateQueries` prefix matching and devtools grouping.
```js
// current — string keys
queryKey: [`chapters-${selectedBook}`]
queryKey: [`pages-${selectedChapter}`]

// should be — array keys
queryKey: ["chapters", selectedBook]
queryKey: ["pages", selectedChapter]
```

#### 2. `react-hook-form` used only as a state proxy (Severity: Medium)
`register` and `watch` are used to track two `<select>` values with no actual form submission or Yup/Zod validation. Plain `useState` is simpler and removes an unnecessary dependency.

#### 3. Inline `PageCard` JSX is complex and untestable (Severity: Medium)
The per-page thumbnail (image, selection border, page label, checkmark icon) is ~40 lines of inline JSX inside a `.map()`. It should be its own component.

#### 4. `selectedPages` not reset on modal close (Severity: Low)
When the modal is closed and reopened the previous selection persists. The `useEffect` only resets on `selectedBook`/`selectedChapter` change, not on `open` toggle.

#### 5. Page label is 0-indexed (Severity: Low)
```jsx
<Typography>{idx}</Typography>   // shows 0, 1, 2 …
// should be
<Typography>{idx + 1}</Typography>  // shows 1, 2, 3 …
```

#### 6. No `index.js` barrel export (Severity: Low)
Consumers import the full path `…/ImportPagesModal/ImportPagesModal`. Adding an `index.js` cleans this up.

---

## Target Structure

```
ImportPagesModal/
├── index.js                     ← barrel export
├── ImportPagesModal.jsx         ← thin orchestrator (layout only)
├── components/
│   ├── PageCard.jsx             ← single page thumbnail + selection state
│   └── PageGrid.jsx             ← grid wrapper + loading/empty states
└── hooks/
    └── useImportPages.js        ← all state + data fetching + mutation
```

---

## Refactoring Phases

### Phase 1 — Quick Wins
**Goal:** Fix correctness issues before restructuring anything.

**Changes:**
1. Convert query keys to array format:
   - `["chapters", selectedBook]`
   - `["pages", selectedChapter]`
2. Reset `selectedPages` when `open` goes from `true` → `false`.
3. Fix page label from `{idx}` to `{idx + 1}`.

**Files touched:** `ImportPagesModal.jsx` only.

---

### Phase 2 — Extract `PageCard` Component
**Goal:** Isolate the per-page thumbnail into a focused, testable component.

**New file:** `components/PageCard.jsx`

```jsx
// Props: page, index, isSelected, onToggle
const PageCard = ({ page, index, isSelected, onToggle }) => { … }
```

Moves out of `ImportPagesModal.jsx`:
- The `<Box>` wrapper with `onClick`
- The `<Box component="img">` with selection border styles
- The `<Typography>` page label
- The `<CheckCircleIcon>` overlay

**Files touched:** `ImportPagesModal.jsx`, new `components/PageCard.jsx`.

---

### Phase 3 — Extract `PageGrid` Component
**Goal:** Isolate the grid layout + loading/empty states.

**New file:** `components/PageGrid.jsx`

```jsx
// Props: pages, isLoading, selectedPages, onToggle
const PageGrid = ({ pages, isLoading, selectedPages, onToggle }) => { … }
```

Moves out of `ImportPagesModal.jsx`:
- The `isLoadingPages` spinner
- The `gridTemplateColumns` grid container
- The `.map()` over pages (delegates each item to `PageCard`)
- The selection count `<Typography>`

**Files touched:** `ImportPagesModal.jsx`, new `components/PageGrid.jsx`.

---

### Phase 4 — Extract `useImportPages` Hook
**Goal:** Remove all non-UI logic from the component.

**New file:** `hooks/useImportPages.js`

```js
const useImportPages = ({ open, onClose }) => {
  // state
  const [selectedBook, setSelectedBook] = useState("");
  const [selectedChapter, setSelectedChapter] = useState("");
  const [selectedPages, setSelectedPages] = useState([]);
  const [isImporting, setIsImporting] = useState(false);

  // queries
  const { data: books, isLoading: isLoadingBooks } = useQuery(…);
  const { data: chapters, isLoading: isLoadingChapters } = useQuery(…);
  const { data: pages, isLoading: isLoadingPages } = useQuery(…);

  // reset on close
  useEffect(() => { if (!open) { /* reset all */ } }, [open]);

  // reset pages on book/chapter change
  useEffect(() => { setSelectedPages([]); }, [selectedBook, selectedChapter]);

  const togglePage = (pageId) => { … };
  const handleConfirm = async () => { … };

  return {
    books, chapters, pages,
    isLoadingBooks, isLoadingChapters, isLoadingPages,
    selectedBook, setSelectedBook,
    selectedChapter, setSelectedChapter,
    selectedPages,
    isImporting,
    togglePage,
    handleConfirm,
  };
};
```

Also in this phase:
- Remove `react-hook-form` from `ImportPagesModal.jsx` entirely.
- Replace the `Select` component's `register` prop with a plain `onChange`/`value` interface (or add an uncontrolled-friendly override).

**Files touched:** `ImportPagesModal.jsx`, new `hooks/useImportPages.js`.

---

### Phase 5 — Barrel Export
**Goal:** Clean up import paths across the codebase.

**New file:** `index.js`
```js
export { default } from "./ImportPagesModal";
```

Check all files that import `ImportPagesModal` and update the path.

**Files touched:** `index.js`, any file that imports `ImportPagesModal`.

---

## Final `ImportPagesModal.jsx` (target shape)

After all phases, the main file should look roughly like:

```jsx
const ImportPagesModal = ({ open, handleCloseModal }) => {
  const {
    books, chapters, pages,
    isLoadingBooks, isLoadingChapters, isLoadingPages,
    selectedBook, setSelectedBook,
    selectedChapter, setSelectedChapter,
    selectedPages, isImporting,
    togglePage, handleConfirm,
  } = useImportPages({ open, onClose: handleCloseModal });

  return (
    <Dialog …>
      <DialogTitle>…</DialogTitle>
      <Divider />
      <DialogContent>
        <Box sx={{ display: "flex", gap: 2 }}>
          <BookSelect … />
          <ChapterSelect … />
        </Box>
        {selectedChapter && (
          <PageGrid
            pages={pages}
            isLoading={isLoadingPages}
            selectedPages={selectedPages}
            onToggle={togglePage}
          />
        )}
      </DialogContent>
      <Divider />
      <DialogActions>
        <Button onClick={handleCloseModal}>Cancel</Button>
        <Button onClick={handleConfirm} disabled={…}>Confirm</Button>
      </DialogActions>
    </Dialog>
  );
};
```

---

## Phase Summary Table

| Phase | Goal                        | New Files                           | Risk   |
|-------|-----------------------------|-------------------------------------|--------|
| 1     | Quick wins (query keys, reset, label) | —                          | Low    |
| 2     | Extract `PageCard`          | `components/PageCard.jsx`           | Low    |
| 3     | Extract `PageGrid`          | `components/PageGrid.jsx`           | Low    |
| 4     | Extract `useImportPages`    | `hooks/useImportPages.js`           | Medium |
| 5     | Barrel export               | `index.js`                          | Low    |

---

## Open Question (verify before Phase 4)

**`Select` component interface**: The current `Select` uses `react-hook-form`'s `register`. When removing `react-hook-form` in Phase 4, decide whether to add `value`/`onChange` props to `Select` or replace it with a MUI `<Select>` directly in this modal.
