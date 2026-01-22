# Reader vs Studio Mode Features Comparison

**Date:** 2025-11-27
**Author:** Claude Code
**Status:** Documentation

## Overview

This document provides a comprehensive comparison of features available in **Reader Mode (Book)** vs **Author Mode (Studio)**. The application has two distinct modes for interacting with educational content:

- **Reader Mode (Book):** Read-only mode for students to consume content
- **Author Mode (Studio):** Edit mode for content creators to author and manage educational blocks

## Mode Detection

The mode is determined by the `reader` prop:
- `reader={true}` → Reader Mode (Book)
- `reader={false}` or `reader={undefined}` → Author Mode (Studio)

## High-Level Comparison

| Aspect | Reader Mode (Book) | Author Mode (Studio) |
|--------|-------------------|---------------------|
| **Purpose** | Content consumption | Content creation/editing |
| **Primary User** | Students/Learners | Content Authors/Teachers |
| **Access Level** | Read-only | Full edit access |
| **Main Component** | BookTabsLayout | Studio |
| **Column Builders** | `buildReaderLeftColumns`<br>`buildReaderRightColumns` | `buildLeftColumns`<br>`buildRightColumns` |
| **File Location** | `src/components/Studio/columns/reader.columns.js` | `src/components/Studio/columns/index.js` |

## Tab Configuration

### Left Sidebar Tabs

| Tab Name | Reader Mode | Studio Mode | Position Difference |
|----------|-------------|-------------|-------------------|
| **Thumbnails** | ✅ Yes | ✅ Yes | Same (Left) |
| **Recalls** | ✅ Yes | ✅ Yes | Same (Left) |
| **Micro Learning** | ✅ Yes | ✅ Yes | Same (Left) |
| **Enriching Content** | ✅ Yes | ✅ Yes | Same (Left) |
| **Check Yourself** | ❌ No (on right) | ✅ Yes | **Different** (Right in Reader, Left in Studio) |

### Right Sidebar Tabs

| Tab Name | Reader Mode | Studio Mode | Description |
|----------|-------------|-------------|-------------|
| **Table of Contents** | ✅ Yes | ✅ Yes | Navigate through book structure |
| **Glossary & Keywords** | ✅ Yes | ✅ Yes | View/manage glossary terms |
| **Illustrative Interactions** | ✅ Yes | ✅ Yes | Interactive learning objects |
| **Check Yourself** | ✅ Yes | ❌ No (on left) | Self-assessment questions |
| **Block Authoring** | ❌ No | ✅ Yes | **Studio only** - Create/edit blocks |
| **Composite Blocks** | ❌ No | ✅ Yes | **Studio only** - Manage composite blocks |

### Tab Count Summary

| Mode | Left Tabs | Right Tabs | Total Tabs |
|------|-----------|------------|------------|
| **Reader** | 4 | 4 | 8 |
| **Studio** | 5 | 5 | 10 |

## Detailed Feature Comparison

### 1. Tab List Features (List Component)

**Location:** `src/components/Tabs/List/List.jsx`

| Feature | Reader Mode | Studio Mode | Implementation |
|---------|-------------|-------------|----------------|
| **View Items** | ✅ Yes | ✅ Yes | Both modes |
| **Plus Icon Button** | ❌ No | ✅ Yes | `{!reader && <IconButton>...}` (Line 223-229) |
| **Add New Items** | ❌ No | ✅ Yes | Via plus button |
| **Submit Button** | ❌ No | ✅ Yes | `{!reader && <Button>...}` (Line 232-245) |
| **Play Items** | ✅ Yes | ✅ Yes | Both modes |
| **Delete Items** | ❌ No | ✅ Yes | Via ListItem delete button |
| **Edit Items** | ❌ No | ✅ Yes | Via GlossaryListItem edit button |
| **Navigate to Block** | ✅ Yes | ✅ Yes | Both modes (different implementation) |

### 2. List Item Features (ListItem Component)

**Location:** `src/components/Tabs/ListItem/ListItem.jsx`

