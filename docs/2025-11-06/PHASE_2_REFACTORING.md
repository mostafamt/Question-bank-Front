# Studio Refactoring - Phase 2: State Management & Custom Hooks

## Overview

**Phase Duration:** Week 2
**Goal:** Extract state management logic into custom hooks and establish Context API foundation
**Risk Level:** Medium (Requires careful state migration)
**Team Size:** 1-2 developers

This phase transforms the Studio component from managing 17+ useState hooks directly to using custom hooks and Context API for better separation of concerns and maintainability.

**Important:** Phase 1 must be completed (types and constants extracted) before starting Phase 2.

---

## Prerequisites

Before starting Phase 2, ensure:
- [x] Phase 1 is complete and merged
- [x] All constants are imported from `./constants`
- [x] Type definitions exist in `./types/studio.types.js`
- [x] Empty folders created: `hooks/`, `context/`, `utils/`
- [x] All Phase 1 tests pass
- [x] No existing bugs in Studio component

---

## Objectives

- [ ] Create 5 custom hooks to manage different aspects of state
- [ ] Reduce useState count in Studio.jsx from 17+ to ~5
- [ ] Create StudioContext for shared state
- [ ] Extract utility functions to support hooks
- [ ] Maintain 100% feature parity (zero breaking changes)
- [ ] Add unit tests for all custom hooks

---

## Current State Analysis

### Current State Management (17+ useState hooks)

```javascript
// Page Management (2 hooks)
const [activePageIndex, setActivePageIndex] = useState(...)
const [showStickyToolbar, setShowStickyToolbar] = useState(false)

// Area Management (4 hooks)
const [areas, setAreas] = useState(...)
const [areasProperties, setAreasProperties] = useState(...)
const [colorIndex, setColorIndex] = useState(...)
const [imageScaleFactor, setImageScaleFactor] = useState(1)

// Composite Blocks (2 hooks)
const [compositeBlocks, setCompositeBlocks] = useState(...)
const [loadingSubmitCompositeBlocks, setLoadingSubmitCompositeBlocks] = useState(false)

// Virtual Blocks (2 hooks)
const [virtualBlocks, setVirtualBlocks] = useState(...)
const [showVB, setShowVB] = useState(false)

// Sub-object/Auto-generate (2 hooks)
const [activeType, setActiveType] = useState("")
const [typeOfActiveType, setTypeOfActiveType] = useState("")

// OCR/Language (2 hooks)
const [language, setLanguage] = useState(...)
const [loadingSubmit, setLoadingSubmit] = useState(false)

// Highlighting (1 hook)
const [highlight, setHighlight] = useState("")

// Tab Management (2 hooks)
const [activeLeftTab, setActiveLeftTab] = useState(LEFT_COLUMNS[0])
const [activeRightTab, setActiveRightTab] = useState(RIGHT_COLUMNS[0])
```

### Target State Management (After Phase 2)

```javascript
// Custom hooks handle everything
const pageManagement = usePageManagement(pages, subObject)
const areaManagement = useAreaManagement(pages, activePageIndex)
const coordinateConversion = useCoordinateConversion(areaManagement, imageRef)
const compositeBlocks = useCompositeBlocks()
const virtualBlocks = useVirtualBlocks(pages, subObject, activePageIndex)
```

---

## Phase 2 Task Breakdown

### Task 1: Create Utility Functions

Before creating hooks, extract pure utility functions that will be used by the hooks.

#### File: `src/components/Studio/utils/areaUtils.js`

<details>
<summary><b>Implementation Code</b></summary>

