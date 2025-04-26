import React from "react";
import { Box, Button, CircularProgress, TextField } from "@mui/material";
import VisuallyHiddenInput from "../../VisuallyHiddenInput/VisuallyHiddenInput";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import { AudioRecorder, useAudioRecorder } from "react-audio-voice-recorder";

import { upload, uploadBase64 } from "../../../utils/upload";

import styles from "./sound.module.scss";

const Sound = (props) => {
  const { setValue, name, space, getValues } = props;

  const recorderControls = useAudioRecorder(
    {
      noiseSuppression: true,
      echoCancellation: true,
    },
    (err) => console.table(err) // onNotAllowedOrFound
  );

  let value = getValues(name);

  const [loading, setLoading] = React.useState(false);

  const onChangeHandler = async (event) => {
    setLoading(true);
    const file = event.target.files[0];
    const link = await upload(file);
    setValue(name, link);
    setLoading(false);
  };

  const onRecordFinish = async (blob) => {
    setLoading(true);
    const link = await uploadBase64(blob);
    setValue(name, link);
    setLoading(false);
  };

  const onChangeInput = (event) => {
    setValue(name, event.target.value);
  };

  return (
    <Box className={styles.image}>
      <div
        className={styles["image-area"]}
        style={{ width: value ? "30%" : "200px" }}
      >
        {value ? (
          <audio controls>
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
          <VisuallyHiddenInput type="file" accept="audio/*" />
        </Button>

        <TextField
          label="Add Url"
          variant="outlined"
          fullWidth
          value={value}
          onChange={onChangeInput}
        />
      </div>
    </Box>
  );
};

export default Sound;
