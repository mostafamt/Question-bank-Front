# Plan: "Proof Edit" Button in the DrawnUI Form (Edit Mode Only)

## Goal

In the **DrawnUI form** (`DrawnUIForm.jsx`), show a **Proof Edit** button next to **Submit** when:

1. the form is in `isEditMode`, i.e. opened from `/edit-question/:type/:baseType/:id` (not Studio's Map to Form, not create), **and**
2. the object is a smart object: its type is an `Interactive Smart *` type (`Interactive Smart Video`, `Interactive Smart PDF`, `Interactive Smart PowerPoint`, …) **or** its category is `Smart Object`.

Clicking the button asks the backend for the proof-editing URL and opens it in a new tab.

```
┌ Interactive Smart Video ───────────────────────────────┐
│  _Video_   [ preview ]   [⬆ Upload] [Add Url]          │
│  ...other fields...                                    │
│                                                        │
│              [ Submit ]   [ Proof Edit ]               │
│                            ▲ edit mode + smart only    │
└────────────────────────────────────────────────────────┘
```

The Edit Object page (`/edit/:id`) and the tables do **not** change.

---

## Endpoint (from `NewConvertToPDFNew.postman_collection`)

| | |
|---|---|
| Name | `Proof Editing URL` |
| Method | `GET` |
| URL | `{REACT_APP_REMOTE_URL}/smart-objects/proof-edit/:id` → `https://questions-api-navy.vercel.app/api/smart-objects/proof-edit/:id` |
| Auth | Nothing extra; the shared axios instance already adds the bearer token |
| Response `200` | A **JSON string** (not an object), e.g. `"https://proof-editing.vercel.app/?objId=6ab266afc00b97000411627b"` |

So `res.data` is the URL itself.

---

## What "Edit Mode" Means in `DrawnUIForm`

`DrawnUIForm` already computes two edit flags from its props:

```js
const isEditMode = Boolean(objectId) && !isMapToFormMode;      // /edit-question/:type/:baseType/:id
const isEditMapToForm = Boolean(objectId) && isMapToFormMode;  // Studio → Map to Form on an existing object
```

DrawnUIForm is reached in three ways:

| Entry point | `objectId` | `isMapToFormMode` | Mode | Show button? |
|---|---|---|---|---|
| `/edit-question/:type/:baseType/:id` (`pages/DrawnUI`) | id | – | `isEditMode` | ✅ |
| Edit Object → **Edit** → `/uploads` → Studio → **Map to Form** (`DrawnUIModal`) | id | `true` | `isEditMapToForm` | ❌ |
| New object (any route / Studio without an id) | `null` | any | create | ❌ |

> **Decision:** show the button only in `isEditMode` (`/edit-question/...`).

---

## How It Works

1. In edit mode `getData` already calls `getParameters()`, which fetches `/interactive-objects/:objectId` but keeps only `res.data.parameters`. Change it to also save the whole object in state (`savedObject`), so the form knows its `type` and `category`. No extra request.
2. `isSmartObject(savedObject)` decides whether the object is smart.
3. The button renders inside the existing `submit-box`, after **Submit**, only when `isEditMode && isSmartObject(savedObject)`.
4. On click:
   - open a blank tab right away (`window.open("", "_blank")`), so popup blockers don't block it after the `await`;
   - call `getProofEditUrl(objectId)`;
   - on success set `tab.location.href = url`; on failure close the tab (the service shows a toast).
5. The button has `type="button"` so it does **not** submit the form, and it's disabled while the request runs.

---

## Detection Rule

New helper in `src/utils/typeName.js` (it already handles smart type names):

```js
// Smart objects can be proof-edited (Proof Edit button in the DrawnUI form)
export const isSmartObject = (object) =>
  Boolean(
    toFullTypeName(object?.type)?.startsWith?.("Interactive Smart") ||
      SMART_CATEGORIES.includes(object?.category) // ["Smart Object", "Smart"]
  );
```

Using `toFullTypeName` also covers the legacy objects that store a smart type by media name only (`"video"`, `"PowerPoint"`, `"pdf"`).

### ⚠️ Data check needed before implementing

The sample object from the Postman collection (`6ab266afc00b97000411627b`) is stored as:

```json
{ "type": "video", "category": "Smart", "objectType": "smart", "questionOrExplanation": "S" }
```

- Its `type` is `"video"`, which `toFullTypeName` maps to `Interactive Smart Video`, so the button **would** show. ✅
- Its `category` is `"Smart"`, **not** `"Smart Object"`. So a category-only check for `"Smart Object"` would miss it.

**Question for review:** should the category check also accept `"Smart"` (and/or `objectType === "smart"`)? Proposal: match `category` in `["Smart Object", "Smart"]`. The final rule will follow your answer.

---

## Files That Change

| File | Change |
|------|--------|
| `src/services/api.js` | Add `getProofEditUrl(id)` → `axios2.get(\`/smart-objects/proof-edit/${id}\`)`, return `res.data`; `toast.error` + `null` on failure (same style as the other helpers there). |
| `src/utils/typeName.js` | Add and export `isSmartObject(object)`. |
| `src/utils/typeName.test.js` | Tests for `isSmartObject`: each `Interactive Smart *` type, legacy `video` / `PowerPoint` / `pdf`, category `Smart Object`, and non-smart (`MultipleChoice`, category `Question`) → `false`; `null` / `undefined` → `false`. |
| `src/components/DrawnUI/DrawnUIForm/DrawnUIForm.jsx` | Save the fetched object in `savedObject`; add `proofLoading` state and `onClickProofEdit`; render the **Proof Edit** button in the `submit-box` after **Submit** when `isEditMode && isSmartObject(savedObject)`. |
| `src/pages/DrawnUI/drawnUI.module.scss` | Add `gap: 1rem` to `.submit-box` so the two buttons don't touch. (The existing `& > button` rule only lays out the Submit spinner and is harmless for the new button.) |

**No change needed:**

- `pages/EditObject/EditObject.jsx`, `Table.jsx`, `ObjectsTable.jsx`: the button lives in the DrawnUI form only.
- `pages/DrawnUI/DrawnUI.jsx`, `DrawnUIModal.jsx`, `Studio.jsx`: they already pass `objectId` / `isMapToFormMode`.
- Routes and `axios.js`: the proof-editing app is external, and the existing axios instance already points at `/api`.

---

## Sketch of the `DrawnUIForm` change

```jsx
import { getAllTypes, getProofEditUrl } from "../../../services/api";
import { findTypeByName, isSmartObject } from "../../../utils/typeName";

const [savedObject, setSavedObject] = React.useState(null);
const [proofLoading, setProofLoading] = React.useState(false);

const getParameters = async () => {
  const res = await axios.get(`/interactive-objects/${objectId}`);
  setSavedObject(res.data);
  return res.data.parameters;
};

const onClickProofEdit = async () => {
  const tab = window.open("", "_blank");
  setProofLoading(true);
  const url = await getProofEditUrl(objectId);
  setProofLoading(false);
  if (url && tab) tab.location.href = url;
  else tab?.close();
};

// inside parseParameters, level === 1, after the Submit button:
{isEditMode && isSmartObject(savedObject) && (
  <Button
    type="button"
    variant="contained"
    onClick={onClickProofEdit}
    disabled={proofLoading}
    sx={{ mt: 4 }}
  >
    Proof Edit
  </Button>
)}
```

---

## Testing

1. `npm test -- typeName` passes with the new `isSmartObject` cases.
2. Optional: `DrawnUIForm.test.jsx` (new) mocking `axios` / `getAllTypes` to check:
   - edit mode + smart object → **Proof Edit** shown;
   - edit mode + non-smart object → hidden;
   - create mode (`objectId = null`) → hidden;
   - clicking **Proof Edit** doesn't submit the form.
3. Manual:
   - Open `/edit-question/Interactive%20Smart%20Video/Interactive%20Smart%20Video/6ab266afc00b97000411627b` → **Proof Edit** visible → click → new tab opens `https://proof-editing.vercel.app/?objId=6ab266afc00b97000411627b`.
   - Edit Object → **Edit** → Studio → **Map to Form** on the same object → **no** button.
   - Create a new smart object → **no** Proof Edit button.
   - Edit a non-smart object (e.g. MultipleChoice) → no button.
   - Simulate an API failure (offline) → toast error, blank tab closes, button re-enabled.
4. **Submit** still saves as before (edit and create).

---

## Decisions

1. Edit flow: only `/edit-question/...` (`isEditMode`).
2. Category: both `"Smart Object"` and `"Smart"` count as smart.
3. Opens in a new tab; label `Proof Edit`, right of **Submit**.