```javascript
/**
 * @file areaUtils.js
 * @description Pure utility functions for area manipulation
 */

import { colors } from "../../../constants/highlight-color";
import { v4 as uuidv4 } from "uuid";

/**
 * Initialize areas array from pages data
 * @param {Page[]} pages - Array of page objects
 * @returns {Area[][]} - 2D array of areas for each page
 */
export const initializeAreas = (pages) => {
  return (
    pages?.map((page) =>
      page.blocks?.map((block) => {
        return {
          x: block.coordinates.x,
          y: block.coordinates.y,
          width: block.coordinates.width,
          height: block.coordinates.height,
          unit: "px",
          isChanging: true,
          isNew: true,
          _unit: block.coordinates.unit,
          _updated: false,
        };
      })
    ) || Array(pages?.length || 1).fill([])
  );
};

/**
 * Initialize areasProperties array from pages data
 * @param {Page[]} pages - Array of page objects
 * @param {Array} types - Available content types
 * @returns {AreaProperty[][]} - 2D array of area properties
 */
export const initializeAreasProperties = (pages, types, getTypeNameOfLabelKey, getTypeOfLabel) => {
  return (
    pages?.map(
      (page) =>
        page.blocks?.map((block, idx) => {
          let typeName = getTypeNameOfLabelKey(types, block.contentType);
          return {
            x: block.coordinates.x,
            y: block.coordinates.y,
            width: block.coordinates.width,
            height: block.coordinates.height,
            id: uuidv4(),
            color: colors[idx % colors.length],
            loading: false,
            text: block.contentValue,
            image: block.contentValue,
            type: typeName,
            parameter: "",
            label: block.contentType,
            typeOfLabel: getTypeOfLabel(types, typeName, block.contentType),
            order: idx,
            open: false,
            isServer: "true",
            blockId: block.blockId,
          };
        }) || []
    ) || Array(pages?.length || 1).fill([])
  );
};

/**
 * Initialize color index array for pages
 * @param {number} pageCount - Number of pages
 * @returns {number[]} - Array of color indices
 */
export const initializeColorIndex = (pageCount) => {
  return Array(pageCount || 1).fill(0);
};

/**
 * Delete area by index immutably
 * @param {Array} collection - Areas or areasProperties array
 * @param {number} pageIndex - Page index
 * @param {number} areaIndex - Area index
 * @returns {Array} - New collection with area removed
 */
export const deleteAreaByIndex = (collection, pageIndex, areaIndex) => {
  const newCollection = [...collection];
  newCollection[pageIndex] = [
    ...newCollection[pageIndex].slice(0, areaIndex),
    ...newCollection[pageIndex].slice(areaIndex + 1),
  ];
  return newCollection;
};

/**
 * Add metadata to area objects
 * @param {Area[]} areasParam - Array of areas
 * @param {Area[]} existingAreas - Existing areas with metadata
 * @returns {Area[]} - Areas with metadata preserved/added
 */
export const addMetadataToAreas = (areasParam, existingAreas) => {
  return areasParam.map((area, idx) => {
    const existingArea = existingAreas?.[idx];

    if (existingArea) {
      // Preserve metadata from existing area
      return {
        ...area,
        _unit: existingArea._unit || "percentage",
        _updated: existingArea._updated || false,
        _percentX: existingArea._percentX ?? area.x,
        _percentY: existingArea._percentY ?? area.y,
        _percentWidth: existingArea._percentWidth ?? area.width,
        _percentHeight: existingArea._percentHeight ?? area.height,
      };
    } else {
      // New area - set metadata
      return {
        ...area,
        _unit: "percentage",
        _updated: false,
        _percentX: area.x,
        _percentY: area.y,
        _percentWidth: area.width,
        _percentHeight: area.height,
      };
    }
  });
};

/**
 * Get next color from color palette
 * @param {number} colorIndex - Current color index
 * @returns {string} - Color code
 */
export const getNextColor = (colorIndex) => {
  return colors[colorIndex % colors.length];
};

/**
 * Increment color index for a page
 * @param {number[]} colorIndexArray - Array of color indices
 * @param {number} pageIndex - Page index to increment
 * @returns {number[]} - Updated color index array
 */
export const incrementColorIndex = (colorIndexArray, pageIndex) => {
  const newArray = [...colorIndexArray];
  newArray[pageIndex]++;
  return newArray;
};
```

</details>

#### File: `src/components/Studio/utils/coordinateUtils.js`

<details>
<summary><b>Implementation Code</b></summary>

```javascript
/**
 * @file coordinateUtils.js
 * @description Pure functions for coordinate conversions
 */

/**
 * Convert percentage coordinates to pixels
 * @param {Area} area - Area with percentage coordinates
 * @param {ImageDimensions} dimensions - Container dimensions
 * @returns {Area} - Area with pixel coordinates
 */
export const percentageToPx = (area, dimensions) => {
  const { clientWidth, clientHeight } = dimensions;

  if (!clientWidth || !clientHeight) {
    return area;
  }

  // Use stored percentage or current values
  const percentX = area._percentX ?? area.x;
  const percentY = area._percentY ?? area.y;
  const percentWidth = area._percentWidth ?? area.width;
  const percentHeight = area._percentHeight ?? area.height;

  return {
    x: (percentX / 100) * clientWidth,
    y: (percentY / 100) * clientHeight,
    width: (percentWidth / 100) * clientWidth,
    height: (percentHeight / 100) * clientHeight,
    unit: "px",
    isChanging: true,
    isNew: true,
    _updated: true,
    _unit: area._unit,
    _percentX: percentX,
    _percentY: percentY,
    _percentWidth: percentWidth,
    _percentHeight: percentHeight,
  };
};

/**
 * Preserve area metadata during updates
 * @param {Area} area - New area data
 * @param {Area} existingArea - Existing area with metadata
 * @returns {Area} - Area with preserved metadata
 */
export const preserveAreaMetadata = (area, existingArea) => {
  return {
    ...area,
    _unit: existingArea._unit || "px",
    _updated: existingArea._updated || false,
    _percentX: existingArea._percentX,
    _percentY: existingArea._percentY,
    _percentWidth: existingArea._percentWidth,
    _percentHeight: existingArea._percentHeight,
  };
};

/**
 * Reset updated flag for areas on a page
 * @param {Area[]} areas - Array of areas
 * @returns {Area[]} - Areas with _updated reset
 */
export const resetUpdatedFlag = (areas) => {
  return areas.map((area) => ({
    ...area,
    _updated: false,
  }));
};

/**
 * Convert areas from percentage to pixels based on image dimensions
 * @param {Area[][]} allAreas - All pages' areas
 * @param {number} pageIndex - Current page index
 * @param {ImageDimensions} dimensions - Image dimensions
 * @param {AreaProperty[][]} areasProperties - For fallback coordinates
 * @returns {Area[][]} - Updated areas with conversions
 */
export const convertAreasForPage = (
  allAreas,
  pageIndex,
  dimensions,
  areasProperties
) => {
  const newAreas = [...allAreas];

  newAreas[pageIndex] = newAreas[pageIndex]?.map((block, idx) => {
    // Skip if already converted
    if (block._unit === "percentage" && block._updated) {
      return preserveAreaMetadata(block, block);
    }

    // Convert from percentage to pixels
    if (block._unit === "percentage" && !block._updated) {
      return percentageToPx(block, dimensions);
    }

    // Already in pixels, preserve as-is
    return preserveAreaMetadata(block, block);
  });

  return newAreas;
};
```

</details>

**Acceptance Criteria:**
- [ ] All utility functions are pure (no side effects)
- [ ] Each function has JSDoc comments
- [ ] Functions use type definitions from Phase 1
- [ ] No dependencies on React hooks or external state

