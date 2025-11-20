# Studio Component: Area ID Loss Bug

## Problem Summary

**Critical Bug**: When changing pages or toggling tabs in the Studio component, areas lose their `id` property and other essential metadata. This happens because the `onImageLoad()` function strips non-coordinate properties during coordinate recalculation.

## Affected User Actions

The bug is triggered whenever `onImageLoad()` is called, which occurs during:

1. **Page Navigation** - Calling `changePageByIndex()` or `changePageById()`
2. **Tab Toggle** - Opening/closing the Virtual Blocks tab (`onClickToggleVirutalBlocks()`)
3. **Zoom Operations** - When `imageScaleFactor` changes
4. **Initial Page Load** - When the image first loads

## Technical Details

### Root Cause

The coordinate recalculation pipeline only preserves coordinate-related properties and loses application-specific metadata:

```
User Action (e.g., changePageByIndex)
         ↓
   onImageLoad() [Studio.jsx:189]
         ↓
   processAreasForImageLoad() [coordinate.service.js:340]
         ↓
   processPageAreas() [coordinate.service.js:228]
         ↓
   [BUG] Only coordinate properties preserved, id/name/blockId lost
```

### Code Flow Analysis

#### 1. Initial Area Structure (from initAreas)

```javascript
// src/components/Studio/initializers/index.js:7-23
{
  id: block.blockId,           // ← LOST during onImageLoad
  name: block.objectName,       // ← LOST during onImageLoad
  x: block.coordinates.x,
  y: block.coordinates.y,
  width: block.coordinates.width,
  height: block.coordinates.height,
  unit: "px",
  isChanging: true,
  isNew: true,
  _unit: block.coordinates.unit,
  _updated: false,
}
```

#### 2. Problem in processPageAreas()

Located in `src/components/Studio/services/coordinate.service.js:228-305`:

**Case 1: Non-conversion (lines 237-252)**
```javascript
return {
  x: area.x,
  y: area.y,
  width: area.width,
  height: area.height,
  unit: "px",
  isChanging: true,
  isNew: true,
  _unit: area._unit || "px",
  _updated: area._updated || false,
  _percentX: area._percentX,
  _percentY: area._percentY,
  _percentWidth: area._percentWidth,
  _percentHeight: area._percentHeight,
  // ❌ id, name, blockId are NOT included!
};
```

**Case 2: With conversion (lines 276-292)**
```javascript
const convertedArea = convertPercentageToPixels(
  areaForConversion,
  dimensions
);  // ← Returns only coordinate properties

return preserveMetadata(areaForConversion, convertedArea);
     // ← Only preserves _unit, _updated, _percent* properties
```

#### 3. Problem in convertPercentageToPixels()

Located in `src/utils/coordinates.js:102-125`:

```javascript
export function convertPercentageToPixels(area, dimensions) {
  // ... validation ...

  return {
    x: (percentX / 100) * clientWidth,
    y: (percentY / 100) * clientHeight,
    width: (percentWidth / 100) * clientWidth,
    height: (percentHeight / 100) * clientHeight,
    unit: "px",
    isChanging: true,
    isNew: true,
    // ❌ Only these 7 properties - nothing else!
  };
}
```

#### 4. Problem in preserveMetadata()

Located in `src/utils/coordinates.js:180-208`:

```javascript
export function preserveMetadata(originalArea, convertedArea) {
  return {
    ...convertedArea,              // ← Only coordinate properties
    _unit: originalArea._unit || "percentage",
    _updated: true,
    _percentX: percentX,
    _percentY: percentY,
    _percentWidth: percentWidth,
    _percentHeight: percentHeight,
    // ❌ id, name, blockId are NOT preserved!
  };
}
```

## Impact

### Broken Functionality

1. **Block Reference System** - `getBlockFromBlockId()` at `Studio.jsx:226-248` cannot find blocks by ID
2. **Area Identification** - Areas cannot be uniquely identified across component updates
3. **Data Integrity** - Properties from `areasProperties` cannot be matched with their corresponding areas
4. **Composite Blocks** - Area tracking in composite blocks may fail

### Symptoms Users May Experience

- Areas lose their connection to server-side blocks
- Cannot properly edit or delete specific areas after page navigation
- Inconsistent area behavior when switching between pages
- Duplicate areas or orphaned area properties
- Composite blocks fail to track their areas correctly

## Properties Lost During onImageLoad

The following properties are stripped from areas:

