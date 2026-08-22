# Plan: Video & Voice Blocks Without `isDeep`

## Problem

Today a block only gets a working upload flow for `audio`/`video` content when it
is marked `isDeep: true` (see [`deep-audio-video-plan.md`](../deep-audio-video-plan.md)).
For a plain (non-deep) block labelled `audio` or `video`:

- `useLabelManagement.onChangeLabel` computes `getDeepHandler(area, labelType)`,
  which returns `null` whenever `isDeepBlock(area)` is false
  (`deepHandlers.service.js:127`). None of the fallback branches
  (`text`/`number` → OCR, `Coordinate`, `COMPLEX_TYPES` → sub-object modal) match
  `"audio"`/`"video"`, so **nothing happens** — no modal opens, no value is ever
  written to `area.audio` / `area.video`.
- Even if a value were present, `useAreaCustomRenderer` only paints it via
  `getDeepBlockAudio` / `getDeepBlockVideo`
  (`deepHandlers.service.js:163-182`), both of which also require
  `isDeepBlock(area) === true`. A non-deep block renders as an empty label box.

So non-deep video/voice blocks are currently dead ends. The ask is to make them
work like a normal upload-and-play block — **without** pulling in the deep-block
page-flattening machinery that exists to bake authored content into the scanned
page image.

## Goal

For a block with `typeOfLabel === "audio"` or `"video"` and `isDeep` **false or
absent**:

1. Selecting the label opens the same upload modal used today (paste a URL or
   upload a file), writing the result to `area.audio` / `area.video`.
2. The block then plays back inline (Studio edit preview, view-and-play, and
   submission) exactly like today's deep audio/video blocks — an `<audio>`/`<video>`
   element with controls.
3. Saving/reloading the page persists and restores the media URL, same as deep
   blocks do today.

## Non-goal (important)

**Do not** make these blocks participate in the deep-block page snapshot:

- `useAreaManagement.onClickSubmit` decides whether to run
  `capturePageSnapshot` (the html2canvas pass, including
  `ensureVideoFramesReady`'s play/pause-and-draw-frame trick that swaps every
  `<video>` for a rasterized `<img>`) via
  `hasDeepBlock = areasProperties[activePageIndex]?.some(isDeepBlock)`
  (`useAreaManagement.js:412`).
- This must stay gated on the real `isDeep` flag only. A non-deep video/voice
  block is not replacing/covering scanned page content, so it must never
  trigger `capturePageSnapshot`'s video-frame capture, and `pageCapture.service.js`
  needs **zero changes**.
- Practically: as long as we never set `isDeep: true` for these blocks, this is
  already satisfied for free — the plan below is careful not to touch that flag.

## Root cause / touch points

Three independent places gate on `isDeep`, and only two need to change:

| Concern | Location | Change? |
|---|---|---|
| Opening the upload modal | `useLabelManagement.onChangeLabel` (via `getDeepHandler`) | ✅ add non-deep fallback |
| Painting the media element | `useAreaCustomRenderer` (via `getDeepBlockAudio`/`getDeepBlockVideo`) | ✅ add isDeep-agnostic getters |
| Triggering page-snapshot capture | `useAreaManagement.onClickSubmit` (`hasDeepBlock`) | ❌ leave untouched |
| White-out overlay on delete | `useAreaManagement.js:216` (`isDeepBlock(areaProps) && areaProps?.isServer`) | ❌ leave untouched — non-deep blocks already delete like ordinary (non-white-out) blocks, same as `Question`/`Illustrative Object` blocks today |
| Server payload (`contentValue`) | `ScanAndUpload.jsx handleSubmit` | ❌ already isDeep-agnostic — see below |
| Reading blocks back from server | `initializers/index.js` (`audio: block.contentValue, video: block.contentValue`) | ❌ already isDeep-agnostic |

## Proposed changes

### 1. `services/deepHandlers.service.js` — add isDeep-agnostic getters

Keep `getDeepBlockAudio`/`getDeepBlockVideo` exactly as-is (their contract is
"deep" by name and by test expectations). Add two siblings that drop the
`isDeepBlock` check:

```js
/**
 * The audio URL to paint over an audio block's area, deep or not.
 * @param {Object} area - The areaProperty
 * @returns {string} Audio URL, or "" when nothing should be painted
 */
export const getBlockAudio = (area) =>
  area?.typeOfLabel === "audio" && typeof area.audio === "string" && area.audio
    ? area.audio
    : "";

/**
 * The video URL to paint over a video block's area, deep or not.
 * @param {Object} area - The areaProperty
 * @returns {string} Video URL, or "" when nothing should be painted
 */
export const getBlockVideo = (area) =>
  area?.typeOfLabel === "video" && typeof area.video === "string" && area.video
    ? area.video
    : "";
```

Export both from `services/index.js`.

### 2. `StudioAreaSelector/hooks/useAreaCustomRenderer.js` — paint regardless of deep

Swap the two calls (composite-blocks-tab branch is untouched — it has no
audio/video content):

```diff
- deepAudio = getDeepBlockAudio(area);
- deepVideo = getDeepBlockVideo(area);
+ deepAudio = getBlockAudio(area);
+ deepVideo = getBlockVideo(area);
```

`DeepBlockAudio`/`DeepBlockVideo` themselves need no changes — they already
just take `src`/`interactive` with no `isDeep` awareness baked in, so a
non-deep block gets the identical icon-placeholder-in-edit /
player-with-controls-in-view-and-play behavior deep blocks already have.

