# Plan: Snap Learning Tab — Add Text / Link / Object Modal

## Background

The Snap Learning tab (`micro-los`) uses the generic `List` component
(`src/components/Tabs/List/List.jsx`). Clicking the **+** icon currently opens
the `"tabs"` modal (`ObjectsTableModalContent`), which only supports picking
interactive objects from a table.

The new requirement: replace this with a modal that lets the user choose one of
three content types — **Text**, **Link**, or **Object** — and add it as a single
item to the list.

> **Note:** The backend endpoint for saving Snap Learning items is not ready.
> The submit handler will be a placeholder that only updates local state.

---

## Current vs. Desired Flow

### Current
```
+ icon clicked
  → opens "tabs" modal (ObjectsTableModalContent)
      → QuestionsTable (checkbox multi-select)
  → selected objects stored as { _id, name, baseType, ... }
  → Submit → updateTabObjects(chapterId, "micro-los", { ids: [...] })
```

### Desired
```
+ icon clicked (Snap Learning tab only)
  → opens "snap-learning" modal (SnapLearningModal)
      → ToggleButtonGroup: Text | Link | Object
      → Input based on type:
            Text   → Quill rich-text editor
            Link   → URL TextField
            Object → RadioQuestionsTable (single select)
      → Confirm button
  → ONE item added to local objects list:
        { _id, type, contentValue, name }
  → Submit → placeholder (no API call yet)
```

---

## Item Shape

Each item added to the Snap Learning list:

```js
{
  _id: Date.now().toString(),  // temporary local ID
  type: "text" | "link" | "object",
  contentValue: string,        // HTML for text, URL for link, objectId for object
  name: string,                // display label (see derivation below)
}
```

**Deriving `name` for display in `ListItem`:**

| type     | name                                       |
|----------|--------------------------------------------|
| `text`   | First 40 chars of plain text (strip HTML)  |
| `link`   | The URL string                             |
| `object` | Object title if available, else object ID  |

---

## Files to Create / Change

### 1. Create `SnapLearningModal`

**New file:** `src/components/Modal/SnapLearningModal/SnapLearningModal.jsx`

A focused modal — no list management inside. A single screen: type toggle →
input → Confirm.

```
BootstrapModal.Header  "Add Snap Learning Item"
BootstrapModal.Body
  ToggleButtonGroup  [📄 Text]  [🔗 Link]  [🎮 Object]
  ── conditional input ──
  Text   →  QuillEditor  (react-quill, quillModules)
  Link   →  TextField (type="url")
  Object →  RadioQuestionsTable
  ── error message ──
BootstrapModal.Footer
  [Cancel]  [Confirm]
```

**Props:**
- `onConfirm(item)` — called with `{ type, contentValue }` on Confirm
- `handleCloseModal()` — injected by Modal registry

**Validation** (same rules as `ContentItemForm`):
- text: non-empty, not `"<p><br></p>"`
- link: non-empty, valid `http`/`https` URL
- object: a value must be selected

**On Confirm:**
- Call `onConfirm({ type, contentValue })`
- Call `handleCloseModal()`

This component can import and reuse the existing `ContentItemForm` component
directly (same toggle + inputs + validation logic already there) to avoid code
duplication, wrapping it in the modal shell. Pass a single-item `onSubmit` prop
and no editing state.

---

### 2. Register in Modal registry

**File:** `src/components/Modal/Modal.jsx`

```js
// add import
import SnapLearningModal from "./SnapLearningModal/SnapLearningModal";

// add to MODAL_COMPONENTS
"snap-learning": SnapLearningModal,
```

---

### 3. Update `List.jsx`

**File:** `src/components/Tabs/List/List.jsx`

#### 3a. `onClickPlus` — open different modal for Micro Learning