| Feature | Reader Mode | Studio Mode | Implementation |
|---------|-------------|-------------|----------------|
| **Item Name** | ✅ Yes | ✅ Yes | Both modes |
| **Play Button** | ✅ Yes | ✅ Yes | Both modes (Line 37-39) |
| **Navigation Arrows (Up/Down)** | ✅ Yes | ❌ No | `{reader && <span>...}` (Line 41-58) |
| **Delete Button** | ❌ No | ✅ Yes | `{!reader && <IconButton>...}` (Line 59-67) |
| **Navigate to Reference** | ✅ Yes | ❌ No | Via navigation arrows |

### 3. Glossary List Item Features (GlossaryListItem Component)

**Location:** `src/components/Tabs/GlossaryListItem/GlossaryListItem.jsx`

| Feature | Reader Mode | Studio Mode | Implementation |
|---------|-------------|-------------|----------------|
| **Expand/Collapse** | ✅ Yes | ✅ Yes | Both modes |
| **Term Display** | ✅ Yes | ✅ Yes | Both modes |
| **Definition Display** | ✅ Yes | ✅ Yes | Both modes |
| **Edit Button** | ❌ No | ✅ Yes | `{!reader && <IconButton>...}` (Line 88-92) |
| **Delete Button** | ❌ No | ✅ Yes | `{!reader && <IconButton>...}` (Line 115-119) |
| **Navigation Arrows (Up/Down)** | ✅ Yes | ❌ No | `{reader && <Box>...}` (Line 94-113) |
| **Navigate to Reference** | ✅ Yes | ❌ No | Via navigation arrows |

### 4. Thumbnails Component

| Feature | Reader Mode | Studio Mode | Component |
|---------|-------------|-------------|-----------|
| **Implementation** | BookThumnails | StudioThumbnails | Different components |
| **View Pages** | ✅ Yes | ✅ Yes | Both |
| **Click to Navigate** | ✅ Yes | ✅ Yes | Both |
| **Active Page Highlight** | ✅ Yes | ✅ Yes | Both |
| **Page Upload** | ❌ No | ✅ Yes | Studio only |

### 5. Block Authoring Features

**Location:** `src/components/Studio/StudioActions/StudioActions.jsx`

| Feature | Reader Mode | Studio Mode | Description |
|---------|-------------|-------------|-------------|
| **Area Selection** | ❌ No | ✅ Yes | Select regions on page |
| **OCR Text Extraction** | ❌ No | ✅ Yes | Extract text from images |
| **Block Type Selection** | ❌ No | ✅ Yes | Choose block category |
| **Virtual Blocks Menu** | ❌ No | ✅ Yes | Overview, Notes, Recall, etc. |
| **Edit Block Text** | ❌ No | ✅ Yes | Modify extracted text |
| **Delete Block** | ❌ No | ✅ Yes | Remove blocks |
| **Auto-Generate** | ❌ No | ✅ Yes | AI-assisted content generation |
| **Submit Changes** | ❌ No | ✅ Yes | Save block modifications |
| **Toggle Virtual Blocks** | ❌ No | ✅ Yes | Show/hide virtual blocks |

### 6. Composite Blocks Features

**Location:** `src/components/Studio/StudioCompositeBlocks/StudioCompositeBlocks.jsx`

| Feature | Reader Mode | Studio Mode | Description |
|---------|-------------|-------------|-------------|
| **View Composite Blocks** | ❌ No | ✅ Yes | See grouped blocks |
| **Create Composite Block** | ❌ No | ✅ Yes | Group multiple blocks |
| **Edit Composite Block** | ❌ No | ✅ Yes | Modify grouped blocks |
| **Delete Composite Block** | ❌ No | ✅ Yes | Remove grouping |
| **Process Composite Block** | ❌ No | ✅ Yes | Apply transformations |
| **Submit Composite Blocks** | ❌ No | ✅ Yes | Save composite structure |
| **Highlight Blocks** | ❌ No | ✅ Yes | Visual feedback |

### 7. Navigation Features

| Feature | Reader Mode | Studio Mode | Implementation |
|---------|-------------|-------------|----------------|
| **Page Navigation** | ✅ Yes | ✅ Yes | Both modes |
| **Block Navigation** | ✅ Yes | ✅ Yes | Both modes |
| **Navigate to Block from Reference** | ✅ Yes | ✅ Yes | Both modes |
| **Navigation Method** | `navigateToBlock(pageId, blockId)` | `changePageById` + `getBlockFromBlockId` + `hightBlock` | Different approach |
| **Block Highlighting** | ✅ Yes | ✅ Yes | Both modes |
| **Navigation Arrows in Lists** | ✅ Yes | ❌ No | Reader only |

