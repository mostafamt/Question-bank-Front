# Virtual Blocks Author Mode - UI Improvements Plan

**Date:** 2026-01-09
**Status:** Planning Phase

---

## Overview

Improve the virtual blocks content modal in author mode with three key enhancements:
1. Display object name and type instead of object ID in content list
2. Add spacing between Cancel and Save All buttons
3. Show add content UI directly when modal opens (no initial "Add New Content" button click required)

---

## Current Behavior vs. Desired Behavior

### Issue 1: Object Display in Content List

**Current Behavior:**
```
Content List Item (Type: Object)
┌─────────────────────────────────┐
│ 🎮 Interactive Object           │
│ Interactive Object ID: 507f...  │  ← Shows object ID
│                                 │
│ [Edit] [Delete]                 │
└─────────────────────────────────┘
```

**Desired Behavior:**
```
Content List Item (Type: Object)
┌─────────────────────────────────┐
│ 🎮 Interactive Object           │
│ Name: Multiple Choice Quiz      │  ← Shows object name
│ Type: Multiple Choice           │  ← Shows object type
│                                 │
│ [Edit] [Delete]                 │
└─────────────────────────────────┘
```

**Why:**
- Object IDs are not user-friendly (e.g., "507f1f77bcf86cd799439011")
- Authors need to see what object they selected
- Name and type provide context and clarity

---

### Issue 2: Button Spacing in Footer

**Current Behavior:**
```
Modal Footer
┌─────────────────────────────────┐
│ [Cancel][Save All]              │  ← Buttons close together
└─────────────────────────────────┘
```

**Desired Behavior:**
```
Modal Footer
┌─────────────────────────────────┐
│ [Cancel]           [Save All]   │  ← Buttons spaced apart
└─────────────────────────────────┘
```

**Why:**
- Better visual separation
- Reduces accidental clicks
- Follows modern UI patterns (Cancel left, Save right)

---

### Issue 3: Default Add Content UI State

**Current Behavior:**
```
Modal Opens (Empty Virtual Block)
┌─────────────────────────────────┐
│ Notes 📝                 [Close]│
├─────────────────────────────────┤
│ No content items yet.           │
│                                 │
│ [+ Add New Content]             │  ← User must click
├─────────────────────────────────┤
│ [Cancel]           [Save All]   │
└─────────────────────────────────┘

↓ User clicks "Add New Content"

Modal After Click
┌─────────────────────────────────┐
│ Notes 📝                 [Close]│
├─────────────────────────────────┤
│ Select Content Type:            │
│ [Text] [Link] [Object]          │  ← Form appears
│                                 │
│ [Add to List]                   │
├─────────────────────────────────┤
│ [Cancel]           [Save All]   │
└─────────────────────────────────┘
```

**Desired Behavior:**
```
Modal Opens (Empty Virtual Block)
┌─────────────────────────────────┐
│ Notes 📝                 [Close]│
├─────────────────────────────────┤
│ Select Content Type:            │
│ [Text] [Link] [Object]          │  ← Form visible immediately
│                                 │
│ [Add to List]                   │
├─────────────────────────────────┤
│                                 │
│ (List appears here after add)   │
├─────────────────────────────────┤
│ [Cancel]           [Save All]   │
└─────────────────────────────────┘
```

**Why:**
- Reduces clicks (one less step)
- Faster workflow for authors
- More intuitive - user already knows they want to add content
- Better UX - direct action instead of intermediate button

---

## Implementation Plan

### Phase 1: Display Object Name and Type

**Objective:** Fetch and display object details when showing object type content items

#### Step 1.1: Create Object Info Hook

**File to Create:** `src/hooks/useObjectInfo.js`

```javascript
import { useState, useEffect } from "react";
import { instance } from "../axios";

/**
 * Hook to fetch object information by ID
 * @param {string} objectId - Object ID to fetch
 * @returns {Object} { name, type, loading, error }
 */
export const useObjectInfo = (objectId) => {
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!objectId) return;

    const fetchObjectInfo = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await instance.get(`/interactive-objects/${objectId}`);
        const objectData = response.data;

        setName(objectData.name || objectData.title || "Unnamed Object");
        setType(objectData.type || "Unknown Type");
      } catch (err) {
        console.error("Failed to fetch object info:", err);
        setError(err.message);
        setName("Unknown Object");
        setType("Unknown Type");
      } finally {
        setLoading(false);
      }
    };

    fetchObjectInfo();
  }, [objectId]);

  return { name, type, loading, error };
};

export default useObjectInfo;
```

