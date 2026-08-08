# Feature Plan: Interactive Deep Blocks in View-and-Play Mode

**Date:** August 8, 2026  
**Author:** Claude Code  
**Status:** Planning  
**Related:** [[AREA_SELECTOR_CONDITIONAL_REMOVAL_PLAN.md]] - Phase 1 implementation

---

## Overview

This plan outlines the implementation of interactive video, audio, and iframe (embedded objects) rendering in view-and-play mode. When `showBlocksStyling` is false (view-and-play mode), users should be able to:
- **Play videos** with full video controls
- **Play audio** with interactive audio player
- **Interact with iframes** (embedded objects/tools) without restrictions

Currently, deep block content has `pointer-events: none` which prevents all interaction. This needs to be conditionally enabled based on the rendering mode.

---

## Problem Statement

**Current Behavior:**
- In Studio editing mode: deep blocks are non-interactive (pointer-events: none) so authors can edit areas
- In view-and-play mode: deep blocks remain non-interactive even though area editing is disabled
- Videos: show but can't play (no controls interaction)
- Audio: shows only an icon, no playback capability
- Iframes: show thumbnail preview, can't interact with embedded content

**Desired Behavior:**
- In view-and-play mode: deep blocks become fully interactive
- Videos: Full video player with controls
- Audio: Interactive audio player for playback
- Iframes: Full access to embedded content/tools

---

## Current State Analysis

### Deep Block Components

#### 1. DeepBlockVideo.jsx
- **Current:** Renders `<video>` with controls
- **Status:** Already interactive ✓
- **Issue:** Styling has `pointer-events: none` (line 85 in deepBlockContent.module.scss)
- **Fix Needed:** Enable pointer-events in view-and-play mode

#### 2. DeepBlockAudio.jsx
- **Current:** Shows only a music note icon (non-interactive)
- **Reason:** Audio element would be captured as blank by html2canvas used in page capture
- **Status:** Not interactive ✗
- **Issue:** No audio player exists for view-and-play mode
- **Fix Needed:** Create alternate interactive audio player component for view mode

#### 3. DeepBlockObject.jsx
- **Current:** Shows thumbnail with click-to-expand iframe
- **Status:** Partially interactive (thumbnail click works, but iframe has `pointer-events: none`)
- **Issue:** Iframe styling has `pointer-events: none` (line 98 in deepBlockContent.module.scss)
- **Fix Needed:** Enable pointer-events in view-and-play mode

#### 4. deepBlockContent.module.scss
- **Current Styles:**
  - `.deep-block-content`: `pointer-events: none` (line 22)
  - `.deep-block-image`: `pointer-events: none` (line 54)
  - `.deep-block-audio`: `pointer-events: none` (line 68)
  - `.deep-block-video`: `pointer-events: none` (line 85)
  - `.deep-block-object-iframe`: `pointer-events: none` (line 97)
  - `.deep-block-object-iframe-interactive`: `pointer-events: auto` (line 109) ← Only used in reader mode

### Key Files Involved

| File | Purpose | Changes Needed |
|------|---------|-----------------|
| `src/components/Studio/StudioAreaSelector/StudioAreaSelector.jsx` | Main component, manages modes | Update customRender to pass `interactive` prop to deep blocks |
| `src/components/Studio/DeepBlockContent/DeepBlockVideo.jsx` | Video rendering | Add conditional className for pointer-events |
| `src/components/Studio/DeepBlockContent/DeepBlockAudio.jsx` | Audio rendering | Create interactive variant or conditional rendering |
| `src/components/Studio/DeepBlockContent/DeepBlockObject.jsx` | Iframe/object rendering | Add `interactive` prop handling for iframe |
| `src/components/Studio/DeepBlockContent/deepBlockContent.module.scss` | Styling | Add view-mode classes with pointer-events: auto |

---

## Implementation Strategy

### Phase 1: Video Interactivity

**Component:** `DeepBlockVideo.jsx`

**Changes:**
1. Add `interactive` prop (boolean)
2. Conditionally apply className based on `interactive` state
3. When interactive: `pointer-events: auto` to enable video controls

