# Deep Image Handler — Implementation Plan

## Goal

A block marked **Deep** (`isDeep === true`) whose `typeOfLabel` is `image` should let the author
**upload/replace the image** through a modal instead of using the OCR crop, and then **render that
image over the block's area** on the page — the same way deep *text* is authored in Quill and
painted over its area.

This mirrors the deep-text feature already shipped:

| deep text (done) | deep image (this plan) |
| --- | --- |
| `handleDeepText` opens the Quill modal | `handleDeepImage` opens a new image modal |
| author types HTML → stored in `area.text` | author uploads → stored in `area.image` |
| `getDeepBlockText` + `DeepBlockContent` paint it over the area | `getDeepBlockImage` + image overlay paint it over the area |

The stub already exists:

```js
const handleDeepImage = ({ area, labelType, updateAreaPropertyById, openModal }) => {
  console.log('handleDeepImage');
};
```

and is already registered in `DEEP_HANDLERS` under `image`, so `onChangeLabel` already routes deep
image blocks here and early-returns (no OCR). This plan fills in the body and the rendering.

---

## The one constraint that shapes everything: where the image is stored

For a **non-deep** image block, the OCR crop (a `data:` base64 URL) lives in `area.image`, and the
submit path in `src/pages/ScanAndUpload/ScanAndUpload.jsx` turns it into `contentValue`:

```js
// CREATED branch (~line 106)
contentValue: item.typeOfLabel === "image" ? await newUpload(item.image) : item.text,
// UPDATED / DELETED branches
contentValue: item.typeOfLabel === "image" ? item.image : item.text,
```

`newUpload` is `uploadBase64` from `src/utils/NewUpload.js`, which **throws** unless its argument
starts with `data:`:

```js
if (!base64Data.startsWith("data:")) {
  throw new Error('Invalid base64 format. Expected data URL starting with "data:"');
}
```

The deep-image modal reuses `DrawnUI/Image`, whose `upload()` returns a **hosted URL string**
(`https://…`), not a `data:` URL. So if the deep-uploaded URL lands in `area.image`, a **newly
created** deep image block will **throw on submit** at `newUpload`. This is the load-bearing detail.

**Decision: keep the final content in `area.image` (so `contentValue` derivation and the UPDATED
branch keep working untouched), and guard the CREATED branch so an already-hosted URL is not
re-uploaded.** See Step 5 — this is a required change, not optional.

Storing in a *separate* field was considered and rejected: `contentValue` for image type is derived
from `item.image` in three branches and in `SubObjectModal`, so a new field would mean touching every
one of those. `area.image` is the field the whole pipeline already reads.

---

## Step 1 — `handleDeepImage`

Replace the stub in `src/components/Studio/services/deepHandlers.service.js`. Open a new modal,
handing it the area and an update callback that writes the chosen URL back by id:

```js
const handleDeepImage = ({ area, updateAreaPropertyById, openModal }) => {
  openModal(STUDIO_MODALS.DEEP_IMAGE, {
    workingArea: {
      id: area.id,
      image: area.image,        // seed (see Step 3 for the data:-vs-URL nuance)
    },
    updateAreaPropertyById,
  });
};
```

`area` and `updateAreaPropertyById` come from the `DeepHandlerContext` that `onChangeLabel` already
passes (`useLabelManagement.js`). `updateAreaPropertyById` there is the **stable ref-backed** wrapper
(`updateAreaPropertyByIdStable`), so it is safe to hold across the modal's lifetime — same guarantee
the deep-text path relies on. No change to `useLabelManagement` or `Studio.jsx` is needed; the
context already carries everything.

---

## Step 2 — `STUDIO_MODALS.DEEP_IMAGE` + registry entry

- In `src/components/Studio/services/modal.service.js`, add to the `STUDIO_MODALS` enum:
  ```js
  /** Modal for uploading/replacing a deep block's image */
  DEEP_IMAGE: "deep-image",
  ```
- In `src/components/Modal/Modal.jsx`, import the new component and add
  `"deep-image": DeepImageModal` to `MODAL_COMPONENTS`. The generic branch already renders
  `<ModalComponent {...props} handleCloseModal={closeModal} />` inside a Bootstrap `<Modal>`, so the
  new modal receives `workingArea`, `updateAreaPropertyById`, and `handleCloseModal` for free.

---

## Step 3 — `DeepImageModal` (reuses `DrawnUI/Image`)

New file `src/components/Modal/DeepImageModal/DeepImageModal.jsx`.

