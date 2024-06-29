import React from "react";
import { Checkbox } from "@mui/material";

const label = { inputProps: { "aria-label": "Checkbox demo" } };

const Boolean = (props) => {
  const { register } = props;

  return (
    <div style={{ marginBottom: "1rem" }}>
      <span>Correct: </span>
      <input type="checkbox" {...register} />
    </div>
  );
};

export default Boolean;
