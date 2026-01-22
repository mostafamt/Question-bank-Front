# VirtualBlock Label & Status Missing on Submit - Fix Plan

**Date:** 2025-11-13
**Issue:** When updating virtual blocks via ObjectsTableModalContent2, the label and status fields are missing or empty
**Affected Files:** `src/components/Modal/ObjectsTableModalContent2/ObjectsTableModalContent2.jsx`

---

## Problem Statement

When a user:
1. Selects a virtual block type (e.g., "Activity 🏃‍♂️", "Overview 🧭")
2. Opens the ObjectsTableModalContent2 modal to select an interactive object
3. Clicks Submit

**Expected Result:**
```javascript
virtualBlocks["L1"] = {
  label: "Activity 🏃‍♂️",  // The selected block type
  id: "object-id-123",      // The selected object ID
  status: "new"             // Status indicating it's newly created
}
```

**Actual Result:**
```javascript
virtualBlocks["L1"] = {
  label: "",                 // ❌ Empty! Should be "Activity 🏃‍♂️"
  id: "object-id-123",       // ✅ Correct
  status: undefined          // ❌ Missing! Should be "new"
}
```

---

## Root Cause Analysis

### Current Flow

**Step 1:** User selects block type in VirtualBlock component
```javascript
// VirtualBlock.jsx:124-155
const openVirtualBlocksModal = (blockType) => {
  openModal("virtual-blocks", { /* ... */ });

  // Sets global state
  setFormState({
    ...state,
    virtual_block_label: blockType,        // ✅ "Activity 🏃‍♂️"
    virtual_block_key: label,              // ✅ "L1" (position key)
  });

  // Sets local checked object
  setCheckedObject({
    label: blockType,                      // ✅ "Activity 🏃‍♂️"
    id: checkedObject?.id || "",
    status: CREATED,                       // ✅ "new"
  });
};
```

**Step 2:** ObjectsTableModalContent2 opens

**Step 3:** User submits (selects an object)
```javascript
// ObjectsTableModalContent2.jsx:18-29
const onSubmit = (event) => {
  event.preventDefault();
  setVirtualBlocks({
    ...virtualBlocks,
    [state.virtual_block_key]: {
      ...virtualBlocks[state.virtual_block_key],
      label: virtualBlocks[state.virtual_block_key]?.label,  // ❌ BUG HERE!
      id: object,                                            // ✅ Works
    },
  });
  handleCloseModal();
};
```

### The Bug

**Line 24:** `label: virtualBlocks[state.virtual_block_key]?.label`

This tries to get the label from the **existing** virtualBlocks object:
```javascript
// For a NEW virtual block, virtualBlocks["L1"] is:
{
  label: "",      // Empty string (default from VIRTUAL_BLOCKS)
  id: "",
  status: ""
}

// So virtualBlocks["L1"]?.label returns "" (empty)
```

**What it SHOULD do:**
Use `state.virtual_block_label` which was set in Step 1 and contains "Activity 🏃‍♂️"

**Line 25:** Missing `status` field entirely
- The status field is not included in the object being set
- It should be set to `CREATED` for new blocks or preserved for existing ones

---

## Virtual Block Data Structure

From `src/utils/virtual-blocks.js`:

### Block Structure
```javascript
{
  label: "Activity 🏃‍♂️",   // The block type/category
  id: "object-id",           // The interactive object ID
  status: "new" | "updated" | "deleted"  // Lifecycle status
}
```

### Position Keys
Virtual blocks are organized by position on the page:
- **Top:** TL, TM, TR (Top-Left, Top-Middle, Top-Right)
- **Left side:** L1, L2, L3, L4, L5, L6
- **Right side:** R1, R2, R3, R4, R5, R6
- **Bottom:** BL, BM, BR (Bottom-Left, Bottom-Middle, Bottom-Right)

### Status Values
```javascript
export const SERVER = "updated";   // Existing block from server
export const CREATED = "new";      // Newly created block
export const DELETED = "deleted";  // Marked for deletion
```

---

## Detailed Analysis

### Current State Object
When `openVirtualBlocksModal` is called, the Zustand store contains:
```javascript
{
  virtual_block_label: "Activity 🏃‍♂️",  // ✅ Available
  virtual_block_key: "L1",               // ✅ Available
  // ... other state
}
```

### Current VirtualBlocks Object
For a new block, before submission:
```javascript
virtualBlocks = {
  L1: { label: "", id: "", status: "" },  // Default empty values
  L2: { label: "", id: "", status: "" },
  // ...
}
```

