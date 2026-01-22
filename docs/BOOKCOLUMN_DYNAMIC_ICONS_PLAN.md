# BookColumn Dynamic Icons Plan

## Problem Statement
Currently, both `BookColumn` and `BookColumn2` components render the same `ContentCopyIcon` for all column tabs, regardless of the column's purpose or label. This makes it difficult to visually distinguish between different columns at a glance.

## Goal
Update the components to render **contextually appropriate MUI icons** based on each column's label, improving visual clarity and user experience.

## Current Implementation

### Components Using Generic Icons

**1. BookColumn.jsx** (line 38)
```jsx
<button key={column.id} onClick={() => onChangeActiveTab(column)}>
  <span>{column.label}</span>
  <ContentCopyIcon />  {/* ← Always the same icon */}
</button>
```

**2. BookColumn2.jsx** (line 63)
```jsx
<button key={column.id} onClick={() => setActiveColumn(column)}>
  <span>{column.label}</span>
  <ContentCopyIcon />  {/* ← Always the same icon */}
</button>
```

### Column Labels Identified

From `BookTabsLayout.jsx`, we have 8 distinct column labels:

**LEFT_COLUMNS:**
1. "Thumbnails"
2. "Recalls"
3. "Micro Learning"
4. "Enriching Contents"

**RIGHT_COLUMNS:**
5. "Table Of Contents"
6. "Glossary & keywords"
7. "Illustrative Interactions"
8. "Check Yourself"

## Icon Mapping Strategy

### Recommended MUI Icons by Column

| Column Label | MUI Icon | Import | Rationale |
|--------------|----------|--------|-----------|
| **Thumbnails** | `CollectionsIcon` | `@mui/icons-material/Collections` | Represents a collection/gallery of images |
| **Recalls** | `PsychologyIcon` | `@mui/icons-material/Psychology` | Brain icon represents memory and recall |
| **Micro Learning** | `AutoStoriesIcon` | `@mui/icons-material/AutoStories` | Open book with pages, perfect for learning modules |
| **Enriching Contents** | `AutoAwesomeIcon` | `@mui/icons-material/AutoAwesome` | Sparkles icon suggests enhancement/enrichment |
| **Table Of Contents** | `FormatListNumberedIcon` | `@mui/icons-material/FormatListNumbered` | Numbered list represents structured TOC |
| **Glossary & keywords** | `LibraryBooksIcon` | `@mui/icons-material/LibraryBooks` | Books icon for reference material |
| **Illustrative Interactions** | `TouchAppIcon` | `@mui/icons-material/TouchApp` | Hand/touch icon for interactive content |
| **Check Yourself** | `AssignmentTurnedInIcon` | `@mui/icons-material/AssignmentTurnedIn` | Checkmark on document for self-assessment |

### Alternative Icons (If Primary Doesn't Fit)

| Column Label | Alternative 1 | Alternative 2 | Alternative 3 |
|--------------|---------------|---------------|---------------|
| **Thumbnails** | `PhotoLibraryIcon` | `ViewModuleIcon` | `GridViewIcon` |
| **Recalls** | `LightbulbIcon` | `MemoryIcon` | `EmojiObjectsIcon` |
| **Micro Learning** | `SchoolIcon` | `MenuBookIcon` | `LocalLibraryIcon` |
| **Enriching Contents** | `StarsIcon` | `AddCircleIcon` | `ExtensionIcon` |
| **Table Of Contents** | `TocIcon` | `ListIcon` | `TableRowsIcon` |
| **Glossary & keywords** | `BookIcon` | `ArticleIcon` | `DescriptionIcon` |
| **Illustrative Interactions** | `GestureIcon` | `InterestsIcon` | `TipsAndUpdatesIcon` |
| **Check Yourself** | `FactCheckIcon` | `QuizIcon` | `CheckCircleIcon` |

## Solution Design

### Option 1: Icon Mapper Utility (Recommended)

Create a centralized utility function that maps column labels to icons.

**Advantages:**
- ✅ Single source of truth for icon mappings
- ✅ Easy to maintain and update
- ✅ Reusable across both BookColumn and BookColumn2
- ✅ Clean separation of concerns
- ✅ Easy to test

**Implementation:**

