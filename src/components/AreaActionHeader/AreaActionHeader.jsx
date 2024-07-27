import React from "react";

import MuiSelect from "../MuiSelect/MuiSelect";
import { DeleteForever } from "@mui/icons-material";
import { IconButton } from "@mui/material";

import styles from "./areaActionHeader.module.scss";

const AreaActionHeader = (props) => {
  const {
    list,
    parameter,
    onChangeParameter,
    idx,
    onClickDeleteArea,
    trialArea,
  } = props;

  return (
    <div className={styles["area-action-header"]}>
      <div
        className={styles.color}
        style={{
          backgroundColor: trialArea.color || "green",
        }}
      ></div>
      <MuiSelect
        list={list}
        value={trialArea.parameter}
        onChange={(e) => onChangeParameter(e.target.value, idx)}
      />
      <IconButton aria-label="delete" onClick={() => onClickDeleteArea(idx)}>
        <DeleteForever color="error" />
      </IconButton>
    </div>
  );
};

export default AreaActionHeader;
