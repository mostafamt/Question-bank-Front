# BookTabsLayout Refactoring Plan

**Date:** 2025-11-27
**Author:** Claude Code
**Status:** Planning

## Objective

Refactor BookTabsLayout to use centralized column builder functions (like Studio does), eliminating code duplication while respecting the differences between Reader and Author modes.

## Current State Analysis

### Studio Columns (Author Mode)

**Location:** `src/components/Studio/columns/index.js`

**Left Columns:**
- Thumbnails
- Recalls
- Micro Learning
- Enriching Content
- Check Yourself

**Right Columns:**
- **Block Authoring** ⚠️ (Author only - for creating/editing blocks)
- **Composite Blocks** ⚠️ (Author only - for creating composite blocks)
- Table of Contents
- Glossary & Keywords
- Illustrative Interactions

**Props Used:**
- No `reader` prop (or falsy/undefined)
- `changePageByIndex`, `changePageById`
- `getBlockFromBlockId`, `hightBlock`
- Author-specific props (areasProperties, types, etc.)

### BookTabsLayout Columns (Reader Mode)

**Location:** `src/layouts/BookTabsLayout/BookTabsLayout.jsx`

**Left Columns:**
- Thumbnails
- Recalls
- Micro Learning
- Enriching Contents

**Right Columns:**
- Table Of Contents
- Glossary & keywords
- Illustrative Interactions
- Check Yourself ⚠️ (On right in Reader, on left in Studio)

**Props Used:**
- `reader={true}` ✅ (Always true in Book mode)
- `changePageById`, `navigateToBlock`
- `activePage`, `setActivePage`, `onChangeActivePage`
- No author-specific props

### Key Differences

| Aspect | Studio (Author) | Book (Reader) |
|--------|----------------|---------------|
| **Block Authoring tab** | ✅ Present (right) | ❌ Not present |
| **Composite Blocks tab** | ✅ Present (right) | ❌ Not present |
| **Check Yourself placement** | Left side | Right side |
| **reader prop** | undefined/falsy | true |
| **Navigation functions** | changePageByIndex, changePageById | changePageById, navigateToBlock |
| **Purpose** | Content authoring | Content reading |

## Problem Statement

**Current Issues:**

1. **Code Duplication**
   - BookTabsLayout manually builds columns (102-215 lines)
   - Studio uses column builders (columns/index.js)
   - Same tabs defined in multiple places
   - Changes need to be made in two locations

2. **Inconsistent Tab Constants**
   - Studio uses LEFT_TAB_NAMES/RIGHT_TAB_NAMES from constants
   - BookTabsLayout defines its own constants (RECALLS, etc.)
   - Duplication of tab definitions

3. **Different Column Requirements**
   - Studio needs authoring tabs (Block Authoring, Composite Blocks)
   - Reader doesn't need these tabs
   - Check Yourself in different positions

4. **Prop Differences**
   - Studio columns receive author-specific props
   - Reader columns receive reader-specific props
   - Can't use same builder function directly

## Proposed Solution

### Approach: Create Reader-Specific Column Builders

Create new column builder functions specifically for reader mode, alongside the existing Studio builders.

**File Structure:**
```
src/components/Studio/columns/
├── index.js              # Exports all builders
├── studio.columns.js     # Studio-specific builders (author mode)
└── reader.columns.js     # NEW: Reader-specific builders (book mode)
```

**Alternative names:**
- `book.columns.js` (clearer purpose)
- `reader.columns.js` (matches `reader` prop naming)

### Implementation Strategy

#### Option 1: Separate Reader Builders (Recommended)

Create dedicated `buildReaderLeftColumns()` and `buildReaderRightColumns()` functions.

**Pros:**
- Clear separation of concerns
- No complex conditionals in builder logic
- Easy to understand reader-specific requirements
- Type safety (different parameters)

**Cons:**
- Some duplication (shared tabs like Recalls, Glossary)
- Two sets of builders to maintain

#### Option 2: Unified Builders with Mode Parameter

Extend existing builders with a `mode` or `isReader` parameter.

**Pros:**
- Single source of truth for all tabs
- Less code duplication

**Cons:**
- Complex conditional logic
- Harder to maintain
- Mixing author and reader concerns
- More parameters needed

**Recommendation:** Use Option 1 (Separate Builders)

## Detailed Design

### Step 1: Create reader.columns.js

**File:** `src/components/Studio/columns/reader.columns.js`