**File:** `src/utils/book-icons.js` (new file)

```javascript
import CollectionsIcon from "@mui/icons-material/Collections";
import PsychologyIcon from "@mui/icons-material/Psychology";
import AutoStoriesIcon from "@mui/icons-material/AutoStories";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import TouchAppIcon from "@mui/icons-material/TouchApp";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import ContentCopyIcon from "@mui/icons-material/ContentCopy"; // fallback

/**
 * Maps column labels to their corresponding MUI icons
 * @param {string} label - The column label
 * @returns {React.Component} The corresponding MUI icon component
 */
export const getColumnIcon = (label) => {
  const iconMap = {
    "Thumbnails": CollectionsIcon,
    "Recalls": PsychologyIcon,
    "Micro Learning": AutoStoriesIcon,
    "Enriching Contents": AutoAwesomeIcon,
    "Table Of Contents": FormatListNumberedIcon,
    "Glossary & keywords": LibraryBooksIcon,
    "Illustrative Interactions": TouchAppIcon,
    "Check Yourself": AssignmentTurnedInIcon,
  };

  // Return mapped icon or fallback to ContentCopyIcon
  return iconMap[label] || ContentCopyIcon;
};
```

**Usage in BookColumn.jsx:**

```jsx
import { getColumnIcon } from "../../utils/book-icons";

// In the render:
{COLUMNS.map((column) => {
  const IconComponent = getColumnIcon(column.label);
  return (
    <button key={column.id} onClick={() => onChangeActiveTab(column)}>
      <span>{column.label}</span>
      <IconComponent />
    </button>
  );
})}
```

**Usage in BookColumn2.jsx:**

```jsx
import { getColumnIcon } from "../../utils/book-icons";

// In the render:
{columns.map((column) => {
  const IconComponent = getColumnIcon(column.label);
  return (
    <button key={column.id} onClick={() => setActiveColumn(column)}>
      <span>{column.label}</span>
      <IconComponent />
    </button>
  );
})}
```

### Option 2: Icon Property in Column Definitions

Add an `icon` property to each column definition in `BookTabsLayout.jsx`.

**Advantages:**
- ✅ Explicit icon assignment
- ✅ Each column fully self-contained

**Disadvantages:**
- ❌ Icons defined far from where they're rendered
- ❌ Duplicates icon imports in BookTabsLayout
- ❌ Harder to maintain (icons scattered across definitions)
- ❌ Doesn't follow DRY principle

**Not recommended** because it separates icon logic from rendering logic.

### Option 3: Inline Conditionals in Components

Add if/else or switch statements directly in BookColumn and BookColumn2.

**Disadvantages:**
- ❌ Code duplication between two components
- ❌ Harder to maintain (changes needed in 2 places)
- ❌ Makes components more complex
- ❌ Less testable

**Not recommended** due to code duplication.

## Recommended Implementation: Option 1

Use the Icon Mapper Utility approach for clean, maintainable, reusable code.

## Implementation Steps

### Step 1: Create Icon Mapper Utility

**File:** `/src/utils/book-icons.js` (new file)

```javascript
import CollectionsIcon from "@mui/icons-material/Collections";
import PsychologyIcon from "@mui/icons-material/Psychology";
import AutoStoriesIcon from "@mui/icons-material/AutoStories";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import TouchAppIcon from "@mui/icons-material/TouchApp";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import ContentCopyIcon from "@mui/icons-material/ContentCopy"; // fallback

/**
 * Maps column labels to their corresponding MUI icons
 * @param {string} label - The column label
 * @returns {React.Component} The corresponding MUI icon component
 */
export const getColumnIcon = (label) => {
  const iconMap = {
    "Thumbnails": CollectionsIcon,
    "Recalls": PsychologyIcon,
    "Micro Learning": AutoStoriesIcon,
    "Enriching Contents": AutoAwesomeIcon,
    "Table Of Contents": FormatListNumberedIcon,
    "Glossary & keywords": LibraryBooksIcon,
    "Illustrative Interactions": TouchAppIcon,
    "Check Yourself": AssignmentTurnedInIcon,
  };

  // Return mapped icon or fallback to ContentCopyIcon
  return iconMap[label] || ContentCopyIcon;
};
```

### Step 2: Update BookColumn.jsx

