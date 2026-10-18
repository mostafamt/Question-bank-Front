# Plan: Generic Modal System — `/components/Modals/`

## Goal

Create a single, reusable `AppModal` wrapper component (the generic modal) that lives
in a new `/components/Modals/` folder, then move `DrawnUIModal` there as the first
entry in the modal registry. Future modals can be added to the same folder and
re-exported from a single `index.js`.

---

## Why a Separate Folder?

The current `Modal/` folder mixes:
- The generic Bootstrap wrapper (`Modal.jsx`)
- All specific content components (`DeleteModalContent`, `EditObjectModal`, etc.)

The new `Modals/` folder keeps a clean separation:

```
Modals/
├── AppModal.jsx          ← generic wrapper (the "like this" component)
├── index.js              ← registry: re-exports every named modal
└── DrawnUIModal/         ← first specific modal (moved here)
    ├── DrawnUIModal.jsx
    └── AreaList/
        └── AreaList.jsx
```

The existing `Modal/` folder and its content components are **not touched** — they
stay where they are and keep working as before.

---

## What the Generic `AppModal` Looks Like

The reference `Modal.jsx` on the `IBook-2-development` branch is a thin wrapper
around `react-bootstrap/Modal`. `AppModal` follows the same pattern but wraps
**MUI `Dialog`**, which `DrawnUIModal` already uses internally. This gives all
future modals a consistent base.

```jsx
// Modals/AppModal.jsx
<AppModal
  open={boolean}          // controlled visibility
  onClose={fn}            // close handler
  title={string}          // dialog title (optional)
  maxWidth="lg"           // MUI maxWidth ('xs'|'sm'|'md'|'lg'|'xl'|false)
  fullWidth={true}        // stretch to maxWidth
  scroll="paper"          // MUI scroll strategy
>
  {children}
</AppModal>
```

It renders:
- `Dialog` + `DialogTitle` with a built-in close `IconButton`
- `DialogContent` wrapping `children`
- Accepts `actions` prop for an optional `DialogActions` row (buttons)

---

## `DrawnUIModal` Migration

`DrawnUIModal` currently builds its own `Dialog` / `DialogTitle` / `DialogContent`
from scratch. After the migration it uses `AppModal` internally:

```
Before:
  DrawnUIModal → Dialog, DialogTitle, DialogContent (manually assembled)

After:
  DrawnUIModal → AppModal (which provides Dialog + title + close button)
                         └─ left panel: DrawnUIForm
                         └─ right panel: AreaList
```

The public API of `DrawnUIModal` (all its props) remains **unchanged** — callers
in Studio.jsx are not affected.

---

## Registry (`index.js`)

```js
// Modals/index.js
export { default as AppModal }     from "./AppModal";
export { default as DrawnUIModal } from "./DrawnUIModal/DrawnUIModal";
```

Adding a new modal later = drop it in a sub-folder + add one export line here.

---

## Files to Create / Change

| Action | Path |
|--------|------|
| **Create** | `src/components/Modals/AppModal.jsx` |
| **Create** | `src/components/Modals/index.js` |
| **Move** | `src/components/DrawnUIModal/` → `src/components/Modals/DrawnUIModal/` |
| **Edit** | `src/components/Modals/DrawnUIModal/DrawnUIModal.jsx` — use `AppModal` internally |
| **Edit** | `src/components/Studio/Studio.jsx` — update import path for `DrawnUIModal` |

The old `src/components/DrawnUIModal/` folder is deleted after the move.

No other consumers need changes because `DrawnUIModal` is only imported in `Studio.jsx`.

---

## Step-by-Step Execution

1. **Create `AppModal.jsx`** — MUI-based generic dialog wrapper.
2. **Create `Modals/index.js`** — empty at first, populated in step 4.
3. **Copy `DrawnUIModal/` into `Modals/`** — including the `AreaList/` sub-folder.
4. **Edit `DrawnUIModal.jsx`** — swap the raw `Dialog/DialogTitle/DialogContent`
   boilerplate for `<AppModal>`. Adjust internal layout props as needed.
5. **Update `Modals/index.js`** — export `AppModal` and `DrawnUIModal`.
6. **Update `Studio.jsx`** import path.
7. **Delete** old `src/components/DrawnUIModal/` folder.

---

## AppModal Internal Structure

```
<Dialog open onClose maxWidth fullWidth scroll>
  <DialogTitle>
    {title}
    <IconButton onClick={onClose} aria-label="close" />  ← always present
  </DialogTitle>
  <DialogContent dividers>
    {children}
  </DialogContent>
  {actions && <DialogActions>{actions}</DialogActions>}
</Dialog>
```

---

## Out of Scope

- Migrating the existing `Modal/` (Bootstrap wrapper) or its content components.
- Converting any existing Bootstrap modal usage to `AppModal`.
- A context/hook-based modal manager (can be added later on top of this registry).
