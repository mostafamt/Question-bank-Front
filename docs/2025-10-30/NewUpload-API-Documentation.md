# NewUpload API Documentation

**File:** `src/utils/NewUpload.js`
**Version:** 1.0.0
**Date:** 2025-10-30

## Overview

The NewUpload module provides a modern, robust, and consistent API for file uploads in the Question Bank application. It improves upon the legacy `upload.js` by offering:

- **Unified error handling** across all upload types
- **Configurable timeouts and abort signals** for all uploads
- **Progress tracking** support
- **Better type safety** with comprehensive JSDoc documentation
- **Clear naming conventions** and function purposes
- **Conversion utilities** for common upload scenarios

## Table of Contents

1. [Core Upload Functions](#core-upload-functions)
2. [Utility Functions](#utility-functions)
3. [Configuration Options](#configuration-options)
4. [Usage Examples](#usage-examples)
5. [Error Handling](#error-handling)
6. [Migration from Old Upload.js](#migration-from-old-uploadjs)
7. [Best Practices](#best-practices)

---

## Core Upload Functions

### `upload(file, options)`

Upload a File object directly. This is the primary function for uploading files from file input elements.

**Parameters:**
- `file` (File) - The file to upload
- `options` (Object, optional) - Upload configuration options

**Returns:** `Promise<Object>` - Upload response data from server

**Throws:** `Error` - If file is invalid or upload fails

**Example:**
```javascript
import { upload } from '@/utils/NewUpload';

// Basic file upload
const handleFileChange = async (event) => {
  const file = event.target.files[0];
  try {
    const result = await upload(file);
    console.log('Upload successful:', result);
  } catch (error) {
    console.error('Upload failed:', error);
  }
};

// With progress tracking
const uploadWithProgress = async (file) => {
  const result = await upload(file, {
    onProgress: (percent) => {
      console.log(`Upload progress: ${percent}%`);
      setUploadProgress(percent);
    },
    timeout: 30000 // 30 seconds
  });
  return result;
};
```

---

### `uploadBase64(base64Data, options)`

Upload from base64 data URL. Automatically converts base64 to blob, then to file before uploading. Ideal for canvas exports, cropped images, or data URIs.

**Parameters:**
- `base64Data` (string) - Base64 data URL (must start with "data:")
- `options` (Object, optional) - Upload configuration options
  - `fileName` (string, optional) - Custom filename without extension

**Returns:** `Promise<Object>` - Upload response data

**Throws:** `Error` - If base64 data is invalid or upload fails

**Example:**
```javascript
import { uploadBase64 } from '@/utils/NewUpload';

// Upload canvas content
const uploadCanvasImage = async () => {
  const canvas = document.querySelector('canvas');
  const base64 = canvas.toDataURL('image/png');

  const result = await uploadBase64(base64, {
    fileName: 'drawing',
    timeout: 15000
  });
  return result;
};

// Upload cropped image from image editor
const uploadCroppedImage = async (croppedDataURL) => {
  const result = await uploadBase64(croppedDataURL, {
    fileName: 'avatar_cropped'
  });
  return result;
};
```

---

### `uploadBlob(blob, customName, options)`

Upload a Blob object with proper file naming. Perfect for media recorder outputs, fetched binary data, or programmatically created blobs.

**Parameters:**
- `blob` (Blob) - The blob to upload
- `customName` (string, optional) - Custom filename without extension
- `options` (Object, optional) - Upload configuration options

**Returns:** `Promise<Object>` - Upload response data

**Throws:** `Error` - If blob is invalid or upload fails

**Example:**
```javascript
import { uploadBlob } from '@/utils/NewUpload';

// Upload audio recording
let mediaRecorder;
const startRecording = (stream) => {
  mediaRecorder = new MediaRecorder(stream);
  const chunks = [];

  mediaRecorder.ondataavailable = (e) => chunks.push(e.data);

  mediaRecorder.onstop = async () => {
    const blob = new Blob(chunks, { type: 'audio/webm' });
    const result = await uploadBlob(blob, 'voice_recording');
    console.log('Recording uploaded:', result);
  };

  mediaRecorder.start();
};

// Upload fetched image
const uploadFromURL = async (imageUrl) => {
  const response = await fetch(imageUrl);
  const blob = await response.blob();
  const result = await uploadBlob(blob, 'downloaded_image');
  return result;
};
```

---

### `uploadFile(file, options)`

Base upload function with comprehensive configuration. Use this for advanced scenarios requiring custom abort signals or specific error handling behavior.

**Parameters:**
- `file` (File) - The file to upload
- `options` (Object, optional) - Full configuration options

**Returns:** `Promise<Object>` - Upload response data

**Throws:** `Error` - If upload fails or times out

**Example:**
```javascript
import { uploadFile } from '@/utils/NewUpload';

// Upload with custom abort controller
const uploadWithCancel = () => {
  const controller = new AbortController();

  const promise = uploadFile(file, {
    signal: controller.signal,
    showToast: false, // Handle errors manually
    onProgress: updateProgressBar
  });

  // Cancel button handler
  cancelButton.onclick = () => controller.abort();

  return promise;
};

// Upload without toast notifications
const silentUpload = async (file) => {
  try {
    const result = await uploadFile(file, {
      showToast: false,
      timeout: 60000
    });
    showCustomSuccessMessage(result);
  } catch (error) {
    showCustomErrorMessage(error);
  }
};
```

---

## Utility Functions

### `base64ToBlob(base64Data)`

Convert base64 data URL to Blob object.

**Parameters:**
- `base64Data` (string) - Base64 data URL

**Returns:** `Promise<Blob>` - Blob representation of base64 data

**Example:**
```javascript
import { base64ToBlob } from '@/utils/NewUpload';

const base64 = canvas.toDataURL('image/png');
const blob = await base64ToBlob(base64);
console.log('Blob size:', blob.size);
```

---

### `blobToFile(blob, customName)`

Convert Blob to File with proper naming and type detection.

**Parameters:**
- `blob` (Blob) - The blob to convert
- `customName` (string, optional) - Custom filename without extension

**Returns:** `File` - File object with proper name and type

**Example:**
```javascript
import { blobToFile } from '@/utils/NewUpload';

const blob = new Blob(['Hello World'], { type: 'text/plain' });
const file = blobToFile(blob, 'message');
console.log(file.name); // "message.txt"
```

---

### `getExtensionFromMimeType(mimeType)`

Get file extension from MIME type.

**Parameters:**
- `mimeType` (string) - MIME type (e.g., "image/png")

**Returns:** `string` - File extension without dot (e.g., "png")

**Example:**
```javascript
import { getExtensionFromMimeType } from '@/utils/NewUpload';

const ext1 = getExtensionFromMimeType('image/jpeg'); // "jpg"
const ext2 = getExtensionFromMimeType('audio/webm;codecs=opus'); // "webm"
const ext3 = getExtensionFromMimeType('application/pdf'); // "pdf"
```

---

### `getMimeTypeFromExtension(extension)`

Get MIME type from file extension.

**Parameters:**
- `extension` (string) - File extension (with or without dot)

**Returns:** `string|undefined` - MIME type or undefined if not found

**Example:**
```javascript
import { getMimeTypeFromExtension } from '@/utils/NewUpload';

const mime1 = getMimeTypeFromExtension('jpg'); // "image/jpeg"
const mime2 = getMimeTypeFromExtension('.png'); // "image/png"
const mime3 = getMimeTypeFromExtension('pdf'); // "application/pdf"
```

---

### `newAbortSignal(timeoutMs)`

Create an AbortSignal that triggers after specified timeout.

**Parameters:**
- `timeoutMs` (number) - Timeout in milliseconds

**Returns:** `AbortSignal` - Abort signal that triggers after timeout

**Example:**
```javascript
import { newAbortSignal } from '@/utils/NewUpload';

const signal = newAbortSignal(5000); // Abort after 5 seconds
fetch(url, { signal });
```

---

## Configuration Options

All main upload functions (`upload`, `uploadBase64`, `uploadBlob`, `uploadFile`) accept an options object:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `timeout` | number | 10000 | Request timeout in milliseconds |
| `signal` | AbortSignal | null | Custom abort signal for cancellation |
| `onProgress` | Function | null | Progress callback, receives percentage (0-100) |
| `showToast` | boolean | true | Whether to show error toast notifications |
| `fileName` | string | null | Custom filename (uploadBase64 only) |

### Progress Callback

The `onProgress` callback receives a number from 0 to 100 representing upload percentage:

```javascript
const result = await upload(file, {
  onProgress: (percent) => {
    progressBar.style.width = `${percent}%`;
    progressText.textContent = `${percent}% uploaded`;
  }
});
```

---

## Usage Examples

### Example 1: Image Upload from File Input

```javascript
import { upload } from '@/utils/NewUpload';

const ImageUploader = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    setProgress(0);

    try {
      const result = await upload(file, {
        onProgress: setProgress,
        timeout: 30000
      });

      console.log('Upload successful:', result);
      toast.success('Image uploaded successfully!');
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input type="file" onChange={handleUpload} disabled={uploading} />
      {uploading && <ProgressBar percent={progress} />}
    </div>
  );
};
```

### Example 2: Canvas Export and Upload

```javascript
import { uploadBase64 } from '@/utils/NewUpload';

const CanvasExporter = () => {
  const canvasRef = useRef(null);

  const exportAndUpload = async () => {
    const canvas = canvasRef.current;
    const base64 = canvas.toDataURL('image/png');

    try {
      const result = await uploadBase64(base64, {
        fileName: 'canvas_export',
        onProgress: (percent) => console.log(`${percent}%`)
      });

      return result.url; // Assuming server returns URL
    } catch (error) {
      console.error('Export failed:', error);
      throw error;
    }
  };

  return (
    <div>
      <canvas ref={canvasRef} width={800} height={600} />
      <button onClick={exportAndUpload}>Export & Upload</button>
    </div>
  );
};
```

### Example 3: Audio Recording Upload

```javascript
import { uploadBlob } from '@/utils/NewUpload';

const AudioRecorder = () => {
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    chunksRef.current = [];

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunksRef.current.push(e.data);
      }
    };

    mediaRecorder.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type: 'audio/webm' });

      try {
        const result = await uploadBlob(blob, `recording_${Date.now()}`, {
          timeout: 60000
        });
        console.log('Recording uploaded:', result);
        toast.success('Recording uploaded successfully!');
      } catch (error) {
        console.error('Upload failed:', error);
      }
    };

    mediaRecorder.start();
    setRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  return (
    <div>
      <button onClick={startRecording} disabled={recording}>
        Start Recording
      </button>
      <button onClick={stopRecording} disabled={!recording}>
        Stop & Upload
      </button>
    </div>
  );
};
```

### Example 4: Cancellable Upload

```javascript
import { uploadFile } from '@/utils/NewUpload';
import { useState, useRef } from 'react';

const CancellableUploader = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const abortControllerRef = useRef(null);

  const startUpload = async (file) => {
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setUploading(true);
    setProgress(0);

    try {
      const result = await uploadFile(file, {
        signal: controller.signal,
        onProgress: setProgress,
        timeout: 60000
      });

      console.log('Upload complete:', result);
      return result;
    } catch (error) {
      if (error.name === 'AbortError') {
        toast.info('Upload cancelled');
      } else {
        console.error('Upload failed:', error);
      }
    } finally {
      setUploading(false);
      abortControllerRef.current = null;
    }
  };

  const cancelUpload = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  return (
    <div>
      <input
        type="file"
        onChange={(e) => startUpload(e.target.files[0])}
        disabled={uploading}
      />
      {uploading && (
        <div>
          <ProgressBar percent={progress} />
          <button onClick={cancelUpload}>Cancel Upload</button>
        </div>
      )}
    </div>
  );
};
```

### Example 5: Batch Upload (Sequential)

```javascript
import { upload } from '@/utils/NewUpload';

const batchUpload = async (files) => {
  const results = [];
  const total = files.length;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    console.log(`Uploading ${i + 1}/${total}: ${file.name}`);

    try {
      const result = await upload(file, {
        onProgress: (percent) => {
          console.log(`File ${i + 1}: ${percent}%`);
        }
      });
      results.push({ success: true, file: file.name, data: result });
    } catch (error) {
      results.push({ success: false, file: file.name, error: error.message });
    }
  }

  return results;
};

// Usage
const handleMultipleFiles = async (event) => {
  const files = Array.from(event.target.files);
  const results = await batchUpload(files);

  const succeeded = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  console.log(`Upload complete: ${succeeded} succeeded, ${failed} failed`);
};
```

---

## Error Handling

### Error Types

1. **Network Errors** - Connection issues, timeouts
2. **Abort Errors** - User cancellation or timeout abort
3. **Validation Errors** - Invalid file, blob, or base64 data
4. **Server Errors** - 4xx/5xx HTTP responses

### Error Handling Patterns

#### Pattern 1: Try-Catch with Toast (Default)

```javascript
try {
  const result = await upload(file);
  // Success handling
} catch (error) {
  // Error is already shown via toast
  // Additional error handling if needed
}
```

#### Pattern 2: Silent Error Handling

```javascript
try {
  const result = await upload(file, { showToast: false });
  showCustomSuccess(result);
} catch (error) {
  showCustomError(error.message);
}
```

#### Pattern 3: Graceful Degradation

```javascript
const uploadWithFallback = async (file) => {
  try {
    return await upload(file, { timeout: 10000 });
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      // Retry with longer timeout
      return await upload(file, { timeout: 30000 });
    }
    throw error;
  }
};
```

---

## Migration from Old Upload.js

### Function Mapping

| Old Function | New Function | Changes |
|-------------|--------------|---------|
| `upload(file)` | `upload(file, options)` | Now accepts optional config object |
| `uploadBase64(base64)` | `uploadBase64(base64, options)` | Added error handling, timeout, progress support |
| `baseUploadBase64(blob)` | `uploadBlob(blob, name, options)` | Renamed for clarity, blob parameter is now correctly named |
| `uploadForStudio(base64)` | `uploadBase64(base64, options)` | No longer needed, use uploadBase64 directly |

### Migration Examples

#### Before (Old upload.js)
```javascript
import { upload, uploadBase64, uploadForStudio } from '@/utils/upload';

// Simple upload
const result = await upload(file);

// Base64 upload
const result = await uploadBase64(base64);

// Studio upload
const result = await uploadForStudio(base64);
```

#### After (New NewUpload.js)
```javascript
import { upload, uploadBase64 } from '@/utils/NewUpload';

// Simple upload (same API)
const result = await upload(file);

// Base64 upload with options
const result = await uploadBase64(base64, {
  fileName: 'custom_name',
  onProgress: (p) => console.log(`${p}%`)
});

// Studio upload (just use uploadBase64)
const result = await uploadBase64(base64);
```

### Migration Checklist

- [ ] Replace import statements from `upload.js` to `NewUpload.js`
- [ ] Update `baseUploadBase64` calls to `uploadBlob`
- [ ] Replace `uploadForStudio` with `uploadBase64`
- [ ] Add progress tracking where needed (optional)
- [ ] Test all upload flows thoroughly
- [ ] Update error handling if using custom toast logic

---

## Best Practices

### 1. Always Handle Errors

```javascript
// Good
try {
  const result = await upload(file);
  handleSuccess(result);
} catch (error) {
  handleError(error);
}

// Bad - unhandled promise rejection
const result = await upload(file);
```

### 2. Use Progress Tracking for Large Files

```javascript
// For files > 1MB, show progress
const uploadLargeFile = async (file) => {
  if (file.size > 1024 * 1024) {
    return upload(file, {
      onProgress: updateProgressBar,
      timeout: 60000 // Longer timeout
    });
  }
  return upload(file);
};
```

### 3. Set Appropriate Timeouts

```javascript
// Small images: default 10s is fine
await upload(imageFile);

// Large videos: increase timeout
await upload(videoFile, { timeout: 120000 }); // 2 minutes

// Audio recordings: moderate timeout
await uploadBlob(audioBlob, 'recording', { timeout: 30000 });
```

### 4. Validate Before Upload

```javascript
const validateAndUpload = async (file) => {
  // Check file size
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('File too large (max 10MB)');
  }

  // Check file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type');
  }

  return upload(file);
};
```

### 5. Use Descriptive Filenames

```javascript
// Good - descriptive names
await uploadBase64(canvas.toDataURL(), {
  fileName: `signature_${userId}_${Date.now()}`
});

await uploadBlob(recordedBlob, `voice_answer_q${questionId}`);

// Bad - generic names
await uploadBase64(base64); // Creates "upload_123456.png"
```

### 6. Implement Cancel for Long Uploads

```javascript
// Always provide cancel option for uploads > 5MB
const uploadWithCancel = (file) => {
  if (file.size > 5 * 1024 * 1024) {
    const controller = new AbortController();

    showCancelButton(() => controller.abort());

    return upload(file, { signal: controller.signal });
  }
  return upload(file);
};
```

### 7. Clean Up Resources

```javascript
// When component unmounts during upload
useEffect(() => {
  const controller = new AbortController();

  uploadFile(file, { signal: controller.signal })
    .then(handleSuccess)
    .catch(handleError);

  // Cleanup: abort on unmount
  return () => controller.abort();
}, [file]);
```

---

## Supported File Types

The module includes comprehensive MIME type mapping for:

### Images
- JPEG/JPG, PNG, GIF, WebP, SVG, BMP, TIFF

### Audio
- WebM, MP3, WAV, OGG, M4A, AAC

### Video
- MP4, WebM, OGV, MOV, AVI

### Documents
- PDF, DOC/DOCX, XLS/XLSX, PPT/PPTX
- TXT, HTML, CSS, JSON

### Archives
- ZIP, RAR, 7Z, TAR, GZIP

---

## API Response Format

All upload functions return the server response. Typical response structure:

```javascript
{
  url: "https://cdn.example.com/uploads/file123.png",
  filename: "file123.png",
  size: 245678,
  mimeType: "image/png"
  // ... other server-specific fields
}
```

---

## TypeScript Support

While the module is written in JavaScript, comprehensive JSDoc comments enable full IntelliSense and type checking in TypeScript projects:

```typescript
import { upload, uploadBase64, type UploadOptions } from '@/utils/NewUpload';

// TypeScript will infer types from JSDoc
const result = await upload(file, {
  onProgress: (percent: number) => {
    // percent is typed as number
  }
});
```

---

## FAQ

**Q: Which function should I use for my use case?**
- File input: `upload(file)`
- Canvas/Data URI: `uploadBase64(base64)`
- Media recorder/Blob: `uploadBlob(blob)`

**Q: How do I cancel an upload?**
```javascript
const controller = new AbortController();
upload(file, { signal: controller.signal });
// Later: controller.abort();
```

**Q: Can I upload multiple files at once?**
Not directly, but you can implement batch upload (see Example 5).

**Q: What's the maximum file size?**
Determined by server configuration and timeout. Adjust timeout for large files.

**Q: How do I handle upload progress?**
```javascript
upload(file, {
  onProgress: (percent) => updateProgressBar(percent)
});
```

**Q: Why use NewUpload instead of old upload.js?**
Better error handling, progress tracking, configurable timeouts, clearer naming, and comprehensive documentation.

---

## Version History

### 1.0.0 (2025-10-30)
- Initial release
- Core upload functions (upload, uploadBase64, uploadBlob)
- Conversion utilities (base64ToBlob, blobToFile)
- Progress tracking support
- Comprehensive error handling
- Extended MIME type mapping

---

## Support

For issues or questions:
1. Check this documentation first
2. Review usage examples
3. Check migration guide if upgrading from old upload.js
4. Report bugs in project issue tracker
