# Plan: Colored Square on Text Field After Drop

## Goal

After dragging an area card and dropping it onto a text field, display a small colored square **inside the text field** (as a left adornment). The square's color matches the dropped area's card color, giving a clear visual link between the form field and its source area.

```
Before drop:
┌─────────────────────────────┐
│ _Question_                  │  ← plain text field
└─────────────────────────────┘

After drop from orange area:
┌──┬──────────────────────────┐
│🟠│ Why cells                │  ← colored square + filled text
└──┴──────────────────────────┘
```

---

## How It Works

The color travels alongside the text through `dataTransfer`. Currently `AreaList` only sends `text/plain`. We change it to also send the area color via a second MIME type (`application/x-area-color`). `Text.jsx` reads the color on drop, stores it in local state, and renders it as a MUI `InputAdornment`.

---

## Only 2 Files Change

| File | Change |
|------|--------|
| `src/components/DrawnUIModal/AreaList/AreaList.jsx` | Add `application/x-area-color` to `dataTransfer` on drag start |
| `src/components/DrawnUI/Text/Text.jsx` | Read color on drop, store in state, render as `startAdornment` |

No other file changes. `DrawnUIModal`, `DrawnUIForm`, and `Studio` are untouched.

---

## 1. `AreaList.jsx` — Send Color in `dataTransfer`

**Current `onDragStart`:**
```js
onDragStart={(e) => {
  e.dataTransfer.setData("text/plain", area.text ?? "");
  e.dataTransfer.effectAllowed = "copy";
}}
```

**Updated `onDragStart`:**
```js
onDragStart={(e) => {
  e.dataTransfer.setData("text/plain", area.text ?? "");
  e.dataTransfer.setData("application/x-area-color", area.color ?? "");
  e.dataTransfer.effectAllowed = "copy";
}}
```

`text/plain` is kept as-is so a plain text drop from outside the app still works. The color is sent in a custom MIME type alongside it.

---

## 2. `Text.jsx` — Read Color, Show Adornment

### New state

```js
const [areaColor, setAreaColor] = React.useState(null);
```

### Updated drop handler

```js
onDrop: (e) => {
  e.preventDefault();
  setIsDragOver(false);
  const text  = e.dataTransfer.getData("text/plain");
  const color = e.dataTransfer.getData("application/x-area-color");
  if (text) field.onChange(text);
  setAreaColor(color || null);
},
```

If the drop comes from outside the app (no `application/x-area-color`), `color` will be an empty string → `setAreaColor(null)` → no square shown. Existing behavior preserved.

### Rendering the square

MUI TextField supports `InputProps.startAdornment` for content placed inside the field on the left side.

```jsx
<TextField
  {...field}
  label={newLabel}
  type={type}
  fullWidth
  InputProps={{
    startAdornment: areaColor ? (
      <InputAdornment position="start">
        <Box
          sx={{
            width: 14,
            height: 14,
            borderRadius: 0.5,
            bgcolor: areaColor,
            flexShrink: 0,
          }}
        />
      </InputAdornment>
    ) : undefined,
  }}
  inputProps={{          // lowercase — targets the <input> element
    onDragOver: ...,
    onDragLeave: ...,
    onDrop: ...,
  }}
  sx={{ borderRadius: 1, outline: isDragOver ? "2px dashed #1976d2" : "none" }}
/>
```

**Why `InputProps` (uppercase) AND `inputProps` (lowercase) both exist:**
- `InputProps` → props for MUI's `Input` wrapper component (where `startAdornment` lives)
- `inputProps` → props for the raw HTML `<input>` element (where native drag events fire)
Both are required simultaneously.

---

## Behavior Details

| Scenario | Color square |
|----------|-------------|
| Field just dropped from area card | Shows area's color |
| User drops a second area onto the same field | Square changes to the new area's color |
| User manually types in the field | Square stays (field was still sourced from that area) |
| Drop from outside the app (plain text, no color) | No square shown |
| Field is empty (no drop has happened) | No square shown |

---

## Testing Checklist

- [ ] Drop orange area → orange square appears left of the text
- [ ] Drop red area onto a different field → red square on that field
- [ ] Drop onto the same field again → square color updates to the new area's color
- [ ] Type manually in a field (no drop) → no square appears
- [ ] Both the square and the dashed-border highlight work together during drag
- [ ] Square does not appear on fields that haven't been dropped on
- [ ] DrawnUI page (standalone, no modal) — Text fields work normally with no regressions
