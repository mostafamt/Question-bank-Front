import React from "react";
import { Box, Button, TextField } from "@mui/material";
import VisuallyHiddenInput from "../VisuallyHiddenInput/VisuallyHiddenInput";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import PlayCircleFilledIcon from "@mui/icons-material/PlayCircleFilled";

import styles from "./video.module.scss";

const Video = ({ space }) => {
  return (
    <Box className={styles.image} sx={{ mb: space }}>
      <div className={styles["image-area"]}>
        <PlayCircleFilledIcon fontSize="large" />
      </div>
      <div className={styles.inputs}>
        <Button
          component="label"
          role={undefined}
          variant="contained"
          tabIndex={-1}
          startIcon={<CloudUploadIcon />}
          color="secondary"
        >
          Upload Video
          <VisuallyHiddenInput type="file" />
        </Button>

        <TextField label="Add Url" variant="outlined" fullWidth />
      </div>
    </Box>
  );
};

export default Video;
