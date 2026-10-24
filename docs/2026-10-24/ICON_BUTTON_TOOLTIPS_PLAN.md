# Plan: Tooltips for icon buttons

Branch: `IBook-2-development` · Date: 2026-10-24 · Status: **implemented** with the
suggested text below. Open questions were resolved with the defaults: plain `<button>`s
got `title` + `aria-label`; the arrow buttons keep their behavior; zoom-off is still a no-op;
English only.

## Goal

Every button that shows only an icon should say what it does when hovered or
focused, and announce the same text to screen readers.

## How the list was built

A script walked the JSX of every file in `src/` and found each `<IconButton>`,
`<Fab>`, `<ToggleButton>` and every plain `<button>` whose only content is an
icon or image. A button counts as **covered** when it has a `title` prop or
sits inside `<Tooltip>`, including the `<Tooltip><span><IconButton disabled>`
pattern used for disabled buttons.

| | Count |
|---|---|
| Icon buttons found | 81 |
| Already covered (Tooltip or `title`) | 25 |
| Excluded: `ToggleButton`s in `ContentItemForm.jsx` that already show text ("Text", "Link", "Object", "AutoGen") | 4 |
| Excluded: page thumbnails in `BookThumnails.jsx:11` (an image of the page, not an action icon) | 1 |
| **Need a tooltip** | **51** (in 21 files) |

`aria-label` alone was **not** counted as covered: it is invisible to
sighted users. 31 of the 51 already have one, often a code-like value
(`"visibility-icon"`, `"zoom-off"`). The plan replaces those with the
tooltip text.

## Proposed convention

1. Use MUI `<Tooltip title="…">`, not the native `title` attribute. Most
   covered buttons already do this. It also works with keyboard focus and
   follows the app's RTL direction.
2. Give the `IconButton` an `aria-label` with **the same text** as the tooltip.
3. If the button can be `disabled`, wrap it: `<Tooltip><span><IconButton disabled/></span></Tooltip>`.
   MUI cannot show a tooltip on a disabled element directly.
4. For toggle buttons, the tooltip names the action the next click performs,
   e.g. `showVB ? "Hide virtual blocks" : "Show virtual blocks"`.
5. Plain `<button>`s get `title` + `aria-label` (or are converted to
   `IconButton` + `Tooltip`; see question 1).
6. Text is sentence case: "Next page", not "next page" or "Next Page".

```jsx
<Tooltip title="Next page">
  <IconButton aria-label="Next page" onClick={onClickNextPage}>
    <KeyboardArrowRightIcon />
  </IconButton>
</Tooltip>
```

## Buttons that need a tooltip

The **Suggested tooltip** column is the proposal to review. Edit it in place
if you prefer different wording.

### Book reader & Studio toolbar

| # | Location | Icon | What it does | Current `aria-label` | Suggested tooltip |
|---|---|---|---|---|---|
| 1 | `src/components/ImageActions/ImageActions.jsx:172` | FirstPage | Go to the first page | `first` | First page |
| 2 | `src/components/ImageActions/ImageActions.jsx:175` | KeyboardArrowLeft | Go to the previous page | `previous` | Previous page |
| 3 | `src/components/ImageActions/ImageActions.jsx:178` | KeyboardArrowRight | Go to the next page | `next` | Next page |
| 4 | `src/components/ImageActions/ImageActions.jsx:181` | LastPage | Go to the last page | `last` | Last page |
| 5 | `src/components/ImageActions/ImageActions.jsx:190` | ZoomIn | Enlarge the page | `zoom-in` | Zoom in |
| 6 | `src/components/ImageActions/ImageActions.jsx:194` | SearchOff | **Handler is empty, so the button does nothing** (see question 3) | `zoom-off` | Reset zoom |
| 7 | `src/components/ImageActions/ImageActions.jsx:198` | ZoomOut | Shrink the page | `zoom-out` | Zoom out |
| 8 | `src/components/ImageActions/ImageActions.jsx:210` | Publish / spinner | Open the publish-language menu; disabled while publishing | `publish-chapter` | `isPublishing ? "Publishing…" : "Publish chapter"` (needs `<span>` wrapper) |
| 9 | `src/components/ImageActions/ImageActions.jsx:256` | Visibility / VisibilityOff | Show or hide virtual blocks | `visibility-icon` | `showVB ? "Hide virtual blocks" : "Show virtual blocks"` |
| 10 | `src/components/Studio/StudioActionsButtons/StudioActionsButtons.jsx:23` | Visibility / VisibilityOff | Show or hide virtual blocks | `visibility-icon` | `showVB ? "Hide virtual blocks" : "Show virtual blocks"` |
| 11 | `src/components/Book/BookViewerTopBar/BookViewerTopBar.jsx:48` | FirstPage | Go to the first page | `first` | First page |
| 12 | `src/components/Book/BookViewerTopBar/BookViewerTopBar.jsx:51` | KeyboardArrowLeft | Go to the previous page | `previous` | Previous page |
| 13 | `src/components/Book/BookViewerTopBar/BookViewerTopBar.jsx:54` | KeyboardArrowRight | Go to the next page | `next` | Next page |
| 14 | `src/components/Book/BookViewerTopBar/BookViewerTopBar.jsx:57` | LastPage | Go to the last page | `next` ⚠️ wrong label | Last page |
| 15 | `src/components/Book/BookViewerTopBar/BookViewerTopBar.jsx:60` | Visibility / VisibilityOff | Show or hide virtual blocks | `show` | `showVB ? "Hide virtual blocks" : "Show virtual blocks"` |
| 16 | `src/components/Book/BookColumn2/BookColumn2.jsx:48` | Minimize | Collapse the open side column | — | Minimize panel |
| 17 | `src/components/Book/BookColumnHeader/BookColumnHeader.jsx:12` | Minimize | Close the column | — | Minimize panel |
| 18 | `src/components/ReaderAudioControls/ReaderAudioControls.jsx:291` | MoreVert | Open the playback-speed menu | `audio-options` | Playback speed |
| 19 | `src/components/ReaderRightPanel/components/PanelHeader.jsx:14` | ArrowBack | Go back in the right panel | `Back` | Back |