### 8. Table of Contents

| Feature | Reader Mode | Studio Mode | Implementation |
|---------|-------------|-------------|----------------|
| **View TOC** | ✅ Yes | ✅ Yes | Both modes |
| **Navigate via TOC** | ✅ Yes | ✅ Yes | Both modes |
| **Edit TOC** | ❌ No | ❌ No | Neither mode (managed elsewhere) |

## Props Comparison

### Reader Mode Props

```javascript
buildReaderLeftColumns({
  pages,           // Array of page objects
  activePage,      // Currently active page object
  setActivePage,   // Function to set active page
  onChangeActivePage, // Page change handler
  changePageById,  // Navigate by page ID
  navigateToBlock, // Navigate to block (pageId, blockId)
  chapterId,       // Current chapter ID
  thumbnailsRef,   // Ref for thumbnails
})

buildReaderRightColumns({
  pages,
  setActivePage,
  onChangeActivePage,
  changePageById,
  navigateToBlock,
  chapterId,
})
```

### Studio Mode Props

```javascript
buildLeftColumns({
  pages,              // Array of page objects
  chapterId,          // Current chapter ID
  activePageIndex,    // Active page index (not object)
  changePageByIndex,  // Navigate by index
  thumbnailsRef,      // Ref for thumbnails
  changePageById,     // Navigate by page ID
  getBlockFromBlockId, // Get block details
  hightBlock,         // Highlight block function
})

buildRightColumns({
  // Page navigation
  pages,
  activePageIndex,
  setActivePageIndex,
  changePageById,
  changePageByIndex,
  getBlockFromBlockId,
  hightBlock,

  // Block authoring
  areasProperties,
  setAreasProperties,
  onEditText,
  onClickDeleteArea,
  type,
  onClickSubmit,
  loadingSubmit,
  updateAreaProperty,
  updateAreaPropertyById,
  types,
  onChangeLabel,
  subObject,
  tOfActiveType,
  onSubmitAutoGenerate,
  loadingAutoGenerate,
  onClickToggleVirutalBlocks,
  showVB,

  // Composite blocks
  compositeBlocks,
  compositeBlocksTypes,
  onChangeCompositeBlocks,
  processCompositeBlock,
  onSubmitCompositeBlocks,
  loadingSubmitCompositeBlocks,
  DeleteCompositeBlocks,
  highlight,
  setHighlight,
  chapterId,
})
```

## Key Differences Summary

### Reader Mode (Book) Characteristics

1. **Read-Only Access**
   - No editing capabilities
   - No add/delete buttons
   - No submission forms

2. **Navigation-Focused**
   - Arrow buttons to navigate to block references
   - Simplified navigation interface
   - Focus on content consumption

3. **Minimal UI**
   - Clean, distraction-free interface
   - Only essential viewing features
   - No authoring tools

4. **Tab Organization**
   - Check Yourself on right sidebar
   - No authoring tabs
   - 4 tabs per sidebar

### Studio Mode (Author) Characteristics

1. **Full Edit Access**
   - Create, edit, delete blocks
   - Add/remove items from lists
   - OCR and text extraction

2. **Authoring Tools**
   - Block Authoring tab with area selection
   - Composite Blocks tab for grouping
   - Virtual blocks menu
   - Auto-generate features

3. **Rich UI**
   - Multiple action buttons
   - Forms and inputs
   - Submit/save functionality

4. **Tab Organization**
   - Check Yourself on left sidebar
   - Additional authoring tabs
   - 5 tabs per sidebar

## Implementation Files

### Column Builders

| Mode | File | Functions |
|------|------|-----------|
| **Reader** | `src/components/Studio/columns/reader.columns.js` | `buildReaderLeftColumns`<br>`buildReaderRightColumns` |
| **Studio** | `src/components/Studio/columns/index.js` | `buildLeftColumns`<br>`buildRightColumns` |

### Layout Components

| Mode | File | Component |
|------|------|-----------|
| **Reader** | `src/layouts/BookTabsLayout/BookTabsLayout.jsx` | BookTabsLayout |
| **Studio** | `src/components/Studio/Studio.jsx` | Studio |

### Shared Components

