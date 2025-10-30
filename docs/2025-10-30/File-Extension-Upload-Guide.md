# File Extension Upload Guide

**Date:** 2025-10-30
**Issue:** Uploaded files return blob URLs or URLs without extensions, preventing direct browser viewing

## Problem Overview

When files are uploaded, the server may return URLs like:
- `https://cdn.example.com/uploads/abc123` (no extension)
- `blob:http://localhost:3000/abc-123-def` (blob URL)

**Desired outcome:**
- `https://cdn.example.com/uploads/abc123.png` (with extension)
- Files should be directly viewable in a new browser tab

## Root Causes

### 1. Missing File Extension in FormData
When uploading via FormData, the file might not have a proper name with extension.

### 2. Server Not Preserving Filenames
The backend might generate random filenames without preserving the original extension.

### 3. Blob URLs (Client-Side Only)
`URL.createObjectURL(blob)` creates temporary blob URLs that only work in the same browser session.

## Solutions

### Solution 1: Ensure Proper Filename in Upload (Client-Side)

The `NewUpload.js` module already handles this correctly by:

1. **For File objects** - Preserves the original filename
2. **For Blobs** - Generates filename with proper extension based on MIME type
3. **For Base64** - Converts to File with extension before uploading

#### How It Works

```javascript
// In blobToFile function (NewUpload.js)
const blobToFile = (blob, customName = null) => {
  const extension = getExtensionFromMimeType(blob.type);
  const timestamp = Date.now();
  const fileName = customName
    ? `${customName}.${extension}`
    : `upload_${timestamp}.${extension}`;

  return new File([blob], fileName, { type: blob.type });
};
```

**Key Point:** Every blob/base64 is converted to a File object with a proper filename that includes the extension.

### Solution 2: Verify Server Configuration

Your backend needs to preserve file extensions. Check your upload endpoint configuration:

#### Backend Checklist

- [ ] Server extracts original filename from FormData
- [ ] Server preserves file extension when saving
- [ ] Server returns full URL with extension in response
- [ ] Uploaded files are stored with extensions
- [ ] Content-Type headers are set correctly for downloads

#### Example Server Response (Expected)

```json
{
  "url": "https://cdn.example.com/uploads/image_1698765432.png",
  "filename": "image_1698765432.png",
  "originalName": "my-photo.png",
  "mimeType": "image/png",
  "size": 245678
}
```

### Solution 3: Debugging Upload Requests

To verify that files are being uploaded with proper extensions:

#### Debug Steps

1. **Check FormData Contents**

```javascript
import { upload } from '@/utils/NewUpload';

const debugUpload = async (file) => {
  // Log file details before upload
  console.log('File name:', file.name);
  console.log('File type:', file.type);
  console.log('File size:', file.size);
  console.log('Has extension:', file.name.includes('.'));

  // Upload and check response
  const result = await upload(file);
  console.log('Server response:', result);
  console.log('Returned URL:', result.url);
  console.log('URL has extension:', /\.\w+$/.test(result.url));

  return result;
};
```

2. **Inspect Network Request**

Open DevTools → Network tab → Find the upload request → Check:
- Request payload (FormData should show filename with extension)
- Response body (should contain URL with extension)

3. **Test with Different File Types**

```javascript
// Test image upload
const imageInput = document.querySelector('#image-input');
imageInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  console.log('Uploading image:', file.name, file.type);
  const result = await debugUpload(file);
});

// Test base64 upload
const canvas = document.querySelector('canvas');
const base64 = canvas.toDataURL('image/png');
console.log('Base64 starts with:', base64.substring(0, 50));

const result = await uploadBase64(base64, { fileName: 'canvas_drawing' });
console.log('Upload result:', result);
```

### Solution 4: Enhanced Upload Functions

If you need to enforce file extensions, here's an enhanced version:

#### Add to NewUpload.js

```javascript
/**
 * Ensure file has proper extension based on its MIME type
 * Useful when dealing with files that might have missing or wrong extensions
 * @param {File} file - Original file
 * @returns {File} File with corrected extension
 */
export const ensureFileExtension = (file) => {
  const currentExtension = file.name.split('.').pop();
  const expectedExtension = getExtensionFromMimeType(file.type);

  // Check if file already has correct extension
  if (currentExtension.toLowerCase() === expectedExtension.toLowerCase()) {
    return file;
  }

  // File has no extension or wrong extension
  const baseName = file.name.includes('.')
    ? file.name.substring(0, file.name.lastIndexOf('.'))
    : file.name;

  const newFileName = `${baseName}.${expectedExtension}`;

  return new File([file], newFileName, { type: file.type });
};

/**
 * Upload with guaranteed file extension
 * @param {File} file - File to upload
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} Upload response
 */
export const uploadWithExtension = async (file, options = {}) => {
  const correctedFile = ensureFileExtension(file);

  console.log('Original filename:', file.name);
  console.log('Corrected filename:', correctedFile.name);

  return upload(correctedFile, options);
};
```

#### Usage

```javascript
import { uploadWithExtension } from '@/utils/NewUpload';

// Automatically ensures file has correct extension
const result = await uploadWithExtension(file);
```

