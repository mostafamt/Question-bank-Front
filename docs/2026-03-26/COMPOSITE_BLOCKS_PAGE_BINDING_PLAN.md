# Composite Blocks — Page Binding Plan

## Goal

Attach composite blocks to a specific page so that when the user navigates between pages only the blocks belonging to the active page are shown. Submission must include the `pageId` so the backend can associate a composite block with the correct page.

---

## Current State

```
compositeBlocks = {
  name: string,
  type: string,
  areas: Area[],
}
```

- Single object, no page association.
- All areas from all pages live together in one state.
- `onSubmitCompositeBlocks` sends `chapterId` but no `pageId`.

---

## Target State

```
compositeBlocks = [
  // index 0 → page 0
  { name: string, type: string, areas: Area[] },
  // index 1 → page 1
  { name: string, type: string, areas: Area[] },
  ...
]
```

- Array indexed by page, exactly like `areasProperties`.
- Active page's block is `compositeBlocks[activePageIndex]`.
- Each page starts with a fresh `initCompositeBlocks()` value.
- Submission sends `pageId = pages[activePageIndex]._id`.

---

## Files to Change

| File | Change |
|---|---|
| `initializers/index.js` | Add `initCompositeBlocksForPages(pages)` helper |
| `hooks/useCompositeBlocks.js` | Accept `activePageIndex` + `pages`; make all operations page-scoped |
| `hooks/useCompositeBlocks.js` | Pass `pageId` in submit payload |
| `Studio.jsx` | Pass `activePageIndex` and `pages` to `useCompositeBlocks` |
| `StudioCompositeBlocks/StudioCompositeBlocks.jsx` | Receive single-page slice (no change in rendering logic) |
| `columns/index.js` + `hooks/useStudioColumns.js` | Pass active-page slice of `compositeBlocks` down |
| `services/api.js` | Add `pageId` to `saveCompositeBlocks` payload (already passed in data object — no signature change needed) |

---

## Step-by-Step Implementation

### Step 1 — `initializers/index.js`

Add a helper that creates one `initCompositeBlocks()` per page:

```js
export const initCompositeBlocksForPages = (pages = []) =>
  pages.map(() => initCompositeBlocks());
```

---

### Step 2 — `hooks/useCompositeBlocks.js`

#### 2a. New parameters

```js
const useCompositeBlocks = ({
  canvasRef,
  studioEditorRef,
  language,
  chapterId,
  openModal,
  pages,
  activePageIndex,      // ← NEW
  areasProperties,
  compositeBlocksTypes,
}) => {
```

#### 2b. State shape change

```js
// Before
const [compositeBlocks, setCompositeBlocks] = React.useState(initCompositeBlocks);

// After
const [compositeBlocks, setCompositeBlocks] = React.useState(() =>
  initCompositeBlocksForPages(pages)
);
```

Keep the ref in sync the same way:
```js
const compositeBlocksRef = React.useRef(compositeBlocks);
React.useEffect(() => {
  compositeBlocksRef.current = compositeBlocks;
}, [compositeBlocks]);
```

When `pages` length changes (e.g., page added/removed), reset:
```js
React.useEffect(() => {
  setCompositeBlocks(initCompositeBlocksForPages(pages));
}, [pages.length]);
```

#### 2c. `onChangeCompositeBlocks` — scope to active page

```js
const onChangeCompositeBlocks = (id, key, value) => {
  setCompositeBlocks((prev) => {
    const updated = [...prev];
    const page = { ...updated[activePageIndex] };

    if (!id) {
      // Changing name or type — reset areas for this page only
      page[key] = value;
      page.areas = [];
    } else {
      page.areas = page.areas.map((item) =>
        item.id === id ? { ...item, [key]: value } : item
      );
    }

    updated[activePageIndex] = page;
    return updated;
  });
};
```

#### 2d. `DeleteCompositeBlocks` — scope to active page

```js
const DeleteCompositeBlocks = (id) => {
  setCompositeBlocks((prev) => {
    const updated = [...prev];
    const page = { ...updated[activePageIndex] };
    page.areas = page.areas.filter((item) => item.id !== id);
    updated[activePageIndex] = page;
    return updated;
  });
};
```

#### 2e. `processCompositeBlock` — read from active page's areas

```js
const selecedBlock = compositeBlocks[activePageIndex].areas.find(
  (item) => item.id === id
);
```

Set loading/result scoped to active page — use the same `onChangeCompositeBlocks` helper (already page-scoped after 2c).

#### 2f. `onSubmitCompositeBlocks` — add `pageId`

