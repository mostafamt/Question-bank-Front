# onChangeCompositeBlocks Flow - Debug Guide

## Overview

This document traces the flow of `onChangeCompositeBlocks` from the UI component (`StudioCompositeBlocks`) through the entire component hierarchy to the hook where state is managed.

---

## Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. USER ACTION                                                               │
│    User selects a type from the Select dropdown in StudioCompositeBlocks    │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 2. StudioCompositeBlocks.jsx (lines 165-185)                                │
│                                                                              │
│    <Select                                                                   │
│      value={compositeBlocks.type}                                           │
│      onChange={(e) => onChangeCompositeBlocks(null, "type", e.target.value)}│
│    >                                                                         │
│                                                                              │
│    Props received:                                                           │
│    - compositeBlocks (state object)                                         │
│    - onChangeCompositeBlocks (function from hook)                           │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 3. columns/index.js (lines 245-263)                                         │
│                                                                              │
│    buildRightColumns() receives onChangeCompositeBlocks and passes it:      │
│                                                                              │
│    <StudioCompositeBlocks                                                   │
│      compositeBlocks={compositeBlocks}                                      │
│      compositeBlocksTypes={compositeBlocksTypes}                            │
│      onChangeCompositeBlocks={onChangeCompositeBlocks}  ◄── passed here    │
│      ...                                                                    │
│    />                                                                        │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 4. hooks/useStudioColumns.js (lines 140-223)                                │
│                                                                              │
│    rightColumns = useMemo(() => {                                           │
│      const props = rightColumnPropsRef.current;                             │
│      const { onChangeCompositeBlocks, ... } = props;                        │
│                                                                              │
│      return buildRightColumns({                                             │
│        onChangeCompositeBlocks,  ◄── passed to buildRightColumns           │
│        ...                                                                   │
│      });                                                                     │
│    }, [...]);                                                                │
│                                                                              │
│    NOTE: Uses ref (rightColumnPropsRef) to avoid dependency issues          │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 5. Studio.jsx (lines 173-234)                                               │
│                                                                              │
│    const rightColumnProps = React.useMemo(() => ({                          │
│      ...                                                                     │
│      onChangeCompositeBlocks,  ◄── included in memoized props object       │
│      ...                                                                     │
│    }), [onChangeCompositeBlocks, ...]);                                     │
│                                                                              │
│    useStudioColumns({                                                        │
│      rightColumnProps,  ◄── passed to hook                                  │
│      ...                                                                     │
│    });                                                                       │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 6. Studio.jsx (lines 127-145)                                               │
│                                                                              │
│    const {                                                                   │
│      compositeBlocks,                                                        │
│      onChangeCompositeBlocks,  ◄── destructured from hook                  │
│      ...                                                                     │
│    } = useCompositeBlocks({                                                 │
│      canvasRef,                                                              │
│      studioEditorRef,                                                        │
│      language,                                                               │
│      chapterId,                                                              │
│      openModal,                                                              │
│      pages,                                                                  │
│      areasProperties,                                                        │
│    });                                                                       │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 7. hooks/useCompositeBlocks.js (lines 24-47) - THE ACTUAL FUNCTION         │
│                                                                              │
│    const [compositeBlocks, setCompositeBlocks] =                            │
│      React.useState(initCompositeBlocks);                                   │
│                                                                              │
│    const onChangeCompositeBlocks = (id, key, value) => {                    │
│      // CASE 1: Change parent composite block property (id is null)         │
│      if (!id) {                                                              │
│        setCompositeBlocks((prevState) => ({                                 │
│          ...prevState,                                                       │
│          [key]: value,    // Sets the property (e.g., "type")               │
│          areas: [],       // CLEARS all areas!                              │
│        }));                                                                  │
│        return;                                                               │
│      }                                                                       │
│                                                                              │
│      // CASE 2: Update specific area item (id is provided)                  │
│      setCompositeBlocks((prevState) => ({                                   │
│        ...prevState,                                                         │
│        areas: prevState?.areas?.map((item) => {                             │
│          if (item.id === id) {                                              │
│            return { ...item, [key]: value };                                │
│          }                                                                   │
│          return item;                                                        │
│        }),                                                                   │
│      }));                                                                    │
│    };                                                                        │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Key Files in the Flow

| Order | File | Purpose |
|-------|------|---------|
| 1 | `StudioCompositeBlocks.jsx` | UI component with Select |
| 2 | `columns/index.js` | Builds column configuration, passes props |
| 3 | `hooks/useStudioColumns.js` | Manages column building with memoization |
| 4 | `Studio.jsx` | Parent component, creates rightColumnProps |
| 5 | `hooks/useCompositeBlocks.js` | **Source of truth** - defines the function and state |

---

## State Structure

