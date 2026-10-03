# Reader Background Music — Plan

**Date:** 2026-10-01
**Mode:** Reader only (`/read/book/:bookId/chapter/:chapterId`)
**Status:** Draft for review — no code written yet
**Builds on:** `docs/2026-10-01/READER_NARRATION_PLAYBACK_PLAN.md` (implemented).
**Supersedes:** the music part of `docs/2026-09-26/READER_NARRATION_MUSIC_PLAN.md`.

---

## 1. Goal

From the same `ReaderAudioControls` component, the reader can play background
music while reading:

- from a short list of **built-in tracks** that we ship, or
- from **their own audio file** picked from their computer.

Music and narration can play **at the same time**, each with its own volume.

## 2. Where we are today

- Narration works through `useReaderNarration` and `ReaderAudioContext`.
- Music mode exists in the ⋮ menu but is UI only: ▶ toggles a local flag and
  nothing plays.
- Three things in the current code assume one sound at a time and must change:
  1. `setMode()` calls `stop()` on narration. Switching to Music would cut
     the narration.
  2. There is one `volume` / `isMuted`, owned by the narration engine.
  3. `mode` lives inside `useReaderNarration`.

## 3. Built-in tracks — a licensing point first

The Slack Huddle hold music is Slack's own copyrighted recording, so we
cannot ship it in the product. The same goes for most "lofi" tracks found on
YouTube or Spotify.

The built-in tracks must be files we are allowed to redistribute: CC0 or
royalty-free with a licence that covers use inside an app (for example from
Pixabay Music or the Free Music Archive CC0 section), or music we commission.
A similar-sounding lofi/hold-music track is easy to find under those terms.

**I have not chosen or downloaded any tracks.** The plan only defines where
they go; the files are needed before the built-in list can be tested (open
question 1).

### 3.1 How tracks are declared

```js
// src/config/reader-music.js
export const READER_MUSIC_TRACKS = [
  { id: "lofi-1", label: "Lofi – Calm", url: "/music/lofi-calm.mp3" },
  { id: "hold-1", label: "Hold music", url: "/music/hold-music.mp3" },
];
```

Files go in `public/music/` (served as static files, no backend change). A
`url` can also be a full S3 URL, so tracks can move to the media bucket later
without a code change. Keep each file small (about 2–4 MB, 128 kbps mp3):
they loop, so they do not need to be long.

## 4. Behaviour

### 4.1 Two channels, one control

Narration and music are two independent channels. The **mode** (⋮ menu) no
longer means "the one thing that plays"; it means **which channel the
transport buttons control**.

```
Narration mode:  [🗣] [⏮] [▶/⏸] [⏭] [🔊] [⋮]
Music mode:      [♪] [▶/⏸] [🔊] [⋮]
```

| Action | Result |
|---|---|
| Switch mode in ⋮ | Only changes what the buttons control. **Nothing stops.** |
| The other channel is playing | A small dot on the mode icon shows it, so the reader knows sound is coming from a channel that is not on screen. |
| ▶ in Music mode, track already chosen | Plays it, looping. |
| ▶ in Music mode, nothing chosen yet | Plays the first built-in track. If there are no built-in tracks, opens the file picker. |
| ⏸ in Music mode | Pauses the music. ▶ resumes at the same position. |
| Narration starts, stops or reaches the end of the page | Music is not affected. |
| Reader changes page | Narration stops (as today). **Music keeps playing.** |
| Leave the reader | Both stop. |
| Music file fails to load | Music stops and a toast is shown. |

There is no automatic lowering of the music while narration speaks. The
reader balances the two with the volume sliders (4.3). The defaults already
favour narration: narration 80, music 30.

### 4.2 Choosing the music (⋮ menu)

```
  Narration                ✓
  Music
  ─────────────────────────
  Music track
    Lofi – Calm            ✓
    Hold music
    my-song.mp3                 ← only after a file was picked
    Choose a file…
```

| Action | Result |
|---|---|
| Click a built-in track | It becomes the current track. If music was playing, it switches to the new track straight away; if not, it starts playing. The control switches to Music mode. |
| Choose a file… | Opens `<input type="file" accept="audio/*">`. The file plays through `URL.createObjectURL(file)`, looping, and its name appears in the list. |
| Pick another file | Replaces the previous one; the old object URL is revoked. |
| File is not playable audio | Toast "This file can't be played", the previous track stays selected. |

The reader's own file is **never uploaded**; it stays in the browser.

### 4.3 Volume

The 🔊 popover shows **both** sliders, whatever the mode, so the reader can
balance them in one place:

```
   🗣      ♪
   │      │
   ●      │
   │      ●
   │      │
   🔊     🔊        ← mute, per channel
```

The 🔊 button in the pill shows the muted icon only when both are muted.

### 4.4 What is remembered

Saved in `localStorage` (not per chapter): the selected built-in track, the
two volumes, the two mute states. Added to `STORAGE_KEYS` as
`READER_AUDIO_PREFS`.

Not remembered: whether music was playing (browsers block sound that starts
without a click, so it could not resume anyway), and the reader's own file
(a page reload loses access to it; they pick it again).

