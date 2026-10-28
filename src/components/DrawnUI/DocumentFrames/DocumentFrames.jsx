import React from "react";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import { IconButton, Tooltip } from "@mui/material";
import styles from "./documentFrames.module.scss";

const DocumentFrames = ({ frameUrls }) => {
  if (!frameUrls?.length) return null;

  const openFullscreen = (event) => {
    event.currentTarget.parentElement?.requestFullscreen?.();
  };

  return (
    <section className={styles.viewer} aria-label="Document pages">
      <div className={styles.thumbnails}>
        {frameUrls.map((frameUrl, index) => (
          <div
            className={styles.thumbnail}
            key={`${frameUrl}-${index}`}
          >
            <img src={frameUrl} alt={`Page ${index + 1} thumbnail`} />
            <span>{index + 1}</span>
            <Tooltip title={`Fullscreen page ${index + 1}`}>
              <IconButton
                className={styles.thumbnailFullscreen}
                onClick={openFullscreen}
                aria-label={`View page ${index + 1} fullscreen`}
                size="small"
              >
                <FullscreenIcon fontSize="inherit" />
              </IconButton>
            </Tooltip>
          </div>
        ))}
      </div>
    </section>
  );
};

export default DocumentFrames;
