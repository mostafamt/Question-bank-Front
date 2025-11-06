/**
 * @file useCompositeBlocks.js
 * @description Hook for managing composite blocks
 */

import { useState, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { COMPOSITE_BLOCK } from "../constants";
import { addPropsToAreasForCompositeBlocks } from "../../../utils/studio";
import { saveCompositeBlocks } from "../../../services/api";
import { ocr } from "../../../utils/ocr";
import { cropSelectedArea } from "../../../utils/ocr";

/**
 * Custom hook for composite block management
 * @param {Object} imageRef - Ref to image element
 * @param {Object} canvasRef - Ref to canvas element
 * @param {string} chapterId - Current chapter ID
 * @param {string} language - OCR language
 * @returns {Object} - Composite block state and handlers
 */
export const useCompositeBlocks = (imageRef, canvasRef, chapterId, language) => {
  const [compositeBlocks, setCompositeBlocks] = useState({
    name: `${COMPOSITE_BLOCK.NAME_PREFIX} ${uuidv4().slice(
      0,
      COMPOSITE_BLOCK.UUID_SLICE_LENGTH
    )}`,
    type: "",
    areas: [],
  });

  const [highlight, setHighlight] = useState("");
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  /**
   * Update composite block property
   * @param {string|null} id - Area ID (null for root properties)
   * @param {string} key - Property key to update
   * @param {*} value - New value
   */
  const updateCompositeBlock = useCallback((id, key, value) => {
    if (!id) {
      // Update root properties (name, type)
      setCompositeBlocks((prevState) => ({
        ...prevState,
        [key]: value,
        areas: [], // Clear areas when type changes
      }));
      return;
    }

    // Update specific area
    setCompositeBlocks((prevState) => ({
      ...prevState,
      areas: prevState?.areas?.map((item) => {
        if (item.id === id) {
          return { ...item, [key]: value };
        }
        return item;
      }),
    }));
  }, []);

  /**
   * Delete a composite block area
   * @param {string} id - Area ID to delete
   */
  const deleteCompositeBlockArea = useCallback((id) => {
    setCompositeBlocks((prevState) => ({
      ...prevState,
      areas: prevState?.areas?.filter((item) => item.id !== id),
    }));
  }, []);

  /**
   * Process a composite block area (OCR, etc.)
   * @param {string} id - Area ID
   * @param {string} typeOfLabel - Type of content
   */
  const processCompositeBlockArea = useCallback(
    async (id, typeOfLabel) => {
      // Set loading
      setCompositeBlocks((prevState) => ({
        ...prevState,
        areas: prevState?.areas?.map((item) => {
          if (item.id === id) {
            return { ...item, loading: true };
          }
          return item;
        }),
      }));

      if (!imageRef?.current) {
        return;
      }

      const { naturalWidth, clientWidth, clientHeight } = imageRef.current;
      const ratio = naturalWidth / clientWidth;

      const selectedBlock = compositeBlocks.areas.find((item) => item.id === id);
      if (!selectedBlock) {
        return;
      }

      const x = ((selectedBlock.x * ratio) / 100) * clientWidth;
      const y = ((selectedBlock.y * ratio) / 100) * clientHeight;
      const width = ((selectedBlock.width * ratio) / 100) * clientWidth;
      const height = ((selectedBlock.height * ratio) / 100) * clientHeight;

      const img = cropSelectedArea(canvasRef, imageRef, x, y, width, height);

      let text = "";
      if (typeOfLabel === "text") {
        text = await ocr(language, img);
      }

      // Update with results
      setCompositeBlocks((prevState) => ({
        ...prevState,
        areas: prevState?.areas?.map((item) => {
          if (item.id === id) {
            return {
              ...item,
              loading: false,
              img: img,
              text: text,
            };
          }
          return item;
        }),
      }));
    },
    [compositeBlocks.areas, imageRef, canvasRef, language]
  );

  /**
   * Submit composite blocks to server
   */
  const submitCompositeBlocks = useCallback(async () => {
    setLoadingSubmit(true);

    const blocks = compositeBlocks.areas.map(
      ({ type, text, x, y, width, height, unit }) => ({
        contentType: type,
        contentValue: text,
        coordinates: {
          height,
          unit: unit === "%" ? "percentage" : "px",
          width,
          x,
          y,
        },
      })
    );

    const data = {
      name: compositeBlocks.name,
      type: compositeBlocks.type,
      chapterId,
      blocks,
    };

    try {
      const id = await saveCompositeBlocks(data);
      return id;
    } finally {
      setLoadingSubmit(false);
    }
  }, [compositeBlocks, chapterId]);

  /**
   * Update composite blocks from area selector
   * @param {Area[]} areas - New areas
   */
  const updateFromAreaSelector = useCallback(
    (areas) => {
      setCompositeBlocks((prevCompositeBlocks) => {
        const updated = addPropsToAreasForCompositeBlocks(prevCompositeBlocks, areas);
        return updated;
      });
    },
    []
  );

  /**
   * Reset composite blocks to initial state
   */
  const resetCompositeBlocks = useCallback(() => {
    setCompositeBlocks({
      name: `${COMPOSITE_BLOCK.NAME_PREFIX} ${uuidv4().slice(
        0,
        COMPOSITE_BLOCK.UUID_SLICE_LENGTH
      )}`,
      type: "",
      areas: [],
    });
  }, []);

  return {
    // State
    compositeBlocks,
    highlight,
    loadingSubmit,

    // Setters
    setCompositeBlocks,
    setHighlight,

    // Actions
    updateCompositeBlock,
    deleteCompositeBlockArea,
    processCompositeBlockArea,
    submitCompositeBlocks,
    updateFromAreaSelector,
    resetCompositeBlocks,
  };
};
