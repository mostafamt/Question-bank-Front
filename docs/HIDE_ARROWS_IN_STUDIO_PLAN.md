# Hide Navigation Arrows in Studio Plan

**Date:** 2025-11-27
**Author:** Claude Code
**Status:** Planning

## Objective

Update ListItem and GlossaryListItem components to show navigation arrows (up/down) only in Book/reader mode and hide them in Studio authoring mode.

## Current State Analysis

### Component Usage Context

**Book/Reader Mode:**
- Location: `src/layouts/BookTabsLayout/BookTabsLayout.jsx`
- Usage: List components receive `reader` prop (hardcoded as `true`)
- Purpose: Users navigate to blocks on the page for reading

**Studio Authoring Mode:**
- Location: `src/components/Studio/columns/index.js`
- Usage: List components don't receive `reader` prop (undefined/falsy)
- Purpose: Users manage content, add/edit/delete items

### Current Behavior

#### ListItem Component (`src/components/Tabs/ListItem/ListItem.jsx`)

**Lines 40-55: Navigation Arrows**
```javascript
<span className={styles["up-down"]}>
  <IconButton
    onClick={onClickUp}
    disabled={!hasReferences}
    sx={{ opacity: hasReferences ? 1 : 0.3 }}
  >
    <NorthIcon />
  </IconButton>
  <IconButton
    onClick={onClickDown}
    disabled={!hasReferences}
    sx={{ opacity: hasReferences ? 1 : 0.3 }}
  >
    <SouthIcon />
  </IconButton>
</span>
```

**Status:** ❌ Always shown (both Studio and Book)

**Lines 56-64: Delete Button**
```javascript
{reader ? (
  <></>
) : (
  <span>
    <IconButton onClick={() => onDelete(item._id)}>
      <DeleteIcon color="error" />
    </IconButton>
  </span>
)}
```

**Status:** ✅ Already conditional (hidden in reader mode)

#### GlossaryListItem Component (`src/components/Tabs/GlossaryListItem/GlossaryListItem.jsx`)

**Lines 92-109: Navigation Arrows**
```javascript
<Box className={styles["up-down"]}>
  <IconButton
    size="small"
    onClick={handleMoveUp}
    disabled={!hasReferences}
    sx={{ opacity: hasReferences ? 1 : 0.3 }}
  >
    <NorthIcon fontSize="small" />
  </IconButton>
  <IconButton
    size="small"
    onClick={handleMoveDown}
    disabled={!hasReferences}
    sx={{ opacity: hasReferences ? 1 : 0.3 }}
  >
    <SouthIcon fontSize="small" />
  </IconButton>
</Box>
```

**Status:** ❌ Always shown (both Studio and Book)

**Lines 86-90: Edit Button**
```javascript
{!reader && (
  <IconButton size="small" onClick={handleEdit}>
    <EditIcon fontSize="small" />
  </IconButton>
)}
```

**Status:** ✅ Already conditional (hidden in reader mode)

**Lines 111-115: Delete Button**
```javascript
{!reader && (
  <IconButton size="small" onClick={handleDelete}>
    <DeleteIcon fontSize="small" color="error" />
  </IconButton>
)}
```

**Status:** ✅ Already conditional (hidden in reader mode)

### Problem Statement

**Current Issues:**

1. **Navigation arrows always visible**
   - Shows in both Studio (authoring) and Book (reading) modes
   - Clutters Studio UI where navigation is not the primary use case
   - Inconsistent with Edit/Delete button behavior

2. **UX Confusion**
   - In Studio: Users are authoring content, arrows less useful
   - In Book: Users are reading, arrows help navigate to referenced content
   - Mixed signals about component purpose

3. **Inconsistent Conditional Rendering**
   - Edit/Delete buttons: Hidden in reader mode ✅
   - Navigation arrows: Always shown ❌
   - Should follow same pattern for consistency

### Expected Behavior

| Component | Button Type | Studio (reader=undefined) | Book (reader=true) |
|-----------|-------------|---------------------------|-------------------|
| ListItem | Play | ✅ Shown | ✅ Shown |
| ListItem | Up/Down Arrows | ❌ **Hidden** (NEW) | ✅ Shown |
| ListItem | Delete | ✅ Shown | ❌ Hidden |
| GlossaryListItem | Edit | ✅ Shown | ❌ Hidden |
| GlossaryListItem | Up/Down Arrows | ❌ **Hidden** (NEW) | ✅ Shown |
| GlossaryListItem | Delete | ✅ Shown | ❌ Hidden |

## Proposed Solution

### Approach

Use the existing `reader` prop pattern to conditionally render navigation arrows:
- **When `reader` is true** (Book mode): Show arrows
- **When `reader` is falsy/undefined** (Studio mode): Hide arrows

This matches the current pattern used for Edit/Delete buttons.

### Implementation Details

#### Option 1: Show Arrows Only in Reader Mode (Recommended)

Arrows are useful for navigation in reading mode but not needed in authoring mode.