`DrawnUI/Image` is a **react-hook-form `Controller`** and requires `control`, `setValue`,
`getValues`, `name`, `errors`, and `path`. It is normally driven by the page-level form in
`src/pages/DrawnUI/DrawnUI.jsx`. In a modal there is no such form, so the modal creates a **local**
`useForm` purely to satisfy the component's contract:

```jsx
const NAME = "deepImage";

const DeepImageModal = ({ workingArea, updateAreaPropertyById, handleCloseModal }) => {
  // Seed only with an already-hosted URL; a data: crop is not a chosen image, so
  // start empty and let the author upload/paste. Matches getDeepBlockImage (Step 4).
  const seed =
    typeof workingArea?.image === "string" && !workingArea.image.startsWith("data:")
      ? workingArea.image
      : "";

  const {
    control,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useForm({ defaultValues: { [NAME]: seed } });

  const value = watch(NAME);

  const onSubmit = () => {
    updateAreaPropertyById(workingArea.id, { image: value, typeOfLabel: "image" });
    handleCloseModal();
  };

  return (
    <>
      <BootstrapModal.Header closeButton>
        <BootstrapModal.Title>Block image</BootstrapModal.Title>
      </BootstrapModal.Header>
      <BootstrapModal.Body>
        <Image
          name={NAME}
          path={NAME}
          control={control}
          setValue={setValue}
          getValues={getValues}
          errors={errors}
        />
      </BootstrapModal.Body>
      <BootstrapModal.Footer>
        <Button onClick={handleCloseModal}>Cancel</Button>
        <Button variant="contained" disabled={!value} onClick={onSubmit}>
          Save
        </Button>
      </BootstrapModal.Footer>
    </>
  );
};
```

Notes / gotchas:

- **`Image` hard-codes `rules={{ required: "File is required" }}` on its `Controller`.** That is
  harmless here — we drive submit from the footer `Save` button (disabled until `value` is set), not
  from RHF's `handleSubmit`, so the built-in required rule never blocks or needs wiring.
- `Image` writes the uploaded/typed value via `setValue(name, …)`, which is why we `watch(NAME)`
  rather than read a stale `getValues` — the footer button and its disabled state must react to the
  upload finishing.
- `Image`'s upload uses the **old** `upload()` in `src/utils/upload.js`, which on failure `toast`s and
  returns `undefined` (no throw). If upload fails, `value` stays empty and `Save` stays disabled —
  acceptable for v1; no extra error handling needed.
- Write `typeOfLabel: "image"` alongside `image` defensively; `onChangeLabel` already set it before
  invoking the handler, so this is belt-and-suspenders, not load-bearing.

---

## Step 4 — Render the image over the block

Add a selector next to `getDeepBlockText` in `deepHandlers.service.js`:

```js
/**
 * The author-provided image URL to paint over a deep image block's area, or "".
 * Only a hosted URL counts — a data: crop is the raw scan, not a chosen replacement.
 */
export const getDeepBlockImage = (area) =>
  isDeepBlock(area) &&
  area?.typeOfLabel === "image" &&
  typeof area.image === "string" &&
  !area.image.startsWith("data:")
    ? area.image
    : "";
```

Export it from `src/components/Studio/services/index.js` alongside `getDeepBlockText`.

Rendering reuses the exact integration point deep text uses — `customRender` in
`src/components/Studio/StudioAreaSelector/StudioAreaSelector.jsx`, which already computes `deepText`
and renders `<DeepBlockContent html={deepText} />`. Add a parallel:

```js
const deepImage = getDeepBlockImage(area);
// …inside the returned block, after the DeepBlockContent line:
{deepImage ? <DeepBlockImage src={deepImage} /> : null}
```

`DeepBlockImage` is a small new component
(`src/components/Studio/DeepBlockContent/DeepBlockImage.jsx`, or extend the existing
`DeepBlockContent` folder) that reuses the **same overlay styling** as `DeepBlockContent`:
`position: absolute; inset: 0`, opaque background, `object-fit: contain`, `pointer-events: none`,
and **no `z-index`** — the AreaSelector renders its resize handles after the custom renderer and
gives them no z-index, so any stacking context here would hide them (this bug was already found and
fixed for deep text; reuse the same SCSS rather than reintroduce it).

```jsx
const DeepBlockImage = ({ src }) => (
  <img className={styles["deep-block-image"]} src={src} alt="" />
);
```

Because `getDeepBlockImage` ignores `data:` crops, the overlay appears **only after** the author
saves a real image — not for the raw OCR crop that sits in `area.image` right after labelling.

---

## Step 5 — Guard the submit path (required)

