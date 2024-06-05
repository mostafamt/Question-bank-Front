import React from "react";
import { Box, Button, TextField } from "@mui/material";
import VisuallyHiddenInput from "../../VisuallyHiddenInput/VisuallyHiddenInput";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import PhotoIcon from "@mui/icons-material/Photo";

import styles from "./image.module.scss";
import { upload } from "../../../utils/upload";

const Image = (props) => {
  const { space, register, setValue, param } = props;

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

        <TextField
          label="Add Url"
          variant="outlined"
          fullWidth
          value={url}
          onChange={onChangeInput}
        />
      </div>
    </Box>
  );
};

export default Image;
