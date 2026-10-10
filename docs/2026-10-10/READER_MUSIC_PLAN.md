# Reader Background Music — Plan

**Date:** 2026-10-10
**Mode:** Reader only (`/read/book/:bookId/chapter/:chapterId`)
**Status:** Approved (recommendations in section 10 accepted). Steps 1–4 implemented, not yet tested in the browser. The three mp3s are not in `public/music/` yet.
**Builds on:**
- `docs/2026-10-01/READER_NARRATION_PLAYBACK_PLAN.md` (narration engine, implemented)
- `docs/2026-10-10/READER_NARRATION_SPEED_PLAN.md` (narration speed, implemented)

**Supersedes:** `docs/2026-10-01/READER_MUSIC_PLAN.md`. That draft was never
implemented and its open questions were not answered. This version is updated
for the current code, which now has playback speed. Section 9 lists what
changed.

---

## 1. Goal

From `ReaderAudioControls`, readers can play background music while they
browse the book:

- from a short list of **built-in tracks** we ship, or
- from **their own audio file** picked from their computer (never uploaded).

Music keeps playing while they change pages. It can play **at the same time
as narration**, and each has its own volume.

Out of scope: playlists / next track, music speed, music chosen by the
book author, automatic lowering of the music while narration speaks.

## 2. Where we are today

| Piece | File | State |
|---|---|---|
| Engine | `src/components/Studio/hooks/useReaderNarration.js` | Narration only. Also owns `mode`, `volume`, `isMuted`, `playbackRate`. |
| Context | `src/components/Studio/context/ReaderAudioContext.js` | Provides the narration engine object as-is. |
| Provider | `src/components/Studio/Studio.jsx` (~228, ~455) | `useReaderNarration({ ..., enabled: isReaderMode })` |
| UI | `src/components/ReaderAudioControls/ReaderAudioControls.jsx` | Music mode is **UI only**: ▶ toggles a local `isMusicPlaying` flag, nothing plays. |
| Storage keys | `src/components/Studio/constants/studio.constants.js` | Has `READER_NARRATION_RATE`. |

Things in the current code that assume only one sound plays at a time:

1. `setMode()` in `useReaderNarration` calls `stop()`, so switching to Music
   cuts the narration.
2. There is one `volume` / `isMuted`, and it belongs to narration.
3. `mode` lives inside the narration engine, although it is a UI concern
   shared by two channels.
4. `isMusicPlaying` is local state in the component. The toolbar is rendered
   twice (editor + sticky), so the two copies would disagree.

## 3. Built-in tracks — licensing first

Tracks must be files we are allowed to redistribute inside the app: CC0, or
royalty-free under a licence that covers in-app use (for example Pixabay Music,
or the CC0 section of the Free Music Archive), or music we commission.
Commercial recordings and YouTube/Spotify "lofi" tracks are not allowed.

### 3.1 Chosen tracks

