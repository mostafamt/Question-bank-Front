# Upload Utilities Refactoring Plan

**File:** `src/utils/upload.js`
**Date:** 2025-10-30
**Current State:** Multiple upload functions with inconsistencies and code duplication

## Current Functions Analysis

### 1. `upload(file)` - Lines 28-41
**Purpose:** Upload a File object
**Input:** File object
**Features:**
- Timeout configuration (10000ms)
- Abort signal support
- Error handling with toast notifications
- Returns upload response data

**Issues:**
- None - this is the most complete implementation

### 2. `uploadBase64(base64Data)` - Lines 43-50
**Purpose:** Upload base64 data URL
**Input:** Base64 data URL string (e.g., "data:image/png;base64,...")
**Process:**
1. Converts base64 to blob via fetch
2. Creates FormData with blob
3. Posts to /upload endpoint

**Issues:**
- No timeout/abort signal
- No error handling
- Doesn't set proper filename or mime type on the blob

### 3. `baseUploadBase64(base64Data)` - Lines 52-61
**Purpose:** Upload a Blob with proper file extension
**Input:** Blob object (NOT base64 despite the name!)
**Process:**
1. Extracts extension from blob's mime type
2. Creates File object with generated filename
3. Creates FormData with file
4. Posts to /upload endpoint

**Issues:**
- **Misleading name** - suggests base64 input but actually takes Blob
- No timeout/abort signal
- No error handling
- Hardcoded filename pattern

### 4. `uploadForStudio(base64Data)` - Lines 63-68
**Purpose:** Studio-specific upload from base64
**Input:** Base64 data URL string
**Process:**
1. Converts base64 to blob via fetch
2. Calls `baseUploadBase64(blob)`

**Issues:**
- Duplicates base64-to-blob conversion logic
- No error handling
- Name suggests special studio logic but just wraps other functions

## Key Problems Identified

### 1. Code Duplication
- Base64-to-blob conversion appears in both `uploadBase64` and `uploadForStudio`
- FormData creation and upload logic repeated across all functions

### 2. Inconsistent Error Handling
- Only `upload()` has try-catch with toast notifications
- Other functions will silently fail or throw unhandled errors

### 3. Inconsistent Timeout/Abort Handling
- Only `upload()` has timeout and abort signal
- Long-running uploads in other functions can't be cancelled

### 4. Naming Issues
- `baseUploadBase64` is misleading - takes Blob not base64
- `uploadForStudio` doesn't indicate what makes it "studio-specific"

### 5. Missing Features
- No upload progress tracking
- No file size validation
- No mime type validation
- Hardcoded timeout values
- No configurable options

## Refactoring Strategy

### Phase 1: Core Refactoring (High Priority)

#### 1.1 Create Base Upload Function
Create a single, configurable base function that all others will use:

```javascript
const uploadFile = async (file, options = {}) => {
  const {
    timeout = 10000,
    onProgress = null,
    signal = null,
  } = options;

  const data = new FormData();
  data.append("file", file);

  try {
    const config = {
      timeout,
      signal: signal || newAbortSignal(timeout),
    };

    if (onProgress) {
      config.onUploadProgress = (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onProgress(percentCompleted);
      };
    }

    const res = await axios.post("/upload", data, config);
    return res.data;
  } catch (error) {
    console.error("Upload error:", error);
    toast.error(error?.message || "Upload failed");
    throw error;
  }
};
```

#### 1.2 Create Conversion Utilities
Extract conversion logic into dedicated utility functions:

```javascript
/**
 * Convert base64 data URL to Blob
 * @param {string} base64Data - Data URL (e.g., "data:image/png;base64,...")
 * @returns {Promise<Blob>}
 */
const base64ToBlob = async (base64Data) => {
  const response = await fetch(base64Data);
  return response.blob();
};

/**
 * Convert Blob to File with proper naming
 * @param {Blob} blob - The blob to convert
 * @param {string} [customName] - Optional custom filename
 * @returns {File}
 */
const blobToFile = (blob, customName = null) => {
  const extension = getExtensionFromMimeType(blob.type);
  const fileName = customName || `upload_${Date.now()}.${extension}`;
  return new File([blob], fileName, { type: blob.type });
};
```

