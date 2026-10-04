# Areas Flow: From Fetching to Display

## Overview

Areas use a **dual-unit coordinate system**:

- **Storage / API**: Percentage-based (resolution-independent, 0-100)
- **Display**: Pixel-based (actual screen coordinates)

Conversion from percentage to pixels happens **after** the page image loads, because pixel values depend on the rendered image dimensions.

---

## Flow Diagram

```
API Response (percentage coordinates)
       │
       ▼
useAreaManagement init
├─ areas = [ [], [], ... ]               ← Empty arrays (one per page)
├─ areasProperties = initAreasProperties()  ← Metadata populated normally
└─ rawPagesRef = pages                   ← Raw API data stored for later
       │
       ▼
First Render                             ← No areas displayed (empty arrays)
       │                                    Image renders normally
       ▼
Image onLoad event fires
       │
       ▼
recalculateAreas()
├─ validateRefAccess()                   ← Gets clientWidth/clientHeight from DOM
├─ initAreas(rawPagesRef[page])          ← Builds area objects from raw API data
└─ processPageAreas()                    ← Converts % → px in one step
       │
       ▼
Re-render                                ← Areas appear with correct px values
```

---

## Step-by-Step

### 1. Fetching — `src/api/bookapi.js`

`getChapterPages(id)` returns pages with nested `blocks`, each containing `coordinates`:

```json
{
  "blocks": [
    {
      "blockId": "uuid",
      "coordinates": {
        "x": 50,
        "y": 20,
        "width": 30,
        "height": 15,
        "unit": "percentage"
      }
    }
  ]
}
```

All coordinate values are **percentages** (0-100).

---

### 2. Initialization — `src/components/Studio/initializers/index.js`

Two parallel arrays are built from the API response:

#### `initAreas(pages)` — Coordinate data

```js
{
  id: block.blockId,
  x: block.coordinates.x,           // 50 (percentage value)
  y: block.coordinates.y,           // 20 (percentage value)
  width: block.coordinates.width,   // 30 (percentage value)
  height: block.coordinates.height, // 15 (percentage value)
  unit: "px",                       // ← Declared as pixels
  _unit: block.coordinates.unit,    // ← "percentage" (original unit)
  _updated: false,                  // ← Not yet converted
  name: block.objectName,
}
```

#### `initAreasProperties(pages)` — Metadata

```js
{
  id: uuidv4(),
  blockId: block.blockId,
  x, y, width, height,              // Same percentage values
  contentType, text, label, type, color,
  order, isServer: "true",
}
```

`initAreas()` is no longer called at state init time. Instead, `areas` starts as empty arrays. `initAreas()` is called later inside `recalculateAreas()` when the image loads and dimensions are available.

---

### 3. Rendering — `src/components/Studio/StudioAreaSelector/StudioAreaSelector.jsx`

The component renders areas in multiple modes. Since areas start as empty arrays, nothing renders until `onImageLoad` populates them with correct pixel values.

All rendering branches use `px` units:

```jsx
<button style={{
  position: "absolute",
  top: `${area.y}px`,
  left: `${area.x}px`,
  width: `${area.width}px`,
  height: `${area.height}px`,
}} />
```

All branches (including the `<AreaSelector>` branch) now have `onLoad={onImageLoad}` to trigger conversion.

---

### 4. Pixel Conversion — Triggered by Image Load

#### Entry point: `useAreaManagement.recalculateAreas()`

**File**: `src/components/Studio/hooks/useAreaManagement.js`

Called when:

| Trigger                  | Source                     |
| ------------------------ | -------------------------- |
| Image `onLoad`           | `StudioAreaSelector.jsx`   |
| Zoom change              | `Studio.jsx` (useEffect)   |
| Virtual blocks toggle    | `useAreaManagement.js`     |

#### How `recalculateAreas` works now

Two paths inside `recalculateAreas()`:

**Path 1 — First load (empty array)**:
```
validateRefAccess() → dimensions
       │
       ▼
initAreas(rawPagesRef[activePage])     ← Build area objects from stored raw API data
       │
       ▼
processPageAreas(rawAreas, props, dimensions)  ← Convert % → px
       │
       ▼
setAreas() with pixel values           ← _updated: true
```

**Path 2 — Subsequent (zoom, virtual blocks)**:
```
validateRefAccess() → NEW dimensions
       │
       ▼
processPageAreas(existingAreas, props, dimensions)  ← Reconvert from _percentX/_percentY
       │
       ▼
setAreas() with updated pixel values
```

#### Conversion internals (unchanged)

**File**: `src/components/Studio/services/coordinate.service.js`

1. **`validateRefAccess(studioEditorRef)`** — Extracts `clientWidth`, `clientHeight`, `naturalWidth`, `naturalHeight` from the rendered `<img>` DOM element.
2. **`shouldConvertArea(area)`** — Returns `true` if `area._unit === "percentage"`.
3. **`getOriginalPercentageCoords(area, properties)`** — Retrieves percentage values from `_percentX/_percentY` or falls back to areasProperties.
4. **`convertPercentageToPixels(area, dimensions)`** — `pixel = (percent / 100) * dimension`
5. **`preserveMetadata(original, converted)`** — Keeps `_unit`, `_percentX`, etc.

---

### 5. Re-conversion (Zoom / Virtual Blocks)

When the image dimensions change (zoom in/out, virtual blocks toggle), areas must be re-converted:

```
Zoom change
    │
    ▼
useEffect resets _updated: false on all areas of active page
    │
    ▼
setTimeout → recalculateAreas()
    │
    ▼
processPageAreas() reads NEW clientWidth/clientHeight
    │
    ▼
Reconverts from stored _percentX/_percentY values
```

This ensures areas always match the current rendered image size.

---

## Fix Applied: Deferred Initialization

### The Problem

Areas had incorrect dimensions on init because `initAreas()` stored percentage values (e.g. `x: 50`) labeled as `unit: "px"`. The rendering displayed `left: 50px` when it should have been 50% of image width. The `react-image-area` library also has a bug where `unit="percentage"` is treated as pixels.

### The Fix

**Don't render areas until they have real pixel values.**

| Phase | Old behavior | New behavior |
| ----- | ------------ | ------------ |
| Init | `areas = initAreas(pages)` → wrong px values | `areas = [ [], ... ]` → nothing rendered |
| Image load | reconvert existing areas | build from `rawPagesRef` + convert in one step |
| Display | flash of wrong positions | areas appear only with correct px |

See `docs/2026-02-12/AREAS_FIX_PLAN.md` for full implementation details.

---

## Key Files

| File | Role |
| ---- | ---- |
| `src/api/bookapi.js` | Fetches pages with blocks (percentage coordinates) |
| `src/components/Studio/initializers/index.js` | `initAreas()`, `initAreasProperties()` — builds initial state |
| `src/utils/coordinates.js` | `convertPercentageToPixels()`, `convertPixelsToPercentage()`, `preserveMetadata()` |
| `src/components/Studio/services/coordinate.service.js` | `processAreasForImageLoad()`, `validateRefAccess()`, `shouldConvertArea()` |
| `src/components/Studio/hooks/useAreaManagement.js` | `recalculateAreas()` — triggers and applies conversion |
| `src/components/Studio/Studio.jsx` | Main component, zoom effects, state setup |
| `src/components/Studio/StudioAreaSelector/StudioAreaSelector.jsx` | Renders areas, fires `onImageLoad` |
| `src/components/Studio/utils/coordinateUtils.js` | Legacy conversion helpers |
