# Plan: Match "Smart Interactive" and "Interactive Smart" Type Names

## Overview

`GET /api/io-types` uses two spellings for the same three types. Add one small utility so the frontend treats both spellings as the same type, and keeps working when the backend settles on either one.

**Status:** implemented on 2026-10-31, not yet committed. The manual checks below are still to do, because the app requires a real login.

---

## The Problem

The `Smart Object` category points to type names that don't exist. Its labels are `{ displayName: typeName }`, and the value should match a type record's `typeName`:

| Category label value | Actual type record `typeName` | Exact match today |
|---|---|---|
| `Smart Interactive Video` | `Interactive Smart Video` | No |
| `Smart Interactive PDF` | `Interactive Smart PDF` | No |
| `Smart Interactive PowerPoint` | `Interactive Smart PowerPoint` | No |

All the lookups use `===`, so selecting any of these types fails:

| Add Object button | Result today (from reading the code, not run in a browser) |
|---|---|
| Manual Form | `DrawnUIForm` finds no type, then `getSchema(undefined)` throws on `Object.entries` during render, so the "Abstract Parameters is missing!" alert is never reached |
| Scan / OCR | `AddObject.jsx:118` reads `selectedTypeObject.labels` on `undefined` and throws |
| Auto Gen | Same error at `AddObject.jsx:142` |

**Saved data is not affected.** All 1,416 objects in `/interactive-objects` were checked on 2026-10-31, and none use either spelling in `baseType`. No migration is needed.

---

## Key Design Decisions

### 1. Normalize only for comparison

Both spellings map to one internal comparison key. That key is never displayed, stored or sent to the backend, so it doesn't matter which spelling is chosen for it, and it doesn't need changing when the backend picks a final name.

### 2. Rewrite only the two-word prefix

Only a leading `Interactive Smart ` is rewritten. Everything else must still match exactly.

| Compared | Same type? |
|---|---|
| `Interactive Smart Video` / `Smart Interactive Video` | Yes |
| `Interactive Video` / `Interactive Smart Video` | **No.** `Interactive Video` is a separate type (category `X`) and must stay separate |

Sorting the words or ignoring case was rejected. Both would match more names than this problem needs, and could silently join unrelated types.

### 3. Exact match wins

`findTypeByName` tries an exact match first and only then the normalized match. If the backend briefly has both spellings as separate records during its fix, each name still finds its own record.

### 4. Use the backend's spelling once resolved

After a lookup, use `found.typeName` rather than the label value. The frontend then passes along whatever the backend currently calls the type, and never hardcodes a spelling.

---

## Files to Change

| File | Change |
|---|---|
| `src/utils/typeName.js` | **New:** the utility below |
| `src/utils/typeName.test.js` | **New:** unit tests |
| `src/components/DrawnUI/DrawnUIForm/DrawnUIForm.jsx:68` | Use `findTypeByName` |
| `src/pages/AddObject/AddObject.jsx:111,135` | Use `findTypeByName`; set `data.type` to `selectedTypeObject.typeName` |
| `src/pages/StudioPage/StudioPage.jsx:42` | Use `findTypeByName` |
| `src/components/AreaAction/AreaAction.jsx:38` | Use `findTypeByName` |
| `src/utils/ocr.js:55` | Use `findTypeByName` in `getTypeOfParameter` |
| `src/utils/mapToForm.js:4` | Use `findTypeByName` |

### Deliberately not changed

- **Category lookups:** `AddObject.jsx:151`, `EditObjectModal.jsx:72`, `SubObjectHeader.jsx:21`, `helper.js:36` and `api.js:62` match category names such as `Smart Object`, which aren't affected.
- **`getBaseTypeFromType` (`helper.js:39`):** it compares a dropdown value with the labels that dropdown was built from, so the two always agree.
- **`EditObject.jsx:218`:** this type dropdown is disabled and already adds the object's own type as an option, so a rename can't break it.
- **Display text:** dropdowns keep showing the label as the API sends it. It updates by itself when the backend changes it.