#### 1.3 Refactor Public API Functions
Rewrite existing functions to use the base utilities:

```javascript
/**
 * Upload a File object
 * @param {File} file - The file to upload
 * @param {Object} options - Upload options (timeout, onProgress, signal)
 * @returns {Promise<Object>} Upload response
 */
const upload = async (file, options = {}) => {
  return uploadFile(file, options);
};

/**
 * Upload from base64 data URL
 * @param {string} base64Data - Base64 data URL
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} Upload response
 */
const uploadBase64 = async (base64Data, options = {}) => {
  const blob = await base64ToBlob(base64Data);
  const file = blobToFile(blob);
  return uploadFile(file, options);
};

/**
 * Upload a Blob with proper file naming
 * @param {Blob} blob - The blob to upload
 * @param {string} [customName] - Optional custom filename
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} Upload response
 */
const uploadBlob = async (blob, customName = null, options = {}) => {
  const file = blobToFile(blob, customName);
  return uploadFile(file, options);
};

/**
 * Upload from base64 for Studio (legacy compatibility)
 * @deprecated Use uploadBase64 instead
 * @param {string} base64Data - Base64 data URL
 * @returns {Promise<Object>} Upload response
 */
const uploadForStudio = async (base64Data) => {
  return uploadBase64(base64Data);
};
```

### Phase 2: Enhanced Features (Medium Priority)

#### 2.1 Add Validation
```javascript
/**
 * Validate file before upload
 * @param {File} file - File to validate
 * @param {Object} constraints - Validation constraints
 * @throws {Error} If validation fails
 */
const validateFile = (file, constraints = {}) => {
  const {
    maxSize = 10 * 1024 * 1024, // 10MB default
    allowedTypes = [],
  } = constraints;

  if (file.size > maxSize) {
    throw new Error(
      `File size exceeds limit (${(maxSize / 1024 / 1024).toFixed(2)}MB)`
    );
  }

  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    throw new Error(
      `File type ${file.type} not allowed. Allowed: ${allowedTypes.join(", ")}`
    );
  }
};
```

#### 2.2 Add Batch Upload Support
```javascript
/**
 * Upload multiple files
 * @param {File[]} files - Array of files to upload
 * @param {Object} options - Upload options
 * @returns {Promise<Object[]>} Array of upload responses
 */
const uploadMultiple = async (files, options = {}) => {
  const { parallel = false, onFileProgress = null } = options;

  if (parallel) {
    return Promise.all(
      files.map((file, index) =>
        uploadFile(file, {
          ...options,
          onProgress: onFileProgress
            ? (progress) => onFileProgress(index, progress)
            : null,
        })
      )
    );
  }

  const results = [];
  for (let i = 0; i < files.length; i++) {
    const result = await uploadFile(files[i], {
      ...options,
      onProgress: onFileProgress
        ? (progress) => onFileProgress(i, progress)
        : null,
    });
    results.push(result);
  }
  return results;
};
```

#### 2.3 Improve MIME Type Mapping
Expand `getExtensionFromMimeType` with more types and add reverse lookup:

```javascript
const MIME_TYPE_MAP = {
  // Images
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
  "image/webp": "webp",
  "image/svg+xml": "svg",
  // Audio
  "audio/webm": "webm",
  "audio/mpeg": "mp3",
  "audio/wav": "wav",
  "audio/ogg": "ogg",
  // Video
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/ogg": "ogv",
  // Documents
  "application/pdf": "pdf",
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  // Archives
  "application/zip": "zip",
  "application/x-rar-compressed": "rar",
};

const getExtensionFromMimeType = (mimeType) => {
  const cleanType = mimeType.split(";")[0];
  return MIME_TYPE_MAP[cleanType] || "bin";
};

const getMimeTypeFromExtension = (extension) => {
  const ext = extension.toLowerCase().replace(".", "");
  return Object.keys(MIME_TYPE_MAP).find(
    (key) => MIME_TYPE_MAP[key] === ext
  );
};
```

