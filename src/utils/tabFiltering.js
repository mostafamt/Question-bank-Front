/**
 * Tab Filtering Utilities
 *
 * Provides utilities for filtering and managing tabs based on Reader vs Studio mode.
 * Mode is detected from the URL - if '/read/' is in the path, it's reader mode.
 *
 * @module tabFiltering
 */

import tabsConfig from "../config/tabs.config.json";
import { useLocation } from "react-router-dom";

/**
 * Detect app mode from current URL
 *
 * @returns {'reader' | 'studio'} - The detected mode
 *
 * @example
 * // URL: /read/book/123/chapter/456
 * detectModeFromUrl(); // Returns 'reader'
 *
 * @example
 * // URL: /book/123/chapter/456
 * detectModeFromUrl(); // Returns 'studio'
 */
export const detectModeFromUrl = () => {
  const pathname = window.location.pathname;
  return pathname.includes("/read/") ? "reader" : "studio";
};

/**
 * React hook to get current app mode from URL
 * Uses react-router-dom's useLocation for reactive updates
 *
 * @returns {'reader' | 'studio'} - The current mode
 *
 * @example
 * const MyComponent = () => {
 *   const mode = useAppMode();
 *   const isReaderMode = mode === 'reader';
 *
 *   return <div>Current mode: {mode}</div>;
 * };
 */
export const useAppMode = () => {
  const location = useLocation();
  return location.pathname.includes("/read/") ? "reader" : "studio";
};

/**
 * Filter tabs by mode and enabled status
 *
 * @param {Array} tabs - Array of tab configuration objects
 * @param {'reader' | 'studio'} mode - Current app mode
 * @returns {Array} Filtered and sorted tabs
 *
 * @example
 * const tabs = [
 *   { id: 'tab1', modes: ['reader', 'studio'], enabled: true, order: 1 },
 *   { id: 'tab2', modes: ['studio'], enabled: true, order: 2 },
 *   { id: 'tab3', modes: ['reader'], enabled: false, order: 3 },
 * ];
 *
 * filterTabsByMode(tabs, 'reader');
 * // Returns: [{ id: 'tab1', ... }]
 * // tab2 excluded (studio only), tab3 excluded (disabled)
 */
export const filterTabsByMode = (tabs, mode) => {
  return tabs
    .filter((tab) => {
      // Must be enabled
      if (!tab.enabled) return false;

      // Must include current mode
      if (!tab.modes.includes(mode)) return false;

      return true;
    })
    .sort((a, b) => a.order - b.order); // Sort by order
};

/**
 * Get tabs for a specific sidebar in a specific mode
 *
 * @param {'left' | 'right'} position - Sidebar position
 * @param {'reader' | 'studio'} mode - Current app mode
 * @returns {Array} Filtered and sorted tabs for the sidebar
 *
 * @example
 * // Get left sidebar tabs for reader mode
 * const leftTabs = getTabsForSidebar('left', 'reader');
 * // Returns: [Thumbnails, Recalls, Micro Learning, Enriching Content]
 *
 * @example
 * // Get right sidebar tabs for studio mode
 * const rightTabs = getTabsForSidebar('right', 'studio');
 * // Returns: [TOC, Glossary, Illustrative, Block Authoring, Composite Blocks]
 */
export const getTabsForSidebar = (position, mode) => {
  const tabs = tabsConfig.tabs[position] || [];
  return filterTabsByMode(tabs, mode);
};

/**
 * Get the full tabs configuration object
 *
 * @returns {Object} Complete tabs configuration from JSON
 *
 * @example
 * const config = getTabsConfig();
 * console.log(config.version); // "1.0.0"
 * console.log(config.tabs.left.length); // Number of left tabs
 */
export const getTabsConfig = () => {
  return tabsConfig;
};

/**
 * Get a specific tab configuration by ID
 *
 * @param {string} tabId - The tab ID to find
 * @returns {Object|null} Tab configuration or null if not found
 *
 * @example
 * const tab = getTabById('thumbnails');
 * console.log(tab.label); // "Thumbnails"
 * console.log(tab.modes); // ["reader", "studio"]
 */
export const getTabById = (tabId) => {
  const allTabs = [
    ...(tabsConfig.tabs.left || []),
    ...(tabsConfig.tabs.right || []),
  ];

  return allTabs.find((tab) => tab.id === tabId) || null;
};

