# Feature: Right-Click Menu on Page Blocks

**Status:** Implemented (2026-10-17) — open questions in §8 took the defaults noted there
**Area:** `src/components/Studio/StudioAreaSelector/`

---

## 1. Goal

Right-clicking a block on the page opens a small menu at the cursor with the
actions that make sense for **that** block (Play, Edit, Delete, …). Actions
that don't apply to the block are not shown.

Today these actions only exist as icon buttons in the right-hand block list
(`AreaAction`), so the author has to find the block in the list first. In
reader mode a block can only be opened by left-click.

Right-clicking an empty part of the page keeps the browser's normal menu.

---

## 2. Where Blocks Are Drawn Today

`StudioAreaSelector` picks one of six render modes
(`StudioAreaSelector/utils/renderMode.js`):

| Render mode | When | Blocks drawn by | Menu? |
|---|---|---|---|
| `READER` | Reader mode | `ReaderModeRenderer` (one `<button>` per block) | **Yes** |
| `EDIT_MODE` | Studio, authoring tabs | `EditModeRenderer` (third-party `AreaSelector`) | **Yes** |
| `VIEW_AND_PLAY` | Studio, block styling hidden | `BlockOverlayLayer` | **Yes** |
| `READ_ONLY` | Preview inside `CompositeBlocksModal` | `BlockOverlayLayer` | No — it's a picker |
| `HAND_TOOL` | Composite-block hand tool | `HandToolRenderer` | No — click = pick |
| `DEFAULT` | Other tabs | page image only | No — no blocks |

In `EDIT_MODE` on the **composite-blocks** tab the drawn boxes come from
`compositeBlocks.areas`, not the page's blocks, so the menu is off there too.

---

## 3. Actions and When They Show

Rules are copied from what the block list already does in
`src/components/AreaAction/AreaAction.jsx` and from `usePlayBlock`, so the
menu and the list always agree.

### Studio (`EDIT_MODE`, `VIEW_AND_PLAY`)

| Action | Shown when | Does |
|---|---|---|
| **Play** | block has a `type` and `type !== "Simple item"` | `openModal("play-object", { workingArea })` — same as list |
| **Edit** | block has a `type` | `openModal(type !== "Simple item" ? "auto-ui" : "quill", { workingArea, updateAreaPropertyById })` — same as list |
| **Show in list** | always | opens the block's row in the right panel (`updateAreaPropertyById(id, { open: true })`) and scrolls it into view |
| **Delete** | always | `onClickDeleteArea(area.id)` — same as list |

A block that was just drawn and has no type yet only gets **Show in list**
and **Delete**.

### Reader (`READER`)

| Action | Shown when | Does |
|---|---|---|
| **Play** / **View** | block has a `blockId` (same filter the renderer uses) | `onPlayBlock(area, areaProps)`; label from `usePlayBlock().getPlayLabel` |
| **Read aloud from here** | *optional — see §8, Q2* | start narration at this block |

The menu header shows the block's label and type (e.g. `Example — Text`), so
the user can see which block they right-clicked when blocks overlap.

---

## 4. Design

### 4.1 New files

```
src/components/Studio/StudioAreaSelector/
├── shared/BlockContextMenu.jsx          # MUI <Menu> at the cursor
├── hooks/useBlockContextMenu.js         # open/close state + right-click handler
├── utils/blockActions.js                # getBlockActions(areaProps, mode, handlers) → action list
└── utils/hitTest.js                     # findAreaIndexAtPoint(areas, point, size)
    └── __tests__/hitTest.test.js
    └── __tests__/blockActions.test.js
```

### 4.2 One handler on the page container

Instead of wiring every renderer separately, `StudioAreaSelector` puts a single
`onContextMenu` on the page container `<div ref={pageContainerRef}>`, which
wraps all renderers.

On right-click:

1. If the current render mode isn't in §2's "Yes" rows → do nothing (browser
   menu shows).
2. Work out which block is under the cursor with `findAreaIndexAtPoint`
   (see 4.3).
3. No block → do nothing (browser menu shows).
4. Block found → `event.preventDefault()` and open the menu at
   `{ top: clientY, left: clientX }` using MUI `Menu` with
   `anchorReference="anchorPosition"`.

Finding the block by position (not by which DOM element was clicked) is needed
because in `EDIT_MODE` the boxes belong to the third-party library and carry no
id we can read, and the custom content inside them only fills part of the box.

### 4.3 Hit test

`findAreaIndexAtPoint(areas, { x, y }, { width, height })`

- `x`, `y` are the cursor position relative to the container's
  `getBoundingClientRect()`.
- Each area is converted to pixels using its own `unit` (`px` as-is; `%` →
  multiply by container size) — the same rule `getBlockStyle` uses.
- Skip areas whose `areasProperties` entry has `status === DELETED`.
- In reader mode, skip areas without a `blockId` (renderer already hides them).
- If several areas contain the point, return the **smallest** one, so a small
  block inside a big one is still reachable.