### What Happens in onSubmit (Current - BUGGY)
```javascript
setVirtualBlocks({
  ...virtualBlocks,
  [state.virtual_block_key]: {  // "L1"
    ...virtualBlocks[state.virtual_block_key],  // Spreads: { label: "", id: "", status: "" }
    label: virtualBlocks[state.virtual_block_key]?.label,  // Gets "" from existing
    id: object,  // Sets to "object-id-123" ✅
    // status is implicitly "" from spread (not explicitly set)
  },
});
```

**Result:**
```javascript
virtualBlocks = {
  L1: {
    label: "",              // ❌ Wrong! Should be "Activity 🏃‍♂️"
    id: "object-id-123",    // ✅ Correct
    status: ""              // ❌ Wrong! Should be "new"
  },
  // ...
}
```

---

## Solution

### Fix 1: Use state.virtual_block_label for label

**Change:**
```javascript
// ❌ Before
label: virtualBlocks[state.virtual_block_key]?.label,

// ✅ After
label: state.virtual_block_label,
```

**Rationale:**
- `state.virtual_block_label` contains the selected block type ("Activity 🏃‍♂️")
- It was explicitly set when the modal was opened
- It's the source of truth for what the user selected

### Fix 2: Add status field

**Change:**
```javascript
// ❌ Before (status field missing)
{
  ...virtualBlocks[state.virtual_block_key],
  label: virtualBlocks[state.virtual_block_key]?.label,
  id: object,
}

// ✅ After (status field added)
{
  label: state.virtual_block_label,
  id: object,
  status: CREATED,
}
```

**Rationale:**
- All virtual blocks must have a status field
- For new selections, status should be `CREATED` ("new")
- This tells the system the block needs to be saved to the server

### Fix 3: Consider update vs. create scenario

For robustness, we should handle both creating new blocks and updating existing ones:

```javascript
// Determine if this is an update or create
const existingBlock = virtualBlocks[state.virtual_block_key];
const isUpdate = existingBlock?.id && existingBlock?.status === SERVER;

setVirtualBlocks({
  ...virtualBlocks,
  [state.virtual_block_key]: {
    label: state.virtual_block_label,              // From state
    id: object,                                     // Selected object
    status: isUpdate ? SERVER : CREATED,           // Preserve server status or mark as new
  },
});
```

**Rationale:**
- If updating an existing block from server (status === SERVER), preserve that status
- Otherwise, mark as CREATED for new blocks
- This maintains proper lifecycle management

---

## Implementation Plan

### Phase 1: Minimal Fix (Immediate)

**File:** `src/components/Modal/ObjectsTableModalContent2/ObjectsTableModalContent2.jsx`

**Changes:**

#### Change 1: Import CREATED constant
```javascript
// Add to imports at top of file
import { CREATED } from "../../../utils/virtual-blocks";
```

#### Change 2: Fix onSubmit function
```javascript
// Replace lines 18-29
const onSubmit = (event) => {
  event.preventDefault();

  // Use state.virtual_block_label for label (source of truth)
  // Set status to CREATED for new blocks
  setVirtualBlocks({
    ...virtualBlocks,
    [state.virtual_block_key]: {
      label: state.virtual_block_label,  // ✅ From state, not from existing block
      id: object,                        // ✅ Selected object ID
      status: CREATED,                   // ✅ Mark as newly created
    },
  });

  handleCloseModal();
};
```

**Testing:**
1. Open Studio/Book editor
2. Select a virtual block type (e.g., "Activity 🏃‍♂️")
3. Choose an interactive object from the table
4. Click Submit
5. Verify:
   - `virtualBlocks[position].label === "Activity 🏃‍♂️"` ✅
   - `virtualBlocks[position].id === selected_object_id` ✅
   - `virtualBlocks[position].status === "new"` ✅

### Phase 2: Enhanced Fix (Recommended)

**Additional improvements for robustness:**

#### Import SERVER constant
```javascript
import { CREATED, SERVER } from "../../../utils/virtual-blocks";
```

#### Enhanced onSubmit with update detection
```javascript
const onSubmit = (event) => {
  event.preventDefault();

  // Get existing block if any
  const existingBlock = virtualBlocks[state.virtual_block_key];

  // Determine if updating an existing server block
  const isUpdatingServerBlock =
    existingBlock?.id &&
    existingBlock?.status === SERVER;

  // Build updated block
  const updatedBlock = {
    label: state.virtual_block_label,
    id: object,
    status: isUpdatingServerBlock ? SERVER : CREATED,
  };

  // Update virtualBlocks
  setVirtualBlocks({
    ...virtualBlocks,
    [state.virtual_block_key]: updatedBlock,
  });

  handleCloseModal();
};
```

**Benefits:**
- Preserves SERVER status when updating existing blocks
- Clearly distinguishes between create and update operations
- More maintainable and self-documenting

