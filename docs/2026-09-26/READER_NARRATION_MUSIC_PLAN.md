# Reader Narration & Music — Plan

**Date:** 2026-09-26
**Mode:** Reader only (`/read/book/:bookId/chapter/:chapterId`)
**Status:** Draft for review — no code written yet
**Reference:** `snapshot.jpeg` → the audio control next to the page toolbar,
the "Narration" and "Music" callouts, and the right-click callout.

---

## 1. Goal

Add one audio control to the reader toolbar that works in two modes:

- **Narration:** reads the page aloud block by block, starting from the
  current block, and highlights each block while it is read.
- **Music:** the reader picks an audio file from their own computer, and it
  plays on a loop until they stop it.

## 2. What the mockup shows

```
Idle:     [♪] [▶] [🔊] [⋮]           ⋮ menu → Narration / Music
Playing:  [♪] [⏸] [──●────] [🔊]
```

- `♪`: shows the current mode (one icon for narration, another for music).
- `▶` / `⏸`: play and pause.
- Slider (while playing): volume.
- `⋮`: menu to switch between **Narration** and **Music**.

## 3. What the data offers today

I checked a real chapter
(`/pages?chapterId=ed8da075f9f4f1105d53bd06&language=en`: 7 pages, 154 blocks):

| Block field | Value in all 154 blocks |
|---|---|
| `narration` | `[]` (always empty) |
| `audio` | `null` |
| `contentValue` | the text (HTML/plain) for text blocks; a URL for pictures |
| `contentType` | `Section`, `Paragraph`, `Picture`, `Table`, `Caption`, `Hotspot Image`, `Image Juxtaposition` |

There is **no recorded narration in the data yet**. So narration has to
fall back to the browser's built-in **text-to-speech** (Web Speech API,
`window.speechSynthesis`). It is free, needs no backend, and works in all
modern browsers. Voice quality and whether an Arabic voice is available
depend on the reader's browser and operating system.

The plan is built so that recorded audio can be added later:

1. If the block has a recorded audio URL (`block.audio`, or an entry in
   `block.narration` for the current language), play that file.
2. Otherwise, if the block is text (`typeOfLabel === "text"`), strip the
   HTML and read the text with `speechSynthesis`.
3. Otherwise (pictures, tables, interactive objects), skip the block.

`initAreasProperties` (`src/components/Studio/initializers/index.js`)
currently drops `block.audio` and `block.narration`. They will be copied
through as `narrationAudio` and `narration`.

## 4. Narration behaviour

| Action | Result |
|---|---|
| Choose Narration, press ▶ | Reading starts at the **current block**: the block highlighted most recently (e.g. from a search, TOC or tab click), or the first block on the page if none is. |
| While a block is being read | That block is highlighted using the existing `highlightedBlockId` mechanism, the same one used for navigation. |
| Block finishes | Moves to the next block in `order`. Skipped blocks (non-text, no audio) move on straight away. |
| End of the page | Goes to the next page and continues from its first block (see open question 2). |
| ⏸ | Pauses in the middle of the block (`speechSynthesis.pause()` / `audio.pause()`). ▶ resumes. |
| The reader changes page manually while narration is playing | Narration stops. It doesn't jump to the new page. |
| Leave the reader / switch mode | Everything stops, and `speechSynthesis.cancel()` runs on unmount. |
| Volume slider | Sets `utterance.volume` (applies from the next block) and `audio.volume` (applies immediately). |

