/**
 * Coordinate Conversion Utilities
 *
 * This module provides pure functions for converting coordinates between
 * percentage and pixel units. These functions are used primarily by the
 * Studio component for managing interactive areas on book pages.
 *
 * @module utils/coordinates
 */

/**
 * @typedef {Object} Dimensions
 * @property {number} clientWidth - Current rendered width in pixels
 * @property {number} clientHeight - Current rendered height in pixels
 * @property {number} [naturalWidth] - Original image width in pixels
 * @property {number} [naturalHeight] - Original image height in pixels
 */

/**
 * @typedef {Object} Area
 * @property {number} x - X coordinate
 * @property {number} y - Y coordinate
 * @property {number} width - Width
 * @property {number} height - Height
 * @property {'px'|'%'} unit - Current unit type
 * @property {boolean} isChanging - Whether the area is being modified
 * @property {boolean} isNew - Whether the area is newly created
 * @property {'px'|'percentage'} [_unit] - Original unit type for internal tracking
 * @property {boolean} [_updated] - Whether coordinates have been converted
 * @property {number} [_percentX] - Stored percentage X coordinate
 * @property {number} [_percentY] - Stored percentage Y coordinate
 * @property {number} [_percentWidth] - Stored percentage width
 * @property {number} [_percentHeight] - Stored percentage height
 */

/**
 * @typedef {Object} ValidationResult
 * @property {boolean} isValid - Whether the validation passed
 * @property {string[]} errors - Array of error messages (empty if valid)
 */

/**
 * Validates that dimensions are suitable for coordinate conversion.
 *
 * Checks that the dimensions object exists and contains valid positive
 * values for clientWidth and clientHeight.
 *
 * @param {Dimensions} dimensions - The dimensions to validate
 * @returns {ValidationResult} Validation result with errors if any
 *
 * @example
 * const result = validateDimensions({ clientWidth: 800, clientHeight: 600 });
 * if (!result.isValid) {
 *   console.error('Invalid dimensions:', result.errors);
 * }
 */
