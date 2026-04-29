# Plan: Split DrawnUIModal + Drag Area → Text Field

## Goal

1. **Split DrawnUIModal** into two side-by-side panels: DrawnUI form on the left, a list of scanned areas on the right.
2. **Drag-and-drop**: user drags an area card from the right panel and drops it onto any text field in the left form — the field is filled with the area's OCR text.

---

## Why Not Reuse `AreaActions` Directly

`AreaActions` is built for the ScanAndUpload Studio workflow. It requires 9 callbacks (`onChangeParameter`, `onEditText`, `onClickDeleteArea`, `onClickSubmit`, `loadingSubmit`, `updateTrialAreas`, `onClickMapToForm`, `setTrialAreas`, `type`) and renders "Submit" and "Map to Form" buttons that have no meaning inside the modal.

Instead, we create a lightweight **`AreaList`** component for the right panel — just draggable cards showing each area's parameter name and extracted text. No Studio callbacks, no action buttons.

---

## Drag-and-Drop Strategy

`@hello-pangea/dnd` (the only DnD library in the project) is designed for **list-to-list** reordering. It cannot drop onto arbitrary targets like a text input.

We use the **HTML5 native Drag and Drop API** for the new cross-panel interaction:

| Side | Element | HTML5 DnD role | What it does |
|------|---------|----------------|--------------|
| Right | Area card | **Drag source** | `draggable`, `onDragStart` sets `dataTransfer` with `area.text` |
| Left | Text field input | **Drop target** | `onDragOver` prevents default; `onDrop` reads text, calls `field.onChange` |

This is intentionally separate from the existing `@hello-pangea/dnd` reordering inside AreaActions (which stays unchanged in the Studio view).

---

## Layout

`DrawnUIModal` changes from single-column to a two-panel flex layout:

```
┌─────────────────────────────────────────────────────────┐
│  Dialog Title (displayType)                          [X] │
├────────────────────────────────┬────────────────────────┤
│                                │                        │
│   DrawnUIForm (left, flex:1)   │  AreaList (right, 300px)│
│                                │                        │
│  ┌─────────────────────────┐   │  ┌──────────────────┐  │
│  │ _Question_  [text field]│   │  │ ⠿ *_Question_    │  │
│  └─────────────────────────┘   │  │   "Why cells"    │  │
│                                │  └──────────────────┘  │
│  Answers  1                    │  ┌──────────────────┐  │
│  ┌─────────────────────────┐   │  │ ⠿ *_OptionText_  │  │
│  │ _OptionText_ [text field│   │  │   "&m; of cell"  │  │
│  └─────────────────────────┘   │  └──────────────────┘  │
│  …                             │                        │
└────────────────────────────────┴────────────────────────┘
```

Dialog `maxWidth` changes from `"md"` → `"lg"` to fit both panels.

---

## Files Changed

| File | Action |
|------|--------|
| `src/components/DrawnUIModal/DrawnUIModal.jsx` | Add two-panel layout, accept `trialAreas` prop |
| `src/components/DrawnUIModal/AreaList/AreaList.jsx` | **New** — draggable area cards |
| `src/components/DrawnUI/Text/Text.jsx` | Add drop handler on the TextField input |
| `src/components/Studio/Studio.jsx` | Pass `trialAreas` to DrawnUIModal |

`DrawnUIForm.jsx` does **not** change — drop handling is self-contained inside `Text.jsx` using the Controller's `field.onChange`.

---

## 1. New Component: `AreaList`

**File:** `src/components/DrawnUIModal/AreaList/AreaList.jsx`

### Purpose
Display each scanned area as a card on the right panel. Each card is draggable via HTML5 DnD. No callbacks required from the parent.

### What each card shows
- Colored left border (from `area.color`)
- Parameter name with `*`/`#` stripped (e.g. `_Question_`)
- Area text (OCR result), truncated if long
- A `DragIndicator` icon as a visual affordance

### Drag source implementation
```jsx
<div
  draggable
  onDragStart={(e) => {
    e.dataTransfer.setData("text/plain", area.text ?? "");
    e.dataTransfer.effectAllowed = "copy";
  }}
>
  ...card content...
</div>
```

### Props
```js
AreaList({ trialAreas: Area[] })
```
No callbacks needed. Read-only display + drag source.

### Styling notes
- Cards have `cursor: grab` to signal they are draggable
- Vertical stack with small gap between cards
- Max width fills the 300px right panel
- Scrollable if there are many areas

---

## 2. `Text.jsx` — Add Drop Target

**File:** `src/components/DrawnUI/Text/Text.jsx`

The `<Controller>` render prop gives us `field` which includes `field.onChange`. We use that directly inside the drop handler — no new props needed.

```jsx
// BEFORE
render={({ field }) => (
  <TextField {...field} label={newLabel} type={type} fullWidth />
)}

// AFTER
render={({ field }) => {
  const handleDrop = (e) => {
    e.preventDefault();
    const text = e.dataTransfer.getData("text/plain");
    if (text) field.onChange(text);
  };

  return (
    <TextField
      {...field}
      label={newLabel}
      type={type}
      fullWidth
      inputProps={{
        onDrop: handleDrop,
        onDragOver: (e) => e.preventDefault(),
      }}
      sx={{
        // Visual highlight when an item is dragged over
        "&:has(input:focus)": {},  // kept as-is
      }}
    />
  );
}}
```