```javascript
import { v4 as uuidv4 } from "uuid";
import BookThumnails from "../../Book/BookThumnails/BookThumnails";
import List from "../../Tabs/List/List";
import TableOfContents from "../../Book/TableOfContents/TableOfContents";
import GlossaryAndKeywords from "../../Tabs/GlossaryAndKeywords/GlossaryAndKeywords";
import { LEFT_TAB_NAMES, RIGHT_TAB_NAMES } from "../constants";

/**
 * Build left columns for Book/Reader mode
 * @param {Object} params
 * @param {Array} params.pages - Array of page objects
 * @param {Object} params.activePage - Currently active page
 * @param {Function} params.setActivePage - Set active page
 * @param {Function} params.onChangeActivePage - Page change handler
 * @param {Function} params.changePageById - Navigate to page by ID
 * @param {Function} params.navigateToBlock - Navigate to block
 * @param {string} params.chapterId - Current chapter ID
 * @param {Object} params.thumbnailsRef - Ref for thumbnails component
 * @returns {Array} Array of column configurations
 */
export const buildReaderLeftColumns = ({
  pages,
  activePage,
  setActivePage,
  onChangeActivePage,
  changePageById,
  navigateToBlock,
  chapterId,
  thumbnailsRef,
}) => {
  return [
    {
      id: uuidv4(),
      label: LEFT_TAB_NAMES.THUMBNAILS.label,
      component: (
        <BookThumnails
          pages={pages}
          activePage={activePage}
          setActivePage={setActivePage}
          onChangeActivePage={onChangeActivePage}
          ref={thumbnailsRef}
        />
      ),
    },
    {
      id: uuidv4(),
      label: LEFT_TAB_NAMES.RECALLS.label,
      component: (
        <List
          chapterId={chapterId}
          tab={LEFT_TAB_NAMES.RECALLS}
          reader
          changePageById={changePageById}
          navigateToBlock={navigateToBlock}
        />
      ),
    },
    {
      id: uuidv4(),
      label: LEFT_TAB_NAMES.MICRO_LEARNING.label,
      component: (
        <List
          chapterId={chapterId}
          tab={LEFT_TAB_NAMES.MICRO_LEARNING}
          reader
          changePageById={changePageById}
          navigateToBlock={navigateToBlock}
        />
      ),
    },
    {
      id: uuidv4(),
      label: LEFT_TAB_NAMES.ENRICHING_CONTENT.label,
      component: (
        <List
          chapterId={chapterId}
          tab={LEFT_TAB_NAMES.ENRICHING_CONTENT}
          reader
          changePageById={changePageById}
          navigateToBlock={navigateToBlock}
        />
      ),
    },
  ];
};

/**
 * Build right columns for Book/Reader mode
 * @param {Object} params
 * @param {Array} params.pages - Array of page objects
 * @param {Object} params.activePage - Currently active page
 * @param {Function} params.setActivePage - Set active page
 * @param {Function} params.onChangeActivePage - Page change handler
 * @param {Function} params.changePageById - Navigate to page by ID
 * @param {Function} params.navigateToBlock - Navigate to block
 * @param {string} params.chapterId - Current chapter ID
 * @returns {Array} Array of column configurations
 */
export const buildReaderRightColumns = ({
  pages,
  activePage,
  setActivePage,
  onChangeActivePage,
  changePageById,
  navigateToBlock,
  chapterId,
}) => {
  return [
    {
      id: uuidv4(),
      label: RIGHT_TAB_NAMES.TABLE_OF_CONTENTS.label,
      component: (
        <TableOfContents
          pages={pages}
          setActivePage={setActivePage}
          chapterId={chapterId}
          onChangeActivePage={onChangeActivePage}
        />
      ),
    },
    {
      id: uuidv4(),
      label: RIGHT_TAB_NAMES.GLOSSARY_KEYWORDS.label,
      component: (
        <GlossaryAndKeywords
          chapterId={chapterId}
          changePageById={changePageById}
          navigateToBlock={navigateToBlock}
        />
      ),
    },
    {
      id: uuidv4(),
      label: RIGHT_TAB_NAMES.ILLUSTRATIVE_INTERACTIONS.label,
      component: (
        <List
          chapterId={chapterId}
          tab={RIGHT_TAB_NAMES.ILLUSTRATIVE_INTERACTIONS}
          reader
          changePageById={changePageById}
          navigateToBlock={navigateToBlock}
        />
      ),
    },
    {
      id: uuidv4(),
      label: LEFT_TAB_NAMES.CHECK_YOURSELF.label,
      component: (
        <List
          chapterId={chapterId}
          tab={LEFT_TAB_NAMES.CHECK_YOURSELF}
          reader
          changePageById={changePageById}
          navigateToBlock={navigateToBlock}
        />
      ),
    },
  ];
};
```

