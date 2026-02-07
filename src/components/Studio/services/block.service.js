/**
 * @file block.service.js
 * @description Block management service for Studio component
 * Handles block search, validation, transformation, and manipulation
 */

import { v4 as uuidv4 } from "uuid";
import { DELETED, CREATED, UPDATED } from "../../../utils/ocr";

/**
 * @typedef {Object} Block
 * @property {string} id - Unique block identifier
 * @property {string} [blockId] - Server-assigned block ID
 * @property {string} type - Block type
 * @property {string} label - Block label
 * @property {string} text - Block text content
 * @property {string} [image] - Block image content
 * @property {Object} coordinates - Block coordinates
 * @property {string} status - Block status (new, updated, deleted)
 */

/**
 * @typedef {Object} SearchResult
 * @property {Block|null} block - Found block or null
 * @property {number} pageIndex - Page index where block was found (-1 if not found)
 * @property {number} areaIndex - Area index within page (-1 if not found)
 */

/**
 * Block status constants
 */
export const BLOCK_STATUS = {
  DELETED,
  CREATED,
  UPDATED,
};

/**
 * Find a block by its ID across all pages
 * @param {Object[][]} areasProperties - Areas properties for all pages
 * @param {string} blockId - Block ID to search for
 * @returns {SearchResult} Search result with block and indices
 */
export function findBlockById(areasProperties, blockId) {
  if (!blockId || !areasProperties || !Array.isArray(areasProperties)) {
    return { block: null, pageIndex: -1, areaIndex: -1 };
  }

  for (let pageIndex = 0; pageIndex < areasProperties.length; pageIndex++) {
    const pageBlocks = areasProperties[pageIndex];
    if (!Array.isArray(pageBlocks)) continue;

    const areaIndex = pageBlocks.findIndex(
      (block) => block?.id === blockId || block?.blockId === blockId
    );

    if (areaIndex !== -1) {
      return {
        block: { ...pageBlocks[areaIndex], pageIndex, type: "area" },
        pageIndex,
        areaIndex,
      };
    }
  }

  return { block: null, pageIndex: -1, areaIndex: -1 };
}

/**
 * Find all blocks of a specific type
 * @param {Object[][]} areasProperties - Areas properties for all pages
 * @param {string} type - Block type to filter by
 * @returns {Block[]} Array of matching blocks
 */
export function findBlocksByType(areasProperties, type) {
  if (!areasProperties || !Array.isArray(areasProperties)) {
    return [];
  }

  const results = [];

  areasProperties.forEach((pageBlocks, pageIndex) => {
    if (!Array.isArray(pageBlocks)) return;

    pageBlocks.forEach((block, areaIndex) => {
      if (block?.type === type) {
        results.push({ ...block, pageIndex, areaIndex });
      }
    });
  });

  return results;
}

/**
 * Find all blocks on a specific page
 * @param {Object[][]} areasProperties - Areas properties for all pages
 * @param {number} pageIndex - Page index
 * @returns {Block[]} Array of blocks on the page
 */
export function findBlocksByPage(areasProperties, pageIndex) {
  if (
    !areasProperties ||
    !Array.isArray(areasProperties) ||
    !areasProperties[pageIndex]
  ) {
    return [];
  }

  return areasProperties[pageIndex].map((block, areaIndex) => ({
    ...block,
    pageIndex,
    areaIndex,
  }));
}

/**
 * Find blocks that are not deleted
 * @param {Object[][]} areasProperties - Areas properties
 * @param {number} [pageIndex] - Optional page index to filter
 * @returns {Block[]} Active blocks
 */
export function findActiveBlocks(areasProperties, pageIndex = null) {
  if (!areasProperties || !Array.isArray(areasProperties)) {
    return [];
  }

  const results = [];

  areasProperties.forEach((pageBlocks, pIndex) => {
    if (pageIndex !== null && pIndex !== pageIndex) return;
    if (!Array.isArray(pageBlocks)) return;

    pageBlocks.forEach((block, areaIndex) => {
      if (block?.status !== DELETED) {
        results.push({ ...block, pageIndex: pIndex, areaIndex });
      }
    });
  });

  return results;
}

/**
 * Validate block data for submission
 * @param {Block} block - Block to validate
 * @returns {{ isValid: boolean, errors: string[] }} Validation result
 */