**New Styles Needed:**
```scss
.deep-block-video-interactive {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  background-color: #000;
  pointer-events: auto;  // Enable interaction
  user-select: none;
}
```

**Code Change:**
```javascript
const DeepBlockVideo = ({ src, interactive = false }) => {
  if (!src) return null;

  return (
    <video
      className={clsx(
        styles["deep-block-video"],
        interactive && styles["deep-block-video-interactive"]
      )}
      controls
      crossOrigin="anonymous"
    >
      <source src={src} type="video/mp4" />
    </video>
  );
};
```

### Phase 2: Audio Interactivity

**Component:** `DeepBlockAudio.jsx`

**Challenge:** Audio element isn't captured by html2canvas, so showing an interactive audio player in Studio mode breaks page capture functionality.

**Solution:** Two rendering paths:

**Path A: Non-Interactive Icon (Studio Mode)**
```javascript
// Current implementation - music note icon
return (
  <div className={styles["deep-block-audio"]}>
    <MusicNoteIcon className={styles["deep-block-audio-icon"]} />
  </div>
);
```

**Path B: Interactive Audio Player (View-and-Play Mode)**
```javascript
// New implementation for view-and-play mode
return (
  <audio
    className={styles["deep-block-audio-interactive"]}
    controls
    crossOrigin="anonymous"
  >
    <source src={src} type="audio/mpeg" />
  </audio>
);
```

**Code Change:**
```javascript
const DeepBlockAudio = ({ src, interactive = false }) => {
  if (!src) return null;

  // Non-interactive: icon (for Studio editing)
  if (!interactive) {
    return (
      <div className={styles["deep-block-audio"]}>
        <MusicNoteIcon className={styles["deep-block-audio-icon"]} />
      </div>
    );
  }

  // Interactive: audio player (for view-and-play)
  return (
    <audio
      className={styles["deep-block-audio-interactive"]}
      controls
      crossOrigin="anonymous"
    >
      <source src={src} type="audio/mpeg" />
    </audio>
  );
};
```

**New Styles:**
```scss
.deep-block-audio-interactive {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  background-color: #fff;
  pointer-events: auto;  // Enable interaction
}
```

### Phase 3: Iframe Interactivity

**Component:** `DeepBlockObject.jsx`

**Changes:**
1. Add `interactive` prop
2. Pass to iframe styling (use existing `deep-block-object-iframe-interactive` class)

**Code Change:**
```javascript
const DeepBlockObject = ({ objectId, interactive = false }) => {
  // ... existing code ...

  return (
    <div style={{ position: "relative", width: "100%", height: "400px" }}>
      {!showIframe && (
        <img
          src={thumbnailUrl}
          alt="thumbnail"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            cursor: "pointer",
          }}
          onClick={() => setShowIframe(true)}
        />
      )}

      {showIframe && (
        <iframe
          src={object.url}
          title="content"
          width="100%"
          height="100%"
          className={clsx(
            interactive
              ? styles["deep-block-object-iframe-interactive"]
              : styles["deep-block-object-iframe"]
          )}
        />
      )}
    </div>
  );
};
```

### Phase 4: Update StudioAreaSelector

**File:** `src/components/Studio/StudioAreaSelector/StudioAreaSelector.jsx`

**Changes:**
1. Update `customRender()` to detect view-and-play mode
2. Pass `interactive` prop to deep block components

**Current Code (line 181):**
```javascript
{deepObjectId ? <DeepBlockObject objectId={deepObjectId} interactive={isReaderMode} /> : null}
```

**New Code:**
```javascript
const isInteractiveMode = isReaderMode || (!showBlocksStyling && !readOnly);

// Then in customRender:
{deepVideo ? <DeepBlockVideo src={deepVideo} interactive={isInteractiveMode} /> : null}
{deepAudio ? <DeepBlockAudio src={deepAudio} interactive={isInteractiveMode} /> : null}
{deepObjectId ? <DeepBlockObject objectId={deepObjectId} interactive={isInteractiveMode} /> : null}
```

---

