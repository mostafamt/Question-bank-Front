import React, { useMemo, useCallback } from "react";
import { AreaSelector } from "@bmunozg/react-image-area";
import { constructBoxColors } from "../../../utils/ocr";
import clsx from "clsx";
/** @jsxImportSource @emotion/react */

import styles from "./studioAreaSelector.module.scss";
import VirtualBlocks from "../../VirtualBlocks/VirtualBlocks";
import { getList2FromData } from "../../../utils/studio";
import { RIGHT_TAB_NAMES } from "../constants";

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
    } = props;

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
          return (
            <div
              key={areaProps.areaNumber}
              onClick={() => onClickExistedArea(areaProps)}
            >
              <div className={styles.type}>
                {areasProperties[activePage]?.[areaProps.areaNumber - 1]?.type}{" "}
                -
                {areasProperties[activePage]?.[areaProps.areaNumber - 1]?.label}
              </div>
            </div>
          );
        }
      },
      [onClickExistedArea, activePage]
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
      return activeRightTab.label === "Composite Blocks"
        ? compositeBlocks.areas
        : areas[activePage];
    }, [activeRightTab.label, compositeBlocks.areas, areas, activePage]);

    const wrapperStyle = useMemo(
      () => ({
        width: "100%",
      }),
      []
    );

    const areaPropsConfig = useMemo(
      () => ({
        onClick: (event, area) => {
          console.log("here");
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
      >
        <div
          className={styles.block}
          css={constructBoxColors(
            areasProperties[activePage],
            highlightedBlockId
          )}
        >
          {highlight === "hand" ? (
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
          ) : activeRightTab.label === RIGHT_TAB_NAMES.BLOCK_AUTHORING ||
            activeRightTab.label === RIGHT_TAB_NAMES.COMPOSITE_BLOCKS ||
            activeRightTab.label === RIGHT_TAB_NAMES.GLOSSARY_KEYWORDS ? (
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
                // onLoad={onImageLoad}
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
