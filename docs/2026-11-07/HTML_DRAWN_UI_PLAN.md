# Plan: `html` Field Type in DrawnUI

## Goal

Add a new label type `html` to the DrawnUI form so a type's abstract parameter can declare an HTML-file field (e.g. `"_Page_": "html"`).

The UI matches `Video` (preview box on the left; upload button and URL field on the right). The preview renders the HTML file inside a sandboxed `<iframe>`, and a fullscreen button opens it in a large dialog, the same way `Pdf` does.

```
┌──────────────────────┐   ┌──────────────────────┐
│                  ⛶   │   │ ⬆ Upload HTML        │
│   [ iframe of the    │   └──────────────────────┘
│     html file ]      │   ┌──────────────────────┐
│                      │   │ Add Url              │
└──────────────────────┘   └──────────────────────┘
```

---

## How It Works

1. The user picks a `.html` / `.htm` file with **Upload HTML**, or pastes a URL into **Add Url**.
2. An uploaded file goes through the existing `upload(file)` (`src/utils/upload.js`), which returns its URL.
3. The field value is set to that URL **string**, exactly like `video` and `image`. No object shape is needed (unlike `pdf`, there are no pages).
4. The preview box shows `<iframe src={value} sandbox="allow-scripts" />`.
5. In edit mode / map-to-form the saved URL is read back with `useWatch`, so the preview appears when the value arrives after mount (same fix `Pdf.jsx` uses).

---

## Files That Change

| File | Change |
|------|--------|
| `src/components/DrawnUI/Html/Html.jsx` | **New.** The component, modelled on `Video.jsx` (structure) and `Pdf.jsx` (`useWatch`, fullscreen `Dialog`, `ValidationMessage`). |
| `src/components/DrawnUI/Html/html.module.scss` | **New.** Copy of `video.module.scss`; replace `.scale-video` with `.frame` (`width/height: 100%; border: 0`) and add a `.full-screen` corner button and a `.viewer` style for the dialog iframe. |
| `src/utils/auto-ui.js` | Import `Html`; add `html: <Html />` to `AUTO_UI_TYPES_MAPPING`. |
| `src/utils/upload.js` | Add `"text/html": "html"` to `mimeMap` in `getExtensionFromMimeType` (only matters for `uploadBase64`, but keeps the map complete). |
| `src/components/DrawnUI/Html/Html.test.jsx` | **New.** Tests modelled on `Pdf.test.jsx`. |

**No change needed:**

- `DrawnUIForm.jsx` — `renderSingleField` already looks the type up in `AUTO_UI_TYPES_MAPPING` and passes `name`, `setValue`, `getValues`, `control`, `errors`, `path`, `space`.
- `getSchema` in `auto-ui.js` — the value is a string, so the generic `yup.string().required()` rule already works for a required `html` field.
- `src/utils/typeName.js` — only needed if the backend introduces a "Smart Interactive HTML" style type name. If it does, add `"html"` to `SMART_MEDIA` (see Open Questions).

---

## 1. `Html.jsx` component

```jsx
import React from "react";
import { Box, Button, CircularProgress, Dialog, IconButton, TextField } from "@mui/material";
import { useWatch } from "react-hook-form";
import VisuallyHiddenInput from "../../VisuallyHiddenInput/VisuallyHiddenInput";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import HtmlIcon from "@mui/icons-material/Html";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import CloseIcon from "@mui/icons-material/Close";
import { upload } from "../../../utils/upload";
import ValidationMessage from "../../ValidationMessage/ValidationMessage";

import styles from "./html.module.scss";

// Uploaded pages are untrusted: allow their scripts but keep them away from
// this app's origin, cookies and top-level navigation
const SANDBOX = "allow-scripts";

const Html = (props) => {
  const { setValue, name, control, errors, path } = props;
  const value = useWatch({ control, name }) || "";
  const [loading, setLoading] = React.useState(false);
  const [showViewer, setShowViewer] = React.useState(false);

  const onChangeHandler = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setLoading(true);
    const link = await upload(file);
    if (link) setValue(name, link, { shouldValidate: true });
    setLoading(false);
  };

  const onChangeInput = (event) =>
    setValue(name, event.target.value, { shouldValidate: true });

  // preview:  loading ? <CircularProgress/> : value ? <iframe .../> + fullscreen button : <HtmlIcon/>
  // inputs:   "Upload HTML" button (accept=".html,.htm,text/html") + "Add Url" TextField
  // dialog:   <Dialog fullScreen open={showViewer}> close button + <iframe src={value} sandbox={SANDBOX}/>
  // footer:   <ValidationMessage path={path} errors={errors} />
};

export default Html;
```

