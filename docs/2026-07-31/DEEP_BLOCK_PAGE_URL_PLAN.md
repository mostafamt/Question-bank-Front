# Plan: Send `pageUrl` snapshot when a page contains deep blocks

## Context

`ScanAndUpload.jsx`'s `handleSubmit` currently posts only `{ blocks, v_blocks }` to `POST /save-blocks`. The backend now also accepts an optional top-level `pageId`, `chapterId`, and `pageUrl`. `pageUrl` should be populated **only** when the page being saved contains at least one "deep" block (`isDeep === true`) — pages with no deep blocks keep sending the payload as-is.

A deep block (`src/components/Studio/services/deepHandlers.service.js`) replaces the default OCR-driven content with author-supplied content (typed rich text, a chosen image/audio/video URL, or a linked object) rendered on top of the page via `DeepBlockContent`/`DeepBlockImage`/etc. inside `StudioAreaSelector.jsx`. `pageUrl` is meant to be a flattened snapshot of the page **as it will actually look** (base scan + deep-block content), so downstream consumers don't need to reconstruct that composite. It must exclude the authoring-only visual chrome — the colored/dashed borders and translucent background fills that `constructBoxColors()` (`src/components/Studio/services/styling.service.js`) paints on every `@bmunozg/react-image-area` box so authors can see/select areas while editing.

Nothing in the codebase currently rasterizes a DOM subtree to an image (confirmed: no `html2canvas`/`dom-to-image`/`toPng` dependency or usage anywhere). The only canvas usage (`src/utils/ocr.js:cropSelectedArea`) crops a rectangular region straight from the source `<img>`, not the rendered overlay. This feature requires adding a small new capability, not just wiring existing plumbing.

## Approach

Add `html2canvas` and capture the *rendered container* (`<img>` + deep-block overlays) that already lives inside `StudioAreaSelector`, with the react-image-area border/background styling stripped out during capture via html2canvas's `onclone` hook. The capture happens in Studio (the only place with DOM access); the actual `/upload` network call stays in `ScanAndUpload.jsx`, consistent with how block-content crops are uploaded today via `newUpload` (`src/utils/NewUpload.js`).

### Why `onclone` + inline `!important` override (not CSS class toggling)

Area borders/backgrounds are applied two ways, both using `!important`:
- Fallback: `studioAreaSelector.module.scss` — `border: 2px solid green` on `.block > div:last-child > div:not(:first-child)`.
- Active: `constructBoxColors()` — Emotion `css` prop, `border: ... !important` / `backgroundColor` per area, keyed to `.block > div:nth-of-type(idx+2)`.

A stylesheet `!important` rule beats a plain inline style, but an inline style set via `el.style.setProperty(prop, val, 'important')` *does* win the cascade. So in html2canvas's `onclone(clonedDoc)` callback, walk the cloned container's direct child `<div>`s (these are exactly the react-image-area–generated area boxes; deep content is nested *inside* them and is untouched) and force `border`, `background-color`, `box-shadow` to `none`/`transparent` with `'important'` priority. This reliably neutralizes both the SCSS fallback and the Emotion overrides without touching the live UI or fighting specificity.

### Known limitation (documented, not solved here)

`DeepBlockObject` renders an `<iframe>` for linked interactive objects. html2canvas cannot rasterize cross-origin iframe content — that area will appear blank in the snapshot. Acceptable for this change; flagging so it's not mistaken for a bug later.

## Implementation

### 1. New dependency
`npm install html2canvas` — add to `package.json`.

