# Keyboard Shortcuts for StudioThumbnails Actions

## Context

`StudioThumbnails` (`src/components/Studio/StudioThumbnails/StudioThumbnails.jsx`) renders a toolbar of `IconButton`s (`thumbnailActions`) for page operations: new, add, delete, copy, cut, paste, import, save. Today these are mouse-only. The goal is to let book authors trigger each action with a keyboard shortcut, and to surface the binding in each button's MUI `Tooltip` (e.g. `copy (Ctrl+C)`) so it's discoverable.

All 8 actions are currently gated to `mode: ["book-author"]` in `tabs.config.json`, and `StudioThumbnails` is only mounted while its tab is the active left-panel tab (`BookColumn.jsx` only renders `column.component` for the active tab). So a `window` keydown listener scoped to this component's mount lifecycle is automatically scoped correctly — no extra visibility/mode checks needed beyond what already exists.

Some obvious key choices collide with the browser chrome itself. Resolved bindings:

| Action | Shortcut | Note |
|---|---|---|
| new | **Ctrl+Alt+N** | Ctrl+N is browser-reserved (new window) and can't be `preventDefault()`-ed |
| add | **Ctrl+Shift+A** | no example given, picked a conflict-free combo |
| delete | **Delete** | no modifier, standard for list/item deletion |
| copy | **Ctrl+C** | |
| cut | **Ctrl+X** | |
| paste | **Ctrl+V** | |
| import | **Ctrl+Alt+I** | Ctrl+Shift+I is reserved for DevTools |
| save | **Ctrl+S** | `preventDefault()` reliably suppresses the browser Save-page dialog (same trick Docs/Notion use) |

## Design

Single-file change: `src/components/Studio/StudioThumbnails/StudioThumbnails.jsx`. No other files need touching — tooltip text and shortcut matching are computed locally from the existing `thumbnailActions` array and the existing `configuredActions`/`mode` filtering already in the component.

### 1. Attach a `shortcut` descriptor to each entry in `thumbnailActions`

```js
const thumbnailActions = [
  { label: "new", Icon: NoteAddIcon, onClick: handleAddNewPage,
    shortcut: { key: "n", ctrlKey: true, altKey: true } },
  { label: "add", Icon: AddPhotoAlternateIcon, isFileInput: true,
    shortcut: { key: "a", ctrlKey: true, shiftKey: true } },
  { label: "delete", Icon: DeleteIcon, onClick: () => handleDeletePage(activePage),
    shortcut: { key: "Delete" } },
  { label: "copy", Icon: ContentCopyIcon, onClick: handleCopy,
    shortcut: { key: "c", ctrlKey: true } },
  { label: "cut", Icon: ContentCutIcon, onClick: handleCut, disabled: pages.length === 1,
    shortcut: { key: "x", ctrlKey: true } },
  { label: "paste", Icon: ContentPasteIcon, onClick: handlePaste, disabled: !clipboard,
    shortcut: { key: "v", ctrlKey: true } },
  { label: "import", Icon: FileDownloadIcon, onClick: onClickImport,
    shortcut: { key: "i", ctrlKey: true, altKey: true } },
  { label: "save", Icon: SaveIcon, onClick: handleSave,
    shortcut: { key: "s", ctrlKey: true } },
];
```

### 2. Two small pure helpers (module scope, above the component or in a local `utils` block)

```js
const formatShortcut = ({ key, ctrlKey, altKey, shiftKey }) => {
  const parts = [];
  if (ctrlKey) parts.push("Ctrl");
  if (altKey) parts.push("Alt");
  if (shiftKey) parts.push("Shift");
  parts.push(key.length === 1 ? key.toUpperCase() : key);
  return parts.join("+");
};

const matchesShortcut = (e, shortcut) => {
  if (!shortcut) return false;
  return (
    e.key.toLowerCase() === shortcut.key.toLowerCase() &&
    (e.ctrlKey || e.metaKey) === !!shortcut.ctrlKey &&
    e.altKey === !!shortcut.altKey &&
    e.shiftKey === !!shortcut.shiftKey
  );
};
```
`metaKey` is folded into the Ctrl check so it also behaves sanely if ever opened on macOS, without adding a second Cmd binding to maintain.

