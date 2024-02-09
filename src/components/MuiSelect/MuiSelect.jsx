import React from "react";
import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import { useStore } from "../../store/store";
import TypeParameters from "../../constants/parameters.json";

const MuiSelect = (props) => {
  const { value, onChange, color } = props;

  const [params, setParams] = React.useState([]);
  const { data: state } = useStore();

  React.useEffect(() => {
    setParams(TypeParameters[state.type]);
  }, []);

  return (
    <Box sx={{ minWidth: 120 }}>
      <FormControl variant="standard" fullWidth>
        {/* <InputLabel id="demo-simple-select-label">Label</InputLabel> */}
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={value}
          onChange={(e) => onChange(e)}
          label="Label"
          // sx={{
          //   border: `2px solid ${color}`,
          // }}
        >
          {params.map((param) => (
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
