import React from "react";
import clsx from "clsx";
import WhiteAreaOverlay from "../../WhiteAreaOverlay";
import PageImage from "../shared/PageImage";
import styles from "../studioAreaSelector.module.scss";

/**
 * @file ReaderModeRenderer.jsx
 * @description Student-facing reader mode: an invisible clickable button per
 * area (positioned in pixels, no inline content) that triggers onPlayBlock.
 * Extracted verbatim from StudioAreaSelector's isReaderMode branch.
 */

/**
 * @param {Object} props
 * @param {Object[][]} props.areas
 * @param {Object[][]} props.areasProperties
 * @param {number} props.activePage
 * @param {Function} props.getBlockStyle - (area, idx) => style object
 * @param {Function} [props.onPlayBlock] - (area, areaProps) => void
 * @param {string|null} [props.highlightedBlockId] - Block to highlight (navigation / narration)
 * @param {Object[][]} props.deletedDeepBlockAreas
 * @param {Object[]} props.pages
 * @param {number} props.imageScaleFactor
 * @param {Function} [props.onImageLoad]
 * @param {Function} props.getImageSource - () => string
 */
const ReaderModeRenderer = React.forwardRef(
  (
    {
      areas,
      areasProperties,
      activePage,
      getBlockStyle,
      onPlayBlock,
      highlightedBlockId,
      deletedDeepBlockAreas,
      pages,
      imageScaleFactor,
      onImageLoad,
      getImageSource,
    },
    ref
  ) => {
    const highlightedRef = React.useRef(null);

    // A page is taller than the screen — keep the highlighted block visible.
    React.useEffect(() => {
      if (!highlightedBlockId) return;
      highlightedRef.current?.scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      });
    }, [highlightedBlockId]);

    return (
      <div style={{ position: "relative" }}>
        {areas[activePage]?.map((area, idx) => {
          const areaProps = areasProperties[activePage]?.[idx];
          if (!areaProps?.blockId) return null;
          const isHighlighted = areaProps.blockId === highlightedBlockId;

          return (
            <button
              key={area.id || idx}
              ref={isHighlighted ? highlightedRef : null}
              className={clsx(
                styles["reader-area-button"],
                isHighlighted && styles["reader-area-highlighted"]
              )}
              style={getBlockStyle(area, idx)}
              onClick={() => onPlayBlock?.(area, areaProps)}
              aria-label={`Play ${areaProps.type || "content"}`}
            />
          );
        })}
        <PageImage
          ref={ref}
          src={getImageSource()}
          alt={pages[activePage]?.url || pages[activePage]}
          scaleFactor={imageScaleFactor}
          onLoad={onImageLoad}
        />
        <WhiteAreaOverlay
          deletedAreas={deletedDeepBlockAreas[activePage]}
          visible={true}
        />
      </div>
    );
  }
);

ReaderModeRenderer.displayName = "ReaderModeRenderer";

export default ReaderModeRenderer;
