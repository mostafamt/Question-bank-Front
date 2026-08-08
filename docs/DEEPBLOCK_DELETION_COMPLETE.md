# Deep Block Deletion Feature - Complete Implementation Guide

## Overview
This document provides a comprehensive guide to the complete deep block deletion feature implementation across all three phases. The feature allows users to delete deep block areas in the Studio editor, with deleted areas appearing as white/empty regions in the page snapshot.

## Feature Summary

### What It Does
When a user deletes a deep block area in the Studio editor:
1. ✅ The area is removed from the editor (Phase 1)
2. ✅ A white overlay appears at that location (Phase 2)
3. ✅ The white area is captured in the page snapshot (Phase 3)
4. ✅ The snapshot is submitted with the page data

### User Experience Flow
```
User seletes deep block
    ↓
White area appears visually
    ↓
User clicks Submit
    ↓
System hides UI chrome
    ↓
System captures snapshot (white areas included)
    ↓
System restores UI chrome
    ↓
Snapshot sent with submission
```

## Complete Architecture

### State Management (Phase 1)
**File:** `useAreaManagement.js`

```
deletedDeepBlockAreas: [
  // Page 0
  [
    { id, x, y, width, height, unit }
  ],
  // Page 1
  [
    // ...
  ]
]
```

**Key Functions:**
- `addDeletedDeepBlockArea(area, areaProps)` - Store deleted block coordinates
- `onClickDeleteArea(idx)` - Detect deep blocks and track deletions

### Visual Rendering (Phase 2)
**File:** `WhiteAreaOverlay.jsx`

```jsx
<WhiteAreaOverlay
  deletedAreas={deletedDeepBlockAreas[activePage]}
  visible={true}
/>
```

**Features:**
- Renders white rectangles at deleted area coordinates
- Non-interactive (pointer-events: none)
- Percentage or pixel-based positioning
- Included in all Studio display modes

### Snapshot Integration (Phase 3)
**File:** `pageCapture.service.js`

```javascript
capturePageSnapshot(containerEl)
  ├─ Uses html2canvas
  ├─ Preserves white areas
  ├─ Strips area selection styling
  └─ Returns PNG data URL
```

## File Structure

```
src/components/Studio/
├── hooks/
│   └── useAreaManagement.js          # State + detection logic
├── WhiteAreaOverlay/
│   ├── WhiteAreaOverlay.jsx          # Component
│   ├── index.js                      # Exports
│   └── whiteAreaOverlay.module.scss  # Optional styling
├── services/
│   └── pageCapture.service.js        # Snapshot capture
├── utils/
│   ├── whiteAreaUtils.js             # Helper functions
│   └── __tests__/
│       └── whiteAreaUtils.test.js    # Unit tests
├── StudioAreaSelector/
│   └── StudioAreaSelector.jsx        # Renders overlays
├── StudioEditor/
│   └── StudioEditor.jsx              # Props pass-through
├── components/
│   └── StudioLayout.jsx              # Props flow
├── Studio.jsx                        # Source of data
└── context/
    └── StudioContext.jsx             # Auto-exports via spread
```

## Data Flow Chain

### Phase 1: State Creation & Detection
```
useAreaManagement.js
├─ State: deletedDeepBlockAreas
├─ Hook: addDeletedDeepBlockArea()
└─ Detector: onClickDeleteArea()
   ├─ Check: isDeepBlock(areaProps)
   ├─ If true: Store in deletedDeepBlockAreas
   └─ Then: Proceed with normal deletion
```

### Phase 2: Visual Rendering
```
Studio.jsx (destructures from hook)
  ↓
StudioLayout.jsx (passes down)
  ↓
StudioEditor.jsx (spreads {...props})
  ↓
StudioAreaSelector.jsx (receives)
  ├─ Renders in 5+ display modes
  └─ WhiteAreaOverlay (draws overlays)
```

### Phase 3: Snapshot Capture
```
onClickSubmit()
├─ Check: hasDeepBlock
├─ Yes: Hide UI styling
├─ Wait: 50ms for React
├─ Capture: capturePageSnapshot()
│  └─ onclone hook:
│     ├─ Skip white areas
│     ├─ Strip area UI
│     └─ Force white visibility
├─ Restore: Show UI styling
└─ Submit: Send with snapshot
```

## Implementation Details

### Phase 1: State Management

