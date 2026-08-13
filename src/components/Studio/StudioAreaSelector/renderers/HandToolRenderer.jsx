import React from "react";
import WhiteAreaOverlay from "../../WhiteAreaOverlay";
import PageImage from "../shared/PageImage";

/**
 * @file HandToolRenderer.jsx
 * @description Composite-block "hand tool" picking mode: semi-transparent
 * pickable boxes over the page image. `blocksToRender` is built by the
 * caller (useCompositeBlockPicking, extracted in step 4) — this component
 * stays presentational. Extracted verbatim from StudioAreaSelector's
 * `highlight === "hand"` branch.
 */

/**
 * @param {Object} props
 * @param {React.ReactNode} props.blocksToRender - Pre-built pickable area boxes
 * @param {Object[][]} props.deletedDeepBlockAreas
 * @param {number} props.activePage
 * @param {Object[]} props.pages
 * @param {number} props.imageScaleFactor
 * @param {Function} [props.onImageLoad]
 * @param {Function} props.getImageSource - () => string
 */
const HandToolRenderer = React.forwardRef(
  (
    {
      blocksToRender,
      deletedDeepBlockAreas,
      activePage,
      pages,
      imageScaleFactor,
      onImageLoad,
      getImageSource,
    },
    ref
  ) => {
    return (
      <div style={{ position: "relative" }}>
        {blocksToRender}
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

HandToolRenderer.displayName = "HandToolRenderer";

export default HandToolRenderer;
