/**
 * @file usePageManagement.js
 * @description Hook for managing page navigation and active page state
 */

import { useState } from "react";
import { STORAGE_KEYS, DEFAULTS } from "../constants";

/**
 * Custom hook for page management
 * @param {Page[]} pages - Array of pages
 * @param {boolean} subObject - Whether editing a sub-object
 * @returns {Object} - Page management state and handlers
 */
export const usePageManagement = (pages, subObject) => {
  const [activePageIndex, setActivePageIndex] = useState(() => {
    if (subObject) {
      return DEFAULTS.ACTIVE_PAGE_INDEX;
    }
    const saved = localStorage.getItem(STORAGE_KEYS.AUTHOR_PAGE);
    return saved ? Number.parseInt(saved) : DEFAULTS.ACTIVE_PAGE_INDEX;
  });

  const [showStickyToolbar, setShowStickyToolbar] = useState(false);

  // Derived state
  const activePageId = pages?.[activePageIndex]?._id;

  /**
   * Navigate to a specific page by index
   * @param {number} index - Page index
   */
  const navigateToPage = (index) => {
    if (index < 0 || index >= pages.length) {
      console.warn(`Invalid page index: ${index}`);
      return;
    }

    setActivePageIndex(index);

    // Save to localStorage (unless sub-object)
    if (!subObject) {
      localStorage.setItem(STORAGE_KEYS.AUTHOR_PAGE, `${index}`);
    }
  };

  /**
   * Navigate to next page
   */
  const nextPage = () => {
    if (activePageIndex < pages.length - 1) {
      navigateToPage(activePageIndex + 1);
    }
  };

  /**
   * Navigate to previous page
   */
  const previousPage = () => {
    if (activePageIndex > 0) {
      navigateToPage(activePageIndex - 1);
    }
  };

  /**
   * Check if current page is first
   */
  const isFirstPage = activePageIndex === 0;

  /**
   * Check if current page is last
   */
  const isLastPage = activePageIndex === pages.length - 1;

  return {
    // State
    activePageIndex,
    activePageId,
    showStickyToolbar,

    // Setters
    setActivePageIndex,
    setShowStickyToolbar,

    // Actions
    navigateToPage,
    nextPage,
    previousPage,

    // Computed
    isFirstPage,
    isLastPage,
    totalPages: pages.length,
  };
};
