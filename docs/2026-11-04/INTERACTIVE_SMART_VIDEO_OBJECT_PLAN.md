# Render Blocks as Interactive Objects When `contentValue` Is an Object ID

> **Status:** Implemented 2026-11-04.

## Goal

If a block's `contentValue` is an interactive-object id, open the block as an
interactive object: fetch the object and show its `url` in an iframe inside a modal.
This applies to every `contentType`. We decide by **what the value is**, not by
**which type the block has**, so the `COMPLEX_TYPES` / `COMPLEX_TYPE_OF_LABELS`
allow-lists no longer control playback.

The bug that prompted this: `contentType: "Interactive Smart Video"` isn't on either
allow-list, so the block opens in the Quill/text view and shows the raw id.

### Example block

Source: `GET /api/pages?chapterId=ed8da075f9f4f1105d53bd06&language=en`

```json
{
  "blockId": "6ac2804b6096980004c4f625",
  "contentValue": "6ac43b86aa141d0004485980",
  "contentType": "Interactive Smart Video",
  ...
}
```

`GET /api/interactive-objects/6ac43b86aa141d0004485980` returns (trimmed):

```json
{
  "_id": "6ac43b86aa141d0004485980",
  "questionName": "Overview of Cell Structure",
  "url": "https://smart-study-room-kxyg.vercel.app?id=6ac43b86aa141d0004485980"
}
```

The modal only needs `url`.

## Detection Rule

Object ids are MongoDB ObjectIds: exactly 24 hex characters. Other content values look different:

| contentType | Typical contentValue | Matches the id rule? |
|-------------|---------------------|-----------------|
| Interactive Smart Video, Hotspot Image, MCQ, … | `6ac43b86aa141d0004485980` | ✅ yes → object |
| Video / Voice / Image | `https://…s3…amazonaws.com/…` | ❌ no |
| Text / Paragraph / Notes | free text / HTML | ❌ no (in practice) |

Add a helper in a new, dependency-free module `src/utils/objectId.js`. (`book.js` imports React components, and through them axios; importing it from `modal.service.js` broke `deepHandlers.test.js`.)

```js
const OBJECT_ID_REGEX = /^[a-f0-9]{24}$/i;

/** True when a block's content value is an interactive-object id. */
export const isObjectId = (value) =>
  typeof value === "string" && OBJECT_ID_REGEX.test(value.trim());
```

**Edge case:** a text block whose whole content is exactly 24 hex characters would be
treated as an object. This is very unlikely, and the modal still copes: `getObject` fails
and the modal shows "No Object url is available." We accept this risk.

## Where the Decision Is Made Today, and the Change for Each

### 1. Studio / Reader: `src/components/Studio/hooks/usePlayBlock.js`
The server block is mapped to an area in `src/components/Studio/initializers/index.js:36-53`.
That mapping sets `text = image = audio = video = block.contentValue`.

`onPlayBlock` currently checks `typeOfLabel === "video"`, then `"audio"`, then
`isComplex`, then Quill. Add the id check **first**:

```js
if (isObjectId(areaProps.text)) {
  setFormState({ activeId: areaProps.text });
  openModal(STUDIO_MODALS.PLAY_OBJECT);
} else if (areaProps.typeOfLabel === "video") { ... }
else if (areaProps.typeOfLabel === "audio") { ... }
else { ...QUILL... }
```

The id check has to come first. If it came after the video branch, a block whose
`typeOfLabel` resolves to `"video"` would send an id to the raw `<video>` player.

`getPlayLabel` should return `"Play"` when `isObjectId(areaProps.text)`, and `"View"`
otherwise.

### 2. Context menu label: `src/components/Studio/StudioAreaSelector/hooks/useBlockContextMenu.js:180`
No edit needed. It already calls `determineModalForArea(areaProps).isComplex`, which
now uses the id rule (step 3). Object blocks show "Play" and everything else shows "View".

