# Fix: Convert % to Pixels at Initialization

## The Problem

The API returns area coordinates as **percentages** (0-100). Previously, `initAreas()` stored these raw percentage values but rendering treated them as pixels. The conversion to real pixels only happened later when the image `onLoad` fired — causing areas to appear tiny and mispositioned between init and image load.

Additionally, the `@bmunozg/react-image-area` `<AreaSelector>` library has a bug: even when `unit="percentage"` is set, it internally treats values as pixels. So CSS `%` is not a viable workaround.

### Old (Broken) Flow

```
API (percentages)
      │
      ▼
initAreas()                    ← Stores { x: 50, y: 20, unit: "px" }
      │                           Values are %, but labeled as px
      ▼
First Render                   ← Displays: left: 50px  (WRONG)
      │
      ▼
Image onLoad                   ← recalculateAreas() converts to real px
      │
      ▼
Re-render                      ← Displays: left: 400px (CORRECT)
```

**Gap between init and onLoad = areas at wrong position.**

---

## The Solution

**Don't render areas until they have real pixel values.**

Instead of initializing `areas` state with unconverted percentage values, start with **empty arrays** and only populate them after the first image load provides the dimensions needed for conversion.

### New Flow

```
API (percentages)
      │
      ▼
useAreaManagement init
├─ areas = [ [], [], ... ]            ← Empty arrays (one per page)
├─ areasProperties = initAreasProperties(pages)   ← Metadata as before
└─ rawPagesRef stores pages           ← Keep raw API data for later conversion
      │
      ▼
First Render                          ← No areas to display (empty arrays)
      │                                  Image renders normally
      ▼
Image onLoad fires (all branches)
      │
      ▼
recalculateAreas()
├─ validateRefAccess() → gets clientWidth/clientHeight from DOM
├─ Active page areas empty? → initAreas() from rawPagesRef to build area objects
├─ processPageAreas() converts % → px using image dimensions
├─ Sets areas[activePage] with pixel values (_updated: true)
      │
      ▼
Re-render                             ← Displays areas with correct px from the start
```

**No gap. Areas only appear once they are correct.**

---

## Files Changed

### 1. `src/components/Studio/hooks/useAreaManagement.js`

This is the core change.

#### a) New import

```js
// BEFORE
import { processAreasForImageLoad } from "../services/coordinate.service";

// AFTER
import {
  validateRefAccess,
  processPageAreas,
} from "../services/coordinate.service";
```

We now call `validateRefAccess` and `processPageAreas` directly instead of the higher-level `processAreasForImageLoad` wrapper. This gives us control to build areas from raw data when the page is empty.

#### b) Deferred area initialization

```js
// BEFORE
const [areas, setAreas] = React.useState(() => initAreas(pages));

// AFTER
const rawPagesRef = React.useRef(pages);
const [areas, setAreas] = React.useState(() => pages.map(() => []));
```

- `rawPagesRef` stores the original API pages so `recalculateAreas` can build areas later.
- `areas` starts as empty arrays — one per page, no unconverted percentages.
- `areasProperties` is unchanged — metadata doesn't need pixel conversion.

#### c) Updated `recalculateAreas`

```js
const recalculateAreas = () => {
  setAreas((prevState) => {
    const refValidation = validateRefAccess(studioEditorRef);
    if (!refValidation.isValid) return prevState;

    const { dimensions } = refValidation;
    const newAreas = [...prevState];
    const activePageAreas = newAreas[activePageIndex];

    // First load: page has no areas yet — build from raw API data + convert
    if (
      (!activePageAreas || activePageAreas.length === 0) &&
      rawPagesRef.current[activePageIndex]?.blocks?.length
    ) {
      const rawAreas = initAreas([rawPagesRef.current[activePageIndex]])[0];
      newAreas[activePageIndex] = processPageAreas(
        rawAreas,
        areasProperties[activePageIndex],
        dimensions
      );
      return newAreas;
    }

    // Subsequent calls (zoom, virtual blocks): reconvert existing areas
    if (activePageAreas?.length) {
      newAreas[activePageIndex] = processPageAreas(
        activePageAreas,
        areasProperties[activePageIndex],
        dimensions
      );
    }

    return newAreas;
  });
};
```

Two paths:
1. **First load** (empty array): builds area objects from `rawPagesRef` via `initAreas()`, then converts % → px via `processPageAreas()` — all in one state update.
2. **Subsequent** (zoom/VB toggle): reconverts existing areas using stored `_percentX/_percentY` metadata — same as before.

### 2. `src/components/Studio/StudioAreaSelector/StudioAreaSelector.jsx`

One line change: uncommented `onLoad={onImageLoad}` in the `<AreaSelector>` branch.

```jsx
// BEFORE
<img
  ...
  // onLoad={onImageLoad}
/>

// AFTER
<img
  ...
  onLoad={onImageLoad}
/>
```

**Why**: Since areas now start empty, every rendering branch needs `onImageLoad` to trigger `recalculateAreas` and populate areas. Previously the AreaSelector branch skipped this because areas were pre-populated with percentage values. Now all branches need it.

---

## What Changed vs What Stayed The Same

| Component | Changed? | Details |
| --------- | -------- | ------- |
| `useAreaManagement.js` | **YES** | Empty init, rawPagesRef, updated recalculateAreas |
| `StudioAreaSelector.jsx` | **YES** | Uncommented onLoad in AreaSelector branch |
| `initAreas()` | NO | Still used, but called inside recalculateAreas, not at init |
| `initAreasProperties()` | NO | Metadata init unchanged |
| `coordinate.service.js` | NO | Conversion logic unchanged |
| `coordinates.js` | NO | Utility functions unchanged |
| `Studio.jsx` | NO | Same props, same effects |

---

## Edge Cases

### 1. Page navigation

When user navigates to a new page, `activePageIndex` changes. The new page image triggers `onLoad` → `recalculateAreas()` detects empty array → builds + converts from `rawPagesRef`.

### 2. Zoom change

The existing zoom effect in `Studio.jsx` resets `_updated: false` and calls `recalculateAreas`. This still works because areas are already populated at that point (zoom only happens after image is loaded).

### 3. Virtual blocks toggle

Same as zoom — happens after initial load, so areas are already populated with pixel values.

### 4. AreaSelector (studio mode)

Now that `onLoad={onImageLoad}` is enabled, the AreaSelector branch also triggers `recalculateAreas` on image load. Areas are built from raw data and converted to pixels. Since the library treats all values as pixels regardless of the `unit` prop (the library bug), passing pixel values actually works correctly.

### 5. New areas drawn by user

When a user draws a new area in AreaSelector, `onChangeArea` is called. These areas are created after the image is loaded, so they don't need the init-time fix.
