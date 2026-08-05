import React from "react";

import styles from "./deepBlockContent.module.scss";

/**
 * Paints a deep video block's author-provided video over its area on the page,
 * covering the scanned content it replaces.
 * @param {Object} props
 * @param {string} props.src - The block's video URL
 */
const DeepBlockVideo = ({ src }) => {
  if (!src) {
    return null;
  }

  return (
    <video
      className={styles["deep-block-video"]}
      controls
      crossOrigin="anonymous"
    >
      <source src={src} type="video/mp4" />
    </video>
  );
};

export default DeepBlockVideo;
