import React from "react";
import { initAreas, initAreasProperties } from "../initializers";
import { processAreasForImageLoad } from "../services/coordinate.service";
import {
  deleteAreaByIndex,
  DELETED,
  updateAreasProperties,
} from "../../../utils/ocr";

const useAreaManagement = ({
  pages,
  activePageIndex,
  types,
  studioEditorRef,
}) => {
  const [areas, setAreas] = React.useState(() => initAreas(pages));

  const [areasProperties, setAreasProperties] = React.useState(() =>
    initAreasProperties(pages, types)
  );

  const getBlockFromBlockId = (id) => {
    if (!id) return null;

    // Search inside areas for all pages
    for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
      const areaBlock = areasProperties[pageIndex]?.find((a) => {
        return a.id === id;
      });

      if (areaBlock) {
        return {
          ...areaBlock,
          pageIndex,
          type: "area",
        };
      }
    }

    console.warn(`Block with id "${id}" not found.`);
    return null;
  };

  /**
   * Recalculates area pixel coordinates based on the currently loaded image's dimensions.
   *
   * This function is triggered when:
   * - An image finishes loading (via onLoad event)
   * - The user zooms in/out (imageScaleFactor changes) - image scales
   * - The user navigates to a different page - new image loads
   * - Virtual blocks are toggled on/off - layout changes
   *
   * Why this is needed:
   * Areas are stored with percentage coordinates to be resolution-independent.
   * When the image loads or its size changes, we need to recalculate the pixel
   * positions based on the image's current rendered size. This ensures areas
   * stay properly aligned with the image content at any zoom level.
   *
   * The recalculation logic is delegated to the coordinate service layer which:
   * 1. Validates the image is fully loaded
   * 2. Extracts current dimensions from the DOM element
   * 3. Converts percentage coordinates to pixels
   * 4. Preserves metadata for future recalculations
   */
  const recalculateAreas = () => {
    setAreas((prevState) => {
      const processedAreas = processAreasForImageLoad(
        prevState,
        areasProperties,
        studioEditorRef
      );

      // Return processed areas if successful, otherwise keep previous state
      return processedAreas || prevState;
    });
  };

  const updateAreaProperty = (idx, property) => {
    setAreasProperties((prevState) => {
      let newTrialAreas = [...prevState];
      if (idx === -1) {
        const lastIndex = idx + areasProperties[activePageIndex].length;
        newTrialAreas[activePageIndex][lastIndex] = {
          ...newTrialAreas[activePageIndex][lastIndex],
          ...property,
        };
      } else {
        newTrialAreas[activePageIndex][idx] = {
          ...newTrialAreas[activePageIndex][idx],
          ...property,
        };
      }
      return newTrialAreas;
    });
  };

  const onClickDeleteArea = (idx) => {
    const { isServer } = areasProperties[activePageIndex][idx];
    if (isServer) {
      updateAreaProperty(idx, { status: DELETED });
    } else {
      const newAreas = deleteAreaByIndex(areas, activePageIndex, idx);
      setAreas(newAreas);

      const newAreasProperties = deleteAreaByIndex(
        areasProperties,
        activePageIndex,
        idx
      );
      setAreasProperties(newAreasProperties);
    }
  };

  const updateAreaPropertyById = (id, property) => {
    const newAreasProperties = [...areasProperties];
    newAreasProperties[activePageIndex] = newAreasProperties[
      activePageIndex
    ].map((area) => {
      if (area.id === id) {
        return {
          ...area,
          ...property,
        };
      }
      return area;
    });
    setAreasProperties(newAreasProperties);
  };

  return {
    areas,
    setAreas,
    areasProperties,
    setAreasProperties,
    getBlockFromBlockId,
    recalculateAreas,
    updateAreaProperty,
    onClickDeleteArea,
    updateAreaPropertyById,
  };
};

export default useAreaManagement;
