# Plan: `pdf` Field Type in DrawnUI

## Goal

Add a new label type `pdf` to the DrawnUI form so a type's abstract parameter can declare a PDF field (e.g. `"_Document_": "pdf"`).

The UI matches `Video` (preview box on the left; upload button and URL field on the right). The difference is that the preview shows the PDF **one page at a time as an image**, with **Previous / Next** buttons to move between pages. Pages come from the existing PDF-to-images endpoint.

```
┌──────────────────────┐   ┌──────────────────────┐
│                      │   │ ⬆ Upload PDF         │
│    [ page image ]    │   └──────────────────────┘
│                      │   ┌──────────────────────┐
├──────────────────────┤   │ Add Url              │
│  ◀  Page 2 / 7   ▶   │   └──────────────────────┘
└──────────────────────┘
```

---

## How It Works

1. The user picks a `.pdf` file with **Upload PDF**.
2. Two requests run in parallel:
   - `upload(file)` (`src/utils/upload.js`) uploads the original PDF and returns its URL.
   - The file is posted to the PDF-to-images endpoint, which returns `pages` (an array of image URLs).
3. The field value is set to `{ url, pages }`, and the component shows `pages[currentPage]`.
4. **◀ / ▶** change `currentPage`. ◀ is disabled on the first page and ▶ on the last. A `Page n / total` label sits between them.
5. If a value already exists (edit mode or map-to-form), the component reads `pages` from it and renders without converting again.

---

## Files That Change

| File | Change |
|------|--------|
| `src/components/DrawnUI/Pdf/Pdf.jsx` | **New.** The component, modelled on `Video.jsx`. |
| `src/components/DrawnUI/Pdf/pdf.module.scss` | **New.** Copy of `video.module.scss` plus a `.pager` row for the buttons. |
| `src/utils/auto-ui.js` | Import `Pdf`; add `pdf: <Pdf />` to `AUTO_UI_TYPES_MAPPING`; make `getSchema` validate a required `pdf` field as an object, not a string (see below). |
| `src/services/api.js` | Add `pdfToImages(file)`; add a `pdf` test type to the io-types list (see "Test Type"). |

`DrawnUIForm.jsx` needs **no change**. `renderSingleField` already looks types up in `AUTO_UI_TYPES_MAPPING` and passes `name`, `setValue`, `getValues`, `control`, `errors`, `path`, and `space` to the component.

---

## 1. `pdfToImages` service (`src/services/api.js`)

The endpoint call is currently copy-pasted in `AutoGeneration.jsx` and `ScanAndUpload.jsx`. I'll move it into one shared function:

```js
export const pdfToImages = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  try {
    const res = await axios2.post(
      "https://questions-api-navy.vercel.app/api/pdf/to-images",
      formData
    );
    return res.data?.pages ?? [];
  } catch (error) {
    toast.error("This service isn't available at the moment !");
    return [];
  }
};
```

> I'm not renaming or touching `convertPdfToImages` in `src/utils/server.js`. It's a fake that returns hard-coded images and other pages still import it.
> I'm also leaving `AutoGeneration.jsx` and `ScanAndUpload.jsx` as they are. Switching them to the shared function can be a separate cleanup.

## 2. `Pdf.jsx` component

The structure follows `Video.jsx`, including its `upload` / `TextField` pattern:

```jsx
const Pdf = (props) => {
  const { setValue, name, getValues } = props;
  const [value, setLocalValue] = React.useState(getValues(name) || null);
  const [page, setPage] = React.useState(0);
  const [loading, setLoading] = React.useState(false);

  const pages = value?.pages ?? [];

  const update = (next) => {
    setLocalValue(next);
    setValue(name, next);
    setPage(0);
  };

  const onChangeHandler = async (event) => {
    setLoading(true);
    const file = event.target.files[0];
    const [url, images] = await Promise.all([upload(file), pdfToImages(file)]);
    update({ url, pages: images });
    setLoading(false);
  };

  // preview: pages.length ? <img src={pages[page]} /> : <PictureAsPdfIcon />
  // pager:   <IconButton disabled={page === 0} onClick={() => setPage(p => p - 1)}><NavigateBeforeIcon/></IconButton>
  //          <span>Page {page + 1} / {pages.length}</span>
  //          <IconButton disabled={page >= pages.length - 1} onClick={() => setPage(p => p + 1)}><NavigateNextIcon/></IconButton>
  // inputs:  "Upload PDF" button (accept="application/pdf") + "Add Url" TextField
};
```

- Icons come from `@mui/icons-material`, which the project already uses: `PictureAsPdf`, `NavigateBefore`, `NavigateNext`.
- The pager only shows when there is more than one page.
- While a file is converting, the preview box shows a `CircularProgress`, the same way `Image.jsx` does.
- `ValidationMessage` sits under the field, the same way `Image.jsx` does, so required-field errors are visible.

## 3. Validation (`getSchema` in `src/utils/auto-ui.js`)

Today any required field gets `yup.string().required()`. That rule would always fail for an object value, so I'll add a `pdf` case before the generic one:

```js
if (required && type === "pdf") {
  object = { ...object, [key]: yup.object({ pages: yup.array().min(1) }).required() };
} else if (required) { ...existing... }
```

## 4. Test Type (io-types list)

The real io-types list comes from the backend (`GET io-types`). To test before a backend type exists, `api.js` adds a local mock type:

```js
const PDF_TEST_TYPE = {
  _id: "pdf-test-type",
  typeName: "PdfTest",
  labels: [{ "_Title_": "text" }, { "_Document_*": "pdf" }],
  abstractParameter: { _Title_: "text", _Document_: "pdf" },
};
```

- `getAllTypes` returns `[...res.data, PDF_TEST_TYPE]`. `DrawnUIForm` uses this list to find `abstractParameter`.
- `getCategories` adds the label `{ PdfTest: "PdfTest" }` to the `"Explanation object"` category. The AddObject **type** dropdown is built from the selected category's `labels`, not from `getTypes`.
- The mock is easy to find and remove: every change is marked with a `// TODO: remove PDF test type` comment.

How to test: Add Object → Category **Explanation object** → type **PdfTest** → Manual Form → upload a multi-page PDF → page through it → Submit. The JSON preview under the form should show `_Document_: { url, pages: [...] }`.

---

## Why the value is an object, not an array of pages

Storing the page array directly looks simpler, but `DrawnUIForm` would mishandle it:

- `correctArrayKeyLengths` renames **any** array-valued key to `"<key> <length>"`, so `_Document_` would be saved as `_Document_ 7`.
- `remapToAbstractKeys` and `ArrayUI` treat array values as repeatable groups.

An object `{ url, pages }` avoids both problems. It also keeps the original PDF URL, which the player or a download link may need.

---

## Open Questions (please confirm)

1. **Which endpoint?** The plan uses `https://questions-api-navy.vercel.app/api/pdf/to-images` (returns `{ pages }`), the same one AutoGeneration and ScanAndUpload use. `UploadsPage` uses a different one (`http://34.246.140.123:5000/api/pdf2img`). Is the Vercel endpoint the right one?
2. **"Add Url" field.** The endpoint takes a file upload, not a URL. When the user pastes a PDF URL, should we:
   - (a) download it in the browser (`fetch → blob → File`) and convert it, or
   - (b) keep only the `url` with no page previews?

   I recommend (a), as long as the PDF host allows CORS.
3. **Value shape.** Is `{ url, pages }` OK for the backend and player? If the player only needs the images, we could store just `pages`, but that needs the array workaround described above.
4. **Do the page images need re-uploading?** Are the image URLs the endpoint returns permanent, or temporary? If temporary, each page should be re-uploaded through `/upload`.