```javascript
// Show arrows when reader=true
{reader && (
  <Box className={styles["up-down"]}>
    {/* Arrow buttons */}
  </Box>
)}
```

**Pros:**
- Clean Studio UI (no navigation clutter)
- Arrows available where needed (Book mode)
- Consistent with Edit/Delete pattern

**Cons:**
- Studio users can't use arrows to navigate (but they have other ways)

#### Option 2: Show Arrows Always (Current Behavior - NOT Recommended)

Keep arrows visible everywhere.

**Pros:**
- Studio users can navigate to blocks

**Cons:**
- Clutters Studio UI
- Inconsistent with Edit/Delete pattern

**Recommendation:** Use Option 1

### Code Changes

#### Change 1: ListItem Component

**File:** `src/components/Tabs/ListItem/ListItem.jsx`

**Current Code (Lines 40-55):**
```javascript
<span className={styles["up-down"]}>
  <IconButton
    onClick={onClickUp}
    disabled={!hasReferences}
    sx={{ opacity: hasReferences ? 1 : 0.3 }}
  >
    <NorthIcon />
  </IconButton>
  <IconButton
    onClick={onClickDown}
    disabled={!hasReferences}
    sx={{ opacity: hasReferences ? 1 : 0.3 }}
  >
    <SouthIcon />
  </IconButton>
</span>
```

**New Code:**
```javascript
{reader && (
  <span className={styles["up-down"]}>
    <IconButton
      onClick={onClickUp}
      disabled={!hasReferences}
      sx={{ opacity: hasReferences ? 1 : 0.3 }}
    >
      <NorthIcon />
    </IconButton>
    <IconButton
      onClick={onClickDown}
      disabled={!hasReferences}
      sx={{ opacity: hasReferences ? 1 : 0.3 }}
    >
      <SouthIcon />
    </IconButton>
  </span>
)}
```

**Changes:**
- Wrap arrows in `{reader && ( ... )}`
- No other changes needed

#### Change 2: GlossaryListItem Component

**File:** `src/components/Tabs/GlossaryListItem/GlossaryListItem.jsx`

**Current Code (Lines 92-109):**
```javascript
<Box className={styles["up-down"]}>
  <IconButton
    size="small"
    onClick={handleMoveUp}
    disabled={!hasReferences}
    sx={{ opacity: hasReferences ? 1 : 0.3 }}
  >
    <NorthIcon fontSize="small" />
  </IconButton>
  <IconButton
    size="small"
    onClick={handleMoveDown}
    disabled={!hasReferences}
    sx={{ opacity: hasReferences ? 1 : 0.3 }}
  >
    <SouthIcon fontSize="small" />
  </IconButton>
</Box>
```

**New Code:**
```javascript
{reader && (
  <Box className={styles["up-down"]}>
    <IconButton
      size="small"
      onClick={handleMoveUp}
      disabled={!hasReferences}
      sx={{ opacity: hasReferences ? 1 : 0.3 }}
    >
      <NorthIcon fontSize="small" />
    </IconButton>
    <IconButton
      size="small"
      onClick={handleMoveDown}
      disabled={!hasReferences}
      sx={{ opacity: hasReferences ? 1 : 0.3 }}
    >
      <SouthIcon fontSize="small" />
    </IconButton>
  </Box>
)}
```

**Changes:**
- Wrap arrows Box in `{reader && ( ... )}`
- No other changes needed

## File Changes Summary

### Files to Modify

1. **`src/components/Tabs/ListItem/ListItem.jsx`**
   - Wrap navigation arrows (lines 40-55) in `{reader && ( ... )}`
   - 1 line change (add conditional wrapper)

2. **`src/components/Tabs/GlossaryListItem/GlossaryListItem.jsx`**
   - Wrap navigation arrows Box (lines 92-109) in `{reader && ( ... )}`
   - 1 line change (add conditional wrapper)

### Files to Review (No Changes Needed)

1. **`src/layouts/BookTabsLayout/BookTabsLayout.jsx`**
   - Already passes `reader` prop correctly
   - No changes needed

2. **`src/components/Studio/columns/index.js`**
   - Doesn't pass `reader` prop (intentionally)
   - No changes needed

3. **`src/components/Tabs/List/List.jsx`**
   - Already passes `reader` prop to child components
   - No changes needed

## Implementation Steps

1. ✅ **Step 1:** Update `ListItem.jsx`
   - Add conditional wrapper around arrows
   - Test compilation

2. ✅ **Step 2:** Update `GlossaryListItem.jsx`
   - Add conditional wrapper around arrows
   - Test compilation

3. ✅ **Step 3:** Visual Testing in Studio
   - Open Studio component
   - Navigate to Glossary & Keywords tab
   - Verify arrows are hidden
   - Verify Edit/Delete buttons still visible

4. ✅ **Step 4:** Visual Testing in Book
   - Open Book reader
   - Navigate to Glossary & Keywords tab
   - Verify arrows are visible
   - Verify navigation works correctly

