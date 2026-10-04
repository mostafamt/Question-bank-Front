# Plan: Deep Block Audio & Video Support

## Overview

Add `audio` and `video` as deep block types, mirroring the existing `image` type.
When a block is marked `isDeep` and the author selects an `audio` or `video` label,
a modal opens that lets them upload a file or paste a URL — reusing `DrawnUI/Sound`
and `DrawnUI/Video` respectively. The chosen URL is then painted over the block's
area on the page, just like `DeepBlockImage` does for images.

---

## Files to Change

### 1. `services/modal.service.js`
Add two new keys to `STUDIO_MODALS`:

```js
DEEP_AUDIO: "deep-audio",
DEEP_VIDEO: "deep-video",
```

No other changes needed here.

---

### 2. `services/deepHandlers.service.js`

**Add two handler functions** (after `handleDeepImage`):

```js
const handleDeepAudio = ({ area, updateAreaPropertyById, openModal }) => {
  openModal(STUDIO_MODALS.DEEP_AUDIO, {
    workingArea: { id: area.id, audio: area.audio },
    updateAreaPropertyById,
  });
};

const handleDeepVideo = ({ area, updateAreaPropertyById, openModal }) => {
  openModal(STUDIO_MODALS.DEEP_VIDEO, {
    workingArea: { id: area.id, video: area.video },
    updateAreaPropertyById,
  });
};
```

**Register them in `DEEP_HANDLERS`**:

```js
const DEEP_HANDLERS = {
  text:  handleDeepText,
  image: handleDeepImage,
  audio: handleDeepAudio,   // new
  video: handleDeepVideo,   // new
};
```

**Add two getter functions** (after `getDeepBlockImage`):

```js
export const getDeepBlockAudio = (area) =>
  isDeepBlock(area) && area?.typeOfLabel === "audio" && typeof area.audio === "string"
    ? area.audio
    : "";

export const getDeepBlockVideo = (area) =>
  isDeepBlock(area) && area?.typeOfLabel === "video" && typeof area.video === "string"
    ? area.video
    : "";
```

**Update the default export** to include the new getters.

---

### 3. `services/index.js`

Export the two new getters:

```js
export {
  getDeepHandler,
  getDeepBlockText,
  getDeepBlockImage,
  getDeepBlockAudio,   // new
  getDeepBlockVideo,   // new
} from "./deepHandlers.service";
```

---

### 4. `Modal/DeepAudioModal/DeepAudioModal.jsx` *(new file)*

Copy the pattern from `DeepImageModal`, swapping `DrawnUI/Image` for `DrawnUI/Sound`.

```jsx
import Sound from "../../DrawnUI/Sound/Sound";

const NAME = "deepAudio";

const DeepAudioModal = ({ workingArea, updateAreaPropertyById, handleCloseModal }) => {
  const seed = typeof workingArea?.audio === "string" ? workingArea.audio : "";

  const { setValue, getValues, watch } = useForm({ defaultValues: { [NAME]: seed } });

  const value = watch(NAME);

  const onSubmit = () => {
    updateAreaPropertyById(workingArea.id, { audio: value, typeOfLabel: "audio" });
    handleCloseModal();
  };

  return (
    <>
      <BootstrapModal.Header closeButton>
        <BootstrapModal.Title>Block audio</BootstrapModal.Title>
      </BootstrapModal.Header>
      <BootstrapModal.Body>
        <Sound name={NAME} setValue={setValue} getValues={getValues} />
      </BootstrapModal.Body>
      <BootstrapModal.Footer>
        <Button color="secondary" onClick={handleCloseModal}>Cancel</Button>
        <Button variant="contained" disabled={!value} onClick={onSubmit}>Save</Button>
      </BootstrapModal.Footer>
    </>
  );
};
```

> `DrawnUI/Sound` reads the current value via `getValues(name)` and writes via
> `setValue(name, link)`, so the same react-hook-form adapter trick from
> `DeepImageModal` works here without modification.

---

### 5. `Modal/DeepVideoModal/DeepVideoModal.jsx` *(new file)*

Same pattern, swapping `DrawnUI/Video`:

```jsx
import Video from "../../DrawnUI/Video/Video";

const NAME = "deepVideo";

const DeepVideoModal = ({ workingArea, updateAreaPropertyById, handleCloseModal }) => {
  const seed = typeof workingArea?.video === "string" ? workingArea.video : "";

  const { setValue, getValues, watch } = useForm({ defaultValues: { [NAME]: seed } });

  const value = watch(NAME);

  const onSubmit = () => {
    updateAreaPropertyById(workingArea.id, { video: value, typeOfLabel: "video" });
    handleCloseModal();
  };

  return (
    <>
      <BootstrapModal.Header closeButton>
        <BootstrapModal.Title>Block video</BootstrapModal.Title>
      </BootstrapModal.Header>
      <BootstrapModal.Body>
        <Video name={NAME} setValue={setValue} getValues={getValues} />
      </BootstrapModal.Body>
      <BootstrapModal.Footer>
        <Button color="secondary" onClick={handleCloseModal}>Cancel</Button>
        <Button variant="contained" disabled={!value} onClick={onSubmit}>Save</Button>
      </BootstrapModal.Footer>
    </>
  );
};
```