**Testing:**
```bash
# Create test file: src/components/Studio/utils/__tests__/areaUtils.test.js
# Test each utility function in isolation
```

---

### Task 2: Create usePageManagement Hook

Extract page navigation and active page state management.

#### File: `src/components/Studio/hooks/usePageManagement.js`

<details>
<summary><b>Implementation Code</b></summary>

```javascript
/**
 * @file usePageManagement.js
 * @description Hook for managing page navigation and active page state
 */

import { useState, useEffect } from "react";
import { STORAGE_KEYS, DEFAULTS } from "../constants";

/**
 * Custom hook for page management
 * @param {Page[]} pages - Array of pages
 * @param {boolean} subObject - Whether editing a sub-object
 * @returns {Object} - Page management state and handlers
 */
export const usePageManagement = (pages, subObject) => {
  const [activePageIndex, setActivePageIndex] = useState(() => {
    if (subObject) {
      return DEFAULTS.ACTIVE_PAGE_INDEX;
    }
    const saved = localStorage.getItem(STORAGE_KEYS.AUTHOR_PAGE);
    return saved ? Number.parseInt(saved) : DEFAULTS.ACTIVE_PAGE_INDEX;
  });

  const [showStickyToolbar, setShowStickyToolbar] = useState(false);

  // Derived state
  const activePageId = pages?.[activePageIndex]?._id;

  /**
   * Navigate to a specific page by index
   * @param {number} index - Page index
   */
  const navigateToPage = (index) => {
    if (index < 0 || index >= pages.length) {
      console.warn(`Invalid page index: ${index}`);
      return;
    }

    setActivePageIndex(index);

    // Save to localStorage (unless sub-object)
    if (!subObject) {
      localStorage.setItem(STORAGE_KEYS.AUTHOR_PAGE, `${index}`);
    }
  };

  /**
   * Navigate to next page
   */
  const nextPage = () => {
    if (activePageIndex < pages.length - 1) {
      navigateToPage(activePageIndex + 1);
    }
  };

  /**
   * Navigate to previous page
   */
  const previousPage = () => {
    if (activePageIndex > 0) {
      navigateToPage(activePageIndex - 1);
    }
  };

  /**
   * Check if current page is first
   */
  const isFirstPage = activePageIndex === 0;

  /**
   * Check if current page is last
   */
  const isLastPage = activePageIndex === pages.length - 1;

  return {
    // State
    activePageIndex,
    activePageId,
    showStickyToolbar,

    // Setters
    setActivePageIndex,
    setShowStickyToolbar,

    // Actions
    navigateToPage,
    nextPage,
    previousPage,

    // Computed
    isFirstPage,
    isLastPage,
    totalPages: pages.length,
  };
};
```

</details>

**Acceptance Criteria:**
- [ ] Hook manages activePageIndex state
- [ ] localStorage integration works correctly
- [ ] Provides navigation functions (next, previous, navigateToPage)
- [ ] Includes boundary checks (first/last page)
- [ ] Returns showStickyToolbar state

**Testing:**
```javascript
// Test file: src/components/Studio/hooks/__tests__/usePageManagement.test.js
import { renderHook, act } from '@testing-library/react';
import { usePageManagement } from '../usePageManagement';

describe('usePageManagement', () => {
  it('should initialize with default page index', () => {
    const pages = [{ _id: '1' }, { _id: '2' }];
    const { result } = renderHook(() => usePageManagement(pages, false));
    expect(result.current.activePageIndex).toBe(0);
  });

  it('should navigate to next page', () => {
    const pages = [{ _id: '1' }, { _id: '2' }];
    const { result } = renderHook(() => usePageManagement(pages, false));

    act(() => {
      result.current.nextPage();
    });

    expect(result.current.activePageIndex).toBe(1);
  });

  // Add more tests...
});
```

---

### Task 3: Create useAreaManagement Hook

Extract area and areasProperties state management.

#### File: `src/components/Studio/hooks/useAreaManagement.js`

<details>
<summary><b>Implementation Code</b></summary>

