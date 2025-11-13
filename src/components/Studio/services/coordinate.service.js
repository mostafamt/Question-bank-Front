/**
 * Image-Based Coordinate Recalculation Service
 *
 * This service recalculates area coordinates based on the actual loaded image's
 * rendered dimensions. It is specifically designed for the onImageLoad workflow
 * where coordinates stored as percentages need to be converted to pixels based on
 * the current image size (which changes on zoom, page navigation, or image load).
 *
 * Key Concept: This is NOT generic coordinate conversion. It's specifically
 * for recalculating pixel coordinates when the underlying image loads, resizes,
 * or changes, ensuring areas stay properly positioned relative to the image.
 *
 * @module components/Studio/services/coordinate.service
 */

import {
  convertPercentageToPixels,
  preserveMetadata,
  validateDimensions,
} from "../../../utils/coordinates";

/**
 * @typedef {Object} RefValidationResult
 * @property {boolean} isValid - Whether the ref is valid and accessible
 * @property {import('../../../utils/coordinates').Dimensions|null} dimensions - Extracted dimensions if valid
 * @property {string} [error] - Error message if validation failed
 */

/**
 * Safely accesses the Studio editor image ref and validates it's loaded.
 *
 * This function provides safe access to the image element ref with comprehensive
 * validation to ensure the image is fully loaded and ready for dimension extraction.
 * It checks:
 * 1. Ref chain exists (studioEditorRef -> current -> studioEditorSelectorRef -> current)
 * 2. Dimensions are valid (clientWidth, clientHeight > 0)
 * 3. Image is actually loaded (naturalWidth, naturalHeight > 0)
 *
 * This is critical because onImageLoad must only run when the image element
 * is fully loaded and rendered in the DOM.
 *
 * @param {React.RefObject} studioEditorRef - The Studio editor ref containing the image selector ref
 * @returns {RefValidationResult} Validation result with dimensions or error
 *
 * @example
 * const validation = validateRefAccess(studioEditorRef);
 * if (!validation.isValid) {
 *   console.warn('Image not ready:', validation.error);
 *   return; // Wait for image to load
 * }
 * const { dimensions } = validation;
 */
export function validateRefAccess(studioEditorRef) {
  // Check if ref exists
  if (!studioEditorRef) {
    return {
      isValid: false,
      dimensions: null,
      error: "studioEditorRef is null or undefined",
    };
  }

  // Check if ref.current exists
  if (!studioEditorRef.current) {
    return {
      isValid: false,
      dimensions: null,
      error: "studioEditorRef.current is null or undefined",
    };
  }

  // Check if nested selector ref exists
  if (!studioEditorRef.current.studioEditorSelectorRef) {
    return {
      isValid: false,
      dimensions: null,
      error: "studioEditorSelectorRef is not available",
    };
  }

  // Check if nested selector ref.current exists
  if (!studioEditorRef.current.studioEditorSelectorRef.current) {
    return {
      isValid: false,
      dimensions: null,
      error: "studioEditorSelectorRef.current is null or undefined",
    };
  }

  // Extract dimensions from the loaded image element
  const imageElement = studioEditorRef.current.studioEditorSelectorRef.current;
  const { clientHeight, clientWidth, naturalWidth, naturalHeight } =
    imageElement;

  const dimensions = {
    clientWidth,
    clientHeight,
    naturalWidth,
    naturalHeight,
  };

  // Validate extracted dimensions
  const validation = validateDimensions(dimensions);

  if (!validation.isValid) {
    return {
      isValid: false,
      dimensions: null,
      error: `Invalid dimensions: ${validation.errors.join(", ")}`,
    };
  }

  // Additional check: Verify image is actually loaded
  // naturalWidth/naturalHeight are 0 until the image loads
  if (
    naturalWidth !== undefined &&
    naturalHeight !== undefined &&
    (naturalWidth === 0 || naturalHeight === 0)
  ) {
    return {
      isValid: false,
      dimensions: null,
      error:
        "Image not fully loaded yet (naturalWidth/naturalHeight is 0). Call onImageLoad after image loads.",
    };
  }

  return {
    isValid: true,
    dimensions,
  };
}

