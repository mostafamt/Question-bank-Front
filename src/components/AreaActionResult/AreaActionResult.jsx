import React from "react";

import styles from "./areaActionResult.module.scss";
import { TextField } from "@mui/material";

const AreaActionResult = (props) => {
  const { type, result, onEditText } = props;

  return (
    <div>
      {type === "text" ? (
        result ? (
          <TextField
            sx={{
              width: "100%",
              mt: 1,
            }}
            label=""
            variant="outlined"
            type="text"
            multiline
            value={result?.text}
            onChange={(e) => onEditText(result?.id, e.target.value)}
          />
        ) : (
          <></>
        )
      ) : result?.image ? (
        <img
          src={result?.image}
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