> `DrawnUI/Video` uses a local `url` state in addition to `setValue`, which is fine —
> the `watch(NAME)` in the modal reads through `setValue` calls, so the Save button
> becomes enabled correctly once an upload finishes or the URL input is filled.

---

### 6. `Modal/Modal.jsx`

Register the two new modals in `MODAL_COMPONENTS`:

```js
import DeepAudioModal from "./DeepAudioModal/DeepAudioModal";
import DeepVideoModal from "./DeepVideoModal/DeepVideoModal";

const MODAL_COMPONENTS = {
  ...existing,
  "deep-audio": DeepAudioModal,
  "deep-video": DeepVideoModal,
};
```

---

### 7. `DeepBlockContent/DeepBlockAudio.jsx` *(new file)*

Renders an `<audio>` player over the block area, mirroring `DeepBlockImage`:

```jsx
const DeepBlockAudio = ({ src }) => {
  if (!src) return null;
  return (
    <audio className={styles["deep-block-audio"]} controls>
      <source src={src} type="audio/mp3" />
    </audio>
  );
};
```

---

### 8. `DeepBlockContent/DeepBlockVideo.jsx` *(new file)*

Renders a `<video>` player over the block area:

```jsx
const DeepBlockVideo = ({ src }) => {
  if (!src) return null;
  return (
    <video className={styles["deep-block-video"]} controls>
      <source src={src} type="video/mp4" />
    </video>
  );
};
```

Add CSS classes to `deepBlockContent.module.scss` for sizing these elements to fit
their area (similar to `.deep-block-image`).

---

### 9. `StudioAreaSelector/StudioAreaSelector.jsx`

**Import** the new getters and components:

```js
import { getDeepBlockText, getDeepBlockImage, getDeepBlockAudio, getDeepBlockVideo } from "../services/deepHandlers.service";
import DeepBlockAudio from "../DeepBlockContent/DeepBlockAudio";
import DeepBlockVideo from "../DeepBlockContent/DeepBlockVideo";
```

**Extend `customRender`** to extract and paint audio/video:

```js
let areaType, areaLabel, deepText, deepImage, deepAudio, deepVideo;
...
deepText  = getDeepBlockText(area);
deepImage = getDeepBlockImage(area);
deepAudio = getDeepBlockAudio(area);  // new
deepVideo = getDeepBlockVideo(area);  // new
```

```jsx
{deepText  ? <DeepBlockContent html={deepText} /> : null}
{deepImage ? <DeepBlockImage   src={deepImage}  /> : null}
{deepAudio ? <DeepBlockAudio   src={deepAudio}  /> : null}  {/* new */}
{deepVideo ? <DeepBlockVideo   src={deepVideo}  /> : null}  {/* new */}
```

---

## Checklist

- [ ] `modal.service.js` — add `DEEP_AUDIO`, `DEEP_VIDEO`
- [ ] `deepHandlers.service.js` — add handlers + getters + register in map
- [ ] `services/index.js` — export new getters
- [ ] `Modal/DeepAudioModal/DeepAudioModal.jsx` — new modal (reuses Sound)
- [ ] `Modal/DeepVideoModal/DeepVideoModal.jsx` — new modal (reuses Video)
- [ ] `Modal/Modal.jsx` — register new modals
- [ ] `DeepBlockContent/DeepBlockAudio.jsx` — new renderer
- [ ] `DeepBlockContent/DeepBlockVideo.jsx` — new renderer
- [ ] `deepBlockContent.module.scss` — add sizing styles for audio/video
- [ ] `StudioAreaSelector.jsx` — import + paint audio/video in `customRender`

---

## Data Flow (mirrors image)

```
Author selects label (typeOfLabel = "audio" | "video")
  → useLabelManagement.onChangeLabel
  → getDeepHandler(area, labelType)           ← finds handleDeepAudio/Video
  → openModal("deep-audio" | "deep-video", { workingArea, updateAreaPropertyById })
  → DeepAudioModal / DeepVideoModal renders DrawnUI/Sound or DrawnUI/Video
  → author uploads file or pastes URL
  → onSubmit: updateAreaPropertyById(id, { audio/video: url, typeOfLabel })
  → area.audio / area.video is set in areasProperties

StudioAreaSelector.customRender
  → getDeepBlockAudio(area) / getDeepBlockVideo(area) returns URL
  → <DeepBlockAudio src={url} /> / <DeepBlockVideo src={url} /> painted over area
```

No changes are needed to `useLabelManagement` itself — it already delegates to the
handler registry and returns early, so audio and video are handled without touching
the hook.