```javascript
/**
 * @file useAreaManagement.js
 * @description Hook for managing areas and their properties
 */

import { useState, useCallback } from "react";
import {
  initializeAreas,
  initializeAreasProperties,
  initializeColorIndex,
  deleteAreaByIndex,
  addMetadataToAreas,
  getNextColor,
  incrementColorIndex,
} from "../utils/areaUtils";
import { getTypeNameOfLabelKey, getTypeOfLabel } from "../../../utils/ocr";

/**
 * Custom hook for area management
 * @param {Page[]} pages - Array of pages
 * @param {number} activePageIndex - Current active page index
 * @param {Array} types - Available content types
 * @returns {Object} - Area management state and handlers
 */
export const useAreaManagement = (pages, activePageIndex, types) => {
  const [areas, setAreas] = useState(() =>
    initializeAreas(pages)
  );

  const [areasProperties, setAreasProperties] = useState(() =>
    initializeAreasProperties(pages, types, getTypeNameOfLabelKey, getTypeOfLabel)
  );

  const [colorIndex, setColorIndex] = useState(() =>
    initializeColorIndex(pages?.length)
  );

  /**
   * Update a specific area's properties
   * @param {number} areaIndex - Index of area to update (-1 for last)
   * @param {Object} property - Properties to update
   */
  const updateAreaProperty = useCallback(
    (areaIndex, property) => {
      setAreasProperties((prevState) => {
        const newAreasProperties = [...prevState];
        const targetIndex =
          areaIndex === -1
            ? newAreasProperties[activePageIndex].length - 1
            : areaIndex;

        newAreasProperties[activePageIndex][targetIndex] = {
          ...newAreasProperties[activePageIndex][targetIndex],
          ...property,
        };

        return newAreasProperties;
      });
    },
    [activePageIndex]
  );

  /**
   * Update area property by ID
   * @param {string} id - Area ID
   * @param {Object} property - Properties to update
   */
  const updateAreaPropertyById = useCallback(
    (id, property) => {
      setAreasProperties((prevState) => {
        const newAreasProperties = [...prevState];
        newAreasProperties[activePageIndex] = newAreasProperties[
          activePageIndex
        ].map((area) => {
          if (area.id === id) {
            return { ...area, ...property };
          }
          return area;
        });
        return newAreasProperties;
      });
    },
    [activePageIndex]
  );

  /**
   * Delete an area
   * @param {number} areaIndex - Index of area to delete
   */
  const deleteArea = useCallback(
    (areaIndex) => {
      const newAreas = deleteAreaByIndex(areas, activePageIndex, areaIndex);
      setAreas(newAreas);

      const newAreasProperties = deleteAreaByIndex(
        areasProperties,
        activePageIndex,
        areaIndex
      );
      setAreasProperties(newAreasProperties);
    },
    [areas, areasProperties, activePageIndex]
  );

  /**
   * Add new areas to current page
   * @param {Area[]} newAreas - Array of new areas
   */
  const updateAreas = useCallback(
    (newAreas) => {
      const areasWithMetadata = addMetadataToAreas(
        newAreas,
        areas[activePageIndex]
      );

      const updatedAreas = [...areas];
      updatedAreas[activePageIndex] = areasWithMetadata;
      setAreas(updatedAreas);
    },
    [areas, activePageIndex]
  );

  /**
   * Get next color for area
   */
  const getAndIncrementColor = useCallback(() => {
    const color = getNextColor(colorIndex[activePageIndex]);
    setColorIndex((prev) => incrementColorIndex(prev, activePageIndex));
    return color;
  }, [colorIndex, activePageIndex]);

  /**
   * Synchronize areasProperties with areas (when areas change)
   */
  const syncAreasProperties = useCallback(() => {
    // Import from utils/ocr.js for now, will refactor in Phase 3
    const { updateAreasProperties } = require("../../../utils/ocr");
    const newAreasProperties = updateAreasProperties(
      areasProperties,
      activePageIndex,
      areas,
      false, // subObject - will be passed from context later
      "" // type - will be passed from context later
    );
    setAreasProperties(newAreasProperties);
  }, [areasProperties, activePageIndex, areas]);

  return {
    // State
    areas,
    areasProperties,
    colorIndex,

    // Setters (for direct state manipulation if needed)
    setAreas,
    setAreasProperties,
    setColorIndex,

    // Actions
    updateAreaProperty,
    updateAreaPropertyById,
    deleteArea,
    updateAreas,
    syncAreasProperties,
    getAndIncrementColor,

    // Computed
    currentPageAreas: areas[activePageIndex] || [],
    currentPageAreasProperties: areasProperties[activePageIndex] || [],
  };
};
```

</details>

**Acceptance Criteria:**
- [ ] Hook manages areas and areasProperties state
- [ ] Provides CRUD operations for areas
- [ ] Handles color assignment automatically
- [ ] Preserves area metadata during updates
- [ ] Supports finding areas by ID

**Testing:**
```javascript
// Test area creation, deletion, updates
// Test metadata preservation
// Test color cycling
```

---

### Task 4: Create useCoordinateConversion Hook

Extract coordinate conversion logic between percentage and pixels.

#### File: `src/components/Studio/hooks/useCoordinateConversion.js`

<details>
<summary><b>Implementation Code</b></summary>

```javascript
/**
 * @file useCoordinateConversion.js
 * @description Hook for coordinate conversion between percentage and pixels
 */

import { useCallback, useEffect } from "react";
import {
  convertAreasForPage,
  resetUpdatedFlag,
} from "../utils/coordinateUtils";
import { TIMEOUTS } from "../constants";

/**
 * Custom hook for coordinate conversion
 * @param {Object} areaManagement - Area management hook return value
 * @param {Object} imageRef - Ref to image element
 * @param {number} activePageIndex - Current active page index
 * @param {number} imageScaleFactor - Current zoom level
 * @returns {Object} - Coordinate conversion functions
 */
export const useCoordinateConversion = (
  areaManagement,
  imageRef,
  activePageIndex,
  imageScaleFactor
) => {
  const { areas, setAreas, areasProperties } = areaManagement;

  /**
   * Convert percentage coordinates to pixels for current page
   */
  const convertPercentageToPx = useCallback(() => {
    if (!imageRef.current) {
      return;
    }

    const dimensions = {
      clientWidth: imageRef.current.clientWidth,
      clientHeight: imageRef.current.clientHeight,
      naturalWidth: imageRef.current.naturalWidth,
      naturalHeight: imageRef.current.naturalHeight,
    };

    const convertedAreas = convertAreasForPage(
      areas,
      activePageIndex,
      dimensions,
      areasProperties
    );

    setAreas(convertedAreas);
  }, [areas, activePageIndex, areasProperties, imageRef, setAreas]);

  /**
   * Reset conversion flag for a specific page
   * @param {number} pageIndex - Page to reset
   */
  const resetConversionFlag = useCallback(
    (pageIndex) => {
      setAreas((prevState) => {
        const newAreas = [...prevState];
        if (newAreas[pageIndex]) {
          newAreas[pageIndex] = resetUpdatedFlag(newAreas[pageIndex]);
        }
        return newAreas;
      });
    },
    [setAreas]
  );

  /**
   * Trigger conversion after a delay (for page navigation or zoom)
   */
  const delayedConversion = useCallback(
    (delay = TIMEOUTS.PAGE_NAVIGATION_DELAY) => {
      setTimeout(() => {
        convertPercentageToPx();
      }, delay);
    },
    [convertPercentageToPx]
  );

  // Auto-convert when image scale factor changes
  useEffect(() => {
    if (imageScaleFactor && imageRef.current) {
      // Reset flag to force reconversion
      resetConversionFlag(activePageIndex);

      // Delay conversion to ensure DOM updates
      delayedConversion(TIMEOUTS.IMAGE_LOAD_DELAY);
    }
  }, [imageScaleFactor, activePageIndex, resetConversionFlag, delayedConversion]);

  // Auto-convert when page changes
  useEffect(() => {
    if (imageRef.current) {
      // Reset flag for new page
      resetConversionFlag(activePageIndex);

      // Delay conversion
      delayedConversion(TIMEOUTS.PAGE_NAVIGATION_DELAY);
    }
  }, [activePageIndex, resetConversionFlag, delayedConversion]);

  return {
    convertPercentageToPx,
    resetConversionFlag,
    delayedConversion,
  };
};
```

