import React from "react";
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
      deletedDeepBlockAreas,
      pages,
      imageScaleFactor,
      onImageLoad,
      getImageSource,
    },
    ref
  ) => {
    return (
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
