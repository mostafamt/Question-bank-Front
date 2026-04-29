# Plan: Show DrawnUI in a Modal from "Map to Form"

## Goal

When the user clicks **Map to Form** in Studio, open a **MUI Dialog** containing the full DrawnUI form pre-filled with the mapped JSON. The user edits the form fields exactly as in the normal DrawnUI page, then submits to create the object — all without leaving the ScanAndUpload page.

---

## The Core Problem

`DrawnUI.jsx` is a **page component** — its logic is tightly coupled to React Router:

| DrawnUI dependency | Why it can't be used in a modal |
|--------------------|----------------------------------|
| `useParams()` | Reads `:type`, `:baseType`, `:id` from the URL — not available inside a Dialog |
| `useLocation()` | Detects edit vs. create mode via `pathname` — meaningless in a modal |
| Router-aware `isEditPage` flag | Drives which API call is made |

**Solution:** Extract all form logic into a new `DrawnUIForm` component that receives **props instead of URL params**. Then:
- `DrawnUI` page becomes a thin shell that reads from the router and passes props to `DrawnUIForm`
- A new `DrawnUIModal` wraps `DrawnUIForm` in a MUI Dialog
- Studio opens `DrawnUIModal` on "Map to Form" click

---

## Architecture

```
Before:

  DrawnUI (page)
  └── all logic inline (useParams, useLocation, form, API calls, rendering)

After:

  DrawnUI (page)              DrawnUIModal (new Dialog component)
  └── DrawnUIForm ◄───────────┘
       (extracted, prop-driven)
```

---

## New Component: `DrawnUIForm`

**File:** `src/components/DrawnUI/DrawnUIForm/DrawnUIForm.jsx`

### Props

| Prop | Type | Description |
|------|------|-------------|
| `baseType` | `string` | Type name used to fetch `abstractParameter` (e.g. `"Text MCQ"`) |
| `displayType` | `string` | Shown as the form title (e.g. `"Question"`) |
| `initialValues` | `object \| null` | Pre-filled values from `mapToForm`. `null` = start empty (create flow) |
| `objectId` | `string \| null` | When set → edit mode; fetches existing parameters from API |
| `onSuccess` | `() => void \| undefined` | Called after a successful save. Used by the modal to close itself |

### What DrawnUIForm contains (moved verbatim from DrawnUI.jsx)

- All `useState`: `foundAbstractParameters`, `selectedType`, `abstractParameters`, `loading`, `labels`, `values`
- `useForm` with `defaultValues: async () => getData()`
- `getData()` — modified:
  - receives `baseType` and `objectId` from props (not from `useParams`)
  - for **create** mode (`objectId === null`): returns `initialValues ?? emptyValues(abstractParameter)`
  - for **edit** mode (`objectId !== null`): fetches parameters from API as before
- `saveObject()` and `EditObject()` — identical to current, read Zustand store for metadata
- `onSubmit()` — calls `onSuccess?.()` after a successful save (allows the modal to close)
- `renderSingleField()` and `parseParameters()` — moved verbatim

### getData() logic (key change)

```js
// BEFORE (in DrawnUI.jsx, uses router state)
const getData = async () => {
  ...
  if (isEditPage) {
    return await getParameters();       // fetch from API
  } else {
    return emptyValues(abstractParameter);  // always empty
  }
};

// AFTER (in DrawnUIForm.jsx, uses props)
const getData = async () => {
  ...
  if (objectId) {
    return await getParameters(objectId);  // edit: fetch from API
  } else {
    return initialValues ?? emptyValues(abstractParameter);  // create: pre-fill or empty
  }
};
```

### onSubmit() change

```js
// AFTER: call onSuccess when save completes
const saveObject = async (values) => {
  ...
  const res = await axios.post("/interactive-objects", data);
  toast.success("Object added successfully");
  window.open(`/show/${res.data}`, "_blank");
  onSuccess?.();   // ← closes modal if provided
};
```

### Styles

`DrawnUIForm` imports `drawnUI.module.scss` using a relative path:  
`import styles from "../../../pages/DrawnUI/drawnUI.module.scss"`  
No style changes needed.

---

## Refactored: `DrawnUI.jsx` (page)

Becomes a thin shell — reads route params and delegates to `DrawnUIForm`:

```jsx
const DrawnUI = () => {
  const { type, baseType, id } = useParams();
  const { pathname } = useLocation();
  const isEditPage = pathname.startsWith("/edit-question");

  return (
    <div className="container">
      <h1 style={{ textAlign: "center", marginBottom: "3rem" }}>{type}</h1>
      <DrawnUIForm
        baseType={baseType}
        displayType={type}
        objectId={isEditPage ? id : null}
        initialValues={null}
      />
    </div>
  );
};
```

**Removed from DrawnUI.jsx:** all state, hooks, form logic, API calls, rendering functions — everything moves to `DrawnUIForm`.

---

## New Component: `DrawnUIModal`

**File:** `src/components/DrawnUIModal/DrawnUIModal.jsx`

