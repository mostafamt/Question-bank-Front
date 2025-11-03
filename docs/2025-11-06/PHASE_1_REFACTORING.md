# Studio Refactoring - Phase 1: Preparation & Foundation

## Overview

**Phase Duration:** Week 1
**Goal:** Set up infrastructure and extract constants without breaking existing functionality
**Risk Level:** Low (Non-breaking changes only)
**Team Size:** 1-2 developers

This phase establishes the foundation for the Studio component refactoring by:
1. Creating comprehensive type definitions
2. Extracting magic strings and numbers into constants
3. Setting up the folder structure for future phases

**Important:** All changes in this phase are additive. No existing code will be removed or modified (except for replacing magic strings with constants).

---

## Objectives

- [ ] Create type definitions for all Studio data structures
- [ ] Extract all constants (tab names, timeouts, default values)
- [ ] Set up folder structure for hooks, services, and utils
- [ ] Add JSDoc comments for better IDE support
- [ ] Zero breaking changes to existing functionality

---

## Folder Structure Setup

Create the following folder structure:

```
src/components/Studio/
├── Studio.jsx                          # (existing - minimal changes)
├── types/
│   └── studio.types.js                 # NEW - Type definitions
├── constants/
│   ├── tabs.constants.js               # NEW - Tab configurations
│   ├── studio.constants.js             # NEW - General constants
│   └── index.js                        # NEW - Barrel export
├── hooks/                              # NEW - Empty for now (Phase 2)
├── services/                           # NEW - Empty for now (Phase 3)
├── utils/                              # NEW - Empty for now (Phase 2/3)
├── components/                         # NEW - Empty for now (Phase 4)
├── context/                            # NEW - Empty for now (Phase 2)
├── LanguageSwitcher/                   # (existing)
├── StudioThumbnails/                   # (existing)
├── StudioEditor/                       # (existing)
├── StudioAreaSelector/                 # (existing)
├── StudioActions/                      # (existing)
├── StudioCompositeBlocks/              # (existing)
└── StudioStickyToolbar/                # (existing)
```

---

## Task 1: Create Type Definitions

### File: `src/components/Studio/types/studio.types.js`

This file will contain JSDoc type definitions for all Studio data structures.

<details>
<summary><b>Implementation Code</b></summary>