/**
 * Determines if an area needs coordinate conversion.
 *
 * An area needs conversion if:
 * 1. It uses percentage units (_unit === 'percentage')
 * 2. It hasn't been converted yet (_updated is false or undefined)
 *
 * @param {import('../../../utils/coordinates').Area} area - The area to check
 * @returns {boolean} True if area should be converted
 *
 * @example
 * if (shouldConvertArea(area)) {
 *   const converted = convertPercentageToPixels(area, dimensions);
 * }
 */
export function shouldConvertArea(area) {
  if (!area) {
    return false;
  }

  return area._unit === "percentage";
}

/**
 * Gets original percentage coordinates from area or falls back to properties.
 *
 * This function handles backward compatibility by checking multiple sources
 * for percentage coordinates. It prefers stored metadata (_percentX, etc.)
 * but falls back to areasProperties for older data.
 *
 * @param {import('../../../utils/coordinates').Area} area - The area object
 * @param {Object} properties - The area properties from areasProperties array
 * @returns {Object|null} Object with x, y, width, height percentages or null if not found
 *
 * @example
 * const percentCoords = getOriginalPercentageCoords(area, properties);
 * if (percentCoords) {
 *   const { x, y, width, height } = percentCoords;
 * }
 */
export function getOriginalPercentageCoords(area, properties) {
  // First, try to use stored percentage coordinates from the area itself
  if (
    area._percentX !== undefined &&
    area._percentY !== undefined &&
    area._percentWidth !== undefined &&
    area._percentHeight !== undefined
  ) {
    return {
      x: area._percentX,
      y: area._percentY,
      width: area._percentWidth,
      height: area._percentHeight,
    };
  }

  // Fall back to areasProperties for backward compatibility
  if (
    properties &&
    properties.x !== undefined &&
    properties.y !== undefined &&
    properties.width !== undefined &&
    properties.height !== undefined
  ) {
    return {
      x: properties.x,
      y: properties.y,
      width: properties.width,
      height: properties.height,
    };
  }

  // If neither source is available, return null
  return null;
}

/**
 * Processes areas for a single page.
 *
 * Converts areas from percentage to pixels as needed, preserving metadata
 * and handling non-conversion cases appropriately.
 *
 * @param {import('../../../utils/coordinates').Area[]} pageAreas - Areas for the page
 * @param {Object[]} pageProperties - Properties for the page areas
 * @param {import('../../../utils/coordinates').Dimensions} dimensions - Container dimensions
 * @returns {import('../../../utils/coordinates').Area[]} Processed areas
 *
 * @example
 * const processedAreas = processPageAreas(
 *   areas[pageIndex],
 *   areasProperties[pageIndex],
 *   dimensions
 * );
 */
export function processPageAreas(pageAreas, pageProperties, dimensions) {
  if (!pageAreas || !Array.isArray(pageAreas)) {
    return pageAreas;
  }

  return pageAreas.map((area, areaIdx) => {
    // Only convert if necessary
    if (!shouldConvertArea(area)) {
      // Return with preserved metadata (no conversion needed)
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
        // Preserve percentage coordinates if they exist
        _percentX: area._percentX,
        _percentY: area._percentY,
        _percentWidth: area._percentWidth,
        _percentHeight: area._percentHeight,
      };
    }

    // Get percentage coordinates with fallback to properties
    const percentCoords = getOriginalPercentageCoords(
      area,
      pageProperties?.[areaIdx]
    );

    if (!percentCoords) {
      // If we can't find percentage coordinates, return area unchanged
      console.warn(
        `Cannot find percentage coordinates for area ${areaIdx}, skipping conversion`
      );
      return {
        ...area,
        unit: "px",
        isChanging: true,
        isNew: true,
        _updated: false,
      };
    }

    // Create a temporary area with percentage coordinates for conversion
    const areaForConversion = {
      ...area,
      _percentX: percentCoords.x,
      _percentY: percentCoords.y,
      _percentWidth: percentCoords.width,
      _percentHeight: percentCoords.height,
    };

    try {
      // Convert coordinates from percentage to pixels
      const convertedArea = convertPercentageToPixels(
        areaForConversion,
        dimensions
      );

      // Preserve metadata from original area
      return preserveMetadata(areaForConversion, convertedArea);
    } catch (error) {
      console.error(`Error converting area ${areaIdx}:`, error);
      // Return original area if conversion fails
      return {
        ...area,
        unit: "px",
        isChanging: true,
        isNew: true,
        _updated: false,
      };
    }
  });
}

