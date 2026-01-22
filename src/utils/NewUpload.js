import { toast } from "react-toastify";
import axios from "../axios";

/**
 * MIME type to file extension mapping
 * Comprehensive list of supported file types
 */
const MIME_TYPE_MAP = {
  // Images
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
  "image/webp": "webp",
  "image/svg+xml": "svg",
  "image/bmp": "bmp",
  "image/tiff": "tiff",
  // Audio
  "audio/webm": "webm",
  "audio/mpeg": "mp3",
  "audio/wav": "wav",
  "audio/ogg": "ogg",
  "audio/mp4": "m4a",
  "audio/aac": "aac",
  // Video
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/ogg": "ogv",
  "video/quicktime": "mov",
  "video/x-msvideo": "avi",
  // Documents
  "application/pdf": "pdf",
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "docx",
  "application/vnd.ms-excel": "xls",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
  "application/vnd.ms-powerpoint": "ppt",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation":
    "pptx",
  "text/plain": "txt",
  "text/html": "html",
  "text/css": "css",
  "application/json": "json",
  // Archives
  "application/zip": "zip",
  "application/x-rar-compressed": "rar",
  "application/x-7z-compressed": "7z",
  "application/x-tar": "tar",
  "application/gzip": "gz",
};

/**
 * Creates an AbortSignal that will abort after a specified timeout
 * @param {number} timeoutMs - Timeout in milliseconds
 * @returns {AbortSignal} Abort signal that triggers after timeout
 * @example
 * const signal = newAbortSignal(5000); // Abort after 5 seconds
 */
function newAbortSignal(timeoutMs) {
  const abortController = new AbortController();
  setTimeout(() => abortController.abort(), timeoutMs || 0);
  return abortController.signal;
}

/**
 * Get file extension from MIME type
 * @param {string} mimeType - MIME type (e.g., "image/png" or "audio/webm;codecs=opus")
 * @returns {string} File extension without dot (e.g., "png", "webm")
 * @example
 * getExtensionFromMimeType("image/jpeg") // Returns "jpg"
 * getExtensionFromMimeType("audio/webm;codecs=opus") // Returns "webm"
 */
const getExtensionFromMimeType = (mimeType) => {
  const cleanType = mimeType.split(";")[0].trim();
  return MIME_TYPE_MAP[cleanType] || "bin";
};

/**
 * Get MIME type from file extension
 * @param {string} extension - File extension (with or without dot)
 * @returns {string|undefined} MIME type or undefined if not found
 * @example
 * getMimeTypeFromExtension("jpg") // Returns "image/jpeg"
 * getMimeTypeFromExtension(".png") // Returns "image/png"
 */
const getMimeTypeFromExtension = (extension) => {
  const ext = extension.toLowerCase().replace(".", "");
  return Object.keys(MIME_TYPE_MAP).find((key) => MIME_TYPE_MAP[key] === ext);
};

/**
 * Convert base64 data URL to Blob
 * @param {string} base64Data - Base64 data URL (e.g., "data:image/png;base64,...")
 * @returns {Promise<Blob>} Blob representation of the base64 data
 * @throws {Error} If base64Data is invalid or fetch fails
 * @example
 * const blob = await base64ToBlob("data:image/png;base64,iVBORw0KGg...");
 */
const base64ToBlob = async (base64Data) => {
  try {
    const response = await fetch(base64Data);
    if (!response.ok) {
      throw new Error("Failed to convert base64 to blob");
    }
    return await response.blob();
  } catch (error) {
    console.error("base64ToBlob error:", error);
    throw new Error(`Failed to convert base64 to blob: ${error.message}`);
  }
};

/**
 * Convert Blob to File with proper naming and type detection
 * @param {Blob} blob - The blob to convert
 * @param {string} [customName] - Optional custom filename (without extension)
 * @returns {File} File object with proper name and type
 * @example
 * const file = blobToFile(blob); // Creates "upload_1698765432123.png"
 * const file = blobToFile(blob, "avatar"); // Creates "avatar.png"
 */
