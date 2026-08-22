import React from "react";

import styles from "./deepBlockContent.module.scss";

/**
 * Paints a deep image block's author-provided image over its area on the page,
 * covering the scanned content it replaces.
 * @param {Object} props
 * @param {string} props.src - The block's image URL
 */
const DeepBlockImage = ({ src }) => {
  if (!src) {
    return null;
  }

  return (
    <img
      className={styles["deep-block-image"]}
      src={src}
      alt=""
      crossOrigin="anonymous"
    />
  );
};

export default React.memo(DeepBlockImage);
