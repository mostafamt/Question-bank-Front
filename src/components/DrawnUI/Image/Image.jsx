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
  const {
    space,
    register,
    setValue,
    param,
    getValues,
    control,
    errors,
    value: name,
    path,
  } = props;

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
    <Box sx={{ mb: space }}>
      <div className={styles.image}>
        <div className={styles["image-area"]}>
          {value ? (
            <img src={value} alt={value} className={styles["scale-image"]} />
          ) : (
            <PhotoIcon fontSize="large" />
          )}
        </div>
        <div className={styles.inputs}>
          <Controller
            name={name}
            control={control}
            rules={{ required: "File is required" }} // Set required rule
            render={({ field }) => (
              <div>
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
                  value={value}
                  onChange={onChangeInput}
                />
              </div>
            )}
          />
        </div>
      </div>
      <ValidationMessage path={path} errors={errors} />
    </Box>
  );
};

export default Image;
