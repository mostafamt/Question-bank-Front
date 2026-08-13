import React, { useCallback, useMemo } from "react";
import clsx from "clsx";
/** @jsxImportSource @emotion/react */

import styles from "./studioAreaSelector.module.scss";
import VirtualBlocks from "../../VirtualBlocks/VirtualBlocks";
import { constructBoxColors } from "../services/styling.service";
import { hexToRgbA } from "../../../utils/helper";
import { useAppMode } from "../../../utils/tabFiltering";
import { WHITE_PAGE_FALLBACK } from "../constants";

import { getRenderMode, RENDER_MODES } from "./utils/renderMode";
import { BlockOverlayLayer } from "./shared";
import {
  ReaderModeRenderer,
  HandToolRenderer,
  EditModeRenderer,
  DefaultRenderer,
} from "./renderers";
import { useAreaCustomRenderer, useCompositeBlockPicking } from "./hooks";

/**
 * @file StudioAreaSelector.jsx
 * @description Orchestrator: resolves which of the 6 render modes applies
 * (see ./utils/renderMode.js) and delegates to the matching sub-component.
 * Owns the mode-independent pieces: image-source resolution, per-area
 * inline styling (getBlockStyle), the VirtualBlocks wrapper, and the
 * container's box-color CSS.
 */
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
      pageContainerRef,
      showBlocksStyling,
      deletedDeepBlockAreas = [],
      isWhiteOutMode,
      addManualWhiteOverlayArea,
      removeWhiteOverlayArea,
    } = props;

    // Detect mode (reader vs studio)
    const mode = useAppMode();
    const isReaderMode = mode === "reader";

    // Get image source with fallback to white canvas if URL is missing
    const getImageSource = useCallback(() => {
      const url = pages[activePage]?.url;
      return url && typeof url === "string" && url.trim().length > 0
        ? url
        : WHITE_PAGE_FALLBACK;
    }, [pages, activePage]);

    // Helper function to get block styles based on mode
    const getBlockStyle = useCallback(
      (area, idx) => {
        if (isReaderMode) {
          // Reader mode: simple percentage positioning with no visual clutter
          return {
            position: "absolute",
            top: `${area.y}px`,
            left: `${area.x}px`,
            width: `${area.width}px`,
            height: `${area.height}px`,
          };
        }

        // Studio / read-only mode — areas are always stored in px (see
        // processPageAreas/convertPercentageToPixels), matching how the
        // AreaSelector library itself positions boxes via area.unit.
        const unit = area.unit || "px";
        const baseStyle = {
          position: "absolute",
          top: `${area.y}${unit}`,
          left: `${area.x}${unit}`,
          width: `${area.width}${unit}`,
          height: `${area.height}${unit}`,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        };

        // Only add border and background if showBlocksStyling is true
        if (!showBlocksStyling) {
          return baseStyle;
        }

        const areaProps = areasProperties[activePage]?.[idx];

        if (!areaProps?.color) {
          // No color assigned yet — dashed border (added but not typed)
          return {
            ...baseStyle,
            border: "2px dashed rgba(0, 0, 0, 0.5)",
            backgroundColor: "rgba(0, 0, 0, 0.05)",
          };
        }

        return {
          ...baseStyle,
          border: `2px solid ${areaProps.color}`,
          backgroundColor: hexToRgbA(areaProps.color),
        };
      },
      [isReaderMode, areasProperties, activePage, showBlocksStyling]
    );

    const customRender = useAreaCustomRenderer({
      activePage,
      activeRightTabId: activeRightTab.id,
      compositeBlocks,
      areasProperties,
      setAreasProperties,
      readOnly,
      onAreaClick,
      isReaderMode,
      showBlocksStyling,
    });

    const { blocksToRender } = useCompositeBlockPicking({
      areas,
      areasProperties,
      activePage,
      compositeBlocksTypes,
      compositeBlocks,
      setCompositeBlocks,
    });

    const onImageLoad = useCallback(() => {
      props.onImageLoad();
    }, [props.onImageLoad]);

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
        onClick: (event, area) => {},
      }),
      []
    );

    const renderMode = getRenderMode({
      isReaderMode,
      readOnly,
      showBlocksStyling,
      highlight,
      activeRightTabId: activeRightTab.id,
    });

    const sharedRendererProps = {
      deletedDeepBlockAreas,
      activePage,
      pages,
      imageScaleFactor,
      onImageLoad,
      getImageSource,
    };

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
        pageImageUrl={getImageSource()}
      >
        <div
          ref={pageContainerRef}
          className={clsx(
            styles.block,
            !showBlocksStyling && styles.hideBlocksStyling
          )}
          css={constructBoxColors(
            readOnly
              ? [] // read-only mode: let inline getBlockStyle handle borders
              : activeRightTab.id === "composite-blocks"
              ? compositeBlocks.areas || []
              : areasProperties[activePage] || [],
            highlightedBlockId,
            showBlocksStyling
          )}
        >
          {renderMode === RENDER_MODES.READER && (
            <ReaderModeRenderer
              ref={ref}
              areas={areas}
              areasProperties={areasProperties}
              getBlockStyle={getBlockStyle}
              onPlayBlock={onPlayBlock}
              {...sharedRendererProps}
            />
          )}
          {(renderMode === RENDER_MODES.VIEW_AND_PLAY ||
            renderMode === RENDER_MODES.READ_ONLY) && (
            <BlockOverlayLayer
              ref={ref}
              areas={areas}
              areasProperties={areasProperties}
              getBlockStyle={getBlockStyle}
              customRender={customRender}
              onAreaClick={onAreaClick}
              {...sharedRendererProps}
            />
          )}
          {renderMode === RENDER_MODES.HAND_TOOL && (
            <HandToolRenderer
              ref={ref}
              blocksToRender={blocksToRender}
              {...sharedRendererProps}
            />
          )}
          {renderMode === RENDER_MODES.EDIT_MODE && (
            <EditModeRenderer
              ref={ref}
              renderedAreas={renderedAreas}
              onChangeHandler={onChangeHandler}
              wrapperStyle={wrapperStyle}
              customRender={customRender}
              areaPropsConfig={areaPropsConfig}
              isWhiteOutMode={isWhiteOutMode}
              onAddWhiteOverlay={addManualWhiteOverlayArea}
              onRemoveWhiteOverlay={removeWhiteOverlayArea}
              {...sharedRendererProps}
            />
          )}
          {renderMode === RENDER_MODES.DEFAULT && (
            <DefaultRenderer ref={ref} {...sharedRendererProps} />
          )}
        </div>
      </VirtualBlocks>
    );
  })
);

export default StudioAreaSelector;
