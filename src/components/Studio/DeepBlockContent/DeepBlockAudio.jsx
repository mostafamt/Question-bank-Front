import React from "react";
import MusicNoteIcon from "@mui/icons-material/MusicNote";

import styles from "./deepBlockContent.module.scss";

/**
 * Paints a deep audio block's placeholder over its area on the page, covering
 * the scanned content it replaces.
 *
 * Renders an icon rather than a native `<audio>` player: this overlay is
 * non-interactive (see `pointer-events: none` below) and audio has no visual
 * frame, so html2canvas (used by pageCapture.service.js) has nothing to
 * rasterize from a native player's shadow-DOM controls — the icon is plain
 * DOM it can actually capture. Playback/preview happens in the DEEP_AUDIO
 * modal, not here.
 * @param {Object} props
 * @param {string} props.src - The block's audio URL
 */
const DeepBlockAudio = ({ src }) => {
  if (!src) {
    return null;
  }

  return (
    <div className={styles["deep-block-audio"]}>
      <MusicNoteIcon className={styles["deep-block-audio-icon"]} />
    </div>
  );
};

export default DeepBlockAudio;
