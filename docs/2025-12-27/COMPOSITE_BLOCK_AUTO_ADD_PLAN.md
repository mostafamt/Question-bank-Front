# Composite Block Auto-Add Feature Plan

## Overview
This plan outlines the implementation for automatically creating a new composite block area when an object is selected via the hand icon, setting the selected object's blockId as the text key.

## Current Behavior

### Existing Flow 1: Drawing Areas Manually
1. User selects a composite block type
2. User draws areas on the page using the area selection tool
3. Areas are added to `compositeBlocks.areas` via `onChangeCompositeBlockArea`
4. User selects a label type for each area (which may trigger OCR or modal for object selection)
5. If type is "Object" or "QObject", modal opens to select an object
6. Selected object's blockId is set as the area's `text` property

### Existing Flow 2: Hand Icon (Current Implementation)
**Location**: `src/components/Studio/hooks/useCompositeBlocks.js:157-167`

```javascript
const onClickHand = () => {
  openModal("composite-blocks-modal", {
    onSelectObject: (blockId) => {
      console.log("blockId= ", blockId);
      // TODO: Currently just logs the blockId
    },
    pages,
    areasProperties,
  });
};
```

**Current State**: The hand icon opens the modal but doesn't do anything when an object is selected (just logs).

## Proposed Feature

### New Flow: Auto-Create Area from Hand Icon
1. User clicks the hand icon (BackHand button)
2. Composite blocks modal opens showing all saved objects on all pages
3. User clicks an object in the modal
4. **NEW**: System automatically creates a new composite block area with:
   - **Coordinates**: Copied from the selected object's coordinates
   - **Text**: Set to the selected object's blockId
   - **ID**: Generated UUID
   - **Type**: Set based on the composite block type context (needs to be determined)
   - **Color**: Next color in the sequence
   - **Other properties**: Default values (loading: false, open: false, etc.)

## Implementation Details

### Data Structures

#### Composite Block Area Structure
Based on analysis of the code, a composite block area needs these properties:

```javascript
{
  id: "uuid-string",           // Generated via uuidv4()
  x: 10,                        // Coordinate (percentage or px)
  y: 20,                        // Coordinate (percentage or px)
  width: 30,                    // Coordinate (percentage or px)
  height: 40,                   // Coordinate (percentage or px)
  unit: "%",                    // "%" or "px"
  type: "Question Title",       // Label type from composite block type
  text: "block-id-12345",       // The blockId of the selected object
  color: "#color-value",        // Color from colors array
  loading: false,               // OCR/processing state
  open: false,                  // Accordion state in UI
  img: null                     // Optional image data
}
```

#### Selected Object Structure (from areasProperties)
```javascript
{
  id: "area-id",
  blockId: "block-id-12345",   // Server-side block ID
  x: 10,
  y: 20,
  width: 30,
  height: 40,
  type: "Question",            // Object type
  // ... other properties
}
```

### Files to Modify

#### 1. `src/components/Studio/hooks/useCompositeBlocks.js`

**Function**: `onClickHand` (lines 157-167)

**Changes Needed**:
- Modify `onSelectObject` callback to create a new area
- Find the selected object in `areasProperties` by blockId
- Copy coordinates from the selected object
- Generate a new UUID for the area
- Assign the next color in sequence
- Add the new area to `compositeBlocks.areas`

**Implementation**:
```javascript
const onClickHand = () => {
  openModal("composite-blocks-modal", {
    onSelectObject: (blockId) => {
      // Find the selected object in areasProperties to get coordinates
      let selectedObject = null;
      let pageIndex = -1;

      for (let i = 0; i < areasProperties.length; i++) {
        const found = areasProperties[i].find(area => area.blockId === blockId);
        if (found) {
          selectedObject = found;
          pageIndex = i;
          break;
        }
      }

      if (!selectedObject) {
        console.error("Selected object not found in areasProperties");
        return;
      }

      // Create new composite block area with object's coordinates
      const newArea = {
        id: uuidv4(),
        x: selectedObject.x,
        y: selectedObject.y,
        width: selectedObject.width,
        height: selectedObject.height,
        unit: selectedObject._unit || "%", // Use original unit or default to %
        type: "",  // Will be set by user in UI
        text: blockId,  // Set blockId as text
        color: colors[compositeBlocks.areas.length % colors.length],
        loading: false,
        open: false,
        img: null
      };

      // Add new area to composite blocks
      setCompositeBlocks(prevState => ({
        ...prevState,
        areas: [...prevState.areas, newArea]
      }));
    },
    pages,
    areasProperties,
  });
};
```

**Dependencies to Import**:
```javascript
import { v4 as uuidv4 } from "uuid";
import { colors } from "../../../constants/highlight-color";
```

### Edge Cases to Handle

1. **Selected object not found**:
   - Should not happen if modal filters correctly
   - Log error and return early if it does

2. **Unit conversion**:
   - Selected object may use different unit than composite blocks expect
   - Use the object's original unit (`_unit`) or default to percentage

3. **Color assignment**:
   - Use modulo to cycle through colors array
   - Based on current number of areas in composite blocks

4. **Empty composite block type**:
   - New area is created with `type: ""` initially
   - User must select type from dropdown in UI (existing behavior)

5. **Coordinate system**:
   - Selected object coordinates should be in percentage (%) for consistency
   - If object uses px, may need conversion (check existing conversion logic)

### Testing Checklist

- [ ] Click hand icon opens modal
- [ ] Modal shows only objects with blockId (Questions/Illustrative objects)
- [ ] Clicking an object in modal creates a new area
- [ ] New area appears in the composite blocks list
- [ ] New area has correct coordinates matching the selected object
- [ ] New area has blockId set as text field
- [ ] New area has a color assigned
- [ ] New area can be edited (type selection)
- [ ] Multiple objects can be added sequentially
- [ ] Composite block can be submitted with the new areas
- [ ] No errors when selected object is from different page

### Optional Enhancements (Future)

1. **Visual feedback**:
   - Highlight the newly added area after creation
   - Show toast notification confirming area was added

2. **Validation**:
   - Prevent adding duplicate objects (same blockId)
   - Warn user if they try to add the same object twice

3. **Type auto-detection**:
   - Pre-fill the `type` field based on the selected object's type
   - E.g., if object is "Question", set area type to a related composite block type

4. **Batch selection**:
   - Allow selecting multiple objects at once
   - Create multiple areas in one operation

## Summary

This feature enables users to quickly add objects to composite blocks by:
1. Clicking the hand icon
2. Selecting an existing object from the modal
3. Automatically creating a new composite block area with the object's coordinates and blockId

This streamlines the workflow by eliminating the need to manually draw areas when referencing existing objects.

## Dependencies

- `uuid` (already in use)
- `colors` from constants (already in use)
- No new dependencies required

## Estimated Complexity

**Low-Medium**:
- Simple modification to existing callback
- Leverages existing data structures
- No new UI components needed
- Straightforward logic
