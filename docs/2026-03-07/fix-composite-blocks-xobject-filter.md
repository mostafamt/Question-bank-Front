# Fix: Composite Blocks Modal Filtering for XObject (SnapLearning Object)

## Background

The backend now returns a richer set of composite block types, including a new
label value type `XObject` used by **SnapLearning Object**:

```json
{
  "typeName": "SnapLearning Object",
  "labels": [
    { "Paragraph": "text" },
    { "Picture": "image" },
    { "Object": "XObject" }
  ]
}
```

The existing label value types and their expected area category filters:

| Label value type | Area category shown in modal |
|------------------|------------------------------|
| `QObject`        | Question                     |
| `Object`         | Illustrative object          |
| `XObject`        | Illustrative object  ← **new, not yet handled** |

---

## What Breaks Today

When the user selects **SnapLearning Object** as the composite type, the modal
should only show **Illustrative object** blocks. Instead:

1. **`CompositeBlocksModal.jsx`** — `allowedAreaTypes` has no handler for
   `XObject`, so the `allowed` Set stays empty and the code falls back to the
   hardcoded default `["Question", "Illustrative object"]`, showing both
   categories.

2. **`StudioAreaSelector.jsx`** — `onPickAreaForCompositeBlocks` uses label key
   names (e.g. `"Object"`) to decide what area categories are accepted. This
   check is accidentally correct for SnapLearning Object (because the label key
   literally is `"Object"`), but the condition then also allows **Question**
   areas, which is wrong.

---

## Fix 1 — `CompositeBlocksModal.jsx`

**File:** `src/components/Modal/CompositeBlocksModal/CompositeBlocksModal.jsx`

Add `XObject` to the `allowedAreaTypes` mapping (one extra line):

```js
// BEFORE
labels.forEach((label) => {
  const internalType = getTypeOfLabelForCompositeBlocks(
    compositeBlocksTypes,
    compositeBlocks.type,
    label
  );
  if (internalType === "QObject") allowed.add("Question");
  if (internalType === "Object") allowed.add("Illustrative object");
});

// AFTER
labels.forEach((label) => {
  const internalType = getTypeOfLabelForCompositeBlocks(
    compositeBlocksTypes,
    compositeBlocks.type,
    label
  );
  if (internalType === "QObject") allowed.add("Question");
  if (internalType === "Object") allowed.add("Illustrative object");
  if (internalType === "XObject") allowed.add("Illustrative object");
});
```

This is the **primary fix**. After this change:

| Composite type       | Visible area categories in modal    |
|----------------------|-------------------------------------|
| Exercise             | Question                            |
| SnapLearning Object  | Illustrative object                 |
| Keyword              | Illustrative object                 |
| TOC                  | *(no object labels → default both)* |

---

## Fix 2 — `StudioAreaSelector.jsx` (direct-click path)

**File:** `src/components/Studio/StudioAreaSelector/StudioAreaSelector.jsx`

`onPickAreaForCompositeBlocks` is the older path where clicking a block on the
page (in hand mode, without the modal) adds it directly. Its conditions check
**label key names** rather than **label value types**, which is fragile and
incorrectly allows Question areas for SnapLearning Object.

Current code:
```js
const list = getList2FromData(compositeBlocksTypes, compositeBlocks.type);
// list = label keys e.g. ["Paragraph", "Picture", "Object"] for SnapLearning Object

const condition1 =
  (area.type === "Illustrative object" || area.type === "Question") &&
  list.includes("Object");   // <-- checks key name, not value type

const condition2 =
  area.type === "Question" && list.includes("Question");  // <-- same issue
```

For SnapLearning Object, `list.includes("Object")` is `true` which makes
`condition1` accept both "Illustrative object" **and** "Question" areas.

**Replace the label-key-based conditions with label-type-based conditions**
using `getTypeOfLabelForCompositeBlocks`:

```js
// AFTER — build a set of allowed area categories from label value types
const allowedCategories = new Set();
const labelKeys = getList2FromData(compositeBlocksTypes, compositeBlocks.type);
labelKeys.forEach((labelKey) => {
  const labelType = getTypeOfLabelForCompositeBlocks(
    compositeBlocksTypes,
    compositeBlocks.type,
    labelKey
  );
  if (labelType === "QObject") allowedCategories.add("Question");
  if (labelType === "Object")  allowedCategories.add("Illustrative object");
  if (labelType === "XObject") allowedCategories.add("Illustrative object");
});

if (allowedCategories.has(area.type)) {
  // Determine the label key to assign as the area type
  // Use the first label key whose type matches the area category
  let areaType = "";
  for (const labelKey of labelKeys) {
    const labelType = getTypeOfLabelForCompositeBlocks(
      compositeBlocksTypes,
      compositeBlocks.type,
      labelKey
    );
    const isObject = labelType === "Object" || labelType === "XObject";
    const isQuestion = labelType === "QObject";
    if (area.type === "Illustrative object" && isObject) {
      areaType = labelKey;
      break;
    }
    if (area.type === "Question" && isQuestion) {
      areaType = labelKey;
      break;
    }
  }

  setCompositeBlocks((prevState) => ({
    ...prevState,
    areas: [
      ...prevState.areas,
      {
        x: area.x,
        y: area.y,
        height: area.height,
        width: area.width,
        type: areaType,
        text: area.text,
        blockId: area.blockId,
        unit: "%",
      },
    ],
  }));
}
```

> **Note:** Fix 2 is optional if `onPickAreaForCompositeBlocks` is no longer the
> active path (the modal is now the primary hand-tool flow). Confirm with the
> team whether this function is still reachable before changing it.

---

## Import Required for Fix 2

`getTypeOfLabelForCompositeBlocks` must be imported in `StudioAreaSelector.jsx`
if it isn't already:

```js
import {
  getList2FromData,
  getTypeOfLabelForCompositeBlocks,  // add this
} from "../../../utils/studio";
```

---

## Summary of Changes

| File | What changes |
|------|-------------|
| `src/components/Modal/CompositeBlocksModal/CompositeBlocksModal.jsx` | Add `XObject → "Illustrative object"` branch in `allowedAreaTypes` |
| `src/components/Studio/StudioAreaSelector/StudioAreaSelector.jsx` | Replace label-key conditions with label-type-based logic (optional) |

---

## Verification

1. Open Studio on a chapter with saved **Question** blocks and **Illustrative
   object** blocks.
2. Create a composite block, set type to **Exercise**.
   - Open hand-tool modal → only **Question** blocks should be selectable
     (grey border only on Questions).
3. Reset, set type to **SnapLearning Object**.
   - Open hand-tool modal → only **Illustrative object** blocks should be
     selectable.
4. Reset, set type to **Keyword**.
   - Open hand-tool modal → only **Illustrative object** blocks should be
     selectable.
5. Reset, set type to **TOC** (no object labels).
   - Modal should show no selectable blocks (or fall back gracefully).