### Virtual blocks

| # | Location | Icon | What it does | Current `aria-label` | Suggested tooltip |
|---|---|---|---|---|---|
| 20 | `src/components/VirtualBlocks/VirtualBlock/VirtualBlock.jsx:376` | DeleteForever | Delete the virtual block | `delete virtual block` | Delete virtual block |
| 21 | `src/components/VirtualBlocks/VirtualBlock/VirtualBlock.jsx:398` | Block image (in a count `Badge`) | Reader: open its contents. Author: edit it | `view virtual block` | `` reader ? `Open ${displayLabel}` : `Edit ${displayLabel}` `` |

### Side tabs (lists, glossary, my items)

| # | Location | Icon | What it does | Current `aria-label` | Suggested tooltip |
|---|---|---|---|---|---|
| 22 | `src/components/Tabs/List/List.jsx:329` | Add (large) | Add an item to the current tab; on Glossary it opens "Add Glossary Term" | — | `isGlossaryTab ? "Add glossary term" : "Add item"` |
| 23 | `src/components/Tabs/ListItem/ListItem.jsx:33` | PlayArrow | Play the object | — | Play |
| 24 | `src/components/Tabs/ListItem/ListItem.jsx:39` | KeyboardArrowUp | Jump to the item's first reference on the page; disabled without references | — | Go to item in page (see question 2) |
| 25 | `src/components/Tabs/ListItem/ListItem.jsx:46` | KeyboardArrowDown | Same as #24 (`List.jsx:233`: "same as handleMoveUp for now") | — | Go to item in page (see question 2) |
| 26 | `src/components/Tabs/ListItem/ListItem.jsx:59` | Delete | Remove the item from the list | — | Delete |
| 27 | `src/components/Tabs/GlossaryListItem/GlossaryListItem.jsx:78` | Edit | Edit the glossary term | — | Edit term |
| 28 | `src/components/Tabs/GlossaryListItem/GlossaryListItem.jsx:85` | KeyboardArrowUp | Jump to the term's reference; disabled without references | — | Go to term in page (see question 2) |
| 29 | `src/components/Tabs/GlossaryListItem/GlossaryListItem.jsx:93` | KeyboardArrowDown | Same as #28 | — | Go to term in page (see question 2) |
| 30 | `src/components/Tabs/GlossaryListItem/GlossaryListItem.jsx:105` | Delete | Delete the glossary term | — | Delete term |
| 31 | `src/components/Tabs/GlossaryAndKeywords/GlossaryAndKeywords.jsx:104` | North | Jump to the term's first reference | — | Go to term in page (see question 2) |
| 32 | `src/components/Tabs/GlossaryAndKeywords/GlossaryAndKeywords.jsx:107` | South | Same as #31 | — | Go to term in page (see question 2) |
| 33 | `src/components/Tabs/ReaderEnrichingItems/ReaderEnrichingItems.jsx:95` | PlayArrow | Open the reader's own item | `play` | Play item |
| 34 | `src/components/Tabs/ReaderEnrichingItems/ReaderEnrichingItems.jsx:100` | Edit | Edit the reader's own item | `edit` | Edit item |
| 35 | `src/components/Tabs/ReaderEnrichingItems/ReaderEnrichingItems.jsx:105` | Delete | Ask to delete the reader's own item | `delete` | Delete item |
| 36 | `src/components/Bag/Bag.jsx:14` | Add (plain `<button>`) | Add to My Bag | `Add to bag` | Add to My Bag |

