# StudioAreaSelector Refactoring Plan

**Date:** 2026-01-01
**Status:** Planning
**Component:** `src/components/Studio/StudioAreaSelector/StudioAreaSelector.jsx`
**Current LOC:** ~389 lines

## Executive Summary

StudioAreaSelector has become overly complex with multiple rendering modes, 20+ props, nested conditional logic, and mixed responsibilities. This plan outlines a comprehensive refactoring to improve maintainability, testability, and code clarity by extracting focused sub-components and establishing clear separation of concerns.

---

## Table of Contents

1. [Current State Analysis](#current-state-analysis)
2. [Problems Identified](#problems-identified)
3. [Proposed Architecture](#proposed-architecture)
4. [Component Breakdown](#component-breakdown)
5. [Refactoring Phases](#refactoring-phases)
6. [Migration Strategy](#migration-strategy)
7. [Testing Plan](#testing-plan)
8. [Success Criteria](#success-criteria)

---

## Current State Analysis

### Component Responsibility (Too Broad)

StudioAreaSelector currently handles:
- ✗ **Mode detection** (reader vs studio)
- ✗ **Rendering logic** for 4+ different modes
- ✗ **Area selection** (editing mode)
- ✗ **Area display** (read-only mode with 2 sub-modes)
- ✗ **Hand tool** interaction
- ✗ **Composite blocks** picking logic
- ✗ **Virtual blocks** integration
- ✗ **Image scaling** and display
- ✗ **Block styling** (colors, shadows, borders)
- ✗ **Click handlers** (play, edit, toggle)
- ✗ **Debug logging** (lines 218-235)

**Principle Violation:** Single Responsibility Principle (SRP)

### Props Count: 20

```javascript
const {
  areasProperties,        // 1
  setAreasProperties,     // 2
  activePage,             // 3
  imageScaleFactor,       // 4
  areas,                  // 5
  onChangeHandler,        // 6
  pages,                  // 7
  showVB,                 // 8
  virtualBlocks,          // 9
  setVirtualBlocks,       // 10
  activeRightTab,         // 11
  compositeBlocksTypes,   // 12
  compositeBlocks,        // 13
  setCompositeBlocks,     // 14
  highlight,              // 15
  highlightedBlockId,     // 16
  readOnly,               // 17
  onAreaClick,            // 18
  onPlayBlock,            // 19
  // Plus onImageLoad from props object
} = props;
```

**Problem:** Too many dependencies, hard to test, unclear what's required vs optional.

### Rendering Modes: 4+

```javascript
// Mode 1: Read-only + Reader mode (lines 279-321)
{readOnly && isReaderMode ? ... }

// Mode 2: Read-only + Studio mode (lines 279-321)
{readOnly && !isReaderMode ? ... }

// Mode 3: Hand tool (lines 322-338)
{highlight === "hand" ? ... }

// Mode 4: Area selection/editing (lines 339-364)
{activeRightTab matches certain tabs ? ... }

// Mode 5: Default/fallback (lines 365-381)
{else ? ... }
```

**Problem:** Deep nesting, hard to understand flow, difficult to test each mode in isolation.

### Complex Conditional Logic

#### Example 1: Nested ternary in render (lines 279-381)
```javascript
{readOnly ? (
  // 42 lines of code
) : highlight === "hand" ? (
  // 16 lines of code
) : activeRightTab.label === X ||
   activeRightTab.label === Y ||
   activeRightTab.label === Z ? (
  // 21 lines of code
) : (
  // 16 lines of code
)}
```

**Problem:** Hard to read, easy to introduce bugs when adding new modes.

#### Example 2: Composite blocks type checking (lines 158-162)
```javascript
const condition1 =
  (area.type === "Illustrative object" || area.type === "Question") &&
  list.includes("Object");
const condition2 =
  area.type === "Question" && list.includes("Question");
```

**Problem:** Business logic mixed with component logic, should be in a utility.

### Unused/Dead Code

#### Dead function (lines 146-148)
```javascript
const onChangeHandlerForCB = (areas) => {
  // _setCompositeBlocks((prevState) => ({ ...prevState, areas }));
};
```

**Problem:** Commented-out code, no usage, should be removed.

#### Debug code (lines 218-235)
```javascript
// Debug: Log which props are changing
const prevPropsRef = React.useRef(props);
React.useEffect(() => {
  // ... prop tracking logic ...
});
```

**Problem:** Debug code in production, adds unnecessary overhead.

### Styling Concerns

Inline styles scattered throughout:
- Lines 203-211: Hand tool block styles
- Lines 244-247: Wrapper style (could be CSS)
- Lines 314-318: Image styles (repeated 4 times!)
- Lines 330-335: Image styles with cursor
- Lines 357-361: Image styles
- Lines 372-377: Image styles with cursor

**Problem:** Repeated code, hard to maintain consistent styling.

---

## Problems Identified

### 1. **God Component Anti-Pattern**
- Handles too many responsibilities
- Violates Single Responsibility Principle
- Hard to test, debug, and maintain

### 2. **Props Drilling**
- 20 props passed down
- Many props only used in specific modes
- Unclear prop contracts (what's required when?)

### 3. **Conditional Complexity**
- 4-level nested ternary in render
- Multiple `if (mode === X)` checks
- Hard to add new rendering modes

### 4. **Code Duplication**
- Image rendering repeated 4 times
- Block rendering logic duplicated
- Style calculations duplicated

### 5. **Mixed Concerns**
- Rendering + business logic (composite block picking)
- Presentation + state management
- Layout + event handling

### 6. **Poor Testability**
- Hard to test individual rendering modes
- Can't test business logic in isolation
- No clear component boundaries

### 7. **Maintenance Burden**
- Hard to understand what changed when props change
- Debug code cluttering the component
- Unclear what each mode does

---

## Proposed Architecture

### Component Hierarchy

```
StudioAreaSelector (Orchestrator)
├── ReadOnlyAreaRenderer (Conditional)
│   ├── ReaderModeBlocks (isReaderMode === true)
│   │   └── ReaderBlockButton (per block)
│   └── StudioModeBlocks (isReaderMode === false)
│       └── StudioBlockOverlay (per block with customRender)
├── HandToolRenderer (highlight === "hand")
│   └── CompositeBlockPickerOverlay (per pickable block)
├── EditModeRenderer (active tab matches editing tabs)
│   ├── AreaSelector (from library)
│   └── AreaOverlay (customRender logic)
├── DefaultRenderer (fallback)
└── Shared Components
    ├── PageImage (reusable image component)
    └── VirtualBlocks (wrapper - existing)
```

### Responsibility Distribution

| Component | Responsibility | Props Count |
|-----------|----------------|-------------|
| **StudioAreaSelector** | Mode detection, render delegation | 20 → 8 |
| **ReadOnlyAreaRenderer** | Render blocks in read-only mode | 8 |
| **ReaderModeBlocks** | Render blocks for reading (play on click) | 6 |
| **ReaderBlockButton** | Single block button with shadow | 4 |
| **StudioModeBlocks** | Render blocks for preview (colored) | 6 |
| **StudioBlockOverlay** | Block with type/label overlay | 5 |
| **HandToolRenderer** | Render hand tool mode for composite picking | 6 |
| **CompositeBlockPickerOverlay** | Single pickable block overlay | 4 |
| **EditModeRenderer** | Render AreaSelector for editing | 7 |
| **DefaultRenderer** | Render plain image (no interaction) | 3 |
| **PageImage** | Reusable image component | 4 |

### Data Flow

```
Props from Studio
      ↓
StudioAreaSelector (orchestrator)
      ↓
   [Mode Detection]
      ↓
   ┌──────┴──────┬──────────┬─────────┐
   ↓             ↓          ↓         ↓
ReadOnly     HandTool    EditMode  Default
Renderer     Renderer    Renderer  Renderer
   ↓
[Sub-mode Detection]
   ↓
┌─────┴────┐
↓          ↓
Reader   Studio
Mode     Mode
Blocks   Blocks
```

---

## Component Breakdown

### 1. StudioAreaSelector (Main Orchestrator)

**Responsibility:** Detect rendering mode and delegate to appropriate renderer.

**File:** `StudioAreaSelector.jsx`

**Props (Reduced from 20 to 8):**
```javascript
{
  // Core data
  areas,
  areasProperties,
  pages,
  activePage,

  // Display settings
  imageScaleFactor,
  highlightedBlockId,

  // Virtual blocks
  showVB,
  virtualBlocks,
  setVirtualBlocks,

  // Mode flags
  readOnly,
  highlight,
  activeRightTab,

  // Event handlers (grouped)
  handlers: {
    onImageLoad,
    onAreaClick,
    onPlayBlock,
    onChangeArea,
    onPickCompositeBlock,
  }
}
```

**Logic:**
```javascript
const StudioAreaSelector = (props) => {
  const mode = useAppMode();
  const isReaderMode = mode === 'reader';

  const renderingMode = determineRenderingMode({
    readOnly,
    highlight,
    activeRightTab,
    isReaderMode,
  });

  return (
    <VirtualBlocks {...virtualBlocksProps}>
      <div className={styles.block}>
        {renderingMode === 'readOnly' && (
          <ReadOnlyAreaRenderer {...readOnlyProps} />
        )}
        {renderingMode === 'handTool' && (
          <HandToolRenderer {...handToolProps} />
        )}
        {renderingMode === 'editMode' && (
          <EditModeRenderer {...editModeProps} />
        )}
        {renderingMode === 'default' && (
          <DefaultRenderer {...defaultProps} />
        )}
      </div>
    </VirtualBlocks>
  );
};
```

---

### 2. ReadOnlyAreaRenderer

**Responsibility:** Render blocks in read-only mode (reader or studio preview).

**File:** `ReadOnlyAreaRenderer/ReadOnlyAreaRenderer.jsx`

**Props:**
```javascript
{
  areas,
  areasProperties,
  activePage,
  pages,
  imageScaleFactor,
  isReaderMode,
  onAreaClick,
  onPlayBlock,
  onImageLoad,
}
```

**Logic:**
```javascript
const ReadOnlyAreaRenderer = ({
  isReaderMode,
  areas,
  areasProperties,
  activePage,
  pages,
  imageScaleFactor,
  onAreaClick,
  onPlayBlock,
  onImageLoad,
}) => {
  return (
    <div style={{ position: 'relative' }}>
      {isReaderMode ? (
        <ReaderModeBlocks
          areas={areas[activePage]}
          areasProperties={areasProperties[activePage]}
          onPlayBlock={onPlayBlock}
        />
      ) : (
        <StudioModeBlocks
          areas={areas[activePage]}
          areasProperties={areasProperties[activePage]}
          onAreaClick={onAreaClick}
        />
      )}
      <PageImage
        src={pages[activePage]?.url}
        scaleFactor={imageScaleFactor}
        onLoad={onImageLoad}
      />
    </div>
  );
};
```

---

### 3. ReaderModeBlocks

**Responsibility:** Render blocks as buttons for reader mode (play on click).

**File:** `ReadOnlyAreaRenderer/ReaderModeBlocks.jsx`

**Props:**
```javascript
{
  areas: Area[],
  areasProperties: AreaProperty[],
  onPlayBlock: (area, areaProps) => void,
}
```

**Logic:**
```javascript
const ReaderModeBlocks = ({ areas, areasProperties, onPlayBlock }) => {
  return areas?.map((area, idx) => {
    const areaProps = areasProperties?.[idx];
    if (!areaProps?.blockId) return null;

    return (
      <ReaderBlockButton
        key={area.id || idx}
        area={area}
        areaProps={areaProps}
        onPlay={onPlayBlock}
      />
    );
  });
};
```

---

### 4. ReaderBlockButton

**Responsibility:** Single block button with shadow styling.

**File:** `ReadOnlyAreaRenderer/ReaderBlockButton.jsx`

**Props:**
```javascript
{
  area: { x, y, width, height },
  areaProps: { type, blockId, ... },
  onPlay: (area, areaProps) => void,
}
```

**Logic:**
```javascript
const ReaderBlockButton = ({ area, areaProps, onPlay }) => {
  const style = {
    position: 'absolute',
    top: `${area.y}%`,
    left: `${area.x}%`,
    width: `${area.width}%`,
    height: `${area.height}%`,
  };

  return (
    <button
      className={styles.readerBlockButton}
      style={style}
      onClick={() => onPlay(area, areaProps)}
      aria-label={`Play ${areaProps.type || 'content'}`}
    />
  );
};
```

---

### 5. StudioModeBlocks

**Responsibility:** Render blocks with colored overlays and labels (studio preview).

**File:** `ReadOnlyAreaRenderer/StudioModeBlocks.jsx`

**Props:**
```javascript
{
  areas: Area[],
  areasProperties: AreaProperty[],
  onAreaClick: (areaNumber) => void,
}
```

**Logic:**
```javascript
const StudioModeBlocks = ({ areas, areasProperties, onAreaClick }) => {
  return areas?.map((area, idx) => {
    const areaProps = areasProperties?.[idx];
    if (!areaProps?.blockId) return null;

    return (
      <StudioBlockOverlay
        key={idx}
        area={area}
        areaProps={areaProps}
        areaNumber={idx + 1}
        onClick={onAreaClick}
      />
    );
  });
};
```

---

### 6. StudioBlockOverlay

**Responsibility:** Single block with colored background and type/label text.

**File:** `ReadOnlyAreaRenderer/StudioBlockOverlay.jsx`

**Props:**
```javascript
{
  area: { x, y, width, height },
  areaProps: { type, label, color, blockId },
  areaNumber: number,
  onClick: (areaNumber) => void,
}
```

**Logic:**
```javascript
const StudioBlockOverlay = ({ area, areaProps, areaNumber, onClick }) => {
  const style = {
    position: 'absolute',
    top: `${area.y}%`,
    left: `${area.x}%`,
    width: `${area.width}%`,
    height: `${area.height}%`,
    border: `2px solid ${areaProps.color || '#000'}`,
    backgroundColor: areaProps.color
      ? hexToRgbA(areaProps.color)
      : 'rgba(0, 0, 0, 0.2)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  return (
    <div style={style} onClick={() => onClick(areaNumber)}>
      <div className={styles.blockLabel}>
        {areaProps.type} - {areaProps.label}
      </div>
    </div>
  );
};
```

---

### 7. HandToolRenderer

**Responsibility:** Render hand tool mode for picking blocks for composite blocks.

**File:** `HandToolRenderer/HandToolRenderer.jsx`

**Props:**
```javascript
{
  areas: Area[],
  areasProperties: AreaProperty[],
  activePage: number,
  pages: Page[],
  imageScaleFactor: number,
  compositeBlocksTypes: Type[],
  compositeBlockType: string,
  onPickBlock: (idx) => void,
  onImageLoad: () => void,
}
```

**Logic:**
```javascript
const HandToolRenderer = ({
  areas,
  areasProperties,
  activePage,
  pages,
  imageScaleFactor,
  compositeBlocksTypes,
  compositeBlockType,
  onPickBlock,
  onImageLoad,
}) => {
  const pickableBlocks = useMemo(() => {
    return filterPickableBlocks(
      areas,
      areasProperties,
      compositeBlocksTypes,
      compositeBlockType
    );
  }, [areas, areasProperties, compositeBlocksTypes, compositeBlockType]);

  return (
    <div style={{ position: 'relative' }}>
      {pickableBlocks.map(({ area, idx }) => (
        <CompositeBlockPickerOverlay
          key={idx}
          area={area}
          onClick={() => onPickBlock(idx)}
        />
      ))}
      <PageImage
        src={pages[activePage]?.url}
        scaleFactor={imageScaleFactor}
        onLoad={onImageLoad}
        cursor="pointer"
      />
    </div>
  );
};
```

---

### 8. CompositeBlockPickerOverlay

**Responsibility:** Single clickable overlay for picking blocks.

**File:** `HandToolRenderer/CompositeBlockPickerOverlay.jsx`

**Props:**
```javascript
{
  area: { x, y, width, height } (in pixels),
  onClick: () => void,
}
```

**Logic:**
```javascript
const CompositeBlockPickerOverlay = ({ area, onClick }) => {
  const style = {
    position: 'absolute',
    top: `${area.y}px`,
    left: `${area.x}px`,
    width: `${area.width}px`,
    height: `${area.height}px`,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    cursor: 'pointer',
  };

  return <div style={style} onClick={onClick} />;
};
```

---

### 9. EditModeRenderer

**Responsibility:** Render AreaSelector for creating/editing blocks.

**File:** `EditModeRenderer/EditModeRenderer.jsx`

**Props:**
```javascript
{
  areas: Area[],
  areasProperties: AreaProperty[],
  activePage: number,
  pages: Page[],
  imageScaleFactor: number,
  activeRightTab: Tab,
  compositeBlocks: CompositeBlock,
  onChangeArea: (areas) => void,
}
```

**Logic:**
```javascript
const EditModeRenderer = ({
  areas,
  areasProperties,
  activePage,
  pages,
  imageScaleFactor,
  activeRightTab,
  compositeBlocks,
  onChangeArea,
}) => {
  const isCompositeBlocksTab =
    activeRightTab.label === 'Composite Blocks';

  const renderedAreas = isCompositeBlocksTab
    ? compositeBlocks.areas || []
    : areas[activePage] || [];

  return (
    <AreaSelector
      areas={renderedAreas}
      onChange={onChangeArea}
      customAreaRenderer={(areaProps) => (
        <AreaOverlay
          areaProps={areaProps}
          areasProperties={areasProperties}
          activePage={activePage}
          isCompositeBlocksTab={isCompositeBlocksTab}
          compositeBlocks={compositeBlocks}
        />
      )}
      unit="percentage"
    >
      <PageImage
        src={pages[activePage]?.url}
        scaleFactor={imageScaleFactor}
      />
    </AreaSelector>
  );
};
```

---

### 10. DefaultRenderer

**Responsibility:** Render plain image with no interaction.

**File:** `DefaultRenderer/DefaultRenderer.jsx`

**Props:**
```javascript
{
  pages: Page[],
  activePage: number,
  imageScaleFactor: number,
  onImageLoad: () => void,
}
```

**Logic:**
```javascript
const DefaultRenderer = ({
  pages,
  activePage,
  imageScaleFactor,
  onImageLoad
}) => {
  return (
    <div style={{ position: 'relative' }}>
      <PageImage
        src={pages[activePage]?.url}
        scaleFactor={imageScaleFactor}
        onLoad={onImageLoad}
        cursor="pointer"
      />
    </div>
  );
};
```

---

### 11. PageImage (Shared Component)

**Responsibility:** Reusable image component with consistent styling.

**File:** `shared/PageImage.jsx`

**Props:**
```javascript
{
  src: string,
  scaleFactor: number,
  onLoad?: () => void,
  cursor?: 'default' | 'pointer',
  alt?: string,
  forwardedRef?: React.Ref,
}
```

**Logic:**
```javascript
const PageImage = React.forwardRef(({
  src,
  scaleFactor,
  onLoad,
  cursor = 'default',
  alt,
}, ref) => {
  const style = {
    width: `${scaleFactor * 100}%`,
    height: `${scaleFactor * 100}%`,
    overflow: 'scroll',
    cursor,
  };

  return (
    <img
      src={src}
      alt={alt || src}
      crossOrigin="anonymous"
      ref={ref}
      style={style}
      onLoad={onLoad}
    />
  );
});
```

---

### 12. Utility Functions (Extract Business Logic)

**File:** `utils/compositeBlockFiltering.js`

```javascript
/**
 * Check if an area can be picked for a composite block type
 */
export const canPickAreaForCompositeBlock = (
  area,
  compositeBlockType,
  compositeBlocksTypes
) => {
  const list = getList2FromData(compositeBlocksTypes, compositeBlockType);

  const isObjectType =
    area.type === 'Illustrative object' || area.type === 'Question';
  const isQuestionType = area.type === 'Question';

  return (
    (isObjectType && list.includes('Object')) ||
    (isQuestionType && list.includes('Question'))
  );
};

/**
 * Filter areas that can be picked for composite blocks
 */
export const filterPickableBlocks = (
  areas,
  areasProperties,
  activePage,
  compositeBlocksTypes,
  compositeBlockType
) => {
  return areas[activePage]
    ?.map((area, idx) => ({ area, idx }))
    .filter(({ idx }) => {
      const areaProps = areasProperties[activePage]?.[idx];

      // Filter out Simple items
      if (areaProps?.type === 'Simple item') return false;

      // Check if pickable for composite block
      return canPickAreaForCompositeBlock(
        areaProps,
        compositeBlockType,
        compositeBlocksTypes
      );
    }) || [];
};
```

**File:** `utils/renderingMode.js`

```javascript
/**
 * Determine which rendering mode to use
 */
export const determineRenderingMode = ({
  readOnly,
  highlight,
  activeRightTab,
}) => {
  if (readOnly) return 'readOnly';
  if (highlight === 'hand') return 'handTool';

  const editingTabs = [
    'Block Authoring',
    'Composite Blocks',
    'Glossary & Keywords',
    'Illustrative Interactions',
  ];

  if (editingTabs.includes(activeRightTab.label)) {
    return 'editMode';
  }

  return 'default';
};
```

---

## Refactoring Phases

### Phase 1: Foundation & Utilities (Week 1)

**Goal:** Extract utilities and create shared components without breaking existing code.

**Tasks:**
1. Create `utils/compositeBlockFiltering.js`
   - Extract `canPickAreaForCompositeBlock`
   - Extract `filterPickableBlocks`
   - Add unit tests

2. Create `utils/renderingMode.js`
   - Extract `determineRenderingMode`
   - Add unit tests

3. Create `PageImage.jsx` shared component
   - Extract image rendering logic
   - Add prop types
   - Test in isolation

4. Remove debug code (lines 218-235)
5. Remove dead code (`onChangeHandlerForCB`)

**Testing:**
- Unit tests for utility functions
- Visual regression test for PageImage
- Existing tests should still pass

**Risk:** Low - no changes to StudioAreaSelector yet

---

### Phase 2: Extract Read-Only Renderers (Week 2)

**Goal:** Extract read-only rendering into separate components.

**Tasks:**
1. Create `ReadOnlyAreaRenderer/` folder structure
2. Create `ReaderBlockButton.jsx`
   - Extract reader mode button logic
   - Add styles from `reader-area-button`
   - Test in isolation

3. Create `StudioBlockOverlay.jsx`
   - Extract studio mode overlay logic
   - Test in isolation

4. Create `ReaderModeBlocks.jsx`
   - Map over areas, render ReaderBlockButton
   - Test with mock data

5. Create `StudioModeBlocks.jsx`
   - Map over areas, render StudioBlockOverlay
   - Test with mock data

6. Create `ReadOnlyAreaRenderer.jsx`
   - Conditional rendering based on isReaderMode
   - Use PageImage component
   - Test both modes

7. Update `StudioAreaSelector.jsx`
   - Replace readOnly section with ReadOnlyAreaRenderer
   - Test that behavior is unchanged

**Testing:**
- Unit tests for each new component
- Integration test for ReadOnlyAreaRenderer
- E2E test for reader mode
- E2E test for studio preview mode

**Risk:** Medium - changes main rendering path

---

### Phase 3: Extract Hand Tool Renderer (Week 3)

**Goal:** Extract hand tool rendering into separate component.

**Tasks:**
1. Create `HandToolRenderer/` folder structure
2. Create `CompositeBlockPickerOverlay.jsx`
   - Extract single overlay logic
   - Test in isolation

3. Create `HandToolRenderer.jsx`
   - Use `filterPickableBlocks` utility
   - Render CompositeBlockPickerOverlay components
   - Use PageImage component
   - Test with mock data

4. Update `StudioAreaSelector.jsx`
   - Replace hand tool section with HandToolRenderer
   - Test that behavior is unchanged

**Testing:**
- Unit tests for CompositeBlockPickerOverlay
- Integration test for HandToolRenderer
- E2E test for hand tool mode

**Risk:** Medium - changes composite block picking

---

### Phase 4: Extract Edit Mode Renderer (Week 4)

**Goal:** Extract edit mode rendering into separate component.

**Tasks:**
1. Create `EditModeRenderer/` folder structure
2. Create `AreaOverlay.jsx`
   - Extract customRender logic
   - Test in isolation

3. Create `EditModeRenderer.jsx`
   - Wrap AreaSelector library component
   - Use AreaOverlay for customAreaRenderer
   - Use PageImage component
   - Test with mock data

4. Update `StudioAreaSelector.jsx`
   - Replace edit mode section with EditModeRenderer
   - Test that behavior is unchanged

**Testing:**
- Unit tests for AreaOverlay
- Integration test for EditModeRenderer
- E2E test for editing mode

**Risk:** Medium - changes area editing

---

### Phase 5: Extract Default Renderer & Finalize (Week 5)

**Goal:** Complete refactoring and clean up orchestrator.

**Tasks:**
1. Create `DefaultRenderer/` folder structure
2. Create `DefaultRenderer.jsx`
   - Simple wrapper around PageImage
   - Test in isolation

3. Refactor `StudioAreaSelector.jsx`
   - Remove all inline rendering
   - Keep only mode detection and delegation
   - Use `determineRenderingMode` utility
   - Simplify props (group handlers)
   - Add prop types

4. Update documentation
   - Update component README
   - Document new component hierarchy
   - Add architecture diagram

5. Performance optimization
   - Add React.memo where appropriate
   - Optimize re-renders
   - Profile component tree

**Testing:**
- Unit tests for DefaultRenderer
- Integration test for full StudioAreaSelector
- E2E tests for all modes
- Performance benchmarks

**Risk:** Low - mostly cleanup

---

### Phase 6: Polish & Migration (Week 6)

**Goal:** Ensure smooth migration and cleanup.

**Tasks:**
1. Update parent components (Studio.jsx, StudioEditor.jsx)
   - Adjust prop passing if needed
   - Test integration

2. Remove old code
   - Delete unused functions
   - Clean up imports

3. Update tests
   - Ensure all tests pass
   - Add missing test coverage
   - Update snapshots

4. Code review & QA
   - Peer review
   - Manual testing all modes
   - Fix any regressions

5. Documentation
   - Update inline comments
   - Update type definitions
   - Add migration guide

**Testing:**
- Full regression test suite
- Visual regression tests
- User acceptance testing

**Risk:** Low - final cleanup

---

## Migration Strategy

### Backward Compatibility

During refactoring, maintain backward compatibility:

```javascript
// StudioAreaSelector.jsx (during migration)

const StudioAreaSelector = (props) => {
  // Support both old and new prop formats
  const handlers = props.handlers || {
    onImageLoad: props.onImageLoad,
    onAreaClick: props.onAreaClick,
    onPlayBlock: props.onPlayBlock,
    // ...
  };

  // ... rest of component
};
```

### Feature Flags

Use feature flags for gradual rollout:

```javascript
// config/features.js
export const FEATURES = {
  USE_REFACTORED_AREA_SELECTOR: process.env.REACT_APP_USE_REFACTORED_AREA_SELECTOR === 'true',
};

// StudioEditor.jsx
import { FEATURES } from '../../config/features';
import StudioAreaSelector from './StudioAreaSelector/StudioAreaSelector';
import StudioAreaSelectorLegacy from './StudioAreaSelector/StudioAreaSelector.legacy';

const AreaSelectorComponent = FEATURES.USE_REFACTORED_AREA_SELECTOR
  ? StudioAreaSelector
  : StudioAreaSelectorLegacy;
```

### Gradual Rollout

1. **Week 1-2:** Develop refactored components alongside existing code
2. **Week 3-4:** Internal testing with feature flag enabled
3. **Week 5:** Beta testing with select users
4. **Week 6:** Full rollout, remove feature flag
5. **Week 7:** Remove legacy code

---

## Testing Plan

### Unit Tests

**Per Component:**
- ReaderBlockButton
- StudioBlockOverlay
- CompositeBlockPickerOverlay
- PageImage
- All utility functions

**Test Coverage Target:** 90%+

### Integration Tests

**Per Renderer:**
- ReadOnlyAreaRenderer (both sub-modes)
- HandToolRenderer
- EditModeRenderer
- DefaultRenderer

**Test Scenarios:**
- Props changes
- Mode switching
- Event handling

### E2E Tests

**Per Mode:**
- Reader mode: Click block → plays content
- Studio preview: Click block → shows metadata
- Hand tool: Click block → adds to composite
- Edit mode: Draw area → creates block
- Default mode: Displays image only

### Visual Regression Tests

**Screenshots:**
- Reader mode with blocks
- Studio mode with colored blocks
- Hand tool with overlays
- Edit mode during area selection
- All modes at different zoom levels

### Performance Tests

**Benchmarks:**
- Render time for 50 blocks
- Re-render time on prop change
- Memory usage
- Component tree depth

---

## Success Criteria

### Code Quality

- ✅ No component over 200 lines
- ✅ No function over 50 lines
- ✅ Max 10 props per component
- ✅ No nested ternaries in JSX
- ✅ Test coverage > 90%
- ✅ No debug code in production
- ✅ No dead/commented code

### Maintainability

- ✅ Clear component responsibilities (SRP)
- ✅ Easy to add new rendering modes
- ✅ Business logic in utilities
- ✅ Styles in CSS modules
- ✅ Comprehensive documentation
- ✅ Type definitions for all props

### Performance

- ✅ No performance regression
- ✅ Render time < 100ms for 50 blocks
- ✅ Memory usage unchanged or improved
- ✅ No unnecessary re-renders

### User Experience

- ✅ All modes work identically to before
- ✅ No visual regressions
- ✅ No functional regressions
- ✅ Smooth transitions between modes

---

## File Structure (After Refactoring)

```
src/components/Studio/StudioAreaSelector/
├── StudioAreaSelector.jsx                 (120 lines - orchestrator)
├── studioAreaSelector.module.scss
├── index.js
│
├── ReadOnlyAreaRenderer/
│   ├── ReadOnlyAreaRenderer.jsx          (60 lines)
│   ├── ReaderModeBlocks.jsx              (40 lines)
│   ├── ReaderBlockButton.jsx             (30 lines)
│   ├── StudioModeBlocks.jsx              (40 lines)
│   ├── StudioBlockOverlay.jsx            (50 lines)
│   └── index.js
│
├── HandToolRenderer/
│   ├── HandToolRenderer.jsx              (60 lines)
│   ├── CompositeBlockPickerOverlay.jsx   (30 lines)
│   └── index.js
│
├── EditModeRenderer/
│   ├── EditModeRenderer.jsx              (70 lines)
│   ├── AreaOverlay.jsx                   (50 lines)
│   └── index.js
│
├── DefaultRenderer/
│   ├── DefaultRenderer.jsx               (30 lines)
│   └── index.js
│
├── shared/
│   ├── PageImage.jsx                     (40 lines)
│   └── index.js
│
├── utils/
│   ├── compositeBlockFiltering.js        (40 lines)
│   ├── renderingMode.js                  (20 lines)
│   └── index.js
│
└── __tests__/
    ├── StudioAreaSelector.test.jsx
    ├── ReadOnlyAreaRenderer.test.jsx
    ├── HandToolRenderer.test.jsx
    ├── EditModeRenderer.test.jsx
    ├── DefaultRenderer.test.jsx
    └── utils.test.js
```

**Total LOC:** ~800 lines (vs. ~389 now)
**Avg Component Size:** ~45 lines (vs. 389 now)
**Max Component Size:** 120 lines (vs. 389 now)

**Note:** More lines overall but much better maintainability, testability, and clarity.

---

## Benefits of Refactoring

### For Developers

1. **Easier to understand** - Each component has one clear purpose
2. **Easier to test** - Small, focused components with clear inputs/outputs
3. **Easier to debug** - Isolated components, clear data flow
4. **Easier to extend** - Add new modes without touching existing code
5. **Easier to review** - Small PRs, clear changes
6. **Better IDE support** - Fewer props, better autocomplete

### For the Codebase

1. **Better organization** - Clear folder structure, logical grouping
2. **Less duplication** - Shared components (PageImage)
3. **Better separation of concerns** - Rendering vs business logic
4. **Easier to refactor further** - Small components are easier to change
5. **Better type safety** - Clearer prop contracts
6. **More testable** - High test coverage possible

### For the Product

1. **More reliable** - Better test coverage, fewer bugs
2. **Faster development** - Less time debugging, more time building
3. **Better performance** - Optimized re-renders, memoization
4. **Easier to add features** - Extensible architecture
5. **Better UX** - More confidence in changes, fewer regressions

---

## Risks & Mitigation

### Risk 1: Breaking Existing Functionality

**Mitigation:**
- Comprehensive test suite before refactoring
- Feature flags for gradual rollout
- Maintain legacy code during migration
- Extensive QA and user testing

### Risk 2: Performance Regression

**Mitigation:**
- Performance benchmarks before/after
- React.memo and useMemo where appropriate
- Profile component tree
- Monitor production metrics

### Risk 3: Extended Development Time

**Mitigation:**
- Phased approach (6 weeks)
- Can stop at any phase if needed
- Each phase delivers incremental value
- Parallel development of new components

### Risk 4: Team Unfamiliarity

**Mitigation:**
- Comprehensive documentation
- Code review sessions
- Pair programming during migration
- Architecture diagram and examples

---

## Next Steps

### Immediate (This Week)

1. **Get stakeholder approval** for refactoring plan
2. **Set up tracking** (GitHub project board)
3. **Create feature branch** (`refactor/studio-area-selector`)
4. **Write initial tests** for existing functionality (baseline)

### Week 1

1. Start Phase 1 (Foundation & Utilities)
2. Extract utility functions
3. Create PageImage component
4. Remove debug/dead code

### Review Points

- **End of Phase 2:** Review read-only rendering
- **End of Phase 4:** Review all renderers
- **End of Phase 6:** Final review and rollout decision

---

## Questions for Team

Before proceeding, please confirm:

1. ✅ **Scope:** Is a 6-week refactoring timeline acceptable?
2. ✅ **Approach:** Does the component breakdown make sense?
3. ✅ **Testing:** Are the testing requirements sufficient?
4. ✅ **Migration:** Is the feature flag approach acceptable?
5. ⚠️ **Priority:** Should we refactor now or wait until after [upcoming feature]?
6. ⚠️ **Resources:** Can we dedicate developer time for this refactoring?

---

## Conclusion

StudioAreaSelector has grown organically to handle many use cases, but it's now at a point where the complexity is hindering development and maintenance. This refactoring plan proposes a systematic approach to:

1. **Break down** a 389-line component into ~15 focused components
2. **Extract** business logic into testable utilities
3. **Establish** clear separation of concerns
4. **Improve** testability, maintainability, and developer experience
5. **Maintain** backward compatibility and zero regressions

The refactoring will be done in 6 phases over 6 weeks, with each phase delivering incremental value and reducing risk. The result will be a more maintainable, testable, and extensible codebase that supports future development.

**Recommendation:** Proceed with Phase 1 immediately to start reducing technical debt.