**Key Code Pattern:**
```javascript
// In useAreaManagement hook
const [deletedDeepBlockAreas, setDeletedDeepBlockAreas] = useState(() =>
  pages.map(() => [])
);

const addDeletedDeepBlockArea = (area, areaProps) => {
  setDeletedDeepBlockAreas((prevState) => {
    const newDeletedAreas = [...prevState];
    newDeletedAreas[activePageIndex] = [
      ...newDeletedAreas[activePageIndex],
      {
        id: areaProps.id,
        x: area._percentX ?? area.x,
        y: area._percentY ?? area.y,
        width: area._percentWidth ?? area.width,
        height: area._percentHeight ?? area.height,
        unit: area._unit || "percentage",
      },
    ];
    return newDeletedAreas;
  });
};

const onClickDeleteArea = (idx) => {
  const area = areas[activePageIndex]?.[idx];
  const areaProps = areasProperties[activePageIndex]?.[idx];
  
  // NEW: Check if deep block
  if (isDeepBlock(areaProps)) {
    addDeletedDeepBlockArea(area, areaProps);
  }
  
  // ... existing deletion logic ...
};
```

### Phase 2: Visual Rendering

**Key Code Pattern:**
```jsx
// In StudioAreaSelector - all render modes
<div style={{ position: "relative" }}>
  {/* Regular areas/content */}
  
  {/* NEW: White areas for deleted deep blocks */}
  <WhiteAreaOverlay
    deletedAreas={deletedDeepBlockAreas[activePage]}
    visible={true}
  />
  
  {/* Page image */}
  <img src={imageSource} />
</div>
```

### Phase 3: Snapshot Integration

**Key Code Pattern:**
```javascript
// In pageCapture.service.js
export async function capturePageSnapshot(containerEl) {
  return await html2canvas(containerEl, {
    useCORS: true,
    backgroundColor: null,
    onclone: (clonedDoc, clonedEl) => {
      Array.from(clonedEl.children).forEach((child) => {
        // Preserve white areas
        if (child.classList?.contains('white-area-overlay')) {
          return;
        }
        
        // Strip area selection styling
        child.style.setProperty('border', 'none', 'important');
        child.style.setProperty('background-color', 'transparent', 'important');
        child.style.setProperty('box-shadow', 'none', 'important');
      });
      
      // Ensure white areas visible
      clonedEl.querySelectorAll('.white-area-overlay').forEach((area) => {
        area.style.setProperty('display', 'block', 'important');
        area.style.setProperty('visibility', 'visible', 'important');
        area.style.setProperty('opacity', '1', 'important');
      });
    },
  });
}
```

## API Reference

### useAreaManagement Hook
**Returns:**
```javascript
{
  // ... existing properties ...
  deletedDeepBlockAreas,           // 2D array of deleted areas
  setDeletedDeepBlockAreas,        // State setter
  // ... other properties ...
}
```

### WhiteAreaOverlay Component
**Props:**
```javascript
{
  deletedAreas: Array,   // [{ id, x, y, width, height, unit }, ...]
  visible: Boolean,      // default: true
  opacity: Number,       // default: 1
}
```

### Utility Functions
**Available from `whiteAreaUtils.js`:**
```javascript
hasDeletedDeepBlocks(areas, pageIdx)           // → boolean
getWhiteAreaElements(container)                // → HTMLElement[]
verifyWhiteAreasVisible(container)             // → verification object
ensureWhiteAreasVisible(container)             // → cleanup function
countDeletedDeepBlocks(areas, pageIdx)         // → number
getDeletedBlocksForPage(areas, pageIdx)        // → Array
calculateDeletedAreaCoverage(areas, pageIdx)   // → number (%)
findDeletedAreaAtPoint(areas, pageIdx, x, y)  // → area | null
```

## Testing & Verification

### Unit Tests
**Location:** `whiteAreaUtils.test.js`
- Tests for all 8 utility functions
- Mock DOM elements for integration tests
- Coverage for edge cases

**Run Tests:**
```bash
npm test -- whiteAreaUtils.test.js
```

### Integration Testing

**Test Scenario 1: Single Deep Block Deletion**
1. Create page with one deep block
2. Delete the deep block
3. Verify white area appears
4. Submit
5. Verify snapshot shows white area

**Test Scenario 2: Multiple Deep Block Deletion**
1. Create page with 3+ deep blocks
2. Delete some (but not all)
3. Submit
4. Verify snapshot shows:
   - White areas for deleted blocks
   - Original content for remaining blocks

**Test Scenario 3: Cross-Page Verification**
1. Create multiple pages with deleted blocks
2. Navigate between pages
3. Submit each page
4. Verify snapshots show white areas on correct pages

### Debug Helpers

**Check White Areas Visible:**
```javascript
import { verifyWhiteAreasVisible } from '../utils/whiteAreaUtils';

const result = verifyWhiteAreasVisible(pageContainerRef.current);
console.log(result);
// { count: 2, allVisible: true, details: [...] }
```

