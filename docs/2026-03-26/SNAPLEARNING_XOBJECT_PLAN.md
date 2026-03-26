# Plan: Add XObject Support to SnapLearning Object (DrawnUI)

## Overview

Add `XObject` as a new field type in the DrawnUI system. It works like the existing `SI` (Smart Interactive Object) type — allowing users to select an object by ID from a library — but filtered to show only **X-category** objects (interactive visual content like Charts, Flash Cards, Hotspot Image, etc.).

---

## Background

### Current State

The DrawnUI system in `src/utils/auto-ui.js` has this type mapping:

```js
export const AUTO_UI_TYPES_MAPPING = {
  // ...
  SI: <InteractiveObject />,  // select any object from library
};
```

The `InteractiveObject` component (`src/components/DrawnUI/InteractiveObject/InteractiveObject.jsx`) lets users:
- Select an object from a modal library (currently shows ALL objects)
- Enter an object ID manually
- Preview the selected object via `ObjectRenderer`

### What "XObject" Is

From the API (`/api/io-types`), objects have a `typeCategory` field:
- `"Q"` = Question types
- `"X"` = XObject types (interactive visual content: Pie Chart, Bar Chart, Flash Cards, Dialog Cards, Hotspot Image, etc.)
- `"B"` = Base/both types

`XObject` is like `SI` but the library picker only shows objects with `typeCategory: "X"`.

---

## Files to Change

| File | Change |
|------|--------|
| `src/utils/auto-ui.js` | Add `XObject` to `AUTO_UI_TYPES_MAPPING` |
| `src/components/DrawnUI/XObjectUI/XObjectUI.jsx` | **New file** — clone of `InteractiveObject` with X-filtered library |
| `src/components/DrawnUI/XObjectUI/xObject.module.scss` | **New file** — styles (can import from InteractiveObject or copy) |
| `src/components/Modal/SelectObjectModal/SelectObjectModal.jsx` | Accept optional `typeCategory` prop and pass it to `ObjectsTable` |
| `src/components/ObjectsTable/ObjectsTable.jsx` | Accept optional `typeCategory` filter and apply it when fetching/filtering objects |

---

## Step-by-Step Plan

### Step 1 — Create `XObjectUI` Component

Create `src/components/DrawnUI/XObjectUI/XObjectUI.jsx` as a copy of `InteractiveObject.jsx` with these differences:

- Pass `typeCategory="X"` to `SelectObjectModal`
- Label "Add X-object" on the "Add object" link (links to `/add-question` with X-type pre-selected, optional)
- Otherwise identical behavior: manual ID input, Apply button, `ObjectRenderer` preview

### Step 2 — Update `SelectObjectModal` to Accept `typeCategory`

```jsx
// Before
const SelectObjectModal = ({ selectedRowId, setSelectedRowId, onClickSelect, onClickCancel }) => (
  <ObjectsTable selectedRowId={selectedRowId} setSelectedRowId={setSelectedRowId} />
);

// After
const SelectObjectModal = ({ selectedRowId, setSelectedRowId, onClickSelect, onClickCancel, typeCategory }) => (
  <ObjectsTable selectedRowId={selectedRowId} setSelectedRowId={setSelectedRowId} typeCategory={typeCategory} />
);
```

### Step 3 — Update `ObjectsTable` to Filter by `typeCategory`

In `ObjectsTable.jsx`, when `typeCategory` prop is provided, filter the fetched objects so only objects matching that `typeCategory` are shown.

This likely means:
- Read the `typeCategory` prop
- Either pass it as a query param to the API call, OR filter the result client-side

### Step 4 — Register `XObject` in `AUTO_UI_TYPES_MAPPING`

```js
// src/utils/auto-ui.js
import XObjectUI from "../components/DrawnUI/XObjectUI/XObjectUI";

export const AUTO_UI_TYPES_MAPPING = {
  // existing...
  SI: <InteractiveObject />,
  XObject: <XObjectUI />,   // <-- add this
};
```

### Step 5 — API Update (Backend)

The SnapLearning Object's `abstractParameter` definition on the API (`/api/io-types`) needs to use `XObject` as the type for any field that should reference an X-category object. For example, the `InteractiveObject` field inside `Slides` currently uses `SI` — if it should be restricted to X-objects, it should be changed to `XObject` on the backend.

> **This step requires a backend change.** Coordinate with the API team to update the SnapLearning Object type definition.

---

## Data Flow

```
API returns SnapLearning Object type
  → abstractParameter.Slides[].InteractiveObject = "XObject"
  → DrawnUI parseParameters() sees type = "XObject"
  → Looks up AUTO_UI_TYPES_MAPPING["XObject"]
  → Renders <XObjectUI />
  → User opens modal → SelectObjectModal with typeCategory="X"
  → ObjectsTable filters to show only X-category objects
  → User selects object → ID saved to form field
  → ObjectRenderer previews the selected object
```

---

## Out of Scope

- Changes to `SnapLearningPlayer` (the viewer/renderer) — XObject IDs are just stored as strings, so rendering is already handled by `ObjectRenderer`
- Changes to the Edit flow — it works the same way as Add

---

## Open Questions

1. Should the `ObjectsTable` filter happen **client-side** (filter after fetch) or **server-side** (pass `typeCategory` as a query param)? Server-side is preferred for large datasets.
2. Should the `InteractiveObject` field in SnapLearning Slides remain `SI` (all objects) or be changed to `XObject` (X-only)? This depends on the API team's decision.
3. Should the "Add object" link inside `XObjectUI` deep-link to the Add Object page pre-filtered to X-category types?