---

## Implementation

### Step 1: Add the utility

```js
// src/utils/typeName.js

// The API spells these types both ways, e.g. "Smart Interactive Video" and
// "Interactive Smart Video". The result is only for comparing names: never
// display, store or send it.
const normalizeTypeName = (name) =>
  typeof name === "string"
    ? name.replace(/^Interactive Smart /, "Smart Interactive ")
    : name;

export const isSameTypeName = (first, second) =>
  normalizeTypeName(first) === normalizeTypeName(second);

export const findTypeByName = (types, name) =>
  types?.find((type) => type.typeName === name) ??
  types?.find((type) => isSameTypeName(type.typeName, name));
```

### Step 2: Replace the lookups

```js
// Before
const found = objects.find((item) => item.typeName === baseType);

// After
const found = findTypeByName(objects, baseType);
```

### Step 3: Use the backend's spelling in `AddObject`

Apply this in both `onSubmitOcr` and `onSubmitAutoGen`:

```js
const baseType = getBaseTypeFromType(categories, watch("category"), type);
const selectedTypeObject = findTypeByName(interactiveObjectTypes, baseType);
data = { ...data, type: selectedTypeObject?.typeName ?? baseType };
```

---

## Testing

### Unit tests (`typeName.test.js`)

- Both spellings match for Video, PDF and PowerPoint, in either argument order.
- `Interactive Video` matches neither smart spelling.
- An exact match is preferred when both spellings exist as records.
- `findTypeByName` returns `undefined` for an unknown name, `undefined` types or a `null` name.

### Backend rename check

The matching logic was run against a live copy of `/io-types` in all three states:

| Scenario | Exact match | `findTypeByName` |
|---|---|---|
| Today (mixed spellings) | 0 of 3 found | 3 of 3 found |
| Backend standardizes on `Smart Interactive ...` | 3 of 3 found | 3 of 3 found |
| Backend standardizes on `Interactive Smart ...` | 3 of 3 found | 3 of 3 found |

The unit tests should keep these three scenarios as fixtures.

### Manual checks

For Smart Interactive Video and PDF, in Add Object:

1. **Manual Form:** the form opens, and the object saves and appears in `/show`.
2. **Auto Gen and Scan:** the Studio opens without a console error.
3. **Saved record:** check the `type` and `baseType` the backend stored (see open question 3).

---

## Open Questions

### 1. PowerPoint field (resolved)

The type's `_File_` field has type `ppt`, which had no input component. `ppt` now maps to `<Pdf kind="ppt" />` in `AUTO_UI_TYPES_MAPPING`, so it shares the PDF preview, pager, retry and URL field. Files convert through the same `/to-images` endpoint, which was confirmed to accept both `.pptx` and `.ppt`.

### 2. Backend: two types share one `_id`

`Interactive Video` and `Interactive Smart Video` both return `_id` `666b89417131dd0045d5c28f`. `Types.jsx:59` deletes and `AddType.jsx:24` loads by that id, so acting on one may affect the other. This needs a backend fix and isn't solved by this plan.

**Recommendation:** raise it with the backend owner, and avoid deleting either type from the Types page until it's resolved.

### 3. Backend: does `POST /interactive-objects` accept the label spelling?

The Manual Form flow sends `type: state.type`, which is the dropdown label rather than the base type. That's existing behavior for every type, and this plan leaves it alone so that aliases such as `Analytics` → `Chart` keep working. No test object was created to check it, so the manual check above confirms it. If the backend rejects the label spelling, `DrawnUIForm.saveObject` should send `selectedType.typeName` for these types.

---

## Out of Scope

- `Simulation Object` is both a category and a type. A lookup over all types returns the category record first, which has no `abstractParameter`.
- The `Exercise` category label `ExercisePage` points to `image`, which isn't a type.
