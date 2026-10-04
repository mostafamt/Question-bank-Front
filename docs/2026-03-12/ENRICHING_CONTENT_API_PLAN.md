# Plan: Wire Enriching Content Tab to Backend API

## Background

The Enriching Content tab (`enriching-contents`) currently has a placeholder
submit handler that only logs to the console. The retrieve query goes through the
generic `getTabObjects` which returns data in a different shape than what the
frontend expects. The backend endpoints are now ready.

---

## API Contract (from Postman)

### Retrieve
```
GET /chapters/:chapterId/enriching-contents
```

**Response** — array of items. Object-type items are populated server-side:
```json
[
  { "contentType": "text",   "contentValue": "This is a test" },
  { "contentType": "url",    "contentValue": "https://..." },
  {
    "contentType": "object",
    "contentValue": "69ac1cc8053ce50004a142d7",
    "_id":      "69ac1cc8053ce50004a142d7",
    "name":     "Question - 2a58413b-...",
    "url":      "https://...html",
    "type":     "Image Blinder (Agamotto)",
    "baseType": "Image Blinder (Agamotto)"
  }
]
```

### Submit
```
POST /chapters/:chapterId/enriching-contents
Body: { "enrichingContents": [ { "contentType": "...", "contentValue": "..." } ] }
```

**Response:**
```json
{
  "message": "Chapter updated successfully.",
  "enrichingContents": [ ... ]
}
```

---

## Field Mapping

| Frontend `type` | API `contentType` |
|---|---|
| `"text"`   | `"text"`   |
| `"link"`   | `"url"`    |
| `"object"` | `"object"` |

The only mismatch is `"link"` ↔ `"url"`.

---

## What Changes

### 1. `src/services/api.js` — add two dedicated functions

**Add `getEnrichingContents`:**
```js
export const getEnrichingContents = async (chapterId) => {
  try {
    const res = await axios2.get(`/chapters/${chapterId}/enriching-contents`);
    return res.data;
  } catch (error) {
    toast.error(error?.message);
    return [];
  }
};
```

**Add `submitEnrichingContents`:**
```js
export const submitEnrichingContents = async (chapterId, items) => {
  try {
    const res = await axios2.post(`/chapters/${chapterId}/enriching-contents`, {
      enrichingContents: items,
    });
    toast.success(res.data?.message);
    return res.data;
  } catch (error) {
    toast.error(error?.message);
    toast.error(error?.response?.data?.message);
    return null;
  }
};
```

These are standalone functions — the existing generic `getTabObjects` /
`updateTabObjects` are left untouched (still used by other tabs).

---

### 2. `src/components/Tabs/List/List.jsx` — 3 targeted changes

#### 2a. Import the new API functions
```js
import {
  getTabObjects,
  updateTabObjects,
  getEnrichingContents,
  submitEnrichingContents,
} from "../../../services/api";
```

#### 2b. Replace the `useQuery` for Enriching Content

Currently a single `useQuery` using `getTabObjects` handles all tabs.
Split it so the Enriching Content tab uses `getEnrichingContents` and maps
the API shape to the local item shape:

```js
const isEnrichingContent =
  tab.name === LEFT_TAB_NAMES.ENRICHING_CONTENT.name;

const { data: tabObjects, isFetching } = useQuery({
  queryKey: [`tab-objects-${tab.name}`],
  queryFn: isEnrichingContent
    ? () => getEnrichingContents(chapterId)
    : () => getTabObjects(chapterId, tab.name),
  refetchOnWindowFocus: false,
});
```

Then in the `useEffect` that populates `objects`, map the API shape to the
local shape for enriching content items:

```js
React.useEffect(() => {
  if (!tabObjects) return;

  if (isEnrichingContent) {
    const mapped = tabObjects.map((item) => ({
      _id:          item._id || Date.now().toString() + Math.random(),
      type:         item.contentType === "url" ? "link" : item.contentType,
      contentValue: item.contentValue,
      name:         deriveEnrichingContentName(
                      item.contentType === "url" ? "link" : item.contentType,
                      item.contentValue
                    ),
      // carry through populated object fields for play
      url:          item.url,
      baseType:     item.baseType,
    }));
    setObjects(mapped);
  } else {
    setObjects(tabObjects);
  }
}, [tabObjects, tab]);
```

#### 2c. Replace the placeholder `onSubmitHandler` for Enriching Content