export function validateDimensions(dimensions) {
  const errors = [];

  if (!dimensions) {
    return { isValid: false, errors: ["Dimensions object is required"] };
  }

  if (
    typeof dimensions.clientWidth !== "number" ||
    dimensions.clientWidth <= 0
  ) {
    errors.push("Invalid or missing clientWidth");
  }

  if (
    typeof dimensions.clientHeight !== "number" ||
    dimensions.clientHeight <= 0
  ) {
    errors.push("Invalid or missing clientHeight");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Converts an area from percentage units to pixels.
 *
 * Uses stored percentage coordinates (_percentX, etc.) if available,
 * otherwise falls back to current x, y, width, height values.
 *
 * @param {Area} area - The area with percentage coordinates
 * @param {Dimensions} dimensions - The container dimensions
 * @returns {Area} New area object with pixel coordinates
 * @throws {Error} If dimensions are invalid
 *
 * @example
 * const pixelArea = convertPercentageToPixels(
 *   { x: 50, y: 50, width: 25, height: 25, _unit: 'percentage' },
 *   { clientWidth: 800, clientHeight: 600 }
 * );
 * // Result: { x: 400, y: 300, width: 200, height: 150, ... }
 */
export function convertPercentageToPixels(area, dimensions) {
  const validation = validateDimensions(dimensions);
  if (!validation.isValid) {
    throw new Error(`Invalid dimensions: ${validation.errors.join(", ")}`);
  }

  const { clientWidth, clientHeight } = dimensions;

  // Use stored percentage coordinates if available, otherwise use current values
  const percentX = area._percentX ?? area.x;
  const percentY = area._percentY ?? area.y;
  const percentWidth = area._percentWidth ?? area.width;
  const percentHeight = area._percentHeight ?? area.height;

  return {
    ...area, // Preserve all original properties (id, name, blockId, etc.)
    x: (percentX / 100) * clientWidth,
    y: (percentY / 100) * clientHeight,
    width: (percentWidth / 100) * clientWidth,
    height: (percentHeight / 100) * clientHeight,
    unit: "px",
    isChanging: true,
    isNew: true,
  };
}

/**
 * Converts an area from pixel units to percentage.
 *
 * This is the inverse operation of convertPercentageToPixels.
 * Useful when saving coordinates to be resolution-independent.
 *
 * @param {Area} area - The area with pixel coordinates
 * @param {Dimensions} dimensions - The container dimensions
 * @returns {Area} New area object with percentage coordinates
 * @throws {Error} If dimensions are invalid
 *
 * @example
 * const percentArea = convertPixelsToPercentage(
 *   { x: 400, y: 300, width: 200, height: 150, unit: 'px' },
 *   { clientWidth: 800, clientHeight: 600 }
 * );
 * // Result: { x: 50, y: 50, width: 25, height: 25, ... }
 */
export function convertPixelsToPercentage(area, dimensions) {
  const validation = validateDimensions(dimensions);
  if (!validation.isValid) {
    throw new Error(`Invalid dimensions: ${validation.errors.join(", ")}`);
  }

  const { clientWidth, clientHeight } = dimensions;

  return {
    ...area, // Preserve all original properties (id, name, blockId, etc.)
    x: (area.x / clientWidth) * 100,
    y: (area.y / clientHeight) * 100,
    width: (area.width / clientWidth) * 100,
    height: (area.height / clientHeight) * 100,
    unit: "%",
    isChanging: area.isChanging ?? true,
    isNew: area.isNew ?? true,
  };
}

/**
 * Preserves metadata from original area in the converted area.
 *
 * Ensures that important tracking fields like _unit, _updated, and
 * percentage coordinates are not lost during conversion operations.
 *
 * @param {Area} originalArea - The original area before conversion
 * @param {Area} convertedArea - The area after conversion
 * @returns {Area} Merged area with all metadata preserved
 *
 * @example
 * const original = { x: 50, y: 50, _unit: 'percentage', _percentX: 50 };
 * const converted = { x: 400, y: 300, unit: 'px' };
 * const preserved = preserveMetadata(original, converted);
 * // Result includes both converted coordinates and original metadata
 */
export function preserveMetadata(originalArea, convertedArea) {
  // Get percentage coordinates from original area or calculate from current values
  const percentX =
    originalArea._percentX !== undefined
      ? originalArea._percentX
      : originalArea.x;
  const percentY =
    originalArea._percentY !== undefined
      ? originalArea._percentY
      : originalArea.y;
  const percentWidth =
    originalArea._percentWidth !== undefined
      ? originalArea._percentWidth
      : originalArea.width;
  const percentHeight =
    originalArea._percentHeight !== undefined
      ? originalArea._percentHeight
      : originalArea.height;

  return {
    ...originalArea, // Preserve all original properties first (id, name, blockId, etc.)
    ...convertedArea, // Override with converted coordinates
    _unit: originalArea._unit || "percentage",
    _updated: true,
    _percentX: percentX,
    _percentY: percentY,
    _percentWidth: percentWidth,
    _percentHeight: percentHeight,
  };
}

/**
 * Creates an area object with properly initialized metadata.
 *
 * Used when creating new areas to ensure they have all required
 * metadata fields from the start.
 *
 * @param {Area} area - The base area object
 * @param {Object} [metadata={}] - Additional metadata to include
 * @returns {Area} Area with complete metadata
 *
 * @example
 * const newArea = createAreaWithMetadata(
 *   { x: 50, y: 50, width: 25, height: 25, unit: '%' },
 *   { _unit: 'percentage', _updated: false }
 * );
 */
export function createAreaWithMetadata(area, metadata = {}) {
  return {
    ...area,
    unit: area.unit || "%",
    isChanging: area.isChanging ?? true,
    isNew: area.isNew ?? true,
    _unit: metadata._unit || "percentage",
    _updated: metadata._updated ?? false,
    _percentX: metadata._percentX ?? area.x,
    _percentY: metadata._percentY ?? area.y,
    _percentWidth: metadata._percentWidth ?? area.width,
    _percentHeight: metadata._percentHeight ?? area.height,
  };
}

/**
 * Normalizes an area object to ensure consistent structure.
 *
 * Adds default values for missing fields and ensures proper types.
 * Useful when dealing with areas from different sources (API, user input, etc.).
 *
 * @param {Partial<Area>} area - The area to normalize (may have missing fields)
 * @returns {Area} Normalized area with all required fields
 *
 * @example
 * const normalized = normalizeArea({ x: 10, y: 20 });
 * // Result includes default values for width, height, unit, etc.
 */
export function normalizeArea(area) {
  return {
    x: area.x ?? 0,
    y: area.y ?? 0,
    width: area.width ?? 0,
    height: area.height ?? 0,
    unit: area.unit || "px",
    isChanging: area.isChanging ?? true,
    isNew: area.isNew ?? true,
    _unit: area._unit,
    _updated: area._updated ?? false,
    _percentX: area._percentX,
    _percentY: area._percentY,
    _percentWidth: area._percentWidth,
    _percentHeight: area._percentHeight,
  };
}