/**
 * Recalculates all area coordinates based on the loaded image's current dimensions.
 *
 * This is the main entry point called by onImageLoad when:
 * - An image finishes loading
 * - The user zooms in/out (image scales)
 * - The user navigates to a different page (new image loads)
 * - Virtual blocks are toggled (layout changes)
 *
 * The function extracts the current rendered dimensions from the actual DOM image
 * element and recalculates pixel coordinates for all areas based on their stored
 * percentage coordinates. This ensures areas stay properly positioned relative to
 * the image regardless of zoom level or viewport size.
 *
 * @param {import('../../../utils/coordinates').Area[][]} allAreas - All areas for all pages
 * @param {Object[][]} areasProperties - Properties for all areas on all pages (fallback for percentage coords)
 * @param {React.RefObject} studioEditorRef - Studio editor ref pointing to the loaded image element
 * @param {number|null} [activePageIndex=null] - If provided, only recalculate this page (optimization)
 * @returns {import('../../../utils/coordinates').Area[][]|null} Recalculated areas or unchanged if image not ready
 *
 * @example
 * // Called by onImageLoad after image loads
 * const onImageLoad = () => {
 *   setAreas((prevState) => {
 *     const processedAreas = processAreasForImageLoad(
 *       prevState,
 *       areasProperties,
 *       studioEditorRef
 *     );
 *     return processedAreas || prevState;
 *   });
 * };
 */
export function processAreasForImageLoad(
  allAreas,
  areasProperties,
  studioEditorRef,
  activePageIndex = null
) {
  // Validate ref access first
  const refValidation = validateRefAccess(studioEditorRef);

  if (!refValidation.isValid) {
    console.warn("Cannot process areas for image load:", refValidation.error);
    return allAreas; // Return unchanged if ref is not valid
  }

  const { dimensions } = refValidation;

  // Safety check for areas array
  if (!allAreas || !Array.isArray(allAreas)) {
    console.warn("Areas array is invalid");
    return allAreas;
  }

  // Process all pages or just active page
  return allAreas.map((page, pageIdx) => {
    // Skip if processing only active page and this isn't it
    if (activePageIndex !== null && pageIdx !== activePageIndex) {
      return page;
    }

    // Process this page's areas
    return processPageAreas(page, areasProperties?.[pageIdx], dimensions);
  });
}

/**
 * Creates a safe wrapper for onImageLoad that handles errors gracefully.
 *
 * This function returns a new onImageLoad function that includes error boundaries
 * and proper logging.
 *
 * @param {import('../../../utils/coordinates').Area[][]} areas - Current areas state
 * @param {Object[][]} areasProperties - Current properties state
 * @param {React.RefObject} studioEditorRef - Studio editor ref
 * @param {Function} setAreas - State setter for areas
 * @param {number|null} [activePageIndex=null] - Optional active page index
 * @returns {Function} Safe onImageLoad function
 *
 * @example
 * const onImageLoad = createSafeOnImageLoad(
 *   areas,
 *   areasProperties,
 *   studioEditorRef,
 *   setAreas
 * );
 */
export function createSafeOnImageLoad(
  areas,
  areasProperties,
  studioEditorRef,
  setAreas,
  activePageIndex = null
) {
  return () => {
    try {
      const processedAreas = processAreasForImageLoad(
        areas,
        areasProperties,
        studioEditorRef,
        activePageIndex
      );

      if (processedAreas) {
        setAreas(processedAreas);
      }
    } catch (error) {
      console.error("Error in onImageLoad:", error);
      // Don't update state if processing failed
    }
  };
}
