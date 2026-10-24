# Plan: Responsive Book Author and Reader pages

Branch: `IBook-2-development` · Date: 2026-10-24 · Status: **approved with defaults** · Phases 0–5 **implemented**

Pages in scope:

| URL | Mode (`useAppMode()`) |
|---|---|
| `/book-author/book/:bookId/chapter/:chapterId` | `book-author` |
| `/read/book/:bookId/chapter/:chapterId` | `reader` |

Both routes render the **same tree**: `ScanAndUpload` → `Studio` → `StudioHeader` +
`StudioLayout` (left `BookColumn`, `StudioEditor`, right `BookColumn`). The mode only
changes which tabs, toolbar buttons and area renderer are shown. So one layout change
fixes both pages. Mode-specific work is marked **[reader]** or **[author]** below.

## Goal

Both pages are usable, without horizontal page scroll, on:

| Class | Width | Example devices |
|---|---|---|
| Phone | < 600px | iPhone SE / 14, Android phones (portrait) |
| Tablet | 600–1023px | iPad portrait, Android tablets, phones in landscape |
| Desktop | ≥ 1024px | Laptops, iPad landscape, monitors |

The theme (`src/theme/theme.js`) uses MUI's default breakpoints (`sm` 600, `md` 900,
`lg` 1200). Phone/tablet uses `sm`; the 1024px desktop cut-off is a custom query
(`useMediaQuery("(min-width:1024px)")`). See question 4.
Desktop must look and behave **exactly as today**.

## What breaks today (from the code)

| # | Problem | Where |
|---|---|---|
| 1 | Fixed layout height `59rem` (≈944px), taller than most phone/laptop screens, so the page scrolls twice (window + editor). | `studio.module.scss` `.studio` |
| 2 | Three columns always side by side with `gap: 2rem`. An opened side column takes `flex: 0 0 20%` (~75px on a phone); a closed one is `2.6%` with vertical (`writing-mode: tb-rl`) tab labels that become unreadable. | `studio.module.scss`, `BookColumn.jsx:56-61`, `bookColumn.module.scss` |
| 3 | **Block positions are stored in px and only recalculated on image `onLoad`**. Rotating a device or resizing the window leaves blocks misaligned with the page image. No `resize`/`ResizeObserver` exists in Studio. | `getBlockStyle` in `StudioAreaSelector.jsx`, `recalculateAreas` in `hooks/useAreaManagement.js:124` |
| 4 | Toolbar has 4 groups of `large` icons plus `\|` separators with `font-size: 27px`; wraps to 2–3 rows on a phone and covers the page. | `ImageActions.jsx`, `ImageActions/styles.module.scss` |
| 5 | Sticky toolbar (shown when the main toolbar scrolls away) is `position: fixed; width: 37.5%`, i.e. ~140px on a phone. | `studioStickyToolbar.module.scss` |
| 6 | Bootstrap `.container` adds side padding and max-width steps; on a phone it wastes ~24px of the page width. | `ScanAndUpload.jsx` root `div` |
| 7 | Desktop-only interactions: block type labels appear on `:hover`; block actions open on right-click (`onContextMenu`). Neither exists on touch. | `studioAreaSelector.module.scss:37`, `hooks/useBlockContextMenu.js` |
| 8 | **[author]** Area drawing uses `@bmunozg/react-image-area` (mouse drag). Small handles, hard to use with a finger; page-scroll vs. draw conflict on touch. | `EditModeRenderer.jsx` |
| 9 | Navbar: 80px logo + `mb: 6` (48px) margin + username + Log out + language switcher in one row. ~130px of a 667px phone screen before any content. | `Navbar.jsx`, `navbar.module.scss` |
| 10 | Studio grid in the area selector uses `grid-template-rows: 6rem … 6rem` and `height: 95%`, tied to the fixed parent height. | `studioAreaSelector.module.scss` |

Already in our favour: the viewport meta tag is set (`public/index.html`), MUI and its
`useMediaQuery` are available, and `BookColumn2` / `BookTabsLayout` already contain a
`768px` mobile pattern we can learn from.

## Proposed approach

### Principles

1. **Desktop first stays untouched.** All new rules live under `max-width` media queries or
   behind an `isMobile` / `isTablet` flag. Desktop CSS is not edited, only moved if needed.
