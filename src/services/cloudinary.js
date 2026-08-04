import axios from "axios";

const CLOUD_NAME = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;

const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`;

// Separate instance from src/axios.js: requests go to Cloudinary, not our
// backend, so this must not carry our app's baseURL or interceptors.
const cloudinaryClient = axios.create();

function assertConfigured() {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error(
      "Cloudinary is not configured: set REACT_APP_CLOUDINARY_CLOUD_NAME and REACT_APP_CLOUDINARY_UPLOAD_PRESET in .env"
    );
  }
}

/**
 * Uploads a File/Blob directly to Cloudinary using an unsigned upload preset.
 * @param {File|Blob} file
 * @param {Object} [options]
 * @param {string} [options.folder] - overrides preset folder, if the preset allows it
 * @param {(percent: number) => void} [options.onProgress]
 * @param {AbortSignal} [options.signal]
 * @returns {Promise<{url: string, publicId: string, resourceType: string, format: string, bytes: number, raw: object}>}
 */
export const uploadToCloudinary = async (file, options = {}) => {
  assertConfigured();
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
 * @param {string} base64Data
 * @param {Object} [options] - see uploadToCloudinary
 */
export const uploadBase64ToCloudinary = async (base64Data, options = {}) => {
  const res = await fetch(base64Data);
  const blob = await res.blob();
  return uploadToCloudinary(blob, options);
};