| Property | Source | Purpose |
|----------|--------|---------|
| `id` | `block.blockId` or `uuidv4()` | Unique identifier for area |
| `name` | `block.objectName` | Display name from server |
| `blockId` | Area property sync | Reference to server block |
| `color` | Area properties | Visual highlighting |
| `label` | Area properties | Content type label |
| `typeOfLabel` | Area properties | Data type classification |
| `text` | OCR/user input | Extracted text content |
| `image` | Cropped selection | Image data |
| `loading` | OCR state | Processing indicator |
| Any custom properties | Various sources | Application-specific data |

## Properties That ARE Preserved

Currently only these properties survive `onImageLoad()`:

- Coordinate properties: `x`, `y`, `width`, `height`, `unit`
- Metadata: `_unit`, `_updated`, `isChanging`, `isNew`
- Percentage coordinates: `_percentX`, `_percentY`, `_percentWidth`, `_percentHeight`

## Reproduction Steps

1. Open Studio component with a book that has existing blocks
2. Note the `id` property on areas in initial render (check console logs at `Studio.jsx:89`)
3. Change page using `changePageByIndex()`
4. Observe that areas no longer have `id` property after the change
5. Alternative: Toggle Virtual Blocks tab to trigger the same issue

## Proposed Solution

### Option 1: Preserve All Properties (Recommended)

Modify the coordinate conversion functions to spread all original properties:

```javascript
// In processPageAreas()
return {
  ...area,  // ← Preserve ALL original properties
  x: area.x,
  y: area.y,
  width: area.width,
  height: area.height,
  unit: "px",
  isChanging: true,
  isNew: true,
  _unit: area._unit || "px",
  _updated: area._updated || false,
  // Percentage coordinates...
};
```

```javascript
// In preserveMetadata()
return {
  ...originalArea,  // ← Preserve ALL original properties first
  ...convertedArea, // ← Override with converted coordinates
  _unit: originalArea._unit || "percentage",
  _updated: true,
  // Percentage coordinates...
};
```

### Option 2: Explicit Property Whitelist

Create a list of properties to preserve and explicitly include them:

```javascript
const PRESERVED_PROPERTIES = [
  'id', 'name', 'blockId', 'color', 'label',
  'typeOfLabel', 'text', 'image', 'loading'
];

function preserveAreaProperties(originalArea, newArea) {
  const preserved = {};
  PRESERVED_PROPERTIES.forEach(prop => {
    if (originalArea[prop] !== undefined) {
      preserved[prop] = originalArea[prop];
    }
  });
  return { ...newArea, ...preserved };
}
```

### Option 3: Separate Coordinate and Data Concerns

Split areas into two separate data structures:
- `areaCoordinates[][]` - Only coordinate data (mutable during zoom/pan)
- `areaData[][]` - Application data (immutable, keyed by stable ID)

This would require significant refactoring but provides better separation of concerns.

## Files Requiring Changes

1. **`src/utils/coordinates.js`**
   - `convertPercentageToPixels()` - Preserve all area properties
   - `convertPixelsToPercentage()` - Preserve all area properties
   - `preserveMetadata()` - Preserve all area properties

2. **`src/components/Studio/services/coordinate.service.js`**
   - `processPageAreas()` - Preserve all area properties in all return statements (3 places)

3. **`src/components/Studio/Studio.jsx`**
   - Verify that areas maintain their IDs after onImageLoad calls
   - Add defensive checks for missing IDs

## Testing Recommendations

After implementing the fix:

1. Add console.log to verify `id` persistence after page changes
2. Test all scenarios that trigger `onImageLoad()`:
   - Page navigation
   - Virtual Blocks toggle
   - Zoom in/out
   - Initial page load
3. Verify `getBlockFromBlockId()` can find blocks after navigation
4. Test composite blocks functionality
5. Verify area editing and deletion still works
6. Check that no infinite re-render loops occur

## Priority

**HIGH** - This is a critical data integrity bug that breaks core Studio functionality.

## Related Code References

- Area initialization: `src/components/Studio/initializers/index.js:7-23`
- Main bug location: `src/components/Studio/services/coordinate.service.js:228-305`
- Coordinate conversion: `src/utils/coordinates.js:102-125, 180-208`
- OnImageLoad caller: `src/components/Studio/Studio.jsx:189-200`
- Block lookup that breaks: `src/components/Studio/Studio.jsx:226-248`

## Last Updated

Generated: 2025-11-20
