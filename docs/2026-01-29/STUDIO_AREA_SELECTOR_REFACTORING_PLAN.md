# StudioAreaSelector Refactoring Plan

**Date:** 2026-01-28
**Component:** `src/components/Studio/StudioAreaSelector/StudioAreaSelector.jsx`
**Current LOC:** ~405 lines
**Status:** Planning

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Current Problems](#current-problems)
3. [Proposed Architecture](#proposed-architecture)
4. [Component Breakdown](#component-breakdown)
5. [Implementation Phases](#implementation-phases)
6. [File Structure](#file-structure)
7. [Migration Strategy](#migration-strategy)
8. [Testing Plan](#testing-plan)

---

## Executive Summary

StudioAreaSelector has grown into a complex component handling multiple rendering modes, 20 props, and deeply nested conditional logic. This plan proposes breaking it into focused sub-components with clear responsibilities, improving maintainability and testability.

---

## Current Problems

### 1. Too Many Props (20)

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
  // + onImageLoad from props
} = props;
```

**Problem:** Hard to understand which props are needed for which mode.

### 2. Five Rendering Modes in Nested Ternaries

```javascript
{isReaderMode ? (
  // Mode 1: Reader mode (lines 280-308)
) : readOnly ? (
  // Mode 2: Read-only preview (lines 309-337)
) : highlight === "hand" ? (
  // Mode 3: Hand tool for composite blocks (lines 338-354)
) : activeRightTab.label === X || Y || Z ? (
  // Mode 4: Area editing mode (lines 355-380)
) : (
  // Mode 5: Default/fallback (lines 381-396)
)}
```

**Problem:** Deep nesting makes it hard to understand and modify.

### 3. Repeated Image Rendering (5 times!)

The same `<img>` element with nearly identical props is repeated 5 times:
- Lines 296-307 (reader mode)
- Lines 325-336 (read-only)
- Lines 341-353 (hand tool)
- Lines 368-379 (area selector)
- Lines 383-395 (default)

**Problem:** DRY violation, maintenance burden.

### 4. Mixed Concerns

The component handles:
- Mode detection (reader vs studio)
- Block rendering (5 different modes)
- Image display and scaling
- Virtual blocks wrapper
- Composite block picking logic
- Area selection (editing)
- Click handlers for different modes
- Style calculations

**Problem:** Violates Single Responsibility Principle.

### 5. Dead/Debug Code

```javascript
// Line 146-148: Dead code
const onChangeHandlerForCB = (areas) => {
  // _setCompositeBlocks((prevState) => ({ ...prevState, areas }));
};

// Lines 218-235: Debug logging in production
const prevPropsRef = React.useRef(props);
React.useEffect(() => { ... });
```

**Problem:** Code bloat, potential performance impact.

### 6. Business Logic in Component

```javascript
// Lines 158-162: Complex condition for composite block picking
const condition1 =
  (area.type === "Illustrative object" || area.type === "Question") &&
  list.includes("Object");
const condition2 =
  area.type === "Question" && list.includes("Question");
```

**Problem:** Hard to test, mixed with rendering logic.

---

## Proposed Architecture

### Component Hierarchy

```
StudioAreaSelector (Orchestrator - ~80 lines)
│
├── PageImage (Shared - ~40 lines)
│   └── Reusable image component with scaling
│
├── ReaderModeRenderer (~60 lines)
│   └── ReaderBlockButton (per block)
│
├── ReadOnlyRenderer (~60 lines)
│   └── StudioBlockOverlay (per block)
│
├── HandToolRenderer (~70 lines)
│   └── PickableBlockOverlay (per block)
│
├── EditModeRenderer (~50 lines)
│   └── AreaSelector (library) + customRender
│
└── DefaultRenderer (~30 lines)
    └── Plain image display
```

### Data Flow

```
Props from StudioEditor
        │
        ▼
┌─────────────────────────┐
│  StudioAreaSelector     │
│  (Mode Detection)       │
└───────────┬─────────────┘
            │
    ┌───────┴───────┬───────────┬───────────┬──────────┐
    ▼               ▼           ▼           ▼          ▼
 Reader          ReadOnly    HandTool    EditMode   Default
 Renderer        Renderer    Renderer    Renderer   Renderer
    │               │           │           │          │
    └───────────────┴───────────┴───────────┴──────────┘
                              │
                              ▼
                         PageImage
                        (shared)
```

---

## Component Breakdown

### 1. StudioAreaSelector (Orchestrator)

**Responsibility:** Mode detection and render delegation only.

**Props:** Same as current (passed through to children)

**Logic:**
```javascript
const StudioAreaSelector = React.memo(
  React.forwardRef((props, ref) => {
    const mode = useAppMode();
    const isReaderMode = mode === "reader";

    const renderMode = getRenderMode({
      isReaderMode,
      readOnly: props.readOnly,
      highlight: props.highlight,
      activeRightTab: props.activeRightTab,
    });

    return (
      <VirtualBlocks {...virtualBlocksProps}>
        <div className={styles.block} css={boxColors}>
          {renderMode === "reader" && <ReaderModeRenderer {...props} ref={ref} />}
          {renderMode === "readOnly" && <ReadOnlyRenderer {...props} ref={ref} />}
          {renderMode === "handTool" && <HandToolRenderer {...props} ref={ref} />}
          {renderMode === "editMode" && <EditModeRenderer {...props} ref={ref} />}
          {renderMode === "default" && <DefaultRenderer {...props} ref={ref} />}
        </div>
      </VirtualBlocks>
    );
  })
);
```

**Lines:** ~80

---

### 2. PageImage (Shared Component)

**Responsibility:** Render scaled image with consistent props.

**File:** `shared/PageImage.jsx`

**Props:**
```typescript
interface PageImageProps {
  src: string;
  alt?: string;
  scaleFactor: number;
  onLoad?: () => void;
  cursor?: "default" | "pointer";
  forwardedRef?: React.Ref;
}
```

**Implementation:**
```javascript
const PageImage = React.forwardRef(({
  src,
  alt,
  scaleFactor,
  onLoad,
  cursor = "default",
}, ref) => (
  <img
    src={src}
    alt={alt || src}
    crossOrigin="anonymous"
    ref={ref}
    style={{
      width: `${scaleFactor * 100}%`,
      height: `${scaleFactor * 100}%`,
      overflow: "scroll",
      cursor,
    }}
    onLoad={onLoad}
  />
));
```

**Lines:** ~40

---

### 3. ReaderModeRenderer

**Responsibility:** Render blocks for reader mode (play on click).

**File:** `renderers/ReaderModeRenderer.jsx`

**Props:**
```typescript
interface ReaderModeRendererProps {
  areas: Area[][];
  areasProperties: AreaProperty[][];
  activePage: number;
  pages: Page[];
  imageScaleFactor: number;
  onPlayBlock: (area, areaProps) => void;
  onImageLoad: () => void;
}
```

**Implementation:**
```javascript
const ReaderModeRenderer = React.forwardRef((props, ref) => {
  const {
    areas,
    areasProperties,
    activePage,
    pages,
    imageScaleFactor,
    onPlayBlock,
    onImageLoad,
  } = props;

  const currentAreas = areas[activePage] || [];
  const currentProps = areasProperties[activePage] || [];

  return (
    <div style={{ position: "relative" }}>
      {currentAreas.map((area, idx) => {
        const areaProps = currentProps[idx];
        if (!areaProps?.blockId) return null;

        return (
          <ReaderBlockButton
            key={area.id || idx}
            area={area}
            areaProps={areaProps}
            onClick={() => onPlayBlock?.(area, areaProps)}
          />
        );
      })}
      <PageImage
        src={pages[activePage]?.url}
        scaleFactor={imageScaleFactor}
        onLoad={onImageLoad}
        ref={ref}
      />
    </div>
  );
});
```

**Lines:** ~60

---

### 4. ReaderBlockButton

**Responsibility:** Single clickable block button with shadow.

**File:** `renderers/ReaderBlockButton.jsx`

**Props:**
```typescript
interface ReaderBlockButtonProps {
  area: { x, y, width, height };
  areaProps: { type, blockId };
  onClick: () => void;
}
```

**Implementation:**
```javascript
const ReaderBlockButton = ({ area, areaProps, onClick }) => {
  const style = {
    position: "absolute",
    top: `${area.y}px`,
    left: `${area.x}px`,
    width: `${area.width}px`,
    height: `${area.height}px`,
  };

  return (
    <button
      className={styles["reader-area-button"]}
      style={style}
      onClick={onClick}
      aria-label={`Play ${areaProps.type || "content"}`}
    />
  );
};
```

**Lines:** ~25

---

### 5. ReadOnlyRenderer

**Responsibility:** Render blocks for studio preview mode (colored, with labels).

**File:** `renderers/ReadOnlyRenderer.jsx`

**Props:** Similar to ReaderModeRenderer + `onAreaClick`

**Lines:** ~60

---

### 6. HandToolRenderer

**Responsibility:** Render pickable blocks for composite block creation.

**File:** `renderers/HandToolRenderer.jsx`

**Props:**
```typescript
interface HandToolRendererProps {
  areas: Area[][];
  areasProperties: AreaProperty[][];
  activePage: number;
  pages: Page[];
  imageScaleFactor: number;
  compositeBlocksTypes: Type[];
  compositeBlocks: CompositeBlock;
  setCompositeBlocks: (cb) => void;
  onImageLoad: () => void;
}
```

**Lines:** ~70

---

### 7. EditModeRenderer

**Responsibility:** Render AreaSelector for creating/editing blocks.

**File:** `renderers/EditModeRenderer.jsx`

**Props:**
```typescript
interface EditModeRendererProps {
  areas: Area[][];
  areasProperties: AreaProperty[][];
  activePage: number;
  pages: Page[];
  imageScaleFactor: number;
  activeRightTab: Tab;
  compositeBlocks: CompositeBlock;
  onChangeHandler: (areas) => void;
  highlightedBlockId?: string;
}
```

**Lines:** ~50

---

### 8. DefaultRenderer

**Responsibility:** Render plain image with no interaction.

**File:** `renderers/DefaultRenderer.jsx`

**Props:**
```typescript
interface DefaultRendererProps {
  pages: Page[];
  activePage: number;
  imageScaleFactor: number;
  onImageLoad: () => void;
}
```

**Implementation:**
```javascript
const DefaultRenderer = React.forwardRef((props, ref) => {
  const { pages, activePage, imageScaleFactor, onImageLoad } = props;

  return (
    <div style={{ position: "relative" }}>
      <PageImage
        src={pages[activePage]?.url}
        scaleFactor={imageScaleFactor}
        onLoad={onImageLoad}
        cursor="pointer"
        ref={ref}
      />
    </div>
  );
});
```

**Lines:** ~30

---

### 9. Utility Functions

**File:** `utils/renderMode.js`

```javascript
/**
 * Determine which rendering mode to use
 */
export const getRenderMode = ({
  isReaderMode,
  readOnly,
  highlight,
  activeRightTab,
}) => {
  if (isReaderMode) return "reader";
  if (readOnly) return "readOnly";
  if (highlight === "hand") return "handTool";

  const editingTabs = [
    "Block Authoring",
    "Composite Blocks",
    "Glossary & Keywords",
    "Illustrative Interactions",
  ];

  if (editingTabs.includes(activeRightTab?.label)) {
    return "editMode";
  }

  return "default";
};
```

**File:** `utils/compositeBlockUtils.js`

```javascript
/**
 * Check if area can be picked for composite block
 */
export const canPickForCompositeBlock = (area, compositeBlocksTypes, compositeBlockType) => {
  const list = getList2FromData(compositeBlocksTypes, compositeBlockType);

  const isObjectPickable =
    (area.type === "Illustrative object" || area.type === "Question") &&
    list.includes("Object");

  const isQuestionPickable =
    area.type === "Question" && list.includes("Question");

  return isObjectPickable || isQuestionPickable;
};

/**
 * Filter blocks that can be picked
 */
export const getPickableBlocks = (areas, areasProperties, activePage, compositeBlocksTypes, compositeBlockType) => {
  return (areas[activePage] || [])
    .map((area, idx) => ({ area, idx, props: areasProperties[activePage]?.[idx] }))
    .filter(({ props }) => props?.type !== "Simple item")
    .filter(({ props }) => canPickForCompositeBlock(props, compositeBlocksTypes, compositeBlockType));
};
```

---

## Implementation Phases

### Phase 1: Foundation (Day 1)

**Tasks:**
1. Create folder structure
2. Create `utils/renderMode.js`
3. Create `utils/compositeBlockUtils.js`
4. Create `shared/PageImage.jsx`
5. Remove debug code (lines 218-235)
6. Remove dead code (lines 146-148)

**Risk:** Low - no changes to main component yet

---

### Phase 2: Extract Reader Mode (Day 2)

**Tasks:**
1. Create `renderers/ReaderBlockButton.jsx`
2. Create `renderers/ReaderModeRenderer.jsx`
3. Update StudioAreaSelector to use ReaderModeRenderer
4. Test reader mode thoroughly

**Risk:** Medium - changes reader mode rendering

---

### Phase 3: Extract Read-Only Mode (Day 2-3)

**Tasks:**
1. Create `renderers/StudioBlockOverlay.jsx`
2. Create `renderers/ReadOnlyRenderer.jsx`
3. Update StudioAreaSelector
4. Test read-only mode

**Risk:** Medium

---

### Phase 4: Extract Hand Tool Mode (Day 3)

**Tasks:**
1. Create `renderers/PickableBlockOverlay.jsx`
2. Create `renderers/HandToolRenderer.jsx`
3. Update StudioAreaSelector
4. Test composite block picking

**Risk:** Medium

---

### Phase 5: Extract Edit Mode (Day 4)

**Tasks:**
1. Create `renderers/EditModeRenderer.jsx`
2. Update StudioAreaSelector
3. Test area editing

**Risk:** Medium - most complex mode

---

### Phase 6: Extract Default & Finalize (Day 4-5)

**Tasks:**
1. Create `renderers/DefaultRenderer.jsx`
2. Simplify StudioAreaSelector to orchestrator only
3. Update all imports
4. Final testing
5. Code review

**Risk:** Low

---

## File Structure

```
src/components/Studio/StudioAreaSelector/
├── StudioAreaSelector.jsx          (~80 lines - orchestrator)
├── studioAreaSelector.module.scss
├── index.js
│
├── shared/
│   ├── PageImage.jsx               (~40 lines)
│   └── index.js
│
├── renderers/
│   ├── ReaderModeRenderer.jsx      (~60 lines)
│   ├── ReaderBlockButton.jsx       (~25 lines)
│   ├── ReadOnlyRenderer.jsx        (~60 lines)
│   ├── StudioBlockOverlay.jsx      (~35 lines)
│   ├── HandToolRenderer.jsx        (~70 lines)
│   ├── PickableBlockOverlay.jsx    (~25 lines)
│   ├── EditModeRenderer.jsx        (~50 lines)
│   ├── DefaultRenderer.jsx         (~30 lines)
│   └── index.js
│
├── utils/
│   ├── renderMode.js               (~25 lines)
│   ├── compositeBlockUtils.js      (~40 lines)
│   └── index.js
│
└── __tests__/
    ├── StudioAreaSelector.test.jsx
    ├── renderers.test.jsx
    └── utils.test.js
```

**Total Lines:** ~540 (vs 405 now)
**Avg Component:** ~45 lines
**Max Component:** ~80 lines (orchestrator)

---

## Migration Strategy

### Backward Compatibility

Keep the same props interface on StudioAreaSelector - internal changes only.

### Incremental Approach

Each phase can be merged independently:
- Phase 1: Foundation utilities
- Phase 2: Reader mode
- Phase 3: Read-only mode
- Phase 4: Hand tool mode
- Phase 5: Edit mode
- Phase 6: Final cleanup

### Rollback Plan

If issues arise, revert to previous commit - each phase is self-contained.

---

## Testing Plan

### Unit Tests

| Component | Test Cases |
|-----------|------------|
| `getRenderMode` | All 5 mode combinations |
| `canPickForCompositeBlock` | Valid/invalid picks |
| `PageImage` | Scaling, loading |
| `ReaderBlockButton` | Click, styling |
| `StudioBlockOverlay` | Color, label display |

### Integration Tests

| Scenario | Expected |
|----------|----------|
| Reader mode click | Modal opens |
| Hand tool pick | Block added to composite |
| Edit mode draw | Area created |
| Mode switching | Correct renderer shown |

### E2E Tests

1. Navigate to `/read/book/.../chapter/...` → Reader mode renders
2. Click block → Content plays
3. Switch to studio mode → Colored blocks show
4. Use hand tool → Can pick blocks
5. Edit mode → Can draw areas

---

## Success Criteria

- [ ] No component over 100 lines
- [ ] No nested ternaries in JSX
- [ ] Each component has single responsibility
- [ ] All existing functionality preserved
- [ ] Test coverage > 80%
- [ ] No debug code in production
- [ ] Clear separation of concerns

---

## Questions Before Starting

1. **Priority:** Should reader mode be extracted first (most recently added)?
2. **Testing:** Are there existing tests to maintain?
3. **Timeline:** Is 5 days acceptable for this refactoring?
4. **Review:** Who should review the changes?

---

## Next Steps

1. Get approval on this plan
2. Create feature branch: `refactor/studio-area-selector`
3. Start Phase 1 (Foundation)
4. Daily progress updates
