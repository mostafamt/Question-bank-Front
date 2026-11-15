import React from "react";
import { Box, Button, CircularProgress, TextField } from "@mui/material";
import { useWatch } from "react-hook-form";
import { toast } from "react-toastify";
import VisuallyHiddenInput from "../../VisuallyHiddenInput/VisuallyHiddenInput";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import { AudioRecorder, useAudioRecorder } from "react-audio-voice-recorder";

import { upload, uploadBase64 } from "../../../utils/upload";
import { acceptFor, validateFile } from "../../../utils/fileTypes";
import ValidationMessage from "../../ValidationMessage/ValidationMessage";

import styles from "./sound.module.scss";

const Sound = (props) => {
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

  const recorderControls = useAudioRecorder(
    {
      noiseSuppression: true,
      echoCancellation: true,
    },
    (err) => console.table(err) // onNotAllowedOrFound
  );

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

    const error = validateFile(file, "audio");
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

  // Recordings are made by the app itself, so they skip the file-type check
  const onRecordFinish = async (blob) => {
    clearErrors?.(name);
    setLoading(true);
    try {
      const link = await trackUpload(uploadBase64(blob));
      if (link) update(link);
    } catch (error) {
      toast.error(error?.message);
    }
    setLoading(false);
  };

  const onChangeInput = (event) => {
    setUrl(event.target.value);
  };

  const onBlurInput = () => {
    if (url !== value) update(url);
  };

  return (
    <Box>
      <Box className={styles.image}>
        <div
          className={styles["image-area"]}
          style={{ width: value ? "30%" : "200px" }}
        >
          {loading ? (
            <CircularProgress size="2rem" />
          ) : value ? (
            // key: a <source> change alone doesn't reload the player
            <audio key={value} controls>
              <source src={value} type="audio/mp3" />
              Your browser does not support the audio element.
            </audio>
          ) : (
            <MusicNoteIcon fontSize="large" />
          )}
        </div>
        <div className={styles.inputs}>
          <AudioRecorder
            onRecordingComplete={(blob) => onRecordFinish(blob)}
            recorderControls={recorderControls}
            // downloadOnSavePress={true}
            // downloadFileExtension="mp3"
            showVisualizer={true}
          />

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
            Upload Sound
            <VisuallyHiddenInput type="file" accept={acceptFor("audio")} />
          </Button>

          <TextField
            label="Add Url"
            variant="outlined"
            fullWidth
            value={url}
            onChange={onChangeInput}
            onBlur={onBlurInput}
            disabled={loading}
          />
        </div>
      </Box>
      <ValidationMessage path={path} errors={errors} />
    </Box>
  );
};

export default Sound;