```javascript
/**
 * @file studio.types.js
 * @description Type definitions for Studio component data structures
 */

/**
 * Coordinate unit types
 * @typedef {'px' | 'percentage'} CoordinateUnit
 */

/**
 * Area status types
 * @typedef {'active' | 'deleted'} AreaStatus
 */

/**
 * Represents a selectable area on a page
 * @typedef {Object} Area
 * @property {number} x - X coordinate
 * @property {number} y - Y coordinate
 * @property {number} width - Width of the area
 * @property {number} height - Height of the area
 * @property {CoordinateUnit} unit - Coordinate unit (px or percentage)
 * @property {boolean} isChanging - Whether area is being modified
 * @property {boolean} isNew - Whether area is newly created
 * @property {CoordinateUnit} _unit - Original unit before conversion
 * @property {boolean} _updated - Whether area has been updated after conversion
 * @property {number} [_percentX] - Original X coordinate in percentage
 * @property {number} [_percentY] - Original Y coordinate in percentage
 * @property {number} [_percentWidth] - Original width in percentage
 * @property {number} [_percentHeight] - Original height in percentage
 */

/**
 * Represents properties/metadata for an area
 * @typedef {Object} AreaProperty
 * @property {number} x - X coordinate in percentage
 * @property {number} y - Y coordinate in percentage
 * @property {number} width - Width in percentage
 * @property {number} height - Height in percentage
 * @property {string} id - Unique identifier (UUID)
 * @property {string} color - Highlight color for the area
 * @property {boolean} loading - Whether area is processing (OCR, etc.)
 * @property {string} text - Extracted or entered text content
 * @property {string} image - Image data URL or path
 * @property {string} type - Content type name (e.g., "Question", "Illustrative object")
 * @property {string} parameter - Additional parameter data
 * @property {string} label - Content label/key
 * @property {string} typeOfLabel - Data type (e.g., "text", "image", "object")
 * @property {number} order - Display order in the list
 * @property {boolean} open - Whether area is expanded in UI
 * @property {string | boolean} isServer - Whether area exists on server ("true" for yes)
 * @property {string} [blockId] - Block ID if saved to server
 * @property {AreaStatus} [status] - Area status (e.g., "deleted")
 */

/**
 * Virtual block for educational content
 * @typedef {Object} VirtualBlock
 * @property {string} id - Unique identifier
 * @property {string} label - Display label
 * @property {string} category - Category type ("object" or "text")
 * @property {string} icon - Icon identifier
 * @property {number} x - X coordinate in percentage
 * @property {number} y - Y coordinate in percentage
 * @property {number} width - Width in percentage
 * @property {number} height - Height in percentage
 */

/**
 * Composite block area
 * @typedef {Object} CompositeBlockArea
 * @property {string} id - Unique identifier
 * @property {number} x - X coordinate in percentage
 * @property {number} y - Y coordinate in percentage
 * @property {number} width - Width in percentage
 * @property {number} height - Height in percentage
 * @property {string} type - Block type
 * @property {string} text - Content text or block ID
 * @property {string} unit - Coordinate unit ("%" or "px")
 * @property {string} color - Highlight color
 * @property {boolean} [loading] - Whether processing
 * @property {boolean} [open] - Whether expanded in UI
 * @property {string} [img] - Image data URL
 */

/**
 * Composite block configuration
 * @typedef {Object} CompositeBlock
 * @property {string} name - Block name
 * @property {string} type - Block type
 * @property {CompositeBlockArea[]} areas - Areas within the composite block
 */

/**
 * Page data structure
 * @typedef {Object} Page
 * @property {string} _id - Page ID
 * @property {string} url - Image URL
 * @property {Block[]} [blocks] - Existing blocks on the page
 */

/**
 * Block data from server
 * @typedef {Object} Block
 * @property {string} blockId - Block identifier
 * @property {string} contentType - Type of content
 * @property {string} contentValue - Content value (text, URL, etc.)
 * @property {Coordinates} coordinates - Block coordinates
 */

/**
 * Coordinate data
 * @typedef {Object} Coordinates
 * @property {number} x - X coordinate
 * @property {number} y - Y coordinate
 * @property {number} width - Width
 * @property {number} height - Height
 * @property {CoordinateUnit} unit - Unit type
 */

/**
 * Tab configuration
 * @typedef {Object} TabConfig
 * @property {string} id - Unique identifier
 * @property {string} label - Display label
 * @property {React.ReactNode} component - React component to render
 */

/**
 * OCR language options
 * @typedef {'eng' | 'ara'} OCRLanguage
 */

/**
 * Studio component props
 * @typedef {Object} StudioProps
 * @property {Page[]} pages - Array of pages to edit
 * @property {string} type - Object type being edited
 * @property {boolean} [subObject] - Whether editing a sub-object
 * @property {Function} handleClose - Close handler
 * @property {Array} types - Available content types
 * @property {Function} handleSubmit - Submit handler
 * @property {string} language - Language code ("en" or "ar")
 * @property {string} [typeOfActiveType] - Type of active type for sub-objects
 * @property {Function} [onSubmitAutoGenerate] - Auto-generate submit handler
 * @property {boolean} [loadingAutoGenerate] - Auto-generate loading state
 * @property {Function} [refetch] - Refetch data function
 * @property {Object} [compositeBlocksTypes] - Composite block type definitions
 */

/**
 * Image dimensions
 * @typedef {Object} ImageDimensions
 * @property {number} clientWidth - Rendered width in pixels
 * @property {number} clientHeight - Rendered height in pixels
 * @property {number} naturalWidth - Original image width
 * @property {number} naturalHeight - Original image height
 */

/**
 * Ref object for image element
 * @typedef {Object} ImageRef
 * @property {HTMLImageElement} current - Image element reference
 */

/**
 * Highlight mode
 * @typedef {'' | 'hand'} HighlightMode
 */

export {};
```

</details>

### Acceptance Criteria
- [ ] All major data structures have type definitions
- [ ] JSDoc comments include descriptions and property types
- [ ] Optional properties are marked with `[]`
- [ ] Union types are properly defined (e.g., `'px' | 'percentage'`)
- [ ] File includes `export {}` to make it a module

