import React from "react";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import styles from "./uploadMethod.module.scss";

const UploadMethods = (props) => {
  const { uploadMethod, changeUploadMethod } = props;

  return (
    <div className={styles["upload-method"]}>
      <FormControl>
        <RadioGroup
          aria-labelledby="demo-controlled-radio-buttons-group"
          name="controlled-radio-buttons-group"
          value={uploadMethod}
          onChange={(e) => changeUploadMethod(e.target.value)}
          row
        >
          <FormControlLabel
            value="manual"
            control={<Radio />}
            label="Manual Upload"
          />
          <FormControlLabel
            value="bulk"
            control={<Radio />}
            label="Bulk Upload"
          />
        </RadioGroup>
      </FormControl>
    </div>
  );
};

export default UploadMethods;
