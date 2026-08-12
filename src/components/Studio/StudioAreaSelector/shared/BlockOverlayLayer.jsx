import React from "react";
import WhiteAreaOverlay from "../../WhiteAreaOverlay";
import PageImage from "./PageImage";

/**
 * @file BlockOverlayLayer.jsx
 * @description Shared area layer for StudioAreaSelector's `readOnly` and
 * `view-and-play` modes. Both modes were duplicating the same JSX: skip areas
 * without a blockId, position the rest via getBlockStyle, paint their content
 * via customRender, and click through to onAreaClick — over the deleted-area
 * white overlay and the page image.
 *
 * The two original branches differed only in DOM order (image before vs after
 * the area boxes) and an inert `zIndex: 10` on the view-and-play boxes.
 * Neither has a visible effect: absolutely-positioned area boxes always paint
 * above the static image regardless of source order, and there was nothing
 * else at a competing z-index for the extra 10 to matter against. Both modes
 * already get their actual behavioral differences (border/background,
 * pointer-events on media) from getBlockStyle/customRender reading
 * showBlocksStyling/readOnly directly, so no separate "interactive" flag is
 * needed here.
 */

/**
 * @param {Object} props
 * @param {Object[][]} props.areas - Areas per page
 * @param {Object[][]} props.areasProperties - Area properties per page
 * @param {number} props.activePage
 * @param {Function} props.getBlockStyle - (area, idx) => style object
 * @param {Function} props.customRender - AreaSelector-compatible custom renderer
 * @param {Function} [props.onAreaClick] - (areaProps) => void
 * @param {Object[][]} props.deletedDeepBlockAreas - Per-page deleted deep block areas
 * @param {Object[]} props.pages
 * @param {number} props.imageScaleFactor
 * @param {Function} [props.onImageLoad]
 * @param {Function} props.getImageSource - () => string
 */
const BlockOverlayLayer = React.forwardRef(
  (
    {
      areas,
      areasProperties,
      activePage,
      getBlockStyle,
      customRender,
      onAreaClick,
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
            <div
              key={idx}
              style={getBlockStyle(area, idx)}
              onClick={() => onAreaClick?.({ areaNumber: idx + 1 })}
            >
              {customRender({ areaNumber: idx + 1, isChanging: false })}
            </div>
          );
        })}
        <WhiteAreaOverlay
          deletedAreas={deletedDeepBlockAreas[activePage]}
          visible={true}
        />
        <PageImage
          ref={ref}
          src={getImageSource()}
          alt={pages[activePage]?.url || pages[activePage]}
          scaleFactor={imageScaleFactor}
          onLoad={onImageLoad}
        />
      </div>
    );
  }
);

BlockOverlayLayer.displayName = "BlockOverlayLayer";

export default BlockOverlayLayer;
