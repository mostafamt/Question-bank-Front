# Fix Plan: Empty contentValue for Voice Deep Blocks on Blank Pages

**Date**: 2026-08-01  
**Issue**: Voice deep blocks submit with empty `contentValue: ""` instead of audio URL  
**Status**: Planning/Investigation  
**Priority**: High

---

## Problem Statement

When submitting a page without an image URL (blank page with white canvas) containing a Voice block with deep content, the request includes:

```json
{
  "contentType": "Voice",
  "contentValue": "",
  "isDeep": true
}
```

**Expected**: `contentValue` should contain the audio file URL (e.g., from Cloudinary or S3)

**Actual**: `contentValue` is an empty string

### Affected Scenario
- ✗ Blank pages (no image URL)
- ✓ Pages with images (working correctly)
- ✗ Voice blocks specifically
- ✓ Other deep block types (Picture, Text - working)

---

## Root Cause Analysis (Hypothesis)

### Likely Causes

1. **Deep Block Voice Data Not Extracted**
   - Location: `src/components/Studio/services/deepHandlers.service.js`
   - Possible Issue: `getDeepBlockAudio()` function may not be extracting audio URL correctly
   - Impact: Audio URL not being captured into `contentValue`

2. **Deep Block Form State Not Synced**
   - Location: `src/components/Studio/StudioAreaSelector/StudioAreaSelector.jsx`
   - Possible Issue: Deep block voice content not being stored in `areasProperties`
   - Impact: When form is submitted, voice data is lost

3. **Voice Modal/Quill Editor Not Saving on Blank Pages**
   - Location: `src/utils/quill.js` or voice upload handler
   - Possible Issue: Voice upload succeeds but URL not being written back to state
   - Impact: Voice URL stored temporarily but lost on page navigation

4. **Area Properties Not Initialized for Deep Blocks**
   - Location: `src/components/Studio/hooks/useAreaManagement.js`
   - Possible Issue: Deep block area properties not being created with voice content
   - Impact: Missing data structure to store voice URL

---

## Investigation Steps

### Step 1: Trace Voice Content Flow

**File**: `src/components/Studio/services/deepHandlers.service.js`

**Check**:
```javascript
export const getDeepBlockAudio = (area) => {
  // Currently returns what?
  return area?.audio?.url || area?.voice?.url || area?.audioUrl || '';
}
```

**Questions**:
- What properties does the area object have for audio/voice?
- Is the audio URL stored in a different property name?
- Is the property nested differently on blank pages vs. pages with images?

### Step 2: Trace Deep Block Area Properties

**File**: `src/components/Studio/StudioAreaSelector/StudioAreaSelector.jsx`

**Check**:
- How is `areasProperties[activePage][idx]` structured for Voice blocks?
- Is the audio URL being stored when user uploads voice?
- Is deep content being saved to `areasProperties` at all?

**Debug Code**:
```javascript
const voiceAreas = areasProperties[activePage]?.filter(area => 
  area.type === 'Voice' && area.isDeep
);
console.log('Voice areas with deep content:', voiceAreas);
// Check if audio/voice/audioUrl properties exist
```

### Step 3: Check Voice Upload Handler

**Location**: Likely in a modal or Quill editor handler

**Check**:
- When user uploads voice for a deep block, where is the URL stored?
- Is it stored in the correct location in `areasProperties`?
- Is the upload callback updating the state correctly?

**Search for**: "voice", "audio", "upload", "Voice" in handlers and modals

### Step 4: Verify Area Properties Initialization

**File**: `src/components/Studio/hooks/useAreaManagement.js`

**Check**:
```javascript
// When area is created, what default properties are set?
// For deep blocks specifically?
// For Voice content type?
```

**Question**: Are deep block voice areas initialized with an `audio`/`voice`/`audioUrl` property?

### Step 5: Check Form State Extraction

**File**: `src/pages/ScanAndUpload/ScanAndUpload.jsx`

**Check**:
```javascript
// When extracting block data for submission
// How is contentValue populated for Voice blocks?
// Is getDeepBlockAudio() being called?
```

---

## Expected vs. Actual Data Structure

### Expected (Picture Block - Working)
```javascript
{
  contentType: "Picture",
  contentValue: "https://scube-applications-media54cbabfc-u3d19945rbtv.s3.eu-west-1.amazonaws.com/...",
  isDeep: true
}
```

### Expected (Voice Block - Not Working)
```javascript
{
  contentType: "Voice",
  contentValue: "https://res.cloudinary.com/dd9turntq/...",  // Should be URL, not ""
  isDeep: true
}
```

### Actual (Voice Block - Current Issue)
```javascript
{
  contentType: "Voice",
  contentValue: "",  // ✗ Empty!
  isDeep: true
}
```

---

## Potential Solutions

### Solution 1: Fix Deep Audio Extraction
**If Issue**: `getDeepBlockAudio()` not finding audio URL correctly

**Action**:
1. Update `deepHandlers.service.js` to search for audio URL in correct property
2. Check what properties voice blocks store data in
3. Add comprehensive fallback chain

**Code Pattern**:
```javascript
export const getDeepBlockAudio = (area) => {
  return area?.audio?.url 
    || area?.voice?.url 
    || area?.audioUrl 
    || area?.contentValue  // Fallback if stored directly
    || '';
}
```