Notes:

- `HtmlIcon` exists in `@mui/icons-material` (`Html`). If the installed version lacks it, use `CodeIcon` instead.
- The `iframe` gets a `title` (e.g. the field name) for accessibility, and `loading="lazy"`.
- Clicking inside a small preview iframe swallows events, so the fullscreen button sits on top of it (`position: absolute`, `z-index`) like the one in `Image.jsx`.

## 2. Register the type (`src/utils/auto-ui.js`)

```js
import Html from "../components/DrawnUI/Html/Html";

export const AUTO_UI_TYPES_MAPPING = {
  ...
  video: <Video />,
  pdf: <Pdf />,
  ppt: <Pdf kind="ppt" />,
  html: <Html />,
  ...
};
```

## 3. Security

An HTML file can contain any script. Rendering it with `dangerouslySetInnerHTML` or an un-sandboxed iframe on the same origin would let an uploaded file read the user's token / cookies and act as them. Therefore:

- Always render through `<iframe sandbox="allow-scripts">` — **never** `allow-scripts` together with `allow-same-origin` (that combination lets the frame remove its own sandbox).
- Do not inject the file into the page DOM. (`dompurify` is installed, but sanitizing would strip the scripts/styles an interactive HTML page needs, so the iframe is the right tool.)
- Add more sandbox flags (`allow-popups`, `allow-forms`) only if a real use case needs them.

## 4. Serving requirement (backend)

`<iframe src={url}>` only renders the page if the `/upload` host serves the file with `Content-Type: text/html` and **without** `Content-Disposition: attachment`. If it serves it as a download or `text/plain`, the preview will be blank or show source code.

Fallback if the backend can't be changed: fetch the file and render it with `srcDoc`:

```js
const res = await fetch(value);           // needs CORS on the host
setHtml(await res.text());
<iframe srcDoc={html} sandbox="allow-scripts" />
```

Relative links inside the file (CSS, images, JS next to it) will not resolve with `srcDoc`, so prefer the `src` approach.

## 5. Tests (`Html.test.jsx`)

Following `Pdf.test.jsx`:

1. Renders the placeholder icon when the value is empty.
2. Uploading a file calls `upload` (mocked) and renders an iframe with the returned URL.
3. Typing a URL into **Add Url** updates the form value and the iframe `src`.
4. The iframe has `sandbox="allow-scripts"` and does **not** include `allow-same-origin`.
5. A value set after mount (edit mode) shows up in the preview.
6. The fullscreen button opens the dialog with a second iframe; close hides it.

Run with `npm test -- Html`.

## 6. Manual test

The backend type list has no `html` type yet. To test locally, temporarily add a mock type the same way the PdfTest type was added (and removed in commit `4d15000`):

```js
// TODO: remove HTML test type
const HTML_TEST_TYPE = {
  _id: "html-test-type",
  typeName: "HtmlTest",
  labels: [{ _Title_: "text" }, { "_Page_*": "html" }],
  abstractParameter: { _Title_: "text", _Page_: "html" },
};
```

- `getAllTypes` returns `[...res.data, HTML_TEST_TYPE]`.
- `getCategories` adds `{ HtmlTest: "HtmlTest" }` to the `"Explanation object"` category labels.

Then: Add Object → **Explanation object** → **HtmlTest** → Manual Form → upload an `.html` file → check the preview and fullscreen → Submit. The JSON preview should show `_Page_: "<uploaded url>"`. Remove the mock before merging.

---

## Implementation Order

1. `upload.js` mime map entry.
2. `Html.jsx` + `html.module.scss`.
3. Register in `AUTO_UI_TYPES_MAPPING`.
4. `Html.test.jsx`.
5. Temporary `HtmlTest` type → manual test → remove it.

---

## Open Questions (please confirm)

1. **Value shape.** Is a plain URL string OK for the backend and player, or do they need the HTML content itself (e.g. `{ url, content }`)?
2. **Does `/upload` accept `.html` files and serve them as `text/html` inline?** This decides between `src` (preferred) and the `srcDoc` fallback (section 4).
3. **Single file or bundle?** If an HTML page ships with its own CSS/JS/images, should we support uploading a `.zip` that the backend unpacks? That is out of scope for this plan.
4. **Sandbox permissions.** Do the HTML pages need popups, forms, or fullscreen (`allow-popups`, `allow-forms`, `allow="fullscreen"`)?
5. **Type name in the backend.** Will the backend type be called plain `html`, or a "Smart Interactive HTML" style name? The latter needs `"html"` added to `SMART_MEDIA` in `src/utils/typeName.js`.
