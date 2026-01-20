/**
 * @file useLabelManagement.js
 * @description Hook for managing label selection and OCR processing in Studio
 * Handles the complex logic of onChangeLabel including OCR, coordinate extraction,
 * and sub-object modal opening
 */

import React from "react";
import { colors } from "../../../constants/highlight-color";
import {
  COMPLEX_TYPES,
  extractImage,
  getTypeOfLabel,
  getTypeOfLabel2,
  ocr,
} from "../../../utils/ocr";
import { STUDIO_MODALS } from "../services/modal.service";

/**
 * Hook for managing label changes and OCR processing
 * @param {Object} params - Hook parameters
 * @param {Object[][]} params.areasProperties - Areas properties
 * @param {Object[][]} params.areas - Areas array
 * @param {number} params.activePageIndex - Active page index
 * @param {Array} params.types - Available types
 * @param {boolean} params.subObject - Is sub-object mode
 * @param {string} params.tOfActiveType - Type of active type (for sub-object)
 * @param {React.RefObject} params.canvasRef - Canvas reference
 * @param {React.RefObject} params.studioEditorRef - Studio editor reference
 * @param {string} params.language - OCR language
 * @param {Function} params.syncAreasProperties - Sync areas properties function
 * @param {Function} params.updateAreaProperty - Update area property function
 * @param {Function} params.openModal - Open modal function
 * @returns {Object} Label management state and functions
 */
const useLabelManagement = ({
  areasProperties,
  areas,
  activePageIndex,
  types,
  subObject,
  tOfActiveType,
  canvasRef,
  studioEditorRef,
  language,
  syncAreasProperties,
  updateAreaProperty,
  openModal,
}) => {
  // Color index for cycling through highlight colors per page
  const [colorIndex, setColorIndex] = React.useState(() =>
    Array(areasProperties?.length || 1).fill(0)
  );

  // Sub-object state
  const [activeType, setActiveType] = React.useState("");
  const [typeOfActiveType, setTypeOfActiveType] = React.useState("");

  /**
   * Get next color and increment index
   * @returns {string} Next color
   */
  const getNextColor = React.useCallback(() => {
    const color = colors[colorIndex[activePageIndex] % colors.length];
    setColorIndex((prevState) => {
      const newState = [...prevState];
      newState[activePageIndex] = (newState[activePageIndex] || 0) + 1;
      return newState;
    });
    return color;
  }, [colorIndex, activePageIndex]);

  /**
   * Extract coordinate text from area position
   * @param {Object} area - Area object
   * @returns {string} Formatted coordinate string
   */
  const extractCoordinateText = React.useCallback((area) => {
    if (!studioEditorRef?.current?.studioEditorSelectorRef?.current) {
      return "x= 0; y= 0;";
    }

    const { naturalHeight, naturalWidth } =
      studioEditorRef.current.studioEditorSelectorRef.current;

    const x = Math.round((area.x * naturalWidth) / 100);
    const y = Math.round((area.y * naturalHeight) / 100);

    return `x= ${x}; y= ${y};`;
  }, [studioEditorRef]);

  /**
   * Handle label change - main function for processing label selection
   * @param {string} id - Area ID
   * @param {string} label - Selected label
   */
  const onChangeLabel = React.useCallback(
    async (id, label) => {
      // Sync properties first
      syncAreasProperties();

      // Find the area index
      const idx = areasProperties[activePageIndex]?.findIndex(
        (area) => area.id === id
      );

      if (idx === -1) {
        console.warn(`Area with id ${id} not found`);
        return;
      }

      // Get next color
      const color = getNextColor();

      // Determine type of label
      let labelType = "";
      if (subObject) {
        labelType = getTypeOfLabel2(types, tOfActiveType, label);
      } else {
        labelType = getTypeOfLabel(
          types,
          areasProperties[activePageIndex][idx].type,
          label
        );
      }

      // Extract image from area
      const img = extractImage(
        canvasRef,
        studioEditorRef.current?.studioEditorSelectorRef,
        areasProperties,
        activePageIndex,
        areas,
        id
      );

      // Update area with basic properties
      updateAreaProperty(idx, {
        color,
        label,
        typeOfLabel: labelType,
        image: img,
      });

      // Process based on label type
      if (labelType === "text" || labelType === "number") {
        // Perform OCR for text/number types
        updateAreaProperty(idx, { loading: true });
        try {
          const text = await ocr(language, img);
          updateAreaProperty(idx, { text, loading: false });
        } catch (error) {
          console.error("OCR failed:", error);
          updateAreaProperty(idx, { text: "", loading: false });
        }
      } else if (labelType === "Coordinate") {
        // Extract coordinates
        const area = areas[activePageIndex][idx];
        const text = extractCoordinateText(area);
        updateAreaProperty(idx, { text });
      } else {
        // Check if it's a complex type that needs a modal
        const isComplex = COMPLEX_TYPES.includes(labelType);
        if (isComplex) {
          setActiveType(label);
          setTypeOfActiveType(labelType);
          openModal(STUDIO_MODALS.SUB_OBJECT, {
            image: img,
            type: labelType,
            types: types,
            updateAreaProperty: updateAreaProperty,
            typeOfActiveType: labelType,
          });
        }
      }
    },
    [
      areasProperties,
      areas,
      activePageIndex,
      types,
      subObject,
      tOfActiveType,
      canvasRef,
      studioEditorRef,
      language,
      syncAreasProperties,
      updateAreaProperty,
      openModal,
      getNextColor,
      extractCoordinateText,
    ]
  );

  /**
   * Clear sub-object state
   */
  const clearSubObjectState = React.useCallback(() => {
    setActiveType("");
    setTypeOfActiveType("");
  }, []);

  return {
    // State
    colorIndex,
    setColorIndex,
    activeType,
    setActiveType,
    typeOfActiveType,
    setTypeOfActiveType,

    // Actions
    onChangeLabel,
    getNextColor,
    extractCoordinateText,
    clearSubObjectState,
  };
};

export default useLabelManagement;