2. **One source of truth for breakpoints.** A small hook in
   `src/hooks/useBreakpoint.js` built on MUI `useMediaQuery(theme.breakpoints…)`
   returns `{ isPhone, isTablet, isDesktop }`. SCSS uses matching variables in a new
   `src/styles/_breakpoints.scss` (`$bp-sm: 600px; $bp-lg: 1024px;`).
3. **On small screens the page image is the main thing.** Side panels become overlays the
   user opens on demand; they never squeeze the page.
4. **Touch is a first-class input**: every hover or right-click action has a tap or
   long-press equivalent.
5. Respect RTL (`document.dir`): drawers open from the logical start/end, not hard-coded left/right.

### Target layout per device

```
DESKTOP (≥1024) — unchanged
┌────┬───────────────────────────┬────┐
│tabs│ toolbar                   │tabs│
│ or │───────────────────────────│ or │
│20% │ page image + blocks       │20% │
│pane│                           │pane│
└────┴───────────────────────────┴────┘

TABLET (600–1023)
┌──┬──────────────────────────────┬──┐
│▤ │ toolbar (1 row, compact)     │▤ │   ▤ = icon-only tab rail (48px)
│▤ │──────────────────────────────│▤ │   tap → panel slides over the page
│▤ │ page image (fit width)       │▤ │   (MUI Drawer, ~360px, with backdrop)
└──┴──────────────────────────────┴──┘

PHONE (<600)
┌──────────────────────────────────┐
│ ◀  Page 3 / 40  ▶   🔍  ⋮        │   compact toolbar, rest in ⋮ menu
│──────────────────────────────────│
│                                  │
│   page image (fit width,         │
│   pinch/zoom buttons)            │
│                                  │
│──────────────────────────────────│
│ [Pages] [Recall] [TOC] … [More]  │   bottom tab bar → full-height
└──────────────────────────────────┘     bottom sheet / full-screen drawer
```

## Phases

Each phase is a separate PR, shippable on its own, in this order.

### Phase 0 — Foundation (small) — ✅ implemented

As built (differences from the bullets below):
- `useBreakpoint` lives in `src/hooks/useBreakpoint.js` (not under Studio) because the
  app-wide Navbar uses it too. `src/styles/_breakpoints.scss` provides `phone`, `tablet`,
  `below-desktop`, `desktop` mixins (`@use "../../styles/breakpoints" as bp;`).
- `--navbar-height` is defined in `src/index.css` (128px; 72px on phones) and includes the
  Navbar bottom margin. `--studio-height` is defined on `.scan-and-upload` but not used until Phase 2.
- The language flags stay visible in the Navbar on phones (they are small); only the
  username + Log out move into the account menu.

- Add `useBreakpoint()` hook and `_breakpoints.scss`.
- `ScanAndUpload.jsx`: use `container-fluid` (or `px: { xs: 1, sm: 2 }`) below `lg`, keep
  `container` on desktop. Make `.reader-title` font sizes smaller on phones **[reader]**.
- Navbar on phones: logo height 48px, `mb: 2`, move username + Log out + language into an
  account `IconButton` menu.
- Add a `100dvh`-based height variable:
  `--studio-height: calc(100dvh - var(--navbar-height) - var(--reader-title-height, 0px))`
  (fallback `100vh` for older browsers).

### Phase 1 — Keep blocks aligned on resize (prerequisite, highest risk) — ✅ implemented

As built:
- New `src/components/Studio/hooks/useRecalculateOnResize.js`, called from `Studio.jsx`. It
  observes the **page `<img>`** (`studioEditorSelectorRef`) rather than the container, so
  it also catches zoom and column open/close. It skips each element's first measurement
  (`onLoad` handles that), re-attaches when the image element is swapped, and debounces
  with `TIMEOUTS.RESIZE_RECALCULATE_DEBOUNCE` (150ms).
- No change was needed in `coordinate.service.js`: `processPageAreas` already rebuilds px
  from `_percent*`, and `onChangeArea` keeps `_percent*` current for drawn and moved areas
  (the area library reports percentages).
- Not done: the "skip while dragging" guard. A ResizeObserver only fires on a size change,
  so it would only matter if the window is resized mid-drag; revisit if Phase 5 touch
  drawing shows a problem.
- Tests: `hooks/__tests__/useRecalculateOnResize.test.js` (3) and a "processPageAreas on
  resize" block in `services/__tests__/coordinate.service.test.js` (2).
