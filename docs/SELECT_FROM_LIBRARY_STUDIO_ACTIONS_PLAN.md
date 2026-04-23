# Select from Library — StudioActions Feature Plan

**Date:** 2026-04-16
**Scope:** `StudioActions`, `SubObjectModal`, new `SelectFromLibraryModal`
**Status:** Completed — 2026-04-23

---

## 1. Context

`StudioActions` renders two action zones:

| Condition | Buttons shown |
|---|---|
| `subObject === true` AND `areas.length === 0` | **Auto Generate** |
| `areas.length > 0` | **Submit** |

**Auto Generate** (`onSubmitAutoGenerate`) uploads the page image as-is, saves it as a new interactive object, and writes the resulting object ID into the area via `updateAreaProperty(-1, { text: id })`.

**Select from Library** is the second button in the same zone — instead of generating a new object it lets the user pick an existing one from the library, then drops its ID into the same `updateAreaProperty(-1, { text: id })` call.

---

## 2. Data Flow

```
User clicks "Select from Library"
  → SubObjectModal opens SelectFromLibraryModal (via Zustand openModal)
  → User picks an object in RadioQuestionsTable → clicks Confirm
  → onSelect(objectId) callback fires
  → SubObjectModal calls updateAreaProperty(-1, { text: objectId })
  → SubObjectModal calls handleClose()
```

Identical end result to Auto Generate — only the source of the object ID differs.

---

## 3. Component Breakdown

| File | Change |
|---|---|
| `StudioActions.jsx` | Add `onSelectFromLibrary` prop; render second button beside Auto Generate |
| `SubObjectModal.jsx` | Add `onSelectFromLibrary` handler; open modal and wire callback |
| `SelectFromLibraryModal.jsx` (new) | Bootstrap modal wrapper around `RadioQuestionsTable`; calls `onSelect(id)` |
| `Modal.jsx` | Register new modal name `"select-from-library"` |

---

## 4. New Component — `SelectFromLibraryModal`

```
src/components/Modal/SelectFromLibraryModal/SelectFromLibraryModal.jsx
```

**Props:**
```js
{
  handleCloseModal: Function,  // from modal registry
  onSelect: Function,          // called with the chosen object ID
}
```

**Layout:**
```
BootstrapModal.Header  — "Select from Library"
BootstrapModal.Body    — <RadioQuestionsTable object={selected} setObject={setSelected} />
BootstrapModal.Footer  — Cancel | Confirm (disabled until an object is selected)
```

On **Confirm**: calls `onSelect(selected)` then `handleCloseModal()`.
On **Cancel** / close button: calls `handleCloseModal()` only.

---

## 5. StudioActions Changes

Add `onSelectFromLibrary` to the destructured props.

The two buttons appear side by side in the same condition block:

```
subObject && areas.length === 0
  → [ Auto Generate ]  [ Select from Library ]
```

Button: `variant="outlined"`, icon `LibraryBooksIcon` (or `SearchIcon`).

---

## 6. SubObjectModal Changes

```js
const onSelectFromLibrary = () => {
  openModal("select-from-library", {
    onSelect: (objectId) => {
      updateAreaProperty(-1, { text: objectId });
      handleClose();
    },
  });
};
```

Pass `onSelectFromLibrary` to `<Studio>` → `<StudioActions>`.

The prop chain: `SubObjectModal` → `Studio` → `StudioActions` (same path as `onSubmitAutoGenerate`).

---

## 7. Studio.jsx Changes

`onSelectFromLibrary` needs to be threaded through `Studio` exactly like `onSubmitAutoGenerate`:

- Accept as prop
- Pass to `StudioActions` in both render locations (lines ~193 and ~224)

---

## 8. Modal.jsx Registration

```js
case "select-from-library":
  return <SelectFromLibraryModal {...modalProps} />;
```

---

## 9. Decisions

| Question | Decision |
|---|---|
| Visibility scope | `subObject && areas.length === 0` only — same zone as Auto Generate |
| Modal title | Generic: "Select from Library" |