```js
const onSubmitCompositeBlocks = async () => {
  setLoadingSubmitCompositeBlocks(true);
  const current = compositeBlocksRef.current[activePageIndex]; // ← active page slice
  const pageId = pages[activePageIndex]?._id;                  // ← NEW

  const blocks = await Promise.all(
    current.areas.map(async ({ type, text, img, x, y, width, height, unit }) => {
      const labelType = getTypeOfLabelForCompositeBlocks(
        compositeBlocksTypes, current.type, type
      );
      let contentValue = text;
      if (labelType === "image" && img) {
        contentValue = await uploadForStudio(img);
      }
      return {
        contentType: type,
        contentValue,
        coordinates: {
          height,
          unit: unit === "%" ? "percentage" : "px",
          width, x, y,
        },
      };
    })
  );

  const data = {
    name: current.name,
    type: current.type,
    chapterId,
    pageId,              // ← NEW
    blocks,
  };

  const response = await saveCompositeBlocks(data);
  if (response) {
    // Reset only the active page's composite block, not all pages
    setCompositeBlocks((prev) => {
      const updated = [...prev];
      updated[activePageIndex] = initCompositeBlocks();
      return updated;
    });
  }

  setLoadingSubmitCompositeBlocks(false);
};
```

#### 2g. `onChangeCompositeBlockArea` — scope to active page

```js
const onChangeCompositeBlockArea = (areasParam) => {
  setCompositeBlocks((prev) => {
    const updated = [...prev];
    updated[activePageIndex] = addPropsToAreasForCompositeBlocks(
      updated[activePageIndex],
      areasParam
    );
    return updated;
  });
};
```

#### 2h. `onClickHand` — read and write active page

```js
// Use compositeBlocksRef.current[activePageIndex] for the stale-closure-safe read
const currentCompositeBlocks = compositeBlocksRef.current[activePageIndex];
```

Adding a new area:
```js
setCompositeBlocks((prev) => {
  const updated = [...prev];
  const page = { ...updated[activePageIndex] };
  page.areas = [...page.areas, newArea];
  updated[activePageIndex] = page;
  return updated;
});
```

#### 2i. Expose active-page slice to consumers

Add a derived value returned from the hook:

```js
const activeCompositeBlock = compositeBlocks[activePageIndex] ?? initCompositeBlocks();

return {
  compositeBlocks,           // full array (needed by modal for color tracking)
  activeCompositeBlock,      // ← NEW: current page slice for StudioCompositeBlocks UI
  setCompositeBlocks,
  ...
};
```

---

### Step 3 — `Studio.jsx`

Pass `activePageIndex` and `pages` to the hook:

```js
const {
  compositeBlocks,
  activeCompositeBlock,    // ← destructure new value
  ...
} = useCompositeBlocks({
  canvasRef,
  studioEditorRef,
  language,
  chapterId,
  openModal,
  pages,
  activePageIndex,         // ← pass active page index
  areasProperties,
  compositeBlocksTypes,
});
```

Pass `activeCompositeBlock` (not the full array) down to column/UI props wherever `compositeBlocks` was used for display:

```js
// In rightColumnProps / useStudioColumns props:
compositeBlocks: activeCompositeBlock,   // UI gets single-page slice
compositeBlocksAll: compositeBlocks,     // Modal gets full array for color tracking
```

Or alternatively pass `compositeBlocks[activePageIndex]` directly — either approach is fine.

---

### Step 4 — `StudioCompositeBlocks/StudioCompositeBlocks.jsx`

No changes needed to rendering logic. The component already receives a single `compositeBlocks` object with `{ name, type, areas }`. It will now receive the active-page slice automatically.

---

### Step 5 — `CompositeBlocksModal` (color tracking)

The modal uses `compositeBlocks.areas` to build color maps. It should receive the **active page's** composite block, which is already the case after Step 3. No change required.

---

### Step 6 — Backend (`services/api.js`)

No signature change needed — `saveCompositeBlocks(data)` already forwards whatever is in `data`. The `pageId` field added in Step 2f will be included automatically.

---

## Data Flow Summary (after changes)

```
pages: [page0, page1, page2, ...]
activePageIndex: 1

compositeBlocks (full array):
  [0] { name, type, areas: [...] }   ← page 0 — preserved while user is on page 1
  [1] { name, type, areas: [...] }   ← page 1 — ACTIVE, shown in UI
  [2] { name, type, areas: [] }      ← page 2 — empty

activeCompositeBlock = compositeBlocks[activePageIndex]
  → { name, type, areas: [...] }     ← passed to StudioCompositeBlocks

onSubmit sends:
  { name, type, chapterId, pageId: pages[1]._id, blocks: [...] }
```

---

## Edge Cases

| Case | Handling |
|---|---|
| User navigates to a page with no composite blocks | `initCompositeBlocks()` value shown (empty name, empty type, no areas) |
| Pages array grows (new page added) | `useEffect` on `pages.length` reinitializes the full array |
| User submits then stays on the same page | Only active page entry is reset; other pages untouched |
| `pages[activePageIndex]` is undefined | Guard with `?._id` — submit is disabled until a type is selected anyway |
| `onClickHand` stale closure | Already handled by `compositeBlocksRef` — access `compositeBlocksRef.current[activePageIndex]` |