/**
 * Check if a tab should be visible in current mode
 *
 * @param {string} tabId - The tab ID to check
 * @param {'reader' | 'studio'} mode - Current app mode
 * @returns {boolean} True if tab should be visible
 *
 * @example
 * isTabVisibleInMode('block-authoring', 'reader'); // false
 * isTabVisibleInMode('block-authoring', 'studio'); // true
 * isTabVisibleInMode('thumbnails', 'reader'); // true
 * isTabVisibleInMode('thumbnails', 'studio'); // true
 */
export const isTabVisibleInMode = (tabId, mode) => {
  const tab = getTabById(tabId);
  if (!tab) return false;

  return tab.enabled && tab.modes.includes(mode);
};

/**
 * Get count of visible tabs for each sidebar in a mode
 *
 * @param {'reader' | 'studio'} mode - Current app mode
 * @returns {Object} Object with left and right tab counts
 *
 * @example
 * const counts = getTabCounts('reader');
 * console.log(counts); // { left: 4, right: 4, total: 8 }
 *
 * const counts = getTabCounts('studio');
 * console.log(counts); // { left: 5, right: 5, total: 10 }
 */
export const getTabCounts = (mode) => {
  const leftTabs = getTabsForSidebar("left", mode);
  const rightTabs = getTabsForSidebar("right", mode);

  return {
    left: leftTabs.length,
    right: rightTabs.length,
    total: leftTabs.length + rightTabs.length,
  };
};

/**
 * Get all tab IDs for a specific mode
 *
 * @param {'reader' | 'studio'} mode - Current app mode
 * @returns {Object} Object with left and right tab ID arrays
 *
 * @example
 * const tabIds = getTabIds('reader');
 * console.log(tabIds.left);
 * // ['thumbnails', 'recalls', 'micro-learning', 'enriching-content']
 * console.log(tabIds.right);
 * // ['table-of-contents', 'glossary-keywords', 'illustrative-interactions', 'check-yourself-right']
 */
export const getTabIds = (mode) => {
  const leftTabs = getTabsForSidebar("left", mode);
  const rightTabs = getTabsForSidebar("right", mode);

  return {
    left: leftTabs.map((tab) => tab.id),
    right: rightTabs.map((tab) => tab.id),
  };
};

/**
 * Validate tab configuration
 * Useful for development/testing to ensure config is valid
 *
 * @returns {Object} Validation result with isValid and errors array
 *
 * @example
 * const validation = validateTabConfig();
 * if (!validation.isValid) {
 *   console.error('Tab config errors:', validation.errors);
 * }
 */
export const validateTabConfig = () => {
  const errors = [];
  const allTabs = [
    ...(tabsConfig.tabs.left || []),
    ...(tabsConfig.tabs.right || []),
  ];

  // Check for duplicate IDs
  const ids = allTabs.map((tab) => tab.id);
  const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
  if (duplicateIds.length > 0) {
    errors.push(`Duplicate tab IDs found: ${duplicateIds.join(", ")}`);
  }

  // Check required fields
  allTabs.forEach((tab) => {
    if (!tab.id) errors.push("Tab missing required field: id");
    if (!tab.label) errors.push(`Tab ${tab.id} missing required field: label`);
    if (!tab.modes || !Array.isArray(tab.modes)) {
      errors.push(`Tab ${tab.id} missing or invalid field: modes`);
    }
    if (!tab.position)
      errors.push(`Tab ${tab.id} missing required field: position`);
    if (tab.order === undefined)
      errors.push(`Tab ${tab.id} missing required field: order`);
    if (!tab.component)
      errors.push(`Tab ${tab.id} missing required field: component`);
  });

  // Check valid mode values
  allTabs.forEach((tab) => {
    if (tab.modes) {
      const invalidModes = tab.modes.filter(
        (mode) => !["reader", "studio"].includes(mode)
      );
      if (invalidModes.length > 0) {
        errors.push(
          `Tab ${tab.id} has invalid modes: ${invalidModes.join(", ")}`
        );
      }
    }
  });

  // Check valid position values
  allTabs.forEach((tab) => {
    if (tab.position && !["left", "right"].includes(tab.position)) {
      errors.push(`Tab ${tab.id} has invalid position: ${tab.position}`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Development mode validation
if (process.env.NODE_ENV === "development") {
  const validation = validateTabConfig();
  if (!validation.isValid) {
    console.warn("⚠️ Tab configuration validation errors:", validation.errors);
  } else {
    console.log("✅ Tab configuration is valid");
  }
}
