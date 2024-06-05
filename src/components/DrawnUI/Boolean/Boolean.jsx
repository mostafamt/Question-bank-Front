import React from "react";
import { Checkbox } from "@mui/material";

const label = { inputProps: { "aria-label": "Checkbox demo" } };

const Boolean = (props) => {
  const { register } = props;

  return (
    <div>
      <span>Correct: </span>
      {/* <Checkbox {...label} {...register} /> */}
      <input type="checkbox" {...register} />
    </div>
  );
};

export default Boolean;