- Browser check (iframe 700–1600px): reader 7/7 blocks within 0.03% of their position
  relative to the image; author 7/7 within 0.05%.

Fixes problem 3; without it every later phase shows misplaced blocks.

- In `Studio.jsx` attach a `ResizeObserver` to the page image container (`pageContainerRef`).
  On width change, debounce (~150ms) and call `recalculateAreas()` (same path as `onImageLoad`).
- Also handle `orientationchange` implicitly (ResizeObserver covers it).
- **[author]** Skip the recalculation while the user is mid-drag on an area, and make sure
  unsaved `CREATED`/`UPDATED` areas are converted from their percentage source, not
  re-scaled from stale px (check `coordinate.service.js` round-trip; add a unit test next to
  `services/__tests__/coordinate.service.test.js`).
- Alternative considered: render reader blocks in `%` directly (no px conversion). Simpler
  for **[reader]**, but the author renderer and the image-area library need px, so we keep one
  path for both. Can revisit later for the reader.

### Phase 2 — Responsive three-column layout — ✅ implemented

As built (differences from the bullets below):
- **Minimize ≠ close.** The active right tab drives the editor mode (Block Authoring turns
  on drawing), so below desktop a panel sheet has two buttons: *Minimize* hides the sheet
  and keeps the tab active (phone: a dot on the tab), *Close* clears the tab like the
  desktop column button. Backdrop tap = minimize.
- New `Studio/components/PanelSheet.jsx` (Drawer, `keepMounted`) used by both the tablet
  rails and the phone bar; `Studio/components/StudioMobileTabBar.jsx` for phones (tabs
  interleaved L1, R1, L2, R2…; 4 in the bar + "More" menu); `BookColumn` gets
  `responsive` / `side` / `navigationKey` props (only `StudioLayout` passes them).
- Auto-minimize on navigation applies to tablet drawers too, not only phones
  (`Studio/hooks/useMinimizeOnNavigate.js`, key = active page + highlighted block).
- Height: below desktop `ScanAndUpload` is a full-viewport flex column and `.studio` is
  `flex: 1`, so the reader title / OCR language switcher no longer push the bottom bar
  off-screen (`--reader-title-height` was dropped). `Studio` in `SubObjectModal` falls back to `100vh`.
- Thumbnails stay a single column (max 200px wide) — the drag-to-reorder `Droppable` is
  vertical-only, a grid would break it.
- Not done here: the `studioAreaSelector` 6-column grid only applies when virtual blocks
  are shown (off by default); its small-screen layout moves to Phase 4.
- MUI styles are injected after CSS modules, so sizing that overrides MUI defaults (sheet
  height/width, bottom-bar action min-width) is done with `sx`, not SCSS.
- Browser check (390px phone, 800px tablet, 1600px desktop; reader + author; RTL tablet):
  studio ends exactly at the viewport bottom; sheet 85% height on phone, 360px drawer on
  tablet; picking a thumbnail changes page and minimizes; minimize keeps Block Authoring
  editing mode on the page; RTL drawers open from the rail's side; desktop unchanged
  (944px, 32px gap, original columns).

Fixes problems 1, 2, 10.

- `studio.module.scss`: replace `height: 59rem` with `height: var(--studio-height)` on
  tablet/phone, keep `59rem` on desktop (or adopt the variable everywhere, see question 3);
  `gap: 2rem` → `gap: 0` below `lg`.
- `BookColumn.jsx`: when `!isDesktop`
  - **Closed state** → icon-only vertical rail (48px wide, `IconButton` + `Tooltip`, labels
    hidden) on tablet; on phone the two rails are merged into one bottom tab bar
    (`BottomNavigation`, first 4 tabs + "More" menu for the rest).
  - **Opened state** → render the column content inside an MUI `Drawer`
    (`variant="temporary"`, anchor start/end on tablet, `bottom` with `height: 85dvh` on phone)
    instead of a 20% flex child. Only one panel open at a time on phone.
  - Closing a drawer calls the existing `onChangeActiveTab("")`, so tab state
    (`useTabState`) does not change.
- Selecting an item inside a panel that navigates to a page/block (TOC, thumbnails,
  glossary, recalls…) auto-closes the drawer on phone so the user sees the result.
- `StudioThumbnails`: on phone show thumbnails in a 2–3 column grid inside the sheet;
  the sticky `.actions` bar **[author]** becomes a horizontal scrollable row.