**File:** `/src/components/Book/BookColumn/BookColumn.jsx`

**Current code (lines 1-3, 36-40):**
```jsx
import React from "react";
import BookColumnHeader from "../BookColumnHeader/BookColumnHeader";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

// ... (line 36-40)
<button key={column.id} onClick={() => onChangeActiveTab(column)}>
  <span>{column.label}</span>
  <ContentCopyIcon />
</button>
```

**Updated code:**
```jsx
import React from "react";
import BookColumnHeader from "../BookColumnHeader/BookColumnHeader";
import { getColumnIcon } from "../../../utils/book-icons";

// ... (line 36-40)
{COLUMNS.map((column) => {
  const IconComponent = getColumnIcon(column.label);
  return (
    <button key={column.id} onClick={() => onChangeActiveTab(column)}>
      <span>{column.label}</span>
      <IconComponent />
    </button>
  );
})}
```

**Changes:**
1. Remove: `import ContentCopyIcon from "@mui/icons-material/ContentCopy";`
2. Add: `import { getColumnIcon } from "../../../utils/book-icons";`
3. Update map function to get icon dynamically

### Step 3: Update BookColumn2.jsx

**File:** `/src/components/Book/BookColumn2/BookColumn2.jsx`

**Current code (lines 1-3, 60-65):**
```jsx
import React from "react";
import MinimizeIcon from "@mui/icons-material/Minimize";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

// ... (line 60-65)
{columns.map((column) => (
  <button key={column.id} onClick={() => setActiveColumn(column)}>
    <span>{column.label}</span>
    <ContentCopyIcon />
  </button>
))}
```

**Updated code:**
```jsx
import React from "react";
import MinimizeIcon from "@mui/icons-material/Minimize";
import { getColumnIcon } from "../../../utils/book-icons";

// ... (line 60-65)
{columns.map((column) => {
  const IconComponent = getColumnIcon(column.label);
  return (
    <button key={column.id} onClick={() => setActiveColumn(column)}>
      <span>{column.label}</span>
      <IconComponent />
    </button>
  );
})}
```

**Changes:**
1. Remove: `import ContentCopyIcon from "@mui/icons-material/ContentCopy";`
2. Add: `import { getColumnIcon } from "../../../utils/book-icons";`
3. Update map function to get icon dynamically

## Testing Checklist

### Visual Verification

After implementation, verify that each column displays the correct icon:

**Left Columns:**
- [ ] **Thumbnails** - Shows Collections icon (image gallery grid)
- [ ] **Recalls** - Shows Psychology icon (brain with gears)
- [ ] **Micro Learning** - Shows AutoStories icon (open book with pages)
- [ ] **Enriching Contents** - Shows AutoAwesome icon (sparkles/stars)

**Right Columns:**
- [ ] **Table Of Contents** - Shows FormatListNumbered icon (numbered list)
- [ ] **Glossary & keywords** - Shows LibraryBooks icon (stacked books)
- [ ] **Illustrative Interactions** - Shows TouchApp icon (hand with finger pointing)
- [ ] **Check Yourself** - Shows AssignmentTurnedIn icon (document with checkmark)

### Functional Testing

- [ ] Click each column tab - opens correctly
- [ ] Icons are vertically aligned with labels
- [ ] Icons maintain proper size and spacing
- [ ] Icons respond to hover states (if any CSS is applied)
- [ ] Works on both BookColumn and BookColumn2 implementations
- [ ] Fallback icon (ContentCopyIcon) shows for unknown labels

### Responsive Testing

- [ ] Desktop view (>768px) - icons visible
- [ ] Tablet view (768px) - icons visible
- [ ] Mobile view (<768px) - icons visible
- [ ] Icons scale appropriately on different screen sizes

### Edge Cases

- [ ] Empty column label - displays fallback icon
- [ ] Unknown column label - displays fallback icon
- [ ] Column label with extra spaces - exact match or fallback?
- [ ] Case sensitivity - "thumbnails" vs "Thumbnails"

## Fallback Strategy

The `getColumnIcon` function includes a fallback mechanism:

```javascript
return iconMap[label] || ContentCopyIcon;
```

