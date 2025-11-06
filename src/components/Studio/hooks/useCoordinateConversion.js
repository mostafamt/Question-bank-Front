/**
 * @file useCoordinateConversion.js
 * @description Hook for coordinate conversion between percentage and pixels
 */

import { useCallback, useEffect } from "react";
import {
  convertAreasForPage,
  resetUpdatedFlag,
} from "../utils/coordinateUtils";
import { TIMEOUTS } from "../constants";

/**
 * Custom hook for coordinate conversion
 * @param {Object} areaManagement - Area management hook return value
 * @param {Object} imageRef - Ref to image element
 * @param {number} activePageIndex - Current active page index
 * @param {number} imageScaleFactor - Current zoom level
 * @returns {Object} - Coordinate conversion functions
 */
export const useCoordinateConversion = (
  areaManagement,
  imageRef,
  activePageIndex,
  imageScaleFactor
) => {
  const { areas, setAreas, areasProperties } = areaManagement;

  /**
   * Convert percentage coordinates to pixels for current page
   */
  const convertPercentageToPx = useCallback(() => {
    if (!imageRef?.current) {
      return;
    }

    const dimensions = {
      clientWidth: imageRef.current.clientWidth,
      clientHeight: imageRef.current.clientHeight,
      naturalWidth: imageRef.current.naturalWidth,
      naturalHeight: imageRef.current.naturalHeight,
    };

    const convertedAreas = convertAreasForPage(
      areas,
      activePageIndex,
      dimensions,
      areasProperties
    );

    setAreas(convertedAreas);
  }, [areas, activePageIndex, areasProperties, imageRef, setAreas]);

  /**
   * Reset conversion flag for a specific page
   * @param {number} pageIndex - Page to reset
   */
  const resetConversionFlag = useCallback(
    (pageIndex) => {
      setAreas((prevState) => {
        const newAreas = [...prevState];
        if (newAreas[pageIndex]) {
          newAreas[pageIndex] = resetUpdatedFlag(newAreas[pageIndex]);
        }
        return newAreas;
      });
    },
    [setAreas]
  );

  /**
   * Trigger conversion after a delay (for page navigation or zoom)
   */
  const delayedConversion = useCallback(
    (delay = TIMEOUTS.PAGE_NAVIGATION_DELAY) => {
      setTimeout(() => {
        convertPercentageToPx();
      }, delay);
    },
    [convertPercentageToPx]
  );

  // Auto-convert when image scale factor changes
  useEffect(() => {
    if (imageScaleFactor && imageRef?.current) {
      // Reset flag to force reconversion
      resetConversionFlag(activePageIndex);

      // Delay conversion to ensure DOM updates
      delayedConversion(TIMEOUTS.IMAGE_LOAD_DELAY);
    }
  }, [imageScaleFactor, activePageIndex, resetConversionFlag, delayedConversion, imageRef]);

  // Auto-convert when page changes
  useEffect(() => {
    if (imageRef?.current) {
      // Reset flag for new page
      resetConversionFlag(activePageIndex);

      // Delay conversion
      delayedConversion(TIMEOUTS.PAGE_NAVIGATION_DELAY);
    }
  }, [activePageIndex, resetConversionFlag, delayedConversion, imageRef]);

  return {
    convertPercentageToPx,
    resetConversionFlag,
    delayedConversion,
  };
};
