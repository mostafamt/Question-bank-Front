# Modal Full Screen Toggle Plan

**Date:** 2026-11-21
**Branch:** IBook-2-development
**Files:** `src/store/store.js`, `src/components/Modal/Modal.jsx`, new `src/components/Modal/ModalHeader/`, and the modal content components
**Status:** ✅ Implemented, not yet browser-tested. Differences from the plan:
- New global `src/components/Modal/modal.scss`: in full screen it turns the `<div>` wrapper that most content
  components put around header and body into a flex column. Without it, the body can't take the remaining height.
- SubObjectModal fills the screen only below desktop, by setting `--studio-height: auto` like ScanAndUpload does.
  On desktop the Studio keeps its fixed `59rem` height and the body scrolls.
- PlayCompositeBlocks / EditCompositeBlocks are placeholder screens, so they got the header and no sizing changes.
**Scope:** Let the user switch the global modal between its normal size and full screen with a button in the modal header.

---

## 1. Current state

- One global `<Modal />` (`src/components/Modal/Modal.jsx`) wraps react-bootstrap's `Modal`. It picks the content
  component from `MODAL_COMPONENTS` by `modal.name`.
- The modal already goes full screen on phones: `fullscreen={isPhone || undefined}` (via `useBreakpoint`).
  On tablet and desktop it is always a centered `size="xl"` dialog. There is no way to make it bigger.
- Modal state lives in Zustand (`src/store/store.js`): `modal = { name, size, opened, props }`.
  `openModal(name, props)` and `closeModal()` are the only actions.
- **Each content component renders its own header**: `<BootstrapModal.Header closeButton>` +
  `<BootstrapModal.Title>`. 24 components do this, so the wrapper has no shared header to put a button in.
- `ImportPagesModal` and `AddChapterModal` are rendered separately as MUI dialogs. They do not use the Bootstrap
  wrapper.

### Assumption