### Step 2: Update columns/index.js

Export the new reader builders:

```javascript
// Export Studio builders
export { buildLeftColumns, buildRightColumns } from "./studio.columns";

// Export Reader builders
export { buildReaderLeftColumns, buildReaderRightColumns } from "./reader.columns";
```

### Step 3: Rename Existing Builders

**File:** `src/components/Studio/columns/index.js`

Rename to make it clear these are Studio builders:

```javascript
// Before (current)
export const buildLeftColumns = (...) => { ... }
export const buildRightColumns = (...) => { ... }

// After (clearer naming)
// Option A: Move to studio.columns.js and re-export
// Option B: Keep in index.js but add comments
```

**Recommendation:** Move to `studio.columns.js` for clarity.

### Step 4: Update BookTabsLayout

**File:** `src/layouts/BookTabsLayout/BookTabsLayout.jsx`

Replace manual column building with builder functions:

```javascript
import {
  buildReaderLeftColumns,
  buildReaderRightColumns,
} from "../../components/Studio/columns";

const BookTabsLayout = React.forwardRef((props, ref) => {
  const {
    children,
    pages: newPages,
    chapterId,
    activePage,
    setActivePage,
    onChangeActivePage,
    getBlockFromBlockId,
    hightBlock,
  } = props;

  // Navigation functions
  const changePageById = React.useCallback(/* ... */);
  const navigateToBlock = React.useCallback(/* ... */);

  // Build columns using centralized functions
  const LEFT_COLUMNS = buildReaderLeftColumns({
    pages: newPages,
    activePage,
    setActivePage,
    onChangeActivePage,
    changePageById,
    navigateToBlock,
    chapterId,
    thumbnailsRef: ref,
  });

  const RIGHT_COLUMNS = buildReaderRightColumns({
    pages: newPages,
    activePage,
    setActivePage,
    onChangeActivePage,
    changePageById,
    navigateToBlock,
    chapterId,
  });

  return (
    <div className={styles["book-content-layout"]}>
      <BookColumns2
        columns={LEFT_COLUMNS}
        activePage={activePage}
        setActivePage={setActivePage}
      />
      <div>{children}</div>
      <BookColumns2 columns={RIGHT_COLUMNS} />
    </div>
  );
});
```

**Changes:**
- Remove manual column building (lines 102-215)
- Remove local tab constants (lines 25-35)
- Import and use builder functions
- Pass required parameters to builders

## File Changes Summary

### New Files

1. **`src/components/Studio/columns/reader.columns.js`**
   - Create `buildReaderLeftColumns()`
   - Create `buildReaderRightColumns()`
   - ~200 lines

### Files to Modify

1. **`src/components/Studio/columns/index.js`**
   - Export reader builders
   - Optionally move Studio builders to studio.columns.js
   - ~10 lines change

2. **`src/layouts/BookTabsLayout/BookTabsLayout.jsx`**
   - Import reader builders
   - Remove manual column building
   - Remove local tab constants
   - Use builder functions
   - ~120 lines removed, ~15 lines added

### Optional Files (Better Organization)

3. **`src/components/Studio/columns/studio.columns.js`**
   - Move existing buildLeftColumns/buildRightColumns
   - Keep them focused on Studio/author mode

## Implementation Steps

1. ✅ **Step 1:** Create `reader.columns.js`
   - Implement `buildReaderLeftColumns()`
   - Implement `buildReaderRightColumns()`

2. ✅ **Step 2:** Update `columns/index.js`
   - Export reader builders

3. ✅ **Step 3:** Update `BookTabsLayout.jsx`
   - Import builders
   - Remove manual columns
   - Use builder functions

4. ✅ **Step 4:** Test compilation
   - Ensure no errors
   - Verify imports work

5. ✅ **Step 5:** Visual testing
   - Test Book reader
   - Verify all tabs work
   - Check navigation functionality

## Benefits

### Code Quality

1. **Reduced Duplication**
   - Single source for reader column definitions
   - Shared tab constants from Studio constants
   - Easier maintenance