### Testing
- [ ] Import the file in Studio.jsx: `import './types/studio.types.js';`
- [ ] Verify no runtime errors
- [ ] Check IDE autocomplete suggestions improve (if using VS Code)

---

## Task 2: Extract Tab Constants

### File: `src/components/Studio/constants/tabs.constants.js`

Extract all tab-related string literals and configurations.

<details>
<summary><b>Implementation Code</b></summary>

```javascript
/**
 * @file tabs.constants.js
 * @description Tab names and configurations for Studio component
 */

/**
 * Left column tab names
 */
export const LEFT_TAB_NAMES = {
  THUMBNAILS: "Thumbnails",
  RECALLS: "Recalls",
  MICRO_LEARNING: "Micro Learning",
  ENRICHING_CONTENT: "Enriching Content",
  CHECK_YOURSELF: "Check Yourself",
};

/**
 * Right column tab names
 */
export const RIGHT_TAB_NAMES = {
  BLOCK_AUTHORING: "Block Authoring",
  COMPOSITE_BLOCKS: "Composite Blocks",
  TABLE_OF_CONTENTS: "Table Of Contents",
  GLOSSARY_KEYWORDS: "Glossary & keywords",
  ILLUSTRATIVE_INTERACTIONS: "Illustrative Interactions",
};

/**
 * All tab names (for backward compatibility)
 * @deprecated Use LEFT_TAB_NAMES or RIGHT_TAB_NAMES instead
 */
export const TAB_NAMES = {
  ...LEFT_TAB_NAMES,
  ...RIGHT_TAB_NAMES,
};

/**
 * List of tab names used in the tabNames array
 */
export const TAB_NAMES_LIST = [
  LEFT_TAB_NAMES.RECALLS,
  LEFT_TAB_NAMES.MICRO_LEARNING,
  LEFT_TAB_NAMES.ENRICHING_CONTENT,
  LEFT_TAB_NAMES.CHECK_YOURSELF,
  RIGHT_TAB_NAMES.ILLUSTRATIVE_INTERACTIONS,
];
```

</details>

### Acceptance Criteria
- [ ] All tab name strings are extracted
- [ ] Constants use UPPER_SNAKE_CASE naming
- [ ] Groups are logical (left vs right columns)
- [ ] Backward compatibility maintained

### Testing
- [ ] Import in Studio.jsx
- [ ] Replace all string literals with constants
- [ ] Verify tab rendering works correctly

---

## Task 3: Extract General Studio Constants

### File: `src/components/Studio/constants/studio.constants.js`

Extract timeout values, default values, and other magic numbers.

<details>
<summary><b>Implementation Code</b></summary>

```javascript
/**
 * @file studio.constants.js
 * @description General constants for Studio component
 */

/**
 * Timeout values (in milliseconds)
 */
export const TIMEOUTS = {
  /** Delay for image load recalculation after zoom */
  IMAGE_LOAD_DELAY: 10,

  /** Delay for virtual blocks toggle */
  VIRTUAL_BLOCKS_TOGGLE_DELAY: 20,

  /** Delay for page navigation recalculation */
  PAGE_NAVIGATION_DELAY: 50,
};

/**
 * Local storage keys
 */
export const STORAGE_KEYS = {
  /** Key for storing active page index */
  AUTHOR_PAGE: "author_page",
};

/**
 * Default values
 */
export const DEFAULTS = {
  /** Default active page index */
  ACTIVE_PAGE_INDEX: 0,

  /** Default image scale factor */
  IMAGE_SCALE_FACTOR: 1,

  /** Default coordinate unit */
  COORDINATE_UNIT: "px",

  /** Default color index */
  COLOR_INDEX: 0,
};

/**
 * OCR language codes
 */
export const OCR_LANGUAGES = {
  ENGLISH: "eng",
  ARABIC: "ara",
};

/**
 * Language codes
 */
export const LANGUAGE_CODES = {
  ENGLISH: "en",
  ARABIC: "ar",
};

/**
 * Area status values
 */
export const AREA_STATUS = {
  ACTIVE: "active",
  DELETED: "deleted", // Also defined in utils/ocr.js as DELETED
};

/**
 * Composite block naming
 */
export const COMPOSITE_BLOCK = {
  /** Prefix for auto-generated composite block names */
  NAME_PREFIX: "Composite Block",

  /** Length of UUID slice for block names */
  UUID_SLICE_LENGTH: 8,
};

/**
 * Scroll behavior constants
 */
export const SCROLL = {
  /** Offset percentage for thumbnail scrolling (3% of container height) */
  THUMBNAIL_OFFSET_PERCENT: 0.03,

  /** Offset percentage for sticky toolbar (50% of container height) */
  STICKY_TOOLBAR_OFFSET_PERCENT: 0.5,
};

/**
 * Type names for complex objects (that should open modals)
 * Note: Also defined in utils/ocr.js as COMPLEX_TYPES
 */
export const COMPLEX_TYPES = [
  "MultipleChoice",
  "TrueFalse",
  "DragTheWord",
  "FillBlank",
  // Add other complex types as needed
];

/**
 * Content type categories
 */
export const CONTENT_TYPE_CATEGORIES = {
  OBJECT: "object",
  TEXT: "text",
};

/**
 * Icon font sizes
 */
export const ICON_SIZES = {
  SMALL: "small",
  MEDIUM: "medium",
  LARGE: "large",
};

/**
 * Coordinate conversion ratios
 */
export const COORDINATE_RATIOS = {
  /** Conversion factor from percentage to pixels */
  PERCENT_TO_PX: 100,
};
```

