/**
 * @file studio.types.js
 * @description Type definitions for Studio component data structures
 */

/**
 * Coordinate unit types
 * @typedef {'px' | 'percentage'} CoordinateUnit
 */

/**
 * Area status types
 * @typedef {'active' | 'deleted'} AreaStatus
 */

/**
 * Represents a selectable area on a page
 * @typedef {Object} Area
 * @property {number} x - X coordinate
 * @property {number} y - Y coordinate
 * @property {number} width - Width of the area
 * @property {number} height - Height of the area
 * @property {CoordinateUnit} unit - Coordinate unit (px or percentage)
 * @property {boolean} isChanging - Whether area is being modified
 * @property {boolean} isNew - Whether area is newly created
 * @property {CoordinateUnit} _unit - Original unit before conversion
 * @property {boolean} _updated - Whether area has been updated after conversion
 * @property {number} [_percentX] - Original X coordinate in percentage
 * @property {number} [_percentY] - Original Y coordinate in percentage
 * @property {number} [_percentWidth] - Original width in percentage
 * @property {number} [_percentHeight] - Original height in percentage
 */

/**
 * Represents properties/metadata for an area
 * @typedef {Object} AreaProperty
 * @property {number} x - X coordinate in percentage
 * @property {number} y - Y coordinate in percentage
 * @property {number} width - Width in percentage
 * @property {number} height - Height in percentage
 * @property {string} id - Unique identifier (UUID)
 * @property {string} color - Highlight color for the area
 * @property {boolean} loading - Whether area is processing (OCR, etc.)
 * @property {string} text - Extracted or entered text content
 * @property {string} image - Image data URL or path
 * @property {string} type - Content type name (e.g., "Question", "Illustrative object")
 * @property {string} parameter - Additional parameter data
 * @property {string} label - Content label/key
 * @property {string} typeOfLabel - Data type (e.g., "text", "image", "object")
 * @property {number} order - Display order in the list
 * @property {boolean} open - Whether area is expanded in UI
 * @property {string | boolean} isServer - Whether area exists on server ("true" for yes)
 * @property {string} [blockId] - Block ID if saved to server
 * @property {AreaStatus} [status] - Area status (e.g., "deleted")
 */

/**
 * Virtual block for educational content
 * @typedef {Object} VirtualBlock
 * @property {string} id - Unique identifier
 * @property {string} label - Display label
 * @property {string} category - Category type ("object" or "text")
 * @property {string} icon - Icon identifier
 * @property {number} x - X coordinate in percentage
 * @property {number} y - Y coordinate in percentage
 * @property {number} width - Width in percentage
 * @property {number} height - Height in percentage
 */

/**
 * Composite block area
 * @typedef {Object} CompositeBlockArea
 * @property {string} id - Unique identifier
 * @property {number} x - X coordinate in percentage
 * @property {number} y - Y coordinate in percentage
 * @property {number} width - Width in percentage
 * @property {number} height - Height in percentage
 * @property {string} type - Block type
 * @property {string} text - objectId (contentValue) sent to server as contentValue
 * @property {string} [blockId] - Page-level block ID used for modal visual tracking
 * @property {string} unit - Coordinate unit ("%" or "px")
 * @property {string} color - Highlight color
 * @property {boolean} [loading] - Whether processing
 * @property {boolean} [open] - Whether expanded in UI
 * @property {string} [img] - Image data URL
 */

/**
 * Composite block configuration
 * @typedef {Object} CompositeBlock
 * @property {string} name - Block name
 * @property {string} type - Block type
 * @property {CompositeBlockArea[]} areas - Areas within the composite block
 */

/**
 * Page data structure
 * @typedef {Object} Page
 * @property {string} _id - Page ID
 * @property {string} url - Image URL
 * @property {Block[]} [blocks] - Existing blocks on the page
 */

/**
 * Block data from server
 * @typedef {Object} Block
 * @property {string} blockId - Block identifier
 * @property {string} contentType - Type of content
 * @property {string} contentValue - Content value (text, URL, etc.)
 * @property {Coordinates} coordinates - Block coordinates
 */

/**
 * Coordinate data
 * @typedef {Object} Coordinates
 * @property {number} x - X coordinate
 * @property {number} y - Y coordinate
 * @property {number} width - Width
 * @property {number} height - Height
 * @property {CoordinateUnit} unit - Unit type
 */

/**
 * Tab configuration
 * @typedef {Object} TabConfig
 * @property {string} id - Unique identifier
 * @property {string} label - Display label
 * @property {React.ReactNode} component - React component to render
 */

/**
 * OCR language options
 * @typedef {'eng' | 'ara'} OCRLanguage
 */

/**
 * Studio component props
 * @typedef {Object} StudioProps
 * @property {Page[]} pages - Array of pages to edit
 * @property {string} type - Object type being edited
 * @property {boolean} [subObject] - Whether editing a sub-object
 * @property {Function} handleClose - Close handler
 * @property {Array} types - Available content types
 * @property {Function} handleSubmit - Submit handler
 * @property {string} language - Language code ("en" or "ar")
 * @property {string} [typeOfActiveType] - Type of active type for sub-objects
 * @property {Function} [onSubmitAutoGenerate] - Auto-generate submit handler
 * @property {boolean} [loadingAutoGenerate] - Auto-generate loading state
 * @property {Function} [refetch] - Refetch data function
 * @property {Object} [compositeBlocksTypes] - Composite block type definitions
 */

/**
 * Image dimensions
 * @typedef {Object} ImageDimensions
 * @property {number} clientWidth - Rendered width in pixels
 * @property {number} clientHeight - Rendered height in pixels
 * @property {number} naturalWidth - Original image width
 * @property {number} naturalHeight - Original image height
 */

/**
 * Ref object for image element
 * @typedef {Object} ImageRef
 * @property {HTMLImageElement} current - Image element reference
 */

/**
 * Highlight mode
 * @typedef {'' | 'hand'} HighlightMode
 */

export {};
