# Mode Detection Test Guide

**Status:** ✅ Implemented
**Date:** 2026-01-01
**Component:** `src/components/Studio/Studio.jsx`

## What Was Implemented

Studio component now detects whether it's in **Reader Mode** or **Studio Mode** based on the URL pattern.

### Changes Made

1. **Imports Added** (Lines 2, 17):
   ```javascript
   import { useParams, useLocation } from "react-router-dom";
   import { useAppMode } from "../../utils/tabFiltering";
   ```

2. **Mode Detection Logic Added** (Lines 118-132):
   ```javascript
   const location = useLocation();

   // Detect mode from URL (reader vs studio)
   const mode = useAppMode();
   const isReaderMode = mode === 'reader';

   // Debug: Log mode detection
   React.useEffect(() => {
     console.log('📍 Studio Mode Detection:', {
       mode,
       isReaderMode,
       pathname: location.pathname,
       url: window.location.href,
     });
   }, [mode, isReaderMode, location.pathname]);
   ```

## How to Test

### 1. Start the Development Server

```bash
npm start
```

### 2. Open Browser Console

Press `F12` or right-click → "Inspect" → "Console" tab

### 3. Test Studio Mode

Navigate to a **Studio Mode** URL (without `/read/`):

```
http://localhost:3000/book/123/chapter/456
```

**Expected Console Output:**
```javascript
📍 Studio Mode Detection: {
  mode: "studio",
  isReaderMode: false,
  pathname: "/book/123/chapter/456",
  url: "http://localhost:3000/book/123/chapter/456"
}
```

### 4. Test Reader Mode

Navigate to a **Reader Mode** URL (with `/read/`):

```
http://localhost:3000/read/book/123/chapter/456
```

**Expected Console Output:**
```javascript
📍 Studio Mode Detection: {
  mode: "reader",
  isReaderMode: true,
  pathname: "/read/book/123/chapter/456",
  url: "http://localhost:3000/read/book/123/chapter/456"
}
```

## Verification Checklist

- [ ] Studio mode URL (`/book/...`) shows `mode: "studio"` ✓
- [ ] Studio mode URL shows `isReaderMode: false` ✓
- [ ] Reader mode URL (`/read/book/...`) shows `mode: "reader"` ✓
- [ ] Reader mode URL shows `isReaderMode: true` ✓
- [ ] Console log appears on page load ✓
- [ ] Console log updates when navigating between pages ✓
- [ ] No errors in console ✓
- [ ] Application still renders correctly ✓

## URL Pattern Reference

| URL Pattern | Mode | isReaderMode | Use Case |
|-------------|------|--------------|----------|
| `/read/book/:bookId/chapter/:chapterId` | `reader` | `true` | Students viewing content |
| `/book/:bookId/chapter/:chapterId` | `studio` | `false` | Authors editing content |

## Testing Different Scenarios

### Scenario 1: Direct Navigation

1. Type URL directly in address bar
2. Press Enter
3. Check console for mode detection log

### Scenario 2: Page Navigation

1. Navigate to studio mode page
2. Check console: should show `mode: "studio"`
3. Click link to reader mode page
4. Check console: should show `mode: "reader"`
5. Use browser back button
6. Check console: should show `mode: "studio"` again

### Scenario 3: Refresh Page

1. Navigate to a reader mode page
2. Refresh the page (F5 or Ctrl+R)
3. Check console: should still show `mode: "reader"`

## Using Mode Variables in Code

The mode detection provides two variables you can use:

```javascript
// Inside Studio component
const mode = useAppMode();           // 'reader' or 'studio'
const isReaderMode = mode === 'reader';  // true or false

// Use in conditionals
if (isReaderMode) {
  // Reader-specific logic
  console.log('Running in reader mode');
} else {
  // Studio-specific logic
  console.log('Running in studio mode');
}

// Use in JSX
{isReaderMode ? (
  <ReaderOnlyComponent />
) : (
  <StudioOnlyComponent />
)}

// Use in tab filtering (next step)
const LEFT_COLUMNS = buildLeftColumns({ /* props */ });
// Will eventually become:
// const LEFT_COLUMNS = isReaderMode
//   ? buildReaderLeftColumns({ /* props */ })
//   : buildLeftColumns({ /* props */ });
```

## Troubleshooting

### Issue: No console log appears

**Possible causes:**
1. Console is not showing `info` level logs
2. Component didn't mount
3. JavaScript error preventing execution

**Solution:**
- Open Console → Click gear icon → Ensure "Info" is checked
- Check for errors in console (red messages)
- Verify Studio component is rendering

### Issue: Mode is always "studio"

**Possible causes:**
1. URL doesn't contain `/read/`
2. useAppMode hook not working

**Solution:**
- Verify URL format: must be `/read/book/...` for reader mode
- Check that tabFiltering.js utility was created correctly
- Try adding this test in console:
  ```javascript
  console.log(window.location.pathname);
  console.log(window.location.pathname.includes('/read/'));
  ```

### Issue: Mode is always "reader"

**Possible causes:**
1. URL unexpectedly contains `/read/`
2. URL detection logic issue

**Solution:**
- Check actual URL in address bar
- Try this in console:
  ```javascript
  console.log(window.location.pathname);
  // Should NOT contain '/read/' for studio mode
  ```

## Next Steps

Now that mode detection is working, you can:

1. ✅ **Verify mode detection works** (current step)
2. ⬜ **Update column builders** to use mode-filtered tabs
3. ⬜ **Test tab filtering** in both modes
4. ⬜ **Remove debug console.log** (optional, after testing)

## Removing Debug Logging (Optional)

Once you've verified mode detection works, you can remove or comment out the debug logging:

**Option 1: Remove entirely**
```javascript
// Delete lines 124-132 in Studio.jsx
```

**Option 2: Comment out**
```javascript
// Debug: Log mode detection
// React.useEffect(() => {
//   console.log('📍 Studio Mode Detection:', {
//     mode,
//     isReaderMode,
//     pathname: location.pathname,
//     url: window.location.href,
//   });
// }, [mode, isReaderMode, location.pathname]);
```

**Option 3: Keep for development only**
```javascript
// Debug: Log mode detection (development only)
React.useEffect(() => {
  if (process.env.NODE_ENV === 'development') {
    console.log('📍 Studio Mode Detection:', {
      mode,
      isReaderMode,
      pathname: location.pathname,
      url: window.location.href,
    });
  }
}, [mode, isReaderMode, location.pathname]);
```

## Summary

✅ **Mode detection implemented successfully!**

The Studio component can now:
- Detect Reader vs Studio mode from URL
- Provide `mode` variable ('reader' or 'studio')
- Provide `isReaderMode` boolean flag
- Log mode information for debugging

This is the foundation for implementing dynamic tab filtering in the next phase.