```javascript
// Initial state from initCompositeBlocks() in initializers/index.js
{
  name: "Composite Block abc123",  // Auto-generated name
  type: "",                         // Selected type (empty initially)
  areas: []                         // Array of area objects
}

// Area object structure
{
  id: "uuid-string",      // Unique identifier (REQUIRED for updates!)
  x: 10,                  // X position (percentage)
  y: 20,                  // Y position (percentage)
  width: 30,              // Width (percentage)
  height: 40,             // Height (percentage)
  type: "",               // Area type (from list2)
  text: "",               // Text content or blockId
  color: "#ff0000",       // Highlight color
  loading: false,         // Loading state for OCR
  open: false,            // Accordion open state
  img: null,              // Cropped image data
  unit: "%"               // Unit type
}
```

---

## Debugging Steps

### 1. Verify Data is Loaded

Add console.log in `StudioCompositeBlocks.jsx`:

```javascript
const StudioCompositeBlocks = (props) => {
  const { compositeBlocks, compositeBlocksTypes, onChangeCompositeBlocks } = props;

  // DEBUG: Check if data is loaded
  console.log("DEBUG compositeBlocksTypes:", compositeBlocksTypes);
  console.log("DEBUG list1:", getList1FromData(compositeBlocksTypes));
  console.log("DEBUG compositeBlocks.type:", compositeBlocks.type);
```

### 2. Verify onChange is Called

Add console.log in the Select onChange:

```javascript
<Select
  value={compositeBlocks.type}
  onChange={(e) => {
    console.log("DEBUG Select onChange:", e.target.value);
    onChangeCompositeBlocks(null, "type", e.target.value);
  }}
>
```

### 3. Verify Hook Receives the Call

Add console.log in `useCompositeBlocks.js`:

```javascript
const onChangeCompositeBlocks = (id, key, value) => {
  console.log("DEBUG onChangeCompositeBlocks called:", { id, key, value });

  if (!id) {
    console.log("DEBUG: Updating parent property, clearing areas");
    setCompositeBlocks((prevState) => {
      console.log("DEBUG prevState:", prevState);
      const newState = {
        ...prevState,
        [key]: value,
        areas: [],
      };
      console.log("DEBUG newState:", newState);
      return newState;
    });
    return;
  }
  // ...
};
```

### 4. Verify State Updates

Add a useEffect in `useCompositeBlocks.js`:

```javascript
React.useEffect(() => {
  console.log("DEBUG compositeBlocks state changed:", compositeBlocks);
}, [compositeBlocks]);
```

### 5. Check for Re-render Issues

In `Studio.jsx`, add:

```javascript
React.useEffect(() => {
  console.log("DEBUG rightColumnProps changed");
}, [rightColumnProps]);
```

---

## Common Issues & Solutions

### Issue 1: Select doesn't show any options
**Cause:** `compositeBlocksTypes` is undefined or has wrong structure
**Solution:** Check the API response and `getList1FromData` function

```javascript
// In utils/studio.js - getList1FromData should return [] not undefined
const getList1FromData = (data) => {
  if (!data || !data.labels) {
    return [];  // Return empty array, not undefined
  }
  return data.labels.map((item) => item.typeName);
};
```

### Issue 2: Select value doesn't update
**Cause:** `compositeBlocks.type` doesn't match any MenuItem value
**Solution:** Add a default empty option

```javascript
<Select value={compositeBlocks.type} ...>
  <MenuItem value="">
    <em>Select Type</em>
  </MenuItem>
  {list1?.map((item) => (
    <MenuItem key={item} value={item}>{item}</MenuItem>
  ))}
</Select>
```

### Issue 3: Area type change clears all areas
**Cause:** Area object missing `id` property
**Solution:** Ensure all areas have unique IDs

```javascript
// When creating new area, always include id
const newArea = {
  id: uuidv4(),  // REQUIRED!
  x: area.x,
  y: area.y,
  // ...
};
```

### Issue 4: State updates but UI doesn't reflect
**Cause:** Memoization or ref issues in useStudioColumns
**Solution:** Check if rightColumnPropsRef is being updated

```javascript
// In useStudioColumns.js
useEffect(() => {
  console.log("DEBUG: rightColumnPropsRef updated");
  rightColumnPropsRef.current = rightColumnProps;
}, [rightColumnProps]);
```

---

## Testing Checklist

- [ ] `compositeBlocksTypes` is fetched and not undefined
- [ ] `list1` (from `getList1FromData`) returns an array with items
- [ ] Select onChange fires when clicking an option
- [ ] `onChangeCompositeBlocks` is called with correct arguments
- [ ] State updates in `useCompositeBlocks`
- [ ] Component re-renders with new state
- [ ] `compositeBlocks.type` shows the selected value

---

## Related Files

- `src/utils/studio.js` - getList1FromData, getList2FromData functions
- `src/components/Studio/initializers/index.js` - initCompositeBlocks
- `src/services/api.js` - API calls for compositeBlocksTypes
- `src/pages/ScanAndUpload/ScanAndUpload.jsx` - Where compositeBlocksTypes is fetched
