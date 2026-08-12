import React, { useCallback, useMemo } from "react";
import {
  getList2FromData,
  getTypeOfLabelForCompositeBlocks,
} from "../../../../utils/studio";

/**
 * @file useCompositeBlockPicking.js
 * @description Hand-tool mode logic: picking an existing area to add to the
 * composite block currently being built. Extracted verbatim from
 * StudioAreaSelector's onPickAreaForCompositeBlocks and blocksToRender.
 */

/**
 * @param {Object} params
 * @param {Object[][]} params.areas
 * @param {Object[][]} params.areasProperties
 * @param {number} params.activePage
 * @param {Object[]} params.compositeBlocksTypes
 * @param {Object} params.compositeBlocks
 * @param {Function} params.setCompositeBlocks
 * @returns {{ onPickAreaForCompositeBlocks: Function, blocksToRender: React.ReactNode[] }}
 */
const useCompositeBlockPicking = ({
  areas,
  areasProperties,
  activePage,
  compositeBlocksTypes,
  compositeBlocks,
  setCompositeBlocks,
}) => {
  const onPickAreaForCompositeBlocks = useCallback(
    (idx) => {
      const area = areasProperties[activePage][idx];
      const labelKeys = getList2FromData(
        compositeBlocksTypes,
        compositeBlocks.type
      );

      // Build allowed area categories and find the matching label key
      // based on label value types (QObject, Object, XObject) not key names
      const allowedCategories = new Set();
      labelKeys.forEach((labelKey) => {
        const labelType = getTypeOfLabelForCompositeBlocks(
          compositeBlocksTypes,
          compositeBlocks.type,
          labelKey
        );
        if (labelType === "QObject") allowedCategories.add("Question");
        if (labelType === "Object")
          allowedCategories.add("Illustrative object");
        if (labelType === "XObject")
          allowedCategories.add("Illustrative object");
      });

      if (!allowedCategories.has(area.type)) return;

      // Find the label key whose type matches the selected area's category
      let areaType = "";
      for (const labelKey of labelKeys) {
        const labelType = getTypeOfLabelForCompositeBlocks(
          compositeBlocksTypes,
          compositeBlocks.type,
          labelKey
        );
        const isObjectLabel = labelType === "Object" || labelType === "XObject";
        const isQuestionLabel = labelType === "QObject";
        if (area.type === "Illustrative object" && isObjectLabel) {
          areaType = labelKey;
          break;
        }
        if (area.type === "Question" && isQuestionLabel) {
          areaType = labelKey;
          break;
        }
      }

      setCompositeBlocks((prevState) => ({
        ...prevState,
        areas: [
          ...prevState.areas,
          {
            x: area.x,
            y: area.y,
            height: area.height,
            width: area.width,
            type: areaType,
            text: area.text, // objectId (contentValue) sent to server
            blockId: area.blockId, // page-level block ID for modal tracking
            unit: "%",
          },
        ],
      }));
    },
    [
      areasProperties,
      activePage,
      compositeBlocksTypes,
      compositeBlocks.type,
      setCompositeBlocks,
    ]
  );

  const blocksToRender = useMemo(() => {
    return (
      areas[activePage]
        ?.map((area, idx) => ({ area, idx })) // Preserve index
        .filter(({ idx }) => {
          // Filter out SimpleItem blocks
          const areaProps = areasProperties[activePage]?.[idx];
          return areaProps?.type !== "Simple item";
        })
        .map(({ area, idx }) => (
          <div
            key={idx}
            style={{
              position: "absolute",
              top: `${area.y}px`,
              left: `${area.x}px`,
              width: `${area.width}px`,
              height: `${area.height}px`,
              backgroundColor: "rgba(0, 0, 0, 0.2)",
              borderColor: "rgba(0, 0, 0, 0.2)",
              cursor: "pointer",
            }}
            onClick={() => onPickAreaForCompositeBlocks(idx)}
          />
        )) || []
    );
  }, [areas, activePage, areasProperties, onPickAreaForCompositeBlocks]);

  return { onPickAreaForCompositeBlocks, blocksToRender };
};

export default useCompositeBlockPicking;