#### Add validation
```javascript
const onSubmit = (event) => {
  event.preventDefault();

  // Validation: Ensure required data is present
  if (!state.virtual_block_label) {
    console.error("Missing virtual_block_label in state");
    toast.error("Block type not specified. Please try again.");
    return;
  }

  if (!state.virtual_block_key) {
    console.error("Missing virtual_block_key in state");
    toast.error("Block position not specified. Please try again.");
    return;
  }

  if (!object) {
    toast.warning("Please select an object before submitting.");
    return;
  }

  // Get existing block if any
  const existingBlock = virtualBlocks[state.virtual_block_key];

  // Determine status
  const isUpdatingServerBlock =
    existingBlock?.id &&
    existingBlock?.status === SERVER;

  // Build updated block
  const updatedBlock = {
    label: state.virtual_block_label,
    id: object,
    status: isUpdatingServerBlock ? SERVER : CREATED,
  };

  // Update virtualBlocks
  setVirtualBlocks({
    ...virtualBlocks,
    [state.virtual_block_key]: updatedBlock,
  });

  handleCloseModal();
};
```

**Benefits:**
- Prevents submission with invalid data
- Provides clear error messages to user
- Helps debug issues in development

### Phase 3: Additional Improvements (Optional)

#### 1. Add PropTypes or TypeScript
```javascript
// Add PropTypes
import PropTypes from 'prop-types';

ObjectsTableModalContent2.propTypes = {
  handleCloseModal: PropTypes.func.isRequired,
  virtualBlocks: PropTypes.object.isRequired,
  setVirtualBlocks: PropTypes.func.isRequired,
};
```

#### 2. Add JSDoc comments
```javascript
/**
 * Modal for selecting interactive objects for virtual blocks
 *
 * @param {Object} props
 * @param {Function} props.handleCloseModal - Closes the modal
 * @param {Object} props.virtualBlocks - Current virtual blocks state
 * @param {Function} props.setVirtualBlocks - Updates virtual blocks state
 */
const ObjectsTableModalContent2 = (props) => {
  // ...
};
```

#### 3. Improve console.log for debugging
```javascript
// Replace line 10
console.log("ObjectsTableModalContent2 mounted:", {
  virtualBlocks,
  virtual_block_label: state.virtual_block_label,
  virtual_block_key: state.virtual_block_key,
});
```

#### 4. Add success feedback
```javascript
import { toast } from "react-toastify";

const onSubmit = (event) => {
  event.preventDefault();

  // ... validation and update logic ...

  // Update virtualBlocks
  setVirtualBlocks({
    ...virtualBlocks,
    [state.virtual_block_key]: updatedBlock,
  });

  // Success feedback
  toast.success(`${state.virtual_block_label} linked successfully!`);

  handleCloseModal();
};
```

---

## Testing Strategy

### Unit Tests
Create tests for the onSubmit logic:

```javascript
describe("ObjectsTableModalContent2", () => {
  it("should set label from state, not from existing virtualBlocks", () => {
    const mockState = {
      virtual_block_label: "Activity 🏃‍♂️",
      virtual_block_key: "L1",
    };

    const existingVirtualBlocks = {
      L1: { label: "", id: "", status: "" },
    };

    const setVirtualBlocks = jest.fn();

    // Simulate submit with selected object "obj-123"
    // ...

    expect(setVirtualBlocks).toHaveBeenCalledWith({
      ...existingVirtualBlocks,
      L1: {
        label: "Activity 🏃‍♂️",  // From state, not from existing
        id: "obj-123",
        status: "new",
      },
    });
  });

  it("should set status to CREATED for new blocks", () => {
    // Test implementation
  });

  it("should preserve SERVER status when updating existing blocks", () => {
    // Test implementation
  });
});
```

### Integration Tests

**Test Case 1: Create New Virtual Block**
1. Open book editor
2. Navigate to a page
3. Click on an empty virtual block position (e.g., L1)
4. Select "Activity 🏃‍♂️" from dropdown
5. Modal opens - select an object from table
6. Click Submit
7. Verify in state: `virtualBlocks.L1 = { label: "Activity 🏃‍♂️", id: "...", status: "new" }`

**Test Case 2: Update Existing Virtual Block**
1. Load page with existing virtual block (from server)
2. Click on the virtual block
3. Select a different object
4. Click Submit
5. Verify status is preserved correctly

**Test Case 3: Switch Block Type**
1. Create a virtual block with type "Activity 🏃‍♂️"
2. Delete it
3. Create new block at same position with type "Overview 🧭"
4. Verify label changes correctly

### Manual QA Checklist

- [ ] Can create new virtual blocks with correct label
- [ ] Can create new virtual blocks with correct status ("new")
- [ ] Block icon displays correctly after creation
- [ ] Block label displays correctly (with emoji)
- [ ] Can save page with new virtual blocks
- [ ] Can load page and see virtual blocks correctly
- [ ] Can update existing virtual blocks
- [ ] Can delete virtual blocks
- [ ] All block types work (Overview, Activity, Quizz, etc.)
- [ ] Works in both Studio and Reader modes

