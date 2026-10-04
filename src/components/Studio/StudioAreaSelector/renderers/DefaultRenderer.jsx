import React from "react";
import WhiteAreaOverlay from "../../WhiteAreaOverlay";
import PageImage from "../shared/PageImage";

/**
 * @file DefaultRenderer.jsx
 * @description Fallback for right-panel tabs outside the editing set: plain
 * page image, no area interaction. Extracted verbatim from
 * StudioAreaSelector's final else branch.
 */

/**
 * @param {Object} props
 * @param {Object[][]} props.deletedDeepBlockAreas
 * @param {number} props.activePage
 * @param {Object[]} props.pages
 * @param {number} props.imageScaleFactor
 * @param {Function} [props.onImageLoad]
 * @param {Function} props.getImageSource - () => string
 */
const DefaultRenderer = React.forwardRef(
  (
    { deletedDeepBlockAreas, activePage, pages, imageScaleFactor, onImageLoad, getImageSource },
    ref
  ) => {
    return (
      <div style={{ position: "relative" }}>
        <PageImage
          ref={ref}
          src={getImageSource()}
          alt={pages[activePage]?.url || pages[activePage]}
          scaleFactor={imageScaleFactor}
          cursor="pointer"
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

DefaultRenderer.displayName = "DefaultRenderer";

export default DefaultRenderer;