### 3. `determineModalForArea`: `src/components/Studio/services/modal.service.js:308`
Base `isComplex` on the id check, so every remaining caller agrees with the new rule:

```js
const isComplex = isObjectId(areaProps.text);
```

After this, `COMPLEX_TYPE_OF_LABELS` is unused, so delete it. `COMPLEX_AREA_TYPES`
stays because `deepHandlers.service.js` still uses it. `COMPLEX_TYPES` in `ocr.js` **stays**: authoring code (`useLabelManagement`,
`useSubObjectState`, `AreaActionResult`) still uses it to decide which *editor* to show.
That's a separate concern from playback.

### 4. StudyBook: `src/components/StudyBook/StudyBook.jsx:26-46`
Check the id before the `Video` and `Voice` branches:

```js
if (isObjectId(block.contentValue)) {
  openModal("play-object", { workingArea: block });
} else if (block.contentType === "Video") { ... }
else if (block.contentType === "Voice") { ... }
else { ...quill... }
```

### 5. `src/components/Modal/PlayObjectModal/PlayObjectModal.jsx`
Its iframe branch is currently gated by `isComplexType(contentType || typeOfLabel)`.
Change it to `isObjectId(id)`, where `id` is the value it already fetches
(`workingArea.isServer ? workingArea.text : workingArea.contentValue`). Without this
change, the modal opens but falls into the `else` branch and prints the id again.

### 6. Fix the stale cache key on the object query (both play modals)
`PlayObjectModal` and `PlayObjectModal2` use `queryKey: ["get-object"]` with no id, so
opening a second block can show the previous block's object. Change it to:

```js
queryKey: ["get-object", id]
```

### 7. Optional: add a modal title
Show `object.questionName` in `BootstrapModal.Title`.

## Files to Change

| File | Change |
|------|--------|
| `src/utils/objectId.js` (new) | `isObjectId()` |
| `src/components/Studio/hooks/usePlayBlock.js` | Check the id first; update `getPlayLabel` |
| `src/components/Studio/StudioAreaSelector/hooks/useBlockContextMenu.js` | No change needed: it already goes through `determineModalForArea` |
| `src/components/Studio/services/modal.service.js` | `determineModalForArea` uses `isObjectId`; remove `COMPLEX_TYPE_OF_LABELS` |
| `src/components/StudyBook/StudyBook.jsx` | Check the id first |
| `src/components/Modal/PlayObjectModal/PlayObjectModal.jsx` | Gate the iframe on `isObjectId`; `queryKey` includes the id |
| `src/components/Modal/PlayObjectModal2/PlayObjectModal2.jsx` | `queryKey` includes the id; optional title |

No backend changes. `getObject` in `src/api/bookapi.js` is reused as-is.

## Testing

1. **Unit:** `isObjectId` in `src/utils/__tests__/isObjectId.test.js`
   - `"6ac43b86aa141d0004485980"` → true
   - `"6AC43B86AA141D0004485980"` → true
   - `"https://…amazonaws.com/x.mp4"`, `"Cell structure"`, `""`, `null`, a 23- or 25-character hex string → false
2. **Unit:** `determineModalForArea({ text: "6ac4…5980", typeOfLabel: "video" })` → `isComplex: true`.
3. **Manual (Reader):** open `/read/book/:bookId/chapter/ed8da075f9f4f1105d53bd06` and click the
   Interactive Smart Video block → the iframe modal opens. The context menu says "Play".
4. **Manual (StudyBook):** same block → `play-object` modal shows the iframe.
5. **Regression:** Hotspot Image block (`6a9874571af52e00046b8bb5`) still plays. Video, Voice,
   image, and text blocks still open their usual modals.
6. **Cache:** open the smart video, close it, open the Hotspot Image → it shows the hotspot.

## Out of Scope / Follow-ups
- `translations[]`: use the `contentValue` for the active language (the Hotspot block has
  `ar`/`fr` ids). The same `isObjectId` rule applies to those values.
- Showing `vttList` subtitles natively. The iframe player already handles them.