```jsx
import { Dialog, DialogContent, DialogTitle, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DrawnUIForm from "../DrawnUI/DrawnUIForm/DrawnUIForm";

const DrawnUIModal = ({ open, onClose, baseType, displayType, initialValues }) => (
  <Dialog open={open} onClose={onClose} fullWidth maxWidth="md" scroll="paper">
    <DialogTitle>
      {displayType}
      <IconButton onClick={onClose} sx={{ position: "absolute", right: 8, top: 8 }}>
        <CloseIcon />
      </IconButton>
    </DialogTitle>
    <DialogContent dividers>
      <DrawnUIForm
        baseType={baseType}
        displayType={displayType}
        initialValues={initialValues}
        objectId={null}
        onSuccess={onClose}
      />
    </DialogContent>
  </Dialog>
);

export default DrawnUIModal;
```

- `fullWidth maxWidth="md"` gives the form enough room
- `scroll="paper"` makes the content scrollable while keeping the title fixed
- `onSuccess={onClose}` closes the modal after a successful save
- `objectId={null}` — always create mode from ScanAndUpload

---

## Changes to `Studio.jsx`

### Add state

```js
const [drawnUIOpen, setDrawnUIOpen] = React.useState(false);
const [mappedJson, setMappedJson]   = React.useState(null);
```

### Replace `handleMapToForm`

```js
// BEFORE
const handleMapToForm = () => {
  const { type, types } = state;
  try {
    const json = mapToForm(type, trialAreas, types);
    setMappedJson(json);
    setMapToFormOpen(true);
  } catch (e) {
    toast.error(e.message);
  }
};

// AFTER
const handleMapToForm = () => {
  const { type, types } = state;
  try {
    const json = mapToForm(type, trialAreas, types);
    setMappedJson(json);
    setDrawnUIOpen(true);
  } catch (e) {
    toast.error(e.message);
  }
};
```

### Replace `<MapToFormDialog>` with `<DrawnUIModal>`

```jsx
// BEFORE
<MapToFormDialog
  open={mapToFormOpen}
  onClose={() => setMapToFormOpen(false)}
  json={mappedJson}
  onConfirm={() => setMapToFormOpen(false)}
/>

// AFTER
<DrawnUIModal
  open={drawnUIOpen}
  onClose={() => setDrawnUIOpen(false)}
  baseType={state.type}
  displayType={state.higherType}
  initialValues={mappedJson}
/>
```

### Remove from Studio.jsx

- `mapToFormOpen` state (rename to `drawnUIOpen`)
- `MapToFormDialog` import
- Add `DrawnUIModal` import

---

## Deleted File

`src/components/MapToFormDialog/MapToFormDialog.jsx` — no longer used.

---

## File Summary

| File | Action | What changes |
|------|--------|--------------|
| `src/components/DrawnUI/DrawnUIForm/DrawnUIForm.jsx` | **Create** | All form logic extracted from DrawnUI, driven by props |
| `src/components/DrawnUIModal/DrawnUIModal.jsx` | **Create** | Thin MUI Dialog wrapper around DrawnUIForm |
| `src/pages/DrawnUI/DrawnUI.jsx` | **Refactor** | Becomes a thin shell using DrawnUIForm |
| `src/components/Studio/Studio.jsx` | **Update** | Open DrawnUIModal instead of MapToFormDialog |
| `src/components/MapToFormDialog/MapToFormDialog.jsx` | **Delete** | Replaced by DrawnUIModal |

---

## Data Flow (end-to-end)

```
1. User draws areas in Studio, assigns parameters
2. Clicks "Map to Form"
3. handleMapToForm() runs mapToForm(type, trialAreas, types) → JSON
4. setMappedJson(json) + setDrawnUIOpen(true)
5. <DrawnUIModal> opens
6. DrawnUIForm mounts:
   a. getData() fetches types from /api/io-types
   b. Finds abstractParameter for "Text MCQ"
   c. Returns initialValues (the mapped JSON) as useForm defaultValues
7. Form renders pre-filled with OCR-extracted text
8. User edits fields in the UI
9. Clicks Submit → saveObject() → POST /interactive-objects
10. Toast success + window.open(/show/:id)
11. onSuccess() → modal closes
```

---

## Edge Cases

| Case | Behaviour |
|------|-----------|
| `initialValues` is `null` (modal opened without mapping) | Falls back to `emptyValues(abstractParameter)` |
| User closes modal without submitting | `onClose` called, state reset — no data saved |
| DrawnUI page (normal route) | Passes `initialValues={null}`, `objectId` from URL — unchanged behaviour |
| Edit page (`/edit-question/...`) | Passes `objectId` from URL — fetches existing parameters, ignores `initialValues` |
| abstractParameter not found for type | DrawnUIForm shows the existing Alert error |

---

## Testing Checklist

- [ ] "Map to Form" opens modal (no navigation)
- [ ] Modal title shows the display type (e.g. "Question")
- [ ] Form fields are pre-filled from OCR text
- [ ] User can edit fields before submitting
- [ ] Submit creates the object via `POST /interactive-objects`
- [ ] Success toast + `/show/:id` opens in new tab
- [ ] Modal closes after successful submit
- [ ] Close (X) button dismisses modal without saving
- [ ] DrawnUI page at `/add-question/:type/:baseType` works exactly as before
- [ ] Edit page at `/edit-question/:type/:baseType/:id` works exactly as before