```js
const onClickPlus = () => {
  if (tab.name === RIGHT_TAB_NAMES.GLOSSARY_KEYWORDS.name) {
    // ... existing glossary logic unchanged
  } else if (tab.name === LEFT_TAB_NAMES.MICRO_LEARNING.name) {
    openModal("snap-learning", {
      onConfirm: ({ type, contentValue }) => {
        const name = deriveSnapLearningName(type, contentValue);
        const newItem = {
          _id: Date.now().toString(),
          type,
          contentValue,
          name,
        };
        setObjects((prev) => [...prev, newItem]);
      },
    });
  } else {
    // ... existing "tabs" modal logic unchanged
  }
};
```

**Helper `deriveSnapLearningName`** (define at module level or in a utils file):

```js
const deriveSnapLearningName = (type, contentValue) => {
  if (type === "text") {
    // strip HTML tags, take first 40 chars
    const plain = contentValue.replace(/<[^>]+>/g, "").trim();
    return plain.length > 40 ? plain.slice(0, 40) + "…" : plain || "Text item";
  }
  if (type === "link") return contentValue;
  if (type === "object") return contentValue; // replace with title when API ready
  return "Snap Learning item";
};
```

#### 3b. `handlePlay` — support text / link / object types

```js
const handlePlay = React.useCallback(
  (item) => {
    if (tab.name === LEFT_TAB_NAMES.MICRO_LEARNING.name) {
      if (item.type === "text") {
        openModal("text-editor", { value: item.contentValue, readOnly: true });
      } else if (item.type === "link") {
        openModal("iframe-display", { url: item.contentValue });
      } else if (item.type === "object") {
        openModal("play-object", {
          workingArea: {
            text: item.contentValue,
            contentValue: item.contentValue,
            contentType: "object",
            typeOfLabel: "object",
          },
        });
      }
      return;
    }

    // existing logic for all other tabs
    openModal("play-object", {
      workingArea: {
        text: item._id,
        contentValue: item._id,
        contentType: item.baseType || "Text MCQ",
        typeOfLabel: item.type,
      },
    });
  },
  [openModal, tab.name]
);
```

#### 3c. `onSubmitHandler` — placeholder for Micro Learning

```js
const onSubmitHandler = async () => {
  if (tab.name === LEFT_TAB_NAMES.MICRO_LEARNING.name) {
    // TODO: call API when backend endpoint is ready
    console.log("Snap Learning submit — endpoint not yet implemented", objects);
    return;
  }

  // existing logic unchanged
  const ids = { ids: objects.map((item) => item._id) };
  if (tab.name === RIGHT_TAB_NAMES.GLOSSARY_KEYWORDS.name) {
    // ... existing glossary submission
  } else {
    await mutation.mutateAsync(ids);
  }
};
```

#### 3d. Import `LEFT_TAB_NAMES`

`LEFT_TAB_NAMES` is already exported from `../../Studio/constants`. Make sure
it is imported in `List.jsx` alongside `RIGHT_TAB_NAMES`:

```js
import { LEFT_TAB_NAMES, RIGHT_TAB_NAMES } from "../../Studio/constants";
```

---

## What Does NOT Change

| Thing | Why |
|---|---|
| `ListItem` | Already renders `item.name` — works for all types |
| `handleDelete` | Uses `item._id` — works unchanged |
| `ContentItemForm` | Reused as-is inside `SnapLearningModal` |
| All other tabs | `onClickPlus`, `handlePlay`, `onSubmitHandler` fall through to existing logic |
| `QuestionsTable` / `ObjectsTableModalContent` | Still used by other tabs |

---

## Files Summary

| Action | File |
|--------|------|
| **Create** | `src/components/Modal/SnapLearningModal/SnapLearningModal.jsx` |
| **Edit** | `src/components/Modal/Modal.jsx` — add import + registry entry |
| **Edit** | `src/components/Tabs/List/List.jsx` — `onClickPlus`, `handlePlay`, `onSubmitHandler`, import |

---

## When Backend Is Ready

Replace the placeholder in `onSubmitHandler` with the actual API call.
The item shape (`{ type, contentValue }`) is already structured for easy
serialisation — just map `objects` to whatever payload the endpoint expects.