- `studioAreaSelector.module.scss`: the `6rem` grid rows and `height: 95%` move under a
  desktop query; below `lg` the selector is a plain block that scrolls vertically.

### Phase 3 — Toolbar (`ImageActions` + sticky toolbar) — ✅ implemented

As built:
- `ImageActions` has a separate **phone branch**: Prev · page button (`2 / 4`) · Next | Zoom
  in · Zoom out · [reader] audio button · ⋮. The ⋮ menu holds First, Last, Reset zoom,
  [reader] virtual blocks + bookmark, [author] Publish (opens the same language menu,
  anchored to ⋮). Desktop JSX is unchanged; tablet reuses it with `Divider` separators.
- Icons: phone `small`, tablet `medium`, desktop as before.
- Page indicator below desktop is a button opening the new
  `ImageActions/GoToPagePopover.jsx` (number field, range-checked, Go disabled when out of range).
- `ReaderAudioControlsCompact` (headphones button, green dot while anything plays, full
  controls in a popover) is used on **tablet as well as phone** — with the full pill the
  tablet toolbar wrapped to 2 rows; now it is one row (45px).
- The toolbar SCSS rule that sized every `span` to 27px now targets only the `|`
  separator spans (`& > div > span`).
- Bug fix found on the way: the reader audio ⋮ (mode / track menu) was labelled
  "Playback speed"; now "Audio options".
- Sticky toolbar: full width, no transform, small shadow below desktop.
- Tests: `ImageActions/__tests__/GoToPagePopover.test.js` (4).
- Browser check: phone reader + author toolbars are one 31px row; ⋮ actions, go-to-page
  (valid / invalid), audio popover and author Publish menu work (menu opened, nothing
  published); desktop toolbar identical to before (27px `|`, full audio pill, 2 rows at
  1400px both before and after).

Fixes problems 4, 5.

- Icon size: `small` on phone, `medium` on tablet, current values on desktop.
- Remove the `|` text separators below `lg`; use MUI `Divider orientation="vertical"`.
- Phone: show only Prev / "Page X of Y" / Next / Zoom and a `⋮` overflow `Menu` holding
  First, Last, Reset zoom, show/hide virtual blocks, **[reader]** bookmark,
  **[author]** Publish. `ReaderAudioControls` **[reader]** collapse into a single play/pause
  button that opens the full controls in a popover.
- "Page X of Y" becomes tappable → small "go to page" input.
- Sticky toolbar: `width: 100%`, `left: 0`, `transform: none` below `lg`; or hide it below
  `lg` because the main toolbar is already `position: sticky` (question 5).

### Phase 4 — Page viewing and zoom — ✅ implemented

As built:
- Fit-to-width default confirmed: at scale 1 the page fills the editor (344px of a 359px
  phone editor; the rest is the scrollbar). No change needed.
- **Pinch zoom is custom, not native.** Native pinch (`touch-action: pinch-zoom`) zooms the
  whole browser viewport, not `imageScaleFactor`. New `Studio/hooks/usePinchZoom.js` (used in
  `StudioEditor`) listens to two-finger touch events on the editor:
  - while pinching it scales the page container with a CSS transform around the fingers'
    midpoint (the blocks inside follow);
  - on release it commits `imageScaleFactor` (clamped to `PINCH_ZOOM` 0.5–3), restores the
    scroll so the pinched point stays under the fingers (in a layout effect, after the new
    size renders), and recalculates blocks right away (`onZoomed` → `onImageLoad`).
  - `.studio-editor { touch-action: pan-x pan-y }` blocks the browser's own pinch there;
    one-finger scroll and taps are untouched; iOS `gesturestart` is prevented.
- **Virtual-blocks grid below desktop** (moved here from Phase 2): 3 columns, the first three
  slots above the page, the page full width in row 2, the remaining slots in rows of three
  below; `height: auto` so the editor scrolls.
- Swipe to change page: not done (decision 7: later).
- Tests: `Studio/hooks/__tests__/usePinchZoom.test.js` (3).
- Browser check (390px phone, synthetic two-finger touches): reader 344→602px with the
  pinched point kept (0.638 → 0.639) and all blocks within 0.03%; zoom out back to fit and to
  the 0.5 minimum; author page 9/9 areas within 0.03%. Reader block buttons have an existing
  `transition: all 0.2s`, so after a zoom they visibly glide into place for ~200ms (same as
  the zoom buttons). Virtual-blocks grid laid out as above.

