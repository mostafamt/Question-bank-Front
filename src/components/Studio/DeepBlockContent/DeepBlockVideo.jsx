import React from "react";
import clsx from "clsx";
import styles from "./deepBlockContent.module.scss";

/**
 * Paints a deep video block's author-provided video over its area on the page,
 * covering the scanned content it replaces.
 * @param {Object} props
 * @param {string} props.src - The block's video URL
 * @param {boolean} props.interactive - Enable video controls (view-and-play mode)
 */
const DeepBlockVideo = ({ src, interactive = false }) => {
  if (!src) {
    return null;
  }

  console.log('DeepBlockVideo');

  return (
    <video
      className={clsx(
        styles["deep-block-video"],
        interactive && styles["deep-block-video-interactive"]
      )}
      style={interactive ? { pointerEvents: "auto" } : {}}
      controls
      crossOrigin="anonymous"
    >
      <source src={src} type="video/mp4" />
    </video>
  );
};

export default React.memo(DeepBlockVideo, (prevProps, nextProps) => {
  // Only re-render if src changes. Ignore interactive prop changes
  // to prevent video reload when toggling block styling
  return prevProps.src === nextProps.src;
});