**Why a Hook?**
- Reusable across components
- Handles loading and error states
- Automatic caching via React
- Clean separation of concerns

---

#### Step 1.2: Update ContentItemList Component

**File to Modify:** `src/components/Modal/VirtualBlockContentModal/ContentItemList.jsx`

**Current Code (Object Preview):**
```javascript
const getContentPreview = (item) => {
  switch (item.type) {
    case "object":
      return `Interactive Object ID: ${item.contentValue}`;  // ❌ Shows ID
    // ...
  }
};
```

**New Code (Object Preview):**
```javascript
// Import the hook
import useObjectInfo from "../../../hooks/useObjectInfo";

// Create new component for object preview
const ObjectPreview = ({ objectId }) => {
  const { name, type, loading, error } = useObjectInfo(objectId);

  if (loading) {
    return <CircularProgress size={16} />;
  }

  if (error) {
    return `Object ID: ${objectId}`;
  }

  return (
    <>
      <Typography variant="body2" sx={{ fontWeight: 500 }}>
        Name: {name}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Type: {type}
      </Typography>
    </>
  );
};

// Update getContentPreview
const getContentPreview = (item) => {
  switch (item.type) {
    case "object":
      return <ObjectPreview objectId={item.contentValue} />;  // ✅ Shows name & type
    // ...
  }
};
```

**Changes:**
- ✅ New `ObjectPreview` component using `useObjectInfo` hook
- ✅ Displays object name and type
- ✅ Shows loading spinner while fetching
- ✅ Fallback to ID if fetch fails
- ✅ Clean typography with MUI components

---

### Phase 2: Add Button Spacing

**Objective:** Add space-between layout to footer buttons

#### Step 2.1: Update VirtualBlockContentModal Footer

**File to Modify:** `src/components/Modal/VirtualBlockContentModal/VirtualBlockContentModal.jsx`

**Current Footer:**
```javascript
<BootstrapModal.Footer>
  <Button variant="outlined" color="secondary" onClick={handleCancel}>
    Cancel
  </Button>
  <Button variant="contained" color="primary" onClick={handleSaveAll}>
    Save All
  </Button>
</BootstrapModal.Footer>
```

**Updated Footer:**
```javascript
<BootstrapModal.Footer>
  <Box
    sx={{
      display: "flex",
      justifyContent: "space-between",
      width: "100%",
    }}
  >
    <Button variant="outlined" color="secondary" onClick={handleCancel}>
      Cancel
    </Button>
    <Button variant="contained" color="primary" onClick={handleSaveAll}>
      Save All
    </Button>
  </Box>
</BootstrapModal.Footer>
```

**Changes:**
- ✅ Wrap buttons in Box component
- ✅ `display: flex` for flexbox layout
- ✅ `justifyContent: space-between` for spacing
- ✅ `width: 100%` to use full width

**Alternative (SCSS):**
If you prefer SCSS approach:

```scss
// virtualBlockContentModal.module.scss
:global(.modal-footer) {
  display: flex;
  justify-content: space-between;
  width: 100%;
}
```

Then no need to wrap in Box.

---

### Phase 3: Show Add Content UI by Default

**Objective:** Display ContentItemForm directly when modal opens (no "Add New Content" button)

#### Step 3.1: Update VirtualBlockContentModal State Logic

**File to Modify:** `src/components/Modal/VirtualBlockContentModal/VirtualBlockContentModal.jsx`

**Current State Logic:**
```javascript
const [showForm, setShowForm] = React.useState(false);  // ❌ Form hidden initially

// In render:
{!showForm && (
  <Button onClick={() => setShowForm(true)}>
    + Add New Content
  </Button>
)}

{showForm && (
  <ContentItemForm ... />
)}
```

**Updated State Logic:**
```javascript
const [showForm, setShowForm] = React.useState(true);  // ✅ Form visible initially

// In render:
<ContentItemForm ... />  // Always visible, no conditional

// After adding item:
const handleAdd = (newItem) => {
  setContents([...contents, newItem]);
  // Don't hide form - keep it visible for adding more
  // Reset form instead
};
```

**Workflow Change:**
```
BEFORE:
1. Modal opens
2. User clicks "Add New Content"
3. Form appears
4. User fills form
5. Click "Add to List"
6. Form hides, "Add New Content" button returns

AFTER:
1. Modal opens with form already visible
2. User fills form
3. Click "Add to List"
4. Item added to list below, form resets for next item
5. Form remains visible for adding more items
```

