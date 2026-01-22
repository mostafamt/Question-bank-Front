# VirtualBlocks Refactoring Plan

## Overview
Refactor the VirtualBlocks component system to support multiple content items per page location with a simplified single-select interface.

## Current vs. New Architecture

### Current Implementation
- **Two MUI Selects**: Block type → Content type
- **Single Block per Location**: Each icon location (TL, TM, TR, L1-R6, BL, BM, BR) holds one virtual block
- **State Structure**:
  ```javascript
  virtualBlocks[location] = {
    id: "contentValue",
    label: "Notes 📝",
    status: "updated",
    contentType: "text"
  }
  ```

### New Implementation
- **Single MUI Select**: Choose block label directly
- **Multiple Items per Location**: Each location can have multiple content items
- **Modal-Based Content Entry**: Modal opens after label selection
- **Enhanced State Structure**:
  ```javascript
  virtualBlocks[location] = {
    contents: [
      {
        type: "text",           // text | link | object
        iconLocation: "TM",
        contentType: "Notes 📝", // The label
        contentValue: "<p>HTML content</p>"
      },
      {
        type: "link",
        iconLocation: "TM",
        contentType: "Notes 📝",
        contentValue: "https://example.com"
      },
      {
        type: "object",
        iconLocation: "TM",
        contentType: "Recall",
        contentValue: "66e45a6f435fef004a66515d" // Object ID
      }
    ]
  }
  ```

### Submission Format (submit.json)
```json
{
  "v_blocks": [
    {
      "pageId": "66e45a6f435fef004a66515d",
      "contents": [
        {
          "type": "text",
          "iconLocation": "TM",
          "contentType": "Notes 📝",
          "contentValue": "<p>test</p>"
        },
        {
          "type": "link",
          "iconLocation": "TM",
          "contentType": "Notes 📝",
          "contentValue": "https://example.com"
        },
        {
          "type": "object",
          "iconLocation": "TM",
          "contentType": "Recall",
          "contentValue": "66e45a6f435fef004a66515d"
        }
      ]
    }
  ]
}
```

---

## Implementation Phases

## Phase 1: Update Data Structures & State Management

### 1.1 Update Virtual Blocks Utility (`src/utils/virtual-blocks.js`)

**Changes:**
- Update `VIRTUAL_BLOCKS` default structure to support contents array
- Create new helper functions for managing multiple content items
- Update parsing functions to handle new data structure

**New Structure:**
```javascript
export const VIRTUAL_BLOCKS = {
  TL: { contents: [] },
  TM: { contents: [] },
  TR: { contents: [] },
  L1: { contents: [] },
  // ... other locations
};
```

**New Helper Functions:**
```javascript
// Add content item to a location
export const addContentToLocation = (virtualBlocks, location, contentItem) => { ... }

// Remove content item from a location by index
export const removeContentFromLocation = (virtualBlocks, location, index) => { ... }

// Update content item at a location by index
export const updateContentAtLocation = (virtualBlocks, location, index, updates) => { ... }

// Format virtualBlocks for submission
export const formatVirtualBlocksForSubmission = (virtualBlocks, pageId) => { ... }
```

**Update Parsing Functions:**
```javascript
// Update parseVirtualBlocksFromPages to handle contents array
export const parseVirtualBlocksFromPages = (pages) => { ... }

// Update parseVirtualBlocksFromActivePage
export const parseVirtualBlocksFromActivePage = (page) => { ... }
```

**Files to modify:**
- `src/utils/virtual-blocks.js`

---

## Phase 2: Create New Modal for Content Management

### 2.1 Create VirtualBlockContentModal Component

**Location:** `src/components/Modal/VirtualBlockContentModal/VirtualBlockContentModal.jsx`

**Purpose:**
- Display after label selection
- Allow users to add/edit/delete multiple content items
- Each item has a contentType selector (text/link/object)

**Features:**
- List of existing content items with edit/delete actions
- Add new content button
- Content type tabs or selector (text, link, object)
- Appropriate input for each content type:
  - **Text**: Quill editor
  - **Link**: Text input with URL validation
  - **Object**: Objects table/selector

**Props:**
```javascript
{
  selectedLabel: "Notes 📝",      // The chosen block label
  iconLocation: "TM",             // The icon position
  existingContents: [],           // Array of existing content items
  onSave: (contents) => {},       // Save handler
  onCancel: () => {}              // Cancel handler
}
```