</details>

### Acceptance Criteria
- [ ] All magic numbers are extracted
- [ ] All magic strings are extracted
- [ ] Constants are well-documented with JSDoc
- [ ] Related constants are grouped together
- [ ] Values match exactly with current implementation

### Testing
- [ ] Import in Studio.jsx
- [ ] Replace magic values with constants
- [ ] Run the app and verify functionality unchanged

---

## Task 4: Create Barrel Export

### File: `src/components/Studio/constants/index.js`

Create a single import point for all constants.

<details>
<summary><b>Implementation Code</b></summary>

```javascript
/**
 * @file index.js
 * @description Barrel export for all Studio constants
 */

export * from './tabs.constants.js';
export * from './studio.constants.js';
```

</details>

### Acceptance Criteria
- [ ] Exports all constants from sub-files
- [ ] Allows single import: `import { TAB_NAMES, TIMEOUTS } from './constants'`

---

## Task 5: Update Studio.jsx to Use Constants

Now update the main Studio.jsx file to use the new constants.

### Changes to Make

<details>
<summary><b>Code Changes</b></summary>

**1. Add imports at the top:**
```javascript
import {
  LEFT_TAB_NAMES,
  RIGHT_TAB_NAMES,
  TIMEOUTS,
  STORAGE_KEYS,
  DEFAULTS,
  OCR_LANGUAGES,
  LANGUAGE_CODES,
  COMPOSITE_BLOCK,
  COMPLEX_TYPES,
} from './constants';
```

**2. Replace tab name constants (lines 41-53):**

Replace:
```javascript
const RECALLS = "Recalls";
const MICRO_LEARNING = "Micro Learning";
const ENRICHING_CONTENT = "Enriching Content";
const CHECK_YOURSELF = "Check Yourself";
const ILLUSTRATIVE_INTERACTIONS = "Illustrative Interactions";

const tabNames = [
  RECALLS,
  MICRO_LEARNING,
  ENRICHING_CONTENT,
  CHECK_YOURSELF,
  ILLUSTRATIVE_INTERACTIONS,
];
```

With:
```javascript
// Tab names imported from constants
// (Remove local constants, use imported ones)
```

**3. Replace default active page (line 71-77):**

Replace:
```javascript
const [activePageIndex, setActivePageIndex] = React.useState(
  subObject
    ? 0
    : localStorage.getItem("author_page")
    ? Number.parseInt(localStorage.getItem("author_page"))
    : 0
);
```

With:
```javascript
const [activePageIndex, setActivePageIndex] = React.useState(
  subObject
    ? DEFAULTS.ACTIVE_PAGE_INDEX
    : localStorage.getItem(STORAGE_KEYS.AUTHOR_PAGE)
    ? Number.parseInt(localStorage.getItem(STORAGE_KEYS.AUTHOR_PAGE))
    : DEFAULTS.ACTIVE_PAGE_INDEX
);
```

**4. Replace composite block name (line 86-90):**

