import { Box, TextField } from "@mui/material";
import React from "react";

const Text = (props) => {
  const { space, label, register, level, value } = props;

  const newLabel = label.replaceAll("_", "");

  return (
    <Box sx={{ mb: space }}>
      <TextField
        label={newLabel}
        variant="outlined"
        {...register(value)}
        fullWidth
      />
    </Box>
  );
};

export default Text;