**Why `inputProps` not `onDrop` on `<TextField>`:**  
MUI's TextField renders a wrapper `<div>` around the actual `<input>`. Attaching `onDrop` to `inputProps` targets the `<input>` element directly, which is where the browser fires the drop event for text inputs.

**Visual drop indicator (optional enhancement):**  
Track `isDragOver` with local state on `onDragEnter`/`onDragLeave` and apply an `sx` highlight (`outline: "2px dashed #1976d2"`) while dragging over the field.

```jsx
const [isDragOver, setIsDragOver] = React.useState(false);

// inputProps:
onDragEnter: () => setIsDragOver(true),
onDragLeave: () => setIsDragOver(false),
onDrop: (e) => { ...; setIsDragOver(false); },

// on TextField:
sx={{ outline: isDragOver ? "2px dashed #1976d2" : "none", borderRadius: 1 }}
```

---

## 3. `DrawnUIModal.jsx` — Two-Panel Layout

**File:** `src/components/DrawnUIModal/DrawnUIModal.jsx`

### New prop
```js
DrawnUIModal({ open, onClose, baseType, displayType, initialValues, trialAreas })
```

### Layout change

```jsx
// BEFORE
<DialogContent dividers>
  <DrawnUIForm ... />
</DialogContent>

// AFTER
<DialogContent dividers sx={{ display: "flex", p: 0, overflow: "hidden" }}>

  {/* Left: form */}
  <Box sx={{ flex: 1, overflowY: "auto", p: 3 }}>
    <DrawnUIForm
      baseType={baseType}
      initialValues={initialValues}
      objectId={null}
      onSuccess={onClose}
    />
  </Box>

  <Divider orientation="vertical" flexItem />

  {/* Right: area cards */}
  <Box sx={{ width: 300, overflowY: "auto", p: 2, flexShrink: 0 }}>
    <AreaList trialAreas={trialAreas ?? []} />
  </Box>

</DialogContent>
```

Also change `maxWidth="md"` → `maxWidth="lg"` so both panels have room.

---

## 4. `Studio.jsx` — Pass `trialAreas`

**File:** `src/components/Studio/Studio.jsx`

One prop added to `<DrawnUIModal>`:

```jsx
// BEFORE
<DrawnUIModal
  open={drawnUIOpen}
  onClose={() => setDrawnUIOpen(false)}
  baseType={state.type}
  displayType={state.higherType}
  initialValues={mappedJson}
/>

// AFTER
<DrawnUIModal
  open={drawnUIOpen}
  onClose={() => setDrawnUIOpen(false)}
  baseType={state.type}
  displayType={state.higherType}
  initialValues={mappedJson}
  trialAreas={trialAreas}
/>
```

`trialAreas` is already in Studio's local state.

---

## End-to-End User Flow

```
1. User draws areas in Studio, assigns parameters (existing flow)
2. User clicks "Map to Form"
   → mapToForm() converts areas → JSON
   → DrawnUIModal opens
3. Modal layout:
   LEFT: DrawnUI form pre-filled with mapped JSON
   RIGHT: AreaList showing all scanned area cards
4. User sees a field is wrong / wants to use a different area text
5. User drags an area card from the right panel
6. User drops it on a text field on the left
   → field.onChange(area.text) fires
   → react-hook-form updates the field value instantly
7. User continues editing other fields manually if needed
8. User clicks Submit → POST /interactive-objects → success toast + new tab
9. Modal closes (onSuccess)
```

---

## Edge Cases

| Case | Behaviour |
|------|-----------|
| Area has empty text (`""` or `null`) | `dataTransfer.setData` sends empty string; drop has no effect (guarded by `if (text)`) |
| Drop onto a non-text field (image, boolean) | Those components don't have `onDrop` handlers — drop is ignored by the browser |
| `trialAreas` not passed to modal | `trialAreas ?? []` → AreaList renders empty (right panel still visible but blank) |
| Many areas overflow the right panel | Right panel has `overflowY: "auto"` — scrolls independently |
| Drop replaces existing field value | Yes, intentional — same as typing over it |
| Drag from right while @hello-pangea/dnd is NOT mounted | AreaList has no @hello-pangea/dnd context — HTML5 drag works standalone |

---

## Testing Checklist

- [ ] Modal opens in two-panel layout (form left, areas right)
- [ ] Right panel shows one card per area with parameter name and text
- [ ] Cards show their color indicator
- [ ] Cursor changes to `grab` when hovering a card
- [ ] Dragging a card shows a ghost/drag image
- [ ] Dropping on a text field fills it with the area's text
- [ ] Dropping replaces any existing value in the field
- [ ] Drop on an image or boolean field has no effect
- [ ] Visual highlight appears on the field while dragging over it
- [ ] Empty-text areas cannot be dropped (no effect)
- [ ] Right panel scrolls when there are many areas
- [ ] DrawnUI page (`/add-question/...`) is unaffected — no `trialAreas` context there
- [ ] Submit still works normally after drag-fill
