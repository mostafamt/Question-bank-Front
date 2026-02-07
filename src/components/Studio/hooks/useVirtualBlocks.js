import React from "react";
import { parseVirtualBlocksFromPages } from "../../../utils/virtual-blocks";
import { TIMEOUTS } from "../constants";
import { CONTENT_TYPE_CATEGORIES } from "../constants";

/**
 * @typedef {Object} VirtualBlock
 * @property {string} id - Unique identifier
 * @property {string} label - Display label
 * @property {string} category - Category ('object' | 'text')
 * @property {string} [icon] - Optional icon name
 */

/**
 * Hook for managing virtual blocks (educational content blocks)
 * @param {Object} params - Hook parameters
 * @param {VirtualBlock[]} params.virtualBlocks - Array of virtual block definitions
 * @param {Function} params.setVirtualBlocks - Setter for virtual blocks
 * @param {Object[]} params.pages - Array of page objects
 * @param {boolean} [params.subObject=false] - Whether in sub-object mode
 * @param {Function} params.recalculateAreas - Function to recalculate areas after toggle
 * @returns {Object} Virtual blocks state and utilities
 */
const useVirtualBlocks = ({
  virtualBlocks,
  setVirtualBlocks,
  pages,
  subObject = false,
  recalculateAreas,
}) => {
  const [showVB, setShowVB] = React.useState(false);

  /**
   * Toggle virtual blocks visibility
   * Triggers area recalculation after toggle
   */
  const toggleVirtualBlocks = React.useCallback(() => {
    setShowVB((prevState) => !prevState);
    setTimeout(() => {
      recalculateAreas?.();
    }, TIMEOUTS.VIRTUAL_BLOCKS_TOGGLE_DELAY);
  }, [recalculateAreas]);

  /**
   * @deprecated Use toggleVirtualBlocks instead (typo fix)
   */
  const onClickToggleVirutalBlocks = toggleVirtualBlocks;

  /**
   * Find a virtual block by its ID
   * @param {string} blockId - The block ID to search for
   * @returns {VirtualBlock|null} The found block or null
   */
  const getVirtualBlockById = React.useCallback(
    (blockId) => {
      if (!virtualBlocks || !Array.isArray(virtualBlocks)) return null;

      // Handle flat array
      if (virtualBlocks.length > 0 && !Array.isArray(virtualBlocks[0])) {
        return virtualBlocks.find((block) => block?.id === blockId) || null;
      }

      // Handle nested array (per-page)
      for (const pageBlocks of virtualBlocks) {
        if (Array.isArray(pageBlocks)) {
          const found = pageBlocks.find((block) => block?.id === blockId);
          if (found) return found;
        }
      }
      return null;
    },
    [virtualBlocks]
  );

  /**
   * Get virtual blocks filtered by category type
   * @param {'object'|'text'} type - Category type to filter by
   * @param {number} [pageIndex] - Optional page index for nested structure
   * @returns {VirtualBlock[]} Filtered virtual blocks
   */
  const getVirtualBlocksByType = React.useCallback(
    (type, pageIndex = null) => {
      if (!virtualBlocks || !Array.isArray(virtualBlocks)) return [];

      // Handle flat array
      if (virtualBlocks.length > 0 && !Array.isArray(virtualBlocks[0])) {
        return virtualBlocks.filter((block) => block?.category === type);
      }

      // Handle nested array (per-page)
      if (pageIndex !== null && virtualBlocks[pageIndex]) {
        return virtualBlocks[pageIndex].filter(
          (block) => block?.category === type
        );
      }

      // Return all matching blocks from all pages
      return virtualBlocks.flat().filter((block) => block?.category === type);
    },
    [virtualBlocks]
  );

  /**
   * Check if a specific virtual block is currently active/visible
   * @param {string} blockId - The block ID to check
   * @returns {boolean} True if the block is active
   */
  const isVirtualBlockActive = React.useCallback(
    (blockId) => {
      if (!showVB) return false;
      const block = getVirtualBlockById(blockId);
      return block !== null;
    },
    [showVB, getVirtualBlockById]
  );

  /**
   * Get virtual blocks for objects (interactive content)
   * @param {number} [pageIndex] - Optional page index
   * @returns {VirtualBlock[]} Object-type virtual blocks
   */
  const getObjectBlocks = React.useCallback(
    (pageIndex = null) => {
      return getVirtualBlocksByType(CONTENT_TYPE_CATEGORIES.OBJECT, pageIndex);
    },
    [getVirtualBlocksByType]
  );

  /**
   * Get virtual blocks for text content
   * @param {number} [pageIndex] - Optional page index
   * @returns {VirtualBlock[]} Text-type virtual blocks
   */
  const getTextBlocks = React.useCallback(
    (pageIndex = null) => {
      return getVirtualBlocksByType(CONTENT_TYPE_CATEGORIES.TEXT, pageIndex);
    },
    [getVirtualBlocksByType]
  );

  /**
   * Update a specific virtual block for a page
   * @param {number} pageIndex - Page index
   * @param {VirtualBlock} updatedBlock - Updated block data
   */
  const updateVirtualBlock = React.useCallback(
    (pageIndex, updatedBlock) => {
      if (!setVirtualBlocks) return;

      setVirtualBlocks((prevState) => {
        const newState = [...prevState];
        if (Array.isArray(newState[pageIndex])) {
          const blockIndex = newState[pageIndex].findIndex(
            (b) => b?.id === updatedBlock.id
          );
          if (blockIndex !== -1) {
            newState[pageIndex] = [...newState[pageIndex]];
            newState[pageIndex][blockIndex] = updatedBlock;
          }
        }
        return newState;
      });
    },
    [setVirtualBlocks]
  );

  return {
    // State
    showVB,
    setShowVB,
    virtualBlocks,
    setVirtualBlocks,

    // Actions
    toggleVirtualBlocks,
    onClickToggleVirutalBlocks, // Deprecated alias for backward compatibility

    // Utilities
    getVirtualBlockById,
    getVirtualBlocksByType,
    isVirtualBlockActive,
    getObjectBlocks,
    getTextBlocks,
    updateVirtualBlock,
  };
};

export default useVirtualBlocks;
