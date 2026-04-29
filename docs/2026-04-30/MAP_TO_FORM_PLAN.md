# Plan: Generic `mapToForm` Conversion (ScanAndUpload → abstractParameter)

## Problem

The current `mapToForm.js` is hardcoded for one type ("Text MCQ") and uses wrong, lowercase parameter names (`"*_question_"`, `"*_option_"`). The actual parameters stored on areas use the exact casing from the API labels (e.g., `"*_Question_"`, `"*_OptionText_"`).

**Current broken output:**
```json
{ "_Question_": "", "Answers  0": [] }
```

**Expected output:**
```json
{
  "_Question_": "Why cells",
  "Answers  1": [
    {
      "_OptionText_": "&m; of cell",
      "_Correct_": false,
      "_ChosenFeedback_": "",
      "_notChosenFeedback_": "",
      "_Tip_": ""
    }
  ]
}
```

---

## Root Causes

| # | Issue | Location |
|---|-------|----------|
| 1 | Parameter comparison uses lowercase (`"*_question_"`) but area stores it as `"*_Question_"` | `mapToForm.js:13-14` |
| 2 | Wrong parameter name used: `"*_option_"` instead of `"*_OptionText_"` | `mapToForm.js:14` |
| 3 | Logic is hardcoded per type instead of driven by the API's `abstractParameter` shape | `mapToForm.js:11-28` |

---

## Data Model (from API: `GET /api/io-types`)

For **Text MCQ**, the API returns:

```json
{
  "typeName": "Text MCQ",
  "labels": [
    { "*_Question_": "text" },
    { "*_OptionText_": "text" },
    { "_ChosenFeedback_": "text" },
    { "_notChosenFeedback_": "text" },
    { "_Tip_": "text" },
    { "#_Correct_": "Bool" }
  ],
  "abstractParameter": {
    "_Question_": "text",
    "Answers  2": [
      {
        "_OptionText_": "text",
        "_Correct_": "Bool",
        "_ChosenFeedback_": "text",
        "_notChosenFeedback_": "text",
        "_Tip_": "text"
      }
    ]
  }
}
```

### Label prefix conventions

| Prefix | Meaning |
|--------|---------|
| `*`    | Required / can repeat (creates array items) |
| `#`    | Boolean type |
| (none) | Optional scalar field |

### Area object (ScanAndUpload)

Each drawn area has:
```js
{
  parameter: "*_Question_",   // exact string from label key (including * or #)
  text: "Why cells",          // OCR-extracted or user-typed value
  type: "text",               // data type
  order: 0,                   // sort order
  // ...geometry, image, etc.
}
```

---

## Algorithm

### Step 1 — Receive inputs

```
mapToForm(typeName, trialAreas, typeDefinitions)
```

- `typeName`: e.g., `"Text MCQ"`
- `trialAreas`: the array of drawn areas (each with `parameter`, `text`, `order`)
- `typeDefinitions`: the full list fetched from `/api/io-types` (already in Zustand store as `types`)

### Step 2 — Resolve type definition

Find the matching type:
```js
const typeDef = typeDefinitions.find(t => t.typeName === typeName);
// → { labels, abstractParameter, ... }
```

### Step 3 — Build a parameter → area map

Sort areas by `order`. Strip the leading `*` or `#` from each area's `parameter` to get the clean field name:

```js
// area.parameter = "*_Question_"  →  fieldName = "_Question_"
// area.parameter = "#_Correct_"   →  fieldName = "_Correct_"

const stripPrefix = (p) => p.replace(/^[*#]/, "");

const areasByField = {};   // { "_Question_": [area, ...], "_OptionText_": [area, ...] }
for (const area of sortedAreas) {
  const field = stripPrefix(area.parameter);
  areasByField[field] = [...(areasByField[field] ?? []), area];
}
```

### Step 4 — Walk `abstractParameter` to build output

Iterate every key/value in `abstractParameter`:

#### 4a — Scalar field (value is a string like `"text"` or `"Bool"`)

```js
if (typeof value === "string") {
  const areas = areasByField[key] ?? [];
  result[key] = areas[0]?.text ?? defaultForType(value);
}
```

`defaultForType`:
- `"text"` → `""`
- `"Bool"` → `false`
- `"image"` → `""`

#### 4b — Array field (value is an array with one template object)

The key looks like `"Answers  2"` — the trailing number is a template artifact; replace it with the actual count of items found.

