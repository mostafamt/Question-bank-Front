import React from "react";
import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import { default as MUISelect } from "@mui/material/Select";

const Select = (props) => {
  const { label, options, space, register, value } = props;

  const trimmedLabel = label.replaceAll("_", "");

  console.log("value= ", value);

  return (
    <Box sx={{ mb: space, minWidth: 120 }}>
      <FormControl fullWidth>
        <InputLabel id="graph-mode-label">{trimmedLabel}</InputLabel>
        <MUISelect
          labelId="graph-mode-label"
          id="graph-mode-select"
          label={trimmedLabel}
          {...register(value)}
        >
          {options.map((option, idx) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </MUISelect>
      </FormControl>
    </Box>
  );
};

export default Select;