### Solution 5: Server-Side Filename Preservation

If you control the backend, ensure it preserves filenames with extensions.

#### Express.js Example (Node.js)

```javascript
// Using multer for file uploads
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    // Preserve original extension
    const ext = path.extname(file.originalname);
    const nameWithoutExt = path.basename(file.originalname, ext);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);

    // Final filename: originalname-timestamp.ext
    cb(null, `${nameWithoutExt}-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({ storage });

app.post('/api/upload', upload.single('file'), (req, res) => {
  const fileUrl = `${process.env.CDN_URL}/${req.file.filename}`;

  res.json({
    url: fileUrl, // This will include the extension
    filename: req.file.filename,
    originalName: req.file.originalname,
    mimeType: req.file.mimetype,
    size: req.file.size
  });
});
```

#### Python/Flask Example

```python
from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
import os
from datetime import datetime

UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'pdf', 'mp3', 'mp4'}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/api/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400

    file = request.files['file']

    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    if file and allowed_file(file.filename):
        # Preserve extension
        filename = secure_filename(file.filename)
        name, ext = os.path.splitext(filename)
        timestamp = int(datetime.now().timestamp())

        # Generate unique filename with extension
        unique_filename = f"{name}_{timestamp}{ext}"
        filepath = os.path.join(UPLOAD_FOLDER, unique_filename)

        file.save(filepath)

        file_url = f"{os.getenv('CDN_URL')}/{unique_filename}"

        return jsonify({
            'url': file_url,  # Includes extension
            'filename': unique_filename,
            'originalName': file.filename,
            'mimeType': file.content_type,
            'size': os.path.getsize(filepath)
        })

    return jsonify({'error': 'File type not allowed'}), 400
```

## Testing and Verification

### Test Checklist

- [ ] **File Input Upload**
  ```javascript
  const file = new File(['test'], 'test.txt', { type: 'text/plain' });
  const result = await upload(file);
  console.assert(result.url.endsWith('.txt'), 'URL should end with .txt');
  ```

- [ ] **Base64 Upload**
  ```javascript
  const canvas = document.createElement('canvas');
  const base64 = canvas.toDataURL('image/png');
  const result = await uploadBase64(base64, { fileName: 'test' });
  console.assert(result.url.endsWith('.png'), 'URL should end with .png');
  ```

- [ ] **Blob Upload**
  ```javascript
  const blob = new Blob(['audio data'], { type: 'audio/webm' });
  const result = await uploadBlob(blob, 'recording');
  console.assert(result.url.endsWith('.webm'), 'URL should end with .webm');
  ```

- [ ] **Direct Browser Access**
  ```javascript
  const result = await upload(file);
  // Try opening in new tab
  window.open(result.url, '_blank');
  // Should display the file, not download
  ```

### Automated Test Script

```javascript
import { upload, uploadBase64, uploadBlob } from '@/utils/NewUpload';

const testUploadExtensions = async () => {
  const results = [];

  // Test 1: Image file
  const imageFile = new File(['fake image'], 'test.png', { type: 'image/png' });
  try {
    const result = await upload(imageFile);
    results.push({
      test: 'Image file upload',
      filename: imageFile.name,
      url: result.url,
      hasExtension: /\.png$/i.test(result.url),
      canOpenInBrowser: true // Test manually
    });
  } catch (error) {
    results.push({ test: 'Image file upload', error: error.message });
  }

  // Test 2: Base64 image
  const canvas = document.createElement('canvas');
  const base64 = canvas.toDataURL('image/jpeg');
  try {
    const result = await uploadBase64(base64, { fileName: 'canvas_test' });
    results.push({
      test: 'Base64 image upload',
      url: result.url,
      hasExtension: /\.jpe?g$/i.test(result.url),
      canOpenInBrowser: true
    });
  } catch (error) {
    results.push({ test: 'Base64 image upload', error: error.message });
  }

  // Test 3: Audio blob
  const audioBlob = new Blob(['audio'], { type: 'audio/webm' });
  try {
    const result = await uploadBlob(audioBlob, 'audio_test');
    results.push({
      test: 'Audio blob upload',
      url: result.url,
      hasExtension: /\.webm$/i.test(result.url),
      canOpenInBrowser: true
    });
  } catch (error) {
    results.push({ test: 'Audio blob upload', error: error.message });
  }

  console.table(results);

  // Check if all tests passed
  const allPassed = results.every(r => !r.error && r.hasExtension);
  if (allPassed) {
    console.log('✅ All upload extension tests passed!');
  } else {
    console.warn('⚠️ Some tests failed. Check server configuration.');
  }

  return results;
};

// Run tests
testUploadExtensions();
```

## Common Issues and Fixes

### Issue 1: URL has no extension

**Symptom:** `https://cdn.example.com/abc123`

**Cause:** Server not preserving filename extension

**Fix:** Update server code to preserve/generate filenames with extensions (see Solution 5)

### Issue 2: Blob URL instead of HTTP URL

**Symptom:** `blob:http://localhost:3000/abc-123`

**Cause:** Using `URL.createObjectURL()` instead of uploading to server

