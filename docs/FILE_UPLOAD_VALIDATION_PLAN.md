# Plan: File-Type Validation for DrawnUI Uploads + Form Submit Validation

## Goal

1. Every DrawnUI upload field accepts **only its own file type**:
   `html`, `image`, `pdf` / `ppt`, `voice` / `audio` (Sound), `video`.
   A wrong file is rejected **before** it is uploaded, and the user sees a clear message under the field.
2. Clicking **Save** validates the whole form (required fields, file values, URLs, arrays, one-of groups). If anything is wrong, nothing is sent, the errors show under their fields, and the page scrolls to the first one.

---

## Current State (what I found)

### Upload components

| Component | `accept` on input | Validates file in JS | Shows `ValidationMessage` | Reads value with |
|-----------|------------------|----------------------|---------------------------|------------------|
| `Html.jsx` | `.html,.htm,text/html` | No | Yes | `useWatch` |
| `Image.jsx` | **none** (any file) | No | Yes | `getValues` + `Controller` |
| `Pdf.jsx` (pdf / ppt) | `application/pdf` / `.ppt,.pptx,...` | No | Yes | `useWatch` |
| `Sound.jsx` | `audio/*` | No | **No** | `getValues` |
| `Video.jsx` | `video/*` | No | **No** | `getValues` |

- `accept` is only a hint to the file picker. The user can switch the picker to "All files" and pick anything, so it is not real validation.
- `upload()` in `src/utils/upload.js` posts whatever file it gets.
- Image/Sound/Video do not reset `event.target.value`, so picking the same file twice does nothing (Html/Pdf already fixed this).
- Sound and Video receive `errors`/`path` but don't render `ValidationMessage`, so a required-field error is invisible.
- `Image.jsx` has `rules={{ required: "File is required" }}` on its `Controller`; these are ignored because the form uses `yupResolver`.

### Submit validation (`getSchema` in `src/utils/auto-ui.js`)

- Only **required** fields and **arrays** get a schema. Optional fields are not checked at all.
- The `required` branch runs **before** the array branch, so a required array (`*Questions 2`) becomes `yup.string().required()` — wrong type, and its items are never validated.
- Required `image` / `video` / `audio` / `html` are `yup.string().required()` — any text passes, no URL check.
- Required `Bool` is `yup.string().required()` — `false` fails or behaves oddly.
- Nested objects (`ObjectUI`) are not validated.
- One-of groups (`?` labels): switching the radio clears the hidden field to `""`; if a hidden field is required it blocks submit, and nothing checks that *at least one* option is filled.
- `getSchema` picks the type as `getTypeOfKey(labels, key) || value`, while `renderSingleField` uses `ignoreSpaces(value) || getTypeOfKey(labels, key)` — the two can disagree.
- Error messages use the raw key (`"_Image_ is a required field"`).
- `handleSubmit(onSubmit)` has no invalid handler: on failure nothing scrolls, nothing tells the user why Save did nothing.
- Save can be clicked while a file is still uploading, saving an empty value.

---

## Design

### 1. One source of truth: `src/utils/fileTypes.js` (new)

```js
export const FILE_RULES = {
  image: { label: "Image",      extensions: ["jpg","jpeg","png","gif","webp","svg"], mimePrefix: "image/",                    maxMB: 5   },
  video: { label: "Video",      extensions: ["mp4","webm","ogg","mov"],               mimePrefix: "video/",                    maxMB: 100 },
  audio: { label: "Sound",      extensions: ["mp3","wav","ogg","webm","m4a","aac"],    mimePrefix: "audio/",                    maxMB: 20  },
  html:  { label: "HTML",       extensions: ["html","htm"],                            mimes: ["text/html"],                    maxMB: 2   },
  pdf:   { label: "PDF",        extensions: ["pdf"],                                   mimes: ["application/pdf"],              maxMB: 20  },
  ppt:   { label: "PowerPoint", extensions: ["ppt","pptx"],                            mimes: ["application/vnd.ms-powerpoint", PPTX_MIME], maxMB: 50 },
};
FILE_RULES.voice = FILE_RULES.audio;

// Builds the <input accept="..."> string from the rule
export const acceptFor = (type) => "...";   // e.g. ".jpg,.jpeg,...,image/*"

// Returns an error message, or null when the file is OK
export const validateFile = (file, type) => { ... };
```

