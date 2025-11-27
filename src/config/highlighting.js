/**
 * Block Highlighting Configuration
 *
 * Centralized configuration for block highlighting in the Book reader.
 * Adjust these values to customize the highlighting behavior and appearance.
 */

export const HIGHLIGHT_CONFIG = {
  // ==================== Timing Settings ====================

  /**
   * How long to show highlight before auto-clearing (milliseconds)
   * @default 5000 (5 seconds)
   * @range 3000-10000ms recommended
   */
  AUTO_CLEAR_TIMEOUT: 5000,

  /**
   * Delay before highlighting after page navigation (milliseconds)
   * This allows the page transition to complete before highlighting
   * @default 300
   * @range 100-500ms recommended
   */
  NAVIGATION_DELAY: 300,

  /**
   * Whether to automatically clear highlight after timeout
   * Set to false for persistent highlighting
   * @default true
   */
  ENABLE_AUTO_CLEAR: true,

  // ==================== Visual Settings ====================

  /**
   * Highlight styles applied to the highlighted block
   * These styles create a prominent visual indicator
   */
  STYLES: {
    border: "4px solid #FF6B00",
    backgroundColor: "rgba(255, 107, 0, 0.2)",
    boxShadow: "0 0 15px rgba(255, 107, 0, 0.5)",
    zIndex: 1000,
    transition: "all 0.3s ease-in-out",
  },

  // ==================== Alternative Color Schemes ====================

  /**
   * Predefined color schemes for different highlighting styles
   * Uncomment and use in STYLES above to change appearance
   */
  COLOR_SCHEMES: {
    ORANGE: {
      border: "4px solid #FF6B00",
      backgroundColor: "rgba(255, 107, 0, 0.2)",
      boxShadow: "0 0 15px rgba(255, 107, 0, 0.5)",
    },
    BLUE: {
      border: "4px solid #2196F3",
      backgroundColor: "rgba(33, 150, 243, 0.2)",
      boxShadow: "0 0 15px rgba(33, 150, 243, 0.5)",
    },
    GREEN: {
      border: "4px solid #4CAF50",
      backgroundColor: "rgba(76, 175, 80, 0.2)",
      boxShadow: "0 0 15px rgba(76, 175, 80, 0.5)",
    },
    PURPLE: {
      border: "4px solid #9C27B0",
      backgroundColor: "rgba(156, 39, 176, 0.2)",
      boxShadow: "0 0 15px rgba(156, 39, 176, 0.5)",
    },
    RED: {
      border: "4px solid #F44336",
      backgroundColor: "rgba(244, 67, 54, 0.2)",
      boxShadow: "0 0 15px rgba(244, 67, 54, 0.5)",
    },
  },

  // ==================== Feature Flags ====================

  /**
   * Whether to scroll to highlighted block automatically
   * @default false (not yet implemented)
   */
  ENABLE_AUTO_SCROLL: false,

  /**
   * Whether to show debug console logs
   * @default true (helpful for development)
   */
  ENABLE_DEBUG_LOGS: true,
};

/**
 * Helper function to get highlight styles
 * @returns {Object} Styles object for highlighted blocks
 */
export const getHighlightStyles = () => {
  return HIGHLIGHT_CONFIG.STYLES;
};

/**
 * Helper function to get auto-clear timeout
 * @returns {number} Timeout in milliseconds
 */
export const getAutoClearTimeout = () => {
  return HIGHLIGHT_CONFIG.ENABLE_AUTO_CLEAR
    ? HIGHLIGHT_CONFIG.AUTO_CLEAR_TIMEOUT
    : null;
};

/**
 * Helper function to get navigation delay
 * @returns {number} Delay in milliseconds
 */
export const getNavigationDelay = () => {
  return HIGHLIGHT_CONFIG.NAVIGATION_DELAY;
};

/**
 * Helper function to check if debug logs are enabled
 * @returns {boolean} True if debug logs should be shown
 */
export const isDebugEnabled = () => {
  return HIGHLIGHT_CONFIG.ENABLE_DEBUG_LOGS;
};
