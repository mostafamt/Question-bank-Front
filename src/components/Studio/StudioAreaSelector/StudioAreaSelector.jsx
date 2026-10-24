import React, { useCallback, useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { Fab, Tooltip, useMediaQuery } from "@mui/material";
import DrawIcon from "@mui/icons-material/Draw";
import CheckIcon from "@mui/icons-material/Check";
/** @jsxImportSource @emotion/react */

import styles from "./studioAreaSelector.module.scss";
import VirtualBlocks from "../../VirtualBlocks/VirtualBlocks";
import { constructBoxColors } from "../services/styling.service";
import { hexToRgbA } from "../../../utils/helper";
import { useAppMode } from "../../../utils/tabFiltering";
import { WHITE_PAGE_FALLBACK } from "../constants";
import useReaderVBlocks from "../hooks/useReaderVBlocks";

import { getRenderMode, RENDER_MODES } from "./utils/renderMode";
import { BlockOverlayLayer, BlockContextMenu } from "./shared";
import {
  ReaderModeRenderer,
  HandToolRenderer,
  EditModeRenderer,
  DefaultRenderer,
} from "./renderers";
import {
  useAreaCustomRenderer,
  useCompositeBlockPicking,
  useBlockContextMenu,
} from "./hooks";

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
      onClickDeleteArea,
      updateAreaPropertyById,
      pageContainerRef,
      showBlocksStyling,
      deletedDeepBlockAreas = [],
      isWhiteOutMode,
      addManualWhiteOverlayArea,
      removeWhiteOverlayArea,
      onImageLoad,
    } = props;

    // Detect mode (reader vs studio)
    const mode = useAppMode();
    const isReaderMode = mode === "reader";

    // Reader's own virtual blocks for this page (reader mode only)
    const {
      readerBlocks,
      saveSlot: saveReaderSlot,
      deleteSlot: deleteReaderSlot,
    } = useReaderVBlocks(pages[activePage]?._id, isReaderMode);

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

    const handleImageLoad = useCallback(() => {
      onImageLoad();
    }, [onImageLoad]);

    const renderedAreas = useMemo(() => {
      return activeRightTab.id === "composite-blocks"
        ? compositeBlocks.areas || []
        : areas[activePage] || [];
    }, [activeRightTab.id, compositeBlocks.areas, areas, activePage]);


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
    const isEditMode = renderMode === RENDER_MODES.EDIT_MODE;

    // Touch screens: the area library draws on every finger drag (it sets
    // touch-action: none), so the page could not be scrolled. Fingers scroll
    // by default; the Draw button hands them to the library. Mouse and pen
    // are unaffected. White-out mode is an explicit drawing mode already.
    const hasTouch = useMediaQuery("(any-pointer: coarse)");
    const [isTouchDrawMode, setTouchDrawMode] = useState(false);
    useEffect(() => {
      if (!isEditMode) setTouchDrawMode(false);
    }, [isEditMode]);
    const touchScrollsPage = isEditMode && !isTouchDrawMode && !isWhiteOutMode;

    // Right-click menu: only where page blocks are shown and clicking a block
    // doesn't already mean something else (composite picking, white-out).
    const isContextMenuEnabled =
      renderMode === RENDER_MODES.READER ||
      renderMode === RENDER_MODES.VIEW_AND_PLAY ||
      (renderMode === RENDER_MODES.EDIT_MODE &&
        activeRightTab.id !== "composite-blocks" &&
        !isWhiteOutMode);

    const wrapperStyle = useMemo(
      () => ({
        width: "100%",
        touchAction: touchScrollsPage ? "pan-x pan-y" : "none",
      }),
      [touchScrollsPage]
    );

    const {
      menuProps: contextMenuProps,
      onContextMenu,
      onPointerDownCapture: onMenuPointerDownCapture,
      onPointerMoveCapture,
      onPointerUpCapture,
      onPointerCancelCapture,
      onClickCapture,
    } = useBlockContextMenu({
      enabled: isContextMenuEnabled,
      isReaderMode,
      canShowInList: activeRightTab.id === "block-authoring",
      areas,
      areasProperties,
      activePage,
      imageRef: ref,
      onPlayBlock,
      onClickDeleteArea,
      updateAreaPropertyById,
      // A still finger in Draw mode is the start of a drawing
      longPressEnabled: !isEditMode || touchScrollsPage,
    });

    const onPointerDownCapture = useCallback(
      (event) => {
        onMenuPointerDownCapture(event);
        // Keep scrolling fingers away from the area library (see above)
        if (touchScrollsPage && event.pointerType === "touch") {
          event.stopPropagation();
        }
      },
      [onMenuPointerDownCapture, touchScrollsPage]
    );

    const sharedRendererProps = {
      deletedDeepBlockAreas,
      activePage,
      pages,
      imageScaleFactor,
      onImageLoad: handleImageLoad,
      getImageSource,
    };

    return (
      <>
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
          readerBlocks={readerBlocks}
          onSaveReaderSlot={saveReaderSlot}
          onDeleteReaderSlot={deleteReaderSlot}
          pageImageUrl={getImageSource()}
        >
          <div
            ref={pageContainerRef}
            onContextMenu={onContextMenu}
            onPointerDownCapture={onPointerDownCapture}
            onPointerMoveCapture={onPointerMoveCapture}
            onPointerUpCapture={onPointerUpCapture}
            onPointerCancelCapture={onPointerCancelCapture}
            onClickCapture={onClickCapture}
            className={clsx(
              styles.block,
              !showBlocksStyling && styles.hideBlocksStyling,
              touchScrollsPage && styles["touch-scroll"]
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
                highlightedBlockId={highlightedBlockId}
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
          <BlockContextMenu {...contextMenuProps} />
        </VirtualBlocks>
        {hasTouch && isEditMode && !isWhiteOutMode && (
          // Zero-height sticky row: the button floats at the bottom of the
          // visible editor area without taking space in the page layout
          <div className={styles["touch-draw-toggle"]}>
            <Tooltip
              title={isTouchDrawMode ? "Finish drawing" : "Draw areas with your finger"}
              placement="left"
            >
              <Fab
                variant="extended"
                size="medium"
                color={isTouchDrawMode ? "primary" : "default"}
                aria-pressed={isTouchDrawMode}
                aria-label={isTouchDrawMode ? "Finish drawing" : "Draw areas"}
                onClick={() => setTouchDrawMode((on) => !on)}
              >
                {isTouchDrawMode ? (
                  <CheckIcon sx={{ mr: 1 }} />
                ) : (
                  <DrawIcon sx={{ mr: 1 }} />
                )}
                {isTouchDrawMode ? "Done" : "Draw"}
              </Fab>
            </Tooltip>
          </div>
        )}
      </>
    );
  })
);

export default StudioAreaSelector;
