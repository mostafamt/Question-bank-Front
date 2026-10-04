# Snapshot White Area Debug Guide

## Issue
White area overlays are visible on the page but NOT appearing in the captured snapshot.

## Root Cause Analysis
The page capture service's `onclone` hook was stripping styling too aggressively, potentially affecting white areas before they could be preserved.

## Fix Applied

### 1. Enhanced pageCapture.service.js
**Changes:**
- ✅ Added debug logging to track white area handling
- ✅ Changed strategy: Process white areas FIRST before stripping other elements
- ✅ More surgical approach: Only strip area selection styling, not all backgrounds
- ✅ Verify white areas are still in cloned tree after processing
- ✅ Force white background explicitly: `background-color: #ffffff`

**Key Improvement:**
```javascript
// OLD: Generic strip all backgrounds
Array.from(clonedEl.children).forEach((child) => {
  child.style.setProperty('background-color', 'transparent', 'important');
});

// NEW: Process white areas first, then selectively strip
const whiteAreas = clonedEl.querySelectorAll('.white-area-overlay');
whiteAreas.forEach((area) => {
  area.style.setProperty('background-color', '#ffffff', 'important');
});
// Then strip ONLY area selection boxes, not white areas
```

### 2. Enhanced WhiteAreaOverlay.jsx
**Changes:**
- ✅ Increased z-index from 1 to 100 (higher visibility in DOM)
- ✅ Added `box-sizing: border-box` for consistent sizing
- ✅ Added margin/padding reset to prevent layout issues

### 3. New Debug Function
**Location:** `whiteAreaUtils.js` - `debugWhiteAreas()`

Comprehensive debugging that shows:
- State vs DOM mismatch detection
- Computed styles of white areas
- Visibility verification
- Specific recommendations

## How to Debug

### Step 1: Open Browser Console
When on a page with deleted deep blocks, run:

```javascript
import { debugWhiteAreas } from './utils/whiteAreaUtils';

debugWhiteAreas(
  pageContainerRef.current,
  deletedDeepBlockAreas,
  activePageIndex
);
```

Or if you have access to it differently:

```javascript
// Find the container
const container = document.querySelector('[class*="block"]');

// Manual state check
console.log('White areas in DOM:', container.querySelectorAll('.white-area-overlay'));
```

### Step 2: Check Console Output
The debug function will show:

```
🔍 WHITE AREAS DEBUG INFO

📊 State:
  - Deleted areas in state: 2
    [0] area-123: x=10%, y=20%, w=100%, h=150%
    [1] area-456: x=30%, y=40%, w=80%, h=120%

🏗️ DOM:
  - White area elements in DOM: 2
    [0] ID=area-123
        Position: x=10%, y=20%, w=100%, h=150%
        Display: display=block, visibility=visible, opacity=1
        Color: background=rgb(255, 255, 255), border=1px dashed rgb(224, 224, 224)
        Rect: left=150, top=300, width=1500, height=2250

✅ Visibility Check:
  - All visible: true
  - Count: 2

💡 Recommendations:
  ✅ All checks passed! White areas should be captured in snapshot.
```

### Step 3: Before Submitting
Run this to verify everything is correct:

```javascript
// Check if white areas are visible
const verification = verifyWhiteAreasVisible(pageContainerRef.current);
if (verification.allVisible && verification.count > 0) {
  console.log('✅ Ready to submit - white areas will be captured');
} else {
  console.error('❌ Issue detected - white areas may not be captured');
}
```

## Troubleshooting Scenarios

### Scenario 1: White Areas Visible but Not in Snapshot

**Symptoms:**
- White overlays show on page
- Snapshot uploaded without white areas
- Debug shows: "All visible: true" but snapshot empty

**Diagnosis:**
- Check browser console for html2canvas errors
- Verify container element is correct
- Check if snapshot is being created at all

**Solution:**
```javascript
// Test snapshot capture directly
const { capturePageSnapshot } = await import('./services/pageCapture.service.js');
const snapshot = await capturePageSnapshot(pageContainerRef.current);
console.log('Snapshot created:', snapshot ? 'YES' : 'NO');

// Check html2canvas version
console.log('html2canvas:', window.html2canvas);
```

### Scenario 2: White Areas Not in DOM

**Symptoms:**
- No white overlays on page
- Debug shows: "White area elements in DOM: 0"
- State has deleted areas but DOM doesn't show them

**Diagnosis:**
- WhiteAreaOverlay not rendering
- Props not flowing correctly
- Component mounted but not visible