**If a column label is not found in the mapping:**
- Returns `ContentCopyIcon` (current default)
- Prevents errors/crashes
- Easy to identify missing mappings during testing

**Future additions:**
- When new columns are added, add their mappings to `book-icons.js`
- No changes needed to BookColumn or BookColumn2 components

## Icon Customization (Future Enhancement)

If icon appearance needs customization:

```javascript
export const getColumnIcon = (label, props = {}) => {
  const iconMap = { /* ... */ };
  const IconComponent = iconMap[label] || ContentCopyIcon;

  // Return icon with custom props
  return <IconComponent {...props} />;
};
```

Usage:
```jsx
{getColumnIcon(column.label, { fontSize: "small", color: "primary" })}
```

## Accessibility Considerations

Icons alone may not be sufficient for screen readers. Consider:

**Option A: Add aria-label**
```jsx
<button
  key={column.id}
  onClick={() => onChangeActiveTab(column)}
  aria-label={`Open ${column.label} panel`}
>
  <span>{column.label}</span>
  <IconComponent />
</button>
```

**Option B: Use sr-only text**
```jsx
<IconComponent aria-label={column.label} />
```

**Current implementation:**
- Label text is already present (`<span>{column.label}</span>`)
- Screen readers can read the label
- Icons are supplementary visual aids
- **No accessibility changes required**

## Visual Preview (Expected Icons)

```
LEFT SIDE TABS (vertical):
┌────────────────┐
│ 📚 Thumbnails  │ ← CollectionsIcon (grid of images)
│ 🧠 Recalls     │ ← PsychologyIcon (brain)
│ 📖 Micro...    │ ← AutoStoriesIcon (open book)
│ ✨ Enriching...│ ← AutoAwesomeIcon (sparkles)
└────────────────┘

RIGHT SIDE TABS (vertical):
┌────────────────┐
│ 📋 Table Of... │ ← FormatListNumberedIcon (numbered list)
│ 📚 Glossary... │ ← LibraryBooksIcon (books)
│ 👆 Illustra... │ ← TouchAppIcon (pointing hand)
│ ✅ Check You...│ ← AssignmentTurnedInIcon (checked document)
└────────────────┘
```

## Performance Impact

**Icon imports:**
- 8 new icon imports in `book-icons.js`
- Tree-shaking ensures unused icons aren't bundled
- Minimal bundle size impact (~1-2KB per icon)

**Runtime performance:**
- Icon lookup is O(1) (object property access)
- No performance degradation
- Icons are memoized by React

## Files to Create/Modify

### New Files:
1. `/src/utils/book-icons.js` - Icon mapper utility

### Modified Files:
1. `/src/components/Book/BookColumn/BookColumn.jsx` - Update imports and render logic
2. `/src/components/Book/BookColumn2/BookColumn2.jsx` - Update imports and render logic

## Estimated Effort

- **Create utility file**: 5 minutes
- **Update BookColumn.jsx**: 3 minutes
- **Update BookColumn2.jsx**: 3 minutes
- **Testing**: 10-15 minutes
- **Total**: ~25 minutes

## Rollback Plan

If issues arise, rollback is simple:

1. Delete `/src/utils/book-icons.js`
2. Revert BookColumn.jsx and BookColumn2.jsx to use `ContentCopyIcon` directly
3. All columns will show the same icon again (previous behavior)

## Success Criteria

✅ **Implementation is successful when:**
1. Each column displays a unique, contextually appropriate icon
2. Icons are visually distinct and easy to recognize
3. All columns open and function correctly
4. Unknown columns fallback to ContentCopyIcon gracefully
5. No console errors or warnings
6. Code is DRY (no duplication between BookColumn and BookColumn2)
7. Future column additions only require updating `book-icons.js`

## Future Enhancements

1. **Icon tooltips**: Show label on icon hover
2. **Animated icons**: Add subtle animations on hover
3. **Theme-aware icons**: Use outlined/filled variants based on theme
4. **Customizable mappings**: Allow users to choose their own icons
5. **Icon size control**: Responsive icon sizes based on viewport

## Notes

- The mapping uses exact string matching for column labels
- If column labels change in the future, update `book-icons.js` accordingly
- Consider creating constants for column labels to prevent typos
- The fallback icon ensures the UI never breaks even with missing mappings
