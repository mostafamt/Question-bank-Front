# VirtualBlock Component Update - Two-Tier Selection System

## Overview

This document describes the enhancement to the `VirtualBlock` component that introduces a two-tier selection system, allowing users to choose both the **block type** (Overview, Notes, Recall, etc.) and the **content type** (text, link, or object) independently.

## Current Behavior

Currently, the VirtualBlock component works as follows:

1. User selects a block type from a single dropdown (e.g., "Notes 📝", "Overview 🧭", "Summary 📋")
2. Based on the selected block type:
   - **Text blocks** (Notes, Summary) → Opens text-editor modal
   - **Object blocks** (Overview, Recall, Example, etc.) → Opens virtual-blocks modal to select interactive objects

The content type is implicitly determined by the `category` property in `VIRTUAL_BLOCK_MENU` configuration.

## Updated Behavior

### New Two-Tier Selection System

The updated component introduces **two MUI Select dropdowns**:

#### 1. First Select: Block Type (Existing)
- Lists all available block types from `VIRTUAL_BLOCK_MENU`
- Examples: "Overview 🧭", "Notes 📝", "Recall 🧠", "Check Yourself ✅", etc.
- This determines the **semantic purpose** of the block (what it represents in the learning context)

#### 2. Second Select: Content Type (New)
- Lists three content type options:
  - `'text'` - Rich text content
  - `'link'` - External URL/link
  - `'object'` - Interactive object/question
- This determines the **format/implementation** of the content

### User Flow

1. **Step 1**: User selects a block type (e.g., "Overview 🧭")
2. **Step 2**: User selects a content type from the second dropdown:
   - **'text'** → Opens text-editor modal (Quill editor)
   - **'link'** → Opens link-entry modal (MUI TextField for URL input)
   - **'object'** → Opens virtual-blocks modal (existing interactive object selection)

### Example Scenarios

| Block Type | Content Type | Result |
|-----------|-------------|---------|
| Overview 🧭 | text | Text-based overview using rich text editor |
| Overview 🧭 | link | Link to external overview resource |
| Overview 🧭 | object | Interactive object serving as overview |
| Recall 🧠 | text | Text-based recall notes |
| Recall 🧠 | object | Interactive recall quiz |
| Summary 📋 | link | Link to external summary document |

## Technical Implementation

### New State Variables

```javascript
const [contentType, setContentType] = React.useState(""); // 'text', 'link', or 'object'
```

### New Handler Functions

#### 1. `handleContentTypeChange(e)`
Called when the second select changes. Routes to appropriate modal based on selection:
- `'text'` → calls `openTextEditorModal()`
- `'link'` → calls `openLinkEditorModal()` (new function)
- `'object'` → calls `openVirtualBlocksModal()`

#### 2. `openLinkEditorModal(blockType, initialLink)` (New)
Opens a modal with:
- MUI TextField for URL input
- Label: "Enter Link URL"
- Validation for valid URL format
- Save/Cancel buttons
- On save: stores link in `checkedObject.id` (same pattern as text content)

### Modal Integration

#### New Modal: "link-editor"
Create new modal in the global modal system:
- **Name**: `"link-editor"`
- **Props**:
  - `value`: Initial link value
  - `setValue`: State setter function
  - `onClickSubmit`: Callback function on save
- **Components**:
  - MUI TextField with type="url"
  - URL validation
  - Save/Cancel action buttons

### Data Structure Changes

The `checkedObject` structure remains compatible:

```javascript
{
  label: "Overview 🧭",        // Block type
  id: "<content-value>",       // URL string, text content, or object ID
  status: "new",               // Status: 'new', 'updated', 'deleted'
  contentType: "link"          // NEW: 'text', 'link', or 'object'
}
```

**Note**: The `contentType` field should be added to track which type of content is stored in `id`.

### UI Layout

```
┌─────────────────────────────────────┐
│  Select Block Type                  │
│  ┌────────────────────────────────┐ │
│  │ Overview 🧭                  ▼ │ │
│  └────────────────────────────────┘ │
│                                     │
│  Select Content Type                │
│  ┌────────────────────────────────┐ │
│  │ object                       ▼ │ │
│  └────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### Workflow Diagram

```
User selects block type (e.g., "Overview 🧭")
              ↓
Component shows second select (content type)
              ↓
User selects content type
              ↓
         ┌────┴─────┬────────┐
         ↓          ↓        ↓
      'text'     'link'   'object'
         ↓          ↓        ↓
    Text Editor  Link Entry Virtual Blocks
       Modal      Modal      Modal
         ↓          ↓        ↓
    Quill Editor  TextField  Object Selection
         ↓          ↓        ↓
    Save Content → checkedObject.id ← Save
```

## Benefits of This Approach

### 1. Flexibility
- Any block type can now contain text, links, or interactive objects
- Not limited by hardcoded category mappings

### 2. User Control
- Clear, explicit selection of both semantic purpose and content format
- Users can choose the most appropriate content type for their needs

### 3. Backward Compatibility
- Existing data structure (`checkedObject`) remains mostly intact
- Only adds optional `contentType` field
- Existing text/object blocks continue to work

### 4. Extensibility
- Easy to add new content types in the future (e.g., 'video', 'audio', 'embed')
- Just add new option to content type array and handle in switch/if logic

## Migration Considerations

### For Existing Data

Existing virtual blocks should be migrated to include `contentType`:

```javascript
// Migration utility function
const addContentTypeToExistingBlocks = (virtualBlocks) => {
  return Object.keys(virtualBlocks).reduce((acc, key) => {
    const block = virtualBlocks[key];

    // Infer content type from existing data
    const contentType = inferContentType(block);

    acc[key] = {
      ...block,
      contentType: contentType
    };

    return acc;
  }, {});
};