**Benefits:**
- ✅ One less click
- ✅ Faster workflow
- ✅ Can add multiple items quickly
- ✅ More intuitive UX

---

#### Step 3.2: Update Modal Layout

**Current Layout:**
```
┌─────────────────────────────────┐
│ [+ Add New Content Button]      │
├─────────────────────────────────┤
│ Content Items List              │
└─────────────────────────────────┘
```

**New Layout:**
```
┌─────────────────────────────────┐
│ Add New Content                 │
│ ┌─────────────────────────────┐ │
│ │ ContentItemForm             │ │
│ │ [Text] [Link] [Object]      │ │
│ │ ...                         │ │
│ │ [Add to List]               │ │
│ └─────────────────────────────┘ │
├─────────────────────────────────┤
│ Content Items (2)               │  ← Added items appear here
│ ┌─────────────────────────────┐ │
│ │ Item 1                      │ │
│ │ [Edit] [Delete]             │ │
│ └─────────────────────────────┘ │
│ ┌─────────────────────────────┐ │
│ │ Item 2                      │ │
│ │ [Edit] [Delete]             │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

**Visual Separation:**
- Form at top (always visible)
- Divider line
- List of added items below
- Clear visual hierarchy

---

#### Step 3.3: Update ContentItemForm

**File to Modify:** `src/components/Modal/VirtualBlockContentModal/ContentItemForm.jsx`

**Add Form Reset After Adding:**
```javascript
// Add reset function
const resetForm = () => {
  setContentType("text");
  setValue("");
  setSelectedObject(null);
  // Reset any other form fields
};

// Update handleAdd
const handleAdd = () => {
  const newItem = {
    type: contentType,
    contentValue: contentType === "object" ? selectedObject.id : value,
    contentType: selectedLabel,
  };

  onAdd(newItem);
  resetForm();  // ✅ Reset form for next item
};
```

**Changes:**
- ✅ Form resets after adding
- ✅ Ready for adding next item immediately
- ✅ No need to reopen form

---

### Phase 4: Visual Polish

**Objective:** Improve overall modal appearance

#### Optional Enhancements:

1. **Section Headers:**
```javascript
<Typography variant="h6" sx={{ mb: 2 }}>
  Add New Content
</Typography>
<ContentItemForm ... />

<Divider sx={{ my: 3 }} />

<Typography variant="h6" sx={{ mb: 2 }}>
  Content Items ({contents.length})
</Typography>
<ContentItemList ... />
```

2. **Empty State Message:**
```javascript
{contents.length === 0 ? (
  <Box sx={{ p: 2, textAlign: "center", color: "text.secondary" }}>
    No items added yet. Fill the form above to add your first item.
  </Box>
) : (
  <ContentItemList ... />
)}
```

3. **Scroll Container:**
```javascript
<Box sx={{ maxHeight: "400px", overflowY: "auto" }}>
  <ContentItemList ... />
</Box>
```

---

## Files Summary

### To Create (1 file)

1. **`src/hooks/useObjectInfo.js`**
   - Hook to fetch object name and type
   - Handles loading and error states
   - Reusable across components

### To Modify (3 files)

1. **`src/components/Modal/VirtualBlockContentModal/VirtualBlockContentModal.jsx`**
   - Change `showForm` initial state to `true`
   - Update footer with space-between layout
   - Update modal layout structure

2. **`src/components/Modal/VirtualBlockContentModal/ContentItemList.jsx`**
   - Add `ObjectPreview` component
   - Use `useObjectInfo` hook for object items
   - Display name and type instead of ID

3. **`src/components/Modal/VirtualBlockContentModal/ContentItemForm.jsx`**
   - Add `resetForm` function
   - Reset form after adding item
   - Keep form visible for next addition

### Optional (1 file)

1. **`src/components/Modal/VirtualBlockContentModal/virtualBlockContentModal.module.scss`**
   - Add styles for visual separation
   - Add styles for scroll container
   - Add styles for section headers

---

## Implementation Phases

### Phase 1: Object Name/Type Display (Estimated: 1-2 hours)
1. Create `useObjectInfo` hook
2. Create `ObjectPreview` component
3. Update `ContentItemList` to use new component
4. Test with various object types

### Phase 2: Button Spacing (Estimated: 15 minutes)
1. Update footer layout with Box wrapper
2. Apply flexbox styles
3. Test responsive behavior

### Phase 3: Default Form Visibility (Estimated: 30 minutes)
1. Change `showForm` initial state
2. Remove "Add New Content" button
3. Update form reset logic
4. Update layout structure
5. Test add/edit workflow

### Phase 4: Visual Polish (Estimated: 30 minutes - Optional)
1. Add section headers
2. Add empty state message
3. Add scroll container
4. Test overall appearance

**Total Estimated Time:** 2.5-3.5 hours

---

## Technical Considerations

### API Endpoint for Object Info

**Assumption:** Endpoint exists at `/api/interactive-objects/:id`

**Response Format (Expected):**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "name": "Multiple Choice Quiz",
  "type": "multiple-choice",
  "title": "Science Quiz Chapter 1",
  // ... other fields
}
```

