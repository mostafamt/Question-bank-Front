# Plan: Video & Audio Previews in `AreaActionResult`

## Context

`AreaActionResult` (`src/components/AreaActionResult/AreaActionResult.jsx`) renders
the compact preview shown under each area row in the Studio sidebar
(`AreaAction` → `StudioActions`). It currently only knows two shapes:

```jsx
{trialArea?.typeOfLabel === "text" ||
trialArea?.typeOfLabel === "number" ||
trialArea?.typeOfLabel === "Coordinate" ||
foundComplexType ? (
  <TextField ... value={trialArea?.text} onChange={...} />
) : trialArea?.image ? (
  <img src={trialArea?.image} ... />
) : (
  <></>
)}
```

This is a **different** rendering path from the "deep block" overlays already
built in `src/components/Studio/DeepBlockContent/` (`DeepBlockImage`,
`DeepBlockVideo`, `DeepBlockAudio`), which paint content over the area on the
page canvas itself. `AreaActionResult` is the sidebar list preview — it has no
video/audio branch today.

### Why `trialArea.image` isn't a safe fallback for audio/video

`useLabelManagement.onChangeLabel` (`src/components/Studio/hooks/useLabelManagement.js`)
runs `extractImage()` and calls `updateAreaProperty(idx, { image: img, ... })`
**unconditionally**, for every label, before it looks at `labelType` at all.
So an area labelled `typeOfLabel: "audio"` or `"video"` still has a non-empty
`trialArea.image` (the raw OCR crop of the page). If `AreaActionResult` falls
through to the `trialArea?.image` branch for these, it silently shows the page
crop thumbnail instead of the actual audio/video the author picked — wrong
content in the one place meant to confirm what's attached.

### Where the real value lives

Confirmed via `deepHandlers.service.js`, `DeepAudioModal.jsx`, `DeepVideoModal.jsx`,
and `ScanAndUpload.jsx`'s submit mapping (`item.typeOfLabel === "audio" ? item.audio : item.typeOfLabel === "video" ? item.video : ...`):

- `typeOfLabel === "audio"` → the chosen URL lives in `trialArea.audio`
- `typeOfLabel === "video"` → the chosen URL lives in `trialArea.video`

These are only populated once the author picks the `audio`/`video` label on a
`Deep`-checked area (`AreaActionHeader`), which routes through
`getDeepHandler` → `handleDeepAudio`/`handleDeepVideo` → `DeepAudioModal`/
`DeepVideoModal` → `updateAreaPropertyById(id, { audio|video, typeOfLabel })`.
Until the author saves the modal, `trialArea.audio`/`trialArea.video` is
`undefined`.

## Change

Edit `src/components/AreaActionResult/AreaActionResult.jsx` only. Add two
branches keyed on an **exact** `typeOfLabel` match, checked **before** the
`foundComplexType`/text branch — not after it.

### Why order matters here, not just presence

`foundComplexType` is a membership lookup in `COMPLEX_TYPES`
(`src/utils/ocr.js`), a constant shared with `isComplexType()` and owned by an
unrelated feature (deciding which types need `SubObjectModal`). It's not
safe to depend on that array *not* containing `"video"`/`"audio"` — nothing
enforces that invariant, and it happens to be true today only by accident of
what that list is currently used for. If the check order is
`text/number/Coordinate/foundComplexType` first and `video`/`audio` second,
then the day someone adds either string to `COMPLEX_TYPES` for an unrelated
reason, the media branches below become silently unreachable and the bug this
plan fixes comes right back — with no test or type system catching it.

Putting the exact `typeOfLabel === "video"` / `"audio"` checks **first**
removes that dependency entirely: their branch is chosen by a direct string
comparison, so it can't be preempted no matter what `COMPLEX_TYPES` holds.

```jsx
const AreaActionResult = (props) => {
  const { type, onEditText, trialArea } = props;

  if (trialArea.loading) {
    return (
      <div style={{ paddingTop: "0.5rem" }}>
        <CircularProgress size="1rem" />
      </div>
    );
  }

  const foundComplexType = COMPLEX_TYPES.find(
    (item) => item === trialArea?.typeOfLabel
  );

  return (
    <div>
      {trialArea?.typeOfLabel === "video" ? (
        trialArea?.video ? (
          <video
            src={trialArea.video}
            controls
            style={{ width: "100%", marginTop: "0.5rem" }}
          />
        ) : (
          <div className={styles.placeholder}>No video selected</div>
        )
      ) : trialArea?.typeOfLabel === "audio" ? (
        trialArea?.audio ? (
          <audio
            src={trialArea.audio}
            controls
            style={{ width: "100%", marginTop: "0.5rem" }}
          />
        ) : (
          <div className={styles.placeholder}>No audio selected</div>
        )
      ) : trialArea?.typeOfLabel === "text" ||
        trialArea?.typeOfLabel === "number" ||
        trialArea?.typeOfLabel === "Coordinate" ||
        foundComplexType ? (
        <TextField ... />
      ) : trialArea?.image ? (
        <img ... />
      ) : (
        <></>
      )}
    </div>
  );
};
```

Notes:

- Unlike `DeepBlockAudio` (the page-overlay version), this preview does **not**
  need the icon-instead-of-`<audio>` workaround — that workaround exists only
  because `pageCapture.service.js` rasterizes the page with html2canvas, and
  `<audio>`'s shadow-DOM controls don't capture. The sidebar list is never
  captured, so a real `<audio controls>` element is fine and is actually more
  useful here (lets the author preview playback without reopening the modal).
- No edit affordance is needed inside `AreaActionResult` itself. Editing
  already works today: reselecting the `audio`/`video` label in
  `AreaActionHeader`'s `MuiSelect` re-triggers `onChangeLabel` →
  `getDeepHandler` → the same `DeepAudioModal`/`DeepVideoModal`, seeded with
  the current value.
- `areaActionResult.module.scss` is currently empty; add a small
  `.placeholder` class there (muted text, matches the empty-state styling
  used elsewhere) rather than inlining more than the one-off style above.
- No changes needed in `deepHandlers.service.js`, `ScanAndUpload.jsx`, or the
  `DeepBlockContent/` components — those already handle audio/video
  end-to-end per `docs/deep-audio-video-plan.md`. This plan only closes the
  gap in the sidebar preview.

## Checklist

- [x] `AreaActionResult.jsx` — add `typeOfLabel === "video"` branch (`<video controls>` or placeholder), checked before the complex-type/text branch
- [x] `AreaActionResult.jsx` — add `typeOfLabel === "audio"` branch (`<audio controls>` or placeholder), checked before the complex-type/text branch
- [x] `areaActionResult.module.scss` — add `.placeholder` style
- [ ] Manual test: mark an area Deep, pick `video` label, save a URL in the modal → sidebar shows a playable `<video>`, not the page crop
- [ ] Manual test: same for `audio`
- [ ] Manual test: pick `video`/`audio` label but cancel the modal before saving → sidebar shows the placeholder, not a broken `<video src="">`/crop image
