import React from "react";
import { Box, TextField } from "@mui/material";

import styles from "./text.module.scss";
import ValidationMessage from "../../ValidationMessage/ValidationMessage";

const Text = (props) => {
  const { space, label, register, value, errors, type, path, required } = props;

  const newLabel = label.replaceAll("_", "");

  return (
    <Box sx={{ mb: space }} className={styles.text}>
      <TextField
        label={newLabel}
        variant="outlined"
        type={type}
        {...register(value, { required })}
        fullWidth
      />
      <ValidationMessage path={path} errors={errors} />
    </Box>
  );
};

export default Text;