### 3. `hooks/useLabelManagement.js` — open the upload modal for non-deep audio/video

`onChangeLabel` already short-circuits on a deep handler; add a second
short-circuit right after it for the non-deep case, reusing the existing
`deep-audio`/`deep-video` modals (they are not actually deep-specific in
implementation — `DeepAudioModal`/`DeepVideoModal` just call
`updateAreaPropertyById(workingArea.id, { audio/video, typeOfLabel })` and
never touch `isDeep`):

```diff
  const deepHandler = getDeepHandler(area, labelType);

  if (deepHandler) {
    deepHandler({ area, idx, labelType, image: img, updateAreaPropertyById: updateAreaPropertyByIdStable, openModal });
    return;
  }

+ // Non-deep audio/video: there is no OCR/crop-based default content for
+ // these types (unlike text/image), so they still need the upload modal —
+ // just without ever setting isDeep, which keeps them out of the page
+ // snapshot / video-frame-capture flow reserved for deep blocks.
+ if (labelType === "audio" || labelType === "video") {
+   const modalName =
+     labelType === "audio" ? STUDIO_MODALS.DEEP_AUDIO : STUDIO_MODALS.DEEP_VIDEO;
+   openModal(modalName, {
+     workingArea: { id: area.id, [labelType]: area[labelType] },
+     updateAreaPropertyById: updateAreaPropertyByIdStable,
+   });
+   return;
+ }
+
  // Process based on label type
  if (labelType === "text" || labelType === "number") {
```

`STUDIO_MODALS` needs importing from `../services/modal.service` in this
file (it currently only imports it for `STUDIO_MODALS.SUB_OBJECT`, so this is
just reusing the existing import).

### 4. Everything else already works

- **Persistence** — `ScanAndUpload.jsx`'s `handleSubmit` already resolves
  `contentValue` from `item.audio`/`item.video` purely by `typeOfLabel`,
  independent of `isDeep` (lines ~78-104). No change needed.
- **Rehydration** — `initializers/index.js` sets
  `audio: block.contentValue, video: block.contentValue` unconditionally when
  rebuilding `areasProperties` from the server. No change needed.
- **Deletion** — non-deep blocks already delete without a white-out overlay
  (that path is explicitly `isDeepBlock(areaProps) && areaProps?.isServer`),
  identical to how existing non-deep `Question`/`Illustrative Object` blocks
  behave today.

## Explicitly out of scope

- `services/block.service.js`'s `transformBlockForSubmit`/
  `transformBlockFromServer` don't round-trip `audio`/`video` at all (its
  `contentValue` derivation only considers `text`/`image`). These functions
  aren't wired into the live save path (`ScanAndUpload.jsx` has its own inline
  `handleSubmit`) — leave as-is; fixing that mismatch is a separate cleanup
  for whenever `block.service.js` actually gets wired up (Studio refactor
  phases 2/3).
- `ReaderModeRenderer` + `usePlayBlock` + `determineModalForArea` fall back to
  opening `QuillModal` for any `typeOfLabel` that isn't in
  `COMPLEX_TYPE_OF_LABELS`/`COMPLEX_AREA_TYPES` — which includes `audio`/
  `video` today, deep or not. That's a pre-existing gap in that particular
  "reader" preview path (separate from the `view-and-play` path this plan
  targets), not something this change introduces or regresses. Worth a follow-up
  ticket if that mode is actually used for audio/video blocks in practice.

## Checklist

- [ ] `deepHandlers.service.js` — add `getBlockAudio`, `getBlockVideo`
- [ ] `services/index.js` — export the two new getters
- [ ] `useAreaCustomRenderer.js` — use `getBlockAudio`/`getBlockVideo` instead of the deep-only getters
- [ ] `useLabelManagement.js` — non-deep `audio`/`video` fallback that opens `deep-audio`/`deep-video` modal without setting `isDeep`
- [ ] Manually verify: a fresh (non-deep) block labelled `video`/`audio` → upload modal opens → save → plays back in view-and-play → submit does **not** run the html2canvas/video-frame capture pass (no console noise from `pageCapture.service.js`, submit stays fast) when it's the only content block on the page
- [ ] Manually verify: a page with one deep block and one non-deep video block still runs the snapshot pass (because of the deep block) and still succeeds
- [ ] Add/extend unit tests in `services/__tests__/deepHandlers.test.js` for `getBlockAudio`/`getBlockVideo` (true regardless of `isDeep`, false for wrong `typeOfLabel` or missing URL)

## Data flow (after this change)

```
Author selects label (typeOfLabel = "audio" | "video")
  → useLabelManagement.onChangeLabel
  → getDeepHandler(area, labelType)
      isDeep === true  → handleDeepAudio/Video → same modal, same field, isDeep untouched (unchanged)
      isDeep !== true  → new fallback → same modal, same field, isDeep stays false/absent
  → DeepAudioModal / DeepVideoModal → author uploads/pastes URL
  → updateAreaPropertyById(id, { audio/video: url, typeOfLabel })

useAreaCustomRenderer.customRender
  → getBlockAudio(area) / getBlockVideo(area)   (isDeep-agnostic)
  → <DeepBlockAudio src={url} interactive={...} /> / <DeepBlockVideo .../>

useAreaManagement.onClickSubmit
  → hasDeepBlock = areasProperties[...].some(isDeepBlock)   (UNCHANGED — still isDeep-only)
  → non-deep video/voice blocks never trigger capturePageSnapshot on their own
```
