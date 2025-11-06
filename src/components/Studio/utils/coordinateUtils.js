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