This is a pure function, so it gets unit tests next to `renderMode.test.js`.

### 4.4 Stop right-click from drawing a box

The `AreaSelector` library starts drawing/moving on **any** `pointerdown` and
never checks which mouse button was used (checked in
`node_modules/@bmunozg/react-image-area/dist/index.es.js`). Without a fix, a
right-click in `EDIT_MODE` would start a new box or move the clicked one.

Fix: on the same container add `onPointerDownCapture` that calls
`event.stopPropagation()` when `event.button === 2`. Capture phase on the
parent runs before the library's handler on its wrapper, so the library never
sees right-clicks. Left-click is untouched.

### 4.5 Getting the handlers down

`StudioAreaSelector` already receives `onPlayBlock`. It also needs
`onClickDeleteArea`, `updateAreaPropertyById` and `openModal`:

- `openModal` — read from `useStore()` inside the hook (as `AreaAction` does).
- `onClickDeleteArea`, `updateAreaPropertyById` — pass from `Studio.jsx`
  through `StudioLayout` → `StudioEditor` (which spreads `{...props}` into
  `StudioAreaSelector`, so only `StudioLayout` needs the new props listed).

### 4.6 Menu behaviour

- Closes on: action click, Escape, click outside, scroll, page change
  (`activePage` changes).
- Keyboard: reader blocks are real `<button>`s, so the Menu key / Shift+F10
  fires `contextmenu` with `clientX/Y = 0`; in that case anchor the menu to the
  button's rectangle instead of the cursor.
- Each item has an icon (reuse `PlayArrow`, `Edit`, `DeleteForever` from the
  list) and Delete is shown in the error colour, last, after a divider.

---

## 5. Files to Change

| File | Change |
|---|---|
| `StudioAreaSelector/StudioAreaSelector.jsx` | add `onContextMenu` + `onPointerDownCapture` on the page container, render `<BlockContextMenu>` |
| `StudioAreaSelector/hooks/index.js`, `shared/index.js` | export the new hook / component |
| `Studio/components/StudioLayout.jsx` | pass `onClickDeleteArea`, `updateAreaPropertyById` through |
| `Studio/Studio.jsx` | pass the same two props to `StudioLayout` |
| `AreaAction/AreaAction.jsx` | *optional:* use `getBlockActions` too so list and menu share one set of rules |

No backend or API changes.

---

## 6. Edge Cases

- **Overlapping blocks** — smallest block wins (4.3); header shows which one.
- **Soft-deleted blocks** (`status: deleted`) — ignored by the hit test.
- **Zoom** (`imageScaleFactor`) — hit test uses the live container rectangle,
  so zoom is already accounted for.
- **White-out mode on** — the drag-catcher layer covers the page; menu stays
  off while it's armed.
- **Virtual blocks panel** sits outside the page container, so it's not
  affected.
- **Touch** — Android long-press fires `contextmenu`, so it works there; iOS
  Safari does not, so iOS users keep the existing left-click / list buttons.

---

## 7. Testing

**Unit (Jest):**
- `hitTest.test.js` — px and % areas, point outside all, overlap picks the
  smallest, deleted areas skipped.
- `blockActions.test.js` — untyped block, Simple item, complex type, reader
  block with/without `blockId`.

**Manual:**
1. Studio, authoring tab: right-click a typed block → Play / Edit / Show in
   list / Delete. Each one does the same as the list button.
2. Right-click a freshly drawn (untyped) block → only Show in list / Delete.
3. Right-click empty page → browser menu, **no new box drawn**.
4. Right-click a block → it does **not** move or resize.
5. Composite-blocks tab and hand tool → browser menu.
6. Reader: right-click a block → Play/View opens the same modal as
   left-click.
7. Overlapping blocks → smaller one is chosen.
8. Change page while the menu is open → it closes.

---

## 8. Questions for Review

1. **Delete confirmation** — the list deletes immediately with no "are you
   sure?". Should the menu do the same, or ask first? (Right-click menus are
   easier to mis-click.)
2. **Reader "Read aloud from here"** — narration plays a queue of clips by
   index (`useReaderNarration.playAt`). Starting from a block needs the
   block's index in that queue exposed. Include it in this feature or later?
3. **Extra studio actions** — worth adding "Change type" / "Change label"
   submenus, or is "Show in list" enough to reach those controls?
4. **Composite-blocks tab** — keep the menu off there (proposed), or add
   composite-specific actions later?

### Decisions taken at implementation

1. No confirmation — Delete behaves exactly like the list's Delete button.
2. "Read aloud from here" left for later.
3. No type/label submenus — "Show in list" opens the row with those controls.
4. Menu stays off on the composite-blocks tab (and while white-out mode is on).

`AreaAction` was not switched to `getBlockActions` (the optional row in §5).