**Fix:**
```javascript
// Wrong - creates blob URL
const blobUrl = URL.createObjectURL(blob);

// Right - uploads to server
const result = await uploadBlob(blob, 'filename');
const serverUrl = result.url; // Real HTTP URL
```

### Issue 3: Wrong extension

**Symptom:** File is PNG but URL ends with `.bin` or `.jpg`

**Cause:** MIME type not properly detected or mapped

**Fix:**
```javascript
import { ensureFileExtension } from '@/utils/NewUpload';

// Correct the file extension before upload
const correctedFile = ensureFileExtension(file);
const result = await upload(correctedFile);
```

### Issue 4: File downloads instead of displaying in browser

**Symptom:** Clicking URL downloads file instead of showing it

**Cause:** Server sending `Content-Disposition: attachment` header

**Fix (Server-Side):**
```javascript
// Express.js example
app.get('/uploads/:filename', (req, res) => {
  const filePath = path.join(__dirname, 'uploads', req.params.filename);

  // Set Content-Type based on file extension
  const ext = path.extname(req.params.filename).toLowerCase();
  const mimeTypes = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.pdf': 'application/pdf',
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
  };

  const contentType = mimeTypes[ext] || 'application/octet-stream';

  // Send as inline (view in browser) instead of attachment (download)
  res.setHeader('Content-Type', contentType);
  res.setHeader('Content-Disposition', 'inline'); // ← Important

  res.sendFile(filePath);
});
```

## Best Practices

### 1. Always Specify Filename for Blobs

```javascript
// Good - explicit filename
await uploadBlob(blob, 'user_avatar');
await uploadBase64(base64, { fileName: 'signature' });

// Bad - auto-generated generic name
await uploadBlob(blob); // Creates "upload_123456.webm"
```

### 2. Validate File Extensions

```javascript
const validateFileExtension = (file) => {
  const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'pdf'];
  const extension = file.name.split('.').pop().toLowerCase();

  if (!allowedExtensions.includes(extension)) {
    throw new Error(`File type .${extension} not allowed`);
  }

  return true;
};

// Use before upload
validateFileExtension(file);
const result = await upload(file);
```

### 3. Log Upload Details for Debugging

```javascript
const uploadWithLogging = async (file, options = {}) => {
  console.group('Upload Debug Info');
  console.log('Filename:', file.name);
  console.log('Type:', file.type);
  console.log('Size:', file.size);
  console.log('Has extension:', file.name.includes('.'));

  const result = await upload(file, options);

  console.log('Response URL:', result.url);
  console.log('URL extension:', result.url.split('.').pop());
  console.groupEnd();

  return result;
};
```

### 4. Handle Missing Extensions Gracefully

```javascript
const safeUpload = async (file) => {
  // Check if file has extension
  if (!file.name.includes('.')) {
    console.warn('File has no extension, adding based on MIME type');
    file = ensureFileExtension(file);
  }

  return upload(file);
};
```

## Implementation Checklist

### Client-Side (Frontend)
- [ ] Using `NewUpload.js` functions (preserves filenames)
- [ ] All blobs converted to Files with extensions
- [ ] Base64 uploads include proper filenames
- [ ] Testing uploads return URLs with extensions

### Server-Side (Backend)
- [ ] Upload endpoint preserves original filename
- [ ] Filenames include extensions when saved to disk
- [ ] Response includes full URL with extension
- [ ] Content-Type headers set correctly
- [ ] Content-Disposition set to "inline" for viewable files

### Testing
- [ ] Uploaded files accessible via direct URL
- [ ] URLs end with proper file extensions
- [ ] Files display in browser (not force download)
- [ ] Different file types tested (images, audio, video, PDFs)

## Quick Reference

### Upload Functions That Preserve Extensions

```javascript
import {
  upload,          // File objects → preserves original name
  uploadBase64,    // Base64 → creates file with .ext
  uploadBlob,      // Blob → creates file with .ext
  ensureFileExtension // Corrects missing/wrong extensions
} from '@/utils/NewUpload';
```

### Example: Complete Upload Flow

```javascript
// Step 1: Get file from user
const file = event.target.files[0];

// Step 2: Ensure it has extension
const correctedFile = ensureFileExtension(file);

// Step 3: Upload to server
const result = await upload(correctedFile, {
  onProgress: (p) => console.log(`${p}%`)
});

// Step 4: Verify URL has extension
console.log('Uploaded URL:', result.url);
console.assert(
  /\.\w+$/.test(result.url),
  'URL should have file extension'
);

// Step 5: Open in new tab (should display, not download)
window.open(result.url, '_blank');
```

## Summary

To ensure uploaded files have proper extensions and can be viewed in the browser:

1. **Client-side:** Use `NewUpload.js` functions (already handle extensions correctly)
2. **Server-side:** Preserve filenames with extensions when saving
3. **Response:** Return URLs that include file extensions
4. **Headers:** Set `Content-Disposition: inline` for viewable files
5. **Testing:** Verify URLs end with extensions and open in browser

The `NewUpload.js` module handles all client-side requirements automatically. If URLs still lack extensions, the issue is server-side configuration.
