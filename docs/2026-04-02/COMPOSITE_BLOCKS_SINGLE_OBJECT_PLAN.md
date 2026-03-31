# Plan: CompositeBlocks — Single Object for All Pages

**Date:** 2026-03-31  
**Branch:** IBook-2-development

---

## Problem

Currently `useCompositeBlocks` holds `compositeBlocks` as an **array**, one entry per page:

```js
// current shape
[
  { name: "CB-abc", type: "", areas: [] },  // page 0
  { name: "CB-def", type: "", areas: [] },  // page 1
  { name: "CB-ghi", type: "", areas: [] },  // page 2
]
```

This means every page has its own independent composite block object (its own `name`, `type`, and `areas`). The user wants a **single** composite block object shared across all pages, where each area (block) carries a `pageIndex` to identify which page it belongs to.

---

## Goal

A single composite block object:

```js
// target shape
{
  name: "CB-xyz",
  type: "SomeType",
  areas: [
    { id: "...", pageIndex: 0, x, y, width, height, ... },
    { id: "...", pageIndex: 2, x, y, width, height, ... },
  ]
}
```

- `name` and `type` are global — shared across all pages.
- Every area has a `pageIndex` field that anchors it to a specific page.
- The UI for the active page shows only areas where `area.pageIndex === activePageIndex`.
- Submitting saves all areas across all pages (one API call per page that has areas), then resets the entire single object.

---

## Files to Change

| File | Change |
|---|---|
| `src/components/Studio/initializers/index.js` | Remove `initCompositeBlocksForPages`; `initCompositeBlocks` stays as-is |
| `src/components/Studio/hooks/useCompositeBlocks.js` | Main refactor — all state/logic moves to single object |
| `src/components/Studio/StudioCompositeBlocks/StudioCompositeBlocks.jsx` | Receives `activeCompositeBlock` (unchanged API from component perspective) |

---

## Detailed Changes

### 1. `initializers/index.js`

Remove `initCompositeBlocksForPages` entirely (it only exists to create one object per page).

```js
// DELETE this:
export const initCompositeBlocksForPages = (pages = []) =>
  pages.map(() => initCompositeBlocks());
```

`initCompositeBlocks()` stays unchanged — it already returns the correct single-object shape.

---

### 2. `useCompositeBlocks.js` — State shape

Change from array state to single object state:

```js
// BEFORE
const [compositeBlocks, setCompositeBlocks] = React.useState(() =>
  initCompositeBlocksForPages(pages)
);

// AFTER
const [compositeBlocks, setCompositeBlocks] = React.useState(() =>
  initCompositeBlocks()
);
```

Remove the `pagesLengthRef` effect that re-initialises on page count change — it no longer applies since there is no per-page object to add.

---

### 3. `activeCompositeBlock` — computed view for the UI

```js
// BEFORE
const activeCompositeBlock =
  compositeBlocks[activePageIndex] ?? initCompositeBlocks();

// AFTER
const activeCompositeBlock = {
  ...compositeBlocks,
  areas: compositeBlocks.areas.filter(
    (area) => area.pageIndex === activePageIndex
  ),
};
```

The UI component (`StudioCompositeBlocks`) already receives `activeCompositeBlock` — its API is unchanged.

---

### 4. `onChangeCompositeBlocks(id, key, value)`

```js
// BEFORE — indexed into the array by activePageIndex
const onChangeCompositeBlocks = (id, key, value) => {
  setCompositeBlocks((prev) => {
    const updated = [...prev];
    const page = { ...updated[activePageIndex] };
    if (!id) {
      page[key] = value;
      page.areas = [];
    } else {
      page.areas = page.areas.map(...);
    }
    updated[activePageIndex] = page;
    return updated;
  });
};

// AFTER — operates on the single object
const onChangeCompositeBlocks = (id, key, value) => {
  setCompositeBlocks((prev) => {
    if (!id) {
      // Changing name or type — clear ALL areas across ALL pages
      return {
        ...prev,
        [key]: value,
        areas: [],
      };
    }
    return {
      ...prev,
      areas: prev.areas.map((item) =>
        item.id === id ? { ...item, [key]: value } : item
      ),
    };
  });
};
```

