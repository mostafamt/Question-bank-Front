import React from "react";

/**
 * @file PageImage.jsx
 * @description The scanned page image, scaled by imageScaleFactor. Extracted
 * from StudioAreaSelector, where the same <img> was repeated in all 6 render
 * modes with only `cursor` (and one no-op `position`) ever varying.
 */

/**
 * @param {Object} props
 * @param {string} props.src - Image URL (already resolved via getImageSource)
 * @param {string} [props.alt] - Alt text
 * @param {number} props.scaleFactor - Multiplied by 100 for width/height percentage
 * @param {Function} [props.onLoad] - Fired when the image finishes loading
 * @param {string} [props.cursor] - Optional cursor override (e.g. "pointer")
 * @param {Object} [props.style] - Additional style overrides merged last
 */
const PageImage = React.forwardRef(
  ({ src, alt, scaleFactor, onLoad, cursor, style }, ref) => (
    <img
      src={src}
      alt={alt}
      crossOrigin="anonymous"
      ref={ref}
      style={{
        width: `${scaleFactor * 100}%`,
        height: `${scaleFactor * 100}%`,
        overflow: "scroll",
        ...(cursor ? { cursor } : null),
        ...style,
      }}
      onLoad={onLoad}
    />
  )
);

PageImage.displayName = "PageImage";

export default PageImage;
