/**
 * @file useAreaManagement.js
 * @description Hook for managing areas and their properties
 */

import { useState, useCallback } from "react";
import {
  initializeAreas,
  initializeAreasProperties,
  initializeColorIndex,
  deleteAreaByIndex,
  addMetadataToAreas,
  getNextColor,
  incrementColorIndex,
} from "../utils/areaUtils";
import { getTypeNameOfLabelKey, getTypeOfLabel } from "../../../utils/ocr";

/**
 * Custom hook for area management
 * @param {Page[]} pages - Array of pages
 * @param {number} activePageIndex - Current active page index
 * @param {Array} types - Available content types
 * @returns {Object} - Area management state and handlers
 */
export const useAreaManagement = (pages, activePageIndex, types) => {
  const [areas, setAreas] = useState(() => initializeAreas(pages));

  const [areasProperties, setAreasProperties] = useState(() =>
    initializeAreasProperties(pages, types, getTypeNameOfLabelKey, getTypeOfLabel)
  );

  const [colorIndex, setColorIndex] = useState(() =>
    initializeColorIndex(pages?.length)
  );

  /**
   * Update a specific area's properties
   * @param {number} areaIndex - Index of area to update (-1 for last)
   * @param {Object} property - Properties to update
   */
  const updateAreaProperty = useCallback(
    (areaIndex, property) => {
      setAreasProperties((prevState) => {
        const newAreasProperties = [...prevState];
        const targetIndex =
          areaIndex === -1
            ? newAreasProperties[activePageIndex].length - 1
            : areaIndex;

        newAreasProperties[activePageIndex][targetIndex] = {
          ...newAreasProperties[activePageIndex][targetIndex],
          ...property,
        };

        return newAreasProperties;
      });
    },
    [activePageIndex]
  );

  /**
   * Update area property by ID
   * @param {string} id - Area ID
   * @param {Object} property - Properties to update
   */
  const updateAreaPropertyById = useCallback(
    (id, property) => {
      setAreasProperties((prevState) => {
        const newAreasProperties = [...prevState];
        newAreasProperties[activePageIndex] = newAreasProperties[
          activePageIndex
        ].map((area) => {
          if (area.id === id) {
            return { ...area, ...property };
          }
          return area;
        });
        return newAreasProperties;
      });
    },
    [activePageIndex]
  );

  /**
   * Delete an area
   * @param {number} areaIndex - Index of area to delete
   */
  const deleteArea = useCallback(
    (areaIndex) => {
      setAreas((prevAreas) => deleteAreaByIndex(prevAreas, activePageIndex, areaIndex));
      setAreasProperties((prevAreasProperties) => deleteAreaByIndex(prevAreasProperties, activePageIndex, areaIndex));
    },
    [activePageIndex]
  );

  /**
   * Add new areas to current page
   * @param {Area[]} newAreas - Array of new areas
   */
  const updateAreas = useCallback(
    (newAreas) => {
      setAreas((prevAreas) => {
        const areasWithMetadata = addMetadataToAreas(
          newAreas,
          prevAreas[activePageIndex]
        );
        const updatedAreas = [...prevAreas];
        updatedAreas[activePageIndex] = areasWithMetadata;
        return updatedAreas;
      });
    },
    [activePageIndex]
  );

  /**
   * Get next color for area
   */
  const getAndIncrementColor = useCallback(() => {
    let color;
    setColorIndex((prev) => {
      color = getNextColor(prev[activePageIndex]);
      return incrementColorIndex(prev, activePageIndex);
    });
    return color;
  }, [activePageIndex]);

  /**
   * Synchronize areasProperties with areas (when areas change)
   */
  const syncAreasProperties = useCallback(() => {
    // Import from utils/ocr.js for now, will refactor in Phase 3
    const { updateAreasProperties } = require("../../../utils/ocr");

    // We need to read both current states, so we capture them
    let currentAreas;
    let currentAreasProperties;

    setAreas(prev => { currentAreas = prev; return prev; });
    setAreasProperties(prev => { currentAreasProperties = prev; return prev; });

    const newAreasProperties = updateAreasProperties(
      currentAreasProperties,
      activePageIndex,
      currentAreas,
      false, // subObject - will be passed from context later
      "" // type - will be passed from context later
    );
    setAreasProperties(newAreasProperties);
  }, [activePageIndex]);

  return {
    // State
    areas,
    areasProperties,
    colorIndex,

    // Setters (for direct state manipulation if needed)
    setAreas,
    setAreasProperties,
    setColorIndex,

    // Actions
    updateAreaProperty,
    updateAreaPropertyById,
    deleteArea,
    updateAreas,
    syncAreasProperties,
    getAndIncrementColor,

    // Computed
    currentPageAreas: areas[activePageIndex] || [],
    currentPageAreasProperties: areasProperties[activePageIndex] || [],
  };
};
