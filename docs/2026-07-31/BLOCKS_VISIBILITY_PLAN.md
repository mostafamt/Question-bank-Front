# Plan: Add Block Borders/Background Toggle Feature

## Overview
Add a toggle button in the `ImageActions` component that allows users to hide/show the visual styling (borders and backgrounds) of blocks on the page. This provides a cleaner view of the page content when desired.

## Current State Analysis

### ImageActions Component
**Location:** `src/components/ImageActions/ImageActions.jsx`
- Contains icon buttons for navigation, zoom, and virtual blocks visibility
- Uses Material-UI `IconButton` components
- Follow a consistent pattern with toggle buttons (e.g., `showVB` state with visibility icon)

### StudioAreaSelector Component
**Location:** `src/components/Studio/StudioAreaSelector/StudioAreaSelector.jsx`
- Contains `getBlockStyle()` function that defines block styling
- **Current styling logic:**
  - **Reader mode:** Simple positioning, no visual styling
  - **Studio mode:**
    - No color assigned: `border: 2px dashed rgba(0, 0, 0, 0.5)` + `backgroundColor: rgba(0, 0, 0, 0.05)`
    - With color assigned: `border: 2px solid {color}` + `backgroundColor: {hexToRgbA(color)}`

### Component Hierarchy
```
StudioLayout
├── StudioEditor
│   ├── ImageActions
│   └── StudioAreaSelector
```

## Implementation Plan

### Phase 1: Add State Management

**Where:** StudioLayout.jsx (or higher-level component managing studio state)
```
State to add:
- showBlocksStyling: boolean (default: true)
- setShowBlocksStyling: function to toggle state
```

**Rationale:** Keep state at the layout level for easy propagation down

### Phase 2: Prop Threading

**StudioLayout → StudioEditor:**
- Add props: `showBlocksStyling`, `setShowBlocksStyling`

**StudioEditor → ImageActions:**
- Add props: `showBlocksStyling`, `onToggleBlocksStyling`

**StudioEditor → StudioAreaSelector:**
- Add prop: `showBlocksStyling`

### Phase 3: UI Implementation - ImageActions Button

**File:** `src/components/ImageActions/ImageActions.jsx`

**Changes:**
1. Import additional icon (recommend `BorderStyleIcon` or `OutlinedFlagIcon` from `@mui/icons-material`)
2. Add props: `showBlocksStyling`, `onToggleBlocksStyling`
3. Add new toggle button after zoom controls
   - Separator (`<span>|</span>`)
   - Toggle button with icon (switches based on `showBlocksStyling` state)
   - Apply to both editor and reader modes (or only studio mode if preferred)

**Button Logic:**
```
- When showBlocksStyling = true: Display "BlocksVisible" icon (solid)
- When showBlocksStyling = false: Display "BlocksHidden" icon (outline)
- On click: Call onToggleBlocksStyling()
```

### Phase 4: Styling Implementation - StudioAreaSelector

**File:** `src/components/Studio/StudioAreaSelector/StudioAreaSelector.jsx`

**Changes:**
1. Add prop: `showBlocksStyling`
2. Modify `getBlockStyle()` function to conditionally apply styling:

```javascript
const getBlockStyle = useCallback(
  (area, idx) => {
    if (isReaderMode) {
      return { /* existing reader mode styles */ };
    } else {
      // Studio / read-only mode
      const areaProps = areasProperties[activePage]?.[idx];
      
      const baseStyle = {
        position: "absolute",
        top: `${area.y}%`,
        left: `${area.x}%`,
        width: `${area.width}%`,
        height: `${area.height}%`,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      };

      // Only add border and background if showBlocksStyling is true
      if (showBlocksStyling) {
        if (!areaProps?.color) {
          return {
            ...baseStyle,
            border: "2px dashed rgba(0, 0, 0, 0.5)",
            backgroundColor: "rgba(0, 0, 0, 0.05)",
          };
        }
        return {
          ...baseStyle,
          border: `2px solid ${areaProps.color}`,
          backgroundColor: hexToRgbA(areaProps.color),
        };
      }
      
      return baseStyle;
    }
  },
  [isReaderMode, areasProperties, activePage, showBlocksStyling] // Add to dependency array
);
```

3. Update the dependency array to include `showBlocksStyling`

## User Experience

### Behavior
- **Toggle ON (default):** Blocks display with borders and backgrounds (current behavior)
- **Toggle OFF:** Blocks remain interactive but have no visual styling - only visible when hovering/interacting

### Icon Recommendation
- **ON state:** `<BordersIcon />` or custom styled border icon (solid)
- **OFF state:** `<BordersOutlinedIcon />` or faded appearance (outline)

Alternatively:
- `<VisibilityIcon />` when borders visible
- `<VisibilityOffIcon />` when borders hidden (mirrors existing VB toggle pattern)

## Files to Modify

| File | Changes | Priority |
|------|---------|----------|
| `StudioLayout.jsx` | Add state, pass props down | P0 |
| `StudioEditor.jsx` | Pass through props | P0 |
| `ImageActions.jsx` | Add toggle button UI | P0 |
| `StudioAreaSelector.jsx` | Conditional styling logic | P0 |

## Testing Checklist
- [ ] Toggle button appears in ImageActions
- [ ] Clicking toggle switches state correctly
- [ ] Blocks show/hide borders and backgrounds based on toggle state
- [ ] Blocks remain selectable when styling is hidden
- [ ] State persists while navigating between pages
- [ ] Works correctly in both studio and reader modes
- [ ] No visual regression in other UI elements

## Edge Cases
1. **Toggling while selecting area:** Ensure selection behavior is not affected
2. **Page navigation:** State should persist across page changes
3. **Block interaction:** Blocks must remain clickable even when styling is hidden
4. **VirtualBlocks toggle:** Should work independently of blocks styling toggle

## Alternative Approaches Considered

### 1. CSS Class-based Approach
- Add/remove CSS classes instead of inline styles
- **Pros:** Cleaner, easier to maintain styles
- **Cons:** Requires additional styling modifications
- **Recommendation:** Good for future refactoring

### 2. Localstorage Persistence
- Remember user preference across sessions
- **Pros:** Better UX, persistent state
- **Cons:** Adds complexity
- **Recommendation:** Consider for Phase 2 enhancement

### 3. Keyboard Shortcut
- Add hotkey (e.g., `Ctrl+B`) to toggle
- **Recommendation:** Phase 2 enhancement

## Dependencies
- @mui/icons-material (already in use)
- No new dependencies required

## Estimated Implementation Time
- **UI Layer:** 30 minutes
- **State Management:** 20 minutes  
- **Styling Logic:** 20 minutes
- **Testing:** 30 minutes
- **Total:** ~2 hours

---

**Author's Note:** This plan keeps implementation minimal and focused. The feature is purely visual and doesn't affect data structure or block functionality.
