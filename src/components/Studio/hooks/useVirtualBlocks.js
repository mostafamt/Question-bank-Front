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