### Solution 2: Fix Voice Upload Callback
**If Issue**: Voice upload succeeds but URL not written to `areasProperties`

**Action**:
1. Find voice upload handler (likely in modal)
2. Ensure callback updates `areasProperties` with audio URL
3. Verify state update happens before form submission

**Pattern**:
```javascript
const handleVoiceUpload = async (audioUrl) => {
  // Update area properties with voice URL
  setAreasProperties(prev => {
    const newProps = [...prev];
    newProps[activePage][areaIndex] = {
      ...newProps[activePage][areaIndex],
      audio: { url: audioUrl },  // Ensure correct property name
    };
    return newProps;
  });
}
```

### Solution 3: Fix Area Properties Initialization
**If Issue**: Deep block voice areas not initialized with audio property

**Action**:
1. Check `useAreaManagement` area creation logic
2. Ensure voice areas get `audio`/`voice` property structure
3. Initialize with empty object if no data yet

**Pattern**:
```javascript
const newAreaProperty = {
  type: 'Voice',
  isDeep: true,
  audio: { url: '' },  // Initialize audio property
  label: '',
  // ... other properties
};
```

### Solution 4: Fix Form Data Extraction
**If Issue**: `getDeepBlockAudio()` not being called or result not used

**Action**:
1. Verify `getDeepBlockAudio()` is called in form extraction
2. Ensure result is assigned to `contentValue`
3. Add debug logging to track data flow

**Location**: `src/pages/ScanAndUpload/ScanAndUpload.jsx`

---

## Testing Strategy

### Test Case 1: Voice on Blank Page
```javascript
// Create voice block on blank page (no image URL)
// Add voice content via upload
// Submit
// Verify: contentValue contains audio URL, not empty string
```

### Test Case 2: Voice on Page with Image
```javascript
// Create voice block on page with image
// Add voice content via upload
// Submit
// Verify: contentValue contains audio URL (as baseline)
```

### Test Case 3: Deep Voice vs. Non-Deep Voice
```javascript
// Create deep voice block
// Create non-deep voice block
// Compare contentValue extraction
// Verify: Both should work if isDeep flag differs
```

### Test Case 4: Voice State Persistence
```javascript
// Create voice block on blank page
// Add voice content
// Navigate to another page
// Navigate back
// Verify: Voice content still present, not lost
```

---

## Files to Investigate

| File | Purpose | Priority |
|------|---------|----------|
| `src/components/Studio/services/deepHandlers.service.js` | Extract deep block audio URL | 🔴 High |
| `src/components/Studio/StudioAreaSelector/StudioAreaSelector.jsx` | Render voice blocks, manage state | 🔴 High |
| `src/components/Studio/hooks/useAreaManagement.js` | Area property initialization | 🟡 Medium |
| `src/pages/ScanAndUpload/ScanAndUpload.jsx` | Form data extraction for submission | 🔴 High |
| `src/utils/quill.js` or voice handler | Voice upload callback | 🟡 Medium |
| `src/components/*/VoiceModal*` or similar | Voice editing interface | 🟡 Medium |

---

## Debug Checklist

- [ ] Search codebase for "Voice" content type handling
- [ ] Find where voice/audio data is stored in area properties
- [ ] Verify `getDeepBlockAudio()` function location and implementation
- [ ] Check form data extraction for deep blocks
- [ ] Test voice upload on blank vs. image pages
- [ ] Add console.log to track contentValue through submission
- [ ] Verify state is not being lost on page navigation
- [ ] Check if issue specific to blank pages or general

---

## Acceptance Criteria

- [ ] Voice deep blocks on blank pages submit with correct audio URL
- [ ] Voice blocks on pages with images continue to work
- [ ] contentValue matches other content types (Picture, Text MCQ)
- [ ] Deep flag is correctly set to `true`
- [ ] Voice content persists across page navigation
- [ ] No performance degradation
- [ ] No breaking changes to existing voice blocks

---

## Implementation Timeline

1. **Phase 1 - Investigation** (30 min)
   - Run debug code to understand data structure
   - Trace voice content through component hierarchy
   - Identify exact point where data is lost

2. **Phase 2 - Fix** (30 min - 1 hour)
   - Implement solution based on findings
   - Update extraction logic or state management
   - Add fallback handling

3. **Phase 3 - Testing** (30 min)
   - Test all voice scenarios
   - Verify blank vs. image pages
   - Regression test other content types

4. **Phase 4 - Deployment** (15 min)
   - Review changes
   - Verify build passes
   - Deploy to staging

---

## Rollback Plan

If fix causes issues:
1. Identify the specific change that broke functionality
2. Revert that change
3. Try alternative solution from "Potential Solutions" section
4. Re-test

---

## Related Documents

- `MISSING_URL_FEATURE_PLAN.md` - Context for blank page handling
- `DEEP_BLOCK_PAGE_URL_PLAN.md` - Deep block implementation context

---

## Next Steps

1. ✓ Create this plan document
2. → Investigate data structure (run debug code)
3. → Identify root cause
4. → Implement fix
5. → Test and verify
6. → Document findings
7. → Deploy

**Status**: Ready for investigation  
**Assignee**: [Developer]  
**Estimated Effort**: 2 hours