## Detailed Implementation Steps

### Step 1: Update SCSS Styles

**File:** `src/components/Studio/DeepBlockContent/deepBlockContent.module.scss`

Add interactive variants for each deep block type:

```scss
// Add after existing styles

// Video - view-and-play interactive mode
.deep-block-video-interactive {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  background-color: #000;
  pointer-events: auto;
  user-select: none;
}

// Audio - view-and-play interactive mode
.deep-block-audio-interactive {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  background-color: #fff;
  pointer-events: auto;
  user-select: none;
}
```

### Step 2: Update DeepBlockVideo Component

**File:** `src/components/Studio/DeepBlockContent/DeepBlockVideo.jsx`

Add interactive prop and conditional styling:

```javascript
import React from "react";
import clsx from "clsx";
import styles from "./deepBlockContent.module.scss";

const DeepBlockVideo = ({ src, interactive = false }) => {
  if (!src) {
    return null;
  }

  return (
    <video
      className={clsx(
        styles["deep-block-video"],
        interactive && styles["deep-block-video-interactive"]
      )}
      controls
      crossOrigin="anonymous"
    >
      <source src={src} type="video/mp4" />
    </video>
  );
};

export default DeepBlockVideo;
```

### Step 3: Update DeepBlockAudio Component

**File:** `src/components/Studio/DeepBlockContent/DeepBlockAudio.jsx`

Create two rendering paths:

```javascript
import React from "react";
import clsx from "clsx";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import styles from "./deepBlockContent.module.scss";

const DeepBlockAudio = ({ src, interactive = false }) => {
  if (!src) {
    return null;
  }

  // Non-interactive mode: show icon (for Studio editing/page capture)
  if (!interactive) {
    return (
      <div className={styles["deep-block-audio"]}>
        <MusicNoteIcon className={styles["deep-block-audio-icon"]} />
      </div>
    );
  }

  // Interactive mode: show audio player (for view-and-play)
  return (
    <audio
      className={styles["deep-block-audio-interactive"]}
      controls
      crossOrigin="anonymous"
    >
      <source src={src} type="audio/mpeg" />
    </audio>
  );
};

export default DeepBlockAudio;
```

### Step 4: Update DeepBlockObject Component

**File:** `src/components/Studio/DeepBlockContent/DeepBlockObject.jsx`

Add interactive prop to iframe:

```javascript
import React from "react";
import clsx from "clsx";
import { useQuery } from "@tanstack/react-query";
import { getObject } from "../../../api/bookapi";
import styles from "./deepBlockContent.module.scss";

const DeepBlockObject = ({ objectId, interactive = false }) => {
  const { data: object, isLoading } = useQuery({
    queryKey: ["deep-object", objectId],
    queryFn: () => getObject(objectId),
    enabled: Boolean(objectId),
    staleTime: Infinity,
  });

  const [showIframe, setShowIframe] = React.useState(false);

  if (!objectId) {
    return null;
  }

  if (isLoading) {
    return (
      <div className={styles["deep-block-object-loading"]}>Loading…</div>
    );
  }

  if (!object?.url) {
    return (
      <div className={styles["deep-block-object"]}>Object linked</div>
    );
  }

  const thumbnailUrl = `https://image.thum.io/get/${object.url}`;

  return (
    <div style={{ position: "relative", width: "100%", height: "400px" }}>
      {!showIframe && (
        <img
          src={thumbnailUrl}
          alt="thumbnail"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            cursor: "pointer",
          }}
          onClick={() => setShowIframe(true)}
        />
      )}

      {showIframe && (
        <iframe
          src={object.url}
          title="content"
          width="100%"
          height="100%"
          className={clsx(
            interactive
              ? styles["deep-block-object-iframe-interactive"]
              : styles["deep-block-object-iframe"]
          )}
        />
      )}
    </div>
  );
};

