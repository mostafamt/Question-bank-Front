import React from "react";
import { DEFAULTS, TIMEOUTS } from "../constants";

/**
 * Hook for managing studio layout state (zoom, sticky toolbar, etc.)
 * @param {Object} params - Hook parameters
 * @param {React.RefObject} params.studioEditorRef - Reference to studio editor
 * @param {Function} [params.recalculateAreas] - Function to recalculate areas after layout changes
 * @param {number} [params.activePageIndex] - Current active page index
 * @returns {Object} Layout state and utilities
 */
const useLayoutState = ({
  studioEditorRef,
  recalculateAreas,
  activePageIndex = 0,
  setAreas,
} = {}) => {
  const [imageScaleFactor, setImageScaleFactor] = React.useState(
    DEFAULTS.IMAGE_SCALE_FACTOR
  );

  const [showStickyToolbar, setShowStickyToolbar] = React.useState(false);

  // Color index for cycling through highlight colors per page
  const [colorIndex, setColorIndex] = React.useState([]);

  /**
   * Initialize color index array based on pages
   * @param {number} pageCount - Number of pages
   */
  const initializeColorIndex = React.useCallback((pageCount) => {
    setColorIndex(Array(pageCount || 1).fill(0));
  }, []);

  /**
   * Get current color index for active page
   * @returns {number} Current color index
   */
  const getCurrentColorIndex = React.useCallback(() => {
    return colorIndex[activePageIndex] || 0;
  }, [colorIndex, activePageIndex]);

  /**
   * Increment color index for active page
   */
  const incrementColorIndex = React.useCallback(() => {
    setColorIndex((prevState) => {
      const newState = [...prevState];
      newState[activePageIndex] = (newState[activePageIndex] || 0) + 1;
      return newState;
    });
  }, [activePageIndex]);

  /**
   * Setup intersection observer for sticky toolbar
   */
  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowStickyToolbar(!entry.isIntersecting);
      },
      {
        root: null,
        threshold: 0,
      }
    );

    const imageActionsRef = studioEditorRef?.current?.imageActionsRef;
    if (imageActionsRef?.current) {
      observer.observe(imageActionsRef.current);
    }

    return () => {
      if (imageActionsRef?.current) {
        observer.unobserve(imageActionsRef.current);
      }
    };
  }, [studioEditorRef]);

  /**
   * Recalculate areas when image scale factor changes
   */
  React.useEffect(() => {
    if (imageScaleFactor && setAreas) {
      // Reset _updated flag for active page to force reconversion on zoom
      setAreas((prevState) => {
        const newAreas = [...prevState];
        if (newAreas[activePageIndex]) {
          newAreas[activePageIndex] = newAreas[activePageIndex].map((area) => ({
            ...area,
            _updated: false,
          }));
        }
        return newAreas;
      });

      // Delay to ensure state is updated before recalculation
      setTimeout(() => {
        recalculateAreas?.();
      }, TIMEOUTS.IMAGE_LOAD_DELAY);
    }
  }, [imageScaleFactor, activePageIndex, setAreas, recalculateAreas]);

  /**
   * Zoom in the image
   * @param {number} [step=0.1] - Zoom step increment
   */
  const zoomIn = React.useCallback((step = 0.1) => {
    setImageScaleFactor((prev) => Math.min(prev + step, 3)); // Max 300%
  }, []);

  /**
   * Zoom out the image
   * @param {number} [step=0.1] - Zoom step decrement
   */
  const zoomOut = React.useCallback((step = 0.1) => {
    setImageScaleFactor((prev) => Math.max(prev - step, 0.25)); // Min 25%
  }, []);

  /**
   * Reset zoom to default
   */
  const resetZoom = React.useCallback(() => {
    setImageScaleFactor(DEFAULTS.IMAGE_SCALE_FACTOR);
  }, []);

  /**
   * Set zoom to a specific percentage
   * @param {number} percentage - Zoom percentage (e.g., 100 for 100%)
   */
  const setZoomPercentage = React.useCallback((percentage) => {
    const factor = percentage / 100;
    setImageScaleFactor(Math.max(0.25, Math.min(3, factor)));
  }, []);

  /**
   * Get current zoom as percentage
   * @returns {number} Zoom percentage
   */
  const getZoomPercentage = React.useCallback(() => {
    return Math.round(imageScaleFactor * 100);
  }, [imageScaleFactor]);

  return {
    // State
    imageScaleFactor,
    setImageScaleFactor,
    showStickyToolbar,
    setShowStickyToolbar,
    colorIndex,
    setColorIndex,

    // Color management
    initializeColorIndex,
    getCurrentColorIndex,
    incrementColorIndex,

    // Zoom utilities
    zoomIn,
    zoomOut,
    resetZoom,
    setZoomPercentage,
    getZoomPercentage,
  };
};

export default useLayoutState;
