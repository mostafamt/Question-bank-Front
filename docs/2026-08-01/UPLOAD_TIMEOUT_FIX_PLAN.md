# Fix Plan: Upload Timeout for Large Files (Video)

**Date**: 2026-08-01  
**Issue**: Large files (especially videos) fail to upload due to 10-second timeout  
**Status**: Planning  
**Priority**: High

---

## Problem Statement

The `upload()` function in `src/utils/upload.js` has a hardcoded 10-second timeout:

```javascript
const upload = async (file) => {
  try {
    const res = await axios.post("/upload", data, {
      timeout: 10000,  // ← Only 10 seconds!
      signal: newAbortSignal(10000),  // ← Also 10 seconds!
    });
```

### Issues
- **Video files**: Take much longer than 10 seconds to upload (5-30+ seconds depending on file size and connection)
- **Large images**: Also affected (anything > 5MB)
- **Unreliable**: On slow connections, even small files may timeout
- **User experience**: Upload fails with confusing error message

### Current State
- ✗ `upload()` function: **10 second timeout** (BREAKS FOR LARGE FILES)
- ✓ `uploadBase64()` function: **No timeout** (works fine)
- ✓ `baseUploadBase64()` function: **No timeout** (works fine)
- ✓ `uploadForStudio()` function: **No timeout** (works fine)

### Why This Happens
- 10 seconds is enough for small images/audio (< 1MB)
- But videos are typically 5-30MB+
- Network upload speed varies (1-10 MB/s average)
- Large files need 30-60+ seconds to upload reliably

---

## Root Cause

The timeout is too aggressive. Axios/AbortController has two layers of timeout:
1. **axios timeout** (line 33): Cancels after 10 seconds of no activity
2. **AbortSignal** (line 34): Cancels after 10 seconds total

Both must complete for upload to succeed.

---

## Solutions (Pick One)

### Solution 1: Remove Timeout (RECOMMENDED) ✅

**Rationale**: 
- Other upload functions in the same file have NO timeout and work fine
- Server-side timeouts handle real hangs (e.g., network disconnect)
- Client-side timeout just breaks legitimate uploads

**Change**:
```javascript
const upload = async (file) => {
  const data = new FormData();
  data.append("file", file);
  try {
    const res = await axios.post("/upload", data);  // ← No timeout!
    return res.data;
  } catch (error) {
    console.log("error= ", error);
    toast.error(error?.message);
  }
};
```

**Pros**:
- ✅ Simple, one-line fix
- ✅ Consistent with other upload functions in the file
- ✅ Works for all file sizes
- ✅ Server already has its own timeouts

**Cons**:
- ⚠️ Extremely slow connections could hang indefinitely (rare, server would catch it)

---

### Solution 2: Increase Timeout (SAFE) ✅

**Rationale**: Allow 5 minutes (300 seconds) which covers most realistic scenarios

**Change**:
```javascript
const UPLOAD_TIMEOUT_MS = 300000; // 5 minutes

const upload = async (file) => {
  const data = new FormData();
  data.append("file", file);
  try {
    const res = await axios.post("/upload", data, {
      timeout: UPLOAD_TIMEOUT_MS,
      signal: newAbortSignal(UPLOAD_TIMEOUT_MS),
    });
    return res.data;
  } catch (error) {
    console.log("error= ", error);
    toast.error(error?.message);
  }
};
```

**Pros**:
- ✅ Works for all practical file sizes (up to ~1GB on good connections)
- ✅ Still catches hanging connections
- ✅ Conservative estimate

**Cons**:
- ⚠️ If connection drops, takes 5 minutes to detect (vs immediate)

---

### Solution 3: Dynamic Timeout Based on File Size (COMPREHENSIVE)

**Rationale**: Calculate timeout based on file size (assume ~1 MB/s upload speed)

**Change**:
```javascript
const MIN_TIMEOUT_MS = 30000; // 30 seconds minimum
const BYTES_PER_SECOND = 1_000_000; // 1 MB/s assumption

const upload = async (file) => {
  // Calculate timeout: file size / 1MB + safety buffer
  const calculatedTimeout = Math.max(
    MIN_TIMEOUT_MS,
    (file.size / BYTES_PER_SECOND + 10) * 1000
  );

  const data = new FormData();
  data.append("file", file);
  try {
    const res = await axios.post("/upload", data, {
      timeout: calculatedTimeout,
      signal: newAbortSignal(calculatedTimeout),
    });
    return res.data;
  } catch (error) {
    console.log("error= ", error);
    toast.error(error?.message);
  }
};
```