`validateFile` checks, in order:
1. A file was picked.
2. **Extension** is in `extensions` (case-insensitive).
3. **MIME type** matches `mimePrefix`/`mimes`. If the browser reports an empty `file.type` (common on Windows for `.pptx`, sometimes `.html`), the extension check alone decides.
4. **Size** ≤ `maxMB`.

Messages: `Only PDF files are allowed (.pdf)`, `File is too large (max 20 MB)`.

`Pdf.jsx`'s local `FILE_KINDS.accept` will read from `acceptFor(kind)` so the rules are defined once.

### 2. Shared upload handler in each component

Every upload component's `onChangeHandler` becomes:

```js
const onChangeHandler = async (event) => {
  const file = event.target.files[0];
  event.target.value = "";          // allow picking the same file again
  if (!file) return;

  const error = validateFile(file, type);
  if (error) {
    setError(name, { type: "file-type", message: error });
    toast.error(error);
    return;                          // never reaches upload()
  }
  clearErrors(name);
  // ...existing upload logic
};
```

- `type` is already passed in props (`properties.type` in `DrawnUIForm.renderSingleField`); Pdf uses its `kind`.
- `setError` / `clearErrors` come from `useForm` — add them to the `properties` object in `DrawnUIForm.jsx` so every field receives them.
- The `<VisuallyHiddenInput accept={acceptFor(type)} />` on every component (adds the missing one on Image).
- Sound's **recorder** output is produced by the app (`audio/webm`), so it is not validated. Image's **drag-drop from scanned areas** is always a PNG from the studio, so it is not validated either.

### 3. Component fixes along the way

| File | Change |
|------|--------|
| `Image.jsx` | Add `accept`, validate, reset input value, remove ignored `rules` on both `Controller`s, remove `console.log`s. |
| `Video.jsx` | Validate, reset input, add `<ValidationMessage>`, switch `getValues` → `useWatch` (same pattern as Html/Pdf, fixes edit mode), drop the conflicting `value` + `defaultValue`. |
| `Sound.jsx` | Validate, reset input, add `<ValidationMessage>`, switch to `useWatch`. |
| `Html.jsx` | Validate (accept already set). |
| `Pdf.jsx` | Validate; use `acceptFor(kind)`. |
| `upload.js` | `upload()` returns `undefined` on error today → callers set an empty value silently. Keep behaviour, but components only `setValue` when a link came back (Html/Pdf already do this). |

### 4. Submit validation — rewrite `getSchema`

Build each field's schema from **its type first**, then add `required`:

```js
const fieldSchema = (type, label) => {
  if (Array.isArray(type))          return yup.array().of(getSchema(type[0], labels, level + 1));
  if (typeof type === "object")     return getSchema(type, labels, level + 1);      // ObjectUI
  if (type === "pdf" || type === "ppt")
                                    return yup.mixed().test(...pages.length > 0 when required...);
  if (FILE_RULES[type])             return yup.string().trim().test("url", `${label} must be a valid URL`, isHttpUrlOrEmpty);
  if (type === "number" || type === "Coordinate")
                                    return yup.number().transform(emptyToUndefined);
  if (type === "Bool")              return yup.boolean();
  return yup.string();
};
```

Then:
- `required` → `.required(\`${label} is required\`)` (arrays: `.min(max(1, minimumLength))`; pdf: the pages test; Bool: no `required`, since false is a valid answer).
- Arrays keep the `minimumLength` taken from the key (`Questions 2` → min 2).
- `label` = `fullTextTrim(key)` so messages read `Image is required`, not `_Image_ is ...`.
- Type resolution uses the **same** helper as `renderSingleField` (extract `resolveType(key, value, labels)` into `auto-ui.js` and use it in both).

**One-of groups**: fields in a `?` group are never individually required. Instead, the object schema gets a `.test("one-of", ...)` per group: at least one field in the group has a value (only when any field in the group is marked `*`). The error is attached to the first field of the group (`createError({ path })`) so `ValidationMessage` shows it.

**Optional file URLs** are validated only if non-empty (`isHttpUrlOrEmpty`). We don't enforce the extension on a typed URL, because bucket/CDN links often have no extension (see open question 2).

### 5. Submit UX in `DrawnUIForm.jsx`