### 2. New file: `src/components/Studio/services/pageCapture.service.js`
Exports `capturePageSnapshot(containerEl)`:
- Returns `null` immediately if `containerEl` is falsy.
- Runs `html2canvas(containerEl, { useCORS: true, backgroundColor: null, onclone: (clonedDoc, clonedEl) => {...} })`. `useCORS: true` matches the existing `crossOrigin="anonymous"` already set on the page `<img>` (same pattern relied on by `cropSelectedArea`'s `canvas.toDataURL()`, so CORS is already known to work for this image source).
- `onclone` iterates `clonedEl.children` (direct child `<div>`s only) and calls `child.style.setProperty('border', 'none', 'important')`, `setProperty('background-color', 'transparent', 'important')`, `setProperty('box-shadow', 'none', 'important')`.
- Converts the resulting canvas via `canvas.toDataURL('image/png')` and returns that data URL.

### 3. Thread a `pageContainerRef` down to the DOM node to capture

Reuses the existing prop-drilling path (`Studio.jsx` → `StudioLayout` → `StudioEditor` → `StudioAreaSelector`), adding one new plain ref prop alongside it — does **not** touch the existing `ref`/`useImperativeHandle` chain that `imageRef` (used by OCR cropping) depends on, so no risk of breaking existing crop/label logic.

- **`src/components/Studio/Studio.jsx`**: add `const pageContainerRef = React.useRef(null);`; pass `pageContainerRef={pageContainerRef}` into `<StudioLayout .../>` (~line 427) and into the `useAreaManagement({...})` call (~line 122).
- **`src/components/Studio/components/StudioLayout.jsx`**: destructure `pageContainerRef` from props, forward it to `<StudioEditor pageContainerRef={pageContainerRef} .../>`.
- **`src/components/Studio/StudioEditor/StudioEditor.jsx`**: no change needed — it already spreads `{...props}` into `<StudioAreaSelector>`, so `pageContainerRef` flows through automatically.
- **`src/components/Studio/StudioAreaSelector/StudioAreaSelector.jsx`**: destructure `pageContainerRef` from props; attach `ref={pageContainerRef}` to the existing `<div className={styles.block} css={constructBoxColors(...)}>` wrapper (~line 351). This div is the single stable wrapper across every render branch (reader mode, read-only, hand-highlight, `AreaSelector` editing mode), so one ref covers all cases without branching.

### 4. Capture at submit time, only when the page has a deep block

**`src/components/Studio/hooks/useAreaManagement.js`**:
- Accept `pageContainerRef` in the hook's params.
- Import `isDeepBlock` from `../utils` and `capturePageSnapshot` from `../services/pageCapture.service`.
- In `onClickSubmit`'s non-`subObject` branch (~line 270), before calling `handleSubmit`:
  ```js
  const hasDeepBlock = areasProperties[activePageIndex]?.some(isDeepBlock);
  const pageSnapshot = hasDeepBlock
    ? await capturePageSnapshot(pageContainerRef.current)
    : null;
  const id = await handleSubmit(
    activePageId,
    areasProperties[activePageIndex],
    virtualBlocks[activePageIndex],
    pageSnapshot
  );
  ```
- The `subObject` branch (modal-based sub-object creation, single-arg `handleSubmit`) is untouched — this feature is scoped to the main ScanAndUpload submit flow only, matching the request.

### 5. Upload the snapshot and extend the request body

**`src/pages/ScanAndUpload/ScanAndUpload.jsx`**:
- `handleSubmit` gains a 4th parameter: `(pageId, areas, virtualBlocks, pageSnapshot)`.
- After building `blocks` and `formattedVBlocks`, upload the snapshot the same way existing block-image crops are uploaded (reusing `newUpload` from `../../utils/NewUpload`, already imported):
  ```js
  const pageUrl = pageSnapshot ? await newUpload(pageSnapshot) : null;

  const data = {
    pageId,
    chapterId,
    ...(pageUrl && { pageUrl }),
    blocks,
    ...(formattedVBlocks && { v_blocks: [formattedVBlocks] }),
  };
  ```
- `chapterId` is already destructured from `useParams()` at the top of the component (line 25) — no new plumbing needed.
- Existing per-block `pageId` inside each `blocks[]` entry is left exactly as-is; this only adds new top-level fields.

## Files touched

- `package.json` (new dependency)
- `src/components/Studio/services/pageCapture.service.js` (new)
- `src/components/Studio/Studio.jsx`
- `src/components/Studio/components/StudioLayout.jsx`
- `src/components/Studio/StudioAreaSelector/StudioAreaSelector.jsx`
- `src/components/Studio/hooks/useAreaManagement.js`
- `src/pages/ScanAndUpload/ScanAndUpload.jsx`

## Verification

1. `npm start`, open a chapter's Scan & Upload / Studio page.
2. Page with **no** deep blocks: create/edit blocks normally, submit, confirm (via browser Network tab) the `/save-blocks` payload has top-level `pageId`/`chapterId` but no `pageUrl`, and behavior is otherwise unchanged.
3. Page **with** a deep block: toggle "Deep" on an area (`AreaActionHeader`), author content (e.g. deep text via Quill, or a deep image URL), submit, and confirm:
   - A `POST /upload` fires with the captured snapshot before `/save-blocks`.
   - The `/save-blocks` payload includes `pageUrl` pointing at the newly uploaded image.
   - Open the returned `pageUrl` directly — it should show the page with the deep content composited in, and **no** colored/dashed selection borders or translucent fills from the authoring UI.
4. Confirm normal OCR-based (non-deep) block cropping/label flows still work unaffected (sanity check that the new `pageContainerRef` wiring didn't disturb the existing `imageRef` chain used by `cropSelectedArea`).
