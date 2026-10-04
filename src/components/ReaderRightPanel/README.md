# ReaderRightPanel — Implementation Plan

Status: **planning** (no implementation yet). Current file (`ReaderRightPanel.jsx`) is a placeholder stub rendered from `src/pages/Reader/Reader.jsx`.

## 1. What we're building

`ReaderRightPanel` is the right-hand column of the new `Reader` page. It has exactly two UI pieces, stacked vertically:

1. **Tabs** — two tabs, each backed by a grid of action buttons that changes per tab.
2. **Bag** — a persistent "My Bag" panel pinned under the button grid, with a floating circular `+` button.

Reference mockups (already in the repo root, not yet moved into an `assets` folder — see Open Questions):

| File | Tab shown | Header title |
|---|---|---|
| `capture1.PNG` | Tab 1 | "Study Book" |
| `capture2.PNG` | Tab 2 | "Review Booklets" |

Note: `Capture.PNG` is a **different**, already-built component (`Chat` — "Chat History" / "Ask a Question") and is out of scope here; it's referenced only for layout context in `Reader.jsx`.

## 2. Visual breakdown of the mockups

Both mockups share one layout, only the title + button labels differ:

```
┌───────────────────────────────┐
│ ◤  <Tab Title>                │  ← header bar, light grey, blue title text,
├───────────────────────────────┤     small back-arrow glyph top-left
│ Studio                    ┋    │  ← thin sub-header strip (context label)
│ ┌────────────┐ ┌────────────┐ │
│ │  Button A  │ │  Button B  │ │  ← 2-column grid of blue, rounded,
│ ├────────────┤ ├────────────┤ │     white-text action buttons.
│ │  Button C  │ │  Button D  │ │     Last row may have an odd count
│ │     ...    │ │     ...    │ │     (Tab 1 has 9 buttons → one
│ └────────────┘ └────────────┘ │     empty cell in the last row).
│                                │
│ ┌────────────────────────────┐│
│ │                            ││
│ │          My Bag            ││  ← orange/amber panel, persists
│ │                            ││     across both tabs
│ │ (+)                        ││  ← blue circular FAB, bottom-left,
│ └────────────────────────────┘│     overlapping the panel edge
└───────────────────────────────┘
```

**Tab 1 — "Study Book" (`capture1.PNG`)** — 9 buttons:
TOC, Objectives, Recalls, Glossary, Illustratives, Exercises, Nugget Learning, Enriching's, Personalized Learning.

**Tab 2 — "Review Booklets" (`capture2.PNG`)** — 8 buttons:
SieNotebook, TOC, Summary, Learning Nuggets, Exam Mocks, Auto Check Yourself, Headlights, Glossary.

## 3. How this fits the existing codebase

The repo already has a *different*, unrelated tab system used by the Studio/Book reader (`src/config/tabs.config.json` + `src/utils/tabFiltering.js`, rendering things like `TableOfContents`, `List`, `ExerciseTab` in the old `src/pages/Book/Book.jsx`). There's also a top header tab system in `src/config/reader.js` + `BookHeaderLayout.jsx` ("The Book" / "Review Book").

`ReaderRightPanel` is part of the **new** `src/pages/Reader` page being built alongside it (`Chat`, `ScanAndUpload`). Its button labels don't map 1:1 onto either existing config, so it needs **its own small config**, but several buttons (TOC, Glossary, Illustratives→Illustrative Interactions, Exercises, Check Yourself) clearly correspond to *content that already exists* as tab components in `tabs.config.json`. Where practical, this panel should launch/reuse that existing content rather than re-implement it — see step 6 below.

## 4. Proposed file structure

```
src/components/ReaderRightPanel/
├── ReaderRightPanel.jsx            # container: tab state + drill-down state
├── readerRightPanel.module.scss    # layout + colors
├── readerRightPanel.config.js      # per-tab button lists (data, no JSX)
├── components/
│   ├── PanelHeader.jsx             # title bar + back arrow
│   ├── PanelTabs.jsx               # MUI <Tabs>/<Tab> — the 2 tabs
│   ├── ActionButtonGrid.jsx        # 2-col grid, maps config -> ActionButton
│   ├── ActionButton.jsx            # single blue rounded button
│   └── index.js                    # barrel export
└── README.md                       # this file
```

`Bag` is a candidate for reuse elsewhere later (e.g. a Studio "clipboard" of picked content), so it's proposed as its own top-level component rather than nested:

```
src/components/Bag/
├── Bag.jsx            # "My Bag" panel + contents list + FAB
├── bag.module.scss
└── index.js
```

## 5. Data model

`readerRightPanel.config.js`:

```js
export const READER_RIGHT_PANEL_TABS = {
  STUDY_BOOK: "study-book",
  REVIEW_BOOKLETS: "review-booklets",
};

export const READER_RIGHT_PANEL_TAB_CONFIG = [
  {
    id: READER_RIGHT_PANEL_TABS.STUDY_BOOK,
    title: "Study Book",
    actions: [
      { id: "toc", label: "TOC" },
      { id: "objectives", label: "Objectives" },
      { id: "recalls", label: "Recalls" },
      { id: "glossary", label: "Glossary" },
      { id: "illustratives", label: "Illustratives" },
      { id: "exercises", label: "Exercises" },
      { id: "nugget-learning", label: "Nugget Learning" },
      { id: "enrichings", label: "Enriching's" },
      { id: "personalized-learning", label: "Personalized Learning" },
    ],
  },
  {
    id: READER_RIGHT_PANEL_TABS.REVIEW_BOOKLETS,
    title: "Review Booklets",
    actions: [
      { id: "sie-notebook", label: "SieNotebook" },
      { id: "toc-review", label: "TOC" },
      { id: "summary", label: "Summary" },
      { id: "learning-nuggets", label: "Learning Nuggets" },
      { id: "exam-mocks", label: "Exam Mocks" },
      { id: "auto-check-yourself", label: "Auto Check Yourself" },
      { id: "headlights", label: "Headlights" },
      { id: "glossary-review", label: "Glossary" },
    ],
  },
];
```