- Default `imageScaleFactor` = fit-to-width on phone/tablet (already 1 = 100% width; confirm
  the image is not wider than the column after Phase 2).
- Allow native pinch-zoom **inside the editor only**: `touch-action: pan-x pan-y pinch-zoom`
  on the image container; on zoom end, sync to `setImageScaleFactor` so blocks follow.
  (If this proves fragile, keep the zoom buttons only — question 6.)
- **[reader]** Optional: swipe left/right on the page to go to next/previous page
  (respecting RTL). Only when not zoomed in.

### Phase 5 — Touch interactions — ✅ implemented

As built:
- **Root problem found:** the area library (`@bmunozg/react-image-area`) sets
  `touch-action: none` on its wrapper and every area and starts a draw on any pointerdown,
  so on a touch screen in author editing mode the page could not be scrolled at all —
  every drag drew a new area.
- **Draw button** (not in the toolbar — a floating "Draw" / "Done" button at the bottom-right
  of the editor, `StudioAreaSelector`). Shown only in editing mode (`EDIT_MODE`, not in
  white-out) on devices with a touch pointer (`any-pointer: coarse`).
  - Draw off (default): touch pointerdowns are stopped before the library (capture phase on
    the page container) and `touch-action` becomes `pan-x pan-y` → fingers scroll; taps on
    areas still click. Mouse and pen are unaffected.
  - Draw on: library gets the touches, `touch-action: none` → fingers draw / move / resize.
  - Resets to off when leaving editing mode. The white-out layer got `touch-action: none`
    (it is already an explicit drawing mode).
- **Long-press = right-click** (`StudioAreaSelector/hooks/useLongPress.js`, wired inside
  `useBlockContextMenu`): touch only, 500ms, cancelled by >10px movement, lifting early or a
  second finger. The click that ends a long-press is swallowed (so it doesn't also play the
  block); Android Chrome's own long-press `contextmenu` right after is suppressed. Disabled
  while Draw is on (a still finger starts a drawing).
- **Hover labels:** on `(hover: none)` the block type label also shows while a finger is on
  the area (`:active`).
- **Reader hit area:** on `(pointer: coarse)` reader block buttons get an invisible ≥44×44px
  `::after` target.
- **Resize handles:** 20px instead of 10px on `(pointer: coarse)`.
- Tests: `StudioAreaSelector/hooks/__tests__/useLongPress.test.js` (5).
- Browser check (390px frame, synthetic touch pointer events): reader long-press opens the
  block menu and does not play the block; a normal tap still opens the player; short tap and
  drag do not open the menu. Author: drag with Draw off created no area and the areas allow
  panning; Draw on → `touch-action: none`, drag created an area (discarded by reload, nothing
  saved), long-press off; Done → back to scrolling. The dev machine reports
  `any-pointer: coarse` (touch-capable), so the Draw button also appears there on desktop;
  `pointer: coarse` / `hover: none` rules (handles, hit area, labels) don't apply to a
  mouse-primary device.

Fixes problems 7, 8.

- Hover labels (`.type` on block hover): on `@media (hover: none)` show them while the block
  is selected/tapped instead of on hover. `VirtualBlock` already uses `(hover: none)` — same pattern.
- Right-click context menu (`useBlockContextMenu`): add a long-press (500ms, cancel on move
  > 10px) that opens the same `BlockContextMenu` at the touch point.
- **[reader]** Block buttons: guarantee a 44×44px minimum hit area via an invisible
  `::after` expansion, without changing the drawn size.
- **[author]** Area drawing on touch:
  - Add a "Draw" toggle in the toolbar on touch devices. When off, one-finger drag scrolls
    the page; when on, it draws an area (`touch-action: none` only while drawing).
  - Larger resize handles under `(pointer: coarse)`.

### Phase 6 — Modals and panels content

- Modals opened from these pages (PlayObject, VirtualBlockContent/Reader, IframeDisplay,
  ExercisePlayer, EditObject, Quill…) → `fullScreen` on phone via the global `Modal`
  component (`fullScreen={isPhone}`); several already have `768px` rules, align them to the
  shared breakpoints.
- **[author]** Right-panel forms (Block Authoring, Composite Blocks, `StudioActions`):
  inputs full-width, buttons stacked, `flex: 0 0 20%` rules move under desktop query.
- `LanguageSwitcher` (OCR) **[author]**: move into the overflow menu on phone.