2. **Consistency**
   - Same pattern as Studio
   - Centralized column building
   - Predictable structure

3. **Maintainability**
   - Changes in one place
   - Clear separation (Studio vs Reader)
   - Type-safe parameters

### Developer Experience

1. **Clear Organization**
   - columns/studio.columns.js - Author mode
   - columns/reader.columns.js - Reader mode
   - Easy to find and modify

2. **Reusability**
   - Reader builders can be used in other reader contexts
   - Studio builders focused on authoring
   - Clean API

## Edge Cases & Considerations

### Edge Case 1: Check Yourself Position

**Issue:** Check Yourself is on left in Studio, right in Reader

**Solution:** Include in appropriate builder:
- Studio: `buildLeftColumns()` includes it
- Reader: `buildReaderRightColumns()` includes it

### Edge Case 2: Tab Name Differences

**Issue:** "Enriching Contents" vs "Enriching Content"

**Current:**
- Studio: "Enriching Content" (from LEFT_TAB_NAMES)
- Reader: "Enriching Contents" (hardcoded)

**Solution:** Use constants consistently, update label if needed

### Edge Case 3: Props Interface

**Issue:** Different props between Studio and Reader

**Solution:** Clear parameter documentation, TypeScript types if needed

### Edge Case 4: Future Tabs

**Issue:** Adding new tabs to Reader or Studio

**Solution:**
- Studio tabs: Add to studio.columns.js
- Reader tabs: Add to reader.columns.js
- Shared tabs: Add to both

## Testing Plan

### Test Cases

**Test 1: Book Reader Left Tabs**
- [ ] Thumbnails tab works
- [ ] Recalls tab works
- [ ] Micro Learning tab works
- [ ] Enriching Content tab works

**Test 2: Book Reader Right Tabs**
- [ ] Table of Contents works
- [ ] Glossary & Keywords works
- [ ] Illustrative Interactions works
- [ ] Check Yourself works

**Test 3: Navigation**
- [ ] changePageById works
- [ ] navigateToBlock works
- [ ] Block highlighting works
- [ ] Thumbnail scrolling works

**Test 4: Studio (No Regression)**
- [ ] Studio left tabs still work
- [ ] Studio right tabs still work
- [ ] Block Authoring still present
- [ ] Composite Blocks still present

## Success Criteria

- [ ] BookTabsLayout uses builder functions
- [ ] No manual column definitions in BookTabsLayout
- [ ] All reader tabs functional
- [ ] Navigation works correctly
- [ ] No compilation errors
- [ ] Studio functionality unchanged
- [ ] Code reduction in BookTabsLayout (~100 lines)

## Future Enhancements

### Phase 2: Shared Tab Components

Extract common tabs (Recalls, Glossary, etc.) into reusable functions:

```javascript
// shared.columns.js
export const createRecallsTab = ({ chapterId, reader, ...navProps }) => ({
  id: uuidv4(),
  label: LEFT_TAB_NAMES.RECALLS.label,
  component: (
    <List
      chapterId={chapterId}
      tab={LEFT_TAB_NAMES.RECALLS}
      reader={reader}
      {...navProps}
    />
  ),
});
```

Use in both Studio and Reader builders.

### Phase 3: TypeScript Types

Add TypeScript interfaces for column builder parameters:

```typescript
interface StudioColumnParams {
  pages: Page[];
  activePageIndex: number;
  // ... Studio-specific params
}

interface ReaderColumnParams {
  pages: Page[];
  activePage: Page;
  // ... Reader-specific params
}
```

## Rollback Plan

If issues arise:

1. **Revert BookTabsLayout Changes**
   - Restore manual column building
   - Remove builder imports
   - Keep working as before

2. **Keep New Files**
   - reader.columns.js can stay for future use
   - No impact on existing code

3. **Incremental Approach**
   - Implement left columns first
   - Test thoroughly
   - Then implement right columns

## Notes

- The `position` property in BookTabsLayout columns seems unused
- All columns have `position: LEFT_POSITION` even on right side
- May be legacy code, can be removed

## References

- Studio columns: `src/components/Studio/columns/index.js`
- BookTabsLayout: `src/layouts/BookTabsLayout/BookTabsLayout.jsx:102-215`
- Tab constants: `src/components/Studio/constants/tabs.constants.js`
- List component: `src/components/Tabs/List/List.jsx`
