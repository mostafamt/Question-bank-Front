import React from "react";
import { LEFT_TAB_NAMES, RIGHT_TAB_NAMES } from "../constants";

/**
 * @typedef {Object} TabConfig
 * @property {string} id - Tab identifier
 * @property {string} label - Display label
 * @property {string} name - Tab name for matching
 * @property {React.ReactNode} [component] - Tab content component
 */

/**
 * Hook for managing left and right column tab states
 * @param {TabConfig[]} leftColumns - Available left column tabs
 * @param {TabConfig[]} rightColumns - Available right column tabs
 * @returns {Object} Tab state management utilities
 */
const useTabState = (leftColumns = [], rightColumns = []) => {
  // Initialize with first column or fallback
  const [activeLeftTab, setActiveLeftTab] = React.useState(() => {
    if (leftColumns.length > 0) return leftColumns[0];
    return {
      id: "initial",
      label: LEFT_TAB_NAMES.THUMBNAILS.label,
      name: LEFT_TAB_NAMES.THUMBNAILS.name,
      component: null,
    };
  });

  const [activeRightTab, setActiveRightTab] = React.useState(() => {
    if (rightColumns.length > 0) return rightColumns[0];
    return {
      id: "initial",
      label: RIGHT_TAB_NAMES.BLOCK_AUTHORING.label,
      name: RIGHT_TAB_NAMES.BLOCK_AUTHORING.name,
      component: null,
    };
  });

  /**
   * Check if a specific left tab is active by name
   * @param {string} tabName - Tab name to check
   * @returns {boolean} True if the tab is active
   */
  const isLeftTabActive = React.useCallback(
    (tabName) => {
      return activeLeftTab?.name === tabName || activeLeftTab?.label === tabName;
    },
    [activeLeftTab]
  );

  /**
   * Check if a specific right tab is active by name
   * @param {string} tabName - Tab name to check
   * @returns {boolean} True if the tab is active
   */
  const isRightTabActive = React.useCallback(
    (tabName) => {
      return (
        activeRightTab?.name === tabName || activeRightTab?.label === tabName
      );
    },
    [activeRightTab]
  );

  /**
   * Check if Block Authoring tab is active
   * @returns {boolean}
   */
  const isBlockAuthoringActive = React.useMemo(() => {
    return isRightTabActive(RIGHT_TAB_NAMES.BLOCK_AUTHORING.label);
  }, [isRightTabActive]);

  /**
   * Check if Composite Blocks tab is active
   * @returns {boolean}
   */
  const isCompositeBlocksActive = React.useMemo(() => {
    return isRightTabActive(RIGHT_TAB_NAMES.COMPOSITE_BLOCKS.label);
  }, [isRightTabActive]);

  /**
   * Check if Thumbnails tab is active
   * @returns {boolean}
   */
  const isThumbnailsActive = React.useMemo(() => {
    return isLeftTabActive(LEFT_TAB_NAMES.THUMBNAILS.label);
  }, [isLeftTabActive]);

  /**
   * Switch to a specific left tab by name
   * @param {string} tabName - Tab name to activate
   * @returns {boolean} True if tab was found and activated
   */
  const switchToLeftTab = React.useCallback(
    (tabName) => {
      const tab = leftColumns.find(
        (col) => col.name === tabName || col.label === tabName
      );
      if (tab) {
        setActiveLeftTab(tab);
        return true;
      }
      return false;
    },
    [leftColumns]
  );

  /**
   * Switch to a specific right tab by name
   * @param {string} tabName - Tab name to activate
   * @returns {boolean} True if tab was found and activated
   */
  const switchToRightTab = React.useCallback(
    (tabName) => {
      const tab = rightColumns.find(
        (col) => col.name === tabName || col.label === tabName
      );
      if (tab) {
        setActiveRightTab(tab);
        return true;
      }
      return false;
    },
    [rightColumns]
  );

  /**
   * Reset tabs to their default (first) positions
   */
  const resetTabs = React.useCallback(() => {
    if (leftColumns.length > 0) setActiveLeftTab(leftColumns[0]);
    if (rightColumns.length > 0) setActiveRightTab(rightColumns[0]);
  }, [leftColumns, rightColumns]);

  /**
   * Update columns and sync active tabs if needed
   * @param {TabConfig[]} newLeftColumns - New left columns
   * @param {TabConfig[]} newRightColumns - New right columns
   */
  const updateColumns = React.useCallback(
    (newLeftColumns, newRightColumns) => {
      // Sync left tab - keep current if still exists, otherwise reset
      if (newLeftColumns?.length > 0) {
        const currentLeftExists = newLeftColumns.find(
          (col) =>
            col.label === activeLeftTab?.label ||
            col.name === activeLeftTab?.name
        );
        if (!currentLeftExists) {
          setActiveLeftTab(newLeftColumns[0]);
        }
      }

      // Sync right tab - keep current if still exists, otherwise reset
      if (newRightColumns?.length > 0) {
        const currentRightExists = newRightColumns.find(
          (col) =>
            col.label === activeRightTab?.label ||
            col.name === activeRightTab?.name
        );
        if (!currentRightExists) {
          setActiveRightTab(newRightColumns[0]);
        }
      }
    },
    [activeLeftTab, activeRightTab]
  );

  return {
    // State
    activeLeftTab,
    activeRightTab,
    setActiveLeftTab,
    setActiveRightTab,

    // Tab checkers
    isLeftTabActive,
    isRightTabActive,
    isBlockAuthoringActive,
    isCompositeBlocksActive,
    isThumbnailsActive,

    // Actions
    switchToLeftTab,
    switchToRightTab,
    resetTabs,
    updateColumns,
  };
};

export default useTabState;