const blobToFile = (blob, customName = null) => {
  const extension = getExtensionFromMimeType(blob.type);
  const timestamp = Date.now();
  const fileName = customName
    ? `${customName}.${extension}`
    : `upload_${timestamp}.${extension}`;

  return new File([blob], fileName, { type: blob.type });
};

/**
 * Base file upload function with comprehensive error handling and configuration
 * @param {File} file - The file to upload
 * @param {Object} [options={}] - Upload configuration options
 * @param {number} [options.timeout=10000] - Request timeout in milliseconds
 * @param {AbortSignal} [options.signal] - Custom abort signal for cancellation
 * @param {Function} [options.onProgress] - Progress callback (receives percentage)
 * @param {boolean} [options.showToast=true] - Whether to show error toast notifications
 * @returns {Promise<Object>} Upload response data from the server
 * @throws {Error} If upload fails or times out
 * @example
 * // Basic upload
 * const result = await uploadFile(file);
 *
 * // Upload with progress tracking
 * const result = await uploadFile(file, {
 *   onProgress: (percent) => console.log(`${percent}% uploaded`),
 *   timeout: 30000
 * });
 *
 * // Upload with custom abort signal
 * const controller = new AbortController();
 * const result = await uploadFile(file, { signal: controller.signal });
 * // Later: controller.abort()
 */
const uploadFile = async (file, options = {}) => {
  const {
    timeout = 10000,
    signal = null,
    onProgress = null,
    showToast = true,
  } = options;

  const data = new FormData();
  data.append("file", file);

  try {
    const config = {
      timeout,
      signal: signal || newAbortSignal(timeout),
    };

    // Add progress tracking if callback provided
    if (onProgress && typeof onProgress === "function") {
      config.onUploadProgress = (progressEvent) => {
        if (progressEvent.total) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        }
      };
    }

    const res = await axios.post("/upload", data, config);
    return res.data;
  } catch (error) {
    console.error("Upload error:", error);

    const errorMessage =
      error?.response?.data?.message ||
      error?.message ||
      "Upload failed. Please try again.";

    if (showToast) {
      toast.error(errorMessage);
    }

    throw error;
  }
};

/**
 * Upload a File object with optional configuration
 * This is the primary function for uploading file objects from input elements
 * @param {File} file - The file to upload
 * @param {Object} [options={}] - Upload options (see uploadFile for details)
 * @returns {Promise<Object>} Upload response data
 * @throws {Error} If file is invalid or upload fails
 * @example
 * // From file input
 * const fileInput = document.querySelector('input[type="file"]');
 * const result = await upload(fileInput.files[0]);
 *
 * // With options
 * const result = await upload(file, {
 *   timeout: 30000,
 *   onProgress: (percent) => updateProgressBar(percent)
 * });
 */
const upload = async (file, options = {}) => {
  if (!(file instanceof File)) {
    throw new Error("Invalid file object. Expected File instance.");
  }
  return uploadFile(file, options);
};

/**
 * Upload from base64 data URL (e.g., from canvas, data URI)
 * Automatically converts base64 to blob, then to file before uploading
 * @param {string} base64Data - Base64 data URL (must start with "data:")
 * @param {Object} [options={}] - Upload options
 * @param {string} [options.fileName] - Custom filename (without extension)
 * @returns {Promise<Object>} Upload response data
 * @throws {Error} If base64 data is invalid or upload fails
 * @example
 * // From canvas
 * const canvas = document.querySelector('canvas');
 * const base64 = canvas.toDataURL('image/png');
 * const result = await uploadBase64(base64);
 *
 * // With custom filename
 * const result = await uploadBase64(base64, {
 *   fileName: "screenshot",
 *   timeout: 15000
 * });
 */
const uploadBase64 = async (base64Data, options = {}) => {
  console.log("uploadBase64");
  if (!base64Data || typeof base64Data !== "string") {
    throw new Error("Invalid base64 data. Expected string.");
  }

  if (!base64Data.startsWith("data:")) {
    throw new Error(
      'Invalid base64 format. Expected data URL starting with "data:"'
    );
  }

  const { fileName, ...uploadOptions } = options;

  try {
    const blob = await base64ToBlob(base64Data);
    const file = blobToFile(blob, fileName);
    console.log("file= ", file);

    return uploadFile(file, uploadOptions);
  } catch (error) {
    console.error("uploadBase64 error:", error);
    throw new Error(`Failed to upload base64 data: ${error.message}`);
  }
};