"Full screen" here means **the modal fills the browser viewport** (Bootstrap's `.modal-fullscreen`).
It does **not** mean the browser Fullscreen API (`element.requestFullscreen()`), which also hides the browser
UI. See §8 for that option.

---

## 2. Design overview

```
Zustand store                Modal.jsx (wrapper)                 Content component
─────────────                ───────────────────                 ─────────────────
modal.fullscreen ──────────► fullscreen={isPhone || fullscreen}
toggleModalFullscreen() ◄─┐  dialogClassName adds "is-fullscreen"
                          │
                          └──────────────────────────────────── <ModalHeader title=…>
                                                                   [title]   [⛶] [✕]
```

1. The store holds a `fullscreen` flag on `modal`.
2. The wrapper passes it to Bootstrap's `fullscreen` prop.
3. A new shared `<ModalHeader>` replaces `<BootstrapModal.Header closeButton>` in the content components. It adds
   the toggle button next to the close button.

### Why not add the button in the wrapper only?

The wrapper could place an absolutely positioned button in the top-right corner, and no content component would
change. We are not doing this because each modal builds its own header. Header heights and paddings differ, and
some headers hold extra content (for example the `IframeDisplayModal` title id). An absolutely positioned button
would overlap the title or the `✕` in some modals. A shared header component makes the layout predictable, and
later header changes only need one edit.

---

## 3. Store changes — `src/store/store.js`

Add `fullscreen` to the modal state. Add one action. Reset the flag on open and on close, so the next modal never
inherits the previous one's state.

```js
modal: {
  name: "",
  size: "xl",
  opened: false,
  fullscreen: false,
  props: {},
},

// options.fullscreen lets a caller open a modal already maximised
openModal: (name, props = {}, options = {}) =>
  set((prev) => ({
    modal: {
      ...prev.modal,
      name,
      opened: true,
      fullscreen: Boolean(options.fullscreen),
      props,
    },
  })),

closeModal: () =>
  set((prev) => ({
    modal: {
      ...prev.modal,
      name: "",
      opened: false,
      fullscreen: false,
      props: {},
    },
  })),

toggleModalFullscreen: () =>
  set((prev) => ({
    modal: { ...prev.modal, fullscreen: !prev.modal.fullscreen },
  })),
```

The new third argument is optional, so the ~59 existing `openModal(name, props)` calls keep working unchanged.

---

## 4. Wrapper changes — `src/components/Modal/Modal.jsx`

```jsx
const { name = "", size = "xl", opened = false, fullscreen = false, props = {} } = modal;
const isFullscreen = isPhone || fullscreen;

<BootstrapModal
  show={opened}
  onHide={closeModal}
  size={size}
  fullscreen={isFullscreen || undefined}
  dialogClassName={isFullscreen ? "is-fullscreen" : undefined}
>
  {ModalComponent && (
    <ModalComponent {...props} isFullscreen={isFullscreen} handleCloseModal={closeModal} />
  )}
</BootstrapModal>
```

- `isFullscreen` is passed to the content as a prop. A content component can then adjust its layout in JS if CSS
  is not enough (for example, a canvas that needs to re-measure).
- `is-fullscreen` gives the SCSS modules one hook to target (see §6).

---

## 5. New shared header — `src/components/Modal/ModalHeader/`

### `ModalHeader.jsx`

```jsx
import React from "react";
import { default as BootstrapModal } from "react-bootstrap/Modal";
import { IconButton, Tooltip } from "@mui/material";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";
import { useStore } from "../../../store/store";
import useBreakpoint from "../../../hooks/useBreakpoint";
import styles from "./modalHeader.module.scss";

/**
 * Header for modals rendered inside the global <Modal />.
 * Adds a full screen toggle next to the close button.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Title content
 * @param {string} [props.titleId] - id for aria-labelledby
 * @param {boolean} [props.allowFullscreen=true] - Hide the toggle for small modals
 */
const ModalHeader = ({ children, titleId, allowFullscreen = true }) => {
  const fullscreen = useStore((s) => s.modal.fullscreen);
  const toggleModalFullscreen = useStore((s) => s.toggleModalFullscreen);
  const { isPhone } = useBreakpoint();

  // Phones are always full screen, so the toggle would do nothing there
  const showToggle = allowFullscreen && !isPhone;
  const label = fullscreen ? "Exit full screen" : "Full screen";

  return (
    <BootstrapModal.Header closeButton className={styles.header}>
      <BootstrapModal.Title id={titleId} className={styles.title}>
        {children}
      </BootstrapModal.Title>
      {showToggle && (
        <Tooltip title={label} arrow>
          <IconButton
            size="small"
            onClick={toggleModalFullscreen}
            aria-label={label}
            aria-pressed={fullscreen}
            className={styles.toggle}
          >
            {fullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
          </IconButton>
        </Tooltip>
      )}
    </BootstrapModal.Header>
  );
};

export default ModalHeader;
```

Use selectors (`useStore((s) => …)`) rather than `useStore()`, so the header only re-renders when these two
values change.

### `modalHeader.module.scss`

In Bootstrap 5, `.modal-header .btn-close` has `margin-left: auto`. If the toggle also uses `margin-left: auto`, the
free space is split between the two and the toggle ends up in the middle. Instead, let the title take the free space
and give the close button a small fixed gap:

```scss
.header {
  gap: 0.25rem;

  :global(.btn-close) {
    margin-left: 0.25rem;
  }
}

.title {
  flex: 1 1 auto;
  min-width: 0;          // allow long titles to truncate
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.toggle {
  flex: 0 0 auto;
}
```

The DOM order is `[title] [toggle] [✕]`. The toggle has to render before the close button, but react-bootstrap
renders `closeButton` after the children. Because of that, the toggle is passed as a child and only the close button
comes from Bootstrap.

---

## 6. Migrate the content components

Mechanical replacement in each of the 24 components:

```diff
- <BootstrapModal.Header closeButton>
-   <BootstrapModal.Title>{title}</BootstrapModal.Title>
- </BootstrapModal.Header>
+ <ModalHeader>{title}</ModalHeader>
```

`IframeDisplayModal` keeps its id: `<ModalHeader titleId="iframe-modal-title">{title}</ModalHeader>`.

Components to migrate:

| Component | Toggle? | Fixed sizes to relax in full screen |
|---|---|---|
| PlayObjectModal | ✅ | outer `<div style={{height:"100vh"}}>` → `height: 100%` when full screen |
| PlayObjectModal2 | ✅ | same as above |
| PlayCompositeBlocks | ✅ | — |
| EditCompositeBlocks | ✅ | — |
| IframeDisplayModal | ✅ | `.iframe` `height: 70vh` (+ breakpoint variants) → `flex: 1` |
| VideoPlayerModal | ✅ | player aspect box: allow it to grow |
| DeepImageModal / DeepVideoModal / DeepAudioModal | ✅ | — |
| QuillModal / TextEditorModal | ✅ | editor `height: 500px` → `flex: 1` |
| SubObjectModal | ✅ | `--studio-height: 75vh` → `calc(100dvh - header)` |
| CompositeBlocksModal | ✅ | body inline `maxHeight: "70vh"` → none |
| VirtualBlockContentModal | ✅ | AutoGenPanel `max-height: calc(100vh - 260px)` OK as is |
| VirtualBlockReaderModal / …NavigationModal | ✅ | — |
| GlossaryModal, EnrichingContentModal | ✅ | — |
| ObjectsTableModalContent / …2, SelectFromLibraryModal | ✅ | — |
| AutoUiModal | ✅ | — |
| LinkEditorModal, AudioPlayerModal | ❌ `allowFullscreen={false}` | small forms: full screen adds nothing |

### Sizing pattern for full screen

In Bootstrap `.modal-fullscreen`, `.modal-content` is `height: 100%` and `.modal-body` gets `overflow-y: auto`.
Content with a fixed `vh`/`px` height does **not** grow on its own. For each modal with a fixed size, add an
override keyed on the wrapper class:

```scss
// e.g. iframeDisplayModal.module.scss
:global(.is-fullscreen) .iframe {
  height: auto;
  flex: 1 1 auto;
  min-height: 0;
}
```

…and make the body a flex column where the content should fill the remaining height:

```scss
:global(.is-fullscreen) :global(.modal-body) {
  display: flex;
  flex-direction: column;
  min-height: 0;
}
```

Inline styles (`CompositeBlocksModal`'s `maxHeight: "70vh"`, `PlayObjectModal`'s `height: "100vh"`) cannot be
overridden from SCSS without `!important`. Change them to depend on the `isFullscreen` prop instead:

```jsx
<BootstrapModal.Body style={isFullscreen ? undefined : { maxHeight: "70vh", overflow: "auto" }}>
```

---

## 7. Behaviour details

- **Reset:** closing the modal, or opening another one, returns to normal size (§3).
- **Phone:** always full screen as today. The toggle is hidden.
- **Esc / backdrop click:** unchanged — still closes the modal.
- **Animation:** Bootstrap switches `.modal-fullscreen` without a transition. The jump is acceptable. A CSS
  transition on `max-width`/`height` is optional polish, not part of this scope.
- **Content that measures itself** (canvas in `VirtualBlockContentModal/ContentItemForm`, `react-image-area` in
  SubObjectModal Studio): check that they re-measure on resize. Most listen to `window` resize, which does **not**
  fire when the dialog changes size. If one doesn't update, add a `ResizeObserver` on its container, or an effect
  on `isFullscreen`.
- **MUI dialogs** (`ImportPagesModal`, `AddChapterModal`): out of scope. If needed later, pass
  `fullScreen={fullscreen}` to the MUI `<Dialog>` and add the same toggle to its `DialogTitle`.

---

## 8. Optional: real browser full screen

To also hide the browser chrome (useful for `PlayObjectModal` / `IframeDisplayModal`), the toggle can also call:

```js
const el = document.querySelector(".modal.show");
document.fullscreenElement ? document.exitFullscreen() : el?.requestFullscreen?.();
```

Listen for `fullscreenchange` to keep the store flag in sync when the user presses Esc. Not planned for now, because
the Fullscreen API has iframe and permission edge cases (`allowfullscreen`, Safari prefix). Add it only if the
viewport version is not enough.

---

## 9. Implementation steps

1. **Store** — add `fullscreen`, `toggleModalFullscreen`, and reset logic (§3).
2. **Wrapper** — pass `fullscreen`, `dialogClassName` and the `isFullscreen` prop (§4).
3. **ModalHeader** — create the component and SCSS (§5).
4. **Migrate** — replace the headers in the 24 components (§6 table). One commit, mechanical.
5. **Sizing** — fix the fixed-height modals in the table: IframeDisplay, Quill, TextEditor, SubObject,
   CompositeBlocks, PlayObject/2, VideoPlayer.
6. **Verify** — run through the checklist below.

---

## 10. Test checklist

- [ ] Desktop: every migrated modal shows `⛶` between the title and `✕`, aligned right.
- [ ] Clicking `⛶` fills the viewport, and the icon becomes "exit full screen". Clicking again restores `xl`.
- [ ] Long titles truncate with an ellipsis and never push the buttons off the header.
- [ ] Close in full screen, then reopen the same or another modal → it opens at normal size.
- [ ] `openModal(name, props, { fullscreen: true })` opens already maximised.
- [ ] Phone width (< 600px): full screen as before, no toggle shown.
- [ ] Tablet (600–1023px): toggle works.
- [ ] IframeDisplay, Quill, TextEditor, SubObject (Studio), PlayObject: the content fills the extra height and
      there is no double scrollbar.
- [ ] VirtualBlockContentModal canvas selections still line up after toggling.
- [ ] Keyboard: Tab reaches the toggle, Enter/Space toggles, Esc closes the modal.
- [ ] LinkEditorModal / AudioPlayerModal: no toggle.
