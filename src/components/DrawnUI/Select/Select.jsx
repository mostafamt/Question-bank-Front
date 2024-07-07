import React from "react";
import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import { default as MUISelect } from "@mui/material/Select";
import ValidationMessage from "../../ValidationMessage/ValidationMessage";
import { Controller } from "react-hook-form";

const Select = (props) => {
  const { label, options, space, name, required, path, errors, control } =
    props;

  const trimmedLabel = label.replaceAll("_", "");

  let error = {};
  path.forEach((element, idx) => {
    error = idx === 0 ? errors?.[element] : error?.[element];
  });

  return (
    <Box sx={{ mb: space, minWidth: 120 }}>
      <InputLabel>{trimmedLabel}</InputLabel>
      <FormControl fullWidth>
        <Controller
          name={name}
          control={control}
          defaultValue=""
          rules={{ required }}
          render={({ field }) => (
            <MUISelect
              {...field}
              labelId="demo-simple-select-label"
              id="demo-simple-select"
            >
              {options.map((option, idx) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </MUISelect>
          )}
        />
      </FormControl>
      <ValidationMessage path={path} errors={errors} />
    </Box>
  );
};

export default Select;
