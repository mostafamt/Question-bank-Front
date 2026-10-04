# Plan: Upload Image on Composite Block Submit

## Problem

When a composite block area has a label type of `"image"`, `processCompositeBlock`
crops the page region and stores the result as a base64 data URL in `area.img`.
However `area.text` is left as `""`.

On submit, `onSubmitCompositeBlocks` sends `contentValue: area.text`, so the
backend receives an empty string instead of an image URL.

---

## Current Data Flow

```
User selects "image" label
  → processCompositeBlock(id, "image")
      → crops region → stores base64 in area.img
      → area.text = ""   ← nothing stored here for images

onSubmitCompositeBlocks
  → contentValue: area.text   ← always ""  for image areas  ← BUG
```

## Desired Data Flow

```
User selects "image" label
  → processCompositeBlock(id, "image")   ← unchanged
      → crops region → stores base64 in area.img
      → area.text = ""

onSubmitCompositeBlocks
  → for image-type areas: upload area.img → get URL
  → contentValue: uploadedUrl             ← FIX
  → for all other areas: contentValue: area.text  ← unchanged
```

---

## Implementation Plan

### Step 1 — Add imports to `useCompositeBlocks.js`

**File:** `src/components/Studio/hooks/useCompositeBlocks.js`

Add two new imports:

```js
import { uploadForStudio } from "../../../utils/upload";
import { getTypeOfLabelForCompositeBlocks } from "../../../utils/studio";
```

`uploadForStudio(base64DataUrl)` fetches the base64, converts it to a Blob,
POSTs to `/upload`, and returns the URL string from `res.data`.

`getTypeOfLabelForCompositeBlocks(data, typeName, labelKey)` looks up the label
value type (e.g. `"image"`, `"text"`, `"Object"`, `"XObject"`, `"QObject"`) for
a given composite type and label key.

---

### Step 2 — Update `onSubmitCompositeBlocks`

**File:** `src/components/Studio/hooks/useCompositeBlocks.js`

Replace the synchronous `map` with an async `Promise.all` that uploads image
areas before building the payload.

```js
// BEFORE
const onSubmitCompositeBlocks = async () => {
  setLoadingSubmitCompositeBlocks(true);
  const current = compositeBlocksRef.current;

  const blocks = current.areas.map(
    ({ type, text, x, y, width, height, unit }) => ({
      contentType: type,
      contentValue: text,
      coordinates: {
        height,
        unit: unit === "%" ? "percentage" : "px",
        width,
        x,
        y,
      },
    })
  );

  const data = {
    name: current.name,
    type: current.type,
    chapterId,
    blocks,
  };

  const response = await saveCompositeBlocks(data);
  if (response) {
    setCompositeBlocks(initCompositeBlocks);
  }

  setLoadingSubmitCompositeBlocks(false);
};
```

```js
// AFTER
const onSubmitCompositeBlocks = async () => {
  setLoadingSubmitCompositeBlocks(true);
  const current = compositeBlocksRef.current;

  const blocks = await Promise.all(
    current.areas.map(async ({ type, text, img, x, y, width, height, unit }) => {
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

  const data = {
    name: current.name,
    type: current.type,
    chapterId,
    blocks,
  };

  const response = await saveCompositeBlocks(data);
  if (response) {
    setCompositeBlocks(initCompositeBlocks);
  }

  setLoadingSubmitCompositeBlocks(false);
};
```

**Key changes:**
- `map` becomes `async` inside `Promise.all` so all uploads run in parallel
- `img` is destructured alongside `text`
- `getTypeOfLabelForCompositeBlocks` resolves the label value type from the
  composite type + label key
- If `labelType === "image"` and `img` is present, upload and use the returned
  URL as `contentValue`
- All other areas continue using `text` as `contentValue` (no behaviour change)

---

## Files Changed

| File | Change |
|------|--------|
| `src/components/Studio/hooks/useCompositeBlocks.js` | Add imports; replace `map` with `async Promise.all` that uploads image areas |

No other files need to change — `processCompositeBlock` already correctly crops
and stores the base64 in `area.img`, and all other submission paths remain the same.

---

## Verification

1. Open Studio on any chapter with saved blocks.
2. Create a composite block with a type that has an `"image"` label
   (e.g. **Exercise → ExercisePage** or **SnapLearning Object → Picture**).
3. Use the hand tool to pick a block, then select the image label from the
   dropdown — the crop preview should appear.
4. Click **Submit**.
5. Inspect the network request payload — `contentValue` for the image area
   should now be an `https://...` URL, not an empty string.
6. Confirm non-image areas (text, object references) are unaffected.
