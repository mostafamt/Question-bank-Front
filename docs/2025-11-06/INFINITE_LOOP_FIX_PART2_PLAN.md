# Infinite Loop Fix - Part 2 Plan

**Date:** November 6, 2025
**Issue:** StudioAreaSelector STILL has infinite loop after Part 1 fix
**Severity:** 🔴 Critical

---

## Problem Analysis

After applying Part 1 fix (useCallback in Studio.jsx, React.memo on components), the infinite loop persists.

### Root Cause: Internal Issues in StudioAreaSelector

#### Issue 1: Inline Props Creating New References (Lines 163-173)

```javascript
<AreaSelector
  areas={[]}                    // ❌ NEW array every render!
  onChange={() => {}}           // ❌ NEW function every render!
  wrapperStyle={{               // ❌ NEW object every render!
    width: "100%",
  }}
  customAreaRenderer={customRender}  // ❌ NEW function every render (see Issue 2)
  areaProps={{                  // ❌ NEW object every render!
    onClick: (event, area) => {
      console.log("here");
    },
  }}
  unit="percentage"
>
```

**Why this causes infinite loop:**
- Even though StudioAreaSelector is wrapped in React.memo, the AreaSelector component inside receives new props every render
- AreaSelector re-renders when it receives new props
- AreaSelector's re-render might trigger state updates or effects
- Those updates cause StudioAreaSelector to re-render
- Cycle repeats infinitely

#### Issue 2: Internal Functions Not Memoized (Lines 32-118)

Five functions are defined in component body, recreated every render:

1. **onClickExistedArea** (Line 32) - Used by customRender
2. **customRender** (Line 40) - Passed to AreaSelector
3. **onImageLoad** (Line 56) - Passed to img elements
4. **onPickAreaForCompositeBlocks** (Line 64) - Used by renderBlocks
5. **renderBlocks** (Line 95) - Called in JSX

**Why this causes infinite loop:**
- These functions are recreated with new references every render
- When passed to child components or used in JSX, they cause re-renders
- Creates a re-render cascade

#### Issue 3: Inline Object/Function in JSX (Line 145, 169-173)

```javascript
{renderBlocks()}  // Creates new array of elements every render

<div style={{ position: "relative" }}>  // New object every render

areaProps={{
  onClick: (event, area) => {  // New function every render
    console.log("here");
  },
}}
```

---

## Solution Strategy

### Part 2A: Fix AreaSelector Props ✅
1. Change `areas={[]}` to `areas={renderedAreas}` (use memoized value)
2. Change `onChange={() => {}}` to `onChange={onChangeHandler}` (use memoized callback from parent)
3. Memoize `wrapperStyle` object
4. Memoize `areaProps` object

### Part 2B: Memoize Internal Functions ✅
1. Wrap `onClickExistedArea` in useCallback
2. Wrap `customRender` in useCallback
3. Wrap `onImageLoad` in useCallback
4. Wrap `onPickAreaForCompositeBlocks` in useCallback
5. Memoize `renderBlocks` result with useMemo

### Part 2C: Memoize Style Objects ✅
1. Move inline style objects outside component or memoize them

---

## Implementation Plan

### File: StudioAreaSelector.jsx

#### Step 1: Add useCallback import
```javascript
import React, { useMemo, useCallback } from "react";
```

#### Step 2: Memoize wrapperStyle and areaProps
```javascript
const wrapperStyle = useMemo(() => ({
  width: "100%",
}), []);

const areaPropsConfig = useMemo(() => ({
  onClick: (event, area) => {
    console.log("here");
  },
}), []);
```

#### Step 3: Wrap internal functions in useCallback

**onClickExistedArea:**
```javascript
const onClickExistedArea = useCallback((areaProps) => {
  const newAreasProperties = [...areasProperties];
  const idx = areaProps.areaNumber - 1;
  newAreasProperties[activePage][idx].open =
    !newAreasProperties[activePage][idx].open;
  setAreasProperties(newAreasProperties);
}, [areasProperties, activePage, setAreasProperties]);
```