export default DeepBlockObject;
```

### Step 5: Update StudioAreaSelector

**File:** `src/components/Studio/StudioAreaSelector/StudioAreaSelector.jsx`

Add logic to determine interactive mode and update customRender:

**Location:** Around line 138-197

1. Add variable to determine interactive mode:
```javascript
// Add after line 73 (inside customRender)
const isInteractiveMode = isReaderMode || (!showBlocksStyling && !readOnly);
```

2. Update deepBlock component calls:
```javascript
// Line 179-181: Update these
{deepAudio ? <DeepBlockAudio src={deepAudio} interactive={isInteractiveMode} /> : null}
{deepVideo ? <DeepBlockVideo src={deepVideo} interactive={isInteractiveMode} /> : null}
{deepObjectId ? <DeepBlockObject objectId={deepObjectId} interactive={isInteractiveMode} /> : null}
```

---

## Mode Interaction Matrix

This matrix shows which modes have interactive deep blocks:

| Mode | Video | Audio | Iframe | AreaSelector | Use Case |
|------|-------|-------|--------|--------------|----------|
| **Reader** | ✅ Interactive | ✅ Interactive | ✅ Interactive | ❌ No | Reading book |
| **View-and-Play** | ✅ Interactive | ✅ Interactive | ✅ Interactive | ❌ No | View/present blocks |
| **Edit** | ❌ Non-interactive | ❌ Icon only | ❌ Thumbnail | ✅ Yes | Create/edit areas |
| **Read-Only** | ❌ Non-interactive | ❌ Icon only | ❌ Thumbnail | ❌ No | Locked preview |

---

## Styling Considerations

### Current Style Hierarchy

```
deep-block-content
├── pointer-events: none (affects all children)
├── deep-block-video
│   └── pointer-events: none
├── deep-block-audio
│   └── pointer-events: none
└── deep-block-object-iframe
    └── pointer-events: none

