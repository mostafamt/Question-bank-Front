# Plan: Deep Block Object Type Support

## How to detect "object" types

The user confirms: **if `area.type` is `"Question"` or `"Illustrative Object"`, the
block is an object block.**

`area.type` is the block's category, set when the block is first placed on the page
(it comes from the type definition, e.g. "Question", "Simple item", "Illustrative
Object"). It is already used in `modal.service.js`:

```js
// modal.service.js — already defined (not exported yet)
const COMPLEX_AREA_TYPES = [
  "Question",
  "Illustrative Object",
  "Illustrative object",  // case variation
];
```

This is the right thing to check — it's a stable category, not dependent on which
specific label (`TextMCQ`, `Essay`, etc.) is selected. It matches exactly how
`determineModalForArea` (used in `usePlayBlock`) already identifies object blocks.

**No need to import or check `COMPLEX_TYPES` from `ocr.js`.**

---

## What the non-deep path does (for context)

When an object label is selected on a **non-deep** block, `useLabelManagement` opens
`SubObjectModal`, which renders a full nested Studio over the **cropped page image**.
The author can:
1. Auto-generate the object from the crop → `saveObject()` → ID stored in `area.text`
2. Select from the library → `SelectFromLibraryModal` → ID stored in `area.text`

The object ID lives in `area.text`. Playback reads it via
`determineModalForArea` → `setFormState({ activeId: areaProps.text })` → `PlayObjectModal2`.

## What the deep path should do differently

A deep block signals "I want to author this content from scratch, not OCR the scan."
For objects that means **skipping the cropped-image workflow entirely** and going
directly to `SelectFromLibraryModal` so the author links an existing object to the area.

---

## Data flow

```
Author selects object label (any typeOfLabel, but area.type = "Question" or "Illustrative Object")
  → useLabelManagement.onChangeLabel
  → getDeepHandler(area, labelType)
      ← DEEP_HANDLERS[labelType] has no entry for object labels
      ← COMPLEX_AREA_TYPES.includes(area.type) = true → handleDeepObject
  → openModal("select-from-library", {
        onSelect: (objectId) => updateAreaPropertyById(area.id, { text: objectId })
    })
  → SelectFromLibraryModal: author picks an object → confirms
  → area.text = objectId

Playback (reader / click):
  determineModalForArea(area)                 ← already handles area.type → PlayObjectModal2
  setFormState({ activeId: area.text })       ← objectId flows through unchanged
  PlayObjectModal2 renders the iframe         ← no change needed
```

No changes are needed to `useLabelManagement`, `usePlayBlock`, `determineModalForArea`,
or `PlayObjectModal2`.

---

## Rendering overlay (DeepBlockObject)

An object cannot be embedded inline — it needs the full iframe from `PlayObjectModal2`.
The overlay is a **linked indicator** badge:

- When `area.text` holds an object ID → paint a "Object linked" badge
- When `area.text` is empty → render nothing (the default `{areaType} - {areaLabel}`
  tag already shown by StudioAreaSelector is sufficient)

---

## Files to change

### 1. `services/modal.service.js`

**Export `COMPLEX_AREA_TYPES`** so `deepHandlers.service.js` can import it:

```js
// change `const` → `export const`
export const COMPLEX_AREA_TYPES = [
  "Question",
  "Illustrative Object",
  "Illustrative object",
];
```

*(It is already used internally by `determineModalForArea` in the same file — this
just makes it importable.)*

---

### 2. `services/deepHandlers.service.js`

**Import `COMPLEX_AREA_TYPES`** at the top:

```js
import { COMPLEX_AREA_TYPES } from "./modal.service";
```

**Add `handleDeepObject`** (after the existing handlers):

```js
const handleDeepObject = ({ area, updateAreaPropertyById, openModal }) => {
  openModal("select-from-library", {
    onSelect: (objectId) => {
      updateAreaPropertyById(area.id, { text: objectId });
    },
  });
};
```

**Extend `getDeepHandler`** with the `area.type` fallback:

```js
// Before (current):
export const getDeepHandler = (area, labelType) =>
  (isDeepBlock(area) && DEEP_HANDLERS[labelType]) || null;

// After:
export const getDeepHandler = (area, labelType) => {
  if (!isDeepBlock(area)) return null;
  if (DEEP_HANDLERS[labelType]) return DEEP_HANDLERS[labelType];
  if (COMPLEX_AREA_TYPES.includes(area?.type)) return handleDeepObject;
  return null;
};
```

**Add `getDeepBlockObject`** getter:

```js
export const getDeepBlockObject = (area) =>
  isDeepBlock(area) &&
  COMPLEX_AREA_TYPES.includes(area?.type) &&
  typeof area.text === "string" &&
  area.text
    ? area.text   // the linked object ID
    : "";
```

**Update the default export** to include `getDeepBlockObject`.

---

### 3. `services/index.js`

Export the new getter:

```js
export {
  getDeepHandler,
  getDeepBlockText,
  getDeepBlockImage,
  getDeepBlockAudio,
  getDeepBlockVideo,
  getDeepBlockObject,   // new
} from "./deepHandlers.service";
```

---

### 4. `DeepBlockContent/DeepBlockObject.jsx` *(new file)*

```jsx
import React from "react";
import styles from "./deepBlockContent.module.scss";

/**
 * Overlay for a deep object block that has a linked interactive object.
 * The full object is played via PlayObjectModal2 on click.
 * @param {Object} props
 * @param {string} props.objectId - The linked object's ID
 */
const DeepBlockObject = ({ objectId }) => {
  if (!objectId) return null;

  return (
    <div className={styles["deep-block-object"]}>
      Object linked
    </div>
  );
};

export default DeepBlockObject;
```

---

### 5. `DeepBlockContent/deepBlockContent.module.scss`

Add:

```scss
.deep-block-object {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;

  background-color: rgba(255, 255, 255, 0.85);
  font-size: 0.75rem;
  font-weight: 600;
  color: #1976d2;
  pointer-events: none;
  user-select: none;
}
```

---

### 6. `StudioAreaSelector/StudioAreaSelector.jsx`

**Import** the new getter and component:

```js
import { ..., getDeepBlockObject } from "../services/deepHandlers.service";
import DeepBlockObject from "../DeepBlockContent/DeepBlockObject";
```

**Extend `customRender`**:

```js
let areaType, areaLabel, deepText, deepImage, deepAudio, deepVideo, deepObjectId;
...
deepObjectId = getDeepBlockObject(area);
```

```jsx
{deepObjectId ? <DeepBlockObject objectId={deepObjectId} /> : null}
```

---

## Checklist

- [ ] `modal.service.js` — export `COMPLEX_AREA_TYPES`
- [ ] `deepHandlers.service.js` — import `COMPLEX_AREA_TYPES`, add `handleDeepObject`, extend `getDeepHandler`, add `getDeepBlockObject`
- [ ] `services/index.js` — export `getDeepBlockObject`
- [ ] `DeepBlockContent/DeepBlockObject.jsx` — new badge renderer
- [ ] `deepBlockContent.module.scss` — add `.deep-block-object` style
- [ ] `StudioAreaSelector.jsx` — import + render `DeepBlockObject`

**No changes needed to:**
- `useLabelManagement` — already delegates through the handler and returns early
- `SelectFromLibraryModal` — already accepts `onSelect` callback
- `Modal.jsx` — `"select-from-library"` is already registered
- `usePlayBlock` / `determineModalForArea` / `PlayObjectModal2` — already read `area.text`

---

## Why `area.type` beats `COMPLEX_TYPES.includes(labelType)`

| | `area.type` check | `labelType` (COMPLEX_TYPES) check |
|--|---|---|
| Source of truth | Block category, set at creation | Resolved from label selection |
| Stability | Stable — doesn't change when label changes | Changes with every label selection |
| Already used by | `determineModalForArea`, `usePlayBlock` | `useLabelManagement` fallback |
| Needs new import | `COMPLEX_AREA_TYPES` from same service folder | `COMPLEX_TYPES` from `utils/ocr.js` |

Using `area.type` keeps deep-block logic consistent with playback logic.