**customRender:**
```javascript
const customRender = useCallback((areaProps) => {
  if (!areaProps.isChanging) {
    return (
      <div
        key={areaProps.areaNumber}
        onClick={() => onClickExistedArea(areaProps)}
      >
        <div className={styles.type}>
          {areasProperties[activePage][areaProps.areaNumber - 1]?.type} -
          {areasProperties[activePage][areaProps.areaNumber - 1]?.label}
        </div>
      </div>
    );
  }
}, [onClickExistedArea, areasProperties, activePage]);
```

**onImageLoad:**
```javascript
const onImageLoad = useCallback(() => {
  props.onImageLoad();
}, [props.onImageLoad]);
```

**onPickAreaForCompositeBlocks:**
```javascript
const onPickAreaForCompositeBlocks = useCallback((idx) => {
  const area = areasProperties[activePage][idx];
  const list = getList2FromData(compositeBlocksTypes, compositeBlocks.type);

  const condition1 =
    (area.type === "Illustrative object" || area.type === "Question") &&
    list.includes("Object");
  const condition2 = area.type === "Question" && list.includes("Question");

  if (condition1 || condition2) {
    setCompositeBlocks((prevState) => ({
      ...prevState,
      areas: [
        ...prevState.areas,
        {
          x: area.x,
          y: area.y,
          height: area.height,
          width: area.width,
          type: list.includes("Object") ? "Object" : "Question",
          text: area.blockId,
          unit: "%",
        },
      ],
    }));
  }

  console.log("area= ", areasProperties[activePage][idx]);
  console.log("list= ", list);
}, [areasProperties, activePage, compositeBlocksTypes, compositeBlocks.type, setCompositeBlocks]);
```

#### Step 4: Memoize renderBlocks result
```javascript
const blocksToRender = useMemo(() => {
  return areas[activePage]
    ?.map((area, idx) => ({ area, idx })) // Preserve index
    .filter(({ idx }) => {
      // Filter out SimpleItem blocks
      const areaProps = areasProperties[activePage]?.[idx];
      return areaProps?.type !== "Simple item";
    })
    .map(({ area, idx }) => (
      <div
        key={idx}
        style={{
          position: "absolute",
          top: `${area.y}px`,
          left: `${area.x}px`,
          width: `${area.width}px`,
          height: `${area.height}px`,
          backgroundColor: "rgba(0, 0, 0, 0.2)",
          cursor: "pointer",
        }}
        onClick={() => onPickAreaForCompositeBlocks(idx)}
      />
    )) || [];
}, [areas, activePage, areasProperties, onPickAreaForCompositeBlocks]);
```

#### Step 5: Fix AreaSelector props
```javascript
<AreaSelector
  areas={renderedAreas}         // ✅ Use memoized value
  onChange={onChangeHandler}    // ✅ Use memoized callback from parent
  wrapperStyle={wrapperStyle}   // ✅ Use memoized object
  customAreaRenderer={customRender}  // ✅ Now memoized with useCallback
  areaProps={areaPropsConfig}   // ✅ Use memoized object
  unit="percentage"
>
```

#### Step 6: Use memoized blocks in JSX
```javascript
{highlight === "hand" ? (
  <div style={{ position: "relative" }}>
    {blocksToRender}  {/* ✅ Use memoized result */}
    <img ... />
  </div>
) : ...}
```

---

## Expected Outcome

After these fixes:
- ✅ No new references created on every render
- ✅ AreaSelector receives stable props
- ✅ Internal functions have stable references
- ✅ No infinite loop
- ✅ console.log fires only when activeRightTab actually changes

---

## Implementation Checklist

- [ ] Add `useCallback` to imports
- [ ] Memoize `wrapperStyle`
- [ ] Memoize `areaPropsConfig`
- [ ] Wrap `onClickExistedArea` in useCallback
- [ ] Wrap `customRender` in useCallback
- [ ] Wrap `onImageLoad` in useCallback
- [ ] Wrap `onPickAreaForCompositeBlocks` in useCallback
- [ ] Memoize `blocksToRender` with useMemo
- [ ] Fix AreaSelector `areas` prop (use renderedAreas)
- [ ] Fix AreaSelector `onChange` prop (use onChangeHandler)
- [ ] Fix AreaSelector `wrapperStyle` prop (use memoized)
- [ ] Fix AreaSelector `areaProps` prop (use memoized)
- [ ] Use `blocksToRender` in JSX instead of calling renderBlocks()

---

**Status:** 📋 Plan created, ready for implementation
**Priority:** 🔴 Critical
