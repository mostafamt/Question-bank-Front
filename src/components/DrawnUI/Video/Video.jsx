import React from "react";
import { Box, Button, TextField } from "@mui/material";
import VisuallyHiddenInput from "../../VisuallyHiddenInput/VisuallyHiddenInput";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import PlayCircleFilledIcon from "@mui/icons-material/PlayCircleFilled";
import { upload } from "../../../utils/upload";

import styles from "./video.module.scss";

const Video = (props) => {
  const { setValue, param, space } = props;

  const [url, setUrl] = React.useState("");

  const onChangeHandler = async (event) => {
    const file = event.target.files[0];
    const link = await upload(file);
    setUrl(link);
    setValue(param, link);
  };

  const onChangeInput = (event) => {
    setUrl(event.target.value);
    setValue(param, event.target.value);
  };

  return (
    <Box className={styles.image} sx={{ mb: space }}>
      <div className={styles["image-area"]}>
        {url ? (
          <video className={styles["scale-video"]} controls>
            <source src={url} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        ) : (
          <PlayCircleFilledIcon fontSize="large" />
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
          Upload Video
          <VisuallyHiddenInput type="file" />
        </Button>

        <TextField
          label="Add Url"
          variant="outlined"
          value={url}
          onChange={onChangeInput}
          fullWidth
        />
      </div>
    </Box>
  );
};

export default Video;
