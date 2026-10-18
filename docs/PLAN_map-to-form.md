# Feature Plan: "Map to Form" Button in AreaActions

## Goal

Add a **"Map to Form"** button alongside the existing Submit button in `AreaActions`.  
When clicked, it converts the current `trialAreas` array into a structured JSON object
that matches the selected question type (e.g. `Text_MCQ`), then populates a preview/edit
dialog so the user can review and optionally submit the mapped data.

---

## Relevant Files

| File | Role |
|------|------|
| `src/components/AreaActions/AreaActions.jsx` | Add the new button here |
| `src/components/Studio/Studio.jsx` | Owns `trialAreas` state; wire new handler here |
| `src/utils/ocr.js` | Existing type list (`getSimpleTypes`) |
| `src/services/data.js` | Type definitions with `labels` and `abstractParameter` |
| `src/utils/mapToForm.js` | **New file** — mapping logic lives here |
| `src/components/MapToFormDialog/MapToFormDialog.jsx` | **New file** — preview dialog |

---

## Data Flow

```
trialAreas  (array of { parameter, text, image, type, order })
     │
     ▼
mapToForm(type, trialAreas)          ← pure function in mapToForm.js
     │
     ▼
Structured JSON  (e.g. Text_MCQ shape)
     │
     ▼
MapToFormDialog  (shows JSON, allows editing)
     │
     ▼
User confirms → (optional) pass JSON to existing saveObject API
```

---

## Step 1 — Mapping Function (`src/utils/mapToForm.js`)

Create a pure function with this signature:

```js
export function mapToForm(type, trialAreas) { ... }
// returns: structured JSON object
```

### Text_MCQ mapping rules

`trialAreas` for a Text MCQ question will typically contain areas with these `parameter` values
(set via `AreaActionHeader`):

| `area.parameter` | Maps to |
|------------------|---------|
| `"text"` (first one, by order) | `_Question_` |
| `"MCQ"` (each, by order) | one entry in the `Answers` array |

**Output shape:**
```json
{
  "_Question_": "<text of the first 'text' area>",
  "Answers  <count>": [
    {
      "_OptionText_": "<text of MCQ area>",
      "_Correct_": false,
      "_ChosenFeedback_": "",
      "_notChosenFeedback_": "",
      "_Tip_": ""
    }
  ]
}
```

The key `"Answers  <count>"` uses two spaces before the count (matching the existing API
format observed in the example).

### Extensibility

Use a `switch` (or a map of handlers) on `type` so each question type can define its own
mapping. Start with `Text_MCQ`; stub the others with `throw new Error("Not implemented")`.

```js
export function mapToForm(type, trialAreas) {
  const sorted = [...trialAreas].sort((a, b) => a.order - b.order);
  switch (type) {
    case "Text MCQ": return mapTextMCQ(sorted);
    // case "TrueFalse": return mapTrueFalse(sorted);
    default:
      throw new Error(`mapToForm: type "${type}" is not yet supported`);
  }
}
```

---

## Step 2 — MapToFormDialog (`src/components/MapToFormDialog/MapToFormDialog.jsx`)

A MUI `Dialog` that:

1. Receives `open`, `onClose`, `json` (the mapped object), and `onConfirm` props.
2. Renders the JSON in an editable `<textarea>` (or MUI `TextField` multiline) pre-filled
   with `JSON.stringify(json, null, 2)`.
3. Validates JSON on every change; shows an inline error if invalid.
4. Has two actions:
   - **Cancel** — calls `onClose`
   - **Confirm** — parses the textarea content, calls `onConfirm(parsedJson)`

---

## Step 3 — Wire State in `Studio.jsx`

Add two new state items:

```js
const [mapToFormOpen, setMapToFormOpen] = React.useState(false);
const [mappedJson, setMappedJson]       = React.useState(null);
```

Add handler:

```js
const handleMapToForm = () => {
  try {
    const json = mapToForm(type, trialAreas);
    setMappedJson(json);
    setMapToFormOpen(true);
  } catch (e) {
    // toast error: type not supported yet
  }
};
```

Pass to `AreaActions`:

```jsx
<AreaActions
  ...existing props...
  onClickMapToForm={handleMapToForm}
/>
```

Render dialog:

```jsx
<MapToFormDialog
  open={mapToFormOpen}
  onClose={() => setMapToFormOpen(false)}
  json={mappedJson}
  onConfirm={(json) => {
    // optional: call saveObject with the mapped json
    setMapToFormOpen(false);
  }}
/>
```

---

## Step 4 — Add Button in `AreaActions.jsx`

Place the new button directly above (or below) the existing Submit button, inside the
same `trialAreas.length > 0` guard:

```jsx
{trialAreas.length > 0 && (
  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
    <Button
      variant="outlined"
      onClick={onClickMapToForm}
      sx={{ width: "100%" }}
      startIcon={<TableViewIcon />}
    >
      Map to Form
    </Button>

    <Button
      variant="contained"
      onClick={onClickSubmit}
      sx={{ width: "100%" }}
      disabled={loadingSubmit}
      startIcon={loadingSubmit ? <CircularProgress size="1rem" /> : <></>}
    >
      Submit
    </Button>
  </div>
)}
```

Add `onClickMapToForm` to the destructured props at the top of `AreaActions.jsx`.

---

## Step 5 — Handle Unsupported Types

In `handleMapToForm` (Studio.jsx), catch the error thrown by `mapToForm` and show a
MUI `Snackbar` / toast:

```
"Map to Form is not yet supported for type '<type>'"
```

---

## Out of Scope (for now)

- Mapping logic for all types other than `Text MCQ`
- Auto-submitting the mapped JSON (Confirm in the dialog closes it; actual submission
  is left to the existing Submit button)
- Validating that the user selected the right parameters before mapping

---

## Acceptance Criteria

- [ ] "Map to Form" button appears only when `trialAreas.length > 0`
- [ ] Clicking it for a `Text MCQ` type produces the correct JSON shape
- [ ] The dialog opens with the JSON pre-filled and editable
- [ ] Invalid JSON in the dialog shows an error and disables Confirm
- [ ] Clicking Confirm with valid JSON closes the dialog
- [ ] Unsupported types show a toast error and do not open the dialog
- [ ] Existing Submit button behavior is unchanged
