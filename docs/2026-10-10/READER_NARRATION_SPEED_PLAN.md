# Reader Narration Speed — Plan

**Date:** 2026-10-10
**Mode:** Reader only (`/read/book/:bookId/chapter/:chapterId`)
**Status:** Implemented as planned. Not yet tested in the browser.
**Builds on:** `docs/2026-10-01/READER_NARRATION_PLAYBACK_PLAN.md` (the narration engine).

---

## 1. Goal

Let the reader change the narration speed from `ReaderAudioControls`, the way
YouTube does: **Normal (1x), 1.25x, 1.5x, 2x**. The choice:

- applies right away to the block being read, and to every block after it;
- stays the same when moving to another page or changing language;
- is remembered between sessions (localStorage);
- shows the same value in both toolbar instances (editor + sticky).

Out of scope: Music mode (still UI only), speeds below 1x, a custom speed slider.

## 2. Where things live today

| Piece | File | Role |
|---|---|---|
| Engine | `src/components/Studio/hooks/useReaderNarration.js` | Owns the single `Audio` element, the queue, `volume` / `isMuted` |
| Context | `src/components/Studio/context/ReaderAudioContext.js` | Shares the engine with both toolbars |
| Provider | `src/components/Studio/Studio.jsx` (~line 228, 455) | Calls `useReaderNarration(...)` and provides it |
| UI | `src/components/ReaderAudioControls/ReaderAudioControls.jsx` | Pill (prev / play / next / volume) + `⋮` mode menu |
| Styles | `src/components/ReaderAudioControls/readerAudioControls.module.scss` | |
| Storage keys | `src/components/Studio/constants/studio.constants.js` (`STORAGE_KEYS`) | |

Speed must live in the **engine**, next to `volume`, not in the component:
the toolbar is rendered twice, and only the engine touches the `Audio` element.

## 3. The browser detail that matters

`HTMLMediaElement.playbackRate` is reset to `defaultPlaybackRate` every time
the element loads a new source. The engine changes `audio.src` for each block
(`playAt`), so setting only `playbackRate` would make the speed fall back to 1x
at the start of every block.

**Fix:** always set both properties:

```js
audio.defaultPlaybackRate = rate; // survives src changes
audio.playbackRate = rate;        // applies to the clip playing now
```

Modern browsers keep the pitch when the speed changes (`preservesPitch`
defaults to `true`), so the voice does not sound higher at 1.5x / 2x. No
extra work needed.

## 4. Implementation

### 4.1 Constants — `studio.constants.js`

Add a storage key:

```js
export const STORAGE_KEYS = {
  // ...
  /** Reader narration speed (global, not per chapter) */
  READER_NARRATION_RATE: "reader_narration_rate",
};
```

### 4.2 Engine — `useReaderNarration.js`

1. Export the allowed speeds so the UI and the engine share one list:

   ```js
   export const PLAYBACK_RATES = [
     { value: 1, label: "Normal" },
     { value: 1.25, label: "1.25" },
     { value: 1.5, label: "1.5" },
     { value: 2, label: "2" },
   ];
   const DEFAULT_PLAYBACK_RATE = 1;
   ```

2. Read the saved value once (ignore anything not in the list):

   ```js
   const readSavedRate = () => {
     const saved = Number(localStorage.getItem(STORAGE_KEYS.READER_NARRATION_RATE));
     return PLAYBACK_RATES.some((r) => r.value === saved)
       ? saved
       : DEFAULT_PLAYBACK_RATE;
   };

   const [playbackRate, setPlaybackRateState] = useState(readSavedRate);
   ```

3. Apply it to the audio element, the same way volume is applied
   (include `enabled` in the deps so it is applied when the element is created):

   ```js
   useEffect(() => {
     const audio = audioRef.current;
     if (!audio) return;
     audio.defaultPlaybackRate = playbackRate;
     audio.playbackRate = playbackRate;
   }, [playbackRate, enabled]);
   ```

   Note: the volume effect runs after the element is created because of the
   `enabled` dep; the element is created in an effect declared earlier in the
   hook, so declare this effect **after** it too.

4. Setter that validates and persists:

   ```js
   const setPlaybackRate = useCallback((value) => {
     if (!PLAYBACK_RATES.some((r) => r.value === value)) return;
     setPlaybackRateState(value);
     localStorage.setItem(STORAGE_KEYS.READER_NARRATION_RATE, `${value}`);
   }, []);
   ```

5. Add `playbackRate` and `setPlaybackRate` to the returned object **and** to
   the `useMemo` deps list.

The preload `Audio` in `playAt` does not need the rate — it only warms the
cache; the clip is played by the main element.

`stop()`, page changes and language changes must **not** reset the rate.

