import React from "react";
import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import { useStore } from "../../store/store";
import TypeParameters from "../../constants/parameters.json";
import axios from "../../axios";

const MuiSelect = (props) => {
  const { value, onChange, color, list } = props;

  const [params, setParams] = React.useState([]);
  const { data: state } = useStore();

  React.useEffect(() => {
    getLabels();
  }, []);

  const getLabels = async () => {
    // const type = state.type;
    // const res = await axios.get(`objectLabels${type}`);
    // const params = res.data.map((param) => Object.keys(param)?.[0]);
    const params = state.labels?.map((item) => Object.keys(item)?.[0]);
    setParams(params);
  };

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
          {list.map((param) => (
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
