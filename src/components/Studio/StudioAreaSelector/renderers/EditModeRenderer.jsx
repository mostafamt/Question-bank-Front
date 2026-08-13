import React from "react";
import { AreaSelector } from "@bmunozg/react-image-area";
import WhiteAreaOverlay from "../../WhiteAreaOverlay";
import PageImage from "../shared/PageImage";

/**
 * @file EditModeRenderer.jsx
 * @description Interactive drawing/resizing mode backed by the third-party
 * `AreaSelector` library. `renderedAreas`/`wrapperStyle`/`areaPropsConfig` are
 * computed by the orchestrator (simple useMemos, not extracted into a hook).
 * Extracted verbatim from StudioAreaSelector's editing-tab branch.
 */

/**
 * @param {Object} props
 * @param {Object[]} props.renderedAreas
 * @param {Function} props.onChangeHandler
 * @param {Object} props.wrapperStyle
 * @param {Function} props.customRender - customAreaRenderer for the library
 * @param {Object} props.areaPropsConfig
 * @param {Object[][]} props.deletedDeepBlockAreas
 * @param {number} props.activePage
 * @param {Object[]} props.pages
 * @param {number} props.imageScaleFactor
 * @param {Function} [props.onImageLoad]
 * @param {Function} props.getImageSource - () => string
 */
const EditModeRenderer = React.forwardRef(
  (
    {
      renderedAreas,
      onChangeHandler,
      wrapperStyle,
      customRender,
      areaPropsConfig,
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
      <AreaSelector
        areas={renderedAreas}
        onChange={onChangeHandler}
        wrapperStyle={wrapperStyle}
        customAreaRenderer={customRender}
        areaProps={areaPropsConfig}
        unit="percentage"
      >
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
      </AreaSelector>
    );
  }
);

EditModeRenderer.displayName = "EditModeRenderer";

export default EditModeRenderer;