**UI Structure:**
```
┌─────────────────────────────────────────┐
│  Virtual Block: Notes 📝                │
├─────────────────────────────────────────┤
│  Existing Content Items:                │
│                                         │
│  1. [Text] "This is a note..."          │
│     [Edit] [Delete]                     │
│                                         │
│  2. [Link] "https://example.com"        │
│     [Edit] [Delete]                     │
│                                         │
│  [+ Add New Content]                    │
├─────────────────────────────────────────┤
│  Add Content Form:                      │
│  Content Type: [Text ▼] [Link] [Object]│
│                                         │
│  [Content input based on type]          │
│                                         │
│  [Add to List] [Cancel]                 │
├─────────────────────────────────────────┤
│            [Save All] [Cancel]          │
└─────────────────────────────────────────┘
```

**Files to create:**
- `src/components/Modal/VirtualBlockContentModal/VirtualBlockContentModal.jsx`
- `src/components/Modal/VirtualBlockContentModal/virtualBlockContentModal.module.scss`
- `src/components/Modal/VirtualBlockContentModal/ContentItemList.jsx` (sub-component)
- `src/components/Modal/VirtualBlockContentModal/ContentItemForm.jsx` (sub-component)

**Files to modify:**
- `src/components/Modal/Modal.jsx` - Add new modal case

---

## Phase 3: Refactor VirtualBlock Component

### 3.1 Update VirtualBlock Component (`src/components/VirtualBlocks/VirtualBlock/VirtualBlock.jsx`)

**Major Changes:**

1. **Remove Second Select**: Eliminate content type dropdown
2. **Direct Modal Opening**: Open VirtualBlockContentModal on label selection
3. **Display Multiple Items**: Show count/badge when multiple items exist
4. **Update State Management**: Work with contents array instead of single item

**New Flow:**
```
1. User selects label from dropdown → "Notes 📝"
2. VirtualBlockContentModal opens automatically
3. User adds/edits content items
4. User clicks "Save All"
5. Modal closes, virtualBlocks state updates
6. Icon displays with badge showing content count
```

**Key Changes:**

```javascript
// Remove handleContentTypeChange - no longer needed
// Remove second MuiSelect

// New handler for label selection
const handleLabelSelect = (selectedLabel) => {
  openModal("virtual-block-content", {
    selectedLabel: selectedLabel,
    iconLocation: label,
    existingContents: checkedObject?.contents || [],
    onSave: handleContentsSave
  });
};

// Save multiple contents
const handleContentsSave = (contents) => {
  setCheckedObject({
    contents: contents,
    status: CREATED
  });
  closeModal();
};
```

**Display Updates:**
- Show icon with badge indicating number of content items
- Click icon to view/edit all contents in modal

**Files to modify:**
- `src/components/VirtualBlocks/VirtualBlock/VirtualBlock.jsx`

---

## Phase 4: Update Reader/Play Functionality

### 4.1 Handle Multiple Content Items in Reader Mode

**Reader Mode Behavior:**
- When user clicks virtual block icon in reader mode
- Show modal with list of all content items
- Each item can be played/viewed individually

**Create VirtualBlockReaderModal:**

**Location:** `src/components/Modal/VirtualBlockReaderModal/VirtualBlockReaderModal.jsx`

**Features:**
- Display all content items for a virtual block
- Click item to view/play:
  - Text → Show in text viewer
  - Link → Open in new tab
  - Object → Open object player

**UI Structure:**
```
┌─────────────────────────────────────────┐
│  Notes 📝                               │
├─────────────────────────────────────────┤
│  1. [📄] Text content preview           │
│     [View]                              │
│                                         │
│  2. [🔗] https://example.com            │
│     [Open]                              │
│                                         │
│  3. [🎮] Interactive Object Name        │
│     [Play]                              │
└─────────────────────────────────────────┘
```

**Files to create:**
- `src/components/Modal/VirtualBlockReaderModal/VirtualBlockReaderModal.jsx`
- `src/components/Modal/VirtualBlockReaderModal/virtualBlockReaderModal.module.scss`

**Files to modify:**
- `src/components/Modal/Modal.jsx` - Add reader modal case
- `src/components/VirtualBlocks/VirtualBlock/VirtualBlock.jsx` - Update handlePlayReader

---

## Phase 5: Update Submission Logic

### 5.1 Format Virtual Blocks for API Submission

**Update Studio Component:**

The Studio component needs to format virtualBlocks data according to the new schema when submitting blocks.

**Location:** `src/components/Studio/` (wherever submission happens)

