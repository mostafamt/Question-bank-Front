import React from "react";

import styles from "./questionNameHeader.module.scss";
import {
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";

const QuestionNameHeader = (props) => {
  const {
    name,
    setName,
    type,
    instructionalRole,
    setInstructionalRole,
    instructionalRoles,
  } = props;

  return (
    <div className={styles.header}>
      <Grid container spacing={4}>
        <Grid item xs={4}>
          <TextField
            label="Name"
            variant="outlined"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Grid>
        <Grid item xs={4}>
          <FormControl fullWidth>
            <InputLabel>Instructional Role</InputLabel>
            <Select
              label="Instructional Role"
              value={instructionalRole}
              onChange={(e) => setInstructionalRole(e.target.value)}
            >
              {instructionalRoles.map((item) => (
                <MenuItem key={item} value={item}>
                  {item}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={4}>
          <FormControl fullWidth>
            <InputLabel>Type</InputLabel>
            <Select value={1} label="Type" onChange={() => {}} disabled>
              <MenuItem value={1}>{type}</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </div>
  );
};

export default QuestionNameHeader;
