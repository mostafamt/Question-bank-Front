# Plan: DrawnUIForm "Map-to-Form Edit Mode"

## Goal

When the user clicks **"Map to Form"** in Studio, the `DrawnUIModal` opens and the
`DrawnUIForm` inside it should behave like an **edit/pre-filled form** — all fields
are populated from the scanned areas — even though no `objectId` exists yet in the
back-end. On submit the form must still **create** a new object (POST), not patch one.

---

## Current Flow (as-is)

```
Studio.handleMapToForm()
  └─ mapToForm(type, trialAreas, types)  →  mappedJson
  └─ setDrawnUIOpen(true)

<DrawnUIModal
  open={drawnUIOpen}
  initialValues={mappedJson}
  objectId={null}          ← always null from this path
/>
  └─ <DrawnUIForm
       initialValues={mappedJson}
       objectId={null}
     />
       └─ isEditMode = Boolean(null)  →  false  ← always CREATE mode
       └─ getData() returns initialValues         ← pre-fill already works
       └─ onSubmit() → saveObject() (POST)        ← correct
```

The form technically *shows* the mapped values but is tagged as **create mode**
(`isEditMode = false`).  The missing piece is an explicit concept for "I have
pre-populated data from a scan but no back-end ID yet."

---

## Problem

| | Create mode | Desired map-to-form mode | Edit mode |
|---|---|---|---|
| `objectId` | `null` | `null` | `string` |
| `initialValues` | `null` | `{ ...mappedJson }` | ignored |
| Fetch params from API? | no | no | **yes** |
| Pre-fill form? | no | **yes** | yes (from API) |
| Submit action | POST create | POST create | PATCH update |
| Visual indicator | none | **"Pre-filled from scan"** banner | none |

Currently `DrawnUIForm` only distinguishes two modes (create / edit).
There is no first-class "map-to-form" mode.

---

## Proposed Solution

Introduce a dedicated boolean prop `isMapToFormMode` on `DrawnUIForm`.

When `isMapToFormMode = true`:
- Skip the `getParameters()` API call (no `objectId` to fetch from).
- Use `initialValues` (the mapped JSON) as the form's default values.
- On submit always call `saveObject()` (POST create).
- Render a visual banner indicating the form is pre-filled from the scan.
- Keep the submit button label as **"Create"** (not "Update").

---

## Implementation Steps

### Step 1 — Add `isMapToFormMode` prop to `DrawnUIForm`

**File:** `src/components/DrawnUI/DrawnUIForm/DrawnUIForm.jsx`

```jsx
// Before
const DrawnUIForm = ({ baseType, initialValues, initialColors, objectId, onSuccess }) => {
  const isEditMode = Boolean(objectId);
  ...

// After
const DrawnUIForm = ({
  baseType,
  initialValues,
  initialColors,
  objectId,
  onSuccess,
  isMapToFormMode,   // ← new prop
}) => {
  const isEditMode = Boolean(objectId) && !isMapToFormMode;
```

### Step 2 — Guard the `getParameters()` call inside `getData()`

**File:** `src/components/DrawnUI/DrawnUIForm/DrawnUIForm.jsx` — `getData()` function

```js
// Current (line ~79)
if (isEditMode) {
  const saved = await getParameters();
  return remapToAbstractKeys(saved, abstractParameter);
}
return initialValues ?? emptyValues(abstractParameter);

// After
if (isEditMode) {
  const saved = await getParameters();
  return remapToAbstractKeys(saved, abstractParameter);
}
// isMapToFormMode: use mapped values directly, no API call needed
return initialValues ?? emptyValues(abstractParameter);
// (no code change needed here — the existing fallback already handles it,
//  but the isEditMode guard above now correctly excludes isMapToFormMode)
```

> Because `isEditMode` is now `false` when `isMapToFormMode=true`, the
> `getParameters()` fetch is skipped automatically and `initialValues` is used.

### Step 3 — Ensure `onSubmit` always POSTs when `isMapToFormMode=true`

