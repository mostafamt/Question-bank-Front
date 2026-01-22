# StudioAreaSelector Component - Debugging Guide

**Date:** November 6, 2025
**Component:** `src/components/Studio/StudioAreaSelector/StudioAreaSelector.jsx`
**Purpose:** Step-by-step guide to debug the StudioAreaSelector component

---

## Table of Contents

1. [Component Overview](#component-overview)
2. [Quick Debug Setup](#quick-debug-setup)
3. [Common Issues & Solutions](#common-issues--solutions)
4. [Debugging Props](#debugging-props)
5. [Debugging Area Selection](#debugging-area-selection)
6. [Debugging Image Loading](#debugging-image-loading)
7. [Debugging Conditional Rendering](#debugging-conditional-rendering)
8. [Debugging Composite Blocks](#debugging-composite-blocks)
9. [Debugging Virtual Blocks](#debugging-virtual-blocks)
10. [Performance Debugging](#performance-debugging)
11. [Full Debug Version](#full-debug-version)

---

## Component Overview

### What StudioAreaSelector Does

The `StudioAreaSelector` component is responsible for:
- **Displaying** the book page image
- **Allowing** users to select rectangular areas on the image
- **Managing** three different modes:
  1. **Block Authoring Mode** - Select areas for content blocks
  2. **Composite Blocks Mode** - Select existing areas to add to composite block
  3. **Hand Mode** - Manually pick areas with click

### Key Dependencies

- **@bmunozg/react-image-area** - The underlying area selection library
- **VirtualBlocks** - Wrapper component for virtual blocks overlay
- **Emotion CSS** - For dynamic box coloring

### Props Flow

```
Studio (parent)
  └─> StudioEditor
      └─> StudioAreaSelector (this component)
          ├─> Receives: areas, areasProperties, imageScaleFactor, etc.
          ├─> Uses: AreaSelector library
          └─> Calls: onChangeHandler when areas change
```

---

## Quick Debug Setup

### Step 1: Add Debug Flag

Add this at the top of `StudioAreaSelector.jsx`:

```javascript
const DEBUG = process.env.NODE_ENV === 'development';

const debug = {
  log: (...args) => DEBUG && console.log('[StudioAreaSelector]', ...args),
  warn: (...args) => DEBUG && console.warn('[StudioAreaSelector]', ...args),
  error: (...args) => DEBUG && console.error('[StudioAreaSelector]', ...args),
  group: (label) => DEBUG && console.group(`[StudioAreaSelector] ${label}`),
  groupEnd: () => DEBUG && console.groupEnd(),
  table: (data) => DEBUG && console.table(data),
};
```

### Step 2: Add Render Counter

```javascript
const StudioAreaSelector = React.forwardRef((props, ref) => {
  const renderCount = React.useRef(0);
  renderCount.current++;

  debug.log(`🔄 Render #${renderCount.current}`);

  // ... rest of component
});
```

### Step 3: Open Browser DevTools

```
Chrome: F12 or Ctrl+Shift+J
Firefox: F12 or Ctrl+Shift+K
```

---

## Common Issues & Solutions

### Issue 1: "Areas not displaying on image"

**Symptoms:**
- Image loads but no rectangles appear
- Can't select areas
- No visual feedback

**Debug Steps:**

1. **Check if areas exist:**
```javascript
React.useEffect(() => {
  debug.log('Areas prop:', {
    activePage,
    areasForActivePage: areas[activePage],
    areasLength: areas[activePage]?.length || 0
  });
}, [areas, activePage]);
```

2. **Check rendered areas:**
```javascript
const renderedAreas =
  activeRightTab.label === "Composite Blocks"
    ? compositeBlocks.areas
    : areas[activePage];

debug.log('Rendered areas:', renderedAreas);
```

3. **Check AreaSelector props:**
```javascript
<AreaSelector
  areas={renderedAreas}
  onChange={(newAreas) => {
    debug.log('AreaSelector onChange called:', newAreas);
    onChangeHandler(newAreas);
  }}
  // ...
>
```

**Common Causes:**
- `areas[activePage]` is undefined or empty
- Wrong tab selected (not Block Authoring or Composite Blocks)
- `highlight` mode is set to "hand"
- Image not loaded yet

---

### Issue 2: "Can't select new areas"

**Symptoms:**
- Click and drag on image does nothing
- No new rectangle appears
- Existing areas are clickable but can't create new ones

**Debug Steps:**

1. **Check if AreaSelector is rendered:**
```javascript
const isAreaSelectorMode =
  activeRightTab.label === RIGHT_TAB_NAMES.BLOCK_AUTHORING ||
  activeRightTab.label === RIGHT_TAB_NAMES.COMPOSITE_BLOCKS;

debug.log('Is AreaSelector mode?', {
  isAreaSelectorMode,
  activeRightTab: activeRightTab.label,
  highlight
});
```

2. **Check if highlight mode blocks selection:**
```javascript
React.useEffect(() => {
  debug.warn('Highlight mode:', highlight);
  if (highlight === 'hand') {
    debug.warn('⚠️ AreaSelector disabled - hand mode active');
  }
}, [highlight]);
```

3. **Test onChange callback:**
```javascript
<AreaSelector
  areas={renderedAreas}
  onChange={(newAreas) => {
    debug.group('AreaSelector onChange');
    debug.log('Previous areas count:', renderedAreas.length);
    debug.log('New areas count:', newAreas.length);
    debug.log('New area data:', newAreas[newAreas.length - 1]);
    debug.groupEnd();

    onChangeHandler(newAreas);
  }}
  // ...
>
```

**Common Causes:**
- Wrong tab selected
- `highlight` mode is "hand"
- `onChangeHandler` not provided or broken
- Image not fully loaded
- Z-index issue (element covering image)

---

### Issue 3: "Selected areas in wrong position"

**Symptoms:**
- Select area on image
- Rectangle appears in wrong location
- Area coordinates don't match visual position

**Debug Steps:**

1. **Check coordinate unit:**
```javascript
<AreaSelector
  unit="percentage" // Should be "percentage" not "px"
  areas={renderedAreas}
  onChange={(newAreas) => {
    debug.log('New area coordinates:', {
      x: newAreas[newAreas.length - 1]?.x,
      y: newAreas[newAreas.length - 1]?.y,
      width: newAreas[newAreas.length - 1]?.width,
      height: newAreas[newAreas.length - 1]?.height,
      unit: newAreas[newAreas.length - 1]?.unit
    });
    onChangeHandler(newAreas);
  }}
  // ...
>
```

2. **Check image dimensions:**
```javascript
const onImageLoad = () => {
  debug.group('Image Loaded');
  debug.log('Natural dimensions:', {
    width: ref.current?.naturalWidth,
    height: ref.current?.naturalHeight
  });
  debug.log('Display dimensions:', {
    width: ref.current?.clientWidth,
    height: ref.current?.clientHeight
  });
  debug.log('Scale factor:', imageScaleFactor);
  debug.log('Calculated size:', {
    width: `${imageScaleFactor * 100}%`,
    height: `${imageScaleFactor * 100}%`
  });
  debug.groupEnd();

  props.onImageLoad();
};
```

3. **Check for coordinate conversion issues:**
```javascript
// In parent component (Studio.jsx)
// Check if coordinates are being converted correctly
React.useEffect(() => {
  debug.log('Areas after conversion:', areas[activePage]);
}, [areas, activePage]);
```

**Common Causes:**
- Wrong unit (px vs percentage)
- Image scale factor not applied correctly
- Coordinate conversion happening at wrong time
- Image dimensions not updated after zoom

---

### Issue 4: "Component re-rendering too much"

**Symptoms:**
- Console flooded with logs
- UI feels laggy
- Performance issues

**Debug Steps:**

1. **Track re-renders:**
```javascript
const StudioAreaSelector = React.forwardRef((props, ref) => {
  const renderCount = React.useRef(0);
  renderCount.current++;

  debug.log(`Render #${renderCount.current}`);

  // Track which props changed
  const prevPropsRef = React.useRef();
  React.useEffect(() => {
    if (prevPropsRef.current) {
      const changedProps = Object.keys(props).filter(
        key => prevPropsRef.current[key] !== props[key]
      );
      if (changedProps.length > 0) {
        debug.warn('Props that changed:', changedProps);
      }
    }
    prevPropsRef.current = props;
  });

  // ... rest of component
});
```

2. **Check for inline functions in parent:**
```javascript
// ❌ Bad - creates new function every render
<StudioAreaSelector
  onChangeHandler={(areas) => handleChange(areas)}
/>

// ✅ Good - stable reference
const handleChange = React.useCallback((areas) => {
  // handle change
}, [/* dependencies */]);

<StudioAreaSelector
  onChangeHandler={handleChange}
/>
```

**Common Causes:**
- Parent component re-rendering
- Props with new references (objects, arrays, functions)
- Context value changing
- Missing memoization in parent

---

## Debugging Props

### Props Checklist

Add this to see all props on every render:

```javascript
const StudioAreaSelector = React.forwardRef((props, ref) => {
  debug.group('Props Received');
  debug.log('areasProperties:', props.areasProperties);
  debug.log('areas:', props.areas);
  debug.log('activePage:', props.activePage);
  debug.log('imageScaleFactor:', props.imageScaleFactor);
  debug.log('activeRightTab:', props.activeRightTab);
  debug.log('highlight:', props.highlight);
  debug.log('showVB:', props.showVB);
  debug.log('compositeBlocks:', props.compositeBlocks);
  debug.log('pages:', props.pages);
  debug.groupEnd();

  // ... rest of component
});
```

### Watch Specific Props

```javascript
// Watch areas changes
React.useEffect(() => {
  debug.log('areas changed:', areas[activePage]);
}, [areas, activePage]);

// Watch areasProperties changes
React.useEffect(() => {
  debug.log('areasProperties changed:', areasProperties[activePage]);
}, [areasProperties, activePage]);

// Watch tab changes
React.useEffect(() => {
  debug.log('Tab changed to:', activeRightTab.label);
}, [activeRightTab]);

// Watch highlight mode changes
React.useEffect(() => {
  debug.log('Highlight mode:', highlight);
}, [highlight]);
```

---

## Debugging Area Selection

### Track Area Selection Flow

```javascript
const onChangeHandler = (newAreas) => {
  debug.group('📍 Area Selection Changed');

  debug.log('Previous areas:', {
    count: areas[activePage]?.length || 0,
    areas: areas[activePage]
  });

  debug.log('New areas:', {
    count: newAreas.length,
    areas: newAreas
  });

  const diff = newAreas.length - (areas[activePage]?.length || 0);
  if (diff > 0) {
    debug.log('✅ Area(s) added:', diff);
    debug.log('New area data:', newAreas.slice(-diff));
  } else if (diff < 0) {
    debug.log('🗑️ Area(s) removed:', Math.abs(diff));
  } else {
    debug.log('✏️ Area(s) modified');
  }

  debug.groupEnd();

  // Call parent handler
  props.onChangeHandler?.(newAreas);
};
```

### Debug Custom Area Renderer

```javascript
const customRender = (areaProps) => {
  debug.log('Custom render called:', {
    areaNumber: areaProps.areaNumber,
    isChanging: areaProps.isChanging,
    hasProperties: !!areasProperties[activePage][areaProps.areaNumber - 1]
  });

  if (!areaProps.isChanging) {
    const areaProperty = areasProperties[activePage][areaProps.areaNumber - 1];

    if (!areaProperty) {
      debug.error('Missing area property for area', areaProps.areaNumber);
      return null;
    }

    return (
      <div
        key={areaProps.areaNumber}
        onClick={() => {
          debug.log('Existing area clicked:', areaProps.areaNumber);
          onClickExistedArea(areaProps);
        }}
      >
        <div className={styles.type}>
          {areaProperty.type} - {areaProperty.label}
        </div>
      </div>
    );
  }
};
```

---

## Debugging Image Loading

### Track Image Load Events

```javascript
const onImageLoad = () => {
  debug.group('🖼️ Image Loaded');

  if (!ref?.current) {
    debug.error('Image ref is not available!');
    debug.groupEnd();
    return;
  }

  const img = ref.current;

  debug.log('Image dimensions:', {
    natural: {
      width: img.naturalWidth,
      height: img.naturalHeight
    },
    client: {
      width: img.clientWidth,
      height: img.clientHeight
    },
    offset: {
      width: img.offsetWidth,
      height: img.offsetHeight
    }
  });

  debug.log('Scale factor:', imageScaleFactor);

  debug.log('Calculated display size:', {
    width: `${imageScaleFactor * 100}%`,
    height: `${imageScaleFactor * 100}%`,
    widthPx: img.clientWidth,
    heightPx: img.clientHeight
  });

  debug.log('Image URL:', pages[activePage]?.url);

  debug.groupEnd();

  // Call parent handler
  props.onImageLoad?.();
};
```

### Debug Image Errors

```javascript
<img
  src={pages[activePage]?.url}
  alt={pages[activePage]?.url || pages[activePage]}
  crossOrigin="anonymous"
  ref={ref}
  style={{
    width: `${imageScaleFactor * 100}%`,
    height: `${imageScaleFactor * 100}%`,
    overflow: "scroll",
  }}
  onLoad={onImageLoad}
  onError={(e) => {
    debug.error('Image failed to load:', {
      src: pages[activePage]?.url,
      error: e,
      imageExists: !!pages[activePage]?.url
    });
  }}
/>
```

---

## Debugging Conditional Rendering

### Debug Rendering Branches

The component has 3 different rendering modes. Add debug logs to track which branch is rendered:

```javascript
const StudioAreaSelector = React.forwardRef((props, ref) => {
  // ... props destructuring

  // Debug rendering mode
  const renderingMode = React.useMemo(() => {
    if (highlight === "hand") return "HAND_MODE";

    if (
      activeRightTab.label === RIGHT_TAB_NAMES.BLOCK_AUTHORING ||
      activeRightTab.label === RIGHT_TAB_NAMES.COMPOSITE_BLOCKS
    ) {
      return "AREA_SELECTOR_MODE";
    }

    return "VIEW_ONLY_MODE";
  }, [highlight, activeRightTab]);

  debug.log('🎨 Rendering mode:', renderingMode);

  // ... rest of component

  return (
    <VirtualBlocks {...virtualBlockProps}>
      <div className={styles.block} css={constructBoxColors(areasProperties[activePage])}>
        {renderingMode === "HAND_MODE" && (
          <>
            {debug.log('Rendering: Hand mode with clickable blocks')}
            {/* Hand mode JSX */}
          </>
        )}

        {renderingMode === "AREA_SELECTOR_MODE" && (
          <>
            {debug.log('Rendering: AreaSelector mode')}
            {/* AreaSelector JSX */}
          </>
        )}

        {renderingMode === "VIEW_ONLY_MODE" && (
          <>
            {debug.log('Rendering: View-only mode')}
            {/* View-only JSX */}
          </>
        )}
      </div>
    </VirtualBlocks>
  );
});
```

---

## Debugging Composite Blocks

### Debug Composite Block Area Selection

```javascript
const onPickAreaForCompositeBlocks = (idx) => {
  debug.group('🎯 Picking Area for Composite Block');

  const area = areasProperties[activePage][idx];
  debug.log('Selected area:', {
    index: idx,
    type: area.type,
    label: area.label,
    blockId: area.blockId
  });

  const list = getList2FromData(compositeBlocksTypes, compositeBlocks.type);
  debug.log('Allowed types for composite block:', list);

  const condition1 =
    (area.type === "Illustrative object" || area.type === "Question") &&
    list.includes("Object");

  const condition2 = area.type === "Question" && list.includes("Question");

  debug.log('Conditions:', {
    condition1,
    condition2,
    canAdd: condition1 || condition2
  });

  if (condition1 || condition2) {
    debug.log('✅ Adding area to composite block');

    const newArea = {
      x: area.x,
      y: area.y,
      height: area.height,
      width: area.width,
      type: list.includes("Object") ? "Object" : "Question",
      text: area.blockId,
      unit: "%",
    };

    debug.log('New composite area:', newArea);

    setCompositeBlocks((prevState) => ({
      ...prevState,
      areas: [...prevState.areas, newArea],
    }));
  } else {
    debug.warn('❌ Area type not compatible with composite block');
  }

  debug.groupEnd();
};
```

### Debug Rendered Blocks (Hand Mode)

```javascript
const renderBlocks = () => {
  debug.log('Rendering blocks for hand mode:', {
    totalAreas: areas[activePage].length,
    visibleAreas: areas[activePage].filter(
      (_, idx) => areasProperties[activePage][idx].type !== "Simple item"
    ).length
  });

  return areas[activePage]
    .map((area, idx) => ({ area, idx }))
    .filter(({ idx }) => {
      const areaProps = areasProperties[activePage][idx];
      const isFiltered = areaProps.type !== "Simple item";

      if (!isFiltered) {
        debug.log(`Filtering out "Simple item" at index ${idx}`);
      }

      return isFiltered;
    })
    .map(({ area, idx }) => {
      debug.log(`Rendering clickable block at index ${idx}`, area);

      return (
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
          onClick={() => {
            debug.log('Block clicked:', idx);
            onPickAreaForCompositeBlocks(idx);
          }}
        />
      );
    });
};
```

---

## Debugging Virtual Blocks

### Debug Virtual Blocks State

```javascript
React.useEffect(() => {
  debug.group('Virtual Blocks State');
  debug.log('showVB:', showVB);
  debug.log('virtualBlocks:', virtualBlocks);
  debug.log('activePage:', activePage);
  debug.groupEnd();
}, [showVB, virtualBlocks, activePage]);
```

---

## Performance Debugging

### Measure Render Time

```javascript
const StudioAreaSelector = React.forwardRef((props, ref) => {
  const renderStart = performance.now();

  // ... component logic

  React.useEffect(() => {
    const renderEnd = performance.now();
    const renderTime = renderEnd - renderStart;

    debug.log(`⏱️ Render time: ${renderTime.toFixed(2)}ms`);

    if (renderTime > 16) {
      debug.warn(`⚠️ Slow render detected: ${renderTime.toFixed(2)}ms (target: <16ms)`);
    }
  });

  // ... return JSX
});
```

### Track Re-renders with Why-Did-You-Render

```javascript
// Add at bottom of file
if (process.env.NODE_ENV === 'development') {
  StudioAreaSelector.whyDidYouRender = true;
}
```

---

## Full Debug Version

Here's a complete debug-instrumented version of key functions:

```javascript
// Add to top of file
const DEBUG = process.env.NODE_ENV === 'development';

const debug = {
  log: (...args) => DEBUG && console.log('[StudioAreaSelector]', ...args),
  warn: (...args) => DEBUG && console.warn('[StudioAreaSelector]', ...args),
  error: (...args) => DEBUG && console.error('[StudioAreaSelector]', ...args),
  group: (label) => DEBUG && console.group(`[StudioAreaSelector] ${label}`),
  groupEnd: () => DEBUG && console.groupEnd(),
  table: (data) => DEBUG && console.table(data),
};

const StudioAreaSelector = React.forwardRef((props, ref) => {
  const {
    areasProperties,
    setAreasProperties,
    activePage,
    imageScaleFactor,
    areas,
    onChangeHandler,
    pages,
    showVB,
    virtualBlocks,
    setVirtualBlocks,
    activeRightTab,
    compositeBlocksTypes,
    compositeBlocks,
    setCompositeBlocks,
    highlight,
  } = props;

  // Render tracking
  const renderCount = React.useRef(0);
  renderCount.current++;
  debug.log(`🔄 Render #${renderCount.current}`);

  // Props logging
  React.useEffect(() => {
    debug.group('Props Update');
    debug.log('activePage:', activePage);
    debug.log('areas for page:', areas[activePage]?.length || 0);
    debug.log('areasProperties for page:', areasProperties[activePage]?.length || 0);
    debug.log('imageScaleFactor:', imageScaleFactor);
    debug.log('activeRightTab:', activeRightTab.label);
    debug.log('highlight:', highlight);
    debug.groupEnd();
  }, [activePage, areas, areasProperties, imageScaleFactor, activeRightTab, highlight]);

  // Determine rendering mode
  const renderingMode = React.useMemo(() => {
    if (highlight === "hand") return "HAND_MODE";
    if (
      activeRightTab.label === RIGHT_TAB_NAMES.BLOCK_AUTHORING ||
      activeRightTab.label === RIGHT_TAB_NAMES.COMPOSITE_BLOCKS
    ) {
      return "AREA_SELECTOR_MODE";
    }
    return "VIEW_ONLY_MODE";
  }, [highlight, activeRightTab]);

  debug.log('🎨 Rendering mode:', renderingMode);

  // ... rest of component with debug logs in all functions

  return (
    <VirtualBlocks>
      {/* JSX with conditional rendering */}
    </VirtualBlocks>
  );
});

// Enable Why-Did-You-Render in development
if (process.env.NODE_ENV === 'development') {
  StudioAreaSelector.whyDidYouRender = true;
}

export default StudioAreaSelector;
```

---

## Debug Checklist

Use this checklist when debugging StudioAreaSelector:

### Initial Setup
- [ ] Added debug utility at top of file
- [ ] Added render counter
- [ ] Opened browser DevTools (F12)
- [ ] Console is visible and clear

### Props Verification
- [ ] All props are being received
- [ ] `areas[activePage]` exists and has data
- [ ] `areasProperties[activePage]` exists and matches areas
- [ ] `pages[activePage].url` is valid image URL
- [ ] `activeRightTab` is correct tab object
- [ ] `onChangeHandler` is a function

### Area Selection Issues
- [ ] Correct rendering mode is active
- [ ] AreaSelector component is rendered (not hand mode)
- [ ] onChange callback is firing
- [ ] Areas are in percentage units
- [ ] Image has loaded successfully

### Visual Issues
- [ ] Image is displaying
- [ ] Areas are visible on image
- [ ] Area colors are correct
- [ ] Coordinates match visual position
- [ ] Scale factor is applied correctly

### Performance
- [ ] Render count is reasonable (<10 per action)
- [ ] No infinite re-render loop
- [ ] Render time <16ms for 60fps
- [ ] No memory leaks (check DevTools Memory tab)

---

## Quick Fixes

### Issue: Areas not showing
**Quick Fix:**
```javascript
// Check this in console:
console.log('Areas:', areas[activePage]);
console.log('Active tab:', activeRightTab.label);
console.log('Highlight:', highlight);
```

### Issue: Can't select areas
**Quick Fix:**
```javascript
// Ensure you're in the right mode:
if (highlight === 'hand') {
  console.warn('Switch off hand mode to select areas');
}
```

### Issue: Wrong coordinates
**Quick Fix:**
```javascript
// Check unit in AreaSelector:
<AreaSelector
  unit="percentage" // Make sure this is "percentage"
  areas={renderedAreas}
  // ...
/>
```

---

## Resources

- **General React Debugging:** `docs/debugging/COMPREHENSIVE_DEBUGGING_GUIDE.md`
- **Component Source:** `src/components/Studio/StudioAreaSelector/StudioAreaSelector.jsx`
- **AreaSelector Library:** [@bmunozg/react-image-area](https://www.npmjs.com/package/@bmunozg/react-image-area)
- **React DevTools:** [Download](https://react.dev/learn/react-developer-tools)

---

**Last Updated:** November 6, 2025