const inferContentType = (block) => {
  // Check if it's a known text block
  if (block.label === NOTES || block.label === SUMMARY) {
    return 'text';
  }

  // Check if id is a URL pattern
  if (block.id && /^https?:\/\//.test(block.id)) {
    return 'link';
  }

  // Default to object
  return 'object';
};
```

### API Changes

If virtual blocks are persisted to backend, update the schema:

```javascript
// Backend schema update
v_blocks: [
  {
    iconLocation: String,    // e.g., "TL", "R1"
    contentType: String,     // Block type label (e.g., "Overview 🧭")
    contentValue: String,    // Content (text/link/object ID)
    contentFormat: String,   // NEW: 'text', 'link', or 'object'
    // ... other fields
  }
]
```

## Implementation Checklist

- [ ] Add second MuiSelect component to VirtualBlock.jsx
- [ ] Create `contentType` state variable
- [ ] Implement `handleContentTypeChange()` handler
- [ ] Create `openLinkEditorModal()` function
- [ ] Create new "link-editor" modal component
- [ ] Add modal to global modal registry
- [ ] Add `contentType` field to `checkedObject` data structure
- [ ] Update form submission to include `contentType`
- [ ] Test all three content type flows (text, link, object)
- [ ] Update virtual-blocks parsing utilities to handle `contentType`
- [ ] Add migration script for existing data
- [ ] Update backend API schema if needed
- [ ] Add unit tests for new functionality
- [ ] Update user documentation

## Code Location References

- **Component**: `src/components/VirtualBlocks/VirtualBlock/VirtualBlock.jsx`
- **Utilities**: `src/utils/virtual-blocks.js`
- **Store**: `src/store/store.js` (modal management)
- **MuiSelect**: `src/components/MuiSelect/MuiSelect.jsx`
- **Modal System**: Modal component in App.js

## Testing Scenarios

### Test Case 1: Text Content
1. Select "Overview 🧭" from first dropdown
2. Select "text" from second dropdown
3. Verify text-editor modal opens
4. Enter rich text content
5. Save and verify content stored correctly

### Test Case 2: Link Content
1. Select "Recall 🧠" from first dropdown
2. Select "link" from second dropdown
3. Verify link-editor modal opens
4. Enter valid URL
5. Save and verify URL stored correctly
6. Click on saved block to verify link opens correctly

### Test Case 3: Object Content
1. Select "Example 🔍" from first dropdown
2. Select "object" from second dropdown
3. Verify virtual-blocks modal opens
4. Select an interactive object
5. Save and verify object ID stored correctly
6. Click on saved block to verify object plays correctly

### Test Case 4: Edit Existing Block
1. Load page with existing virtual blocks
2. Click on existing block
3. Verify correct modal opens based on `contentType`
4. Modify content
5. Save and verify changes persist

### Test Case 5: Delete Block
1. Create a block with any content type
2. Click delete button
3. Verify block removed from state
4. Verify UI updates correctly

## Visual Mockup

### Before Selection
```
┌─────────────────────────┐
│ 🔽 Select Block Type    │
└─────────────────────────┘
```

### After First Selection
```
┌─────────────────────────┐
│ Overview 🧭         🔽  │ ← First Select
├─────────────────────────┤
│ 🔽 Select Content Type  │ ← Second Select (appears after first selection)
└─────────────────────────┘
```

### After Both Selections (Saved Block)
```
┌──────────────────┐
│       ❌         │ ← Delete button (edit mode only)
│   ┌────────┐    │
│   │   🧭   │    │ ← Icon (clickable)
│   └────────┘    │
│    Overview     │ ← Label
└──────────────────┘
```

## Questions & Answers

### Q: Why store link URLs in the same `id` field as text content and object IDs?
**A**: This maintains consistency with the existing data structure and simplifies backend storage. The `contentType` field differentiates how to interpret the `id` value.

### Q: What happens if a user changes the content type after saving?
**A**: The existing content in `id` will be replaced when they save new content. Consider adding a confirmation dialog if changing content type on an existing block.

### Q: Can we add more content types in the future?
**A**: Yes! The design is extensible. Just add new types to the array (`['text', 'link', 'object', 'video', 'audio']`) and handle them in the switch statement.

### Q: How does this affect the reader view?
**A**: In reader mode, when clicking a block:
- **text** → Shows text in a modal
- **link** → Opens URL in new tab or embedded viewer
- **object** → Plays interactive object (existing behavior)

### Q: What about validation?
**A**:
- Text: No validation needed (Quill handles formatting)
- Link: Validate URL format before saving
- Object: Validate object ID exists in database

## Related Files

This update may require changes to:

- `src/components/VirtualBlocks/VirtualBlock/VirtualBlock.jsx` (main changes)
- `src/components/Modal/Modal.jsx` (add link-editor modal case)
- `src/utils/virtual-blocks.js` (update parsing functions)
- `src/store/store.js` (if modal state needs updates)
- Backend API endpoints (if contentFormat field needs to be stored)

## Version History

- **v1.0** (Current): Single select with implicit content type based on block category
- **v2.0** (Proposed): Two-tier selection with explicit content type choice

---

**Author**: Development Team
**Date**: 2025-12-04
**Status**: Proposed Enhancement
**Priority**: Medium
