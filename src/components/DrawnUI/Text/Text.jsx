import React from "react";
import { Box, TextField } from "@mui/material";

import styles from "./text.module.scss";

const Text = (props) => {
  const { space, label, register, value, errors, type, path, required } = props;

  const newLabel = label.replaceAll("_", "");

  let error = {};
  path.forEach((element, idx) => {
    error = idx === 0 ? errors?.[element] : error?.[element];
  });

  return (
    <Box sx={{ mb: space }} className={styles.text}>
      <TextField
        label={newLabel}
        variant="outlined"
        type={type}
        {...register(value, required)}
        fullWidth
      />
      {error && <p>{error?.type}</p>}
    </Box>
  );
};

export default Text;