**Voice language:** set from the chapter's content language
(`location.state.contentLanguage`: `en` → `en-US`, `ar` → `ar-SA`). If the
browser has no voice for that language, show a toast ("No voice available
for Arabic on this device") and stop.

**Known browser quirk:** in Chrome, long utterances (about 15 seconds or
more) can stop silently. Long paragraphs are split into sentences, one
utterance each, before reading. This also makes pause and resume more
reliable.

## 5. Music behaviour

| Action | Result |
|---|---|
| Choose Music | ▶ opens a file picker (`<input type="file" accept="audio/*">`) the first time, or plays the file already picked |
| File picked | Played with `new Audio(URL.createObjectURL(file))`, with `loop = true` |
| ⏸ / ▶ | Pauses or resumes the same track |
| ⋮ → "Choose another file" | Opens the picker again. The old object URL is freed |
| Volume slider | `audio.volume` |
| Changing page | Music keeps playing |
| Leave the reader | Music stops and the object URL is freed |

The file is **not** saved. After a reload the reader picks it again. (We
could keep it in IndexedDB, but that's out of scope.)

**Narration and music at the same time:** only one mode is active in the
control. Music keeps playing if the reader switches to Narration and starts
it. While narration speaks, music volume is lowered to 30% ("ducking") and
restored afterwards. See open question 3.

## 6. Architecture

`ImageActions` (the toolbar) is rendered **twice**: in `StudioEditor.jsx:39`
and in `StudioStickyToolbar.jsx:28`. The audio engine must therefore live
**outside** it, or two copies would play at once. The toolbar only shows
the controls.

```
Studio.jsx (reader mode)
 ├─ useReaderAudio(...)          ← the single engine: speechSynthesis + <audio>
 └─ <ReaderAudioContext.Provider value={controls}>
      ├─ StudioHeader → StickyToolbar → ImageActions → <ReaderAudioControls/>
      └─ StudioLayout → StudioEditor  → ImageActions → <ReaderAudioControls/>
```

### 6.1 New files

| File | Responsibility |
|---|---|
| `src/components/Studio/services/narration.service.js` | Pure helpers: `stripHtml`, `splitSentences`, `pickVoice(lang)`, `getNarrationSource(areaProps, lang)` returning `{ kind: "audio", url }`, `{ kind: "tts", text }` or `null` |
| `src/components/Studio/hooks/useReaderAudio.js` | The engine: mode, play state, current block, volume. It drives `speechSynthesis` and a single `HTMLAudioElement` for narration clips, plus another one for music. It calls `hightBlock(id)` and `changePageByIndex(i)` |
| `src/components/Studio/context/ReaderAudioContext.js` | `createContext` + `useReaderAudioControls()` |
| `src/components/ReaderAudioControls/ReaderAudioControls.jsx` (+ scss) | The control shown in the mockup: mode icon, play/pause, volume, and the ⋮ menu (Narration / Music / Choose another file) |

### 6.2 Existing files changed

| File | Change |
|---|---|
| `src/components/Studio/initializers/index.js` | Copy `block.audio` → `narrationAudio` and `block.narration` → `narration` |
| `src/components/Studio/Studio.jsx` | Call `useReaderAudio` in reader mode. Pass it `areasProperties`, `activePageIndex`, `pages`, `highlightedBlockId`, `hightBlock`, `changePageByIndex`, `contentLanguage`. Wrap the output in the provider |
| `src/components/ImageActions/ImageActions.jsx` | In the `isReaderMode` block, render `<ReaderAudioControls />` |
| `src/components/Studio/types/studio.types.js` | Add `narrationAudio` and `narration` to the `AreaProperty` JSDoc |

### 6.3 Engine state (inside `useReaderAudio`)

```js
{
  mode: "narration" | "music",
  status: "idle" | "playing" | "paused",
  currentBlockId: string | null,   // narration only
  volume: 0..1,
  musicFileName: string | null,
}
// controls: play(), pause(), stop(), setMode(m), setVolume(v), pickMusicFile()
```

The engine keeps the queue, the current `SpeechSynthesisUtterance` and the
`Audio` objects in refs (not state), so re-renders don't restart playback.
A run token (a number that goes up on every stop or start) makes a late
`onend` callback from a cancelled utterance do nothing.

## 7. Phases

1. **Phase 1:** music mode, the control UI, and the context wiring. This is
   the simplest part and proves the shared-engine setup across both toolbars.
2. **Phase 2:** narration with TTS, block highlighting, and moving on to the
   next block and page.
3. **Phase 3 (follow-up, not in this plan):** right-click a block →
   "Narrate this block only". The engine will expose
   `narrateBlock(blockId, { single: true })`, so this only needs a context
   menu on `ReaderModeRenderer`. "myNotes" is a separate feature.

## 8. Test checklist

- [ ] Music: pick an mp3, it loops; pause and resume; volume changes; it keeps playing across pages; it stops when leaving the reader.
- [ ] Music: pick a second file; the first stops and its object URL is freed.
- [ ] Narration starts at the highlighted block (click a TOC or glossary item first), otherwise at the first block.
- [ ] Each block is highlighted while read; picture and table blocks are skipped.
- [ ] At the end of the page, it moves to the next page and continues; it stops after the last page.
- [ ] Pause and resume in the middle of a paragraph.
- [ ] Changing page by hand stops narration.
- [ ] Both toolbars always show the same state, and there is never double audio.
- [ ] Arabic chapter: an Arabic voice is used, or the "no voice" toast appears.
- [ ] Studio and book-author modes: no audio control.

## 9. Open questions for review

1. **Recorded narration:** will the backend fill `block.narration` or
   `block.audio` later? If so, what shape: one URL per language, like
   `[{ language: "en", url }]`? For now TTS is the fallback.
2. **Across pages:** when narration reaches the end of a page, should it
   move on to the next page automatically (as planned) or stop?
3. **Music + narration together:** should music keep playing, quieter, while
   narration speaks (as planned), or should starting one stop the other?
4. **Zero-size blocks:** some `Section` blocks have coordinates `0,0,0,0`
   (headings with no visible area). The plan **skips** them, since they
   can't be highlighted and repeat text already on the page. Is that OK?
5. **Where the control goes:** the plan puts it in the page toolbar next to
   the bookmark button. The mockup shows it floating to the right, above
   the page. Is the toolbar OK?
