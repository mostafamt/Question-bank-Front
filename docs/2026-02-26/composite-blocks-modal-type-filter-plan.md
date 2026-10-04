# Plan: Filter Modal Objects by Composite Block Type

## Overview

When the user clicks the **hand tool** to open the object-selection modal, the list of
selectable blocks must be filtered based on the selected **composite block type**.

Currently the modal always shows **Questions** and **Illustrative objects**.
The new behaviour: only show the object types that are referenced by the composite
block type's labels.

### Concrete example

| Composite block type | Label → internal type | Allowed objects in modal |
|----------------------|-----------------------|--------------------------|
| `Exercise`           | `Question → QObject`  | **Questions only**        |
| (type with `Object`) | `Something → Object`  | **Illustrative objects**  |
| Both `QObject` + `Object` | both present    | Both                     |
| No type selected     | —                     | All (Questions + Illustrative objects) |

**Rule:**
- A label whose internal type is `"QObject"` → the modal shows `"Question"` blocks
- A label whose internal type is `"Object"` → the modal shows `"Illustrative object"` blocks
- Both present → both shown
- No composite type selected → fallback: show all

---

## Data Shape Recap

`compositeBlocksTypes` (fetched from API `/composite-object-types`):
```json
{
  "labels": [
    {
      "typeName": "Exercise",
      "labels": [
        { "Question": "QObject" }
      ]
    },
    {
      "typeName": "SomeOtherType",
      "labels": [
        { "Object": "Object" },
        { "Text": "text" }
      ]
    }
  ]
}
```

Utility functions already in `src/utils/studio.js`:
- `getList2FromData(compositeBlocksTypes, typeName)` → `["Question", ...]` (label display names)
- `getTypeOfLabelForCompositeBlocks(compositeBlocksTypes, typeName, label)` → `"QObject" | "Object" | "text" | "image"`

---

## Files to Change

### 1. `src/components/Studio/Studio.jsx`

**A) Pass `compositeBlocksTypes` into `useCompositeBlocks`**

```javascript
} = useCompositeBlocks({
  canvasRef,
  studioEditorRef,
  language,
  chapterId,
  openModal,
  pages,
  areasProperties,
  compositeBlocksTypes, // ← add this
});
```

---

### 2. `src/components/Studio/hooks/useCompositeBlocks.js`

**A) Accept `compositeBlocksTypes` in the hook parameters**

```javascript
const useCompositeBlocks = ({
  canvasRef,
  studioEditorRef,
  language,
  chapterId,
  openModal,
  pages,
  areasProperties,
  compositeBlocksTypes, // ← add this
}) => {
```

**B) Pass `compositeBlocksTypes` and current `compositeBlocks.type` to the modal**

In `onClickHand`:

```javascript
openModal("composite-blocks-modal", {
  onSelectObject: (blockId) => { /* unchanged */ },
  compositeBlocks,
  compositeBlocksTypes, // ← add this
  pages,
  areasProperties,
});
```

---

### 3. `src/components/Modal/CompositeBlocksModal/CompositeBlocksModal.jsx`

**A) Accept new props**

```javascript
const {
  handleCloseModal,
  onSelectObject,
  compositeBlocks,
  compositeBlocksTypes, // ← add this
  pages,
  areasProperties,
} = props;
```

**B) Compute `allowedAreaTypes` from the selected composite block type**

Import the utility functions:
```javascript
import {
  getList2FromData,
  getTypeOfLabelForCompositeBlocks,
} from "../../../utils/studio";
```

Add a new `useMemo`:
```javascript
const allowedAreaTypes = useMemo(() => {
  if (!compositeBlocksTypes || !compositeBlocks?.type) {
    // No type selected → show all
    return ["Question", "Illustrative object"];
  }

  const labels = getList2FromData(compositeBlocksTypes, compositeBlocks.type);
  const allowed = new Set();

  labels.forEach((label) => {
    const internalType = getTypeOfLabelForCompositeBlocks(
      compositeBlocksTypes,
      compositeBlocks.type,
      label
    );
    if (internalType === "QObject") allowed.add("Question");
    if (internalType === "Object") allowed.add("Illustrative object");
  });

  // Fallback: if the type has no Object/QObject labels, show all
  return allowed.size > 0 ? [...allowed] : ["Question", "Illustrative object"];
}, [compositeBlocksTypes, compositeBlocks?.type]);
```

**C) Update `selectableAreas` to use `allowedAreaTypes`**

```javascript
const selectableAreas = useMemo(() => {
  if (!areasProperties || !Array.isArray(areasProperties)) return [];
  return areasProperties.map((pageAreas) => {
    if (!Array.isArray(pageAreas)) return [];
    return pageAreas.filter(
      (area) => area.blockId && allowedAreaTypes.includes(area.type)
    );
  });
}, [areasProperties, allowedAreaTypes]);
```

---

## No Other Changes Needed

- `StudioAreaSelector.jsx` — no changes
- `StudioCompositeBlocks.jsx` — no changes
- `Modal.jsx` (registry) — no changes
- `styling.service.js` — no changes
- `studio.js` utility functions — no changes (already have the helpers needed)

---

## Data Flow

```
compositeBlocksTypes (API)
  └─→ Studio.jsx
        └─→ useCompositeBlocks({ compositeBlocksTypes })
              └─→ onClickHand() → openModal("composite-blocks-modal", {
                    compositeBlocks,       ← contains .type ("Exercise")
                    compositeBlocksTypes,  ← full type definitions
                    pages,
                    areasProperties,
                  })
                    ↓
              CompositeBlocksModal
                ├─ allowedAreaTypes = computed from compositeBlocks.type + compositeBlocksTypes
                │    e.g. "Exercise" → ["QObject"] → ["Question"]
                └─ selectableAreas filtered by allowedAreaTypes
                     → only Question blocks shown for Exercise type
```

---

## Summary of Changes

| File | Change |
|------|--------|
| `Studio.jsx` | Pass `compositeBlocksTypes` to `useCompositeBlocks` |
| `useCompositeBlocks.js` | Accept `compositeBlocksTypes`; pass it to modal via `openModal` |
| `CompositeBlocksModal.jsx` | Accept `compositeBlocksTypes`; compute `allowedAreaTypes`; filter `selectableAreas` by `allowedAreaTypes` |
