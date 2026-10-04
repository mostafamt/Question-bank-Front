# Reader Narration Playback — Plan

**Date:** 2026-10-01
**Mode:** Reader only (`/read/book/:bookId/chapter/:chapterId`)
**Status:** Implemented, except right-click "Narrate from here" (5.2), which is deferred. Not yet tested in the browser.
**Supersedes:** the narration part of `docs/2026-09-26/READER_NARRATION_MUSIC_PLAN.md`.
That plan assumed `block.narration` was always empty and fell back to browser
text-to-speech. The backend now returns recorded audio, so TTS is dropped.
Music mode is unchanged and stays out of scope here.

---

## 1. Goal

Pressing ▶ in `ReaderAudioControls` (Narration mode) plays the recorded
narration of the current page, block by block, in the reading language, and
highlights the block being read. Right-clicking a block offers
"Narrate from here".

## 2. What the data offers today

Checked on 2026-10-01 against
`/pages?chapterId=ed8da075f9f4f1105d53bd06&language=en` (4 pages, 89 blocks):

| Fact | Value |
|---|---|
| Blocks with a non-empty `narration` | 64 of 89 |
| Languages per narrated block | always `en`, `ar`, `fr` |
| Narrated block types | `Paragraph` (46), `Section` (18) |
| Blocks with no narration | `Picture`, `Table`, `Caption`, `Hotspot Image`, `Image Juxtaposition`, `Text MCQ` |
| Narrated blocks with size `0,0,0,0` | 18 (all the `Section` blocks) — **not narrated**, see section 3 |
| Blocks without a `blockId` | 18, and they are exactly those zero-size blocks |
| Blocks that will be narrated, per page | 16 / 14 / 12 / 4 (46 in total) |

Because zero-size blocks are left out, every block in the queue has a
`blockId`, so the engine identifies blocks by `blockId`.

`block.audio` is also filled on the same 64 blocks. I did not inspect what it
holds; the plan uses only `narration[]`, which is the per-language field.

## 3. How a block's audio is picked

```js
// narration.service.js
getNarrationUrl(block, lang) =>
  block.narration?.find((n) => n.language === lang)?.audio ?? null

isNarratable(block, lang) =>
  Boolean(block.blockId) &&
  block.coordinates?.width > 0 &&
  block.coordinates?.height > 0 &&
  Boolean(getNarrationUrl(block, lang))
```

`lang` is the reading language: `location.state.contentLanguage`, the same
value `ScanAndUpload` already sends as `?language=`. When it is absent
(chapter opened without a language choice), fall back to `"en"`. There is no
language choice in the audio control.

A block with no entry for `lang` is skipped. There is no fallback to another
language.

The page's **queue** is its blocks in array order, filtered by
`isNarratable`. The source is the raw `pages[i].blocks` that `Studio` already
receives, so `initAreasProperties` does not need to change.

## 4. Behaviour

| Action | Result |
|---|---|
| ▶ while idle | Starts at the highlighted block if it is in this page's queue, otherwise at the first block of the queue. |
| Right-click a block → "Narrate from here" | Starts at that block and continues to the end of the page. Replaces whatever was playing. Works in either mode shown in the control; it switches the control to Narration. |
| Right-click a block that is not narratable | The browser's normal context menu appears; no custom menu. |
| While a block plays | It is highlighted through `hightBlock(blockId)` and scrolled into view. |
| Block ends (`ended` event) | Next block in the queue. |
| End of page | Narration **stops** and the highlight is cleared. It does not move to the next page. |
| ⏸ / ▶ | `audio.pause()` / `audio.play()`. Resumes mid-block. |
| Volume slider / mute | `audio.volume` and `audio.muted`, applied immediately. |
| Reader changes page | Narration stops and the highlight is cleared. |
| Switch to Music, or leave the reader | Narration stops; the audio element's `src` is cleared on unmount. |
| A clip fails to load (`error` event) | Skip to the next block. If three in a row fail, stop and show a toast. |
| Page has nothing to narrate in this language | ▶ is disabled, tooltip "No narration for this page". |

The slider is currently shown only while playing. It will also show while
paused, so the reader can adjust the volume before resuming.

Left-click on a block is unchanged: it still opens the play modal
(`onPlayBlock`).

## 5. Architecture

`ImageActions` is rendered twice (`StudioEditor` and `StudioStickyToolbar`),
so `ReaderAudioControls` mounts twice. The audio must live above both, or two
copies would play. The same engine is also needed by the page (right-click),
so it is shared through a context.

```
Studio.jsx (reader mode)
 ├─ useReaderNarration(...)      ← one engine, one HTMLAudioElement
 └─ <ReaderAudioContext.Provider value={narration}>
      ├─ StudioHeader → StickyToolbar → ImageActions → <ReaderAudioControls/>
      └─ StudioLayout → StudioEditor
           ├─ ImageActions → <ReaderAudioControls/>
           └─ StudioAreaSelector → ReaderModeRenderer   (right-click menu)
```

### 5.1 The engine: `useReaderNarration`

Inputs: `pages`, `activePageIndex`, `highlightedBlockId`, `hightBlock`,
`contentLanguage`, `enabled` (reader mode).

```js
{
  mode: "narration" | "music",    // lifted here so both toolbars and the
  setMode(m),                     // right-click menu agree on it
  status: "idle" | "playing" | "paused",
  currentBlockId: string | null,
  volume: 0..100,
  isMuted: boolean,
  hasNarration: boolean,          // for the active page and language
  canNarrate(blockId): boolean,
  play(), playFrom(blockId), pause(), stop(), setVolume(v), toggleMute()
}
```