### Phase 3: Testing & Documentation (High Priority)

#### 3.1 Add JSDoc Documentation
All functions should have comprehensive JSDoc comments with:
- Description
- Parameter types and descriptions
- Return type and description
- Example usage
- Throws documentation

#### 3.2 Create Unit Tests
```javascript
// upload.test.js
describe('upload utilities', () => {
  describe('uploadFile', () => {
    it('should upload file successfully', async () => {
      // Test implementation
    });

    it('should handle timeout', async () => {
      // Test implementation
    });

    it('should report progress', async () => {
      // Test implementation
    });
  });

  describe('base64ToBlob', () => {
    it('should convert base64 to blob', async () => {
      // Test implementation
    });
  });

  // More tests...
});
```

#### 3.3 Create Usage Examples
Document common use cases in README or inline comments:
- Simple file upload
- Upload with progress tracking
- Batch uploads
- Base64 uploads
- Custom timeout/abort handling

### Phase 4: Migration Guide (Low Priority)

#### 4.1 Create Migration Path
For existing code using the old API:

| Old Function | New Function | Notes |
|-------------|--------------|-------|
| `upload(file)` | `upload(file, options)` | Now accepts optional config |
| `uploadBase64(base64)` | `uploadBase64(base64, options)` | Now has error handling & timeout |
| `baseUploadBase64(blob)` | `uploadBlob(blob, name, options)` | Renamed for clarity |
| `uploadForStudio(base64)` | `uploadBase64(base64)` | Deprecated, use uploadBase64 |

#### 4.2 Deprecation Strategy
1. Keep old function signatures for backward compatibility
2. Add deprecation warnings via console
3. Update all internal usage to new API
4. Plan removal in future major version

## Implementation Checklist

- [ ] Create base `uploadFile` function with all features
- [ ] Extract `base64ToBlob` utility
- [ ] Extract `blobToFile` utility
- [ ] Refactor `upload` to use base function
- [ ] Refactor `uploadBase64` to use utilities
- [ ] Rename `baseUploadBase64` to `uploadBlob`
- [ ] Deprecate `uploadForStudio` or make it alias
- [ ] Add file validation utility
- [ ] Add batch upload support
- [ ] Expand MIME type mappings
- [ ] Add comprehensive JSDoc comments
- [ ] Write unit tests
- [ ] Update all usages across codebase
- [ ] Create migration guide
- [ ] Update CLAUDE.md with new upload utilities documentation

## Benefits of Refactoring

1. **Code Reusability** - Single base implementation reduces duplication
2. **Consistency** - All uploads have same error handling, timeouts, and features
3. **Maintainability** - Changes in one place affect all upload types
4. **Extensibility** - Easy to add new features (progress, validation, retry logic)
5. **Clarity** - Clear function names and documentation
6. **Type Safety** - Better JSDoc enables IDE autocomplete and type checking
7. **Testability** - Smaller, focused functions are easier to test

## Estimated Effort

- Phase 1 (Core Refactoring): 4-6 hours
- Phase 2 (Enhanced Features): 3-4 hours
- Phase 3 (Testing & Documentation): 4-5 hours
- Phase 4 (Migration): 2-3 hours

**Total:** 13-18 hours

## Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Breaking existing code | High | Keep old API signatures as wrappers |
| Missing edge cases | Medium | Comprehensive testing before deployment |
| Performance regression | Low | Monitor upload times after refactoring |
| Timeout issues with large files | Medium | Make timeout configurable per upload |

## Next Steps

1. Review and approve this plan
2. Create feature branch for refactoring
3. Implement Phase 1 (core refactoring)
4. Test with existing upload flows
5. Gradually implement Phases 2-4
6. Monitor production for any issues