**Count Deleted Blocks:**
```javascript
import { countDeletedDeepBlocks } from '../utils/whiteAreaUtils';

const count = countDeletedDeepBlocks(deletedDeepBlockAreas, activePageIndex);
console.log(`Deleted blocks: ${count}`);
```

## Browser Compatibility

| Browser | Support |
|---------|---------|
| Chrome/Chromium | ✅ Full |
| Firefox | ✅ Full |
| Safari | ✅ Full |
| Edge | ✅ Full |
| IE 11 | ❌ Not supported |

## Performance Considerations

- **DOM Impact:** One `<div>` per deleted area (minimal)
- **Rendering:** React.memo on WhiteAreaOverlay component
- **Snapshot:** Single pass through white areas during capture
- **Memory:** O(n) where n = number of deleted deep blocks per page

## Known Limitations

| Limitation | Impact | Workaround |
|-----------|--------|-----------|
| Cross-origin iframes | Blank in snapshot | Embed content differently |
| Very large pages | Slow snapshot capture | Reduce page size |
| Many deleted blocks | More DOM elements | Delete less frequently |

## Troubleshooting

### White Areas Don't Appear
1. Verify `deletedDeepBlockAreas` has data
2. Check that `isDeepBlock(areaProps)` returns true
3. Verify StudioAreaSelector receives prop
4. Check browser console for errors

### Snapshot Doesn't Include White Areas
1. Run `verifyWhiteAreasVisible()` to check visibility
2. Check pageContainerRef is correctly assigned
3. Look for html2canvas errors in console
4. Verify onclone hook is executing

### Timing Issues During Snapshot
1. Increase delay from 50ms to 100ms+ in onClickSubmit
2. Check for other async operations
3. Verify React has finished rendering
4. Monitor performance profiler

## Future Enhancements

### Potential Improvements
- **Undo/Redo:** Recover deleted deep blocks
- **Batch Operations:** Delete multiple at once
- **Snapshot Preview:** Show snapshot before submit
- **Visual Indicators:** Show count of deleted blocks
- **Animations:** Animated deletion feedback
- **Keyboard Shortcuts:** Quick delete operations

### Optimization Opportunities
- Cache white area element queries
- Lazy-render white areas off-screen
- Stream large snapshots
- Implement worker threads for capture

## Migration Guide

### Upgrading from Previous Versions
If migrating from code without this feature:

1. **No breaking changes** - Fully backward compatible
2. **White areas optional** - Feature works without configuration
3. **Gradual adoption** - Can enable on subset of pages
4. **No data migration** - Existing data unaffected

## Maintenance Notes

### Code Review Checklist
- [ ] Tests pass: `npm test`
- [ ] No console errors
- [ ] White areas visible on all display modes
- [ ] Snapshot includes white areas
- [ ] Performance acceptable
- [ ] Browser compatibility verified

### Documentation Checklist
- [ ] User documentation updated
- [ ] API documentation current
- [ ] Code comments clear
- [ ] Examples provided
- [ ] Troubleshooting guide complete

## Support & Debugging

### Enable Debug Logging
```javascript
// In development
window.DEBUG_WHITE_AREAS = true;

// In code
if (window.DEBUG_WHITE_AREAS) {
  console.log('White areas:', deletedDeepBlockAreas);
  console.log('Verification:', verifyWhiteAreasVisible(container));
}
```

### Common Issues & Solutions

**Issue:** White areas disappear when navigating pages
- **Solution:** They're page-specific, navigation is correct behavior

**Issue:** Snapshot shows area borders with white overlay
- **Solution:** Verify `showBlocksStyling` is false during capture

**Issue:** White area opacity not affecting snapshot
- **Solution:** Opacity forced to 1 during capture (intentional)

## Version History

### v1.0.0 (Current)
- Phase 1: State management and detection
- Phase 2: Visual white area overlays
- Phase 3: Snapshot integration
- Utility functions and tests

## Contributing

To extend or modify this feature:

1. Keep phases separate and modular
2. Add tests for new functionality
3. Update documentation
4. Verify backward compatibility
5. Follow existing code patterns

## References

- **Plan Document:** `DEEPBLOCK_DELETION_PLAN.md`
- **Phase 1 Details:** `PHASE_1_IMPLEMENTATION_SUMMARY.md`
- **Phase 2 Details:** `PHASE_2_IMPLEMENTATION_SUMMARY.md`
- **Phase 3 Details:** `PHASE_3_IMPLEMENTATION_SUMMARY.md`
- **Utilities:** `whiteAreaUtils.js`
- **Tests:** `whiteAreaUtils.test.js`
- **Service:** `pageCapture.service.js`
- **Component:** `WhiteAreaOverlay.jsx`

## License
Same as parent project

## Contact & Support
For issues or questions, refer to project documentation or submit via issue tracker.