/**
 * Upload a Blob object with proper file naming
 * Useful for uploading programmatically created blobs (e.g., from media recorder)
 * @param {Blob} blob - The blob to upload
 * @param {string} [customName] - Optional custom filename (without extension)
 * @param {Object} [options={}] - Upload options
 * @returns {Promise<Object>} Upload response data
 * @throws {Error} If blob is invalid or upload fails
 * @example
 * // From media recorder
 * mediaRecorder.ondataavailable = async (e) => {
 *   const result = await uploadBlob(e.data, "recording");
 * };
 *
 * // From fetch response
 * const response = await fetch(imageUrl);
 * const blob = await response.blob();
 * const result = await uploadBlob(blob, "downloaded_image");
 */
const uploadBlob = async (blob, customName = null, options = {}) => {
  if (!(blob instanceof Blob)) {
    throw new Error("Invalid blob object. Expected Blob instance.");
  }

  try {
    const file = blobToFile(blob, customName);
    return uploadFile(file, options);
  } catch (error) {
    console.error("uploadBlob error:", error);
    throw new Error(`Failed to upload blob: ${error.message}`);
  }
};

/**
 * Ensure file has proper extension based on its MIME type
 * Useful when dealing with files that might have missing or wrong extensions
 * @param {File} file - Original file
 * @returns {File} File with corrected extension
 * @example
 * // File with no extension
 * const file = new File(['data'], 'myfile', { type: 'image/png' });
 * const corrected = ensureFileExtension(file);
 * console.log(corrected.name); // "myfile.png"
 *
 * // File with wrong extension
 * const file = new File(['data'], 'image.txt', { type: 'image/png' });
 * const corrected = ensureFileExtension(file);
 * console.log(corrected.name); // "image.png"
 */
const ensureFileExtension = (file) => {
  if (!(file instanceof File)) {
    throw new Error("Invalid file object. Expected File instance.");
  }

  const fileName = file.name;
  const hasExtension = fileName.includes(".");
  const currentExtension = hasExtension
    ? fileName.split(".").pop().toLowerCase()
    : "";
  const expectedExtension = getExtensionFromMimeType(file.type);

  // Check if file already has correct extension
  if (currentExtension === expectedExtension) {
    return file;
  }

  // File has no extension or wrong extension
  const baseName = hasExtension
    ? fileName.substring(0, fileName.lastIndexOf("."))
    : fileName;

  const newFileName = `${baseName}.${expectedExtension}`;

  console.log(
    `File extension corrected: "${fileName}" → "${newFileName}"`
  );

  return new File([file], newFileName, { type: file.type });
};

/**
 * Upload with guaranteed file extension
 * Automatically corrects missing or wrong file extensions before uploading
 * @param {File} file - File to upload
 * @param {Object} [options={}] - Upload options
 * @returns {Promise<Object>} Upload response
 * @throws {Error} If file is invalid or upload fails
 * @example
 * // Automatically ensures file has correct extension
 * const file = new File(['data'], 'document', { type: 'application/pdf' });
 * const result = await uploadWithExtension(file);
 * // File will be uploaded as "document.pdf"
 *
 * // With options
 * const result = await uploadWithExtension(file, {
 *   onProgress: (p) => console.log(`${p}%`),
 *   timeout: 30000
 * });
 */
const uploadWithExtension = async (file, options = {}) => {
  const correctedFile = ensureFileExtension(file);
  return upload(correctedFile, options);
};

// Export all functions
export {
  // Main upload functions
  upload,
  uploadBase64,
  uploadBlob,
  uploadFile,
  uploadWithExtension,
  // Utility functions
  base64ToBlob,
  blobToFile,
  ensureFileExtension,
  getExtensionFromMimeType,
  getMimeTypeFromExtension,
  newAbortSignal,
  // Constants
  MIME_TYPE_MAP,
};