Replace:
```javascript
const [compositeBlocks, setCompositeBlocks] = React.useState({
  name: `Composite Block ${uuidv4().slice(0, 8)}`,
  type: "",
  areas: [],
});
```

With:
```javascript
const [compositeBlocks, setCompositeBlocks] = React.useState({
  name: `${COMPOSITE_BLOCK.NAME_PREFIX} ${uuidv4().slice(0, COMPOSITE_BLOCK.UUID_SLICE_LENGTH)}`,
  type: "",
  areas: [],
});
```

**5. Replace default image scale factor (line 154):**

Replace:
```javascript
const [imageScaleFactor, setImageScaleFactor] = React.useState(1);
```

With:
```javascript
const [imageScaleFactor, setImageScaleFactor] = React.useState(DEFAULTS.IMAGE_SCALE_FACTOR);
```

**6. Replace language constants (line 160-162):**

Replace:
```javascript
const [language, setLanguage] = React.useState(
  lang === "en" ? ENGLISH : ARABIC
);
```

With:
```javascript
const [language, setLanguage] = React.useState(
  lang === LANGUAGE_CODES.ENGLISH ? OCR_LANGUAGES.ENGLISH : OCR_LANGUAGES.ARABIC
);
```

**7. Replace setTimeout delays:**

Line 148-150:
```javascript
setTimeout(() => {
  onImageLoad();
}, TIMEOUTS.VIRTUAL_BLOCKS_TOGGLE_DELAY);
```

Line 207-209:
```javascript
setTimeout(() => {
  onImageLoad();
}, TIMEOUTS.IMAGE_LOAD_DELAY);
```

Line 334-336:
```javascript
setTimeout(() => {
  onImageLoad();
}, TIMEOUTS.PAGE_NAVIGATION_DELAY);
```

**8. Replace localStorage.setItem calls:**

Line 319:
```javascript
localStorage.setItem(STORAGE_KEYS.AUTHOR_PAGE, `${idx}`);
```

Line 778:
```javascript
localStorage.setItem(STORAGE_KEYS.AUTHOR_PAGE, `${newIndex}`);
```

**9. Replace tab labels in LEFT_COLUMNS (lines 700-718):**

```javascript
const LEFT_COLUMNS = [
  {
    id: uuidv4(),
    label: LEFT_TAB_NAMES.THUMBNAILS,
    component: (
      <StudioThumbnails
        pages={pages}
        activePage={activePageIndex}
        onClickImage={onClickImage}
        ref={thumbnailsRef}
      />
    ),
  },
  {
    id: uuidv4(),
    label: LEFT_TAB_NAMES.RECALLS,
    component: <List chapterId={chapterId} tabName={LEFT_TAB_NAMES.RECALLS} />,
  },
  {
    id: uuidv4(),
    label: LEFT_TAB_NAMES.MICRO_LEARNING,
    component: <List chapterId={chapterId} tabName={LEFT_TAB_NAMES.MICRO_LEARNING} />,
  },
  {
    id: uuidv4(),
    label: LEFT_TAB_NAMES.ENRICHING_CONTENT,
    component: <List chapterId={chapterId} tabName={LEFT_TAB_NAMES.ENRICHING_CONTENT} />,
  },
  {
    id: uuidv4(),
    label: LEFT_TAB_NAMES.CHECK_YOURSELF,
    component: <List chapterId={chapterId} tabName={LEFT_TAB_NAMES.CHECK_YOURSELF} />,
  },
];
```

**10. Replace tab labels in RIGHT_COLUMNS (lines 744-795):**

