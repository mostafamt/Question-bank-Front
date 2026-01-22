/**
 * @file areaUtils.js
 * @description Pure utility functions for area manipulation
 */

import { colors } from "../../../constants/highlight-color";
import { v4 as uuidv4 } from "uuid";

/**
 * Initialize areas array from pages data
 * @param {Page[]} pages - Array of page objects
 * @returns {Area[][]} - 2D array of areas for each page
 */
export const initializeAreas = (pages) => {
  return (
    pages?.map((page) =>
      page.blocks?.map((block) => {
        return {
          x: block.coordinates.x,
          y: block.coordinates.y,
          width: block.coordinates.width,
          height: block.coordinates.height,
          unit: "px",
          isChanging: true,
          isNew: true,
          _unit: block.coordinates.unit,
          _updated: false,
        };
      })
    ) || Array(pages?.length || 1).fill([])
  );
};

/**
 * Initialize areasProperties array from pages data
 * @param {Page[]} pages - Array of page objects
 * @param {Array} types - Available content types
 * @param {Function} getTypeNameOfLabelKey - Function to get type name
 * @param {Function} getTypeOfLabel - Function to get type of label
 * @returns {AreaProperty[][]} - 2D array of area properties
 */
export const initializeAreasProperties = (
  pages,
  types,
  getTypeNameOfLabelKey,
  getTypeOfLabel
) => {
  return (
    pages?.map(
      (page) =>
        page.blocks?.map((block, idx) => {
          let typeName = getTypeNameOfLabelKey(types, block.contentType);
          return {
            x: block.coordinates.x,
            y: block.coordinates.y,
            width: block.coordinates.width,
            height: block.coordinates.height,
            id: uuidv4(),
            color: colors[idx % colors.length],
            loading: false,
            text: block.contentValue,
            image: block.contentValue,
            type: typeName,
            parameter: "",
            label: block.contentType,
            typeOfLabel: getTypeOfLabel(types, typeName, block.contentType),
            order: idx,
            open: false,
            isServer: "true",
            blockId: block.blockId,
          };
        }) || []
    ) || Array(pages?.length || 1).fill([])
  );
};

/**
 * Initialize color index array for pages
 * @param {number} pageCount - Number of pages
 * @returns {number[]} - Array of color indices
 */
export const initializeColorIndex = (pageCount) => {
  return Array(pageCount || 1).fill(0);
};

/**
 * Delete area by index immutably
 * @param {Array} collection - Areas or areasProperties array
 * @param {number} pageIndex - Page index
 * @param {number} areaIndex - Area index
 * @returns {Array} - New collection with area removed
 */
export const deleteAreaByIndex = (collection, pageIndex, areaIndex) => {
  const newCollection = [...collection];
  newCollection[pageIndex] = [
    ...newCollection[pageIndex].slice(0, areaIndex),
    ...newCollection[pageIndex].slice(areaIndex + 1),
  ];
  return newCollection;
};

/**
 * Add metadata to area objects
 * @param {Area[]} areasParam - Array of areas
 * @param {Area[]} existingAreas - Existing areas with metadata
 * @returns {Area[]} - Areas with metadata preserved/added
 */
export const addMetadataToAreas = (areasParam, existingAreas) => {
  return areasParam.map((area, idx) => {
    const existingArea = existingAreas?.[idx];

    if (existingArea) {
      // Preserve metadata from existing area
      return {
        ...area,
        _unit: existingArea._unit || "percentage",
        _updated: existingArea._updated || false,
        _percentX: existingArea._percentX ?? area.x,
        _percentY: existingArea._percentY ?? area.y,
        _percentWidth: existingArea._percentWidth ?? area.width,
        _percentHeight: existingArea._percentHeight ?? area.height,
      };
    } else {
      // New area - set metadata
      return {
        ...area,
        _unit: "percentage",
        _updated: false,
        _percentX: area.x,
        _percentY: area.y,
        _percentWidth: area.width,
        _percentHeight: area.height,
      };
    }
  });
};

/**
 * Get next color from color palette
 * @param {number} colorIndex - Current color index
 * @returns {string} - Color code
 */
export const getNextColor = (colorIndex) => {
  return colors[colorIndex % colors.length];
};

/**
 * Increment color index for a page
 * @param {number[]} colorIndexArray - Array of color indices
 * @param {number} pageIndex - Page index to increment
 * @returns {number[]} - Updated color index array
 */
export const incrementColorIndex = (colorIndexArray, pageIndex) => {
  const newArray = [...colorIndexArray];
  newArray[pageIndex]++;
  return newArray;
};
