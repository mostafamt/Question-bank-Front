import React from "react";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import styles from "./deepBlockContent.module.scss";

/**
 * Paints a deep audio block's content over its area on the page.
 *
 * In non-interactive mode (Studio editing): shows an icon placeholder.
 * This overlay is non-interactive (pointer-events: none) so html2canvas
 * (used by pageCapture.service.js) can capture the page without audio controls.
 *
 * In interactive mode (view-and-play): shows a playable audio element with controls.
 * User can play/pause, adjust volume, and seek through the audio.
 *
 * @param {Object} props
 * @param {string} props.src - The block's audio URL
 * @param {boolean} props.interactive - Show playable audio player (view-and-play mode)
 */
const DeepBlockAudio = ({ src, interactive = false }) => {
  if (!src) {
    return null;
  }

  // Non-interactive mode: show icon (for Studio editing/page capture)
  if (!interactive) {
    return (
      <div className={styles["deep-block-audio"]}>
        <MusicNoteIcon className={styles["deep-block-audio-icon"]} />
      </div>
    );
  }

  // Interactive mode: show audio player (for view-and-play)
  return (
    <audio
      className={styles["deep-block-audio-interactive"]}
      style={{ pointerEvents: "auto" }}
      controls
      crossOrigin="anonymous"
    >
      <source src={src} type="audio/mpeg" />
    </audio>
  );
};

export default React.memo(DeepBlockAudio, (prevProps, nextProps) => {
  // Only re-render if src changes. Ignore interactive prop changes
  // to prevent audio reload when toggling block styling
  return prevProps.src === nextProps.src;
});
