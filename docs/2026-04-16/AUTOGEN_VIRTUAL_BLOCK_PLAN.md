# AutoGen Integration for VirtualBlockContentModal

**Date:** 2026-04-16
**Scope:** `ContentItemForm.jsx` + new AutoGen UI components
**Status:** Approved — ready for implementation

---

## 1. Overview

Add a fourth content type — **AutoGen** — to the `ContentItemForm` alongside Text, Link, and Object. AutoGen lets users describe a custom educational block and submit a generation request to the server. Because the backend API is not yet available, the initial implementation will use a **simulator** that mimics the async lifecycle of a real generation request.

---

## 2. Data Model

### New content type value
```
type: "autogen"
```

### Content item shape (extends existing pattern)
```js
{
  type: "autogen",
  iconLocation: "TM",              // inherited from parent block
  contentType: "Notes 📝",        // inherited from parent block label
  contentValue: string,            // base64 data URL of the cropped page image — e.g. "data:image/png;base64,..."
  // autogen-specific metadata (sibling fields, not nested in contentValue)
  jobId: string,                   // ID returned by the generation job
  status: "pending" | "processing" | "completed" | "failed",
  objectId: string | null,             // populated when polling response contains { objectId }
  errorMessage: string | null
}
```

`contentValue` is a plain string (base64 image) — consistent with other content types and requires no special serialisation. Generation state lives in sibling fields. Once `generatedObjectId` is populated the item is functionally equivalent to an Object content item for the reader.

---

## 3. UX Flow — Full-Page Overlay Panel

**Adding a new AutoGen item:**
1. User clicks the **AutoGen** toggle button in `ContentItemForm`.
2. A full-screen `Dialog` opens showing the current page image.
3. User draws a crop rectangle over the block they want to generate (using a canvas-based crop UI).
4. A preview of the cropped area is shown below the page image.
5. User clicks **Generate**:
   - The selection is cropped via `canvas.toDataURL("image/png")` → base64 string
   - `simulateSubmitAutoGen({ image: base64 })` is called → returns `jobId`
   - A content item is added immediately: `{ type: "autogen", contentValue: base64, jobId, status: "pending", generatedObjectId: null }`
   - Overlay closes
6. The item appears in `ContentItemList` with `AutoAwesomeIcon`, a thumbnail of the cropped image, and a "Processing" badge.
7. `useAutoGenPolling` (active while the modal is open) polls every 5 s and updates the item in place.
8. On completed (poll response has `objectId`): badge turns green, play button becomes active.
9. On `"failed"`: badge turns red, a **Retry** button appears.

**Regenerating an existing AutoGen item:**
1. User clicks the edit (pencil) icon on an existing autogen item in `ContentItemList`.
2. `AutoGenPanel` re-opens showing the page image with the previous crop pre-drawn.
3. User adjusts the crop and clicks **Generate**: new job submitted, item updated in place (`jobId` replaced, `contentValue` replaced with new crop, status reset to `"pending"`, `generatedObjectId` cleared), overlay closes.
4. Polling resumes for the updated item.

