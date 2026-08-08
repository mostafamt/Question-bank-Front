/**
 * @file whiteAreaUtils.js
 * @description Utility functions for managing white area overlays (deleted deep blocks)
 */

/**
 * Check if white areas exist for the current page
 * @param {Array} deletedDeepBlockAreas - 2D array of deleted areas per page
 * @param {number} pageIndex - Current page index
 * @returns {boolean} True if page has deleted deep block areas
 */
export const hasDeletedDeepBlocks = (deletedDeepBlockAreas, pageIndex) => {
  return (
    Array.isArray(deletedDeepBlockAreas) &&
    Array.isArray(deletedDeepBlockAreas[pageIndex]) &&
    deletedDeepBlockAreas[pageIndex].length > 0
  );
};

/**
 * Get all white area overlay elements for a page
 * @param {HTMLElement} containerEl - Page container element
 * @returns {HTMLElement[]} Array of white area overlay elements
 */
export const getWhiteAreaElements = (containerEl) => {
  if (!containerEl) return [];
  return Array.from(containerEl.querySelectorAll('.white-area-overlay'));
};

/**
 * Verify white areas are visible in the page
 * @param {HTMLElement} containerEl - Page container element
 * @returns {Object} Verification result with count and visibility status
 */
export const verifyWhiteAreasVisible = (containerEl) => {
  const whiteAreas = getWhiteAreaElements(containerEl);
  return {
    count: whiteAreas.length,
    allVisible: whiteAreas.every((area) => {
      const computedStyle = window.getComputedStyle(area);
      return (
        computedStyle.display !== 'none' &&
        computedStyle.visibility !== 'hidden' &&
        parseFloat(computedStyle.opacity) > 0
      );
    }),
    details: whiteAreas.map((area) => ({
      id: area.getAttribute('data-area-id'),
      display: window.getComputedStyle(area).display,
      visibility: window.getComputedStyle(area).visibility,
      opacity: window.getComputedStyle(area).opacity,
      backgroundColor: window.getComputedStyle(area).backgroundColor,
    })),
  };
};

/**
 * Temporarily show all white areas (useful for snapshot capture)
 * @param {HTMLElement} containerEl - Page container element
 * @returns {Function} Cleanup function to restore previous visibility state
 */
export const ensureWhiteAreasVisible = (containerEl) => {
  const whiteAreas = getWhiteAreaElements(containerEl);
  const previousStates = [];

  // Store previous states and make areas visible
  whiteAreas.forEach((area) => {
    previousStates.push({
      element: area,
      display: area.style.display,
      visibility: area.style.visibility,
      opacity: area.style.opacity,
    });

    // Ensure visibility for snapshot capture
    area.style.setProperty('display', 'block', 'important');
    area.style.setProperty('visibility', 'visible', 'important');
    area.style.setProperty('opacity', '1', 'important');
  });

  // Return cleanup function
  return () => {
    previousStates.forEach(({ element, display, visibility, opacity }) => {
      if (display) element.style.display = display;
      else element.style.removeProperty('display');

      if (visibility) element.style.visibility = visibility;
      else element.style.removeProperty('visibility');

      if (opacity) element.style.opacity = opacity;
      else element.style.removeProperty('opacity');
    });
  };
};

/**
 * Count deleted deep blocks for a specific page
 * @param {Array} deletedDeepBlockAreas - 2D array of deleted areas per page
 * @param {number} pageIndex - Page index
 * @returns {number} Number of deleted deep blocks on the page
 */
export const countDeletedDeepBlocks = (deletedDeepBlockAreas, pageIndex) => {
  if (!hasDeletedDeepBlocks(deletedDeepBlockAreas, pageIndex)) {
    return 0;
  }
  return deletedDeepBlockAreas[pageIndex].length;
};

/**
 * Get all deleted deep block areas for a specific page
 * @param {Array} deletedDeepBlockAreas - 2D array of deleted areas per page
 * @param {number} pageIndex - Page index
 * @returns {Array} Deleted areas for the page
 */
export const getDeletedBlocksForPage = (deletedDeepBlockAreas, pageIndex) => {
  if (!hasDeletedDeepBlocks(deletedDeepBlockAreas, pageIndex)) {
    return [];
  }
  return deletedDeepBlockAreas[pageIndex];
};

/**
 * Calculate total area coverage for deleted deep blocks
 * @param {Array} deletedDeepBlockAreas - 2D array of deleted areas per page
 * @param {number} pageIndex - Page index
 * @returns {number} Total area coverage as percentage (0-100)
 */
