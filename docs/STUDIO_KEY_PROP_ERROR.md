# Studio Key Prop Warning - Error Report

## Error Description
```
Warning: Each child in a list should have a unique "key" prop.
Check the render method of `Droppable`.
```

## Component Causing the Issue

**Component:** `StudioActions`
**File Path:** `src/components/Studio/StudioActions/StudioActions.jsx`
**Lines:** 96-126

## Root Cause

The warning originates from the mapping of `areasProperties[activePage]` array to create `Draggable` components inside a `Droppable` container.

### Specific Issues:

1. **Redundant Key Prop (Line 103)**
   - The inner `<div>` inside the Draggable's render function has a redundant `key={area.id}` prop
   - Keys should only be on the `Draggable` component itself (line 97), not on the element it returns
   - This can confuse React's reconciliation algorithm

2. **Potential Missing/Duplicate Keys**
   - If any `area.id` values are `undefined`, `null`, or duplicated, React will throw this warning
   - The key prop on line 97 depends on `area.id` being unique and defined for all items

## Code Location

```jsx
// Lines 93-126 in StudioActions.jsx
{[...areasProperties[activePage]]
  .filter((item) => item.status !== DELETED)
  ?.map((area, idx) => (
    <Draggable key={area.id} draggableId={area.id} index={idx}>  // Line 97 ✓ Correct
      {(provided, snaphost) => (
        <div
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          ref={provided.innerRef}
          key={area.id}  // Line 103 ✗ REDUNDANT - Remove this
          style={{
            display: area.status === DELETED ? "none" : "block",
            overflow: "hidden",
          }}
        >
          <AreaAction
            parameter={area.parameter}
            idx={idx}
            // ... other props
          />
        </div>
      )}
    </Draggable>
  ))}
```

## Recommended Fix

### Solution 1: Remove Redundant Key (Primary Fix)
Remove the `key={area.id}` prop from line 103 (the inner div inside Draggable's render function).

```jsx
{(provided, snaphost) => (
  <div
    {...provided.draggableProps}
    {...provided.dragHandleProps}
    ref={provided.innerRef}
    // Remove: key={area.id}  ← Delete this line
    style={{
      display: area.status === DELETED ? "none" : "block",
      overflow: "hidden",
    }}
  >
```

### Solution 2: Ensure Unique Keys
Verify that all items in `areasProperties[activePage]` have unique, defined `id` values:

```jsx
// Add validation/debugging
{[...areasProperties[activePage]]
  .filter((item) => item.status !== DELETED)
  ?.map((area, idx) => {
    // Fallback to index if area.id is missing (not recommended for production)
    const key = area.id || `area-${idx}`;
    return (
      <Draggable key={key} draggableId={key} index={idx}>
        {/* ... */}
      </Draggable>
    );
  })}
```

## Additional Notes

- The `Draggable` component from `@hello-pangea/dnd` requires unique `key` and `draggableId` props
- Keys should be stable, unique, and derived from data (not array indices when possible)
- The parameter name `snaphost` on line 98 appears to be a typo (should be `snapshot`), though this doesn't affect functionality

## Related Files
- `src/components/Studio/StudioActions/StudioActions.jsx` - Component with the error
- `src/components/AreaAction/AreaAction.jsx` - Child component rendered inside each Draggable
- `src/components/Studio/Studio.jsx` - Parent component that uses StudioActions

## Stack Trace Reference
```
at PublicDraggable
at Droppable
at ConnectFunction
at Provider
at App (Drag-Drop Context)
at List (@mui/material)
at StudioActions ← ERROR SOURCE
at BookColumn
at Studio
at ScanAndUpload
```