**Note:** When `id` is `null` (changing `name` or `type`), all areas across all pages are wiped — `areas: []`. Since `name` and `type` are global to the single object, changing either one invalidates every area regardless of which page it belongs to.

---

### 5. `DeleteCompositeBlocks(id)`

```js
// BEFORE
const DeleteCompositeBlocks = (id) => {
  setCompositeBlocks((prev) => {
    const updated = [...prev];
    const page = { ...updated[activePageIndex] };
    page.areas = page.areas.filter((item) => item.id !== id);
    updated[activePageIndex] = page;
    return updated;
  });
};

// AFTER — areas live in a flat array; filter by id directly
const DeleteCompositeBlocks = (id) => {
  setCompositeBlocks((prev) => ({
    ...prev,
    areas: prev.areas.filter((item) => item.id !== id),
  }));
};
```

---

### 6. `processCompositeBlock(id, typeOfLabel)`

Two updates needed:

**a) Set loading:**
```js
// BEFORE
page.areas = page.areas.map((item) =>
  item.id === id ? { ...item, loading: true } : item
);
updated[activePageIndex] = page;

// AFTER
areas: prev.areas.map((item) =>
  item.id === id ? { ...item, loading: true } : item
)
```

**b) Find the selected block for coordinates:**
```js
// BEFORE
const selectedBlock = compositeBlocksRef.current[activePageIndex].areas.find(
  (item) => item.id === id
);

// AFTER
const selectedBlock = compositeBlocksRef.current.areas.find(
  (item) => item.id === id
);
```

**c) Set result (img/text):**
```js
// BEFORE — indexed
page.areas = page.areas.map(...);
updated[activePageIndex] = page;

// AFTER — flat map by id
areas: prev.areas.map((item) =>
  item.id === id ? { ...item, loading: false, img, text } : item
)
```

---

### 7. `onSubmitCompositeBlocks()`

Submit **all** areas across **all** pages in a single call. Areas are grouped by `pageIndex` and each group produces one API call (one `saveCompositeBlocks` per page that has areas). After all calls succeed the entire `areas` array is cleared and the single object resets.

```js
// BEFORE
const current = compositeBlocksRef.current[activePageIndex];
const pageId = pages[activePageIndex]?._id;
// ... builds blocks from current.areas only ...
// On success: updated[activePageIndex] = initCompositeBlocks();

// AFTER
const current = compositeBlocksRef.current;

// Group areas by pageIndex
const areasByPage = current.areas.reduce((acc, area) => {
  const pi = area.pageIndex;
  if (!acc[pi]) acc[pi] = [];
  acc[pi].push(area);
  return acc;
}, {});

// One saveCompositeBlocks call per page that has areas
await Promise.all(
  Object.entries(areasByPage).map(async ([pageIndexStr, pageAreas]) => {
    const pi = Number(pageIndexStr);
    const pageId = pages[pi]?._id;

    const blocks = await Promise.all(
      pageAreas.map(async ({ type, text, img, x, y, width, height, unit }) => {
        const labelType = getTypeOfLabelForCompositeBlocks(
          compositeBlocksTypes,
          current.type,
          type
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
            width,
            x,
            y,
          },
        };
      })
    );

    return saveCompositeBlocks({
      name: current.name,
      type: current.type,
      chapterId,
      pageId,
      blocks,
    });
  })
);

// On success: reset the entire single object
setCompositeBlocks(initCompositeBlocks());
```

**Key differences from before:**
- Submission is no longer scoped to `activePageIndex` — all pages' areas are sent.
- One `saveCompositeBlocks` request is made per page that has at least one area.
- On success the whole single object is reset (not just one page slot).

---

### 8. `onChangeCompositeBlockArea(areasParam)`

New areas must be tagged with `pageIndex`:

