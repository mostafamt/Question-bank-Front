import React from "react";
import { Box, Button, CircularProgress, TextField } from "@mui/material";
import VisuallyHiddenInput from "../../VisuallyHiddenInput/VisuallyHiddenInput";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import PhotoIcon from "@mui/icons-material/Photo";

import styles from "./image.module.scss";
import { upload } from "../../../utils/upload";
import { Controller } from "react-hook-form";
import ValidationMessage from "../../ValidationMessage/ValidationMessage";

const Image = (props) => {
  const { space, setValue, name, getValues, control, errors, path } = props;

  let value = getValues(name);
  const [loading, setLoading] = React.useState(false);

  const onChangeHandler = async (event) => {
    setLoading(true);
    const file = event.target.files[0];
    const link =
      "https://fastly.picsum.photos/id/772/200/200.jpg?hmac=9euSj4JHTPr7uT5QWVmeNJ8JaqAXY8XmJnYfr_DfBJc";
    // const link = await upload(file);
    setValue(name, link);
    setLoading(false);
  };

  const onChangeInput = (event) => {
    console.log("value= ", event.target.value);
    setValue(name, event.target.value);
    console.log("newValue= ", getValues(name));
  };

  return (
    <Box sx={{ mb: space }}>
      <Controller
        name={name}
        control={control}
        rules={{ required: "File is required" }} // Set required rule
        render={({ field }) => (
          <div className={styles.image}>
            <div className={styles["image-area"]}>
              {field.value ? (
                <img
                  src={field.value}
                  alt={field.value}
                  className={styles["scale-image"]}
                />
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
                  loading ? (
                    <CircularProgress size="1rem" />
                  ) : (
                    <CloudUploadIcon />
                  )
                }
              >
                Upload Image
                <VisuallyHiddenInput type="file" />
              </Button>

              <TextField
                label="Add Url"
                variant="outlined"
                fullWidth
                value={field.value}
                onChange={onChangeInput}
              />
            </div>
          </div>
        )}
      />
      <ValidationMessage path={path} errors={errors} />
    </Box>
  );
};

export default Image;
