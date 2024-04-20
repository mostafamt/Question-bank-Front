import React from "react";
import { Box, Button, TextField } from "@mui/material";
import VisuallyHiddenInput from "../VisuallyHiddenInput/VisuallyHiddenInput";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import PhotoIcon from "@mui/icons-material/Photo";
import axios from "../../axios";

import styles from "./image.module.scss";
import { upload } from "../../utils/upload";

const Image = ({ space }) => {
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
          <img src={url} alt={url} className={styles["scale-image"]} />
        ) : (
          <PhotoIcon fontSize="large" />
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
          Upload Image
          <VisuallyHiddenInput type="file" />
        </Button>

        <TextField label="Add Url" variant="outlined" fullWidth />
      </div>
    </Box>
  );
};

export default Image;