```js
// BEFORE
setCompositeBlocks((prev) => {
  const updated = [...prev];
  updated[activePageIndex] = addPropsToAreasForCompositeBlocks(
    updated[activePageIndex],
    areasParam
  );
  return updated;
});

// AFTER
setCompositeBlocks((prev) => {
  // Build the active-page view to pass into addPropsToAreasForCompositeBlocks
  const activeView = {
    ...prev,
    areas: prev.areas.filter((a) => a.pageIndex === activePageIndex),
  };
  const updated = addPropsToAreasForCompositeBlocks(activeView, areasParam);
  // updated.areas now contains only active-page areas (possibly with new ones added)
  // Tag any new areas with pageIndex
  const updatedAreas = updated.areas.map((a) =>
    a.pageIndex === undefined ? { ...a, pageIndex: activePageIndex } : a
  );
  // Merge: keep other pages' areas + updated active-page areas
  return {
    ...prev,
    areas: [
      ...prev.areas.filter((a) => a.pageIndex !== activePageIndex),
      ...updatedAreas,
    ],
  };
});
```

---

### 9. `onClickHand()` — adding an area from the hand picker

```js
// BEFORE
const currentCompositeBlocks = compositeBlocksRef.current[activePageIndex];
// ...
setCompositeBlocks((prev) => {
  const updated = [...prev];
  const page = { ...updated[activePageIndex] };
  page.areas = [...page.areas, newArea];
  updated[activePageIndex] = page;
  return updated;
});

// AFTER
const currentCompositeBlocks = {
  ...compositeBlocksRef.current,
  areas: compositeBlocksRef.current.areas.filter(
    (a) => a.pageIndex === activePageIndex
  ),
};
// pass currentCompositeBlocks to modal (unchanged)
// ...
const newArea = {
  // ... existing fields ...
  pageIndex: activePageIndex,   // <-- NEW
};

setCompositeBlocks((prev) => ({
  ...prev,
  areas: [...prev.areas, newArea],
}));
```

---

### 10. `compositeBlocksRef` sync

No change needed — the ref always mirrors the state:

```js
const compositeBlocksRef = React.useRef(compositeBlocks);
React.useEffect(() => {
  compositeBlocksRef.current = compositeBlocks;
}, [compositeBlocks]);
```

---

## What Does NOT Change

- `StudioCompositeBlocks.jsx` — receives `activeCompositeBlock` with the same shape `{ name, type, areas }`. No changes needed except the submit button disabled condition (see below).
- `initCompositeBlocks()` — unchanged.
- `saveCompositeBlocks` API call shape — unchanged.
- All modal interactions — unchanged.

### Submit button disabled condition (`StudioCompositeBlocks.jsx`)

The submit button must be enabled as long as **any** area exists across any page — not just the active page. The component currently checks `activeCompositeBlock.areas.length === 0`, which would disable the button on pages that have no areas even when other pages do.

Pass the full `compositeBlocks` object (or a total count) as an extra prop so the button reflects the global state:

```jsx
// BEFORE — disabled when active page has no areas
disabled={compositeBlocks.areas.length === 0 || loadingSubmitCompositeBlocks}

// AFTER — disabled only when no areas exist anywhere
disabled={totalAreas === 0 || loadingSubmitCompositeBlocks}
```

`totalAreas` is passed as a new prop from the hook:

```js
// in useCompositeBlocks return value
totalAreas: compositeBlocks.areas.length,
```

And forwarded through the parent to `StudioCompositeBlocks`.

---

## Migration / Edge Cases

| Scenario | Behaviour |
|---|---|
| User changes `name` or `type` on any page | Clears **all** areas across all pages (`areas: []`) — `name`/`type` are global so all existing areas are invalidated |
| User submits from any page (even one with no areas) | **All** areas across all pages are sent; submit button is enabled as long as at least one area exists anywhere |
| User deletes an area | Area is removed from the flat array regardless of which page it's on (same as before since id is unique) |
| Pages added/removed | No re-init needed — single object just retains its areas (areas for removed pages become orphaned but harmless) |

---

## Summary of Removed Code

- `initCompositeBlocksForPages` (initializers)
- `pagesLengthRef` and its `useEffect` (hook)
- All `updated[activePageIndex]` / `updated = [...prev]` patterns (hook)