**Question:** What is the actual endpoint and response structure?

If different, the `useObjectInfo` hook needs adjustment.

---

### Performance Considerations

**Object Info Fetching:**
- Each object item triggers API call
- Multiple objects = multiple calls
- Could cause performance issues with many items

**Solutions:**
1. **Batch Fetching:**
   ```javascript
   // Fetch all objects at once
   const objectIds = contents.filter(c => c.type === "object").map(c => c.contentValue);
   const response = await instance.post("/interactive-objects/batch", { ids: objectIds });
   ```

2. **Caching:**
   ```javascript
   // Use React Query or similar
   const { data } = useQuery(['object', objectId], () => fetchObject(objectId));
   ```

3. **Include in Initial Data:**
   - When saving virtual blocks, include object info
   - No need to fetch separately when displaying

**Recommendation:** Start with simple approach (individual fetches), optimize later if needed.

---

### State Management

**Current Flow:**
```
VirtualBlockContentModal
  ├─ useState(contents)
  ├─ useState(showForm)
  └─ ContentItemList
      └─ ObjectPreview (fetches object info)
```

**Consideration:** Object info is fetched in `ContentItemList`, separate from main state. This is fine for display purposes, but doesn't persist object info.

**Alternative:** Fetch and store object info when adding object:
```javascript
const handleAddObject = async (objectId) => {
  const objectInfo = await fetchObject(objectId);
  const newItem = {
    type: "object",
    contentValue: objectId,
    objectName: objectInfo.name,  // Store name
    objectType: objectInfo.type,  // Store type
  };
  setContents([...contents, newItem]);
};
```

This avoids repeated fetches but increases initial save data size.

---

## Testing Checklist

### Phase 1: Object Name/Type

**Test Cases:**
- [ ] Add object to virtual block
- [ ] Object shows name instead of ID
- [ ] Object shows type
- [ ] Loading spinner appears while fetching
- [ ] Error fallback to ID if fetch fails
- [ ] Multiple objects fetch correctly
- [ ] Different object types display correctly

### Phase 2: Button Spacing

**Test Cases:**
- [ ] Cancel button on left
- [ ] Save All button on right
- [ ] Adequate space between buttons
- [ ] Responsive on small screens
- [ ] Buttons don't overlap

### Phase 3: Default Form Visibility

**Test Cases:**
- [ ] Form visible immediately when modal opens
- [ ] Can add item without clicking button first
- [ ] Form resets after adding item
- [ ] Can add multiple items in succession
- [ ] Form remains visible throughout
- [ ] List appears below form
- [ ] Edit mode still works correctly

### Integration Tests

**Full Workflow:**
1. Click virtual block icon (empty block)
2. Modal opens with form visible
3. Add text item → Form resets → Item appears in list
4. Add link item → Form resets → Item appears in list
5. Add object item → Form resets → Item appears with name/type
6. Edit an item → Form populates → Save → Updates in list
7. Delete an item → Removed from list
8. Cancel → Modal closes, changes discarded
9. Save All → Modal closes, contents saved

---

## Questions to Answer

Before implementing, please clarify:

### 1. Object API Endpoint
- What is the endpoint to fetch object by ID?
- What fields are in the response?
- Is the endpoint `/api/interactive-objects/:id` or different?

### 2. Object Fields
- Is the object name in `name` or `title` field?
- Is the object type in `type` field?
- Any other fields we should display?

### 3. Performance
- How many object items typically in a virtual block?
- Is batch fetching needed?
- Should we cache object info?

### 4. Visual Design
- Should buttons be space-between or other spacing?
- Any specific spacing value (e.g., 16px gap)?
- Any other visual changes needed?

---

## Next Steps

1. ✅ Review this plan
2. ✅ Answer questions above
3. ✅ Approve implementation phases
4. 🚀 Begin Phase 1: Object Name/Type Display

---

**Document Version**: 1.0
**Created**: 2026-01-09
**Status**: Awaiting Review & Decisions