---

## Code Comparison

### Before (Buggy)
```javascript
const onSubmit = (event) => {
  event.preventDefault();
  setVirtualBlocks({
    ...virtualBlocks,
    [state.virtual_block_key]: {
      ...virtualBlocks[state.virtual_block_key],
      label: virtualBlocks[state.virtual_block_key]?.label,  // ❌ Wrong source
      id: object,
      // ❌ Missing status
    },
  });
  handleCloseModal();
};
```

### After (Fixed - Minimal)
```javascript
import { CREATED } from "../../../utils/virtual-blocks";

const onSubmit = (event) => {
  event.preventDefault();
  setVirtualBlocks({
    ...virtualBlocks,
    [state.virtual_block_key]: {
      label: state.virtual_block_label,  // ✅ Correct source
      id: object,
      status: CREATED,                   // ✅ Status added
    },
  });
  handleCloseModal();
};
```

### After (Fixed - Enhanced)
```javascript
import { CREATED, SERVER } from "../../../utils/virtual-blocks";
import { toast } from "react-toastify";

const onSubmit = (event) => {
  event.preventDefault();

  // Validation
  if (!state.virtual_block_label || !state.virtual_block_key || !object) {
    toast.error("Please ensure all required fields are filled.");
    return;
  }

  // Determine if updating existing server block
  const existingBlock = virtualBlocks[state.virtual_block_key];
  const isUpdatingServerBlock =
    existingBlock?.id &&
    existingBlock?.status === SERVER;

  // Build updated block
  const updatedBlock = {
    label: state.virtual_block_label,
    id: object,
    status: isUpdatingServerBlock ? SERVER : CREATED,
  };

  // Update state
  setVirtualBlocks({
    ...virtualBlocks,
    [state.virtual_block_key]: updatedBlock,
  });

  // Feedback
  toast.success(`${state.virtual_block_label} linked successfully!`);

  handleCloseModal();
};
```

---

## Risk Assessment

### Low Risk
- ✅ Minimal code change (3 lines)
- ✅ Clear source of truth (state.virtual_block_label)
- ✅ No impact on other components
- ✅ Easy to test
- ✅ Easy to rollback if needed

### Potential Issues
- ⚠️ **Timing:** Ensure state.virtual_block_label is set before modal opens
  - **Mitigation:** Already handled in VirtualBlock.jsx:132-136
- ⚠️ **Persistence:** Ensure status field is saved to backend
  - **Verification:** Check API save logic handles status field

---

## Success Criteria

### Functional
- ✅ Virtual block label is correctly set from user selection
- ✅ Virtual block status is set to "new" for new blocks
- ✅ Virtual block ID is set to selected object
- ✅ Virtual blocks save correctly to server
- ✅ Virtual blocks load correctly from server

### Code Quality
- ✅ Code is clear and self-documenting
- ✅ No undefined or empty string labels
- ✅ Proper status lifecycle management
- ✅ Validation prevents invalid submissions

### User Experience
- ✅ Block displays with correct icon after creation
- ✅ Block displays with correct label after creation
- ✅ No console errors or warnings
- ✅ Success feedback shown to user

---

## Related Files

- **Bug Location:** `src/components/Modal/ObjectsTableModalContent2/ObjectsTableModalContent2.jsx`
- **Data Source:** `src/components/VirtualBlocks/VirtualBlock/VirtualBlock.jsx`
- **Constants:** `src/utils/virtual-blocks.js`
- **State Management:** `src/store/store.js`

---

## Timeline

- **Phase 1 (Minimal Fix):** 15 minutes
  - Code changes: 5 minutes
  - Testing: 10 minutes

- **Phase 2 (Enhanced Fix):** 30 minutes
  - Code changes: 15 minutes
  - Testing: 15 minutes

- **Phase 3 (Additional Improvements):** 1 hour
  - PropTypes/TypeScript: 20 minutes
  - Documentation: 20 minutes
  - Unit tests: 20 minutes

**Total: 1 hour 45 minutes** for complete implementation

---

## Conclusion

The bug is caused by trying to read the label from an empty virtualBlocks object instead of using the value stored in the Zustand state. The fix is straightforward:

1. **Use `state.virtual_block_label`** instead of `virtualBlocks[state.virtual_block_key]?.label`
2. **Add `status: CREATED`** to mark new blocks

This ensures virtual blocks are created with all required fields populated correctly.

---

**Status:** ✅ Ready for implementation
**Priority:** High (affects core functionality)
**Complexity:** Low (simple fix)
