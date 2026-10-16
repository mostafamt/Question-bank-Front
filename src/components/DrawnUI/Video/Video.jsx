import React from "react";
import { Box, Button, CircularProgress, TextField } from "@mui/material";
import VisuallyHiddenInput from "../../VisuallyHiddenInput/VisuallyHiddenInput";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import PlayCircleFilledIcon from "@mui/icons-material/PlayCircleFilled";
import { toast } from "react-toastify";
import { upload } from "../../../utils/upload";

import styles from "./video.module.scss";

const formatTimestamp = (seconds) => {
  const totalSeconds = Math.floor(seconds);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const remainingSeconds = totalSeconds % 60;

  return [hours, minutes, remainingSeconds]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
};

const Video = (props) => {
  const { setValue, name, space, getValues } = props;

  let value = getValues(name);

  const [url, setUrl] = React.useState(getValues(name) || "");
  const [loading, setLoading] = React.useState(false);

  const onChangeHandler = async (event) => {
    setLoading(true);
    const file = event.target.files[0];
    const link = await upload(file);
    setUrl(link);
    setValue(name, link);
    setLoading(false);
  };

  const onChangeInput = (event) => {
    setUrl(event.target.value);
    setValue(name, event.target.value);
  };

  const onPauseHandler = async (event) => {
    const timestamp = formatTimestamp(event.currentTarget.currentTime);

    try {
      await navigator.clipboard.writeText(timestamp);
      toast.success(`Copied time: ${timestamp}`);
    } catch (error) {
      toast.error("Could not copy timestamp to clipboard");
    }
  };

  return (
    <Box className={styles.image}>
      <div className={styles["image-area"]}>
        {value ? (
          <video
            className={styles["scale-video"]}
            controls
            onPause={onPauseHandler}
          >
            <source src={value} type="video/mp4" />
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
          color="secondary"
          onChange={onChangeHandler}
          disabled={loading}
          startIcon={
            loading ? <CircularProgress size="1rem" /> : <CloudUploadIcon />
          }
        >
          Upload Video
          <VisuallyHiddenInput type="file" accept="video/*" />
        </Button>

        <TextField
          label="Add Url"
          variant="outlined"
          value={value}
          defaultValue={value || ""}
          onChange={onChangeInput}
          fullWidth
        />
      </div>
    </Box>
  );
};

export default Video;
