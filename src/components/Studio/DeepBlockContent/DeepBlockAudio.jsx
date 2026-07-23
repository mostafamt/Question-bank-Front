import React from "react";

import styles from "./deepBlockContent.module.scss";

/**
 * Paints a deep audio block's author-provided audio over its area on the page,
 * covering the scanned content it replaces.
 * @param {Object} props
 * @param {string} props.src - The block's audio URL
 */
const DeepBlockAudio = ({ src }) => {
  if (!src) {
    return null;
  }

  return (
    <audio className={styles["deep-block-audio"]} controls>
      <source src={src} type="audio/mp3" />
    </audio>
  );
};

export default DeepBlockAudio;