export function validateBlock(block) {
  const errors = [];

  if (!block) {
    return { isValid: false, errors: ["Block is null or undefined"] };
  }

  if (!block.id) {
    errors.push("Block ID is required");
  }

  if (!block.type && block.status !== DELETED) {
    errors.push("Block type is required for non-deleted blocks");
  }

  if (block.x === undefined || block.y === undefined) {
    errors.push("Block coordinates are required");
  }

  if (block.width === undefined || block.height === undefined) {
    errors.push("Block dimensions are required");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Transform block data for server submission
 * @param {Object} areaProperty - Area property object
 * @param {Object} area - Area coordinates
 * @returns {Object} Server-ready block data
 */
export function transformBlockForSubmit(areaProperty, area) {
  return {
    blockId: areaProperty.blockId || areaProperty.id,
    contentType: areaProperty.label,
    contentValue: areaProperty.text || areaProperty.image || "",
    coordinates: {
      x: area?.x ?? areaProperty.x,
      y: area?.y ?? areaProperty.y,
      width: area?.width ?? areaProperty.width,
      height: area?.height ?? areaProperty.height,
      unit: area?.unit || "percentage",
    },
    status: areaProperty.status || CREATED,
  };
}

/**
 * Transform server block data to client format
 * @param {Object} serverBlock - Block data from server
 * @param {number} index - Block index
 * @param {string} color - Block color
 * @returns {Object} Client-formatted block
 */
export function transformBlockFromServer(serverBlock, index, color) {
  return {
    id: uuidv4(),
    blockId: serverBlock.blockId,
    x: serverBlock.coordinates?.x,
    y: serverBlock.coordinates?.y,
    width: serverBlock.coordinates?.width,
    height: serverBlock.coordinates?.height,
    color,
    loading: false,
    text: serverBlock.contentValue,
    image: serverBlock.contentValue,
    type: "", // Will be resolved by type lookup
    parameter: "",
    label: serverBlock.contentType,
    typeOfLabel: "", // Will be resolved by type lookup
    order: index,
    open: false,
    isServer: true,
    status: UPDATED,
  };
}

/**
 * Create a new block with default properties
 * @param {Object} params - Block parameters
 * @param {number} params.x - X coordinate (percentage)
 * @param {number} params.y - Y coordinate (percentage)
 * @param {number} params.width - Width (percentage)
 * @param {number} params.height - Height (percentage)
 * @param {string} params.color - Block color
 * @param {string} [params.type] - Block type
 * @returns {Object} New block object
 */
export function createBlock({ x, y, width, height, color, type = "" }) {
  return {
    id: uuidv4(),
    x,
    y,
    width,
    height,
    color,
    loading: false,
    text: "",
    image: "",
    type,
    parameter: "",
    label: "",
    typeOfLabel: "",
    order: 0,
    open: true,
    isServer: false,
    status: CREATED,
  };
}

/**
 * Update a block's property immutably
 * @param {Object[][]} areasProperties - All areas properties
 * @param {number} pageIndex - Page index
 * @param {number} areaIndex - Area index
 * @param {Object} updates - Properties to update
 * @returns {Object[][]} New areas properties array
 */
export function updateBlockProperty(
  areasProperties,
  pageIndex,
  areaIndex,
  updates
) {
  const newAreasProperties = [...areasProperties];
  newAreasProperties[pageIndex] = [...newAreasProperties[pageIndex]];
  newAreasProperties[pageIndex][areaIndex] = {
    ...newAreasProperties[pageIndex][areaIndex],
    ...updates,
  };
  return newAreasProperties;
}

/**
 * Mark a block as deleted
 * @param {Object[][]} areasProperties - All areas properties
 * @param {number} pageIndex - Page index
 * @param {number} areaIndex - Area index
 * @returns {Object[][]} Updated areas properties
 */
export function markBlockAsDeleted(areasProperties, pageIndex, areaIndex) {
  return updateBlockProperty(areasProperties, pageIndex, areaIndex, {
    status: DELETED,
  });
}

/**
 * Remove a block completely (for non-server blocks)
 * @param {Object[][]} areasProperties - All areas properties
 * @param {number} pageIndex - Page index
 * @param {number} areaIndex - Area index
 * @returns {Object[][]} Updated areas properties with block removed
 */
export function removeBlock(areasProperties, pageIndex, areaIndex) {
  const newAreasProperties = [...areasProperties];
  newAreasProperties[pageIndex] = [
    ...newAreasProperties[pageIndex].slice(0, areaIndex),
    ...newAreasProperties[pageIndex].slice(areaIndex + 1),
  ];
  return newAreasProperties;
}

/**
 * Get blocks that need to be submitted (created, updated, or deleted)
 * @param {Object[][]} areasProperties - All areas properties
 * @param {number} pageIndex - Page index
 * @returns {Object[]} Blocks that need submission
 */
export function getBlocksForSubmission(areasProperties, pageIndex) {
  if (!areasProperties?.[pageIndex]) {
    return [];
  }

  return areasProperties[pageIndex].filter(
    (block) =>
      block.status === CREATED ||
      block.status === UPDATED ||
      block.status === DELETED
  );
}

/**
 * Count blocks by status
 * @param {Object[][]} areasProperties - All areas properties
 * @param {number} [pageIndex] - Optional page index
 * @returns {Object} Count of blocks by status
 */
export function countBlocksByStatus(areasProperties, pageIndex = null) {
  const counts = {
    [CREATED]: 0,
    [UPDATED]: 0,
    [DELETED]: 0,
    total: 0,
    active: 0,
  };

  if (!areasProperties || !Array.isArray(areasProperties)) {
    return counts;
  }

  areasProperties.forEach((pageBlocks, pIndex) => {
    if (pageIndex !== null && pIndex !== pageIndex) return;
    if (!Array.isArray(pageBlocks)) return;

    pageBlocks.forEach((block) => {
      counts.total++;
      if (block?.status) {
        counts[block.status] = (counts[block.status] || 0) + 1;
      }
      if (block?.status !== DELETED) {
        counts.active++;
      }
    });
  });

  return counts;
}

export default {
  BLOCK_STATUS,
  findBlockById,
  findBlocksByType,
  findBlocksByPage,
  findActiveBlocks,
  validateBlock,
  transformBlockForSubmit,
  transformBlockFromServer,
  createBlock,
  updateBlockProperty,
  markBlockAsDeleted,
  removeBlock,
  getBlocksForSubmission,
  countBlocksByStatus,
};