- `handleSubmit(onSubmit, onInvalid)` where `onInvalid` shows `toast.error("Please fix the highlighted fields")` and scrolls to the first rendered `.validation-message` (custom upload fields have no input ref, so RHF's built-in `shouldFocusError` can't focus them).
- `mode: "onSubmit"`, `reValidateMode: "onChange"` (explicit) — errors appear on Save, then clear as the user fixes them.
- **Block Save while uploading**: a small `pendingUploads` counter (React context or a prop `onUploadingChange`) — components increment on start / decrement on finish; Save is `disabled={isSubmitting || pendingUploads > 0}` with a "Uploading…" label.
- Remove the debug `<pre>{JSON.stringify(values)}</pre>` (optional — confirm).

---

## Files That Change

| File | Change |
|------|--------|
| `src/utils/fileTypes.js` | **New.** `FILE_RULES`, `acceptFor`, `validateFile`. |
| `src/utils/fileTypes.test.js` | **New.** Unit tests for `validateFile`. |
| `src/utils/auto-ui.js` | `resolveType`, rewritten `getSchema` (type-first, required, objects, one-of, labels). |
| `src/utils/auto-ui.test.js` | **New.** Schema tests. |
| `src/components/DrawnUI/DrawnUIForm/DrawnUIForm.jsx` | Pass `setError`/`clearErrors`; `onInvalid` handler; upload-pending guard; use `resolveType`. |
| `src/components/DrawnUI/Image/Image.jsx` | See section 3. |
| `src/components/DrawnUI/Video/Video.jsx` | See section 3. |
| `src/components/DrawnUI/Sound/Sound.jsx` | See section 3. |
| `src/components/DrawnUI/Html/Html.jsx` (+ test) | Validate before upload. |
| `src/components/DrawnUI/Pdf/Pdf.jsx` (+ test) | Validate before upload; `acceptFor(kind)`. |

No backend change. (The server should still validate on `/upload` — client checks can be bypassed. Out of scope here, noted for the backend team.)

---

## Implementation Order

1. `fileTypes.js` + tests.
2. Wire validation into Html and Pdf (they already have the right structure) + extend their existing tests.
3. Bring Image, Video, Sound up to the same structure (`useWatch`, reset input, `ValidationMessage`) + validation.
4. `resolveType` + new `getSchema` + tests.
5. `DrawnUIForm` submit UX (`onInvalid`, scroll, upload guard).
6. Manual pass on: create page, edit page, DrawnUI modal (map-to-form), a type with arrays, a type with a one-of group.

---

## Tests

**`fileTypes.test.js`**
- Accepts `a.PNG` (`image/png`) for `image`; rejects `a.pdf` for `image`.
- Rejects `evil.html` renamed to `evil.png` with `type: "text/html"` (MIME mismatch).
- Accepts `deck.pptx` with empty `type` for `ppt` (extension fallback).
- Rejects files over `maxMB`.
- `voice` and `audio` share rules.

**Component tests (Html, Pdf, + new Image/Video/Sound)**
- Picking a wrong file: `upload` is **not** called, error message is rendered.
- Picking a right file after a wrong one: error clears, `upload` called.

**`auto-ui.test.js`**
- Required image empty → `Image is required`; invalid URL → URL message.
- Required array `Questions 2` with 1 item → fails; inner required field validated.
- Required `Bool` with `false` → passes.
- One-of group with `*`: all empty → fails on first field; one filled → passes.
- Required pdf with `{ url, pages: [] }` → fails.

---

## Open Questions (please decide before I implement)

1. **Size limits** — are the proposed limits OK (image 5 MB, html 2 MB, audio 20 MB, pdf 20 MB, ppt 50 MB, video 100 MB)? Note `upload()` has a **20 s timeout**, so large videos may fail regardless; should the timeout scale with file size?
2. **Typed URLs** — only check it's a valid `http(s)` URL (proposed), or also require a matching extension (would reject extension-less bucket links)?
3. **Allowed formats** — is the extension list above right? e.g. should `svg` images be allowed (SVG can carry scripts), or `.mov` video (doesn't play in Chrome/Firefox)?
4. **Rejection feedback** — both a toast and the inline message (proposed), or inline only?
5. **Debug `<pre>`** under the form — remove it as part of this work?