```js
if (Array.isArray(value)) {
  const template = value[0];              // e.g., { _OptionText_: "text", _Correct_: "Bool", ... }
  const anchorField = findAnchorField(template, typeDef.labels);
  // anchorField = "_OptionText_" (first label key with * prefix that exists in template)

  const anchorAreas = areasByField[anchorField] ?? [];

  const items = anchorAreas.map((anchorArea) => {
    const item = {};
    for (const [templateKey, templateType] of Object.entries(template)) {
      if (templateKey === anchorField) {
        item[templateKey] = resolveValue(anchorArea, templateType);
      } else {
        // other fields: use first available area for that field, or default
        const sibling = areasByField[templateKey]?.[0];
        item[templateKey] = sibling
          ? resolveValue(sibling, templateType)
          : defaultForType(templateType);
      }
    }
    return item;
  });

  // Replace the template number with actual count
  const outputKey = key.replace(/\d+$/, String(items.length));
  result[outputKey] = items;
}
```

**Finding the anchor field:**  
The anchor is the first key in the template that appears in `labels` with a `*` prefix.

```js
function findAnchorField(template, labels) {
  const starredLabels = labels
    .flatMap(Object.keys)
    .filter(k => k.startsWith("*"))
    .map(k => k.slice(1));  // strip *

  return Object.keys(template).find(k => starredLabels.includes(k));
}
```

#### 4c — resolveValue helper

```js
function resolveValue(area, templateType) {
  if (templateType === "Bool") return area.text === "true" || area.text === "1";
  return area.text ?? "";
}
```

---

## Full Expected Trace (Text MCQ example)

**Inputs:**
```
typeName = "Text MCQ"
areas (sorted by order):
  [0] parameter="*_Question_"  text="Why cells"
  [1] parameter="*_OptionText_" text="&m; of cell"
```

**Step 3 — areasByField:**
```js
{
  "_Question_":  [{ text: "Why cells" }],
  "_OptionText_": [{ text: "&m; of cell" }]
}
```

**Step 4 — Walk abstractParameter:**

Key `"_Question_"` (scalar `"text"`):
→ `areasByField["_Question_"][0].text` = `"Why cells"`

Key `"Answers  2"` (array with template `{ _OptionText_, _Correct_, ... }`):
→ anchorField = `"_OptionText_"` (first `*`-labeled key in template)
→ anchorAreas = `[{ text: "&m; of cell" }]`
→ Build 1 item:
  - `_OptionText_` = `"&m; of cell"`
  - `_Correct_` = `false` (default, no area)
  - `_ChosenFeedback_` = `""` (default)
  - `_notChosenFeedback_` = `""` (default)
  - `_Tip_` = `""` (default)
→ outputKey = `"Answers  1"` (replace `2` with actual count `1`)

**Final output:**
```json
{
  "_Question_": "Why cells",
  "Answers  1": [
    {
      "_OptionText_": "&m; of cell",
      "_Correct_": false,
      "_ChosenFeedback_": "",
      "_notChosenFeedback_": "",
      "_Tip_": ""
    }
  ]
}
```

---

## Implementation Plan

### File: `src/utils/mapToForm.js`

Replace the entire file with the generic algorithm above.

**Exported API stays the same:**
```js
export function mapToForm(typeName, trialAreas, typeDefinitions) { ... }
```

No more `switch` statement — works for any type whose `abstractParameter` follows the scalar / array pattern.

### File: `src/components/Studio/Studio.jsx`

Update `handleMapToForm()` to pass `types` from the Zustand store as the third argument:

```js
// Before
const result = mapToForm(type, trialAreas);

// After
const result = mapToForm(type, trialAreas, types);
```

(`types` is already in the store: `const { type, types } = useStore(...)`)

### No other files need to change.

---

## Edge Cases to Handle

| Case | Behaviour |
|------|-----------|
| No area for a required (`*`) scalar field | Use `defaultForType` (empty string / false) |
| Multiple areas for the same scalar field | Use first one (sorted by `order`) |
| Multiple `*_OptionText_` areas | Each creates one answer object |
| Area parameter doesn't match any label | Skip (ignore unknown area) |
| `abstractParameter` key number replacement | Strip trailing digits then append actual count |
| Type not found in `typeDefinitions` | Throw descriptive error: `mapToForm: unknown type "X"` |

---

## Testing Checklist

- [ ] Text MCQ with 1 question + 1 option → `"Answers  1": [...]`
- [ ] Text MCQ with 1 question + 3 options → `"Answers  3": [...]`
- [ ] Text MCQ with no option areas → `"Answers  0": []`
- [ ] Text MCQ with no question area → `_Question_: ""`
- [ ] Another type (e.g., Essay, TrueFalse) works without code changes
- [ ] `stripPrefix` correctly handles `*_Question_`, `#_Correct_`, `_ChosenFeedback_`