</details>

**Acceptance Criteria:**
- [ ] Hook handles percentage to pixel conversion
- [ ] Automatically converts on page change
- [ ] Automatically converts on zoom change
- [ ] Preserves metadata during conversion
- [ ] Uses timeouts from constants

**Testing:**
```javascript
// Test coordinate conversion accuracy
// Test automatic conversion triggers
// Test metadata preservation
```

---

### Task 5: Create useCompositeBlocks Hook

Extract composite block state and operations.

#### File: `src/components/Studio/hooks/useCompositeBlocks.js`

<details>
<summary><b>Implementation Code</b></summary>

```javascript
/**
 * @file useCompositeBlocks.js
 * @description Hook for managing composite blocks
 */

import { useState, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { COMPOSITE_BLOCK } from "../constants";
import { addPropsToAreasForCompositeBlocks } from "../../../utils/studio";
import { saveCompositeBlocks } from "../../../services/api";
import { ocr } from "../../../utils/ocr";
import { cropSelectedArea } from "../../../utils/ocr";

/**
 * Custom hook for composite block management
 * @param {Object} imageRef - Ref to image element
 * @param {Object} canvasRef - Ref to canvas element
 * @param {string} chapterId - Current chapter ID
 * @param {string} language - OCR language
 * @returns {Object} - Composite block state and handlers
 */
export const useCompositeBlocks = (imageRef, canvasRef, chapterId, language) => {
  const [compositeBlocks, setCompositeBlocks] = useState({
    name: `${COMPOSITE_BLOCK.NAME_PREFIX} ${uuidv4().slice(
      0,
      COMPOSITE_BLOCK.UUID_SLICE_LENGTH
    )}`,
    type: "",
    areas: [],
  });

  const [highlight, setHighlight] = useState("");
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  /**
   * Update composite block property
   * @param {string|null} id - Area ID (null for root properties)
   * @param {string} key - Property key to update
   * @param {*} value - New value
   */
  const updateCompositeBlock = useCallback((id, key, value) => {
    if (!id) {
      // Update root properties (name, type)
      setCompositeBlocks((prevState) => ({
        ...prevState,
        [key]: value,
        areas: [], // Clear areas when type changes
      }));
      return;
    }

    // Update specific area
    setCompositeBlocks((prevState) => ({
      ...prevState,
      areas: prevState?.areas?.map((item) => {
        if (item.id === id) {
          return { ...item, [key]: value };
        }
        return item;
      }),
    }));
  }, []);

  /**
   * Delete a composite block area
   * @param {string} id - Area ID to delete
   */
  const deleteCompositeBlockArea = useCallback((id) => {
    setCompositeBlocks((prevState) => ({
      ...prevState,
      areas: prevState?.areas?.filter((item) => item.id !== id),
    }));
  }, []);

  /**
   * Process a composite block area (OCR, etc.)
   * @param {string} id - Area ID
   * @param {string} typeOfLabel - Type of content
   */
  const processCompositeBlockArea = useCallback(
    async (id, typeOfLabel) => {
      // Set loading
      setCompositeBlocks((prevState) => ({
        ...prevState,
        areas: prevState?.areas?.map((item) => {
          if (item.id === id) {
            return { ...item, loading: true };
          }
          return item;
        }),
      }));

      const { naturalWidth, clientWidth, clientHeight } = imageRef.current;
      const ratio = naturalWidth / clientWidth;

      const selectedBlock = compositeBlocks.areas.find((item) => item.id === id);
      const x = ((selectedBlock.x * ratio) / 100) * clientWidth;
      const y = ((selectedBlock.y * ratio) / 100) * clientHeight;
      const width = ((selectedBlock.width * ratio) / 100) * clientWidth;
      const height = ((selectedBlock.height * ratio) / 100) * clientHeight;

      const img = cropSelectedArea(canvasRef, imageRef, x, y, width, height);

      let text = "";
      if (typeOfLabel === "text") {
        text = await ocr(language, img);
      }

      // Update with results
      setCompositeBlocks((prevState) => ({
        ...prevState,
        areas: prevState?.areas?.map((item) => {
          if (item.id === id) {
            return {
              ...item,
              loading: false,
              img: img,
              text: text,
            };
          }
          return item;
        }),
      }));
    },
    [compositeBlocks.areas, imageRef, canvasRef, language]
  );

  /**
   * Submit composite blocks to server
   */
  const submitCompositeBlocks = useCallback(async () => {
    setLoadingSubmit(true);

    const blocks = compositeBlocks.areas.map(
      ({ type, text, x, y, width, height, unit }) => ({
        contentType: type,
        contentValue: text,
        coordinates: {
          height,
          unit: unit === "%" ? "percentage" : "px",
          width,
          x,
          y,
        },
      })
    );

    const data = {
      name: compositeBlocks.name,
      type: compositeBlocks.type,
      chapterId,
      blocks,
    };

    try {
      const id = await saveCompositeBlocks(data);
      return id;
    } finally {
      setLoadingSubmit(false);
    }
  }, [compositeBlocks, chapterId]);

  /**
   * Update composite blocks from area selector
   * @param {Area[]} areas - New areas
   */
  const updateFromAreaSelector = useCallback(
    (areas) => {
      const updated = addPropsToAreasForCompositeBlocks(compositeBlocks, areas);
      setCompositeBlocks(updated);
    },
    [compositeBlocks]
  );

  /**
   * Reset composite blocks to initial state
   */
  const resetCompositeBlocks = useCallback(() => {
    setCompositeBlocks({
      name: `${COMPOSITE_BLOCK.NAME_PREFIX} ${uuidv4().slice(
        0,
        COMPOSITE_BLOCK.UUID_SLICE_LENGTH
      )}`,
      type: "",
      areas: [],
    });
  }, []);

  return {
    // State
    compositeBlocks,
    highlight,
    loadingSubmit,

    // Setters
    setCompositeBlocks,
    setHighlight,

    // Actions
    updateCompositeBlock,
    deleteCompositeBlockArea,
    processCompositeBlockArea,
    submitCompositeBlocks,
    updateFromAreaSelector,
    resetCompositeBlocks,
  };
};
```