**Passing the page image to the panel:**
- `VirtualBlockContentModal` must receive a `pageImageUrl` prop (the current page's image URL).
- This is added to the `openModal` call in `VirtualBlock.jsx`, which already has access to the active page context via its parent.
- `AutoGenPanel` renders this URL in an `<img>` element sized to fill the overlay, with a transparent canvas overlay for drawing the crop rectangle.

---

## 4. Decisions

| Question | Decision |
|---|---|
| Status display in list | Status badge + play button — no inline iframe preview |
| Regeneration | Edit button re-opens `AutoGenPanel` pre-filled; new job replaces old one in place |
| Language input | Free-text field |
| Polling scope | Only while `VirtualBlockContentModal` is open; stops on modal close |
| Pending items saveable | Yes — saved with `status: "pending"` and `jobId`; polling does not resume automatically on next open (background resume deferred to Phase 6) |

---

## 5. Simulator Design

Since the real API is unavailable, two simulator functions mirror the real polling lifecycle. Both accept/return the same shapes the real API will use, so only these functions change when the backend lands.

```js
// src/services/autogen.simulator.js

const MOCK_JOB_STORE = {};

// Step 1: Submit — accepts the cropped image, returns a jobId immediately
export async function simulateSubmitAutoGen({ image }) {
  // image: base64 data URL (not used by simulator but matches real API signature)
  const jobId = "sim_" + Math.random().toString(36).slice(2, 10);
  MOCK_JOB_STORE[jobId] = {
    resolveAfter: Date.now() + 4000 + Math.random() * 6000, // 4–10 s
    willFail: Math.random() < 0.1,
  };
  return { jobId, status: "processing" };
}

// Step 2: Poll — returns current job status
export async function simulatePollAutoGen(jobId) {
  const job = MOCK_JOB_STORE[jobId];
  if (!job) return { jobId, status: "failed", errorMessage: "Unknown job" };
  if (Date.now() < job.resolveAfter) return { jobId, status: "processing" };
  if (job.willFail) return { jobId, status: "failed", errorMessage: "Simulated generation error" };

  const mockIds = [
    "507f1f77bcf86cd799439011",
    "507f1f77bcf86cd799439012",
    "507f1f77bcf86cd799439013",
  ];
  // Mirrors real API: completed response contains only objectId
  return { objectId: mockIds[Math.floor(Math.random() * mockIds.length)] };
}
```

---

## 6. Component Breakdown

| Component / File | Purpose |
|---|---|
| `ContentItemForm.jsx` | Add "autogen" case to `contentType` toggle, `validateForm`, and submit handler |
| `AutoGenPanel.jsx` (new) | Full-screen overlay: page image + canvas crop tool; fires submit and closes immediately |
| `ContentItemList.jsx` | Add rendering branch for `type === "autogen"` (icon, cropped image thumbnail, status badge, retry) |
| `useAutoGenPolling.js` (new) | Hook that polls pending autogen items on an interval, updates their status in place |
| `autogen.simulator.js` (new) | Two-function simulator (submit + poll) — swap for real API call later |

All new files live under:
```
src/components/Modal/VirtualBlockContentModal/
  AutoGenPanel/
    AutoGenPanel.jsx
    autoGenPanel.module.scss
src/hooks/useAutoGenPolling.js
src/services/autogen.simulator.js
```

---

## 7. Changes to Existing Files

### `ContentItemForm.jsx`
- Add `"autogen"` to the content type toggle buttons (icon: `AutoAwesomeIcon` from MUI).
- No extra local state needed for autogen — the panel handles its own crop state.
- On autogen type selected → render `<AutoGenPanel pageImageUrl={pageImageUrl}>` as an overlay.
- On panel confirm: receive `{ base64, jobId }` → call parent `onAdd` immediately with the full content item. Panel closes.

### `AutoGenPanel.jsx`
- Receives `pageImageUrl`, `initialCrop` (for re-open/regenerate), `onConfirm(base64, jobId)`, `onClose`.
- Renders the page image with a transparent `<canvas>` overlay for drawing the crop rectangle (mousedown/mousemove/mouseup).
- Shows a small preview of the cropped area below the page.
- **Generate** button: calls `canvas.toDataURL("image/png")` → `simulateSubmitAutoGen({ image })` → fires `onConfirm`.
- Crop rectangle is initialised from `initialCrop` when editing an existing item.

### `ContentItemList.jsx`
- Add a rendering branch for `type === "autogen"`:
  - Shows a small `<img>` thumbnail from `contentValue` (the base64 crop)
  - Status badge: `Completed` (green) / `Processing` (orange, pulsing) / `Failed` (red)
  - Play button: enabled only when `objectId` exists (behaves like Object play).
  - Edit button: re-opens `AutoGenPanel` with the existing crop pre-drawn.
  - Retry button: visible only on `"failed"` — re-fires submit with same image, resets status to `"pending"`.

### `useAutoGenPolling.js`
- Accepts the `contents` array and an `onUpdate(index, patch)` callback.
- Filters items where `type === "autogen"` and `status === "pending" || "processing"`.
- Polls each item via `simulatePollAutoGen(jobId)` every 5 s.
- On completed (response has `objectId`): calls `onUpdate(index, { status: "completed", objectId })`.
- On `"failed"`: calls `onUpdate(index, { status: "failed", errorMessage })`.
- Clears the interval when no pending items remain.
- Mounted inside `VirtualBlockContentModal` — polling is tied to modal lifetime.

### `VirtualBlockContentModal.jsx`
- Accept new `pageImageUrl` prop and pass it down to `ContentItemForm` → `AutoGenPanel`.
- Mount `useAutoGenPolling(contents, handleUpdateContent)`.

### `VirtualBlock.jsx`
- Pass `pageImageUrl` (current page image URL) into the `openModal` call props.

### `virtual-blocks.js` / `formatVirtualBlocksForSubmission`
- No special serialisation needed — `contentValue` is a plain string.
- Sibling fields (`jobId`, `status`, `generatedObjectId`, `errorMessage`) must be included in the serialised content item so they survive a save/reload cycle.

---

## 8. API Contract (Future)

When the backend is ready, replace the two simulator functions with these `axios` calls:

**Submit**
```
POST /api/autogen/blocks
Body: { image: "<base64 data URL>", pageId, iconLocation, contentType }
Response: { jobId: "gen_abc123" }
```

**Poll**
```
GET /api/autogen/blocks/:jobId
Response (processing): { jobId, status: "processing" }
Response (completed):  { objectId: "507f..." }
Response (failed):     { jobId, status: "failed", errorMessage: "..." }
```

The completed response returns only `objectId` — presence of this field (absence of `status`) signals completion.

---

## 9. Notes

All design questions have been resolved (see §4). No open questions remain before implementation.

---

## 10. Implementation Phases

| Phase | Scope | Deliverable |
|---|---|---|
| 1 | Simulator + data model | `autogen.simulator.js`, type shape documented |
| 2 | `AutoGenPanel` component | Full-screen overlay with page image + canvas crop, wired to simulator |
| 3 | `ContentItemForm` + modal integration | AutoGen toggle, pass `pageImageUrl` through prop chain, store result |
| 4 | `ContentItemList` rendering | Thumbnail, status badge, edit/retry/play buttons |
| 5 | Serialisation | Include sibling fields (`jobId`, `status`, etc.) in `formatVirtualBlocksForSubmission` |
| 6 | Swap simulator for real API | Replace `simulateAutoGenRequest` with actual endpoint call |

Phases 1–5 can be completed independently of the backend.