## 5. Architecture

```
Studio.jsx (reader mode)
 ├─ useReaderAudio(...)                 ← new, composes the two engines
 │    ├─ useReaderNarration(...)        ← existing, one <audio>
 │    └─ useReaderMusic(...)            ← new, a second <audio>, loop = true
 └─ <ReaderAudioContext.Provider value={{ mode, setMode, narration, music }}>
```

The engines stay above both toolbars for the same reason as before:
`ReaderAudioControls` is mounted twice.

### 5.1 `useReaderMusic`

```js
{
  status: "idle" | "playing" | "paused",
  tracks: READER_MUSIC_TRACKS,
  currentTrack: { id, label, url } | null,   // built-in or the user's file
  userTrack: { id: "user-file", label: fileName, url: objectUrl } | null,
  volume: 0..100,
  isMuted: boolean,
  play(), pause(), selectTrack(id), loadFile(file), setVolume(v), toggleMute()
}
```

- One `Audio` element in a ref, `loop = true`, created only in reader mode.
- The object URL of the reader's file is revoked when it is replaced and on
  unmount.
- Not tied to `activePageIndex`, so page changes do not touch it.

### 5.2 Changes to `useReaderNarration`

- Remove `mode` / `setMode` (moves to `useReaderAudio`), so switching mode no
  longer stops narration.
- Initial `volume` / `isMuted` come from the saved preferences.
- Everything else is unchanged.

### 5.3 New files

| File | Responsibility |
|---|---|
| `src/config/reader-music.js` | The built-in track list |
| `public/music/*.mp3` | The built-in audio files (to be supplied) |
| `src/components/Studio/hooks/useReaderMusic.js` | The music engine in 5.1 |
| `src/components/Studio/hooks/useReaderAudio.js` | Owns `mode`, composes both engines, loads and saves preferences |

### 5.4 Existing files changed

| File | Change |
|---|---|
| `src/components/Studio/hooks/useReaderNarration.js` | 5.2 |
| `src/components/Studio/Studio.jsx` | Call `useReaderAudio` instead of `useReaderNarration` |
| `src/components/Studio/constants/studio.constants.js` | `STORAGE_KEYS.READER_AUDIO_PREFS` |
| `src/components/ReaderAudioControls/ReaderAudioControls.jsx` | Read `narration` / `music` from the context; real play/pause in Music mode; track list and "Choose a file…" in the ⋮ menu with a hidden file input; two sliders in the volume popover; dot on the mode icon |
| `src/components/ReaderAudioControls/readerAudioControls.module.scss` | Two-column volume popover, the dot |

## 6. Known limits

- **iPhone / iPad:** Safari on iOS ignores volume set from code; only the
  device buttons change it. The two sliders will have no effect there and the
  balance cannot be adjusted. Mute still works. This already applies to the
  narration slider.
- **Two toolbars:** each has its own hidden file input, but both feed the
  same engine, so there is still only one music player.

## 7. Steps

1. `useReaderAudio` + move `mode` out of `useReaderNarration`; update
   `ReaderAudioControls` to the new context shape. Narration behaves as today,
   except that switching mode no longer stops it.
2. `useReaderMusic` with the reader's own file (needs no shipped tracks).
3. Built-in track list in the ⋮ menu (needs the files from open question 1).
4. Two-slider volume popover and the mode-icon dot.
5. Preferences in `localStorage`.
6. Manual test with the checklist below.

## 8. Test checklist

- [ ] Music mode ▶ plays the first built-in track and loops at the end.
- [ ] Pause and resume continue from the same position.
- [ ] Start narration while music plays: both are heard; neither stops the other.
- [ ] Switching mode in ⋮ stops nothing; the dot appears on the mode icon.
- [ ] Each slider changes only its own channel; each mute button mutes only its own channel.
- [ ] Changing page stops narration and leaves music playing.
- [ ] Selecting another built-in track switches immediately.
- [ ] "Choose a file…" plays an mp3 from disk; its name shows in the menu; picking a second file replaces the first.
- [ ] A non-audio file shows the toast and keeps the previous track.
- [ ] Both toolbars (normal and sticky) show the same state; only one music player is heard.
- [ ] Reload: track choice, volumes and mute are restored; music does not start by itself.
- [ ] Leaving the reader stops both.
- [ ] Studio and book-author modes: no audio control, no audio elements created.

## 9. Open questions for review

1. **Which built-in tracks?** Can you supply two or three mp3 files we are
   licensed to ship, or should I propose specific CC0 tracks for you to
   approve? Until then, steps 1, 2, 4 and 5 can be built and tested with a
   file from disk.
2. **Where do the built-in files live:** in the repo under `public/music/`
   (planned), or on the S3 media bucket?
3. **Default when ▶ is pressed with nothing chosen:** play the first built-in
   track (planned), or always ask the reader to choose first?
4. **Mode icon dot:** is a small dot enough to show that the other channel is
   playing, or would you rather see both channels side by side in the toolbar?
   Side by side is clearer but needs more width, which was the problem we just
   fixed.
