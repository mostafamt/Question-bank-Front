# Tab Filtering - Quick Start Guide

**Status:** Ready to Implement
**Full Documentation:** See `TAB_FILTERING_IMPLEMENTATION_PLAN.md`

## What's Been Created

✅ **JSON Configuration** - `src/config/tabs.config.json`
- Defines all tabs for left and right sidebars
- Specifies which modes (reader/studio) each tab appears in
- Controls tab ordering and enabled/disabled status

✅ **Utility Functions** - `src/utils/tabFiltering.js`
- `useAppMode()` - React hook to detect reader vs studio mode from URL
- `getTabsForSidebar(position, mode)` - Get filtered tabs for a sidebar
- `filterTabsByMode(tabs, mode)` - Filter tabs by mode
- Plus many more helper functions

✅ **Implementation Plan** - `docs/TAB_FILTERING_IMPLEMENTATION_PLAN.md`
- Complete step-by-step implementation guide
- Code examples for all changes needed
- Testing checklist
- Timeline estimates

## How It Works

### Mode Detection (URL-based)

```
Reader Mode:  /read/book/:bookId/chapter/:chapterId
Studio Mode:  /book/:bookId/chapter/:chapterId
```

The system automatically detects the mode by checking if `/read/` is in the URL path.

### Tab Configuration Example

```json
{
  "id": "block-authoring",
  "label": "Block Authoring",
  "modes": ["studio"],        // Only appears in studio mode
  "position": "right",
  "order": 5,
  "enabled": true
}
```

## Quick Implementation Steps

### Step 1: Test the Utilities (5 minutes)

```javascript
import { useAppMode, getTabsForSidebar } from '../utils/tabFiltering';

const MyComponent = () => {
  const mode = useAppMode(); // 'reader' or 'studio'
  console.log('Current mode:', mode);

  const leftTabs = getTabsForSidebar('left', mode);
  console.log('Left tabs:', leftTabs);

  return <div>Mode: {mode}</div>;
};
```

### Step 2: Update Studio Component (30 minutes)

In `src/components/Studio/Studio.jsx`:

```javascript
import { useAppMode } from '../../utils/tabFiltering';

const Studio = (props) => {
  // Detect mode from URL
  const mode = useAppMode();
  const isReaderMode = mode === 'reader';

  // Log for debugging
  console.log('Studio mode:', mode, 'URL:', window.location.pathname);

  // ... rest of component
};
```

### Step 3: Update Column Builders (2-3 hours)

See `TAB_FILTERING_IMPLEMENTATION_PLAN.md` Phase 2 for detailed code examples.

Key changes:
1. Import `getTabsForSidebar` utility
2. Get tab configs: `const tabConfigs = getTabsForSidebar('left', mode)`
3. Map configs to column objects using switch/case
4. Filter out null values

### Step 4: Test (1 hour)

**Reader Mode Test:**
```
Navigate to: /read/book/123/chapter/456
Expected: 4 left tabs, 4 right tabs (no Block Authoring, no Composite Blocks)
```

**Studio Mode Test:**
```
Navigate to: /book/123/chapter/456
Expected: 5 left tabs, 5 right tabs (includes Block Authoring & Composite Blocks)
```

## Current Tab Configuration

### Reader Mode (`/read/...`)

**Left Sidebar (4 tabs):**
1. Thumbnails
2. Recalls
3. Micro Learning
4. Enriching Content

**Right Sidebar (4 tabs):**
1. Table of Contents
2. Glossary & Keywords
3. Illustrative Interactions
4. Check Yourself

### Studio Mode (`/book/...`)

**Left Sidebar (5 tabs):**
1. Thumbnails
2. Recalls
3. Micro Learning
4. Enriching Content
5. Check Yourself

**Right Sidebar (5 tabs):**
1. Table of Contents
2. Glossary & Keywords
3. Illustrative Interactions
4. Block Authoring ⭐ (Studio only)
5. Composite Blocks ⭐ (Studio only)

## Modifying Tab Configuration

### To Add a New Tab

Edit `src/config/tabs.config.json`:

```json
{
  "id": "my-new-tab",
  "label": "My New Tab",
  "icon": "NewIcon",
  "modes": ["reader", "studio"],  // or just ["studio"]
  "position": "left",             // or "right"
  "order": 7,                     // Display order
  "component": "MyTabComponent",
  "enabled": true
}
```

### To Disable a Tab

Set `enabled: false`:

```json
{
  "id": "micro-learning",
  "enabled": false  // Won't appear in any mode
}
```

### To Make a Tab Studio-Only

Change modes array:

