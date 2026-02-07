import React from "react";

/**
 * @typedef {'hand'|''} HighlightMode
 * @description The current highlight/interaction mode
 * - '' (empty): Normal mode, areas are editable
 * - 'hand': Hand tool mode, areas are clickable but not editable
 */

/**
 * Hook for managing studio actions like highlighting and block selection
 * @param {Object} params - Hook parameters
 * @param {Function} params.getBlockFromBlockId - Function to find a block by its ID
 * @returns {Object} Studio actions state and utilities
 */
const useStudioActions = ({ getBlockFromBlockId }) => {
  /** @type {[HighlightMode, Function]} */
  const [highlight, setHighlight] = React.useState("");

  /** @type {[string|null, Function]} */
  const [highlightedBlockId, setHighlightedBlockId] = React.useState(null);

  /**
   * Highlight a specific block by ID
   * @param {string} id - Block ID to highlight
   * @returns {boolean} True if block was found and highlighted
   */
  const highlightBlock = React.useCallback(
    (id) => {
      if (!id) {
        setHighlightedBlockId(null);
        return false;
      }

      // Find the block to verify it exists
      const block = getBlockFromBlockId?.(id);
      if (!block) {
        console.warn(`Block with ID "${id}" not found`);
        return false;
      }

      setHighlightedBlockId(id);
      return true;
    },
    [getBlockFromBlockId]
  );

  /**
   * @deprecated Use highlightBlock instead (typo fix)
   */
  const hightBlock = highlightBlock;

  /**
   * Clear the current highlight
   */
  const clearHighlight = React.useCallback(() => {
    setHighlightedBlockId(null);
  }, []);

  /**
   * Check if a specific block is currently highlighted
   * @param {string} blockId - Block ID to check
   * @returns {boolean} True if the block is highlighted
   */
  const isBlockHighlighted = React.useCallback(
    (blockId) => {
      return highlightedBlockId === blockId;
    },
    [highlightedBlockId]
  );

  /**
   * Toggle highlight mode between '' and 'hand'
   * @returns {HighlightMode} The new highlight mode
   */
  const toggleHighlightMode = React.useCallback(() => {
    setHighlight((prevMode) => {
      const newMode = prevMode === "hand" ? "" : "hand";
      return newMode;
    });
  }, []);

  /**
   * Set highlight mode to 'hand' (for block interaction)
   */
  const enableHandMode = React.useCallback(() => {
    setHighlight("hand");
  }, []);

  /**
   * Set highlight mode to '' (for area editing)
   */
  const disableHandMode = React.useCallback(() => {
    setHighlight("");
  }, []);

  /**
   * Check if currently in hand mode
   * @returns {boolean} True if in hand mode
   */
  const isHandMode = React.useMemo(() => {
    return highlight === "hand";
  }, [highlight]);

  return {
    // State
    highlight,
    setHighlight,
    highlightedBlockId,

    // Actions
    highlightBlock,
    hightBlock, // Deprecated alias for backward compatibility
    clearHighlight,
    toggleHighlightMode,
    enableHandMode,
    disableHandMode,

    // Utilities
    isBlockHighlighted,
    isHandMode,
  };
};

export default useStudioActions;