5. ✅ **Step 5:** Test Other Tabs
   - Test in Studio: Recalls, Micro Learning, Enriching Content, Check Yourself
   - Test in Book: Same tabs
   - Verify consistent behavior

## Testing Plan

### Test Cases

#### Studio Mode (reader = undefined)

**Test 1: Glossary & Keywords Tab**
- [ ] Open Studio
- [ ] Navigate to Glossary & Keywords (right tab)
- [ ] Verify up/down arrows are hidden
- [ ] Verify Edit button is visible
- [ ] Verify Delete button is visible
- [ ] Verify expand/collapse works

**Test 2: Illustrative Interactions Tab**
- [ ] Navigate to Illustrative Interactions (right tab)
- [ ] Verify up/down arrows are hidden (for ListItem)
- [ ] Verify Delete button is visible
- [ ] Verify Play button works

**Test 3: Left Tabs (Recalls, Micro Learning, etc.)**
- [ ] Navigate to each left tab
- [ ] Verify up/down arrows are hidden
- [ ] Verify Delete button is visible

#### Book/Reader Mode (reader = true)

**Test 4: Glossary & Keywords in Book**
- [ ] Open Book reader
- [ ] Navigate to Glossary & Keywords tab
- [ ] Verify up/down arrows are visible
- [ ] Click up arrow → navigates to reference
- [ ] Click down arrow → navigates to reference
- [ ] Verify Edit button is hidden
- [ ] Verify Delete button is hidden

**Test 5: Other Tabs in Book**
- [ ] Test Recalls, Micro Learning, etc.
- [ ] Verify up/down arrows visible and functional
- [ ] Verify Delete button hidden

#### Functional Testing

**Test 6: Navigation Functionality**
- [ ] In Book mode, click up arrow
- [ ] Verify page changes to correct page
- [ ] Verify block is highlighted
- [ ] Test with items that have no references
- [ ] Verify arrows are disabled (opacity 0.3)

**Test 7: UI Consistency**
- [ ] Compare Studio button layout before/after
- [ ] Verify no layout shifts when arrows hidden
- [ ] Check spacing/alignment of remaining buttons

## Expected Benefits

### User Experience

1. **Cleaner Studio UI**
   - Less visual clutter
   - Focus on authoring actions (Edit/Delete)
   - Navigation not primary use case in Studio

2. **Better Context Awareness**
   - Studio: Authoring-focused buttons only
   - Book: Reading-focused navigation buttons
   - Clear separation of concerns

3. **Consistent Behavior**
   - Edit/Delete: Hidden in reader
   - Arrows: Hidden in Studio
   - Same conditional rendering pattern

### Developer Experience

1. **Maintainable Code**
   - Consistent conditional rendering
   - Easy to understand component behavior
   - Follows existing patterns

2. **Clear Component Purpose**
   - Studio List: Content management
   - Book List: Content navigation
   - Purpose reflected in UI

## Edge Cases & Considerations

### Edge Case 1: List Component with No Reader Prop

**Scenario:** List used in a new context without `reader` prop

**Behavior:** Arrows hidden (same as Studio)

**Action:** Document that `reader={true}` is needed for navigation arrows

### Edge Case 2: Mixed Mode (Future)

**Scenario:** Want arrows in Studio for specific use case

**Solution:** Add a separate `showNavigation` prop or pass `reader={true}` explicitly

### Edge Case 3: Layout Shift

**Scenario:** Hiding arrows might cause layout shift

**Mitigation:** Test spacing/alignment carefully, adjust CSS if needed

## Rollback Plan

If issues arise:

1. **Revert Changes**
   - Remove conditional wrapper from ListItem
   - Remove conditional wrapper from GlossaryListItem
   - Arrows revert to always visible

2. **Alternative Approach**
   - Use separate `showNavigation` prop instead of `reader`
   - More explicit control over arrow visibility

## Success Criteria

- [ ] ListItem arrows hidden in Studio mode
- [ ] ListItem arrows visible in Book mode
- [ ] GlossaryListItem arrows hidden in Studio mode
- [ ] GlossaryListItem arrows visible in Book mode
- [ ] Edit/Delete buttons behavior unchanged
- [ ] Navigation functionality works in Book mode
- [ ] No layout shifts or visual regressions
- [ ] No compilation errors or warnings

## References

- ListItem implementation: `src/components/Tabs/ListItem/ListItem.jsx:40-55`
- GlossaryListItem implementation: `src/components/Tabs/GlossaryListItem/GlossaryListItem.jsx:92-109`
- Book usage: `src/layouts/BookTabsLayout/BookTabsLayout.jsx:119,133,147,189,203`
- Studio usage: `src/components/Studio/columns/index.js`
- List parent component: `src/components/Tabs/List/List.jsx:191,201`

## Notes

- The `reader` prop is already used for Edit/Delete conditional rendering
- No new props needed, just reuse existing pattern
- Minimal code changes (2 files, 1 line each)
- Low risk, high benefit change
- Aligns with component purpose (authoring vs reading)
