import React from "react";
import { Box, Button, CircularProgress, TextField } from "@mui/material";
import { useWatch } from "react-hook-form";
import { toast } from "react-toastify";
import VisuallyHiddenInput from "../../VisuallyHiddenInput/VisuallyHiddenInput";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import PlayCircleFilledIcon from "@mui/icons-material/PlayCircleFilled";
import { upload } from "../../../utils/upload";
import { acceptFor, validateFile } from "../../../utils/fileTypes";
import ValidationMessage from "../../ValidationMessage/ValidationMessage";

import styles from "./video.module.scss";

const Video = (props) => {
  const {
    setValue,
    name,
    control,
    errors,
    path,
    setError,
    clearErrors,
    trackUpload = (promise) => promise,
  } = props;

  // In edit mode the saved value arrives after this component mounts
  const value = useWatch({ control, name }) || "";
  const [url, setUrl] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    setUrl(value);
  }, [value]);

  const update = (next) => {
    setValue(name, next, { shouldValidate: true });
    setUrl(next);
  };

  const onChangeHandler = async (event) => {
    const file = event.target.files[0];
    // Reset so picking the same file again still fires onChange
    event.target.value = "";
    if (!file) return;

    const error = validateFile(file, "video");
    if (error) {
      setError?.(name, { type: "file-type", message: error });
      toast.error(error);
      return;
    }
    clearErrors?.(name);

    setLoading(true);
    const link = await trackUpload(upload(file));
    if (link) update(link);
    setLoading(false);
  };

  const onChangeInput = (event) => {
    setUrl(event.target.value);
  };

  // Commit on blur so the player doesn't reload on every keystroke
  const onBlurInput = () => {
    if (url !== value) update(url);
  };

  return (
    <Box>
      <Box className={styles.image}>
        <div className={styles["image-area"]}>
          {loading ? (
            <CircularProgress size="2rem" />
          ) : value ? (
            // key: a <source> change alone doesn't reload the player
            <video key={value} className={styles["scale-video"]} controls>
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
            <VisuallyHiddenInput type="file" accept={acceptFor("video")} />
          </Button>

          <TextField
            label="Add Url"
            variant="outlined"
            value={url}
            onChange={onChangeInput}
            onBlur={onBlurInput}
            disabled={loading}
            fullWidth
          />
        </div>
      </Box>
      <ValidationMessage path={path} errors={errors} />
    </Box>
  );
};

export default Video;