Points that matter for correctness:

- **One `Audio` element, created once and kept in a ref.** Each block only
  changes its `src`. Browsers allow `play()` after the first click on the same
  element; a new element per block can be blocked by autoplay rules,
  especially on iOS Safari.
- **Stale callbacks.** `ended` and `error` handlers read the queue and
  position from refs, not from closed-over state, so a late event from a clip
  that was stopped does nothing.
- **Stop on page change.** An effect on `activePageIndex` calls `stop()`.
  The engine never changes the page itself, so every change is the reader's.
- **Preload.** When a block starts, set `new Audio(nextUrl).preload = "auto"`
  for the next one to remove the gap between blocks.

### 5.2 Right-click "Narrate from here"

In `ReaderModeRenderer`, each block button gets an `onContextMenu` handler:

- If `canNarrate(areaProps.blockId)` is false, do nothing (native menu shows).
- Otherwise `preventDefault()` and open one MUI `<Menu>` with
  `anchorReference="anchorPosition"` at the mouse position, holding a single
  item: **Narrate from here** → `playFrom(blockId)`.

One `<Menu>` for the whole renderer, with `{ x, y, blockId }` in local state.
Touch devices have no right-click; long-press is not covered in this plan.

### 5.3 New files

| File | Responsibility |
|---|---|
| `src/components/Studio/services/narration.service.js` | Pure helpers: `getNarrationUrl(block, lang)`, `isNarratable(block, lang)`, `buildPageQueue(page, lang)` |
| `src/components/Studio/hooks/useReaderNarration.js` | The engine in 5.1 |
| `src/components/Studio/context/ReaderAudioContext.js` | `createContext(null)` + `useReaderAudio()` |

### 5.4 Existing files changed

| File | Change |
|---|---|
| `src/components/Studio/Studio.jsx` | Read `contentLanguage` from `useLocation()`. Call `useReaderNarration`. Wrap the returned JSX in `ReaderAudioContext.Provider`. |
| `src/components/ReaderAudioControls/ReaderAudioControls.jsx` | Take `mode` from the context. In Narration mode, replace local `isPlaying` / `volume` / `isMuted` with the context values and handlers. Music mode keeps its local play state for now. Disable ▶ when `!hasNarration`. Update the file header comment. |
| `src/components/Studio/StudioAreaSelector/renderers/ReaderModeRenderer.jsx` | Right-click menu (5.2). Highlight class if needed (5.5). |

### 5.5 Highlighting — to verify first

`constructBoxColors` styles the highlighted block with
`& > div:nth-of-type(n)`. `ReaderModeRenderer` renders each block as a
`<button>` inside a wrapper `<div>`, so that selector probably does not reach
it. I have not confirmed this in the browser.

First implementation step: click a TOC or glossary item in reader mode and see
whether the block lights up.

- If it does, nothing to do.
- If it does not, pass `highlightedBlockId` to `ReaderModeRenderer` and add a
  `reader-area-highlighted` class to the matching button, styled from
  `getStudioHighlightStyles()`. This also fixes TOC/glossary highlighting.

The engine scrolls the highlighted block into view
(`scrollIntoView({ block: "nearest", behavior: "smooth" })`), since a page is
taller than the screen.

## 6. Steps

1. Verify highlighting in reader mode (5.5); fix it if broken.
2. `narration.service.js`.
3. `useReaderNarration.js` + `ReaderAudioContext.js`; wire into `Studio.jsx`.
4. Connect `ReaderAudioControls` to the context.
5. Right-click menu in `ReaderModeRenderer`.
6. Manual test with the checklist below.

## 7. Test checklist

- [ ] ▶ on page 1 plays the first narratable block; blocks play in order with no overlap.
- [ ] Zero-size section headings are never played.
- [ ] The playing block is highlighted and scrolled into view; the highlight clears on stop.
- [ ] Pause and resume continue from the same position in the clip.
- [ ] Volume and mute apply immediately, mid-clip.
- [ ] After the last block of the page, narration stops and the page does not change.
- [ ] Changing page stops narration.
- [ ] Clicking a TOC item, then ▶, starts from that block.
- [ ] Right-click a paragraph → "Narrate from here" starts at that block, also while another block is playing.
- [ ] Right-click a picture or table shows the browser's normal menu.
- [ ] Left-click on a block still opens the play modal.
- [ ] Opening the chapter in `ar` and `fr` plays the matching files.
- [ ] Scrolling so the sticky toolbar appears: both toolbars show the same state, only one audio plays.
- [ ] Picture-only page: ▶ is disabled.
- [ ] Offline or a broken URL: the block is skipped; three failures stop with a toast.
- [ ] Leaving the reader stops the audio.
- [ ] Studio and book-author modes: no audio control, no right-click menu, no audio element created.

## 8. Decisions from review (2026-10-01)

1. **Zero-size `Section` blocks:** not narrated.
2. **End of page:** narration stops; no automatic move to the next page.
3. **Language:** follows the reading language; no language choice in the control.
4. **Start from a block:** right-click → "Narrate from here" — wanted, but
   deferred for now. Not implemented: `playFrom`, `canNarrate` and the
   context menu in section 5.2.
5. **Highlighting (5.5):** not checked in the browser; the
   `reader-area-highlighted` class was added to `ReaderModeRenderer` directly.
