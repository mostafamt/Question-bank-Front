import React from "react";
import { Box, Button, CircularProgress, TextField } from "@mui/material";
import VisuallyHiddenInput from "../../VisuallyHiddenInput/VisuallyHiddenInput";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import PhotoIcon from "@mui/icons-material/Photo";

import styles from "./image.module.scss";
import { upload } from "../../../utils/upload";

const Image = (props) => {
  const { space, register, setValue, param, getValues } = props;

  let value = getValues(param);
  const [loading, setLoading] = React.useState(false);

  const onChangeHandler = async (event) => {
    setLoading(true);
    const file = event.target.files[0];
    const link = await upload(file);
    setValue(param, link);
    setLoading(false);
  };

  const onChangeInput = (event) => {
    setValue(param, event.target.value);
  };

  return (
    <Box className={styles.image} sx={{ mb: space }}>
      <div className={styles["image-area"]}>
        {value ? (
          <img src={value} alt={value} className={styles["scale-image"]} />
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
          color="secondary"
          onChange={onChangeHandler}
          disabled={loading}
          startIcon={
            loading ? <CircularProgress size="1rem" /> : <CloudUploadIcon />
          }
        >
          Upload Image
          <VisuallyHiddenInput type="file" />
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

export default Image;