</details>

**Acceptance Criteria:**
- [ ] Hook manages composite block state
- [ ] Provides CRUD operations
- [ ] Handles OCR processing for areas
- [ ] Submits to server
- [ ] Generates unique names

---

### Task 6: Create useVirtualBlocks Hook

Extract virtual blocks state and operations.

#### File: `src/components/Studio/hooks/useVirtualBlocks.js`

<details>
<summary><b>Implementation Code</b></summary>

```javascript
/**
 * @file useVirtualBlocks.js
 * @description Hook for managing virtual blocks
 */

import { useState, useCallback } from "react";
import { parseVirtualBlocksFromPages } from "../../../utils/virtual-blocks";
import { TIMEOUTS } from "../constants";

/**
 * Custom hook for virtual blocks management
 * @param {Page[]} pages - Array of pages
 * @param {boolean} subObject - Whether editing sub-object
 * @param {number} activePageIndex - Current active page index
 * @param {Function} onImageLoad - Callback after toggling VB
 * @returns {Object} - Virtual blocks state and handlers
 */
export const useVirtualBlocks = (
  pages,
  subObject,
  activePageIndex,
  onImageLoad
) => {
  const [virtualBlocks, setVirtualBlocks] = useState(() => {
    return subObject ? [] : parseVirtualBlocksFromPages(pages);
  });

  const [showVB, setShowVB] = useState(false);

  /**
   * Toggle virtual blocks visibility
   */
  const toggleVirtualBlocks = useCallback(() => {
    setShowVB((prevState) => !prevState);

    // Trigger image recalculation after toggle
    setTimeout(() => {
      onImageLoad();
    }, TIMEOUTS.VIRTUAL_BLOCKS_TOGGLE_DELAY);
  }, [onImageLoad]);

  /**
   * Update virtual blocks for current page
   * @param {VirtualBlock[]} newBlocks - New virtual blocks
   */
  const updateVirtualBlocks = useCallback(
    (newBlocks) => {
      setVirtualBlocks((prevState) => {
        const updated = [...prevState];
        updated[activePageIndex] = newBlocks;
        return updated;
      });
    },
    [activePageIndex]
  );

  /**
   * Add a virtual block to current page
   * @param {VirtualBlock} block - Block to add
   */
  const addVirtualBlock = useCallback(
    (block) => {
      setVirtualBlocks((prevState) => {
        const updated = [...prevState];
        if (!updated[activePageIndex]) {
          updated[activePageIndex] = [];
        }
        updated[activePageIndex] = [...updated[activePageIndex], block];
        return updated;
      });
    },
    [activePageIndex]
  );

  /**
   * Remove a virtual block by ID
   * @param {string} blockId - Block ID to remove
   */
  const removeVirtualBlock = useCallback(
    (blockId) => {
      setVirtualBlocks((prevState) => {
        const updated = [...prevState];
        updated[activePageIndex] = updated[activePageIndex].filter(
          (block) => block.id !== blockId
        );
        return updated;
      });
    },
    [activePageIndex]
  );

  /**
   * Clear all virtual blocks for current page
   */
  const clearVirtualBlocks = useCallback(() => {
    setVirtualBlocks((prevState) => {
      const updated = [...prevState];
      updated[activePageIndex] = [];
      return updated;
    });
  }, [activePageIndex]);

  return {
    // State
    virtualBlocks,
    showVB,

    // Setters
    setVirtualBlocks,
    setShowVB,

    // Actions
    toggleVirtualBlocks,
    updateVirtualBlocks,
    addVirtualBlock,
    removeVirtualBlock,
    clearVirtualBlocks,

    // Computed
    currentPageVirtualBlocks: virtualBlocks[activePageIndex] || [],
  };
};
```

