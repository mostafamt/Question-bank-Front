# Plan: "One Of" (`?`) Validation Support in DrawnUI

## Overview

Add support for the `?` prefix on label keys. When multiple fields share the `?` prefix, the user must fill exactly **one** of them. The UI renders a radio button group to choose which field to use, then displays only the selected field's input.

**Example from SnapLearning Object labels:**
```json
{ "?Picture": "image" },
{ "?Voice": "audio" },
{ "?InteractiveObject": "XObject" }
```
→ User picks one of: Picture | Voice | InteractiveObject

---

## How Labels Work Today

Labels are an array of `{ "KeyName": "type" }` objects. Current restrictions:
- `*KeyName` → field is **required**
- `KeyName` (plain) → field is optional

New restriction:
- `?KeyName` → field belongs to a **"one of" group** — exactly one must be filled

---

## Key Design Decisions

### 1. Grouping
All consecutive `?`-prefixed keys in the labels array form a single "one of" group. They are rendered together as one `OneOfUI` block instead of individual fields.

Non-consecutive `?` fields (unlikely but possible) each form their own group.

### 2. Selection mechanism
A `RadioGroup` (MUI) lets the user choose which field to fill. Only the selected field's component is rendered below the radio buttons.

### 3. Form value behavior
When the user switches selection:
- The **newly selected** field becomes active.
- The **previously selected** field's value is cleared (`setValue(name, "")`) so no stale data is submitted.

### 4. Validation
Only the selected field needs to be validated. Since `?` fields are not marked with `*` (required), they are individually optional — but the group requires exactly one to be filled. A custom yup validation will enforce this at the group level.

---

## Files to Change

| File | Change |
|------|--------|
| `src/utils/auto-ui.js` | Add `searchIfOneOf(labels, key)` helper + `groupOneOfFields(abstractParameters, labels)` |
| `src/pages/DrawnUI/DrawnUI.jsx` | In `parseParameters()`, detect one-of groups and render `OneOfUI` |
| `src/components/DrawnUI/OneOfUI/OneOfUI.jsx` | **New** — radio group + dynamic field renderer |
| `src/components/DrawnUI/OneOfUI/oneOfUI.module.scss` | **New** — styles |

---

## Step-by-Step Plan

### Step 1 — Add helpers to `auto-ui.js`

```js
// Returns true if the label key has a "?" prefix
export const searchIfOneOf = (labels, key) => {
  return labels.some((item) => {
    const labelKey = Object.keys(item)[0];
    return trimText(labelKey) === key && labelKey.startsWith("?");
  });
};

// Groups abstractParameter entries into segments:
// - Plain entries → { oneOf: false, key, value }
// - Consecutive ?-prefixed entries → { oneOf: true, fields: [{ key, value }, ...] }
export const groupOneOfFields = (abstractParameters, labels) => {
  const entries = Object.entries(abstractParameters);
  const groups = [];
  let currentOneOfGroup = null;

  for (const [key, value] of entries) {
    if (searchIfOneOf(labels, key)) {
      if (!currentOneOfGroup) {
        currentOneOfGroup = { oneOf: true, fields: [] };
        groups.push(currentOneOfGroup);
      }
      currentOneOfGroup.fields.push({ key, value });
    } else {
      currentOneOfGroup = null;
      groups.push({ oneOf: false, key, value });
    }
  }

  return groups;
};
```

### Step 2 — Update `parseParameters()` in `DrawnUI.jsx`

Replace the current flat `for...of` loop with iteration over `groupOneOfFields(...)`:

```js
const groups = groupOneOfFields(abstractParameters, labels);

for (const group of groups) {
  if (group.oneOf) {
    // Render <OneOfUI> with all fields in the group
    item = (
      <OneOfUI
        fields={group.fields}
        labels={labels}
        // ...shared props (control, setValue, getValues, register, errors, level, index, arrayName, space)
        renderField={renderSingleField} // extracted helper
      />
    );
  } else {
    // Existing single-field rendering logic (unchanged)
    item = renderSingleField(group.key, group.value, ...);
  }
}
```

> **Note:** Extract the current per-field rendering logic into a `renderSingleField(key, value, properties)` helper to avoid duplication.

### Step 3 — Create `OneOfUI` Component

```jsx
// src/components/DrawnUI/OneOfUI/OneOfUI.jsx

const OneOfUI = ({ fields, labels, control, setValue, renderField, ...sharedProps }) => {
  const [selectedKey, setSelectedKey] = React.useState(fields[0].key);

  const onRadioChange = (e) => {
    const newKey = e.target.value;
    // Clear the previously selected field's value
    const prevName = /* build name from selectedKey + sharedProps */;
    setValue(prevName, "");
    setSelectedKey(newKey);
  };

  const activeField = fields.find((f) => f.key === selectedKey);

  return (
    <Box>
      <RadioGroup row value={selectedKey} onChange={onRadioChange}>
        {fields.map(({ key }) => (
          <FormControlLabel key={key} value={key} control={<Radio />} label={key} />
        ))}
      </RadioGroup>
      {/* Render only the active field */}
      {renderField(activeField.key, activeField.value, sharedProps)}
    </Box>
  );
};
```

### Step 4 — Yup Schema Update (optional, low priority)

The current `getSchema` in `auto-ui.js` doesn't know about one-of groups. For now, since `?` fields are not `*`-required, they produce no yup rule and submit fine. A future improvement could add a `.test()` on the group to require at least one filled value.

---

## UI Mockup

```
┌─────────────────────────────────────────┐
│  ○ Picture   ○ Voice   ● InteractiveObj │  ← RadioGroup
├─────────────────────────────────────────┤
│  [XObjectUI component rendered here]    │  ← Only selected field shown
└─────────────────────────────────────────┘
```

---

## Out of Scope

- Supporting non-consecutive `?` groups (not present in any current type definition)
- Yup schema enforcement for "exactly one" — deferred to a future iteration
- Edit page behavior: pre-select the radio based on which field already has a value
