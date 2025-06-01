import React from "react";
import Box from "@mui/material/Box";
// import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";

const MuiSelect = (props) => {
  const { value, onChange, list } = props;

  return (
    <Box>
      <FormControl variant="standard" fullWidth>
        {/* <InputLabel id="demo-simple-select-label">Label</InputLabel> */}
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={value}
          onChange={(e) => onChange(e)}
          label="Label"
        >
          {list?.map((param) => (
            <MenuItem key={param} value={param}>
              {param}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default MuiSelect;