### Phase 7 — QA

- Chrome DevTools device mode: iPhone SE (375×667), iPhone 14 Pro (393×852),
  Pixel 7 (412×915), iPad Mini (768×1024) both orientations, iPad Pro (1024×1366), 1280 and
  1920 desktop.
- Real devices: at least one iOS Safari and one Android Chrome (`100dvh`, pinch, long-press
  behave differently there).
- Both languages (`en` LTR and `ar` RTL).
- Checklist per device: no horizontal page scroll; blocks aligned after load, after rotate,
  after zoom; every tab reachable; every toolbar action reachable; modal close button visible;
  **[author]** draw, move, resize, delete an area and save; **[reader]** play a block,
  bookmark, audio controls.
- Unit tests: `useBreakpoint`, long-press hook, resize→recalculate debounce.

## Files expected to change

| File | Phases |
|---|---|
| `src/pages/ScanAndUpload/ScanAndUpload.jsx`, `scanAndUpload.module.scss` | 0 |
| `src/components/Navbar/Navbar.jsx`, `navbar.module.scss` | 0 |
| `src/styles/_breakpoints.scss` (new), `src/hooks/useBreakpoint.js` (new), `src/index.css` | 0 |
| `src/components/Studio/Studio.jsx`, `hooks/useAreaManagement.js`, `services/coordinate.service.js` | 1 |
| `src/components/Studio/studio.module.scss`, `components/StudioLayout.jsx` | 2 |
| `src/components/Book/BookColumn/BookColumn.jsx`, `bookColumn.module.scss` | 2 |
| `src/components/Studio/StudioThumbnails/*`, `StudioAreaSelector/studioAreaSelector.module.scss` | 2 |
| `src/components/ImageActions/ImageActions.jsx`, `styles.module.scss`, `ReaderAudioControls/*` | 3 |
| `src/components/Studio/StudioStickyToolbar/*` | 3 |
| `StudioAreaSelector/renderers/*`, `shared/PageImage.jsx` | 4, 5 |
| `StudioAreaSelector/hooks/useBlockContextMenu.js`, new `useLongPress.js` | 5 |
| `src/components/Modal/Modal.jsx` + modal SCSS files | 6 |
| `src/components/Studio/StudioActions/*`, `StudioCompositeBlocks/*` | 6 |

## Risks

- **Coordinate drift** (Phase 1) is the main risk: px ↔ % conversions run on every resize
  now, not only on image load. Mitigation: always convert from the stored % source, add tests.
- `BookColumn` is also used by the old Book reader (`src/pages/Book`). Gate the new drawer
  behaviour behind a prop (e.g. `responsive`) passed only from `StudioLayout`, so other pages
  keep their current behaviour.
- Drawers re-mount panel content; panels that hold local state (chat, exercise player) may
  reset. Use `ModalProps={{ keepMounted: true }}` on the Drawer.
- Pinch-zoom on iOS Safari can zoom the whole page; may need `gesturestart` prevention.

## Open questions — resolved with defaults (2026-10-24)

1. Authoring on phones: **fully supported** (Phase 5 as written).
2. Phone panels: **bottom sheet**.
3. Desktop keeps the fixed `59rem` height (desktop unchanged); the viewport height applies below 1024px only.
4. Desktop breakpoint: **1024px**.
5. Sticky toolbar below desktop: **full width**.
6. Pinch-to-zoom: **included**, with zoom buttons as fallback if it proves fragile.
7. Reader swipe to change page: **later**, not in this work.

### Original questions

1. **[author] on phones**: should authoring be fully supported on phones (drawing areas with a
   finger), or is "tablet and up" enough, with phones getting a read-only view and a
   "use a larger screen to edit" notice? The second option removes most of Phase 5's author work.
2. Phone panel style: **bottom sheet** (proposed) or full-screen drawer?
3. Replace the fixed `59rem` height with the viewport-based height on **desktop too**? It
   would remove the double scroll on laptops, but changes the current desktop look.
4. Desktop breakpoint: `1024px` (proposed, iPad landscape gets the desktop layout) or MUI
   default `md` = `900px`?
5. Sticky toolbar on small screens: make it full width, or remove it (the main toolbar is
   already sticky inside the editor)?
6. Pinch-to-zoom on the page (Phase 4): include, or keep zoom buttons only?
7. **[reader]** swipe to change page: include in this work or later?