</details>

**Acceptance Criteria:**
- [ ] Hook manages virtual blocks per page
- [ ] Toggle visibility with image recalculation
- [ ] Provides CRUD operations
- [ ] Parses initial state from pages

---

### Task 7: Create StudioContext

Now create the Context that combines all hooks.

#### File: `src/components/Studio/context/StudioContext.jsx`

<details>
<summary><b>Implementation Code</b></summary>

```javascript
/**
 * @file StudioContext.jsx
 * @description Context provider for Studio component state
 */

import React, { createContext, useContext, useRef, useState } from "react";
import { usePageManagement } from "../hooks/usePageManagement";
import { useAreaManagement } from "../hooks/useAreaManagement";
import { useCoordinateConversion } from "../hooks/useCoordinateConversion";
import { useCompositeBlocks } from "../hooks/useCompositeBlocks";
import { useVirtualBlocks } from "../hooks/useVirtualBlocks";
import { DEFAULTS, LANGUAGE_CODES, OCR_LANGUAGES } from "../constants";

const StudioContext = createContext(null);

/**
 * Studio Context Provider
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @param {Object} props.studioProps - Studio component props
 */
export const StudioProvider = ({ children, studioProps }) => {
  const {
    pages,
    types,
    subObject,
    language: lang,
    chapterId,
    ...restProps
  } = studioProps;

  // Refs
  const studioEditorRef = useRef(null);
  const canvasRef = useRef(null);
  const thumbnailsRef = useRef(null);

  // Image scale state
  const [imageScaleFactor, setImageScaleFactor] = useState(
    DEFAULTS.IMAGE_SCALE_FACTOR
  );

  // Language state
  const [language, setLanguage] = useState(
    lang === LANGUAGE_CODES.ENGLISH ? OCR_LANGUAGES.ENGLISH : OCR_LANGUAGES.ARABIC
  );

  // Loading states
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  // Sub-object state
  const [activeType, setActiveType] = useState("");
  const [typeOfActiveType, setTypeOfActiveType] = useState("");

  // Tab state
  const [activeLeftTab, setActiveLeftTab] = useState(null); // Set after LEFT_COLUMNS created
  const [activeRightTab, setActiveRightTab] = useState(null); // Set after RIGHT_COLUMNS created

  // Page management
  const pageManagement = usePageManagement(pages, subObject);

  // Area management
  const areaManagement = useAreaManagement(
    pages,
    pageManagement.activePageIndex,
    types
  );

  // Coordinate conversion
  const imageRef = studioEditorRef.current?.studioEditorSelectorRef;
  const coordinateConversion = useCoordinateConversion(
    areaManagement,
    imageRef,
    pageManagement.activePageIndex,
    imageScaleFactor
  );

  // Composite blocks
  const compositeBlocksManagement = useCompositeBlocks(
    imageRef,
    canvasRef,
    chapterId,
    language
  );

  // Virtual blocks
  const virtualBlocksManagement = useVirtualBlocks(
    pages,
    subObject,
    pageManagement.activePageIndex,
    coordinateConversion.convertPercentageToPx
  );

  // Context value
  const value = {
    // Props
    pages,
    types,
    subObject,
    chapterId,
    ...restProps,

    // Refs
    studioEditorRef,
    canvasRef,
    thumbnailsRef,

    // State
    imageScaleFactor,
    setImageScaleFactor,
    language,
    setLanguage,
    loadingSubmit,
    setLoadingSubmit,
    activeType,
    setActiveType,
    typeOfActiveType,
    setTypeOfActiveType,
    activeLeftTab,
    setActiveLeftTab,
    activeRightTab,
    setActiveRightTab,

    // Page Management
    ...pageManagement,

    // Area Management
    ...areaManagement,

    // Coordinate Conversion
    ...coordinateConversion,

    // Composite Blocks
    ...compositeBlocksManagement,

    // Virtual Blocks
    ...virtualBlocksManagement,
  };

  return (
    <StudioContext.Provider value={value}>
      {children}
    </StudioContext.Provider>
  );
};

/**
 * Hook to use Studio context
 * @returns {Object} - Studio context value
 */
export const useStudioContext = () => {
  const context = useContext(StudioContext);
  if (!context) {
    throw new Error("useStudioContext must be used within StudioProvider");
  }
  return context;
};
```

</details>

**Acceptance Criteria:**
- [ ] Context combines all custom hooks
- [ ] Provides all state and actions
- [ ] Includes refs for DOM access
- [ ] Has proper error handling
- [ ] Exports custom hook for accessing context

---

### Task 8: Update Studio.jsx to Use Context

Now refactor Studio.jsx to use the context.

#### File: `src/components/Studio/Studio.jsx` (Updated)

<details>
<summary><b>Key Changes</b></summary>

```javascript
import React from "react";
import { StudioProvider, useStudioContext } from "./context/StudioContext";
// ... other imports

// Create inner component that uses context
const StudioContent = () => {
  const {
    pages,
    types,
    chapterId,
    activePageIndex,
    areas,
    areasProperties,
    // ... all other context values
  } = useStudioContext();

  // Most of the component logic moves here, using context values
  // instead of local state

  return (
    <>
      <StudioStickyToolbar /* props from context */ />
      <LanguageSwitcher /* props from context */ />
      <div className={styles.studio}>
        {/* Rest of JSX */}
      </div>
    </>
  );
};

// Main Studio component wraps with provider
const Studio = (props) => {
  return (
    <StudioProvider studioProps={props}>
      <StudioContent />
    </StudioProvider>
  );
};

export default Studio;
```

</details>

