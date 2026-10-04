# Plan: Cloudinary Upload Service (Axios, Unsigned Upload)

**Date**: 2026-08-04
**Status**: Planning
**Approach**: Unsigned upload preset (direct browser → Cloudinary, via axios)

---

## Goal

Add a standalone service, `src/services/cloudinary.js`, that uploads files (images, video, audio, raw/pdf) directly from the browser to Cloudinary using axios, and returns the resulting asset info (secure URL, public ID, etc.).

This is additive — it does **not** replace the existing `/upload` backend endpoint used in `src/utils/upload.js`. Callers choose Cloudinary explicitly when they want to upload straight to Cloudinary instead of the app's own backend.

---

## Why Unsigned Upload

- No backend changes required — everything happens client-side with axios.
- Cloudinary supports **unsigned uploads** via an "unsigned upload preset" configured in the Cloudinary dashboard (Settings → Upload → Upload presets → set "Signing Mode" to "Unsigned").
- The preset can restrict allowed formats, max file size, and target folder server-side, so it's reasonably safe to expose the cloud name + preset name in frontend code (these are not secrets — the API secret never leaves the dashboard).
- Trade-off vs. signed uploads: less fine-grained runtime control (e.g., can't set a dynamic folder per-request unless the preset allows overriding it, can't require auth at upload time). Acceptable for this app's use case.

---

## Required Configuration (needs input from you)

Add to `.env` (and `.env.example` if we create one):

```
REACT_APP_CLOUDINARY_CLOUD_NAME=<your-cloud-name>
REACT_APP_CLOUDINARY_UPLOAD_PRESET=<your-unsigned-preset-name>
```

Notes:
- A Cloudinary account already appears to be in use in this repo (placeholder image references `res.cloudinary.com/dd9turntq/...` in `usePageNavigation.js`), so `dd9turntq` may already be the right cloud name — please confirm.
- You'll need to create (or confirm you already have) an **unsigned upload preset** in that Cloudinary account's dashboard.
- Optionally set an upload folder default on the preset itself (e.g. `question-bank/`) rather than passing it per-request, to keep the unsigned request minimal.

---

## API Design

### File: `src/services/cloudinary.js`

```javascript
import axios from "axios";

const CLOUD_NAME = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;

// Cloudinary's generic "auto" endpoint accepts image/video/raw and
// picks the right resource_type automatically.
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`;

// Separate plain axios instance (NOT src/axios.js) — must NOT carry
// this app's baseURL/auth headers, since requests go to Cloudinary, not our API.
const cloudinaryClient = axios.create();

/**
 * Uploads a File/Blob directly to Cloudinary.
 * @param {File|Blob} file
 * @param {Object} [options]
 * @param {string} [options.folder] - overrides preset folder, if preset allows it
 * @param {(percent: number) => void} [options.onProgress]
 * @param {AbortSignal} [options.signal]
 * @returns {Promise<{url: string, publicId: string, resourceType: string, format: string, bytes: number, raw: object}>}
 */
export const uploadToCloudinary = async (file, options = {}) => {
  const { folder, onProgress, signal } = options;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);
  if (folder) formData.append("folder", folder);

  const res = await cloudinaryClient.post(CLOUDINARY_UPLOAD_URL, formData, {
    signal,
    onUploadProgress: (event) => {
      if (onProgress && event.total) {
        onProgress(Math.round((event.loaded * 100) / event.total));
      }
    },
  });

  const data = res.data;
  return {
    url: data.secure_url,
    publicId: data.public_id,
    resourceType: data.resource_type,
    format: data.format,
    bytes: data.bytes,
    raw: data,
  };
};

/**
 * Convenience wrapper for base64 data URLs (mirrors uploadBase64 in utils/upload.js).
 */
export const uploadBase64ToCloudinary = async (base64Data, options = {}) => {
  const res = await fetch(base64Data);
  const blob = await res.blob();
  return uploadToCloudinary(blob, options);
};
```

### Why a separate axios instance

`src/axios.js` sets a `baseURL` pointing at this app's backend. Reusing it (or the default axios import) risks accidentally prefixing the Cloudinary URL or picking up interceptors meant for our own API (e.g., the global error toast interceptor). A fresh `axios.create()` keeps Cloudinary calls fully isolated.

### Why config validation matters

If `CLOUD_NAME` or `UPLOAD_PRESET` is missing, throw a clear error early (in a small guard at the top of `uploadToCloudinary`) rather than letting Cloudinary return a cryptic 400 — makes misconfiguration obvious during development.

---

## Error Handling

- Follow the existing pattern in `src/utils/upload.js` (toast on failure) **only if callers want it** — but since this is a lower-level service (not tied to a specific UI flow), prefer to let errors propagate and have callers decide whether to toast, retry, etc. This matches the separation of concerns: `services/` = data access, calling components/hooks = UX handling.
- No artificial timeout (per prior fix in `docs/2026-08-01/UPLOAD_TIMEOUT_FIX_PLAN.md` — timeouts caused real bugs for large files). Cloudinary uploads can be large (video), so no client-side timeout will be set.

---

## Usage Example

```javascript
import { uploadToCloudinary } from "../services/cloudinary";

const handleFileChange = async (file) => {
  try {
    const { url } = await uploadToCloudinary(file, {
      onProgress: (pct) => setProgress(pct),
    });
    setImageUrl(url);
  } catch (error) {
    toast.error(error?.message || "Upload failed");
  }
};
```

---

## Implementation Steps

1. Add `REACT_APP_CLOUDINARY_CLOUD_NAME` and `REACT_APP_CLOUDINARY_UPLOAD_PRESET` to `.env` (values from you).
2. Create `src/services/cloudinary.js` with `uploadToCloudinary` and `uploadBase64ToCloudinary`.
3. Add a config guard that throws a readable error if env vars are missing.
4. (Optional, only if requested) Wire it into one existing upload flow (e.g. `DrawnUI` image/video fields) as a proof of concept — otherwise leave it as a standalone, ready-to-use service.

---

## Testing Checklist

- [ ] Upload a small image, confirm `secure_url` returned and file appears in Cloudinary Media Library.
- [ ] Upload a video, confirm `resource_type: "video"` and no timeout/failure.
- [ ] Upload with missing env vars, confirm a clear thrown error (not a raw Cloudinary 400).
- [ ] `onProgress` callback fires with increasing percentages during a large upload.
- [ ] Confirm no interference with existing `/upload` backend flow in `src/utils/upload.js`.

---

## Open Questions (need your input before implementation)

1. **Cloud name**: confirm whether `dd9turntq` (seen in `usePageNavigation.js`) is the correct Cloudinary account, or provide the right one.
2. **Upload preset**: do you already have an unsigned preset, or should the plan include dashboard steps to create one?
3. **Folder structure**: should uploads go into a specific Cloudinary folder (e.g. `question-bank/`)? Fixed on the preset, or dynamic per upload?
4. **Scope**: standalone service only, or also wire it into a specific existing upload UI (e.g. `DrawnUI` file fields, Studio OCR area capture)?

---

**Next step**: once you confirm cloud name/preset (or say "just use placeholders, I'll fill them in"), I'll implement `src/services/cloudinary.js` per this plan.
