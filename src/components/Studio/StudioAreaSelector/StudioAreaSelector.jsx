import React, { useMemo, useCallback } from "react";
import { AreaSelector } from "@bmunozg/react-image-area";
import { constructBoxColors } from "../services/styling.service";
import clsx from "clsx";
/** @jsxImportSource @emotion/react */

import styles from "./studioAreaSelector.module.scss";
import VirtualBlocks from "../../VirtualBlocks/VirtualBlocks";
import { getList2FromData } from "../../../utils/studio";
import { RIGHT_TAB_NAMES } from "../constants";
import { hexToRgbA } from "../../../utils/helper";
import { useAppMode } from "../../../utils/tabFiltering";

const StudioAreaSelector = React.memo(
  React.forwardRef((props, ref) => {
    const {
      areasProperties,
      setAreasProperties,
      activePage,
      imageScaleFactor,
      areas,
      onChangeHandler,
      pages,
      showVB,
      virtualBlocks,
      setVirtualBlocks,
      activeRightTab,
      compositeBlocksTypes,
      compositeBlocks,
      setCompositeBlocks,
      highlight,
      highlightedBlockId,
      readOnly = false,
      onAreaClick,
      onPlayBlock,
    } = props;

    // Detect mode (reader vs studio)
    const mode = useAppMode();
    const isReaderMode = mode === "reader";

    // Helper function to get block styles based on mode
    const getBlockStyle = useCallback(
      (area, idx) => {
        console.log("area= ", area);
        if (isReaderMode) {
          // Reader mode: simple percentage positioning with no visual clutter
          return {
            position: "absolute",
            top: `${area.y}px`,
            left: `${area.x}px`,
            width: `${area.width}px`,
            height: `${area.height}px`,
          };
        } else {
          // Studio / read-only mode
          const areaProps = areasProperties[activePage]?.[idx];

          if (!areaProps?.color) {
            // No color assigned yet — dashed border (added but not typed)
            return {
              position: "absolute",
              top: `${area.y}%`,
              left: `${area.x}%`,
              width: `${area.width}%`,
              height: `${area.height}%`,
              border: "2px dashed rgba(0, 0, 0, 0.5)",
              backgroundColor: "rgba(0, 0, 0, 0.05)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            };
          }

          return {
            position: "absolute",
            top: `${area.y}%`,
            left: `${area.x}%`,
            width: `${area.width}%`,
            height: `${area.height}%`,
            border: `2px solid ${areaProps.color}`,
            backgroundColor: hexToRgbA(areaProps.color),
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          };
        }
      },
      [isReaderMode, areasProperties, activePage]
    );

    const onClickExistedArea = useCallback(
      (areaProps) => {
        setAreasProperties((prevAreasProperties) => {
          const newAreasProperties = [...prevAreasProperties];
          const idx = areaProps.areaNumber - 1;
          newAreasProperties[activePage][idx].open =
            !newAreasProperties[activePage][idx].open;
          return newAreasProperties;
        });
      },
      [activePage, setAreasProperties]
    );

    const customRender = useCallback(
      (areaProps) => {
        if (!areaProps.isChanging) {
          const isCompositeBlocksTab = activeRightTab.id === "composite-blocks";
          const areaIndex = areaProps.areaNumber - 1;

          let areaType, areaLabel;

          if (isCompositeBlocksTab) {
            const area = compositeBlocks.areas?.[areaIndex];
            areaType = area?.type;
            areaLabel = compositeBlocks?.type;
          } else {
            const area = areasProperties[activePage]?.[areaIndex];
            areaType = area?.type;
            areaLabel = area?.label;
          }

          if (areaType) {
            return (
              <div
                key={areaProps.areaNumber}
                onClick={() => {
                  if (readOnly && onAreaClick) {
                    onAreaClick(areaProps);
                  } else {
                    onClickExistedArea(areaProps);
                  }
                }}
                style={{ cursor: readOnly ? "pointer" : "default" }}
              >
                <div className={styles.type}>
                  {areaType} - {areaLabel}
                </div>
              </div>
            );
          }
        }
      },
      [
        onClickExistedArea,
        activePage,
        activeRightTab.id,
        compositeBlocks,
        areasProperties,
        readOnly,
        onAreaClick,
      ]
    );

    const onImageLoad = useCallback(() => {
      props.onImageLoad();
    }, [props.onImageLoad]);

    const onChangeHandlerForCB = (areas) => {
      // _setCompositeBlocks((prevState) => ({ ...prevState, areas }));
    };

    const onPickAreaForCompositeBlocks = useCallback(
      (idx) => {
        const area = areasProperties[activePage][idx];
        const list = getList2FromData(
          compositeBlocksTypes,
          compositeBlocks.type
        );

        const condition1 =
          (area.type === "Illustrative object" || area.type === "Question") &&
          list.includes("Object");
        const condition2 =
          area.type === "Question" && list.includes("Question");

        if (condition1 || condition2) {
          setCompositeBlocks((prevState) => ({
            ...prevState,
            areas: [
              ...prevState.areas,
              {
                x: area.x,
                y: area.y,
                height: area.height,
                width: area.width,
                type: list.includes("Object") ? "Object" : "Question",
                text: area.blockId,
                unit: "%",
              },
            ],
          }));
        }
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

    // Debug: Log which props are changing
    const prevPropsRef = React.useRef(props);
    React.useEffect(() => {
      const prevProps = prevPropsRef.current;
      const changedProps = {};

      Object.keys(props).forEach((key) => {
        if (props[key] !== prevProps[key]) {
          changedProps[key] = {
            old: prevProps[key],
            new: props[key],
            changed: true,
          };
        }
      });

      prevPropsRef.current = props;
    });

    const renderedAreas = useMemo(() => {
      return activeRightTab.id === "composite-blocks"
        ? compositeBlocks.areas || []
        : areas[activePage] || [];
    }, [activeRightTab.id, compositeBlocks.areas, areas, activePage]);

    const wrapperStyle = useMemo(
      () => ({
        width: "100%",
      }),
      []
    );

    const areaPropsConfig = useMemo(
      () => ({
        onClick: (event, area) => {
          // console.log("here");
        },
      }),
      []
    );

    return (
      <VirtualBlocks
        className={clsx(
          styles["studio-area-selector"],
          !showVB && styles["show"]
        )}
        showVB={showVB}
        virtualBlocks={virtualBlocks}
        setVirtualBlocks={setVirtualBlocks}
        activePage={activePage}
        reader={isReaderMode}
      >
        <div
          className={styles.block}
          css={constructBoxColors(
            readOnly
              ? [] // read-only mode: let inline getBlockStyle handle borders
              : activeRightTab.id === "composite-blocks"
              ? compositeBlocks.areas || []
              : areasProperties[activePage] || [],
            highlightedBlockId
          )}
        >
          {isReaderMode ? (
            <div style={{ position: "relative" }}>
              {areas[activePage]?.map((area, idx) => {
                const areaProps = areasProperties[activePage]?.[idx];
                if (!areaProps?.blockId) return null;

                return (
                  <button
                    key={area.id || idx}
                    className={styles["reader-area-button"]}
                    style={getBlockStyle(area, idx)}
                    onClick={() => onPlayBlock?.(area, areaProps)}
                    aria-label={`Play ${areaProps.type || "content"}`}
                  />
                );
              })}
              <img
                src={pages[activePage]?.url}
                alt={pages[activePage]?.url || pages[activePage]}
                crossOrigin="anonymous"
                ref={ref}
                style={{
                  width: `${imageScaleFactor * 100}%`,
                  height: `${imageScaleFactor * 100}%`,
                  overflow: "scroll",
                }}
                onLoad={onImageLoad}
              />
            </div>
          ) : readOnly ? (
            <div style={{ position: "relative" }}>
              {areas[activePage]?.map((area, idx) => {
                const areaProps = areasProperties[activePage]?.[idx];
                if (!areaProps?.blockId) return null;

                return (
                  <div
                    key={idx}
                    style={getBlockStyle(area, idx)}
                    onClick={() => onAreaClick?.({ areaNumber: idx + 1 })}
                  >
                    {customRender({ areaNumber: idx + 1, isChanging: false })}
                  </div>
                );
              })}
              <img
                src={pages[activePage]?.url}
                alt={pages[activePage]?.url || pages[activePage]}
                crossOrigin="anonymous"
                ref={ref}
                style={{
                  width: `${imageScaleFactor * 100}%`,
                  height: `${imageScaleFactor * 100}%`,
                  overflow: "scroll",
                }}
                onLoad={onImageLoad}
              />
            </div>
          ) : highlight === "hand" ? (
            <div style={{ position: "relative" }}>
              {blocksToRender}
              <img
                src={pages[activePage]?.url}
                alt={pages[activePage]?.url || pages[activePage]}
                crossOrigin="anonymous"
                ref={ref}
                style={{
                  width: `${imageScaleFactor * 100}%`,
                  height: `${imageScaleFactor * 100}%`,
                  overflow: "scroll",
                  cursor: "pointer",
                }}
                onLoad={onImageLoad}
              />
            </div>
          ) : activeRightTab.id === "block-authoring" ||
            activeRightTab.id === "composite-blocks" ||
            activeRightTab.id === "glossary-keywords" ||
            activeRightTab.id === "illustrative-interactions" ? (
            <AreaSelector
              areas={renderedAreas}
              onChange={onChangeHandler}
              wrapperStyle={wrapperStyle}
              customAreaRenderer={customRender}
              areaProps={areaPropsConfig}
              unit="percentage"
            >
              <img
                src={pages[activePage]?.url}
                alt={pages[activePage]?.url || pages[activePage]}
                crossOrigin="anonymous"
                ref={ref}
                style={{
                  width: `${imageScaleFactor * 100}%`,
                  height: `${imageScaleFactor * 100}%`,
                  overflow: "scroll",
                }}
                onLoad={onImageLoad}
              />
            </AreaSelector>
          ) : (
            <div style={{ position: "relative" }}>
              <img
                src={pages[activePage]?.url}
                alt={pages[activePage]?.url || pages[activePage]}
                crossOrigin="anonymous"
                ref={ref}
                style={{
                  width: `${imageScaleFactor * 100}%`,
                  height: `${imageScaleFactor * 100}%`,
                  overflow: "scroll",
                  cursor: "pointer",
                }}
                onLoad={onImageLoad}
              />
            </div>
          )}
        </div>
      </VirtualBlocks>
    );
  })
);

export default StudioAreaSelector;
