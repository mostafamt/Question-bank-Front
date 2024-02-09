import React from "react";
import MuiSelect from "../MuiSelect/MuiSelect";
import { IconButton, TextField } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import DeleteForever from "@mui/icons-material/DeleteForever";

import styles from "./areaActions.module.scss";

const AreaActions = (props) => {
  const {
    parameter,
    idx,
    color,
    onChangeParameter,
    loading,
    extractedTextList,
    onEditText,
    onClickDeleteArea,
  } = props;

  return (
    <>
      <div className={styles.row}>
        <div
          className={styles.color}
          style={{ backgroundColor: color ? color : "green" }}
        ></div>
        <MuiSelect
          value={parameter}
          color={color}
          onChange={(e) => onChangeParameter(e.target.value, idx)}
        />
        <IconButton aria-label="delete" onClick={onClickDeleteArea}>
          <DeleteForever color="error" />
        </IconButton>
      </div>

      <div>
        {loading ? (
          <p>loading text....</p>
        ) : extractedTextList?.[idx] ? (
          <TextField
            sx={{
              width: "100%",
              mt: 1,
            }}
            label=""
            variant="outlined"
            type="text"
            multiline
            value={extractedTextList?.[idx]?.text}
            onChange={(e) =>
              onEditText(extractedTextList[idx]?.id, e.target.value)
            }
          />
        ) : (
          <></>
        )}
      </div>
    </>
  );
};

export default AreaActions;
