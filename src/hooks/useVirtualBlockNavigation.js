import { useState, useMemo, useCallback } from "react";

/**
 * Hook for navigating through virtual block content items
 * Provides linear navigation (no circular looping)
 *
 * @param {Array} contents - Array of content items in virtual block
 * @param {number} initialIndex - Starting index (default 0)
 * @returns {Object} Navigation state and controls
 *
 * @example
 * const { currentItem, currentIndex, totalItems, goToNext, goToPrevious, hasNext, hasPrevious } =
 *   useVirtualBlockNavigation(contents, 0);
 */
export const useVirtualBlockNavigation = (contents = [], initialIndex = 0) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  // Current item being displayed
  const currentItem = useMemo(() => {
    return contents[currentIndex] || null;
  }, [contents, currentIndex]);

  // Total number of items
  const totalItems = contents.length;

  // Navigation controls - linear navigation (no looping)
  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => Math.min(prev + 1, totalItems - 1));
  }, [totalItems]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  const goToIndex = useCallback((index) => {
    if (index >= 0 && index < totalItems) {
      setCurrentIndex(index);
    }
  }, [totalItems]);

  // Navigation state flags for linear navigation
  const hasNext = currentIndex < totalItems - 1;
  const hasPrevious = currentIndex > 0;
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === totalItems - 1;

  return {
    // Current state
    currentItem,
    currentIndex,
    totalItems,

    // Navigation functions
    goToNext,
    goToPrevious,
    goToIndex,

    // State flags
    hasNext,
    hasPrevious,
    isFirst,
    isLast,
  };
};

export default useVirtualBlockNavigation;