export const calculateDeletedAreaCoverage = (deletedDeepBlockAreas, pageIndex) => {
  const deletedBlocks = getDeletedBlocksForPage(deletedDeepBlockAreas, pageIndex);
  if (deletedBlocks.length === 0) return 0;

  const totalArea = deletedBlocks.reduce((sum, area) => {
    return sum + (area.width * area.height);
  }, 0);

  // Assuming page area is 100% x 100% (10000 in percentage squared)
  return Math.min((totalArea / 10000) * 100, 100);
};

/**
 * Check if a point is inside any deleted deep block area
 * @param {Array} deletedDeepBlockAreas - 2D array of deleted areas per page
 * @param {number} pageIndex - Page index
 * @param {number} x - X coordinate (percentage)
 * @param {number} y - Y coordinate (percentage)
 * @returns {Object|null} Deleted area at point, or null if none
 */
export const findDeletedAreaAtPoint = (deletedDeepBlockAreas, pageIndex, x, y) => {
  const deletedBlocks = getDeletedBlocksForPage(deletedDeepBlockAreas, pageIndex);

  return deletedBlocks.find((area) => {
    return (
      x >= area.x &&
      x <= area.x + area.width &&
      y >= area.y &&
      y <= area.y + area.height
    );
  }) || null;
};

/**
 * Debug helper: Log detailed white area information
 * Call this in browser console to diagnose snapshot issues
 * @param {HTMLElement} containerEl - Page container element
 * @param {Array} deletedDeepBlockAreas - Deleted areas state
 * @param {number} pageIndex - Current page index
 */
export const debugWhiteAreas = (containerEl, deletedDeepBlockAreas, pageIndex) => {
  console.group('🔍 WHITE AREAS DEBUG INFO');

  // Check state
  const stateAreas = getDeletedBlocksForPage(deletedDeepBlockAreas, pageIndex);
  console.log('📊 State:');
  console.log(`  - Deleted areas in state: ${stateAreas.length}`);
  stateAreas.forEach((area, idx) => {
    console.log(`    [${idx}] ${area.id}: x=${area.x}%, y=${area.y}%, w=${area.width}%, h=${area.height}%`);
  });

  // Check DOM
  const whiteAreaElements = getWhiteAreaElements(containerEl);
  console.log('\n🏗️ DOM:');
  console.log(`  - White area elements in DOM: ${whiteAreaElements.length}`);
  whiteAreaElements.forEach((el, idx) => {
    const rect = el.getBoundingClientRect();
    const computedStyle = window.getComputedStyle(el);
    console.log(`    [${idx}] ID=${el.getAttribute('data-area-id')}`);
    console.log(`        Position: x=${el.style.left}, y=${el.style.top}, w=${el.style.width}, h=${el.style.height}`);
    console.log(`        Display: display=${computedStyle.display}, visibility=${computedStyle.visibility}, opacity=${computedStyle.opacity}`);
    console.log(`        Color: background=${computedStyle.backgroundColor}, border=${computedStyle.border}`);
    console.log(`        Rect: left=${rect.left}, top=${rect.top}, width=${rect.width}, height=${rect.height}`);
  });

  // Check visibility
  const verification = verifyWhiteAreasVisible(containerEl);
  console.log('\n✅ Visibility Check:');
  console.log(`  - All visible: ${verification.allVisible}`);
  console.log(`  - Count: ${verification.count}`);
  verification.details.forEach((detail, idx) => {
    console.log(`    [${idx}] ID=${detail.id}: display=${detail.display}, visibility=${detail.visibility}, opacity=${detail.opacity}`);
  });

  // Recommendations
  console.log('\n💡 Recommendations:');
  if (stateAreas.length === 0) {
    console.warn('  ⚠️  No deleted areas in state. Check if deep blocks are being tracked.');
  }
  if (whiteAreaElements.length === 0) {
    console.warn('  ⚠️  No white area elements in DOM. Check if WhiteAreaOverlay is rendering.');
  }
  if (whiteAreaElements.length !== stateAreas.length) {
    console.warn(
      `  ⚠️  Mismatch: ${stateAreas.length} in state but ${whiteAreaElements.length} in DOM`
    );
  }
  if (!verification.allVisible) {
    console.warn(
      '  ⚠️  Not all white areas visible. Check CSS or style overrides.'
    );
  }
  if (verification.allVisible && whiteAreaElements.length > 0) {
    console.log('  ✅ All checks passed! White areas should be captured in snapshot.');
  }

  console.groupEnd();

  return {
    stateAreas,
    domElements: whiteAreaElements,
    verification,
  };
};
