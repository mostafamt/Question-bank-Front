import React from "react";
import clsx from "clsx";
import {
  getEmbedUrl,
  getYouTubeThumbnailUrl,
  isEmbeddableVideoUrl,
} from "../../../utils/video";
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

  // YouTube/Vimeo links are web pages, not media files — a <video> tag can't
  // play them (and crossOrigin makes the browser fail with a CORS error), so
  // render them through the provider's embed player instead.
  if (isEmbeddableVideoUrl(src)) {
    return (
      <iframe
        className={clsx(
          styles["deep-block-video"],
          interactive && styles["deep-block-video-interactive"]
        )}
        style={interactive ? { pointerEvents: "auto" } : {}}
        src={getEmbedUrl(src)}
        // html2canvas can't see inside a cross-origin iframe; capturePageSnapshot
        // swaps it for this thumbnail so the snapshot isn't blank.
        data-snapshot-thumbnail={getYouTubeThumbnailUrl(src) || undefined}
        title="Video"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  }

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

export default DeepBlockVideo;