**New Formatting Function:**
```javascript
const formatVirtualBlocksForSubmission = (virtualBlocks, pageId) => {
  const contents = [];

  // Iterate through all locations
  Object.entries(virtualBlocks).forEach(([location, data]) => {
    if (data.contents && data.contents.length > 0) {
      // Add each content item with iconLocation
      data.contents.forEach(item => {
        contents.push({
          type: item.type,
          iconLocation: location,
          contentType: item.contentType,
          contentValue: item.contentValue
        });
      });
    }
  });

  return contents.length > 0 ? {
    pageId: pageId,
    contents: contents
  } : null;
};
```

**Integration:**
```javascript
// In submit handler
const v_blocks = pages
  .map(page => formatVirtualBlocksForSubmission(page.virtualBlocks, page.id))
  .filter(vb => vb !== null);

const submissionData = {
  blocks: [...formattedBlocks],
  v_blocks: v_blocks
};
```

**Files to modify:**
- `src/utils/virtual-blocks.js` - Add formatting function
- Studio submission handlers (wherever blocks are submitted)

---

## Phase 6: Update Store & Context

### 6.1 Update Global Store (if needed)

**Location:** `src/store/store.js`

**Review:**
- Check if any virtual block related state needs updates
- Ensure modal state can handle new modal names

**Files to review/modify:**
- `src/store/store.js`

### 6.2 Update Studio Context (if applicable)

**Location:** `src/components/Studio/context/StudioContext.jsx`

**Review:**
- Update context if it manages virtualBlocks state
- Ensure hooks work with new data structure

**Files to review/modify:**
- `src/components/Studio/context/StudioContext.jsx`
- `src/components/Studio/hooks/useVirtualBlocks.js`

---

## Phase 7: Backward Compatibility & Migration

### 7.1 Handle Legacy Data

**Migration Function:**
```javascript
// Convert old single-item structure to new multi-item structure
export const migrateLegacyVirtualBlocks = (oldVirtualBlocks) => {
  const newVirtualBlocks = {};

  Object.entries(oldVirtualBlocks).forEach(([location, item]) => {
    if (item.id && item.label) {
      // Old structure detected
      newVirtualBlocks[location] = {
        contents: [{
          type: item.contentType || inferContentType(item),
          iconLocation: location,
          contentType: item.label,
          contentValue: item.id
        }]
      };
    } else if (item.contents) {
      // Already new structure
      newVirtualBlocks[location] = item;
    } else {
      // Empty
      newVirtualBlocks[location] = { contents: [] };
    }
  });

  return newVirtualBlocks;
};
```

**Apply Migration:**
- In `parseVirtualBlocksFromPages`
- In `parseVirtualBlocksFromActivePage`
- When loading existing page data

**Files to modify:**
- `src/utils/virtual-blocks.js`

---

## Phase 8: Testing & Polish

### 8.1 Testing Checklist

**Functionality Tests:**
- [ ] Can select virtual block label from dropdown
- [ ] Modal opens after label selection
- [ ] Can add text content with Quill editor
- [ ] Can add link content with URL validation
- [ ] Can add object content from objects table
- [ ] Can add multiple content items to same location
- [ ] Can edit existing content items
- [ ] Can delete content items
- [ ] Badge shows correct count of items
- [ ] Reader mode displays all content items
- [ ] Can play/view each content type in reader mode
- [ ] Data submits correctly with new format
- [ ] Legacy data migrates correctly
- [ ] Empty locations don't submit v_blocks

**Edge Cases:**
- [ ] Add item without content (validation)
- [ ] Add duplicate items
- [ ] Cancel modal without saving
- [ ] Delete all items from location
- [ ] Invalid URL in link content
- [ ] Missing object ID
- [ ] Very long text content
- [ ] Special characters in text
- [ ] Multiple pages with v_blocks

### 8.2 UI/UX Polish

**Visual Improvements:**
- Badge styling for content count
- Loading states for object fetching
- Error states for failed operations
- Empty states in modal
- Smooth transitions
- Consistent iconography

**Accessibility:**
- Keyboard navigation in modal
- ARIA labels
- Focus management
- Screen reader support

**Files to review:**
- All component SCSS files
- Modal components
- VirtualBlock component

---

## Implementation Order Summary

### Step-by-Step Execution

1. **Phase 1** - Data structures (Foundation)
   - Update `VIRTUAL_BLOCKS` structure
   - Add helper functions
   - Update parsing functions