```javascript
let RIGHT_COLUMNS = [
  {
    id: uuidv4(),
    label: RIGHT_TAB_NAMES.BLOCK_AUTHORING,
    component: StudioActionsComponent,
  },
  {
    id: uuidv4(),
    label: RIGHT_TAB_NAMES.COMPOSITE_BLOCKS,
    component: (
      <StudioCompositeBlocks
        compositeBlocks={compositeBlocks}
        compositeBlocksTypes={compositeBlocksTypes}
        onChangeCompositeBlocks={onChangeCompositeBlocks}
        processCompositeBlock={processCompositeBlock}
        onSubmitCompositeBlocks={onSubmitCompositeBlocks}
        loadingSubmitCompositeBlocks={loadingSubmitCompositeBlocks}
        DeleteCompositeBlocks={DeleteCompositeBlocks}
        highlight={highlight}
        setHighlight={setHighlight}
      />
    ),
  },
  {
    id: uuidv4(),
    label: RIGHT_TAB_NAMES.TABLE_OF_CONTENTS,
    component: (
      <TableOfContents
        pages={pages}
        chapterId={chapterId}
        onChangeActivePage={(newPage) => {
          const newIndex = pages.findIndex((p) => p._id === newPage._id);
          if (newIndex !== -1) {
            setActivePageIndex(newIndex);
            localStorage.setItem(STORAGE_KEYS.AUTHOR_PAGE, `${newIndex}`);
          }
        }}
      />
    ),
  },
  {
    id: uuidv4(),
    label: RIGHT_TAB_NAMES.GLOSSARY_KEYWORDS,
    component: <GlossaryAndKeywords chapterId={chapterId} />,
  },
  {
    id: uuidv4(),
    label: RIGHT_TAB_NAMES.ILLUSTRATIVE_INTERACTIONS,
    component: (
      <List chapterId={chapterId} tabName={RIGHT_TAB_NAMES.ILLUSTRATIVE_INTERACTIONS} />
    ),
  },
];
```

**11. Replace tab label comparison (line 370):**

Replace:
```javascript
if (activeRightTab.label === "Composite Blocks") {
```

With:
```javascript
if (activeRightTab.label === RIGHT_TAB_NAMES.COMPOSITE_BLOCKS) {
```

**12. Replace COMPLEX_TYPES usage (line 489):**

Replace:
```javascript
let found = COMPLEX_TYPES.find((type) => type === typeOfLabel);
```

With:
```javascript
// Import COMPLEX_TYPES from constants instead of ocr.js
let found = COMPLEX_TYPES.find((type) => type === typeOfLabel);
```

</details>

### Acceptance Criteria
- [ ] All magic strings replaced with constants
- [ ] All magic numbers replaced with constants
- [ ] No local constant definitions (removed RECALLS, MICRO_LEARNING, etc.)
- [ ] Import statement added at the top
- [ ] Code still functions identically

### Testing Checklist
- [ ] App runs without errors
- [ ] All tabs render correctly
- [ ] Page navigation works
- [ ] localStorage saves/loads active page correctly
- [ ] Composite blocks create with correct name format
- [ ] Language switching works
- [ ] Virtual blocks toggle works with correct delay

---

## Task 6: Update Child Components (Optional)

If child components also have magic strings, update them too.

### StudioAreaSelector.jsx

Replace (line 155-156):
```javascript
activeRightTab.label === "Block Authoring" ||
activeRightTab.label === "Composite Blocks"
```

With:
```javascript
import { RIGHT_TAB_NAMES } from '../constants';

// ...then in component:
activeRightTab.label === RIGHT_TAB_NAMES.BLOCK_AUTHORING ||
activeRightTab.label === RIGHT_TAB_NAMES.COMPOSITE_BLOCKS
```

### Acceptance Criteria
- [ ] Child components updated if needed
- [ ] Imports added correctly
- [ ] No duplicate constant definitions

---

## Task 7: Documentation

### Update CLAUDE.md

Add a section about the new structure:

```markdown
### Studio Component Structure (Refactoring in Progress)

The Studio component is being refactored for better maintainability. Current structure:

#### Constants (`src/components/Studio/constants/`)
- `tabs.constants.js` - Tab names and configurations
- `studio.constants.js` - Timeouts, defaults, storage keys
- Import via: `import { TAB_NAMES, TIMEOUTS } from './constants'`

#### Type Definitions (`src/components/Studio/types/`)
- `studio.types.js` - JSDoc type definitions for all data structures
- Provides IDE autocomplete and documentation

#### Folders for Future Phases
- `hooks/` - Custom hooks (Phase 2)
- `services/` - Business logic (Phase 3)
- `utils/` - Helper functions (Phase 2-3)
- `components/` - Sub-components (Phase 4)
```

---

## Validation & Testing

### Pre-merge Checklist

**Code Quality:**
- [ ] All new files created in correct locations
- [ ] All imports use correct paths
- [ ] No console errors in browser
- [ ] ESLint passes (run `npm run lint` if configured)
- [ ] Code formatted consistently