**Solution:**
```javascript
// Check if deletedDeepBlockAreas has data
console.log('Deleted areas:', deletedDeepBlockAreas);

// Check if component props are correct
console.log('Active page:', activePageIndex);
console.log('Areas for page:', deletedDeepBlockAreas[activePageIndex]);

// Check for CSS hiding
const styles = document.querySelector('.white-area-overlay');
if (styles) {
  console.log('Computed style:', window.getComputedStyle(styles));
}
```

### Scenario 3: State Has Data but Not Tracking Deletions

**Symptoms:**
- Debug shows: "Deleted areas in state: 0"
- Deleting deep blocks doesn't add to state
- No white areas appear

**Diagnosis:**
- `isDeepBlock()` not detecting deep blocks
- `addDeletedDeepBlockArea()` not being called
- Event handler not triggering

**Solution:**
```javascript
// Check if area is recognized as deep block
const area = areasProperties[activePageIndex][0];
console.log('Area:', area);
console.log('Is deep block:', area?.isDeep === true);

// Manually test adding
import { isDeepBlock } from '../utils';
console.log('isDeepBlock check:', isDeepBlock(area));
```

## Console Logging Output

The snapshot service now logs detailed information:

```
[Snapshot] Found 2 white area overlays
[Snapshot] White area styled for capture: <div class="white-area-overlay" ...>
[Snapshot] Verification: 2 white areas ready for capture
[Snapshot] White area 0: {
  display: "block",
  visibility: "visible", 
  opacity: "1",
  backgroundColor: "rgb(255, 255, 255)"
}
```

## Testing Checklist

### Before Submitting
- [ ] White overlays visible on page
- [ ] Console: `debugWhiteAreas()` shows "All visible: true"
- [ ] Console: No errors from html2canvas
- [ ] Multiple white areas working correctly
- [ ] Different page types tested (reader, readonly, authoring)

### After Submitting
- [ ] Snapshot received from server
- [ ] White areas present in snapshot
- [ ] No underlying page content visible in deleted areas
- [ ] Regular areas still have colors (not stripped)
- [ ] Deep block content visible where not deleted

## Advanced Debugging

### Check html2canvas Rendering
```javascript
// Capture and display locally
const { capturePageSnapshot } = await import('./services/pageCapture.service.js');
const snapshot = await capturePageSnapshot(pageContainerRef.current);

// Create img element to preview
const img = document.createElement('img');
img.src = snapshot;
img.style.maxWidth = '500px';
document.body.appendChild(img);

// Save as file
const link = document.createElement('a');
link.href = snapshot;
link.download = 'snapshot-debug.png';
link.click();
```

### Monitor Snapshot Capture
```javascript
// Add to onClickSubmit before snapshot
console.time('Snapshot capture');
const snapshot = await capturePageSnapshot(pageContainerRef.current);
console.timeEnd('Snapshot capture');
console.log('Snapshot size:', snapshot?.length || 0, 'bytes');
```

### Verify DOM Structure
```javascript
// Log entire container structure
console.log('Container structure:');
console.log(pageContainerRef.current);

// Check specific elements
console.log('White areas:', pageContainerRef.current.querySelectorAll('.white-area-overlay'));
console.log('Area boxes:', pageContainerRef.current.querySelectorAll('[style*="border"]'));
console.log('Images:', pageContainerRef.current.querySelectorAll('img'));
```

## Performance Impact

The enhanced logging will add minimal overhead:
- ✅ Console logs only (no performance impact in production)
- ✅ Queries only during snapshot (not on every render)
- ✅ Single pass through white areas

## Rollback Instructions

If issues occur, rollback to simpler version:

```javascript
// Minimal version (no white area preservation)
export async function capturePageSnapshot(containerEl) {
  if (!containerEl) return null;
  
  try {
    const canvas = await html2canvas(containerEl, {
      useCORS: true,
      backgroundColor: null,
    });
    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error('Snapshot error:', error);
    return null;
  }
}
```

## Next Steps

1. **Deploy** the updated code
2. **Test** by deleting deep blocks and submitting
3. **Monitor** console logs for issues
4. **Run** `debugWhiteAreas()` if problems occur
5. **Verify** snapshots include white areas

## Questions to Diagnose Further

If white areas still don't appear:

1. **Are they visible on page?** → YES/NO
2. **Does console show them in DOM?** → YES/NO
3. **Are they in the right position?** → YES/NO
4. **Does snapshot get created?** → YES/NO
5. **Does snapshot show page image?** → YES/NO
6. **Can we see other elements in snapshot?** → YES/NO

Provide answers to these and any console output for further debugging.

## Related Files

- `pageCapture.service.js` - Snapshot capture logic (UPDATED)
- `WhiteAreaOverlay.jsx` - Component (UPDATED)
- `whiteAreaUtils.js` - Debug helpers (NEW: debugWhiteAreas)
- `pageContainerRef` - Reference to container being captured