All three come from the album **"Public Domain Lo-fi"** by **HoliznaCC0**
(<https://holiznacc0.bandcamp.com/album/public-domain-lo-fi>):

| Track | Length | File |
|---|---|---|
| Calm Current | 2:27 | `public/music/calm-current.mp3` |
| Ease Into Night | 2:31 | `public/music/ease-into-night.mp3` |
| Wetlands | 2:44 | `public/music/wetlands.mp3` |

**Licence:** the artist dedicates the archive to the public domain ("Creative
commons CC0 (same as public domain)"). However, the licence label on the
Bandcamp album page links to **CC BY 4.0**. To satisfy both, we treat the
tracks as **CC BY 4.0** and show a credit in the reader (4.2). Keep the
Bandcamp album URL as the licence record.

**Getting the files:** the album is "name your price" on Bandcamp, so 0 is
fine. Download the MP3 version and rename the files as in the table above.
The files haven't been downloaded yet. Steps 1, 2, 4 and 5 don't need them,
because they can be tested with a file from disk.

**Size:** each file is about 2.5 MB at 128 kbps, so no trimming is needed. If
a download is larger (for example 320 kbps), re-encode it:

```
ffmpeg -i "Calm Current.mp3" -b:a 128k public/music/calm-current.mp3
```

### 3.2 How tracks are declared

```js
// src/config/reader-music.js
const HOLIZNA_ALBUM_URL =
  "https://holiznacc0.bandcamp.com/album/public-domain-lo-fi";

export const READER_MUSIC_TRACKS = [
  {
    id: "calm-current",
    label: "Calm Current",
    url: "/music/calm-current.mp3",
    credit: { artist: "HoliznaCC0", license: "CC BY 4.0", source: HOLIZNA_ALBUM_URL },
  },
  {
    id: "ease-into-night",
    label: "Ease Into Night",
    url: "/music/ease-into-night.mp3",
    credit: { artist: "HoliznaCC0", license: "CC BY 4.0", source: HOLIZNA_ALBUM_URL },
  },
  {
    id: "wetlands",
    label: "Wetlands",
    url: "/music/wetlands.mp3",
    credit: { artist: "HoliznaCC0", license: "CC BY 4.0", source: HOLIZNA_ALBUM_URL },
  },
];
```

Every built-in track **must** have a `credit`. The reader's own file has none.
Because `url` can also be a full S3 URL, tracks can move to the media bucket
later without code changes.

## 4. Behaviour

### 4.1 Two channels, one control

Narration and music are two independent channels. The **mode** (⋮ menu)
stops meaning "the one thing that plays". It now means **which channel the
transport buttons control**.

```
Narration mode:  [🗣•] [⏮] [▶/⏸] [⏭] [1x] [🔊] [⋮]
Music mode:      [♪•]       [▶/⏸]            [🔊] [⋮]
                   └─ dot = the *other* channel is playing
```

| Action | Result |
|---|---|
| Switch mode in ⋮ | Only changes what the buttons control. **Nothing stops.** |
| Other channel is playing | A small dot on the mode icon shows that sound is coming from a channel that isn't on screen. |
| ▶ in Music mode, track already chosen | Plays it on loop. |
| ▶ in Music mode, nothing chosen | Plays the first built-in track. If there are none, opens the file picker. |
| ⏸ in Music mode | Pauses. ▶ resumes from the same position. |
| Narration starts / stops / ends | Music is unaffected. |
| Change page or language | Narration stops (as today). **Music keeps playing.** |
| Change narration speed | Music is unaffected and always plays at 1x. |
| Leave the reader | Both stop. Audio elements and object URLs are released. |
| Music fails to load | Music stops and a toast is shown. |

The speed button (`1x`) and ⏮ / ⏭ stay narration-only, as they are now.

### 4.2 Choosing the music (⋮ menu)

```
  🗣 Narration             ✓
  ♪  Music
  ─────────────────────────
  MUSIC TRACK
     Calm Current          ✓
     Ease Into Night
     Wetlands
     my-song.mp3                ← only after a file was picked
     Choose a file…
  ─────────────────────────
  Music: "Calm Current" by HoliznaCC0 · CC BY 4.0   ← link to source
```

The credit line is a small caption at the bottom of the menu, not a
selectable menu item.
Its "CC BY 4.0" part links to the album page and opens in a new tab. It is
shown only while a built-in track is selected.

| Action | Result |
|---|---|
| Click a built-in track | It becomes the current track and plays straight away, and the control switches to Music mode. |
| Choose a file… | Opens a hidden `<input type="file" accept="audio/*">`. The file plays from `URL.createObjectURL(file)`, looping, and its name appears in the list. |
| Pick another file | Replaces the previous file and revokes the old object URL. |
| File can't be played | Toast "This file can't be played". The previous track stays selected. |

### 4.3 Volume

The 🔊 popover shows **both** sliders in either mode, so the reader can balance
narration and music in one place:

```
   🗣      ♪
   │      │
   ●      │
   │      ●
   │      │
  🔊     🔊      ← mute button per channel
```

The 🔊 button in the pill shows the muted icon only when **both** channels are
muted. Defaults favour narration: narration 80 (unchanged), music 30.

### 4.4 What is remembered (localStorage, not per chapter)

| Saved | Key |
|---|---|
| Narration speed | `READER_NARRATION_RATE` (existing, unchanged) |
| Selected built-in track, both volumes, both mute states | new `READER_AUDIO_PREFS` (one JSON object) |

Not remembered:
- **Whether music was playing.** Browsers block sound that starts without a
  click, so it couldn't resume anyway.
- **The reader's own file.** A page reload loses access to it, so the reader
  picks it again.

## 5. Architecture

```
Studio.jsx (reader mode)
 └─ useReaderAudioEngine({ ...narrationParams, enabled }) ← new
      ├─ mode / setMode                                 ← moved out of narration
      ├─ useReaderNarration(...)                        ← existing <audio>
      └─ useReaderMusic({ enabled })                    ← new <audio>, loop = true
 └─ <ReaderAudioContext.Provider value={{ mode, setMode, narration, music }}>
```

Both engines stay above the two toolbars, so there is still only **one**
player per channel.

### 5.1 `useReaderMusic` (new)

```js
{
  status: "idle" | "playing" | "paused",
  tracks: READER_MUSIC_TRACKS,
  currentTrack: { id, label, url } | null,     // built-in or the reader's file
  userTrack: { id: "user-file", label, url } | null,
  volume: 0..100,
  isMuted: boolean,
  play(), pause(), stop(),
  selectTrack(id), loadFile(file),
  setVolume(v), toggleMute(),
}
```

- One `Audio` in a ref with `loop = true`. It is created only when `enabled`,
  and cleaned up the same way as the narration engine (pause, remove `src`,
  `load()`).
- `loadFile`: reject files whose `type` doesn't start with `audio/`, and also
  catch the element's `error` event. On failure, restore the previous track.
- Revoke the object URL when it is replaced and on unmount.
- Doesn't depend on `pages` / `activePageIndex`, so changing page never
  touches it.
- Reuse `NARRATION_STATUS` values for `status`, or rename the export to
  `AUDIO_STATUS` and keep `NARRATION_STATUS` as an alias.

### 5.2 `useReaderAudioEngine` (new)

> Named `useReaderAudioEngine` rather than `useReaderAudio`, because
> `ReaderAudioContext.js` already exports a consumer hook called `useReaderAudio`.

- Owns `mode`. `AUDIO_MODES` moves here. It is **not** re-exported from
  `useReaderNarration` (that would create an import cycle); its only consumer,
  `ReaderAudioControls`, now imports it from `useReaderAudioEngine`.
- Loads `READER_AUDIO_PREFS` once and passes the initial volume and mute
  values into both engines. Saves them when they change.
- Returns a memoised `{ mode, setMode, narration, music }`.

### 5.3 Changes to `useReaderNarration`

- Remove `mode` / `setMode` from it, so switching mode no longer stops
  narration.
- Accept `initialVolume` / `initialMuted` params (they default to today's
  values).
- Speed, the queue, highlighting and skipping stay **unchanged**.

### 5.4 Changes to `ReaderAudioControls`

- Read `const { mode, setMode, narration, music } = useReaderAudio()`. Replace
  the flat `audio.*` reads with `narration.*`.
- Delete the local `isMusicPlaying` state. Music state comes from the engine.
- Make ▶/⏸ in Music mode call `music.play()` / `music.pause()`.
- In the ⋮ menu: add a divider, the track list, "Choose a file…", a
  hidden file input (one per toolbar instance; both feed the same engine),
  and the credit caption for the selected built-in track (4.2).
- Show two sliders in the volume popover.
- Add a dot on the mode icon when the other channel's status is `playing`.
- Update the file header comment: "Music is still UI only" no longer applies.

### 5.5 Files

**New**

| File | Responsibility |
|---|---|
| `src/config/reader-music.js` | Built-in track list with credits (3.2) |
| `public/music/calm-current.mp3`, `ease-into-night.mp3`, `wetlands.mp3` | Built-in audio files (to be downloaded, 3.1) |
| `src/components/Studio/hooks/useReaderMusic.js` | Music engine (5.1) |
| `src/components/Studio/hooks/useReaderAudioEngine.js` | Mode, both engines, preferences (5.2) |

**Changed**

| File | Change |
|---|---|
| `src/components/Studio/hooks/useReaderNarration.js` | 5.3 |
| `src/components/Studio/Studio.jsx` | Call `useReaderAudioEngine` instead of `useReaderNarration`. The provider value changes shape. |
| `src/components/Studio/constants/studio.constants.js` | Add `STORAGE_KEYS.READER_AUDIO_PREFS` |
| `src/components/Studio/context/ReaderAudioContext.js` | Update the doc comment to describe the new shape |
| `src/components/ReaderAudioControls/ReaderAudioControls.jsx` | 5.4 |
| `src/components/ReaderAudioControls/readerAudioControls.module.scss` | Two-column volume popover, mode-icon dot, menu section label |

Before step 1, grep for every other consumer of `useReaderAudio()` and update
it to the new shape. Today the only consumer is `ReaderAudioControls`;
`ImageActions` only renders it.

## 6. Known limits

- **iPhone / iPad:** Safari on iOS ignores volume set from code; only the
  hardware buttons change it. Neither slider has any effect there, so the two
  channels can't be balanced. Mute still works. The narration slider already
  has this limit.
- **Two sounds on iOS:** iOS may pause one `<audio>` element when another
  starts playing. This needs checking on a device. If it happens, document it
  as a limit rather than switch to Web Audio for now.
- **The reader's own file** lasts only until reload (see 4.4).

## 7. Steps

1. ✅ **Done (2026-10-10).** Add `useReaderAudioEngine` and move `mode` out of `useReaderNarration`. Switch
   `ReaderAudioControls` to the new context shape. Narration should behave as
   it does today, except that switching mode no longer stops it.
2. ✅ **Done (2026-10-10).** `useReaderMusic` with "Choose a file…" (needs no
   shipped tracks). `src/config/reader-music.js` exists with an empty list,
   so ▶ in Music mode opens the file picker until step 3 adds the tracks.

3. ✅ **Code done (2026-10-10).** The built-in track list and credit caption
   in ⋮. Still needs the three mp3s from 3.1 in `public/music/`; until then,
   choosing a built-in track shows "Music could not be loaded."
4. ✅ **Done (2026-10-10).** Two-slider volume popover and the mode-icon dot.
5. Preferences in `localStorage`.
6. Manual test with the checklist below.

Each step can be reviewed and merged on its own.

## 8. Test checklist

- [ ] Music mode ▶ plays the first built-in track and loops at the end.
- [ ] Pause / resume continues from the same position.
- [ ] Music playing, then start narration: both are heard and neither stops the other.
- [ ] Switching mode in ⋮ stops nothing, and the dot appears on the mode icon.
- [ ] Changing narration speed doesn't change music speed.
- [ ] Each slider and each mute button affects only its own channel.
- [ ] Changing page or language stops narration and leaves music playing.
- [ ] Picking another built-in track switches immediately.
- [ ] All three built-in tracks (Calm Current, Ease Into Night, Wetlands) load and loop.
- [ ] The credit caption names the selected track, links to the album page in a new tab, and is hidden for the reader's own file.
- [ ] "Choose a file…" plays an mp3 from disk and shows its name. A second file replaces the first.
- [ ] A non-audio file shows the toast and keeps the previous track.
- [ ] Both toolbars (normal + sticky) show the same state, and only one music player is heard.
- [ ] Reload restores the track choice, volumes, mute states and narration speed. Music doesn't start by itself.
- [ ] Leaving the reader stops both channels.
- [ ] Studio and book-author modes have no audio control and create no audio elements.

## 9. Changes from the 2026-10-01 draft

- Accounts for the narration speed feature: speed stays narration-only,
  keeps its own storage key, and doesn't affect music.
- `AUDIO_MODES` moves to `useReaderAudioEngine` (see 5.2). It is not
  re-exported from `useReaderNarration`, to avoid an import cycle.
- `loadFile` checks the MIME type in addition to the load-error event.
- Adds the iOS "two audio elements" check to the known limits.
- Notes that the local `isMusicPlaying` state is what keeps the two toolbars
  out of sync today.

## 10. Decisions

All recommendations were accepted on 2026-10-10:

1. **Built-in tracks:** Calm Current, Ease Into Night and Wetlands by
   HoliznaCC0, credited as CC BY 4.0 (section 3).
2. **Where the files live:** `public/music/` in the repo (about 7.5 MB in
   total). The `url` field allows moving them to S3 later.
3. **▶ with nothing chosen:** plays the first built-in track.
4. **Showing the other channel:** a dot on the mode icon.
5. **Ducking:** not now. The reader balances the two channels with the
   sliders.
