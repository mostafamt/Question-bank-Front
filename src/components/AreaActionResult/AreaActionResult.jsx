import React from "react";

import styles from "./areaActionResult.module.scss";
import { CircularProgress, TextField } from "@mui/material";
import { COMPLEX_TYPES } from "../../utils/ocr";

const AreaActionResult = (props) => {
  const { type, onEditText, trialArea } = props;

  if (trialArea.loading) {
    return (
      <div style={{ paddingTop: "0.5rem" }}>
        <CircularProgress size="1rem" />
      </div>
    );
  }

  const foundComplexType = COMPLEX_TYPES.find(
    (item) => item === trialArea?.typeOfLabel
  );

  return (
    <div>
      {trialArea?.typeOfLabel === "text" ||
      trialArea?.typeOfLabel === "Coordinate" ||
      foundComplexType ? (
        <TextField
          sx={{
            width: "100%",
            mt: 1,
          }}
          label=""
          variant="outlined"
          type="text"
          multiline
          value={trialArea?.text}
          onChange={(e) => onEditText(trialArea?.id, e.target.value)}
          disabled={Boolean(foundComplexType)}
        />
      ) : trialArea?.image ? (
        <img
          src={trialArea?.image}
          alt="image1"
          style={{
            width: "100%",
            objectFit: "cover",
          }}
        />
      ) : (
        <></>
      )}
    </div>
  );
};

export default AreaActionResult;