| Component | File | Used By |
|-----------|------|---------|
| **List** | `src/components/Tabs/List/List.jsx` | Both (conditional rendering) |
| **ListItem** | `src/components/Tabs/ListItem/ListItem.jsx` | Both (conditional rendering) |
| **GlossaryListItem** | `src/components/Tabs/GlossaryListItem/GlossaryListItem.jsx` | Both (conditional rendering) |
| **TableOfContents** | `src/components/Book/TableOfContents/TableOfContents.jsx` | Both |

### Mode-Specific Components

| Component | File | Mode |
|-----------|------|------|
| **BookThumnails** | `src/components/Book/BookThumnails/BookThumnails.jsx` | Reader only |
| **StudioThumbnails** | `src/components/Studio/StudioThumbnails/StudioThumbnails.jsx` | Studio only |
| **StudioActions** | `src/components/Studio/StudioActions/StudioActions.jsx` | Studio only |
| **StudioCompositeBlocks** | `src/components/Studio/StudioCompositeBlocks/StudioCompositeBlocks.jsx` | Studio only |

## Conditional Rendering Pattern

The codebase uses a consistent pattern for mode-specific features:

```javascript
// Show only in Reader mode
{reader && (
  <NavigationArrows />
)}

// Show only in Studio mode
{!reader && (
  <EditingControls />
)}

// Different components based on mode
{reader ? (
  <ReadOnlyView />
) : (
  <EditableView />
)}
```

## Usage Examples

### Using Reader Mode

```javascript
import {
  buildReaderLeftColumns,
  buildReaderRightColumns,
} from "../../components/Studio/columns";

// In BookTabsLayout component
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
  setActivePage,
  onChangeActivePage,
  changePageById,
  navigateToBlock,
  chapterId,
});
```

### Using Studio Mode

```javascript
import {
  buildLeftColumns,
  buildRightColumns,
} from "./columns";

// In Studio component
const LEFT_COLUMNS = buildLeftColumns({
  pages,
  chapterId,
  activePageIndex,
  changePageByIndex,
  thumbnailsRef,
  changePageById,
  getBlockFromBlockId,
  hightBlock,
});

const RIGHT_COLUMNS = buildRightColumns({
  // All authoring-specific props
  areasProperties,
  setAreasProperties,
  // ... many more props
});
```

## Future Enhancements

### Potential Shared Features

1. **Annotations**
   - Reader: View-only annotations
   - Studio: Create/edit annotations

2. **Bookmarks**
   - Reader: Add personal bookmarks
   - Studio: Suggest important bookmarks

3. **Progress Tracking**
   - Reader: Track reading progress
   - Studio: View student progress analytics

### Potential Reader-Only Features

1. **Text-to-Speech**
   - Audio narration of content

2. **Highlighting**
   - Student-created highlights

3. **Notes**
   - Personal notes on content

### Potential Studio-Only Features

1. **Version Control**
   - Track content changes
   - Rollback capabilities

2. **Collaboration**
   - Multi-author editing
   - Review workflows

3. **Analytics Dashboard**
   - Content effectiveness metrics
   - Student engagement data

## Testing Checklist

### Reader Mode Tests

- [ ] All reader tabs load correctly
- [ ] Navigation arrows work in lists
- [ ] No edit/delete buttons visible
- [ ] No add buttons visible
- [ ] No submit buttons visible
- [ ] Block navigation works
- [ ] Page navigation works
- [ ] Glossary items are read-only

### Studio Mode Tests

- [ ] All studio tabs load correctly
- [ ] Block Authoring tab present
- [ ] Composite Blocks tab present
- [ ] Area selection works
- [ ] OCR extraction works
- [ ] Add buttons functional
- [ ] Delete buttons functional
- [ ] Submit buttons functional
- [ ] Virtual blocks menu works
- [ ] Edit functionality works

## Conclusion

The application maintains a clear separation between **Reader Mode (Book)** for content consumption and **Studio Mode (Author)** for content creation. This separation ensures:

- **Better UX:** Students see only relevant features
- **Cleaner Code:** Conditional rendering based on `reader` prop
- **Maintainability:** Separate column builders for each mode
- **Flexibility:** Easy to add mode-specific features

The `reader` prop acts as the single source of truth for determining which features are available, making the codebase predictable and maintainable.