### Studio areas & auto-UI forms

| # | Location | Icon | What it does | Current `aria-label` | Suggested tooltip |
|---|---|---|---|---|---|
| 37 | `src/components/AreaItem/AreaItem.jsx:58` | Rendered from `actions` (`AreaAction.jsx:54`): PlayArrow / Edit / DeleteForever | Play, edit, or delete a selected area | `{action.label}` (`play` / `edit` / `delete`) | Add a `tooltip` field to each action: "Play object", "Edit area content", "Delete area"; render `<Tooltip title={action.tooltip}>` |
| 38 | `src/components/DrawnUI/ArrayUI/ArrayUI.jsx:31` | Add | Append an item to an array field | `add` | Add item |
| 39 | `src/components/DrawnUI/ArrayUI/ArrayItem/ArrayItem.jsx:31` | Delete | Remove the item from the array field | `delete` | Remove item |

### Question forms

| # | Location | Icon | What it does | Current `aria-label` | Suggested tooltip |
|---|---|---|---|---|---|
| 40 | `src/components/MultipleChoice/QuestionForm/QuestionForm.jsx:136` | Info (plain `<button>`) | Show or hide the tip field for the answer | — | Show/hide tip |
| 41 | `src/components/FillBlank/QuestionForm/QuestionForm.jsx:128` | Info (plain `<button>`) | Show or hide the tip field for the option | — | Show/hide tip |
| 42 | `src/components/DragTheWords/QuestionForm/QuestionForm.jsx:138` | Info (plain `<button>`) | Show or hide the tip field for the option | — | Show/hide tip |
| 43 | `src/components/TrueFalse/TrueFalse.jsx:182` | Delete | Delete the question from the tree | `delete` | Delete question |
| 44 | `src/pages/Types/Types.jsx:98` | Edit | Edit the object type | `edit` | Edit type |
| 45 | `src/pages/Types/Types.jsx:104` | Delete | Delete the object type | `delete` | Delete type |

### Modals

| # | Location | Icon | What it does | Current `aria-label` | Suggested tooltip |
|---|---|---|---|---|---|
| 46 | `src/components/Modal/AddChapterModal/AddChapterModal.jsx:177` | Close (small) | Clear the chosen file; can be disabled | — | Remove file (needs `<span>` wrapper) |
| 47 | `src/components/Modal/AddChapterModal/AddChapterModal.jsx:261` | Close | Close the dialog; disabled while submitting | — | Close (needs `<span>` wrapper) |
| 48 | `src/components/Modal/EditObjectModal/EditObjectModal.jsx:80` | Clear | Close the dialog | `close` | Close |
| 49 | `src/components/Modal/EditParametersModal/EditParametersModal.jsx:21` | Clear | Close the dialog | `close` | Close |
| 50 | `src/components/Modal/ImportPagesModal/ImportPagesModal.jsx:53` | Close | Close the dialog | — | Close |
| 51 | `src/components/Modal/VirtualBlockReaderNavigationModal/IframeContentDisplay.jsx:85` | Refresh | Reload the content after an error | `Retry` | Retry |

## Questions for review

1. **Plain `<button>`s** (#16, #17, #36, #40–42): should they only get
   `title` + `aria-label`, or be converted to MUI `IconButton` + `Tooltip`
   for a consistent look? Converting changes their styling slightly.
2. **Up/down arrows** (#24, #25, #28, #29, #31, #32): both arrows in each pair
   jump to the item's *first* reference, and neither reorders anything.
   Tooltips like "Move up" would be misleading. Should the down arrow go to
   the *next* reference instead, or should each pair be replaced by a single
   "Go to in page" button?
3. **Zoom-off** (#6): `onClickZoomOff` in `ImageActions.jsx:93` is empty, so
   the button does nothing. Should it be implemented as "Reset zoom", or
   removed?
4. **Arabic**: the app switches between English and Arabic, but tooltips
   here are English-only, like the existing covered ones. Should the new
   text go through a translation map, as tab labels do via `getTabLabel()`
   in `src/utils/tabFiltering.js`?

## Implementation steps (after approval)

1. Apply the agreed text file by file, following the convention above.
   Replace each existing `aria-label` with the tooltip text.
2. Fix the wrong `aria-label="next"` on the Last page button (#14).
3. Add the `tooltip` field to the `actions` in `AreaAction.jsx` (#37).
4. Re-run the scan; expect 0 icon buttons without a Tooltip or `title`.
5. Check in the browser: Studio toolbar, reader toolbar, side tabs, and
   modals, in both English and Arabic (RTL).
