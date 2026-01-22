# Tab Filtering Test Guide

**Status:** ✅ Implemented
**Date:** 2026-01-01
**Components Updated:**
- `src/components/Studio/columns/index.js` (Studio column builders)
- `src/components/Studio/columns/reader.columns.js` (Reader column builders)

## What Was Implemented

The column builders now dynamically filter tabs based on the current mode (reader vs studio) using the JSON configuration file.

### Changes Summary

**Studio Columns (`index.js`):**
1. ✅ Added `getTabsForSidebar` import
2. ✅ Updated `buildLeftColumns` to use tab filtering
3. ✅ Updated `buildRightColumns` to use tab filtering

**Reader Columns (`reader.columns.js`):**
1. ✅ Added `getTabsForSidebar` import
2. ✅ Updated `buildReaderLeftColumns` to use tab filtering
3. ✅ Updated `buildReaderRightColumns` to use tab filtering

### How It Works

Each column builder now:
1. Calls `getTabsForSidebar(position, mode)` to get filtered tab configs
2. Maps each config to a component using a switch statement
3. Filters out any null values (unknown tab IDs)
4. Returns the dynamically filtered columns

## Expected Tab Counts

### Reader Mode (`/read/book/...`)

**Left Sidebar: 4 tabs**
1. Thumbnails
2. Recalls
3. Micro Learning
4. Enriching Content

**Right Sidebar: 4 tabs**
1. Table of Contents
2. Glossary & Keywords
3. Illustrative Interactions
4. Check Yourself

**Total: 8 tabs**

### Studio Mode (`/book/...`)

**Left Sidebar: 5 tabs**
1. Thumbnails
2. Recalls
3. Micro Learning
4. Enriching Content
5. Check Yourself

**Right Sidebar: 5 tabs**
1. Table of Contents
2. Glossary & Keywords
3. Illustrative Interactions
4. Block Authoring ⭐ (Studio only)
5. Composite Blocks ⭐ (Studio only)

**Total: 10 tabs**

## Testing Instructions

### Prerequisites

1. Start the development server:
   ```bash
   npm start
   ```

2. Open browser DevTools console (F12)

### Test 1: Studio Mode URL

**URL:** `http://localhost:3000/book/YOUR_BOOK_ID/chapter/YOUR_CHAPTER_ID`

**Expected Results:**

✅ **Left Sidebar:**
- [ ] Thumbnails tab visible
- [ ] Recalls tab visible
- [ ] Micro Learning tab visible
- [ ] Enriching Content tab visible
- [ ] Check Yourself tab visible
- [ ] Total: 5 tabs

✅ **Right Sidebar:**
- [ ] Table of Contents tab visible
- [ ] Glossary & Keywords tab visible
- [ ] Illustrative Interactions tab visible
- [ ] Block Authoring tab visible ⭐
- [ ] Composite Blocks tab visible ⭐
- [ ] Total: 5 tabs

✅ **Console Logs:**
```javascript
📍 Studio Mode Detection: {
  mode: "studio",
  isReaderMode: false,
  pathname: "/book/...",
  ...
}
```

### Test 2: Reader Mode URL

**URL:** `http://localhost:3000/read/book/YOUR_BOOK_ID/chapter/YOUR_CHAPTER_ID`

**Expected Results:**

✅ **Left Sidebar:**
- [ ] Thumbnails tab visible
- [ ] Recalls tab visible
- [ ] Micro Learning tab visible
- [ ] Enriching Content tab visible
- [ ] Check Yourself tab NOT visible (should be on right)
- [ ] Total: 4 tabs

✅ **Right Sidebar:**
- [ ] Table of Contents tab visible
- [ ] Glossary & Keywords tab visible
- [ ] Illustrative Interactions tab visible
- [ ] Check Yourself tab visible (moved from left)
- [ ] Block Authoring tab NOT visible ❌
- [ ] Composite Blocks tab NOT visible ❌
- [ ] Total: 4 tabs

✅ **Console Logs:**
```javascript
📍 Studio Mode Detection: {
  mode: "reader",
  isReaderMode: true,
  pathname: "/read/book/...",
  ...
}
```

### Test 3: Tab Ordering

**Verify tabs appear in correct order:**

**Studio Left (order 1-5):**
1. Thumbnails
2. Recalls
3. Micro Learning
4. Enriching Content
5. Check Yourself