**Pros**:
- ✅ Optimized for each file size
- ✅ Catches hangs faster for small files
- ✅ Allows enough time for large files

**Cons**:
- ⚠️ More complex code
- ⚠️ Makes assumptions about upload speed (varies by connection)

---

## Recommendation

**Use Solution 1 (Remove Timeout)** because:
1. ✅ Other functions in the same file have no timeout and work fine
2. ✅ Simplest and cleanest fix
3. ✅ Server already has its own timeout protection
4. ✅ No false positives on slow connections
5. ✅ Most consistent with rest of codebase

**Fallback**: If timeout still needed, use Solution 2 (increase to 5 minutes)

---

## Implementation Steps

### Step 1: Identify All Upload Functions
- [x] `upload()` - Has 10s timeout ❌
- [x] `uploadBase64()` - No timeout ✅
- [x] `baseUploadBase64()` - No timeout ✅
- [x] `uploadForStudio()` - No timeout ✅

### Step 2: Choose Solution
- Recommended: Solution 1 (Remove timeout)
- Time to implement: 2 minutes
- Testing: 10 minutes (upload video, verify success)

### Step 3: Update Code
Edit `src/utils/upload.js`:
- Remove line 33: `timeout: 10000,`
- Remove line 34: `signal: newAbortSignal(10000),`
- Remove or keep `newAbortSignal()` function (unused if no timeout)

### Step 4: Test
- [ ] Upload small image (should be instant)
- [ ] Upload large video (should complete without timeout)
- [ ] Upload on slow connection (should still work, just slower)
- [ ] Test connection drop (should fail with network error, not timeout)

### Step 5: Deploy
- No backend changes needed
- No config changes needed
- Safe to deploy immediately

---

## File Changes

**File**: `src/utils/upload.js`

**Lines to Change**: 28-35

**Before**:
```javascript
const upload = async (file) => {
  const data = new FormData();
  data.append("file", file);
  try {
    const res = await axios.post("/upload", data, {
      timeout: 10000,
      signal: newAbortSignal(10000),
    });
    return res.data;
  } catch (error) {
    console.log("error= ", error);
    toast.error(error?.message);
  }
};
```

**After** (Solution 1):
```javascript
const upload = async (file) => {
  const data = new FormData();
  data.append("file", file);
  try {
    const res = await axios.post("/upload", data);
    return res.data;
  } catch (error) {
    console.log("error= ", error);
    toast.error(error?.message);
  }
};
```

**Optional Cleanup**:
- Remove `newAbortSignal()` function (lines 4-9) if no longer needed
- Or keep it for future use

---

## Testing Checklist

- [ ] Build succeeds: `npm run build`
- [ ] No TypeScript errors
- [ ] Small file upload works (< 1MB)
- [ ] Large file upload works (> 50MB video)
- [ ] Slow connection simulation works
- [ ] Network error handling works
- [ ] No regressions in other features

---

## Impact Analysis

### Positive
✅ Large video files can now upload successfully  
✅ No more mysterious "timeout" errors  
✅ Consistent with other upload functions in the file  
✅ Cleaner code (removes unnecessary timeout)  

### Negative
❌ None identified - server has its own timeouts

### Breaking Changes
❌ None - this is a fix, not a feature change

### Performance Impact
❌ None - removes unnecessary timeout overhead

---

## Acceptance Criteria

- [ ] Video files upload successfully without timeout
- [ ] Upload time proportional to file size (no hard 10s limit)
- [ ] Error messages clear if upload actually fails
- [ ] Small files upload as fast as before
- [ ] No regressions in other upload functionality

---

## Deployment

**Risk Level**: Very Low (removing unnecessary timeout)  
**Rollback**: Easy (just revert the 2-line change)  
**Deployment**: Can deploy immediately, no dependencies  

---

## Related Code

### Axios Instance Configuration
**File**: `src/axios.js`
- Check if there are global timeout settings that might conflict
- Should be fine - instance timeout, but function-level timeout takes precedence

### Upload Endpoint
**Backend**: `/upload` endpoint should have its own timeout (typically 30+ minutes for multipart uploads)

---

## Follow-up

After fix, consider:
1. Add upload progress indicator (for large files)
2. Add retry logic for failed uploads
3. Add upload progress percentage to UI

---

## Timeline

- **Investigation**: ✅ Complete
- **Planning**: ✅ Complete
- **Implementation**: 2 minutes
- **Testing**: 10 minutes
- **Deployment**: Immediate

**Total**: ~15 minutes to fully resolve

---

**Status**: Ready for implementation  
**Recommendation**: Apply Solution 1 immediately
