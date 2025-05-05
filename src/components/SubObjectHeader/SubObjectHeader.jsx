import React from "react";

import {
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";

import styles from "./subObjectHeader.module.scss";
import { useStore } from "../../store/store";

const SubObjectHeader = (props) => {
  const { name, setName, type, setType } = props;

  const { data: state } = useStore();

  const labels = state?.types.find(
    (item) => item.typeName === "Explanation object"
  )?.labels;

  console.log("labels= ", labels);

  const onChangeItem = (e) => {
    setType(e.target.value);
  };

  return (
    <div className={styles.header}>
      <Grid container spacing={6}>
        <Grid item xs={6}>
          <TextField
            label="Name"
            variant="outlined"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Grid>
        <Grid item xs={6}>
          <FormControl fullWidth>
            <InputLabel>Type</InputLabel>
            <Select label="Type" value={type} onChange={onChangeItem}>
              {labels.map((item) => (
                <MenuItem value={Object.values(item)?.[0]}>
                  {Object.keys(item)?.[0]}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </div>
  );
};

export default SubObjectHeader;