2. **Phase 2** - Content Modal (Core Feature)
   - Create `VirtualBlockContentModal`
   - Create sub-components
   - Integrate with Modal system

3. **Phase 3** - VirtualBlock Component (Integration)
   - Refactor `VirtualBlock.jsx`
   - Remove second select
   - Connect to new modal

4. **Phase 4** - Reader Mode (User Experience)
   - Create `VirtualBlockReaderModal`
   - Update play handlers

5. **Phase 5** - Submission (Backend Integration)
   - Add formatting functions
   - Update submission handlers

6. **Phase 6** - Store/Context (State Management)
   - Review and update store
   - Update context/hooks

7. **Phase 7** - Migration (Compatibility)
   - Add migration function
   - Apply to parsing functions

8. **Phase 8** - Testing (Quality Assurance)
   - Execute test checklist
   - Polish UI/UX
   - Fix bugs

---

## Breaking Changes & Considerations

### Breaking Changes
1. **State Structure**: virtualBlocks[location] changes from object to { contents: [] }
2. **Submission Format**: v_blocks structure changes completely
3. **Component Props**: VirtualBlock may need different props

### Considerations
1. **Backend API**: Ensure API accepts new v_blocks format
2. **Database Schema**: May need database migration
3. **Existing Pages**: Need migration strategy for saved pages
4. **Performance**: Multiple content items may affect loading
5. **Mobile UX**: Modal may need responsive design

---

## Files Summary

### Files to Create (7)
1. `src/components/Modal/VirtualBlockContentModal/VirtualBlockContentModal.jsx`
2. `src/components/Modal/VirtualBlockContentModal/virtualBlockContentModal.module.scss`
3. `src/components/Modal/VirtualBlockContentModal/ContentItemList.jsx`
4. `src/components/Modal/VirtualBlockContentModal/ContentItemForm.jsx`
5. `src/components/Modal/VirtualBlockReaderModal/VirtualBlockReaderModal.jsx`
6. `src/components/Modal/VirtualBlockReaderModal/virtualBlockReaderModal.module.scss`
7. This plan document: `VIRTUALBLOCKS_REFACTORING_PLAN.md`

### Files to Modify (8+)
1. `src/utils/virtual-blocks.js` - Core data structures
2. `src/components/VirtualBlocks/VirtualBlock/VirtualBlock.jsx` - Main component
3. `src/components/Modal/Modal.jsx` - Add new modal cases
4. `src/store/store.js` - Update if needed
5. `src/components/Studio/context/StudioContext.jsx` - Update if needed
6. `src/components/Studio/hooks/useVirtualBlocks.js` - Update if needed
7. Studio submission handlers - Update formatting
8. Any components that consume virtualBlocks

---

## Estimated Effort

- **Phase 1**: 2-3 hours
- **Phase 2**: 4-5 hours
- **Phase 3**: 2-3 hours
- **Phase 4**: 2-3 hours
- **Phase 5**: 1-2 hours
- **Phase 6**: 1-2 hours
- **Phase 7**: 1-2 hours
- **Phase 8**: 3-4 hours

**Total**: ~16-24 hours

---

## Risk Assessment

### High Risk
- Backend API compatibility
- Data migration for existing pages

### Medium Risk
- State management complexity
- Modal UX with multiple content types
- Reader mode with multiple items

### Low Risk
- UI styling changes
- Helper function implementations

---

## Success Criteria

✅ Single select dropdown for block labels
✅ Modal opens for content entry
✅ Support for multiple content items per location
✅ All three content types working (text, link, object)
✅ Correct submission format matching submit.json
✅ Reader mode displays all items
✅ Legacy data migrates successfully
✅ No breaking changes to other features
✅ All tests pass
✅ UI is polished and responsive

---

## Next Steps

After reviewing this plan:

1. **Approve/Adjust**: Review phases and provide feedback
2. **Prioritize**: Determine which phases are critical for MVP
3. **Backend Coordination**: Confirm API can handle new format
4. **Begin Phase 1**: Start with data structures once approved

---

## Questions for Review

1. Does the new data structure align with backend expectations?
2. Should we support drag-and-drop reordering of content items?
3. Do we need content item duplication feature?
4. Should there be a limit on content items per location?
5. Do we need undo/redo functionality in the modal?
6. Should content items have individual titles/names?
7. Do we need search/filter in the objects table?
8. Should we add content type icons in the display?

---

**Document Version**: 1.0
**Created**: 2026-01-09
**Status**: Pending Review
