import React from "react";
import { Box, Button, CircularProgress, TextField } from "@mui/material";
import VisuallyHiddenInput from "../../VisuallyHiddenInput/VisuallyHiddenInput";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import PlayCircleFilledIcon from "@mui/icons-material/PlayCircleFilled";
import { upload } from "../../../utils/upload";

import styles from "./video.module.scss";

const Video = (props) => {
  const { setValue, param, space, getValues } = props;

  let value = getValues(param);

  const [url, setUrl] = React.useState(getValues(param) || "");
  const [loading, setLoading] = React.useState(false);

  const onChangeHandler = async (event) => {
    setLoading(true);
    const file = event.target.files[0];
    const link = await upload(file);
    setUrl(link);
    setValue(param, link);
    setLoading(false);
  };

  const onChangeInput = (event) => {
    setUrl(event.target.value);
    setValue(param, event.target.value);
  };

  return (
    <Box className={styles.image} sx={{ mb: space }}>
      <div className={styles["image-area"]}>
        {value ? (
          <video className={styles["scale-video"]} controls>
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