**Studio Right (order 1-5):**
1. Table of Contents
2. Glossary & Keywords
3. Illustrative Interactions
4. Block Authoring
5. Composite Blocks

**Reader Left (order 1-4):**
1. Thumbnails
2. Recalls
3. Micro Learning
4. Enriching Content

**Reader Right (order 1-4):**
1. Table of Contents
2. Glossary & Keywords
3. Illustrative Interactions
4. Check Yourself

### Test 4: Tab Functionality

For each visible tab, verify it works correctly:

**Thumbnails:**
- [ ] Shows page thumbnails
- [ ] Click navigates to page
- [ ] Active page highlighted

**Recalls:**
- [ ] Lists recall items
- [ ] Can play items
- [ ] (Studio) Can add/delete items
- [ ] (Reader) Navigation arrows work

**Micro Learning:**
- [ ] Lists micro learning items
- [ ] Can play items
- [ ] (Studio) Can add/delete items
- [ ] (Reader) Navigation arrows work

**Enriching Content:**
- [ ] Lists enriching content items
- [ ] Can play items
- [ ] (Studio) Can add/delete items
- [ ] (Reader) Navigation arrows work

**Table of Contents:**
- [ ] Shows book structure
- [ ] Navigation works
- [ ] Displays correctly in both modes

**Glossary & Keywords:**
- [ ] Lists glossary items
- [ ] Expand/collapse works
- [ ] (Studio) Can add/edit/delete
- [ ] (Reader) Navigation arrows work

**Illustrative Interactions:**
- [ ] Lists interaction items
- [ ] Can play items
- [ ] (Studio) Can add/delete items
- [ ] (Reader) Navigation arrows work

**Check Yourself:**
- [ ] (Studio) Appears on LEFT sidebar
- [ ] (Reader) Appears on RIGHT sidebar
- [ ] Lists self-assessment items
- [ ] Can play items
- [ ] (Studio) Can add/delete items
- [ ] (Reader) Navigation arrows work

**Block Authoring** (Studio only):
- [ ] Shows area selection interface
- [ ] Can create new blocks
- [ ] OCR functionality works
- [ ] Submit button works

**Composite Blocks** (Studio only):
- [ ] Shows composite block interface
- [ ] Can create composite blocks
- [ ] Can select areas
- [ ] Submit functionality works

### Test 5: Mode Switching

1. Navigate to Studio mode: `/book/123/chapter/456`
2. Verify 10 tabs total (5 left, 5 right)
3. Navigate to Reader mode: `/read/book/123/chapter/456`
4. Verify 8 tabs total (4 left, 4 right)
5. Use browser back button
6. Verify tabs switch back to Studio mode (10 tabs)
7. Use browser forward button
8. Verify tabs switch to Reader mode (8 tabs)

### Test 6: Console Warnings

Check console for any warnings:

**Should NOT see:**
- ❌ "Unknown left tab ID"
- ❌ "Unknown right tab ID"
- ❌ "Unknown reader left tab ID"
- ❌ "Unknown reader right tab ID"

**OK to see:**
- ✅ "📍 Studio Mode Detection" logs
- ✅ "✅ Tab configuration is valid" (from tabFiltering.js)

## Debugging

### Check Tab Configuration

Run this in browser console:

```javascript
import { getTabsForSidebar, getTabCounts } from './utils/tabFiltering';

// Check studio mode tabs
console.log('Studio Left:', getTabsForSidebar('left', 'studio'));
console.log('Studio Right:', getTabsForSidebar('right', 'studio'));
console.log('Studio Counts:', getTabCounts('studio'));

// Check reader mode tabs
console.log('Reader Left:', getTabsForSidebar('left', 'reader'));
console.log('Reader Right:', getTabsForSidebar('right', 'reader'));
console.log('Reader Counts:', getTabCounts('reader'));
```

### Check Column Builders

Add temporary logging to column builders:

```javascript
// In buildLeftColumns or buildReaderLeftColumns
const tabConfigs = getTabsForSidebar('left', 'studio');
console.log('📋 Tab Configs:', tabConfigs);
console.log('📋 Tab Count:', tabConfigs.length);
console.log('📋 Tab IDs:', tabConfigs.map(t => t.id));
```

### Verify JSON Config

1. Open `src/config/tabs.config.json`
2. Verify all tab IDs match the switch cases
3. Verify modes array is correct
4. Verify enabled is `true`

