import React from "react";
import { default as BootstrapModal } from "react-bootstrap/Modal";
import { Alert } from "@mui/material";

import { getEmbedUrl, isEmbeddableVideoUrl } from "../../../utils/video";

import styles from "./videoPlayerModal.module.scss";

/**
 * VideoPlayerModal Component
 * Plays a video block in reader mode. YouTube/Vimeo links are rendered through
 * their embed player; any other URL is treated as a direct video file.
 *
 * @param {Object} props
 * @param {string} props.url - Video URL
 * @param {string} [props.title] - Modal title
 */
const VideoPlayerModal = ({ url, title = "Video" }) => {
  const embedUrl = React.useMemo(() => getEmbedUrl(url), [url]);

  let player;
  if (!url) {
    player = <Alert severity="warning">No video URL is available.</Alert>;
  } else if (isEmbeddableVideoUrl(url)) {
    player = (
      <iframe
        className={styles.player}
        src={embedUrl}
        title={title}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  } else {
    player = (
      <video className={styles.player} src={url} controls autoPlay>
        Your browser does not support the video tag.
      </video>
    );
  }

  return (
    <>
      <BootstrapModal.Header closeButton>
        <BootstrapModal.Title>{title}</BootstrapModal.Title>
      </BootstrapModal.Header>
      <BootstrapModal.Body>
        <div className={styles.container}>{player}</div>
      </BootstrapModal.Body>
    </>
  );
};

export default VideoPlayerModal;