In `src/pages/ScanAndUpload/ScanAndUpload.jsx`, the **CREATED** branch (~line 106) unconditionally
re-uploads `item.image` through `newUpload`, which throws on a non-`data:` string. A deep image
block that was created this session carries a hosted URL there. Guard it:

```js
contentValue:
  item.typeOfLabel === "image"
    ? item.image?.startsWith("data:")
      ? await newUpload(item.image)   // raw crop → upload it
      : item.image                    // already a hosted URL (deep image) → use as-is
    : item.text,
```

The UPDATED and DELETED branches already pass `item.image` straight through, so they need no change —
a server-loaded deep image round-trips fine. Only the CREATED branch re-uploads, and only it needs
the guard.

`SubObjectModal.handleSubmit` also does `uploadBase64(item.image)` for image labels, but that path is
sub-object scoped where deep blocks never occur (the Deep checkbox is hidden when `subObject` is
true), so it is out of scope — noted so a future reader doesn't assume it was missed.

---

## Step 6 — Tests

Extend `src/components/Studio/services/__tests__/deepHandlers.test.js`:

- `getDeepHandler({ isDeep: true }, "image")` returns a function (already implied by the registry;
  add an explicit assertion).
- `getDeepBlockImage`:
  - returns the URL for a deep image block whose `image` is a hosted URL.
  - returns `""` when `image` is a `data:` crop (raw scan, not a chosen image).
  - returns `""` for a non-deep image block, and for a deep block of another `typeOfLabel`.
  - returns `""` for a missing/undefined area.
- `handleDeepImage` calls `openModal` with `STUDIO_MODALS.DEEP_IMAGE` and a `workingArea` carrying
  the area `id`.

Component test `src/components/Modal/DeepImageModal/__tests__/DeepImageModal.test.js`:

- Renders with the upload button and URL field present.
- Seeds the URL field from a hosted-URL `workingArea.image`, and starts empty for a `data:` seed.
- Clicking `Save` calls `updateAreaPropertyById(id, { image, typeOfLabel: "image" })` and
  `handleCloseModal`.
  (Simulate the value via the URL `TextField`, which is the least brittle way to set it without a
  real file upload.)

Manual check in Studio:

1. Draw an area, tick **Deep**, pick an `image` label → the deep-image modal opens (no OCR crop shown
   on the block yet).
2. Upload an image (or paste a URL) → `Save` → the image paints over the block's area; resize handles
   still work.
3. Submit the page → block persists; refetch → the image still renders (round-trips via the UPDATED
   branch).
4. A non-deep image block still behaves as before (crop used, no overlay, `newUpload` on submit).

---

## Order of work

1. Step 2 (enum + registry) and Step 3 (`DeepImageModal`) — the modal must exist before the handler
   can open it.
2. Step 1 (`handleDeepImage`).
3. Step 4 (`getDeepBlockImage` + overlay).
4. Step 5 (submit guard) — without it, created deep images throw on save.
5. Step 6 (tests).

## Files touched

| File | Change |
| --- | --- |
| `src/components/Modal/DeepImageModal/DeepImageModal.jsx` | **new** — modal reusing `DrawnUI/Image` |
| `src/components/Studio/DeepBlockContent/DeepBlockImage.jsx` (+ scss rule) | **new** — image overlay |
| `src/components/Studio/services/deepHandlers.service.js` | flesh out `handleDeepImage`; add `getDeepBlockImage` |
| `src/components/Studio/services/index.js` | export `getDeepBlockImage` |
| `src/components/Studio/services/modal.service.js` | `DEEP_IMAGE` enum entry |
| `src/components/Modal/Modal.jsx` | register `"deep-image"` |
| `src/components/Studio/StudioAreaSelector/StudioAreaSelector.jsx` | render `DeepBlockImage` in `customRender` |
| `src/pages/ScanAndUpload/ScanAndUpload.jsx` | guard CREATED image `contentValue` against double-upload |
| `src/components/Studio/services/__tests__/deepHandlers.test.js` | tests for `getDeepBlockImage` / `handleDeepImage` |
| `src/components/Modal/DeepImageModal/__tests__/DeepImageModal.test.js` | **new** — modal tests |

## Open questions for you

1. **Prefill on re-edit.** The plan seeds the modal only with an already-hosted URL and treats a
   `data:` crop as "nothing chosen yet". If you'd rather show the raw crop as a starting point so the
   author edits from it, say so — it changes `getDeepBlockImage` and the seed logic.
2. **Reader mode.** Like deep text, the reader branch (`StudioAreaSelector.jsx` reader path) draws
   bare buttons and won't show the overlay. Should deep images render in the reader too? Out of scope
   here unless you want it.
