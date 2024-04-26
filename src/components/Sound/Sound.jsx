import React from "react";
import { Box, Button, TextField } from "@mui/material";
import VisuallyHiddenInput from "../VisuallyHiddenInput/VisuallyHiddenInput";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import MusicNoteIcon from "@mui/icons-material/MusicNote";

import styles from "./sound.module.scss";
import { upload } from "../../utils/upload";

const Sound = ({ space }) => {
  const [url, setUrl] = React.useState("");

  const onChangeHandler = async (event) => {
    const file = event.target.files[0];
    const link = await upload(file);
    setUrl(link);
  };

  return (
    <Box className={styles.image} sx={{ mb: space }}>
      <div className={styles["image-area"]}>
        {url ? (
          <audio controls>
            <source src={url} type="audio/mp3" />
            Your browser does not support the audio element.
          </audio>
        ) : (
          <MusicNoteIcon fontSize="large" />
        )}
      </div>
      <div className={styles.inputs}>
        <Button
          component="label"
          role={undefined}
          variant="contained"
          tabIndex={-1}
          startIcon={<CloudUploadIcon />}
          color="secondary"
          onChange={onChangeHandler}
        >
          Upload Sound
          <VisuallyHiddenInput type="file" />
        </Button>

        <TextField label="Add Url" variant="outlined" fullWidth />
      </div>
    </Box>
  );
};

export default Sound;