**Left Tab IDs:**
- `thumbnails`
- `recalls`
- `micro-learning`
- `enriching-content`
- `check-yourself-left` (studio only)

**Right Tab IDs:**
- `table-of-contents`
- `glossary-keywords`
- `illustrative-interactions`
- `check-yourself-right` (reader only)
- `block-authoring` (studio only)
- `composite-blocks` (studio only)

## Common Issues

### Issue 1: All tabs showing in both modes

**Problem:** JSON filtering not working

**Diagnosis:**
1. Check console for mode detection log
2. Verify mode is correct ('reader' or 'studio')
3. Check `tabs.config.json` modes array

**Solution:**
Verify in `tabs.config.json`:
```json
{
  "id": "block-authoring",
  "modes": ["studio"]  // NOT ["reader", "studio"]
}
```

### Issue 2: Tabs in wrong order

**Problem:** Tab order doesn't match config

**Diagnosis:**
1. Check `order` field in `tabs.config.json`
2. Verify `getTabsForSidebar` sorts by order

**Solution:**
Update order values in `tabs.config.json`:
```json
{
  "id": "thumbnails",
  "order": 1  // First
},
{
  "id": "recalls",
  "order": 2  // Second
}
```

### Issue 3: Tab missing

**Problem:** Expected tab not showing

**Diagnosis:**
1. Check `enabled` field in config
2. Check `modes` array includes current mode
3. Check switch case in column builder

**Solution:**
Verify all three:
```json
{
  "id": "my-tab",
  "enabled": true,  // ← Must be true
  "modes": ["studio", "reader"]  // ← Must include mode
}
```

And in column builder:
```javascript
case 'my-tab':  // ← Must match ID
  return { ... };
```

### Issue 4: "Unknown tab ID" warning

**Problem:** Tab ID in config not handled in switch

**Diagnosis:**
Check console for warning message

**Solution:**
Add missing case to switch statement:
```javascript
case 'new-tab-id':
  return {
    id: uuidv4(),
    label: config.label,
    component: <MyComponent />,
  };
```

### Issue 5: Check Yourself on wrong side

**Problem:** Check Yourself tab on wrong sidebar

**Diagnosis:**
1. Check mode (reader vs studio)
2. Check which builder is used

**Solution:**
- Reader mode: Check Yourself should use `check-yourself-right` (right sidebar)
- Studio mode: Check Yourself should use `check-yourself-left` (left sidebar)

## Performance Check

### Verify No Duplicate Renders

Add logging to column builders:
```javascript
console.log('🔨 Building left columns', Date.now());
```

**Expected:**
- Should only log once per page load
- Should log on mode change
- Should NOT log repeatedly

### Verify No Memory Leaks

1. Open Chrome DevTools → Performance
2. Record while switching between modes
3. Take heap snapshot before and after
4. Verify no significant memory increase

## Success Criteria

All checks must pass:

- [ ] Studio mode shows 5 left tabs ✓
- [ ] Studio mode shows 5 right tabs ✓
- [ ] Reader mode shows 4 left tabs ✓
- [ ] Reader mode shows 4 right tabs ✓
- [ ] Block Authoring only in Studio ✓
- [ ] Composite Blocks only in Studio ✓
- [ ] Check Yourself on left in Studio ✓
- [ ] Check Yourself on right in Reader ✓
- [ ] Tab order matches config ✓
- [ ] All tabs functional ✓
- [ ] No console warnings ✓
- [ ] Mode switching works ✓
- [ ] No performance issues ✓

## Next Steps

Once all tests pass:

1. ✅ Tab filtering working correctly
2. ⬜ (Optional) Remove debug console logs
3. ⬜ (Optional) Add tab filtering to other layouts
4. ⬜ (Optional) Add user preferences for tab visibility
5. ⬜ (Optional) Add A/B testing for tab configurations

## Documentation

- **Implementation Plan:** `docs/TAB_FILTERING_IMPLEMENTATION_PLAN.md`
- **Quick Start:** `docs/TAB_FILTERING_QUICK_START.md`
- **Mode Detection:** `docs/MODE_DETECTION_TEST_GUIDE.md`
- **Feature Comparison:** `docs/READER_VS_STUDIO_FEATURES.md`
- **Tab Config:** `src/config/tabs.config.json`

## Support

If you encounter issues:

1. Check console for errors/warnings
2. Verify JSON config is valid
3. Check mode detection is working
4. Review this test guide
5. Check implementation plan for details