### 4.3 UI — `ReaderAudioControls.jsx`

Add a speed button inside the pill, after "Next block" and before "Volume",
shown only in Narration mode (same as prev / next):

- The button shows the current speed as text: `1x`, `1.25x`, `1.5x`, `2x`
  (small, bold, fixed min-width so the pill does not jump when it changes).
- Tooltip: `Playback speed`.
- Clicking it opens an MUI `Menu` (like the existing `⋮` menu) titled
  "Playback speed", listing `PLAYBACK_RATES`. The selected item gets the same
  `CheckIcon` used in the mode menu. "Normal" is shown for 1.
- Selecting an item calls `audio.setPlaybackRate(value)` and closes the menu.
- The button stays enabled even when the page has no narration or playback is
  idle, so the reader can choose a speed before pressing ▶.

Sketch:

```jsx
const [speedAnchor, setSpeedAnchor] = React.useState(null);
const { playbackRate } = audio;

{isNarration && (
  <>
    <Tooltip title="Playback speed">
      <IconButton
        size="small"
        aria-label="playback-speed"
        aria-haspopup="true"
        aria-controls={speedAnchor ? "reader-speed-menu" : undefined}
        onClick={(e) => setSpeedAnchor(e.currentTarget)}
        className={styles["speed-button"]}
      >
        {`${playbackRate}x`}
      </IconButton>
    </Tooltip>
    <Menu
      id="reader-speed-menu"
      anchorEl={speedAnchor}
      open={Boolean(speedAnchor)}
      onClose={() => setSpeedAnchor(null)}
    >
      {PLAYBACK_RATES.map((rate) => (
        <MenuItem
          key={rate.value}
          selected={playbackRate === rate.value}
          onClick={() => {
            audio.setPlaybackRate(rate.value);
            setSpeedAnchor(null);
          }}
        >
          <ListItemText>{rate.label}</ListItemText>
          {playbackRate === rate.value && (
            <CheckIcon fontSize="small" sx={{ ml: 2 }} />
          )}
        </MenuItem>
      ))}
    </Menu>
  </>
)}
```

Also update the file header comment to mention speed.

**Alternative considered:** putting "Playback speed" inside the `⋮` menu as a
sub-menu (closer to YouTube's settings gear). Rejected for now: it is two
clicks instead of one, and the current speed would not be visible in the
toolbar. Can be revisited if the toolbar gets too wide.

### 4.4 Styles — `readerAudioControls.module.scss`

Inside `.reader-audio .pill`:

```scss
& .speed-button {
  min-width: 2.75rem; // fits "1.25x" so the pill width stays stable
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 999px;
}
```

The existing `span` reset already covers MUI internals; the button text is
not in a `span`, but check the toolbar separator rule does not affect it.

## 5. Edge cases

| Case | Expected |
|---|---|
| Change speed while a block is playing | Current block speeds up / slows down immediately |
| Change speed while paused | Resume plays at the new speed |
| Next / previous / auto-advance to next block | New block keeps the chosen speed (section 3) |
| Change page or language | Playback stops (existing behavior), speed is kept |
| Switch to Music and back | Speed is kept; button hidden in Music mode |
| Reload the page | Saved speed is restored |
| Bad value in localStorage (e.g. `"3"`, `"abc"`) | Falls back to 1x |
| `localStorage` unavailable (private mode quirks) | Wrap read/write in `try/catch`, fall back to 1x |
| Two toolbars (editor + sticky) | Both show the same value — state lives in the engine |

## 6. Testing checklist

- [ ] Default is "Normal" (button shows `1x`) on first visit.
- [ ] Each speed (1, 1.25, 1.5, 2) audibly changes the narration, pitch preserved.
- [ ] Speed survives auto-advance across at least 3 blocks.
- [ ] Speed survives next / previous buttons.
- [ ] Speed survives page change and language change.
- [ ] Speed is restored after reload.
- [ ] Both toolbar instances update together.
- [ ] Button hidden in Music mode, visible again in Narration mode.
- [ ] Pill width does not jump when switching between `1x` and `1.25x`.
- [ ] Check in Chrome, Firefox, Safari (Safari is strictest about `playbackRate` on src change).

## 7. Files to change

1. `src/components/Studio/constants/studio.constants.js` — add `READER_NARRATION_RATE`.
2. `src/components/Studio/hooks/useReaderNarration.js` — `PLAYBACK_RATES`, state, effect, setter, return value.
3. `src/components/ReaderAudioControls/ReaderAudioControls.jsx` — speed button + menu.
4. `src/components/ReaderAudioControls/readerAudioControls.module.scss` — `.speed-button`.

No changes needed in `Studio.jsx` or `ReaderAudioContext.js`: the new fields
travel through the existing context value.