```js
const onSubmitHandler = async () => {
  if (isEnrichingContent) {
    const payload = objects.map((item) => ({
      contentType:  item.type === "link" ? "url" : item.type,
      contentValue: item.contentValue,
    }));
    await submitEnrichingContents(chapterId, payload);
    return;
  }

  // existing logic unchanged below
  const ids = { ids: objects.map((item) => item._id) };
  if (tab.name === RIGHT_TAB_NAMES.GLOSSARY_KEYWORDS.name) {
    ...
  } else {
    await mutation.mutateAsync(ids);
  }
};
```

---

---

## 3. Player — `handlePlay` in `List.jsx`

The play button on each list item calls `handlePlay(item)`. There are three
content types and each needs a different player.

### `type: "text"` → `TextEditorModal` (read-only Quill)

```js
openModal("text-editor", { value: item.contentValue });
```

`TextEditorModal` treats itself as read-only when no `onClickSubmit` is passed
(`isReadOnly = !onClickSubmit`). **No change needed — already works.**

---

### `type: "link"` → `IframeDisplayModal`

```js
openModal("iframe-display", { url: item.contentValue });
```

`IframeDisplayModal` renders the URL in an iframe with YouTube/Vimeo embed
support. **No change needed — already works.**

---

### `type: "object"` → `PlayObjectModal` — **currently broken, needs fix**

**Current code:**
```js
openModal("play-object", {
  workingArea: {
    text: item.contentValue,
    contentValue: item.contentValue,
    contentType: "object",      // ← hardcoded
    typeOfLabel: "object",      // ← hardcoded
  },
});
```

**The bug:** `PlayObjectModal` checks `isComplexType(workingArea.contentType)`.
`"object"` is not in `COMPLEX_TYPES`, so it falls to the `else` branch and
renders `workingArea.contentValue` as raw text — showing the object ID string
instead of the player.

**The fix:** After the API integration, the local item carries `item.baseType`
(e.g. `"Image Blinder (Agamotto)"`) retrieved from the backend. Pass it as
`contentType` so `isComplexType` and the SnapLearning check work correctly:

```js
openModal("play-object", {
  workingArea: {
    text: item.contentValue,
    contentValue: item.contentValue,
    contentType: item.baseType || "Text MCQ",
    typeOfLabel: item.baseType || "Text MCQ",
  },
});
```

**Result per `baseType`:**

| `baseType` | Behaviour in `PlayObjectModal` |
|---|---|
| `"SnapLearning Object"` | Caught by `object?.baseType === "SnapLearning Object"` → renders `<SnapLearningPlayer>` |
| Any value in `COMPLEX_TYPES` (e.g. `"Image Blinder"`) | `isComplexType` → true → fetches `object.url`, renders iframe |
| Text-based type | Falls to `else` → renders `contentValue` as text |

> `PlayObjectModal` still does its own `getObject` fetch to get full data
> (including `parameters` needed by SnapLearningPlayer). Passing `url` directly
> would skip the fetch for regular objects but would break SnapLearning.
> Re-fetching is acceptable here.

**This is a one-line change inside the existing `handlePlay` enriching content
branch in `List.jsx`.**

---

## What Does NOT Change

| Thing | Why |
|---|---|
| `EnrichingContentModal.jsx` | Still emits `{ type, contentValue }` |
| `deriveEnrichingContentName` | Still works with frontend `type` values |
| `getTabObjects` / `updateTabObjects` | Still used by all other tabs |
| `handleDelete` | Uses local `_id` |
| `TextEditorModal` | Read-only mode already works for `text` type |
| `IframeDisplayModal` | Already works for `link` type |
| `PlayObjectModal` | Already handles SnapLearning + complex types — only the caller changes |
| All other tabs | Unaffected |

---

## Files Summary

| Action | File |
|---|---|
| **Edit** | `src/services/api.js` — add `getEnrichingContents`, `submitEnrichingContents` |
| **Edit** | `src/components/Tabs/List/List.jsx` — imports, `useQuery`, `useEffect` (mapping), `onSubmitHandler`, `handlePlay` (object type fix) |

---

## Edge Cases

| Case | Handling |
|---|---|
| API returns empty array | `objects` set to `[]`, list shows "Enriching Content is empty" |
| `text`/`url` items have no `_id` | Use `Date.now() + Math.random()` as local key |
| Submit fails | `toast.error` shown, state unchanged |
| `baseType` missing on object item | Falls back to `"Text MCQ"` in `handlePlay` |
| SnapLearning Object played | `PlayObjectModal` re-fetches full object (needs `parameters`) and shows `SnapLearningPlayer` |