Each `actions[]` entry may later grow a `component` field (mirroring `tabs.config.json`'s `component: "TableOfContents"` pattern) once step 6 is resolved, so the grid can drill into real content instead of a placeholder.

## 6. Interaction design

1. **Tab switch** (`PanelTabs`): selecting a tab updates `activeTabId` and resets any drill-down back to the button grid (mirrors the reset behavior already used in `BookHeaderLayout.jsx` for outer/inner tabs).
2. **Button click** (`ActionButton` → `ActionButtonGrid`): the small back-arrow glyph in the header strongly implies drill-down navigation:
   - Clicking a button swaps the grid for that action's content view and the header title changes to the button's label with a visible back arrow.
   - Clicking the back arrow returns to the grid for the current tab.
   - *Assumption, flagged in Open Questions*: for a first pass, content views can render a simple placeholder (`<div>{label} content</div>`), matching how `ReaderRightPanel.jsx` itself is currently stubbed — wiring real content (TOC, Glossary, etc.) is a follow-up once it's confirmed whether this panel reuses the existing `tabs.config.json` components.
3. **Bag** (`Bag.jsx`): renders below the grid regardless of active tab/drill-down state (it's owned by `ReaderRightPanel`, not by a tab). The `+` FAB is the only interactive affordance in the mockups — first pass: opens a placeholder "add to bag" action (callback prop), leaving the real add-flow for a follow-up once product intent is confirmed (see Open Questions).

State lives locally in `ReaderRightPanel` for v1 (`useState` for `activeTabId` and `activeActionId`); no Zustand/store or API wiring until there's a real content/bag payload to persist.

## 7. Styling

- Palette from the mockups: buttons ≈ medium blue (`#5B93C6`-ish) with white text, rounded corners (~6–8px), consistent gap; bag panel ≈ amber/orange (`#F5A623`-ish); header bar light grey; title text blue, matching the app's general MUI look rather than the `theme.js` teal `primary.main` (`#0594a9`) — needs a design decision, see Open Questions.
- Implemented as an SCSS module (`readerRightPanel.module.scss`, `bag.module.scss`), consistent with every other component in the repo (`chat.module.scss`, `reader.module.scss`, `addObject.module.scss`, etc.) — not MUI `sx` styling, to match the codebase's dominant pattern for layout/color (MUI is used here mainly for `Tabs`/`Tab` behavior, as in `BookHeaderLayout.jsx`).
- Grid: CSS Grid, 2 columns, equal-width cells, last row's empty cell (Tab 1 has 9 buttons = odd count) left blank rather than spanning.

## 8. Integration

Already wired: `src/pages/Reader/Reader.jsx` renders `<ReaderRightPanel />` alongside `<Chat />` and `<ScanAndUpload />`. No route or store changes are needed for this component in isolation.

## 9. Open questions (need product/design confirmation before or during implementation)

- **Drill-down content**: should each button open one of the *already-existing* right-tab components (`TableOfContents`, `List`/Glossary, `ExerciseTab`, etc. from `tabs.config.json`), a new dedicated view, or a modal? This determines whether step 6 is a placeholder or real wiring.
- **Bag semantics**: is "My Bag" a cart of items dragged/added from the button grid (a to-do/selection list the user builds up), a saved-for-later list, or something else? What does `+` add?
- **Per-tab vs shared bag**: does the bag's content differ between "Study Book" and "Review Booklets", or is it one shared bag?
- **Reference images**: `capture1.PNG` / `capture2.PNG` (and the unrelated `Capture.PNG`) currently sit at the repo root — should they move to `src/assets/` (or be deleted after this plan is implemented) rather than stay untracked at the root?
- **Color tokens**: confirm exact hex values for the blue buttons / amber bag against real designs (mockups are low-fidelity screenshots), and whether they should be added to `theme.js` or stay component-local SCSS variables.

## 10. Implementation phases (checklist)

- [ ] Phase 1 — Scaffolding: create file structure above, `readerRightPanel.config.js` with both tabs' data, empty/placeholder sub-components.
- [ ] Phase 2 — Tabs + header: `PanelTabs` + `PanelHeader`, tab switch resets drill-down, title updates.
- [ ] Phase 3 — Button grid: `ActionButtonGrid` + `ActionButton`, 2-col responsive layout, click drills into a placeholder view, back arrow returns.
- [ ] Phase 4 — Bag: `Bag` component with the amber panel + `+` FAB, rendered persistently under the grid.
- [ ] Phase 5 — Styling pass: match mockup colors/spacing once Open Question on color tokens is resolved.
- [ ] Phase 6 — Real content wiring: connect buttons to actual TOC/Glossary/Exercises/etc. content once Open Question on drill-down is resolved.
- [ ] Phase 7 — Bag behavior: implement real add/remove logic once bag semantics are confirmed.

Phases 1–4 can proceed now under the stated assumptions; phases 5–7 need the open questions answered first.