### 3. Tooltip: append the formatted shortcut

```jsx
<Tooltip key={label} placement="top" title={`${label} (${formatShortcut(shortcut)})`}>
```

### 4. `window` keydown listener, scoped by mount lifecycle + existing filters

Reuse the same `configuredActions`/`mode` filter that already decides which buttons render, so a shortcut can never fire for an action that isn't visible in the current mode:

```js
const fileInputRef = React.useRef(null);
const { modal } = useStore(); // add `modal` alongside existing `openModal` destructure

React.useEffect(() => {
  const visibleActions = thumbnailActions.filter(({ label }) =>
    configuredActions.some((a) => a.label === label && a.mode.includes(mode))
  );

  const handleKeyDown = (e) => {
    if (e.repeat || modal.opened) return;

    const target = e.target;
    const isEditable =
      ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName) ||
      target.isContentEditable;
    if (isEditable) return;

    const action = visibleActions.find((a) => matchesShortcut(e, a.shortcut));
    if (!action || action.disabled) return;

    e.preventDefault();
    if (action.isFileInput) {
      fileInputRef.current?.click();
    } else {
      action.onClick?.();
    }
  };

  window.addEventListener("keydown", handleKeyDown);
  return () => window.removeEventListener("keydown", handleKeyDown);
}, [pages, activePage, clipboard, mode, configuredActions, modal.opened]);
```

Key guards, and why:
- **`isEditable` check** — without it, Ctrl+C/X/V while typing in a Quill editor, OCR text box, or any modal input would hijack normal text copy/cut/paste instead of letting the browser handle it.
- **`modal.opened` check** (from `useStore`) — prevents e.g. Ctrl+S from triggering a page save while an unrelated modal (import, edit-parameters, etc.) is focused/open.
- **`e.repeat` check** — holding a key down shouldn't fire `handleCut`/`handlePaste` repeatedly.
- **`action.disabled` check** — reuses the same disabled logic already driving the button's visual disabled state (e.g. paste with empty clipboard, cut with 1 page), so keyboard and mouse stay consistent.

### 5. Wire the file input ref for the "add" shortcut

`add` triggers a hidden `<input type="file">` via `component="label"` today; there's no ref to click it programmatically. Add one:

```jsx
{isFileInput && <VisuallyHiddenInput ref={fileInputRef} type="file" onChange={onChange} />}
```
(move `onChange` from the `IconButton`'s `component="label"` spread onto the input directly — functionally identical, just gives us a ref target to `.click()` from the keydown handler).

## Files touched

- `src/components/Studio/StudioThumbnails/StudioThumbnails.jsx` only.

## Verification

1. `npm start`, open a chapter in book-author mode (`/book-author/...`), Thumbnails tab active.
2. Hover each action button — tooltip shows `label (shortcut)`, e.g. `copy (Ctrl+C)`, `new (Ctrl+Alt+N)`.
3. With focus on the page canvas (not a text field), exercise each shortcut and confirm it performs the same action as clicking the button: new page appended, delete removes active page, copy/cut/paste round-trip a page, import opens the modal, save persists pages.
4. Click into a text input (e.g. the OCR/Quill area or an open modal's field), select text, press Ctrl+C — confirm normal browser text-copy happens and no thumbnail action fires.
5. Open any modal, press Ctrl+S / Ctrl+C — confirm no thumbnail action fires while the modal is open.
6. With only 1 page, confirm Ctrl+X (cut, disabled) no-ops; with empty clipboard, confirm Ctrl+V (paste, disabled) no-ops.
7. Switch to Reader mode / a mode without these actions configured — confirm none of the shortcuts fire (component isn't mounted / actions aren't in `configuredActions`).
