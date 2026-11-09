import React from "react";

import styles from "./areaActionResult.module.scss";
import { CircularProgress, TextField } from "@mui/material";
import { COMPLEX_TYPES } from "../../utils/ocr";
import { PlayCircle } from "@mui/icons-material";
import {
  getYouTubeThumbnailUrl,
  isEmbeddableVideoUrl,
} from "../../utils/video";
import { useStore } from "../../store/store";

const AreaActionResult = (props) => {
  const { onEditText, trialArea } = props;
  const { openModal } = useStore();

  if (trialArea.loading) {
    return (
      <div style={{ paddingTop: "0.5rem" }}>
        <CircularProgress size="1rem" />
      </div>
    );
  }

  const foundComplexType = COMPLEX_TYPES.find(
    (item) => item === trialArea?.typeOfLabel
  );

  const thumbnailUrl = getYouTubeThumbnailUrl(trialArea?.video);

  return (
    <div>
      {trialArea?.typeOfLabel === "video" ? (
        trialArea?.video ? (
          // YouTube/Vimeo links are web pages, not media files, so they need
          // the provider's embed player. YouTube won't start playback in a
          // player under ~200px, narrower than this column, so show a
          // thumbnail here and play it in the full-size video modal.
          isEmbeddableVideoUrl(trialArea.video) ? (
            <button
              type="button"
              className={styles["video-preview"]}
              style={
                thumbnailUrl
                  ? { backgroundImage: `url("${thumbnailUrl}")` }
                  : undefined
              }
              onClick={() =>
                openModal("video-player", { url: trialArea.video })
              }
              aria-label="Play video"
            >
              <PlayCircle className={styles["video-preview-icon"]} />
            </button>
          ) : (
            <video
              src={trialArea.video}
              controls
              style={{ width: "100%", marginTop: "0.5rem" }}
            />
          )
        ) : (
          <div className={styles.placeholder}>No video selected</div>
        )
      ) : trialArea?.typeOfLabel === "audio" ? (
        trialArea?.audio ? (
          <audio
            src={trialArea.audio}
            controls
            style={{ width: "100%", marginTop: "0.5rem" }}
          />
        ) : (
          <div className={styles.placeholder}>No audio selected</div>
        )
      ) : trialArea?.typeOfLabel === "text" ||
        trialArea?.typeOfLabel === "number" ||
        trialArea?.typeOfLabel === "Coordinate" ||
        foundComplexType ? (
        <TextField
          sx={{
            width: "100%",
            mt: 1,
          }}
          label=""
          variant="outlined"
          type="text"
          multiline
          value={trialArea?.text}
          onChange={(e) => onEditText(trialArea?.id, e.target.value)}
          disabled={false}
        />
      ) : trialArea?.image ? (
        <img
          src={trialArea?.image}
          alt="image1"
          style={{
            width: "100%",
            objectFit: "cover",
          }}
        />
      ) : (
        <></>
      )}
    </div>
  );
};

export default AreaActionResult;
