import React from "react";
import { Box, TextField } from "@mui/material";

import styles from "./text.module.scss";
import ValidationMessage from "../../ValidationMessage/ValidationMessage";
import { Controller } from "react-hook-form";

const Text = (props) => {
  const { space, label, name, errors, type, path, required, control } = props;

  const newLabel = label?.replaceAll("_", "");

  return (
    <Box sx={{ mb: space }} className={styles.text}>
      <Controller
        name={name}
        control={control}
        rules={{ required }}
        defaultValue="" // Set default value if needed
        render={({ field }) => (
          <TextField {...field} label={newLabel} type={type} fullWidth />
        )}
      />
      <ValidationMessage path={path} errors={errors} />
    </Box>
  );
};

export default Text;