**Functionality:**
- [ ] Start development server: `npm start`
- [ ] Navigate to Studio component
- [ ] Test page navigation (click different thumbnails)
- [ ] Test tab switching (left and right columns)
- [ ] Test creating a new area
- [ ] Test deleting an area
- [ ] Test composite blocks tab
- [ ] Test virtual blocks toggle
- [ ] Verify localStorage saves active page
- [ ] Verify composite block naming format

**Documentation:**
- [ ] JSDoc comments added to all types
- [ ] Constants have descriptive names
- [ ] README updated with new structure

---

## Git Workflow

### Branch Strategy
```bash
# Create feature branch
git checkout -b refactor/studio-phase-1-constants

# Commit structure (atomic commits preferred)
git add src/components/Studio/types/
git commit -m "feat(studio): add type definitions for Studio data structures"

git add src/components/Studio/constants/
git commit -m "feat(studio): extract constants from Studio component"

git add src/components/Studio/Studio.jsx
git commit -m "refactor(studio): replace magic strings with constants"

git add CLAUDE.md
git commit -m "docs: update CLAUDE.md with Studio refactoring structure"

# Push and create PR
git push origin refactor/studio-phase-1-constants
```

### Commit Message Format
```
<type>(<scope>): <subject>

Types: feat, fix, refactor, docs, test, chore
Scope: studio, studio-types, studio-constants
```

---

## Troubleshooting

### Common Issues

**Issue 1: Import path errors**
```
Error: Cannot find module './constants'
```
**Solution:** Verify folder structure and file names match exactly. Check for typos in import paths.

**Issue 2: Constant undefined at runtime**
```
TypeError: Cannot read property 'RECALLS' of undefined
```
**Solution:** Ensure barrel export (index.js) is exporting correctly. Check named exports vs default exports.

**Issue 3: Tabs not rendering**
```
Tabs show blank or wrong labels
```
**Solution:** Verify constant values match EXACTLY with old string literals. Check for trailing spaces.

**Issue 4: localStorage not working**
```
Active page not persisting on refresh
```
**Solution:** Verify STORAGE_KEYS.AUTHOR_PAGE value is exactly `"author_page"` (same as before).

---

## Success Metrics

### Definition of Done

Phase 1 is complete when:

1. **All constants extracted:**
   - [ ] 0 magic strings in Studio.jsx (except JSX content)
   - [ ] 0 magic numbers in Studio.jsx
   - [ ] All timeout values in TIMEOUTS constant

2. **Type definitions complete:**
   - [ ] All major types defined (Area, AreaProperty, etc.)
   - [ ] JSDoc comments on all types
   - [ ] No TypeScript/JSDoc warnings

3. **Zero breaking changes:**
   - [ ] All existing functionality works
   - [ ] No visual regressions
   - [ ] No console errors

4. **Code quality:**
   - [ ] ESLint passes
   - [ ] Code review approved
   - [ ] Documentation updated

5. **Foundation ready:**
   - [ ] Folder structure created for Phases 2-4
   - [ ] Team understands new structure
   - [ ] Ready to start Phase 2

---

## Next Steps (Phase 2 Preview)

After Phase 1 is complete and merged, Phase 2 will begin:

**Phase 2: State Management Refactoring**
- Create custom hooks (usePageManagement, useAreaManagement, etc.)
- Extract state logic from Studio.jsx
- Reduce useState count from 17+ to ~5
- Set up Context API for shared state

**Estimated Start:** Week 2

---

## Resources

- [JSDoc Reference](https://jsdoc.app/)
- [React Constants Best Practices](https://react.dev/learn/sharing-state-between-components#step-1-remove-state-from-the-child-components)
- [JavaScript Module Exports](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/export)

---

## Questions or Issues?

If you encounter any problems during Phase 1:

1. Check the Troubleshooting section above
2. Review the main STUDIO_REFACTORING_PLAN.md
3. Create a detailed issue with:
   - What you were trying to do
   - What happened
   - Error messages
   - Steps to reproduce

---

**Phase 1 Estimated Effort:** 8-12 hours
**Target Completion:** End of Week 1
**Review Date:** [To be scheduled]

Good luck with the refactoring!