**File:** `src/components/DrawnUI/DrawnUIForm/DrawnUIForm.jsx` — `onSubmit`

```js
// Current
const onSubmit = async (formValues) => {
  setValues(formValues);
  if (isEditMode) {
    await editObject(formValues);
  } else {
    await saveObject(formValues);
  }
};

// No change needed — because isEditMode is false when isMapToFormMode=true,
// saveObject() (POST) is already called. ✓
```

### Step 4 — Add a visual "Pre-filled from scan" banner

**File:** `src/components/DrawnUI/DrawnUIForm/DrawnUIForm.jsx` — render section

```jsx
return (
  <form className="mb-4" onSubmit={handleSubmit(onSubmit)}>
    {isMapToFormMode && (
      <Alert severity="info" sx={{ mb: 2 }}>
        Fields are pre-filled from scanned areas. Review and submit to create a new object.
      </Alert>
    )}
    {abstractParameters && parseParameters(abstractParameters)}
  </form>
);
```

### Step 5 — Pass `isMapToFormMode` from `DrawnUIModal`

**File:** `src/components/DrawnUIModal/DrawnUIModal.jsx`

```jsx
// Add prop to the component signature
const DrawnUIModal = ({
  open,
  onClose,
  baseType,
  displayType,
  initialValues,
  initialColors,
  trialAreas,
  isMapToFormMode,    // ← new
}) => (
  ...
  <DrawnUIForm
    baseType={baseType}
    initialValues={initialValues}
    initialColors={initialColors}
    objectId={null}
    onSuccess={onClose}
    isMapToFormMode={isMapToFormMode}    // ← pass through
  />
  ...
);
```

### Step 6 — Pass `isMapToFormMode={true}` from Studio

**File:** `src/components/Studio/Studio.jsx`

```jsx
// Around line 334
<DrawnUIModal
  open={drawnUIOpen}
  onClose={() => setDrawnUIOpen(false)}
  baseType={state.type}
  displayType={state.higherType}
  initialValues={mappedJson}
  initialColors={initialColors}
  trialAreas={trialAreas}
  isMapToFormMode={true}    // ← add this
/>
```

---

## Files Changed

| File | Change |
|---|---|
| `src/components/DrawnUI/DrawnUIForm/DrawnUIForm.jsx` | Add `isMapToFormMode` prop; adjust `isEditMode` guard; add info banner |
| `src/components/DrawnUIModal/DrawnUIModal.jsx` | Accept + forward `isMapToFormMode` prop |
| `src/components/Studio/Studio.jsx` | Pass `isMapToFormMode={true}` to `DrawnUIModal` |

---

## Data Flow After the Change

```
Studio.handleMapToForm()
  └─ mappedJson = mapToForm(...)         ← from trialAreas, no API
  └─ setDrawnUIOpen(true)

<DrawnUIModal isMapToFormMode={true} initialValues={mappedJson} />
  └─ <DrawnUIForm isMapToFormMode={true} objectId={null} initialValues={mappedJson} />
       └─ isEditMode = false              ← no objectId, no API fetch
       └─ getData() → returns mappedJson  ← pre-fill from scan
       └─ banner shown: "Pre-filled from scan"
       └─ onSubmit() → saveObject() POST  ← creates new object ✓
```

---

## What Does NOT Change

- The normal **edit flow** (`objectId` provided, no `isMapToFormMode`) is unchanged.
- The normal **create flow** (`objectId=null`, no `initialValues`) is unchanged.
- `mapToForm()` utility is unchanged.
- `AreaList` drag-and-drop in the modal is unchanged.

---

## Testing Checklist

- [ ] Map-to-form path: open DrawnUIModal, form is pre-filled with scanned values.
- [ ] Map-to-form path: info banner is visible.
- [ ] Map-to-form path: submit calls POST `/interactive-objects` (not PATCH).
- [ ] Map-to-form path: no API call to `/interactive-objects/:id` is made.
- [ ] Normal create path (no initialValues): form is empty, no banner.
- [ ] Normal edit path (with objectId): form fetches from API, banner not shown, submit is PATCH.
