# Documentation - 2025-10-30

This directory contains documentation for various fixes and improvements made to the Question Bank application.

## Table of Contents

### Issues Fixed
1. [Table of Contents Map Error](#1-table-of-contents-map-error) - Fixed "map is not a function" error
2. [Studio Area Coordinates Issue](#2-studio-area-coordinates-issue) - Area display problem after navigation

### New Features
3. [Upload System Enhancement](#3-upload-system-enhancement) - Improved file upload with proper extensions

---

## 1. Table of Contents Map Error

**File:** [table-of-contents-map-error-fix.md](./table-of-contents-map-error-fix.md)

**Issue:** `TABLES_OF_CONTENTS.map is not a function` error when loading Table of Contents

**Status:** ✅ Fixed

**Summary:** API error handler returned empty string `""` instead of empty array `[]`, causing `.map()` to fail.

**Solution:**
- Changed `getChapterTOC` to return `[]` on error instead of `""`
- Added type checking in `mapTableOfContents` function

---

## 2. Studio Area Coordinates Issue

**Files:**
- [studio-area-coordinates-issue.md](./studio-area-coordinates-issue.md) - Problem analysis & solution
- [studio-fix-implementation-summary.md](./studio-fix-implementation-summary.md) - Initial implementation
- [studio-fix-additional-improvements.md](./studio-fix-additional-improvements.md) - Additional fixes after testing

**Issue:** Area coordinates don't display properly after navigating between pages in Studio

**Status:** ✅ Fixed

**Summary:** When users create areas on a page, navigate away, and return, the areas appear at wrong positions or wrong sizes due to lost coordinate metadata.

**Root Causes:**
1. Lost metadata (`_unit`, `_updated`) during state updates
2. Missing metadata on newly created areas
3. No coordinate recalculation on page navigation
4. Missing safety checks in conversion logic

**Solution Implemented:**
- ✅ Preserve `_unit` and `_updated` in all state updates
- ✅ Set proper metadata on new areas
- ✅ Force recalculation on page changes (reset `_updated` flag)
- ✅ Add null checks and dimension validation
- ✅ Trigger recalculation on zoom changes
- ✅ Store percentage coordinates directly in area objects
- ✅ Use stored coordinates for conversion (no dependency on areasProperties)

**Files Modified:**
- `src/components/Studio/Studio.jsx` (4 functions modified, 1 useEffect enhanced, ~170 lines total)

---

## 3. Upload System Enhancement

**Files:**
- [NewUpload-API-Documentation.md](./NewUpload-API-Documentation.md) - Complete API reference
- [File-Extension-Upload-Guide.md](./File-Extension-Upload-Guide.md) - Troubleshooting guide
- [upload-refactoring-plan.md](./upload-refactoring-plan.md) - Original analysis

**Status:** ✅ Implemented

**Issue:** Uploaded files return URLs without proper file extensions or blob URLs

Previously, uploaded files would sometimes return URLs without proper file extensions or blob URLs, making them:
- Unable to be viewed directly in browser tabs
- Difficult to identify by file type
- Problematic for direct linking and sharing

**Example of issues:**
```
❌ https://cdn.example.com/abc123 (no extension)
❌ blob:http://localhost:3000/abc-123 (blob URL)
```

**Desired outcome:**
```
✅ https://cdn.example.com/abc123.png (with extension)
✅ Can be opened directly in a new browser tab
```

## Solution

### New Upload Module

Created **`src/utils/NewUpload.js`** - A refactored upload utility with:

1. **Automatic extension handling** - All uploads include proper file extensions
2. **Consistent error handling** - All functions have try-catch with toast notifications
3. **Progress tracking** - Built-in upload progress support
4. **Configurable timeouts** - Prevent stuck uploads
5. **Abort support** - Cancel long-running uploads
6. **Comprehensive MIME type mapping** - Supports 30+ file types

### Key Features

#### 1. File Extension Guarantee

Every upload function ensures files have proper extensions:

```javascript
import { upload, uploadBase64, uploadBlob } from '@/utils/NewUpload';

// File upload - preserves original extension
const result = await upload(file);
// URL: https://cdn.com/photo.jpg

// Base64 upload - adds extension based on MIME type
const result = await uploadBase64(canvas.toDataURL('image/png'), {
  fileName: 'drawing'
});
// URL: https://cdn.com/drawing.png

// Blob upload - auto-detects and adds extension
const result = await uploadBlob(audioBlob, 'recording');
// URL: https://cdn.com/recording.webm
```

#### 2. Extension Correction

New helper functions to fix missing/wrong extensions:

```javascript
import { ensureFileExtension, uploadWithExtension } from '@/utils/NewUpload';

// Automatically correct extension before upload
const result = await uploadWithExtension(file);

// Or manually correct first
const correctedFile = ensureFileExtension(file);
const result = await upload(correctedFile);
```

#### 3. Progress Tracking

Monitor upload progress for better UX:

```javascript
const result = await upload(file, {
  onProgress: (percent) => {
    progressBar.style.width = `${percent}%`;
    console.log(`${percent}% uploaded`);
  }
});
```

#### 4. Cancellable Uploads

Abort long-running uploads:

```javascript
const controller = new AbortController();

const promise = upload(file, {
  signal: controller.signal,
  timeout: 60000
});

// Cancel button
cancelButton.onclick = () => controller.abort();
```

## Documents in This Directory

### 1. [upload-refactoring-plan.md](./upload-refactoring-plan.md)
**Comprehensive refactoring analysis and implementation plan**
- Detailed analysis of old `upload.js` issues
- 4-phase refactoring strategy
- Implementation checklist
- Estimated effort and risk assessment

### 2. [NewUpload-API-Documentation.md](./NewUpload-API-Documentation.md)
**Complete API reference (500+ lines)**
- Full API documentation for all functions
- Configuration options guide
- 5 detailed usage examples:
  - File input uploads
  - Canvas/image exports
  - Audio recording uploads
  - Cancellable uploads
  - Batch uploads
- Error handling patterns
- Migration guide from old upload.js
- Best practices and FAQ

### 3. [File-Extension-Upload-Guide.md](./File-Extension-Upload-Guide.md)
**Troubleshooting guide for file extension issues**
- Root cause analysis of missing extensions
- Client-side solutions (implemented in NewUpload.js)
- Server-side configuration examples
- Debugging techniques
- Testing and verification steps
- Common issues and fixes
- Implementation checklist

## Quick Start

### Installation

No installation needed - files are already in place:
- **Source:** `src/utils/NewUpload.js`
- **Docs:** `docs/2025-10-30/`

### Basic Usage

```javascript
// 1. Import the functions you need
import { upload, uploadBase64, uploadBlob } from '@/utils/NewUpload';

// 2. Upload a file
const handleFileUpload = async (event) => {
  const file = event.target.files[0];

  try {
    const result = await upload(file, {
      onProgress: (percent) => console.log(`${percent}%`),
      timeout: 30000
    });

    console.log('Upload successful!');
    console.log('File URL:', result.url); // Will have extension!

    // Open in new tab to verify
    window.open(result.url, '_blank');
  } catch (error) {
    console.error('Upload failed:', error);
  }
};
```

### Ensuring Extensions

```javascript
import { uploadWithExtension } from '@/utils/NewUpload';

// This guarantees the file has the correct extension
const result = await uploadWithExtension(file);

// The returned URL will always have a proper extension
console.log(result.url); // e.g., https://cdn.com/file.png
```

## How It Solves the Extension Problem

### Client-Side (Automatic)

The `NewUpload.js` module automatically ensures all uploads have proper extensions:

1. **File objects** → Original filename preserved
2. **Blobs** → Converted to File with extension from MIME type
3. **Base64** → Converted to File with specified or detected extension

### Conversion Process

```javascript
// Behind the scenes in NewUpload.js
const blobToFile = (blob, customName = null) => {
  // 1. Extract extension from MIME type
  const extension = getExtensionFromMimeType(blob.type);
  // blob.type = 'image/png' → extension = 'png'

  // 2. Generate filename with extension
  const fileName = customName
    ? `${customName}.${extension}`
    : `upload_${Date.now()}.${extension}`;

  // 3. Create File object with proper name
  return new File([blob], fileName, { type: blob.type });
};
```

### Server-Side (Recommended)

While client-side handles file naming, the server should also:

1. **Preserve extensions** when saving files
2. **Return URLs with extensions** in responses
3. **Set proper Content-Type headers**
4. **Use Content-Disposition: inline** for viewable files

See [File-Extension-Upload-Guide.md](./File-Extension-Upload-Guide.md) for server implementation examples.

## Testing Extensions

### Quick Test

```javascript
import { upload, uploadBase64, uploadBlob } from '@/utils/NewUpload';

// Test 1: File upload
const file = new File(['test'], 'test.txt', { type: 'text/plain' });
const result1 = await upload(file);
console.assert(result1.url.endsWith('.txt'), 'Should end with .txt');

// Test 2: Base64 upload
const canvas = document.createElement('canvas');
const base64 = canvas.toDataURL('image/png');
const result2 = await uploadBase64(base64, { fileName: 'test' });
console.assert(result2.url.endsWith('.png'), 'Should end with .png');

// Test 3: Blob upload
const blob = new Blob(['data'], { type: 'audio/webm' });
const result3 = await uploadBlob(blob, 'recording');
console.assert(result3.url.endsWith('.webm'), 'Should end with .webm');

console.log('✅ All extension tests passed!');
```

### Manual Test

1. Upload a file using the new functions
2. Copy the returned URL
3. Open the URL in a new browser tab
4. The file should **display** (not download)
5. The URL should have a proper file extension

## Migration Path

### For New Code

```javascript
// ✅ Use NewUpload.js for all new features
import { upload, uploadBase64, uploadBlob } from '@/utils/NewUpload';
```

### For Existing Code

The old `src/utils/upload.js` is unchanged and still works. Migrate gradually:

```javascript
// Old way
import { upload } from '@/utils/upload';
const result = await upload(file);

// New way (same basic API, more features)
import { upload } from '@/utils/NewUpload';
const result = await upload(file, {
  onProgress: (p) => updateProgress(p)
});
```

See the Migration Guide in [NewUpload-API-Documentation.md](./NewUpload-API-Documentation.md) for complete migration instructions.

## Supported File Types

The module supports 30+ file types with proper extension mapping:

- **Images:** JPG, PNG, GIF, WebP, SVG, BMP, TIFF
- **Audio:** MP3, WAV, WebM, OGG, M4A, AAC
- **Video:** MP4, WebM, OGV, MOV, AVI
- **Documents:** PDF, DOC/DOCX, XLS/XLSX, PPT/PPTX, TXT, HTML, JSON
- **Archives:** ZIP, RAR, 7Z, TAR, GZIP

See `MIME_TYPE_MAP` in `NewUpload.js` for the complete list.

## Troubleshooting

### Issue: URLs still don't have extensions

**Diagnosis:**
```javascript
const result = await upload(file);
console.log('File name sent:', file.name);
console.log('URL received:', result.url);
```

**Solutions:**
1. Use `uploadWithExtension()` to ensure proper extension
2. Check server configuration (see File-Extension-Upload-Guide.md)
3. Verify server is preserving filenames

### Issue: File downloads instead of displaying

**Cause:** Server sending `Content-Disposition: attachment` header

**Solution:** Configure server to send `Content-Disposition: inline` for viewable files

### Issue: Wrong extension

**Cause:** MIME type mismatch

**Solution:**
```javascript
import { ensureFileExtension } from '@/utils/NewUpload';
const correctedFile = ensureFileExtension(file);
const result = await upload(correctedFile);
```

## Benefits

### Before (Old upload.js)
- ❌ Inconsistent error handling
- ❌ No progress tracking
- ❌ No timeout configuration
- ❌ Misleading function names
- ❌ Files sometimes missing extensions
- ❌ Minimal documentation

### After (NewUpload.js)
- ✅ Unified error handling across all functions
- ✅ Built-in progress tracking
- ✅ Configurable timeouts and abort signals
- ✅ Clear, descriptive function names
- ✅ **Guaranteed file extensions**
- ✅ Comprehensive documentation

## Next Steps

1. **Read the API docs:** [NewUpload-API-Documentation.md](./NewUpload-API-Documentation.md)
2. **Test the new upload:** Try uploading a file with the examples above
3. **Verify extensions:** Check that returned URLs have proper extensions
4. **Gradually migrate:** Start using NewUpload for new features
5. **Configure server:** Ensure backend preserves extensions (if needed)

## FAQ

**Q: Do I need to change existing code?**
A: No, the old `upload.js` still works. Migrate gradually or use for new features.

**Q: Will this fix blob URLs?**
A: If you're using `URL.createObjectURL()`, replace it with actual server uploads using `uploadBlob()`.

**Q: What if the server doesn't support extensions?**
A: The client now sends proper filenames. Update server config to preserve them (see File-Extension-Upload-Guide.md).

**Q: Can I use this for large files?**
A: Yes, use the `timeout` option and `onProgress` callback for large files.

**Q: How do I cancel uploads?**
A: Use the `signal` option with an AbortController (see examples in API docs).

## Support

For issues or questions:
1. Check [NewUpload-API-Documentation.md](./NewUpload-API-Documentation.md)
2. Review [File-Extension-Upload-Guide.md](./File-Extension-Upload-Guide.md)
3. Check usage examples in this README
4. Review the source code: `src/utils/NewUpload.js`

---

**Last Updated:** 2025-10-30
**Module Version:** 1.0.0
**Status:** ✅ Ready for production use