```json
{
  "id": "advanced-features",
  "modes": ["studio"]  // Only in studio, not reader
}
```

### To Reorder Tabs

Change the `order` field:

```json
{
  "id": "thumbnails",
  "order": 1  // First tab
},
{
  "id": "recalls",
  "order": 2  // Second tab
}
```

## Utility Functions Reference

```javascript
import {
  useAppMode,           // Hook: Get current mode
  getTabsForSidebar,    // Get filtered tabs for sidebar
  getTabById,           // Get specific tab config
  isTabVisibleInMode,   // Check if tab visible
  getTabCounts,         // Get tab counts per mode
  validateTabConfig,    // Validate configuration
} from '../utils/tabFiltering';

// Examples:
const mode = useAppMode();                    // 'reader' or 'studio'
const leftTabs = getTabsForSidebar('left', mode);
const tab = getTabById('thumbnails');
const isVisible = isTabVisibleInMode('block-authoring', 'reader'); // false
const counts = getTabCounts('reader');        // { left: 4, right: 4, total: 8 }
```

## Testing Checklist

### Reader Mode
- [ ] Navigate to `/read/book/123/chapter/456`
- [ ] Verify 4 left tabs appear
- [ ] Verify 4 right tabs appear
- [ ] Verify NO "Block Authoring" tab
- [ ] Verify NO "Composite Blocks" tab
- [ ] Verify "Check Yourself" on RIGHT sidebar

### Studio Mode
- [ ] Navigate to `/book/123/chapter/456`
- [ ] Verify 5 left tabs appear
- [ ] Verify 5 right tabs appear
- [ ] Verify "Block Authoring" tab present (right)
- [ ] Verify "Composite Blocks" tab present (right)
- [ ] Verify "Check Yourself" on LEFT sidebar

## Debugging

### Check Current Mode

```javascript
import { useAppMode } from '../utils/tabFiltering';

const mode = useAppMode();
console.log('Current mode:', mode);
console.log('URL:', window.location.pathname);
```

### Check Tab Configuration

```javascript
import { getTabsForSidebar, validateTabConfig } from '../utils/tabFiltering';

// Validate config
const validation = validateTabConfig();
console.log('Config valid?', validation.isValid);
if (!validation.isValid) {
  console.error('Errors:', validation.errors);
}

// Check tabs for current mode
const mode = 'reader'; // or 'studio'
const leftTabs = getTabsForSidebar('left', mode);
const rightTabs = getTabsForSidebar('right', mode);

console.log(`Left tabs (${mode}):`, leftTabs.map(t => t.label));
console.log(`Right tabs (${mode}):`, rightTabs.map(t => t.label));
```

## Common Issues

### Issue: All tabs showing in both modes

**Problem:** Column builders not using the filtering utilities yet.

**Solution:** Update column builders to use `getTabsForSidebar()` - see Phase 2 in implementation plan.

### Issue: Mode not detected correctly

**Problem:** URL might not match expected pattern.

**Solution:** Check URL format:
```javascript
console.log('URL:', window.location.pathname);
// Should be: /read/book/... for reader
// Should be: /book/... for studio
```

### Issue: Tab config not loading

**Problem:** JSON import issue.

**Solution:** Verify file exists at `src/config/tabs.config.json` and check for JSON syntax errors.

## Next Steps

1. ✅ Review the created files
2. ✅ Test utility functions
3. ⬜ Update Studio component (see Step 2)
4. ⬜ Update column builders (see Step 3)
5. ⬜ Test in browser (see Step 4)
6. ⬜ Complete testing checklist

## Files Created

```
src/
├── config/
│   └── tabs.config.json              ✅ Created
├── utils/
│   └── tabFiltering.js               ✅ Created
└── docs/
    ├── TAB_FILTERING_IMPLEMENTATION_PLAN.md  ✅ Created
    └── TAB_FILTERING_QUICK_START.md          ✅ Created (this file)
```

## Support

For detailed implementation instructions, see:
- **Full Plan:** `docs/TAB_FILTERING_IMPLEMENTATION_PLAN.md`
- **Feature Comparison:** `docs/READER_VS_STUDIO_FEATURES.md`

## Time Estimate

- **Quick Test:** 15 minutes (Steps 1-2)
- **Full Implementation:** 10-14 hours (All phases)
- **Just Column Builders:** 3-4 hours (Phase 2 only)

## Summary

You now have:
1. ✅ JSON configuration defining all tabs
2. ✅ Utility functions for mode detection and tab filtering
3. ✅ Complete implementation guide
4. ⬜ Ready to update Studio and column builders

Start with Step 1 to test the utilities, then proceed to Steps 2-4 for full implementation.