**Acceptance Criteria:**
- [ ] Studio.jsx reduced from 890+ lines to ~200 lines
- [ ] All state accessed from context
- [ ] No useState hooks in Studio.jsx (moved to hooks)
- [ ] All functionality works identically
- [ ] Zero breaking changes

---

## Testing Strategy

### Unit Tests (Priority: High)

Each custom hook should have comprehensive unit tests:

```bash
src/components/Studio/
├── hooks/
│   ├── __tests__/
│   │   ├── usePageManagement.test.js
│   │   ├── useAreaManagement.test.js
│   │   ├── useCoordinateConversion.test.js
│   │   ├── useCompositeBlocks.test.js
│   │   └── useVirtualBlocks.test.js
└── utils/
    ├── __tests__/
    │   ├── areaUtils.test.js
    │   └── coordinateUtils.test.js
```

**Test Coverage Goals:**
- Hooks: 80%+
- Utils: 90%+
- Context: 70%+

### Integration Tests

Test hooks working together:

```javascript
// Test area management + coordinate conversion
// Test page navigation + area updates
// Test composite blocks + OCR processing
```

### Regression Tests

Run full Studio component tests:
- [ ] Create new area
- [ ] Delete area
- [ ] Navigate between pages
- [ ] OCR extraction
- [ ] Composite block creation
- [ ] Virtual blocks toggle
- [ ] Submit blocks

---

## Migration Checklist

### Pre-Migration
- [ ] Phase 1 complete and merged
- [ ] Create feature branch: `refactor/studio-phase-2-hooks`
- [ ] Backup current Studio.jsx

### Migration Steps
1. [ ] Create utility functions (Task 1)
2. [ ] Create usePageManagement (Task 2)
3. [ ] Create useAreaManagement (Task 3)
4. [ ] Create useCoordinateConversion (Task 4)
5. [ ] Create useCompositeBlocks (Task 5)
6. [ ] Create useVirtualBlocks (Task 6)
7. [ ] Create StudioContext (Task 7)
8. [ ] Update Studio.jsx (Task 8)
9. [ ] Write unit tests for all hooks
10. [ ] Run integration tests
11. [ ] Verify all functionality works

### Post-Migration
- [ ] Code review
- [ ] Performance testing
- [ ] Documentation update
- [ ] Merge to main branch

---

## Success Metrics

### Code Quality
- [ ] Reduce Studio.jsx from 890+ to ~200 lines
- [ ] Reduce useState count from 17+ to ~5
- [ ] Zero ESLint warnings
- [ ] 80%+ test coverage on hooks

### Functionality
- [ ] All features work identically
- [ ] No console errors
- [ ] No performance regression
- [ ] Mobile/responsive still works

### Developer Experience
- [ ] Easier to understand component structure
- [ ] State logic is testable in isolation
- [ ] Clear separation of concerns
- [ ] Better IDE autocomplete (with types)

---

## Troubleshooting

### Common Issues

**Issue 1: Context value is null**
```
Error: useStudioContext must be used within StudioProvider
```
**Solution:** Ensure component is wrapped with StudioProvider. Check component tree.

**Issue 2: Ref is undefined in hooks**
```
TypeError: Cannot read property 'current' of undefined
```
**Solution:** Check that refs are passed correctly from Studio → Context → hooks. Add safety checks in hooks.

**Issue 3: Infinite re-render loop**
```
Error: Maximum update depth exceeded
```
**Solution:** Check useEffect dependencies. Ensure callbacks are wrapped with useCallback.

**Issue 4: Areas not converting correctly**
```
Areas show wrong coordinates after zoom
```
**Solution:** Verify _updated flag logic. Check resetConversionFlag is called before page change.

---

## Git Workflow

```bash
# Create feature branch
git checkout -b refactor/studio-phase-2-hooks

# Atomic commits
git add src/components/Studio/utils/
git commit -m "feat(studio): add area and coordinate utility functions"

git add src/components/Studio/hooks/usePageManagement.js
git commit -m "feat(studio): add usePageManagement hook"

git add src/components/Studio/hooks/useAreaManagement.js
git commit -m "feat(studio): add useAreaManagement hook"

# ... continue for each hook

git add src/components/Studio/context/
git commit -m "feat(studio): add StudioContext with all hooks"

git add src/components/Studio/Studio.jsx
git commit -m "refactor(studio): migrate Studio.jsx to use context and hooks"

git add src/components/Studio/**/*.test.js
git commit -m "test(studio): add unit tests for all custom hooks"

# Push and create PR
git push origin refactor/studio-phase-2-hooks
```

---

## Next Steps (Phase 3 Preview)

After Phase 2 is complete:

**Phase 3: Business Logic Extraction**
- Create services (CoordinateService, AreaService, OCRService)
- Move business logic out of hooks
- Pure functions for testability
- Better separation of concerns

**Estimated Start:** Week 3

---

## Resources

- [React Custom Hooks](https://react.dev/learn/reusing-logic-with-custom-hooks)
- [Context API Best Practices](https://react.dev/learn/passing-data-deeply-with-context)
- [Testing React Hooks](https://react-hooks-testing-library.com/)
- [useCallback vs useMemo](https://react.dev/reference/react/useCallback)

---

## Questions or Issues?

If you encounter problems during Phase 2:

1. Check the Troubleshooting section
2. Review Phase 1 completion checklist
3. Verify all imports are correct
4. Run tests to identify issues
5. Create detailed issue with error logs

---

**Phase 2 Estimated Effort:** 16-20 hours
**Target Completion:** End of Week 2
**Review Date:** [To be scheduled]

Good luck with Phase 2 refactoring!