deep-block-object-iframe-interactive (separate class)
└── pointer-events: auto
```

### New Style Approach

Add `-interactive` variants:
- `deep-block-video-interactive` (new)
- `deep-block-audio-interactive` (new)
- `deep-block-object-iframe-interactive` (existing, reuse)

Use `clsx()` to conditionally apply interactive class:
```javascript
className={clsx(
  styles["deep-block-video"],
  interactive && styles["deep-block-video-interactive"]
)}
```

This way:
- Default class: `deep-block-video` (pointer-events: none)
- When interactive: both classes applied, interactive class overrides (CSS specificity)

---

## Testing Checklist

### Video Playback
- [ ] Video plays in reader mode
- [ ] Video plays in view-and-play mode
- [ ] Video controls visible (play, pause, progress, volume)
- [ ] Video does NOT play in edit mode (non-interactive)
- [ ] Video does NOT play in read-only mode

### Audio Playback
- [ ] Audio icon shows in edit mode
- [ ] Audio icon shows in read-only mode
- [ ] Audio player shows in reader mode
- [ ] Audio player shows in view-and-play mode
- [ ] Audio controls visible (play, pause, progress, volume)
- [ ] Audio can be played/paused/volume adjusted

### Iframe Interactivity
- [ ] Iframe thumbnail visible in edit/read-only modes
- [ ] Iframe is interactive in reader mode
- [ ] Iframe is interactive in view-and-play mode
- [ ] Can click thumbnail to expand iframe
- [ ] Embedded content is fully interactive when expanded
- [ ] Can scroll, click, submit forms in iframe

### Mode Switching
- [ ] Toggle showBlocksStyling: deep blocks become interactive
- [ ] No errors or console warnings
- [ ] Smooth transition between modes
- [ ] Page capture still works (audio shows as icon)

### Browser Compatibility
- [ ] Video works on Chrome, Firefox, Safari
- [ ] Audio works on all browsers
- [ ] Iframe works on all browsers
- [ ] Cross-origin content loads correctly (crossOrigin="anonymous")

---

## Edge Cases to Handle

1. **Missing Media URLs**
   - Video/audio src is null/undefined → component returns null ✓
   - Iframe object URL is missing → shows fallback text ✓

2. **Media Loading Errors**
   - Video fails to load → browser shows error message (native behavior)
   - Audio fails to load → browser shows error message
   - Iframe fails to load → shows blank iframe

3. **Concurrent Mode Changes**
   - User toggles showBlocksStyling while video is playing → continue playing
   - User toggles showBlocksStyling while audio is loading → continue loading

4. **Mobile/Touch Devices**
   - Video fullscreen button works
   - Audio controls responsive
   - Iframe touch interactions work

5. **Cross-Origin Issues**
   - crossOrigin="anonymous" handles most cases
   - Iframe sandbox restrictions (if any) should be respected
   - CORS errors logged but don't break UI

---

## Performance Considerations

### Positive Impacts
- No additional network requests (media URLs already in data)
- Lazy rendering (only interactive when needed)
- Native browser controls (better performance than custom)

### Potential Issues
- Multiple videos/audios playing simultaneously
  - Solution: Let browser handle (user will hear overlapping audio)
  - Could add mute-others feature in future
- Iframe loading with heavy content
  - Solution: Thumbnail preview throttles loading
  - Only loads when user clicks

---

## Backwards Compatibility

✅ **Fully backwards compatible**

- New `interactive` prop defaults to `false`
- Existing components work unchanged if prop not passed
- Styling has `pointer-events: none` by default
- Interactive variants are opt-in via prop

---

## Files to Modify

| File | Type | Complexity |
|------|------|------------|
| `src/components/Studio/DeepBlockContent/deepBlockContent.module.scss` | Styling | Low |
| `src/components/Studio/DeepBlockContent/DeepBlockVideo.jsx` | Component | Low |
| `src/components/Studio/DeepBlockContent/DeepBlockAudio.jsx` | Component | Medium |
| `src/components/Studio/DeepBlockContent/DeepBlockObject.jsx` | Component | Low |
| `src/components/Studio/StudioAreaSelector/StudioAreaSelector.jsx` | Component | Low |

**Total Complexity:** Medium  
**Estimated Lines of Code:** ~80-100  
**Risk Level:** Low (isolated to deep block components)

---

## Future Enhancements

1. **Audio Playlist**
   - Multiple audio files in single block
   - Skip/prev buttons

2. **Video Subtitles**
   - Support for .vtt subtitle files
   - Language selection

3. **Custom Media Controls**
   - Custom player UI instead of native controls
   - Branding/theming options

4. **Media Analytics**
   - Track play/pause events
   - Progress tracking for engagement metrics

5. **Autoplay Handling**
   - Respect user preferences
   - Mute-on-autoplay for audio

6. **Accessibility Enhancements**
   - Better keyboard navigation
   - ARIA labels for screen readers
   - Transcript support for audio

---

## References

- **Implementation (Phase 1):** `docs/2026-08-08/IMPLEMENTATION_SUMMARY.md`
- **Plan (Phase 0):** `docs/2026-08-08/AREA_SELECTOR_CONDITIONAL_REMOVAL_PLAN.md`
- **Deep Block Components:**
  - `src/components/Studio/DeepBlockContent/DeepBlockVideo.jsx`
  - `src/components/Studio/DeepBlockContent/DeepBlockAudio.jsx`
  - `src/components/Studio/DeepBlockContent/DeepBlockObject.jsx`
  - `src/components/Studio/DeepBlockContent/deepBlockContent.module.scss`
- **Main Integration Point:** `src/components/Studio/StudioAreaSelector/StudioAreaSelector.jsx` (lines 138-197)

---

## Questions & Decisions

1. **Audio Format Support**
   - Currently: MP3 assumed (type="audio/mpeg")
   - Question: Should we support WAV, OGG, etc.?
   - Decision: Support common formats via file extension detection

2. **Iframe Sandbox Restrictions**
   - Question: Should iframe have sandbox restrictions?
   - Decision: No sandbox for now (allow full interactivity). Revisit if security concerns arise.

3. **Fullscreen Support**
   - Question: Allow fullscreen for video/iframe in view-and-play mode?
   - Decision: Yes, use default browser fullscreen (no restriction)

4. **Muting Others**
   - Question: Mute other videos when one plays?
   - Decision: Not implemented in Phase 1. Can add in future if needed.
