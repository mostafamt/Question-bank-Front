/**
 * @file studio.constants.js
 * @description General constants for Studio component
 */

/**
 * Timeout values (in milliseconds)
 */
export const TIMEOUTS = {
  /** Delay for image load recalculation after zoom */
  IMAGE_LOAD_DELAY: 10,

  /** Delay for virtual blocks toggle */
  VIRTUAL_BLOCKS_TOGGLE_DELAY: 20,

  /** Delay for page navigation recalculation */
  PAGE_NAVIGATION_DELAY: 50,
};

/**
 * Local storage keys
 */
export const STORAGE_KEYS = {
  /** Key for storing active page index */
  AUTHOR_PAGE: "author_page",
};

/**
 * Default values
 */
export const DEFAULTS = {
  /** Default active page index */
  ACTIVE_PAGE_INDEX: 0,

  /** Default image scale factor */
  IMAGE_SCALE_FACTOR: 1,

  /** Default coordinate unit */
  COORDINATE_UNIT: "px",

  /** Default color index */
  COLOR_INDEX: 0,
};

/**
 * OCR language codes
 */
export const OCR_LANGUAGES = {
  ENGLISH: "eng",
  ARABIC: "ara",
};

/**
 * Language codes
 */
export const LANGUAGE_CODES = {
  ENGLISH: "en",
  ARABIC: "ar",
};

/**
 * Area status values
 */
export const AREA_STATUS = {
  ACTIVE: "active",
  DELETED: "deleted", // Also defined in utils/ocr.js as DELETED
};

/**
 * Composite block naming
 */
export const COMPOSITE_BLOCK = {
  /** Prefix for auto-generated composite block names */
  NAME_PREFIX: "Composite Block",

  /** Length of UUID slice for block names */
  UUID_SLICE_LENGTH: 8,
};

/**
 * Scroll behavior constants
 */
export const SCROLL = {
  /** Offset percentage for thumbnail scrolling (3% of container height) */
  THUMBNAIL_OFFSET_PERCENT: 0.03,

  /** Offset percentage for sticky toolbar (50% of container height) */
  STICKY_TOOLBAR_OFFSET_PERCENT: 0.5,
};

/**
 * Content type categories
 */
export const CONTENT_TYPE_CATEGORIES = {
  OBJECT: "object",
  TEXT: "text",
};

/**
 * Icon font sizes
 */
export const ICON_SIZES = {
  SMALL: "small",
  MEDIUM: "medium",
  LARGE: "large",
};

/**
 * Coordinate conversion ratios
 */
export const COORDINATE_RATIOS = {
  /** Conversion factor from percentage to pixels */
  PERCENT_TO_PX: 100,
};

export const QUESTION = "Question";
export const ILLUSTRATIVE_OBJECT = "Illustrative object";
