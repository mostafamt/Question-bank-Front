import React from "react";
import { toast } from "react-toastify";

import { initAreas, initAreasProperties } from "../initializers";
import { processAreasForImageLoad } from "../services/coordinate.service";
import {
  deleteAreaByIndex,
  DELETED,
  onEditTextField,
  updateAreasProperties,
} from "../../../utils/ocr";
import { parseVirtualBlocksFromPages } from "../../../utils/virtual-blocks";
import { TIMEOUTS } from "../constants";

const useAreaManagement = ({
  pages,
  activePageIndex,
  types,
  studioEditorRef,
  subObject = false,
  type,
  handleSubmit,
  updateAreaPropertyForParent,
  activePageId,
  refetch,
}) => {
  const [areas, setAreas] = React.useState(() => initAreas(pages));

  const [loadingSubmit, setLoadingSubmit] = React.useState(false);

  const [areasProperties, setAreasProperties] = React.useState(() =>
    initAreasProperties(pages, types)
  );

  const [virtualBlocks, setVirtualBlocks] = React.useState(
    subObject ? [] : parseVirtualBlocksFromPages(pages)
  );
  const [showVB, setShowVB] = React.useState(false);

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

  const onEditText = (id, text) => {
    const newAreasProperties = onEditTextField(
      areasProperties,
      activePageIndex,
      id,
      text
    );
    setAreasProperties(newAreasProperties);
  };

  const syncAreasProperties = () => {
    const newAreasProperties = updateAreasProperties(
      areasProperties,
      activePageIndex,
      areas,
      subObject,
      type
    );
    setAreasProperties(newAreasProperties);
  };

  const onChangeArea = (areasParam) => {
    if (areasParam.length > areasProperties[activePageIndex].length) {
      syncAreasProperties();
    }

    // Add metadata to new areas
    const areasWithMetadata = areasParam.map((area, idx) => {
      // Check if this is an existing area
      const existingArea = areas[activePageIndex]?.[idx];

      if (existingArea) {
        // Preserve metadata from existing area
        return {
          ...area,
          _unit: existingArea._unit || "percentage",
          _updated: existingArea._updated || false,
          // Preserve or store percentage coordinates
          _percentX: existingArea._percentX ?? area.x,
          _percentY: existingArea._percentY ?? area.y,
          _percentWidth: existingArea._percentWidth ?? area.width,
          _percentHeight: existingArea._percentHeight ?? area.height,
        };
      } else {
        // New area - set metadata (AreaSelector uses percentage)
        return {
          ...area,
          _unit: "percentage",
          _updated: false,
          // Store original percentage coordinates
          _percentX: area.x,
          _percentY: area.y,
          _percentWidth: area.width,
          _percentHeight: area.height,
        };
      }
    });

    const newAreasParam = [...areas];
    newAreasParam[activePageIndex] = areasWithMetadata;
    setAreas(newAreasParam);
  };

  const onClickSubmit = async () => {
    setLoadingSubmit(true);
    if (subObject) {
      const id = await handleSubmit(areasProperties[activePageIndex]);
      updateAreaPropertyForParent(-1, { text: id });
      id && toast.success("Sub-Object created successfully!");
      // handleClose();
    } else {
      const id = await handleSubmit(
        activePageId,
        areasProperties[activePageIndex],
        virtualBlocks[activePageIndex]
      );
      id && toast.success("Object created successfully!");
      refetch();
    }
    // clear();
    setLoadingSubmit(false);
  };

  const onClickToggleVirutalBlocks = () => {
    setShowVB((prevState) => !prevState);
    setTimeout(() => {
      recalculateAreas();
    }, TIMEOUTS.VIRTUAL_BLOCKS_TOGGLE_DELAY);
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
    onEditText,
    syncAreasProperties,
    onChangeArea,
    onClickSubmit,
    onClickToggleVirutalBlocks,
    
  };
};

export default useAreaManagement;
